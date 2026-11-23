import mongoose from "mongoose";

import Booking from "./booking.model.js";
import Campaign from "../brand/campaigns/campaign.model.js";
import CreatorService from "../creator/services/services.model.js";
import Auth from "../auth/auth.model.js";
import CreatorProfile from "../creator/profile/profile.model.js";
import BrandProfile from "../brand/profile/profile.model.js";
import Review from "../reviews/reviews.model.js";
import {
    createWorkspaceForAcceptedBooking,
    cleanupWorkspaceForBooking
} from "../workspace/workspace.service.js";
import { createNotificationSafe } from "../notifications/notification.service.js";
import { evaluateBrandEntitlement, evaluateCreatorEntitlement } from "../subscriptions/entitlement.service.js";
import { deductCreatorApplicationCreditService } from "../subscriptions/creatorCredit.service.js";
import createApiError from "../../utils/ApiError.js";

import {
    getPagination,
    getPaginationData
} from "../../utils/pagination.js";


// Creates a new booking / campaign application from a creator.
const createBookingService = async (creatorId, bookingData) => {

    const {
        campaignId,
        serviceId,
        proposedPrice,
        message
    } = bookingData;

    const session = await mongoose.startSession();
    let createdBooking = null;
    let campaignDocForNotif = null;
    let finalPriceForNotif = 0;

    try {
        await session.withTransaction(async () => {
            // 0. Verify Creator Subscription Entitlement & Available Credits inside the transaction
            const creatorEntitlement = await evaluateCreatorEntitlement(creatorId, session);
            if (!creatorEntitlement.hasEntitlement) {
                throw createApiError(
                    403,
                    creatorEntitlement.reason || "An active Creator subscription is required to apply for campaigns."
                );
            }
            if (creatorEntitlement.currentBalance < 1) {
                throw createApiError(
                    403,
                    "Insufficient application credits. Please upgrade or renew your plan to apply for campaigns."
                );
            }

            // 1. Verify selected creator service exists, is active, and belongs to creator.
            const service = await CreatorService.findOne({
                _id: serviceId,
                creator: creatorId,
                isActive: true
            }).session(session);

            if (!service) {
                throw createApiError(
                    400,
                    "Selected service does not exist, is inactive, or does not belong to you"
                );
            }

            // 2. Coordinate with parent Campaign document using conditional atomic update
            const campaign = await Campaign.findOneAndUpdate(
                {
                    _id: campaignId,
                    status: "published",
                    "moderation.isRestricted": { $ne: true }
                },
                {
                    $inc: { __v: 1 }
                },
                { session, new: true }
            );

            if (!campaign) {
                const existingCamp = await Campaign.findById(campaignId).session(session);
                if (!existingCamp) {
                    throw createApiError(
                        404,
                        "Campaign not found"
                    );
                }

                throw createApiError(
                    400,
                    `Cannot apply: Campaign is ${existingCamp.status}${existingCamp.moderation?.isRestricted ? " and under administrative moderation" : ""} and is not accepting new applications`
                );
            }

            const brandId = campaign.brand;

            // Verify brand's subscription entitlement
            const brandEntitlement = await evaluateBrandEntitlement(brandId);
            if (!brandEntitlement.hasEntitlement) {
                throw createApiError(
                    400,
                    "Cannot apply: This brand's subscription has expired and this campaign is not accepting new applications."
                );
            }

            // 3. Prevent self-booking/applying.
            if (creatorId.toString() === brandId.toString()) {
                throw createApiError(
                    400,
                    "You cannot apply to your own campaign"
                );
            }

            // 4. Prevent duplicate booking for the same creator + campaign.
            const existingBooking = await Booking.findOne({
                campaign: campaignId,
                creator: creatorId
            }).session(session);

            if (existingBooking) {
                throw createApiError(
                    400,
                    "You have already applied to this campaign"
                );
            }

            // 5. Determine agreed price (proposedPrice if provided, otherwise service default price).
            const finalPrice = (proposedPrice !== undefined && proposedPrice !== null && proposedPrice !== "")
                ? Number(proposedPrice)
                : service.price;

            // 6. Create booking copying deliverables and deadline from campaign.
            const [booking] = await Booking.create(
                [
                    {
                        brand: brandId,
                        creator: creatorId,
                        campaign: campaignId,
                        service: serviceId,
                        revisions: (typeof service?.revisions === "number" && service.revisions >= 0)
                            ? service.revisions
                            : 1,
                        agreedPrice: finalPrice,
                        currency: service.currency || "INR",
                        message: message ? message.trim() : "",
                        deliverables: campaign.deliverables,
                        deadline: campaign.deadline,
                        status: "pending"
                    }
                ],
                { session }
            );

            // 7. Atomically deduct exactly 1 application credit and record immutable audit ledger entry
            await deductCreatorApplicationCreditService({
                creatorId,
                bookingId: booking._id,
                campaignId: campaign._id,
                campaignTitle: campaign.title,
                session
            });

            createdBooking = booking;
            campaignDocForNotif = campaign;
            finalPriceForNotif = finalPrice;
        });
    } catch (err) {
        if (err.code === 11000 && (err.keyPattern?.campaign || err.message?.includes("campaign_1_creator_1"))) {
            throw createApiError(
                400,
                "You have already applied to this campaign"
            );
        }
        throw err;
    } finally {
        await session.endSession();
    }

    // External side effects and notifications executed strictly post-commit
    if (createdBooking && campaignDocForNotif) {
        await createNotificationSafe({
            recipient: createdBooking.brand,
            sender: creatorId,
            type: "booking:application_received",
            title: "New Campaign Application",
            message: `A creator submitted an application for "${campaignDocForNotif.title || 'Campaign'}".`,
            entityType: "booking",
            entityId: createdBooking._id,
            destination: "/brand/bookings",
            metadata: {
                campaignId: campaignDocForNotif._id,
                campaignTitle: campaignDocForNotif.title,
                serviceId,
                agreedPrice: finalPriceForNotif
            },
            idempotencyKey: `booking:application_received:${createdBooking._id}`
        });
    }

    return await attachBookingProfiles(createdBooking);
};


