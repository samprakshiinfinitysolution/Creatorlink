import mongoose from "mongoose";
import Campaign from "../../brand/campaigns/campaign.model.js";
import Auth from "../../auth/auth.model.js";
import BrandProfile from "../../brand/profile/profile.model.js";
import Booking from "../../booking/booking.model.js";
import Workspace from "../../workspace/workspace.model.js";
import Payment from "../../payments/payment.model.js";
import Review from "../../reviews/reviews.model.js";
import AuditLog from "../audit/audit.model.js";
import Notification from "../../notifications/notification.model.js";
import { createNotificationService, createNotificationSafe, notifyAdminsSafe } from "../../notifications/notification.service.js";
import createApiError from "../../../utils/ApiError.js";
import { getPagination, getPaginationData } from "../../../utils/pagination.js";

/**
 * Fetches paginated campaigns with multi-criteria filters, brand details, moderation flags, and application counts.
 */
export const getAdminCampaignsService = async (queryParams) => {
    const {
        page = 1,
        limit = 10,
        status = "all",
        platform = "all",
        category,
        search = "",
        minBudget,
        maxBudget,
        isRestricted,
        sortBy = "newest"
    } = queryParams;

    const filter = {};
    const andClauses = [];

    // Filter by lifecycle status
    if (status && status !== "all") {
        filter.status = status.toLowerCase();
    }

    // Filter by moderation restriction
    if (isRestricted === "true") {
        filter["moderation.isRestricted"] = true;
    } else if (isRestricted === "false") {
        filter["moderation.isRestricted"] = false;
    }

    // Filter by platform
    if (platform && platform !== "all") {
        filter.platform = platform.toLowerCase();
    }

    // Filter by category
    if (category && category.trim()) {
        filter.category = new RegExp(category.trim(), "i");
    }

    // Filter by budget range (supports both fixed budget and min/max budget range)
    if (
        (minBudget !== undefined && minBudget !== "") ||
        (maxBudget !== undefined && maxBudget !== "")
    ) {
        const numMin = minBudget !== undefined && minBudget !== "" ? Number(minBudget) : null;
        const numMax = maxBudget !== undefined && maxBudget !== "" ? Number(maxBudget) : null;

        const singleBudgetMatch = {};
        if (numMin !== null) singleBudgetMatch.$gte = numMin;
        if (numMax !== null) singleBudgetMatch.$lte = numMax;

        const rangeBudgetMatch = {};
        if (numMin !== null) rangeBudgetMatch.maxBudget = { $gte: numMin };
        if (numMax !== null) rangeBudgetMatch.minBudget = { $lte: numMax };

        andClauses.push({
            $or: [
                { budget: singleBudgetMatch },
                rangeBudgetMatch
            ]
        });
    }

    // Search by title, description, category, or brand name/email
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
        const searchRegex = new RegExp(trimmedSearch, "i");

        const matchingBrands = await Auth.find({
            role: "brand",
            $or: [{ name: searchRegex }, { email: searchRegex }]
        }).select("_id");

        const brandIds = matchingBrands.map((b) => b._id);

        andClauses.push({
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { brand: { $in: brandIds } }
            ]
        });
    }

    if (andClauses.length > 0) {
        filter.$and = andClauses;
    }

    const { skip, limit: parsedLimit } = getPagination(page, limit);

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === "oldest") {
        sortOptions = { createdAt: 1 };
    } else if (sortBy === "budget_high") {
        sortOptions = { budget: -1 };
    } else if (sortBy === "budget_low") {
        sortOptions = { budget: 1 };
    } else if (sortBy === "deadline") {
        sortOptions = { deadline: 1 };
    }

    const [campaigns, totalItems] = await Promise.all([
        Campaign.find(filter)
            .populate("brand", "name email role isVerified avatar createdAt")
            .populate("moderation.restrictedBy", "name email role")
            .sort(sortOptions)
            .skip(skip)
            .limit(parsedLimit)
            .lean(),
        Campaign.countDocuments(filter)
    ]);

    // Attach brand company profiles and booking counts
    const brandIds = campaigns.map((c) => c.brand?._id).filter(Boolean);
    const campaignIds = campaigns.map((c) => c._id);

    const [brandProfiles, bookingStats] = await Promise.all([
        BrandProfile.find({ user: { $in: brandIds } })
            .select("user companyName logo industry website isVerifiedBusiness")
            .lean(),
        Booking.aggregate([
            { $match: { campaign: { $in: campaignIds } } },
            {
                $group: {
                    _id: "$campaign",
                    totalApplications: { $sum: 1 },
                    acceptedApplications: {
                        $sum: {
                            $cond: [{ $in: ["$status", ["accepted", "in_progress", "completed"]] }, 1, 0]
                        }
                    }
                }
            }
        ])
    ]);

    const brandProfileMap = new Map();
    brandProfiles.forEach((bp) => {
        brandProfileMap.set(bp.user.toString(), bp);
    });

    const bookingStatsMap = new Map();
    bookingStats.forEach((bs) => {
        bookingStatsMap.set(bs._id.toString(), bs);
    });

    const enrichedCampaigns = campaigns.map((camp) => {
        const brandUser = camp.brand;
        const brandProfile = brandUser ? brandProfileMap.get(brandUser._id.toString()) : null;
        const bookingStat = bookingStatsMap.get(camp._id.toString()) || {
            totalApplications: 0,
            acceptedApplications: 0
        };

        return {
            ...camp,
            brandProfile: brandProfile || null,
            totalApplications: bookingStat.totalApplications,
            acceptedApplications: bookingStat.acceptedApplications
        };
    });

    return {
        campaigns: enrichedCampaigns,
        pagination: getPaginationData(totalItems, page, limit)
    };
};

