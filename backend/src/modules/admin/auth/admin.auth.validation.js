import createApiError from "../../../utils/ApiError.js";

export const validateAdminLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
        throw createApiError(400, "Valid email address is required");
    }

    if (!password || typeof password !== "string") {
        throw createApiError(400, "Password is required");
    }

    if (password.length < 6) {
        throw createApiError(400, "Password must be at least 6 characters");
    }

    next();
};

