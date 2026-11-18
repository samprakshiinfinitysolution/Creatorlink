import Subscription from "./subscription.model.js";
import Campaign from "../brand/campaigns/campaign.model.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { expireCreatorSubscriptionCreditsService } from "./creatorCredit.service.js";

/**
 * Synchronizes subscription expiration and pauses eligible published campaigns for a specific Brand.
 * In accordance with CreatorLink business rules:
 * 1. Detects expired trial or paid subscription based on current server UTC timestamp.
 * 2. Sets subscription.status = "expired".
 * 3. Automatically pauses all published campaigns of the Brand to prevent new applications.
 * 4. Preserves in_progress campaigns, active bookings, workspaces, payments, and historical records.
 * 5. Dispatches an in-app notification to the Brand informing them of the expiry and campaign pause.
 * 
 * @param {string|ObjectId} brandId - Brand user ID
 * @returns {Promise<{ isExpired: boolean, pausedCampaignsCount: number }>}
 */
export const syncBrandSubscriptionExpiry = async (brandId) => {
    const subscription = await Subscription.findOne({ brand: brandId });
    if (!subscription) {
        return { isExpired: false, pausedCampaignsCount: 0 };
    }

    const now = new Date();
    const isTrial = subscription.billingCycle === "trial";
    let isExpired = false;

    if (isTrial) {
        isExpired = Boolean(subscription.trialEndDate && now >= subscription.trialEndDate);
    } else {
        const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
        if (subscription.status === "past_due") {
            const graceEnd = subscription.gracePeriodEnd ? new Date(subscription.gracePeriodEnd) : null;
            isExpired = Boolean(graceEnd && now > graceEnd);
        } else {
            isExpired = Boolean(periodEnd && now >= periodEnd);
        }
    }

    if (!isExpired) {
        return { isExpired: false, pausedCampaignsCount: 0 };
    }

    let pausedCampaignsCount = 0;

    // Transition subscription to 'expired' if currently in an active/trialing/past_due status
    if (["trialing", "active", "past_due"].includes(subscription.status)) {
        subscription.status = "expired";
        await subscription.save();

        // Pause published campaigns to prevent new creator applications
        const updateResult = await Campaign.updateMany(
            {
                brand: brandId,
                status: "published"
            },
            {
                $set: {
                    status: "paused"
                }
            }
        );
        pausedCampaignsCount = updateResult.modifiedCount || 0;

        // Dispatch notification to Brand
        try {
            await createNotificationService({
                recipient: brandId,
                sender: null,
                type: "subscription_expired",
                title: isTrial ? "Free Trial Expired" : "Subscription Expired",
                message: isTrial
                    ? `Your 5-day free trial has expired. ${pausedCampaignsCount > 0 ? `${pausedCampaignsCount} published campaign(s) have been paused from receiving new applications.` : "Upgrade to a plan to continue launching campaigns and unlocking creators."} Existing collaborations remain active.`
                    : `Your subscription billing cycle has expired. ${pausedCampaignsCount > 0 ? `${pausedCampaignsCount} published campaign(s) have been paused from receiving new applications.` : "Renew your plan to continue launching campaigns."} Existing collaborations remain active.`,
                entityType: "subscription",
                entityId: subscription._id,
                destination: "/brand/subscription",
                metadata: {
                    billingCycle: subscription.billingCycle,
                    pausedCampaignsCount
                },
                idempotencyKey: `sub_expired_${subscription._id}_${subscription.status}`
            });
        } catch (notifErr) {
            console.error("Failed to send subscription expiration notification:", notifErr);
        }
    }

    return {
        isExpired: true,
        pausedCampaignsCount
    };
};

/**
 * Synchronizes subscription expiration for a specific Creator.
 * 
 * Rules:
 * 1. Detects expired paid subscription based on current server UTC timestamp.
 * 2. Sets subscription.status = "expired".
 * 3. Atomically zeroes out unused credits via expireCreatorSubscriptionCreditsService.
 * 4. Dispatches an in-app notification to the Creator informing them of the expiry.
 * 
 * @param {string|ObjectId} creatorId - Creator user ID
 * @param {Date} [currentDate=new Date()]
 * @returns {Promise<{ isExpired: boolean, expiredCredits: number }>}
 */
