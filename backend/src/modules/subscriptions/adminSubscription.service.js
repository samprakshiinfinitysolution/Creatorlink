import mongoose from "mongoose";
import SubscriptionPlan from "./plan.model.js";
import Subscription from "./subscription.model.js";
import SubscriptionPayment from "./subscriptionPayment.model.js";
import ContactUnlock from "./contactUnlock.model.js";
import Auth from "../auth/auth.model.js";
import BrandProfile from "../brand/profile/profile.model.js";
import Campaign from "../brand/campaigns/campaign.model.js";
import AuditLog from "../admin/audit/audit.model.js";
import { createNotificationService } from "../notifications/notification.service.js";
import createApiError from "../../utils/ApiError.js";
import { getPagination, getPaginationData } from "../../utils/pagination.js";

/**
 * Aggregates complete subscription analytics for the Admin Subscription Dashboard.
 * 
 * Rules:
 * - Revenue strictly excludes free trials and complimentary subscriptions.
 * - Revenue is grouped by currency (currencies are never combined).
 */
export const getAdminSubscriptionAnalyticsService = async () => {
    const now = new Date();

    // 1. Subscriber Counts by Status
    const [
        totalSubscribers,
        activeTrials,
        activePaid,
        expiredCount,
        pastDueCount,
        complimentaryCount
    ] = await Promise.all([
        Subscription.countDocuments(),
        Subscription.countDocuments({
            status: "trialing",
            trialEndDate: { $gt: now }
        }),
        Subscription.countDocuments({
            status: "active",
            isComplimentary: false,
            currentPeriodEnd: { $gt: now }
        }),
        Subscription.countDocuments({
            $or: [
                { status: "expired" },
                { billingCycle: "trial", trialEndDate: { $lte: now } },
                { billingCycle: { $ne: "trial" }, status: { $ne: "trialing" }, currentPeriodEnd: { $lte: now } }
            ]
        }),
        Subscription.countDocuments({ status: "past_due" }),
        Subscription.countDocuments({ isComplimentary: true, status: "active" })
    ]);

    // 2. Revenue Aggregation (Grouped by Currency from captured payments)
    const revenueByCurrency = await SubscriptionPayment.aggregate([
        {
            $match: {
                status: "captured"
            }
        },
        {
            $group: {
                _id: "$currency",
                totalRevenue: { $sum: "$amount" },
                transactionCount: { $sum: 1 }
            }
        }
    ]);

    // 3. Plan & Billing Cycle Distribution
    const planDistribution = await Subscription.aggregate([
        {
            $group: {
                _id: {
                    billingCycle: "$billingCycle",
                    planSlug: "$planSnapshot.slug",
                    status: "$status"
                },
                count: { $sum: 1 }
            }
        }
    ]);

    return {
        telemetry: {
            totalSubscribers,
            activeTrials,
            activePaid,
            expiredCount,
            pastDueCount,
            complimentaryCount
        },
        revenue: revenueByCurrency.map((r) => ({
            currency: r._id,
            totalRevenue: r.totalRevenue,
            transactionCount: r.transactionCount
        })),
        distribution: planDistribution.map((d) => ({
            billingCycle: d._id.billingCycle,
            planSlug: d._id.planSlug || "custom",
            status: d._id.status,
            count: d.count
        }))
    };
};

/**
 * Creates a new SubscriptionPlan.
 */
export const createSubscriptionPlanAdminService = async (adminId, planData) => {
    const {
        name,
        slug,
        description,
        priceMonthly,
        priceYearly,
        currency = "INR",
        monthlyContactQuota,
        features = [],
        trialAllowed = true
    } = planData;

    if (!name || !slug || priceMonthly === undefined || priceYearly === undefined || !monthlyContactQuota) {
        throw createApiError(400, "Missing required plan fields (name, slug, priceMonthly, priceYearly, monthlyContactQuota)");
    }

    const existing = await SubscriptionPlan.findOne({ slug: slug.trim().toLowerCase() });
    if (existing) {
        throw createApiError(409, `A plan with slug "${slug}" already exists`);
    }

    const plan = await SubscriptionPlan.create({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        version: 1,
        description: description ? description.trim() : "",
        priceMonthly: Number(priceMonthly),
        priceYearly: Number(priceYearly),
        currency: currency.trim().toUpperCase(),
        monthlyContactQuota: Number(monthlyContactQuota),
        features: Array.isArray(features) ? features : [],
        trialAllowed: Boolean(trialAllowed),
        isActive: true
    });

    await AuditLog.create({
        admin: adminId,
        action: "SUBSCRIPTION_PLAN_CREATE",
        targetType: "subscription",
        targetId: plan._id,
        reason: "Initial plan creation by admin",
        newState: plan.toObject()
    });

    return plan;
};

