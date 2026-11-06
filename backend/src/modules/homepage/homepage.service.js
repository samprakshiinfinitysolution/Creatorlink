import mongoose from "mongoose";
import Auth from "../auth/auth.model.js";
import CreatorProfile from "../creator/profile/profile.model.js";
import CreatorService from "../creator/services/services.model.js";
import Portfolio from "../creator/portfolio/portfolio.model.js";
import Booking from "../booking/booking.model.js";
import Campaign from "../brand/campaigns/campaign.model.js";
import BrandProfile from "../brand/profile/profile.model.js";

/**
 * Helper to derive a clean creator handle (@username).
 * Ignores placeholder brand names like "nike".
 */
const deriveCreatorHandle = (name, socialLinks) => {
    if (socialLinks?.instagram && typeof socialLinks.instagram === "string") {
        const cleaned = socialLinks.instagram
            .trim()
            .replace(/^https?:\/\/(www\.)?instagram\.com\/?/i, "")
            .replace(/\/.*$/, "")
            .replace(/^@/, "");
        if (
            cleaned &&
            cleaned.toLowerCase() !== "nike" &&
            cleaned.toLowerCase() !== "instagram"
        ) {
            return `@${cleaned}`;
        }
    }
    const safeName = (name || "creator")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .trim()
        .replace(/\s+/g, ".");
    return `@${safeName || "creator"}`;
};

const TARGET_CREATOR_IDS = [
    new mongoose.Types.ObjectId("6accb1f373cecc0ced448518"), // Shivani Pawar
    new mongoose.Types.ObjectId("6ac12636eab5bae98c3c47b3"), // mohit
    new mongoose.Types.ObjectId("6ae81f2f6dbf6b2cee0b5eeb"), // Ansh
    new mongoose.Types.ObjectId("6ae60d50e4211a1b7b011bcd")  // Mohit Patel
];

const AFFINITY_DOMAINS = [
    {
        id: "fashion_luxury_beauty",
        keywords: [
            "fashion",
            "luxury",
            "beauty",
            "skin",
            "skincare",
            "apparel",
            "style",
            "lifestyle",
            "ugc",
            "clothing",
            "couture",
            "cosmetics",
            "jewelry",
            "accessories"
        ]
    },
    {
        id: "food_beverage_culinary",
        keywords: [
            "food",
            "culinary",
            "cooking",
            "beverage",
            "dining",
            "recipe",
            "nutrition",
            "restaurant",
            "bakery"
        ]
    },
    {
        id: "tech_gaming",
        keywords: [
            "tech",
            "technology",
            "gaming",
            "gadgets",
            "software",
            "ai",
            "hardware",
            "esports"
        ]
    },
    {
        id: "fitness_wellness",
        keywords: [
            "fitness",
            "health",
            "wellness",
            "workout",
            "gym",
            "yoga",
            "sports",
            "athlete"
        ]
    },
    {
        id: "travel_hospitality",
        keywords: [
            "travel",
            "hospitality",
            "tourism",
            "hotel",
            "resort",
            "adventure"
        ]
    },
    {
        id: "business_finance",
        keywords: [
            "business",
            "finance",
            "fintech",
            "investing",
            "crypto",
            "money"
        ]
    }
];

const extractAffinityKeywords = (item) => {
    const textPieces = [
        item.creator?.category || "",
        item.brand?.category || "",
        item.title || ""
    ];
    return textPieces
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);
};

/**
 * Service to fetch featured homepage data:
 * - Top 4 creators based on follower count (descending), with consistent tie-breaking
 * - Latest brand collaboration record
 */
