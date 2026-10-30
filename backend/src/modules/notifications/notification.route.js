import express from "express";
import authenticateUser from "../../middleware/auth.middleware.js";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead
} from "./notification.controller.js";
import {
    validateNotificationIdParam,
    validateGetNotificationsQuery
} from "./notification.validation.js";

const notificationRouter = express.Router();

// Enforce authentication on all notification endpoints.
notificationRouter.use(authenticateUser);

// Fetch paginated notification feed.
notificationRouter.get(
    "/",
    validateGetNotificationsQuery,
    getNotifications
);

// Fetch unread count for header/sidebar badges.
notificationRouter.get(
    "/unread-count",
    getUnreadNotificationCount
);

// Mark all unread notifications as read (supports ?category= query param).
// Registered BEFORE `/:id/read` so `:id` does not match the literal `read-all`.
notificationRouter.patch(
    "/read-all",
    markAllNotificationsRead
);

// Mark unread notifications for a specific category as read.
notificationRouter.patch(
    "/category/:category/read",
    markAllNotificationsRead
);

// Mark single notification as read.
notificationRouter.patch(
    "/:id/read",
    validateNotificationIdParam,
    markNotificationRead
);

export default notificationRouter;
