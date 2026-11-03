import mongoose from "mongoose";

const planSnapshotSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            trim: true
        },
        version: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            uppercase: true,
            trim: true,
            default: "INR"
        },
        billingCycle: {
            type: String,
            enum: ["trial", "monthly", "yearly"],
            required: true
        },
        monthlyContactQuota: {
            type: Number,
            required: true,
            min: 0
        },
        features: [
            {
                type: String,
                trim: true
            }
        ]
    },
    { _id: false }
);

const quotaStateSchema = new mongoose.Schema(
    {
        // Fixed quota for 5-day trial (exactly 5 unique creators, does not reset by month)
        trialQuotaLimit: {
            type: Number,
            default: 5,
            min: 0
        },
        trialQuotaUsed: {
            type: Number,
            default: 0,
            min: 0
        },

        // Rolling quota for paid plans (resets by UTC calendar month: "YYYY-MM")
        currentCalendarMonthKey: {
            type: String,
            trim: true,
            default: ""
        },
        monthlyQuotaLimit: {
            type: Number,
            default: 0,
            min: 0
        },
        monthlyQuotaUsed: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
    {
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            default: null
        },
        planSnapshot: {
            type: planSnapshotSchema,
            required: true
        },
        status: {
            type: String,
            enum: [
                "trialing",
                "active",
                "past_due",
                "canceled",
                "expired",
                "suspended"
            ],
            required: true,
            index: true
        },
        billingCycle: {
            type: String,
            enum: ["trial", "monthly", "yearly"],
            required: true
        },
        isComplimentary: {
            type: Boolean,
            default: false
        },
        trialStartDate: {
            type: Date,
            default: null
        },
        trialEndDate: {
            type: Date,
            default: null
        },
        currentPeriodStart: {
            type: Date,
            required: true
        },
        currentPeriodEnd: {
            type: Date,
            required: true
        },
        quotaState: {
            type: quotaStateSchema,
            default: () => ({})
        },
        cancelAtPeriodEnd: {
            type: Boolean,
            default: false
        },
        canceledAt: {
            type: Date,
            default: null
        },
        gracePeriodEnd: {
            type: Date,
            default: null
        },
        razorpayPaymentId: {
            type: String,
            trim: true,
            default: ""
        },
        razorpayOrderId: {
            type: String,
            trim: true,
            default: ""
        },
        trialEligibility: {
            isFlagged: {
                type: Boolean,
                default: false
            },
            flagReasons: [
                {
                    type: String,
                    trim: true
                }
            ],
            evaluatedAt: {
                type: Date,
                default: null
            }
        }
    },
    {
        timestamps: true
    }
);

// Database-enforced invariant: A Brand can have at most ONE current subscription (trialing, active, or past_due)
subscriptionSchema.index(
    { brand: 1 },
    {
        name: "unique_active_brand_subscription",
        unique: true,
        partialFilterExpression: {
            status: { $in: ["trialing", "active", "past_due"] }
        }
    }
);

// Indexes for administrative monitoring and expiration checks
subscriptionSchema.index({ currentPeriodEnd: 1, status: 1 });
subscriptionSchema.index({ brand: 1, createdAt: -1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
