import mongoose from "mongoose";

const subscriptionPaymentSchema = new mongoose.Schema(
    {
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            required: true
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            uppercase: true,
            trim: true,
            default: "INR",
            maxlength: 3
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            required: true
        },
        status: {
            type: String,
            enum: [
                "pending",
                "captured",
                "failed",
                "refunded"
            ],
            default: "pending",
            index: true
        },
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        razorpayPaymentId: {
            type: String,
            trim: true,
            default: ""
        },
        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

subscriptionPaymentSchema.index({ brand: 1, createdAt: -1 });
subscriptionPaymentSchema.index({ razorpayPaymentId: 1 }, { sparse: true });

const SubscriptionPayment = mongoose.model("SubscriptionPayment", subscriptionPaymentSchema);

export default SubscriptionPayment;
