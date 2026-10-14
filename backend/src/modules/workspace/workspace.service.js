import mongoose from "mongoose";

import Workspace from "./workspace.model.js";
import Review from "../reviews/reviews.model.js";
import Conversation from "../messages/conversation.model.js";
import Campaign from "../brand/campaigns/campaign.model.js";
import { createNotificationSafe } from "../notifications/notification.service.js";
import createApiError from "../../utils/ApiError.js";
import {
    getPagination,
    getPaginationData
} from "../../utils/pagination.js";

// Helper function to convert raw string/object deliverables into structured deliverable objects.
const parseDeliverablesToObjects = (rawDeliverables = [], deadline = null) => {
    if (!Array.isArray(rawDeliverables) || rawDeliverables.length === 0) {
        return [];
    }

    const structuredDeliverables = [];

    for (const item of rawDeliverables) {
        if (!item) continue;

        if (typeof item === "object" && item.title) {
            structuredDeliverables.push({
                title: item.title.trim(),
                description: item.description ? item.description.trim() : "",
                dueDate: item.dueDate || deadline || null,
                status: item.status || "pending"
            });
            continue;
        }

        if (typeof item === "string") {
            const trimmed = item.trim();
            if (!trimmed) continue;

            const match = trimmed.match(/^(\d+)\s+(.+)$/);
            if (match) {
                const count = parseInt(match[1], 10);
                const rawName = match[2].trim();

                let baseName = rawName;
                if (/\b[a-zA-Z]+ies$/i.test(rawName)) {
                    baseName = rawName.replace(/([a-zA-Z]+)ies$/i, "$1y");
                } else if (/\b[a-zA-Z]{2,}s$/i.test(rawName) && !/\b[a-zA-Z]+ss$/i.test(rawName)) {
                    baseName = rawName.slice(0, -1);
                }

                for (let i = 1; i <= count; i++) {
                    structuredDeliverables.push({
                        title: `${baseName} #${i}`,
                        description: "",
                        dueDate: deadline || null,
                        status: "pending"
                    });
                }
            } else {
                structuredDeliverables.push({
                    title: `${trimmed} #1`,
                    description: "",
                    dueDate: deadline || null,
                    status: "pending"
                });
            }
        }
    }

    return structuredDeliverables;
};

// Helper function to create or retrieve workspace when booking is accepted.
const createWorkspaceForAcceptedBooking = async (booking) => {
    if (!booking || !booking._id) return null;

    // Guard: Do not initialize workspace if the booking was already rejected or cancelled
    const currentBooking = await mongoose.model("Booking").findById(booking._id).select("status");
    if (currentBooking && (currentBooking.status === "rejected" || currentBooking.status === "cancelled")) {
        throw createApiError(400, `Cannot initialize workspace for booking with status '${currentBooking.status}'`);
    }

    let workspace = await Workspace.findOne({
        booking: booking._id
    });

    if (!workspace) {
        let campaignBrief = "";
        if (booking.campaign) {
            if (typeof booking.campaign === "object" && booking.campaign.description) {
                campaignBrief = booking.campaign.description;
            } else if (mongoose.Types.ObjectId.isValid(booking.campaign)) {
                const campaignDoc = await Campaign
                    .findById(booking.campaign)
                    .select("description");
                if (campaignDoc && campaignDoc.description) {
                    campaignBrief = campaignDoc.description;
                }
            }
        }

        const structuredDeliverables = parseDeliverablesToObjects(
            booking.deliverables,
            booking.deadline
        );

        try {
            workspace = await Workspace.create({
                booking: booking._id,
                campaign: booking.campaign,
                brand: booking.brand,
                creator: booking.creator,
                service: booking.service,
                agreedPrice: booking.agreedPrice,
                currency: booking.currency || "INR",
                brief: campaignBrief,
                deliverables: structuredDeliverables,
                deadline: booking.deadline,
                status: "in_progress"
            });
        } catch (createErr) {
            if (createErr?.code === 11000) {
                workspace = await Workspace.findOne({
                    booking: booking._id
                });
            }
            if (!workspace) {
                throw createErr;
            }
        }
    }

    // Ensure a conversation document is initialized for this accepted booking
    try {
        await Conversation.findOneAndUpdate(
            { booking: booking._id },
            {
                $setOnInsert: {
                    participants: [booking.brand, booking.creator],
                    booking: booking._id,
                    campaign: booking.campaign,
                    lastMessage: "",
                    lastMessageAt: new Date()
                }
            },
            { upsert: true, new: true }
        );
    } catch (convErr) {
        if (convErr?.code === 11000) {
            const existingConv = await Conversation.findOne({ booking: booking._id });
            if (!existingConv) {
                throw convErr;
            }
        } else {
            throw convErr;
        }
    }

    return workspace;
};

