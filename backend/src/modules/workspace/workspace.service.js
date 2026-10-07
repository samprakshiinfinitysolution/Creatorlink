import mongoose from "mongoose";

import Workspace from "./workspace.model.js";
import createApiError from "../../utils/ApiError.js";
import {
    getPagination,
    getPaginationData
} from "../../utils/pagination.js";

// Helper function to create or retrieve workspace when booking is accepted.
const createWorkspaceForAcceptedBooking = async (booking) => {
    if (!booking || !booking._id) return null;

    let workspace = await Workspace.findOne({
        booking: booking._id
    });

    if (!workspace) {
        workspace = await Workspace.create({
            booking: booking._id,
            campaign: booking.campaign,
            brand: booking.brand,
            creator: booking.creator,
            service: booking.service,
            agreedPrice: booking.agreedPrice,
            currency: booking.currency || "INR",
            deliverables: booking.deliverables || [],
            deadline: booking.deadline,
            status: "in_progress"
        });
    }

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

// Submits work for a workspace by creator.
const submitCreatorWorkspaceWorkService = async (
    creatorId,
    workspaceId,
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

    const {
        title = "",
        link = "",
        fileUrl = "",
        notes = ""
    } = submissionData;

    workspace.submissions.push({
        title: title ? title.trim() : "",
        link: link ? link.trim() : "",
        fileUrl: fileUrl ? fileUrl.trim() : "",
        notes: notes ? notes.trim() : "",
        submittedAt: new Date()
    });

    workspace.status = "submitted";

    await workspace.save();

    return await Workspace.findById(workspace._id)
        .populate("brand", "name email")
        .populate("campaign")
        .populate("service")
        .populate("booking");
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

// Reviews workspace by brand.
const reviewBrandWorkspaceService = async (
    brandId,
    workspaceId,
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
        workspace.status = "completed";
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

        workspace.status = "revision_requested";

        workspace.revisions.push({
            feedback: feedback.trim(),
            requestedAt: new Date()
        });
    } else {
        throw createApiError(
            400,
            "Invalid review action"
        );
    }

    await workspace.save();

    return await Workspace.findById(workspace._id)
        .populate("creator", "name email")
        .populate("campaign")
        .populate("service")
        .populate("booking");
};

export {
    createWorkspaceForAcceptedBooking,
    getCreatorWorkspacesService,
    getCreatorWorkspaceByIdService,
    submitCreatorWorkspaceWorkService,
    getBrandWorkspacesService,
    getBrandWorkspaceByIdService,
    reviewBrandWorkspaceService
};