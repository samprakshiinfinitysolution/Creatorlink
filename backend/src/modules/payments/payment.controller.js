import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";

import {
    createBrandPaymentOrderService,
    verifyBrandPaymentService,
    reportBrandPaymentFailureService,
    getBrandPaymentsService,
    getBrandPaymentByIdService,
    getCreatorPaymentsService,
    getCreatorPaymentByIdService
} from "./payment.service.js";

// =========================================================
// BRAND PAYMENT CONTROLLERS
// =========================================================

// Brand initiates Razorpay Order creation for a completed workspace
const createBrandPaymentOrder = asyncHandler(async (req, res) => {
    const result = await createBrandPaymentOrderService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        201,
        "Razorpay order created successfully",
        result
    );
});

// Brand verifies Razorpay payment signature & server-side payment status
const verifyBrandPayment = asyncHandler(async (req, res) => {
    const result = await verifyBrandPaymentService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        200,
        result.message || "Payment verified successfully",
        result
    );
});

// Brand reports a failed payment attempt verified server-side with gateway
const reportBrandPaymentFailure = asyncHandler(async (req, res) => {
    const result = await reportBrandPaymentFailureService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        200,
        result.message || "Payment status updated to failed",
        result
    );
});

// Brand fetches their payment history list
const getBrandPayments = asyncHandler(async (req, res) => {
    const result = await getBrandPaymentsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Payments fetched successfully",
        result
    );
});

// Brand fetches single payment details by ID
const getBrandPaymentById = asyncHandler(async (req, res) => {
    const payment = await getBrandPaymentByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Payment fetched successfully",
        payment
    );
});

// =========================================================
// CREATOR PAYMENT CONTROLLERS
// =========================================================

// Creator fetches list of received payments
const getCreatorPayments = asyncHandler(async (req, res) => {
    const result = await getCreatorPaymentsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Received payments fetched successfully",
        result
    );
});

// Creator fetches single received payment details by ID
const getCreatorPaymentById = asyncHandler(async (req, res) => {
    const payment = await getCreatorPaymentByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Received payment fetched successfully",
        payment
    );
});

export {
    createBrandPaymentOrder,
    verifyBrandPayment,
    reportBrandPaymentFailure,
    getBrandPayments,
    getBrandPaymentById,
    getCreatorPayments,
    getCreatorPaymentById
};
