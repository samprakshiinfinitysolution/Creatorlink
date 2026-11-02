import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import {
    getAdminVerificationsService,
    getAdminVerificationByIdService,
    approveVerificationService,
    rejectVerificationService,
    submitUserVerificationService,
    getUserVerificationStatusService
} from "./verification.service.js";

/**
 * Controller: Lists all verification requests with administrative filters.
 * GET /api/admin/verifications
 */
export const getAdminVerifications = asyncHandler(async (req, res) => {
    const result = await getAdminVerificationsService(req.query);

    return sendResponse(
        res,
        200,
        "Verification requests fetched successfully",
        result
    );
});

/**
 * Controller: Retrieves complete verification request dossier by ID.
 * GET /api/admin/verifications/:id
 */
export const getAdminVerificationById = asyncHandler(async (req, res) => {
    const result = await getAdminVerificationByIdService(req.params.id);

    return sendResponse(
        res,
        200,
        "Verification request details fetched successfully",
        result
    );
});

/**
 * Controller: Approves a pending verification request.
 * PATCH /api/admin/verifications/:id/approve
 */
export const approveVerification = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const result = await approveVerificationService(req.params.id, adminId);

    return sendResponse(
        res,
        200,
        "Verification request approved successfully",
        result
    );
});

/**
 * Controller: Rejects a pending verification request with justification.
 * PATCH /api/admin/verifications/:id/reject
 */
export const rejectVerification = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const result = await rejectVerificationService(
        req.params.id,
        adminId,
        req.body.rejectionReason
    );

    return sendResponse(
        res,
        200,
        "Verification request rejected successfully",
        result
    );
});

/**
 * Controller: Submits a new verification request (for Creator or Brand).
 * POST /api/creator/profile/verification or POST /api/brand/profile/verification
 */
export const submitUserVerification = asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user._id;
    const result = await submitUserVerificationService(
        userId,
        req.user.role,
        req.body
    );

    return sendResponse(
        res,
        201,
        "Verification request submitted successfully and is now pending review",
        result
    );
});

/**
 * Controller: Fetches the authenticated user's verification status and history.
 * GET /api/creator/profile/verification or GET /api/brand/profile/verification
 */
export const getUserVerificationStatus = asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user._id;
    const result = await getUserVerificationStatusService(userId);

    return sendResponse(
        res,
        200,
        "Verification status retrieved successfully",
        result
    );
});
