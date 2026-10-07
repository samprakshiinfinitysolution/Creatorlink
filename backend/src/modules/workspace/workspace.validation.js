import mongoose from "mongoose";
import createApiError from "../../utils/ApiError.js";

const allowedWorkspaceStatuses = [
    "in_progress",
    "submitted",
    "revision_requested",
    "completed",
    "cancelled"
];

// Validates creator submission request payload
const validateCreatorSubmission = (req, res, next) => {
    const { title, link, fileUrl, notes } = req.body;

    if (!title && !link && !fileUrl && !notes) {
        throw createApiError(
            400,
            "At least one field (title, link, fileUrl, or notes) must be provided for submission"
        );
    }

    if (title !== undefined && (typeof title !== "string" || title.length > 200)) {
        throw createApiError(
            400,
            "Title must be a string with maximum 200 characters"
        );
    }

    if (link !== undefined && typeof link !== "string") {
        throw createApiError(
            400,
            "Link must be a valid string"
        );
    }

    if (fileUrl !== undefined && typeof fileUrl !== "string") {
        throw createApiError(
            400,
            "File URL must be a valid string"
        );
    }

    if (notes !== undefined && (typeof notes !== "string" || notes.length > 2000)) {
        throw createApiError(
            400,
            "Notes must be a string with maximum 2000 characters"
        );
    }

    next();
};

// Validates brand review request payload (approval or revision request)
const validateBrandReview = (req, res, next) => {
    const { status, action, feedback } = req.body;
    const reviewStatus = status || action;

    if (!reviewStatus) {
        throw createApiError(
            400,
            "Review status or action is required ('completed', 'approve', 'revision_requested', or 'revision')"
        );
    }

    const normalizedStatus = String(reviewStatus).toLowerCase();
    const validActions = ["completed", "approve", "revision_requested", "revision"];

    if (!validActions.includes(normalizedStatus)) {
        throw createApiError(
            400,
            `Invalid review status. Allowed values: ${validActions.join(", ")}`
        );
    }

    if (
        (normalizedStatus === "revision_requested" || normalizedStatus === "revision") &&
        (!feedback || typeof feedback !== "string" || !feedback.trim())
    ) {
        throw createApiError(
            400,
            "Feedback is required when requesting a revision"
        );
    }

    next();
};

// Validates query parameters for listing workspaces
const validateGetWorkspacesQuery = (req, res, next) => {
    const { page, limit, status } = req.query;

    if (page !== undefined) {
        const parsedPage = Number(page);
        if (!Number.isInteger(parsedPage) || parsedPage < 1) {
            throw createApiError(
                400,
                "Page must be a valid positive integer"
            );
        }
    }

    if (limit !== undefined) {
        const parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
            throw createApiError(
                400,
                "Limit must be a valid positive integer"
            );
        }
    }

    if (
        status !== undefined &&
        status.trim() !== "" &&
        !allowedWorkspaceStatuses.includes(status.trim())
    ) {
        throw createApiError(
            400,
            "Invalid status filter"
        );
    }

    next();
};

export {
    validateCreatorSubmission,
    validateBrandReview,
    validateGetWorkspacesQuery
};
