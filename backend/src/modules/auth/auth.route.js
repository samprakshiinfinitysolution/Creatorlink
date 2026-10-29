import { Router } from "express";

import {
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
} from "./auth.controller.js";

import {
    validateRegister,
    validateLogin,
    validateRefreshToken,
    validateChangePassword,
    validateForgotPassword,
    validateResetPassword,
    validateGoogleAuth,
    validateVerifyOtp,
    validateResendOtp
} from "./auth.validation.js";
import authenticateUser from "../../middleware/auth.middleware.js";
import {
    changePasswordLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    signupLimiter,
    verifyOtpLimiter,
    resendOtpLimiter
} from "../../middleware/rateLimiter.middleware.js";

const router = Router();


// Register a new creator or brand user (initiates email OTP).
router.post(
    "/register",
    signupLimiter,
    validateRegister,
    register
);

// Verify email OTP and activate account.
router.post(
    "/verify-email-otp",
    verifyOtpLimiter,
    validateVerifyOtp,
    verifyEmailOtp
);

// Resend email verification OTP.
router.post(
    "/resend-email-otp",
    resendOtpLimiter,
    validateResendOtp,
    resendVerificationOtp
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

// Change password for currently authenticated user.
router.patch(
    "/change-password",
    authenticateUser,
    changePasswordLimiter,
    validateChangePassword,
    changePassword
);

// Request password reset link.
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validateForgotPassword,
    forgotPassword
);

// Reset password using reset token.
router.post(
    "/reset-password",
    resetPasswordLimiter,
    validateResetPassword,
    resetPassword
);

// Authenticate or register using Google credentials.
router.post(
    "/google",
    validateGoogleAuth,
    googleAuth
);

// Get public Google Client ID configuration for frontend clients.
router.get(
    "/google/client-id",
    getGoogleClientId
);


export default router;
