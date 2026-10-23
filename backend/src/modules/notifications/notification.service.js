import mongoose from "mongoose";
import Notification from "./notification.model.js";
import { emitNotificationToUser } from "../../socket/socket.js";
import createApiError from "../../utils/ApiError.js";
import {
    getPagination,
    getPaginationData
} from "../../utils/pagination.js";

// Creates and dispatches a notification record and Socket.IO real-time event.
// Delivery semantics:
// 1. Persistent storage: Guaranteed in MongoDB. This is the canonical source of truth.
// 2. Real-time push: Best-effort over active Socket.IO connections to room `user:${recipient}`.
//    If the recipient is offline, disconnected, or Socket.IO is uninitialized, the notification
//    remains safely stored in MongoDB and is delivered when the user fetches their feed via API.
// 3. Idempotency: Enforced by a unique partial index on `idempotencyKey`. Retries return the
//    existing document without creating duplicates or re-emitting duplicate realtime events.
const createNotificationService = async (payload) => {
    const {
        recipient,
        sender = null,
        type,
        title,
        message,
        entityType,
        entityId,
        destination,
        metadata = {},
        idempotencyKey = null
    } = payload;

    if (!recipient || !mongoose.Types.ObjectId.isValid(recipient)) {
        throw createApiError(400, "Valid recipient ID is required");
    }

    if (sender !== null && sender !== undefined && !mongoose.Types.ObjectId.isValid(sender)) {
        throw createApiError(400, "Valid sender ID is required when sender is provided");
    }

    if (!type || !title || !message || !entityType || !entityId || !destination) {
        throw createApiError(400, "Missing required notification fields");
    }

    const trimmedIdempotencyKey =
        idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.trim()
            ? idempotencyKey.trim()
            : null;

    if (trimmedIdempotencyKey) {
        const existing = await Notification.findOne({
            idempotencyKey: trimmedIdempotencyKey
        });
        if (existing) {
            // Verify that the existing notification belongs to the requested recipient
            if (existing.recipient.toString() !== recipient.toString()) {
                console.error(
                    `Idempotency key recipient mismatch! Key "${trimmedIdempotencyKey}" belongs to recipient ${existing.recipient}, but was requested for ${recipient}.`
                );
                throw createApiError(
                    409,
                    "Idempotency key collision: this key is already associated with a different recipient"
                );
            }
            return existing;
        }
    }

    let notification;
    try {
        notification = await Notification.create({
            recipient,
            sender: sender || null,
            type,
            title,
            message,
            entityType,
            entityId,
            destination,
            metadata,
            idempotencyKey: trimmedIdempotencyKey
        });
    } catch (error) {
        if (error?.code === 11000 && trimmedIdempotencyKey) {
            const existing = await Notification.findOne({
                idempotencyKey: trimmedIdempotencyKey
            });
            if (existing) {
                // Verify recipient in concurrent duplicate collision recovery path
                if (existing.recipient.toString() !== recipient.toString()) {
                    console.error(
                        `Idempotency key duplicate race recipient mismatch! Key "${trimmedIdempotencyKey}" belongs to recipient ${existing.recipient}, but was requested for ${recipient}.`
                    );
                    throw createApiError(
                        409,
                        "Idempotency key collision: this key is already associated with a different recipient"
                    );
                }
                return existing;
            }
        }
        throw error;
    }

    // Populate sender details in-memory if sender exists, avoiding a redundant findById query.
    try {
        if (notification.sender) {
            await notification.populate("sender", "name email");
        }

        const socketPayload = typeof notification.toObject === "function"
            ? notification.toObject()
            : notification;

        // Push real-time event to recipient's personal socket room (best-effort).
        emitNotificationToUser(recipient, socketPayload);
    } catch (socketOrPopulateError) {
        console.error(
            "Non-fatal error preparing/emitting real-time notification:",
            socketOrPopulateError?.message || socketOrPopulateError
        );
    }

    return notification;
};

// Failure-safe wrapper for business event triggers.
// Ensures that notification failures never abort or revert the primary business transaction.
const createNotificationSafe = async (payload) => {
    try {
        return await createNotificationService(payload);
    } catch (error) {
        console.error("Non-fatal notification creation error:", error?.message || error);
        return null;
    }
};

// Gets paginated notifications for the authenticated user, newest first.
const getNotificationsService = async (userId, query = {}) => {
    const { page = 1, limit = 10, isRead, entityType } = query;

    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);

    const filter = {
        recipient: userId
    };

    if (isRead !== undefined && isRead !== null && isRead !== "") {
        const normalized = String(isRead).toLowerCase();
        if (normalized === "true") {
            filter.isRead = true;
        } else if (normalized === "false") {
            filter.isRead = false;
        } else {
            throw createApiError(
                400,
                "isRead filter must be 'true' or 'false'"
            );
        }
    }

    if (entityType !== undefined && entityType !== null && entityType !== "") {
        const normalizedEntityType = String(entityType).trim().toLowerCase();
        if (normalizedEntityType !== "all") {
            filter.entityType = normalizedEntityType;
        }
    }

    const [notifications, totalItems] = await Promise.all([
        Notification.find(filter)
            .populate("sender", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .lean(),
        Notification.countDocuments(filter)
    ]);

    return {
        notifications,
        pagination: getPaginationData(
            currentPage,
            itemsPerPage,
            totalItems
        )
    };
};

// Gets the count of unread notifications for the authenticated user.
const getUnreadNotificationCountService = async (userId) => {
    const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false
    });

    return {
        unreadCount
    };
};

// Marks a single notification as read, strictly scoped to the authenticated recipient.
const markNotificationReadService = async (userId, notificationId) => {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw createApiError(400, "Invalid notification ID");
    }

    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
    });

    if (!notification) {
        throw createApiError(404, "Notification not found");
    }

    if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
    }

    return notification;
};

// Marks all unread notifications as read for the authenticated recipient.
const markAllNotificationsReadService = async (userId) => {
    const result = await Notification.updateMany(
        {
            recipient: userId,
            isRead: false
        },
        {
            $set: {
                isRead: true,
                readAt: new Date()
            }
        }
    );

    return {
        modifiedCount: result.modifiedCount || 0
    };
};

export {
    createNotificationService,
    createNotificationSafe,
    getNotificationsService,
    getUnreadNotificationCountService,
    markNotificationReadService,
    markAllNotificationsReadService
};
