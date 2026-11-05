import mongoose from "mongoose";

import Campaign from "../campaigns/campaign.model.js";
import Booking from "../../booking/booking.model.js";
import Workspace from "../../workspace/workspace.model.js";
import Payment from "../../payments/payment.model.js";
import Message from "../../messages/message.model.js";
import Notification from "../../notifications/notification.model.js";
import Auth from "../../auth/auth.model.js";
import CreatorService from "../../creator/services/services.model.js";
import BrandProfile from "../profile/profile.model.js";
import createApiError from "../../../utils/ApiError.js";

// Validates and returns a safe IANA timezone, defaulting to Asia/Kolkata (platform business timezone)
const getValidTimezone = (tz) => {
    if (!tz || typeof tz !== "string") return "Asia/Kolkata";
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz.trim() });
        return tz.trim();
    } catch {
        return "Asia/Kolkata";
    }
};

// Calculates the precise UTC instant of midnight (00:00:00.000) on the 1st day of the 6th month prior in target timezone
const getZonedSixMonthsAgo = (date = new Date(), timeZone = "Asia/Kolkata") => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    });
    const parts = formatter.formatToParts(date);
    const p = {};
    for (const part of parts) {
        p[part.type] = part.value;
    }
    let targetYear = parseInt(p.year, 10);
    let targetMonth = parseInt(p.month, 10) - 5;
    while (targetMonth < 1) {
        targetMonth += 12;
        targetYear -= 1;
    }

    const monthStr = String(targetMonth).padStart(2, "0");
    const naiveUtc = new Date(`${targetYear}-${monthStr}-01T00:00:00Z`);
    const naiveParts = formatter.formatToParts(naiveUtc);
    const np = {};
    for (const part of naiveParts) {
        np[part.type] = part.value;
    }
    const targetLocalTime = naiveUtc.getTime();
    const naiveInTarget = new Date(
        `${np.year}-${String(np.month).padStart(2, "0")}-${String(np.day).padStart(2, "0")}T${String(np.hour).padStart(2, "0")}:${String(np.minute).padStart(2, "0")}:${String(np.second).padStart(2, "0")}Z`
    ).getTime();
    const offset = naiveInTarget - targetLocalTime;

    return new Date(naiveUtc.getTime() - offset);
};

// Calculates the precise UTC instant of midnight (00:00:00.000) X days ago in target timezone
const getZonedDaysAgo = (date = new Date(), days = 30, timeZone = "Asia/Kolkata") => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    });

    const msInDay = 24 * 60 * 60 * 1000;
    const targetDate = new Date(date.getTime() - (days * msInDay));

    const parts = formatter.formatToParts(targetDate);
    const p = {};
    for (const part of parts) {
        p[part.type] = part.value;
    }

    const y = parseInt(p.year, 10);
    const m = String(p.month).padStart(2, "0");
    const d = String(p.day).padStart(2, "0");

    const naiveUtc = new Date(`${y}-${m}-${d}T00:00:00Z`);
    const naiveParts = formatter.formatToParts(naiveUtc);
    const np = {};
    for (const part of naiveParts) {
        np[part.type] = part.value;
    }
    const targetLocalTime = naiveUtc.getTime();
    const naiveInTarget = new Date(
        `${np.year}-${String(np.month).padStart(2, "0")}-${String(np.day).padStart(2, "0")}T${String(np.hour).padStart(2, "0")}:${String(np.minute).padStart(2, "0")}:${String(np.second).padStart(2, "0")}Z`
    ).getTime();
    const offset = naiveInTarget - targetLocalTime;

    return new Date(naiveUtc.getTime() - offset);
};

// Derives the start Date threshold for the requested timeframe in target timezone. Returns null for "all".
const getTimeframeStartDate = (timeframe = "6m", date = new Date(), timeZone = "Asia/Kolkata") => {
    const normalized = typeof timeframe === "string" ? timeframe.trim().toLowerCase() : "6m";
    if (normalized === "all") {
        return null;
    }
    if (normalized === "30d") {
        return getZonedDaysAgo(date, 30, timeZone);
    }
    if (normalized === "90d") {
        return getZonedDaysAgo(date, 90, timeZone);
    }
    // Default to "6m"
    return getZonedSixMonthsAgo(date, timeZone);
};

