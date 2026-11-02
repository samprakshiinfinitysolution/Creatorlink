import mongoose from "mongoose";
import createApiError from "../../../utils/ApiError.js";

// Validates query parameters for Admin collaborations listing.
const validateGetCollaborationsQuery = (req, res, next) => {
    const {
        page,
        limit,
        status,
        search,
        sortBy,
        isOverdue
    } = req.query;

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

    if (status !== undefined && status !== "all") {
        const allowedStatuses = [
            "in_progress",
            "submitted",
            "revision_requested",
            "completed",
            "cancelled"
        ];
        if (!allowedStatuses.includes(status.toLowerCase())) {
            throw createApiError(
                400,
                `status must be one of: ${allowedStatuses.join(", ")}, or all`
            );
        }
    }

    if (search !== undefined && typeof search !== "string") {
        throw createApiError(400, "search must be a string");
    }

    if (isOverdue !== undefined && isOverdue !== "all") {
        if (isOverdue !== "true" && isOverdue !== "false") {
            throw createApiError(400, "isOverdue must be 'true', 'false', or 'all'");
        }
    }

    if (sortBy !== undefined) {
        const allowedSort = [
            "newest",
            "oldest",
            "deadline_near",
            "price_high",
            "price_low"
        ];
        if (!allowedSort.includes(sortBy.toLowerCase())) {
            throw createApiError(
                400,
                `sortBy must be one of: ${allowedSort.join(", ")}`
            );
        }
    }

    next();
};

// Validates collaboration (workspace) ID route parameter.
const validateCollaborationIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createApiError(400, "Invalid collaboration/workspace ID format");
    }

    next();
};

// Validates status override request body.
const validateOverrideStatusBody = (req, res, next) => {
    const { status, reason } = req.body;

    const allowedStatuses = [
        "in_progress",
        "submitted",
        "revision_requested",
        "completed",
        "cancelled"
    ];

    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
        throw createApiError(
            400,
            `status is required and must be one of: ${allowedStatuses.join(", ")}`
        );
    }

    if (reason !== undefined && typeof reason !== "string") {
        throw createApiError(400, "reason must be a string");
    }

    next();
};

// Validates deadline extension request body.
const validateExtendDeadlineBody = (req, res, next) => {
    const { newDeadline, reason } = req.body;

    if (!newDeadline) {
        throw createApiError(400, "newDeadline is required");
    }

    const parsedDate = new Date(newDeadline);
    if (isNaN(parsedDate.getTime())) {
        throw createApiError(400, "newDeadline must be a valid date format");
    }

    if (parsedDate.getTime() <= Date.now()) {
        throw createApiError(400, "newDeadline must be a future date");
    }

    if (reason !== undefined && typeof reason !== "string") {
        throw createApiError(400, "reason must be a string");
    }

    next();
};

export {
    validateGetCollaborationsQuery,
    validateCollaborationIdParam,
    validateOverrideStatusBody,
    validateExtendDeadlineBody
};

