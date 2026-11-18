import mongoose from "mongoose";

const creatorCreditBalanceSchema = new mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            unique: true
        },
        currentBalance: {
            type: Number,
            default: 0,
            min: 0
        },
        lifetimeIssued: {
            type: Number,
            default: 0,
            min: 0
        },
        lifetimeConsumed: {
            type: Number,
            default: 0,
            min: 0
        },
        lifetimeExpired: {
            type: Number,
            default: 0,
            min: 0
        },
        lastAllocatedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const CreatorCreditBalance = mongoose.model("CreatorCreditBalance", creatorCreditBalanceSchema);

export default CreatorCreditBalance;
