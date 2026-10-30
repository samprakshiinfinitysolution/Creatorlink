import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";
import {
    getNotificationsService,
    getUnreadNotificationCountService,
    markNotificationReadService,
    markAllNotificationsReadService
} from "./notification.service.js";

// Authenticated user views paginated notifications feed.
const getNotifications = asyncHandler(async (req, res) => {
    const result = await getNotificationsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Notifications fetched successfully",
        result
    );
});

// Authenticated user fetches count of unread notifications for badge indicator.
const getUnreadNotificationCount = asyncHandler(async (req, res) => {
    const result = await getUnreadNotificationCountService(
        req.user.userId
    );

    return sendResponse(
        res,
        200,
        "Unread notifications count fetched successfully",
        result
    );
});

// Authenticated user marks a specific notification as read.
const markNotificationRead = asyncHandler(async (req, res) => {
    const result = await markNotificationReadService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Notification marked as read",
        result
    );
});

// Authenticated user marks unread notifications as read (all or by category/module).
const markAllNotificationsRead = asyncHandler(async (req, res) => {
    const category =
        req.params?.category ||
        req.query?.category ||
        req.query?.entityType ||
        req.body?.category ||
        req.body?.entityType ||
        null;

    const result = await markAllNotificationsReadService(
        req.user.userId,
        category
    );

    return sendResponse(
        res,
        200,
        category
            ? `Notifications for '${category}' marked as read`
            : "All notifications marked as read",
        result
    );
});

export {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead
};
