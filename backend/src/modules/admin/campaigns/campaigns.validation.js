import mongoose from "mongoose";
import createApiError from "../../../utils/ApiError.js";

// Validates query parameters for Admin campaigns listing.
const validateGetCampaignsQuery = (req, res, next) => {
    const {
        page,
        limit,
        status,
        platform,
        category,
        search,
        minBudget,
        maxBudget,
        isRestricted,
        sortBy
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
            "draft",
            "published",
            "paused",
            "in_progress",
            "completed",
            "closed"
        ];
        if (!allowedStatuses.includes(status.toLowerCase())) {
            throw createApiError(
                400,
                `status must be one of: ${allowedStatuses.join(", ")}, or all`
            );
        }
    }

    if (isRestricted !== undefined && isRestricted !== "all") {
        if (isRestricted !== "true" && isRestricted !== "false") {
            throw createApiError(400, "isRestricted must be 'true', 'false', or 'all'");
        }
    }

    if (platform !== undefined && platform !== "all") {
        const allowedPlatforms = [
            "instagram",
            "facebook",
            "youtube",
            "tiktok",
            "website"
        ];
        if (!allowedPlatforms.includes(platform.toLowerCase())) {
            throw createApiError(
                400,
                `platform must be one of: ${allowedPlatforms.join(", ")}, or all`
            );
        }
    }

    if (category !== undefined && typeof category !== "string") {
        throw createApiError(400, "category must be a string");
    }

    if (search !== undefined && typeof search !== "string") {
        throw createApiError(400, "search must be a string");
    }

    if (minBudget !== undefined) {
        const parsedMin = Number(minBudget);
        if (isNaN(parsedMin) || parsedMin < 0) {
            throw createApiError(400, "minBudget must be a non-negative number");
        }
    }

    if (maxBudget !== undefined) {
        const parsedMax = Number(maxBudget);
        if (isNaN(parsedMax) || parsedMax < 0) {
            throw createApiError(400, "maxBudget must be a non-negative number");
        }
    }

    if (sortBy !== undefined) {
        const allowedSort = [
            "newest",
            "oldest",
            "budget_high",
            "budget_low",
            "deadline"
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

// Validates campaign ID route parameter.
const validateCampaignIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createApiError(400, "Invalid campaign ID format");
    }

    next();
};

// Validates moderation pause action (reason is required)
const validateModerationPauseBody = (req, res, next) => {
    const { reason } = req.body;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
        throw createApiError(
            400,
            "Moderation reason is required when pausing a campaign"
        );
    }

    next();
};

// Validates moderation resume/close action (reason is optional string)
const validateModerationActionBody = (req, res, next) => {
    const { reason } = req.body;

    if (reason !== undefined && typeof reason !== "string") {
        throw createApiError(400, "reason must be a string");
    }

    next();
};

export {
    validateGetCampaignsQuery,
    validateCampaignIdParam,
    validateModerationPauseBody,
    validateModerationActionBody
};
