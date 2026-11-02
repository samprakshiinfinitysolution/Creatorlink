import mongoose from "mongoose";
import createApiError from "../../../utils/ApiError.js";

// Validates query parameters for Admin users listing.
const validateGetUsersQuery = (req, res, next) => {
    const { page, limit, role, isVerified, sortBy, search, startDate, endDate } = req.query;

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
        const allowedRoles = ["creator", "brand", "admin"];
        if (!allowedRoles.includes(role.toLowerCase())) {
            throw createApiError(400, `role must be one of: ${allowedRoles.join(", ")}, or all`);
        }
    }

    if (isVerified !== undefined && isVerified !== "all") {
        if (isVerified !== "true" && isVerified !== "false") {
            throw createApiError(400, "isVerified must be 'true', 'false', or 'all'");
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

    if (startDate !== undefined) {
        const parsed = new Date(startDate);
        if (isNaN(parsed.getTime())) {
            throw createApiError(400, "startDate must be a valid date string");
        }
    }

    if (endDate !== undefined) {
        const parsed = new Date(endDate);
        if (isNaN(parsed.getTime())) {
            throw createApiError(400, "endDate must be a valid date string");
        }
    }

    next();
};

// Validates user ID route parameter.
const validateUserIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createApiError(400, "Invalid user ID format");
    }

    next();
};

export {
    validateGetUsersQuery,
    validateUserIdParam
};

