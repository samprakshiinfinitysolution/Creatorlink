import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import Auth from "../modules/auth/auth.model.js";
import BrandProfile from "../modules/brand/profile/profile.model.js";
import CreatorProfile from "../modules/creator/profile/profile.model.js";
import SubscriptionPlan from "../modules/subscriptions/plan.model.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import ContactUnlock from "../modules/subscriptions/contactUnlock.model.js";
import SubscriptionPayment from "../modules/subscriptions/subscriptionPayment.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import AuditLog from "../modules/admin/audit/audit.model.js";

import { createBrandTrialSubscriptionService } from "../modules/subscriptions/trial.service.js";
import { evaluateBrandEntitlement, validateCampaignUpdateEntitlement } from "../modules/subscriptions/entitlement.service.js";
import {
  unlockCreatorContactService,
  checkCreatorUnlockStatusService,
  updateCreatorContactConsentService,
  getCreatorContactConsentService,
} from "../modules/subscriptions/contactUnlock.service.js";
import {
  createSubscriptionOrderService,
  verifySubscriptionPaymentService,
} from "../modules/subscriptions/subscriptionPayment.service.js";
import {
  createSubscriptionPlanAdminService,
  extendTrialAdminService,
  grantComplimentarySubscriptionService,
  suspendSubscriptionAdminService,
  reinstateSubscriptionAdminService,
  cancelSubscriptionAdminService,
  getAdminSubscriptionAnalyticsService,
} from "../modules/subscriptions/adminSubscription.service.js";
import { createCampaignService, updateCampaignService } from "../modules/brand/campaigns/campaign.service.js";
import { hashPassword } from "../utils/helpers/password.helper.js";

