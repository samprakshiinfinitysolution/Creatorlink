import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["creator", "brand"],
            required: true,
            default: "creator"
        },
        otpHash: {
            type: String,
            required: true
        },
        otpExpire: {
            type: Date,
            required: true
        },
        attempts: {
            type: Number,
            default: 0
        },
        resendAvailableAt: {
            type: Date
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// TTL index to automatically purge expired pending registrations
pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingRegistration = mongoose.model(
    "PendingRegistration",
    pendingRegistrationSchema
);

export default PendingRegistration;

