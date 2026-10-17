import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ConnectionString from "mongodb-connection-string-url";

// Register Mongoose models required for populate
import Auth from "../modules/auth/auth.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import Booking from "../modules/booking/booking.model.js";
import Workspace from "../modules/workspace/workspace.model.js";
import Review from "../modules/reviews/reviews.model.js";

import {
    createBrandReviewService,
    getBrandReviewsService,
    getCreatorReviewsService,
    getWorkspaceReviewService
} from "../modules/reviews/reviews.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const LOCAL_TEST_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

// Parse and validate the MongoDB database name from supported protocols (mongodb:// and mongodb+srv://)
const parseAndValidateTestDatabase = (uri) => {
    if (!uri || typeof uri !== "string" || !uri.trim()) {
        throw new Error("MONGODB_TEST_URI is missing or empty. An explicitly configured test database URI is required to run tests.");
    }

    const cleanUri = uri.trim();
    if (!/^(mongodb(?:\+srv)?):\/\//i.test(cleanUri)) {
        throw new Error("Unsupported or malformed MongoDB URI scheme. Only 'mongodb://' and 'mongodb+srv://' are supported.");
    }

    let cs;
    try {
        cs = new ConnectionString(cleanUri);
    } catch (parseErr) {
        throw new Error(`Malformed MongoDB connection string: ${parseErr.message}`);
    }

    const hosts = cs.hosts || [];
    if (hosts.length === 0) {
        throw new Error("MONGODB_TEST_URI contains no valid host definitions.");
    }

    for (const hostEntry of hosts) {
        const hostname = hostEntry.startsWith("[")
            ? hostEntry.slice(1, hostEntry.indexOf("]")).toLowerCase()
            : hostEntry.split(":")[0].toLowerCase();

        if (!LOCAL_TEST_HOSTS.has(hostname) && process.env.ALLOW_REMOTE_TEST_DB !== "true") {
            throw new Error(
                `Host '${hostname}' is not a permitted local test host (allowed: localhost, 127.0.0.1, ::1). Set ALLOW_REMOTE_TEST_DB=true to explicitly permit an intentional remote test environment.`
            );
        }
    }

    const rawPath = (cs.pathname || "").replace(/^\//, "").trim();
    if (!rawPath || rawPath.includes("/") || rawPath.includes("?")) {
        throw new Error("Database name in MONGODB_TEST_URI is missing, ambiguous, or invalid.");
    }

    const dbName = decodeURIComponent(rawPath);
    if (!/test/i.test(dbName)) {
        throw new Error(`Database name '${dbName}' does not follow the test database naming convention (must contain 'test' in the database name itself).`);
    }

    return dbName;
};

const runTests = async () => {
    // 1. Validate only process.env.MONGODB_TEST_URI; never fall back to other database URI variables.
    const mongoUri = process.env.MONGODB_TEST_URI;

    // Reject production environment
    if (process.env.NODE_ENV === "production") {
        console.error("CRITICAL SAFETY GUARD: Refusing to execute test script when NODE_ENV is set to 'production'.");
        process.exitCode = 1;
        process.exit(1);
    }

    // 2. Parse and validate test database safely before connecting
    let dbName = "";
    try {
        dbName = parseAndValidateTestDatabase(mongoUri);
    } catch (valErr) {
        console.error(`CRITICAL SAFETY GUARD: ${valErr.message}`);
        process.exitCode = 1;
        process.exit(1);
    }

    console.log("\n=======================================================");
    console.log("   RUNNING REVIEWS MODULE UNIT & SERVICE VERIFICATION  ");
    console.log("=======================================================\n");

    // 3. Never print the full connection URI, credentials, or secrets.
    console.log(`✓ Connecting safely to test database: [REDACTED_URI]/[${dbName}]\n`);

    let isConnected = false;
    const createdAuthIds = [];
    const createdWorkspaceIds = [];
    const createdReviewIds = [];

    try {
        await mongoose.connect(mongoUri);
        isConnected = true;
        console.log("✓ Connected to MongoDB test database successfully\n");

        // Create actual Auth records for Brand and Creator to verify populated structures and privacy
        const brandUser = await Auth.create({
            name: "Test Brand User",
            email: `test_brand_${Date.now()}@example.com`,
            password: "hashed_test_password",
            role: "brand"
        });
        createdAuthIds.push(brandUser._id);

        const creatorUser = await Auth.create({
            name: "Test Creator User",
            email: `test_creator_${Date.now()}@example.com`,
            password: "hashed_test_password",
            role: "creator"
        });
        createdAuthIds.push(creatorUser._id);

        const brandId = brandUser._id;
        const creatorId = creatorUser._id;
        const otherBrandId = new mongoose.Types.ObjectId();
        const otherUserId = new mongoose.Types.ObjectId();
        const bookingId = new mongoose.Types.ObjectId();
        const campaignId = new mongoose.Types.ObjectId();
        const serviceId = new mongoose.Types.ObjectId();

        // 1. Create a mock completed workspace
        const completedWorkspace = await Workspace.create({
            booking: bookingId,
            campaign: campaignId,
            brand: brandId,
            creator: creatorId,
            service: serviceId,
            agreedPrice: 5000,
            currency: "INR",
            brief: "Test Campaign Brief",
            deadline: new Date(Date.now() + 86400000),
            status: "completed",
            deliverables: [
                { title: "Deliverable 1", status: "completed" }
            ]
        });
        createdWorkspaceIds.push(completedWorkspace._id);
        console.log(`[PASS] Created mock completed workspace: ${completedWorkspace._id}`);

        // 2. Create a mock in-progress workspace
        const inProgressWorkspace = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: campaignId,
            brand: brandId,
            creator: creatorId,
            service: serviceId,
            agreedPrice: 3000,
            currency: "INR",
            brief: "In progress campaign",
            deadline: new Date(Date.now() + 86400000),
            status: "in_progress",
            deliverables: [
                { title: "Deliverable 1", status: "pending" }
            ]
        });
        createdWorkspaceIds.push(inProgressWorkspace._id);
        console.log(`[PASS] Created mock in-progress workspace: ${inProgressWorkspace._id}`);

        // TEST 1: Brand reviews its own completed workspace successfully
        const review1 = await createBrandReviewService(brandId, {
            workspaceId: completedWorkspace._id.toString(),
            rating: 5,
            comment: "Great creator to work with!"
        });
        createdReviewIds.push(review1._id);
        if (!review1 || review1.rating !== 5) {
            throw new Error("Test 1 failed: Review was not created correctly");
        }

        // Explicit privacy assertion: Reviewer and reviewee email addresses must NOT be exposed in create review response
        const r1Reviewer = review1.reviewer?.toObject ? review1.reviewer.toObject() : review1.reviewer;
        const r1Reviewee = review1.reviewee?.toObject ? review1.reviewee.toObject() : review1.reviewee;
        if (!r1Reviewer || r1Reviewer.name !== "Test Brand User" || !r1Reviewee || r1Reviewee.name !== "Test Creator User") {
            throw new Error("Test 1 failed: Expected populated name on reviewer and reviewee");
        }
        if ("email" in r1Reviewer || "email" in r1Reviewee || r1Reviewer.email !== undefined || r1Reviewee.email !== undefined) {
            throw new Error("Test 1 failed: Data privacy violation - email address exposed in create review response");
        }
        console.log(`[PASS] Test 1: Brand submitted review for completed workspace (Rating: 5, Populated structure verified, Emails unexposed)`);

        // TEST 2: Brand cannot review another Brand's workspace
        let test2Failed = true;
        try {
            await createBrandReviewService(otherBrandId, {
                workspaceId: completedWorkspace._id.toString(),
                rating: 4,
                comment: "Unauthorized attempt"
            });
        } catch (err) {
            if (err.statusCode === 403) {
                test2Failed = false;
                console.log(`[PASS] Test 2: Rejected unauthorized brand review attempt -> Status: ${err.statusCode}, Message: ${err.message}`);
            }
        }
        if (test2Failed) {
            throw new Error("Test 2 failed: Unauthorized brand review was not rejected with 403");
        }

        // TEST 3: Incomplete workspace cannot be reviewed
        let test3Failed = true;
        try {
            await createBrandReviewService(brandId, {
                workspaceId: inProgressWorkspace._id.toString(),
                rating: 4,
                comment: "Premature review"
            });
        } catch (err) {
            if (err.statusCode === 400) {
                test3Failed = false;
                console.log(`[PASS] Test 3: Rejected review for in-progress workspace -> Status: ${err.statusCode}, Message: ${err.message}`);
            }
        }
        if (test3Failed) {
            throw new Error("Test 3 failed: In-progress workspace review was not rejected with 400");
        }

        // TEST 4: Duplicate review by the same user is rejected
        let test4Failed = true;
        try {
            await createBrandReviewService(brandId, {
                workspaceId: completedWorkspace._id.toString(),
                rating: 4,
                comment: "Duplicate review attempt"
            });
        } catch (err) {
            if (err.statusCode === 400) {
                test4Failed = false;
                console.log(`[PASS] Test 4: Rejected duplicate review attempt -> Status: ${err.statusCode}, Message: ${err.message}`);
            }
        }
        if (test4Failed) {
            throw new Error("Test 4 failed: Duplicate review by same user was not rejected with 400");
        }

        // TEST 5 (Model/Index Compatibility Test Only):
        // Directly verifies that the { workspace, reviewer } compound unique index permits
        // a future Creator review to coexist alongside a Brand review for the same workspace.
        // Note: This directly validates database schema/index compatibility without implementing Creator-to-Brand submission routes.
        const creatorReview = new Review({
            workspace: completedWorkspace._id,
            booking: bookingId,
            campaign: campaignId,
            reviewer: creatorId,
            reviewee: brandId,
            rating: 5,
            comment: "Great brand partner!"
        });
        await creatorReview.save();
        createdReviewIds.push(creatorReview._id);
        console.log(`[PASS] Test 5 (Model/Index Compatibility): Coexisting review saved under compound unique index (Review ID: ${creatorReview._id})`);

        // TEST 6a: Other users cannot access unauthorized workspace reviews
        let test6Failed = true;
        try {
            await getWorkspaceReviewService(completedWorkspace._id.toString(), otherUserId);
        } catch (err) {
            if (err.statusCode === 403) {
                test6Failed = false;
                console.log(`[PASS] Test 6a: Rejected unauthorized workspace review view -> Status: ${err.statusCode}`);
            }
        }
        if (test6Failed) {
            throw new Error("Test 6a failed: Unauthorized workspace review access was not rejected with 403");
        }

        // TEST 6b: Authorized workspace review lookup returns the expected review and excludes emails
        const authWorkspaceReview = await getWorkspaceReviewService(completedWorkspace._id.toString(), brandId);
        if (!authWorkspaceReview || !authWorkspaceReview._id) {
            throw new Error("Test 6b failed: Authorized workspace review lookup unexpectedly returned no review");
        }
        if (authWorkspaceReview._id.toString() !== review1._id.toString()) {
            throw new Error("Test 6b failed: Returned workspace review ID does not match expected review");
        }

        const authReviewer = authWorkspaceReview.reviewer?.toObject ? authWorkspaceReview.reviewer.toObject() : authWorkspaceReview.reviewer;
        const authReviewee = authWorkspaceReview.reviewee?.toObject ? authWorkspaceReview.reviewee.toObject() : authWorkspaceReview.reviewee;
        if (!authReviewer || authReviewer.name !== "Test Brand User" || !authReviewee || authReviewee.name !== "Test Creator User") {
            throw new Error("Test 6b failed: Expected populated name on reviewer and reviewee");
        }
        if ("email" in authReviewer || "email" in authReviewee || authReviewer.email !== undefined || authReviewee.email !== undefined) {
            throw new Error("Test 6b failed: Data privacy violation - email address exposed in workspace review response");
        }
        console.log(`[PASS] Test 6b: Authorized workspace review accessed (Verified Review ID: ${authWorkspaceReview._id}, Populated structure verified, Emails unexposed)`);

        // TEST 7a: Fetch Brand reviews list & verify pagination and email privacy
        const brandReviewsData = await getBrandReviewsService(brandId, { page: 1, limit: 10 });
        if (!brandReviewsData || !Array.isArray(brandReviewsData.reviews) || brandReviewsData.reviews.length !== 1) {
            throw new Error("Test 7a failed: Brand reviews count mismatch");
        }
        const bReview = brandReviewsData.reviews[0];
        const bReviewee = bReview.reviewee?.toObject ? bReview.reviewee.toObject() : bReview.reviewee;
        if (!bReviewee || bReviewee.name !== "Test Creator User") {
            throw new Error("Test 7a failed: Reviewee is missing expected populated name");
        }
        if ("email" in bReviewee || bReviewee.email !== undefined) {
            throw new Error("Test 7a failed: Data privacy violation - email address exposed in Brand reviews list");
        }
        console.log(`[PASS] Test 7a: Fetched Brand reviews count: ${brandReviewsData.reviews.length} (Verified populated structure, Emails unexposed)`);

        // TEST 7b: Fetch Creator reviews list with string creatorId (P1 Regression Test) & verify average rating and email privacy
        const creatorReviewsData = await getCreatorReviewsService(creatorId.toString(), { page: 1, limit: 10 });
        if (!creatorReviewsData || !Array.isArray(creatorReviewsData.reviews) || creatorReviewsData.reviews.length !== 1) {
            throw new Error("Test 7b failed: Creator reviews count mismatch");
        }
        if (!creatorReviewsData.stats || creatorReviewsData.stats.averageRating !== 5) {
            throw new Error(`Test 7b failed: Average rating mismatch (expected 5, got ${creatorReviewsData.stats?.averageRating})`);
        }
        const cReview = creatorReviewsData.reviews[0];
        const cReviewer = cReview.reviewer?.toObject ? cReview.reviewer.toObject() : cReview.reviewer;
        if (!cReviewer || cReviewer.name !== "Test Brand User") {
            throw new Error("Test 7b failed: Reviewer is missing expected populated name");
        }
        if ("email" in cReviewer || cReviewer.email !== undefined) {
            throw new Error("Test 7b failed: Data privacy violation - email address exposed in Creator reviews list");
        }
        console.log(`[PASS] Test 7b (P1 Regression - String ID): Fetched Creator reviews count: ${creatorReviewsData.reviews.length}, Avg Rating: ${creatorReviewsData.stats.averageRating} (Verified populated structure, Emails unexposed)`);

        // TEST 7c: Multiple ratings average calculation test (Ratings: 5 and 4 -> Average: 4.5)
        const secondCompletedWorkspace = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: campaignId,
            brand: brandId,
            creator: creatorId,
            service: serviceId,
            agreedPrice: 6000,
            currency: "INR",
            brief: "Second Completed Campaign Brief",
            deadline: new Date(Date.now() + 86400000),
            status: "completed",
            deliverables: [
                { title: "Deliverable 2", status: "completed" }
            ]
        });
        createdWorkspaceIds.push(secondCompletedWorkspace._id);

        const review2 = await createBrandReviewService(brandId, {
            workspaceId: secondCompletedWorkspace._id.toString(),
            rating: 4,
            comment: "Solid work on the second campaign!"
        });
        createdReviewIds.push(review2._id);

        const multiRatingData = await getCreatorReviewsService(creatorId.toString(), { page: 1, limit: 10 });
        if (!multiRatingData || multiRatingData.stats.totalReviews !== 2) {
            throw new Error(`Test 7c failed: Expected totalReviews to be 2, got ${multiRatingData?.stats?.totalReviews}`);
        }
        if (multiRatingData.stats.averageRating !== 4.5) {
            throw new Error(`Test 7c failed: Expected averageRating to be 4.5, got ${multiRatingData?.stats?.averageRating}`);
        }
        console.log(`[PASS] Test 7c (Multi-Rating Average): Total: ${multiRatingData.stats.totalReviews}, Avg Rating: ${multiRatingData.stats.averageRating} (Expected 4.5)`);

        // TEST 7d: Invalid creator ID validation rejection
        let testInvalidCreatorFailed = true;
        try {
            await getCreatorReviewsService("invalid-creator-id-format");
        } catch (err) {
            if (err.statusCode === 400) {
                testInvalidCreatorFailed = false;
                console.log(`[PASS] Test 7d: Rejected invalid creator ID -> Status: ${err.statusCode}, Message: ${err.message}`);
            }
        }
        if (testInvalidCreatorFailed) {
            throw new Error("Test 7d failed: Invalid creator ID was not rejected with 400");
        }

        console.log("\n=======================================================");
        console.log("   ALL REVIEWS MODULE TESTS PASSED SUCCESSFULLY!       ");
        console.log("=======================================================\n");
    } catch (err) {
        console.error("\n❌ TEST FAILED:", err.message || err);
        process.exitCode = 1;
    } finally {
        // Scoped cleanup: Delete ONLY test records created during this execution with independent error handling
        if (isConnected) {
            let hasCleanupError = false;

            const cleanupTasks = [
                {
                    name: "Review",
                    fn: () => createdReviewIds.length > 0 ? Review.deleteMany({ _id: { $in: createdReviewIds } }) : Promise.resolve()
                },
                {
                    name: "Workspace",
                    fn: () => createdWorkspaceIds.length > 0 ? Workspace.deleteMany({ _id: { $in: createdWorkspaceIds } }) : Promise.resolve()
                },
                {
                    name: "Auth",
                    fn: () => createdAuthIds.length > 0 ? Auth.deleteMany({ _id: { $in: createdAuthIds } }) : Promise.resolve()
                }
            ];

            for (const task of cleanupTasks) {
                try {
                    await task.fn();
                } catch (cleanupErr) {
                    console.error(`❌ Scoped cleanup error for ${task.name}:`, cleanupErr.message);
                    hasCleanupError = true;
                    process.exitCode = 1;
                }
            }

            if (!hasCleanupError) {
                console.log("✓ Scoped cleanup completed (deleted only test records created by this run)");
            }

            try {
                await mongoose.disconnect();
                console.log("✓ Disconnected safely from test database.");
            } catch (disconnectErr) {
                console.error("❌ Disconnect error:", disconnectErr.message);
                process.exitCode = 1;
            }
        }
    }

    if (process.exitCode && process.exitCode !== 0) {
        process.exit(process.exitCode);
    }
};

runTests();