async function runE2ETests() {
  console.log("================================================================================");
  console.log("             CREATORLINK FULL LIFECYCLE E2E INTEGRATION TEST SUITE              ");
  console.log("================================================================================\n");

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in environment");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB successfully.\n");

  const testId = Date.now().toString(36);
  const createdAuthIds = [];
  const createdProfileIds = [];
  const createdPlanIds = [];
  const createdCampaignIds = [];

  try {
    const passwordHash = await hashPassword("StrongPass123!");

    // -------------------------------------------------------------------------
    // STEP 1: BRAND REGISTRATION & AUTOMATIC 5-DAY TRIAL INITIALIZATION
    // -------------------------------------------------------------------------
    console.log("--> STEP 1: Testing Brand Registration & Automatic 5-Day Trial Assignment");

    const brandAuth = await Auth.create({
      name: `E2E Brand ${testId}`,
      email: `e2e_brand_${testId}@example.com`,
      password: passwordHash,
      role: "brand",
      isEmailVerified: true,
      hasBrandProfile: true,
    });
    createdAuthIds.push(brandAuth._id);

    const brandProfile = await BrandProfile.create({
      user: brandAuth._id,
      companyName: `Brand Corp ${testId}`,
      website: "https://example.com",
    });
    createdProfileIds.push(brandProfile._id);

    const trialRes = await createBrandTrialSubscriptionService({
      brandId: brandAuth._id,
      email: brandAuth.email,
      name: brandAuth.name,
    });
    const trialSub = trialRes.subscription;
    if (!trialSub) throw new Error("Trial subscription creation returned null");

    console.log(`  ✓ Brand created: ${brandAuth.email} (ID: ${brandAuth._id})`);
    console.log(`  ✓ Trial created: status=${trialSub.status}, billingCycle=${trialSub.billingCycle}`);
    console.log(`  ✓ Quota allocated: ${trialSub.quotaState.trialQuotaLimit} contacts`);

    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    const duration = trialSub.trialEndDate.getTime() - trialSub.trialStartDate.getTime();
    if (Math.abs(duration - fiveDaysMs) > 10000) {
      throw new Error(`Trial duration is not 5 days: ${duration / (24 * 3600 * 1000)} days`);
    }
    console.log(`  ✓ Trial duration verified: exactly 5 days (${trialSub.trialStartDate.toISOString()} to ${trialSub.trialEndDate.toISOString()})`);

    // Verify Idempotency - repeated call does not duplicate or reset trial
    const duplicateRes = await createBrandTrialSubscriptionService({
      brandId: brandAuth._id,
      email: brandAuth.email,
      name: brandAuth.name,
    });
    if (duplicateRes.subscription._id.toString() !== trialSub._id.toString() || duplicateRes.isNew !== false) {
      throw new Error("Trial creation is not idempotent; created a second subscription or marked isNew = true");
    }
    console.log("  ✓ Idempotency verified: re-running trial service returned identical subscription without resetting");

    // -------------------------------------------------------------------------
    // STEP 2: CREATOR PRIVACY DEFAULT SETTINGS & CONSENT GATING
    // -------------------------------------------------------------------------
    console.log("\n--> STEP 2: Testing Creator Privacy Default Settings & Selective Consent");

    const creatorAuth = await Auth.create({
      name: `E2E Creator ${testId}`,
      email: `e2e_creator_${testId}@example.com`,
      password: passwordHash,
      role: "creator",
      isEmailVerified: true,
      hasCreatorProfile: true,
    });
    createdAuthIds.push(creatorAuth._id);

    const creatorProfile = await CreatorProfile.create({
      user: creatorAuth._id,
      handle: `creator_${testId}`,
      displayName: `Creator ${testId}`,
      bio: "E2E Test Creator Bio",
      contactPrivacy: {
        isConsentGiven: false, // Default MUST be false
        allowWhatsApp: false,
        allowPhoneCall: false,
        allowBusinessEmail: false,
        whatsAppNumber: "+919876543210",
        phoneNumber: "+919876543210",
        businessEmail: `business_${testId}@creatorlink.io`,
      },
    });
    createdProfileIds.push(creatorProfile._id);

    console.log(`  ✓ Creator profile created with contactPrivacy.isConsentGiven = ${creatorProfile.contactPrivacy.isConsentGiven}`);

    // Brand checks unlock status before unlocking
    const initialStatus = await checkCreatorUnlockStatusService({
      brandId: brandAuth._id,
      creatorId: creatorAuth._id,
    });
    if (initialStatus.isUnlocked !== false) {
      throw new Error("Creator should not be unlocked before brand unlock action");
    }
    console.log("  ✓ Contact unlock status for Brand correctly indicates isUnlocked=false");

    // Creator opts in to WhatsApp and Business Email, but NOT Phone Calls
    await updateCreatorContactConsentService(creatorAuth._id, {
      isConsentGiven: true,
      allowWhatsApp: true,
      allowBusinessEmail: true,
      allowPhoneCall: false,
      whatsappNumber: "+919876543210",
      businessEmail: `business_${testId}@creatorlink.io`,
    });

    const consentCheck = await getCreatorContactConsentService(creatorAuth._id);
    if (!consentCheck.isConsentGiven || !consentCheck.allowWhatsApp || consentCheck.allowPhoneCall) {
      throw new Error("Creator consent update failed to reflect selective channel settings!");
    }
    console.log("  ✓ Creator updated consent with selective channels (WhatsApp + Email active, Phone disabled)");

    // Brand unlocks Creator (First unlock: consumes 1 quota)
    const unlock1 = await unlockCreatorContactService({
      brandId: brandAuth._id,
      creatorId: creatorAuth._id,
    });
    if (!unlock1.isNewUnlock || unlock1.alreadyUnlocked) {
      throw new Error("First unlock should be isNewUnlock: true, alreadyUnlocked: false");
    }
    if (!unlock1.isConsentGiven) {
      throw new Error("Expected isConsentGiven: true on unlock");
    }
    if (unlock1.contactDetails.whatsappNumber !== "+919876543210" || unlock1.contactDetails.businessEmail !== `business_${testId}@creatorlink.io`) {
      throw new Error("Consented contact channels were not revealed upon unlock!");
    }
    if (unlock1.contactDetails.businessPhone !== null) {
      throw new Error("Disabled channel (businessPhone) was leaked!");
    }
    console.log("  ✓ First unlock successful: consumed 1 quota; revealed WhatsApp & Email, masked Phone");

    // Brand retrieves unlocked contact again (Repeat unlock must not consume additional quota)
    const subBeforeRepeat = await Subscription.findById(trialSub._id);
    const quotaUsedBefore = subBeforeRepeat.quotaState.trialQuotaUsed;

    const repeatUnlock = await unlockCreatorContactService({
      brandId: brandAuth._id,
      creatorId: creatorAuth._id,
    });
    const subAfterRepeat = await Subscription.findById(trialSub._id);

    if (repeatUnlock.isNewUnlock || !repeatUnlock.alreadyUnlocked) {
      throw new Error("Repeat unlock should return alreadyUnlocked: true");
    }
    if (subAfterRepeat.quotaState.trialQuotaUsed !== quotaUsedBefore) {
      throw new Error("Repeat unlock consumed quota! Idempotency failed.");
    }
    console.log("  ✓ Idempotency verified: Repeat unlock consumed 0 quota");

    // Creator revokes consent -> Brand access must immediately reflect revocation
    await updateCreatorContactConsentService(creatorAuth._id, {
      isConsentGiven: false,
    });
    const revokedCheck = await checkCreatorUnlockStatusService({
      brandId: brandAuth._id,
      creatorId: creatorAuth._id,
    });
    if (!revokedCheck.isUnlocked) {
      throw new Error("isUnlocked should remain true after consent revocation");
    }
    if (revokedCheck.isConsentGiven !== false) {
      throw new Error("isConsentGiven should be false after consent revocation");
    }
    if (revokedCheck.contactDetails !== null) {
      throw new Error("Security Violation: Revoked consent still allowed contact access!");
    }
    console.log("  ✓ Live Revocation verified: Creator revoking consent immediately re-masks contact details to null for unlocked brand");

    // -------------------------------------------------------------------------
    // STEP 3: QUOTA EXHAUSTION ENFORCEMENT
    // -------------------------------------------------------------------------
    console.log("\n--> STEP 3: Testing Trial Quota Exhaustion (5 unique unlocks ceiling)");

    // We already used 1 unlock. Create 4 more creators and unlock them.
    for (let i = 2; i <= 5; i++) {
      const extraAuth = await Auth.create({
        name: `Extra Creator ${i} ${testId}`,
        email: `extra_creator_${i}_${testId}@example.com`,
        password: passwordHash,
        role: "creator",
        isEmailVerified: true,
        hasCreatorProfile: true,
      });
      createdAuthIds.push(extraAuth._id);

      const p = await CreatorProfile.create({
        user: extraAuth._id,
        handle: `extra_${i}_${testId}`,
        displayName: `Extra ${i}`,
        contactPrivacy: { isConsentGiven: true, allowBusinessEmail: true, businessEmail: `extra${i}@mail.com` },
      });
      createdProfileIds.push(p._id);

      await unlockCreatorContactService({
        brandId: brandAuth._id,
        creatorId: extraAuth._id,
      });
    }

    const subAtLimit = await Subscription.findById(trialSub._id);
    console.log(`  ✓ 5 unique creators unlocked. Current quota used: ${subAtLimit.quotaState.trialQuotaUsed} / ${subAtLimit.quotaState.trialQuotaLimit}`);

    // Attempt 6th unlock - MUST BE REJECTED
    const sixthAuth = await Auth.create({
      name: `Sixth Creator ${testId}`,
      email: `sixth_creator_${testId}@example.com`,
      password: passwordHash,
      role: "creator",
      isEmailVerified: true,
      hasCreatorProfile: true,
    });
    createdAuthIds.push(sixthAuth._id);

    const sixthProfile = await CreatorProfile.create({
      user: sixthAuth._id,
      handle: `sixth_${testId}`,
      displayName: "Sixth Creator",
      contactPrivacy: { isConsentGiven: true, allowBusinessEmail: true, businessEmail: "sixth@mail.com" },
    });
    createdProfileIds.push(sixthProfile._id);

    let quotaExceededError = null;
    try {
      await unlockCreatorContactService({
        brandId: brandAuth._id,
        creatorId: sixthAuth._id,
      });
    } catch (err) {
      quotaExceededError = err;
    }

    if (!quotaExceededError || (quotaExceededError.statusCode !== 403 && quotaExceededError.status !== 403)) {
      throw new Error(`Expected 403 QUOTA_EXCEEDED on 6th unlock, got: ${quotaExceededError?.message}`);
    }
    console.log(`  ✓ Quota Ceiling strictly enforced: 6th unlock rejected with: "${quotaExceededError.message}"`);

    // -------------------------------------------------------------------------
    // STEP 4: CAMPAIGN ENTITLEMENT & EXPIRY GATING
    // -------------------------------------------------------------------------
    console.log("\n--> STEP 4: Testing Campaign Lifecycle & Expiry Guardrails");

    // Active Brand can create a campaign
    const campaignData = {
      title: `E2E Campaign ${testId}`,
      description: "Test campaign description with enough length to pass valid checks.",
      category: "Fashion",
      platform: "instagram",
      budget: 50000,
      requiredCreators: 1,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      deliverables: ["1 Instagram Reel"],
    };

    const createdCampaign = await createCampaignService(brandAuth._id, campaignData);
    createdCampaignIds.push(createdCampaign._id);
    console.log(`  ✓ Campaign created successfully during active trial: "${createdCampaign.title}" (Status: ${createdCampaign.status})`);

    // Simulate Trial Expiration (beyond grace period)
    console.log("  Simulating trial expiration...");
    await Subscription.findByIdAndUpdate(trialSub._id, {
      trialEndDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (past 48h grace)
      gracePeriodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: "expired",
    });

    // Check Entitlement Service
    const expiredEntitlement = await evaluateBrandEntitlement(brandAuth._id);
    if (expiredEntitlement.hasEntitlement !== false) {
      throw new Error("Expired trial still reported hasEntitlement = true!");
    }
    console.log("  ✓ Entitlement service accurately reports hasEntitlement = false for expired trial");

    // Creating a new campaign MUST be blocked
    let createCampaignBlocked = false;
    try {
      await createCampaignService(brandAuth._id, {
        ...campaignData,
        title: "Blocked Campaign",
      });
    } catch (err) {
      if (err.statusCode === 403 || err.status === 403) createCampaignBlocked = true;
    }
    if (!createCampaignBlocked) {
      throw new Error("Security Violation: Expired brand was able to create a new campaign!");
    }
    console.log("  ✓ Creating new campaigns strictly blocked for expired Brand");

    // Updating campaign content MUST be blocked
    let contentUpdateBlocked = false;
    try {
      await updateCampaignService(brandAuth._id, createdCampaign._id, {
        title: "Updated Title After Expiry",
      });
    } catch (err) {
      if (err.statusCode === 403 || err.status === 403) contentUpdateBlocked = true;
    }
    if (!contentUpdateBlocked) {
      throw new Error("Security Violation: Expired brand was able to update campaign content!");
    }
    console.log("  ✓ Editing campaign content strictly blocked for expired Brand");

    // Non-content state transitions (closing / pausing) MUST be permitted so the brand can manage obligations
    const closedCampaign = await updateCampaignService(brandAuth._id, createdCampaign._id, {
      status: "closed",
    });
    if (closedCampaign.status !== "closed") {
      throw new Error("Brand could not close their campaign while expired!");
    }
    console.log("  ✓ Emergency lifecycle action allowed: Expired Brand successfully closed their campaign");

    // -------------------------------------------------------------------------
    // STEP 5: ADMIN PLAN CREATION & VERSIONING
    // -------------------------------------------------------------------------
    console.log("\n--> STEP 5: Testing Admin Plan Management & Versioning");

    const adminAuth = await Auth.create({
      name: `Admin ${testId}`,
      email: `admin_${testId}@creatorlink.com`,
      password: passwordHash,
      role: "admin",
      isEmailVerified: true,
    });
    createdAuthIds.push(adminAuth._id);

    const planData = {
      name: `Growth Pro ${testId}`,
      slug: `growth-pro-${testId}`,
      description: "Scale your creator partnerships with 50 monthly unlocks.",
      priceMonthly: 4999,
      priceYearly: 49990,
      currency: "INR",
      monthlyContactQuota: 50,
      features: ["50 Creator Contact Unlocks", "Campaign Publishing", "Analytics Dashboard"],
      trialAllowed: true,
    };

    const newPlan = await createSubscriptionPlanAdminService(adminAuth._id, planData);
    createdPlanIds.push(newPlan._id);
    if (newPlan.version !== 1) {
      throw new Error(`Expected initial plan version to be 1, got ${newPlan.version}`);
    }
    console.log(`  ✓ Plan created: "${newPlan.name}" (Slug: ${newPlan.slug}, Version: ${newPlan.version})`);

    // -------------------------------------------------------------------------
    // STEP 6: RAZORPAY PAYMENT SIMULATION & SUBSCRIPTION ACTIVATION
    // -------------------------------------------------------------------------
    console.log("\n--> STEP 6: Testing Razorpay Order Creation, Verification & Activation");

    const orderRes = await createSubscriptionOrderService({
      brandId: brandAuth._id,
      planId: newPlan._id,
      billingCycle: "monthly",
    });

    if (!orderRes.orderId || !orderRes.amount) {
      throw new Error("Order creation failed to return orderId or amount");
    }
    console.log(`  ✓ Razorpay order initialized: ${orderRes.orderId} (Amount: ₹${orderRes.amount / 100})`);

    // Simulate Razorpay payment verification
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "mock_key_secret_for_test";
    const paymentId = `pay_e2e_${testId}`;
    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${orderRes.orderId}|${paymentId}`)
      .digest("hex");

    const verifyRes = await verifySubscriptionPaymentService({
      brandId: brandAuth._id,
      razorpay_order_id: orderRes.orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: generatedSignature,
    });

    if (verifyRes.subscription.status !== "active") {
      throw new Error(`Expected activated subscription status = active, got: ${verifyRes.subscription.status}`);
    }
    console.log(`  ✓ Payment verified and subscription activated! Status: ${verifyRes.subscription.status}`);
    console.log(`  ✓ Monthly quota initialized to: ${verifyRes.subscription.quotaState.monthlyQuotaLimit} unlocks`);

    // Brand now has active paid entitlement
    const paidEntitlement = await evaluateBrandEntitlement(brandAuth._id);
    if (!paidEntitlement.hasEntitlement) {
      throw new Error("Paid brand should have full entitlement!");
    }
    console.log("  ✓ Brand now has full campaign creation and contact unlock entitlement restored");

    // -------------------------------------------------------------------------
    // STEP 7: PRIVILEGED ADMINISTRATIVE ACTIONS & AUDIT TRAILS
    // -------------------------------------------------------------------------
    console.log("\n--> STEP 7: Testing Privileged Admin Operations & Comprehensive Audit Trail");

    // Admin suspends brand subscription for compliance check
    await suspendSubscriptionAdminService(adminAuth._id, {
      brandId: brandAuth._id,
      reason: "Compliance audit required",
    });
    const suspendedSub = await Subscription.findOne({ brand: brandAuth._id });
    if (suspendedSub.status !== "suspended") {
      throw new Error(`Expected suspended status, got: ${suspendedSub.status}`);
    }
    const suspendedEntitlement = await evaluateBrandEntitlement(brandAuth._id);
    if (suspendedEntitlement.hasEntitlement !== false) {
      throw new Error("Suspended subscription must not have active entitlement!");
    }
    console.log("  ✓ Admin successfully suspended subscription; Brand entitlement immediately revoked");

    // Admin reinstates brand subscription
    await reinstateSubscriptionAdminService(adminAuth._id, {
      brandId: brandAuth._id,
      reason: "Investigation cleared with zero violations",
    });
    const reinstatedSub = await Subscription.findOne({ brand: brandAuth._id });
    if (reinstatedSub.status !== "active") {
      throw new Error(`Expected reinstated status = active, got: ${reinstatedSub.status}`);
    }
    console.log("  ✓ Admin successfully reinstated subscription; Brand entitlement restored");

    // Admin extends trial or grants complimentary subscription
    const compSub = await grantComplimentarySubscriptionService(adminAuth._id, {
      brandId: brandAuth._id,
      planId: newPlan._id,
      durationDays: 30,
      reason: "VIP Partner Grant",
    });
    if (!compSub.isComplimentary || compSub.status !== "active") {
      throw new Error("Failed to grant complimentary subscription");
    }
    console.log(`  ✓ Admin granted complimentary subscription: 30 days of "${newPlan.name}"`);

    // Verify Telemetry
    const analytics = await getAdminSubscriptionAnalyticsService();
    if (!analytics || typeof analytics.telemetry?.totalSubscribers !== "number") {
      throw new Error("Telemetry service returned invalid data structure");
    }
    console.log(`  ✓ Admin Telemetry verified: ${analytics.telemetry.totalSubscribers} total subscribers, ${analytics.telemetry.activePaid} active paid`);

    // Verify Audit Logs
    const auditCount = await AuditLog.countDocuments({
      action: { $regex: /^SUBSCRIPTION_/ },
    });
    if (auditCount < 3) {
      throw new Error(`Expected at least 3 subscription audit log entries, found ${auditCount}`);
    }
    console.log(`  ✓ Comprehensive Audit Trail confirmed: recorded ${auditCount} administrative audit events`);

    console.log("\n================================================================================");
    console.log("             ALL FULL-LIFECYCLE E2E TESTS PASSED SUCCESSFULLY!                  ");
    console.log("================================================================================\n");
  } finally {
    // Cleanup test fixtures
    console.log("Cleaning up test database records...");
    if (createdAuthIds.length > 0) {
      await Auth.deleteMany({ _id: { $in: createdAuthIds } });
      await BrandProfile.deleteMany({ user: { $in: createdAuthIds } });
      await CreatorProfile.deleteMany({ user: { $in: createdAuthIds } });
      await Subscription.deleteMany({ brand: { $in: createdAuthIds } });
      await ContactUnlock.deleteMany({ brand: { $in: createdAuthIds } });
      await SubscriptionPayment.deleteMany({ brand: { $in: createdAuthIds } });
    }
    if (createdPlanIds.length > 0) {
      await SubscriptionPlan.deleteMany({ _id: { $in: createdPlanIds } });
    }
    if (createdCampaignIds.length > 0) {
      await Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    }
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB. Cleanup complete.\n");
  }
}

runE2ETests().catch((err) => {
  console.error("\n❌ E2E Test Failure:", err);
  process.exit(1);
});
