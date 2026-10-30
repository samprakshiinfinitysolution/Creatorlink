import { rateLimit } from "express-rate-limit";

// Rate limiter for password change attempts: 5 requests per 15 minutes
export const changePasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,                  // Maximum 5 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Authenticated user ID is populated by upstream authenticateUser middleware
        return req.user?.userId || "unauthenticated";
    },
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json({
            success: false,
            statusCode: 429,
            message: "Too many password change attempts. Please try again after 15 minutes.",
            data: null
        });
    },
    validate: {
        keyGeneratorIpFallback: false,
        xForwardedForHeader: false
    }
});

// Rate limiter for forgot-password requests: 5 requests per 15 minutes per IP
export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,                  // Maximum 5 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json({
            success: false,
            statusCode: 429,
            message: "Too many password reset requests. Please try again after 15 minutes.",
            data: null
        });
    },
    validate: {
        xForwardedForHeader: false
    }
});

// Rate limiter for reset-password attempts: 5 requests per 15 minutes per IP
export const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,                  // Maximum 5 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json({
            success: false,
            statusCode: 429,
            message: "Too many password reset attempts. Please try again after 15 minutes.",
            data: null
        });
    },
    validate: {
        xForwardedForHeader: false
    }
});

// Rate limiter for registration requests: 5 requests per 15 minutes per IP
export const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,                  // Maximum 5 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json({
            success: false,
            statusCode: 429,
            message: "Too many registration attempts. Please try again after 15 minutes.",
            data: null
        });
    },
    validate: {
        xForwardedForHeader: false
    }
});

// Rate limiter for email OTP verification attempts: 10 requests per 15 minutes per IP
export const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,                 // Maximum 10 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json({
            success: false,
            statusCode: 429,
            message: "Too many OTP verification attempts. Please try again after 15 minutes.",
            data: null
        });
    },
    validate: {
        xForwardedForHeader: false
    }
});

// Rate limiter for resending verification OTP: 5 requests per 15 minutes per IP
export const resendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,                  // Maximum 5 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json({
            success: false,
            statusCode: 429,
            message: "Too many OTP resend attempts. Please try again after 15 minutes.",
            data: null
        });
    },
    validate: {
        xForwardedForHeader: false
    }
});

export default changePasswordLimiter;
