import mongoose from "mongoose";
import Auth from "../../auth/auth.model.js";
import CreatorProfile from "../../creator/profile/profile.model.js";
import BrandProfile from "../../brand/profile/profile.model.js";
import Campaign from "../../brand/campaigns/campaign.model.js";
import Booking from "../../booking/booking.model.js";
import Workspace from "../../workspace/workspace.model.js";
import Payment from "../../payments/payment.model.js";
import createSearchQuery from "../../../utils/helpers/search.helper.js";
import { getPagination, getPaginationData } from "../../../utils/pagination.js";
import createApiError from "../../../utils/ApiError.js";

// Fetches paginated platform users with filtering, search, and profile enrichment
const getAdminUsersService = async (query = {}) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);

    // 1. Build MongoDB filter object
    const filter = {};

    // Filter by role
    if (query.role && query.role !== "all") {
        filter.role = query.role.toLowerCase();
    }

    // Filter by verification status
    if (query.isVerified !== undefined && query.isVerified !== "all") {
        filter.isVerified = query.isVerified === "true";
    }

    // Filter by registration date range
    if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) {
            filter.createdAt.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
            filter.createdAt.$lte = new Date(query.endDate);
        }
    }

    // Search by name or email
    if (query.search && query.search.trim()) {
        const searchCondition = createSearchQuery(query.search.trim(), ["name", "email"]);
        Object.assign(filter, searchCondition);
    }

    // Determine sort order
    const sortOrder = query.sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    // 2. Query users and total count in parallel
    const [users, totalUsers] = await Promise.all([
        Auth.find(filter)
            .select("name email role isVerified avatar createdAt updatedAt")
            .sort(sortOrder)
            .skip(skip)
            .limit(limit)
            .lean(),
        Auth.countDocuments(filter)
    ]);

    // 3. Batch enrich with profiles to avoid N+1 queries
    const creatorUserIds = users.filter((u) => u.role === "creator").map((u) => u._id);
    const brandUserIds = users.filter((u) => u.role === "brand").map((u) => u._id);

    const [creatorProfiles, brandProfiles] = await Promise.all([
        creatorUserIds.length > 0
            ? CreatorProfile.find({ user: { $in: creatorUserIds } })
                  .select("user bio category location profileImage followerCount engagementRate isPublic")
                  .lean()
            : [],
        brandUserIds.length > 0
            ? BrandProfile.find({ user: { $in: brandUserIds } })
                  .select("user companyName industry website logo location")
                  .lean()
            : []
    ]);

    // Map profiles by user string ID
    const creatorProfileMap = new Map(creatorProfiles.map((p) => [p.user.toString(), p]));
    const brandProfileMap = new Map(brandProfiles.map((p) => [p.user.toString(), p]));

    const enrichedUsers = users.map((user) => {
        const userIdStr = user._id.toString();
        let profile = null;

        if (user.role === "creator") {
            profile = creatorProfileMap.get(userIdStr) || null;
        } else if (user.role === "brand") {
            profile = brandProfileMap.get(userIdStr) || null;
        }

        return {
            ...user,
            profile
        };
    });

    return {
        users: enrichedUsers,
        pagination: getPaginationData(page, limit, totalUsers)
    };
};

// Fetches deep dossier for a specific user including profile, campaigns, bookings, and financial totals
const getAdminUserByIdService = async (userId) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw createApiError(400, "Invalid user ID format");
    }

    // 1. Fetch user auth document with strict field projection (no sensitive credentials)
    const user = await Auth.findById(userId)
        .select("name email role isVerified avatar createdAt updatedAt")
        .lean();

    if (!user) {
        throw createApiError(404, "User not found");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    let profile = null;
    let stats = {};
    let recentActivity = {};

    // 2. Fetch role-specific details
    if (user.role === "creator") {
        const [
            creatorProfile,
            totalBookings,
            activeWorkspaces,
            completedWorkspaces,
            earningsAgg,
            recentBookings
        ] = await Promise.all([
            CreatorProfile.findOne({ user: userObjectId }).lean(),
            Booking.countDocuments({ creator: userObjectId }),
            Workspace.countDocuments({
                creator: userObjectId,
                status: { $in: ["in_progress", "submitted", "revision_requested"] }
            }),
            Workspace.countDocuments({ creator: userObjectId, status: "completed" }),
            Payment.aggregate([
                { $match: { creator: userObjectId, status: "paid" } },
                {
                    $group: {
                        _id: "$currency",
                        totalEarnings: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                }
            ]),
            Booking.find({ creator: userObjectId })
                .populate("campaign", "title budget currency status")
                .populate("brand", "name email")
                .select("campaign brand agreedPrice currency status initiatedBy createdAt")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);

        profile = creatorProfile;
        const primaryEarnings = earningsAgg[0] || { totalEarnings: 0, count: 0 };
        stats = {
            totalBookings,
            activeWorkspaces,
            completedWorkspaces,
            totalEarnings: primaryEarnings.totalEarnings || 0,
            currency: primaryEarnings._id || "INR",
            paidTransactionsCount: primaryEarnings.count || 0
        };
        recentActivity = {
            bookings: recentBookings
        };
    } else if (user.role === "brand") {
        const [
            brandProfile,
            totalCampaigns,
            activeCampaigns,
            totalBookings,
            spendingAgg,
            recentCampaigns,
            recentBookings
        ] = await Promise.all([
            BrandProfile.findOne({ user: userObjectId }).lean(),
            Campaign.countDocuments({ brand: userObjectId }),
            Campaign.countDocuments({
                brand: userObjectId,
                status: { $in: ["published", "in_progress"] }
            }),
            Booking.countDocuments({ brand: userObjectId }),
            Payment.aggregate([
                { $match: { brand: userObjectId, status: "paid" } },
                {
                    $group: {
                        _id: "$currency",
                        totalSpent: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                }
            ]),
            Campaign.find({ brand: userObjectId })
                .select("title budget currency status requiredCreators deadline createdAt")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Booking.find({ brand: userObjectId })
                .populate("creator", "name email")
                .populate("campaign", "title")
                .select("creator campaign agreedPrice currency status initiatedBy createdAt")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);

        profile = brandProfile;
        const primarySpending = spendingAgg[0] || { totalSpent: 0, count: 0 };
        stats = {
            totalCampaigns,
            activeCampaigns,
            totalBookings,
            totalSpent: primarySpending.totalSpent || 0,
            currency: primarySpending._id || "INR",
            paidTransactionsCount: primarySpending.count || 0
        };
        recentActivity = {
            campaigns: recentCampaigns,
            bookings: recentBookings
        };
    } else if (user.role === "admin") {
        stats = {
            accountType: "Platform Administrator",
            permissions: "Full Access (Super Admin)"
        };
    }

    return {
        user,
        profile,
        stats,
        recentActivity
    };
};

export {
    getAdminUsersService,
    getAdminUserByIdService
};

