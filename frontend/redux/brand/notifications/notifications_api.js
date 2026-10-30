import axiosInstance from "@/lib/axios";

// Brand fetches notifications list with optional pagination and isRead filter.
const getBrandNotifications = async (params = {}) => {
    const response = await axiosInstance.get(
        "/brand/notifications",
        {
            params
        }
    );

    return response.data;
};

// Brand fetches unread notifications count for header badge.
const getBrandUnreadNotificationCount = async () => {
    const response = await axiosInstance.get(
        "/brand/notifications/unread-count"
    );

    return response.data;
};

// Brand marks a single notification as read by ID.
const markBrandNotificationRead = async (notificationId) => {
    const response = await axiosInstance.patch(
        `/brand/notifications/${notificationId}/read`
    );

    return response.data;
};

// Brand marks all unread notifications in a specific category as read.
const markBrandCategoryNotificationsRead = async (category) => {
    const response = await axiosInstance.patch(
        "/brand/notifications/read-all",
        {},
        {
            params: { category }
        }
    );

    return response.data;
};

// Brand marks all unread notifications as read.
const markAllBrandNotificationsRead = async () => {
    const response = await axiosInstance.patch(
        "/brand/notifications/read-all"
    );

    return response.data;
};

export {
    getBrandNotifications,
    getBrandUnreadNotificationCount,
    markBrandNotificationRead,
    markBrandCategoryNotificationsRead,
    markAllBrandNotificationsRead
};