/**
 * Updates an existing SubscriptionPlan and increments version.
 * Existing active subscriptions preserve their original planSnapshot.
 */
export const updateSubscriptionPlanAdminService = async (adminId, planId, updateData, reason = "Plan details updated by admin") => {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
        throw createApiError(404, "Subscription plan not found");
    }

    const previousState = plan.toObject();

    // Check if price or quota changed; if so, bump version
    const priceChanged =
        (updateData.priceMonthly !== undefined && updateData.priceMonthly !== plan.priceMonthly) ||
        (updateData.priceYearly !== undefined && updateData.priceYearly !== plan.priceYearly);
    const quotaChanged =
        updateData.monthlyContactQuota !== undefined && updateData.monthlyContactQuota !== plan.monthlyContactQuota;

    if (priceChanged || quotaChanged) {
        plan.version = (plan.version || 1) + 1;
    }

    if (updateData.name) plan.name = updateData.name.trim();
    if (updateData.description !== undefined) plan.description = updateData.description.trim();
    if (updateData.priceMonthly !== undefined) plan.priceMonthly = Number(updateData.priceMonthly);
    if (updateData.priceYearly !== undefined) plan.priceYearly = Number(updateData.priceYearly);
    if (updateData.monthlyContactQuota !== undefined) plan.monthlyContactQuota = Number(updateData.monthlyContactQuota);
    if (updateData.features !== undefined) plan.features = updateData.features;
    if (updateData.trialAllowed !== undefined) plan.trialAllowed = Boolean(updateData.trialAllowed);
    if (updateData.isActive !== undefined) plan.isActive = Boolean(updateData.isActive);

    await plan.save();

    await AuditLog.create({
        admin: adminId,
        action: "SUBSCRIPTION_PLAN_UPDATE",
        targetType: "subscription",
        targetId: plan._id,
        reason: reason.trim(),
        previousState,
        newState: plan.toObject()
    });

    return plan;
};

/**
 * Toggles a plan's active status (deactivates without deleting).
 */
export const togglePlanStatusAdminService = async (adminId, planId, isActive, reason = "Plan active status toggled") => {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
        throw createApiError(404, "Subscription plan not found");
    }

    const previousState = { isActive: plan.isActive };
    plan.isActive = Boolean(isActive);
    await plan.save();

    await AuditLog.create({
        admin: adminId,
        action: plan.isActive ? "SUBSCRIPTION_PLAN_ACTIVATE" : "SUBSCRIPTION_PLAN_DEACTIVATE",
        targetType: "subscription",
        targetId: plan._id,
        reason: reason.trim(),
        previousState,
        newState: { isActive: plan.isActive }
    });

    return plan;
};

/**
 * Returns all plans for Admin view (active and inactive).
 */
export const getAllPlansAdminService = async () => {
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 });

    // Aggregate subscriber counts for each plan
    const planCounts = await Subscription.aggregate([
        {
            $group: {
                _id: "$plan",
                activeCount: {
                    $sum: {
                        $cond: [{ $in: ["$status", ["active", "trialing"]] }, 1, 0]
                    }
                },
                totalCount: { $sum: 1 }
            }
        }
    ]);

    const countMap = new Map();
    planCounts.forEach((c) => {
        if (c._id) countMap.set(c._id.toString(), c);
    });

    return plans.map((p) => {
        const counts = countMap.get(p._id.toString()) || { activeCount: 0, totalCount: 0 };
        return {
            ...p.toObject(),
            activeSubscribersCount: counts.activeCount,
            totalSubscribersCount: counts.totalCount
        };
    });
};