// Safely cleans up workspace and conversation records for a booking that is not accepted (e.g. rejected or cancelled).
const cleanupWorkspaceForBooking = async (bookingId) => {
    if (!bookingId) return;

    // Strict guard: Only clean up collaboration records if the booking is currently in a terminal non-accepted state (rejected or cancelled)
    const booking = await mongoose.model("Booking").findOne({
        _id: bookingId,
        status: { $in: ["rejected", "cancelled"] }
    }).select("status");

    if (!booking) {
        return;
    }

    await Workspace.deleteMany({ booking: bookingId });
    await Conversation.deleteMany({ booking: bookingId });
};

// Gets workspaces belonging to creator.
const getCreatorWorkspacesService = async (creatorId, query = {}) => {
    const {
        page = 1,
        limit = 10,
        status
    } = query;

    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);

    const filter = {
        creator: creatorId
    };

    if (status && status.trim()) {
        filter.status = status.trim();
    }

    const [workspaces, totalItems] = await Promise.all([
        Workspace.find(filter)
            .populate("brand", "name email")
            .populate(
                "campaign",
                "title category budget deadline platform"
            )
            .populate(
                "service",
                "title price deliveryTime"
            )
            .populate("booking")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),

        Workspace.countDocuments(filter)
    ]);

    return {
        workspaces,
        pagination: getPaginationData(
            currentPage,
            itemsPerPage,
            totalItems
        )
    };
};

// Gets single workspace by ID or booking ID for creator.
const getCreatorWorkspaceByIdService = async (
    creatorId,
    workspaceId
) => {
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        throw createApiError(
            400,
            "Invalid workspace ID"
        );
    }

    const workspace = await Workspace.findOne({
        creator: creatorId,
        $or: [
            { _id: workspaceId },
            { booking: workspaceId }
        ]
    })
        .populate("brand", "name email")
        .populate("campaign")
        .populate("service")
        .populate("booking");

    if (!workspace) {
        throw createApiError(
            404,
            "Workspace not found"
        );
    }

    return workspace;
};

// Helper function to evaluate workspace completion status based on deliverable statuses
const checkAndUpdateWorkspaceCompletion = (workspace) => {
    if (!workspace || !Array.isArray(workspace.deliverables) || workspace.deliverables.length === 0) {
        return;
    }

    if (workspace.status === "cancelled") {
        return;
    }

    const allFinished = workspace.deliverables.every(
        (d) => d.status === "approved" || d.status === "completed"
    );

    if (allFinished) {
        workspace.status = "completed";
        return;
    }

    const hasRevision = workspace.deliverables.some(
        (d) => d.status === "revision_requested"
    );

    if (hasRevision) {
        workspace.status = "revision_requested";
        return;
    }

    const hasSubmitted = workspace.deliverables.some(
        (d) => d.status === "submitted"
    );

    if (hasSubmitted) {
        workspace.status = "submitted";
        return;
    }

    workspace.status = "in_progress";
};

