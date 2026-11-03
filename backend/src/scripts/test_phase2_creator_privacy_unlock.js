import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import Auth from "../modules/auth/auth.model.js";
import CreatorProfile from "../modules/creator/profile/profile.model.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import ContactUnlock from "../modules/subscriptions/contactUnlock.model.js";
import {
    checkCreatorUnlockStatusService,
    unlockCreatorContactService,
    getBrandUnlockedCreatorsService,
    updateCreatorContactConsentService,
    getCreatorContactConsentService
} from "../modules/subscriptions/contactUnlock.service.js";
import {
    createBrandTrialSubscriptionService
} from "../modules/subscriptions/trial.service.js";
import { hashPassword } from "../utils/helpers/password.helper.js";

const cleanupIds = {
    auths: [],
    subscriptions: [],
    profiles: [],
    unlocks: []
};

async function runPhase2Tests() {
    console.log("================================================================================");
    console.log("   CREATORLINK SUBSCRIPTION PHASE 2: CREATOR PRIVACY & BRAND UNLOCK TEST        ");
    console.log("================================================================================");

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI environment variable is required");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas successfully.\n");

    try {
        const timestamp = Date.now();
        const hashedPassword = await hashPassword("TestPass@123");

        // --------------------------------------------------------------------------------
        // 1. Create Brand with Active 5-Day Trial (5 Unlocks)
        // --------------------------------------------------------------------------------
        const brand = await Auth.create({
            name: "Test Brand Unlocker",
            email: `brand_unlock_${timestamp}@testbrand.com`,
            password: hashedPassword,
            role: "brand",
            isVerified: true
        });
        cleanupIds.auths.push(brand._id);

        const trial = await createBrandTrialSubscriptionService({
            brandId: brand._id,
            email: brand.email,
            name: brand.name
        });
        cleanupIds.subscriptions.push(trial.subscription._id);
        console.log(`Created Brand with 5-day trial ID: ${trial.subscription._id}`);

        // --------------------------------------------------------------------------------
        // 2. Create 6 Test Creators
        // --------------------------------------------------------------------------------
        const creators = [];
        for (let i = 1; i <= 6; i++) {
            const creatorUser = await Auth.create({
                name: `Creator ${i} ${timestamp}`,
                email: `creator_${i}_${timestamp}@testcreator.com`,
                password: hashedPassword,
                role: "creator",
                isVerified: true
            });
            cleanupIds.auths.push(creatorUser._id);

            const creatorProf = await CreatorProfile.create({
                user: creatorUser._id,
                title: `Tech Creator ${i}`,
                category: "Technology",
                isPublic: true,
                contactPrivacy: {
                    isConsentGiven: false,
                    allowWhatsApp: false,
                    allowPhoneCall: false,
                    allowBusinessEmail: false,
                    whatsappNumber: `+91980000000${i}`,
                    businessPhone: `+91980000000${i}`,
                    businessEmail: `business_c${i}@testcreator.com`
                }
            });
            cleanupIds.profiles.push(creatorProf._id);
            creators.push({ user: creatorUser, profile: creatorProf });
        }
        console.log(`Created 6 test Creators with default strict opt-in consent (all false).\n`);

        // --------------------------------------------------------------------------------
        // TEST 1: Creator Privacy & Live Consent Management
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 1: Creator Consent Settings & Selective Channel Disclosure");
        const c1 = creators[0];

        // Verify defaults
        const defaultConsent = await getCreatorContactConsentService(c1.user._id);
        if (defaultConsent.isConsentGiven !== false || defaultConsent.allowWhatsApp !== false) {
            throw new Error("Creator contactPrivacy must default to false for all sharing flags!");
        }

        // Creator 1 opts in, but ONLY for WhatsApp and Business Email (Phone calls disabled)
        await updateCreatorContactConsentService(c1.user._id, {
            isConsentGiven: true,
            allowWhatsApp: true,
            allowPhoneCall: false,
            allowBusinessEmail: true,
            whatsappNumber: "+919876543210",
            businessEmail: "collab@creator1.com"
        });

        const updatedConsent = await getCreatorContactConsentService(c1.user._id);
        if (!updatedConsent.isConsentGiven || !updatedConsent.allowWhatsApp || updatedConsent.allowPhoneCall) {
            throw new Error("Creator consent update failed to reflect selective channel settings!");
        }
        console.log("  ✔ Creator consent successfully updated with selective channel permissions.\n");

        // --------------------------------------------------------------------------------
        // TEST 2: Brand First Unlock & Quota Consumption
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 2: First Creator Unlock (Consumes 1 Quota)");
        const unlock1 = await unlockCreatorContactService({
            brandId: brand._id,
            creatorId: c1.user._id
        });

        if (!unlock1.isNewUnlock || unlock1.alreadyUnlocked) {
            throw new Error("First unlock should be isNewUnlock: true, alreadyUnlocked: false");
        }
        if (!unlock1.isConsentGiven) {
            throw new Error("Creator 1 has consent=true, response should indicate isConsentGiven: true");
        }
        // Verify selective channel filtering: WhatsApp and Email visible, Phone null
        if (unlock1.contactDetails.whatsappNumber !== "+919876543210" || unlock1.contactDetails.businessEmail !== "collab@creator1.com") {
            throw new Error(`Permitted contact channels not disclosed! Got: ${JSON.stringify(unlock1.contactDetails)}`);
        }
        if (unlock1.contactDetails.businessPhone !== null) {
            throw new Error("Disabled channel (businessPhone) was leaked!");
        }

        // Verify quota consumed
        const subAfter1 = await Subscription.findById(trial.subscription._id);
        if (subAfter1.quotaState.trialQuotaUsed !== 1) {
            throw new Error(`Expected trialQuotaUsed = 1, got ${subAfter1.quotaState.trialQuotaUsed}`);
        }
        console.log("  ✔ Creator 1 successfully unlocked. Permitted channels disclosed, disabled phone hidden.");
        console.log(`  ✔ Quota consumed: 1 used, 4 remaining.\n`);

        // --------------------------------------------------------------------------------
        // TEST 3: Permanent Unlock Rule (Repeated Unlock NEVER Consumes Quota)
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 3: Repeated Unlock of Creator 1 (Zero Quota Consumption)");
        const repeatUnlock = await unlockCreatorContactService({
            brandId: brand._id,
            creatorId: c1.user._id
        });

        if (repeatUnlock.isNewUnlock || !repeatUnlock.alreadyUnlocked) {
            throw new Error("Repeated unlock should return isNewUnlock: false, alreadyUnlocked: true");
        }

        // Check subscription quota state
        const subAfterRepeat = await Subscription.findById(trial.subscription._id);
        if (subAfterRepeat.quotaState.trialQuotaUsed !== 1) {
            throw new Error(`Repeated unlock incorrectly consumed quota! trialQuotaUsed = ${subAfterRepeat.quotaState.trialQuotaUsed}`);
        }
        console.log("  ✔ Repeated unlock returned cached record. Quota remains strictly at 1 used.\n");

        // --------------------------------------------------------------------------------
        // TEST 4: Live Consent Revocation Override
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 4: Live Creator Consent Revocation Overrides Historical Unlock");
        // Creator 1 decides to revoke consent
        await updateCreatorContactConsentService(c1.user._id, {
            isConsentGiven: false
        });

        // Brand retrieves unlock status for Creator 1
        const statusAfterRevoke = await checkCreatorUnlockStatusService({
            brandId: brand._id,
            creatorId: c1.user._id
        });

        if (!statusAfterRevoke.isUnlocked) {
            throw new Error("Brand should still hold unlock record for Creator 1");
        }
        if (statusAfterRevoke.isConsentGiven !== false) {
            throw new Error("Live consent revocation was not respected!");
        }
        if (statusAfterRevoke.contactDetails !== null) {
            throw new Error("Contact details must be MASKED/NULL when creator revokes consent!");
        }
        console.log("  ✔ Contact details dynamically masked upon creator consent revocation.\n");

        // Restore Creator 1 consent
        await updateCreatorContactConsentService(c1.user._id, { isConsentGiven: true, allowWhatsApp: true });

        // --------------------------------------------------------------------------------
        // TEST 5: Quota Exhaustion (Unlocking Creators 2, 3, 4, 5)
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 5: Consuming Remaining Quota to Capacity (5 Unlocks Total)");
        for (let i = 1; i <= 4; i++) {
            const c = creators[i];
            await updateCreatorContactConsentService(c.user._id, { isConsentGiven: true, allowWhatsApp: true });
            const u = await unlockCreatorContactService({
                brandId: brand._id,
                creatorId: c.user._id
            });
            if (!u.isNewUnlock) {
                throw new Error(`Unlock for Creator ${i + 1} failed to register as new`);
            }
        }

        const subFull = await Subscription.findById(trial.subscription._id);
        if (subFull.quotaState.trialQuotaUsed !== 5) {
            throw new Error(`Expected trialQuotaUsed = 5, got ${subFull.quotaState.trialQuotaUsed}`);
        }
        console.log("  ✔ Successfully unlocked 5 unique creators. Quota capacity (5/5) reached.\n");

        // --------------------------------------------------------------------------------
        // TEST 6: Sixth Creator Unlock Blocked by Quota Exhaustion
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 6: Sixth Creator Unlock Strictly Blocked");
        const c6 = creators[5];
        let c6Blocked = false;
        try {
            await unlockCreatorContactService({
                brandId: brand._id,
                creatorId: c6.user._id
            });
        } catch (err) {
            if (err.statusCode === 403 && err.message.includes("quota exhausted")) {
                c6Blocked = true;
            } else {
                throw err;
            }
        }
        if (!c6Blocked) {
            throw new Error("Sixth creator unlock was unexpectedly permitted past quota limit!");
        }
        console.log("  ✔ Sixth creator unlock blocked with 403 (Quota Exhausted).\n");

        // --------------------------------------------------------------------------------
        // TEST 7: Unlocked Creators Roster Retrieval
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 7: Retrieve Brand Unlocked Creators List");
        const unlockedList = await getBrandUnlockedCreatorsService(brand._id);
        if (unlockedList.length !== 5) {
            throw new Error(`Expected exactly 5 unlocked creators, got ${unlockedList.length}`);
        }
        console.log(`  ✔ Successfully retrieved roster of ${unlockedList.length} unlocked creators.\n`);

        console.log("================================================================================");
        console.log("   ALL PHASE 2 BACKEND INTEGRATION TESTS PASSED WITH 100% SUCCESS!             ");
        console.log("================================================================================");

    } finally {
        console.log("\nCleaning up test artifacts...");
        const unlockRecords = await ContactUnlock.find({ brand: cleanupIds.auths[0] }).select("_id");
        if (unlockRecords.length > 0) {
            await ContactUnlock.deleteMany({ _id: { $in: unlockRecords.map(u => u._id) } });
        }
        if (cleanupIds.subscriptions.length > 0) {
            await Subscription.deleteMany({ _id: { $in: cleanupIds.subscriptions } });
        }
        if (cleanupIds.profiles.length > 0) {
            await CreatorProfile.deleteMany({ _id: { $in: cleanupIds.profiles } });
        }
        if (cleanupIds.auths.length > 0) {
            await Auth.deleteMany({ _id: { $in: cleanupIds.auths } });
        }
        await mongoose.disconnect();
        console.log("Cleaned up and disconnected from MongoDB.\n");
    }
}

runPhase2Tests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});

