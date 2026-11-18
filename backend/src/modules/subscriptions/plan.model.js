import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 50
        },
        targetRole: {
            type: String,
            enum: ["brand", "creator"],
            default: "brand",
            required: true,
            index: true
        },
        version: {
            type: Number,
            default: 1,
            min: 1
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },
        priceMonthly: {
            type: Number,
            required: true,
            min: 0
        },
        priceYearly: {
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
        monthlyContactQuota: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator: function (val) {
                    const role = this?.targetRole || "brand";
                    if (role === "brand") {
                        return typeof val === "number" && val >= 1;
                    }
                    return typeof val === "number" && val >= 0;
                },
                message: "monthlyContactQuota must be at least 1 for brand plans"
            }
        },
        monthlyApplicationCredits: {
            type: Number,
            default: 0,
            min: 0
        },
        trialAllowed: {
            type: Boolean,
            default: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        features: [
            {
                type: String,
                trim: true
            }
        ]
    },
    {
        timestamps: true
    }
);

// Clean compound indexes for active plans sorted by newest
subscriptionPlanSchema.index({ isActive: 1, createdAt: -1 });
subscriptionPlanSchema.index({ targetRole: 1, isActive: 1, createdAt: -1 });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

export default SubscriptionPlan;
