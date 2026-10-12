import mongoose from "mongoose";
import createApiError from "../../../utils/ApiError.js";

// Allowed platforms across social links, services, and portfolio
const allowedPlatforms = [
    "instagram",
    "facebook",
    "youtube",
    "tiktok",
    "website",
    "multiple",
    "other"
];

// Allowed sort fields for creator discovery
const allowedSortFields = [
    "followerCount",
    "engagementRate",
    "createdAt",
    "name",
    "rating",
    "minPrice",
    "price"
];

// Allowed sort directions
const allowedSortOrders = [
    "asc",
    "desc"
];

// Validates discover creators query parameters
const validateGetDiscoverCreators = (req, res, next) => {
    const {
        page,
        limit,
        search,
        category,
        platform,
        location,
        minFollowers,
        maxFollowers,
        minEngagement,
        maxPrice,
        sortBy,
        sortOrder
    } = req.query;

    // Validate page: must be a positive finite integer >= 1
    if (page !== undefined && page !== "") {
        if (typeof page !== "string" && typeof page !== "number") {
            throw createApiError(
                400,
                "Page must be a valid positive integer"
            );
        }
        const parsedPage = Number(page);
        if (!Number.isFinite(parsedPage) || !Number.isInteger(parsedPage) || parsedPage < 1) {
            throw createApiError(
                400,
                "Page must be a valid positive integer"
            );
        }
    }

    // Validate limit: must be a positive finite integer between 1 and 100
    if (limit !== undefined && limit !== "") {
        if (typeof limit !== "string" && typeof limit !== "number") {
            throw createApiError(
                400,
                "Limit must be a valid positive integer"
            );
        }
        const parsedLimit = Number(limit);
        if (!Number.isFinite(parsedLimit) || !Number.isInteger(parsedLimit) || parsedLimit < 1) {
            throw createApiError(
                400,
                "Limit must be a valid positive integer"
            );
        }
        if (parsedLimit > 100) {
            throw createApiError(
                400,
                "Limit cannot exceed 100"
            );
        }
    }

    // Validate search
    if (search !== undefined && typeof search !== "string") {
        throw createApiError(
            400,
            "Search query must be a string"
        );
    }

    // Validate category
    if (category !== undefined && typeof category !== "string") {
        throw createApiError(
            400,
            "Category filter must be a string"
        );
    }

    // Validate location
    if (location !== undefined && typeof location !== "string") {
        throw createApiError(
            400,
            "Location filter must be a string"
        );
    }

    // Validate platform
    if (platform !== undefined && platform !== "") {
        if (typeof platform !== "string") {
            throw createApiError(
                400,
                "Platform filter must be a string"
            );
        }
        if (!allowedPlatforms.includes(platform.trim().toLowerCase())) {
            throw createApiError(
                400,
                `Invalid platform filter. Allowed values: ${allowedPlatforms.join(", ")}`
            );
        }
    }

    // Validate minFollowers: must be a finite non-negative integer
    let parsedMinFollowers;
    if (minFollowers !== undefined && minFollowers !== "") {
        if (typeof minFollowers !== "string" && typeof minFollowers !== "number") {
            throw createApiError(
                400,
                "Minimum followers must be a non-negative integer"
            );
        }
        parsedMinFollowers = Number(minFollowers);
        if (!Number.isFinite(parsedMinFollowers) || !Number.isInteger(parsedMinFollowers) || parsedMinFollowers < 0) {
            throw createApiError(
                400,
                "Minimum followers must be a non-negative integer"
            );
        }
    }

    // Validate maxFollowers: must be a finite non-negative integer
    let parsedMaxFollowers;
    if (maxFollowers !== undefined && maxFollowers !== "") {
        if (typeof maxFollowers !== "string" && typeof maxFollowers !== "number") {
            throw createApiError(
                400,
                "Maximum followers must be a non-negative integer"
            );
        }
        parsedMaxFollowers = Number(maxFollowers);
        if (!Number.isFinite(parsedMaxFollowers) || !Number.isInteger(parsedMaxFollowers) || parsedMaxFollowers < 0) {
            throw createApiError(
                400,
                "Maximum followers must be a non-negative integer"
            );
        }
    }

    // Validate followers range
    if (
        parsedMinFollowers !== undefined &&
        parsedMaxFollowers !== undefined &&
        parsedMinFollowers > parsedMaxFollowers
    ) {
        throw createApiError(
            400,
            "Minimum followers cannot be greater than maximum followers"
        );
    }

    // Validate minEngagement: must be a finite non-negative number
    if (minEngagement !== undefined && minEngagement !== "") {
        if (typeof minEngagement !== "string" && typeof minEngagement !== "number") {
            throw createApiError(
                400,
                "Minimum engagement must be a non-negative number"
            );
        }
        const parsedEngagement = Number(minEngagement);
        if (!Number.isFinite(parsedEngagement) || parsedEngagement < 0) {
            throw createApiError(
                400,
                "Minimum engagement must be a non-negative number"
            );
        }
    }

    // Validate maxPrice: must be a finite non-negative number
    if (maxPrice !== undefined && maxPrice !== "") {
        if (typeof maxPrice !== "string" && typeof maxPrice !== "number") {
            throw createApiError(
                400,
                "Maximum price must be a non-negative number"
            );
        }
        const parsedPrice = Number(maxPrice);
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            throw createApiError(
                400,
                "Maximum price must be a non-negative number"
            );
        }
    }

    // Validate and normalize sortBy
    if (sortBy !== undefined && sortBy !== "") {
        if (typeof sortBy !== "string") {
            throw createApiError(
                400,
                "SortBy parameter must be a string"
            );
        }
        const trimmedSortBy = sortBy.trim();
        if (!allowedSortFields.includes(trimmedSortBy)) {
            throw createApiError(
                400,
                `Invalid sortBy field. Allowed fields: ${allowedSortFields.join(", ")}`
            );
        }
        req.query.sortBy = trimmedSortBy;
    }

    // Validate and normalize sortOrder
    if (sortOrder !== undefined && sortOrder !== "") {
        if (typeof sortOrder !== "string") {
            throw createApiError(
                400,
                "SortOrder parameter must be a string"
            );
        }
        const normalizedSortOrder = sortOrder.trim().toLowerCase();
        if (!allowedSortOrders.includes(normalizedSortOrder)) {
            throw createApiError(
                400,
                "Invalid sortOrder. Must be 'asc' or 'desc'"
            );
        }
        req.query.sortOrder = normalizedSortOrder;
    }

    next();
};

// Validates creator ID format in path parameter
const validateGetCreatorById = (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createApiError(
            400,
            "Invalid creator ID format"
        );
    }

    next();
};

export {
    validateGetDiscoverCreators,
    validateGetCreatorById
};
