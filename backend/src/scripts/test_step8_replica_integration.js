import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
import Booking from "../modules/booking/booking.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import CreatorService from "../modules/creator/services/services.model.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import CreatorCreditBalance from "../modules/subscriptions/creatorCreditBalance.model.js";
import CreditTransaction from "../modules/subscriptions/creditTransaction.model.js";
import { deductCreatorApplicationCreditService } from "../modules/subscriptions/creatorCredit.service.js";
import { createBookingService } from "../modules/booking/booking.service.js";

dotenv.config();

/**
 * Isolated Real MongoDB Transaction Integration Test for Step 8.
 * 
 * Strict Environment Safeguards:
 * 1. Prefers TEST_MONGO_URI.
 * 2. Rejects any connection where database name does not contain 'test' or 'isolated'.
 * 3. Never touches production data.
 * 4. Cleans up ONLY the specific IDs created by this test run.
 */
async function runRealReplicaTransactionIntegration() {
    console.log("===============================================================================");
    console.log("       STEP 8 REAL MONGODB REPLICA SET TRANSACTION INTEGRATION TEST            ");
    console.log("===============================================================================\n");

    const targetUri = process.env.TEST_MONGO_URI || process.env.MONGO_URI;

    if (!targetUri) {
        console.error("[ERROR] No MongoDB URI specified in environment (TEST_MONGO_URI or MONGO_URI).");
        process.exit(1);
    }

    try {
        dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    } catch {
        // Fallback silently if custom DNS cannot be set
    }

    await mongoose.connect(targetUri);

    const connectedDbName = mongoose.connection.name || mongoose.connection.db?.databaseName;
    const connectedHost = mongoose.connection.host;

    console.log(`[TARGET DATABASE] Name: "${connectedDbName}"`);
    console.log(`[TARGET HOST]     Host: "${connectedHost}"`);

    // Strict Safeguard: Prevent accidental execution against production databases
    const isIsolatedTestDb = connectedDbName && (
        connectedDbName.toLowerCase().includes("test") ||
        connectedDbName.toLowerCase().includes("isolated")
    );

    if (!isIsolatedTestDb) {
        console.error(`\n[SAFEGUARD REJECTION] Connected database "${connectedDbName}" is NOT an isolated test database!`);
        console.error("Integration tests create, abort, and rollback real MongoDB transactions.");
        console.error("To protect live environments, this script requires TEST_MONGO_URI pointing to a test database (e.g. 'creatorlink_test').");
        await mongoose.disconnect();
        process.exit(1);
    }

    // Verify replica set or sharded cluster capability for multi-document transactions
    try {
        const adminDb = mongoose.connection.db.admin();
        const hello = await adminDb.command({ hello: 1 });
        const isReplicaSet = Boolean(hello.setName);
        const isShardedCluster = hello.msg === "isdbgrid";
        const supportsTransactions = isReplicaSet || isShardedCluster;

        console.log(`[TOPOLOGY CHECK] ReplicaSet: ${isReplicaSet} (setName: "${hello.setName || 'none'}"), ShardedCluster: ${isShardedCluster}`);

        if (!supportsTransactions) {
            console.error("\n[TOPOLOGY REJECTION] Multi-document transactions require a MongoDB replica set or sharded cluster.");
            console.error("Detected standalone MongoDB instance without a replica set (setName is missing).");
            console.error("Integration tests cannot run against standalone instances. Aborting immediately.\n");
            await mongoose.disconnect();
            process.exit(1);
        }
    } catch (err) {
        console.error(`\n[TOPOLOGY CHECK ERROR] Failed to inspect MongoDB topology: ${err.message}`);
        await mongoose.disconnect();
        process.exit(1);
    }

    // ID Trackers to ensure strictly isolated cleanup
    const trackedCreatorIds = [];
    const trackedBookingIds = [];
    const trackedCampaignIds = [];
    const trackedTxIds = [];

    const createId = () => new mongoose.Types.ObjectId();

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

    try {
        // ---------------------------------------------------------------------
        // TEST 1: Real unique index verification in test database
        // ---------------------------------------------------------------------
        console.log("\n--- TEST 1: Unique Index Verification ---");
        const collection = mongoose.connection.collection("bookings");
        const indexes = await collection.indexes();
        const hasUniqueCompoundIndex = indexes.some(
            (idx) => idx.key && idx.key.campaign === 1 && idx.key.creator === 1 && idx.unique === true
        );
        assert(
            hasUniqueCompoundIndex,
            `Real compound unique index { campaign: 1, creator: 1 } exists in database "${connectedDbName}"`
        );

        // ---------------------------------------------------------------------
        // TEST 2: Successful atomic transaction (Booking + Credit + Ledger)
        // ---------------------------------------------------------------------
        console.log("\n--- TEST 2: Atomic Commit (Booking + Credit + Ledger) ---");
        const testCreator1 = createId();
        const testBrand1 = createId();
        const testCampaign1 = createId();
        const testService1 = createId();
        const testBooking1 = createId();

        trackedCreatorIds.push(testCreator1);
        trackedCampaignIds.push(testCampaign1);
        trackedBookingIds.push(testBooking1);

        // Initial balance: 2 credits
        await CreatorCreditBalance.create({
            creator: testCreator1,
            currentBalance: 2,
            lifetimeIssued: 2,
            lifetimeConsumed: 0
        });

        const session2 = await mongoose.startSession();
        await session2.withTransaction(async () => {
            // 1. Insert booking
            await Booking.create(
                [
                    {
                        _id: testBooking1,
                        brand: testBrand1,
                        creator: testCreator1,
                        campaign: testCampaign1,
                        service: testService1,
                        agreedPrice: 5000,
                        currency: "INR",
                        status: "pending",
                        deliverables: ["1 Instagram Reel"],
                        deadline: new Date(Date.now() + 864000000)
                    }
                ],
                { session: session2 }
            );

            // 2. Deduct credit & insert ledger
            const deductRes = await deductCreatorApplicationCreditService({
                creatorId: testCreator1,
                bookingId: testBooking1,
                campaignId: testCampaign1,
                campaignTitle: "Atomic Commit Campaign",
                session: session2
            });

            if (deductRes.transaction?._id) {
                trackedTxIds.push(deductRes.transaction._id);
            }
        });
        await session2.endSession();

        const dbBooking2 = await Booking.findById(testBooking1);
        const dbBalance2 = await CreatorCreditBalance.findOne({ creator: testCreator1 });
        const dbLedger2 = await CreditTransaction.findOne({ referenceId: testBooking1 });

        assert(
            dbBooking2 && dbBooking2.status === "pending",
            "Booking record physically created in test database"
        );
        assert(
            dbBalance2 && dbBalance2.currentBalance === 1 && dbBalance2.lifetimeConsumed === 1,
            "Credit balance decremented from 2 to 1 in test database"
        );
        assert(
            dbLedger2 && dbLedger2.amount === -1 && dbLedger2.type === "application_deduction",
            "Credit ledger record physically created with reference to booking"
        );

        // ---------------------------------------------------------------------
        // TEST 2B: Real createBookingService() End-to-End Application Call
        // ---------------------------------------------------------------------
        console.log("\n--- TEST 2B: Real createBookingService() End-to-End ---");
        const testCreator2B = createId();
        const testBrand2B = createId();
        const testCampaign2B = createId();
        const testService2B = createId();

        trackedCreatorIds.push(testCreator2B, testBrand2B);
        trackedCampaignIds.push(testCampaign2B);

        // 1. Setup Brand Subscription (Active)
        await Subscription.create({
            subscriber: testBrand2B,
            subscriberRole: "brand",
            status: "active",
            billingCycle: "monthly",
            currentPeriodStart: new Date(Date.now() - 100000),
            currentPeriodEnd: new Date(Date.now() + 864000000)
        });

        // 2. Setup Campaign (Published)
        await Campaign.create({
            _id: testCampaign2B,
            brand: testBrand2B,
            title: "End-to-End Campaign",
            deliverables: ["1 Video"],
            deadline: new Date(Date.now() + 864000000),
            status: "published"
        });

        // 3. Setup Creator Service
        await CreatorService.create({
            _id: testService2B,
            creator: testCreator2B,
            title: "Reel Production",
            price: 4500,
            currency: "INR",
            revisions: 2,
            isActive: true
        });

        // 4. Setup Creator Subscription (Active) & Balance (1 Credit)
        await Subscription.create({
            subscriber: testCreator2B,
            subscriberRole: "creator",
            status: "active",
            billingCycle: "monthly",
            currentPeriodStart: new Date(Date.now() - 100000),
            currentPeriodEnd: new Date(Date.now() + 864000000)
        });

        await CreatorCreditBalance.create({
            creator: testCreator2B,
            currentBalance: 1,
            lifetimeIssued: 1,
            lifetimeConsumed: 0
        });

        // 5. Call the actual application function: createBookingService()
        const createdApp = await createBookingService(testCreator2B, {
            campaignId: testCampaign2B,
            serviceId: testService2B,
            proposedPrice: 4500,
            message: "Excited to collaborate!"
        });

        if (createdApp?._id) {
            trackedBookingIds.push(createdApp._id);
        }

        const dbBalance2B = await CreatorCreditBalance.findOne({ creator: testCreator2B });
        const dbLedger2B = await CreditTransaction.findOne({ referenceId: createdApp._id });

        assert(
            createdApp && createdApp.status === "pending",
            "createBookingService() returned successfully created booking"
        );
        assert(
            dbBalance2B && dbBalance2B.currentBalance === 0,
            "createBookingService() decremented real database credit balance to 0"
        );
        assert(
            dbLedger2B && dbLedger2B.amount === -1 && dbLedger2B.type === "application_deduction",
            "createBookingService() created real CreditTransaction in database"
        );

        // ---------------------------------------------------------------------
        // TEST 3: Validation failure prevention (Invalid booking payload fails before deduction)
        // ---------------------------------------------------------------------
        console.log("\n--- TEST 3: Validation Failure Prevention (Schema Failure Pre-Deduction) ---");
        const testCreator3 = createId();
        trackedCreatorIds.push(testCreator3);

        await CreatorCreditBalance.create({
            creator: testCreator3,
            currentBalance: 5,
            lifetimeIssued: 5,
            lifetimeConsumed: 0
        });

        const session3 = await mongoose.startSession();
        let errorCaught3 = false;
        try {
            await session3.withTransaction(async () => {
                // Attempt invalid booking insert (violating required schema fields: brand, campaign, agreedPrice)
                await Booking.create(
                    [{ creator: testCreator3, status: "pending" }], // missing required brand, campaign, agreedPrice
                    { session: session3 }
                );

                await deductCreatorApplicationCreditService({
                    creatorId: testCreator3,
                    bookingId: createId(),
                    campaignId: createId(),
                    session: session3
                });
            });
        } catch (err) {
            errorCaught3 = true;
        } finally {
            await session3.endSession();
        }

        const balance3 = await CreatorCreditBalance.findOne({ creator: testCreator3 });
        const bookings3 = await Booking.find({ creator: testCreator3 });

        assert(
            errorCaught3 && balance3.currentBalance === 5 && bookings3.length === 0,
            "Validation failure verified: schema validation blocks invalid booking insert and credit deduction is never executed"
        );

        // ---------------------------------------------------------------------
        // TEST 4: Physical rollback when credit deduction fails (insufficient credits)
        // ---------------------------------------------------------------------
        console.log("\n--- TEST 4: Physical Rollback on Credit Deduction Failure ---");
        const testCreator4 = createId();
        const testBooking4 = createId();
        trackedCreatorIds.push(testCreator4);
        trackedBookingIds.push(testBooking4);

        // Initial balance: 0 credits
        await CreatorCreditBalance.create({
            creator: testCreator4,
            currentBalance: 0,
            lifetimeIssued: 1,
            lifetimeConsumed: 1
        });

        const session4 = await mongoose.startSession();
        let deductionFailed4 = false;
        try {
            await session4.withTransaction(async () => {
                await Booking.create(
                    [
                        {
                            _id: testBooking4,
                            brand: createId(),
                            creator: testCreator4,
                            campaign: createId(),
                            service: createId(),
                            agreedPrice: 3000,
                            currency: "INR",
                            status: "pending",
                            deliverables: ["1 Post"],
                            deadline: new Date(Date.now() + 864000000)
                        }
                    ],
                    { session: session4 }
                );

                // Deduction will throw 403 Insufficient credits
                await deductCreatorApplicationCreditService({
                    creatorId: testCreator4,
                    bookingId: testBooking4,
                    campaignId: createId(),
                    session: session4
                });
            });
        } catch (err) {
            deductionFailed4 = err.statusCode === 403;
        } finally {
            await session4.endSession();
        }

        const rolledBackBooking4 = await Booking.findById(testBooking4);
        const balance4 = await CreatorCreditBalance.findOne({ creator: testCreator4 });

        assert(
            deductionFailed4 && rolledBackBooking4 === null && balance4.currentBalance === 0,
            "Physical rollback verified: Booking insert rolled back from DB when credit deduction fails"
        );

        // ---------------------------------------------------------------------
        // TEST 5: Physical rollback when CreditTransaction.create() fails
        // ---------------------------------------------------------------------
        console.log("\n--- TEST 5: Physical Rollback on Controlled Ledger Failure ---");
        const testCreator5 = createId();
        const testBooking5 = createId();
        trackedCreatorIds.push(testCreator5);
        trackedBookingIds.push(testBooking5);

        await CreatorCreditBalance.create({
            creator: testCreator5,
            currentBalance: 3,
            lifetimeIssued: 3,
            lifetimeConsumed: 0
        });

        const originalCreditTransactionCreate = CreditTransaction.create;
        let ledgerFailed5 = false;

        try {
            // Temporarily stub CreditTransaction.create to simulate ledger write failure (disk error / constraint violation)
            CreditTransaction.create = async () => {
                throw new Error("Controlled ledger insertion failure (simulated write error)");
            };

            const session5 = await mongoose.startSession();
            try {
                await session5.withTransaction(async () => {
                    // 1. Insert booking inside transaction
                    await Booking.create(
                        [
                            {
                                _id: testBooking5,
                                brand: createId(),
                                creator: testCreator5,
                                campaign: createId(),
                                service: createId(),
                                agreedPrice: 2000,
                                currency: "INR",
                                status: "pending",
                                deliverables: ["1 Story"],
                                deadline: new Date(Date.now() + 864000000)
                            }
                        ],
                        { session: session5 }
                    );

                    // 2. Invoke deduction service: balance decrements from 3 to 2, then CreditTransaction.create throws!
                    await deductCreatorApplicationCreditService({
                        creatorId: testCreator5,
                        bookingId: testBooking5,
                        campaignId: createId(),
                        campaignTitle: "Ledger Rollback Campaign",
                        session: session5
                    });
                });
            } catch (err) {
                ledgerFailed5 = err.message.includes("Controlled ledger insertion failure");
            } finally {
                await session5.endSession();
            }
        } finally {
            // Mandatory restoration of CreditTransaction.create
            CreditTransaction.create = originalCreditTransactionCreate;
        }

        const rolledBackBooking5 = await Booking.findById(testBooking5);
        const balance5 = await CreatorCreditBalance.findOne({ creator: testCreator5 });
        const ledger5 = await CreditTransaction.findOne({ referenceId: testBooking5 });

        assert(
            ledgerFailed5 && rolledBackBooking5 === null && balance5.currentBalance === 3 && ledger5 === null,
            "Physical rollback verified: Booking and credit balance changes aborted when CreditTransaction.create() fails"
        );

        // ---------------------------------------------------------------------
        // TEST 6: Concurrency race with only 1 remaining credit
        // ---------------------------------------------------------------------
        console.log("\n--- TEST 6: Concurrent Applications on Last Credit (Race Protection) ---");
        const testCreator6 = createId();
        const testBooking6A = createId();
        const testBooking6B = createId();
        trackedCreatorIds.push(testCreator6);
        trackedBookingIds.push(testBooking6A, testBooking6B);

        // Initial balance: EXACTLY 1 credit
        await CreatorCreditBalance.create({
            creator: testCreator6,
            currentBalance: 1,
            lifetimeIssued: 1,
            lifetimeConsumed: 0
        });

        const runConcurrentBranch = async (bookingId, campaignTitle) => {
            const session = await mongoose.startSession();
            try {
                let result = null;
                await session.withTransaction(async () => {
                    await Booking.create(
                        [
                            {
                                _id: bookingId,
                                brand: createId(),
                                creator: testCreator6,
                                campaign: createId(),
                                service: createId(),
                                agreedPrice: 1500,
                                currency: "INR",
                                status: "pending",
                                deliverables: ["1 Post"],
                                deadline: new Date(Date.now() + 864000000)
                            }
                        ],
                        { session }
                    );

                    result = await deductCreatorApplicationCreditService({
                        creatorId: testCreator6,
                        bookingId,
                        campaignId: createId(),
                        campaignTitle,
                        session
                    });
                });
                return { success: true, result };
            } catch (err) {
                return { success: false, error: err };
            } finally {
                await session.endSession();
            }
        };

        // Fire both concurrent requests simultaneously
        const [resA, resB] = await Promise.all([
            runConcurrentBranch(testBooking6A, "Race A"),
            runConcurrentBranch(testBooking6B, "Race B")
        ]);

        const successfulRuns = [resA, resB].filter((r) => r.success);
        const rejectedRuns = [resA, resB].filter((r) => !r.success && r.error.statusCode === 403);

        const finalBalance6 = await CreatorCreditBalance.findOne({ creator: testCreator6 });
        const existingBookings6 = await Booking.find({ _id: { $in: [testBooking6A, testBooking6B] } });

        assert(
            successfulRuns.length === 1 && rejectedRuns.length === 1,
            "Concurrency test: Exactly one request succeeded and one was rejected with HTTP 403"
        );
        assert(
            finalBalance6.currentBalance === 0 && existingBookings6.length === 1,
            "No double-spend: Database balance stopped at 0 and exactly 1 booking exists"
        );

        console.log("\n===============================================================================");
        console.log(`Integration Suite Results: ${passedTests} passed, ${failedTests} failed.`);
        console.log("===============================================================================");

    } finally {
        // ---------------------------------------------------------------------
        // TEST 7: Isolated cleanup - removes ONLY documents created by this run
        // ---------------------------------------------------------------------
        console.log("\n[CLEANUP] Removing isolated test artifacts from test database...");
        let deletedBookings = 0;
        let deletedBalances = 0;
        let deletedTx = 0;

        if (trackedBookingIds.length > 0) {
            const res = await Booking.deleteMany({ _id: { $in: trackedBookingIds } });
            deletedBookings = res.deletedCount;
        }
        if (trackedCampaignIds.length > 0) {
            await Campaign.deleteMany({ _id: { $in: trackedCampaignIds } });
        }
        if (trackedCreatorIds.length > 0) {
            const resBal = await CreatorCreditBalance.deleteMany({ creator: { $in: trackedCreatorIds } });
            const resTx = await CreditTransaction.deleteMany({ creator: { $in: trackedCreatorIds } });
            await Subscription.deleteMany({ subscriber: { $in: trackedCreatorIds } });
            await CreatorService.deleteMany({ creator: { $in: trackedCreatorIds } });
            deletedBalances = resBal.deletedCount;
            deletedTx = resTx.deletedCount;
        }

        console.log(`[CLEANUP] Removed: ${deletedBookings} booking(s), ${deletedBalances} balance doc(s), ${deletedTx} transaction(s).`);
        await mongoose.disconnect();
        console.log("[CLEANUP] Disconnected from MongoDB. Isolated test run complete.");
    }
}

if (process.argv[1] && process.argv[1].endsWith("test_step8_replica_integration.js")) {
    runRealReplicaTransactionIntegration().catch((err) => {
        console.error("[FATAL] Integration test execution failed:", err);
        process.exit(1);
    });
}

export default runRealReplicaTransactionIntegration;