/**
 * Fetches campaign statistics overview for admin monitoring.
 */
export const getAdminCampaignStatsService = async () => {
    const [totalCampaigns, statusCounts, budgetMetrics, totalApplications, restrictedCount] = await Promise.all([
        Campaign.countDocuments(),
        Campaign.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),
        Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalBudget: { $sum: "$budget" },
                    avgBudget: { $avg: "$budget" }
                }
            }
        ]),
        Booking.countDocuments(),
        Campaign.countDocuments({ "moderation.isRestricted": true })
    ]);

    const statusMap = {
        draft: 0,
        published: 0,
        paused: 0,
        in_progress: 0,
        completed: 0,
        closed: 0
    };

    statusCounts.forEach((sc) => {
        if (statusMap[sc._id] !== undefined) {
            statusMap[sc._id] = sc.count;
        }
    });

    return {
        totalCampaigns,
        statusCounts: statusMap,
        totalBudget: budgetMetrics[0]?.totalBudget || 0,
        avgBudget: Math.round(budgetMetrics[0]?.avgBudget || 0),
        totalApplications,
        restrictedCount
    };
};

/**
 * Fetches deep dossier for a single campaign including brand profile, audit log history, and applied bookings.
 */
export const getAdminCampaignByIdService = async (campaignId) => {
    const campaign = await Campaign.findById(campaignId)
        .populate("brand", "name email role isVerified avatar createdAt")
        .populate("moderation.restrictedBy", "name email role")
        .populate("moderation.resolvedBy", "name email role")
        .populate("moderation.history.admin", "name email role")
        .lean();

    if (!campaign) {
        throw createApiError(404, "Campaign not found");
    }

    const brandUserId = campaign.brand?._id;

    const [brandProfile, bookings, auditLogs] = await Promise.all([
        brandUserId
            ? BrandProfile.findOne({ user: brandUserId })
                  .select("companyName description industry website logo location isVerifiedBusiness")
                  .lean()
            : null,
        Booking.find({ campaign: campaignId })
            .populate("creator", "name email isVerified avatar")
            .populate("service", "title price deliveryTime")
            .sort({ createdAt: -1 })
            .lean(),
        AuditLog.find({ targetType: "campaign", targetId: campaignId })
            .populate("admin", "name email role")
            .sort({ createdAt: -1 })
            .lean()
    ]);

    const bookingStatusCounts = {
        total: bookings.length,
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
        in_progress: 0,
        completed: 0
    };

    bookings.forEach((b) => {
        if (bookingStatusCounts[b.status] !== undefined) {
            bookingStatusCounts[b.status]++;
        }
    });

    return {
        campaign,
        brandProfile,
        bookings,
        bookingStats: bookingStatusCounts,
        auditLogs
    };
};

