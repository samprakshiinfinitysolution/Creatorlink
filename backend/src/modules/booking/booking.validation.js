import mongoose from "mongoose";
import createApiError from "../../utils/ApiError.js";

// Allowed booking status values.
const allowedStatuses = [
    "pending",
    "accepted",
    "rejected",
    "cancelled",
    "in_progress",
    "completed"
];

// Valid statuses that a brand can set when updating a booking application.
const brandAllowedStatuses = [
    "accepted",
    "rejected"
];


// Validates booking creation data from creator.
const validateCreateBooking = (req, res, next) => {

    const {
        campaignId,
        serviceId,
        proposedPrice,
        message
    } = req.body;


    // Check required fields.
    if (!campaignId || !serviceId) {
        throw createApiError(
            400,
            "campaignId and serviceId are required"
        );
    }


    // Validate campaignId.
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        throw createApiError(
            400,
            "Invalid campaignId"
        );
    }


    // Validate serviceId.
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        throw createApiError(
            400,
            "Invalid serviceId"
        );
    }


    // Validate proposedPrice if provided.
    if (proposedPrice !== undefined && proposedPrice !== null && proposedPrice !== "") {
        const parsedPrice = Number(proposedPrice);
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            throw createApiError(
                400,
                "Proposed price must be a non-negative number"
            );
        }
    }


    // Validate message if provided.
    if (
        message !== undefined &&
        (typeof message !== "string" || message.length > 2000)
    ) {
        throw createApiError(
            400,
            "Message must be a string with maximum 2000 characters"
        );
    }


    next();
};


// Validates brand status update data.
const validateUpdateBookingStatus = (req, res, next) => {

    const { status } = req.body;


    if (!status) {
        throw createApiError(
            400,
            "Status is required"
        );
    }


    if (!brandAllowedStatuses.includes(status)) {
        throw createApiError(
            400,
            `Invalid status update. Allowed values: ${brandAllowedStatuses.join(", ")}`
        );
    }


    next();
};


// Validates query parameters for listing bookings.
const validateGetBookingsQuery = (req, res, next) => {

    const {
        page,
        limit,
        status,
        campaignId
    } = req.query;


    if (page !== undefined) {
        const parsedPage = Number(page);
        if (!Number.isInteger(parsedPage) || parsedPage < 1) {
            throw createApiError(
                400,
                "Page must be a valid positive integer"
            );
        }
    }


    if (limit !== undefined) {
        const parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
            throw createApiError(
                400,
                "Limit must be a valid positive integer"
            );
        }
    }


    if (
        campaignId !== undefined &&
        campaignId.trim() !== "" &&
        !mongoose.Types.ObjectId.isValid(campaignId.trim())
    ) {
        throw createApiError(
            400,
            "Invalid campaignId"
        );
    }


    if (
        status !== undefined &&
        status.trim() !== "" &&
        !allowedStatuses.includes(status.trim())
    ) {
        throw createApiError(
            400,
            "Invalid status filter"
        );
    }


    next();
};


export {
    validateCreateBooking,
    validateUpdateBookingStatus,
    validateGetBookingsQuery
};
