import mongoose from "mongoose";

import Conversation from "./conversation.model.js";
import Message from "./message.model.js";
import Booking from "../booking/booking.model.js";
import Workspace from "../workspace/workspace.model.js";
import createApiError from "../../utils/ApiError.js";
import {
    getPagination,
    getPaginationData
} from "../../utils/pagination.js";

// Helper function to verify booking ownership, accepted status, workspace existence, and participant eligibility
const verifyBookingAccess = async (userId, bookingId, recipientId, campaignId) => {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw createApiError(400, "Invalid booking ID");
    }

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        throw createApiError(400, "Invalid recipient ID");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw createApiError(404, "Booking not found");
    }

    const brandIdStr = booking.brand.toString();
    const creatorIdStr = booking.creator.toString();
    const userIdStr = userId.toString();
    const recipientIdStr = recipientId.toString();

    // Authenticated user must be either brand or creator of this booking
    if (userIdStr !== brandIdStr && userIdStr !== creatorIdStr) {
        throw createApiError(403, "Access denied. You are not a participant in this booking.");
    }

    // Recipient must be the other participant of this booking
    const expectedRecipientId = userIdStr === brandIdStr ? creatorIdStr : brandIdStr;
    if (recipientIdStr !== expectedRecipientId) {
        throw createApiError(400, "Recipient does not match the other participant of this booking.");
    }

    // FIX 1: Booking status must be "accepted"
    if (booking.status !== "accepted") {
        throw createApiError(
            403,
            "Messaging is available only after the booking is accepted."
        );
    }

    // FIX 3: Campaign consistency check if client passed campaignId
    if (campaignId) {
        if (!booking.campaign) {
            throw createApiError(
                400,
                "Booking is not linked to a campaign."
            );
        }

        if (
            !mongoose.Types.ObjectId.isValid(campaignId) ||
            campaignId.toString() !== booking.campaign.toString()
        ) {
            throw createApiError(
                400,
                "Campaign does not match the booking."
            );
        }
    }

    // FIX 2: Workspace must exist for this booking
    const workspace = await Workspace.findOne({
        booking: bookingId
    });

    if (!workspace) {
        throw createApiError(
            403,
            "Messaging is available only after the workspace is created."
        );
    }

    return booking;
};

// Common service to send a message
const sendMessageService = async (senderId, payload) => {
    const { recipientId, bookingId, campaignId, message, attachments } = payload;

    // 1. Verify booking access, accepted status, campaign consistency, and workspace existence
    const booking = await verifyBookingAccess(senderId, bookingId, recipientId, campaignId);

    const resolvedCampaignId = booking.campaign;

    // 2. Lookup existing conversation for this specific booking
    let conversation = await Conversation.findOne({
        booking: bookingId
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, recipientId],
            booking: bookingId,
            campaign: resolvedCampaignId,
            lastMessage: message.trim(),
            lastMessageAt: new Date()
        });
    } else {
        const participantStrs = conversation.participants.map((p) => p.toString());
        const senderIdStr = senderId.toString();
        const recipientIdStr = recipientId.toString();
        const brandIdStr = booking.brand.toString();
        const creatorIdStr = booking.creator.toString();

        const hasSender = participantStrs.includes(senderIdStr);
        const hasRecipient = participantStrs.includes(recipientIdStr);

        if (!hasSender || !hasRecipient) {
            throw createApiError(403, "Access denied. Both sender and recipient must be participants in this conversation.");
        }

        const hasBrand = participantStrs.includes(brandIdStr);
        const hasCreator = participantStrs.includes(creatorIdStr);

        if (!hasBrand || !hasCreator || participantStrs.length !== 2) {
            throw createApiError(403, "Access denied. Conversation participants do not match the booking brand and creator.");
        }

        conversation.lastMessage = message.trim();
        conversation.lastMessageAt = new Date();
        await conversation.save();
    }

    // 3. Create new message document
    const newMessage = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        receiver: recipientId,
        message: message.trim(),
        attachments: Array.isArray(attachments) ? attachments : [],
        isRead: false
    });

    return {
        message: newMessage,
        conversationId: conversation._id
    };
};

