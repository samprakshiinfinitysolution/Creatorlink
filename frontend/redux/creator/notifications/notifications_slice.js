import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getCreatorNotifications as getCreatorNotificationsApi,
    getCreatorUnreadNotificationCount as getCreatorUnreadNotificationCountApi,
    markCreatorNotificationRead as markCreatorNotificationReadApi,
    markAllCreatorNotificationsRead as markAllCreatorNotificationsReadApi
} from "./notifications_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";

// Handles fetching creator notifications list with optional params (page, limit, isRead).
const fetchCreatorNotifications = createAsyncThunk(
    "creatorNotifications/fetchCreatorNotifications",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getCreatorNotificationsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch notifications"
            );
        }
    }
);

// Handles fetching unread notifications count for creator.
const fetchCreatorUnreadNotificationCount = createAsyncThunk(
    "creatorNotifications/fetchCreatorUnreadNotificationCount",
    async (_, { rejectWithValue }) => {
        try {
            return await getCreatorUnreadNotificationCountApi();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch unread notification count"
            );
        }
    }
);

// Handles fetching latest notifications for creator header dropdown.
const fetchCreatorDropdownNotifications = createAsyncThunk(
    "creatorNotifications/fetchCreatorDropdownNotifications",
    async (_, { rejectWithValue }) => {
        try {
            return await getCreatorNotificationsApi({ page: 1, limit: 10 });
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch notifications"
            );
        }
    }
);

// Handles marking single notification as read for creator.
const markCreatorNotificationRead = createAsyncThunk(
    "creatorNotifications/markCreatorNotificationRead",
    async (notificationId, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await markCreatorNotificationReadApi(notificationId);

            // Check if notification is present in either loaded list
            const currentList = getState()?.creatorNotifications?.notifications || [];
            const dropdownList = getState()?.creatorNotifications?.dropdownNotifications || [];
            const targetId = response?.data?._id || notificationId;
            const wasInList = currentList.some(
                (item) => item._id && String(item._id) === String(targetId)
            );
            const wasInDropdown = dropdownList.some(
                (item) => item._id && String(item._id) === String(targetId)
            );

            // If not found in either loaded list, fetch authoritative count from backend
            if (!wasInList && !wasInDropdown) {
                await dispatch(fetchCreatorUnreadNotificationCount());
            }

            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to mark notification as read"
            );
        }
    }
);

// Handles marking all notifications as read for creator.
const markAllCreatorNotificationsRead = createAsyncThunk(
    "creatorNotifications/markAllCreatorNotificationsRead",
    async (_, { rejectWithValue }) => {
        try {
            return await markAllCreatorNotificationsReadApi();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to mark all notifications as read"
            );
        }
    }
);

const initialState = {
    notifications: [],
    dropdownNotifications: [],
    unreadCount: 0,
    pagination: null,
    loading: false,
    dropdownLoading: false,
    unreadCountLoading: false,
    markingRead: false,
    markingAllRead: false,
    currentRequestId: null,
    error: null,
    dropdownError: null
};

