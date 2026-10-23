import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";

import Payment from "./payment.model.js";
import Workspace from "../workspace/workspace.model.js";
import { createNotificationSafe } from "../notifications/notification.service.js";
import createApiError from "../../utils/ApiError.js";
import {
    getPagination,
    getPaginationData
} from "../../utils/pagination.js";

// Helper function to initialize Razorpay SDK using backend environment variables
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw createApiError(
            500,
            "Razorpay configuration missing on backend server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment."
        );
    }

    if (!key_id.startsWith("rzp_test_")) {
        throw createApiError(
            500,
            "Razorpay integration is restricted to Test Mode. RAZORPAY_KEY_ID must start with 'rzp_test_'."
        );
    }

    return new Razorpay({
        key_id,
        key_secret
    });
};

// Helper function to verify HMAC SHA-256 signature for Razorpay checkout callback
const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
        throw createApiError(
            500,
            "Razorpay configuration missing on backend server. Please set RAZORPAY_KEY_SECRET in environment."
        );
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

// Creates a Razorpay Order for an approved/completed workspace by Brand
const createBrandPaymentOrderService = async (brandId, payload = {}) => {
    const { workspaceId } = payload;

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
        throw createApiError(400, "Invalid or missing workspace ID");
    }

    // 1. Fetch workspace and verify brand ownership
    const workspace = await Workspace.findOne({
        _id: workspaceId,
        brand: brandId
    });

    if (!workspace) {
        throw createApiError(
            404,
            "Workspace not found or access denied"
        );
    }

    // 2. Enforce business rule: Payment is allowed ONLY when workspace is completed (all deliverables approved)
    if (workspace.status !== "completed") {
        throw createApiError(
            400,
            "Payment is allowed only after all workspace deliverables are approved and the workspace is completed"
        );
    }

    // 3. Currency Validation: Explicitly enforce INR only
    const currency = (workspace.currency || "INR").toUpperCase();
    if (currency !== "INR") {
        throw createApiError(
            400,
            `Unsupported payment currency '${currency}'. Only INR is supported for Razorpay Test Mode.`
        );
    }

    // 4. Server-side price retrieval & strict decimal precision validation (never trust client)
    const rawAmount = Number(workspace.agreedPrice);

    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
        throw createApiError(
            400,
            "Invalid or non-positive workspace price amount for payment processing"
        );
    }

    const paiseValue = rawAmount * 100;
    if (!Number.isInteger(Math.round(paiseValue)) || Math.abs(paiseValue - Math.round(paiseValue)) > 1e-6) {
        throw createApiError(
            400,
            "Payable amount cannot have more than two decimal places"
        );
    }

    const amount = rawAmount;
    const amountInPaise = Math.round(paiseValue);

    // 5. Initialize & validate Razorpay configuration BEFORE creating database reservation
    const razorpay = getRazorpayInstance();

    // 6. Pre-check: If an active payment already exists, check if it's completed, reusable, or stale
    const existingPayment = await Payment.findOne({
        workspace: workspaceId,
        isActive: true
    });

    if (existingPayment) {
        if (existingPayment.status === "paid") {
            throw createApiError(
                400,
                "Payment has already been successfully completed for this workspace"
            );
        }

        // Reuse an existing valid pending/processing payment record & Razorpay Order ID if present
        if (
            existingPayment.status === "pending" ||
            existingPayment.status === "processing"
        ) {
            if (existingPayment.razorpayOrderId) {
                const existingCurrency = (existingPayment.currency || "").trim().toUpperCase();
                const isCurrencyMatch = existingCurrency === currency;

                const existingRawAmount = Number(existingPayment.amount);
                const isFinitePositive = Number.isFinite(existingRawAmount) && existingRawAmount > 0;
                const existingPaiseVal = existingRawAmount * 100;
                const isValidDecimalPrecision =
                    isFinitePositive &&
                    Number.isInteger(Math.round(existingPaiseVal)) &&
                    Math.abs(existingPaiseVal - Math.round(existingPaiseVal)) <= 1e-6;

                const existingPaise = isValidDecimalPrecision ? Math.round(existingPaiseVal) : null;
                const isAmountMatch = existingPaise !== null && existingPaise === amountInPaise;

                if (!isCurrencyMatch || !isAmountMatch) {
                    throw createApiError(
                        400,
                        "Active payment order amount or currency does not match current workspace price. Active reservation preserved for administrative review."
                    );
                }

                return {
                    payment: existingPayment,
                    razorpayOrder: {
                        id: existingPayment.razorpayOrderId,
                        amount: existingPaise,
                        currency: existingPayment.currency
                    },
                    keyId: process.env.RAZORPAY_KEY_ID
                };
            }

            // An active reservation exists but razorpayOrderId is not yet saved/available.
            // Never release or mark failed based on time alone. Preserve the active reservation safely.
            throw createApiError(
                400,
                "A payment reservation is currently active for this workspace, but the order ID is not yet confirmed. Please check existing payment records."
            );
        }
    }

    // 7. Atomic Reservation: Attempt to create the Payment document in MongoDB FIRST to acquire the unique database lock
    let paymentReservation;
    try {
        paymentReservation = await Payment.create({
            workspace: workspace._id,
            booking: workspace.booking,
            campaign: workspace.campaign,
            brand: brandId,
            creator: workspace.creator,
            amount: amount,
            currency: currency,
            paymentMethod: "RAZORPAY_TEST",
            status: "pending",
            isActive: true,
            razorpayOrderId: "",
            transactionId: "",
            isTestMode: true
        });
    } catch (dbError) {
        if (dbError.code === 11000 || dbError?.message?.includes("E11000")) {
            const activePayment = await Payment.findOne({ workspace: workspaceId, isActive: true });
            if (activePayment?.status === "paid") {
                throw createApiError(400, "Payment has already been successfully completed for this workspace");
            }
            throw createApiError(400, "A payment process or order is already active for this workspace");
        }
        console.error("Database Payment Reservation Error:", dbError?.message || dbError);
        throw createApiError(500, "Failed to reserve payment slot in database");
    }

    // 8. Create Razorpay Order at Gateway
    const shortId = workspaceId.toString().slice(-8);
    const timeSnippet = Date.now().toString().slice(-6);
    const receipt = `rcpt_${shortId}_${timeSnippet}`;

    let razorpayOrder;
    try {
        razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: currency,
            receipt: receipt,
            notes: {
                workspaceId: workspaceId.toString(),
                brandId: brandId.toString(),
                bookingId: workspace.booking.toString()
            }
        });
    } catch (gatewayErr) {
        console.error("Razorpay Order Creation Error:", gatewayErr?.message || gatewayErr);
        
        const statusCode = Number(gatewayErr?.statusCode);
        const errorCode = gatewayErr?.error?.code;

        // Definitive payload rejections: Confirmed Razorpay API response (HTTP 400/422 with BAD_REQUEST_ERROR)
        // indicating Razorpay API explicitly validated and rejected the payload before order creation.
        const isDefinitiveFailure =
            (statusCode === 400 || statusCode === 422) &&
            errorCode === "BAD_REQUEST_ERROR";

        if (isDefinitiveFailure) {
            paymentReservation.status = "failed";
            paymentReservation.isActive = false;
            await paymentReservation.save().catch(() => {});
        } else {
            // Ambiguous outcome (network timeout, connection drop, 5xx server error, rate limit, missing/unverified error code):
            // Preserve active reservation in 'processing' status to prevent creating duplicate orders blindly.
            paymentReservation.status = "processing";
            paymentReservation.isActive = true;
            await paymentReservation.save().catch(() => {});
        }

        throw createApiError(
            502,
            `Failed to create Razorpay Order: ${gatewayErr?.error?.description || gatewayErr?.message || "Gateway error"}`
        );
    }

    // 9. Update Payment record with the real Razorpay Order ID
    try {
        paymentReservation.razorpayOrderId = razorpayOrder.id;
        paymentReservation.transactionId = razorpayOrder.id;
        await paymentReservation.save();
    } catch (updateErr) {
        console.error("Failed to update Payment record with Razorpay Order ID:", updateErr?.message || updateErr);
        
        try {
            paymentReservation.status = "processing";
            paymentReservation.isActive = true;
            await paymentReservation.save();
        } catch (preserveErr) {
            // Ignore secondary save error
        }

        throw createApiError(
            500,
            `Razorpay order (${razorpayOrder.id}) was created successfully, but saving order reference to database failed. The active reservation has been preserved for recovery.`
        );
    }

    return {
        payment: paymentReservation,
        razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        },
        keyId: process.env.RAZORPAY_KEY_ID
    };
};

