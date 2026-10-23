import mongoose from "mongoose";
import createApiError from "../../utils/ApiError.js";

// Validates send message request payload
const validateSendMessage = (req, res, next) => {
    const { recipientId, bookingId, message, attachments, campaignId } = req.body;

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
        throw createApiError(
            400,
            "Valid recipientId is required"
        );
    }

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
        throw createApiError(
            400,
            "Valid bookingId is required"
        );
    }

    if (campaignId !== undefined && campaignId !== null && !mongoose.Types.ObjectId.isValid(campaignId)) {
        throw createApiError(
            400,
            "Invalid campaignId format"
        );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
        throw createApiError(
            400,
            "Message content is required and cannot be empty"
        );
    }

    if (attachments !== undefined && !Array.isArray(attachments)) {
        throw createApiError(
            400,
            "Attachments must be an array of file URLs"
        );
    }

    next();
};

// Validates conversation ID parameter
const validateConversationIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createApiError(
            400,
            "Valid conversation ID is required"
        );
    }

    next();
};

// Validates query parameters for fetching conversations list
const validateGetConversationsQuery = (req, res, next) => {
    const { page, limit } = req.query;

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

    next();
};

export {
    validateSendMessage,
    validateConversationIdParam,
    validateGetConversationsQuery
};
