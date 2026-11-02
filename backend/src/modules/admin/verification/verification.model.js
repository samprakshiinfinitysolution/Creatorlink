import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema(
    {
        // Reference to the user requesting verification (Creator or Brand)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Role of the user at the time of submission
        role: {
            type: String,
            enum: ["creator", "brand"],
            required: true,
            index: true
        },

        // Type of identification or business documentation provided
        documentType: {
            type: String,
            required: true,
            trim: true,
            enum: [
                "national_id",
                "passport",
                "drivers_license",
                "business_registration",
                "tax_id",
                "other"
            ]
        },

        // Optional document identification number
        documentNumber: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        // Cloudinary URLs for uploaded identification documents
        documentUrls: {
            type: [String],
            required: true,
            validate: {
                validator: (urls) => Array.isArray(urls) && urls.length > 0,
                message: "At least one document URL is required for verification"
            }
        },

        // Optional notes or remarks submitted by the user
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

        // Admin who reviewed this request
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            default: null
        },

        // Timestamp when the admin made the decision
        reviewedAt: {
            type: Date,
            default: null
        },

        // Justification provided by the admin if the request is rejected
        rejectionReason: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for administrative queue queries
verificationRequestSchema.index({ status: 1, createdAt: -1 });
verificationRequestSchema.index({ role: 1, status: 1 });

// Partial unique index: A user can have at most ONE "pending" verification request at any given time.
// Approved and rejected requests remain preserved as immutable historical records.
verificationRequestSchema.index(
    { user: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "pending" }
    }
);

const VerificationRequest = mongoose.model(
    "VerificationRequest",
    verificationRequestSchema
);

export default VerificationRequest;
