import mongoose from "mongoose";

const encryptedTokenSchema = new mongoose.Schema(
    {
        iv: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        tag: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        _id: false
    }
);

const instagramAccountSchema = new mongoose.Schema(
    {
        // Links this Instagram account with the authenticated CreatorLink creator.
        // References the Auth collection (Auth._id).
        // Each CreatorLink creator can connect one Instagram account.
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            unique: true,
            index: true
        },

        // Unique Instagram user ID assigned by Meta.
        // Enforces that an Instagram account cannot be linked to multiple CreatorLink creators.
        instagramUserId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },

        // Instagram handle/username.
        username: {
            type: String,
            required: true,
            trim: true
        },

        // Professional account type (e.g., CREATOR or BUSINESS).
        accountType: {
            type: String,
            trim: true,
            default: ""
        },

        // URL to the creator's Instagram profile picture.
        profilePictureUrl: {
            type: String,
            trim: true,
            default: ""
        },

        // Total verified followers count fetched from Meta API.
        followersCount: {
            type: Number,
            default: 0,
            min: 0
        },

        // Total published media count fetched from Meta API.
        mediaCount: {
            type: Number,
            default: 0,
            min: 0
        },

        // AES-256-GCM encrypted access token (never stored in plaintext).
        encryptedAccessToken: {
            type: encryptedTokenSchema,
            required: true
        },

        // Timestamp when the access token expires (if applicable).
        tokenExpiresAt: {
            type: Date
        },

        // Timestamp of the most recent data sync from Meta Graph API.
        lastSyncedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const InstagramAccount = mongoose.model(
    "InstagramAccount",
    instagramAccountSchema
);

export default InstagramAccount;
