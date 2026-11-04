import Auth from "../../auth/auth.model.js";
import { comparePassword, hashPassword } from "../../../utils/helpers/password.helper.js";
import { uploadImageToCloudinary } from "../../../utils/helpers/cloudinary.helper.js";
import createApiError from "../../../utils/ApiError.js";

// Fetch current admin profile
const getAdminProfileService = async (adminId) => {
    const admin = await Auth.findOne({ _id: adminId, role: "admin" })
        .select("-password -sessions -resetPasswordToken -resetPasswordExpire")
        .lean();

    if (!admin) {
        throw createApiError(404, "Admin profile not found");
    }

    return admin;
};

// Update admin profile name (Email is immutable / strictly locked)
const updateAdminProfileService = async (adminId, payload = {}) => {
    const { name } = payload;

    if (!name || typeof name !== "string" || !name.trim()) {
        throw createApiError(400, "A valid name is required");
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
        throw createApiError(400, "Name must be between 2 and 60 characters");
    }

    const admin = await Auth.findOneAndUpdate(
        { _id: adminId, role: "admin" },
        { name: trimmedName },
        { new: true, runValidators: true }
    ).select("-password -sessions -resetPasswordToken -resetPasswordExpire");

    if (!admin) {
        throw createApiError(404, "Admin account not found");
    }

    return admin;
};

// Upload new admin profile avatar
const uploadAdminAvatarService = async (adminId, fileBuffer) => {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
        throw createApiError(400, "No image file provided for upload");
    }

    // Upload to Cloudinary folder for admin avatars
    const uploadResult = await uploadImageToCloudinary(fileBuffer, "creatorlink/admin/avatars");

    const admin = await Auth.findOneAndUpdate(
        { _id: adminId, role: "admin" },
        { avatar: uploadResult.url },
        { new: true }
    ).select("-password -sessions -resetPasswordToken -resetPasswordExpire");

    if (!admin) {
        throw createApiError(404, "Admin account not found");
    }

    return admin;
};

// Remove/delete admin avatar (reverts to default initials)
const deleteAdminAvatarService = async (adminId) => {
    const admin = await Auth.findOneAndUpdate(
        { _id: adminId, role: "admin" },
        { avatar: "" },
        { new: true }
    ).select("-password -sessions -resetPasswordToken -resetPasswordExpire");

    if (!admin) {
        throw createApiError(404, "Admin account not found");
    }

    return admin;
};

// Change admin password with current password verification
const changeAdminPasswordService = async (adminId, payload = {}) => {
    const { currentPassword, newPassword, confirmPassword } = payload;

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw createApiError(400, "Current password, new password, and confirmation are all required");
    }

    if (newPassword !== confirmPassword) {
        throw createApiError(400, "New password and confirm password do not match");
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
        throw createApiError(400, "New password must be at least 6 characters long");
    }

    const admin = await Auth.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
        throw createApiError(404, "Admin account not found");
    }

    // Verify current password
    const isMatched = await comparePassword(currentPassword, admin.password);
    if (!isMatched) {
        throw createApiError(401, "Current password is incorrect");
    }

    // Hash and store new password
    admin.password = await hashPassword(newPassword);
    admin.passwordVersion = (admin.passwordVersion || 0) + 1;
    admin.passwordChangedAt = new Date();
    admin.sessions = []; // Invalidate older sessions

    await admin.save();

    return {
        message: "Password changed successfully. Please keep your new credentials secure."
    };
};

// Fetch system telemetry / platform info
const getSystemInfoService = async () => {
    const memory = process.memoryUsage();
    return {
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: Math.round(memory.rss / (1024 * 1024)),
        razorpayMode: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ? "Test Mode" : "Live Mode",
        cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
        timestamp: new Date().toISOString()
    };
};

export {
    getAdminProfileService,
    updateAdminProfileService,
    uploadAdminAvatarService,
    deleteAdminAvatarService,
    changeAdminPasswordService,
    getSystemInfoService
};

