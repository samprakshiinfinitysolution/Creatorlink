import axiosInstance from "@/lib/axios";

// Creator fetches notifications list with optional pagination and isRead filter.
const getCreatorNotifications = async (params = {}) => {
    const response = await axiosInstance.get(
        "/creator/notifications",
        {
            params
        }
    );

    return response.data;
};

// Creator fetches unread notifications count for header badge.
const getCreatorUnreadNotificationCount = async () => {
    const response = await axiosInstance.get(
        "/creator/notifications/unread-count"
    );

    return response.data;
};

// Creator marks a single notification as read by ID.
const markCreatorNotificationRead = async (notificationId) => {
    const response = await axiosInstance.patch(
        `/creator/notifications/${notificationId}/read`
    );

    return response.data;
};

// Creator marks all unread notifications in a specific category as read.
const markCreatorCategoryNotificationsRead = async (category) => {
    const response = await axiosInstance.patch(
        "/creator/notifications/read-all",
        {},
        {
            params: { category }
        }
    );

    return response.data;
};

// Creator marks all unread notifications as read.
const markAllCreatorNotificationsRead = async () => {
    const response = await axiosInstance.patch(
        "/creator/notifications/read-all"
    );

    return response.data;
};

export {
    getCreatorNotifications,
    getCreatorUnreadNotificationCount,
    markCreatorNotificationRead,
    markCreatorCategoryNotificationsRead,
    markAllCreatorNotificationsRead
};
