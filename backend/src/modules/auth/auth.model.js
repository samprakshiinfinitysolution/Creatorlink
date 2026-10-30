import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
    {
        // User's full name.
        name: {
            type: String,
            required: true,
            trim: true
        },

        // User's email address.
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // Hashed password.
        password: {
            type: String,
            required: true
        },

        // Password version incremented upon password change to invalidate older access tokens.
        passwordVersion: {
            type: Number,
            default: 0
        },

        // Timestamp of most recent password change.
        passwordChangedAt: {
            type: Date
        },

        // Hashed reset token for forgotten password recovery.
        resetPasswordToken: {
            type: String
        },

        // Expiration timestamp for the password reset token.
        resetPasswordExpire: {
            type: Date
        },

        // User role.
        role: {
            type: String,
            enum: ["creator", "brand", "admin"],
            default: "creator"
        },

        // Account verification status.
        isVerified: {
            type: Boolean,
            default: false
        },

        // Google OAuth subject identifier.
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },

        // Hashed OTP for email verification upon signup.
        emailVerificationOtp: {
            type: String
        },

        // Expiration timestamp for email verification OTP.
        emailVerificationOtpExpire: {
            type: Date
        },

        // Failed attempts counter for email verification OTP.
        emailVerificationOtpAttempts: {
            type: Number,
            default: 0
        },

        // Cooldown timestamp before next resend is allowed.
        emailVerificationOtpResendAvailableAt: {
            type: Date
        },

        // Stores active refresh-token sessions.
        sessions: [
            {
                refreshToken: {
                    type: String,
                    required: true
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);


// Useful for role-based user listings.
authSchema.index({
    role: 1,
    createdAt: -1
});


// Useful for verified/unverified user filtering.
authSchema.index({
    isVerified: 1,
    createdAt: -1
});


const Auth = mongoose.model(
    "Auth",
    authSchema
);

export default Auth;
