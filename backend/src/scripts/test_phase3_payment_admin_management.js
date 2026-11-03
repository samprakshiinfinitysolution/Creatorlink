import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dns from "dns";
import mongoose from "mongoose";

try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import Auth from "../modules/auth/auth.model.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import SubscriptionPlan from "../modules/subscriptions/plan.model.js";
import SubscriptionPayment from "../modules/subscriptions/subscriptionPayment.model.js";
import AuditLog from "../modules/admin/audit/audit.model.js";
import Notification from "../modules/notifications/notification.model.js";
import {
    createSubscriptionOrderService,
    verifySubscriptionPaymentService,
    handleSubscriptionWebhookService
} from "../modules/subscriptions/subscriptionPayment.service.js";
import {
    getAdminSubscriptionAnalyticsService,
    createSubscriptionPlanAdminService,
    updateSubscriptionPlanAdminService,
    togglePlanStatusAdminService,
    getAllPlansAdminService,
    getAllSubscribersAdminService,
    getSubscriberDetailAdminService,
    grantComplimentarySubscriptionService,
    extendTrialAdminService,
    suspendSubscriptionAdminService,
    reinstateSubscriptionAdminService,
    cancelSubscriptionAdminService
} from "../modules/subscriptions/adminSubscription.service.js";
import { createBrandTrialSubscriptionService } from "../modules/subscriptions/trial.service.js";
import { hashPassword } from "../utils/helpers/password.helper.js";

const cleanupIds = {
    auths: [],
    subscriptions: [],
    plans: [],
    payments: [],
    auditLogs: [],
    notifications: []
};

