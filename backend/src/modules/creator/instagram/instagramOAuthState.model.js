import mongoose from "mongoose";

const instagramOAuthStateSchema = new mongoose.Schema(
    {
        // Links this OAuth state transaction to the CreatorLink creator who initiated the flow.
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            index: true
        },

        // SHA-256 hash of the cryptographically random nonce.
        // Enforces single-use uniqueness across all OAuth state transactions.
        nonceHash: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        // Expiry timestamp (strictly 10 minutes from creation).
        expiresAt: {
            type: Date,
            required: true
        },

        // Tracks whether this state token has already been consumed by the OAuth callback.
        isConsumed: {
            type: Boolean,
            default: false
        },

        // Exact timestamp when the state token was consumed.
        consumedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// TTL index: MongoDB automatically purges expired state documents once expiresAt passes.
instagramOAuthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const InstagramOAuthState = mongoose.model(
    "InstagramOAuthState",
    instagramOAuthStateSchema
);

export default InstagramOAuthState;
