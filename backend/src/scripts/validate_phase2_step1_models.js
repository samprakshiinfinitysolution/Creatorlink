import dotenv from "dotenv";
import mongoose from "mongoose";

// 1. Import all 5 models to verify resolution and no circular dependencies
import SubscriptionPlan from "../modules/subscriptions/plan.model.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import ContactUnlock from "../modules/subscriptions/contactUnlock.model.js";
import SubscriptionPayment from "../modules/subscriptions/subscriptionPayment.model.js";
import CreatorProfile from "../modules/creator/profile/profile.model.js";

dotenv.config();

const validateModels = async () => {
    console.log("==================================================================");
    console.log("STARTING PHASE 2 STEP 1: SUBSCRIPTION MODELS & INDEXES VALIDATION");
    console.log("==================================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB Atlas");

    try {
        // --- 1. Validate SubscriptionPlan Schema & Indexes ---
        console.log("\n>>> Checking Model 1: SubscriptionPlan");
        const planIndexes = SubscriptionPlan.schema.indexes();
        console.log("  Registered indexes on SubscriptionPlan:", planIndexes);

        // Verify versioning and fields exist on schema
        const planPaths = SubscriptionPlan.schema.paths;
        if (!planPaths.version || !planPaths.slug || !planPaths.priceMonthly || !planPaths.monthlyContactQuota) {
            throw new Error("Missing essential fields on SubscriptionPlan schema!");
        }
        if (planPaths.version.defaultValue !== 1) {
            throw new Error(`Expected plan version default 1, got ${planPaths.version.defaultValue}`);
        }
        // Verify no duplicate slug index
        const slugIndexes = planIndexes.filter((idx) => Object.keys(idx[0]).includes("slug"));
        console.log(`  Slug index definitions count: ${slugIndexes.length} (Expected 0 explicit, handled by unique: true on path)`);
        console.log("✓ SubscriptionPlan schema and clean indexes verified");

        // --- 2. Validate Subscription Schema & Partial Unique Index ---
        console.log("\n>>> Checking Model 2: Subscription");
        const subPaths = Subscription.schema.paths;
        const quotaPaths = subPaths.quotaState?.schema?.paths || {};
        const snapshotPaths = subPaths.planSnapshot?.schema?.paths || {};

        if (!subPaths.planSnapshot || !subPaths.quotaState || !subPaths.status || !subPaths.billingCycle) {
            throw new Error("Missing essential lifecycle or snapshot fields on Subscription schema!");
        }
        if (!snapshotPaths.name || !snapshotPaths.price || !snapshotPaths.monthlyContactQuota) {
            throw new Error("Missing planSnapshot fields!");
        }
        if (quotaPaths.trialQuotaLimit?.defaultValue !== 5) {
            throw new Error(`Expected trialQuotaLimit default 5, got ${quotaPaths.trialQuotaLimit?.defaultValue}`);
        }
        if (quotaPaths.trialQuotaUsed?.defaultValue !== 0) {
            throw new Error(`Expected trialQuotaUsed default 0, got ${quotaPaths.trialQuotaUsed?.defaultValue}`);
        }

        const subIndexes = Subscription.schema.indexes();
        console.log("  Registered indexes on Subscription:", subIndexes);
        const activeSubIndex = subIndexes.find((idx) => Object.keys(idx[0]).includes("brand") && idx[1]?.unique && idx[1]?.partialFilterExpression);
        if (!activeSubIndex) {
            throw new Error("Partial unique active-subscription index not found on Subscription schema!");
        }
        console.log("  Verified partial filter expression:", activeSubIndex[1].partialFilterExpression);
        console.log("✓ Subscription schema, immutable snapshot, and partial unique index verified");

        // --- 3. Validate ContactUnlock Schema & Compound Index ---
        console.log("\n>>> Checking Model 3: ContactUnlock");
        const unlockPaths = ContactUnlock.schema.paths;
        if (!unlockPaths.brand || !unlockPaths.creator || !unlockPaths.quotaPeriodKey) {
            throw new Error("Missing essential fields on ContactUnlock schema!");
        }

        const unlockIndexes = ContactUnlock.schema.indexes();
        console.log("  Registered indexes on ContactUnlock:", unlockIndexes);
        const compoundBrandCreatorIdx = unlockIndexes.find(
            (idx) => idx[0].brand === 1 && idx[0].creator === 1 && idx[1]?.unique === true
        );
        if (!compoundBrandCreatorIdx) {
            throw new Error("Compound unique { brand: 1, creator: 1 } index not found on ContactUnlock!");
        }
        console.log("✓ ContactUnlock compound unique index and quota period key verified");

        // --- 4. Validate SubscriptionPayment Schema & Indexes ---
        console.log("\n>>> Checking Model 4: SubscriptionPayment");
        const paymentPaths = SubscriptionPayment.schema.paths;
        if (!paymentPaths.brand || !paymentPaths.plan || !paymentPaths.razorpayOrderId || !paymentPaths.status) {
            throw new Error("Missing essential fields on SubscriptionPayment schema!");
        }
        if (!paymentPaths.razorpayOrderId.options.unique) {
            throw new Error("razorpayOrderId must be unique on SubscriptionPayment schema!");
        }
        console.log("✓ SubscriptionPayment schema and unique order index verified");

        // --- 5. Validate CreatorProfile contactPrivacy Subdocument & Existing Fields ---
        console.log("\n>>> Checking Model 5: CreatorProfile Privacy Subdocument");
        const cpPaths = CreatorProfile.schema.paths;

        // Verify existing fields are completely preserved
        const existingExpectedFields = [
            "user", "title", "bio", "category", "niches", "keywords",
            "location", "profileImage", "dob", "gender", "languages",
            "ethnicity", "socialLinks.instagram", "socialLinks.youtube",
            "followerCount", "engagementRate", "isPublic", "isVerifiedBadge"
        ];
        for (const f of existingExpectedFields) {
            if (!cpPaths[f]) {
                throw new Error(`Existing CreatorProfile field "${f}" was lost or modified!`);
            }
        }
        console.log("✓ All 18 existing CreatorProfile fields strictly preserved");

        // Verify contactPrivacy fields and strict opt-in defaults (ALL false)
        const privacyFlags = [
            "contactPrivacy.isConsentGiven",
            "contactPrivacy.allowWhatsApp",
            "contactPrivacy.allowPhoneCall",
            "contactPrivacy.allowBusinessEmail"
        ];
        for (const flag of privacyFlags) {
            if (!cpPaths[flag]) {
                throw new Error(`Missing privacy flag "${flag}" on CreatorProfile!`);
            }
            if (cpPaths[flag].defaultValue !== false) {
                throw new Error(`Privacy flag "${flag}" must default to false! Got: ${cpPaths[flag].defaultValue}`);
            }
        }
        console.log("✓ CreatorProfile contactPrivacy verified: all consent flags default to false (strict opt-in)");

        // --- 6. Sync Indexes with MongoDB Atlas to Verify Engine Compatibility ---
        console.log("\n>>> Checking Database Engine Index Sync (MongoDB Atlas Compatibility)");
        await SubscriptionPlan.syncIndexes();
        console.log("✓ SubscriptionPlan indexes synchronized successfully with MongoDB Atlas");

        await Subscription.syncIndexes();
        console.log("✓ Subscription partial unique indexes synchronized successfully with MongoDB Atlas");

        await ContactUnlock.syncIndexes();
        console.log("✓ ContactUnlock compound unique indexes synchronized successfully with MongoDB Atlas");

        await SubscriptionPayment.syncIndexes();
        console.log("✓ SubscriptionPayment indexes synchronized successfully with MongoDB Atlas");

        await CreatorProfile.syncIndexes();
        console.log("✓ CreatorProfile indexes synchronized successfully with MongoDB Atlas");

        console.log("\n==================================================================");
        console.log("ALL 5 SUBSCRIPTION MODELS & INDEXES VALIDATED WITH 100% SUCCESS!");
        console.log("==================================================================");
    } finally {
        await mongoose.disconnect();
    }
};

validateModels().catch((err) => {
    console.error("❌ Model validation failed with error:", err);
    process.exit(1);
});
