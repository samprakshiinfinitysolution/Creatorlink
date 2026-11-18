import mongoose from "mongoose";
import CreatorCreditBalance from "./creatorCreditBalance.model.js";
import CreditTransaction from "./creditTransaction.model.js";
import Subscription from "./subscription.model.js";
import createApiError from "../../utils/ApiError.js";

/**
 * Grants initial subscription application credits to a Creator.
 * 
 * Rules:
 * 1. Strictly grants only the configured monthly credits (never multiplied by 12 for yearly plans).
 * 2. Idempotent: Uses deterministic key `sub_grant_${paymentId}` to prevent duplicate grants.
 * 3. Atomic: Executes balance update and transaction ledger entry within a MongoDB transaction.
 * 4. Fails safely if MongoDB transaction support is unavailable (no dirty partial writes).
 * 
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.creatorId - Auth ID of the Creator
 * @param {string|mongoose.Types.ObjectId} params.subscriptionId - Subscription ID
 * @param {string|mongoose.Types.ObjectId} params.paymentId - SubscriptionPayment ID
 * @param {number} [params.credits] - Monthly application credits to grant
 * @param {number} [params.monthlyCredits] - Alternative param name for credits
 * @param {string} [params.reason] - Optional description for ledger entry
 * @param {mongoose.ClientSession} [params.session] - Optional parent transaction session
 * @returns {Promise<{ isSuccess: boolean, alreadyProcessed: boolean, transaction: Object, creditBalance: Object }>}
 */
export const grantCreatorSubscriptionCreditsService = async ({
    creatorId,
    subscriptionId,
    paymentId,
    credits,
    monthlyCredits,
    reason,
    session: externalSession = null
}) => {
    // 1. Parameter Validation
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
        throw createApiError(400, "Valid creator ID is required to grant subscription credits");
    }
    if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
        throw createApiError(400, "Valid subscription ID is required to grant subscription credits");
    }
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
        throw createApiError(400, "Valid payment ID is required to grant subscription credits");
    }

    const rawCredits = credits !== undefined ? credits : monthlyCredits;
    const creditsToGrant = Number(rawCredits);
    if (!Number.isInteger(creditsToGrant) || creditsToGrant <= 0) {
        throw createApiError(400, "Monthly credits to grant must be a positive integer");
    }

    const idempotencyKey = `sub_grant_${paymentId.toString()}`;

    // Helper to perform the atomic grant within an active session
    const executeGrant = async (activeSession) => {
        // Fast-path idempotency check within session
        const existingTx = await CreditTransaction.findOne({ idempotencyKey }).session(activeSession);
        if (existingTx) {
            const currentBalance = await CreatorCreditBalance.findOne({ creator: creatorId }).session(activeSession);
            return {
                isSuccess: true,
                alreadyProcessed: true,
                transaction: existingTx,
                creditBalance: currentBalance
            };
        }

        // 1. Atomically update or initialize CreatorCreditBalance
        const updatedBalance = await CreatorCreditBalance.findOneAndUpdate(
            { creator: creatorId },
            {
                $inc: {
                    currentBalance: creditsToGrant,
                    lifetimeIssued: creditsToGrant
                },
                $set: {
                    lastAllocatedAt: new Date()
                }
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
                session: activeSession
            }
        );

        // 2. Insert immutable audit ledger record
        const [transaction] = await CreditTransaction.create(
            [
                {
                    creator: creatorId,
                    type: "subscription_grant",
                    amount: creditsToGrant,
                    balanceAfter: updatedBalance.currentBalance,
                    referenceType: "subscription",
                    referenceId: subscriptionId,
                    reason: reason || `Initial subscription credit grant (${creditsToGrant} credits)`,
                    idempotencyKey
                }
            ],
            { session: activeSession }
        );

        return {
            isSuccess: true,
            alreadyProcessed: false,
            transaction,
            creditBalance: updatedBalance
        };
    };

    // If caller provided an active session, execute within caller's transaction.
    // Ownership note: The caller owns this transaction lifecycle.
    // If an error occurs (including duplicate key code 11000), do NOT query the errored session;
    // propagate the error so the parent caller can abort its transaction cleanly.
    if (externalSession) {
        return await executeGrant(externalSession);
    }

    // Otherwise, manage our own isolated MongoDB transaction
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const result = await executeGrant(session);
        await session.commitTransaction();
        return result;
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        const isDuplicateKey = err.code === 11000 && (err.keyPattern?.idempotencyKey || err.message?.includes("idempotencyKey"));

        // If duplicate idempotency key collision occurred, query fresh state outside the aborted session
        // and return alreadyProcessed ONLY when the matching ledger entry actually exists.
        if (isDuplicateKey) {
            const existingTx = await CreditTransaction.findOne({ idempotencyKey });
            if (existingTx) {
                const currentBalance = await CreatorCreditBalance.findOne({ creator: creatorId });
                return {
                    isSuccess: true,
                    alreadyProcessed: true,
                    transaction: existingTx,
                    creditBalance: currentBalance
                };
            }
        }

        // Fail safely if MongoDB standalone environment cannot run transactions
        if (
            err.message &&
            (err.message.includes("Transaction numbers are only allowed") ||
                err.message.includes("replica set") ||
                err.message.includes("standalone"))
        ) {
            throw createApiError(
                500,
                "MongoDB transactions are required for financial credit balance and ledger operations. Please ensure MongoDB is running as a replica set."
            );
        }

        throw err;
    } finally {
        await session.endSession();
    }
};

