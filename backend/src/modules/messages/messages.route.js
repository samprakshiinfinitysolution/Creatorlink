import express from "express";

import authenticateUser from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
    getCreatorConversations,
    getCreatorConversationById,
    sendCreatorMessage,
    markCreatorConversationRead,
    getBrandConversations,
    getBrandConversationById,
    sendBrandMessage,
    markBrandConversationRead
} from "./messages.controller.js";

import {
    validateSendMessage,
    validateConversationIdParam,
    validateGetConversationsQuery
} from "./messages.validation.js";

// =========================================================
// CREATOR MESSAGES ROUTER
// =========================================================
const creatorMessagesRouter = express.Router();

creatorMessagesRouter.use(
    authenticateUser,
    authorizeRoles("creator")
);

// Creator fetches conversations list
creatorMessagesRouter.get(
    "/conversations",
    validateGetConversationsQuery,
    getCreatorConversations
);

// Creator fetches single conversation thread
creatorMessagesRouter.get(
    "/conversations/:id",
    validateConversationIdParam,
    getCreatorConversationById
);

// Creator sends message
creatorMessagesRouter.post(
    "/send",
    validateSendMessage,
    sendCreatorMessage
);

// Creator marks conversation messages as read
creatorMessagesRouter.patch(
    "/conversations/:id/read",
    validateConversationIdParam,
    markCreatorConversationRead
);

// =========================================================
// BRAND MESSAGES ROUTER
// =========================================================
const brandMessagesRouter = express.Router();

brandMessagesRouter.use(
    authenticateUser,
    authorizeRoles("brand")
);

// Brand fetches conversations list
brandMessagesRouter.get(
    "/conversations",
    validateGetConversationsQuery,
    getBrandConversations
);

// Brand fetches single conversation thread
brandMessagesRouter.get(
    "/conversations/:id",
    validateConversationIdParam,
    getBrandConversationById
);

// Brand sends message
brandMessagesRouter.post(
    "/send",
    validateSendMessage,
    sendBrandMessage
);

// Brand marks conversation messages as read
brandMessagesRouter.patch(
    "/conversations/:id/read",
    validateConversationIdParam,
    markBrandConversationRead
);

export {
    creatorMessagesRouter,
    brandMessagesRouter
};
