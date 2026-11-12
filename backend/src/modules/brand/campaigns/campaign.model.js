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
            type: [String],
            enum: [
                "instagram",
                "facebook",
                "youtube",
                "tiktok",
                "website"
            ],
            required: true,
            validate: {
                validator: function (arr) {
                    return Array.isArray(arr) && arr.length > 0;
                },
                message: "At least one target platform is required"
            }
        },

        budget: {
            type: Number,
            required: true,
            min: 0
        },

        minBudget: {
            type: Number,
            min: 0,
            default: null
        },

        maxBudget: {
            type: Number,
            min: 0,
            default: null
        },

        audienceTargeting: {
            age: {
                type: String,
                trim: true,
                default: "All"
            },
            gender: {
                type: String,
                enum: ["all", "male", "female", "other"],
                default: "all"
            },
            geography: {
                type: [String],
                default: []
            }
        },

        usageRights: {
            organicUsage: {
                type: Boolean,
                default: true
            },
            paidAds: {
                type: Boolean,
                default: false
            },
            duration: {
                type: String,
                trim: true,
                default: "30 days"
            },
            exclusivity: {
                type: Boolean,
                default: false
            }
        },

        creatorRequirements: {
            minFollowers: {
                type: Number,
                min: 0,
                default: 0
            },
            minEngagementRate: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            }
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

// Ensure budget, minBudget, and maxBudget consistency before validation
campaignSchema.pre("validate", function () {
    const hasBudget = this.budget !== undefined && this.budget !== null && !isNaN(this.budget);
    const hasMin = this.minBudget !== undefined && this.minBudget !== null && !isNaN(this.minBudget);
    const hasMax = this.maxBudget !== undefined && this.maxBudget !== null && !isNaN(this.maxBudget);

    if (!hasBudget) {
        if (hasMax) {
            this.budget = Number(this.maxBudget);
        } else if (hasMin) {
            this.budget = Number(this.minBudget);
        }
    }

    if (hasMin && hasMax && Number(this.minBudget) > Number(this.maxBudget)) {
        throw new Error("Minimum budget cannot exceed maximum budget");
    }
});

campaignSchema.index({ status: 1, "moderation.isRestricted": 1, createdAt: -1 });

const Campaign = mongoose.model(
    "Campaign",
    campaignSchema
);

export default Campaign;
