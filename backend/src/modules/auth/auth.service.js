import Auth from "./auth.model.js";

import createApiError from "../../utils/ApiError.js";

import {
    hashPassword,
    comparePassword
} from "../../utils/helpers/password.helper.js";

import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashRefreshToken
} from "../../utils/helpers/token.helper.js";


// Registers a new creator or brand user.

const registerUser = async ({ name, email, password, role }) => {

    const existingUser = await Auth.findOne({ email });

    if (existingUser) {
        throw createApiError(
            409,
            "Email is already registered"
        );
    }

    const hashedPassword = await hashPassword(password);

    const user = await Auth.create({
        name,
        email,
        password: hashedPassword,
        role
    });

    const userData = user.toObject();

    delete userData.password;
    delete userData.sessions;

    return userData;
};


// Handles user login business logic.

const loginUser = async ({ email, password }) => {

    const user = await Auth.findOne({ email });

    if (!user) {
        throw createApiError(
            401,
            "Invalid email or password"
        );
    }

    const passwordMatched = await comparePassword(
        password,
        user.password
    );

    if (!passwordMatched) {
        throw createApiError(
            401,
            "Invalid email or password"
        );
    }

    const tokenPayload = {
        userId: user._id.toString(),
        role: user.role,
        tokenVersion: user.passwordVersion || 0
    };

    const accessToken = generateAccessToken(
        tokenPayload
    );

    const refreshToken = generateRefreshToken(
        tokenPayload
    );

    // Store only the hashed refresh token.
    const hashedRefreshToken = hashRefreshToken(
        refreshToken
    );

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


// Creates a new access token using refresh token.

const refreshAccessToken = async (refreshToken) => {

    let decodedToken;

    try {
        decodedToken = verifyRefreshToken(
            refreshToken
        );
    } catch (error) {
        throw createApiError(
            401,
            "Invalid or expired refresh token"
        );
    }

    const hashedRefreshToken = hashRefreshToken(
        refreshToken
    );

    const user = await Auth.findOne({
        _id: decodedToken.userId,
        "sessions.refreshToken": hashedRefreshToken
    });

    if (!user) {
        throw createApiError(
            401,
            "Refresh session is invalid or expired"
        );
    }

    const tokenPayload = {
        userId: user._id.toString(),
        role: user.role,
        tokenVersion: user.passwordVersion || 0
    };

    const accessToken = generateAccessToken(
        tokenPayload
    );

    return {
        accessToken
    };
};


// Logs out the current session.

const logoutUser = async (refreshToken) => {

    if (!refreshToken) {
        throw createApiError(
            401,
            "Refresh token is required"
        );
    }

    const hashedRefreshToken = hashRefreshToken(
        refreshToken
    );

    const user = await Auth.findOne({
        "sessions.refreshToken": hashedRefreshToken
    });

    if (!user) {
        return;
    }

    // Remove only the current session.
    user.sessions = user.sessions.filter(
        (session) =>
            session.refreshToken !== hashedRefreshToken
    );

    await user.save();
};

// Fetches the currently authenticated user's profile.

const getCurrentUser = async (userId) => {

    const user = await Auth.findById(userId)
        .select("-password -sessions");

    if (!user) {
        throw createApiError(
            404,
            "User not found"
        );
    }

    return user;
};


// Changes password for authenticated user and safely invalidates previous refresh sessions.

const changeUserPassword = async (userId, { currentPassword, newPassword }) => {

    const user = await Auth.findById(userId);

    if (!user) {
        throw createApiError(
            404,
            "User not found"
        );
    }

    const passwordMatched = await comparePassword(
        currentPassword,
        user.password
    );

    if (!passwordMatched) {
        throw createApiError(
            400,
            "Current password is incorrect"
        );
    }

    if (currentPassword === newPassword) {
        throw createApiError(
            400,
            "New password must be different from current password"
        );
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.passwordVersion = (user.passwordVersion || 0) + 1;
    user.passwordChangedAt = new Date();

    // Safely invalidate all previous refresh sessions for security.
    user.sessions = [];

    // Issue a fresh session pair for the current authenticated client.
    const tokenPayload = {
        userId: user._id.toString(),
        role: user.role,
        tokenVersion: user.passwordVersion
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    user.sessions.push({
        refreshToken: hashedRefreshToken
    });

    await user.save();

    return {
        accessToken,
        refreshToken
    };
};


export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    changeUserPassword
};