/**
 * Business Rule 3 & 4: Admin pauses campaign for moderation and places restriction.
 * - Sets status = "paused"
 * - Sets moderation.isRestricted = true
 * - Existing accepted bookings and workspaces remain intact.
 * - New creator applications are blocked.
 * - Audited in AuditLog and moderation.history.
 */
export const moderateCampaignPauseService = async (campaignId, reason, adminId) => {
    if (!reason || !reason.trim()) {
        throw createApiError(400, "Moderation reason is required to pause a campaign");
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
        throw createApiError(404, "Campaign not found");
    }

    if (campaign.moderation?.isRestricted) {
        throw createApiError(400, "Campaign is already restricted for moderation");
    }

    const previousStatus = campaign.status;
    campaign.status = "paused";

    if (!campaign.moderation) {
        campaign.moderation = {};
    }

    campaign.moderation.isRestricted = true;
    campaign.moderation.restrictedBy = adminId;
    campaign.moderation.restrictionReason = reason.trim();
    campaign.moderation.restrictedAt = new Date();
    campaign.moderation.previousStatus = previousStatus;

    campaign.moderation.history.push({
        action: "restricted",
        admin: adminId,
        reason: reason.trim(),
        previousStatus,
        newStatus: "paused",
        timestamp: new Date()
    });

    await campaign.save();

    // Create system audit log entry
    await AuditLog.create({
        admin: adminId,
        action: "CAMPAIGN_MODERATION_PAUSE",
        targetType: "campaign",
        targetId: campaign._id,
        reason: reason.trim(),
        previousState: { status: previousStatus, isRestricted: false },
        newState: { status: "paused", isRestricted: true }
    });

    // Notify brand of administrative moderation restriction
    try {
        await createNotificationService({
            recipient: campaign.brand,
            sender: adminId,
            type: "campaign_moderation_paused",
            title: "Campaign Paused by Administration",
            message: `Your campaign "${campaign.title}" has been paused by platform administration for review. Reason: ${reason.trim()}`,
            entityType: "campaign",
            entityId: campaign._id,
            destination: `/brand/campaigns`
        });

        // Notify peer admins about the campaign moderation restriction
        const adminUser = await Auth.findById(adminId).select("name email").lean();
        const adminName = adminUser?.name || "Administrator";
        await notifyAdminsSafe({
            sender: adminId,
            type: "campaign_moderated_paused",
            title: "Campaign Paused by Admin",
            message: `${adminName} paused campaign "${campaign.title}". Reason: ${reason.trim()}`,
            entityType: "campaign",
            entityId: campaign._id,
            destination: `/admin/campaigns?id=${campaign._id}`,
            metadata: {
                campaignId: campaign._id,
                action: "paused",
                restrictedBy: adminId,
                reason: reason.trim()
            },
            idempotencyKey: `peer_camp_pause_${campaign._id}_${Date.now()}`
        }, { excludeAdminId: adminId });
    } catch (notifErr) {
        console.error("Failed to dispatch admin pause notification:", notifErr);
    }

    return campaign;
};

/**
 * Business Rule 3: Admin resumes campaign after moderation restrictions are resolved.
 * - Verifies restriction is active.
 * - Restores status to previous status (or "published").
 * - Clears moderation.isRestricted.
 * - Audited in AuditLog and moderation.history.
 */
