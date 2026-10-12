import mongoose from "mongoose";
import CreatorProfile from "../../creator/profile/profile.model.js";
import Auth from "../../auth/auth.model.js";
import CreatorService from "../../creator/services/services.model.js";
import Portfolio from "../../creator/portfolio/portfolio.model.js";
import Review from "../../reviews/reviews.model.js";
import createApiError from "../../../utils/ApiError.js";
import {
    getPagination,
    getPaginationData
} from "../../../utils/pagination.js";

// Helper to escape regex special characters for literal text searches
const escapeRegex = (str) => {
    if (typeof str !== "string") return "";
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Platforms defined in CreatorProfile.socialLinks schema
const profileSocialPlatforms = new Set([
    "instagram",
    "facebook",
    "youtube",
    "tiktok",
    "website"
]);

// Fetches discoverable creators for brands by combining CreatorProfile, Auth,
// active CreatorService offerings, public Portfolio items, and verified Review ratings.
const getDiscoverCreatorsService = async (query = {}) => {
    const {
        page = 1,
        limit = 10,
        search,
        category,
        platform,
        location,
        minFollowers,
        maxFollowers,
        minEngagement,
        maxPrice,
        sortBy = "followerCount",
        sortOrder = "desc"
    } = query;

    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);

    const pipeline = [];

    // Stage 1: Enforce public profile visibility and profile-level numeric/location filters
    const profileMatch = {
        isPublic: true
    };

    if (minFollowers !== undefined && minFollowers !== "") {
        const parsedMin = Number(minFollowers);
        if (!Number.isNaN(parsedMin)) {
            profileMatch.followerCount = profileMatch.followerCount || {};
            profileMatch.followerCount.$gte = parsedMin;
        }
    }

    if (maxFollowers !== undefined && maxFollowers !== "") {
        const parsedMax = Number(maxFollowers);
        if (!Number.isNaN(parsedMax)) {
            profileMatch.followerCount = profileMatch.followerCount || {};
            profileMatch.followerCount.$lte = parsedMax;
        }
    }

    if (minEngagement !== undefined && minEngagement !== "") {
        const parsedEngagement = Number(minEngagement);
        if (!Number.isNaN(parsedEngagement)) {
            profileMatch.engagementRate = { $gte: parsedEngagement };
        }
    }

    if (location && typeof location === "string" && location.trim()) {
        const safeLocation = escapeRegex(location.trim());
        profileMatch.location = { $regex: safeLocation, $options: "i" };
    }

    pipeline.push({ $match: profileMatch });

    // Stage 2: Join Auth collection to verify user existence and obtain creator name
    pipeline.push({
        $lookup: {
            from: Auth.collection.name,
            localField: "user",
            foreignField: "_id",
            as: "user"
        }
    });

    // Unwind user (1:1 relationship with CreatorProfile)
    pipeline.push({
        $unwind: "$user"
    });

    // Stage 3: Restrict to accounts with role 'creator'
    pipeline.push({
        $match: {
            "user.role": "creator"
        }
    });

    // Stage 4: Lookup only ACTIVE services (isActive: true)
    pipeline.push({
        $lookup: {
            from: CreatorService.collection.name,
            let: { creatorAuthId: "$user._id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$creator", "$$creatorAuthId"] },
                                { $eq: ["$isActive", true] }
                            ]
                        }
                    }
                },
                { $sort: { price: 1, createdAt: -1 } }
            ],
            as: "services"
        }
    });

    // Stage 5: Lookup only PUBLIC portfolio entries (isPublic: true)
    pipeline.push({
        $lookup: {
            from: Portfolio.collection.name,
            let: { creatorAuthId: "$user._id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$creator", "$$creatorAuthId"] },
                                { $eq: ["$isPublic", true] }
                            ]
                        }
                    }
                },
                { $sort: { createdAt: -1 } }
            ],
            as: "portfolio"
        }
    });

    // Stage 6: Lookup real reviews from Review collection using creator's Auth ID
    pipeline.push({
        $lookup: {
            from: Review.collection.name,
            let: { creatorAuthId: "$user._id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ["$reviewee", "$$creatorAuthId"]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$reviewee",
                        averageRating: { $avg: "$rating" },
                        reviewCount: { $sum: 1 }
                    }
                }
            ],
            as: "reviewStats"
        }
    });

    // Stage 7: Add computed fields (rating, reviewCount, minPrice)
    pipeline.push({
        $addFields: {
            reviewStats: { $arrayElemAt: ["$reviewStats", 0] },
            minPrice: {
                $cond: {
                    if: { $gt: [{ $size: "$services" }, 0] },
                    then: { $min: "$services.price" },
                    else: null
                }
            }
        }
    });

    // If review data exists, round average to 1 decimal place; otherwise rating is null and reviewCount is 0
    pipeline.push({
        $addFields: {
            rating: {
                $cond: {
                    if: {
                        $and: [
                            { $ne: ["$reviewStats", null] },
                            { $gt: ["$reviewStats.reviewCount", 0] }
                        ]
                    },
                    then: { $round: ["$reviewStats.averageRating", 1] },
                    else: null
                }
            },
            reviewCount: {
                $ifNull: ["$reviewStats.reviewCount", 0]
            }
        }
    });

    // Stage 8: Post-lookup filters (search, category, platform, maxPrice)
    if (search && typeof search === "string" && search.trim()) {
        const safeSearch = escapeRegex(search.trim());
        pipeline.push({
            $match: {
                $or: [
                    { "user.name": { $regex: safeSearch, $options: "i" } },
                    { bio: { $regex: safeSearch, $options: "i" } },
                    { category: { $regex: safeSearch, $options: "i" } },
                    { location: { $regex: safeSearch, $options: "i" } },
                    { "services.title": { $regex: safeSearch, $options: "i" } }
                ]
            }
        });
    }

    if (category && typeof category === "string" && category.trim()) {
        const safeCategory = escapeRegex(category.trim());
        pipeline.push({
            $match: {
                $or: [
                    { category: { $regex: safeCategory, $options: "i" } },
                    { "services.category": { $regex: safeCategory, $options: "i" } },
                    { "portfolio.category": { $regex: safeCategory, $options: "i" } }
                ]
            }
        });
    }

    if (platform && typeof platform === "string" && platform.trim()) {
        const plat = platform.trim().toLowerCase();
        const platformOrConditions = [
            { "services.platform": plat },
            { "portfolio.contents.platform": plat }
        ];

        // Only query socialLinks if the platform key exists in CreatorProfile schema
        if (profileSocialPlatforms.has(plat)) {
            platformOrConditions.push({ [`socialLinks.${plat}`]: { $exists: true, $ne: "" } });
        }

        pipeline.push({
            $match: {
                $or: platformOrConditions
            }
        });
    }

    if (maxPrice !== undefined && maxPrice !== "") {
        const parsedMaxPrice = Number(maxPrice);
        if (!Number.isNaN(parsedMaxPrice) && parsedMaxPrice >= 0) {
            pipeline.push({
                $match: {
                    minPrice: { $lte: parsedMaxPrice, $ne: null }
                }
            });
        }
    }

    // Stage 9: Sorting
    const normalizedSortBy = typeof sortBy === "string" && sortBy.trim()
        ? sortBy.trim()
        : "followerCount";
    const normalizedSortOrder = typeof sortOrder === "string" && sortOrder.trim().toLowerCase() === "asc"
        ? "asc"
        : "desc";

    const sortDirection = normalizedSortOrder === "asc" ? 1 : -1;
    const sortStages = {};

    if (normalizedSortBy === "rating") {
        sortStages.rating = sortDirection;
        sortStages.followerCount = -1;
    } else if (normalizedSortBy === "minPrice" || normalizedSortBy === "price") {
        if (sortDirection === 1) {
            // In ascending price sorting, creators with active prices come first
            pipeline.push({
                $addFields: {
                    sortPriceHelper: {
                        $cond: {
                            if: { $ne: ["$minPrice", null] },
                            then: "$minPrice",
                            else: Number.MAX_SAFE_INTEGER
                        }
                    }
                }
            });
            sortStages.sortPriceHelper = 1;
        } else {
            sortStages.minPrice = -1;
        }
        sortStages.followerCount = -1;
    } else if (normalizedSortBy === "name") {
        sortStages["user.name"] = sortDirection;
    } else if (normalizedSortBy === "engagementRate") {
        sortStages.engagementRate = sortDirection;
        sortStages.followerCount = -1;
    } else if (normalizedSortBy === "createdAt") {
        sortStages.createdAt = sortDirection;
    } else {
        // Default sort by followerCount
        sortStages.followerCount = sortDirection;
        sortStages.createdAt = -1;
    }

    pipeline.push({ $sort: sortStages });

    // Stage 10: Projection of safe public properties (private user.email and credentials omitted)
    pipeline.push({
        $project: {
            _id: 1,
            user: {
                _id: "$user._id",
                name: "$user.name",
                role: "$user.role",
                isVerified: "$user.isVerified"
            },
            bio: 1,
            category: 1,
            location: 1,
            profileImage: 1,
            socialLinks: 1,
            followerCount: 1,
            engagementRate: 1,
            isPublic: 1,
            createdAt: 1,
            updatedAt: 1,
            services: 1,
            portfolio: 1,
            rating: 1,
            reviewCount: 1,
            minPrice: 1
        }
    });

    // Stage 11: Faceted pagination to prevent duplicate results and calculate totalItems
    pipeline.push({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: itemsPerPage }
            ],
            totalCount: [
                { $count: "count" }
            ]
        }
    });

    const [aggregateResult] = await CreatorProfile.aggregate(pipeline);
    const creators = aggregateResult?.data || [];
    const totalItems = aggregateResult?.totalCount?.[0]?.count || 0;
    const pagination = getPaginationData(currentPage, itemsPerPage, totalItems);

    return {
        creators,
        pagination
    };
};

