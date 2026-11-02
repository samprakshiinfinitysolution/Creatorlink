import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import {
    getAdminCollaborationsStatsService,
    getAdminCollaborationsService,
    getAdminCollaborationByIdService,
    overrideCollaborationStatusService,
    extendCollaborationDeadlineService
} from "./collaborations.service.js";

// Fetches platform collaboration statistics
const getAdminCollaborationsStats = asyncHandler(async (req, res) => {
    const data = await getAdminCollaborationsStatsService();

    return sendResponse(
        res,
        200,
        "Collaboration stats fetched successfully",
        data
    );
});

// Fetches paginated collaborations list with filters and search
const getAdminCollaborations = asyncHandler(async (req, res) => {
    const data = await getAdminCollaborationsService(req.query);

    return sendResponse(
        res,
        200,
        "Collaborations fetched successfully",
        data
    );
});

// Fetches deep collaboration dossier by ID
const getAdminCollaborationById = asyncHandler(async (req, res) => {
    const data = await getAdminCollaborationByIdService(req.params.id);

    return sendResponse(
        res,
        200,
        "Collaboration details fetched successfully",
        data
    );
});

// Administratively overrides collaboration status
const overrideCollaborationStatus = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id;
    const { status, reason } = req.body;

    const data = await overrideCollaborationStatusService(
        req.params.id,
        status,
        reason,
        adminId
    );

    return sendResponse(
        res,
        200,
        `Collaboration status updated to ${status} successfully`,
        data
    );
});

// Administratively extends collaboration deadline
const extendCollaborationDeadline = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id;
    const { newDeadline, reason } = req.body;

    const data = await extendCollaborationDeadlineService(
        req.params.id,
        newDeadline,
        reason,
        adminId
    );

    return sendResponse(
        res,
        200,
        "Collaboration deadline extended successfully",
        data
    );
});

export {
    getAdminCollaborationsStats,
    getAdminCollaborations,
    getAdminCollaborationById,
    overrideCollaborationStatus,
    extendCollaborationDeadline
};