/**
 * Allocates a subsequent monthly credit drop for an active Creator subscription.
 * Used for yearly subscriptions (Month 2 to Month 12) or multi-month renewal periods.
 * 
 * Rules:
 * 1. Strictly append-only in CreditTransaction ledger.
 * 2. Deterministic idempotency key: `sub_monthly_${subscriptionId}_m${monthIndex}_${dueDateStr}`.
 * 3. Atomic MongoDB transaction: balance update, ledger insertion, and subscription quotaState update.
 * 4. Fails safely without partial writes if transaction fails.
 * 
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.creatorId
 * @param {string|mongoose.Types.ObjectId} params.subscriptionId
 * @param {number} params.monthIndex - 2 to 12
 * @param {Date} params.dueDate - Billing period due date
 * @param {number} params.credits - Monthly credits to allocate
 * @param {string} [params.reason]
 * @param {mongoose.ClientSession} [params.session]
 * @returns {Promise<{ isSuccess: boolean, alreadyAllocated: boolean, transaction: Object, creditBalance: Object }>}
 */
export const allocateCreatorMonthlyCreditsService = async ({
    creatorId,
    subscriptionId,
    monthIndex,
    dueDate,
    credits,
    reason,
    session: externalSession = null
}) => {
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
        throw createApiError(400, "Valid creator ID is required for monthly credit allocation");
    }
    if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
        throw createApiError(400, "Valid subscription ID is required for monthly credit allocation");
    }
    const creditsToGrant = Number(credits);
    if (!Number.isInteger(creditsToGrant) || creditsToGrant <= 0) {
        throw createApiError(400, "Monthly credits to allocate must be a positive integer");
    }
    if (!monthIndex || monthIndex < 2) {
        throw createApiError(400, "Month index must be >= 2 for subsequent monthly allocations");
    }
    const validDueDate = dueDate instanceof Date ? dueDate : new Date(dueDate);
    if (isNaN(validDueDate.getTime())) {
        throw createApiError(400, "Valid due date is required for monthly credit allocation");
    }

    const dateKey = validDueDate.toISOString().slice(0, 10);
    const idempotencyKey = `sub_monthly_${subscriptionId.toString()}_m${monthIndex}_${dateKey}`;

    const executeAllocation = async (activeSession) => {
        // Fast-path idempotency check within session
        const existingTx = await CreditTransaction.findOne({ idempotencyKey }).session(activeSession);
        if (existingTx) {
            const currentBalance = await CreatorCreditBalance.findOne({ creator: creatorId }).session(activeSession);
            return {
                isSuccess: true,
                alreadyAllocated: true,
                transaction: existingTx,
                creditBalance: currentBalance
            };
        }

        // 1. Atomically update CreatorCreditBalance
        const updatedBalance = await CreatorCreditBalance.findOneAndUpdate(
            { creator: creatorId },
            {
                $inc: {
                    currentBalance: creditsToGrant,
                    lifetimeIssued: creditsToGrant
                },
                $set: {
                    lastAllocatedAt: new Date()
                }
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
                session: activeSession
            }
        );

        // 2. Insert immutable audit ledger record
        const [transaction] = await CreditTransaction.create(
            [
                {
                    creator: creatorId,
                    type: "monthly_renewal_grant",
                    amount: creditsToGrant,
                    balanceAfter: updatedBalance.currentBalance,
                    referenceType: "subscription",
                    referenceId: subscriptionId,
                    reason: reason || `Monthly subscription credit allocation (Month ${monthIndex})`,
                    idempotencyKey
                }
            ],
            { session: activeSession }
        );

        // 3. Update subscription quotaState
        await Subscription.findByIdAndUpdate(
            subscriptionId,
            {
                $set: {
                    "quotaState.monthlyCreditsAllocated": creditsToGrant,
                    "quotaState.creditsUsed": 0
                }
            },
            { session: activeSession }
        );

        return {
            isSuccess: true,
            alreadyAllocated: false,
            transaction,
            creditBalance: updatedBalance
        };
    };

    if (externalSession) {
        return await executeAllocation(externalSession);
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const result = await executeAllocation(session);
        await session.commitTransaction();
        return result;
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        const isDuplicateKey = err.code === 11000 && (err.keyPattern?.idempotencyKey || err.message?.includes("idempotencyKey"));
        if (isDuplicateKey) {
            const existingTx = await CreditTransaction.findOne({ idempotencyKey });
            if (existingTx) {
                const currentBalance = await CreatorCreditBalance.findOne({ creator: creatorId });
                return {
                    isSuccess: true,
                    alreadyAllocated: true,
                    transaction: existingTx,
                    creditBalance: currentBalance
                };
            }
        }

        if (
            err.message &&
            (err.message.includes("Transaction numbers are only allowed") ||
                err.message.includes("replica set") ||
                err.message.includes("standalone"))
        ) {
            throw createApiError(
                500,
                "MongoDB transactions are required for financial credit balance and ledger operations. Please ensure MongoDB is running as a replica set."
            );
        }

        throw err;
    } finally {
        await session.endSession();
    }
};