// Submits work for a specific deliverable in a workspace by creator.
const submitCreatorWorkspaceDeliverableService = async (
    creatorId,
    workspaceId,
    deliverableId,
    submissionData = {}
) => {
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        throw createApiError(
            400,
            "Invalid workspace ID"
        );
    }

    const workspace = await Workspace.findOne({
        creator: creatorId,
        $or: [
            { _id: workspaceId },
            { booking: workspaceId }
        ]
    });

    if (!workspace) {
        throw createApiError(
            404,
            "Workspace not found"
        );
    }

    if (
        workspace.status === "completed" ||
        workspace.status === "cancelled"
    ) {
        throw createApiError(
            400,
            `Cannot submit work for a workspace that is already '${workspace.status}'`
        );
    }

    let deliverable = null;
    if (deliverableId && mongoose.Types.ObjectId.isValid(deliverableId)) {
        deliverable = workspace.deliverables.id(deliverableId);
    }

    if (deliverableId && !deliverable) {
        throw createApiError(
            404,
            "Deliverable not found in workspace"
        );
    }

    if (!deliverable && workspace.deliverables.length > 0) {
        deliverable = workspace.deliverables.find(
            (d) => d.status !== "approved" && d.status !== "completed"
        );
    }

    if (!deliverable) {
        throw createApiError(
            400,
            "No submitable deliverable found in workspace"
        );
    }

    if (
        deliverable.status === "approved" ||
        deliverable.status === "completed"
    ) {
        throw createApiError(
            400,
            "Cannot submit for a deliverable that is already approved or completed"
        );
    }

    const {
        title = "",
        link = "",
        fileUrl = "",
        notes = ""
    } = submissionData;

    const submittedAtDate = new Date();
    const subObj = {
        title: title ? title.trim() : deliverable.title,
        link: link ? link.trim() : "",
        fileUrl: fileUrl ? fileUrl.trim() : "",
        notes: notes ? notes.trim() : "",
        submittedAt: submittedAtDate
    };

    deliverable.submission = subObj;
    deliverable.submittedAt = submittedAtDate;
    deliverable.status = "submitted";

    // Preserved top-level submissions array for backward compatibility
    workspace.submissions.push(subObj);

    checkAndUpdateWorkspaceCompletion(workspace);

    await workspace.save();

    const currentSubmission = workspace.submissions[workspace.submissions.length - 1];
    const submissionId = currentSubmission?._id || deliverable.submission?._id || submittedAtDate.getTime();

    await createNotificationSafe({
        recipient: workspace.brand,
        sender: creatorId,
        type: "workspace:deliverable_submitted",
        title: "Deliverable Submitted",
        message: `Creator submitted work for deliverable "${deliverable.title || 'Deliverable'}".`,
        entityType: "workspace",
        entityId: workspace._id,
        destination: `/brand/workspace/${workspace._id}`,
        metadata: {
            workspaceId: workspace._id,
            deliverableId: deliverable._id,
            deliverableTitle: deliverable.title,
            submissionLink: subObj.link || ""
        },
        idempotencyKey: `workspace:deliverable_submitted:${workspace._id}:${deliverable._id}:${submissionId}`
    });

    return await Workspace.findById(workspace._id)
        .populate("brand", "name email")
        .populate("campaign")
        .populate("service")
        .populate("booking");
};

// Submits work for a workspace by creator (legacy wrapper / fallback).
const submitCreatorWorkspaceWorkService = async (
    creatorId,
    workspaceId,
    submissionData = {}
) => {
    const deliverableId = submissionData.deliverableId || null;
    return await submitCreatorWorkspaceDeliverableService(
        creatorId,
        workspaceId,
        deliverableId,
        submissionData
    );
};

