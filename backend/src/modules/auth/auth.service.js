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
        role: user.role
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
        role: user.role
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


export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser
};