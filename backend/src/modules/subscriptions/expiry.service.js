import Subscription from "./subscription.model.js";
import Campaign from "../brand/campaigns/campaign.model.js";
import { createNotificationService } from "../notifications/notification.service.js";

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
 * Sweeps all active/trialing/past_due subscriptions in database and expires overdue accounts.
 * Safe to run as a recurring cron/background task.
 * 
 * @returns {Promise<{ processedCount: number, expiredCount: number, pausedCampaignsCount: number }>}
 */
export const processSubscriptionExpirations = async () => {
    const now = new Date();
    
    // Find active or trialing subscriptions that have passed their expiration timestamp
    const overdueSubscriptions = await Subscription.find({
        status: { $in: ["trialing", "active", "past_due"] },
        $or: [
            { billingCycle: "trial", trialEndDate: { $lte: now } },
            { billingCycle: { $ne: "trial" }, currentPeriodEnd: { $lte: now } }
        ]
    });

    let expiredCount = 0;
    let totalPausedCampaigns = 0;

    for (const sub of overdueSubscriptions) {
        const result = await syncBrandSubscriptionExpiry(sub.brand);
        if (result.isExpired) {
            expiredCount++;
            totalPausedCampaigns += result.pausedCampaignsCount;
        }
    }

    return {
        processedCount: overdueSubscriptions.length,
        expiredCount,
        pausedCampaignsCount: totalPausedCampaigns
    };
};

export default {
    syncBrandSubscriptionExpiry,
    processSubscriptionExpirations
};

