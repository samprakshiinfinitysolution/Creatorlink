import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";

import {
    createBookingService,
    createBrandBookingService,
    getCreatorBookingsService,
    getCreatorBookingByIdService,
    cancelCreatorBookingService,
    updateCreatorBookingStatusService,
    getBrandBookingsService,
    getBrandBookingByIdService,
    updateBrandBookingStatusService
} from "./booking.service.js";


// =========================================================
// CREATOR CONTROLLERS
// =========================================================

// Creator submits a booking application for a published campaign.
const createBooking = asyncHandler(async (req, res) => {

    const booking = await createBookingService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        201,
        "Booking application submitted successfully",
        booking
    );
});


// Creator views list of their submitted bookings.
const getCreatorBookings = asyncHandler(async (req, res) => {

    const result = await getCreatorBookingsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Bookings fetched successfully",
        result
    );
});


// Creator views a single booking detail.
const getCreatorBookingById = asyncHandler(async (req, res) => {

    const booking = await getCreatorBookingByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Booking fetched successfully",
        booking
    );
});


// Creator cancels a pending booking application.
const cancelCreatorBooking = asyncHandler(async (req, res) => {

    const booking = await cancelCreatorBookingService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Booking cancelled successfully",
        booking
    );
});


// Creator accepts or rejects a brand-initiated booking proposal.
const updateCreatorBookingStatus = asyncHandler(async (req, res) => {

    const booking = await updateCreatorBookingStatusService(
        req.user.userId,
        req.params.id,
        req.body.status
    );

    return sendResponse(
        res,
        200,
        `Booking proposal ${req.body.status} successfully`,
        booking
    );
});


// =========================================================
// BRAND CONTROLLERS
// =========================================================

// Brand views list of received bookings/applications for their campaigns.
const getBrandBookings = asyncHandler(async (req, res) => {

    const result = await getBrandBookingsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Bookings fetched successfully",
        result
    );
});


// Brand views single received booking detail.
const getBrandBookingById = asyncHandler(async (req, res) => {

    const booking = await getBrandBookingByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Booking fetched successfully",
        booking
    );
});


// Brand accepts or rejects a pending booking application.
const updateBrandBookingStatus = asyncHandler(async (req, res) => {

    const booking = await updateBrandBookingStatusService(
        req.user.userId,
        req.params.id,
        req.body.status
    );

    return sendResponse(
        res,
        200,
        `Booking application ${req.body.status} successfully`,
        booking
    );
});


// Brand submits a direct booking / hire proposal for a creator service.
const createBrandBooking = asyncHandler(async (req, res) => {

    const booking = await createBrandBookingService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        201,
        "Booking proposal submitted successfully",
        booking
    );
});


export {
    createBooking,
    createBrandBooking,
    getCreatorBookings,
    getCreatorBookingById,
    cancelCreatorBooking,
    updateCreatorBookingStatus,
    getBrandBookings,
    getBrandBookingById,
    updateBrandBookingStatus
};

