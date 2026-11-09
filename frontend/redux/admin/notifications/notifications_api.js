import axiosInstance from "@/lib/axios";

// Admin fetches notifications list with optional pagination and isRead filter.
const getAdminNotifications = async (params = {}) => {
    const response = await axiosInstance.get(
        "/admin/notifications",
        {
            params
        }
    );

    return response.data;
};

// Admin fetches unread notifications count for header badge.
const getAdminUnreadNotificationCount = async () => {
    const response = await axiosInstance.get(
        "/admin/notifications/unread-count"
    );

    return response.data;
};

// Admin marks a single notification as read by ID.
const markAdminNotificationRead = async (notificationId) => {
    const response = await axiosInstance.patch(
        `/admin/notifications/${notificationId}/read`
    );

    return response.data;
};

// Admin marks all unread notifications in a specific category as read.
const markAdminCategoryNotificationsRead = async (category) => {
    const response = await axiosInstance.patch(
        "/admin/notifications/read-all",
        {},
        {
            params: { category }
        }
    );

    return response.data;
};

// Admin marks all unread notifications as read.
const markAllAdminNotificationsRead = async () => {
    const response = await axiosInstance.patch(
        "/admin/notifications/read-all"
    );

    return response.data;
};

export {
    getAdminNotifications,
    getAdminUnreadNotificationCount,
    markAdminNotificationRead,
    markAdminCategoryNotificationsRead,
    markAllAdminNotificationsRead
};