/**
 * Returns paginated, searchable list of all Brand subscribers.
 */
export const getAllSubscribersAdminService = async (queryParams = {}) => {
    const {
        page = 1,
        limit = 10,
        status = "all",
        billingCycle = "all",
        search = "",
        sortBy = "newest"
    } = queryParams;

    const { page: currentPage, limit: itemsPerPage, skip } = getPagination(page, limit);

    const matchQuery = {};

    if (status && status !== "all") {
        matchQuery.status = status;
    }
    if (billingCycle && billingCycle !== "all") {
        matchQuery.billingCycle = billingCycle;
    }

    // Text search on Brand name or email via lookup
    const pipeline = [
        { $match: matchQuery },
        {
            $lookup: {
                from: Auth.collection.name,
                localField: "brand",
                foreignField: "_id",
                as: "brandUser"
            }
        },
        { $unwind: "$brandUser" },
        {
            $lookup: {
                from: BrandProfile.collection.name,
                localField: "brand",
                foreignField: "user",
                as: "brandProfile"
            }
        },
        {
            $addFields: {
                brandProfile: { $arrayElemAt: ["$brandProfile", 0] }
            }
        }
    ];

    if (search && search.trim()) {
        const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        pipeline.push({
            $match: {
                $or: [
                    { "brandUser.name": { $regex: safeSearch, $options: "i" } },
                    { "brandUser.email": { $regex: safeSearch, $options: "i" } },
                    { "brandProfile.companyName": { $regex: safeSearch, $options: "i" } }
                ]
            }
        });
    }

    // Sort
    const sortStage = {};
    if (sortBy === "oldest") {
        sortStage.createdAt = 1;
    } else {
        sortStage.createdAt = -1;
    }
    pipeline.push({ $sort: sortStage });

    // Faceted pagination
    pipeline.push({
        $facet: {
            data: [{ $skip: skip }, { $limit: itemsPerPage }],
            totalCount: [{ $count: "count" }]
        }
    });

    const [aggregateResult] = await Subscription.aggregate(pipeline);
    const subscribers = aggregateResult?.data || [];
    const totalItems = aggregateResult?.totalCount?.[0]?.count || 0;

    return {
        subscribers: subscribers.map((sub) => ({
            _id: sub._id,
            status: sub.status,
            billingCycle: sub.billingCycle,
            isComplimentary: sub.isComplimentary,
            trialStartDate: sub.trialStartDate,
            trialEndDate: sub.trialEndDate,
            currentPeriodStart: sub.currentPeriodStart,
            currentPeriodEnd: sub.currentPeriodEnd,
            quotaState: sub.quotaState,
            planSnapshot: sub.planSnapshot,
            trialEligibility: sub.trialEligibility,
            createdAt: sub.createdAt,
            brand: {
                _id: sub.brandUser._id,
                name: sub.brandUser.name,
                email: sub.brandUser.email,
                avatar: sub.brandUser?.avatar || sub.brandProfile?.logo || "",
                logo: sub.brandProfile?.logo || sub.brandUser?.avatar || "",
                companyName: sub.brandProfile?.companyName || "",
                website: sub.brandProfile?.website || ""
            }
        })),
        pagination: getPaginationData(currentPage, itemsPerPage, totalItems)
    };
};

/**
 * Returns full subscriber dossier for a specific subscription.
 */
export const getSubscriberDetailAdminService = async (subscriptionId) => {
    const subscription = await Subscription.findById(subscriptionId).populate("plan");
    if (!subscription) {
        throw createApiError(404, "Subscription not found");
    }

    const brandUser = await Auth.findById(subscription.brand).select("name email role avatar isVerified createdAt");
    const brandProfile = await BrandProfile.findOne({ user: subscription.brand });

    // Recent payments
    const payments = await SubscriptionPayment.find({ brand: subscription.brand })
        .populate("plan")
        .sort({ createdAt: -1 })
        .limit(10);

    // Recent contact unlocks
    const unlocks = await ContactUnlock.find({ brand: subscription.brand })
        .populate("creator", "name email")
        .sort({ unlockedAt: -1 })
        .limit(15);

    // Audit logs relating to this subscription
    const auditLogs = await AuditLog.find({
        targetType: "subscription",
        targetId: subscription._id
    })
        .populate("admin", "name email")
        .sort({ createdAt: -1 });

    return {
        subscription,
        brand: {
            user: brandUser,
            profile: brandProfile
        },
        payments,
        unlocks,
        auditLogs
    };
};

