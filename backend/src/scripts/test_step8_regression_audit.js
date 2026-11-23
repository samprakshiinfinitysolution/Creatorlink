import mongoose from "mongoose";
import { evaluateCreatorEntitlement } from "../modules/subscriptions/entitlement.service.js";
import { deductCreatorApplicationCreditService } from "../modules/subscriptions/creatorCredit.service.js";
import { createBookingService } from "../modules/booking/booking.service.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import CreatorCreditBalance from "../modules/subscriptions/creatorCreditBalance.model.js";
import CreditTransaction from "../modules/subscriptions/creditTransaction.model.js";
import Booking from "../modules/booking/booking.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import CreatorService from "../modules/creator/services/services.model.js";

async function runStep8Audit() {
    console.log("===============================================================================");
    console.log("         STEP 8 CREATOR APPLICATION CODE AUDIT & REGRESSION SUITE              ");
    console.log("===============================================================================\n");

    let passedTests = 0;
    let failedTests = 0;

    const assert = (condition, description) => {
        if (condition) {
            console.log(`[PASS] ${description}`);
            passedTests++;
        } else {
            console.error(`[FAIL] ${description}`);
            failedTests++;
        }
    };

    const creatorId = new mongoose.Types.ObjectId();
    const brandId = new mongoose.Types.ObjectId();
    const campaignId = new mongoose.Types.ObjectId();
    const serviceId = new mongoose.Types.ObjectId();
    const bookingId = new mongoose.Types.ObjectId();

    // -------------------------------------------------------------------------
    // TEST 1: evaluateCreatorEntitlement for Free Creator (0 credits, cannot apply)
    // -------------------------------------------------------------------------
    const originalSubFindOne = Subscription.findOne;
    Subscription.findOne = () => ({
        populate: () => ({
            session: () => Promise.resolve(null),
            then: (resolve) => Promise.resolve(null).then(resolve)
        })
    });

    const freeEntitlement = await evaluateCreatorEntitlement(creatorId);
    assert(
        freeEntitlement.hasEntitlement === false &&
        freeEntitlement.canApply === false &&
        freeEntitlement.currentBalance === 0,
        "Rule 1 & 2: Free Creator has no subscription, cannot apply, and has 0 credits"
    );

    // -------------------------------------------------------------------------
    // TEST 2: evaluateCreatorEntitlement for Active Paid Creator with >= 1 credit
    // -------------------------------------------------------------------------
    Subscription.findOne = () => ({
        populate: () => ({
            session: () => Promise.resolve({
                subscriber: creatorId,
                subscriberRole: "creator",
                status: "active",
                currentPeriodEnd: new Date(Date.now() + 1000000)
            }),
            then: (resolve) => Promise.resolve({
                subscriber: creatorId,
                subscriberRole: "creator",
                status: "active",
                currentPeriodEnd: new Date(Date.now() + 1000000)
            }).then(resolve)
        })
    });

    const origBalanceFindOne = CreatorCreditBalance.findOne;
    CreatorCreditBalance.findOne = () => ({
        session: () => Promise.resolve({ creator: creatorId, currentBalance: 5 }),
        then: (resolve) => Promise.resolve({ creator: creatorId, currentBalance: 5 }).then(resolve)
    });

    const activeEntitlement = await evaluateCreatorEntitlement(creatorId);
    assert(
        activeEntitlement.hasEntitlement === true &&
        activeEntitlement.canApply === true &&
        activeEntitlement.currentBalance === 5,
        "Rule 3: Active Paid Creator with valid credit balance has canApply = true"
    );

    // -------------------------------------------------------------------------
    // TEST 3: evaluateCreatorEntitlement for Active Creator with 0 credits
    // -------------------------------------------------------------------------
    CreatorCreditBalance.findOne = () => ({
        session: () => Promise.resolve({ creator: creatorId, currentBalance: 0 }),
        then: (resolve) => Promise.resolve({ creator: creatorId, currentBalance: 0 }).then(resolve)
    });

    const zeroBalanceEntitlement = await evaluateCreatorEntitlement(creatorId);
    assert(
        zeroBalanceEntitlement.hasEntitlement === true &&
        zeroBalanceEntitlement.canApply === false &&
        zeroBalanceEntitlement.currentBalance === 0,
        "Rule 4: Active Creator with 0 credits is entitled to plan but canApply = false"
    );

    // -------------------------------------------------------------------------
    // TEST 4: Atomic conditional credit deduction consumes exactly 1 credit
    // -------------------------------------------------------------------------
    const origFindOneAndUpdate = CreatorCreditBalance.findOneAndUpdate;
    const origCreditTxCreate = CreditTransaction.create;
    const origTxFindOne = CreditTransaction.findOne;

    CreditTransaction.findOne = () => ({
        session: () => Promise.resolve(null)
    });

    let deductionQueryCaptured = null;
    let deductionUpdateCaptured = null;
    CreatorCreditBalance.findOneAndUpdate = (query, update) => {
        deductionQueryCaptured = query;
        deductionUpdateCaptured = update;
        return Promise.resolve({
            creator: creatorId,
            currentBalance: 4,
            lifetimeConsumed: 1
        });
    };

    let ledgerDocCaptured = null;
    CreditTransaction.create = (docs) => {
        ledgerDocCaptured = docs[0];
        return Promise.resolve([{ _id: new mongoose.Types.ObjectId(), ...docs[0] }]);
    };

    const mockSession = { id: "mock_session_123" };
    await deductCreatorApplicationCreditService({
        creatorId,
        bookingId,
        campaignId,
        campaignTitle: "Summer Fashion Campaign",
        session: mockSession
    });

    assert(
        deductionQueryCaptured.creator.toString() === creatorId.toString() &&
        deductionQueryCaptured.currentBalance.$gte === 1,
        "Rule 5: Credit deduction strictly queries { currentBalance: { $gte: 1 } } for atomic concurrency protection"
    );

    assert(
        deductionUpdateCaptured.$inc.currentBalance === -1 &&
        deductionUpdateCaptured.$inc.lifetimeConsumed === 1,
        "Rule 6: Exactly 1 credit is decremented and 1 lifetime credit is marked consumed"
    );

    assert(
        ledgerDocCaptured &&
        ledgerDocCaptured.type === "application_deduction" &&
        ledgerDocCaptured.amount === -1 &&
        ledgerDocCaptured.referenceType === "booking" &&
        ledgerDocCaptured.idempotencyKey === `sub_deduct_booking_${bookingId.toString()}`,
        "Rule 7: Immutable audit ledger transaction is created with matching idempotency key and reference"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Insufficient credits prevents deduction and throws 403
    // -------------------------------------------------------------------------
    CreatorCreditBalance.findOneAndUpdate = () => Promise.resolve(null);
    let errorCaught = null;
    try {
        await deductCreatorApplicationCreditService({
            creatorId,
            bookingId: new mongoose.Types.ObjectId(),
            campaignId,
            session: mockSession
        });
    } catch (err) {
        errorCaught = err;
    }
    assert(
        errorCaught && errorCaught.statusCode === 403,
        "Rule 8: Insufficient credits throws 403 error preventing booking creation"
    );

    // -------------------------------------------------------------------------
    // TEST 6: Session requirement enforced
    // -------------------------------------------------------------------------
    let noSessionError = null;
    try {
        await deductCreatorApplicationCreditService({
            creatorId,
            bookingId,
            campaignId,
            session: null
        });
    } catch (err) {
        noSessionError = err;
    }
    assert(
        noSessionError && noSessionError.statusCode === 500,
        "Rule 9: Non-transactional execution is prohibited (session is mandatory)"
    );

    // -------------------------------------------------------------------------
    // TEST 7: Booking compound unique index declaration check
    // -------------------------------------------------------------------------
    const bookingIndexes = Booking.schema.indexes();
    const hasCompoundUniqueIndex = bookingIndexes.some(([idx, opts]) => {
        return idx.campaign === 1 && idx.creator === 1 && opts && opts.unique === true;
    });
    assert(
        hasCompoundUniqueIndex,
        "Rule 10: Compound unique index { campaign: 1, creator: 1 } declared on Booking schema"
    );

    // -------------------------------------------------------------------------
    // TEST 8: Actual createBookingService() blocks Free Creator at transactional entry
    // -------------------------------------------------------------------------
    const origStartSession = mongoose.startSession;
    mongoose.startSession = async () => ({
        withTransaction: async (fn) => await fn(),
        endSession: async () => {}
    });

    Subscription.findOne = () => ({
        populate: () => ({
            session: () => Promise.resolve(null),
            then: (resolve) => Promise.resolve(null).then(resolve)
        })
    });

    let serviceFreeError = null;
    try {
        await createBookingService(creatorId, {
            campaignId,
            serviceId,
            proposedPrice: 1000
        });
    } catch (err) {
        serviceFreeError = err;
    }
    assert(
        serviceFreeError && serviceFreeError.statusCode === 403,
        "Rule 11: createBookingService() directly blocks Free Creator with HTTP 403 inside transaction"
    );

    // -------------------------------------------------------------------------
    // TEST 9: Actual createBookingService() blocks Creator with 0 credits
    // -------------------------------------------------------------------------
    Subscription.findOne = () => ({
        populate: () => ({
            session: () => Promise.resolve({
                subscriber: creatorId,
                subscriberRole: "creator",
                status: "active",
                currentPeriodEnd: new Date(Date.now() + 1000000)
            }),
            then: (resolve) => Promise.resolve({
                subscriber: creatorId,
                subscriberRole: "creator",
                status: "active",
                currentPeriodEnd: new Date(Date.now() + 1000000)
            }).then(resolve)
        })
    });
    CreatorCreditBalance.findOne = () => ({
        session: () => Promise.resolve({ creator: creatorId, currentBalance: 0 }),
        then: (resolve) => Promise.resolve({ creator: creatorId, currentBalance: 0 }).then(resolve)
    });

    let serviceZeroCreditError = null;
    try {
        await createBookingService(creatorId, {
            campaignId,
            serviceId,
            proposedPrice: 1000
        });
    } catch (err) {
        serviceZeroCreditError = err;
    }
    assert(
        serviceZeroCreditError && serviceZeroCreditError.statusCode === 403 &&
        serviceZeroCreditError.message.includes("Insufficient application credits"),
        "Rule 12: createBookingService() directly blocks Creator with 0 credits with HTTP 403"
    );

    // -------------------------------------------------------------------------
    // TEST 10: Actual createBookingService() handles code 11000 duplicate error
    // -------------------------------------------------------------------------
    CreatorCreditBalance.findOne = () => ({
        session: () => Promise.resolve({ creator: creatorId, currentBalance: 5 }),
        then: (resolve) => Promise.resolve({ creator: creatorId, currentBalance: 5 }).then(resolve)
    });

    const origCreatorServiceFindOne = CreatorService.findOne;
    CreatorService.findOne = () => ({
        session: () => Promise.resolve({
            _id: serviceId,
            creator: creatorId,
            price: 5000,
            currency: "INR",
            revisions: 1,
            isActive: true
        })
    });

    const origCampaignFindOneAndUpdate = Campaign.findOneAndUpdate;
    Campaign.findOneAndUpdate = () => Promise.resolve({
        _id: campaignId,
        brand: brandId,
        title: "Test Campaign",
        deliverables: ["1 Video"],
        deadline: new Date(Date.now() + 864000000),
        status: "published"
    });

    const origBookingFindOne = Booking.findOne;
    Booking.findOne = () => ({
        session: () => Promise.resolve(null)
    });

    const origBookingCreate = Booking.create;
    // Simulate code 11000 duplicate key error from MongoDB
    Booking.create = () => {
        const err = new Error("E11000 duplicate key error collection: bookings index: campaign_1_creator_1 dup key");
        err.code = 11000;
        err.keyPattern = { campaign: 1, creator: 1 };
        return Promise.reject(err);
    };

    let serviceDuplicateError = null;
    try {
        await createBookingService(creatorId, {
            campaignId,
            serviceId,
            proposedPrice: 5000
        });
    } catch (err) {
        serviceDuplicateError = err;
    }
    assert(
        serviceDuplicateError && serviceDuplicateError.statusCode === 400 &&
        serviceDuplicateError.message === "You have already applied to this campaign",
        "Rule 13: createBookingService() catches MongoDB code 11000 and returns clean HTTP 400 duplicate message"
    );

    // Restore original methods
    Subscription.findOne = originalSubFindOne;
    CreatorCreditBalance.findOne = origBalanceFindOne;
    CreatorCreditBalance.findOneAndUpdate = origFindOneAndUpdate;
    CreditTransaction.create = origCreditTxCreate;
    CreditTransaction.findOne = origTxFindOne;
    CreatorService.findOne = origCreatorServiceFindOne;
    Campaign.findOneAndUpdate = origCampaignFindOneAndUpdate;
    Booking.findOne = origBookingFindOne;
    Booking.create = origBookingCreate;
    mongoose.startSession = origStartSession;

    console.log("\n===============================================================================");
    console.log(`Results: ${passedTests} passed, ${failedTests} failed.`);
    console.log("===============================================================================");

    process.exit(failedTests > 0 ? 1 : 0);
}

runStep8Audit().catch((err) => {
    console.error("Audit script failed with unhandled exception:", err);
    process.exit(1);
});
