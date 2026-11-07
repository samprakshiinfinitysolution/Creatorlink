import mongoose from "mongoose";

// Permanent historical audit record for every administrative decision
const reviewHistoryItemSchema = new mongoose.Schema(
    {
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },
        action: {
            type: String,
            enum: ["approved", "rejected", "revoked"],
            required: true
        },
        previousStatus: {
            type: String,
            required: true
        },
        newStatus: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },
        reviewedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

const verificationRequestSchema = new mongoose.Schema(
    {
        // Reference to the user requesting verification (Creator or Brand) - unique per account
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            unique: true,
            index: true
        },

        // Role of the user at the time of submission
        role: {
            type: String,
            enum: ["creator", "brand"],
            required: true,
            index: true
        },

        // Type of identification or verification reference (optional, legacy support)
        documentType: {
            type: String,
            required: false,
            trim: true,
            default: "profile_verification"
        },

        // Optional document identification number (optional, legacy support)
        documentNumber: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        // Uploaded identification documents (optional, legacy support)
        documentUrls: {
            type: [String],
            required: false,
            default: []
        },

        // Optional notes or remarks submitted by the user or reviewer
        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        // Current status of the verification request
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true
        },

        // Most recent Admin who reviewed this request
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            default: null
        },

        // Timestamp when the admin made the most recent decision
        reviewedAt: {
            type: Date,
            default: null
        },

        // Dedicated timestamp for when an account was re-submitted following rejection or review
        resubmittedAt: {
            type: Date,
            default: null,
            index: true
        },

        // Historical record of all resubmission timestamps and notes
        resubmissionHistory: [
            {
                resubmittedAt: {
                    type: Date,
                    default: Date.now
                },
                notes: {
                    type: String,
                    trim: true,
                    maxlength: 1000,
                    default: ""
                }
            }
        ],

        // Justification provided by the admin if the request is rejected or revoked
        rejectionReason: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: null
        },

        // Complete audit history of all administrative decisions for this user
        reviewHistory: {
            type: [reviewHistoryItemSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for administrative queue queries
verificationRequestSchema.index({ status: 1, createdAt: -1 });
verificationRequestSchema.index({ status: 1, resubmittedAt: -1 });
verificationRequestSchema.index({ role: 1, status: 1 });

const VerificationRequest = mongoose.model(
    "VerificationRequest",
    verificationRequestSchema
);

export default VerificationRequest;
