import createApiError from "../utils/ApiError.js";
import Auth from "../modules/auth/auth.model.js";
import {
    verifyAccessToken
} from "../utils/helpers/token.helper.js";

// Verifies the access token stored in the HttpOnly cookie
// and ensures it has not been revoked by a subsequent password change.
// Supports dedicated adminAccessToken isolation for administrative routes.
const authenticateUser = async (req, res, next) => {
    try {
        // Detect if this is an administrative route
        const isAdminRoute =
            req.baseUrl?.includes("/admin") ||
            req.originalUrl?.includes("/admin");

        // Admin routes prioritize dedicated adminAccessToken, falling back to accessToken.
        // User routes (Creator, Brand, Public) strictly use standard accessToken.
        const token = isAdminRoute
            ? (req.cookies?.adminAccessToken || req.cookies?.accessToken)
            : req.cookies?.accessToken;

        // Check if access token exists.
        if (!token) {
            throw createApiError(
                401,
                isAdminRoute ? "Admin access token is required" : "Access token is required"
            );
        }

        let decodedToken;
        try {
            // Verify cryptographic signature and expiry of access token.
            decodedToken = verifyAccessToken(token);
        } catch (jwtError) {
            throw createApiError(
                401,
                "Invalid or expired access token"
            );
        }

        // Verify user exists and access token version matches user's current password version.
        const user = await Auth.findById(decodedToken.userId).select("passwordVersion");

        if (!user) {
            throw createApiError(
                401,
                "User not found or account no longer exists"
            );
        }

        const currentVersion = user.passwordVersion || 0;
        const tokenVersion = decodedToken.tokenVersion ?? 0;

        // Immediately reject access tokens issued prior to a password change.
        if (tokenVersion !== currentVersion) {
            throw createApiError(
                401,
                "Session expired due to password change. Please log in again."
            );
        }

        // Store authenticated user information for downstream controllers and services.
        req.user = decodedToken;

        next();

    } catch (error) {
        next(error);
    }
};

export default authenticateUser;
