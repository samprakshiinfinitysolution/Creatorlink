import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // Reference to the workspace associated with this payment.
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true
        },

        // Reference to the parent booking.
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true
        },

        // Reference to the associated campaign.
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            required: true
        },

        // Auth._id of the brand making the payment.
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Auth._id of the creator receiving the payment context.
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Payment amount in major units (e.g. INR rupees).
        amount: {
            type: Number,
            required: true,
            min: 0
        },

        // Currency code.
        currency: {
            type: String,
            uppercase: true,
            trim: true,
            default: "INR",
            maxlength: 3
        },

        // Payment method used (e.g. RAZORPAY_TEST).
        paymentMethod: {
            type: String,
            trim: true,
            default: "RAZORPAY_TEST"
        },

        // Payment status.
        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "paid",
                "failed",
                "refunded",
                "cancelled"
            ],
            default: "pending"
        },

        // Flag indicating active payment lock/reservation (used for database-enforced unique partial indexing)
        isActive: {
            type: Boolean,
            default: true
        },

        // Razorpay order ID (e.g., order_P1234567890).
        razorpayOrderId: {
            type: String,
            trim: true,
            default: ""
        },

        // Razorpay payment ID (e.g., pay_P1234567890).
        razorpayPaymentId: {
            type: String,
            trim: true,
            default: ""
        },

        // Internal / Gateway transaction reference ID.
        transactionId: {
            type: String,
            trim: true,
            default: ""
        },

        // Flag indicating test mode simulation (never treated as real money or real payout).
        isTestMode: {
            type: Boolean,
            default: true
        },

        // Timestamp when the payment was successfully captured/verified.
        paidAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Database-enforced atomic unique constraint: prevents concurrent active/paid payments for the same workspace
paymentSchema.index(
    { workspace: 1 },
    {
        unique: true,
        partialFilterExpression: { isActive: true }
    }
);

// Useful query indexes
paymentSchema.index({ workspace: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ brand: 1, createdAt: -1 });
paymentSchema.index({ creator: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
