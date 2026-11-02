import mongoose from "mongoose";

const moderationHistorySchema = new mongoose.Schema(
    {
        action: {
            type: String,
            enum: ["restricted", "resolved", "closed", "deleted"],
            required: true
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },
        reason: {
            type: String,
            trim: true,
            default: ""
        },
        previousStatus: {
            type: String
        },
        newStatus: {
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

const campaignSchema = new mongoose.Schema(
    {
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        title: {
            type: String,
            trim: true,
            required: true,
            maxlength: 150
        },

        description: {
            type: String,
            trim: true,
            required: true,
            maxlength: 3000
        },

        category: {
            type: String,
            trim: true,
            required: true,
            maxlength: 100
        },

        coverImage: {
            type: String,
            trim: true,
            default: ""
        },

        platform: {
            type: String,
            enum: [
                "instagram",
                "facebook",
                "youtube",
                "tiktok",
                "website"
            ],
            required: true
        },

        budget: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
            maxlength: 3 
        },

        deadline: {
            type: Date,
            required: true
        },

        requiredCreators: {
            type: Number,
            required: true,
            min: 1
        },

        deliverables: {
            type: [
                {
                    type: String,
                    trim: true
                }
            ],
            required: true
        },

        status: {
            type: String,
            enum: [
                "draft",
                "published",
                "paused",
                "in_progress",
                "completed",
                "closed"
            ],
            default: "draft"
        },

        // Dedicated administrative moderation and restriction tracking
        moderation: {
            isRestricted: {
                type: Boolean,
                default: false,
                index: true
            },
            restrictedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Auth",
                default: null
            },
            restrictionReason: {
                type: String,
                trim: true,
                default: ""
            },
            restrictedAt: {
                type: Date,
                default: null
            },
            previousStatus: {
                type: String,
                default: null
            },
            resolvedAt: {
                type: Date,
                default: null
            },
            resolvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Auth",
                default: null
            },
            history: [moderationHistorySchema]
        }
    },
    {
        timestamps: true
    }
);

campaignSchema.index({ status: 1, "moderation.isRestricted": 1, createdAt: -1 });

const Campaign = mongoose.model(
    "Campaign",
    campaignSchema
);

export default Campaign;