export const getHomepageFeaturedService = async () => {
    // 1. Fetch Top 4 creators
    const creatorPipeline = [
        { $match: { isPublic: { $ne: false } } },
        {
            $lookup: {
                from: Auth.collection.name,
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        { $match: { "user.role": "creator" } },
        {
            $addFields: {
                isTargetCreator: {
                    $cond: {
                        if: { $in: ["$_id", TARGET_CREATOR_IDS] },
                        then: 1,
                        else: 0
                    }
                },
                hasFollowerCount: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ["$followerCount", null] },
                                { $gt: ["$followerCount", 0] }
                            ]
                        },
                        then: 1,
                        else: 0
                    }
                },
                hasProfileImage: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ["$profileImage", null] },
                                { $ne: ["$profileImage", ""] }
                            ]
                        },
                        then: 1,
                        else: 0
                    }
                },
                hasBio: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ["$bio", null] },
                                { $ne: ["$bio", ""] }
                            ]
                        },
                        then: 1,
                        else: 0
                    }
                },
                hasCategory: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ["$category", null] },
                                { $ne: ["$category", ""] }
                            ]
                        },
                        then: 1,
                        else: 0
                    }
                }
            }
        },
        // Prioritize target creators, then follower count, then profile image & completeness.
        {
            $sort: {
                isTargetCreator: -1,
                hasFollowerCount: -1,
                followerCount: -1,
                hasProfileImage: -1,
                hasBio: -1,
                hasCategory: -1,
                createdAt: -1
            }
        },
        { $limit: 4 },
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
                                    { $ne: ["$isActive", false] }
                                ]
                            }
                        }
                    },
                    { $sort: { price: 1 } }
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
                                    { $ne: ["$isPublic", false] }
                                ]
                            }
                        }
                    },
                    { $sort: { createdAt: -1 } }
                ],
                as: "portfolios"
            }
        }
    ];

    const [rawCreators, rawLatestCreators, totalCreatorsCount] = await Promise.all([
        CreatorProfile.aggregate(creatorPipeline),
        CreatorProfile.aggregate([
            { $match: { isPublic: { $ne: false } } },
            {
                $lookup: {
                    from: Auth.collection.name,
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            { $match: { "user.role": "creator" } },
            { $sort: { createdAt: -1 } },
            { $limit: 4 },
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
                                        { $ne: ["$isActive", false] }
                                    ]
                                }
                            }
                        },
                        { $sort: { price: 1 } }
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
                                        { $ne: ["$isPublic", false] }
                                    ]
                                }
                            }
                        },
                        { $sort: { createdAt: -1 } }
                    ],
                    as: "portfolios"
                }
            }
        ]),
        CreatorProfile.countDocuments({ isPublic: { $ne: false } })
    ]);

    const formatCreatorRecord = (c) => {
        const handle = deriveCreatorHandle(c.user?.name, c.socialLinks);

        // Calculate starting price: only return positive price, else null (Price on request)
        let startingPrice = null;
        let currency = "INR";
        if (Array.isArray(c.services) && c.services.length > 0) {
            const pricedService = c.services.find(
                (s) => typeof s.price === "number" && s.price > 0
            );
            if (pricedService) {
                startingPrice = pricedService.price;
                currency = pricedService.currency || "INR";
            }
        }

        // Portfolio info
        let portfolioCover = null;
        let portfolioTitle = null;
        if (Array.isArray(c.portfolios) && c.portfolios.length > 0) {
            portfolioTitle = c.portfolios[0].title || null;
            portfolioCover =
                c.portfolios[0].coverImage ||
                (c.portfolios[0].contents && c.portfolios[0].contents[0]?.previewImage) ||
                null;
        }

        const category =
            c.category ||
            "Creator";

        const profileImage =
            c.profileImage && typeof c.profileImage === "string" && c.profileImage.trim()
                ? c.profileImage.trim()
                : null;

        // Display image priority: profile image first; portfolio cover only as a fallback; else null
        const displayImage = profileImage || portfolioCover || null;

        // Missing data rules:
        // Only positive metrics are considered valid numbers; 0, negative or missing is returned as null.
        const followerCount =
            typeof c.followerCount === "number" && !isNaN(c.followerCount) && c.followerCount > 0
                ? c.followerCount
                : null;

        const engagementRate =
            typeof c.engagementRate === "number" && !isNaN(c.engagementRate) && c.engagementRate > 0
                ? c.engagementRate
                : null;

        return {
            id: c._id,
            userId: c.user?._id,
            name: c.user?.name || "Creator",
            handle,
            profileImage,
            category,
            location: c.location && typeof c.location === "string" ? c.location.trim() : "",
            followerCount,
            engagementRate,
            startingPrice,
            currency,
            portfolio: {
                count: Array.isArray(c.portfolios) ? c.portfolios.length : 0,
                coverImage: portfolioCover,
                title: portfolioTitle
            },
            displayImage,
            isVerifiedBadge: Boolean(c.isVerifiedBadge),
            isDemo: Boolean(c.isDemo),
            createdAt: c.createdAt
        };
    };

    const topCreators = rawCreators.map(formatCreatorRecord);
    const latestCreators = rawLatestCreators.map(formatCreatorRecord);

    // 2. Fetch Latest and Related Brand Collaborations
    const validBookingFilter = {
        status: { $in: ["accepted", "completed", "in_progress"] }
    };

    const allValidBookings = await Booking.find(validBookingFilter)
        .sort({ createdAt: -1 })
        .populate("brand", "name email role")
        .populate("creator", "name email role")
        .populate("campaign", "title budget category")
        .populate("service", "title price currency")
        .lean();

    const formatCollaborationRecord = (booking, brandProfile, creatorProfile) => {
        let brandName = booking.brand?.name || "Brand Partner";
        let brandLogo = null;
        let brandCategory = booking.campaign?.category || null;

        if (brandProfile) {
            if (brandProfile.companyName && brandProfile.companyName.trim()) {
                brandName = brandProfile.companyName.trim();
            }
            if (brandProfile.logo && brandProfile.logo.trim()) {
                brandLogo = brandProfile.logo.trim();
            }
            if (brandProfile.industry && brandProfile.industry.trim()) {
                brandCategory = brandProfile.industry.trim();
            }
        }

        let creatorName = booking.creator?.name || "Creator";
        let creatorProfileImage = null;
        let creatorCategory = "Content Creator";
        let creatorSocial = null;

        if (creatorProfile) {
            if (creatorProfile.displayName && creatorProfile.displayName.trim()) {
                creatorName = creatorProfile.displayName.trim();
            }
            if (creatorProfile.profileImage && creatorProfile.profileImage.trim()) {
                creatorProfileImage = creatorProfile.profileImage.trim();
            }
            creatorCategory =
                creatorProfile.category ||
                                booking.campaign?.category ||
                "Content Creator";
            creatorSocial = creatorProfile.socialLinks;
        }

        const creatorHandle = deriveCreatorHandle(creatorName, creatorSocial);

        const deliverables = Array.isArray(booking.deliverables)
            ? booking.deliverables.filter((d) => Boolean(d && typeof d === "string" && d.trim()))
            : [];

        const title =
            booking.campaign?.title ||
            booking.service?.title ||
            "Brand Collaboration";

        // Missing amount rule: If <= 0 or null, return null (never 0)
        const amount =
            typeof booking.agreedPrice === "number" && booking.agreedPrice > 0
                ? booking.agreedPrice
                : null;

        return {
            id: booking._id,
            title,
            amount,
            currency: booking.currency || "INR",
            status: booking.status || "accepted",
            deliverables,
            deliverablesCount: deliverables.length,
            brand: {
                id: booking.brand?._id || null,
                name: brandName,
                logo: brandLogo,
                category: brandCategory
            },
            creator: {
                id: booking.creator?._id || null,
                name: creatorName,
                handle: creatorHandle,
                profileImage: creatorProfileImage,
                category: creatorCategory,
            },
            // Backwards-compatibility fields for existing components
            brandName,
            brandLogo,
            creatorName,
            creatorHandle,
            creatorAvatar: creatorProfileImage,
            createdAt: booking.createdAt
        };
    };

    // Format all valid bookings without excluding any brand/creator (test, Brand User, Chinki, etc.)
    const allCollaborations = [];
    for (const booking of allValidBookings) {
        let brandProfile = null;
        let creatorProfile = null;

        if (booking.brand?._id) {
            brandProfile = await BrandProfile.findOne({
                user: booking.brand._id
            }).lean();
        }
        if (booking.creator?._id) {
            creatorProfile = await CreatorProfile.findOne({
                user: booking.creator._id
            }).lean();
        }

        const formatted = formatCollaborationRecord(booking, brandProfile, creatorProfile);
        allCollaborations.push({
            record: formatted,
            createdAt: booking.createdAt
        });
    }

    let latestCollaboration = null;
    let relatedCollaborations = [];

    if (allCollaborations.length > 0) {
        // Latest collaboration strictly on the basis of newest createdAt
        latestCollaboration = allCollaborations[0].record;

        // Extract domain keywords for category affinity priority
        const latestKeywords = extractAffinityKeywords(latestCollaboration);
        const matchedDomains = AFFINITY_DOMAINS.filter((domain) =>
            domain.keywords.some((kw) => latestKeywords.includes(kw))
        );
        const targetDomainKeywords = new Set(
            matchedDomains.flatMap((d) => d.keywords)
        );

        const normBrand = (name) => (name || "").toLowerCase().trim();
        const normCreator = (name) => (name || "").toLowerCase().trim();
        const normCampaign = (title) => (title || "").toLowerCase().replace(/[^a-z0-9]/g, "");

        // Exclude the latest deal from related collaborations, avoid repeating identical deal
        const seenDeals = new Set([
            `${latestCollaboration.id.toString()}`,
            `${normBrand(latestCollaboration.brand?.name)}_${normCreator(latestCollaboration.creator?.name)}_${normCampaign(latestCollaboration.title)}`
        ]);

        const candidateEntries = allCollaborations.slice(1);
        const scoredCandidates = [];

        for (const candidate of candidateEntries) {
            const formatted = candidate.record;

            // Latest deal repeat na ho
            if (formatted.id.toString() === latestCollaboration.id.toString()) {
                continue;
            }

            const brandKey = normBrand(formatted.brand?.name);
            const creatorKey = normCreator(formatted.creator?.name);
            const campaignKey = normCampaign(formatted.title);
            const dealKey = `${brandKey}_${creatorKey}_${campaignKey}`;

            if (seenDeals.has(dealKey)) {
                continue;
            }
            seenDeals.add(dealKey);

            // Category priority scoring: same category gets higher score, but all categories are included
            const candidateKeywords = extractAffinityKeywords(formatted);
            let matchScore = 0;
            for (const kw of candidateKeywords) {
                if (targetDomainKeywords.has(kw)) {
                    matchScore += 1;
                }
            }

            scoredCandidates.push({
                record: formatted,
                matchScore,
                createdAt: candidate.createdAt
            });
        }

        // Priority to same category (matchScore descending), then newest createdAt
        scoredCandidates.sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Include top candidates (up to 6)
        relatedCollaborations = scoredCandidates.slice(0, 6).map((c) => c.record);
    }

    return {
        topCreators,
        latestCreators,
        totalCreatorsCount,
        latestCollaboration,
        relatedCollaborations
    };
};
