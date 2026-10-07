import mongoose from "mongoose";

import Campaign from "./campaign.model.js";
import createApiError from "../../../utils/ApiError.js";

import {
    getPagination,
    getPaginationData
} from "../../../utils/pagination.js";

import createSearchQuery from "../../../utils/helpers/search.helper.js";


// Create a new campaign for the authenticated brand.
const createCampaignService = async (brandId, campaignData) => {

    const campaign = await Campaign.create({
        brand: brandId,
        ...campaignData
    });

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
        filter.platform = platform.trim();
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


    const campaign = await Campaign.findOne({
        _id: campaignId,
        brand: brandId
    });


    if (!campaign) {
        throw createApiError(
            404,
            "Campaign not found"
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


    const campaign = await Campaign.findOne({
        _id: campaignId,
        brand: brandId
    });


    if (!campaign) {
        throw createApiError(
            404,
            "Campaign not found"
        );
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


    return updatedCampaign;
};


export {
    createCampaignService,
    getMyCampaignsService,
    getCampaignByIdService,
    updateCampaignService
};