export const moderateCampaignResumeService = async (campaignId, reason, adminId) => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
        throw createApiError(404, "Campaign not found");
    }

    if (!campaign.moderation?.isRestricted) {
        throw createApiError(400, "Campaign does not have an active administrative moderation restriction");
    }

    const previousStatus = campaign.status;
    const targetStatus = campaign.moderation.previousStatus === "in_progress" ? "in_progress" : "published";

    campaign.status = targetStatus;
    campaign.moderation.isRestricted = false;
    campaign.moderation.resolvedAt = new Date();
    campaign.moderation.resolvedBy = adminId;

    campaign.moderation.history.push({
        action: "resolved",
        admin: adminId,
        reason: reason ? reason.trim() : "Administrative moderation restriction resolved",
        previousStatus,
        newStatus: targetStatus,
        timestamp: new Date()
    });

    await campaign.save();

    // Create system audit log entry
    await AuditLog.create({
        admin: adminId,
        action: "CAMPAIGN_MODERATION_RESUME",
        targetType: "campaign",
        targetId: campaign._id,
        reason: reason ? reason.trim() : "Administrative moderation restriction resolved",
        previousState: { status: previousStatus, isRestricted: true },
        newState: { status: targetStatus, isRestricted: false }
    });

    // Notify brand of resolution
    try {
        await createNotificationService({
            recipient: campaign.brand,
            sender: adminId,
            type: "campaign_moderation_resolved",
            title: "Campaign Moderation Restriction Resolved",
            message: `Administrative review for "${campaign.title}" has been resolved. Campaign restored to ${targetStatus.toUpperCase()}.`,
            entityType: "campaign",
            entityId: campaign._id,
            destination: `/brand/campaigns`
        });

        // Notify peer admins about the campaign restoration
        const adminUser = await Auth.findById(adminId).select("name email").lean();
        const adminName = adminUser?.name || "Administrator";
        await notifyAdminsSafe({
            sender: adminId,
            type: "campaign_moderated_resumed",
            title: "Campaign Resumed by Admin",
            message: `${adminName} restored campaign "${campaign.title}".`,
            entityType: "campaign",
            entityId: campaign._id,
            destination: `/admin/campaigns?id=${campaign._id}`,
            metadata: {
                campaignId: campaign._id,
                action: "resumed",
                resolvedBy: adminId
            },
            idempotencyKey: `peer_camp_resume_${campaign._id}_${Date.now()}`
        }, { excludeAdminId: adminId });
    } catch (notifErr) {
        console.error("Failed to dispatch admin resume notification:", notifErr);
    }

    return campaign;
};

/**
 * Business Rule 2 & 5: Admin closes campaign when justified.
 * - Sets status = "closed"
 * - Preserves existing financial records, accepted bookings and workspaces.
 * - Audited in AuditLog and moderation.history.
 */
export const moderateCampaignCloseService = async (campaignId, reason, adminId) => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
        throw createApiError(404, "Campaign not found");
    }

    if (campaign.status === "closed") {
        throw createApiError(400, "Campaign is already closed");
    }

    const previousStatus = campaign.status;
    campaign.status = "closed";

    if (!campaign.moderation) {
        campaign.moderation = {};
    }

    campaign.moderation.history.push({
        action: "closed",
        admin: adminId,
        reason: reason ? reason.trim() : "Closed by platform administration",
        previousStatus,
        newStatus: "closed",
        timestamp: new Date()
    });

    await campaign.save();

    // Create audit log entry
    await AuditLog.create({
        admin: adminId,
        action: "CAMPAIGN_MODERATION_CLOSE",
        targetType: "campaign",
        targetId: campaign._id,
        reason: reason ? reason.trim() : "Closed by platform administration",
        previousState: { status: previousStatus },
        newState: { status: "closed" }
    });

    // Notify brand
    try {
        await createNotificationService({
            recipient: campaign.brand,
            sender: adminId,
            type: "campaign_moderation_closed",
            title: "Campaign Closed by Administration",
            message: `Your campaign "${campaign.title}" was closed by administration.${reason ? ` Reason: ${reason.trim()}` : ""}`,
            entityType: "campaign",
            entityId: campaign._id,
            destination: `/brand/campaigns`
        });

        // Notify peer admins about the campaign closure
        const adminUser = await Auth.findById(adminId).select("name email").lean();
        const adminName = adminUser?.name || "Administrator";
        await notifyAdminsSafe({
            sender: adminId,
            type: "campaign_moderated_closed",
            title: "Campaign Closed by Admin",
            message: `${adminName} closed campaign "${campaign.title}".${reason ? ` Reason: ${reason.trim()}` : ""}`,
            entityType: "campaign",
            entityId: campaign._id,
            destination: `/admin/campaigns?id=${campaign._id}`,
            metadata: {
                campaignId: campaign._id,
                action: "closed",
                closedBy: adminId,
                reason: reason ? reason.trim() : ""
            },
            idempotencyKey: `peer_camp_close_${campaign._id}_${Date.now()}`
        }, { excludeAdminId: adminId });
    } catch (notifErr) {
        console.error("Failed to dispatch admin close notification:", notifErr);
    }

    return campaign;
};

