import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        // Links this creator profile with the authenticated user.
        // The user comes from the Auth collection.
        // One user can have only one creator profile.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            unique: true
        },

        // Creator's public display information.
        bio: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        category: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        location: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        profileImage: {
            type: String,
            trim: true,
            default: ""
        },

        // Social media profile links.
        socialLinks: {
            instagram: {
                type: String,
                trim: true,
                default: ""
            },

            facebook: {
                type: String,
                trim: true,
                default: ""
            },

            youtube: {
                type: String,
                trim: true,
                default: ""
            },

            tiktok: {
                type: String,
                trim: true,
                default: ""
            },

            website: {
                type: String,
                trim: true,
                default: ""
            }
        },

        // These values can later be updated from
        // connected social-media accounts.
        followerCount: {
            type: Number,
            default: 0,
            min: 0
        },

        engagementRate: {
            type: Number,
            default: 0,
            min: 0
        },

        // Controls whether the creator profile
        // is visible on the public marketplace.
        isPublic: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const CreatorProfile = mongoose.model(
    "CreatorProfile",
    profileSchema
);

export default CreatorProfile;