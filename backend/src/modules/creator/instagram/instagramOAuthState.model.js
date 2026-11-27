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

        // Tracks whether this state token has already been consumed or claimed for processing.
        isConsumed: {
            type: Boolean,
            default: false
        },

        // Cryptographically unique identifier for the currently active processing lease.
        // Acts as a fencing token to prevent stale requests from committing persistence after lease expiry.
        claimId: {
            type: String,
            default: null,
            trim: true
        },

        // Exact timestamp when the state token was consumed or claimed.
        consumedAt: {
            type: Date,
            default: null
        },

        // Expiry timestamp for the active processing claim lease (e.g. 60s).
        // Allows crash recovery if a server dies while processing before persistence.
        claimExpiresAt: {
            type: Date,
            default: null
        },

        // Set to true only after account connection and profile persistence succeed.
        // A completed ticket can NEVER be claimed, leased, or re-used.
        isCompleted: {
            type: Boolean,
            default: false
        },

        // Exact timestamp when the ticket was finalized upon persistence.
        completedAt: {
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
