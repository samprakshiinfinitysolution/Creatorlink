import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import SubscriptionPlan from "./plan.model.js";
import Subscription from "./subscription.model.js";
import SubscriptionPayment from "./subscriptionPayment.model.js";
import Auth from "../auth/auth.model.js";
import { createBrandTrialSubscriptionService } from "./trial.service.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { grantCreatorSubscriptionCreditsService } from "./creatorCredit.service.js";
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
 * Creates a Razorpay payment order for a Brand or Creator subscription plan.
 * 
 * @param {Object} params
 * @param {string|ObjectId} [params.userId] - Authenticated user ID (polymorphic)
 * @param {string|ObjectId} [params.brandId] - Authenticated user ID (backward compatibility)
 * @param {string|ObjectId} params.planId - Target SubscriptionPlan ID
 * @param {string} params.billingCycle - "monthly" | "yearly"
 * @returns {Promise<Object>}
 */
export const createSubscriptionOrderService = async ({
    userId,
    brandId,
    planId,
    billingCycle
}) => {
    const subscriberId = userId || brandId;
    if (!subscriberId) {
        throw createApiError(400, "Authenticated user ID is required to create subscription order");
    }

    if (!["monthly", "yearly"].includes(billingCycle)) {
        throw createApiError(400, "Billing cycle must be either 'monthly' or 'yearly'");
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
        throw createApiError(404, "Subscription plan not found or is currently inactive");
    }

    const user = await Auth.findById(subscriberId).select("name email role");
    if (!user) {
        throw createApiError(404, "Authenticated user account not found");
    }

    const userRole = user.role;
    if (!["brand", "creator"].includes(userRole)) {
        throw createApiError(403, `Only brand and creator accounts can purchase subscriptions (role: ${userRole})`);
    }

    const planTargetRole = (plan.targetRole || "brand").toLowerCase();
    if (userRole !== planTargetRole) {
        throw createApiError(
            400,
            `Role mismatch: User with role '${userRole}' cannot purchase a plan with target role '${planTargetRole}'`
        );
    }

    const isBrand = userRole === "brand";
    const isCreator = userRole === "creator";

    // Validate Creator plan credit configuration
    if (isCreator) {
        const credits = plan.monthlyApplicationCredits;
        if (!credits || !Number.isInteger(Number(credits)) || Number(credits) <= 0) {
            throw createApiError(
                400,
                `Creator plan '${plan.name}' must have a positive integer monthlyApplicationCredits configured (found: ${credits})`
            );
        }
    }

    // Resolve subscription document to link
    let subscription;
    if (isBrand) {
        subscription = await Subscription.findOne({ brand: subscriberId });
        if (!subscription) {
            // Automatically initialize trial or base subscription record for existing brands
            const trialResult = await createBrandTrialSubscriptionService({
                brandId: user._id,
                email: user.email,
                name: user.name
            });
            subscription = trialResult?.subscription || (await Subscription.findOne({ brand: subscriberId }));
        }
    } else if (isCreator) {
        // For Creator: find existing subscription or create a non-trial subscription record safely
        subscription = await Subscription.findOne({
            subscriber: subscriberId,
            subscriberRole: "creator"
        });

        if (!subscription) {
            const now = new Date();
            try {
                subscription = await Subscription.findOneAndUpdate(
                    {
                        subscriber: subscriberId,
                        subscriberRole: "creator"
                    },
                    {
                        $setOnInsert: {
                            subscriber: subscriberId,
                            subscriberRole: "creator",
                            plan: plan._id,
                            planSnapshot: {
                                name: plan.name,
                                slug: plan.slug,
                                version: plan.version || 1,
                                price: billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly,
                                currency: plan.currency || "INR",
                                billingCycle,
                                targetRole: "creator",
                                monthlyContactQuota: 0,
                                monthlyApplicationCredits: plan.monthlyApplicationCredits,
                                features: plan.features || []
                            },
                            status: "expired", // Safe pre-activation non-trial status; grants zero trial privileges
                            billingCycle,
                            isComplimentary: false,
                            currentPeriodStart: now,
                            currentPeriodEnd: now,
                            quotaState: {
                                trialQuotaLimit: 0,
                                trialQuotaUsed: 0,
                                monthlyQuotaLimit: 0,
                                monthlyQuotaUsed: 0,
                                monthlyCreditsAllocated: 0,
                                creditsUsed: 0
                            }
                        }
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true
                    }
                );
            } catch (upsertErr) {
                // If a race condition occurred between concurrent requests, fetch the created record
                subscription = await Subscription.findOne({
                    subscriber: subscriberId,
                    subscriberRole: "creator"
                });
                if (!subscription) {
                    throw upsertErr;
                }
            }
        }
    }

    if (!subscription) {
        throw createApiError(500, "Failed to resolve or initialize subscription record");
    }

    const amount = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
    const amountInPaise = Math.round(amount * 100);

    const razorpay = getRazorpayInstance();
    const shortReceipt = `sub_${Date.now().toString().slice(-8)}_${subscriberId.toString().slice(-4)}`;

    const notes = {
        subscriberId: subscriberId.toString(),
        subscriberRole: userRole,
        planId: plan._id.toString(),
        billingCycle,
        planSlug: plan.slug
    };

    if (isBrand) {
        notes.brandId = subscriberId.toString();
    } else {
        notes.creatorId = subscriberId.toString();
    }

    const options = {
        amount: amountInPaise,
        currency: plan.currency || "INR",
        receipt: shortReceipt,
        notes
    };

    let razorpayOrder;
    try {
        razorpayOrder = await razorpay.orders.create(options);
    } catch (rzpErr) {
        console.error("Razorpay subscription order creation failed:", rzpErr);
        throw createApiError(500, `Failed to create payment order with Razorpay: ${rzpErr.message}`);
    }

    // Record pending transaction in dedicated SubscriptionPayment ledger
    const paymentData = {
        subscriber: subscriberId,
        subscriberRole: userRole,
        subscription: subscription._id,
        plan: plan._id,
        amount,
        currency: plan.currency || "INR",
        billingCycle,
        status: "pending",
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: ""
    };

    if (isBrand) {
        paymentData.brand = subscriberId;
    }

    const payment = await SubscriptionPayment.create(paymentData);

    const responseData = {
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
            targetRole: plan.targetRole || userRole,
            monthlyContactQuota: plan.monthlyContactQuota || 0,
            monthlyApplicationCredits: plan.monthlyApplicationCredits || 0
        },
        subscriber: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: userRole
        }
    };

    // Preserve existing brand object for backward compatibility with Brand frontends
    if (isBrand) {
        responseData.brand = {
            name: user.name,
            email: user.email
        };
    }

    return responseData;
};

