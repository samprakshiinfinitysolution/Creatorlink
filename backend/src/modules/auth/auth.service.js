import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
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

import { sendEmail } from "../../utils/helpers/email.helper.js";


// Helper to hash verification OTP consistently with SHA-256.

const hashOtp = (otp) => {
    return crypto
        .createHash("sha256")
        .update(otp.toString().trim())
        .digest("hex");
};


// Registers a new creator or brand user and sends an email verification OTP.

const registerUser = async ({ name, email, password, role }) => {

    const normalizedEmail = (email || "").trim().toLowerCase();

    const existingUser = await Auth.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
        throw createApiError(
            409,
            "Email is already registered"
        );
    }

    // Prevent repeated signup requests from bypassing the 60s resend cooldown.
    if (
        existingUser &&
        !existingUser.isVerified &&
        existingUser.emailVerificationOtpResendAvailableAt &&
        existingUser.emailVerificationOtpResendAvailableAt > new Date()
    ) {
        const remainingSec = Math.ceil(
            (existingUser.emailVerificationOtpResendAvailableAt.getTime() - Date.now()) / 1000
        );
        throw createApiError(
            429,
            `Please wait ${remainingSec} seconds before requesting a new code.`
        );
    }

    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(rawOtp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resendCooldown = new Date(Date.now() + 60 * 1000);  // 60 seconds

    let user;
    let isNewUser = false;
    let previousState = null;

    if (existingUser && !existingUser.isVerified) {
        // Capture previous unverified OTP state for safe rollback on email failure
        previousState = {
            emailVerificationOtp: existingUser.emailVerificationOtp,
            emailVerificationOtpExpire: existingUser.emailVerificationOtpExpire,
            emailVerificationOtpAttempts: existingUser.emailVerificationOtpAttempts,
            emailVerificationOtpResendAvailableAt: existingUser.emailVerificationOtpResendAvailableAt
        };

        // Reuse unverified pending registration: refresh OTP without overwriting original name, password, or role
        existingUser.emailVerificationOtp = hashedOtp;
        existingUser.emailVerificationOtpExpire = otpExpiry;
        existingUser.emailVerificationOtpAttempts = 0;
        existingUser.emailVerificationOtpResendAvailableAt = resendCooldown;
        await existingUser.save();
        user = existingUser;
    } else {
        isNewUser = true;
        const hashedPassword = await hashPassword(password);
        user = await Auth.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            isVerified: false,
            emailVerificationOtp: hashedOtp,
            emailVerificationOtpExpire: otpExpiry,
            emailVerificationOtpAttempts: 0,
            emailVerificationOtpResendAvailableAt: resendCooldown
        });
    }

    const subject = "Verify Your Email - CreatorLink";
    const text = `Your CreatorLink email verification code is: ${rawOtp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 1px; color: #000;">CREATORLINK <span style="color: #6366f1;">✦</span></h1>
            </div>
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; text-align: center; color: #111;">Verify Your Email Address</h2>
            <p style="font-size: 15px; line-height: 1.5; color: #4b5563; text-align: center; margin-bottom: 24px;">
                Thank you for joining CreatorLink. Use the 6-digit verification code below to complete your registration:
            </p>
            <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: monospace; color: #09090b;">${rawOtp}</span>
            </div>
            <p style="font-size: 13px; color: #71717a; text-align: center; margin-bottom: 20px;">
                This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
            </p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
            <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin: 0;">
                If you did not request this verification code, you can safely ignore this email.
            </p>
        </div>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject,
            text,
            html
        });
    } catch (error) {
        if (isNewUser) {
            await Auth.findByIdAndDelete(user._id);
        } else if (previousState) {
            user.emailVerificationOtp = previousState.emailVerificationOtp;
            user.emailVerificationOtpExpire = previousState.emailVerificationOtpExpire;
            user.emailVerificationOtpAttempts = previousState.emailVerificationOtpAttempts;
            user.emailVerificationOtpResendAvailableAt = previousState.emailVerificationOtpResendAvailableAt;
            await user.save();
        }
        throw error;
    }

    return {
        message: "Verification code sent to your email. Please check your inbox.",
        email: user.email
    };
};


// Handles user login business logic.

const loginUser = async ({ email, password }) => {

    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await Auth.findOne({ email: normalizedEmail });

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

    // Block unverified accounts from logging in
    if (!user.isVerified) {
        throw createApiError(
            403,
            "Please verify your email address before logging in. Check your inbox for the verification code."
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


// Helper to hash reset tokens consistently with SHA-256.

const hashResetToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};


// Generates a password reset token and sends a reset email if the user exists.

const forgotPassword = async (email) => {

    const normalizedEmail = (email || "").trim().toLowerCase();

    const genericSuccess = {
        message: "If an account with that email exists, a password reset link has been sent."
    };

    if (!normalizedEmail) {
        if (process.env.NODE_ENV !== "production") {
            return {
                message: "This email is not registered. Please check your email or create an account."
            };
        }
        return genericSuccess;
    }

    const user = await Auth.findOne({ email: normalizedEmail });

    if (!user) {
        if (process.env.NODE_ENV !== "production") {
            return {
                message: "This email is not registered. Please check your email or create an account."
            };
        }
        return genericSuccess;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashResetToken(rawToken);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const frontendBaseUrl = (process.env.FRONTEND_URL || "http://localhost:3005").replace(/\/+$/, "");
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${rawToken}`;

    const subject = "Reset Your CreatorLink Password";
    const text = `You requested a password reset for your CreatorLink account.\n\nPlease use the following link within 15 minutes to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
            <h2 style="margin-bottom: 16px;">Reset Your Password</h2>
            <p style="font-size: 15px; line-height: 1.5;">You requested a password reset for your CreatorLink account. Click the button below to set a new password. This link is valid for 15 minutes.</p>
            <div style="margin: 24px 0;">
                <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 13px; color: #666; word-break: break-all;">If the button above does not work, copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color: #0066cc;">${resetUrl}</a></p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
            <p style="font-size: 12px; color: #888;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject,
            text,
            html
        });
    } catch (error) {
        if (user.resetPasswordToken === hashedToken) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
        }
        throw error;
    }

    return genericSuccess;
};


// Resets user password using a valid, non-expired reset token.

const resetPassword = async ({ token, newPassword }) => {

    if (!token || typeof token !== "string" || !token.trim()) {
        throw createApiError(
            400,
            "Invalid or expired password reset token"
        );
    }

    if (!newPassword || typeof newPassword !== "string") {
        throw createApiError(
            400,
            "New password is required"
        );
    }

    const hashedToken = hashResetToken(token.trim());
    const now = new Date();

    const hashedPassword = await hashPassword(newPassword);

    const user = await Auth.findOneAndUpdate(
        {
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: now }
        },
        {
            $set: {
                password: hashedPassword,
                passwordChangedAt: now,
                sessions: []
            },
            $inc: {
                passwordVersion: 1
            },
            $unset: {
                resetPasswordToken: 1,
                resetPasswordExpire: 1
            }
        },
        { new: true }
    );

    if (!user) {
        throw createApiError(
            400,
            "Invalid or expired password reset token"
        );
    }

    return {
        message: "Password reset successfully. You can now log in with your new password."
    };
};


// Helper to instantiate Google OAuth2Client with configured environment credentials.

const getGoogleOAuthClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId) {
        throw createApiError(
            500,
            "Google Client ID is not configured on the server"
        );
    }
    return new OAuth2Client(clientId, clientSecret, "postmessage");
};


// Authenticates or registers a user via Google credentials.

const googleAuthUser = async ({ idToken, credential, code, role = "creator" }) => {

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        throw createApiError(
            500,
            "Google Client ID is not configured on the server"
        );
    }

    const oauthClient = getGoogleOAuthClient();
    let payload;

    const token = idToken || credential;

    if (code) {
        if (!process.env.GOOGLE_CLIENT_SECRET) {
            throw createApiError(
                500,
                "Google Client Secret is not configured on the server"
            );
        }

        let tokenResponse;
        try {
            tokenResponse = await oauthClient.getToken({
                code: code.trim(),
                redirect_uri: "postmessage"
            });
        } catch (error) {
            throw createApiError(
                401,
                "Failed to exchange Google authorization code: " + (error.message || "Invalid code")
            );
        }

        const idTokenFromCode = tokenResponse.tokens?.id_token;
        if (!idTokenFromCode) {
            throw createApiError(
                401,
                "Google authorization did not return an ID token"
            );
        }

        try {
            const ticket = await oauthClient.verifyIdToken({
                idToken: idTokenFromCode,
                audience: clientId
            });
            payload = ticket.getPayload();
        } catch (error) {
            throw createApiError(
                401,
                "Failed to verify Google ID token from authorization code"
            );
        }
    } else if (token) {
        try {
            const ticket = await oauthClient.verifyIdToken({
                idToken: token.trim(),
                audience: clientId
            });
            payload = ticket.getPayload();
        } catch (error) {
            throw createApiError(
                401,
                "Failed to verify Google ID token"
            );
        }
    } else {
        throw createApiError(
            400,
            "Google credential or authorization code is required"
        );
    }

    if (!payload || !payload.sub || !payload.email) {
        throw createApiError(
            401,
            "Google token does not contain required user identity"
        );
    }

    if (!payload.email_verified) {
        throw createApiError(
            401,
            "Google email is not verified"
        );
    }

    const googleId = payload.sub;
    const normalizedEmail = payload.email.trim().toLowerCase();

    // 1. Search for user already associated with this Google ID
    let user = await Auth.findOne({ googleId });

    if (!user) {
        // 2. Search for user with this email
        const existingEmailUser = await Auth.findOne({ email: normalizedEmail });

        if (existingEmailUser) {
            // Check verified-identity logic:
            // If the existing account is not verified, do not automatically link it to prevent account hijacking
            if (!existingEmailUser.isVerified) {
                throw createApiError(
                    409,
                    "An account with this email already exists. Please log in with your email and password."
                );
            }

            // Existing account identity is verified; safe to link googleId
            existingEmailUser.googleId = googleId;
            await existingEmailUser.save();
            user = existingEmailUser;
        } else {
            // 3. New user registration via Google
            const allowedRoles = ["creator", "brand"];
            const assignedRole = allowedRoles.includes(role) ? role : "creator";
            const randomPassword = crypto.randomBytes(32).toString("hex");
            const hashedPassword = await hashPassword(randomPassword);

            user = await Auth.create({
                name: (payload.name && payload.name.trim()) || normalizedEmail.split("@")[0] || "User",
                email: normalizedEmail,
                password: hashedPassword,
                role: assignedRole,
                isVerified: true,
                googleId
            });
        }
    }

    // 4. Generate access and refresh tokens and establish session
    const tokenPayload = {
        userId: user._id.toString(),
        role: user.role,
        tokenVersion: user.passwordVersion || 0
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const hashedRefreshToken = hashRefreshToken(refreshToken);

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


// Verifies the user's email OTP and activates their account.

const verifyEmailOtp = async ({ email, otp }) => {

    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await Auth.findOne({ email: normalizedEmail });

    if (!user) {
        throw createApiError(
            404,
            "Registration record not found for this email"
        );
    }

    if (user.isVerified) {
        throw createApiError(
            400,
            "Account is already verified. Please log in."
        );
    }

    if (!user.emailVerificationOtp || !user.emailVerificationOtpExpire) {
        throw createApiError(
            400,
            "No pending verification code found. Please request a new code."
        );
    }

    if (user.emailVerificationOtpExpire < new Date()) {
        throw createApiError(
            400,
            "Verification code has expired. Please request a new code."
        );
    }

    if (user.emailVerificationOtpAttempts >= 5) {
        throw createApiError(
            429,
            "Maximum verification attempts exceeded. Please request a new verification code."
        );
    }

    const hashedInput = hashOtp(otp);

    if (hashedInput !== user.emailVerificationOtp) {
        user.emailVerificationOtpAttempts = (user.emailVerificationOtpAttempts || 0) + 1;
        await user.save();
        const attemptsLeft = 5 - user.emailVerificationOtpAttempts;
        throw createApiError(
            400,
            attemptsLeft > 0
                ? `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`
                : "Invalid verification code. Maximum attempts exceeded. Please request a new code."
        );
    }

    // Success: mark verified and invalidate OTP
    user.isVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpire = undefined;
    user.emailVerificationOtpAttempts = 0;
    user.emailVerificationOtpResendAvailableAt = undefined;

    // Issue access and refresh tokens
    const tokenPayload = {
        userId: user._id.toString(),
        role: user.role,
        tokenVersion: user.passwordVersion || 0
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    user.sessions.push({
        refreshToken: hashedRefreshToken
    });

    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.sessions;
    delete userData.emailVerificationOtp;
    delete userData.emailVerificationOtpExpire;
    delete userData.emailVerificationOtpAttempts;
    delete userData.emailVerificationOtpResendAvailableAt;

    return {
        user: userData,
        accessToken,
        refreshToken,
        message: "Email verified successfully! Welcome to CreatorLink."
    };
};


// Resends email verification OTP to pending unverified accounts.

const resendVerificationOtp = async (email) => {

    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await Auth.findOne({ email: normalizedEmail });

    if (!user) {
        throw createApiError(
            404,
            "No pending registration found for this email"
        );
    }

    if (user.isVerified) {
        throw createApiError(
            400,
            "This account is already verified. Please log in."
        );
    }

    if (user.emailVerificationOtpResendAvailableAt && user.emailVerificationOtpResendAvailableAt > new Date()) {
        const remainingSec = Math.ceil((user.emailVerificationOtpResendAvailableAt.getTime() - Date.now()) / 1000);
        throw createApiError(
            429,
            `Please wait ${remainingSec} seconds before requesting a new code.`
        );
    }

    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(rawOtp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resendCooldown = new Date(Date.now() + 60 * 1000);  // 60 seconds

    // Snapshot existing OTP state for rollback if email delivery fails
    const previousOtp = user.emailVerificationOtp;
    const previousExpire = user.emailVerificationOtpExpire;
    const previousAttempts = user.emailVerificationOtpAttempts;
    const previousResendAvailableAt = user.emailVerificationOtpResendAvailableAt;

    user.emailVerificationOtp = hashedOtp;
    user.emailVerificationOtpExpire = otpExpiry;
    user.emailVerificationOtpAttempts = 0;
    user.emailVerificationOtpResendAvailableAt = resendCooldown;

    await user.save();

    const subject = "Your New CreatorLink Verification Code";
    const text = `Your new CreatorLink email verification code is: ${rawOtp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 1px; color: #000;">CREATORLINK <span style="color: #6366f1;">✦</span></h1>
            </div>
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; text-align: center; color: #111;">Your New Verification Code</h2>
            <p style="font-size: 15px; line-height: 1.5; color: #4b5563; text-align: center; margin-bottom: 24px;">
                Here is your new 6-digit verification code to complete your CreatorLink registration:
            </p>
            <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: monospace; color: #09090b;">${rawOtp}</span>
            </div>
            <p style="font-size: 13px; color: #71717a; text-align: center; margin-bottom: 20px;">
                This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
            </p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
            <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin: 0;">
                If you did not request a new verification code, you can safely ignore this email.
            </p>
        </div>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject,
            text,
            html
        });
    } catch (error) {
       
        // Roll back to previous OTP state so the user is not left with an undelivered code
        user.emailVerificationOtp = previousOtp;
        user.emailVerificationOtpExpire = previousExpire;
        user.emailVerificationOtpAttempts = previousAttempts;
        user.emailVerificationOtpResendAvailableAt = previousResendAvailableAt;
        await user.save();
        throw error;
    }

    return {
        message: "A new verification code has been sent to your email."
    };
};


export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    changeUserPassword,
    forgotPassword,
    resetPassword,
    googleAuthUser,
    verifyEmailOtp,
    resendVerificationOtp
};