// Gets paginated payments for authenticated Brand
const getBrandPaymentsService = async (brandId, query = {}) => {
    const { page = 1, limit = 10, status, workspace } = query;
    const { page: currentPage, limit: itemsPerPage, skip } = getPagination(page, limit);

    const filter = { brand: brandId };
    if (status && status.trim()) {
        filter.status = status.trim();
    }
    if (workspace && mongoose.Types.ObjectId.isValid(workspace.toString().trim())) {
        filter.workspace = workspace.toString().trim();
    }

    const [payments, totalItems] = await Promise.all([
        Payment.find(filter)
            .populate("creator", "name email")
            .populate("campaign", "title category budget platform")
            .populate("workspace", "status agreedPrice deadline")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),
        Payment.countDocuments(filter)
    ]);

    return {
        payments,
        pagination: getPaginationData(currentPage, itemsPerPage, totalItems)
    };
};

// Gets single payment details for authenticated Brand
const getBrandPaymentByIdService = async (brandId, paymentId) => {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        throw createApiError(400, "Invalid payment ID");
    }

    const payment = await Payment.findOne({
        _id: paymentId,
        brand: brandId
    })
        .populate("creator", "name email")
        .populate("campaign")
        .populate("workspace")
        .populate("booking");

    if (!payment) {
        throw createApiError(404, "Payment record not found");
    }

    return payment;
};

