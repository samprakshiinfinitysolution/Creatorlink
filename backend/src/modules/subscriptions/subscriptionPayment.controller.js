import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";
import createApiError from "../../utils/ApiError.js";
import {
    createSubscriptionOrderService,
    verifySubscriptionPaymentService,
    handleSubscriptionWebhookService
} from "./subscriptionPayment.service.js";

/**
 * Creates a Razorpay payment order for the selected subscription plan and billing cycle.
 * POST /api/subscriptions/payment/order
 */
export const createSubscriptionOrder = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;
    const { planId, billingCycle } = req.body;

    if (!planId) {
        throw createApiError(400, "Plan ID is required");
    }
    if (!billingCycle || !["monthly", "yearly"].includes(billingCycle)) {
        throw createApiError(400, "Valid billing cycle ('monthly' or 'yearly') is required");
    }

    const orderData = await createSubscriptionOrderService({
        brandId,
        planId,
        billingCycle
    });

    return sendResponse(
        res,
        200,
        "Subscription payment order created successfully",
        orderData
    );
});

/**
 * Verifies Razorpay payment signature and activates the purchased subscription.
 * POST /api/subscriptions/payment/verify
 */
export const verifySubscriptionPayment = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw createApiError(400, "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required");
    }

    const result = await verifySubscriptionPaymentService({
        brandId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    });

    return sendResponse(
        res,
        200,
        result.alreadyVerified
            ? "Payment already verified and subscription is active"
            : "Subscription payment verified and plan activated successfully",
        result
    );
});

/**
 * Webhook handler for asynchronous Razorpay payment events.
 * POST /api/subscriptions/payment/webhook
 */
export const handleSubscriptionWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"] || "";
    const rawBody = req.body;

    const result = await handleSubscriptionWebhookService(rawBody, signature);

    return res.status(200).json({
        status: "ok",
        ...result
    });
});

export default {
    createSubscriptionOrder,
    verifySubscriptionPayment,
    handleSubscriptionWebhook
};

