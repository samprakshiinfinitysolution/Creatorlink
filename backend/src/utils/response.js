// Sends a standard API response.

const sendResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: statusCode < 400,
        statusCode,
        message,
        data
    });
};

export default sendResponse;