// Handles errors from async functions
// and passes them to the common error middleware.

const asyncHandler = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};

export default asyncHandler;