// Fetches aggregated brand dashboard overview metrics, recent campaigns, collaborations, and upcoming deadlines
const getBrandDashboardOverviewService = async (brandId, query = {}) => {
    if (!brandId || !mongoose.Types.ObjectId.isValid(brandId)) {
        throw createApiError(400, "Invalid brand ID");
    }

    const brandObjectId = new mongoose.Types.ObjectId(brandId);
    const recentLimit = Math.min(Math.max(Number(query.recentLimit) || 5, 1), 50);
    const deadlinesLimit = Math.min(Math.max(Number(query.deadlinesLimit) || 5, 1), 50);
    const timezone = getValidTimezone(query.timezone);
    const rawTimeframe = typeof query.timeframe === "string" ? query.timeframe.trim().toLowerCase() : "6m";
    const timeframe = ["30d", "90d", "6m", "all"].includes(rawTimeframe) ? rawTimeframe : "6m";
    const now = new Date();
    // Timeframe start boundary in target timezone (null for "all")
    const startDate = getTimeframeStartDate(timeframe, now, timezone);

    // Timeframe match filter for brand campaigns
    const campaignTimeframeFilter = { brand: brandObjectId };
    if (startDate) {
        campaignTimeframeFilter.createdAt = { $gte: startDate };
    }

    // Active campaigns count filter with timeframe
    const activeCampaignsFilter = {
        brand: brandObjectId,
        status: { $in: ["published", "in_progress"] }
    };
    if (startDate) {
        activeCampaignsFilter.createdAt = { $gte: startDate };
    }

    // Payment spending filter using effective payment date (paidAt falling back to createdAt)
    const paymentSpendingMatch = {
        brand: brandObjectId,
        status: "paid"
    };
    if (startDate) {
        paymentSpendingMatch.$expr = {
            $gte: [{ $ifNull: ["$paidAt", "$createdAt"] }, startDate]
        };
    }

    // Direct Pending Payments filter (in-flight active orders within timeframe)
    const paymentPendingMatch = {
        brand: brandObjectId,
        status: { $in: ["pending", "processing"] },
        isActive: true
    };
    if (startDate) {
        paymentPendingMatch.$expr = {
            $gte: [{ $ifNull: ["$paidAt", "$createdAt"] }, startDate]
        };
    }

    // Verify brand profile exists and has completed onboarding
    const brandProfile = await BrandProfile.findOne({ user: brandObjectId }).select("isOnboarded").lean();
    if (!brandProfile || !brandProfile.isOnboarded) {
        throw createApiError(403, "Please complete onboarding before accessing the brand dashboard");
    }

    // Execute first wave of independent queries in parallel
    const [
        totalCampaignsCount,
        activeCampaignsCount,
        campaignStatusAgg,
        pendingBookingsTotal,
        creatorApplicationsCount,
        brandProposalsCount,
        activeWorkspacesCount,
        activeWorkspaceStatusAgg,
        completedWorkspacesCount,
        spendingAgg,
        pendingPaymentsAgg,
        paidOrPendingWorkspaceIds,
        unreadMessagesCount,
        unreadNotificationsCount,
        recentCampaigns,
        recentWorkspaces,
        upcomingCampaignDeadlines,
        upcomingWorkspaceDeadlines,
        upcomingBookingDeadlines,
        brandUser,
        monthlyCampaignBudgetAgg,
        totalCampaignBudgetAgg
    ] = await Promise.all([
        // 1. Total Campaigns count (respecting timeframe)
        Campaign.countDocuments(campaignTimeframeFilter),

        // 2. Active Campaigns count (published or in_progress, respecting timeframe)
        Campaign.countDocuments(activeCampaignsFilter),

        // 3. Campaign status distribution breakdown (respecting timeframe)
        Campaign.aggregate([
            { $match: campaignTimeframeFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),

        // 4. Pending Bookings total
        Booking.countDocuments({
            brand: brandObjectId,
            status: "pending"
        }),

        // 5. Creator Applications submitted to brand campaigns (awaiting brand review)
        Booking.countDocuments({
            brand: brandObjectId,
            status: "pending",
            initiatedBy: "creator"
        }),

        // 6. Direct hire proposals sent by brand to creators (awaiting creator response)
        Booking.countDocuments({
            brand: brandObjectId,
            status: "pending",
            initiatedBy: "brand"
        }),

        // 7. Active Collaborations / Workspaces count
        Workspace.countDocuments({
            brand: brandObjectId,
            status: { $in: ["in_progress", "submitted", "revision_requested", "approved"] }
        }),

        // 8. Active Collaborations status breakdown
        Workspace.aggregate([
            {
                $match: {
                    brand: brandObjectId,
                    status: { $in: ["in_progress", "submitted", "revision_requested", "approved"] }
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),

        // 9. Completed Collaborations count
        Workspace.countDocuments({
            brand: brandObjectId,
            status: "completed"
        }),

        // 10. Total Spending: Sum of unique completed/paid payments per workspace grouped by currency (respecting timeframe)
        Payment.aggregate([
            {
                $match: paymentSpendingMatch
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

        // 11. Direct Pending Payments: Sum of unique in-flight active payment orders not yet captured grouped by currency (respecting timeframe)
        Payment.aggregate([
            {
                $match: paymentPendingMatch
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

        // 12. Workspace IDs already tied to active/paid/pending payment records (prevents double-counting in backlog)
        Payment.distinct("workspace", {
            brand: brandObjectId,
            $or: [
                { status: "paid" },
                { status: { $in: ["pending", "processing"] }, isActive: true }
            ]
        }),

        // 13. Unread Messages count for the authenticated brand
        Message.countDocuments({
            receiver: brandObjectId,
            isRead: false
        }),

        // 14. Unread Notifications count for the authenticated brand
        Notification.countDocuments({
            recipient: brandObjectId,
            isRead: false
        }),

        // 15. Recent Campaigns
        Campaign.find({ brand: brandObjectId })
            .sort({ createdAt: -1 })
            .limit(recentLimit)
            .select("_id title category platform budget currency deadline requiredCreators deliverables status coverImage createdAt"),

        // 16. Recent Collaborations / Workspaces (Data minimized: creator name only, no email)
        Workspace.find({ brand: brandObjectId })
            .sort({ createdAt: -1 })
            .limit(recentLimit)
            .populate("creator", "name")
            .populate("campaign", "title category platform budget coverImage")
            .populate("service", "title price deliveryTime"),

        // 17. Upcoming Active Campaign Deadlines
        Campaign.find({
            brand: brandObjectId,
            status: { $in: ["published", "in_progress"] },
            deadline: { $gte: now }
        })
            .sort({ deadline: 1 })
            .limit(deadlinesLimit)
            .select("_id title category platform budget currency deadline status requiredCreators coverImage"),

        // 18. Upcoming Active Workspace Deadlines
        Workspace.find({
            brand: brandObjectId,
            status: { $in: ["in_progress", "revision_requested"] },
            deadline: { $gte: now }
        })
            .sort({ deadline: 1 })
            .limit(deadlinesLimit)
            .populate("creator", "name")
            .populate("campaign", "title category platform coverImage")
            .select("_id deadline status agreedPrice currency campaign creator deliverables"),

        // 19. Upcoming Pending Booking Deadlines
        Booking.find({
            brand: brandObjectId,
            status: "pending",
            deadline: { $gte: now }
        })
            .sort({ deadline: 1 })
            .limit(deadlinesLimit)
            .populate("creator", "name")
            .populate("campaign", "title category platform budget coverImage")
            .select("_id deadline status agreedPrice currency campaign creator initiatedBy"),

        // 20. Authenticated Brand User basic info
        Auth.findById(brandObjectId).select("name email role"),

        // 21. Monthly Campaign Budget distribution across brand campaigns (respecting timeframe)
        Campaign.aggregate([
            {
                $match: campaignTimeframeFilter
            },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$createdAt", timezone } },
                        month: { $month: { date: "$createdAt", timezone } },
                        currency: { $ifNull: ["$currency", "INR"] }
                    },
                    totalBudget: {
                        $sum: {
                            $ifNull: [
                                "$budget",
                                { $ifNull: ["$maxBudget", { $ifNull: ["$minBudget", 0] }] }
                            ]
                        }
                    },
                    campaignsCount: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]),

        // 22. Total Campaign Budget across brand campaigns grouped by currency (respecting timeframe)
        Campaign.aggregate([
            { $match: campaignTimeframeFilter },
            {
                $group: {
                    _id: { $ifNull: ["$currency", "INR"] },
                    total: {
                        $sum: {
                            $ifNull: [
                                "$budget",
                                { $ifNull: ["$maxBudget", { $ifNull: ["$minBudget", 0] }] }
                            ]
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ])
    ]);

    // Query unpaid completed workspaces with no existing payment record to prevent double-counting
    const unpaidCompletedWorkspaces = await Workspace.find({
        brand: brandObjectId,
        status: { $in: ["completed", "approved"] },
        _id: { $nin: paidOrPendingWorkspaceIds }
    }).select("agreedPrice currency");

    // Process spending aggregates by currency
    const spendingByCurrency = spendingAgg.map((item) => ({
        currency: (item._id || "INR").toUpperCase(),
        amount: Number(item.total || 0),
        paidTransactionsCount: Number(item.count || 0)
    }));

    const inrSpending = spendingByCurrency.find((e) => e.currency === "INR");
    const totalSpendingAmount = inrSpending ? inrSpending.amount : 0;
    const paidTransactionsCount = inrSpending ? inrSpending.paidTransactionsCount : 0;
    const spendingCurrency = "INR";

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

    // Process campaign status distribution map
    const campaignStatusMap = {
        draft: 0,
        published: 0,
        in_progress: 0,
        paused: 0,
        completed: 0,
        closed: 0
    };
    campaignStatusAgg.forEach((item) => {
        if (item._id && campaignStatusMap[item._id] !== undefined) {
            campaignStatusMap[item._id] = item.count;
        } else if (item._id) {
            campaignStatusMap[item._id] = item.count;
        }
    });

    // Process active workspace status distribution map
    const activeWorkspaceStatusMap = {
        in_progress: 0,
        submitted: 0,
        revision_requested: 0
    };
    activeWorkspaceStatusAgg.forEach((item) => {
        if (item._id && activeWorkspaceStatusMap[item._id] !== undefined) {
            activeWorkspaceStatusMap[item._id] = item.count;
        }
    });

    // Process total campaign budget by currency across ALL brand campaigns
    const budgetByCurrency = totalCampaignBudgetAgg.map((item) => ({
        currency: (item._id || "INR").toUpperCase(),
        amount: Number(item.total || 0),
        campaignsCount: Number(item.count || 0)
    }));

    const inrBudget = budgetByCurrency.find((b) => b.currency === "INR");
    const totalBudgetAmount = inrBudget ? inrBudget.amount : 0;
    const totalBudgetCampaignsCount = inrBudget ? inrBudget.campaignsCount : 0;

    // Format monthly budgets for the 6-month historical chart
    const monthlyBudgets = monthlyCampaignBudgetAgg.map((item) => {
        const year = item._id.year;
        const month = item._id.month; // 1-12 calendar month
        const monthIndex = month - 1; // 0-11 JS month index
        const currency = (item._id.currency || "INR").toUpperCase();
        return {
            year,
            month,
            monthIndex,
            key: `${year}-${monthIndex}`,
            currency,
            totalBudget: Number(item.totalBudget || 0),
            campaignsCount: Number(item.campaignsCount || 0)
        };
    });

    // Format upcoming deadlines with explicit source types
    const campaignDeadlines = upcomingCampaignDeadlines.map((c) => ({
        id: c._id,
        sourceType: "campaign",
        title: c.title,
        category: c.category || "General",
        platform: c.platform || "multiple",
        status: c.status,
        deadline: c.deadline,
        budget: c.budget,
        currency: c.currency || "INR",
        requiredCreators: c.requiredCreators,
        coverImage: c.coverImage || "",
        thumbnail: c.coverImage || "",
        image: c.coverImage || ""
    }));

    const workspaceDeadlines = upcomingWorkspaceDeadlines.map((ws) => {
        const deliverablesList = Array.isArray(ws.deliverables) ? ws.deliverables : [];
        const deliverablesCount = deliverablesList.length;
        const completedDeliverablesCount = deliverablesList.filter(
            (d) => d && (d.status === "approved" || d.status === "completed")
        ).length;
        const deliverablesProgress = deliverablesCount > 0
            ? Math.round((completedDeliverablesCount / deliverablesCount) * 100)
            : 0;

        return {
            id: ws._id,
            sourceType: "workspace",
            title: ws.campaign?.title || "Collaboration Deliverable",
            creatorName: ws.creator?.name || "Creator",
            category: ws.campaign?.category || "General",
            platform: ws.campaign?.platform || "multiple",
            status: ws.status,
            deadline: ws.deadline,
            agreedPrice: ws.agreedPrice,
            currency: ws.currency || "INR",
            deliverablesCount,
            completedDeliverablesCount,
            deliverablesProgress,
            coverImage: ws.campaign?.coverImage || "",
            thumbnail: ws.campaign?.coverImage || "",
            image: ws.campaign?.coverImage || ""
        };
    });

    const bookingDeadlines = upcomingBookingDeadlines.map((b) => ({
        id: b._id,
        sourceType: b.initiatedBy === "creator" ? "creator_proposal" : "brand_proposal",
        title: b.campaign?.title || "Campaign Proposal",
        creatorName: b.creator?.name || "Creator",
        category: b.campaign?.category || "General",
        platform: b.campaign?.platform || "multiple",
        status: b.status,
        deadline: b.deadline,
        agreedPrice: b.agreedPrice,
        currency: b.currency || "INR",
        initiatedBy: b.initiatedBy,
        coverImage: b.campaign?.coverImage || "",
        thumbnail: b.campaign?.coverImage || "",
        image: b.campaign?.coverImage || ""
    }));

    const combinedDeadlines = [...campaignDeadlines, ...workspaceDeadlines, ...bookingDeadlines]
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, deadlinesLimit);

    // Format recent campaigns
    const formattedRecentCampaigns = recentCampaigns.map((c) => ({
        id: c._id,
        title: c.title,
        category: c.category,
        platform: c.platform,
        budget: c.budget,
        currency: c.currency || "INR",
        deadline: c.deadline,
        requiredCreators: c.requiredCreators,
        deliverablesCount: c.deliverables?.length || 0,
        status: c.status,
        coverImage: c.coverImage || "",
        createdAt: c.createdAt
    }));

    // Format recent workspaces (data minimized: creator name only, no email)
    const formattedRecentWorkspaces = recentWorkspaces.map((ws) => ({
        id: ws._id,
        bookingId: ws.booking,
        campaignId: ws.campaign?._id,
        title: ws.campaign?.title || "Collaboration Deliverables",
        creator: {
            id: ws.creator?._id,
            name: ws.creator?.name || "Creator"
        },
        service: {
            id: ws.service?._id,
            title: ws.service?.title || "Custom Service",
            price: ws.service?.price ?? ws.agreedPrice
        },
        category: ws.campaign?.category || "General",
        platform: ws.campaign?.platform || "multiple",
        agreedPrice: ws.agreedPrice,
        currency: ws.currency || "INR",
        status: ws.status,
        deliverablesCount: ws.deliverables?.length || 0,
        deadline: ws.deadline,
        createdAt: ws.createdAt
    }));

    return {
        metrics: {
            timeframe,
            campaigns: {
                total: totalCampaignsCount,
                active: activeCampaignsCount,
                statusBreakdown: campaignStatusMap,
                totalBudget: {
                    amount: totalBudgetAmount,
                    currency: "INR",
                    campaignsCount: totalBudgetCampaignsCount,
                    byCurrency: budgetByCurrency
                },
                monthlyBudgets
            },
            pendingBookings: {
                total: pendingBookingsTotal,
                creatorApplications: creatorApplicationsCount,
                brandProposals: brandProposalsCount
            },
            collaborations: {
                active: activeWorkspacesCount,
                completed: completedWorkspacesCount,
                activeStatusBreakdown: activeWorkspaceStatusMap
            },
            totalSpending: {
                amount: totalSpendingAmount,
                currency: spendingCurrency,
                paidTransactionsCount,
                byCurrency: spendingByCurrency
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
            unread: {
                messages: unreadMessagesCount,
                notifications: unreadNotificationsCount
            }
        },
        upcomingDeadlines: combinedDeadlines,
        recentCampaigns: formattedRecentCampaigns,
        recentCollaborations: formattedRecentWorkspaces,
        user: {
            id: brandUser?._id || brandObjectId,
            name: brandUser?.name || "Brand",
            email: brandUser?.email || "",
            role: brandUser?.role || "brand"
        }
    };
};

export {
    getBrandDashboardOverviewService
};
