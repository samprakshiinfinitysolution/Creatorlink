import sendResponse from "../utils/response.js";

// Handles all application errors in one place.

const errorMiddleware = (err, req, res, next) => {

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    return sendResponse(
        res,
        statusCode,
        message,
        null
    );
};

export default errorMiddleware;