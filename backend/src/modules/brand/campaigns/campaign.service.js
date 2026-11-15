import mongoose from "mongoose";

import Campaign from "./campaign.model.js";
import Booking from "../../booking/booking.model.js";
import Notification from "../../notifications/notification.model.js";
import Workspace from "../../workspace/workspace.model.js";
import Payment from "../../payments/payment.model.js";
import Review from "../../reviews/reviews.model.js";
import AuditLog from "../../admin/audit/audit.model.js";
import createApiError from "../../../utils/ApiError.js";
import {
    evaluateBrandEntitlement,
    validateCampaignUpdateEntitlement
} from "../../subscriptions/entitlement.service.js";

import {
    getPagination,
    getPaginationData
} from "../../../utils/pagination.js";

import createSearchQuery from "../../../utils/helpers/search.helper.js";
import {
    createNotificationService,
    createNotificationSafe,
    notifyAdminsSafe
} from "../../notifications/notification.service.js";


// Create a new campaign for the authenticated brand.
const createCampaignService = async (brandId, campaignData) => {

    // Enforce subscription entitlement: Brand must have an active trial or paid subscription
    const entitlement = await evaluateBrandEntitlement(brandId);
    if (!entitlement.canCreateCampaign) {
        throw createApiError(
            403,
            `An active subscription or free trial is required to create campaigns. ${entitlement.reason}`
        );
    }

    if (campaignData.maxBudget !== undefined && campaignData.maxBudget !== null && campaignData.maxBudget !== "") {
        campaignData.budget = Number(campaignData.maxBudget);
    } else if (campaignData.minBudget !== undefined && campaignData.minBudget !== null && campaignData.minBudget !== "") {
        campaignData.budget = Number(campaignData.minBudget);
    }

    const campaign = await Campaign.create({
        brand: brandId,
        ...campaignData
    });

    if (campaign.status === "published") {
        notifyAdminsSafe({
            sender: brandId,
            type: "campaign_created",
            title: "New Campaign Published",
            message: `A new campaign "${campaign.title}" was published.`,
            entityType: "campaign",
            entityId: campaign._id,
            destination: `/admin/campaigns?id=${campaign._id}`,
            metadata: {
                campaignId: campaign._id,
                brandId,
                title: campaign.title,
                budget: campaign.budget
            },
            idempotencyKey: `admin_campaign_created_${campaign._id}`
        });
    }

    return campaign;
};


// Get all campaigns belonging to the authenticated brand.
//
// Supports:
// - pagination
// - search by title/description/category
// - category filter
// - platform filter
// - status filter
// - sorting
const getMyCampaignsService = async (brandId, query) => {

    const {
        page = 1,
        limit = 10,
        search,
        category,
        platform,
        status,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = query;


    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);


    const filter = {
        brand: brandId
    };


    // Search campaigns by useful text fields.
    if (search && search.trim()) {

        Object.assign(
            filter,
            createSearchQuery(
                search.trim(),
                [
                    "title",
                    "description",
                    "category"
                ]
            )
        );
    }


    // Filter by category.
    if (category && category.trim()) {
        filter.category = category.trim();
    }


    // Filter by platform.
    if (platform && platform.trim()) {
        filter.platform = platform.trim().toLowerCase();
    }


    // Filter by campaign status.
    if (status && status.trim()) {
        filter.status = status.trim();
    }


    // Only allow known sortable fields.
    const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "title",
        "budget",
        "minBudget",
        "maxBudget",
        "deadline",
        "requiredCreators"
    ];


    const safeSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";


    const safeSortOrder = sortOrder === "asc"
        ? 1
        : -1;


    const sort = {
        [safeSortBy]: safeSortOrder
    };


    const [campaigns, totalItems] = await Promise.all([
        Campaign
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(itemsPerPage),

        Campaign.countDocuments(filter)
    ]);


    return {
        campaigns,
        pagination: getPaginationData(
            currentPage,
            itemsPerPage,
            totalItems
        )
    };
};