// Gets paginated received payments for authenticated Creator
const getCreatorPaymentsService = async (creatorId, query = {}) => {
    const { page = 1, limit = 10, status } = query;
    const { page: currentPage, limit: itemsPerPage, skip } = getPagination(page, limit);

    const filter = { creator: creatorId };
    if (status && status.trim()) {
        filter.status = status.trim();
    }

    const [payments, totalItems] = await Promise.all([
        Payment.find(filter)
            .populate("brand", "name email")
            .populate("campaign", "title category budget platform")
            .populate("workspace", "status agreedPrice deadline")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),
        Payment.countDocuments(filter)
    ]);

    return {
        payments,
        pagination: getPaginationData(currentPage, itemsPerPage, totalItems)
    };
};

// Gets single received payment details for authenticated Creator
const getCreatorPaymentByIdService = async (creatorId, paymentId) => {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        throw createApiError(400, "Invalid payment ID");
    }

    const payment = await Payment.findOne({
        _id: paymentId,
        creator: creatorId
    })
        .populate("brand", "name email")
        .populate("campaign")
        .populate("workspace")
        .populate("booking");

    if (!payment) {
        throw createApiError(404, "Payment record not found");
    }

    return payment;
};

// Verifies Razorpay Payment Signature and updates status for authenticated Brand
const verifyBrandPaymentService = async (brandId, payload = {}) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = payload;

    if (
        typeof razorpay_order_id !== "string" ||
        typeof razorpay_payment_id !== "string" ||
        typeof razorpay_signature !== "string"
    ) {
        throw createApiError(
            400,
            "Invalid or missing required Razorpay callback parameters. Order ID, payment ID, and signature must be non-empty strings."
        );
    }

    const orderId = razorpay_order_id.trim();
    const paymentIdVal = razorpay_payment_id.trim();
    const signature = razorpay_signature.trim();

    if (!orderId || !paymentIdVal || !signature) {
        throw createApiError(
            400,
            "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required."
        );
    }

    // 1. Exact lookup: Find payment record owned by authenticated brand with exact razorpayOrderId
    const payment = await Payment.findOne({
        brand: brandId,
        razorpayOrderId: orderId
    });

    if (!payment) {
        throw createApiError(
            404,
            "Payment record not found for the provided Razorpay Order ID and brand"
        );
    }

    // Confirm brand ownership
    if (payment.brand.toString() !== brandId.toString()) {
        throw createApiError(
            403,
            "Access denied: payment record does not belong to authenticated brand"
        );
    }

    // 2. Idempotency Check: Strict AND condition for already paid payments
    if (payment.status === "paid") {
        const isMatch =
            payment.razorpayOrderId === orderId &&
            payment.razorpayPaymentId === paymentIdVal;

        if (isMatch) {
            return {
                message: "Payment has already been successfully verified and marked as paid",
                payment
            };
        } else {
            throw createApiError(
                400,
                "Payment has already been completed with a different payment or order reference"
            );
        }
    }

    // 3. Signature Verification using HMAC SHA-256 with timingSafeEqual
    const isSignatureValid = verifyRazorpaySignature({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentIdVal,
        razorpay_signature: signature
    });

    if (!isSignatureValid) {
        // SECURITY FIX: Never release active reservation or mark failed on invalid signature submission
        throw createApiError(
            400,
            "Invalid Razorpay payment signature. Verification failed."
        );
    }

    // 4. Trusted Server-side Payment Verification with Razorpay API
    const razorpay = getRazorpayInstance();
    let fetchedPayment;
    try {
        fetchedPayment = await razorpay.payments.fetch(paymentIdVal);
    } catch (fetchErr) {
        console.error("Razorpay Payment Fetch Error:", fetchErr?.message || fetchErr);
        // Do NOT mark failed on gateway fetch error or network timeout. Preserve reservation for manual reconciliation.
        throw createApiError(
            502,
            `Failed to verify payment with Razorpay gateway: ${fetchErr?.error?.description || fetchErr?.message || "Gateway fetch error"}`
        );
    }

    if (!fetchedPayment) {
        throw createApiError(
            502,
            "Failed to retrieve payment details from Razorpay gateway"
        );
    }

    // Verify fetched Razorpay payment details against stored record
    const fetchedOrderId = (fetchedPayment.order_id || "").trim();
    const fetchedStatus = (fetchedPayment.status || "").toLowerCase();
    const fetchedCurrency = (fetchedPayment.currency || "").trim().toUpperCase();
    const fetchedAmountInPaise = Number(fetchedPayment.amount);

    const expectedPaise = Math.round(Number(payment.amount) * 100);

    const isOrderMatch = fetchedOrderId === orderId && fetchedOrderId === payment.razorpayOrderId;
    const isCurrencyMatch = fetchedCurrency === (payment.currency || "INR").trim().toUpperCase();
    const isAmountMatch = fetchedAmountInPaise === expectedPaise;

    if (!isOrderMatch || !isCurrencyMatch || !isAmountMatch) {
        throw createApiError(
            400,
            "Razorpay payment verification failed: order ID, amount, or currency mismatch."
        );
    }

    // Accept ONLY 'captured' status as paid. Do NOT treat 'authorized' as paid!
    if (fetchedStatus !== "captured") {
        if (fetchedStatus === "failed") {
            // Atomically mark failed and release lock only if payment is not already paid
            const failedPayment = await Payment.findOneAndUpdate(
                {
                    _id: payment._id,
                    status: { $ne: "paid" }
                },
                {
                    $set: {
                        status: "failed",
                        isActive: false,
                        razorpayPaymentId: paymentIdVal,
                        transactionId: payment.transactionId || paymentIdVal
                    }
                },
                { new: true }
            );

            if (!failedPayment) {
                const recheck = await Payment.findById(payment._id);

                if (recheck?.status === "paid") {
                    throw createApiError(
                        400,
                        "Payment has already been successfully verified and completed. Cannot mark a completed payment as failed."
                    );
                }

                if (recheck?.status === "failed") {
                    throw createApiError(400, "Payment failed at Razorpay checkout");
                }

                if (!recheck) {
                    throw createApiError(404, "Payment record not found");
                }

                throw createApiError(400, "Failed to update payment status");
            }

            throw createApiError(400, "Payment failed at Razorpay checkout");
        } else {
            // Status is 'authorized', 'created', etc. Preserve reservation in non-paid state.
            throw createApiError(
                400,
                `Payment status is '${fetchedStatus}' at Razorpay gateway. Payment must be captured to be marked as paid.`
            );
        }
    }

    // 5. Atomic state update to 'paid' status to prevent concurrent request race conditions
    const updatedPayment = await Payment.findOneAndUpdate(
        {
            _id: payment._id,
            status: { $ne: "paid" }
        },
        {
            $set: {
                razorpayOrderId: orderId,
                razorpayPaymentId: paymentIdVal,
                transactionId: paymentIdVal,
                status: "paid",
                isActive: true, // Keep isActive = true so partial unique index permanently blocks duplicate active payments
                paidAt: payment.paidAt || new Date(),
                isTestMode: true
            }
        },
        { new: true }
    );

    if (!updatedPayment) {
        const recheck = await Payment.findById(payment._id);

        if (recheck?.status === "paid") {
            const isMatch =
                recheck.razorpayOrderId === orderId &&
                recheck.razorpayPaymentId === paymentIdVal;

            if (isMatch) {
                return {
                    message: "Payment has already been successfully verified and marked as paid",
                    payment: recheck
                };
            }

            throw createApiError(
                400,
                "Payment has already been completed with a different payment or order reference"
            );
        }

        throw createApiError(400, "Failed to update payment status");
    }

    await createNotificationSafe({
        recipient: updatedPayment.creator,
        sender: brandId,
        type: "payment:received",
        title: "Payment Received!",
        message: `You received a payment of ₹${updatedPayment.amount} for your collaboration!`,
        entityType: "payment",
        entityId: updatedPayment._id,
        destination: "/creator/payments",
        metadata: {
            paymentId: updatedPayment._id,
            amount: updatedPayment.amount,
            currency: updatedPayment.currency,
            workspaceId: updatedPayment.workspace
        },
        idempotencyKey: `payment:received:${updatedPayment._id}`
    });

    return {
        message: "Payment successfully verified and completed",
        payment: updatedPayment
    };
};

