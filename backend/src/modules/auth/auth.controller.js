import asyncHandler from "../../utils/asyncHandler.js";
import getMilliseconds from "../../utils/helpers/time.helper.js";
import sendResponse from "../../utils/response.js";

import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser
} from "./auth.service.js";


// Cookie configuration.

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production"
        ? "none"
        : "strict"
};


// Handles user registration request.

const register = asyncHandler(async (req, res) => {

    const user = await registerUser(req.body);

    return sendResponse(
        res,
        201,
        "User registered successfully",
        user
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


export {
    register,
    login,
    refreshToken,
    logout,
    getMe
};