const creatorNotificationsSlice = createSlice({
    name: "creatorNotifications",
    initialState,

    reducers: {
        // Adds real-time incoming notification with deduplication.
        addRealtimeCreatorNotification: (state, action) => {
            const notification = action.payload;
            if (!notification || !notification._id) return;

            const notifIdStr = String(notification._id);
            const inNotifications = state.notifications.some(
                (item) => item._id && String(item._id) === notifIdStr
            );

            if (!inNotifications) {
                state.notifications.unshift(notification);
                if (state.pagination && typeof state.pagination.totalItems === "number") {
                    state.pagination.totalItems += 1;
                }
            }

            const inDropdown = state.dropdownNotifications.some(
                (item) => item._id && String(item._id) === notifIdStr
            );
            if (!inDropdown) {
                state.dropdownNotifications.unshift(notification);
                if (state.dropdownNotifications.length > 10) {
                    state.dropdownNotifications = state.dropdownNotifications.slice(0, 10);
                }
            }

            if (!notification.isRead && !inNotifications && !inDropdown) {
                state.unreadCount += 1;
            }
        },

        clearNotificationsState: () => initialState,

        clearNotificationsError: (state) => {
            state.error = null;
            state.dropdownError = null;
        }
    },

    extraReducers: (builder) => {
        builder
            // Fetch Notifications List (Full Manager) with request ID checking
            .addCase(fetchCreatorNotifications.pending, (state, action) => {
                state.loading = true;
                state.currentRequestId = action.meta.requestId;
                state.error = null;
            })
            .addCase(fetchCreatorNotifications.fulfilled, (state, action) => {
                if (state.currentRequestId === action.meta.requestId) {
                    state.loading = false;
                    state.notifications = action.payload?.data?.notifications || [];
                    state.pagination = action.payload?.data?.pagination || null;
                    state.error = null;
                    state.currentRequestId = null;
                }
            })
            .addCase(fetchCreatorNotifications.rejected, (state, action) => {
                if (state.currentRequestId === action.meta.requestId) {
                    state.loading = false;
                    state.error = action.payload || "Unable to fetch notifications";
                    state.currentRequestId = null;
                }
            })

            // Fetch Latest Notifications (Dropdown)
            .addCase(fetchCreatorDropdownNotifications.pending, (state) => {
                state.dropdownLoading = true;
                state.dropdownError = null;
            })
            .addCase(fetchCreatorDropdownNotifications.fulfilled, (state, action) => {
                state.dropdownLoading = false;
                state.dropdownNotifications = action.payload?.data?.notifications || [];
                state.dropdownError = null;
            })
            .addCase(fetchCreatorDropdownNotifications.rejected, (state, action) => {
                state.dropdownLoading = false;
                state.dropdownError = action.payload || "Unable to fetch notifications";
            })

            // Fetch Unread Count
            .addCase(fetchCreatorUnreadNotificationCount.pending, (state) => {
                state.unreadCountLoading = true;
            })
            .addCase(fetchCreatorUnreadNotificationCount.fulfilled, (state, action) => {
                state.unreadCountLoading = false;
                state.unreadCount =
                    typeof action.payload?.data?.unreadCount === "number"
                        ? action.payload.data.unreadCount
                        : 0;
            })
            .addCase(fetchCreatorUnreadNotificationCount.rejected, (state) => {
                state.unreadCountLoading = false;
            })

            // Mark Single Read
            .addCase(markCreatorNotificationRead.pending, (state) => {
                state.markingRead = true;
                state.error = null;
            })
            .addCase(markCreatorNotificationRead.fulfilled, (state, action) => {
                state.markingRead = false;
                const updatedNotification = action.payload?.data;
                const updatedId = updatedNotification?._id;

                if (updatedId && updatedNotification?.isRead === true) {
                    const targetIdStr = String(updatedId);
                    let wasUnread = false;

                    const index = state.notifications.findIndex(
                        (item) => item._id && String(item._id) === targetIdStr
                    );
                    if (index !== -1) {
                        if (!state.notifications[index].isRead) {
                            wasUnread = true;
                        }
                        state.notifications[index] = {
                            ...state.notifications[index],
                            ...updatedNotification,
                            isRead: true
                        };
                    }

                    const dropIndex = state.dropdownNotifications.findIndex(
                        (item) => item._id && String(item._id) === targetIdStr
                    );
                    if (dropIndex !== -1) {
                        if (!state.dropdownNotifications[dropIndex].isRead) {
                            wasUnread = true;
                        }
                        state.dropdownNotifications[dropIndex] = {
                            ...state.dropdownNotifications[dropIndex],
                            ...updatedNotification,
                            isRead: true
                        };
                    }

                    if (wasUnread) {
                        state.unreadCount = Math.max(0, (Number(state.unreadCount) || 0) - 1);
                    }
                }
                state.error = null;
            })
            .addCase(markCreatorNotificationRead.rejected, (state, action) => {
                state.markingRead = false;
                state.error = action.payload || "Unable to mark notification as read";
            })

            // Mark All Read
            .addCase(markAllCreatorNotificationsRead.pending, (state) => {
                state.markingAllRead = true;
                state.error = null;
            })
            .addCase(markAllCreatorNotificationsRead.fulfilled, (state) => {
                state.markingAllRead = false;
                const nowIso = new Date().toISOString();
                state.notifications = state.notifications.map((item) => ({
                    ...item,
                    isRead: true,
                    readAt: item.readAt || nowIso
                }));
                state.dropdownNotifications = state.dropdownNotifications.map((item) => ({
                    ...item,
                    isRead: true,
                    readAt: item.readAt || nowIso
                }));
                state.unreadCount = 0;
                state.error = null;
            })
            .addCase(markAllCreatorNotificationsRead.rejected, (state, action) => {
                state.markingAllRead = false;
                state.error = action.payload || "Unable to mark all notifications as read";
            })

            // Reset state on authentication changes
            .addCase(login.fulfilled, () => initialState)
            .addCase(logout.fulfilled, () => initialState)
            .addCase(clearAuth, () => initialState);
    }
});

export const {
    addRealtimeCreatorNotification,
    clearNotificationsState,
    clearNotificationsError
} = creatorNotificationsSlice.actions;

export {
    fetchCreatorNotifications,
    fetchCreatorDropdownNotifications,
    fetchCreatorUnreadNotificationCount,
    markCreatorNotificationRead,
    markAllCreatorNotificationsRead
};

export default creatorNotificationsSlice.reducer;
