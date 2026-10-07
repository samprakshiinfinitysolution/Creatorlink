import mongoose from "mongoose";

import Campaign from "../../brand/campaigns/campaign.model.js";
import Booking from "../../booking/booking.model.js";
import createApiError from "../../../utils/ApiError.js";

import {
    getPagination,
    getPaginationData
} from "../../../utils/pagination.js";

import createSearchQuery from "../../../utils/helpers/search.helper.js";


// Helper to format booking + campaign context into standard applied campaign item.
const formatAppliedCampaignItem = (b) => {

    return {
        _id: b._id,
        bookingId: b._id,
        status: b.status,
        agreedPrice: b.agreedPrice,
        currency: b.currency,
        message: b.message,
        deliverables: b.deliverables,
        startDate: b.startDate,
        deadline: b.deadline,
        createdAt: b.createdAt,
        campaign: b.campaign ? {
            _id: b.campaign._id,
            title: b.campaign.title,
            description: b.campaign.description,
            category: b.campaign.category,
            platform: b.campaign.platform,
            budget: b.campaign.budget,
            deadline: b.campaign.deadline
        } : null,
        brand: b.brand ? {
            _id: b.brand._id,
            name: b.brand.name,
            email: b.brand.email
        } : null,
        service: b.service ? {
            _id: b.service._id,
            title: b.service.title,
            price: b.service.price,
            deliveryTime: b.service.deliveryTime
        } : null
    };
};


// Get published campaigns for creators to discover.
//
// Supports:
// - status = "published" enforced
// - pagination
// - search by title/description/category
// - category filter
// - platform filter
// - budget range filter (minBudget, maxBudget)
// - sorting (createdAt, budget, deadline, title)
const getDiscoverCampaignsService = async (query = {}) => {

    const {
        page = 1,
        limit = 10,
        search,
        category,
        platform,
        minBudget,
        maxBudget,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = query;


    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);


    // Only published campaigns are discoverable.
    const filter = {
        status: "published"
    };


    // Search campaigns by text fields.
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


    // Filter by budget range.
    if (
        (minBudget !== undefined && minBudget !== "") ||
        (maxBudget !== undefined && maxBudget !== "")
    ) {

        filter.budget = {};

        if (minBudget !== undefined && minBudget !== "") {
            filter.budget.$gte = Number(minBudget);
        }

        if (maxBudget !== undefined && maxBudget !== "") {
            filter.budget.$lte = Number(maxBudget);
        }
    }


    // Allowed sortable fields.
    const allowedSortFields = [
        "createdAt",
        "budget",
        "deadline",
        "title"
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


// Get a single published campaign by ID for creator view.
const getDiscoverCampaignByIdService = async (campaignId) => {

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        throw createApiError(
            400,
            "Invalid campaign ID"
        );
    }


    const campaign = await Campaign.findOne({
        _id: campaignId,
        status: "published"
    });


    if (!campaign) {
        throw createApiError(
            404,
            "Campaign not found"
        );
    }


    return campaign;
};


// Get list of campaigns applied to by the authenticated creator through Booking.
const getAppliedCampaignsService = async (creatorId, query = {}) => {

    const {
        page = 1,
        limit = 10,
        status,
        search
    } = query;


    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);


    const filter = {
        creator: creatorId
    };


    // Map creator campaign tab status to Booking status query.
    if (status && status.trim()) {

        const trimmedStatus = status.trim();

        if (trimmedStatus === "active") {
            filter.status = {
                $in: [
                    "accepted",
                    "in_progress"
                ]
            };
        } else {
            filter.status = trimmedStatus;
        }
    }


    // Perform database-level search matching target Campaign fields.
    if (search && search.trim()) {

        const matchingCampaigns = await Campaign.find(
            createSearchQuery(
                search.trim(),
                [
                    "title",
                    "description",
                    "category"
                ]
            )
        ).select("_id");


        const matchingCampaignIds = matchingCampaigns.map((c) => c._id);

        filter.campaign = {
            $in: matchingCampaignIds
        };
    }


    const [bookings, totalItems] = await Promise.all([
        Booking.find(filter)
            .populate("brand", "name email")
            .populate("campaign", "title description category platform budget deadline")
            .populate("service", "title price deliveryTime")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),

        Booking.countDocuments(filter)
    ]);


    const formattedCampaigns = bookings.map(formatAppliedCampaignItem);


    return {
        campaigns: formattedCampaigns,
        pagination: getPaginationData(
            currentPage,
            itemsPerPage,
            totalItems
        )
    };
};


// Get a single applied campaign detail by booking ID for authenticated creator.
const getAppliedCampaignByIdService = async (creatorId, bookingId) => {

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw createApiError(
            400,
            "Invalid booking ID"
        );
    }


    const booking = await Booking.findOne({
        _id: bookingId,
        creator: creatorId
    })
        .populate("brand", "name email")
        .populate("campaign")
        .populate("service");


    if (!booking) {
        throw createApiError(
            404,
            "Applied campaign not found"
        );
    }


    return formatAppliedCampaignItem(booking);
};


export {
    getDiscoverCampaignsService,
    getDiscoverCampaignByIdService,
    getAppliedCampaignsService,
    getAppliedCampaignByIdService
};
