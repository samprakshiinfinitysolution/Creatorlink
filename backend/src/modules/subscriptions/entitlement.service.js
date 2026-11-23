import Subscription from "./subscription.model.js";
import SubscriptionPlan from "./plan.model.js";
import Auth from "../auth/auth.model.js";
import CreatorCreditBalance from "./creatorCreditBalance.model.js";
import { createBrandTrialSubscriptionService } from "./trial.service.js";
import createApiError from "../../utils/ApiError.js";

// Configurable Grace Period (default: 3 days in ms)
export const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

// Campaign content fields that are strictly protected from modification by expired/non-entitled Brands
const PROTECTED_CAMPAIGN_CONTENT_FIELDS = new Set([
    "title",
    "description",
    "category",
    "platform",
    "budget",
    "deadline",
    "requiredCreators",
    "requirements",
    "deliverables",
    "coverImage"
]);

/**
 * Centrally evaluates whether a Brand account holds active entitlement to subscription-gated features.
 * Evaluates live current server UTC timestamp against trialEndDate, currentPeriodEnd, and gracePeriodEnd.
 * 
 * Rules:
 * 1. Trial: status === "trialing" and now < trialEndDate
 * 2. Active Paid: status === "active" and now < currentPeriodEnd
 * 3. Past Due: access permitted ONLY within the configured grace period (now <= gracePeriodEnd)
 * 4. Cancel at Period End: access preserved until paid-through date (now < currentPeriodEnd)
 * 5. Expired or Suspended: access blocked
 * 6. Complimentary: access granted according to period dates
 * 
 * @param {string|ObjectId} brandId - Brand Auth ID
 * @returns {Promise<Object>} Entitlement evaluation breakdown
 */
export const evaluateBrandEntitlement = async (brandId) => {
    if (!brandId) {
        throw createApiError(400, "Brand ID is required for entitlement evaluation");
    }

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
            hasEntitlement: false,
            status: "none",
            billingCycle: "none",
            isTrial: false,
            isActive: false,
            isPastDue: false,
            inGracePeriod: false,
            isExpired: true,
            isSuspended: false,
            isComplimentary: false,
            canCreateCampaign: false,
            canEditCampaign: false,
            canPublishCampaign: false,
            canUnlockCreator: false,
            reason: "No active subscription or free trial found for this brand account.",
            trialStartDate: null,
            trialEndDate: null,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            gracePeriodEnd: null,
            totalContactQuota: 0,
            usedContactQuota: 0,
            remainingContactQuota: 0,
            planSnapshot: null,
            subscription: null
        };
    }

    const now = new Date();
    const isTrial = subscription.billingCycle === "trial";
    const isSuspended = subscription.status === "suspended";
    let isExpired = false;
    let inGracePeriod = false;
    let isPastDue = subscription.status === "past_due";
    let hasEntitlement = false;
    let reason = "";

    // 1. Quota calculations
    let totalContactQuota = 0;
    let usedContactQuota = 0;
    if (isTrial) {
        totalContactQuota = subscription.quotaState?.trialQuotaLimit || 5;
        usedContactQuota = subscription.quotaState?.trialQuotaUsed || 0;
    } else {
        totalContactQuota = subscription.quotaState?.monthlyQuotaLimit || subscription.planSnapshot?.monthlyContactQuota || 0;
        usedContactQuota = subscription.quotaState?.monthlyQuotaUsed || 0;
    }
    const remainingContactQuota = Math.max(0, totalContactQuota - usedContactQuota);

    // 2. Lifecycle Evaluation
    if (isSuspended) {
        hasEntitlement = false;
        reason = "Subscription is suspended by platform administration.";
    } else if (isTrial) {
        isExpired = Boolean(subscription.trialEndDate && now >= subscription.trialEndDate);
        if (isExpired) {
            hasEntitlement = false;
            reason = "Free trial has expired. Upgrade to an active plan to access premium features.";
        } else if (subscription.status === "trialing") {
            hasEntitlement = true;
            reason = "Active 5-day trial entitlement.";
        } else {
            hasEntitlement = false;
            reason = `Trial subscription status is ${subscription.status}.`;
        }
    } else {
        // Paid or complimentary plan
        const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
        isExpired = Boolean(periodEnd && now >= periodEnd);

        if (subscription.status === "active") {
            if (!isExpired) {
                hasEntitlement = true;
                reason = "Active subscription entitlement.";
            } else {
                hasEntitlement = false;
                reason = "Subscription billing period has expired. Please renew your plan.";
            }
        } else if (subscription.status === "past_due") {
            // Check Grace Period
            const effectiveGraceEnd = subscription.gracePeriodEnd
                ? new Date(subscription.gracePeriodEnd)
                : periodEnd
                    ? new Date(periodEnd.getTime() + GRACE_PERIOD_MS)
                    : null;

            if (effectiveGraceEnd && now <= effectiveGraceEnd) {
                inGracePeriod = true;
                hasEntitlement = true; // Entitled during grace period
                reason = `Subscription is past due, but active within grace period ending ${effectiveGraceEnd.toISOString()}.`;
            } else {
                inGracePeriod = false;
                hasEntitlement = false;
                reason = "Subscription grace period has expired. Please resolve payment to regain access.";
            }
        } else if (subscription.status === "canceled") {
            // Cancel at period end: if still before periodEnd, brand maintains access
            if (periodEnd && now < periodEnd) {
                hasEntitlement = true;
                reason = "Subscription canceled at period end, access active until end of billing cycle.";
            } else {
                hasEntitlement = false;
                reason = "Subscription has been canceled and billing period has ended.";
            }
        } else {
            hasEntitlement = false;
            reason = `Subscription status is ${subscription.status}.`;
        }
    }

    return {
        hasEntitlement,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        isTrial,
        isActive: hasEntitlement,
        isPastDue,
        inGracePeriod,
        isExpired,
        isSuspended,
        isComplimentary: Boolean(subscription.isComplimentary),
        canCreateCampaign: hasEntitlement,
        canEditCampaign: hasEntitlement,
        canPublishCampaign: hasEntitlement,
        canUnlockCreator: hasEntitlement && remainingContactQuota > 0,
        reason,
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        gracePeriodEnd: subscription.gracePeriodEnd,
        totalContactQuota,
        usedContactQuota,
        remainingContactQuota,
        planSnapshot: subscription.planSnapshot || null,
        subscription
    };
};