/**
 * Reusable internal activation engine for Brand and Creator subscriptions.
 * Invoked by both verified client checkout verification and verified webhook events.
 * 
 * Rules:
 * 1. Executes payment status update, subscription activation, and creator credit allocation atomically.
 * 2. Uses MongoDB transactions where supported; aborts cleanly on error.
 * 3. Idempotent: If payment is already captured, returns existing state without re-granting credits or quotas.
 * 
 * @param {Object} params
 * @param {Object} params.payment - SubscriptionPayment mongoose document (or loaded document)
 * @param {string} params.razorpayPaymentId - Confirmed Razorpay payment ID
 * @param {mongoose.ClientSession} [params.session] - Optional parent transaction session
 * @returns {Promise<Object>}
 */
export const executeSubscriptionActivation = async ({
    payment,
    razorpayPaymentId,
    session: externalSession = null
}) => {
    if (!payment) {
        throw createApiError(404, "Subscription payment record required for activation");
    }

    if (!razorpayPaymentId || typeof razorpayPaymentId !== "string" || !razorpayPaymentId.trim()) {
        throw createApiError(400, "Genuine Razorpay payment ID is required for activation");
    }

    const cleanPaymentId = razorpayPaymentId.trim();

    const doActivation = async (activeSession) => {
        // Fetch fresh payment state within session to guard against concurrent activation
        const currentPayment = await SubscriptionPayment.findById(payment._id)
            .populate("plan")
            .session(activeSession);

        if (!currentPayment) {
            throw createApiError(404, "Subscription payment record not found during activation");
        }

        const plan = currentPayment.plan;
        if (!plan) {
            throw createApiError(404, "Subscription plan associated with order not found");
        }

        // Strict role validation: payment subscriberRole and plan targetRole must be present, valid, and matching
        const ALLOWED_ROLES = ["brand", "creator"];
        const paymentRole = currentPayment.subscriberRole;
        const planRole = plan.targetRole;

        if (!paymentRole || typeof paymentRole !== "string" || !ALLOWED_ROLES.includes(paymentRole.toLowerCase())) {
            throw createApiError(
                400,
                `Invalid or missing subscriber role '${paymentRole}' on payment. Allowed roles are: ${ALLOWED_ROLES.join(", ")}.`
            );
        }

        if (!planRole || typeof planRole !== "string" || !ALLOWED_ROLES.includes(planRole.toLowerCase())) {
            throw createApiError(
                400,
                `Invalid or missing target role '${planRole}' on plan. Allowed roles are: ${ALLOWED_ROLES.join(", ")}.`
            );
        }

        const normalizedPaymentRole = paymentRole.toLowerCase();
        const normalizedPlanRole = planRole.toLowerCase();

        if (normalizedPaymentRole !== normalizedPlanRole) {
            throw createApiError(
                400,
                `Role mismatch: payment subscriber role '${normalizedPaymentRole}' does not match plan target role '${normalizedPlanRole}'.`
            );
        }

        const isCreator = normalizedPaymentRole === "creator";
        const isBrand = normalizedPaymentRole === "brand";

        let subscriberId;
        let creditsToGrant = 0;
        if (isCreator) {
            if (!currentPayment.subscriber) {
                throw createApiError(400, "Creator payment record is missing required subscriber ID");
            }
            subscriberId = currentPayment.subscriber;

            // Validate Creator plan credits before status mutation
            creditsToGrant = Number(plan.monthlyApplicationCredits);
            if (!Number.isInteger(creditsToGrant) || creditsToGrant <= 0) {
                throw createApiError(
                    400,
                    `Cannot activate Creator subscription: Plan '${plan.name}' has invalid monthlyApplicationCredits (${plan.monthlyApplicationCredits}). Positive integer required.`
                );
            }
        } else {
            subscriberId = currentPayment.brand || currentPayment.subscriber;
            if (!subscriberId) {
                throw createApiError(400, "Brand payment record is missing required brand subscriber ID");
            }
        }

        // Idempotency check: if payment already captured, verify payment ID consistency
        if (currentPayment.status === "captured") {
            const storedPaymentId = (currentPayment.razorpayPaymentId || "").trim();
            if (!storedPaymentId) {
                console.error(
                    `[Activation Reconciliation Conflict] Payment record ${currentPayment._id} for order ${currentPayment.razorpayOrderId} is marked captured but has a missing or empty stored payment ID. Incoming payment ID '${cleanPaymentId}' requires reconciliation.`
                );
                throw createApiError(
                    409,
                    `Payment conflict: Order ${currentPayment.razorpayOrderId} is marked captured but is missing its original payment ID. Processing payment ID '${cleanPaymentId}' requires reconciliation.`
                );
            }

            if (storedPaymentId !== cleanPaymentId) {
                console.error(
                    `[Activation Reconciliation Conflict] Payment record ${currentPayment._id} for order ${currentPayment.razorpayOrderId} is already captured with payment ID '${storedPaymentId}', but activation was requested with different payment ID '${cleanPaymentId}'.`
                );
                throw createApiError(
                    409,
                    `Payment conflict: Order ${currentPayment.razorpayOrderId} was already captured with payment ID '${storedPaymentId}'. Activation with different payment ID '${cleanPaymentId}' requires reconciliation.`
                );
            }

            const currentSub = await Subscription.findById(currentPayment.subscription).session(activeSession);
            return {
                isSuccess: true,
                alreadyVerified: true,
                subscription: currentSub,
                payment: currentPayment,
                isCreator,
                subscriberId,
                plan
            };
        }

        const now = new Date();
        const isYearly = currentPayment.billingCycle === "yearly";
        const durationDays = isYearly ? 365 : 30;

        // 1. Update payment status to "captured"
        currentPayment.status = "captured";
        currentPayment.razorpayPaymentId = cleanPaymentId;
        currentPayment.paidAt = now;
        await currentPayment.save({ session: activeSession });

        // 2. Fetch subscription document to activate
        const subscription = await Subscription.findById(currentPayment.subscription).session(activeSession);
        if (!subscription) {
            throw createApiError(404, "Subscription record to activate not found");
        }

        // Safe period extension: if subscription is currently active, extend from existing currentPeriodEnd
        const isCurrentlyActive = subscription.status === "active" &&
            subscription.currentPeriodEnd &&
            new Date(subscription.currentPeriodEnd) > now;

        const currentPeriodStart = isCurrentlyActive && subscription.currentPeriodStart
            ? subscription.currentPeriodStart
            : now;

        const periodBaseDate = isCurrentlyActive
            ? new Date(subscription.currentPeriodEnd)
            : now;

        const currentPeriodEnd = new Date(periodBaseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const calendarMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

        subscription.plan = plan._id;
        subscription.planSnapshot = {
            name: plan.name,
            slug: plan.slug,
            version: plan.version || 1,
            price: currentPayment.amount,
            currency: currentPayment.currency,
            billingCycle: currentPayment.billingCycle,
            targetRole: normalizedPlanRole,
            monthlyContactQuota: isBrand ? (plan.monthlyContactQuota || 0) : 0,
            monthlyApplicationCredits: isCreator ? (plan.monthlyApplicationCredits || 0) : 0,
            features: plan.features || []
        };
        subscription.status = "active";
        subscription.billingCycle = currentPayment.billingCycle;
        subscription.isComplimentary = false;
        subscription.currentPeriodStart = currentPeriodStart;
        subscription.currentPeriodEnd = currentPeriodEnd;
        subscription.cancelAtPeriodEnd = false;
        subscription.canceledAt = null;
        subscription.gracePeriodEnd = null;
        subscription.razorpayOrderId = currentPayment.razorpayOrderId;
        subscription.razorpayPaymentId = cleanPaymentId;

        if (isBrand) {
            subscription.subscriberRole = "brand";
            subscription.brand = subscriberId;
            subscription.subscriber = subscriberId;
            subscription.quotaState = {
                trialQuotaLimit: 5,
                trialQuotaUsed: subscription.quotaState?.trialQuotaUsed || 0,
                currentCalendarMonthKey: calendarMonthKey,
                monthlyQuotaLimit: plan.monthlyContactQuota || 0,
                monthlyQuotaUsed: 0,
                monthlyCreditsAllocated: 0,
                creditsUsed: 0
            };
        } else {
            subscription.subscriber = subscriberId;
            subscription.subscriberRole = "creator";
            subscription.brand = undefined; // Never populate or depend on brand for Creator
            subscription.quotaState = {
                trialQuotaLimit: 0,
                trialQuotaUsed: 0,
                currentCalendarMonthKey: calendarMonthKey,
                monthlyQuotaLimit: 0,
                monthlyQuotaUsed: 0,
                monthlyCreditsAllocated: plan.monthlyApplicationCredits || 0,
                creditsUsed: 0
            };
        }

        await subscription.save({ session: activeSession });

        // 3. For Creator subscriptions: Grant monthly application credits idempotently
        if (isCreator) {
            await grantCreatorSubscriptionCreditsService({
                creatorId: subscriberId,
                subscriptionId: subscription._id,
                paymentId: currentPayment._id,
                credits: creditsToGrant,
                reason: `Subscription activation: ${plan.name} (${currentPayment.billingCycle})`,
                session: activeSession
            });
        }

        return {
            isSuccess: true,
            alreadyVerified: false,
            subscription,
            payment: currentPayment,
            isCreator,
            subscriberId,
            plan
        };
    };

    let result;
    if (externalSession) {
        result = await doActivation(externalSession);
    } else {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            result = await doActivation(session);
            await session.commitTransaction();
        } catch (err) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }

            // Fail safely if MongoDB standalone environment cannot run transactions
            if (
                err.message &&
                (err.message.includes("Transaction numbers are only allowed") ||
                    err.message.includes("replica set") ||
                    err.message.includes("standalone"))
            ) {
                throw createApiError(
                    500,
                    "MongoDB transactions are required for subscription activation and payment processing. Please ensure MongoDB is running as a replica set."
                );
            }

            throw err;
        } finally {
            await session.endSession();
        }
    }

    // 4. Dispatch notification to Subscriber (outside transaction to prevent rollback on notification failure)
    if (result && !result.alreadyVerified && result.subscriberId) {
        try {
            const isCreatorSub = result.isCreator;
            const notifMsg = isCreatorSub
                ? `Your ${result.plan.name} (${result.payment.billingCycle}) subscription is now active! You have ${result.plan.monthlyApplicationCredits || 0} application credits available.`
                : `Your ${result.plan.name} (${result.payment.billingCycle}) subscription is now active! You have ${result.plan.monthlyContactQuota || 0} creator contact unlocks available for this monthly cycle.`;

            await createNotificationService({
                recipient: result.subscriberId,
                sender: null,
                type: "subscription_activated",
                title: "Subscription Activated",
                message: notifMsg,
                entityType: "subscription",
                entityId: result.subscription._id,
                destination: isCreatorSub ? "/creator/dashboard" : "/brand/subscription",
                metadata: {
                    planName: result.plan.name,
                    billingCycle: result.payment.billingCycle,
                    amount: result.payment.amount,
                    currency: result.payment.currency
                },
                idempotencyKey: `sub_act_${result.payment._id}`
            });
        } catch (notifErr) {
            console.error("Failed to send subscription activation notification:", notifErr);
        }
    }

    return {
        isSuccess: true,
        alreadyVerified: result.alreadyVerified,
        subscription: result.subscription,
        payment: result.payment
    };
};

