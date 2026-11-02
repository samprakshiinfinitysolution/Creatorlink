import jwt from "jsonwebtoken";
import crypto from "crypto";

// Creates an access token.
// Standard users expire according to ACCESS_TOKEN_EXPIRES_IN (default 15m),
// Administrative sessions use ADMIN_ACCESS_TOKEN_EXPIRES_IN (default 24h) to avoid sudden dropouts.
const generateAccessToken = (payload) => {
    const isRoleAdmin = payload?.role === "admin";
    const expiresIn = isRoleAdmin
        ? (process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN || "24h")
        : (process.env.ACCESS_TOKEN_EXPIRES_IN || "15m");

    return jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn
        }
    );
};

// Creates a long-lived refresh token.
// Refresh token expires after 7 days.
const generateRefreshToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
        }
    );
};

// Verifies an access token.
const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );
};

// Verifies a refresh token.
const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET
    );
};

// Creates a hash of the refresh token before storing it in the database.
const hashRefreshToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashRefreshToken
};