// Gets workspaces belonging to brand.
const getBrandWorkspacesService = async (
    brandId,
    query = {}
) => {
    const {
        page = 1,
        limit = 10,
        status
    } = query;

    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);

    const filter = {
        brand: brandId
    };

    if (status && status.trim()) {
        filter.status = status.trim();
    }

    const [workspaces, totalItems] = await Promise.all([
        Workspace.find(filter)
            .populate("creator", "name email")
            .populate(
                "campaign",
                "title category budget deadline platform"
            )
            .populate(
                "service",
                "title price deliveryTime"
            )
            .populate("booking")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),

        Workspace.countDocuments(filter)
    ]);

    // Lookup reviews submitted by this brand for any returned completed workspaces
    const completedWorkspaceIds = workspaces
        .filter((w) => w.status === "completed")
        .map((w) => w._id);

    const reviewMap = new Map();
    if (completedWorkspaceIds.length > 0) {
        const reviews = await Review.find({
            workspace: { $in: completedWorkspaceIds },
            reviewer: brandId
        }).select("_id workspace rating comment createdAt");

        reviews.forEach((r) => {
            const wsKey = r.workspace ? r.workspace.toString() : null;
            if (wsKey) {
                reviewMap.set(wsKey, {
                    _id: r._id,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.createdAt
                });
            }
        });
    }

    const workspacesWithReviews = workspaces.map((w) => {
        const wsObj = w.toObject ? w.toObject() : { ...w };
        wsObj.review = reviewMap.get(w._id.toString()) || null;
        return wsObj;
    });

    return {
        workspaces: workspacesWithReviews,
        pagination: getPaginationData(
            currentPage,
            itemsPerPage,
            totalItems
        )
    };
};

// Gets single workspace by ID or booking ID for brand.
const getBrandWorkspaceByIdService = async (
    brandId,
    workspaceId
) => {
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        throw createApiError(
            400,
            "Invalid workspace ID"
        );
    }

    const workspace = await Workspace.findOne({
        brand: brandId,
        $or: [
            { _id: workspaceId },
            { booking: workspaceId }
        ]
    })
        .populate("creator", "name email")
        .populate("campaign")
        .populate("service")
        .populate("booking");

    if (!workspace) {
        throw createApiError(
            404,
            "Workspace not found"
        );
    }

    const wsObj = workspace.toObject ? workspace.toObject() : { ...workspace };
    if (wsObj.status === "completed") {
        const review = await Review.findOne({
            workspace: wsObj._id,
            reviewer: brandId
        }).select("_id workspace rating comment createdAt");

        wsObj.review = review
            ? {
                _id: review._id,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }
            : null;
    } else {
        wsObj.review = null;
    }

    return wsObj;
};

