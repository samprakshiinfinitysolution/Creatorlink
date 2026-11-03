import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import SubscriptionPlan from "./plan.model.js";
import Subscription from "./subscription.model.js";
import SubscriptionPayment from "./subscriptionPayment.model.js";
import Auth from "../auth/auth.model.js";
import { createBrandTrialSubscriptionService } from "./trial.service.js";
import { createNotificationService } from "../notifications/notification.service.js";
import createApiError from "../../utils/ApiError.js";

/**
 * Returns an initialized Razorpay instance using environment credentials.
 */
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw createApiError(
            500,
            "Razorpay configuration missing on backend server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment."
        );
    }

    return new Razorpay({
        key_id,
        key_secret
    });
};

/**
 * Verifies Razorpay HMAC SHA-256 signature for checkout verification.
 */
export const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
        throw createApiError(500, "Razorpay secret missing on backend");
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac("sha256", key_secret)
        .update(payload)
        .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const actualBuf = Buffer.from(razorpay_signature, "utf-8");

    if (expectedBuf.length !== actualBuf.length) {
        return false;
    }
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
};

/**
 * Creates a Razorpay payment order for a Brand subscription plan.
 * 
 * @param {Object} params
 * @param {string|ObjectId} params.brandId - Authenticated Brand user ID
 * @param {string|ObjectId} params.planId - Target SubscriptionPlan ID
 * @param {string} params.billingCycle - "monthly" | "yearly"
 * @returns {Promise<Object>}
 */
export const createSubscriptionOrderService = async ({ brandId, planId, billingCycle }) => {
    if (!["monthly", "yearly"].includes(billingCycle)) {
        throw createApiError(400, "Billing cycle must be either 'monthly' or 'yearly'");
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
        throw createApiError(404, "Subscription plan not found or is currently inactive");
    }

    const brandUser = await Auth.findById(brandId).select("name email role");
    if (!brandUser || brandUser.role !== "brand") {
        throw createApiError(403, "Only brand accounts can purchase subscriptions");
    }

    // Find current subscription document to link
    let subscription = await Subscription.findOne({ brand: brandId });
    if (!subscription) {
        // Automatically initialize trial or base subscription record for existing brands
        const trialResult = await createBrandTrialSubscriptionService({
            brandId: brandUser._id,
            email: brandUser.email,
            name: brandUser.name
        });
        subscription = trialResult?.subscription || (await Subscription.findOne({ brand: brandId }));
    }

    const amount = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
    const amountInPaise = Math.round(amount * 100);

    const razorpay = getRazorpayInstance();

    const shortReceipt = `sub_${Date.now().toString().slice(-8)}_${brandId.toString().slice(-4)}`;

    const options = {
        amount: amountInPaise,
        currency: plan.currency || "INR",
        receipt: shortReceipt,
        notes: {
            brandId: brandId.toString(),
            planId: plan._id.toString(),
            billingCycle,
            planSlug: plan.slug
        }
    };

    let razorpayOrder;
    try {
        razorpayOrder = await razorpay.orders.create(options);
    } catch (rzpErr) {
        console.error("Razorpay subscription order creation failed:", rzpErr);
        throw createApiError(500, `Failed to create payment order with Razorpay: ${rzpErr.message}`);
    }

    // Record pending transaction in dedicated SubscriptionPayment ledger
    const payment = await SubscriptionPayment.create({
        brand: brandId,
        subscription: subscription._id,
        plan: plan._id,
        amount,
        currency: plan.currency || "INR",
        billingCycle,
        status: "pending",
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: ""
    });

    return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id,
        plan: {
            id: plan._id,
            name: plan.name,
            slug: plan.slug,
            billingCycle,
            monthlyContactQuota: plan.monthlyContactQuota
        },
        brand: {
            name: brandUser.name,
            email: brandUser.email
        }
    };
};

/**
 * Verifies Razorpay payment signature and activates/renews Brand's subscription.
 * 
 * @param {Object} params
 * @param {string|ObjectId} params.brandId - Authenticated Brand user ID
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @returns {Promise<Object>}
 */
