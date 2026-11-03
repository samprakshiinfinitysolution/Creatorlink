import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import mongoose from "mongoose";
import Auth from "../modules/auth/auth.model.js";
import BrandProfile from "../modules/brand/profile/profile.model.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import {
    createBrandTrialSubscriptionService,
    getBrandSubscriptionStatusService,
    reEvaluateBrandTrialEligibilityService
} from "../modules/subscriptions/trial.service.js";
import {
    extractDomain,
    normalizeCompanyName,
    evaluateTrialEligibility
} from "../modules/subscriptions/trialEligibility.service.js";
import {
    hashPassword
} from "../utils/helpers/password.helper.js";

const cleanupIds = {
    auths: [],
    subscriptions: [],
    profiles: []
};

async function runTestSuite() {
    console.log("================================================================================");
    console.log("   CREATORLINK SUBSCRIPTION PHASE 2, STEP 2: BRAND TRIAL INTEGRATION TEST       ");
    console.log("================================================================================");

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas successfully.\n");

    try {
        const timestamp = Date.now();
        const hashedPassword = await hashPassword("TestPassword@123");

        // --------------------------------------------------------------------------------
        // TEST 1: Unit Logic for Domain & Company Name Normalization
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 1: Business Identity Normalization Helpers");
        const domain1 = extractDomain("brand@nike.com");
        const domain2 = extractDomain("https://www.nike.com/in/shop");
        const domain3 = extractDomain("nike.com");
        const domain4 = extractDomain("user@gmail.com");

        if (domain1 !== "nike.com" || domain2 !== "nike.com" || domain3 !== "nike.com" || domain4 !== "gmail.com") {
            throw new Error(`Domain extraction failed: got ${domain1}, ${domain2}, ${domain3}, ${domain4}`);
        }

        const norm1 = normalizeCompanyName("Nike India Pvt. Ltd.");
        const norm2 = normalizeCompanyName("nike-india-pvt-ltd");
        if (norm1 !== norm2 || norm1 !== "nikeindiapvtltd") {
            throw new Error(`Company normalization failed: got ${norm1} vs ${norm2}`);
        }
        console.log("  ✔ Domain extraction and company normalization pass with 100% accuracy.\n");

        // --------------------------------------------------------------------------------
        // TEST 2: Brand Trial Creation on Successful Brand Registration
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 2: Automatic 5-Day Trial Creation for New Brand");
        const brandEmail = `testbrand_${timestamp}@testbrandco.com`;
        const brandUser = await Auth.create({
            name: "Test Brand Corporation",
            email: brandEmail,
            password: hashedPassword,
            role: "brand",
            isVerified: true
        });
        cleanupIds.auths.push(brandUser._id);

        const beforeTime = Date.now();
        const trialResult = await createBrandTrialSubscriptionService({
            brandId: brandUser._id,
            email: brandUser.email,
            name: brandUser.name
        });
        const afterTime = Date.now();

        if (!trialResult.isNew || !trialResult.subscription) {
            throw new Error("Expected isNew: true and subscription object returned");
        }

        const sub = trialResult.subscription;
        cleanupIds.subscriptions.push(sub._id);

        // Verify Brand ID reference
        if (sub.brand.toString() !== brandUser._id.toString()) {
            throw new Error(`Subscription brand ID mismatch: expected ${brandUser._id}, got ${sub.brand}`);
        }

        // Verify status and billingCycle
        if (sub.status !== "trialing") {
            throw new Error(`Expected status: 'trialing', got: '${sub.status}'`);
        }
        if (sub.billingCycle !== "trial") {
            throw new Error(`Expected billingCycle: 'trial', got: '${sub.billingCycle}'`);
        }

        // Verify null plan and clean planSnapshot
        if (sub.plan !== null) {
            throw new Error(`Expected sub.plan to be null, got: ${sub.plan}`);
        }
        if (sub.planSnapshot.slug !== "trial" || sub.planSnapshot.price !== 0 || sub.planSnapshot.currency !== "INR") {
            throw new Error(`Invalid planSnapshot: ${JSON.stringify(sub.planSnapshot)}`);
        }

        // Verify UTC dates: trialEndDate = trialStartDate + exactly 5 days (432,000,000 ms)
        const startMs = new Date(sub.trialStartDate).getTime();
        const endMs = new Date(sub.trialEndDate).getTime();
        const diffDays = (endMs - startMs) / (1000 * 60 * 60 * 24);

        if (Math.abs(diffDays - 5) > 0.001) {
            throw new Error(`Trial duration is not exactly 5 days. Difference in days: ${diffDays}`);
        }
        if (startMs < beforeTime || startMs > afterTime) {
            throw new Error(`Trial start timestamp ${startMs} is outside execution window [${beforeTime}, ${afterTime}]`);
        }

        // Verify Quota State: exactly 5 unique creators total
        if (sub.quotaState.trialQuotaLimit !== 5 || sub.quotaState.trialQuotaUsed !== 0) {
            throw new Error(`Trial quota state invalid: limit=${sub.quotaState.trialQuotaLimit}, used=${sub.quotaState.trialQuotaUsed}`);
        }
        if (sub.quotaState.currentCalendarMonthKey !== "") {
            throw new Error(`Trial quota must not be bound to calendar month key, got '${sub.quotaState.currentCalendarMonthKey}'`);
        }

        // Verify Razorpay fields are empty (no automatic payment charge)
        if (sub.razorpayPaymentId !== "" || sub.razorpayOrderId !== "") {
            throw new Error("Razorpay payment fields must be empty for free trial");
        }

        console.log(`  ✔ Brand trial created with ID: ${sub._id}`);
        console.log(`  ✔ UTC Start Date: ${sub.trialStartDate.toISOString()}`);
        console.log(`  ✔ UTC End Date:   ${sub.trialEndDate.toISOString()}`);
        console.log(`  ✔ Trial Quota:    ${sub.quotaState.trialQuotaLimit} total unlocks\n`);

        // --------------------------------------------------------------------------------
        // TEST 3: Creators and Admins must NEVER receive a Brand Trial
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 3: Role Safety (Creators and Admins Cannot Receive Brand Trial)");
        const creatorEmail = `testcreator_${timestamp}@example.com`;
        const creatorUser = await Auth.create({
            name: "Test Creator User",
            email: creatorEmail,
            password: hashedPassword,
            role: "creator",
            isVerified: true
        });
        cleanupIds.auths.push(creatorUser._id);

        let creatorRejected = false;
        try {
            await createBrandTrialSubscriptionService({
                brandId: creatorUser._id,
                email: creatorUser.email
            });
        } catch (err) {
            creatorRejected = true;
            if (err.statusCode !== 400) {
                throw new Error(`Expected status 400 for creator trial rejection, got ${err.statusCode}`);
            }
        }
        if (!creatorRejected) {
            throw new Error("Creator user was unexpectedly allowed to receive a brand trial subscription!");
        }

        const adminEmail = `testadmin_${timestamp}@creatorlink.com`;
        const adminUser = await Auth.create({
            name: "Test Admin User",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            isVerified: true
        });
        cleanupIds.auths.push(adminUser._id);

        let adminRejected = false;
        try {
            await createBrandTrialSubscriptionService({
                brandId: adminUser._id,
                email: adminUser.email
            });
        } catch (err) {
            adminRejected = true;
            if (err.statusCode !== 400) {
                throw new Error(`Expected status 400 for admin trial rejection, got ${err.statusCode}`);
            }
        }
        if (!adminRejected) {
            throw new Error("Admin user was unexpectedly allowed to receive a brand trial subscription!");
        }

        console.log("  ✔ Creators and Admins correctly blocked from receiving trial subscriptions.\n");

        // --------------------------------------------------------------------------------
        // TEST 4: Strict Idempotency Check (Never Resets Dates or Quota)
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 4: Strict Idempotency & Immutability Verification");
        const originalStartMs = startMs;
        const originalEndMs = endMs;

        // Simulate repeated call to createBrandTrialSubscriptionService
        const repeatResult = await createBrandTrialSubscriptionService({
            brandId: brandUser._id,
            email: brandUser.email
        });

        if (repeatResult.isNew !== false) {
            throw new Error("Expected repeat call to return isNew: false");
        }
        if (repeatResult.subscription._id.toString() !== sub._id.toString()) {
            throw new Error("Repeat call returned a different subscription ID!");
        }
        if (new Date(repeatResult.subscription.trialStartDate).getTime() !== originalStartMs) {
            throw new Error("trialStartDate was modified on repeat call!");
        }
        if (new Date(repeatResult.subscription.trialEndDate).getTime() !== originalEndMs) {
            throw new Error("trialEndDate was modified on repeat call!");
        }

        // Verify partial unique index prevents duplicate active/trialing subscriptions in DB
        let duplicateThrown = false;
        try {
            await Subscription.create({
                brand: brandUser._id,
                plan: null,
                planSnapshot: sub.planSnapshot,
                status: "trialing",
                billingCycle: "trial",
                trialStartDate: new Date(),
                trialEndDate: new Date(),
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date()
            });
        } catch (err) {
            if (err.code === 11000) {
                duplicateThrown = true;
            } else {
                throw err;
            }
        }
        if (!duplicateThrown) {
            throw new Error("Database failed to enforce unique active subscription for the brand!");
        }

        console.log("  ✔ Trial subscription is strictly idempotent and protected by database index.\n");

        // --------------------------------------------------------------------------------
        // TEST 5: Live Server-Side Expiry and Status Check
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 5: Live Server-Side Timestamp Expiry Evaluation");
        const liveStatusActive = await getBrandSubscriptionStatusService(brandUser._id);
        if (!liveStatusActive.isActive || liveStatusActive.isExpired) {
            throw new Error("Newly created trial evaluated as inactive or expired!");
        }
        if (liveStatusActive.remainingContactQuota !== 5) {
            throw new Error(`Expected remainingContactQuota: 5, got ${liveStatusActive.remainingContactQuota}`);
        }

        // Simulate expired trial by setting trialEndDate into the past
        const expiredSub = await Subscription.findByIdAndUpdate(
            sub._id,
            { trialEndDate: new Date(Date.now() - 1000 * 60) }, // 1 minute in the past
            { new: true }
        );
        const liveStatusExpired = await getBrandSubscriptionStatusService(brandUser._id);
        if (!liveStatusExpired.isExpired) {
            throw new Error("Expected getBrandSubscriptionStatusService to evaluate isExpired: true");
        }

        // Restore trialEndDate
        await Subscription.findByIdAndUpdate(sub._id, { trialEndDate: new Date(originalEndMs) });
        console.log("  ✔ Server-side UTC expiration evaluated dynamically with zero client trust.\n");

        // --------------------------------------------------------------------------------
        // TEST 6: Multi-Signal Trial Eligibility & Fraud Flagging
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 6: Multi-Signal Trial Eligibility (Corporate Domain & Website Signals)");
        
        // Brand 2: Uses public domain @gmail.com (should NOT be flagged even if common)
        const publicBrandUser = await Auth.create({
            name: "Public Brand User",
            email: `freshbrand_${timestamp}@gmail.com`,
            password: hashedPassword,
            role: "brand",
            isVerified: true
        });
        cleanupIds.auths.push(publicBrandUser._id);

        const publicEligibility = await evaluateTrialEligibility({
            brandId: publicBrandUser._id,
            email: publicBrandUser.email,
            companyName: "Fresh Innovators",
            website: "https://freshinnovators.io"
        });
        if (publicEligibility.isFlagged) {
            throw new Error("Public email domain (@gmail.com) should not be flagged as corporate duplicate!");
        }
        if (!publicEligibility.isEligible) {
            throw new Error("Genuine business was blocked!");
        }

        // Brand 3: Registers with matching corporate domain of Brand 1 (@testbrandco.com)
        const dupCorporateBrandUser = await Auth.create({
            name: "Duplicate Corporate Account",
            email: `anotheremployee_${timestamp}@testbrandco.com`,
            password: hashedPassword,
            role: "brand",
            isVerified: true
        });
        cleanupIds.auths.push(dupCorporateBrandUser._id);

        const dupCorporateEligibility = await evaluateTrialEligibility({
            brandId: dupCorporateBrandUser._id,
            email: dupCorporateBrandUser.email
        });

        if (!dupCorporateEligibility.isFlagged) {
            throw new Error("Expected duplicate corporate email domain to be flagged for Admin review!");
        }
        if (!dupCorporateEligibility.isEligible) {
            throw new Error("Genuine business must NOT be rejected automatically!");
        }
        if (!dupCorporateEligibility.matchedSignals.some(s => s.includes("@testbrandco.com"))) {
            throw new Error(`Matched signal missing corporate domain: ${JSON.stringify(dupCorporateEligibility.matchedSignals)}`);
        }

        // Create trial for Brand 3: verify it gets created with isFlagged: true on trialEligibility
        const dupTrialResult = await createBrandTrialSubscriptionService({
            brandId: dupCorporateBrandUser._id,
            email: dupCorporateBrandUser.email
        });
        cleanupIds.subscriptions.push(dupTrialResult.subscription._id);

        if (!dupTrialResult.subscription.trialEligibility.isFlagged) {
            throw new Error("Subscription trialEligibility.isFlagged was not persisted!");
        }

        console.log("  ✔ Multi-signal corporate duplicate detected and flagged for Admin review.");
        console.log("  ✔ Genuine businesses never blocked automatically (isEligible: true).\n");

        // --------------------------------------------------------------------------------
        // TEST 7: Profile Update Eligibility Check (Never Resets Trial Dates or Quotas)
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 7: Profile Update Re-Evaluation Safety");
        const initialSubCheck = await Subscription.findById(sub._id);
        const subCreatedAt = initialSubCheck.createdAt.getTime();
        const subQuotaUsed = initialSubCheck.quotaState.trialQuotaUsed;

        // Re-evaluate eligibility for Brand 1 with a duplicate website
        await reEvaluateBrandTrialEligibilityService(brandUser._id, {
            website: "https://www.freshinnovators.io",
            companyName: "Test Brand Corporation"
        });

        const afterProfileSub = await Subscription.findById(sub._id);
        if (afterProfileSub.createdAt.getTime() !== subCreatedAt) {
            throw new Error("Subscription was recreated during profile re-evaluation!");
        }
        if (new Date(afterProfileSub.trialStartDate).getTime() !== originalStartMs) {
            throw new Error("trialStartDate was altered during profile re-evaluation!");
        }
        if (afterProfileSub.quotaState.trialQuotaUsed !== subQuotaUsed) {
            throw new Error("Quota state was altered during profile re-evaluation!");
        }
        console.log("  ✔ Profile updates safely re-evaluate signals without touching trial dates or quotas.\n");

        console.log("================================================================================");
        console.log("   ALL PHASE 2 STEP 2 INTEGRATION TESTS PASSED WITH 100% SUCCESS!              ");
        console.log("================================================================================");

    } finally {
        console.log("\nCleaning up test artifacts...");
        if (cleanupIds.subscriptions.length > 0) {
            await Subscription.deleteMany({ _id: { $in: cleanupIds.subscriptions } });
        }
        if (cleanupIds.profiles.length > 0) {
            await BrandProfile.deleteMany({ _id: { $in: cleanupIds.profiles } });
        }
        if (cleanupIds.auths.length > 0) {
            await Auth.deleteMany({ _id: { $in: cleanupIds.auths } });
        }
        await mongoose.disconnect();
        console.log("Cleaned up and disconnected from MongoDB.\n");
    }
}

runTestSuite().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
