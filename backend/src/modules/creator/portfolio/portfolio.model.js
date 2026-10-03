import mongoose from "mongoose";


const portfolioContentSchema = new mongoose.Schema(
    {
        // Platform where the creator published the content.
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

        // Type of content published on that platform.
        contentType: {
            type: String,
            enum: [
                "post",
                "reel",
                "story",
                "video",
                "short",
                "article",
                "other"
            ],
            required: true
        },

        // Actual published content URL.
        url: {
            type: String,
            required: true,
            trim: true
        },

        // Image/thumbnail used to show a preview.
        previewImage: {
            type: String,
            trim: true,
            default: ""
        },

        // Optional title for this particular content.
        title: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        }
    },
    {
        _id: true
    }
);


const portfolioSchema = new mongoose.Schema(
    {
        // Auth._id of the creator who owns this portfolio work.
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Optional reference to a real campaign.
        // This can be connected with the Campaign module later.
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            default: null
        },

        // Brand associated with this work.
        // This can also be connected with the Brand module later.
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            default: null
        },

        // Main title of the portfolio work.
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        // Overall description of the work.
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        // Main category of the work.
        category: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        // Main cover image used for portfolio preview.
        coverImage: {
            type: String,
            trim: true,
            default: ""
        },

        // Different social/platform content belonging
        // to this particular portfolio work.
        contents: {
            type: [portfolioContentSchema],
            default: []
        },

        // Controls public visibility.
        isPublic: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


// Creator's own portfolio listing.
portfolioSchema.index({
    creator: 1,
    createdAt: -1
});


// Useful when fetching only public portfolio work.
portfolioSchema.index({
    creator: 1,
    isPublic: 1,
    createdAt: -1
});


// Useful for category-based creator portfolio filtering.
portfolioSchema.index({
    creator: 1,
    category: 1,
    createdAt: -1
});


const Portfolio = mongoose.model(
    "Portfolio",
    portfolioSchema
);


export default Portfolio;