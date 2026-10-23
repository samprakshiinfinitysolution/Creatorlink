import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        // Reference to parent conversation.
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },

        // Auth._id of the user sending the message.
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Auth._id of the user receiving the message.
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Text content of the message.
        message: {
            type: String,
            required: true,
            trim: true
        },

        // List of attachment file URLs or metadata.
        attachments: [
            {
                type: String,
                trim: true
            }
        ],

        // Read status indicator.
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes for message queries.
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