/**
 * Grants a complimentary subscription to a Brand.
 * Strictly requires admin ID and audit reason.
 */
export const grantComplimentarySubscriptionService = async (adminId, { brandId, planId, durationDays = 30, reason }) => {
    if (!reason || !reason.trim()) {
        throw createApiError(400, "A valid reason is required for administrative complimentary grants");
    }

    const brandUser = await Auth.findById(brandId);
    if (!brandUser || brandUser.role !== "brand") {
        throw createApiError(404, "Brand user not found");
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
        throw createApiError(404, "Subscription plan not found");
    }

    let subscription = await Subscription.findOne({ brand: brandId });
    const previousState = subscription ? subscription.toObject() : null;

    const now = new Date();
    const periodEnd = new Date(now.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000);
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    const planSnapshot = {
        name: plan.name,
        slug: plan.slug,
        version: plan.version || 1,
        price: 0,
        currency: plan.currency || "INR",
        billingCycle: "monthly",
        monthlyContactQuota: plan.monthlyContactQuota,
        features: plan.features || []
    };

    if (subscription) {
        subscription.plan = plan._id;
        subscription.planSnapshot = planSnapshot;
        subscription.status = "active";
        subscription.billingCycle = "monthly";
        subscription.isComplimentary = true;
        subscription.currentPeriodStart = now;
        subscription.currentPeriodEnd = periodEnd;
        subscription.quotaState = {
            trialQuotaLimit: 5,
            trialQuotaUsed: subscription.quotaState?.trialQuotaUsed || 0,
            currentCalendarMonthKey: monthKey,
            monthlyQuotaLimit: plan.monthlyContactQuota,
            monthlyQuotaUsed: 0
        };
        await subscription.save();
    } else {
        subscription = await Subscription.create({
            brand: brandId,
            plan: plan._id,
            planSnapshot,
            status: "active",
            billingCycle: "monthly",
            isComplimentary: true,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            quotaState: {
                trialQuotaLimit: 5,
                trialQuotaUsed: 0,
                currentCalendarMonthKey: monthKey,
                monthlyQuotaLimit: plan.monthlyContactQuota,
                monthlyQuotaUsed: 0
            }
        });
    }

    await AuditLog.create({
        admin: adminId,
        action: "SUBSCRIPTION_GRANT_COMPLIMENTARY",
        targetType: "subscription",
        targetId: subscription._id,
        reason: reason.trim(),
        previousState,
        newState: subscription.toObject()
    });

    // Notify Brand
    try {
        await createNotificationService({
            recipient: brandId,
            sender: adminId,
            type: "subscription_activated",
            title: "Complimentary Subscription Granted",
            message: `Platform administration has granted you a complimentary ${plan.name} subscription valid until ${periodEnd.toLocaleDateString()}. (Reason: ${reason.trim()})`,
            entityType: "subscription",
            entityId: subscription._id,
            destination: "/brand/subscription"
        });
    } catch (notifErr) {
        console.error("Failed to notify brand of complimentary grant:", notifErr);
    }

    return subscription;
};

/**
 * Extends a Brand's free trial.
 */