// Gets bookings belonging to the authenticated creator.
const getCreatorBookingsService = async (creatorId, query = {}) => {

    const {
        page = 1,
        limit = 10,
        status
    } = query;


    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);


    const filter = {
        creator: creatorId
    };


    if (status && status.trim()) {
        filter.status = status.trim();
    }


    const [bookings, totalItems] = await Promise.all([
        Booking.find(filter)
            .populate("brand", "name email")
            .populate("campaign", "title description category budget minBudget maxBudget currency deadline platform coverImage requiredCreators deliverables creatorRequirements audienceTargeting usageRights")
            .populate("service", "title price deliveryTime revisions")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),

        Booking.countDocuments(filter)
    ]);


    const enrichedBookings = await attachBookingProfiles(bookings);

    return {
        bookings: enrichedBookings,
        pagination: getPaginationData(
            currentPage,
            itemsPerPage,
            totalItems
        )
    };
};


// Gets a single booking belonging to the authenticated creator.
const getCreatorBookingByIdService = async (creatorId, bookingId) => {

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
            "Booking not found"
        );
    }


    return await attachBookingProfiles(booking);
};


// Cancels a pending booking by creator.
const cancelCreatorBookingService = async (creatorId, bookingId) => {

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw createApiError(
            400,
            "Invalid booking ID"
        );
    }


    const booking = await Booking.findOne({
        _id: bookingId,
        creator: creatorId
    });


    if (!booking) {
        throw createApiError(
            404,
            "Booking not found"
        );
    }


    if (booking.status !== "pending") {
        throw createApiError(
            400,
            `Cannot cancel booking with status '${booking.status}'. Only pending bookings can be cancelled.`
        );
    }


    const updatedBooking = await Booking.findOneAndUpdate(
        {
            _id: booking._id,
            creator: creatorId,
            status: "pending"
        },
        {
            $set: { status: "cancelled" }
        },
        { new: true }
    );

    if (!updatedBooking) {
        const recheck = await Booking.findOne({
            _id: bookingId,
            creator: creatorId
        });

        if (!recheck) {
            throw createApiError(
                404,
                "Booking not found"
            );
        }

        if (recheck.status === "cancelled") {
            return recheck;
        }

        throw createApiError(
            400,
            `Cannot cancel booking with status '${recheck.status}'. Only pending bookings can be cancelled.`
        );
    }

    await cleanupWorkspaceForBooking(updatedBooking._id);

    await createNotificationSafe({
        recipient: updatedBooking.brand,
        sender: creatorId,
        type: "booking:cancelled",
        title: "Application Withdrawn",
        message: "A creator has withdrawn their application for your campaign.",
        entityType: "booking",
        entityId: updatedBooking._id,
        destination: "/brand/bookings",
        metadata: {
            bookingId: updatedBooking._id,
            campaignId: updatedBooking.campaign
        },
        idempotencyKey: `booking:cancelled:${updatedBooking._id}`
    });

    return updatedBooking;
};


