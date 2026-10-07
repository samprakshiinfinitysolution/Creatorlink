import mongoose from "mongoose";

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
        }
    },
    {
        timestamps: true
    }
);

const Campaign = mongoose.model(
    "Campaign",
    campaignSchema
);

export default Campaign;