export const extendTrialAdminService = async (adminId, { brandId, extraDays = 5, reason }) => {
    if (!reason || !reason.trim()) {
        throw createApiError(400, "A valid reason is required for trial extensions");
    }

    const subscription = await Subscription.findOne({ brand: brandId });
    if (!subscription) {
        throw createApiError(404, "Brand subscription not found");
    }

    const previousState = {
        trialEndDate: subscription.trialEndDate,
        status: subscription.status
    };

    const currentEndMs = subscription.trialEndDate ? new Date(subscription.trialEndDate).getTime() : Date.now();
    const baseMs = Math.max(Date.now(), currentEndMs);
    const newEnd = new Date(baseMs + Number(extraDays) * 24 * 60 * 60 * 1000);

    subscription.trialEndDate = newEnd;
    subscription.currentPeriodEnd = newEnd;
    subscription.status = "trialing";
    await subscription.save();

    await AuditLog.create({
        admin: adminId,
        action: "SUBSCRIPTION_EXTEND_TRIAL",
        targetType: "subscription",
        targetId: subscription._id,
        reason: reason.trim(),
        previousState,
        newState: {
            trialEndDate: subscription.trialEndDate,
            status: subscription.status
        }
    });

    return subscription;
};

/**
 * Suspends a Brand's subscription.
 */
export const suspendSubscriptionAdminService = async (adminId, { brandId, reason }) => {
    if (!reason || !reason.trim()) {
        throw createApiError(400, "A valid reason is required for subscription suspension");
    }

    const subscription = await Subscription.findOne({ brand: brandId });
    if (!subscription) {
        throw createApiError(404, "Brand subscription not found");
    }

    const previousState = { status: subscription.status };
    subscription.status = "suspended";
    await subscription.save();

    // Pause published campaigns
    await Campaign.updateMany({ brand: brandId, status: "published" }, { status: "paused" });

    await AuditLog.create({
        admin: adminId,
        action: "SUBSCRIPTION_SUSPEND",
        targetType: "subscription",
        targetId: subscription._id,
        reason: reason.trim(),
        previousState,
        newState: { status: "suspended" }
    });

    return subscription;
};

/**
 * Reinstates a suspended subscription.
 */
export const reinstateSubscriptionAdminService = async (adminId, { brandId, reason }) => {
    if (!reason || !reason.trim()) {
        throw createApiError(400, "A valid reason is required for subscription reinstatement");
    }

    const subscription = await Subscription.findOne({ brand: brandId });
    if (!subscription) {
        throw createApiError(404, "Brand subscription not found");
    }

    const previousState = { status: subscription.status };
    subscription.status = subscription.billingCycle === "trial" ? "trialing" : "active";
    await subscription.save();

    await AuditLog.create({
        admin: adminId,
        action: "SUBSCRIPTION_REINSTATE",
        targetType: "subscription",
        targetId: subscription._id,
        reason: reason.trim(),
        previousState,
        newState: { status: subscription.status }
    });

    return subscription;
};

/**
 * Cancels a subscription immediately or at period end.
 */
export const cancelSubscriptionAdminService = async (adminId, { brandId, immediately = false, reason }) => {
    if (!reason || !reason.trim()) {
        throw createApiError(400, "A valid reason is required for administrative cancellation");
    }

    const subscription = await Subscription.findOne({ brand: brandId });
    if (!subscription) {
        throw createApiError(404, "Brand subscription not found");
    }

    const previousState = {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    };

    if (immediately) {
        subscription.status = "canceled";
        subscription.canceledAt = new Date();
    } else {
        subscription.cancelAtPeriodEnd = true;
        subscription.canceledAt = new Date();
    }
    await subscription.save();

    await AuditLog.create({
        admin: adminId,
        action: immediately ? "SUBSCRIPTION_CANCEL_IMMEDIATE" : "SUBSCRIPTION_CANCEL_PERIOD_END",
        targetType: "subscription",
        targetId: subscription._id,
        reason: reason.trim(),
        previousState,
        newState: {
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        }
    });

    return subscription;
};

export default {
    getAdminSubscriptionAnalyticsService,
    createSubscriptionPlanAdminService,
    updateSubscriptionPlanAdminService,
    togglePlanStatusAdminService,
    getAllPlansAdminService,
    getAllSubscribersAdminService,
    getSubscriberDetailAdminService,
    grantComplimentarySubscriptionService,
    extendTrialAdminService,
    suspendSubscriptionAdminService,
    reinstateSubscriptionAdminService,
    cancelSubscriptionAdminService
};

