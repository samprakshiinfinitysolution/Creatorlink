import express from "express";

import authenticateUser from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
    createBooking,
    getCreatorBookings,
    getCreatorBookingById,
    cancelCreatorBooking,
    getBrandBookings,
    getBrandBookingById,
    updateBrandBookingStatus
} from "./booking.controller.js";

import {
    validateCreateBooking,
    validateUpdateBookingStatus,
    validateGetBookingsQuery
} from "./booking.validation.js";


// =========================================================
// CREATOR BOOKING ROUTER
// =========================================================
const creatorBookingRouter = express.Router();

creatorBookingRouter.use(
    authenticateUser,
    authorizeRoles("creator")
);

// Creator submits a booking application.
creatorBookingRouter.post(
    "/",
    validateCreateBooking,
    createBooking
);

// Creator fetches their bookings list.
creatorBookingRouter.get(
    "/",
    validateGetBookingsQuery,
    getCreatorBookings
);

// Creator fetches single booking by ID.
creatorBookingRouter.get(
    "/:id",
    getCreatorBookingById
);

// Creator cancels pending booking.
creatorBookingRouter.patch(
    "/:id/cancel",
    cancelCreatorBooking
);


// =========================================================
// BRAND BOOKING ROUTER
// =========================================================
const brandBookingRouter = express.Router();

brandBookingRouter.use(
    authenticateUser,
    authorizeRoles("brand")
);

// Brand fetches list of received bookings/applications.
brandBookingRouter.get(
    "/",
    validateGetBookingsQuery,
    getBrandBookings
);

// Brand fetches single received booking by ID.
brandBookingRouter.get(
    "/:id",
    getBrandBookingById
);

// Brand accepts or rejects a pending booking.
brandBookingRouter.patch(
    "/:id/status",
    validateUpdateBookingStatus,
    updateBrandBookingStatus
);


export {
    creatorBookingRouter,
    brandBookingRouter
};
