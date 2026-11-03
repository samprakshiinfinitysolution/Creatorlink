import mongoose from "mongoose";

const contactUnlockSchema = new mongoose.Schema(
    {
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            required: true
        },
        // "trial" for trial unlocks, or "YYYY-MM" for calendar-month quota accounting
        quotaPeriodKey: {
            type: String,
            required: true,
            trim: true
        },
        revealedChannels: {
            whatsapp: {
                type: Boolean,
                default: false
            },
            phone: {
                type: Boolean,
                default: false
            },
            email: {
                type: Boolean,
                default: false
            }
        },
        unlockedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Database-enforced Uniqueness: A Brand can unlock a Creator ONCE in history
contactUnlockSchema.index(
    { brand: 1, creator: 1 },
    { unique: true }
);

// Index for counting monthly unlocks per brand
contactUnlockSchema.index({ brand: 1, quotaPeriodKey: 1 });

const ContactUnlock = mongoose.model("ContactUnlock", contactUnlockSchema);

export default ContactUnlock;
