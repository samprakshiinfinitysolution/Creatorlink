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

        // Calculated engagement rate percentage based on recent eligible posts ((avgLikes + avgComments) / followers) * 100.
        // Defaults to null to distinguish uncalculated accounts from genuine 0% engagement.
        engagementRate: {
            type: Number,
            default: null,
            min: 0
        },

        // Average likes count across sampled eligible recent posts.
        averageLikes: {
            type: Number,
            default: null,
            min: 0
        },

        // Average comments count across sampled eligible recent posts.
        averageComments: {
            type: Number,
            default: null,
            min: 0
        },

        // Number of eligible recent posts included in the engagement sample (0 to 12).
        engagementPostCount: {
            type: Number,
            default: 0,
            min: 0
        },

        // Timestamp when engagement metrics were last calculated and synced from Meta Graph API.
        engagementLastSyncedAt: {
            type: Date,
            default: null
        },

        // Flag indicating whether CreatorProfile metrics need reconciliation
        // (set to true if CreatorProfile update fails during standalone non-transaction connect/sync).
        needsProfileSync: {
            type: Boolean,
            default: false,
            index: true
        },

        // Monotonic version counter incremented on every fresh sync from Meta API.
        // Prevents out-of-order or stale reconciliation writes.
        syncVersion: {
            type: Number,
            default: 0,
            index: true
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
        },

        // Connection status of the Instagram integration.
        // Defaults to CONNECTED ensuring backward compatibility with existing documents.
        status: {
            type: String,
            enum: ["CONNECTED", "DISCONNECTED", "EXPIRED"],
            default: "CONNECTED",
            index: true
        },

        // Reason or error message when the connection is disconnected or expired.
        disconnectionReason: {
            type: String,
            trim: true,
            default: ""
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
