import mongoose from "mongoose";

import Campaign from "./campaign.model.js";
import Workspace from "../../workspace/workspace.model.js";
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
import { notifyAdminsSafe } from "../../notifications/notification.service.js";


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

    return updatedCampaign;
};


export {
    createCampaignService,
    getMyCampaignsService,
    getCampaignByIdService,
    updateCampaignService
};