// Helper to enrich bookings with BrandProfile (logo, companyName) and CreatorProfile (profileImage)
const isMongooseObjectId = (val) =>
    Boolean(val && (val instanceof mongoose.Types.ObjectId || val?._bsontype === "ObjectID"));

const attachBookingProfiles = async (bookings) => {
    if (!bookings) return bookings;
    const isSingle = !Array.isArray(bookings);
    const bookingList = isSingle ? [bookings] : bookings;
    if (bookingList.length === 0) return bookings;

    const creatorIds = new Set();
    const brandIds = new Set();

    const extractEntityId = (entity) => {
        if (!entity) return null;
        if (typeof entity === "object" && !isMongooseObjectId(entity)) {
            const rawId = entity._id || entity.id;
            if (rawId) {
                return rawId.toString ? rawId.toString() : String(rawId);
            }
            return null;
        }
        if (isMongooseObjectId(entity)) {
            return entity.toString();
        }
        if (typeof entity === "string") {
            const trimmed = entity.trim();
            if (mongoose.Types.ObjectId.isValid(trimmed)) {
                return trimmed;
            }
        }
        if (mongoose.Types.ObjectId.isValid(entity)) {
            return entity.toString ? entity.toString() : String(entity);
        }
        return null;
    };

    bookingList.forEach((b) => {
        const bObj = b?.toObject ? b.toObject() : b;
        if (!bObj) return;
        const cId = extractEntityId(bObj.creator);
        const bId = extractEntityId(bObj.brand);
        if (cId) creatorIds.add(cId);
        if (bId) brandIds.add(bId);
    });

    const isDbConnected = mongoose.connection?.readyState === 1;
    const [creatorProfiles, brandProfiles, reviewStats] = await Promise.all([
        creatorIds.size > 0 && isDbConnected
            ? CreatorProfile.find({
                $or: [
                    { user: { $in: Array.from(creatorIds).map((id) => new mongoose.Types.ObjectId(id)) } },
                    { _id: { $in: Array.from(creatorIds).map((id) => new mongoose.Types.ObjectId(id)) } }
                ]
            })
                .select("user profileImage category followerCount engagementRate")
                .lean()
            : [],
        brandIds.size > 0 && isDbConnected
            ? BrandProfile.find({
                user: { $in: Array.from(brandIds).map((id) => new mongoose.Types.ObjectId(id)) }
            })
                .select("user logo companyName")
                .lean()
            : [],
        creatorIds.size > 0 && isDbConnected
            ? Review.aggregate([
                {
                    $match: {
                        reviewee: { $in: Array.from(creatorIds).map((id) => new mongoose.Types.ObjectId(id)) }
                    }
                },
                {
                    $group: {
                        _id: "$reviewee",
                        averageRating: { $avg: "$rating" },
                        reviewCount: { $sum: 1 }
                    }
                }
            ])
            : []
    ]);

    const creatorMap = new Map();
    creatorProfiles.forEach((cp) => {
        if (cp?.user) creatorMap.set(cp.user.toString(), cp);
        if (cp?._id) creatorMap.set(cp._id.toString(), cp);
    });

    const reviewMap = new Map();
    (reviewStats || []).forEach((r) => {
        if (r?._id) reviewMap.set(r._id.toString(), r);
    });

    const brandMap = new Map();
    brandProfiles.forEach((bp) => {
        if (bp?.user) brandMap.set(bp.user.toString(), bp);
    });

    const enriched = bookingList.map((b) => {
        const bObj = b?.toObject ? b.toObject() : { ...b };
        const cId = extractEntityId(bObj.creator);
        const bId = extractEntityId(bObj.brand);

        const cp = cId ? creatorMap.get(cId) : null;
        const profileImage = cp?.profileImage || "";
        const rStat = cId ? reviewMap.get(cId) : null;
        const avgRating = rStat?.averageRating ? Math.round(rStat.averageRating * 10) / 10 : null;
        const reviewCount = rStat?.reviewCount || 0;
        const category = cp?.category || "";
        const followerCount = cp?.followerCount !== undefined ? cp.followerCount : null;
        const engagementRate = cp?.engagementRate !== undefined ? cp.engagementRate : null;
        const bp = bId ? brandMap.get(bId) : null;

        if (bObj.creator) {
            const isPopulated = typeof bObj.creator === "object" && !isMongooseObjectId(bObj.creator);
            if (isPopulated) {
                const creatorBase = bObj.creator.toObject ? bObj.creator.toObject() : { ...bObj.creator };
                bObj.creator = {
                    ...creatorBase,
                    profileImage: profileImage || creatorBase.profileImage || "",
                    avatar: profileImage || creatorBase.avatar || "",
                    image: profileImage || creatorBase.image || "",
                    category: category || creatorBase.category || "",
                    followerCount: followerCount !== null ? followerCount : (creatorBase.followerCount ?? null),
                    followers: followerCount !== null ? followerCount : (creatorBase.followers ?? null),
                    engagementRate: engagementRate !== null ? engagementRate : (creatorBase.engagementRate ?? null),
                    rating: avgRating !== null ? avgRating : (creatorBase.rating ?? null),
                    reviewCount: reviewCount || creatorBase.reviewCount || 0
                };
            } else if (cId) {
                bObj.creator = {
                    _id: bObj.creator,
                    profileImage,
                    avatar: profileImage,
                    image: profileImage,
                    category,
                    followerCount,
                    followers: followerCount,
                    engagementRate,
                    rating: avgRating,
                    reviewCount
                };
            }
        }

        bObj.creatorProfile = cp ? {
            ...cp,
            followerCount,
            engagementRate
        } : (bObj.creatorProfile || null);

        if (bObj.brand) {
            const isPopulated = typeof bObj.brand === "object" && !isMongooseObjectId(bObj.brand);
            const brandLogo = bp?.logo || "";
            const companyName = bp?.companyName || "";

            if (isPopulated) {
                const brandBase = bObj.brand.toObject ? bObj.brand.toObject() : { ...bObj.brand };
                bObj.brand = {
                    ...brandBase,
                    logo: brandLogo || brandBase.logo || "",
                    profileImage: brandLogo || brandBase.profileImage || "",
                    avatar: brandLogo || brandBase.avatar || "",
                    image: brandLogo || brandBase.image || "",
                    companyName: companyName || brandBase.companyName || ""
                };
            } else if (bId) {
                bObj.brand = {
                    _id: bObj.brand,
                    logo: brandLogo,
                    profileImage: brandLogo,
                    avatar: brandLogo,
                    image: brandLogo,
                    companyName
                };
            }
        }

        return bObj;
    });

    return isSingle ? enriched[0] : enriched;
};

