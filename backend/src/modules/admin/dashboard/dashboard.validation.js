import createApiError from "../../../utils/ApiError.js";

// Validates query parameters for Admin Dashboard overview.
const validateGetAdminDashboardQuery = (req, res, next) => {
    const { recentLimit, timeRange } = req.query;

    if (recentLimit !== undefined) {
        const parsedLimit = Number(recentLimit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
            throw createApiError(
                400,
                "recentLimit must be an integer between 1 and 50"
            );
        }
    }

    if (timeRange !== undefined) {
        const allowedRanges = ["7d", "30d", "90d", "1y", "all"];
        if (!allowedRanges.includes(timeRange.toLowerCase())) {
            throw createApiError(
                400,
                `timeRange must be one of: ${allowedRanges.join(", ")}`
            );
        }
    }

    next();
};

export {
    validateGetAdminDashboardQuery
};