// Reports and verifies a failed Razorpay payment attempt via Razorpay API and updates status to 'failed'
const reportBrandPaymentFailureService = async (brandId, payload = {}) => {
    const {
        razorpay_order_id,
        razorpay_payment_id
    } = payload;

    if (
        typeof razorpay_order_id !== "string" ||
        typeof razorpay_payment_id !== "string"
    ) {
        throw createApiError(
            400,
            "Invalid or missing required Razorpay order ID or payment ID"
        );
    }

    const orderId = razorpay_order_id.trim();
    const paymentIdVal = razorpay_payment_id.trim();

    if (!orderId || !paymentIdVal) {
        throw createApiError(
            400,
            "Missing required fields: razorpay_order_id and razorpay_payment_id are required"
        );
    }

    // 1. Find MongoDB Payment document for authenticated brand by razorpayOrderId
    const payment = await Payment.findOne({
        brand: brandId,
        razorpayOrderId: orderId
    });

    if (!payment) {
        throw createApiError(
            404,
            "Payment record not found for the provided Razorpay Order ID and brand"
        );
    }

    // Confirm brand ownership
    if (payment.brand.toString() !== brandId.toString()) {
        throw createApiError(
            403,
            "Access denied: payment record does not belong to authenticated brand"
        );
    }

    // Idempotency Checks
    if (payment.status === "failed") {
        return {
            message: "Payment is already marked as failed",
            payment
        };
    }

    if (payment.status === "paid") {
        throw createApiError(
            400,
            "Payment has already been successfully verified and completed. Cannot mark a completed payment as failed."
        );
    }

    // 2. Server-side Gateway Verification with Razorpay API (never trust client input alone)
    const razorpay = getRazorpayInstance();
    let fetchedPayment;
    try {
        fetchedPayment = await razorpay.payments.fetch(paymentIdVal);
    } catch (fetchErr) {
        console.error("Razorpay Payment Fetch Error during failure report:", fetchErr?.message || fetchErr);
        throw createApiError(
            502,
            `Failed to verify payment status with Razorpay gateway: ${fetchErr?.error?.description || fetchErr?.message || "Gateway error"}`
        );
    }

    if (!fetchedPayment) {
        throw createApiError(
            502,
            "Failed to retrieve payment details from Razorpay gateway"
        );
    }

    const fetchedOrderId = (fetchedPayment.order_id || "").trim();
    const fetchedStatus = (fetchedPayment.status || "").toLowerCase();

    if (fetchedOrderId !== orderId) {
        throw createApiError(
            400,
            "Razorpay payment verification failed: order ID mismatch"
        );
    }

    if (fetchedStatus !== "failed") {
        throw createApiError(
            400,
            `Razorpay gateway reports payment status as '${fetchedStatus}', not 'failed'. Payment status was not updated.`
        );
    }

    // 3. Atomic conditional update to 'failed' status to prevent overwriting concurrent 'paid' status
    const updatedPayment = await Payment.findOneAndUpdate(
        {
            _id: payment._id,
            status: { $ne: "paid" }
        },
        {
            $set: {
                status: "failed",
                isActive: false, // Release active lock so brand can re-attempt payment
                razorpayPaymentId: paymentIdVal,
                transactionId: payment.transactionId || paymentIdVal
            }
        },
        { new: true }
    );

    // If update returned null, the status was modified concurrently (e.g. marked 'paid' or 'failed')
    if (!updatedPayment) {
        const recheck = await Payment.findById(payment._id);

        if (recheck?.status === "paid") {
            throw createApiError(
                400,
                "Payment has already been successfully verified and completed. Cannot mark a completed payment as failed."
            );
        }

        if (recheck?.status === "failed") {
            return {
                message: "Payment is already marked as failed",
                payment: recheck
            };
        }

        throw createApiError(400, "Failed to update payment status");
    }

    await createNotificationSafe({
        recipient: brandId,
        sender: null,
        type: "payment:failed",
        title: "Payment Attempt Failed",
        message: `Your payment attempt of ₹${updatedPayment.amount} was not successful. Please re-attempt from your Payments dashboard.`,
        entityType: "payment",
        entityId: updatedPayment._id,
        destination: "/brand/payments",
        metadata: {
            paymentId: updatedPayment._id,
            amount: updatedPayment.amount,
            currency: updatedPayment.currency,
            workspaceId: updatedPayment.workspace
        },
        idempotencyKey: `payment:failed:${updatedPayment._id}:${paymentIdVal || updatedPayment.razorpayOrderId || updatedPayment._id}`
    });

    return {
        message: "Payment status updated to failed based on gateway verification",
        payment: updatedPayment
    };
};

export {
    createBrandPaymentOrderService,
    verifyBrandPaymentService,
    reportBrandPaymentFailureService,
    getBrandPaymentsService,
    getBrandPaymentByIdService,
    getCreatorPaymentsService,
    getCreatorPaymentByIdService
};

