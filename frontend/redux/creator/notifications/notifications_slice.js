import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getCreatorNotifications as getCreatorNotificationsApi,
    getCreatorUnreadNotificationCount as getCreatorUnreadNotificationCountApi,
    markCreatorNotificationRead as markCreatorNotificationReadApi,
    markCreatorCategoryNotificationsRead as markCreatorCategoryNotificationsReadApi,
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

// Handles marking all notifications for a specific category as read for creator.
const markCreatorCategoryNotificationsRead = createAsyncThunk(
    "creatorNotifications/markCreatorCategoryNotificationsRead",
    async (category, { rejectWithValue }) => {
        try {
            return await markCreatorCategoryNotificationsReadApi(category);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to mark category notifications as read"
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

const initialCountsByCategory = {
    booking: 0,
    workspace: 0,
    campaign: 0,
    payment: 0,
    review: 0,
    message: 0
};

const initialState = {
    notifications: [],
    dropdownNotifications: [],
    unreadCount: 0,
    countsByCategory: { ...initialCountsByCategory },
    pagination: null,
    loading: false,
    dropdownLoading: false,
    unreadCountLoading: false,
    markingRead: false,
    markingAllRead: false,
    markingCategoryRead: false,
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
                const cat = notification.entityType;
                if (cat && typeof state.countsByCategory[cat] === "number") {
                    state.countsByCategory[cat] += 1;
                } else if (cat) {
                    state.countsByCategory[cat] = 1;
                }
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
                if (action.payload?.data?.countsByCategory) {
                    state.countsByCategory = {
                        ...initialCountsByCategory,
                        ...action.payload.data.countsByCategory
                    };
                }
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
                const updatedId = updatedNotification?._id || action.meta?.arg;

                if (updatedId) {
                    const targetIdStr = String(updatedId);
                    let wasUnread = false;

                    const index = state.notifications.findIndex(
                        (item) => item._id && String(item._id) === targetIdStr
                    );
                    if (index !== -1) {
                        if (!state.notifications[index].isRead) {
                            wasUnread = true;
                        }
                        const existingSender = state.notifications[index].sender;
                        state.notifications[index] = {
                            ...state.notifications[index],
                            ...updatedNotification,
                            sender:
                                existingSender && typeof existingSender === "object"
                                    ? existingSender
                                    : updatedNotification?.sender || existingSender,
                            isRead: true,
                            readAt: updatedNotification?.readAt || new Date().toISOString()
                        };
                    }

                    const dropIndex = state.dropdownNotifications.findIndex(
                        (item) => item._id && String(item._id) === targetIdStr
                    );
                    if (dropIndex !== -1) {
                        if (!state.dropdownNotifications[dropIndex].isRead) {
                            wasUnread = true;
                        }
                        const existingSender = state.dropdownNotifications[dropIndex].sender;
                        state.dropdownNotifications[dropIndex] = {
                            ...state.dropdownNotifications[dropIndex],
                            ...updatedNotification,
                            sender:
                                existingSender && typeof existingSender === "object"
                                    ? existingSender
                                    : updatedNotification?.sender || existingSender,
                            isRead: true,
                            readAt: updatedNotification?.readAt || new Date().toISOString()
                        };
                    }

                    if (wasUnread) {
                        state.unreadCount = Math.max(0, (Number(state.unreadCount) || 0) - 1);
                        const cat = updatedNotification?.entityType;
                        if (cat && typeof state.countsByCategory[cat] === "number" && state.countsByCategory[cat] > 0) {
                            state.countsByCategory[cat] = Math.max(0, state.countsByCategory[cat] - 1);
                        }
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
                state.countsByCategory = { ...initialCountsByCategory };
                state.error = null;
            })
            .addCase(markAllCreatorNotificationsRead.rejected, (state, action) => {
                state.markingAllRead = false;
                state.error = action.payload || "Unable to mark all notifications as read";
            })

            // Mark Category Read
            .addCase(markCreatorCategoryNotificationsRead.pending, (state) => {
                state.markingCategoryRead = true;
                state.error = null;
            })
            .addCase(markCreatorCategoryNotificationsRead.fulfilled, (state, action) => {
                state.markingCategoryRead = false;
                const categoryParam = action.payload?.data?.category || action.meta?.arg;
                const markedIds = (action.payload?.data?.markedNotificationIds || []).map(String);
                const modifiedCount = action.payload?.data?.modifiedCount || markedIds.length;

                const rawList = Array.isArray(categoryParam)
                    ? categoryParam
                    : String(categoryParam || "").split(",").map((s) => s.trim().toLowerCase());

                const aliasMap = {
                    bookings: "booking",
                    campaigns: "campaign",
                    workspaces: "workspace",
                    payments: "payment",
                    reviews: "review",
                    messages: "message"
                };

                const categoriesToClear = rawList.map((item) => aliasMap[item] || item);
                const nowIso = new Date().toISOString();

                state.notifications = state.notifications.map((item) => {
                    if (
                        !item.isRead &&
                        (markedIds.includes(String(item._id)) || categoriesToClear.includes(item.entityType))
                    ) {
                        return {
                            ...item,
                            isRead: true,
                            readAt: item.readAt || nowIso
                        };
                    }
                    return item;
                });

                state.dropdownNotifications = state.dropdownNotifications.map((item) => {
                    if (
                        !item.isRead &&
                        (markedIds.includes(String(item._id)) || categoriesToClear.includes(item.entityType))
                    ) {
                        return {
                            ...item,
                            isRead: true,
                            readAt: item.readAt || nowIso
                        };
                    }
                    return item;
                });

                categoriesToClear.forEach((cat) => {
                    if (typeof state.countsByCategory[cat] === "number") {
                        state.countsByCategory[cat] = 0;
                    }
                });

                if (modifiedCount > 0) {
                    state.unreadCount = Math.max(0, (Number(state.unreadCount) || 0) - modifiedCount);
                }
                state.error = null;
            })
            .addCase(markCreatorCategoryNotificationsRead.rejected, (state, action) => {
                state.markingCategoryRead = false;
                state.error = action.payload || "Unable to mark category notifications as read";
            })

            // Automatically synchronize notifications when a conversation is marked as read
            .addCase("creatorMessages/markCreatorConversationRead/fulfilled", (state, action) => {
                const targetConversationId = action.payload?.conversationId;
                const markedIds =
                    action.payload?.markedNotificationIds ||
                    action.payload?.response?.data?.markedNotificationIds ||
                    action.payload?.response?.markedNotificationIds ||
                    [];
                const markedIdStrs = markedIds.map(String);

                let markedCount = 0;

                state.notifications = state.notifications.map((item) => {
                    if (
                        !item.isRead &&
                        item.entityType === "message" &&
                        (markedIdStrs.includes(String(item._id)) ||
                         (targetConversationId &&
                          (String(item.entityId) === String(targetConversationId) ||
                           String(item.metadata?.conversationId) === String(targetConversationId))))
                    ) {
                        markedCount += 1;
                        return {
                            ...item,
                            isRead: true,
                            readAt: new Date().toISOString()
                        };
                    }
                    return item;
                });

                state.dropdownNotifications = state.dropdownNotifications.map((item) => {
                    if (
                        !item.isRead &&
                        item.entityType === "message" &&
                        (markedIdStrs.includes(String(item._id)) ||
                         (targetConversationId &&
                          (String(item.entityId) === String(targetConversationId) ||
                           String(item.metadata?.conversationId) === String(targetConversationId))))
                    ) {
                        return {
                            ...item,
                            isRead: true,
                            readAt: new Date().toISOString()
                        };
                    }
                    return item;
                });

                if (markedIds.length > 0) {
                    state.unreadCount = Math.max(0, (Number(state.unreadCount) || 0) - markedIds.length);
                    state.countsByCategory.message = Math.max(0, (state.countsByCategory.message || 0) - markedIds.length);
                } else if (markedCount > 0) {
                    state.unreadCount = Math.max(0, (Number(state.unreadCount) || 0) - markedCount);
                    state.countsByCategory.message = Math.max(0, (state.countsByCategory.message || 0) - markedCount);
                }
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
    markCreatorCategoryNotificationsRead,
    markAllCreatorNotificationsRead
};

export default creatorNotificationsSlice.reducer;