const attachBookingCreatorProfiles = attachBookingProfiles;

const getBrandBookingsService = async (brandId, query = {}) => {

    const {
        page = 1,
        limit = 10,
        status,
        campaignId,
        initiatedBy
    } = query;


    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);


    const filter = {
        brand: brandId
    };


    if (status && status.trim()) {
        filter.status = status.trim();
    }


    if (campaignId && mongoose.Types.ObjectId.isValid(campaignId)) {
        filter.campaign = campaignId;
    }


    if (initiatedBy && ["creator", "brand"].includes(initiatedBy.trim())) {
        if (initiatedBy.trim() === "creator") {
            filter.$or = [
                { initiatedBy: "creator" },
                { initiatedBy: { $exists: false } },
                { initiatedBy: null }
            ];
        } else {
            filter.initiatedBy = "brand";
        }
    }


    const [bookings, totalItems] = await Promise.all([
        Booking.find(filter)
            .populate("creator", "name email")
            .populate("campaign", "title description category budget minBudget maxBudget currency deadline platform coverImage requiredCreators deliverables creatorRequirements audienceTargeting usageRights")
            .populate("service", "title price deliveryTime revisions")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),

        Booking.countDocuments(filter)
    ]);

    const enrichedBookings = await attachBookingCreatorProfiles(bookings);

    return {
        bookings: enrichedBookings,
        pagination: getPaginationData(
            currentPage,
            itemsPerPage,
            totalItems
        )
    };
};


