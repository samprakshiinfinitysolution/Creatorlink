import mongoose from "mongoose";

const brandSocialLinksSchema = new mongoose.Schema(
    {
        instagram: {
            type: String,
            trim: true,
            default: ""
        },
        linkedin: {
            type: String,
            trim: true,
            default: ""
        },
        youtube: {
            type: String,
            trim: true,
            default: ""
        },
        facebook: {
            type: String,
            trim: true,
            default: ""
        },
        twitter: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { _id: false, strict: false }
);

const brandContactInfoSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 30,
            default: ""
        }
    },
    { _id: false, strict: false }
);

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

        // Verified structured social media channels
        socialLinks: {
            type: brandSocialLinksSchema,
            default: () => ({})
        },

        // Collaboration contact details for campaigns and direct inquiries
        contactInformation: {
            type: brandContactInfoSchema,
            default: () => ({})
        },

        // Verification business status activated exclusively via approved admin verification request.
        isVerifiedBusiness: {
            type: Boolean,
            default: false
        },

        // Onboarding completion flag indicating whether initial brand setup has been finalized.
        isOnboarded: {
            type: Boolean,
            default: false,
            index: true
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