// Get one campaign belonging to the authenticated brand.
const getCampaignByIdService = async (
    brandId,
    campaignId
) => {

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        throw createApiError(
            400,
            "Invalid campaign ID"
        );
    }

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
        throw createApiError(
            404,
            "Campaign not found"
        );
    }

    if (campaign.brand.toString() !== brandId.toString()) {
        throw createApiError(
            403,
            "Access forbidden: You cannot access another brand's campaign"
        );
    }

    return campaign;
};


// Update a campaign belonging to the authenticated brand.
const updateCampaignService = async (
    brandId,
    campaignId,
    updateData
) => {

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        throw createApiError(
            400,
            "Invalid campaign ID"
        );
    }

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
        throw createApiError(
            404,
            "Campaign not found"
        );
    }

    // Business Rule 7: Brand cannot modify another Brand's campaign
    if (campaign.brand.toString() !== brandId.toString()) {
        throw createApiError(
            403,
            "Access forbidden: You cannot modify another brand's campaign"
        );
    }

    // Business Rule 3: An Admin moderation restriction must prevent the Brand from bypassing the restriction by resuming the campaign.
    if (campaign.moderation?.isRestricted) {
        throw createApiError(
            403,
            `This campaign is currently restricted by platform administration for moderation (Reason: "${campaign.moderation.restrictionReason || "Administrative review"}"). You cannot modify or resume this campaign until the restriction is resolved.`
        );
    }

    // Enforce subscription field-level entitlement checks
    await validateCampaignUpdateEntitlement(brandId, campaign, updateData);

    // Business Rule 5: Do not mark a campaign completed merely because a Brand manually changes its status.
    // Inspect deliverable approval and workspace completion before allowing transition to completed.
    if (updateData.status === "completed") {
        if (campaign.status !== "in_progress") {
            throw createApiError(
                400,
                `Campaign cannot move from ${campaign.status} to completed`
            );
        }

        const activeWorkspaces = await Workspace.countDocuments({
            campaign: campaignId,
            status: { $in: ["in_progress", "submitted", "revision_requested"] }
        });

        if (activeWorkspaces > 0) {
            throw createApiError(
                400,
                `Cannot mark campaign as completed: ${activeWorkspaces} active workspace collaboration(s) are still in progress.`
            );
        }
    }

    // Prevent invalid campaign status transitions.
    if (
        updateData.status &&
        updateData.status !== campaign.status
    ) {

        const allowedTransitions = {
            draft: [
                "published",
                "closed"
            ],

            published: [
                "paused",
                "in_progress",
                "closed"
            ],

            paused: [
                "published",
                "closed"
            ],

            in_progress: [
                "completed",
                "closed"
            ],

            completed: [],
            closed: []
        };


        const allowedNextStatuses =
            allowedTransitions[campaign.status] || [];


        if (
            !allowedNextStatuses.includes(
                updateData.status
            )
        ) {
            throw createApiError(
                400,
                `Campaign cannot move from ${campaign.status} to ${updateData.status}`
            );
        }
    }


    if (updateData.maxBudget !== undefined && updateData.maxBudget !== null && updateData.maxBudget !== "") {
        updateData.budget = Number(updateData.maxBudget);
    } else if (updateData.budget !== undefined && updateData.budget !== null && updateData.budget !== "") {
        if (updateData.maxBudget === undefined) {
            updateData.maxBudget = Number(updateData.budget);
        }
    }

    // Increment distinct pause cycle when transitioning to paused from non-paused status
    if (updateData.status === "paused" && campaign.status !== "paused") {
        updateData.pauseCycle = (campaign.pauseCycle || 0) + 1;
    }

    const updatedCampaign =
        await Campaign.findOneAndUpdate(
            {
                _id: campaignId,
                brand: brandId
            },
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        );

    if (updatedCampaign && updatedCampaign.status === "published" && campaign.status !== "published") {
        notifyAdminsSafe({
            sender: brandId,
            type: "campaign_published",
            title: "Campaign Published",
            message: `Campaign "${updatedCampaign.title}" has been published.`,
            entityType: "campaign",
            entityId: updatedCampaign._id,
            destination: `/admin/campaigns?id=${updatedCampaign._id}`,
            metadata: {
                campaignId: updatedCampaign._id,
                brandId,
                title: updatedCampaign.title,
                budget: updatedCampaign.budget
            },
            idempotencyKey: `admin_campaign_pub_${updatedCampaign._id}`
        });
    }

    // Business Rule 1: When Brand changes campaign status to paused
    // - Do not change any Booking status.
    // - Notify Creators having pending applications.
    // - Message clearly states applications are temporarily on hold.
    // - Avoid duplicate notifications on retries within the same pause cycle.
    // - Subsequent distinct pause cycles receive new notifications.
    if (updatedCampaign && updatedCampaign.status === "paused") {
        try {
            const cycle = updatedCampaign.pauseCycle || 1;
            const pendingBookings = await Booking.find({
                campaign: campaignId,
                status: "pending"
            }).select("_id creator").lean();

            if (pendingBookings.length > 0) {
                const pendingBookingIds = pendingBookings.map((b) => b._id);

                // Fetch existing pause notifications for this campaign and this distinct cycle to prevent duplicates on retry
                const existingPauseNotifs = await Notification.find({
                    idempotencyKey: { $in: pendingBookingIds.map((id) => `notif_camp_pause_${campaignId}_${id}_cycle_${cycle}`) }
                }).select("idempotencyKey").lean();

                const notifiedPauseSet = new Set();
                const cyclePrefix = `notif_camp_pause_${campaignId}_`;
                const cycleSuffix = `_cycle_${cycle}`;
                for (const notif of existingPauseNotifs) {
                    if (
                        notif.idempotencyKey &&
                        notif.idempotencyKey.startsWith(cyclePrefix) &&
                        notif.idempotencyKey.endsWith(cycleSuffix)
                    ) {
                        const bookingIdStr = notif.idempotencyKey.slice(cyclePrefix.length, -cycleSuffix.length);
                        notifiedPauseSet.add(bookingIdStr);
                    }
                }

                const bookingsToNotify = pendingBookings.filter(
                    (b) => !notifiedPauseSet.has(b._id.toString())
                );

                for (const booking of bookingsToNotify) {
                    if (booking.creator) {
                        await createNotificationSafe({
                            recipient: booking.creator,
                            sender: brandId,
                            type: "campaign:paused",
                            title: "Campaign Paused",
                            message: `Applications for campaign "${updatedCampaign.title}" are temporarily on hold.`,
                            entityType: "campaign",
                            entityId: updatedCampaign._id,
                            destination: `/creator/campaigns/${updatedCampaign._id}`,
                            metadata: {
                                campaignId: updatedCampaign._id,
                                bookingId: booking._id,
                                title: updatedCampaign.title,
                                previousStatus: campaign.status,
                                newStatus: "paused",
                                pauseCycle: cycle
                            },
                            idempotencyKey: `notif_camp_pause_${updatedCampaign._id}_${booking._id}_cycle_${cycle}`
                        });
                    }
                }
            }
        } catch (pauseError) {
            console.error("Non-fatal error handling campaign pause notifications:", pauseError?.message || pauseError);
        }
    }

    // Business Rule 2: When Brand changes campaign status to closed
    // - Find all Bookings for this campaign with status pending.
    // - Change those Booking statuses to rejected with rejectionReason: "campaign_closed".
    // - Notify each affected Creator that the campaign has been closed and their pending application is no longer active.
    // - Do not modify accepted, in_progress, completed, already rejected, or cancelled Bookings.
    // - Do not delete or modify Workspaces, Messages, Payments, or Reviews.
    if (updatedCampaign && updatedCampaign.status === "closed") {
        const isTransitionToClosed = campaign.status !== "closed";

        // Query pending bookings on transition to closed, or on retry if pending bookings remain
        const pendingBookings = await Booking.find({
            campaign: campaignId,
            status: "pending"
        }).select("_id creator").lean();

        if (pendingBookings.length > 0) {
            const pendingBookingIds = pendingBookings.map((b) => b._id);

            try {
                await Booking.updateMany(
                    {
                        _id: { $in: pendingBookingIds },
                        status: "pending"
                    },
                    {
                        $set: {
                            status: "rejected",
                            rejectionReason: "campaign_closed"
                        }
                    }
                );
            } catch (dbError) {
                // If this was an initial transition to closed, rollback campaign status to prevent orphaned state
                if (isTransitionToClosed) {
                    await Campaign.findByIdAndUpdate(campaignId, {
                        $set: { status: campaign.status }
                    });
                }
                throw createApiError(
                    500,
                    `Failed to reject pending applications for closed campaign: ${dbError?.message || "Database error"}`
                );
            }
        }

        // Identify all bookings rejected specifically by campaign closure (both newly updated and previously interrupted)
        // Historical bookings rejected individually have rejectionReason !== "campaign_closed" and are strictly excluded.
        const campaignClosedBookings = await Booking.find({
            campaign: campaignId,
            status: "rejected",
            rejectionReason: "campaign_closed"
        }).select("_id creator").lean();

        if (campaignClosedBookings.length > 0) {
            const closedIds = campaignClosedBookings.map((b) => b._id);

            // Fetch existing campaign close notifications to prevent duplicates
            const existingNotifs = await Notification.find({
                idempotencyKey: { $in: closedIds.map((id) => `notif_camp_closed_${campaignId}_${id}`) }
            }).select("idempotencyKey").lean();

            const notifiedBookingIdSet = new Set();
            for (const notif of existingNotifs) {
                if (notif.idempotencyKey && notif.idempotencyKey.startsWith(`notif_camp_closed_${campaignId}_`)) {
                    notifiedBookingIdSet.add(notif.idempotencyKey.replace(`notif_camp_closed_${campaignId}_`, ""));
                }
            }

            // Only notify creators whose close notification has not yet been sent
            const bookingsToNotify = campaignClosedBookings.filter(
                (b) => !notifiedBookingIdSet.has(b._id.toString())
            );

            // Dispatch notifications for all verified affected bookings
            if (bookingsToNotify.length > 0) {
                try {
                    for (const booking of bookingsToNotify) {
                        if (booking.creator) {
                            await createNotificationSafe({
                                recipient: booking.creator,
                                sender: brandId,
                                type: "campaign:closed",
                                title: "Campaign Closed",
                                message: `The campaign "${updatedCampaign.title}" has been closed and your pending application is no longer active.`,
                                entityType: "campaign",
                                entityId: updatedCampaign._id,
                                destination: `/creator/campaigns/${updatedCampaign._id}`,
                                metadata: {
                                    campaignId: updatedCampaign._id,
                                    bookingId: booking._id,
                                    title: updatedCampaign.title,
                                    previousBookingStatus: "pending",
                                    newBookingStatus: "rejected",
                                    rejectionReason: "campaign_closed"
                                },
                                idempotencyKey: `notif_camp_closed_${updatedCampaign._id}_${booking._id}`
                            });
                        }
                    }
                } catch (notifError) {
                    console.error("Non-fatal error dispatching campaign close notifications:", notifError?.message || notifError);
                }
            }
        }
    }

    return updatedCampaign;
};