/**
 * Verifies Razorpay payment signature and activates/renews Brand or Creator subscription.
 * 
 * @param {Object} params
 * @param {string|ObjectId} [params.userId] - Authenticated user ID (polymorphic)
 * @param {string|ObjectId} [params.brandId] - Authenticated Brand user ID (backward compatibility)
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @returns {Promise<Object>}
 */
export const verifySubscriptionPaymentService = async ({
    userId,
    brandId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
}) => {
    const authUserId = userId || brandId;
    if (!authUserId) {
        throw createApiError(401, "Authentication is required to verify subscription payment");
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw createApiError(400, "Missing required Razorpay payment confirmation parameters");
    }

    // 1. Verify HMAC SHA-256 checkout signature
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

    // Strict subscriber ownership resolution
    let expectedSubscriberId;
    if (payment.subscriberRole === "creator") {
        if (!payment.subscriber) {
            throw createApiError(400, "Creator payment order is missing required subscriber ID");
        }
        expectedSubscriberId = payment.subscriber;
    } else if (payment.subscriberRole === "brand") {
        expectedSubscriberId = payment.brand || payment.subscriber;
        if (!expectedSubscriberId) {
            throw createApiError(400, "Brand payment order is missing required subscriber ID");
        }
    } else {
        throw createApiError(400, `Invalid subscriber role '${payment.subscriberRole}' on payment order`);
    }

    if (expectedSubscriberId.toString() !== authUserId.toString()) {
        throw createApiError(403, "Payment order does not belong to the authenticated user");
    }

    // Validate payment role and plan target role consistency before proceeding or fast-pathing
    const plan = payment.plan;
    if (!plan) {
        throw createApiError(404, "Subscription plan associated with payment record not found");
    }

    const ALLOWED_ROLES = ["brand", "creator"];
    const paymentRole = payment.subscriberRole;
    const planRole = plan.targetRole;

    if (!paymentRole || typeof paymentRole !== "string" || !ALLOWED_ROLES.includes(paymentRole.toLowerCase())) {
        throw createApiError(400, `Invalid or missing subscriber role '${paymentRole}' on payment record.`);
    }

    if (!planRole || typeof planRole !== "string" || !ALLOWED_ROLES.includes(planRole.toLowerCase())) {
        throw createApiError(400, `Invalid or missing target role '${planRole}' on plan.`);
    }

    if (paymentRole.toLowerCase() !== planRole.toLowerCase()) {
        throw createApiError(
            400,
            `Role mismatch: payment subscriber role '${paymentRole}' does not match plan target role '${planRole}'.`
        );
    }

    // Fast-path Idempotency check: if payment is already captured, verify payment ID consistency
    if (payment.status === "captured") {
        const storedPaymentId = (payment.razorpayPaymentId || "").trim();
        const incomingPaymentId = (razorpay_payment_id || "").trim();

        if (!storedPaymentId) {
            console.error(
                `[Payment Reconciliation Conflict] Order ${razorpay_order_id} is marked captured but has a missing or empty stored payment ID. Incoming payment ID '${incomingPaymentId}' requires reconciliation.`
            );
            throw createApiError(
                409,
                `Payment conflict: Order ${razorpay_order_id} is marked captured but is missing its original payment ID. Processing payment ID '${incomingPaymentId}' requires reconciliation.`
            );
        }

        if (storedPaymentId !== incomingPaymentId) {
            console.error(
                `[Payment Reconciliation Conflict] Order ${razorpay_order_id} is already captured with payment ${storedPaymentId}, but incoming verification passed different payment ${incomingPaymentId}. Requires reconciliation.`
            );
            throw createApiError(
                409,
                `Payment conflict: Order ${razorpay_order_id} was already captured with payment ID '${storedPaymentId}'. Incoming payment ID '${incomingPaymentId}' requires reconciliation.`
            );
        }

        const currentSub = await Subscription.findById(payment.subscription);
        return {
            isSuccess: true,
            alreadyVerified: true,
            subscription: currentSub,
            payment
        };
    }

    // 3. Delegate to shared activation engine
    return await executeSubscriptionActivation({
        payment,
        razorpayPaymentId: razorpay_payment_id
    });
};

