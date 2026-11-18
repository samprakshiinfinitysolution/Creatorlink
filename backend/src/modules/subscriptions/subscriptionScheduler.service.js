import { processSubscriptionExpirations } from "./expiry.service.js";
import { processCreatorMonthlyAllocationsService } from "./creatorCredit.service.js";

/**
 * Executes all periodic subscription background jobs:
 * 1. Expiration evaluation for Brand and Creator subscriptions (pauses Brand campaigns, zeroes expired Creator credits).
 * 2. Monthly credit allocations for active and eligible canceled yearly Creator subscriptions.
 * 
 * Production Scheduling:
 * - Safe for single or multi-instance execution (idempotency keys and atomic transactions prevent duplicate actions).
 * - Recommended cron interval: Run once every 24 hours at 00:05 UTC (`5 0 * * *`).
 * - Can be invoked via CLI (`node backend/src/scripts/runSubscriptionScheduler.js`), serverless cron trigger, or dedicated worker process.
 * 
 * @param {Object} [options={}]
 * @param {Date} [options.currentDate=new Date()] - Explicit date for deterministic testing / catch-up runs
 * @returns {Promise<{ timestamp: Date, expiry: Object, allocation: Object }>}
 */
export const runSubscriptionSchedulerJobs = async (options = {}) => {
    const now = options.currentDate instanceof Date ? options.currentDate : (options.currentDate ? new Date(options.currentDate) : new Date());
    console.log(`[Subscription Scheduler] Starting job execution at ${now.toISOString()}...`);

    // 1. Process Expirations (Brand & Creator)
    const expiryResult = await processSubscriptionExpirations(now);
    console.log(
        `[Subscription Scheduler] Expiry sweep completed: ${expiryResult.expiredCount} expired (${expiryResult.brandExpiredCount} brand, ${expiryResult.creatorExpiredCount} creator).`
    );

    // 2. Process Monthly Creator Allocations (Yearly drops & missed periods)
    const allocationResult = await processCreatorMonthlyAllocationsService(now);
    console.log(
        `[Subscription Scheduler] Monthly credit allocation completed: ${allocationResult.allocatedCount} allocations granted across ${allocationResult.processedSubscriptions} subscriptions.`
    );

    return {
        timestamp: now,
        expiry: expiryResult,
        allocation: allocationResult
    };
};

export default {
    runSubscriptionSchedulerJobs
};
