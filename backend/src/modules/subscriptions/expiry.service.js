import mongoose from "mongoose";
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
export const syncBrandSubscriptionExpiry = async (brandId, currentDate = new Date()) => {
    const subscription = await Subscription.findOne({ brand: brandId });
    if (!subscription) {
        return { isExpired: false, pausedCampaignsCount: 0 };
    }

    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
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
 * 2. Revalidates document status and expiration timestamps inside the transactional session
 *    to protect against concurrent renewals/extensions.
 * 3. Status transition ('expired'), balance zeroing, and immutable audit ledger record
 *    are performed atomically inside a single MongoDB transaction.
 * 4. If credit expiration or ledger insertion fails, the entire transaction is aborted,
 *    leaving subscription status and credit balance untouched for subsequent scheduler retries.
 * 5. Dispatches an in-app notification to the Creator ONLY after successful transaction commit.
 * 
 * @param {string|ObjectId} creatorId - Creator user ID
 * @param {Date} [currentDate=new Date()]
 * @returns {Promise<{ isExpired: boolean, expiredCredits: number }>}
 */
export const syncCreatorSubscriptionExpiry = async (creatorId, currentDate = new Date()) => {
    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);

    // Initial preliminary check before transaction to avoid unnecessary sessions
    const subscription = await Subscription.findOne({
        subscriber: creatorId,
        subscriberRole: "creator"
    });

    if (!subscription) {
        return { isExpired: false, expiredCredits: 0 };
    }

    // If already marked expired, return idempotently
    if (subscription.status === "expired") {
        return { isExpired: true, expiredCredits: 0 };
    }

    if (!["trialing", "active", "past_due", "canceled"].includes(subscription.status)) {
        return { isExpired: false, expiredCredits: 0 };
    }

    const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
    let preliminaryExpired = false;

    if (subscription.billingCycle === "trial") {
        preliminaryExpired = Boolean(subscription.trialEndDate && now >= subscription.trialEndDate);
    } else if (subscription.status === "past_due") {
        const graceEnd = subscription.gracePeriodEnd ? new Date(subscription.gracePeriodEnd) : null;
        preliminaryExpired = Boolean(graceEnd && now > graceEnd);
    } else {
        preliminaryExpired = Boolean(periodEnd && now >= periodEnd);
    }

    if (!preliminaryExpired) {
        return { isExpired: false, expiredCredits: 0 };
    }

    let expiredCredits = 0;
    let notificationPayload = null;

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // 1. Fetch fresh document within the transactional session
        const currentSub = await Subscription.findById(subscription._id).session(session);
        if (!currentSub || currentSub.status === "expired") {
            await session.commitTransaction();
            return { isExpired: true, expiredCredits: 0 };
        }

        if (!["trialing", "active", "past_due", "canceled"].includes(currentSub.status)) {
            await session.commitTransaction();
            return { isExpired: false, expiredCredits: 0 };
        }

        // 2. CRITICAL: Re-evaluate fresh subscription expiry eligibility inside the transaction
        let stillExpired = false;
        if (currentSub.billingCycle === "trial") {
            stillExpired = Boolean(currentSub.trialEndDate && now >= currentSub.trialEndDate);
        } else if (currentSub.status === "past_due") {
            const freshGraceEnd = currentSub.gracePeriodEnd ? new Date(currentSub.gracePeriodEnd) : null;
            stillExpired = Boolean(freshGraceEnd && now > freshGraceEnd);
        } else {
            const freshPeriodEnd = currentSub.currentPeriodEnd ? new Date(currentSub.currentPeriodEnd) : null;
            stillExpired = Boolean(freshPeriodEnd && now >= freshPeriodEnd);
        }

        if (!stillExpired) {
            // Subscription was renewed or extended concurrently - abort expiry!
            await session.commitTransaction();
            return { isExpired: false, expiredCredits: 0 };
        }

        // 3. Expire remaining unused credits within the SAME transaction session
        const expireResult = await expireCreatorSubscriptionCreditsService({
            creatorId,
            subscriptionId: currentSub._id,
            session
        });
        expiredCredits = expireResult.expiredCredits || 0;

        // 4. Mark subscription status as 'expired'
        currentSub.status = "expired";
        await currentSub.save({ session });

        notificationPayload = {
            recipient: creatorId,
            sender: null,
            type: "subscription_expired",
            title: "Creator Subscription Expired",
            message: `Your ${currentSub.planSnapshot?.name || "Creator"} subscription has expired. Any unused credits have expired. Renew your plan to continue applying to campaigns.`,
            entityType: "subscription",
            entityId: currentSub._id,
            destination: "/creator/dashboard",
            metadata: {
                billingCycle: currentSub.billingCycle,
                expiredCredits
            },
            idempotencyKey: `sub_expired_${currentSub._id}_expired`
        };

        await session.commitTransaction();
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        throw err;
    } finally {
        await session.endSession();
    }

    // 5. Dispatch notification strictly OUTSIDE the transaction only after commit succeeds
    if (notificationPayload) {
        try {
            await createNotificationService(notificationPayload);
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
    
    // Find active, trialing, past_due, or canceled subscriptions that have passed their expiration timestamp:
    // 1. Trialing subscriptions past trialEndDate (now >= trialEndDate)
    // 2. Active or canceled standard subscriptions past currentPeriodEnd (now >= currentPeriodEnd)
    // 3. Past_due subscriptions past gracePeriodEnd (now > gracePeriodEnd, consistent with entitlement rules)
    const overdueSubscriptions = await Subscription.find({
        $or: [
            { status: "trialing", billingCycle: "trial", trialEndDate: { $lte: now } },
            { status: { $in: ["active", "canceled"] }, currentPeriodEnd: { $lte: now } },
            { status: "past_due", gracePeriodEnd: { $lt: now } }
        ]
    });

    let brandExpiredCount = 0;
    let creatorExpiredCount = 0;
    let totalPausedCampaigns = 0;
    let totalExpiredCredits = 0;

    for (const sub of overdueSubscriptions) {
        try {
            if (sub.subscriberRole === "creator") {
                const result = await syncCreatorSubscriptionExpiry(sub.subscriber, now);
                if (result.isExpired) {
                    creatorExpiredCount++;
                    totalExpiredCredits += result.expiredCredits || 0;
                }
            } else {
                const brandId = sub.brand || sub.subscriber;
                const result = await syncBrandSubscriptionExpiry(brandId, now);
                if (result.isExpired) {
                    brandExpiredCount++;
                    totalPausedCampaigns += result.pausedCampaignsCount;
                }
            }
        } catch (err) {
            console.error(`Failed to process expiry for subscription ${sub._id}:`, err);
            // Preserved for subsequent scheduler retry runs
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

