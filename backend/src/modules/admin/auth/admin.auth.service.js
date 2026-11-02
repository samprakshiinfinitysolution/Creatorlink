import Auth from "../../auth/auth.model.js";
import createApiError from "../../../utils/ApiError.js";
import { comparePassword } from "../../../utils/helpers/password.helper.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashRefreshToken
} from "../../../utils/helpers/token.helper.js";

/**
 * Handles dedicated admin login with strict role enforcement.
 */
export const adminLoginService = async ({ email, password }) => {
    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await Auth.findOne({ email: normalizedEmail });

    if (!user) {
        throw createApiError(401, "Invalid email or password");
    }

    // Strictly enforce role === "admin"
    if (user.role !== "admin") {
        throw createApiError(
            403,
            "Access forbidden: This portal is strictly restricted to platform administrators."
        );
    }

    const passwordMatched = await comparePassword(password, user.password);
    if (!passwordMatched) {
        throw createApiError(401, "Invalid email or password");
    }

    if (!user.isVerified) {
        throw createApiError(
            403,
            "Admin account email is not verified. Please contact system operations."
        );
    }

    const tokenPayload = {
        userId: user._id.toString(),
        role: "admin",
        tokenVersion: user.passwordVersion || 0
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    user.sessions.push({
        refreshToken: hashedRefreshToken
    });

    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.sessions;

    return {
        user: userData,
        accessToken,
        refreshToken
    };
};

/**
 * Rotates and refreshes adminAccessToken using adminRefreshToken.
 */
export const adminRefreshTokenService = async (refreshToken) => {
    if (!refreshToken) {
        throw createApiError(401, "Admin refresh token is required");
    }

    let decodedToken;
    try {
        decodedToken = verifyRefreshToken(refreshToken);
    } catch {
        throw createApiError(401, "Invalid or expired admin refresh token");
    }

    const hashedRefreshToken = hashRefreshToken(refreshToken);
    const user = await Auth.findOne({
        _id: decodedToken.userId,
        role: "admin",
        "sessions.refreshToken": hashedRefreshToken
    });

    if (!user) {
        throw createApiError(401, "Admin refresh session is invalid or expired");
    }

    const tokenPayload = {
        userId: user._id.toString(),
        role: "admin",
        tokenVersion: user.passwordVersion || 0
    };

    const accessToken = generateAccessToken(tokenPayload);

    const userData = user.toObject();
    delete userData.password;
    delete userData.sessions;

    return {
        accessToken,
        user: userData
    };
};

/**
 * Fetches current authenticated admin user profile.
 */
export const getAdminMeService = async (adminId) => {
    const user = await Auth.findById(adminId)
        .select("-password -sessions")
        .lean();

    if (!user) {
        throw createApiError(404, "Admin account not found");
    }

    if (user.role !== "admin") {
        throw createApiError(403, "Access restricted to administrators");
    }

    return user;
};

/**
 * Logs out the admin by revoking the refresh token session.
 */
export const adminLogoutService = async (adminId, refreshToken) => {
    if (!refreshToken) return;

    try {
        const hashedRefreshToken = hashRefreshToken(refreshToken);
        await Auth.findByIdAndUpdate(adminId, {
            $pull: { sessions: { refreshToken: hashedRefreshToken } }
        });
    } catch {
        // Fallback silently if session cannot be matched
    }
};
