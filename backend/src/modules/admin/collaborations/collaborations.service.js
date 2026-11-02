import mongoose from "mongoose";
import Workspace from "../../workspace/workspace.model.js";
import Booking from "../../booking/booking.model.js";
import Campaign from "../../brand/campaigns/campaign.model.js";
import Auth from "../../auth/auth.model.js";
import BrandProfile from "../../brand/profile/profile.model.js";
import CreatorProfile from "../../creator/profile/profile.model.js";
import Review from "../../reviews/reviews.model.js";
import { createNotificationService } from "../../notifications/notification.service.js";
import createApiError from "../../../utils/ApiError.js";
import { getPagination, getPaginationData } from "../../../utils/pagination.js";

/**
 * Fetches platform-wide collaboration and workspace statistics.
 */
export const getAdminCollaborationsStatsService = async () => {
    const now = new Date();

    const [totalCollaborations, statusCounts, volumeMetrics, overdueCount] = await Promise.all([
        Workspace.countDocuments(),
        Workspace.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),
        Workspace.aggregate([
            {
                $group: {
                    _id: null,
                    totalVolume: { $sum: "$agreedPrice" },
                    avgVolume: { $avg: "$agreedPrice" }
                }
            }
        ]),
        Workspace.countDocuments({
            status: { $nin: ["completed", "cancelled"] },
            deadline: { $lt: now }
        })
    ]);

    const statusMap = {
        in_progress: 0,
        submitted: 0,
        revision_requested: 0,
        completed: 0,
        cancelled: 0
    };

    statusCounts.forEach((sc) => {
        if (statusMap[sc._id] !== undefined) {
            statusMap[sc._id] = sc.count;
        }
    });

    return {
        totalCollaborations,
        statusCounts: statusMap,
        totalVolume: volumeMetrics[0]?.totalVolume || 0,
        avgVolume: Math.round(volumeMetrics[0]?.avgVolume || 0),
        overdueCount
    };
};

/**
 * Fetches paginated collaborations with search, filters, user profiles, and deliverable progress.
 */
