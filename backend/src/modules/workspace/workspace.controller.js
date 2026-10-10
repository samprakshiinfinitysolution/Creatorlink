import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";

import {
    getCreatorWorkspacesService,
    getCreatorWorkspaceByIdService,
    submitCreatorWorkspaceWorkService,
    submitCreatorWorkspaceDeliverableService,
    getBrandWorkspacesService,
    getBrandWorkspaceByIdService,
    reviewBrandWorkspaceService,
    reviewBrandWorkspaceDeliverableService
} from "./workspace.service.js";

// =========================================================
// CREATOR CONTROLLERS
// =========================================================

// Creator views list of their workspaces.
const getCreatorWorkspaces = asyncHandler(async (req, res) => {
    const result = await getCreatorWorkspacesService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Workspaces fetched successfully",
        result
    );
});

// Creator views single workspace detail.
const getCreatorWorkspaceById = asyncHandler(async (req, res) => {
    const workspace = await getCreatorWorkspaceByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Workspace fetched successfully",
        workspace
    );
});

// Creator submits work / deliverables for workspace (legacy / wrapper).
const submitCreatorWorkspaceWork = asyncHandler(async (req, res) => {
    const workspace = await submitCreatorWorkspaceWorkService(
        req.user.userId,
        req.params.id,
        req.body
    );

    return sendResponse(
        res,
        200,
        "Work submitted successfully",
        workspace
    );
});

// Creator submits work for a specific deliverable.
const submitCreatorWorkspaceDeliverable = asyncHandler(async (req, res) => {
    const workspaceId = req.params.id;
    const deliverableId = req.params.deliverableId || req.body.deliverableId;

    const workspace = await submitCreatorWorkspaceDeliverableService(
        req.user.userId,
        workspaceId,
        deliverableId,
        req.body
    );

    return sendResponse(
        res,
        200,
        "Deliverable work submitted successfully",
        workspace
    );
});

// =========================================================
// BRAND CONTROLLERS
// =========================================================

// Brand views list of their workspaces.
const getBrandWorkspaces = asyncHandler(async (req, res) => {
    const result = await getBrandWorkspacesService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Workspaces fetched successfully",
        result
    );
});

// Brand views single workspace detail.
const getBrandWorkspaceById = asyncHandler(async (req, res) => {
    const workspace = await getBrandWorkspaceByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Workspace fetched successfully",
        workspace
    );
});

// Brand reviews workspace submission (approve or request revision) (legacy / wrapper).
const reviewBrandWorkspace = asyncHandler(async (req, res) => {
    const workspace = await reviewBrandWorkspaceService(
        req.user.userId,
        req.params.id,
        req.body
    );

    return sendResponse(
        res,
        200,
        "Workspace review updated successfully",
        workspace
    );
});

// Brand reviews a specific deliverable in a workspace.
const reviewBrandWorkspaceDeliverable = asyncHandler(async (req, res) => {
    const workspaceId = req.params.id;
    const deliverableId = req.params.deliverableId || req.body.deliverableId;

    const workspace = await reviewBrandWorkspaceDeliverableService(
        req.user.userId,
        workspaceId,
        deliverableId,
        req.body
    );

    return sendResponse(
        res,
        200,
        "Deliverable review updated successfully",
        workspace
    );
});

export {
    getCreatorWorkspaces,
    getCreatorWorkspaceById,
    submitCreatorWorkspaceWork,
    submitCreatorWorkspaceDeliverable,
    getBrandWorkspaces,
    getBrandWorkspaceById,
    reviewBrandWorkspace,
    reviewBrandWorkspaceDeliverable
};

