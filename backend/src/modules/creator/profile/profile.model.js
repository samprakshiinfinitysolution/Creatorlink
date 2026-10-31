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

        // Professional title / headline of the creator.
        title: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
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

        // Multiple creator niches (maximum 3 items).
        niches: {
            type: [String],
            default: [],
            validate: [
                {
                    validator: function (val) {
                        return !val || val.length <= 3;
                    },
                    message: "Niches cannot exceed 3 items"
                }
            ]
        },

        // Searchable keywords representing the creator's content.
        keywords: {
            type: [String],
            default: []
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

        // Date of birth for creator verification / demographics.
        dob: {
            type: Date
        },

        // Creator gender identity.
        gender: {
            type: String,
            trim: true,
            enum: [
                "male",
                "female",
                "non-binary",
                "other",
                "prefer_not_to_say"
            ]
        },

        // Languages the creator creates content in or speaks.
        languages: {
            type: [String],
            default: []
        },

        // Optional creator ethnicity demographic information.
        ethnicity: {
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
        },

        // Indicates whether the creator has completed the guided onboarding flow.
        isOnboarded: {
            type: Boolean,
            default: false
        },

        // Starting collaboration rate / base price (INR).
        startingRate: {
            type: Number,
            min: 0,
            default: 0
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