/**
 * Secure Brand Campaign Deletion Service.
 * - Authenticated Brand can only delete their own campaigns (ownership strictly enforced).
 * - Deletion is allowed when:
 *   - No bookings exist, OR
 *   - Only pending bookings exist (safely transitioned to cancelled).
 * - Deletion is blocked when:
 *   - Any accepted, in_progress, or completed bookings exist.
 *   - Any linked workspaces exist (including completed/cancelled historical workspaces).
 *   - Any payment or review records exist.
 * - Deletion is a genuine hard delete from MongoDB.
 * - Deterministic idempotency keys prevent duplicate notifications on retry.
 * - Failure recovery prevents false success responses.
 * - AuditLog records the brand actor.
 */
const deleteBrandCampaignService = async (brandId, campaignId, reason = "") => {
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        throw createApiError(400, "Invalid campaign ID");
    }

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
        // Recovery & Idempotency: Check if this campaign was already safely deleted
        const priorAuditLog = await AuditLog.findOne({
            targetType: "campaign",
            targetId: campaignId,
            action: { $in: ["BRAND_CAMPAIGN_DELETE", "CAMPAIGN_SAFE_DELETE"] }
        });

        const priorNotifications = await Notification.find({
            entityId: campaignId,
            type: "campaign_deleted"
        }).lean();

        const cancelledBookings = await Booking.find({
            campaign: campaignId,
            status: "cancelled",
            rejectionReason: "campaign_deleted"
        }).select("_id creator brand rejectionReason").lean();

        const wasDeleted = !!(priorAuditLog || priorNotifications.length > 0 || cancelledBookings.length > 0);

        if (!wasDeleted) {
            throw createApiError(404, "Campaign not found");
        }

        // Verify ownership on recovery from prior records
        const recordedBrandId = priorAuditLog?.metadata?.actorId ||
            priorAuditLog?.previousState?.brand ||
            cancelledBookings[0]?.brand ||
            priorNotifications.find((n) => n.idempotencyKey?.includes("_brand"))?.recipient ||
            null;

        if (recordedBrandId && recordedBrandId.toString() !== brandId.toString()) {
            throw createApiError(403, "Access forbidden: You cannot delete another brand's campaign");
        }

        const campaignTitle = priorAuditLog?.previousState?.title ||
            priorNotifications.find((n) => n.metadata?.title)?.metadata?.title ||
            "Campaign";

        const recoveryErrors = [];

        // 1. Recover any missing Creator notifications
        for (const booking of cancelledBookings) {
            if (booking.creator) {
                const creatorKey = `notif_brand_camp_del_${campaignId}_${booking._id}`;
                const exists = await Notification.findOne({ idempotencyKey: creatorKey });
                if (!exists) {
                    try {
                        const notif = await createNotificationService({
                            recipient: booking.creator,
                            sender: brandId,
                            type: "campaign_deleted",
                            title: "Campaign Deleted by Brand",
                            message: `The campaign "${campaignTitle}" was deleted by the brand and your pending application has been cancelled.${reason ? ` Reason: ${reason.trim()}` : ""}`,
                            entityType: "campaign",
                            entityId: campaignId,
                            destination: `/creator/campaigns/applied`,
                            metadata: {
                                campaignId,
                                bookingId: booking._id,
                                title: campaignTitle,
                                status: "cancelled",
                                reason: reason ? reason.trim() : ""
                            },
                            idempotencyKey: creatorKey
                        });
                        if (!notif) recoveryErrors.push(`Failed to dispatch creator notification for booking ${booking._id}`);
                    } catch (err) {
                        recoveryErrors.push(`Creator notification error for booking ${booking._id}: ${err.message}`);
                    }
                }
            }
        }

        // 2. Recover any missing Brand notification
        const brandKey = `notif_brand_camp_del_${campaignId}_brand`;
        const brandNotifExists = await Notification.findOne({ idempotencyKey: brandKey });
        if (!brandNotifExists) {
            try {
                const notif = await createNotificationService({
                    recipient: brandId,
                    sender: brandId,
                    type: "campaign_deleted",
                    title: "Campaign Deleted",
                    message: `Your campaign "${campaignTitle}" was permanently deleted.${reason ? ` Reason: ${reason.trim()}` : ""}`,
                    entityType: "campaign",
                    entityId: campaignId,
                    destination: `/brand/campaigns`,
                    metadata: {
                        campaignId,
                        title: campaignTitle,
                        deleted: true,
                        reason: reason ? reason.trim() : ""
                    },
                    idempotencyKey: brandKey
                });
                if (!notif) recoveryErrors.push("Failed to dispatch brand notification");
            } catch (err) {
                recoveryErrors.push(`Brand notification error: ${err.message}`);
            }
        }

        // 3. Recover any missing AuditLog entry
        if (!priorAuditLog) {
            try {
                await AuditLog.create({
                    admin: brandId,
                    action: "BRAND_CAMPAIGN_DELETE",
                    targetType: "campaign",
                    targetId: campaignId,
                    reason: reason ? reason.trim() : "Campaign deleted by brand owner",
                    previousState: { title: campaignTitle, brand: brandId },
                    newState: { deleted: true },
                    metadata: { actorRole: "brand", actorId: brandId }
                });
            } catch (err) {
                recoveryErrors.push(`AuditLog creation error: ${err.message}`);
            }
        }

        if (recoveryErrors.length > 0) {
            throw createApiError(
                500,
                `Campaign was deleted, but recovery operations encountered errors: ${recoveryErrors.join("; ")}. Please retry.`
            );
        }

        return {
            campaignId,
            message: "Campaign was already safely removed and all recovery operations completed"
        };
    }

    // Ownership validation: Authenticated brand must own this campaign
    if (campaign.brand.toString() !== brandId.toString()) {
        throw createApiError(403, "Access forbidden: You cannot delete another brand's campaign");
    }

    const campaignTitle = campaign.title;
    const session = await mongoose.startSession();
    let pendingBookingsToNotify = [];

    try {
        await session.withTransaction(async () => {
            // 1. Lock campaign document atomically and set status to "closed"
            const lockedCampaign = await Campaign.findOneAndUpdate(
                {
                    _id: campaignId,
                    brand: brandId
                },
                {
                    $set: { status: "closed" },
                    $inc: { __v: 1 }
                },
                { session, new: true }
            );

            if (!lockedCampaign) {
                throw createApiError(404, "Campaign not found or has already been modified");
            }

            // 2. Block deletion if any Booking is accepted, in_progress, or completed
            const activeCollaborations = await Booking.countDocuments({
                campaign: campaignId,
                status: { $in: ["accepted", "in_progress", "completed"] }
            }).session(session);

            if (activeCollaborations > 0) {
                throw createApiError(
                    400,
                    `Cannot remove campaign: ${activeCollaborations} accepted collaboration(s) or completed bookings are linked to this campaign. Please close the campaign instead to preserve financial and contract history.`
                );
            }

            // 3. Block deletion if ANY Workspace exists for the campaign (including historical cancelled/completed)
            const workspaceCount = await Workspace.countDocuments({
                campaign: campaignId
            }).session(session);

            if (workspaceCount > 0) {
                throw createApiError(
                    400,
                    `Cannot remove campaign: ${workspaceCount} workspace(s) are linked to this campaign. Please close the campaign instead to preserve collaboration history.`
                );
            }

            // 4. Block deletion if related Payment records exist
            const paymentCount = await Payment.countDocuments({
                campaign: campaignId
            }).session(session);

            if (paymentCount > 0) {
                throw createApiError(
                    400,
                    `Cannot remove campaign: ${paymentCount} payment record(s) are linked to this campaign. Please close the campaign instead to preserve financial history.`
                );
            }

            // 5. Block deletion if related Review records exist
            const reviewCount = await Review.countDocuments({
                campaign: campaignId
            }).session(session);

            if (reviewCount > 0) {
                throw createApiError(
                    400,
                    `Cannot remove campaign: ${reviewCount} review record(s) are linked to this campaign. Please close the campaign instead to preserve review history.`
                );
            }

            // 6. Find open pending Bookings and transition them to cancelled with reason inside transaction
            await Booking.updateMany(
                {
                    campaign: campaignId,
                    status: "pending"
                },
                {
                    $set: {
                        status: "cancelled",
                        rejectionReason: "campaign_deleted"
                    }
                },
                { session }
            );

            // Fetch affected bookings for deterministic post-commit notifications
            pendingBookingsToNotify = await Booking.find({
                campaign: campaignId,
                status: "cancelled",
                rejectionReason: "campaign_deleted"
            }).select("_id creator brand").session(session).lean();

            // 7. Permanently delete the campaign document from MongoDB (Hard Delete)
            try {
                await Campaign.findByIdAndDelete(campaignId, { session });
            } catch (deleteError) {
                if (deleteError?.statusCode) {
                    throw deleteError;
                }
                throw createApiError(
                    500,
                    `Failed to permanently delete campaign: ${deleteError?.message || "Database error"}`
                );
            }
        });
    } finally {
        await session.endSession();
    }

    const postDeletionErrors = [];

    // 8. Post-deletion: Notify every affected Creator using deterministic idempotency keys
    for (const booking of pendingBookingsToNotify) {
        if (booking.creator) {
            try {
                const notif = await createNotificationService({
                    recipient: booking.creator,
                    sender: brandId,
                    type: "campaign_deleted",
                    title: "Campaign Deleted by Brand",
                    message: `The campaign "${campaignTitle}" was deleted by the brand and your pending application has been cancelled.${reason ? ` Reason: ${reason.trim()}` : ""}`,
                    entityType: "campaign",
                    entityId: campaignId,
                    destination: `/creator/campaigns/applied`,
                    metadata: {
                        campaignId,
                        bookingId: booking._id,
                        title: campaignTitle,
                        status: "cancelled",
                        reason: reason ? reason.trim() : ""
                    },
                    idempotencyKey: `notif_brand_camp_del_${campaignId}_${booking._id}`
                });
                if (!notif) postDeletionErrors.push(`Failed to dispatch creator notification for booking ${booking._id}`);
            } catch (err) {
                postDeletionErrors.push(`Creator notification error for booking ${booking._id}: ${err.message}`);
            }
        }
    }

    // 8. Post-deletion: Notify the Brand using deterministic idempotency key
    try {
        const notif = await createNotificationService({
            recipient: brandId,
            sender: brandId,
            type: "campaign_deleted",
            title: "Campaign Deleted",
            message: `Your campaign "${campaignTitle}" was permanently deleted.${reason ? ` Reason: ${reason.trim()}` : ""}`,
            entityType: "campaign",
            entityId: campaignId,
            destination: `/brand/campaigns`,
            metadata: {
                campaignId,
                title: campaignTitle,
                deleted: true,
                reason: reason ? reason.trim() : ""
            },
            idempotencyKey: `notif_brand_camp_del_${campaignId}_brand`
        });
        if (!notif) postDeletionErrors.push("Failed to dispatch brand notification");
    } catch (err) {
        postDeletionErrors.push(`Brand notification error: ${err.message}`);
    }

    // 9. Post-deletion: Create Platform Audit Log identifying Brand actor
    try {
        await AuditLog.create({
            admin: brandId,
            action: "BRAND_CAMPAIGN_DELETE",
            targetType: "campaign",
            targetId: campaignId,
            reason: reason ? reason.trim() : "Campaign deleted by brand owner",
            previousState: { title: campaignTitle, status: campaign.status, brand: brandId },
            newState: { deleted: true },
            metadata: { actorRole: "brand", actorId: brandId }
        });
    } catch (err) {
        postDeletionErrors.push(`AuditLog creation error: ${err.message}`);
    }

    // If any post-deletion operation failed, throw error to prompt retry and avoid reporting false success
    if (postDeletionErrors.length > 0) {
        throw createApiError(
            500,
            `Campaign was safely deleted from database, but post-deletion operations failed: ${postDeletionErrors.join("; ")}. Please retry the request to complete recovery.`
        );
    }

    return {
        campaignId,
        message: `Campaign "${campaignTitle}" safely removed`
    };
};


export {
    createCampaignService,
    getMyCampaignsService,
    getCampaignByIdService,
    updateCampaignService,
    deleteBrandCampaignService
};
