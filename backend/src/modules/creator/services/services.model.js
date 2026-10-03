import mongoose from "mongoose";


const creatorServiceSchema = new mongoose.Schema(
    {
        // Auth._id of the creator who offers this service.
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Name shown to brands.
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        // Explains exactly what the creator provides.
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        // Main category of the service.
        category: {
            type: String,
            trim: true,
            maxlength: 100,
            required: true
        },

        // Platform on which the service is delivered.
        platform: {
            type: String,
            enum: [
                "instagram",
                "youtube",
                "facebook",
                "tiktok",
                "website",
                "multiple",
                "other"
            ],
            required: true
        },

        // What the brand actually receives.
        deliverables: {
            type: [String],
            default: []
        },

        // Pricing model.
        pricingType: {
            type: String,
            enum: [
                "fixed",
                "starting_from",
                "custom"
            ],
            default: "fixed"
        },

        // Price offered by the creator.
        // For custom pricing this can remain 0.
        price: {
            type: Number,
            min: 0,
            default: 0
        },

        // Currency used for the service price.
        currency: {
            type: String,
            uppercase: true,
            trim: true,
            default: "INR",
            maxlength: 3
        },

        // Expected delivery time in days.
        deliveryTime: {
            type: Number,
            min: 1,
            default: 7
        },

        // Number of revisions included in the service.
        revisions: {
            type: Number,
            min: 0,
            default: 1
        },

        // Controls whether brands can currently select this service.
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


// Creator's own services.
creatorServiceSchema.index({
    creator: 1,
    createdAt: -1
});


// Useful for active service listing.
creatorServiceSchema.index({
    creator: 1,
    isActive: 1,
    createdAt: -1
});


// Useful when filtering services by category.
creatorServiceSchema.index({
    creator: 1,
    category: 1,
    isActive: 1
});


// Useful when filtering by platform.
creatorServiceSchema.index({
    platform: 1,
    isActive: 1,
    createdAt: -1
});


const CreatorService = mongoose.model(
    "CreatorService",
    creatorServiceSchema
);


export default CreatorService;