// Gets a single booking belonging to the authenticated brand.
const getBrandBookingByIdService = async (brandId, bookingId) => {

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw createApiError(
            400,
            "Invalid booking ID"
        );
    }


    const booking = await Booking.findOne({
        _id: bookingId,
        brand: brandId
    })
        .populate("creator", "name email")
        .populate("campaign")
        .populate("service");


    if (!booking) {
        throw createApiError(
            404,
            "Booking not found"
        );
    }

    const bObj = booking.toObject ? booking.toObject() : { ...booking };
    return await attachBookingCreatorProfiles(bObj);
};


// Updates a booking status (accept/reject) by brand.
const updateBrandBookingStatusService = async (brandId, bookingId, newStatus) => {

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw createApiError(
            400,
            "Invalid booking ID"
        );
    }

    if (newStatus === "accepted") {
        // Enforce active subscription or free trial before accepting applications
        const entitlement = await evaluateBrandEntitlement(brandId);
        if (!entitlement.hasEntitlement) {
            throw createApiError(
                403,
                "An active subscription or free trial is required to accept booking applications and launch new collaborations. Please upgrade your plan."
            );
        }
    }

    const session = await mongoose.startSession();
    let updatedBookingResult = null;

    try {
        await session.withTransaction(async () => {
            const booking = await Booking.findOne({
                _id: bookingId,
                brand: brandId
            }).session(session);

            if (!booking) {
                throw createApiError(
                    404,
                    "Booking not found"
                );
            }

            if (booking.status !== "pending") {
                throw createApiError(
                    400,
                    `Cannot update status for booking that is already '${booking.status}'`
                );
            }

            if (booking.initiatedBy === "brand") {
                throw createApiError(
                    400,
                    "You cannot accept or reject a booking proposal initiated by your own brand"
                );
            }

            if (newStatus === "accepted") {
                if (!booking.campaign || !mongoose.Types.ObjectId.isValid(booking.campaign)) {
                    throw createApiError(
                        400,
                        "Cannot accept booking: Invalid or missing associated campaign"
                    );
                }

                // Coordinate with parent Campaign document using conditional atomic write lock
                const campaignLock = await Campaign.findOneAndUpdate(
                    {
                        _id: booking.campaign,
                        status: { $in: ["published", "in_progress", "paused"] },
                        "moderation.isRestricted": { $ne: true }
                    },
                    {
                        $inc: { __v: 1 }
                    },
                    { session, new: true }
                );

                if (!campaignLock) {
                    const existingCamp = await Campaign.findById(booking.campaign).session(session);
                    if (!existingCamp) {
                        throw createApiError(
                            404,
                            "Parent campaign not found or has been deleted"
                        );
                    }

                    if (existingCamp.moderation?.isRestricted) {
                        throw createApiError(
                            400,
                            `Cannot accept booking: Campaign is under administrative moderation review${existingCamp.moderation.restrictionReason ? ` (Reason: "${existingCamp.moderation.restrictionReason}")` : ""}`
                        );
                    }

                    throw createApiError(
                        400,
                        `Cannot accept booking: Campaign is ${existingCamp.status} and cannot accept new collaborations`
                    );
                }

                const updatedBooking = await Booking.findOneAndUpdate(
                    {
                        _id: booking._id,
                        brand: brandId,
                        status: "pending"
                    },
                    {
                        $set: { status: newStatus }
                    },
                    { session, new: true }
                );

                if (!updatedBooking) {
                    throw createApiError(
                        400,
                        "Booking status could not be updated or was concurrently modified"
                    );
                }

                // Initialize workspace inside the same atomic transaction
                await createWorkspaceForAcceptedBooking(updatedBooking, { session });
                updatedBookingResult = updatedBooking;
            } else if (newStatus === "rejected") {
                const updatedBooking = await Booking.findOneAndUpdate(
                    {
                        _id: booking._id,
                        brand: brandId,
                        status: "pending"
                    },
                    {
                        $set: { status: newStatus }
                    },
                    { session, new: true }
                );

                if (!updatedBooking) {
                    throw createApiError(
                        400,
                        "Booking status could not be updated or was concurrently modified"
                    );
                }

                updatedBookingResult = updatedBooking;
            } else {
                throw createApiError(
                    400,
                    `Invalid status '${newStatus}'`
                );
            }
        });
    } finally {
        await session.endSession();
    }

    if (newStatus === "rejected" && updatedBookingResult) {
        await cleanupWorkspaceForBooking(updatedBookingResult._id);
    }

    // External notifications executed strictly post-commit
    if (updatedBookingResult) {
        await createNotificationSafe({
            recipient: updatedBookingResult.creator,
            sender: brandId,
            type: newStatus === "accepted" ? "booking:accepted" : "booking:rejected",
            title: newStatus === "accepted" ? "Application Accepted!" : "Application Declined",
            message: newStatus === "accepted"
                ? "Your campaign application was accepted! Collaboration workspace has been created."
                : "Your campaign application was declined.",
            entityType: "booking",
            entityId: updatedBookingResult._id,
            destination: newStatus === "accepted" ? "/creator/workspace" : "/creator/campaigns",
            metadata: {
                bookingId: updatedBookingResult._id,
                campaignId: updatedBookingResult.campaign,
                status: newStatus
            },
            idempotencyKey: `booking:${newStatus}:${updatedBookingResult._id}`
        });
    }

    return updatedBookingResult;
};


