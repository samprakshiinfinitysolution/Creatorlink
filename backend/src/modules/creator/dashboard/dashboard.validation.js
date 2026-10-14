import createApiError from "../../../utils/ApiError.js";

// Validates query parameters for Creator Dashboard overview.
const validateGetCreatorDashboardQuery = (req, res, next) => {
    const { recentLimit, deadlinesLimit } = req.query;

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

    next();
};

export {
    validateGetCreatorDashboardQuery
};
