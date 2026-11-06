import Auth from "../../auth/auth.model.js";
import Campaign from "../../brand/campaigns/campaign.model.js";
import Workspace from "../../workspace/workspace.model.js";
import Booking from "../../booking/booking.model.js";
import Payment from "../../payments/payment.model.js";
import Review from "../../reviews/reviews.model.js";
import Subscription from "../../subscriptions/subscription.model.js";
import SubscriptionPayment from "../../subscriptions/subscriptionPayment.model.js";
import VerificationRequest from "../verification/verification.model.js";

// Fetches comprehensive platform telemetry and overview metrics for the Admin Dashboard.
const getAdminDashboardOverviewService = async (query = {}) => {
    const recentLimit = Math.min(Math.max(Number(query.recentLimit) || 5, 1), 50);
    const timeRange = (query.timeRange || "30d").toLowerCase();

    // Calculate time filter cutoff for new signups and trends
    let startDate = null;
    const now = new Date();
    if (timeRange === "7d") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "30d") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "90d") {
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "1y") {
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const signupFilter = startDate
        ? { role: { $in: ["creator", "brand"] }, createdAt: { $gte: startDate } }
        : { role: { $in: ["creator", "brand"] } };

    // Execute queries in parallel for high-performance dashboard telemetry
    const [
        totalCreators,
        totalBrands,
        verifiedCreators,
        verifiedBrands,
        periodSignups,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalBookings,
        totalWorkspaces,
        activeWorkspaces,
        completedWorkspaces,
        overdueWorkspaces,
        pendingVerifications,
        activePaidSubscriptions,
        activeTrials,
        expiredSubscriptions,
        paymentsAgg,
        subscriptionPaymentsAgg,
        totalReviews,
        recentSignups,
        recentCampaigns,
        recentPayments,
        recentSubscriptionPayments
    ] = await Promise.all([
        // 1. Users metrics
        Auth.countDocuments({ role: "creator" }),
        Auth.countDocuments({ role: "brand" }),
        Auth.countDocuments({ role: "creator", isVerified: true }),
        Auth.countDocuments({ role: "brand", isVerified: true }),
        Auth.countDocuments(signupFilter),

        // 2. Campaigns metrics
        Campaign.countDocuments(),
        Campaign.countDocuments({ status: { $in: ["published", "in_progress"] } }),
        Campaign.countDocuments({ status: "completed" }),

        // 3. Collaborations metrics
        Booking.countDocuments(),
        Workspace.countDocuments(),
        Workspace.countDocuments({ status: { $in: ["in_progress", "submitted", "revision_requested", "approved"] } }),
        Workspace.countDocuments({ status: "completed" }),
        Workspace.countDocuments({
            status: { $in: ["in_progress", "submitted", "revision_requested"] },
            deadline: { $lt: now }
        }),

        // 4. Verification queue action items
        VerificationRequest.countDocuments({ status: "pending" }),

        // 5. Subscription lifecycle metrics
        Subscription.countDocuments({ status: { $in: ["active", "past_due"] } }),
        Subscription.countDocuments({ status: "trialing" }),
        Subscription.countDocuments({ status: "expired" }),

        // 6. Financial metrics: GMV and payments volume
        Payment.aggregate([
            { $match: { status: "paid" } },
            {
                $group: {
                    _id: "$currency",
                    totalVolume: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]),

        // 7. SaaS Subscriptions revenue
        SubscriptionPayment.aggregate([
            { $match: { status: "captured" } },
            {
                $group: {
                    _id: "$currency",
                    totalRevenue: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]),

        // 8. Reviews metric
        Review.countDocuments(),

        // 9. Recent signups
        Auth.find({ role: { $in: ["creator", "brand"] } })
            .select("name email role isVerified avatar createdAt")
            .sort({ createdAt: -1 })
            .limit(recentLimit)
            .lean(),

        // 10. Recent campaigns
        Campaign.find()
            .populate("brand", "name email avatar")
            .select("title brand budget currency status requiredCreators coverImage createdAt")
            .sort({ createdAt: -1 })
            .limit(recentLimit)
            .lean(),

        // 11. Recent collaboration payments
        Payment.find({ status: "paid" })
            .populate("brand", "name email avatar")
            .populate("creator", "name email avatar")
            .select("amount currency status razorpayPaymentId brand creator paidAt createdAt")
            .sort({ paidAt: -1, createdAt: -1 })
            .limit(recentLimit)
            .lean(),

        // 12. Recent subscription payments
        SubscriptionPayment.find({ status: "captured" })
            .populate("brand", "name email avatar")
            .populate("plan", "name planType")
            .select("amount currency status razorpayPaymentId brand plan paidAt createdAt")
            .sort({ createdAt: -1 })
            .limit(recentLimit)
            .lean()
    ]);

    // Format financial totals
    const primaryCurrencyVolume = paymentsAgg.find((p) => p._id === "INR") || paymentsAgg[0] || { totalVolume: 0, count: 0 };
    const grossVolume = primaryCurrencyVolume.totalVolume || 0;
    const estimatedCommission = Math.round(grossVolume * 0.10); // 10% platform fee simulation

    const primarySubRevenue = subscriptionPaymentsAgg.find((p) => p._id === "INR") || subscriptionPaymentsAgg[0] || { totalRevenue: 0, count: 0 };
    const subscriptionRevenue = primarySubRevenue.totalRevenue || 0;

    return {
        metrics: {
            users: {
                totalCreators,
                totalBrands,
                totalUsers: totalCreators + totalBrands,
                verifiedCreators,
                verifiedBrands,
                periodSignups
            },
            campaigns: {
                totalCampaigns,
                activeCampaigns,
                completedCampaigns
            },
            collaborations: {
                totalBookings,
                totalWorkspaces,
                activeWorkspaces,
                completedWorkspaces,
                overdueWorkspaces
            },
            financials: {
                grossVolume,
                currency: primaryCurrencyVolume._id || "INR",
                totalPaidTransactions: primaryCurrencyVolume.count || 0,
                estimatedCommission,
                subscriptionRevenue,
                totalSubscriptionTransactions: primarySubRevenue.count || 0,
                combinedRevenue: estimatedCommission + subscriptionRevenue,
                byCurrency: paymentsAgg.map((item) => ({
                    currency: item._id,
                    totalVolume: item.totalVolume,
                    count: item.count
                }))
            },
            subscriptions: {
                activePaid: activePaidSubscriptions,
                activeTrials,
                expired: expiredSubscriptions,
                totalSubscribers: activePaidSubscriptions + activeTrials
            },
            actionItems: {
                pendingVerifications,
                overdueWorkspaces
            },
            reviews: {
                totalReviews
            }
        },
        recentActivity: {
            signups: recentSignups,
            campaigns: recentCampaigns,
            payments: recentPayments,
            subscriptionPayments: recentSubscriptionPayments
        }
    };
};

export {
    getAdminDashboardOverviewService
};
