import Auth from "../../auth/auth.model.js";
import Campaign from "../../brand/campaigns/campaign.model.js";
import Workspace from "../../workspace/workspace.model.js";
import Payment from "../../payments/payment.model.js";
import SubscriptionPayment from "../../subscriptions/subscriptionPayment.model.js";

// Comprehensive analytical reports and telemetry
const getReportsOverviewService = async (query = {}) => {
    const monthsBack = Math.min(Math.max(Number(query.months) || 6, 1), 24);
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);

    const [
        totalUsers,
        totalCreators,
        totalBrands,
        verifiedUsers,
        campaignStatusAgg,
        campaignCategoryAgg,
        monthlySignupsAgg,
        monthlyCollabVolumeAgg,
        monthlySubRevenueAgg,
        workspaceStatusAgg,
        topCreatorsAgg,
        topBrandsAgg
    ] = await Promise.all([
        // 1. Overall User Counts (Excluding Admins)
        Auth.countDocuments({ role: { $in: ["creator", "brand"] } }),
        Auth.countDocuments({ role: "creator" }),
        Auth.countDocuments({ role: "brand" }),
        Auth.countDocuments({ role: { $in: ["creator", "brand"] }, isVerified: true }),

        // 2. Campaigns Status Breakdown
        Campaign.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 }, totalBudget: { $sum: "$budget" } } }
        ]),

        // 3. Campaigns by Category / Niche Breakdown
        Campaign.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 }, totalBudget: { $sum: "$budget" } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]),

        // 4. Monthly User Registrations (Trend)
        Auth.aggregate([
            { $match: { role: { $in: ["creator", "brand"] }, createdAt: { $gte: cutoffDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        role: "$role"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]),

        // 5. Monthly Collaboration Gross Volume (Paid & Completed)
        Payment.aggregate([
            { $match: { status: { $in: ["paid", "completed"] }, createdAt: { $gte: cutoffDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]),

        // 6. Monthly SaaS Subscription Revenue
        SubscriptionPayment.aggregate([
            { $match: { status: "captured", createdAt: { $gte: cutoffDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalRevenue: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]),

        // 7. Workspace Lifecycle Status Distribution
        Workspace.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$agreedPrice" } } }
        ]),

        // 8. Top Active Creators by Completed Workspaces
        Workspace.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: "$creator",
                    completedCollabs: { $sum: 1 },
                    totalEarned: { $sum: "$agreedPrice" }
                }
            },
            { $sort: { completedCollabs: -1, totalEarned: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "auths",
                    localField: "_id",
                    foreignField: "_id",
                    as: "creatorInfo"
                }
            },
            { $unwind: { path: "$creatorInfo", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    completedCollabs: 1,
                    totalEarned: 1,
                    name: { $ifNull: ["$creatorInfo.name", "Creator"] },
                    email: { $ifNull: ["$creatorInfo.email", "—"] },
                    avatar: { $ifNull: ["$creatorInfo.avatar", ""] }
                }
            }
        ]),

        // 9. Top Active Brands by Campaign Volume
        Campaign.aggregate([
            {
                $group: {
                    _id: "$brand",
                    totalCampaigns: { $sum: 1 },
                    totalBudget: { $sum: "$budget" }
                }
            },
            { $sort: { totalCampaigns: -1, totalBudget: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "auths",
                    localField: "_id",
                    foreignField: "_id",
                    as: "brandInfo"
                }
            },
            { $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    totalCampaigns: 1,
                    totalBudget: 1,
                    name: { $ifNull: ["$brandInfo.name", "Brand"] },
                    email: { $ifNull: ["$brandInfo.email", "—"] }
                }
            }
        ])
    ]);

    return {
        summary: {
            totalUsers,
            totalCreators,
            totalBrands,
            verifiedUsers,
            verificationRatio: totalUsers > 0 ? Number(((verifiedUsers / totalUsers) * 100).toFixed(1)) : 0
        },
        campaigns: {
            byStatus: campaignStatusAgg.map((item) => ({ status: item._id, count: item.count, budget: item.totalBudget })),
            byCategory: campaignCategoryAgg.map((item) => ({ category: item._id || "General", count: item.count, budget: item.totalBudget }))
        },
        workspaces: {
            byStatus: workspaceStatusAgg.map((item) => ({ status: item._id, count: item.count, value: item.totalValue }))
        },
        trends: {
            signups: monthlySignupsAgg,
            collabVolume: monthlyCollabVolumeAgg,
            subscriptionRevenue: monthlySubRevenueAgg
        },
        leaders: {
            topCreators: topCreatorsAgg,
            topBrands: topBrandsAgg
        }
    };
};

export {
    getReportsOverviewService
};