/**
 * Expires remaining unused application credits when a Creator's subscription reaches end of period.
 * 
 * Rules:
 * 1. Idempotent: Keyed by `sub_expire_${subscriptionId}`.
 * 2. If currentBalance <= 0, no deductions are applied.
 * 3. Zeros out currentBalance, increments lifetimeExpired, inserts immutable audit ledger entry.
 * 4. Atomic MongoDB transaction.
 * 
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.creatorId
 * @param {string|mongoose.Types.ObjectId} params.subscriptionId
 * @param {mongoose.ClientSession} [params.session]
 * @returns {Promise<{ isSuccess: boolean, alreadyExpired: boolean, expiredCredits: number, transaction: Object }>}
 */
export const expireCreatorSubscriptionCreditsService = async ({
    creatorId,
    subscriptionId,
    session: externalSession = null
}) => {
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
        throw createApiError(400, "Valid creator ID is required to expire subscription credits");
    }
    if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
        throw createApiError(400, "Valid subscription ID is required to expire subscription credits");
    }

    const idempotencyKey = `sub_expire_${subscriptionId.toString()}`;

    const executeExpiry = async (activeSession) => {
        // Fast-path idempotency check
        const existingTx = await CreditTransaction.findOne({ idempotencyKey }).session(activeSession);
        if (existingTx) {
            return {
                isSuccess: true,
                alreadyExpired: true,
                expiredCredits: Math.abs(existingTx.amount),
                transaction: existingTx
            };
        }

        const currentBalanceDoc = await CreatorCreditBalance.findOne({ creator: creatorId }).session(activeSession);
        const unconsumedCredits = currentBalanceDoc ? currentBalanceDoc.currentBalance : 0;

        if (unconsumedCredits <= 0) {
            return {
                isSuccess: true,
                alreadyExpired: false,
                expiredCredits: 0,
                transaction: null
            };
        }

        // 1. Zero out balance and record lifetimeExpired
        const updatedBalance = await CreatorCreditBalance.findOneAndUpdate(
            { creator: creatorId },
            {
                $set: { currentBalance: 0 },
                $inc: { lifetimeExpired: unconsumedCredits }
            },
            { new: true, session: activeSession }
        );

        // 2. Insert audit ledger record with type 'subscription_expired'
        const [transaction] = await CreditTransaction.create(
            [
                {
                    creator: creatorId,
                    type: "subscription_expired",
                    amount: -unconsumedCredits,
                    balanceAfter: 0,
                    referenceType: "subscription",
                    referenceId: subscriptionId,
                    reason: `Unused credits expired upon subscription expiration (${unconsumedCredits} credits)`,
                    idempotencyKey
                }
            ],
            { session: activeSession }
        );

        return {
            isSuccess: true,
            alreadyExpired: false,
            expiredCredits: unconsumedCredits,
            transaction,
            creditBalance: updatedBalance
        };
    };

    if (externalSession) {
        return await executeExpiry(externalSession);
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const result = await executeExpiry(session);
        await session.commitTransaction();
        return result;
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        const isDuplicateKey = err.code === 11000 && (err.keyPattern?.idempotencyKey || err.message?.includes("idempotencyKey"));
        if (isDuplicateKey) {
            const existingTx = await CreditTransaction.findOne({ idempotencyKey });
            if (existingTx) {
                return {
                    isSuccess: true,
                    alreadyExpired: true,
                    expiredCredits: Math.abs(existingTx.amount),
                    transaction: existingTx
                };
            }
        }

        if (
            err.message &&
            (err.message.includes("Transaction numbers are only allowed") ||
                err.message.includes("replica set") ||
                err.message.includes("standalone"))
        ) {
            throw createApiError(
                500,
                "MongoDB transactions are required for financial credit balance and ledger operations. Please ensure MongoDB is running as a replica set."
            );
        }

        throw err;
    } finally {
        await session.endSession();
    }
};