export const getAdminCollaborationsService = async (queryParams) => {
    const {
        page = 1,
        limit = 10,
        status = "all",
        search = "",
        sortBy = "newest",
        isOverdue = "all"
    } = queryParams;

    const filter = {};
    const now = new Date();

    // Status filter
    if (status && status !== "all") {
        filter.status = status.toLowerCase();
    }

    // Overdue filter
    if (isOverdue === "true") {
        filter.status = { $nin: ["completed", "cancelled"] };
        filter.deadline = { $lt: now };
    } else if (isOverdue === "false") {
        filter.$or = [
            { status: { $in: ["completed", "cancelled"] } },
            { deadline: { $gte: now } }
        ];
    }

    // Search across campaign title, brand name/email, creator name/email
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
        const searchRegex = new RegExp(trimmedSearch, "i");

        const [matchingCampaigns, matchingBrands, matchingCreators] = await Promise.all([
            Campaign.find({ title: searchRegex }).select("_id"),
            Auth.find({
                role: "brand",
                $or: [{ name: searchRegex }, { email: searchRegex }]
            }).select("_id"),
            Auth.find({
                role: "creator",
                $or: [{ name: searchRegex }, { email: searchRegex }]
            }).select("_id")
        ]);

        const campaignIds = matchingCampaigns.map((c) => c._id);
        const brandIds = matchingBrands.map((b) => b._id);
        const creatorIds = matchingCreators.map((c) => c._id);

        filter.$or = [
            { campaign: { $in: campaignIds } },
            { brand: { $in: brandIds } },
            { creator: { $in: creatorIds } }
        ];
    }

    const { skip, limit: parsedLimit } = getPagination(page, limit);

    // Sorting options
    let sortOptions = { createdAt: -1 };
    if (sortBy === "oldest") {
        sortOptions = { createdAt: 1 };
    } else if (sortBy === "deadline_near") {
        sortOptions = { deadline: 1 };
    } else if (sortBy === "price_high") {
        sortOptions = { agreedPrice: -1 };
    } else if (sortBy === "price_low") {
        sortOptions = { agreedPrice: 1 };
    }

    const [workspaces, totalItems] = await Promise.all([
        Workspace.find(filter)
            .populate("brand", "name email role isVerified")
            .populate("creator", "name email role isVerified")
            .populate("campaign", "title category platform budget coverImage")
            .populate("service", "title price deliveryTime")
            .sort(sortOptions)
            .skip(skip)
            .limit(parsedLimit)
            .lean(),
        Workspace.countDocuments(filter)
    ]);

    // Attach profile information for Brands and Creators
    const brandIds = workspaces.map((w) => w.brand?._id).filter(Boolean);
    const creatorIds = workspaces.map((w) => w.creator?._id).filter(Boolean);

    const [brandProfiles, creatorProfiles] = await Promise.all([
        BrandProfile.find({ user: { $in: brandIds } })
            .select("user companyName logo isVerifiedBusiness")
            .lean(),
        CreatorProfile.find({ user: { $in: creatorIds } })
            .select("user displayName profileImage isVerifiedBadge")
            .lean()
    ]);

    const brandProfileMap = new Map();
    brandProfiles.forEach((bp) => {
        brandProfileMap.set(bp.user.toString(), bp);
    });

    const creatorProfileMap = new Map();
    creatorProfiles.forEach((cp) => {
        creatorProfileMap.set(cp.user.toString(), cp);
    });

    const enrichedWorkspaces = workspaces.map((ws) => {
        const brandProfile = ws.brand ? brandProfileMap.get(ws.brand._id.toString()) : null;
        const creatorProfile = ws.creator ? creatorProfileMap.get(ws.creator._id.toString()) : null;

        const deliverablesList = ws.deliverables || [];
        const totalDeliverables = deliverablesList.length;
        const completedDeliverables = deliverablesList.filter(
            (d) => d.status === "completed" || d.status === "approved"
        ).length;

        const isDelayed =
            ws.status !== "completed" &&
            ws.status !== "cancelled" &&
            new Date(ws.deadline) < now;

        return {
            ...ws,
            brandProfile: brandProfile || null,
            creatorProfile: creatorProfile || null,
            deliverablesSummary: {
                total: totalDeliverables,
                completed: completedDeliverables,
                percentage:
                    totalDeliverables > 0
                        ? Math.round((completedDeliverables / totalDeliverables) * 100)
                        : 0
            },
            isOverdue: isDelayed
        };
    });

    return {
        collaborations: enrichedWorkspaces,
        pagination: getPaginationData(totalItems, page, limit)
    };
};

/**
 * Fetches full collaboration details, deliverables breakdown, revisions, and review.
 */
export const getAdminCollaborationByIdService = async (workspaceId) => {
    const workspace = await Workspace.findById(workspaceId)
        .populate("brand", "name email role isVerified createdAt")
        .populate("creator", "name email role isVerified createdAt")
        .populate("campaign", "title description category platform budget deadline requiredCreators deliverables coverImage")
        .populate("service", "title description price deliveryTime")
        .populate("booking", "status agreedPrice startDate deadline initiatedBy message")
        .lean();

    if (!workspace) {
        throw createApiError(404, "Collaboration workspace not found");
    }

    const [brandProfile, creatorProfile, review] = await Promise.all([
        workspace.brand?._id
            ? BrandProfile.findOne({ user: workspace.brand._id })
                  .select("companyName logo website industry location isVerifiedBusiness")
                  .lean()
            : null,
        workspace.creator?._id
            ? CreatorProfile.findOne({ user: workspace.creator._id })
                  .select("displayName profileImage bio primaryNiche isVerifiedBadge")
                  .lean()
            : null,
        workspace.booking?._id
            ? Review.findOne({ booking: workspace.booking._id }).lean()
            : null
    ]);

    const deliverablesList = workspace.deliverables || [];
    const totalDeliverables = deliverablesList.length;
    const completedDeliverables = deliverablesList.filter(
        (d) => d.status === "completed" || d.status === "approved"
    ).length;

    const isDelayed =
        workspace.status !== "completed" &&
        workspace.status !== "cancelled" &&
        new Date(workspace.deadline) < new Date();

    return {
        workspace,
        brandProfile,
        creatorProfile,
        review,
        deliverablesSummary: {
            total: totalDeliverables,
            completed: completedDeliverables,
            percentage:
                totalDeliverables > 0
                    ? Math.round((completedDeliverables / totalDeliverables) * 100)
                    : 0
        },
        isOverdue: isDelayed
    };
};