/**
 * Handles incoming Razorpay Webhook events for subscriptions idempotently.
 * Uses the exact rawBuffer for cryptographic HMAC-SHA256 signature verification.
 * 
 * @param {Buffer} rawBody
 * @param {string} signature
 * @returns {Promise<Object>}
 */
export const handleSubscriptionWebhookService = async (rawBody, signature) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Webhook Secret must be mandatory - never skip signature verification
    if (!webhookSecret || !webhookSecret.trim()) {
        throw createApiError(
            500,
            "Razorpay webhook secret is not configured on the backend server. Set RAZORPAY_WEBHOOK_SECRET in environment."
        );
    }

    if (!signature) {
        throw createApiError(400, "Missing Razorpay webhook signature header");
    }

    if (!rawBody || !Buffer.isBuffer(rawBody)) {
        throw createApiError(
            400,
            "Raw request body Buffer is required for Razorpay webhook verification."
        );
    }

    // 2. Cryptographically verify webhook signature using raw body Buffer
    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret.trim())
        .update(rawBody)
        .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const actualBuf = Buffer.from(signature, "utf8");

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        throw createApiError(400, "Invalid Razorpay webhook signature");
    }

    // 3. Parse event payload directly from verified raw Buffer
    let event;
    try {
        event = JSON.parse(rawBody.toString("utf8"));
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

    const payment = await SubscriptionPayment.findOne({ razorpayOrderId }).populate("plan");
    if (!payment) {
        return { handled: false, reason: "Not a subscription payment order" };
    }

    // 3. Process supported payment events
    if (eventType === "payment.captured" || eventType === "order.paid") {
        const candidateFromPayload = (typeof paymentEntity?.id === "string" && paymentEntity.id.trim()) ? paymentEntity.id.trim() : null;
        const candidateFromPayment = (typeof payment.razorpayPaymentId === "string" && payment.razorpayPaymentId.trim()) ? payment.razorpayPaymentId.trim() : null;
        const genuinePaymentId = candidateFromPayload || candidateFromPayment;

        // If payment is already captured, verify payment ID consistency
        if (payment.status === "captured") {
            const storedPaymentId = (payment.razorpayPaymentId || "").trim();
            if (!storedPaymentId) {
                console.error(
                    `[Webhook Payment Conflict] Order ${razorpayOrderId} is marked captured but is missing a stored payment ID. Webhook received ${candidateFromPayload ? `payment '${candidateFromPayload}'` : "no payment ID"}. Requires reconciliation.`
                );
                return {
                    handled: false,
                    conflict: true,
                    statusCode: 409,
                    reason: `Payment conflict: Order ${razorpayOrderId} is marked captured but is missing its original payment ID. ${candidateFromPayload ? `Received payment '${candidateFromPayload}'` : "Payload missing payment ID"} requires reconciliation.`,
                    event: eventType,
                    orderId: razorpayOrderId,
                    storedPaymentId: "",
                    incomingPaymentId: candidateFromPayload || ""
                };
            }

            if (candidateFromPayload && storedPaymentId !== candidateFromPayload) {
                console.error(
                    `[Webhook Payment Conflict] Order ${razorpayOrderId} already captured with payment '${storedPaymentId}'. Webhook received different payment '${candidateFromPayload}'. Requires reconciliation.`
                );
                return {
                    handled: false,
                    conflict: true,
                    statusCode: 409,
                    reason: `Payment conflict: Order ${razorpayOrderId} already captured with payment '${storedPaymentId}', received '${candidateFromPayload}'`,
                    event: eventType,
                    orderId: razorpayOrderId,
                    storedPaymentId,
                    incomingPaymentId: candidateFromPayload
                };
            }
            return {
                handled: true,
                event: eventType,
                status: "captured",
                alreadyCaptured: true
            };
        }

        // For pending/non-captured payments, genuine payment ID is required to proceed with activation
        if (!genuinePaymentId) {
            console.warn(
                `[Webhook] Activation deferred: No genuine Razorpay payment ID found in payload or payment record. Event: '${eventType}', Order: '${razorpayOrderId}'`
            );
            return {
                handled: false,
                deferred: true,
                reason: "Missing genuine Razorpay payment ID for activation",
                event: eventType,
                orderId: razorpayOrderId
            };
        }

        // Directly invoke shared activation engine with genuine payment ID
        await executeSubscriptionActivation({
            payment,
            razorpayPaymentId: genuinePaymentId
        });

        return { handled: true, event: eventType, status: "captured" };
    }

    if (eventType === "payment.failed") {
        if (payment.status !== "captured") {
            payment.status = "failed";
            await payment.save();
        }
        return { handled: true, event: eventType, status: "failed" };
    }

    return { handled: true, event: eventType, status: "ignored" };
};

export default {
    verifyRazorpaySignature,
    createSubscriptionOrderService,
    verifySubscriptionPaymentService,
    handleSubscriptionWebhookService,
    executeSubscriptionActivation
};

