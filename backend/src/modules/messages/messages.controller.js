import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";

import {
    getCreatorConversationsService,
    getCreatorConversationByIdService,
    sendCreatorMessageService,
    markCreatorConversationReadService,
    getBrandConversationsService,
    getBrandConversationByIdService,
    sendBrandMessageService,
    markBrandConversationReadService
} from "./messages.service.js";

// =========================================================
// CREATOR MESSAGES CONTROLLERS
// =========================================================

// Creator views list of their conversations.
const getCreatorConversations = asyncHandler(async (req, res) => {
    const result = await getCreatorConversationsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Conversations fetched successfully",
        result
    );
});

// Creator views single conversation and message thread.
const getCreatorConversationById = asyncHandler(async (req, res) => {
    const result = await getCreatorConversationByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Conversation details fetched successfully",
        result
    );
});

// Creator sends a message to Brand.
const sendCreatorMessage = asyncHandler(async (req, res) => {
    const result = await sendCreatorMessageService(
        req.user.userId,
        req.body
    );

    const io = req.app.get("io");

    if (io) {
        const recipientId = result.message?.receiver?.toString();
        let target = io.to(`conversation:${result.conversationId}`);
        if (recipientId) {
            target = target.to(`user:${recipientId}`);
        }

        target.emit(
            "message:new",
            {
                conversationId: result.conversationId,
                message: result.message
            }
        );
    }


    return sendResponse(
        res,
        201,
        "Message sent successfully",
        result
    );
});

// Creator marks messages in a conversation as read.
const markCreatorConversationRead = asyncHandler(async (req, res) => {
    const result = await markCreatorConversationReadService(
        req.user.userId,
        req.params.id
    );

    const io = req.app.get("io");

    if (io) {
        io.to(`conversation:${req.params.id}`).emit(
            "conversation:read",
            {
                conversationId: req.params.id,
                readerId: req.user.userId
            }
        );
    }

    return sendResponse(
        res,
        200,
        "Messages marked as read",
        result
    );
});

// =========================================================
// BRAND MESSAGES CONTROLLERS
// =========================================================

// Brand views list of their conversations.
const getBrandConversations = asyncHandler(async (req, res) => {
    const result = await getBrandConversationsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Conversations fetched successfully",
        result
    );
});

// Brand views single conversation and message thread.
const getBrandConversationById = asyncHandler(async (req, res) => {
    const result = await getBrandConversationByIdService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Conversation details fetched successfully",
        result
    );
});

// Brand sends a message to Creator.
const sendBrandMessage = asyncHandler(async (req, res) => {
    const result = await sendBrandMessageService(
        req.user.userId,
        req.body
    );

    const io = req.app.get("io");

    if (io) {
        const recipientId = result.message?.receiver?.toString();
        let target = io.to(`conversation:${result.conversationId}`);
        if (recipientId) {
            target = target.to(`user:${recipientId}`);
        }

        target.emit(
            "message:new",
            {
                conversationId: result.conversationId,
                message: result.message
            }
        );
    }

    return sendResponse(
        res,
        201,
        "Message sent successfully",
        result
    );
});

// Brand marks messages in a conversation as read.
const markBrandConversationRead = asyncHandler(async (req, res) => {
    const result = await markBrandConversationReadService(
        req.user.userId,
        req.params.id
    );

    const io = req.app.get("io");

    if (io) {
        io.to(`conversation:${req.params.id}`).emit(
            "conversation:read",
            {
                conversationId: req.params.id,
                readerId: req.user.userId
            }
        );
    }

    return sendResponse(
        res,
        200,
        "Messages marked as read",
        result
    );
});

export {
    getCreatorConversations,
    getCreatorConversationById,
    sendCreatorMessage,
    markCreatorConversationRead,
    getBrandConversations,
    getBrandConversationById,
    sendBrandMessage,
    markBrandConversationRead
};