/**
 * Administratively overrides the status of a collaboration (e.g. mark completed, cancelled, revision).
 */
export const overrideCollaborationStatusService = async (
    workspaceId,
    newStatus,
    reason,
    adminId
) => {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
        throw createApiError(404, "Collaboration workspace not found");
    }

    const previousStatus = workspace.status;
    const targetStatus = newStatus.toLowerCase();
    workspace.status = targetStatus;

    // If marked as completed, set deliverables as approved
    if (targetStatus === "completed") {
        workspace.deliverables.forEach((d) => {
            if (d.status !== "approved" && d.status !== "completed") {
                d.status = "approved";
                d.approvedAt = new Date();
            }
        });
    }

    await workspace.save();

    // Sync booking status if booking exists
    if (workspace.booking) {
        if (targetStatus === "completed") {
            await Booking.findByIdAndUpdate(workspace.booking, { status: "completed" });
        } else if (targetStatus === "cancelled") {
            await Booking.findByIdAndUpdate(workspace.booking, { status: "cancelled" });
        }
    }

    // Build notification message
    let notifTitle = `Collaboration Status Updated to ${targetStatus.toUpperCase()}`;
    let notifMessage = `Admin updated collaboration status from "${previousStatus}" to "${targetStatus}".`;
    if (reason && reason.trim()) {
        notifMessage += ` Reason: ${reason.trim()}`;
    }

    // Dispatch real-time notifications to both Brand and Creator
    const notificationPromises = [];
    if (workspace.brand) {
        notificationPromises.push(
            createNotificationService({
                recipient: workspace.brand,
                sender: adminId || null,
                type: "collaboration_status_override",
                title: notifTitle,
                message: notifMessage,
                entityType: "workspace",
                entityId: workspace._id,
                destination: `/brand/workspace/${workspace._id}`
            }).catch((err) => console.error("Brand notification error:", err))
        );
    }

    if (workspace.creator) {
        notificationPromises.push(
            createNotificationService({
                recipient: workspace.creator,
                sender: adminId || null,
                type: "collaboration_status_override",
                title: notifTitle,
                message: notifMessage,
                entityType: "workspace",
                entityId: workspace._id,
                destination: `/creator/workspace/${workspace._id}`
            }).catch((err) => console.error("Creator notification error:", err))
        );
    }

    await Promise.all(notificationPromises);

    return workspace;
};

/**
 * Administratively extends the deadline of a collaboration.
 */
export const extendCollaborationDeadlineService = async (
    workspaceId,
    newDeadline,
    reason,
    adminId
) => {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
        throw createApiError(404, "Collaboration workspace not found");
    }

    const previousDeadline = workspace.deadline;
    const parsedDeadline = new Date(newDeadline);
    workspace.deadline = parsedDeadline;
    await workspace.save();

    if (workspace.booking) {
        await Booking.findByIdAndUpdate(workspace.booking, { deadline: parsedDeadline });
    }

    const formattedOld = previousDeadline ? new Date(previousDeadline).toLocaleDateString() : "N/A";
    const formattedNew = parsedDeadline.toLocaleDateString();

    let notifTitle = "Collaboration Deadline Extended";
    let notifMessage = `Admin extended the collaboration deadline from ${formattedOld} to ${formattedNew}.`;
    if (reason && reason.trim()) {
        notifMessage += ` Reason: ${reason.trim()}`;
    }

    // Dispatch notifications to both parties
    const notificationPromises = [];
    if (workspace.brand) {
        notificationPromises.push(
            createNotificationService({
                recipient: workspace.brand,
                sender: adminId || null,
                type: "collaboration_deadline_extended",
                title: notifTitle,
                message: notifMessage,
                entityType: "workspace",
                entityId: workspace._id,
                destination: `/brand/workspace/${workspace._id}`
            }).catch((err) => console.error("Brand deadline notification error:", err))
        );
    }

    if (workspace.creator) {
        notificationPromises.push(
            createNotificationService({
                recipient: workspace.creator,
                sender: adminId || null,
                type: "collaboration_deadline_extended",
                title: notifTitle,
                message: notifMessage,
                entityType: "workspace",
                entityId: workspace._id,
                destination: `/creator/workspace/${workspace._id}`
            }).catch((err) => console.error("Creator deadline notification error:", err))
        );
    }

    await Promise.all(notificationPromises);

    return workspace;
};

