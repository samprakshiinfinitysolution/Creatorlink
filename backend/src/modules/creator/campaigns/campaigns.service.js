import mongoose from "mongoose";

import Campaign from "../../brand/campaigns/campaign.model.js";
import Booking from "../../booking/booking.model.js";
import BrandProfile from "../../brand/profile/profile.model.js";
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
        initiatedBy: b.initiatedBy || "creator",
        campaign: b.campaign ? {
            _id: b.campaign._id,
            title: b.campaign.title,
            description: b.campaign.description,
            category: b.campaign.category,
            platform: b.campaign.platform,
            budget: b.campaign.budget,
            minBudget: b.campaign.minBudget,
            maxBudget: b.campaign.maxBudget,
            currency: b.campaign.currency || "INR",
            deadline: b.campaign.deadline,
            coverImage: b.campaign.coverImage || "",
            requiredCreators: b.campaign.requiredCreators !== undefined && b.campaign.requiredCreators !== null
                ? b.campaign.requiredCreators
                : 1,
            audienceTargeting: b.campaign.audienceTargeting || {
                age: "All",
                gender: "all",
                geography: []
            },
            usageRights: b.campaign.usageRights || {
                organicUsage: true,
                paidAds: false,
                duration: "30 days",
                exclusivity: false
            },
            creatorRequirements: b.campaign.creatorRequirements || {
                minFollowers: 0,
                minEngagementRate: 0
            }
        } : null,
        brand: b.brand ? {
            _id: b.brand._id,
            name: b.brand.companyName || b.brand.name || "Brand Partner",
            companyName: b.brand.companyName || b.brand.name || "Brand Partner",
            email: b.brand.email,
            avatar: b.brand.logo || b.brand.avatar || "",
            logo: b.brand.logo || b.brand.avatar || "",
            profileImage: b.brand.logo || b.brand.avatar || ""
        } : null,
        service: b.service ? {
            _id: b.service._id,
            title: b.service.title,
            price: b.service.price,
            deliveryTime: b.service.deliveryTime
        } : null
    };
};


// Helper to attach BrandProfile details (companyName, logo) and Auth details to campaign brand
const attachCampaignBrandProfiles = async (campaigns) => {
    if (!campaigns) return campaigns;
    const isSingle = !Array.isArray(campaigns);
    const campaignList = isSingle ? [campaigns] : campaigns;
    if (campaignList.length === 0) return campaigns;

    const brandIds = new Set();
    campaignList.forEach((c) => {
        const cObj = c?.toObject ? c.toObject() : c;
        if (!cObj?.brand) return;
        const bId = cObj.brand._id
            ? (cObj.brand._id.toString ? cObj.brand._id.toString() : String(cObj.brand._id))
            : (mongoose.Types.ObjectId.isValid(cObj.brand)
                ? (cObj.brand.toString ? cObj.brand.toString() : String(cObj.brand))
                : null);
        if (bId) brandIds.add(bId);
    });

    const isDbConnected = mongoose.connection?.readyState === 1;
    const brandProfiles = brandIds.size > 0 && isDbConnected
        ? await BrandProfile.find({
            user: { $in: Array.from(brandIds).map((id) => new mongoose.Types.ObjectId(id)) }
        })
            .select("user logo companyName")
            .lean()
        : [];

    const brandProfileMap = new Map();
    brandProfiles.forEach((bp) => {
        if (bp?.user) brandProfileMap.set(bp.user.toString(), bp);
    });

    const enriched = campaignList.map((c) => {
        const cObj = c?.toObject ? c.toObject() : { ...c };
        if (!cObj.brand) return cObj;

        const bId = cObj.brand._id
            ? (cObj.brand._id.toString ? cObj.brand._id.toString() : String(cObj.brand._id))
            : (mongoose.Types.ObjectId.isValid(cObj.brand)
                ? (cObj.brand.toString ? cObj.brand.toString() : String(cObj.brand))
                : null);

        const bp = bId ? brandProfileMap.get(bId) : null;
        const brandLogo = bp?.logo || "";
        const companyName = bp?.companyName || "";

        if (typeof cObj.brand === "object" && cObj.brand !== null) {
            const brandBase = cObj.brand.toObject ? cObj.brand.toObject() : { ...cObj.brand };
            const resolvedName = companyName || brandBase.companyName || brandBase.name || "Brand Partner";
            const resolvedAvatar = brandLogo || brandBase.logo || brandBase.avatar || "";
            cObj.brand = {
                ...brandBase,
                name: resolvedName,
                companyName: resolvedName,
                logo: resolvedAvatar,
                avatar: resolvedAvatar,
                profileImage: resolvedAvatar
            };
        } else if (bId) {
            const resolvedName = companyName || "Brand Partner";
            cObj.brand = {
                _id: cObj.brand,
                name: resolvedName,
                companyName: resolvedName,
                logo: brandLogo,
                avatar: brandLogo,
                profileImage: brandLogo
            };
        }

        return cObj;
    });

    return isSingle ? enriched[0] : enriched;
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


    // Only published and non-restricted campaigns are discoverable.
    const filter = {
        status: "published",
        "moderation.isRestricted": { $ne: true }
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
        filter.platform = platform.trim().toLowerCase();
    }


    // Filter by budget range (matches both legacy single budget and range-enabled campaigns)
    if (
        (minBudget !== undefined && minBudget !== "") ||
        (maxBudget !== undefined && maxBudget !== "")
    ) {
        const numMin = minBudget !== undefined && minBudget !== "" ? Number(minBudget) : null;
        const numMax = maxBudget !== undefined && maxBudget !== "" ? Number(maxBudget) : null;

        const singleBudgetMatch = {};
        if (numMin !== null) singleBudgetMatch.$gte = numMin;
        if (numMax !== null) singleBudgetMatch.$lte = numMax;

        const rangeBudgetMatch = {};
        if (numMin !== null) rangeBudgetMatch.maxBudget = { $gte: numMin };
        if (numMax !== null) rangeBudgetMatch.minBudget = { $lte: numMax };

        filter.$or = [
            { budget: singleBudgetMatch },
            rangeBudgetMatch
        ];
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
            .populate("brand", "name email avatar")
            .sort(sort)
            .skip(skip)
            .limit(itemsPerPage),

        Campaign.countDocuments(filter)
    ]);

    const enrichedCampaigns = await attachCampaignBrandProfiles(campaigns);

    return {
        campaigns: enrichedCampaigns,
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
        status: "published",
        "moderation.isRestricted": { $ne: true }
    }).populate("brand", "name email avatar");


    if (!campaign) {
        throw createApiError(
            404,
            "Campaign not found"
        );
    }


    return await attachCampaignBrandProfiles(campaign);
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
            .populate("brand", "name email avatar")
            .populate("campaign", "title description category platform budget minBudget maxBudget currency deadline coverImage requiredCreators audienceTargeting usageRights creatorRequirements")
            .populate("service", "title price deliveryTime")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),

        Booking.countDocuments(filter)
    ]);

    const enrichedBookings = await attachCampaignBrandProfiles(bookings);
    const formattedCampaigns = enrichedBookings.map(formatAppliedCampaignItem);


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
        .populate("brand", "name email avatar")
        .populate("campaign")
        .populate("service");


    if (!booking) {
        throw createApiError(
            404,
            "Applied campaign not found"
        );
    }


    const enrichedBooking = await attachCampaignBrandProfiles(booking);
    return formatAppliedCampaignItem(enrichedBooking);
};


export {
    getDiscoverCampaignsService,
    getDiscoverCampaignByIdService,
    getAppliedCampaignsService,
    getAppliedCampaignByIdService
};
