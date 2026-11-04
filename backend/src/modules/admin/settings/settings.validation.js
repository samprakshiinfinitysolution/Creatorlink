import createApiError from "../../../utils/ApiError.js";

const validateUpdateProfile = (req, res, next) => {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
        throw createApiError(400, "Valid name is required");
    }
    next();
};

const validateChangePassword = (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword) {
        throw createApiError(400, "Current password is required");
    }
    if (!newPassword || newPassword.length < 6) {
        throw createApiError(400, "New password must be at least 6 characters");
    }
    if (newPassword !== confirmPassword) {
        throw createApiError(400, "Passwords do not match");
    }
    next();
};

export {
    validateUpdateProfile,
    validateChangePassword
};