/**
 * Field-level campaign update entitlement validator.
 * Enforces business rules:
 * - Brand without valid entitlement CANNOT edit campaign content fields.
 * - Brand without valid entitlement CANNOT publish or resume campaigns (draft->published, paused->published).
 * - Brand without valid entitlement CAN pause or close their own campaign.
 * 
 * @param {string|ObjectId} brandId - Authenticated Brand user ID
 * @param {Object} campaign - Existing Campaign document
 * @param {Object} updatePayload - Fields being modified
 */
export const validateCampaignUpdateEntitlement = async (brandId, campaign, updatePayload = {}) => {
    const entitlement = await evaluateBrandEntitlement(brandId);

    // If Brand has active entitlement, all permitted operations proceed normally
    if (entitlement.hasEntitlement) {
        return entitlement;
    }

    // Brand lacks active entitlement: check attempted modifications
    // 1. Check if any protected content fields are being edited
    const attemptedContentEdits = Object.keys(updatePayload).filter((field) =>
        PROTECTED_CAMPAIGN_CONTENT_FIELDS.has(field)
    );

    if (attemptedContentEdits.length > 0) {
        throw createApiError(
            403,
            `Active subscription or trial is required to edit campaign content (attempted fields: ${attemptedContentEdits.join(", ")}). Your subscription has expired. Please upgrade or renew your plan to continue editing.`
        );
    }

    // 2. Check if attempting to publish or republish/resume the campaign
    if (updatePayload.status) {
        const nextStatus = updatePayload.status;
        const currentStatus = campaign.status;

        if (nextStatus === "published") {
            throw createApiError(
                403,
                `Active subscription or trial is required to publish or resume campaigns. Your subscription has expired. Please upgrade or renew your plan.`
            );
        }

        // Permitted status transitions without active subscription:
        // published -> paused
        // published -> closed
        // paused -> closed
        // in_progress -> closed / completed
        const allowedUnsubscribedTransitions = [
            { from: "draft", to: "closed" },
            { from: "published", to: "paused" },
            { from: "published", to: "closed" },
            { from: "paused", to: "closed" },
            { from: "in_progress", to: "completed" },
            { from: "in_progress", to: "closed" }
        ];

        const isAllowed = allowedUnsubscribedTransitions.some(
            (t) => t.from === currentStatus && t.to === nextStatus
        );

        if (!isAllowed) {
            throw createApiError(
                403,
                `Cannot transition campaign from "${currentStatus}" to "${nextStatus}" without an active subscription.`
            );
        }
    }

    return entitlement;
};

/**
 * Express middleware to enforce brand subscription entitlement on API routes.
 */
