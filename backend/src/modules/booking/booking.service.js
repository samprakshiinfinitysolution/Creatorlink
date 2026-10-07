import mongoose from "mongoose";

import Booking from "./booking.model.js";
import Campaign from "../brand/campaigns/campaign.model.js";
import CreatorService from "../creator/services/services.model.js";
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


    // 1. Verify selected creator service exists, is active, and belongs to creator.
    const service = await CreatorService.findOne({
        _id: serviceId,
        creator: creatorId,
        isActive: true
    });

    if (!service) {
        throw createApiError(
            400,
            "Selected service does not exist, is inactive, or does not belong to you"
        );
    }


    // 2. Verify campaign exists and is published.
    const campaign = await Campaign.findOne({
        _id: campaignId,
        status: "published"
    });

    if (!campaign) {
        throw createApiError(
            404,
            "Campaign not found or is not open for applications"
        );
    }


    const brandId = campaign.brand;


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
    });

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
    const booking = await Booking.create({
        brand: brandId,
        creator: creatorId,
        campaign: campaignId,
        service: serviceId,
        agreedPrice: finalPrice,
        currency: service.currency || "INR",
        message: message ? message.trim() : "",
        deliverables: campaign.deliverables,
        deadline: campaign.deadline,
        status: "pending"
    });


    return booking;
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
            .populate("campaign", "title category budget deadline platform")
            .populate("service", "title price deliveryTime")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),

        Booking.countDocuments(filter)
    ]);


    return {
        bookings,
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


    return booking;
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


    booking.status = "cancelled";
    await booking.save();

    return booking;
};


// Gets bookings received by the authenticated brand for their campaigns.
const getBrandBookingsService = async (brandId, query = {}) => {

    const {
        page = 1,
        limit = 10,
        status,
        campaignId
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


    const [bookings, totalItems] = await Promise.all([
        Booking.find(filter)
            .populate("creator", "name email")
            .populate("campaign", "title category budget deadline platform")
            .populate("service", "title price deliveryTime")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),

        Booking.countDocuments(filter)
    ]);


    return {
        bookings,
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


    return booking;
};


// Updates a booking status (accept/reject) by brand.
const updateBrandBookingStatusService = async (brandId, bookingId, newStatus) => {

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw createApiError(
            400,
            "Invalid booking ID"
        );
    }


    const booking = await Booking.findOne({
        _id: bookingId,
        brand: brandId
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
            `Cannot update status for booking that is already '${booking.status}'`
        );
    }


    booking.status = newStatus;
    await booking.save();

    return booking;
};


export {
    createBookingService,
    getCreatorBookingsService,
    getCreatorBookingByIdService,
    cancelCreatorBookingService,
    getBrandBookingsService,
    getBrandBookingByIdService,
    updateBrandBookingStatusService
};
