import mongoose from "mongoose";
import createApiError from "../../../utils/ApiError.js";

// Validates query parameters for Admin verification queue listing.
export const validateGetVerificationsQuery = (req, res, next) => {
    const { page, limit, role, status, sortBy, search } = req.query;

    if (page !== undefined) {
        const parsedPage = Number(page);
        if (!Number.isInteger(parsedPage) || parsedPage < 1) {
            throw createApiError(400, "page must be a positive integer");
        }
    }

    if (limit !== undefined) {
        const parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            throw createApiError(400, "limit must be an integer between 1 and 100");
        }
    }

    if (role !== undefined && role !== "all") {
        const allowedRoles = ["creator", "brand"];
        if (!allowedRoles.includes(role.toLowerCase())) {
            throw createApiError(400, `role must be one of: ${allowedRoles.join(", ")}, or all`);
        }
    }

    if (status !== undefined && status !== "all") {
        const allowedStatus = ["pending", "approved", "rejected"];
        if (!allowedStatus.includes(status.toLowerCase())) {
            throw createApiError(400, `status must be one of: ${allowedStatus.join(", ")}, or all`);
        }
    }

    if (sortBy !== undefined) {
        const allowedSort = ["newest", "oldest"];
        if (!allowedSort.includes(sortBy.toLowerCase())) {
            throw createApiError(400, `sortBy must be one of: ${allowedSort.join(", ")}`);
        }
    }

    if (search !== undefined && typeof search !== "string") {
        throw createApiError(400, "search must be a string");
    }

    next();
};

// Validates route parameter :id as a valid MongoDB ObjectId.
export const validateVerificationIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createApiError(400, "Invalid verification request ID format");
    }

    next();
};

// Validates payload when admin approves a verification request (optional reason/notes).
export const validateApproveVerificationBody = (req, res, next) => {
    const { reason, notes } = req.body || {};

    const text = reason || notes;
    if (text !== undefined && text !== null && text !== "") {
        if (typeof text !== "string") {
            throw createApiError(400, "Approval reason must be a string");
        }
        if (text.trim().length > 1000) {
            throw createApiError(400, "Approval reason cannot exceed 1000 characters");
        }
    }

    next();
};

// Validates payload when admin rejects a verification request.
export const validateRejectVerificationBody = (req, res, next) => {
    const { rejectionReason, reason } = req.body || {};
    const text = rejectionReason || reason;

    if (text !== undefined && text !== null && text !== "") {
        if (typeof text !== "string") {
            throw createApiError(400, "rejectionReason must be a string");
        }
        if (text.trim().length > 1000) {
            throw createApiError(400, "rejectionReason cannot exceed 1000 characters");
        }
    }

    next();
};

// Validates payload when admin revokes an approved verification.
export const validateRevokeVerificationBody = (req, res, next) => {
    const { reason, rejectionReason } = req.body || {};
    const text = reason || rejectionReason;

    if (!text || typeof text !== "string" || text.trim().length < 3) {
        throw createApiError(400, "A reason of at least 3 characters is required to revoke verification status");
    }

    if (text.trim().length > 1000) {
        throw createApiError(400, "Revocation reason cannot exceed 1000 characters");
    }

    next();
};

// Validates payload when user (creator or brand) submits a verification request (documents now optional).
export const validateSubmitVerificationBody = (req, res, next) => {
    const { documentType, documentUrls, documentNumber, notes } = req.body;

    if (documentType !== undefined && typeof documentType !== "string") {
        throw createApiError(400, "documentType must be a string");
    }

    if (documentUrls !== undefined) {
        if (!Array.isArray(documentUrls)) {
            throw createApiError(400, "documentUrls must be an array of file URLs");
        }
        if (documentUrls.length > 5) {
            throw createApiError(400, "Maximum of 5 verification documents can be submitted");
        }
        for (const url of documentUrls) {
            if (typeof url !== "string" || !url.trim().startsWith("http")) {
                throw createApiError(400, "Each item in documentUrls must be a valid HTTP/HTTPS URL");
            }
        }
    }

    if (documentNumber !== undefined && typeof documentNumber !== "string") {
        throw createApiError(400, "documentNumber must be a string");
    }

    if (notes !== undefined && typeof notes !== "string") {
        throw createApiError(400, "notes must be a string");
    }

    next();
};