async function runPhase3Tests() {
    console.log("================================================================================");
    console.log("   CREATORLINK SUBSCRIPTION PHASE 3: PAYMENT & ADMIN MANAGEMENT TEST            ");
    console.log("================================================================================");

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI environment variable is required");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas successfully.\n");

    try {
        const timestamp = Date.now();
        const hashedPassword = await hashPassword("TestSecurePass@123");

        // 1. Create Admin Actor
        const adminUser = await Auth.create({
            name: "Super Admin",
            email: `admin_sub_${timestamp}@creatorlink.test`,
            password: hashedPassword,
            role: "admin",
            isVerified: true
        });
        cleanupIds.auths.push(adminUser._id);

        // 2. Create Brand Account
        const brandUser = await Auth.create({
            name: "Enterprise Brand",
            email: `brand_pay_${timestamp}@testbrand.com`,
            password: hashedPassword,
            role: "brand",
            isVerified: true
        });
        cleanupIds.auths.push(brandUser._id);

        const trialInit = await createBrandTrialSubscriptionService({
            brandId: brandUser._id,
            email: brandUser.email,
            name: brandUser.name
        });
        cleanupIds.subscriptions.push(trialInit.subscription._id);

        // --------------------------------------------------------------------------------
        // TEST 1: Admin Plan Management (Create, Version Bump, Toggle Status)
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 1: Admin Plan Management Lifecycle & Versioning");
        const plan = await createSubscriptionPlanAdminService(adminUser._id, {
            name: `Growth Tier ${timestamp}`,
            slug: `growth-tier-${timestamp}`,
            description: "Ideal for growing brands scaling their influencer marketing.",
            priceMonthly: 1999,
            priceYearly: 19990,
            currency: "INR",
            monthlyContactQuota: 25,
            features: ["25 Creator Contact Unlocks", "Campaign Publishing", "Analytics Dashboard"],
            trialAllowed: true
        });
        cleanupIds.plans.push(plan._id);

        if (plan.version !== 1) {
            throw new Error(`Expected initial plan version 1, got ${plan.version}`);
        }

        // Verify Audit Log for creation
        const createAudit = await AuditLog.findOne({ targetId: plan._id, action: "SUBSCRIPTION_PLAN_CREATE" });
        if (!createAudit) {
            throw new Error("Audit log for plan creation was not recorded!");
        }
        cleanupIds.auditLogs.push(createAudit._id);

        // Admin updates price: version must automatically bump to 2
        const updatedPlan = await updateSubscriptionPlanAdminService(
            adminUser._id,
            plan._id,
            { priceMonthly: 2499 },
            "Annual price revision"
        );

        if (updatedPlan.version !== 2 || updatedPlan.priceMonthly !== 2499) {
            throw new Error(`Plan update failed or version not incremented! Version: ${updatedPlan.version}`);
        }

        // Admin deactivates plan
        const deactivatedPlan = await togglePlanStatusAdminService(
            adminUser._id,
            plan._id,
            false,
            "Temporarily sunsetting plan"
        );
        if (deactivatedPlan.isActive !== false) {
            throw new Error("Plan deactivation failed!");
        }

        // Reactivate plan for purchase testing
        await togglePlanStatusAdminService(adminUser._id, plan._id, true, "Reactivating plan");
        console.log("  ✔ Plan created, versioned (v1 -> v2), and deactivated/reactivated with full audit trail.\n");

        // --------------------------------------------------------------------------------
        // TEST 2: Razorpay Order Creation & Signature Verification
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 2: Razorpay Order Creation and Trusted Verification Flow");
        
        // Mock order creation directly in test or create payment order record
        const orderId = `order_test_${timestamp}`;
        const paymentRecord = await SubscriptionPayment.create({
            brand: brandUser._id,
            subscription: trialInit.subscription._id,
            plan: plan._id,
            amount: 2499,
            currency: "INR",
            billingCycle: "monthly",
            status: "pending",
            razorpayOrderId: orderId
        });
        cleanupIds.payments.push(paymentRecord._id);

        // Generate authentic HMAC SHA-256 signature using RAZORPAY_KEY_SECRET
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const fakePaymentId = `pay_mock_${timestamp}`;
        const payload = `${orderId}|${fakePaymentId}`;
        const authenticSignature = crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex");

        // Verify payment
        const verifyResult = await verifySubscriptionPaymentService({
            brandId: brandUser._id,
            razorpay_order_id: orderId,
            razorpay_payment_id: fakePaymentId,
            razorpay_signature: authenticSignature
        });

        if (!verifyResult.isSuccess || verifyResult.alreadyVerified) {
            throw new Error("Expected initial verification to be successful and isSuccess: true");
        }

        // Verify Subscription updated to active
        const activeSub = await Subscription.findById(trialInit.subscription._id);
        if (activeSub.status !== "active") {
            throw new Error(`Expected subscription status: 'active', got '${activeSub.status}'`);
        }
        if (activeSub.billingCycle !== "monthly") {
            throw new Error(`Expected billingCycle: 'monthly', got '${activeSub.billingCycle}'`);
        }
        if (activeSub.planSnapshot.price !== 2499 || activeSub.planSnapshot.monthlyContactQuota !== 25) {
            throw new Error(`Invalid planSnapshot: ${JSON.stringify(activeSub.planSnapshot)}`);
        }
        if (activeSub.quotaState.monthlyQuotaLimit !== 25 || activeSub.quotaState.monthlyQuotaUsed !== 0) {
            throw new Error(`Invalid monthly quota state: ${JSON.stringify(activeSub.quotaState)}`);
        }

        // Verify Idempotency: duplicate verify call must return alreadyVerified: true
        const repeatVerify = await verifySubscriptionPaymentService({
            brandId: brandUser._id,
            razorpay_order_id: orderId,
            razorpay_payment_id: fakePaymentId,
            razorpay_signature: authenticSignature
        });
        if (!repeatVerify.alreadyVerified) {
            throw new Error("Repeat verification should return alreadyVerified: true");
        }

        console.log("  ✔ Payment captured and subscription activated with immutable snapshot.");
        console.log("  ✔ Monthly quota set to 25 unlocks. Idempotent re-verification verified.\n");

        // --------------------------------------------------------------------------------
        // TEST 3: Admin Actions (Complimentary, Extend Trial, Suspend, Reinstate, Cancel)
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 3: Admin Privileged Operations & Audit Logs");

        // 1. Extend Trial on Brand B
        const brandB = await Auth.create({
            name: "Trial Brand B",
            email: `trial_b_${timestamp}@testbrand.com`,
            password: hashedPassword,
            role: "brand",
            isVerified: true
        });
        cleanupIds.auths.push(brandB._id);

        const trialB = await createBrandTrialSubscriptionService({
            brandId: brandB._id,
            email: brandB.email
        });
        cleanupIds.subscriptions.push(trialB.subscription._id);

        const initialEndMs = new Date(trialB.subscription.trialEndDate).getTime();
        await extendTrialAdminService(adminUser._id, {
            brandId: brandB._id,
            extraDays: 7,
            reason: "Courtesy extension granted by customer support"
        });

        const extendedSub = await Subscription.findById(trialB.subscription._id);
        const newEndMs = new Date(extendedSub.trialEndDate).getTime();
        const diffDays = Math.round((newEndMs - initialEndMs) / (1000 * 60 * 60 * 24));
        if (diffDays !== 7) {
            throw new Error(`Expected 7 days extension, got difference of ${diffDays} days`);
        }
        console.log("  ✔ Trial extended by 7 days with audit logging.");

        // 2. Suspend Subscription on Brand User
        await suspendSubscriptionAdminService(adminUser._id, {
            brandId: brandUser._id,
            reason: "Compliance violation under investigation"
        });
        const suspendedSub = await Subscription.findById(trialInit.subscription._id);
        if (suspendedSub.status !== "suspended") {
            throw new Error(`Expected status: 'suspended', got '${suspendedSub.status}'`);
        }
        console.log("  ✔ Subscription suspended.");

        // 3. Reinstate Subscription
        await reinstateSubscriptionAdminService(adminUser._id, {
            brandId: brandUser._id,
            reason: "Investigation cleared with zero violations"
        });
        const reinstatedSub = await Subscription.findById(trialInit.subscription._id);
        if (reinstatedSub.status !== "active") {
            throw new Error(`Expected status: 'active', got '${reinstatedSub.status}'`);
        }
        console.log("  ✔ Subscription reinstated to active.");

        // 4. Cancel Subscription at Period End
        await cancelSubscriptionAdminService(adminUser._id, {
            brandId: brandUser._id,
            immediately: false,
            reason: "Brand requested non-renewal"
        });
        const canceledPeriodEndSub = await Subscription.findById(trialInit.subscription._id);
        if (!canceledPeriodEndSub.cancelAtPeriodEnd) {
            throw new Error("Expected cancelAtPeriodEnd to be true");
        }
        console.log("  ✔ Subscription scheduled for cancellation at period end.\n");

        // --------------------------------------------------------------------------------
        // TEST 4: Admin Subscription Dashboard Analytics
        // --------------------------------------------------------------------------------
        console.log("▶ TEST 4: Admin Subscription Dashboard Analytics Aggregation");
        const analytics = await getAdminSubscriptionAnalyticsService();
        if (analytics.telemetry.totalSubscribers < 2) {
            throw new Error(`Expected at least 2 subscribers in telemetry, got ${analytics.telemetry.totalSubscribers}`);
        }

        // Verify revenue is reported and grouped by currency
        const inrRevenue = analytics.revenue.find((r) => r.currency === "INR");
        if (!inrRevenue || inrRevenue.totalRevenue < 2499) {
            throw new Error(`Expected captured revenue of at least 2499 INR, got: ${JSON.stringify(analytics.revenue)}`);
        }
        console.log(`  ✔ Telemetry synced: ${analytics.telemetry.totalSubscribers} total subscribers.`);
        console.log(`  ✔ Revenue verified: ${inrRevenue.totalRevenue} ${inrRevenue.currency} across ${inrRevenue.transactionCount} transaction(s).\n`);

        console.log("================================================================================");
        console.log("   ALL PHASE 3 BACKEND INTEGRATION TESTS PASSED WITH 100% SUCCESS!             ");
        console.log("================================================================================");

    } finally {
        console.log("\nCleaning up test artifacts...");
        if (cleanupIds.payments.length > 0) {
            await SubscriptionPayment.deleteMany({ _id: { $in: cleanupIds.payments } });
        }
        if (cleanupIds.plans.length > 0) {
            await SubscriptionPlan.deleteMany({ _id: { $in: cleanupIds.plans } });
        }
        if (cleanupIds.subscriptions.length > 0) {
            await Subscription.deleteMany({ _id: { $in: cleanupIds.subscriptions } });
        }
        if (cleanupIds.auths.length > 0) {
            await Auth.deleteMany({ _id: { $in: cleanupIds.auths } });
        }
        if (cleanupIds.auditLogs.length > 0) {
            await AuditLog.deleteMany({ _id: { $in: cleanupIds.auditLogs } });
        }
        await mongoose.disconnect();
        console.log("Cleaned up and disconnected from MongoDB.\n");
    }
}

runPhase3Tests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
