import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        // Users participating in the conversation (Brand and Creator).
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Auth",
                required: true
            }
        ],

        // Booking context reference (if associated with a booking/collaboration).
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking"
        },

        // Campaign context reference.
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign"
        },

        // Preview snippet of the last message sent.
        lastMessage: {
            type: String,
            trim: true,
            default: ""
        },

        // Timestamp of the last message sent.
        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Indexes for conversation listing.
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ booking: 1 });
conversationSchema.index({ campaign: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
