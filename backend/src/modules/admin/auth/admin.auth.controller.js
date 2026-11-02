import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import getMilliseconds from "../../../utils/helpers/time.helper.js";
import {
    adminLoginService,
    adminRefreshTokenService,
    getAdminMeService,
    adminLogoutService
} from "./admin.auth.service.js";

// Cookie configuration matching standard auth security options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
};

/**
 * Controller: Handles dedicated Admin Login and sets isolated admin cookies.
 * POST /api/admin/auth/login
 */
export const adminLogin = asyncHandler(async (req, res) => {
    const loginData = await adminLoginService(req.body);

    res.cookie("adminAccessToken", loginData.accessToken, {
        ...cookieOptions,
        maxAge: getMilliseconds(process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN || "24h")
    });

    res.cookie("adminRefreshToken", loginData.refreshToken, {
        ...cookieOptions,
        maxAge: getMilliseconds(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d")
    });

    return sendResponse(
        res,
        200,
        "Admin logged in successfully",
        {
            user: loginData.user
        }
    );
});

/**
 * Controller: Refreshes adminAccessToken using adminRefreshToken.
 * POST /api/admin/auth/refresh
 */
export const adminRefreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.adminRefreshToken;
    const result = await adminRefreshTokenService(token);

    res.cookie("adminAccessToken", result.accessToken, {
        ...cookieOptions,
        maxAge: getMilliseconds(process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN || "24h")
    });

    return sendResponse(
        res,
        200,
        "Admin access token refreshed successfully",
        {
            user: result.user
        }
    );
});

/**
 * Controller: Restores and fetches current authenticated Admin session.
 * GET /api/admin/auth/me
 */
export const getAdminMe = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const adminUser = await getAdminMeService(adminId);

    return sendResponse(
        res,
        200,
        "Admin profile fetched successfully",
        {
            user: adminUser
        }
    );
});

/**
 * Controller: Logs out Admin and clears dedicated admin cookies without affecting user session.
 * POST /api/admin/auth/logout
 */
export const adminLogout = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id;
    const refreshToken = req.cookies?.adminRefreshToken;

    if (adminId) {
        await adminLogoutService(adminId, refreshToken);
    }

    res.clearCookie("adminAccessToken", cookieOptions);
    res.clearCookie("adminRefreshToken", cookieOptions);

    return sendResponse(
        res,
        200,
        "Admin session ended successfully",
        null
    );
});