export const requireBrandSubscription = (actionName = "this action") => {
    return async (req, res, next) => {
        try {
            const brandId = req.user?.userId || req.user?._id;
            if (!brandId) {
                throw createApiError(401, "Authentication required");
            }

            const entitlement = await evaluateBrandEntitlement(brandId);
            if (!entitlement.hasEntitlement) {
                return res.status(403).json({
                    success: false,
                    message: `An active subscription or trial is required to ${actionName}. ${entitlement.reason}`,
                    upgradeRequired: true,
                    entitlement
                });
            }

            req.brandEntitlement = entitlement;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Centrally evaluates whether a Creator account holds active entitlement to apply for campaigns.
 * 
 * Rules:
 * 1. Creator must have a subscription with subscriberRole: "creator".
 * 2. Active Paid: status === "active" and now < currentPeriodEnd.
 * 3. Cancel at Period End: status === "canceled" and now < currentPeriodEnd.
 * 4. Past Due: access permitted ONLY within the configured grace period (now <= gracePeriodEnd).
 * 5. Expired or Suspended: access blocked.
 * 6. Checks available application credits from CreatorCreditBalance (currentBalance >= 1).
 * 
 * @param {string|mongoose.Types.ObjectId} creatorId - Creator Auth ID
 * @param {mongoose.ClientSession} [session=null] - Optional transaction session
 * @returns {Promise<Object>} Entitlement evaluation breakdown
 */
export const evaluateCreatorEntitlement = async (creatorId, session = null) => {
    if (!creatorId) {
        throw createApiError(400, "Creator ID is required for entitlement evaluation");
    }

    const query = Subscription.findOne({
        subscriber: creatorId,
        subscriberRole: "creator"
    }).populate("plan");

    if (session) {
        query.session(session);
    }

    const subscription = await query;

    if (!subscription) {
        return {
            hasEntitlement: false,
            canApply: false,
            status: "none",
            billingCycle: "none",
            isExpired: true,
            isSuspended: false,
            inGracePeriod: false,
            currentBalance: 0,
            reason: "An active Creator subscription is required to apply for campaigns.",
            subscription: null
        };
    }

    const now = new Date();
    const isSuspended = subscription.status === "suspended";
    let isExpired = false;
    let inGracePeriod = false;
    let hasEntitlement = false;
    let reason = "";

    const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
    isExpired = Boolean(periodEnd && now >= periodEnd);

    if (isSuspended) {
        hasEntitlement = false;
        reason = "Creator subscription is suspended by platform administration.";
    } else if (subscription.status === "expired") {
        hasEntitlement = false;
        reason = "Creator subscription has expired. Please renew your plan to apply for campaigns.";
    } else if (subscription.status === "active") {
        if (!isExpired) {
            hasEntitlement = true;
            reason = "Active Creator subscription entitlement.";
        } else {
            hasEntitlement = false;
            reason = "Creator subscription period has ended. Please renew your plan.";
        }
    } else if (subscription.status === "canceled") {
        if (periodEnd && now < periodEnd) {
            hasEntitlement = true;
            reason = "Subscription canceled at period end, access active until end of billing cycle.";
        } else {
            hasEntitlement = false;
            reason = "Creator subscription has been canceled and billing period has ended.";
        }
    } else if (subscription.status === "past_due") {
        const graceEnd = subscription.gracePeriodEnd ? new Date(subscription.gracePeriodEnd) : null;
        if (graceEnd && now <= graceEnd) {
            inGracePeriod = true;
            hasEntitlement = true;
            reason = `Subscription is past due, but active within grace period ending ${graceEnd.toISOString()}.`;
        } else {
            hasEntitlement = false;
            reason = "Subscription grace period has expired. Please resolve payment to regain access.";
        }
    } else {
        hasEntitlement = false;
        reason = `Creator subscription status is "${subscription.status}".`;
    }

    // Check available application credits only if entitled
    let currentBalance = 0;
    if (hasEntitlement) {
        const balanceQuery = CreatorCreditBalance.findOne({ creator: creatorId });
        if (session) {
            balanceQuery.session(session);
        }
        const creditBalanceDoc = await balanceQuery;
        currentBalance = creditBalanceDoc ? creditBalanceDoc.currentBalance : 0;
    }

    const canApply = hasEntitlement && currentBalance >= 1;

    if (hasEntitlement && currentBalance < 1) {
        reason = "Insufficient application credits. Please upgrade or renew your plan to apply for campaigns.";
    }

    return {
        hasEntitlement,
        canApply,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        isExpired,
        isSuspended,
        inGracePeriod,
        currentBalance,
        reason,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        gracePeriodEnd: subscription.gracePeriodEnd,
        planSnapshot: subscription.planSnapshot || null,
        subscription
    };
};

/**
 * Express middleware to enforce creator subscription entitlement on API routes.
 */
export const requireCreatorSubscription = (actionName = "apply for campaigns") => {
    return async (req, res, next) => {
        try {
            const creatorId = req.user?.userId || req.user?._id;
            if (!creatorId) {
                throw createApiError(401, "Authentication required");
            }

            const entitlement = await evaluateCreatorEntitlement(creatorId);
            if (!entitlement.hasEntitlement) {
                return res.status(403).json({
                    success: false,
                    message: `An active Creator subscription is required to ${actionName}. ${entitlement.reason}`,
                    upgradeRequired: true,
                    entitlement
                });
            }

            if (entitlement.currentBalance < 1) {
                return res.status(403).json({
                    success: false,
                    message: `Insufficient application credits to ${actionName}. Please upgrade or renew your plan to receive more credits.`,
                    upgradeRequired: true,
                    entitlement
                });
            }

            req.creatorEntitlement = entitlement;
            next();
        } catch (error) {
            next(error);
        }
    };
};

export default {
    GRACE_PERIOD_MS,
    evaluateBrandEntitlement,
    evaluateCreatorEntitlement,
    validateCampaignUpdateEntitlement,
    requireBrandSubscription,
    requireCreatorSubscription
};