// Reviews a specific deliverable in workspace by brand.
const reviewBrandWorkspaceDeliverableService = async (
    brandId,
    workspaceId,
    deliverableId,
    reviewData = {}
) => {
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        throw createApiError(
            400,
            "Invalid workspace ID"
        );
    }

    const workspace = await Workspace.findOne({
        brand: brandId,
        $or: [
            { _id: workspaceId },
            { booking: workspaceId }
        ]
    });

    if (!workspace) {
        throw createApiError(
            404,
            "Workspace not found"
        );
    }

    let deliverable = null;
    if (deliverableId && mongoose.Types.ObjectId.isValid(deliverableId)) {
        deliverable = workspace.deliverables.id(deliverableId);
    }

    if (deliverableId && !deliverable) {
        throw createApiError(
            404,
            "Deliverable not found in workspace"
        );
    }

    if (!deliverable && workspace.deliverables.length > 0) {
        deliverable = workspace.deliverables.find(
            (d) => d.status === "submitted"
        );
    }

    if (!deliverable) {
        throw createApiError(
            400,
            "No deliverable found for review"
        );
    }

    if (deliverable.status !== "submitted") {
        throw createApiError(
            400,
            `Cannot review deliverable with status '${deliverable.status}'. Only submitted deliverables can be reviewed.`
        );
    }

    const {
        status,
        action,
        feedback
    } = reviewData;

    const previousWorkspaceStatus = workspace.status;

    const targetAction = String(
        status || action
    ).toLowerCase();

    if (
        targetAction === "completed" ||
        targetAction === "approve"
    ) {
        deliverable.status = "approved";
        deliverable.approvedAt = new Date();
    } else if (
        targetAction === "revision_requested" ||
        targetAction === "revision"
    ) {
        if (
            !feedback ||
            !feedback.trim()
        ) {
            throw createApiError(
                400,
                "Feedback is required when requesting a revision"
            );
        }

        deliverable.status = "revision_requested";

        // Preserved top-level revisions array for backward compatibility
        workspace.revisions.push({
            feedback: `[${deliverable.title}] ${feedback.trim()}`,
            requestedAt: new Date()
        });
    } else {
        throw createApiError(
            400,
            "Invalid review action"
        );
    }

    checkAndUpdateWorkspaceCompletion(workspace);

    await workspace.save();

    if (targetAction === "completed" || targetAction === "approve") {
        await createNotificationSafe({
            recipient: workspace.creator,
            sender: brandId,
            type: "workspace:deliverable_approved",
            title: "Deliverable Approved",
            message: `Your deliverable "${deliverable.title || 'Deliverable'}" has been approved!`,
            entityType: "workspace",
            entityId: workspace._id,
            destination: `/creator/workspace/${workspace._id}`,
            metadata: {
                workspaceId: workspace._id,
                deliverableId: deliverable._id,
                deliverableTitle: deliverable.title
            },
            idempotencyKey: `workspace:deliverable_approved:${workspace._id}:${deliverable._id}`
        });

        if (previousWorkspaceStatus !== "completed" && workspace.status === "completed") {
            await createNotificationSafe({
                recipient: workspace.creator,
                sender: brandId,
                type: "workspace:completed",
                title: "Workspace Completed!",
                message: "All deliverables have been approved! The collaboration is complete.",
                entityType: "workspace",
                entityId: workspace._id,
                destination: `/creator/workspace/${workspace._id}`,
                metadata: {
                    workspaceId: workspace._id
                },
                idempotencyKey: `workspace:completed:creator:${workspace._id}`
            });

            await createNotificationSafe({
                recipient: workspace.brand,
                sender: null,
                type: "workspace:completed",
                title: "Collaboration Completed",
                message: "All deliverables are approved. Collaboration is complete; you can proceed to payment.",
                entityType: "workspace",
                entityId: workspace._id,
                destination: `/brand/workspace/${workspace._id}`,
                metadata: {
                    workspaceId: workspace._id
                },
                idempotencyKey: `workspace:completed:brand:${workspace._id}`
            });
        }
    } else if (targetAction === "revision_requested" || targetAction === "revision") {
        const lastRevision = workspace.revisions[workspace.revisions.length - 1];
        const revisionId = lastRevision?._id || Date.now();

        await createNotificationSafe({
            recipient: workspace.creator,
            sender: brandId,
            type: "workspace:revision_requested",
            title: "Revision Requested",
            message: `Brand requested revisions for "${deliverable.title || 'Deliverable'}": "${feedback ? feedback.trim().slice(0, 100) : ''}"`,
            entityType: "workspace",
            entityId: workspace._id,
            destination: `/creator/workspace/${workspace._id}`,
            metadata: {
                workspaceId: workspace._id,
                deliverableId: deliverable._id,
                deliverableTitle: deliverable.title,
                feedback: feedback ? feedback.trim() : ""
            },
            idempotencyKey: `workspace:revision_requested:${workspace._id}:${deliverable._id}:${revisionId}`
        });
    }

    return await Workspace.findById(workspace._id)
        .populate("creator", "name email")
        .populate("campaign")
        .populate("service")
        .populate("booking");
};

// Reviews workspace by brand (legacy wrapper / fallback).
const reviewBrandWorkspaceService = async (
    brandId,
    workspaceId,
    reviewData = {}
) => {
    const deliverableId = reviewData.deliverableId || null;
    return await reviewBrandWorkspaceDeliverableService(
        brandId,
        workspaceId,
        deliverableId,
        reviewData
    );
};

export {
    parseDeliverablesToObjects,
    createWorkspaceForAcceptedBooking,
    cleanupWorkspaceForBooking,
    getCreatorWorkspacesService,
    getCreatorWorkspaceByIdService,
    submitCreatorWorkspaceWorkService,
    submitCreatorWorkspaceDeliverableService,
    getBrandWorkspacesService,
    getBrandWorkspaceByIdService,
    reviewBrandWorkspaceService,
    reviewBrandWorkspaceDeliverableService
};