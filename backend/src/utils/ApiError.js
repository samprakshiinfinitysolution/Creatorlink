// Creates a standard error object for API errors.

const createApiError = (statusCode, message) => {
    const error = new Error(message);

    error.statusCode = statusCode;
    error.success = false;

    return error;
};

export default createApiError;