import mongoose from "mongoose";
import createApiError from "../../utils/ApiError.js";

// Validates review creation payload
const validateCreateReview = (req, res, next) => {
    const { workspaceId, workspace, rating, comment } = req.body;
    const targetWorkspaceId = workspaceId || workspace;

    if (!targetWorkspaceId) {
        throw createApiError(
            400,
            "Workspace ID is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(targetWorkspaceId)) {
        throw createApiError(
            400,
            "Invalid Workspace ID format"
        );
    }

    if (rating === undefined || rating === null) {
        throw createApiError(
            400,
            "Rating is required"
        );
    }

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        throw createApiError(
            400,
            "Rating must be an integer between 1 and 5"
        );
    }

    if (comment !== undefined && comment !== null) {
        if (typeof comment !== "string") {
            throw createApiError(
                400,
                "Comment must be a string"
            );
        }
        if (comment.trim().length > 1000) {
            throw createApiError(
                400,
                "Comment cannot exceed 1000 characters"
            );
        }
    }

    next();
};

// Validates query parameters for fetching reviews
const validateGetReviewsQuery = (req, res, next) => {
    const { page, limit } = req.query;

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
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            throw createApiError(
                400,
                "Limit must be an integer between 1 and 100"
            );
        }
    }

    next();
};

// Validates workspaceId route parameter
const validateWorkspaceIdParam = (req, res, next) => {
    const { workspaceId } = req.params;

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
        throw createApiError(
            400,
            "Invalid Workspace ID format"
        );
    }

    next();
};

export {
    validateCreateReview,
    validateGetReviewsQuery,
    validateWorkspaceIdParam
};
