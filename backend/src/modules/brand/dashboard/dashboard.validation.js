import createApiError from "../../../utils/ApiError.js";

const ALLOWED_TIMEFRAMES = ["30d", "90d", "6m", "all"];

// Validates query parameters for Brand Dashboard overview.
const validateGetBrandDashboardQuery = (req, res, next) => {
    const { recentLimit, deadlinesLimit, timeframe } = req.query;

    if (recentLimit !== undefined) {
        const parsedRecent = Number(recentLimit);
        if (!Number.isInteger(parsedRecent) || parsedRecent < 1 || parsedRecent > 50) {
            throw createApiError(
                400,
                "recentLimit must be an integer between 1 and 50"
            );
        }
    }

    if (deadlinesLimit !== undefined) {
        const parsedDeadlines = Number(deadlinesLimit);
        if (!Number.isInteger(parsedDeadlines) || parsedDeadlines < 1 || parsedDeadlines > 50) {
            throw createApiError(
                400,
                "deadlinesLimit must be an integer between 1 and 50"
            );
        }
    }

    if (timeframe !== undefined) {
        const normalized = typeof timeframe === "string" ? timeframe.trim().toLowerCase() : "";
        if (!ALLOWED_TIMEFRAMES.includes(normalized)) {
            throw createApiError(
                400,
                "timeframe must be one of: 30d, 90d, 6m, all"
            );
        }
    }

    next();
};

export {
    validateGetBrandDashboardQuery
};
