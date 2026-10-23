import createApiError from "../../../utils/ApiError.js";


// Allowed campaign platforms.
const allowedPlatforms = [
    "instagram",
    "facebook",
    "youtube",
    "tiktok",
    "website"
];


// Allowed sort fields.
const allowedSortFields = [
    "createdAt",
    "budget",
    "deadline",
    "title"
];


// Allowed sort orders.
const allowedSortOrders = [
    "asc",
    "desc"
];


// Allowed conceptual statuses for applied campaigns query.
const allowedConceptualStatuses = [
    "pending",
    "active",
    "completed",
    "rejected",
    "cancelled"
];


// Validates discover campaigns query parameters.
const validateGetDiscoverCampaigns = (req, res, next) => {

    const {
        page,
        limit,
        platform,
        minBudget,
        maxBudget,
        sortBy,
        sortOrder
    } = req.query;


    // Validate page if provided.
    if (page !== undefined) {
        const parsedPage = Number(page);
        if (!Number.isInteger(parsedPage) || parsedPage < 1) {
            throw createApiError(
                400,
                "Page must be a valid positive integer"
            );
        }
    }


    // Validate limit if provided.
    if (limit !== undefined) {
        const parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
            throw createApiError(
                400,
                "Limit must be a valid positive integer"
            );
        }
    }


    // Validate platform if provided.
    if (
        platform !== undefined &&
        platform.trim() !== "" &&
        !allowedPlatforms.includes(platform.trim())
    ) {
        throw createApiError(
            400,
            "Invalid platform filter"
        );
    }


    // Validate minBudget if provided.
    let parsedMinBudget;
    if (minBudget !== undefined && minBudget !== "") {
        parsedMinBudget = Number(minBudget);
        if (Number.isNaN(parsedMinBudget) || parsedMinBudget < 0) {
            throw createApiError(
                400,
                "Minimum budget must be a non-negative number"
            );
        }
    }


    // Validate maxBudget if provided.
    let parsedMaxBudget;
    if (maxBudget !== undefined && maxBudget !== "") {
        parsedMaxBudget = Number(maxBudget);
        if (Number.isNaN(parsedMaxBudget) || parsedMaxBudget < 0) {
            throw createApiError(
                400,
                "Maximum budget must be a non-negative number"
            );
        }
    }


    // Validate budget range if both minBudget and maxBudget are provided.
    if (
        parsedMinBudget !== undefined &&
        parsedMaxBudget !== undefined &&
        parsedMinBudget > parsedMaxBudget
    ) {
        throw createApiError(
            400,
            "Minimum budget cannot be greater than maximum budget"
        );
    }


    // Validate sortBy if provided.
    if (
        sortBy !== undefined &&
        sortBy.trim() !== "" &&
        !allowedSortFields.includes(sortBy.trim())
    ) {
        throw createApiError(
            400,
            "Invalid sortBy field"
        );
    }


    // Validate sortOrder if provided.
    if (
        sortOrder !== undefined &&
        sortOrder.trim() !== "" &&
        !allowedSortOrders.includes(sortOrder.trim())
    ) {
        throw createApiError(
            400,
            "Invalid sortOrder. Must be 'asc' or 'desc'"
        );
    }


    next();
};


// Validates applied campaigns query parameters.
const validateGetAppliedCampaignsQuery = (req, res, next) => {

    const {
        page,
        limit,
        status,
        search
    } = req.query;


    // Validate page if provided.
    if (page !== undefined) {
        const parsedPage = Number(page);
        if (!Number.isInteger(parsedPage) || parsedPage < 1) {
            throw createApiError(
                400,
                "Page must be a valid positive integer"
            );
        }
    }


    // Validate limit if provided.
    if (limit !== undefined) {
        const parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
            throw createApiError(
                400,
                "Limit must be a valid positive integer"
            );
        }
    }


    // Validate status if provided.
    if (
        status !== undefined &&
        status.trim() !== "" &&
        !allowedConceptualStatuses.includes(status.trim())
    ) {
        throw createApiError(
            400,
            `Invalid status filter. Allowed values: ${allowedConceptualStatuses.join(", ")}`
        );
    }


    // Validate search if provided.
    if (search !== undefined && typeof search !== "string") {
        throw createApiError(
            400,
            "Search parameter must be a string"
        );
    }


    next();
};


export {
    validateGetDiscoverCampaigns,
    validateGetAppliedCampaignsQuery
};
