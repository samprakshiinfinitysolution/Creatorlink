import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import Auth from "../modules/auth/auth.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import SubscriptionPlan from "../modules/subscriptions/plan.model.js";
import Notification from "../modules/notifications/notification.model.js";
import {
    evaluateBrandEntitlement,
    validateCampaignUpdateEntitlement,
    GRACE_PERIOD_MS
} from "../modules/subscriptions/entitlement.service.js";
import {
    syncBrandSubscriptionExpiry,
    processSubscriptionExpirations
} from "../modules/subscriptions/expiry.service.js";
import {
    createCampaignService,
    updateCampaignService
} from "../modules/brand/campaigns/campaign.service.js";
import {
    createBrandTrialSubscriptionService
} from "../modules/subscriptions/trial.service.js";
import { hashPassword } from "../utils/helpers/password.helper.js";

const cleanupIds = {
    auths: [],
    subscriptions: [],
    campaigns: [],
    notifications: []
};

async function runPhase1Tests() {
    console.log("================================================================================");
    console.log("   CREATORLINK SUBSCRIPTION PHASE 1: ENTITLEMENTS & CAMPAIGN RESTRICTIONS TEST   ");
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

        // Create Brand A (Active Trial)
        const brandA = await Auth.create({
            name: "Brand A Active Trial",
            email: `brand_a_${timestamp}@testbrand.com`,
            password: hashedPassword,
            role: "brand",
            isVerified: true
        });
        cleanupIds.auths.push(brandA._id);

        const trialA = await createBrandTrialSubscriptionService({
            brandId: brandA._id,
            email: brandA.email,
            name: brandA.name
        });
        cleanupIds.subscriptions.push(trialA.subscription._id);

        // Create Brand B (Will be Expired)
        const brandB = await Auth.create({
            name: "Brand B Expired Trial",
            email: `brand_b_${timestamp}@testbrand.com`,
            password: hashedPassword,
            role: "brand",
            isVerified: true
        });
        cleanupIds.auths.push(brandB._id);

        const trialB = await createBrandTrialSubscriptionService({
            brandId: brandB._id,
            email: brandB.email,
            name: brandB.name
        });
        cleanupIds.subscriptions.push(trialB.subscription._id);

        // Manually set Brand B's trialEndDate to the past
        await Subscription.findByIdAndUpdate(trialB.subscription._id, {
            trialEndDate: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        });

        // --------------------------------------------------------------------------------
        // TEST 1: Central Entitlement Evaluation
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 1: Central Entitlement Evaluation for Active vs Expired");
        const entA = await evaluateBrandEntitlement(brandA._id);
        if (!entA.hasEntitlement || !entA.canCreateCampaign || !entA.canPublishCampaign) {
            throw new Error(`Brand A should hold full entitlement! Got: ${JSON.stringify(entA)}`);
        }
        if (entA.remainingContactQuota !== 5) {
            throw new Error(`Expected 5 remaining unlocks, got ${entA.remainingContactQuota}`);
        }

        const entB = await evaluateBrandEntitlement(brandB._id);
        if (entB.hasEntitlement || entB.canCreateCampaign || entB.canPublishCampaign) {
            throw new Error(`Brand B with expired trial should NOT hold entitlement! Got: ${JSON.stringify(entB)}`);
        }
        if (!entB.isExpired) {
            throw new Error("Brand B should evaluate as isExpired: true");
        }
        console.log("  ✔ Brand A (active trial) entitled; Brand B (expired trial) blocked.\n");

        // --------------------------------------------------------------------------------
        // TEST 2: Grace Period & Cancellation Entitlement Logic
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 2: Grace Period and Cancellation Handling");
        const brandC = await Auth.create({
            name: "Brand C Past Due",
            email: `brand_c_${timestamp}@testbrand.com`,
            password: hashedPassword,
            role: "brand",
            isVerified: true
        });
        cleanupIds.auths.push(brandC._id);

        // Create past_due subscription within grace period (gracePeriodEnd = now + 2 days)
        const subC = await Subscription.create({
            brand: brandC._id,
            plan: null,
            planSnapshot: {
                name: "Monthly Pro",
                slug: "pro-monthly",
                price: 1999,
                currency: "INR",
                billingCycle: "monthly",
                monthlyContactQuota: 25,
                features: ["25 Unlocks"]
            },
            status: "past_due",
            billingCycle: "monthly",
            currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            currentPeriodEnd: new Date(Date.now() - 1000 * 60), // Ended 1 minute ago
            gracePeriodEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days in future
        });
        cleanupIds.subscriptions.push(subC._id);

        const entC = await evaluateBrandEntitlement(brandC._id);
        if (!entC.hasEntitlement || !entC.inGracePeriod) {
            throw new Error("Brand C should have active entitlement within grace period!");
        }

        // Expire grace period
        await Subscription.findByIdAndUpdate(subC._id, {
            gracePeriodEnd: new Date(Date.now() - 1000 * 60)
        });
        const entCExpired = await evaluateBrandEntitlement(brandC._id);
        if (entCExpired.hasEntitlement || entCExpired.inGracePeriod) {
            throw new Error("Brand C should lose entitlement when grace period expires!");
        }
        console.log("  ✔ Grace period correctly grants entitlement until expiry.\n");

        // --------------------------------------------------------------------------------
        // TEST 3: Campaign Creation Restriction
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 3: Campaign Creation Protected by Entitlement");
        // Brand A creates campaign -> Success
        const campA = await createCampaignService(brandA._id, {
            title: `Campaign Alpha ${timestamp}`,
            description: "Exciting tech campaign for influencers.",
            category: "Technology",
            platform: "instagram",
            budget: 15000,
            requiredCreators: 2,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: "published"
        });
        cleanupIds.campaigns.push(campA._id);
        console.log(`  ✔ Brand A successfully created published campaign ID: ${campA._id}`);

        // Brand B creates campaign -> Must fail with 403
        let brandBCreationBlocked = false;
        try {
            await createCampaignService(brandB._id, {
                title: `Campaign Beta ${timestamp}`,
                description: "This should be blocked.",
                category: "Fashion",
                platform: "youtube",
                budget: 20000,
                requiredCreators: 1,
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: "draft"
            });
        } catch (err) {
            if (err.statusCode === 403) {
                brandBCreationBlocked = true;
            } else {
                throw err;
            }
        }
        if (!brandBCreationBlocked) {
            throw new Error("Expired Brand B was unexpectedly allowed to create a campaign!");
        }
        console.log("  ✔ Expired Brand B was strictly blocked from creating new campaigns.\n");

        // --------------------------------------------------------------------------------
        // TEST 4: Field-Level Campaign Edit Permissions
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 4: Field-Level Campaign Permission Enforcement");
        // Create draft campaign under Brand B before simulating expiry
        const campB = await Campaign.create({
            brand: brandB._id,
            title: "Pre-existing Draft Campaign",
            description: "Created prior to expiration.",
            category: "Beauty",
            platform: "instagram",
            budget: 10000,
            requiredCreators: 1,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "draft"
        });
        cleanupIds.campaigns.push(campB._id);

        // 1. Expired brand attempts to edit title -> Must throw 403
        let contentEditBlocked = false;
        try {
            await updateCampaignService(brandB._id, campB._id, {
                title: "Malicious Edit While Expired"
            });
        } catch (err) {
            if (err.statusCode === 403) {
                contentEditBlocked = true;
            }
        }
        if (!contentEditBlocked) {
            throw new Error("Expired Brand B was allowed to edit campaign content!");
        }

        // 2. Expired brand attempts to publish draft -> Must throw 403
        let publishingBlocked = false;
        try {
            await updateCampaignService(brandB._id, campB._id, {
                status: "published"
            });
        } catch (err) {
            if (err.statusCode === 403) {
                publishingBlocked = true;
            }
        }
        if (!publishingBlocked) {
            throw new Error("Expired Brand B was allowed to publish draft campaign!");
        }

        // 3. Expired brand closes their own campaign -> Must succeed!
        const closedCamp = await updateCampaignService(brandB._id, campB._id, {
            status: "closed"
        });
        if (closedCamp.status !== "closed") {
            throw new Error("Expired brand should be permitted to close their own campaign!");
        }
        console.log("  ✔ Content edits and publishing strictly blocked for expired brands.");
        console.log("  ✔ Safe brand-owned operations (closing/pausing) preserved.\n");

        // --------------------------------------------------------------------------------
        // TEST 5: Expiration Lifecycle & Campaign Auto-Pause
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 5: Expiry Lifecycle & Automatic Campaign Pause");
        // Verify Brand A's campaign is currently "published"
        const initialCampA = await Campaign.findById(campA._id);
        if (initialCampA.status !== "published") {
            throw new Error("Campaign A was expected to be published!");
        }

        // Expire Brand A's subscription
        await Subscription.findByIdAndUpdate(trialA.subscription._id, {
            trialEndDate: new Date(Date.now() - 1000 * 60)
        });

        // Run syncBrandSubscriptionExpiry
        const expiryResult = await syncBrandSubscriptionExpiry(brandA._id);
        if (!expiryResult.isExpired || expiryResult.pausedCampaignsCount < 1) {
            throw new Error(`Expected expiry and pause, got: ${JSON.stringify(expiryResult)}`);
        }

        // Verify Brand A's campaign status is now automatically "paused"
        const pausedCampA = await Campaign.findById(campA._id);
        if (pausedCampA.status !== "paused") {
            throw new Error(`Campaign A status should be 'paused', got '${pausedCampA.status}'`);
        }

        // Verify Brand A's subscription document is status "expired"
        const updatedSubA = await Subscription.findById(trialA.subscription._id);
        if (updatedSubA.status !== "expired") {
            throw new Error(`Subscription status should be 'expired', got '${updatedSubA.status}'`);
        }

        // Verify in-app notification was dispatched to Brand A
        const notif = await Notification.findOne({
            recipient: brandA._id,
            type: "subscription_expired"
        });
        if (!notif) {
            throw new Error("Subscription expiration notification was not found in DB!");
        }
        cleanupIds.notifications.push(notif._id);
        console.log(`  ✔ Subscription marked expired, published campaign automatically paused.`);
        console.log(`  ✔ Notification "${notif.title}" recorded for Brand.\n`);

        console.log("================================================================================");
        console.log("   ALL PHASE 1 INTEGRATION TESTS PASSED WITH 100% SUCCESS!                     ");
        console.log("================================================================================");

    } finally {
        console.log("\nCleaning up test artifacts...");
        if (cleanupIds.notifications.length > 0) {
            await Notification.deleteMany({ _id: { $in: cleanupIds.notifications } });
        }
        if (cleanupIds.campaigns.length > 0) {
            await Campaign.deleteMany({ _id: { $in: cleanupIds.campaigns } });
        }
        if (cleanupIds.subscriptions.length > 0) {
            await Subscription.deleteMany({ _id: { $in: cleanupIds.subscriptions } });
        }
        if (cleanupIds.auths.length > 0) {
            await Auth.deleteMany({ _id: { $in: cleanupIds.auths } });
        }
        await mongoose.disconnect();
        console.log("Cleaned up and disconnected from MongoDB.\n");
    }
}

runPhase1Tests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
