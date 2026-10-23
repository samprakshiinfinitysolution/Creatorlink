import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ConnectionString from "mongodb-connection-string-url";

import Auth from "../modules/auth/auth.model.js";
import CreatorProfile from "../modules/creator/profile/profile.model.js";
import CreatorService from "../modules/creator/services/services.model.js";
import Portfolio from "../modules/creator/portfolio/portfolio.model.js";
import Review from "../modules/reviews/reviews.model.js";
import {
    getDiscoverCreatorsService,
    getDiscoverCreatorByIdService
} from "../modules/brand/creators/creators.service.js";
import {
    validateGetDiscoverCreators
} from "../modules/brand/creators/creators.validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const LOCAL_TEST_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

// Parse and validate the MongoDB database name from supported protocols (mongodb:// and mongodb+srv://)
const parseAndValidateTestDatabase = (uri) => {
    if (!uri || typeof uri !== "string" || !uri.trim()) {
        throw new Error("CRITICAL SAFETY GUARD: MONGODB_TEST_URI is missing or empty. An explicitly configured test database URI is required to run tests. Do not run tests against production or unverified databases.");
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

async function runTests() {
    console.log("=== STARTING BRAND CREATOR DISCOVERY API TESTS ===");

    const rawTestUri = process.env.MONGODB_TEST_URI;
    const dbName = parseAndValidateTestDatabase(rawTestUri);
    const testMongoUri = rawTestUri.trim();

    const maskedUri = testMongoUri.replace(/\/\/[^@]+@/, "//***:***@");
    console.log(`Validated dedicated test database '${dbName}': ${maskedUri}`);

    let isConnected = false;
    const testTag = `test_discovery_${Date.now()}`;
    const cleanupAuthIds = [];

    try {
        // Connect to verified test database
        await mongoose.connect(testMongoUri);
        isConnected = true;
        console.log("Connected to dedicated test database.");

        // -------------------------------------------------------------
        // UNIT TESTS: NUMERIC & MALFORMED INPUT VALIDATION
        // -------------------------------------------------------------
        console.log("\n--- Testing Numeric Validation & Malformed Inputs ---");

        // 1. Invalid / Non-finite / Decimal page
        for (const badPage of ["abc", "Infinity", "-Infinity", "0", "-1", "1.5"]) {
            let errCaught = false;
            try {
                validateGetDiscoverCreators({ query: { page: badPage } }, {}, () => {});
            } catch (e) {
                errCaught = true;
            }
            if (!errCaught) throw new Error(`Validation failed to reject invalid page: ${badPage}`);
        }
        console.log("  ✓ Correctly rejected invalid, non-finite, decimal, and <= 0 page values.");

        // 2. Invalid / Non-finite / Excessively large limit (> 100)
        for (const badLimit of ["0", "-5", "Infinity", "1.5", "101", "500"]) {
            let errCaught = false;
            try {
                validateGetDiscoverCreators({ query: { limit: badLimit } }, {}, () => {});
            } catch (e) {
                errCaught = true;
            }
            if (!errCaught) throw new Error(`Validation failed to reject invalid limit: ${badLimit}`);
        }
        console.log("  ✓ Correctly rejected invalid, non-finite, decimal, and excessively large limit values (> 100).");

        // 3. Invalid / Non-finite / Decimal follower counts
        for (const badFollowers of ["Infinity", "-Infinity", "-10", "15.7"]) {
            let errCaught = false;
            try {
                validateGetDiscoverCreators({ query: { minFollowers: badFollowers } }, {}, () => {});
            } catch (e) {
                errCaught = true;
            }
            if (!errCaught) throw new Error(`Validation failed to reject invalid minFollowers: ${badFollowers}`);
        }
        console.log("  ✓ Correctly rejected non-finite, negative, and decimal follower counts.");

        // 4. Followers range mismatch
        let errCaught = false;
        try {
            validateGetDiscoverCreators({ query: { minFollowers: "5000", maxFollowers: "1000" } }, {}, () => {});
        } catch (e) {
            errCaught = true;
            console.log("  ✓ Correctly rejected minFollowers > maxFollowers:", e.message);
        }
        if (!errCaught) throw new Error("Validation failed to reject minFollowers > maxFollowers");

        // 5. Invalid / Non-finite engagement
        for (const badEng of ["Infinity", "-Infinity", "-1"]) {
            errCaught = false;
            try {
                validateGetDiscoverCreators({ query: { minEngagement: badEng } }, {}, () => {});
            } catch (e) {
                errCaught = true;
            }
            if (!errCaught) throw new Error(`Validation failed to reject invalid minEngagement: ${badEng}`);
        }
        console.log("  ✓ Correctly rejected non-finite / negative engagement rates.");

        // 6. Invalid / Non-finite price
        for (const badPrice of ["Infinity", "-Infinity", "-50"]) {
            errCaught = false;
            try {
                validateGetDiscoverCreators({ query: { maxPrice: badPrice } }, {}, () => {});
            } catch (e) {
                errCaught = true;
            }
            if (!errCaught) throw new Error(`Validation failed to reject invalid maxPrice: ${badPrice}`);
        }
        console.log("  ✓ Correctly rejected non-finite / negative maxPrice.");

        // 7. Invalid platform & sortBy
        errCaught = false;
        try {
            validateGetDiscoverCreators({ query: { platform: "myspace" } }, {}, () => {});
        } catch (e) {
            errCaught = true;
        }
        if (!errCaught) throw new Error("Validation failed to reject invalid platform");

        errCaught = false;
        try {
            validateGetDiscoverCreators({ query: { sortBy: "password" } }, {}, () => {});
        } catch (e) {
            errCaught = true;
        }
        if (!errCaught) throw new Error("Validation failed to reject unallowed sortBy");

        // 8. Valid query passes
        let passed = false;
        validateGetDiscoverCreators({
            query: {
                page: "1",
                limit: "10",
                search: "tech",
                platform: "instagram",
                minFollowers: "1000",
                maxFollowers: "50000",
                minEngagement: "2.5",
                maxPrice: "15000",
                sortBy: "followerCount",
                sortOrder: "desc"
            }
        }, {}, () => { passed = true; });
        if (!passed) throw new Error("Validation failed to pass valid query");
        console.log("  ✓ Valid query successfully passed validation middleware.");

        // -------------------------------------------------------------
        // SEED TEST DATA (CONFIRMING REQUIRED FIELDS ACROSS SCHEMAS)
        // -------------------------------------------------------------
        console.log("\n--- Seeding Test Fixtures (Satisfying All Schemas) ---");

        // 1. Test Brand User
        const brandUser = await Auth.create({
            name: `${testTag}_Brand`,
            email: `${testTag}_brand@test.com`,
            password: "hashedpassword123",
            role: "brand"
        });
        cleanupAuthIds.push(brandUser._id);

        // 2. Creator A (Public, Reviewed, Active Services, Public Portfolio)
        const creatorAUser = await Auth.create({
            name: `${testTag}_Creator_A_TechGuru`,
            email: `${testTag}_creatorA_private@test.com`,
            password: "hashedpassword123",
            role: "creator"
        });
        cleanupAuthIds.push(creatorAUser._id);

        const creatorAProfile = await CreatorProfile.create({
            user: creatorAUser._id,
            bio: "Leading tech reviewer and gadgets specialist (C++ & Gadgets) [Top*Rated]",
            category: "Technology",
            location: "Bengaluru, India",
            followerCount: 50000,
            engagementRate: 4.8,
            isPublic: true,
            socialLinks: {
                instagram: "https://instagram.com/techguru",
                youtube: "https://youtube.com/techguru"
            }
        });

        // Services for Creator A: 1 active, 1 inactive
        await CreatorService.create({
            creator: creatorAUser._id,
            title: "Dedicated YouTube Review",
            category: "Technology",
            platform: "youtube",
            price: 25000,
            currency: "INR",
            deliveryTime: 7,
            revisions: 2,
            isActive: true
        });
        await CreatorService.create({
            creator: creatorAUser._id,
            title: "Outdated Shoutout Service",
            category: "Technology",
            platform: "instagram",
            price: 5000,
            currency: "INR",
            deliveryTime: 3,
            revisions: 1,
            isActive: false
        });

        // Portfolio for Creator A: 1 public, 1 private
        await Portfolio.create({
            creator: creatorAUser._id,
            title: "Flagship Phone Launch",
            category: "Technology",
            isPublic: true,
            contents: [{ platform: "youtube", contentType: "video", url: "https://youtube.com/watch?v=123", title: "Flagship Phone Review" }]
        });
        await Portfolio.create({
            creator: creatorAUser._id,
            title: "Internal Unreleased Draft Work",
            category: "Technology",
            isPublic: false,
            contents: [{ platform: "youtube", contentType: "video", url: "https://youtube.com/watch?v=secret", title: "Internal Draft" }]
        });

        // Real Reviews for Creator A: ratings 5 and 4 -> average 4.5
        const dummyWorkspaceId1 = new mongoose.Types.ObjectId();
        await Review.create({
            workspace: dummyWorkspaceId1,
            reviewer: brandUser._id,
            reviewee: creatorAUser._id,
            rating: 5,
            comment: "Exceptional content!"
        });

        const dummyWorkspaceId2 = new mongoose.Types.ObjectId();
        await Review.create({
            workspace: dummyWorkspaceId2,
            reviewer: brandUser._id,
            reviewee: creatorAUser._id,
            rating: 4,
            comment: "Very good turnaround."
        });

        // 3. Creator B (Public, Fashion, Unreviewed, Cheaper Active Service)
        const creatorBUser = await Auth.create({
            name: `${testTag}_Creator_B_Fashionista`,
            email: `${testTag}_creatorB_private@test.com`,
            password: "hashedpassword123",
            role: "creator"
        });
        cleanupAuthIds.push(creatorBUser._id);

        await CreatorProfile.create({
            user: creatorBUser._id,
            bio: "Sustainable luxury fashion curator",
            category: "Fashion",
            location: "Mumbai, India",
            followerCount: 20000,
            engagementRate: 3.2,
            isPublic: true,
            socialLinks: {
                instagram: "https://instagram.com/fashionista"
            }
        });

        await CreatorService.create({
            creator: creatorBUser._id,
            title: "Instagram Reel Styling",
            category: "Fashion",
            platform: "instagram",
            price: 8000,
            currency: "INR",
            deliveryTime: 5,
            revisions: 1,
            isActive: true
        });

        // 4. Creator C (Private Profile: isPublic = false)
        const creatorCUser = await Auth.create({
            name: `${testTag}_Creator_C_Private`,
            email: `${testTag}_creatorC_private@test.com`,
            password: "hashedpassword123",
            role: "creator"
        });
        cleanupAuthIds.push(creatorCUser._id);

        await CreatorProfile.create({
            user: creatorCUser._id,
            bio: "Private account should not be visible",
            category: "Lifestyle",
            location: "Delhi, India",
            followerCount: 90000,
            isPublic: false
        });

        console.log("  ✓ Seeded test fixtures satisfying all schemas (Brand, Creator A, Creator B, Creator C).");

        // -------------------------------------------------------------
        // INTEGRATION TESTS: DISCOVERY SERVICE & BUSINESS RULES
        // -------------------------------------------------------------
        console.log("\n--- Testing Discovery Service Logic & Requirements ---");

        // Test 1: Public profile & Auth role exclusion
        const res1 = await getDiscoverCreatorsService({ search: testTag });
        const names = res1.creators.map(c => c.user.name);
        console.log(`  Found ${res1.creators.length} discoverable creators:`, names);

        if (names.includes(creatorCUser.name)) {
            throw new Error("Private creator C was incorrectly returned!");
        }
        if (!names.includes(creatorAUser.name) || !names.includes(creatorBUser.name)) {
            throw new Error("Public creators A and B were expected but not returned!");
        }
        console.log("  ✓ Test 1 Passed: Private creators are properly excluded.");

        // Test 2: Privacy verification (no email, password, or sessions exposed)
        for (const c of res1.creators) {
            if (c.user.email !== undefined) {
                throw new Error(`Privacy violation: user.email is exposed! Value: ${c.user.email}`);
            }
            if (c.user.password !== undefined || c.user.sessions !== undefined) {
                throw new Error("Security violation: user credentials/sessions are exposed!");
            }
        }
        console.log("  ✓ Test 2 Passed: No private/internal fields (email, password, sessions) exposed.");

        // Test 3: Active services only
        const creatorAData = res1.creators.find(c => c.user._id.toString() === creatorAUser._id.toString());
        if (!creatorAData) throw new Error("Creator A data not found");

        if (creatorAData.services.length !== 1 || creatorAData.services[0].isActive !== true) {
            throw new Error(`Inactive services were returned! Count: ${creatorAData.services.length}`);
        }
        console.log("  ✓ Test 3 Passed: Inactive services filtered out (1 active returned).");

        // Test 4: Public portfolio only
        if (creatorAData.portfolio.length !== 1 || creatorAData.portfolio[0].isPublic !== true) {
            throw new Error(`Private portfolio items were returned! Count: ${creatorAData.portfolio.length}`);
        }
        console.log("  ✓ Test 4 Passed: Private portfolio entries filtered out (1 public returned).");

        // Test 5: Real review rating calculation
        if (creatorAData.rating !== 4.5 || creatorAData.reviewCount !== 2) {
            throw new Error(`Expected rating 4.5 and reviewCount 2 for Creator A, got rating=${creatorAData.rating}, reviewCount=${creatorAData.reviewCount}`);
        }
        console.log(`  ✓ Test 5 Passed: Real review data calculated: rating=${creatorAData.rating}, reviewCount=${creatorAData.reviewCount}`);

        // Test 6: Unreviewed creator has rating null and reviewCount 0
        const creatorBData = res1.creators.find(c => c.user._id.toString() === creatorBUser._id.toString());
        if (creatorBData.rating !== null || creatorBData.reviewCount !== 0) {
            throw new Error(`Unreviewed creator expected rating=null and reviewCount=0, got rating=${creatorBData.rating}, reviewCount=${creatorBData.reviewCount}`);
        }
        console.log("  ✓ Test 6 Passed: Unreviewed creator has rating=null and reviewCount=0.");

        // Test 7: Regex metacharacters safely escaped (testing +, (, ), [, ], *)
        const regexMatch1 = await getDiscoverCreatorsService({ search: "C++ & Gadgets" });
        if (regexMatch1.creators.length !== 1 || regexMatch1.creators[0].user._id.toString() !== creatorAUser._id.toString()) {
            throw new Error("escapeRegex failed on 'C++ & Gadgets'.");
        }
        console.log("  ✓ Test 7a Passed: escapeRegex safely matches 'C++ & Gadgets'.");

        const regexMatch2 = await getDiscoverCreatorsService({ search: "[Top*Rated]" });
        if (regexMatch2.creators.length !== 1 || regexMatch2.creators[0].user._id.toString() !== creatorAUser._id.toString()) {
            throw new Error("escapeRegex failed on brackets and asterisk '[Top*Rated]'.");
        }
        console.log("  ✓ Test 7b Passed: escapeRegex safely matches '[Top*Rated]'.");

        // Test 8: Category filter
        const catRes = await getDiscoverCreatorsService({ search: testTag, category: "Fashion" });
        if (catRes.creators.length !== 1 || catRes.creators[0].user._id.toString() !== creatorBUser._id.toString()) {
            throw new Error("Category filter for 'Fashion' failed.");
        }
        console.log("  ✓ Test 8 Passed: Category filter correctly filtered by niche.");

        // Test 9: Platform filter
        const platRes = await getDiscoverCreatorsService({ search: testTag, platform: "youtube" });
        if (platRes.creators.length !== 1 || platRes.creators[0].user._id.toString() !== creatorAUser._id.toString()) {
            throw new Error("Platform filter for 'youtube' failed.");
        }
        console.log("  ✓ Test 9 Passed: Platform filter matched social links / services.");

        // Test 10: Followers range
        const followRes = await getDiscoverCreatorsService({ search: testTag, minFollowers: 30000 });
        if (followRes.creators.length !== 1 || followRes.creators[0].user._id.toString() !== creatorAUser._id.toString()) {
            throw new Error("minFollowers filter failed.");
        }
        console.log("  ✓ Test 10 Passed: minFollowers filter returned only Creator A (50k).");

        // Test 11: Max price filter
        const priceRes = await getDiscoverCreatorsService({ search: testTag, maxPrice: 10000 });
        if (priceRes.creators.length !== 1 || priceRes.creators[0].user._id.toString() !== creatorBUser._id.toString()) {
            throw new Error("maxPrice filter failed.");
        }
        console.log("  ✓ Test 11 Passed: maxPrice=10000 returned only Creator B (₹8000).");

        // Test 12: Sorting by price ascending (null prices sorted last)
        const sortPriceRes = await getDiscoverCreatorsService({ search: testTag, sortBy: "minPrice", sortOrder: "asc" });
        if (sortPriceRes.creators[0].user._id.toString() !== creatorBUser._id.toString()) {
            throw new Error("Sorting by price asc failed to put cheapest creator B first.");
        }
        console.log("  ✓ Test 12 Passed: Sorting by price asc puts cheapest creator (₹8000) first.");

        // Test 13: Sorting by rating
        const sortRatingRes = await getDiscoverCreatorsService({ search: testTag, sortBy: "rating", sortOrder: "desc" });
        if (sortRatingRes.creators[0].user._id.toString() !== creatorAUser._id.toString()) {
            throw new Error("Sorting by rating desc failed to put Creator A first.");
        }
        console.log("  ✓ Test 13 Passed: Sorting by rating puts reviewed creator first.");

        // Test 14: Pagination
        const pageRes = await getDiscoverCreatorsService({ search: testTag, page: 1, limit: 1 });
        if (pageRes.creators.length !== 1 || pageRes.pagination.totalItems !== 2 || pageRes.pagination.totalPages !== 2) {
            throw new Error(`Pagination metadata mismatch: totalItems=${pageRes.pagination.totalItems}`);
        }
        console.log("  ✓ Test 14 Passed: Pagination correctly sliced data with accurate pagination object.");

        // Test 15: Single creator detail endpoint service & email privacy
        const detailA = await getDiscoverCreatorByIdService(creatorAProfile._id.toString());
        if (detailA.user._id.toString() !== creatorAUser._id.toString() || detailA.rating !== 4.5) {
            throw new Error("getDiscoverCreatorByIdService failed.");
        }
        if (detailA.user.email !== undefined) {
            throw new Error(`Privacy violation: user.email is exposed in creator detail! Value: ${detailA.user.email}`);
        }
        console.log("  ✓ Test 15 Passed: getDiscoverCreatorByIdService fetched public profile without email.");

        // Test 16: Single creator detail for private profile returns 404
        errCaught = false;
        try {
            await getDiscoverCreatorByIdService(creatorCUser._id.toString());
        } catch (e) {
            errCaught = true;
            console.log("  ✓ Test 16 Passed: Private profile throws 404:", e.message);
        }
        if (!errCaught) throw new Error("Private creator detail should have thrown 404!");

        console.log("\n>>> ALL DISCOVERY TESTS PASSED SUCCESSFULLY! <<<");

    } finally {
        console.log("\n--- Cleaning Up Test Data ---");
        try {
            if (isConnected && cleanupAuthIds.length > 0) {
                await CreatorProfile.deleteMany({ user: { $in: cleanupAuthIds } });
                await CreatorService.deleteMany({ creator: { $in: cleanupAuthIds } });
                await Portfolio.deleteMany({ creator: { $in: cleanupAuthIds } });
                await Review.deleteMany({ reviewer: { $in: cleanupAuthIds } });
                await Review.deleteMany({ reviewee: { $in: cleanupAuthIds } });
                await Auth.deleteMany({ _id: { $in: cleanupAuthIds } });
                console.log(`  Cleaned up ${cleanupAuthIds.length} test accounts and related records.`);
            }
        } catch (cleanupErr) {
            console.error("  Warning: document cleanup encountered an error:", cleanupErr.message);
        }

        try {
            if (isConnected) {
                await mongoose.disconnect();
                console.log("Disconnected from MongoDB. Cleanup complete.");
            }
        } catch (disconnectErr) {
            console.error("  Warning: mongoose disconnect encountered an error:", disconnectErr.message);
        }
    }
}

runTests().catch((err) => {
    console.error("Test execution failed:", err.message);
    process.exit(1);
});