// Creates a new booking / direct hire proposal from a brand.
const createBrandBookingService = async (brandId, bookingData) => {

    // 0. Verify Brand Subscription Entitlement
    const entitlement = await evaluateBrandEntitlement(brandId);
    if (!entitlement.hasEntitlement) {
        throw createApiError(
            403,
            "An active subscription or free trial is required to send new collaboration proposals. Please upgrade your subscription plan."
        );
    }

    const {
        creatorId,
        serviceId,
        campaignId,
        proposedPrice,
        message
    } = bookingData;

    const session = await mongoose.startSession();
    let createdBooking = null;
    let campaignDocForNotif = null;
    let finalPriceForNotif = 0;

    try {
        await session.withTransaction(async () => {
            // 1. Verify campaign exists, belongs to this brand, and is published or in_progress.
            // Coordinate with parent Campaign document using conditional atomic update
            const campaign = await Campaign.findOneAndUpdate(
                {
                    _id: campaignId,
                    brand: brandId,
                    status: { $in: ["published", "in_progress"] },
                    "moderation.isRestricted": { $ne: true }
                },
                {
                    $inc: { __v: 1 }
                },
                { session, new: true }
            );

            if (!campaign) {
                const existingCamp = await Campaign.findById(campaignId).session(session);
                if (!existingCamp || existingCamp.brand.toString() !== brandId.toString()) {
                    throw createApiError(
                        404,
                        "Campaign not found or does not belong to your brand"
                    );
                }

                if (existingCamp.moderation?.isRestricted) {
                    throw createApiError(
                        400,
                        "Cannot create proposal: Campaign is under administrative moderation"
                    );
                }

                throw createApiError(
                    400,
                    "Campaign is not open for bookings"
                );
            }

            // 2. Prevent self-booking.
            if (brandId.toString() === creatorId.toString()) {
                throw createApiError(
                    400,
                    "You cannot book yourself"
                );
            }

            // 3. Verify creator account exists with role 'creator'.
            const creatorUser = await Auth.findOne({
                _id: creatorId,
                role: "creator"
            }).session(session);

            if (!creatorUser) {
                throw createApiError(
                    404,
                    "Creator account not found or is not a creator"
                );
            }

            // 4. Verify creator has an active, public profile.
            const creatorProfile = await CreatorProfile.findOne({
                user: creatorId,
                isPublic: true
            }).session(session);

            if (!creatorProfile) {
                throw createApiError(
                    400,
                    "Creator profile not found or is private"
                );
            }

            // 5. Verify selected creator service exists, is active, and belongs to creator.
            const service = await CreatorService.findOne({
                _id: serviceId,
                creator: creatorId,
                isActive: true
            }).session(session);

            if (!service) {
                throw createApiError(
                    400,
                    "Selected service does not exist, is inactive, or does not belong to this creator"
                );
            }

            // 6. Prevent duplicate booking/application for the same campaign + creator.
            const existingBooking = await Booking.findOne({
                campaign: campaignId,
                creator: creatorId
            }).session(session);

            if (existingBooking) {
                throw createApiError(
                    400,
                    `A booking or application already exists for this creator on this campaign (current status: ${existingBooking.status})`
                );
            }

            // 7. Determine agreed price (proposedPrice if provided, otherwise service default price).
            const finalPrice = (proposedPrice !== undefined && proposedPrice !== null && proposedPrice !== "")
                ? Number(proposedPrice)
                : service.price;

            // 8. Create booking copying deliverables and deadline from campaign.
            const [booking] = await Booking.create(
                [
                    {
                        brand: brandId,
                        creator: creatorId,
                        campaign: campaignId,
                        service: serviceId,
                        revisions: (typeof service?.revisions === "number" && service.revisions >= 0)
                            ? service.revisions
                            : 1,
                        agreedPrice: finalPrice,
                        currency: service.currency || "INR",
                        message: message ? message.trim() : "",
                        deliverables: campaign.deliverables,
                        deadline: campaign.deadline,
                        status: "pending",
                        initiatedBy: "brand"
                    }
                ],
                { session }
            );

            createdBooking = booking;
            campaignDocForNotif = campaign;
            finalPriceForNotif = finalPrice;
        });
    } finally {
        await session.endSession();
    }

    // External side effects and notifications executed strictly post-commit
    if (createdBooking && campaignDocForNotif) {
        await createNotificationSafe({
            recipient: creatorId,
            sender: brandId,
            type: "booking:proposal_received",
            title: "New Collaboration Proposal",
            message: `You received a new collaboration proposal for "${campaignDocForNotif.title || 'Campaign'}".`,
            entityType: "booking",
            entityId: createdBooking._id,
            destination: "/creator/campaigns",
            metadata: {
                campaignId: campaignDocForNotif._id,
                campaignTitle: campaignDocForNotif.title,
                serviceId: serviceId,
                agreedPrice: finalPriceForNotif
            },
            idempotencyKey: `booking:proposal_received:${createdBooking._id}`
        });
    }

    return await attachBookingProfiles(createdBooking);
};


