import express from "express";

import authenticateUser from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
    createBrandPaymentOrder,
    verifyBrandPayment,
    reportBrandPaymentFailure,
    getBrandPayments,
    getBrandPaymentById,
    getCreatorPayments,
    getCreatorPaymentById
} from "./payment.controller.js";

// =========================================================
// BRAND PAYMENT ROUTER
// =========================================================
const brandPaymentRouter = express.Router();

brandPaymentRouter.use(
    authenticateUser,
    authorizeRoles("brand")
);

// Brand initiates Razorpay order creation for a completed workspace
brandPaymentRouter.post(
    "/create-order",
    createBrandPaymentOrder
);

// Brand verifies Razorpay payment signature & payment status after Checkout
brandPaymentRouter.post(
    "/verify",
    verifyBrandPayment
);

// Brand reports Razorpay failed payment attempt verified server-side with gateway
brandPaymentRouter.post(
    "/report-failed",
    reportBrandPaymentFailure
);

// Brand fetches their payments list
brandPaymentRouter.get(
    "/",
    getBrandPayments
);

// Brand fetches single payment by ID
brandPaymentRouter.get(
    "/:id",
    getBrandPaymentById
);

// =========================================================
// CREATOR PAYMENT ROUTER
// =========================================================
const creatorPaymentRouter = express.Router();

creatorPaymentRouter.use(
    authenticateUser,
    authorizeRoles("creator")
);

// Creator fetches received payments list
creatorPaymentRouter.get(
    "/",
    getCreatorPayments
);

// Creator fetches single received payment by ID
creatorPaymentRouter.get(
    "/:id",
    getCreatorPaymentById
);

export {
    brandPaymentRouter,
    creatorPaymentRouter
};
