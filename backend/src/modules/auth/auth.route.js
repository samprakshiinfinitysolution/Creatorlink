import { Router } from "express";

import {
    register,
    login,
    refreshToken,
    logout,
    getMe
} from "./auth.controller.js";

import {
    validateRegister,
    validateLogin,
    validateRefreshToken
} from "./auth.validation.js";
import authenticateUser from "../../middleware/auth.middleware.js";

const router = Router();


// Register a new creator or brand user.
router.post(
    "/register",
    validateRegister,
    register
);


// Login an existing user.
router.post(
    "/login",
    validateLogin,
    login
);


// Generate a new access token.
router.post(
    "/refresh",
    validateRefreshToken,
    refreshToken
);

// Get currently authenticated user's profile.
router.get(
    "/me",
    authenticateUser,
    getMe
);

// Logout current refresh-token session.
router.post(
    "/logout",
    validateRefreshToken,
    logout
);


export default router;