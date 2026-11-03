import mongoose from "mongoose";
import Auth from "../auth/auth.model.js";
import Subscription from "./subscription.model.js";
import SubscriptionPlan from "./plan.model.js";
import { evaluateTrialEligibility } from "./trialEligibility.service.js";
import createApiError from "../../utils/ApiError.js";

// Trial configuration constants
const TRIAL_DURATION_DAYS = 5;
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
const TRIAL_CONTACT_QUOTA_LIMIT = 5;

/**
 * Creates an automatic 5-day trial subscription for a newly registered Brand.
 * In accordance with CreatorLink Phase 2 Step 2 requirements:
 * 1. Trial starts immediately upon successful Brand registration/verification.
 * 2. Backend UTC timestamps: trialStartDate = now, trialEndDate = now + 5 days.
 * 3. billingCycle = "trial", status = "trialing".
 * 4. Total contact unlock limit = exactly 5 unique Creators total (never resets by calendar month).
 * 5. Idempotent: Never resets on login, profile updates, or repeated calls.
 * 6. Brand cannot receive multiple active trials (enforced in code and database).
 * 7. Non-brand accounts (creators, admins) are rejected.
 * 
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.brandId - Auth user ID of the Brand
 * @param {string} [params.email] - Brand email
 * @param {string} [params.name] - Brand contact name
 * @param {string} [params.companyName] - Company name if available
 * @param {string} [params.website] - Company website if available
 * @returns {Promise<{ subscription: Object, isNew: boolean }>}
 */
export const createBrandTrialSubscriptionService = async ({
    brandId,
    email,
    name,
    companyName,
    website
}) => {
    if (!brandId) {
        throw createApiError(400, "Brand ID is required to initialize trial");
    }

    // 1. Verify user exists and has role 'brand'
    const brandUser = await Auth.findById(brandId).select("_id role email name isVerified");
    if (!brandUser) {
        throw createApiError(404, "Brand user not found");
    }

    if (brandUser.role !== "brand") {
        throw createApiError(400, `Trials can only be granted to brand accounts (role: ${brandUser.role})`);
    }

    // 2. Strict idempotency check: if any subscription already exists for this Brand, return it unmodified
    const existingSubscription = await Subscription.findOne({ brand: brandId });
    if (existingSubscription) {
        return {
            subscription: existingSubscription,
            isNew: false
        };
    }

    // 3. Multi-signal eligibility check (does not reject genuine businesses; flags potential duplicates)
    const eligibility = await evaluateTrialEligibility({
        brandId,
        email: email || brandUser.email,
        companyName,
        website
    });

    if (eligibility.isFlagged) {
        console.warn(
            `[Trial Eligibility Warning] Brand ${brandId} (${email || brandUser.email}) flagged for admin review. Signals: ${eligibility.matchedSignals.join("; ")}`
        );
    }

    // 4. Calculate exact UTC dates
    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate.getTime() + TRIAL_DURATION_MS);

    // 5. Build trial subscription document with clean planSnapshot (price = 0, plan = null)
    const trialData = {
        brand: brandId,
        plan: null,
        planSnapshot: {
            name: "Free Trial",
            slug: "trial",
            version: 1,
            price: 0,
            currency: "INR",
            billingCycle: "trial",
            monthlyContactQuota: TRIAL_CONTACT_QUOTA_LIMIT,
            features: [
                "5 Creator Contact Unlocks",
                "Campaign Creation & Publishing",
                "Workspace Collaborations"
            ]
        },
        status: "trialing",
        billingCycle: "trial",
        isComplimentary: false,
        trialStartDate,
        trialEndDate,
        currentPeriodStart: trialStartDate,
        currentPeriodEnd: trialEndDate,
        quotaState: {
            trialQuotaLimit: TRIAL_CONTACT_QUOTA_LIMIT,
            trialQuotaUsed: 0,
            currentCalendarMonthKey: "",
            monthlyQuotaLimit: 0,
            monthlyQuotaUsed: 0
        },
        trialEligibility: {
            isFlagged: eligibility.isFlagged,
            flagReasons: eligibility.matchedSignals,
            evaluatedAt: new Date()
        }
    };

    try {
        const subscription = await Subscription.create(trialData);
        return {
            subscription,
            isNew: true
        };
    } catch (error) {
        // Handle concurrent registration race conditions gracefully via partial unique index
        if (error.code === 11000) {
            const existing = await Subscription.findOne({ brand: brandId });
            if (existing) {
                return {
                    subscription: existing,
                    isNew: false
                };
            }
        }
        throw error;
    }
};

/**
 * Retrieves the current subscription status for a Brand with live server-side expiry check.
 * 
 * @param {string|mongoose.Types.ObjectId} brandId
 * @returns {Promise<Object>}
 */
export const getBrandSubscriptionStatusService = async (brandId) => {
    let subscription = await Subscription.findOne({ brand: brandId }).populate("plan");

    if (!subscription) {
        const brandUser = await Auth.findById(brandId).select("name email role");
        if (brandUser && brandUser.role === "brand") {
            const trialResult = await createBrandTrialSubscriptionService({
                brandId: brandUser._id,
                email: brandUser.email,
                name: brandUser.name
            });
            subscription = trialResult?.subscription || (await Subscription.findOne({ brand: brandId }).populate("plan"));
        }
    }

    if (!subscription) {
        return {
            hasSubscription: false,
            status: "none",
            isActive: false,
            isExpired: false
        };
    }

    const now = new Date();
    const isTrial = subscription.billingCycle === "trial";
    const isExpired = isTrial
        ? Boolean(subscription.trialEndDate && now >= subscription.trialEndDate)
        : Boolean(subscription.currentPeriodEnd && now >= subscription.currentPeriodEnd);

    const remainingQuota = isTrial
        ? Math.max(0, (subscription.quotaState?.trialQuotaLimit || 0) - (subscription.quotaState?.trialQuotaUsed || 0))
        : Math.max(0, (subscription.quotaState?.monthlyQuotaLimit || 0) - (subscription.quotaState?.monthlyQuotaUsed || 0));

    const isStatusActive = subscription.status === "trialing" || subscription.status === "active";
    const isActive = !isExpired && isStatusActive;

    return {
        hasSubscription: true,
        subscription,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        isActive,
        isExpired,
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        remainingContactQuota: remainingQuota,
        isTrialFlagged: Boolean(subscription.trialEligibility?.isFlagged),
        flagReasons: subscription.trialEligibility?.flagReasons || []
    };
};

/**
 * Re-evaluates trial eligibility when Brand profile is created or updated.
 * Updates flags for Admin review WITHOUT resetting trial dates or quotas.
 * 
 * @param {string|mongoose.Types.ObjectId} brandId
 * @param {Object} profileData
 * @returns {Promise<void>}
 */
export const reEvaluateBrandTrialEligibilityService = async (brandId, profileData = {}) => {
    const subscription = await Subscription.findOne({ brand: brandId });
    if (!subscription) return;

    const brandUser = await Auth.findById(brandId).select("email");
    const eligibility = await evaluateTrialEligibility({
        brandId,
        email: brandUser?.email,
        companyName: profileData.companyName,
        website: profileData.website
    });

    if (eligibility.isFlagged && !subscription.trialEligibility?.isFlagged) {
        subscription.trialEligibility = {
            isFlagged: true,
            flagReasons: eligibility.matchedSignals,
            evaluatedAt: new Date()
        };
        await subscription.save();
    }
};

export default {
    createBrandTrialSubscriptionService,
    getBrandSubscriptionStatusService,
    reEvaluateBrandTrialEligibilityService
};