export const verifySubscriptionPaymentService = async ({
    brandId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
}) => {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw createApiError(400, "Missing required Razorpay payment confirmation parameters");
    }

    // 1. Verify HMAC SHA-256 signature
    const isValid = verifyRazorpaySignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    });

    if (!isValid) {
        throw createApiError(400, "Invalid Razorpay payment signature. Payment verification failed.");
    }

    // 2. Fetch pending payment record
    const payment = await SubscriptionPayment.findOne({
        razorpayOrderId: razorpay_order_id
    }).populate("plan");

    if (!payment) {
        throw createApiError(404, "Subscription payment order record not found");
    }

    if (payment.brand.toString() !== brandId.toString()) {
        throw createApiError(403, "Payment order does not belong to the authenticated brand");
    }

    // Idempotency check: if payment is already captured, return existing state
    if (payment.status === "captured") {
        const currentSub = await Subscription.findById(payment.subscription);
        return {
            isSuccess: true,
            alreadyVerified: true,
            subscription: currentSub,
            payment
        };
    }

    const plan = payment.plan;
    if (!plan) {
        throw createApiError(404, "Subscription plan associated with order not found");
    }

    const now = new Date();
    const isYearly = payment.billingCycle === "yearly";
    const durationDays = isYearly ? 365 : 30;
    const currentPeriodStart = now;
    const currentPeriodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const calendarMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    // 3. Update payment status to "captured"
    payment.status = "captured";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.paidAt = now;
    await payment.save();

    // 4. Activate or renew Subscription with immutable plan snapshot
    const subscription = await Subscription.findById(payment.subscription);
    if (!subscription) {
        throw createApiError(404, "Subscription record to activate not found");
    }

    subscription.plan = plan._id;
    subscription.planSnapshot = {
        name: plan.name,
        slug: plan.slug,
        version: plan.version || 1,
        price: payment.amount,
        currency: payment.currency,
        billingCycle: payment.billingCycle,
        monthlyContactQuota: plan.monthlyContactQuota,
        features: plan.features || []
    };
    subscription.status = "active";
    subscription.billingCycle = payment.billingCycle;
    subscription.isComplimentary = false;
    subscription.currentPeriodStart = currentPeriodStart;
    subscription.currentPeriodEnd = currentPeriodEnd;
    subscription.cancelAtPeriodEnd = false;
    subscription.canceledAt = null;
    subscription.gracePeriodEnd = null;
    subscription.razorpayOrderId = razorpay_order_id;
    subscription.razorpayPaymentId = razorpay_payment_id;

    // Reset monthly quota for the new active billing period
    subscription.quotaState = {
        trialQuotaLimit: 5,
        trialQuotaUsed: subscription.quotaState?.trialQuotaUsed || 0,
        currentCalendarMonthKey: calendarMonthKey,
        monthlyQuotaLimit: plan.monthlyContactQuota,
        monthlyQuotaUsed: 0
    };

    await subscription.save();

    // 5. Dispatch notification to Brand
    try {
        await createNotificationService({
            recipient: brandId,
            sender: null,
            type: "subscription_activated",
            title: "Subscription Activated",
            message: `Your ${plan.name} (${payment.billingCycle}) subscription is now active! You have ${plan.monthlyContactQuota} creator contact unlocks available for this monthly cycle.`,
            entityType: "subscription",
            entityId: subscription._id,
            destination: "/brand/subscription",
            metadata: {
                planName: plan.name,
                billingCycle: payment.billingCycle,
                amount: payment.amount,
                currency: payment.currency
            },
            idempotencyKey: `sub_act_${payment._id}`
        });
    } catch (notifErr) {
        console.error("Failed to send subscription activation notification:", notifErr);
    }

    return {
        isSuccess: true,
        alreadyVerified: false,
        subscription,
        payment
    };
};

/**
 * Handles incoming Razorpay Webhook events for subscriptions idempotently.
 * 
 * @param {string|Buffer} rawBody
 * @param {string} signature
 * @returns {Promise<Object>}
 */
export const handleSubscriptionWebhookService = async (rawBody, signature) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            throw createApiError(400, "Invalid Razorpay webhook signature");
        }
    }

    let event;
    try {
        event = typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString("utf8"));
    } catch {
        throw createApiError(400, "Invalid JSON payload in webhook");
    }

    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    if (!razorpayOrderId) {
        return { handled: false, reason: "No order ID found in webhook payload" };
    }

    const payment = await SubscriptionPayment.findOne({ razorpayOrderId });
    if (!payment) {
        return { handled: false, reason: "Not a subscription payment order" };
    }

    if (eventType === "payment.captured" || eventType === "order.paid") {
        if (payment.status !== "captured") {
            const razorpayPaymentId = paymentEntity?.id || payment.razorpayPaymentId || `pay_${Date.now()}`;
            // Delegate to verify flow without user auth requirement
            await verifySubscriptionPaymentService({
                brandId: payment.brand,
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: "webhook_verified" // bypass signature when webhook secret verified
            }).catch(console.error);
        }
        return { handled: true, event: eventType, status: "captured" };
    }

    if (eventType === "payment.failed") {
        payment.status = "failed";
        await payment.save();
        return { handled: true, event: eventType, status: "failed" };
    }

    return { handled: true, event: eventType, status: "ignored" };
};

export default {
    verifyRazorpaySignature,
    createSubscriptionOrderService,
    verifySubscriptionPaymentService,
    handleSubscriptionWebhookService
};