/**
 * Evaluates active and canceled Creator subscriptions and grants eligible monthly credit allocations.
 * Catches up safely on missed scheduler intervals.
 * 
 * @param {Date} [currentDate=new Date()]
 * @returns {Promise<{ processedSubscriptions: number, allocatedCount: number, errors: Array }>}
 */
export const processCreatorMonthlyAllocationsService = async (currentDate = new Date()) => {
    const now = currentDate instanceof Date ? currentDate : new Date(currentDate);

    // Eligible: Creator subscriptions that are active or canceled (with currentPeriodEnd > now)
    const eligibleSubscriptions = await Subscription.find({
        subscriberRole: "creator",
        status: { $in: ["active", "canceled"] },
        currentPeriodEnd: { $gt: now }
    }).populate("plan");

    let processedCount = 0;
    let allocatedCount = 0;
    const errors = [];

    for (const sub of eligibleSubscriptions) {
        processedCount++;
        try {
            // Suspended or past_due subscriptions are ineligible
            if (sub.status === "suspended" || sub.status === "past_due") {
                continue;
            }

            // Only yearly subscriptions need multi-month scheduled allocations
            if (sub.billingCycle !== "yearly") {
                continue;
            }

            const planCredits = sub.planSnapshot?.monthlyApplicationCredits || sub.plan?.monthlyApplicationCredits || 0;
            if (!planCredits || planCredits <= 0) {
                continue;
            }

            const start = new Date(sub.currentPeriodStart);
            const end = new Date(sub.currentPeriodEnd);

            // Month 1 was granted on activation.
            // Check months 2 through 12:
            for (let m = 2; m <= 12; m++) {
                const dueDate = new Date(start.getTime() + (m - 1) * 30 * 24 * 60 * 60 * 1000);

                // Do not allocate beyond subscription currentPeriodEnd
                if (dueDate >= end) {
                    break;
                }

                // If dueDate is in the past or now, it is eligible
                if (dueDate <= now) {
                    const allocResult = await allocateCreatorMonthlyCreditsService({
                        creatorId: sub.subscriber,
                        subscriptionId: sub._id,
                        monthIndex: m,
                        dueDate,
                        credits: planCredits,
                        reason: `Yearly subscription monthly credit allocation: Month ${m} (${sub.planSnapshot?.name || "Creator Plan"})`
                    });

                    if (allocResult.isSuccess && !allocResult.alreadyAllocated) {
                        allocatedCount++;
                    }
                }
            }
        } catch (err) {
            console.error(`Error processing monthly allocations for subscription ${sub._id}:`, err);
            errors.push({ subscriptionId: sub._id, error: err.message });
        }
    }

    return {
        processedSubscriptions: processedCount,
        allocatedCount,
        errors
    };
};

export default {
    grantCreatorSubscriptionCreditsService,
    allocateCreatorMonthlyCreditsService,
    expireCreatorSubscriptionCreditsService,
    processCreatorMonthlyAllocationsService
};
