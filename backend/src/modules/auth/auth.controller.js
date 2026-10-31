import asyncHandler from "../../utils/asyncHandler.js";
import getMilliseconds from "../../utils/helpers/time.helper.js";
import sendResponse from "../../utils/response.js";

import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    changeUserPassword,
    forgotPassword as forgotPasswordService,
    resetPassword as resetPasswordService,
    googleAuthUser,
    verifyEmailOtp as verifyEmailOtpService,
    resendVerificationOtp as resendVerificationOtpService
} from "./auth.service.js";


// Cookie configuration.

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production"
        ? "none"
        : "lax"
};


// Handles user registration request (initiates email OTP verification).

const register = asyncHandler(async (req, res) => {

    const result = await registerUser(req.body);

    return sendResponse(
        res,
        200,
        result.message,
        {
            email: result.email
        }
    );
});


// Handles email OTP verification and activates account.

const verifyEmailOtp = asyncHandler(async (req, res) => {

    const result = await verifyEmailOtpService(req.body);

    res.cookie(
        "accessToken",
        result.accessToken,
        {
            ...cookieOptions,
            maxAge: getMilliseconds(
                process.env.ACCESS_TOKEN_EXPIRES_IN
            )
        }
    );

    res.cookie(
        "refreshToken",
        result.refreshToken,
        {
            ...cookieOptions,
            maxAge: getMilliseconds(
                process.env.REFRESH_TOKEN_EXPIRES_IN
            )
        }
    );

    return sendResponse(
        res,
        200,
        result.message,
        {
            user: result.user
        }
    );
});


// Handles resending email verification OTP.

const resendVerificationOtp = asyncHandler(async (req, res) => {

    const result = await resendVerificationOtpService(req.body.email);

    return sendResponse(
        res,
        200,
        result.message,
        null
    );
});


// Handles user login request.

const login = asyncHandler(async (req, res) => {

    const loginData = await loginUser(req.body);

    res.cookie(
        "accessToken",
        loginData.accessToken,
        {
            ...cookieOptions,
            maxAge: getMilliseconds(
                process.env.ACCESS_TOKEN_EXPIRES_IN
            )
        }
    );

    res.cookie(
        "refreshToken",
        loginData.refreshToken,
        {
            ...cookieOptions,
            maxAge: getMilliseconds(
                process.env.REFRESH_TOKEN_EXPIRES_IN
            )
        }
    );

    return sendResponse(
        res,
        200,
        "Login successful",
        {
            user: loginData.user
        }
    );
});

// Creates a new access token using refresh token.

const refreshToken = asyncHandler(async (req, res) => {

    const token = req.cookies.refreshToken;

    const data = await refreshAccessToken(token);

    res.cookie(
        "accessToken",
        data.accessToken,
        {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000
        }
    );

    return sendResponse(
        res,
        200,
        "Access token refreshed successfully",
        null
    );
});


// Returns the currently authenticated user's profile.

const getMe = asyncHandler(async (req, res) => {

    const user = await getCurrentUser(
        req.user.userId
    );

    return sendResponse(
        res,
        200,
        "User profile fetched successfully",
        user
    );
});

// Logs out the current session.

const logout = asyncHandler(async (req, res) => {

    const token = req.cookies.refreshToken;

    await logoutUser(token);

    res.clearCookie(
        "accessToken",
        cookieOptions
    );

    res.clearCookie(
        "refreshToken",
        cookieOptions
    );

    return sendResponse(
        res,
        200,
        "Logout successful",
        null
    );
});


// Changes password for currently authenticated user.

const changePassword = asyncHandler(async (req, res) => {

    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    const tokenData = await changeUserPassword(userId, {
        currentPassword,
        newPassword
    });

    res.cookie(
        "accessToken",
        tokenData.accessToken,
        {
            ...cookieOptions,
            maxAge: getMilliseconds(
                process.env.ACCESS_TOKEN_EXPIRES_IN
            )
        }
    );

    res.cookie(
        "refreshToken",
        tokenData.refreshToken,
        {
            ...cookieOptions,
            maxAge: getMilliseconds(
                process.env.REFRESH_TOKEN_EXPIRES_IN
            )
        }
    );

    return sendResponse(
        res,
        200,
        "Password changed successfully",
        null
    );
});


// Handles forgot-password request.

const forgotPassword = asyncHandler(async (req, res) => {

    const result = await forgotPasswordService(req.body.email);

    return sendResponse(
        res,
        200,
        result.message,
        null
    );
});


// Handles reset-password request.

const resetPassword = asyncHandler(async (req, res) => {

    const token = req.body?.token || req.query?.token;
    const { newPassword } = req.body;

    const result = await resetPasswordService({
        token,
        newPassword
    });

    return sendResponse(
        res,
        200,
        result.message,
        null
    );
});


// Handles Google authentication request (login or signup).

const googleAuth = asyncHandler(async (req, res) => {

    const authData = await googleAuthUser(req.body);

    res.cookie(
        "accessToken",
        authData.accessToken,
        {
            ...cookieOptions,
            maxAge: getMilliseconds(
                process.env.ACCESS_TOKEN_EXPIRES_IN
            )
        }
    );

    res.cookie(
        "refreshToken",
        authData.refreshToken,
        {
            ...cookieOptions,
            maxAge: getMilliseconds(
                process.env.REFRESH_TOKEN_EXPIRES_IN
            )
        }
    );

    return sendResponse(
        res,
        200,
        "Google authentication successful",
        {
            user: authData.user
        }
    );
});


// Returns the public Google Client ID configuration for frontend clients.

const getGoogleClientId = asyncHandler(async (req, res) => {

    return sendResponse(
        res,
        200,
        "Google Client ID fetched successfully",
        {
            clientId: process.env.GOOGLE_CLIENT_ID || null
        }
    );
});


export {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword,
    googleAuth,
    getGoogleClientId,
    verifyEmailOtp,
    resendVerificationOtp
};