// Updates a brand-initiated booking status (accept/reject) by creator.
const updateCreatorBookingStatusService = async (creatorId, bookingId, newStatus) => {

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw createApiError(
            400,
            "Invalid booking ID"
        );
    }

    const session = await mongoose.startSession();
    let updatedBookingResult = null;

    try {
        await session.withTransaction(async () => {
            const booking = await Booking.findOne({
                _id: bookingId,
                creator: creatorId
            }).session(session);

            if (!booking) {
                throw createApiError(
                    404,
                    "Booking not found"
                );
            }

            if (booking.status !== "pending") {
                throw createApiError(
                    400,
                    `Cannot update status for booking that is already '${booking.status}'`
                );
            }

            if (booking.initiatedBy !== "brand") {
                throw createApiError(
                    400,
                    "You cannot accept or reject a booking application initiated by you"
                );
            }

            if (newStatus === "accepted") {
                // Enforce active subscription or free trial before accepting applications
                const targetBrandId = booking.brand?._id || booking.brand;
                const entitlement = await evaluateBrandEntitlement(targetBrandId);
                if (!entitlement.hasEntitlement) {
                    throw createApiError(
                        403,
                        "An active subscription or free trial is required to accept booking applications and launch new collaborations. Please upgrade your plan."
                    );
                }

                if (!booking.campaign || !mongoose.Types.ObjectId.isValid(booking.campaign)) {
                    throw createApiError(
                        400,
                        "Cannot accept proposal: Invalid or missing associated campaign"
                    );
                }

                // Coordinate with parent Campaign document using conditional atomic write lock
                const campaignLock = await Campaign.findOneAndUpdate(
                    {
                        _id: booking.campaign,
                        status: { $in: ["published", "in_progress", "paused"] },
                        "moderation.isRestricted": { $ne: true }
                    },
                    {
                        $inc: { __v: 1 }
                    },
                    { session, new: true }
                );

                if (!campaignLock) {
                    const existingCamp = await Campaign.findById(booking.campaign).session(session);
                    if (!existingCamp) {
                        throw createApiError(
                            404,
                            "Parent campaign not found or has been deleted"
                        );
                    }

                    if (existingCamp.moderation?.isRestricted) {
                        throw createApiError(
                            400,
                            `Cannot accept proposal: Campaign is under administrative moderation review${existingCamp.moderation.restrictionReason ? ` (Reason: "${existingCamp.moderation.restrictionReason}")` : ""}`
                        );
                    }

                    throw createApiError(
                        400,
                        `Cannot accept proposal: Campaign is ${existingCamp.status} and cannot accept new collaborations`
                    );
                }

                const updatedBooking = await Booking.findOneAndUpdate(
                    {
                        _id: booking._id,
                        creator: creatorId,
                        status: "pending"
                    },
                    {
                        $set: { status: newStatus }
                    },
                    { session, new: true }
                );

                if (!updatedBooking) {
                    throw createApiError(
                        400,
                        "Booking status could not be updated or was concurrently modified"
                    );
                }

                // Initialize workspace inside the same atomic transaction
                await createWorkspaceForAcceptedBooking(updatedBooking, { session });
                updatedBookingResult = updatedBooking;
            } else if (newStatus === "rejected") {
                const updatedBooking = await Booking.findOneAndUpdate(
                    {
                        _id: booking._id,
                        creator: creatorId,
                        status: "pending"
                    },
                    {
                        $set: { status: newStatus }
                    },
                    { session, new: true }
                );

                if (!updatedBooking) {
                    throw createApiError(
                        400,
                        "Booking status could not be updated or was concurrently modified"
                    );
                }

                updatedBookingResult = updatedBooking;
            } else {
                throw createApiError(
                    400,
                    `Invalid status '${newStatus}'`
                );
            }
        });
    } finally {
        await session.endSession();
    }

    if (newStatus === "rejected" && updatedBookingResult) {
        await cleanupWorkspaceForBooking(updatedBookingResult._id);
    }

    // External notifications executed strictly post-commit
    if (updatedBookingResult) {
        await createNotificationSafe({
            recipient: updatedBookingResult.brand,
            sender: creatorId,
            type: newStatus === "accepted" ? "booking:accepted" : "booking:rejected",
            title: newStatus === "accepted" ? "Proposal Accepted!" : "Proposal Declined",
            message: newStatus === "accepted"
                ? "Creator accepted your collaboration proposal! Workspace is ready."
                : "Creator declined your collaboration proposal.",
            entityType: "booking",
            entityId: updatedBookingResult._id,
            destination: newStatus === "accepted" ? "/brand/workspace" : "/brand/bookings",
            metadata: {
                bookingId: updatedBookingResult._id,
                campaignId: updatedBookingResult.campaign,
                status: newStatus
            },
            idempotencyKey: `booking:${newStatus}:${updatedBookingResult._id}`
        });
    }

    return updatedBookingResult;
};


export {
    createBookingService,
    createBrandBookingService,
    getCreatorBookingsService,
    getCreatorBookingByIdService,
    cancelCreatorBookingService,
    updateCreatorBookingStatusService,
    getBrandBookingsService,
    getBrandBookingByIdService,
    updateBrandBookingStatusService
};

