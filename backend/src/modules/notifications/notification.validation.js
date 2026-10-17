import mongoose from "mongoose";
import createApiError from "../../utils/ApiError.js";

// Validates notification ID in URL parameters.
const validateNotificationIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createApiError(
            400,
            "Valid notification ID is required"
        );
    }

    next();
};

const ALLOWED_ENTITY_TYPES = [
    "booking",
    "workspace",
    "campaign",
    "payment",
    "review",
    "message"
];

// Validates query parameters for fetching notifications feed.
const validateGetNotificationsQuery = (req, res, next) => {
    const { page, limit, isRead, entityType } = req.query;

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

    if (isRead !== undefined && isRead !== null && isRead !== "") {
        const normalized = String(isRead).toLowerCase();
        if (normalized !== "true" && normalized !== "false") {
            throw createApiError(
                400,
                "isRead filter must be 'true' or 'false'"
            );
        }
    }

    if (entityType !== undefined && entityType !== null && entityType !== "") {
        const normalizedEntityType = String(entityType).trim().toLowerCase();
        if (normalizedEntityType !== "all" && !ALLOWED_ENTITY_TYPES.includes(normalizedEntityType)) {
            throw createApiError(
                400,
                `Invalid entityType filter. Allowed types: ${ALLOWED_ENTITY_TYPES.join(", ")} or 'all'`
            );
        }
    }

    next();
};

export {
    validateNotificationIdParam,
    validateGetNotificationsQuery
};
