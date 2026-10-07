import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        // Links this brand profile with the authenticated user.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            unique: true
        },

        companyName: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        },

        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        industry: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        website: {
            type: String,
            trim: true,
            default: ""
        },

        logo: {
            type: String,
            trim: true,
            default: ""
        },

        location: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        // Social links structure will be finalized
        socialLinks: {
            type: Object,
            default: {}
        },

        // Contact information structure will be finalized
        contactInformation: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

const BrandProfile = mongoose.model(
    "BrandProfile",
    profileSchema
);

export default BrandProfile;