export const syncCreatorSubscriptionExpiry = async (creatorId, currentDate = new Date()) => {
    const subscription = await Subscription.findOne({
        subscriber: creatorId,
        subscriberRole: "creator"
    });

    if (!subscription) {
        return { isExpired: false, expiredCredits: 0 };
    }

    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
    const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;

    let isExpired = false;
    if (subscription.status === "past_due") {
        const graceEnd = subscription.gracePeriodEnd ? new Date(subscription.gracePeriodEnd) : null;
        isExpired = Boolean(graceEnd && now > graceEnd);
    } else {
        isExpired = Boolean(periodEnd && now >= periodEnd);
    }

    if (!isExpired) {
        return { isExpired: false, expiredCredits: 0 };
    }

    let expiredCredits = 0;
    if (["trialing", "active", "past_due", "canceled"].includes(subscription.status)) {
        subscription.status = "expired";
        await subscription.save();

        const expireResult = await expireCreatorSubscriptionCreditsService({
            creatorId,
            subscriptionId: subscription._id
        });
        expiredCredits = expireResult.expiredCredits || 0;

        try {
            await createNotificationService({
                recipient: creatorId,
                sender: null,
                type: "subscription_expired",
                title: "Creator Subscription Expired",
                message: `Your ${subscription.planSnapshot?.name || "Creator"} subscription has expired. Any unused credits have expired. Renew your plan to continue applying to campaigns.`,
                entityType: "subscription",
                entityId: subscription._id,
                destination: "/creator/dashboard",
                metadata: {
                    billingCycle: subscription.billingCycle,
                    expiredCredits
                },
                idempotencyKey: `sub_expired_${subscription._id}_${subscription.status}`
            });
        } catch (notifErr) {
            console.error("Failed to send creator subscription expiration notification:", notifErr);
        }
    }

    return {
        isExpired: true,
        expiredCredits
    };
};

/**
 * Sweeps all active/trialing/past_due/canceled subscriptions in database and expires overdue accounts.
 * Safe to run as a recurring cron/background task.
 * 
 * @param {Date} [currentDate=new Date()]
 * @returns {Promise<{ processedCount: number, brandExpiredCount: number, creatorExpiredCount: number, expiredCount: number, pausedCampaignsCount: number, totalExpiredCredits: number }>}
 */
export const processSubscriptionExpirations = async (currentDate = new Date()) => {
    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
    
    // Find active, trialing, past_due, or canceled subscriptions that have passed their expiration timestamp
    const overdueSubscriptions = await Subscription.find({
        status: { $in: ["trialing", "active", "past_due", "canceled"] },
        $or: [
            { billingCycle: "trial", trialEndDate: { $lte: now } },
            { billingCycle: { $ne: "trial" }, currentPeriodEnd: { $lte: now } }
        ]
    });

    let brandExpiredCount = 0;
    let creatorExpiredCount = 0;
    let totalPausedCampaigns = 0;
    let totalExpiredCredits = 0;

    for (const sub of overdueSubscriptions) {
        if (sub.subscriberRole === "creator") {
            const result = await syncCreatorSubscriptionExpiry(sub.subscriber, now);
            if (result.isExpired) {
                creatorExpiredCount++;
                totalExpiredCredits += result.expiredCredits || 0;
            }
        } else {
            const brandId = sub.brand || sub.subscriber;
            const result = await syncBrandSubscriptionExpiry(brandId);
            if (result.isExpired) {
                brandExpiredCount++;
                totalPausedCampaigns += result.pausedCampaignsCount;
            }
        }
    }

    return {
        processedCount: overdueSubscriptions.length,
        brandExpiredCount,
        creatorExpiredCount,
        expiredCount: brandExpiredCount + creatorExpiredCount,
        pausedCampaignsCount: totalPausedCampaigns,
        totalExpiredCredits
    };
};

export default {
    syncBrandSubscriptionExpiry,
    syncCreatorSubscriptionExpiry,
    processSubscriptionExpirations
};

