// Validates registration data.

const validateRegister = (req, res, next) => {

    const {
        name,
        email,
        password,
        role
    } = req.body || {};

    if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "All fields are required",
            data: null
        });
    }

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Name must be a valid non-empty string",
            data: null
        });
    }

    if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Email must be a valid string",
            data: null
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Please provide a valid email address",
            data: null
        });
    }

    if (!["creator", "brand"].includes(role)) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Only creator and brand accounts can be registered",
            data: null
        });
    }

    if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Password must be at least 6 characters",
            data: null
        });
    }

    next();
};


// Validates login data.

const validateLogin = (req, res, next) => {

    const {
        email,
        password
    } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Email and password are required",
            data: null
        });
    }

    if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Email must be a valid string",
            data: null
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Please provide a valid email address",
            data: null
        });
    }

    if (typeof password !== "string" || !password.trim()) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Password must be a valid non-empty string",
            data: null
        });
    }

    next();
};


// Checks refresh-token cookie.

const validateRefreshToken = (req, res, next) => {

    if (!req.cookies.refreshToken) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Refresh token is required",
            data: null
        });
    }

    next();
};


// Validates change-password data.

const validateChangePassword = (req, res, next) => {

    const {
        currentPassword,
        newPassword,
        confirmPassword
    } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Current password and new password are required",
            data: null
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "New password must be at least 6 characters",
            data: null
        });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "New password and confirmation password do not match",
            data: null
        });
    }

    if (currentPassword === newPassword) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "New password must be different from current password",
            data: null
        });
    }

    next();
};


// Validates forgot-password data.

const validateForgotPassword = (req, res, next) => {

    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Email is required",
            data: null
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Please provide a valid email address",
            data: null
        });
    }

    next();
};


// Validates reset-password data.

const validateResetPassword = (req, res, next) => {

    const token = req.body?.token || req.query?.token;
    const { newPassword, confirmPassword } = req.body || {};

    if (!token || typeof token !== "string" || !token.trim()) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Reset token is required",
            data: null
        });
    }

    if (!newPassword) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "New password is required",
            data: null
        });
    }

    if (typeof newPassword !== "string") {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "New password must be a string",
            data: null
        });
    }

    if (!confirmPassword) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Confirm password is required",
            data: null
        });
    }

    if (typeof confirmPassword !== "string") {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Confirm password must be a string",
            data: null
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "New password must be at least 6 characters",
            data: null
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "New password and confirmation password do not match",
            data: null
        });
    }

    next();
};


// Validates Google authentication payload.

const validateGoogleAuth = (req, res, next) => {

    const {
        idToken,
        credential,
        code,
        role
    } = req.body || {};

    const hasToken = (typeof idToken === "string" && idToken.trim().length > 0) ||
                     (typeof credential === "string" && credential.trim().length > 0);
    const hasCode = typeof code === "string" && code.trim().length > 0;

    if (!hasToken && !hasCode) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Google credential (idToken or authorization code) is required",
            data: null
        });
    }

    if (role !== undefined && !["creator", "brand"].includes(role)) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Role must be either creator or brand",
            data: null
        });
    }

    next();
};


// Validates OTP verification payload.

const validateVerifyOtp = (req, res, next) => {

    const { email, otp } = req.body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Email is required",
            data: null
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Please provide a valid email address",
            data: null
        });
    }

    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "A valid 6-digit verification code is required",
            data: null
        });
    }

    next();
};


// Validates OTP resend payload.

const validateResendOtp = (req, res, next) => {

    const { email } = req.body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Email is required",
            data: null
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Please provide a valid email address",
            data: null
        });
    }

    next();
};


export {
    validateRegister,
    validateLogin,
    validateRefreshToken,
    validateChangePassword,
    validateForgotPassword,
    validateResetPassword,
    validateGoogleAuth,
    validateVerifyOtp,
    validateResendOtp
};
