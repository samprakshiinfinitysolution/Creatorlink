import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        // Auth._id of the user receiving the notification.
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            index: true
        },

        // Auth._id of the user who initiated the event (null if system-generated).
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            default: null
        },

        // Category/event identifier.
        type: {
            type: String,
            required: true,
            trim: true
        },

        // Short descriptive title for the notification card.
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        // Detailed human-readable notification message.
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },

        // Related domain entity type.
        entityType: {
            type: String,
            enum: [
                "booking",
                "workspace",
                "campaign",
                "payment",
                "review",
                "message"
            ],
            required: true
        },

        // ID of the related entity.
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        // Internal frontend navigation route.
        destination: {
            type: String,
            required: true,
            trim: true
        },

        // Read status indicator.
        isRead: {
            type: Boolean,
            default: false
        },

        // Timestamp when notification was marked as read.
        readAt: {
            type: Date,
            default: null
        },

        // Contextual payload snapshot (e.g. titles, amounts, feedback snippet).
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        // Unique key for deterministic deduplication of lifecycle event notifications.
        idempotencyKey: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Compound index for optimal feed querying and unread badge count calculations.
notificationSchema.index({
    recipient: 1,
    isRead: 1,
    createdAt: -1
});

// Index for entity-based lookups.
notificationSchema.index({
    recipient: 1,
    type: 1,
    entityId: 1
});

// Database-enforced atomic uniqueness for string idempotency keys.
// Uses partialFilterExpression to safely ignore null/unspecified keys without migration conflicts.
notificationSchema.index(
    { idempotencyKey: 1 },
    {
        unique: true,
        partialFilterExpression: { idempotencyKey: { $type: "string" } }
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