// Common service to get conversations list for user
const getConversationsService = async (userId, query = {}) => {
    const { page, limit } = query;
    const { page: currentPage, limit: itemsPerPage, skip } = getPagination(page, limit);

    // Auto-backfill conversations for any accepted bookings belonging to this user
    const acceptedBookings = await Booking.find({
        $or: [{ brand: userId }, { creator: userId }],
        status: "accepted"
    }).select("_id brand creator campaign updatedAt");

    if (acceptedBookings.length > 0) {
        const bulkOps = acceptedBookings.map((b) => ({
            updateOne: {
                filter: { booking: b._id },
                update: {
                    $setOnInsert: {
                        participants: [b.brand, b.creator],
                        booking: b._id,
                        campaign: b.campaign,
                        lastMessage: "",
                        lastMessageAt: b.updatedAt || new Date()
                    }
                },
                upsert: true
            }
        }));
        await Conversation.bulkWrite(bulkOps);
    }

    const filter = {
        participants: userId
    };

    const [conversations, totalItems] = await Promise.all([
        Conversation.find(filter)
            .populate("participants", "name email role")
            .populate("booking", "agreedPrice status deliverables startDate deadline")
            .populate("campaign", "title category platform budget")
            .sort({ lastMessageAt: -1, updatedAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),
        Conversation.countDocuments(filter)
    ]);

    return {
        conversations,
        pagination: getPaginationData(currentPage, itemsPerPage, totalItems)
    };
};

// Common service to get single conversation and message thread
const getConversationByIdService = async (userId, conversationId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw createApiError(400, "Invalid conversation ID");
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
    })
        .populate("participants", "name email role")
        .populate("booking")
        .populate("campaign");

    if (!conversation) {
        throw createApiError(404, "Conversation not found or access denied");
    }

    const messages = await Message.find({
        conversation: conversationId
    })
        .populate("sender", "name email role")
        .populate("receiver", "name email role")
        .sort({ createdAt: 1 });

    return {
        conversation,
        messages
    };
};

// Common service to mark unread messages in conversation as read
const markConversationReadService = async (userId, conversationId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw createApiError(400, "Invalid conversation ID");
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
    });

    if (!conversation) {
        throw createApiError(404, "Conversation not found or access denied");
    }

    const result = await Message.updateMany(
        {
            conversation: conversationId,
            receiver: userId,
            isRead: false
        },
        {
            $set: { isRead: true }
        }
    );

    return {
        modifiedCount: result.modifiedCount
    };
};

// =========================================================
// CREATOR SERVICES
// =========================================================
const getCreatorConversationsService = (creatorId, query) =>
    getConversationsService(creatorId, query);

const getCreatorConversationByIdService = (creatorId, conversationId) =>
    getConversationByIdService(creatorId, conversationId);

const sendCreatorMessageService = (creatorId, payload) =>
    sendMessageService(creatorId, payload);

const markCreatorConversationReadService = (creatorId, conversationId) =>
    markConversationReadService(creatorId, conversationId);

// =========================================================
// BRAND SERVICES
// =========================================================
const getBrandConversationsService = (brandId, query) =>
    getConversationsService(brandId, query);

const getBrandConversationByIdService = (brandId, conversationId) =>
    getConversationByIdService(brandId, conversationId);

const sendBrandMessageService = (brandId, payload) =>
    sendMessageService(brandId, payload);

const markBrandConversationReadService = (brandId, conversationId) =>
    markConversationReadService(brandId, conversationId);

export {
    getCreatorConversationsService,
    getCreatorConversationByIdService,
    sendCreatorMessageService,
    markCreatorConversationReadService,
    getBrandConversationsService,
    getBrandConversationByIdService,
    sendBrandMessageService,
    markBrandConversationReadService
};