// Fetches public details for a single creator by Profile ID or Auth ID
const getDiscoverCreatorByIdService = async (creatorId) => {
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
        throw createApiError(400, "Invalid creator ID format");
    }

    const objId = new mongoose.Types.ObjectId(creatorId);

    const pipeline = [
        {
            $match: {
                $or: [
                    { _id: objId },
                    { user: objId }
                ],
                isPublic: true
            }
        },
        {
            $lookup: {
                from: Auth.collection.name,
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $match: {
                "user.role": "creator"
            }
        },
        {
            $lookup: {
                from: CreatorService.collection.name,
                let: { creatorAuthId: "$user._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$creator", "$$creatorAuthId"] },
                                    { $eq: ["$isActive", true] }
                                ]
                            }
                        }
                    },
                    { $sort: { price: 1, createdAt: -1 } }
                ],
                as: "services"
            }
        },
        {
            $lookup: {
                from: Portfolio.collection.name,
                let: { creatorAuthId: "$user._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$creator", "$$creatorAuthId"] },
                                    { $eq: ["$isPublic", true] }
                                ]
                            }
                        }
                    },
                    { $sort: { createdAt: -1 } }
                ],
                as: "portfolio"
            }
        },
        {
            $lookup: {
                from: Review.collection.name,
                let: { creatorAuthId: "$user._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$reviewee", "$$creatorAuthId"]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$reviewee",
                            averageRating: { $avg: "$rating" },
                            reviewCount: { $sum: 1 }
                        }
                    }
                ],
                as: "reviewStats"
            }
        },
        {
            $addFields: {
                reviewStats: { $arrayElemAt: ["$reviewStats", 0] },
                minPrice: {
                    $cond: {
                        if: { $gt: [{ $size: "$services" }, 0] },
                        then: { $min: "$services.price" },
                        else: null
                    }
                }
            }
        },
        {
            $addFields: {
                rating: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ["$reviewStats", null] },
                                { $gt: ["$reviewStats.reviewCount", 0] }
                            ]
                        },
                        then: { $round: ["$reviewStats.averageRating", 1] },
                        else: null
                    }
                },
                reviewCount: {
                    $ifNull: ["$reviewStats.reviewCount", 0]
                }
            }
        },
        {
            $project: {
                _id: 1,
                user: {
                    _id: "$user._id",
                    name: "$user.name",
                    role: "$user.role",
                    isVerified: "$user.isVerified"
                },
                bio: 1,
                category: 1,
                location: 1,
                profileImage: 1,
                socialLinks: 1,
                followerCount: 1,
                engagementRate: 1,
                isPublic: 1,
                createdAt: 1,
                updatedAt: 1,
                services: 1,
                portfolio: 1,
                rating: 1,
                reviewCount: 1,
                minPrice: 1
            }
        }
    ];

    const results = await CreatorProfile.aggregate(pipeline);

    if (!results || results.length === 0) {
        throw createApiError(
            404,
            "Creator profile not found or is private"
        );
    }

    return results[0];
};

export {
    getDiscoverCreatorsService,
    getDiscoverCreatorByIdService
};
