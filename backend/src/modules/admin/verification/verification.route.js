import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    getAdminVerifications,
    getAdminVerificationById,
    approveVerification,
    rejectVerification
} from "./verification.controller.js";
import {
    validateGetVerificationsQuery,
    validateVerificationIdParam,
    validateRejectVerificationBody
} from "./verification.validation.js";

const router = express.Router();

// Strict RBAC: All Admin Verification routes require valid JWT authentication and role === "admin"
router.use(
    authenticateUser,
    authorizeRoles("admin")
);

// List verification requests with filters
router.get(
    "/",
    validateGetVerificationsQuery,
    getAdminVerifications
);

// Get single verification request details
router.get(
    "/:id",
    validateVerificationIdParam,
    getAdminVerificationById
);

// Approve verification request
router.patch(
    "/:id/approve",
    validateVerificationIdParam,
    approveVerification
);

// Reject verification request with reason
router.patch(
    "/:id/reject",
    validateVerificationIdParam,
    validateRejectVerificationBody,
    rejectVerification
);

export default router;

