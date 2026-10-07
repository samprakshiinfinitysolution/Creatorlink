import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";

import {
    getDiscoverCampaignsService,
    getDiscoverCampaignByIdService,
    getAppliedCampaignsService,
    getAppliedCampaignByIdService
} from "./campaigns.service.js";


// Get published discoverable campaigns for creators.
const getDiscoverCampaigns = asyncHandler(async (req, res) => {

    const result = await getDiscoverCampaignsService(req.query);

    return sendResponse(
        res,
        200,
        "Discover campaigns fetched successfully",
        result
    );
});


// Get single published campaign details for creator.
const getDiscoverCampaignById = asyncHandler(async (req, res) => {

    const campaign = await getDiscoverCampaignByIdService(req.params.id);

    return sendResponse(
        res,
        200,
        "Campaign fetched successfully",
        campaign
    );
});


// Get list of campaigns applied to by authenticated creator.
const getAppliedCampaigns = asyncHandler(async (req, res) => {

    const result = await getAppliedCampaignsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Applied campaigns fetched successfully",
        result
    );
});


// Get single applied campaign detail by booking ID for creator.
const getAppliedCampaignById = asyncHandler(async (req, res) => {

    const campaign = await getAppliedCampaignByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Applied campaign fetched successfully",
        campaign
    );
});


export {
    getDiscoverCampaigns,
    getDiscoverCampaignById,
    getAppliedCampaigns,
    getAppliedCampaignById
};
