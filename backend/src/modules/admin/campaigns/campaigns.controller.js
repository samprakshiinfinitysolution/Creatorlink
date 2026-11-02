import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import {
    getAdminCampaignsService,
    getAdminCampaignStatsService,
    getAdminCampaignByIdService,
    moderateCampaignPauseService,
    moderateCampaignResumeService,
    moderateCampaignCloseService,
    safeDeleteAdminCampaignService
} from "./campaigns.service.js";

// Fetches paginated campaigns with filters, search, and moderation status
const getAdminCampaigns = asyncHandler(async (req, res) => {
    const data = await getAdminCampaignsService(req.query);

    return sendResponse(
        res,
        200,
        "Campaigns fetched successfully",
        data
    );
});

// Fetches overall campaign moderation stats
const getAdminCampaignStats = asyncHandler(async (req, res) => {
    const data = await getAdminCampaignStatsService();

    return sendResponse(
        res,
        200,
        "Campaign stats fetched successfully",
        data
    );
});

// Fetches single campaign details with brand dossier, bookings, and audit history
const getAdminCampaignById = asyncHandler(async (req, res) => {
    const data = await getAdminCampaignByIdService(req.params.id);

    return sendResponse(
        res,
        200,
        "Campaign details fetched successfully",
        data
    );
});

// Moderation Action: Pause campaign for moderation & place restriction
const moderateCampaignPause = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id;
    const { reason } = req.body;

    const data = await moderateCampaignPauseService(
        req.params.id,
        reason,
        adminId
    );

    return sendResponse(
        res,
        200,
        "Campaign paused for moderation successfully",
        data
    );
});

// Moderation Action: Resume campaign after moderation restrictions resolved
const moderateCampaignResume = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id;
    const { reason } = req.body;

    const data = await moderateCampaignResumeService(
        req.params.id,
        reason,
        adminId
    );

    return sendResponse(
        res,
        200,
        "Campaign moderation restriction resolved and campaign resumed",
        data
    );
});

// Moderation Action: Close campaign when justified
const moderateCampaignClose = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id;
    const { reason } = req.body;

    const data = await moderateCampaignCloseService(
        req.params.id,
        reason,
        adminId
    );

    return sendResponse(
        res,
        200,
        "Campaign closed successfully by administration",
        data
    );
});

// Moderation Action: Safe deletion of campaign (with relationship checks)
const safeDeleteAdminCampaign = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id;
    const reason = req.body?.reason || req.query?.reason || "";

    const data = await safeDeleteAdminCampaignService(
        req.params.id,
        adminId,
        reason
    );

    return sendResponse(
        res,
        200,
        data.message,
        data
    );
});

export {
    getAdminCampaigns,
    getAdminCampaignStats,
    getAdminCampaignById,
    moderateCampaignPause,
    moderateCampaignResume,
    moderateCampaignClose,
    safeDeleteAdminCampaign
};
