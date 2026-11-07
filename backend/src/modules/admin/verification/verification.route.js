import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    getAdminVerifications,
    getAdminVerificationById,
    approveVerification,
    rejectVerification,
    revokeVerification
} from "./verification.controller.js";
import {
    validateGetVerificationsQuery,
    validateVerificationIdParam,
    validateApproveVerificationBody,
    validateRejectVerificationBody,
    validateRevokeVerificationBody
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
    validateApproveVerificationBody,
    approveVerification
);

// Reject verification request with reason
router.patch(
    "/:id/reject",
    validateVerificationIdParam,
    validateRejectVerificationBody,
    rejectVerification
);

// Revoke an approved verification request with reason
router.patch(
    "/:id/revoke",
    validateVerificationIdParam,
    validateRevokeVerificationBody,
    revokeVerification
);

export default router;

