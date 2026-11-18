import mongoose from "mongoose";

const creditTransactionSchema = new mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: [
                "subscription_grant",
                "monthly_renewal_grant",
                "application_deduction",
                "application_refund",
                "manual_adjustment",
                "subscription_expired"
            ],
            required: true,
            index: true
        },
        amount: {
            type: Number,
            required: true,
            validate: {
                validator: function (val) {
                    return Number.isInteger(val) && val !== 0;
                },
                message: "Amount must be a non-zero finite integer"
            }
        },
        balanceAfter: {
            type: Number,
            required: true,
            min: 0
        },
        referenceType: {
            type: String,
            enum: [
                "subscription",
                "booking",
                "campaign",
                "admin_audit",
                "cron"
            ],
            required: true
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            default: null
        },
        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        idempotencyKey: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Query optimization for creator history and type-based reporting
creditTransactionSchema.index({ creator: 1, createdAt: -1 });
creditTransactionSchema.index({ type: 1, createdAt: -1 });

// Deduplication index for webhook and grant events (only indexes non-empty string keys)
creditTransactionSchema.index(
    { idempotencyKey: 1 },
    {
        unique: true,
        partialFilterExpression: {
            idempotencyKey: { $type: "string", $gt: "" }
        }
    }
);

const CreditTransaction = mongoose.model("CreditTransaction", creditTransactionSchema);

export default CreditTransaction;