/**
 * Business Rule 6: Safe removal of campaign by platform administration.
 * - Ensures campaigns with accepted bookings, in_progress collaborations, completed bookings,
 *   any linked workspaces (including completed), payment records, or review records CANNOT be deleted.
 * - If deletion is permitted:
 *   1. Identifies and cancels open pending applications.
 *   2. Notifies affected creators with deterministic idempotency keys.
 *   3. Notifies brand with deterministic idempotency key.
 *   4. Logs audit entry.
 *   5. Permanently deletes the campaign document from MongoDB.
 */
export const safeDeleteAdminCampaignService = async (campaignId, adminId, reason = "") => {
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        throw createApiError(400, "Invalid campaign ID");
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
        // Recovery & Idempotency: Check if this campaign was already deleted in a previous call
        const priorAuditLog = await AuditLog.findOne({
            targetType: "campaign",
            targetId: campaignId,
            action: "CAMPAIGN_SAFE_DELETE"
        });

        const priorNotifications = await Notification.find({
            entityId: campaignId,
            type: "campaign_deleted"
        }).lean();

        const cancelledBookings = await Booking.find({
            campaign: campaignId,
            status: "cancelled",
            rejectionReason: "campaign_deleted"
        }).select("_id creator brand rejectionReason").lean();

        const wasDeleted = !!(priorAuditLog || priorNotifications.length > 0 || cancelledBookings.length > 0);

        if (!wasDeleted) {
            throw createApiError(404, "Campaign not found");
        }

        // Campaign was permanently deleted from MongoDB. Complete any missing post-deletion operations.
        const campaignTitle = priorAuditLog?.previousState?.title ||
            priorNotifications.find((n) => n.metadata?.title)?.metadata?.title ||
            "Campaign";

        const brandId = priorNotifications.find((n) => n.idempotencyKey?.endsWith("_brand"))?.recipient ||
            cancelledBookings[0]?.brand ||
            null;

        const recoveryErrors = [];

        // 1. Recover any missing Creator notifications
        for (const booking of cancelledBookings) {
            if (booking.creator) {
                const creatorKey = `notif_camp_del_${campaignId}_${booking._id}`;
                const exists = await Notification.findOne({ idempotencyKey: creatorKey });
                if (!exists) {
                    try {
                        const notif = await createNotificationService({
                            recipient: booking.creator,
                            sender: adminId,
                            type: "campaign_deleted",
                            title: "Campaign Removed by Administration",
                            message: `The campaign "${campaignTitle}" was removed by platform administration and your pending application has been cancelled.${reason ? ` Reason: ${reason.trim()}` : ""}`,
                            entityType: "campaign",
                            entityId: campaignId,
                            destination: `/creator/campaigns/applied`,
                            metadata: {
                                campaignId,
                                bookingId: booking._id,
                                title: campaignTitle,
                                status: "cancelled",
                                reason: reason ? reason.trim() : ""
                            },
                            idempotencyKey: creatorKey
                        });
                        if (!notif) recoveryErrors.push(`Failed to dispatch creator notification for booking ${booking._id}`);
                    } catch (err) {
                        recoveryErrors.push(`Creator notification error for booking ${booking._id}: ${err.message}`);
                    }
                }
            }
        }

        // 2. Recover any missing Brand notification
        if (brandId) {
            const brandKey = `notif_camp_del_${campaignId}_brand`;
            const brandNotifExists = await Notification.findOne({ idempotencyKey: brandKey });
            if (!brandNotifExists) {
                try {
                    const notif = await createNotificationService({
                        recipient: brandId,
                        sender: adminId,
                        type: "campaign_deleted",
                        title: "Campaign Removed by Administration",
                        message: `Your campaign "${campaignTitle}" was removed by platform administration.${reason ? ` Reason: ${reason.trim()}` : ""}`,
                        entityType: "campaign",
                        entityId: campaignId,
                        destination: `/brand/campaigns`,
                        metadata: {
                            campaignId,
                            title: campaignTitle,
                            deleted: true,
                            reason: reason ? reason.trim() : ""
                        },
                        idempotencyKey: brandKey
                    });
                    if (!notif) recoveryErrors.push("Failed to dispatch brand notification");
                } catch (err) {
                    recoveryErrors.push(`Brand notification error: ${err.message}`);
                }
            }
        }

        // 3. Recover any missing AuditLog entry
        if (!priorAuditLog) {
            try {
                await AuditLog.create({
                    admin: adminId,
                    action: "CAMPAIGN_SAFE_DELETE",
                    targetType: "campaign",
                    targetId: campaignId,
                    reason: reason ? reason.trim() : "Safe deletion performed by administration",
                    previousState: { title: campaignTitle, status: "published" },
                    newState: { deleted: true }
                });
            } catch (err) {
                recoveryErrors.push(`AuditLog creation error: ${err.message}`);
            }
        }

        if (recoveryErrors.length > 0) {
            throw createApiError(
                500,
                `Campaign was deleted, but recovery operations encountered errors: ${recoveryErrors.join("; ")}. Please retry.`
            );
        }

        return {
            campaignId,
            message: "Campaign was already safely removed and all recovery operations completed"
        };
    }

    const brandId = campaign.brand;
    const campaignTitle = campaign.title;
    const session = await mongoose.startSession();
    let pendingBookingsToNotify = [];

    try {
        await session.withTransaction(async () => {
            // 1. Lock campaign document atomically and set status to "closed"
            const lockedCampaign = await Campaign.findOneAndUpdate(
                { _id: campaignId },
                {
                    $set: { status: "closed" },
                    $inc: { __v: 1 }
                },
                { session, new: true }
            );

            if (!lockedCampaign) {
                throw createApiError(404, "Campaign not found or has already been modified");
            }

            // 2. Block deletion if any Booking is accepted, in_progress or completed
            const activeCollaborations = await Booking.countDocuments({
                campaign: campaignId,
                status: { $in: ["accepted", "in_progress", "completed"] }
            }).session(session);

            if (activeCollaborations > 0) {
                throw createApiError(
                    400,
                    `Cannot remove campaign: ${activeCollaborations} accepted collaboration(s) or completed bookings are linked to this campaign. Please close the campaign instead to preserve financial and contract history.`
                );
            }

            // 3. Block deletion if ANY Workspace exists for the campaign, including completed Workspaces
            const workspaceCount = await Workspace.countDocuments({
                campaign: campaignId
            }).session(session);

            if (workspaceCount > 0) {
                throw createApiError(
                    400,
                    `Cannot remove campaign: ${workspaceCount} workspace(s) are linked to this campaign. Please close the campaign instead to preserve collaboration history.`
                );
            }

            // 4. Block deletion if related Payment records exist
            const paymentCount = await Payment.countDocuments({
                campaign: campaignId
            }).session(session);

            if (paymentCount > 0) {
                throw createApiError(
                    400,
                    `Cannot remove campaign: ${paymentCount} payment record(s) are linked to this campaign. Please close the campaign instead to preserve financial history.`
                );
            }

            // 5. Block deletion if related Review records exist
            const reviewCount = await Review.countDocuments({
                campaign: campaignId
            }).session(session);

            if (reviewCount > 0) {
                throw createApiError(
                    400,
                    `Cannot remove campaign: ${reviewCount} review record(s) are linked to this campaign. Please close the campaign instead to preserve review history.`
                );
            }

            // 6. Find open pending Bookings and transition them to cancelled inside transaction
            await Booking.updateMany(
                {
                    campaign: campaignId,
                    status: "pending"
                },
                {
                    $set: {
                        status: "cancelled",
                        rejectionReason: "campaign_deleted"
                    }
                },
                { session }
            );

            // Fetch affected bookings for deterministic post-commit notifications
            pendingBookingsToNotify = await Booking.find({
                campaign: campaignId,
                status: "cancelled",
                rejectionReason: "campaign_deleted"
            }).select("_id creator brand").session(session).lean();

            // 7. Permanently delete the campaign document from MongoDB (Hard Delete)
            try {
                await Campaign.findByIdAndDelete(campaignId, { session });
            } catch (deleteError) {
                if (deleteError?.statusCode) {
                    throw deleteError;
                }
                throw createApiError(
                    500,
                    `Failed to permanently delete campaign: ${deleteError?.message || "Database error"}`
                );
            }
        });
    } finally {
        await session.endSession();
    }

    // Track post-deletion errors to prevent reporting false success if notifications or audit log fail
    const postDeletionErrors = [];

    // 8. Post-deletion: Notify every affected Creator using deterministic idempotency keys
    for (const booking of pendingBookingsToNotify) {
        if (booking.creator) {
            try {
                const notif = await createNotificationService({
                    recipient: booking.creator,
                    sender: adminId,
                    type: "campaign_deleted",
                    title: "Campaign Removed by Administration",
                    message: `The campaign "${campaignTitle}" was removed by platform administration and your pending application has been cancelled.${reason ? ` Reason: ${reason.trim()}` : ""}`,
                    entityType: "campaign",
                    entityId: campaignId,
                    destination: `/creator/campaigns/applied`,
                    metadata: {
                        campaignId,
                        bookingId: booking._id,
                        title: campaignTitle,
                        status: "cancelled",
                        reason: reason ? reason.trim() : ""
                    },
                    idempotencyKey: `notif_camp_del_${campaignId}_${booking._id}`
                });
                if (!notif) postDeletionErrors.push(`Failed to dispatch creator notification for booking ${booking._id}`);
            } catch (err) {
                postDeletionErrors.push(`Creator notification error for booking ${booking._id}: ${err.message}`);
            }
        }
    }

    // 8. Post-deletion: Notify the Brand using deterministic idempotency key
    if (brandId) {
        try {
            const notif = await createNotificationService({
                recipient: brandId,
                sender: adminId,
                type: "campaign_deleted",
                title: "Campaign Removed by Administration",
                message: `Your campaign "${campaignTitle}" was removed by platform administration.${reason ? ` Reason: ${reason.trim()}` : ""}`,
                entityType: "campaign",
                entityId: campaignId,
                destination: `/brand/campaigns`,
                metadata: {
                    campaignId,
                    title: campaignTitle,
                    deleted: true,
                    reason: reason ? reason.trim() : ""
                },
                idempotencyKey: `notif_camp_del_${campaignId}_brand`
            });
            if (!notif) postDeletionErrors.push("Failed to dispatch brand notification");
        } catch (err) {
            postDeletionErrors.push(`Brand notification error: ${err.message}`);
        }
    }

    // 9. Post-deletion: Create Platform Audit Log
    try {
        await AuditLog.create({
            admin: adminId,
            action: "CAMPAIGN_SAFE_DELETE",
            targetType: "campaign",
            targetId: campaignId,
            reason: reason ? reason.trim() : "Safe deletion performed by administration",
            previousState: { title: campaignTitle, status: campaign.status },
            newState: { deleted: true }
        });
    } catch (err) {
        postDeletionErrors.push(`AuditLog creation error: ${err.message}`);
    }

    // If any post-deletion operation failed, throw error to prompt retry and avoid reporting false success
    if (postDeletionErrors.length > 0) {
        throw createApiError(
            500,
            `Campaign was safely deleted from database, but post-deletion operations failed: ${postDeletionErrors.join("; ")}. Please retry the request to complete recovery.`
        );
    }

    return {
        campaignId,
        message: `Campaign "${campaignTitle}" safely removed`
    };
};
