import mongoose from "mongoose";

import Booking from "../../booking/booking.model.js";
import Workspace from "../../workspace/workspace.model.js";
import Payment from "../../payments/payment.model.js";
import Message from "../../messages/message.model.js";
import Review from "../../reviews/reviews.model.js";
import Notification from "../../notifications/notification.model.js";
import Auth from "../../auth/auth.model.js";
import CreatorService from "../services/services.model.js";
import Campaign from "../../brand/campaigns/campaign.model.js";
import createApiError from "../../../utils/ApiError.js";

// Fetches aggregated creator dashboard overview metrics, recent collaborations, and upcoming deadlines
const getCreatorDashboardOverviewService = async (creatorId, query = {}) => {
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
        throw createApiError(400, "Invalid creator ID");
    }

    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    const recentLimit = Math.min(Math.max(Number(query.recentLimit) || 5, 1), 50);
    const deadlinesLimit = Math.min(Math.max(Number(query.deadlinesLimit) || 5, 1), 50);
    const now = new Date();

    // Execute first wave of independent queries in parallel
    const [
        earningsAgg,
        pendingPaymentsAgg,
        paidOrPendingWorkspaceIds,
        activeWorkspacesCount,
        activeStatusAgg,
        completedWorkspacesCount,
        proposalsReceived,
        applicationsSubmitted,
        revisionsRequested,
        unreadMessages,
        unreadNotifications,
        reviewsAgg,
        recentReviews,
        recentWorkspaces,
        upcomingWorkspaceDeadlines,
        upcomingBookingDeadlines,
        creatorUser
    ] = await Promise.all([
        // 1. Total Earnings: Sum of unique completed/paid payments per workspace grouped by currency
        Payment.aggregate([
            {
                $match: {
                    creator: creatorObjectId,
                    status: "paid"
                }
            },
            {
                $sort: {
                    isActive: -1,
                    paidAt: -1,
                    createdAt: -1
                }
            },
            {
                $group: {
                    _id: "$workspace",
                    amount: { $first: "$amount" },
                    currency: { $first: { $ifNull: ["$currency", "INR"] } }
                }
            },
            {
                $group: {
                    _id: "$currency",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]),

        // 2. Direct Pending Payments: Sum of unique in-flight active payment orders not yet captured grouped by currency
        Payment.aggregate([
            {
                $match: {
                    creator: creatorObjectId,
                    status: { $in: ["pending", "processing"] },
                    isActive: true
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $group: {
                    _id: "$workspace",
                    amount: { $first: "$amount" },
                    currency: { $first: { $ifNull: ["$currency", "INR"] } }
                }
            },
            {
                $group: {
                    _id: "$currency",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]),

        // 3. Workspace IDs already tied to active/paid/pending payment records (prevents double-counting)
        Payment.distinct("workspace", {
            creator: creatorObjectId,
            $or: [
                { status: "paid" },
                { status: { $in: ["pending", "processing"] }, isActive: true }
            ]
        }),

        // 4. Active Collaborations count (in_progress, submitted, revision_requested)
        Workspace.countDocuments({
            creator: creatorObjectId,
            status: { $in: ["in_progress", "submitted", "revision_requested"] }
        }),

        // 5. Active Collaborations status breakdown
        Workspace.aggregate([
            {
                $match: {
                    creator: creatorObjectId,
                    status: { $in: ["in_progress", "submitted", "revision_requested"] }
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),

        // 6. Completed Collaborations count
        Workspace.countDocuments({
            creator: creatorObjectId,
            status: "completed"
        }),

        // 7. Pending Requests breakdown: Direct hire proposals from brands (action required by creator)
        Booking.countDocuments({
            creator: creatorObjectId,
            status: "pending",
            initiatedBy: "brand"
        }),

        // 8. Pending Requests breakdown: Campaign applications submitted by creator (awaiting brand review)
        Booking.countDocuments({
            creator: creatorObjectId,
            status: "pending",
            initiatedBy: "creator"
        }),

        // 9. Pending Requests breakdown: Workspaces where revision is requested
        Workspace.countDocuments({
            creator: creatorObjectId,
            status: "revision_requested"
        }),

        // 10. Unread Messages count
        Message.countDocuments({
            receiver: creatorObjectId,
            isRead: false
        }),

        // 11. Unread Notifications count
        Notification.countDocuments({
            recipient: creatorObjectId,
            isRead: false
        }),

        // 12. Reviews summary (average rating and total count)
        Review.aggregate([
            {
                $match: {
                    reviewee: creatorObjectId
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]),

        // 13. Recent Reviews
        Review.find({ reviewee: creatorObjectId })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate("reviewer", "name")
            .populate("campaign", "title")
            .select("rating comment reviewer campaign createdAt"),

        // 14. Recent Workspaces / Collaborations (Data minimized: brand name only, no email)
        Workspace.find({ creator: creatorObjectId })
            .sort({ createdAt: -1 })
            .limit(recentLimit)
            .populate("brand", "name")
            .populate("campaign", "title category platform budget")
            .populate("service", "title price deliveryTime"),

        // 15. Upcoming Active Workspace Deadlines
        Workspace.find({
            creator: creatorObjectId,
            status: { $in: ["in_progress", "revision_requested"] },
            deadline: { $gte: now }
        })
            .sort({ deadline: 1 })
            .limit(deadlinesLimit)
            .populate("brand", "name")
            .populate("campaign", "title category platform")
            .select("_id deadline status agreedPrice currency campaign brand deliverables"),

        // 16. Upcoming Pending Booking Deadlines
        Booking.find({
            creator: creatorObjectId,
            status: "pending",
            deadline: { $gte: now }
        })
            .sort({ deadline: 1 })
            .limit(deadlinesLimit)
            .populate("brand", "name")
            .populate("campaign", "title category platform budget")
            .select("_id deadline status agreedPrice currency campaign brand initiatedBy"),

        // 17. Authenticated Creator User basic info
        Auth.findById(creatorObjectId).select("name email role")
    ]);

    // Query unpaid completed workspaces with no existing payment record to prevent double-counting
    const unpaidCompletedWorkspaces = await Workspace.find({
        creator: creatorObjectId,
        status: "completed",
        _id: { $nin: paidOrPendingWorkspaceIds }
    }).select("agreedPrice currency");

    // Process earnings aggregates by currency
    const earningsByCurrency = earningsAgg.map((item) => ({
        currency: (item._id || "INR").toUpperCase(),
        amount: Number(item.total || 0),
        paidTransactionsCount: Number(item.count || 0)
    }));

    const inrEarnings = earningsByCurrency.find((e) => e.currency === "INR");
    const totalEarnings = inrEarnings ? inrEarnings.amount : 0;
    const paidPaymentsCount = inrEarnings ? inrEarnings.paidTransactionsCount : 0;
    const earningsCurrency = "INR";

    // Process direct pending payments by currency
    const pendingByCurrencyMap = {};
    pendingPaymentsAgg.forEach((item) => {
        const curr = (item._id || "INR").toUpperCase();
        pendingByCurrencyMap[curr] = {
            directPendingAmount: Number(item.total || 0),
            directPendingCount: Number(item.count || 0)
        };
    });

    // Process unpaid completed workspaces grouped by currency to prevent silent currency mixing
    const unpaidByCurrency = {};
    unpaidCompletedWorkspaces.forEach((ws) => {
        const curr = (ws.currency || "INR").trim().toUpperCase();
        if (!unpaidByCurrency[curr]) {
            unpaidByCurrency[curr] = { total: 0, count: 0 };
        }
        unpaidByCurrency[curr].total += Number(ws.agreedPrice) || 0;
        unpaidByCurrency[curr].count += 1;
    });

    // Combine direct pending and unpaid completed workspaces by currency
    const allPendingCurrencies = new Set([
        ...Object.keys(pendingByCurrencyMap),
        ...Object.keys(unpaidByCurrency)
    ]);

    const pendingByCurrency = Array.from(allPendingCurrencies).map((curr) => {
        const direct = pendingByCurrencyMap[curr] || { directPendingAmount: 0, directPendingCount: 0 };
        const unpaid = unpaidByCurrency[curr] || { total: 0, count: 0 };
        return {
            currency: curr,
            directPendingAmount: direct.directPendingAmount,
            directPendingCount: direct.directPendingCount,
            unpaidWorkspacesEstimatedAmount: unpaid.total,
            unpaidWorkspacesCount: unpaid.count,
            totalOutstandingEstimated: direct.directPendingAmount + unpaid.total
        };
    });

    const inrPending = pendingByCurrency.find((p) => p.currency === "INR");
    const directPendingAmount = inrPending ? inrPending.directPendingAmount : 0;
    const directPendingCount = inrPending ? inrPending.directPendingCount : 0;
    const unpaidWorkspacesEstimatedAmount = inrPending ? inrPending.unpaidWorkspacesEstimatedAmount : 0;
    const unpaidWorkspacesCount = inrPending ? inrPending.unpaidWorkspacesCount : 0;
    const totalOutstandingEstimated = inrPending ? inrPending.totalOutstandingEstimated : 0;
    const pendingCurrency = "INR";

    // Process active status map
    const activeStatusMap = {};
    activeStatusAgg.forEach((item) => {
        activeStatusMap[item._id] = item.count;
    });

    // Format upcoming deadlines with explicit source types
    const workspaceDeadlines = upcomingWorkspaceDeadlines.map((ws) => ({
        id: ws._id,
        sourceType: "workspace",
        title: ws.campaign?.title || "Collaboration Deliverable",
        brandName: ws.brand?.name || "Brand",
        category: ws.campaign?.category || "General",
        platform: ws.campaign?.platform || "multiple",
        status: ws.status,
        deadline: ws.deadline,
        agreedPrice: ws.agreedPrice,
        currency: ws.currency || "INR",
        deliverablesCount: ws.deliverables?.length || 0
    }));

    const bookingDeadlines = upcomingBookingDeadlines.map((b) => ({
        id: b._id,
        sourceType: b.initiatedBy === "brand" ? "brand_proposal" : "campaign_application",
        title: b.campaign?.title || "Campaign Application",
        brandName: b.brand?.name || "Brand",
        category: b.campaign?.category || "General",
        platform: b.campaign?.platform || "multiple",
        status: b.status,
        deadline: b.deadline,
        agreedPrice: b.agreedPrice,
        currency: b.currency || "INR",
        initiatedBy: b.initiatedBy
    }));

    const combinedDeadlines = [...workspaceDeadlines, ...bookingDeadlines]
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, deadlinesLimit);

    // Format recent workspaces (data minimized: brand name only)
    const formattedRecentWorkspaces = recentWorkspaces.map((ws) => ({
        id: ws._id,
        bookingId: ws.booking,
        campaignId: ws.campaign?._id,
        title: ws.campaign?.title || "Collaboration Deliverables",
        brand: {
            id: ws.brand?._id,
            name: ws.brand?.name || "Brand"
        },
        service: {
            id: ws.service?._id,
            title: ws.service?.title || "Custom Service",
            price: ws.service?.price ?? ws.agreedPrice
        },
        category: ws.campaign?.category || "General",
        platform: ws.campaign?.platform || "multiple",
        compensation: ws.agreedPrice,
        currency: ws.currency || "INR",
        status: ws.status,
        deliverablesCount: ws.deliverables?.length || 0,
        deadline: ws.deadline,
        createdAt: ws.createdAt,
        updatedAt: ws.updatedAt
    }));

    // Process reviews
    const averageRating = reviewsAgg[0]?.averageRating
        ? Math.round(reviewsAgg[0].averageRating * 10) / 10
        : 0;
    const totalReviews = reviewsAgg[0]?.totalReviews || 0;
    const formattedReviews = recentReviews.map((rev) => ({
        id: rev._id,
        rating: rev.rating,
        comment: rev.comment,
        reviewerName: rev.reviewer?.name || "Brand",
        campaignTitle: rev.campaign?.title || "",
        createdAt: rev.createdAt
    }));

    return {
        creator: {
            id: creatorUser?._id || creatorId,
            name: creatorUser?.name || "Creator",
            email: creatorUser?.email || ""
        },
        metrics: {
            totalEarnings: {
                amount: totalEarnings,
                currency: earningsCurrency,
                paidTransactionsCount: paidPaymentsCount,
                byCurrency: earningsByCurrency
            },
            pendingPayments: {
                amount: directPendingAmount,
                currency: pendingCurrency,
                count: directPendingCount,
                directPendingAmount,
                directPendingCount,
                unpaidWorkspacesEstimatedAmount,
                unpaidWorkspacesCount,
                totalOutstandingEstimated,
                byCurrency: pendingByCurrency
            },
            activeCollaborations: {
                total: activeWorkspacesCount,
                breakdown: {
                    inProgress: activeStatusMap.in_progress || 0,
                    submitted: activeStatusMap.submitted || 0,
                    revisionRequested: activeStatusMap.revision_requested || 0
                }
            },
            completedCollaborations: {
                total: completedWorkspacesCount
            },
            // Preserved for backward compatibility with existing consumers and test suites
            activeCampaigns: {
                total: activeWorkspacesCount,
                breakdown: {
                    inProgress: activeStatusMap.in_progress || 0,
                    submitted: activeStatusMap.submitted || 0,
                    revisionRequested: activeStatusMap.revision_requested || 0
                }
            },
            completedCampaigns: {
                total: completedWorkspacesCount
            },
            pendingRequests: {
                total: proposalsReceived + applicationsSubmitted + revisionsRequested,
                proposalsReceived,
                applicationsSubmitted,
                revisionsRequested
            },
            unreadCounts: {
                messages: unreadMessages,
                notifications: unreadNotifications
            },
            reviews: {
                averageRating,
                totalReviews
            }
        },
        reviews: {
            averageRating,
            totalReviews,
            recent: formattedReviews
        },
        upcomingDeadlines: combinedDeadlines,
        recentWorkspaces: formattedRecentWorkspaces
    };
};

export {
    getCreatorDashboardOverviewService
};
