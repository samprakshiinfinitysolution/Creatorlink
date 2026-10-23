import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";

import {
    createCampaignService,
    getMyCampaignsService,
    getCampaignByIdService,
    updateCampaignService
} from "./campaign.service.js";


// Create a new campaign.
const createCampaign = asyncHandler(async (req, res) => {

    const campaign = await createCampaignService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        201,
        "Campaign created successfully",
        campaign
    );
});


// Get all campaigns of the logged-in brand.
const getMyCampaigns = asyncHandler(async (req, res) => {

    const result = await getMyCampaignsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Campaigns fetched successfully",
        result
    );
});


// Get one campaign of the logged-in brand.
const getCampaignById = asyncHandler(async (req, res) => {

    const campaign = await getCampaignByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Campaign fetched successfully",
        campaign
    );
});


// Update one campaign of the logged-in brand.
const updateCampaign = asyncHandler(async (req, res) => {

    const campaign = await updateCampaignService(
        req.user.userId,
        req.params.id,
        req.body
    );

    return sendResponse(
        res,
        200,
        "Campaign updated successfully",
        campaign
    );
});


export {
    createCampaign,
    getMyCampaigns,
    getCampaignById,
    updateCampaign
};