import mongoose from "mongoose";

import Workspace from "./workspace.model.js";
import Conversation from "../messages/conversation.model.js";
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

    let workspace = await Workspace.findOne({
        booking: booking._id
    });

    if (!workspace) {
        let campaignBrief = "";
        if (booking.campaign) {
            if (typeof booking.campaign === "object" && booking.campaign.description) {
                campaignBrief = booking.campaign.description;
            } else if (mongoose.Types.ObjectId.isValid(booking.campaign)) {
                const campaignDoc = await mongoose.model("Campaign")
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
    }

    // Ensure a conversation document is initialized for this accepted booking
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

    return workspace;
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

    return {
        workspaces,
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

    return workspace;
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

    const {
        status,
        action,
        feedback
    } = reviewData;

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
    getCreatorWorkspacesService,
    getCreatorWorkspaceByIdService,
    submitCreatorWorkspaceWorkService,
    submitCreatorWorkspaceDeliverableService,
    getBrandWorkspacesService,
    getBrandWorkspaceByIdService,
    reviewBrandWorkspaceService,
    reviewBrandWorkspaceDeliverableService
};