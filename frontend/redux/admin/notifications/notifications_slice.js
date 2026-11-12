import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getAdminNotifications as getAdminNotificationsApi,
    getAdminUnreadNotificationCount as getAdminUnreadNotificationCountApi,
    markAdminNotificationRead as markAdminNotificationReadApi,
    markAdminCategoryNotificationsRead as markAdminCategoryNotificationsReadApi,
    markAllAdminNotificationsRead as markAllAdminNotificationsReadApi
} from "./notifications_api";

import { adminLogout } from "../auth/admin_auth_slice";

// Handles fetching admin notifications list with optional params (page, limit, isRead, entityType).
export const fetchAdminNotifications = createAsyncThunk(
    "adminNotifications/fetchAdminNotifications",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getAdminNotificationsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch admin notifications"
            );
        }
    }
);

// Handles fetching unread notifications count for admin badge.
export const fetchAdminUnreadNotificationCount = createAsyncThunk(
    "adminNotifications/fetchAdminUnreadNotificationCount",
    async (_, { rejectWithValue }) => {
        try {
            return await getAdminUnreadNotificationCountApi();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch unread notification count"
            );
        }
    }
);

// Handles fetching latest notifications for admin header dropdown.
export const fetchAdminDropdownNotifications = createAsyncThunk(
    "adminNotifications/fetchAdminDropdownNotifications",
    async (_, { rejectWithValue }) => {
        try {
            return await getAdminNotificationsApi({ page: 1, limit: 10 });
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch notifications"
            );
        }
    }
);

// Handles marking single notification as read for admin.
export const markAdminNotificationRead = createAsyncThunk(
    "adminNotifications/markAdminNotificationRead",
    async (notificationId, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await markAdminNotificationReadApi(notificationId);

            const currentList = getState()?.adminNotifications?.notifications || [];
            const dropdownList = getState()?.adminNotifications?.dropdownNotifications || [];
            const targetId = response?.data?._id || notificationId;
            const wasInList = currentList.some(
                (item) => item._id && String(item._id) === String(targetId)
            );
            const wasInDropdown = dropdownList.some(
                (item) => item._id && String(item._id) === String(targetId)
            );

            if (!wasInList && !wasInDropdown) {
                await dispatch(fetchAdminUnreadNotificationCount());
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

// Handles marking all notifications for a specific category as read for admin.
export const markAdminCategoryNotificationsRead = createAsyncThunk(
    "adminNotifications/markAdminCategoryNotificationsRead",
    async (category, { dispatch, rejectWithValue }) => {
        try {
            const response = await markAdminCategoryNotificationsReadApi(category);
            const countResult = await dispatch(fetchAdminUnreadNotificationCount());
            const unreadCount =
                countResult?.payload?.data?.unreadCount ??
                countResult?.payload?.unreadCount;
            return { category, response, unreadCount };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to mark category notifications as read"
            );
        }
    }
);

// Handles marking all notifications as read for admin.
export const markAllAdminNotificationsRead = createAsyncThunk(
    "adminNotifications/markAllAdminNotificationsRead",
    async (_, { rejectWithValue }) => {
        try {
            return await markAllAdminNotificationsReadApi();
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
    pagination: {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 0,
        hasPrevPage: false,
        hasNextPage: false
    },
    currentFilter: null,
    loading: false,
    dropdownLoading: false,
    markingRead: false,
    markingAllRead: false,
    error: null
};

const adminNotificationsSlice = createSlice({
    name: "adminNotifications",
    initialState,
    reducers: {
        addRealtimeAdminNotification: (state, action) => {
            const newNotif = action.payload;
            if (!newNotif || !newNotif._id) return;

            const existingIdx = state.notifications.findIndex(
                (item) => String(item._id) === String(newNotif._id)
            );
            const existingDropdownIdx = state.dropdownNotifications.findIndex(
                (item) => String(item._id) === String(newNotif._id)
            );

            const isAlreadyPresent = existingIdx !== -1 || existingDropdownIdx !== -1;

            // Check if notification matches the active filter in notifications view
            const filter = state.currentFilter;
            let shouldIncludeInList = true;

            if (filter) {
                // If filter specifies isRead (boolean), check matching
                if (typeof filter.isRead === "boolean") {
                    const notifIsRead = Boolean(newNotif.isRead);
                    if (notifIsRead !== filter.isRead) {
                        shouldIncludeInList = false;
                    }
                }

                // If filter specifies entityType, check matching
                if (shouldIncludeInList && filter.entityType && filter.entityType !== "all") {
                    const targetType = String(filter.entityType).toLowerCase().trim();
                    const notifType = String(newNotif.entityType || "").toLowerCase().trim();
                    const notifCat = String(newNotif.category || "").toLowerCase().trim();

                    const matchesCategory =
                        notifType === targetType ||
                        notifCat === targetType ||
                        `${notifType}s` === targetType ||
                        `${targetType}s` === notifType ||
                        `${notifCat}s` === targetType ||
                        `${targetType}s` === notifCat;

                    if (!matchesCategory) {
                        shouldIncludeInList = false;
                    }
                }

                // Only insert new items on page 1 of active list
                if (shouldIncludeInList && filter.page && Number(filter.page) > 1 && existingIdx === -1) {
                    shouldIncludeInList = false;
                }
            }

            if (existingIdx !== -1) {
                if (shouldIncludeInList) {
                    state.notifications[existingIdx] = newNotif;
                } else {
                    state.notifications.splice(existingIdx, 1);
                    if (state.pagination?.totalItems) {
                        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
                    }
                }
            } else if (shouldIncludeInList) {
                state.notifications.unshift(newNotif);
                if (state.pagination) {
                    state.pagination.totalItems = (state.pagination.totalItems || 0) + 1;
                    const limit = Number(state.pagination.limit) || 10;
                    if (state.notifications.length > limit) {
                        state.notifications.pop();
                    }
                }
            }

            if (existingDropdownIdx === -1) {
                state.dropdownNotifications.unshift(newNotif);
                if (state.dropdownNotifications.length > 10) {
                    state.dropdownNotifications.pop();
                }
            } else {
                state.dropdownNotifications[existingDropdownIdx] = newNotif;
            }

            // Increment unread count only when the notification is genuinely new and unread
            if (!isAlreadyPresent && !newNotif.isRead) {
                state.unreadCount = (Number(state.unreadCount) || 0) + 1;
            }
        },
        clearNotificationsState: () => initialState,
        clearNotificationsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchAdminNotifications.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                if (action.meta?.arg) {
                    state.currentFilter = action.meta.arg;
                }
            })
            .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
                state.loading = false;
                if (action.meta?.arg) {
                    state.currentFilter = action.meta.arg;
                }
                const payload = action.payload?.data || action.payload || {};
                state.notifications = Array.isArray(payload.notifications) ? payload.notifications : [];
                state.pagination = payload.pagination || initialState.pagination;
                if (typeof payload.unreadCount === "number") {
                    state.unreadCount = payload.unreadCount;
                }
                state.error = null;
            })
            .addCase(fetchAdminNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load notifications";
            })

            // Fetch dropdown notifications
            .addCase(fetchAdminDropdownNotifications.pending, (state) => {
                state.dropdownLoading = true;
            })
            .addCase(fetchAdminDropdownNotifications.fulfilled, (state, action) => {
                state.dropdownLoading = false;
                const payload = action.payload?.data || action.payload || {};
                state.dropdownNotifications = Array.isArray(payload.notifications) ? payload.notifications : [];
                if (typeof payload.unreadCount === "number") {
                    state.unreadCount = payload.unreadCount;
                }
            })
            .addCase(fetchAdminDropdownNotifications.rejected, (state) => {
                state.dropdownLoading = false;
            })

            // Fetch unread count
            .addCase(fetchAdminUnreadNotificationCount.fulfilled, (state, action) => {
                const count = action.payload?.data?.unreadCount ?? action.payload?.unreadCount;
                if (typeof count === "number") {
                    state.unreadCount = count;
                }
            })

            // Mark single read
            .addCase(markAdminNotificationRead.pending, (state) => {
                state.markingRead = true;
            })
            .addCase(markAdminNotificationRead.fulfilled, (state, action) => {
                state.markingRead = false;
                const updated = action.payload?.data;
                const targetId = updated?._id || action.meta?.arg;

                state.notifications = state.notifications.map((item) => {
                    if (String(item._id) === String(targetId)) {
                        return { ...item, isRead: true, readAt: updated?.readAt || new Date().toISOString() };
                    }
                    return item;
                });

                state.dropdownNotifications = state.dropdownNotifications.map((item) => {
                    if (String(item._id) === String(targetId)) {
                        return { ...item, isRead: true, readAt: updated?.readAt || new Date().toISOString() };
                    }
                    return item;
                });

                state.unreadCount = Math.max(0, (Number(state.unreadCount) || 0) - 1);
            })
            .addCase(markAdminNotificationRead.rejected, (state, action) => {
                state.markingRead = false;
                state.error = action.payload || "Failed to mark notification read";
            })

            // Mark category notifications read
            .addCase(markAdminCategoryNotificationsRead.pending, (state) => {
                state.markingAllRead = true;
            })
            .addCase(markAdminCategoryNotificationsRead.fulfilled, (state, action) => {
                state.markingAllRead = false;
                const category = action.payload?.category || action.meta?.arg;
                const responseData = action.payload?.response?.data || action.payload?.response;
                const markedIds = Array.isArray(responseData?.markedNotificationIds)
                    ? responseData.markedNotificationIds.map(String)
                    : [];
                const markedIdSet = new Set(markedIds);

                const nowIso = new Date().toISOString();
                const targetCat = category && typeof category === "string" ? category.toLowerCase().trim() : "";

                const isMatch = (item) => {
                    if (!item) return false;
                    if (markedIdSet.has(String(item._id))) return true;
                    if (!targetCat || targetCat === "all") return true;

                    const entityType = String(item.entityType || "").toLowerCase().trim();
                    const itemCat = String(item.category || "").toLowerCase().trim();

                    if (entityType === targetCat || itemCat === targetCat) return true;
                    if (`${entityType}s` === targetCat || `${targetCat}s` === entityType) return true;
                    if (`${itemCat}s` === targetCat || `${targetCat}s` === itemCat) return true;

                    return false;
                };

                let flippedCount = 0;

                state.notifications = state.notifications.map((item) => {
                    if (isMatch(item) && !item.isRead) {
                        flippedCount += 1;
                        return {
                            ...item,
                            isRead: true,
                            readAt: item.readAt || nowIso
                        };
                    }
                    return item;
                });

                state.dropdownNotifications = state.dropdownNotifications.map((item) => {
                    if (isMatch(item) && !item.isRead) {
                        return {
                            ...item,
                            isRead: true,
                            readAt: item.readAt || nowIso
                        };
                    }
                    return item;
                });

                if (typeof action.payload?.unreadCount === "number") {
                    state.unreadCount = action.payload.unreadCount;
                } else {
                    const decrementBy = typeof responseData?.modifiedCount === "number"
                        ? responseData.modifiedCount
                        : flippedCount;
                    state.unreadCount = Math.max(0, (Number(state.unreadCount) || 0) - decrementBy);
                }
            })
            .addCase(markAdminCategoryNotificationsRead.rejected, (state, action) => {
                state.markingAllRead = false;
                state.error = action.payload || "Failed to mark category notifications read";
            })

            // Mark all read
            .addCase(markAllAdminNotificationsRead.pending, (state) => {
                state.markingAllRead = true;
            })
            .addCase(markAllAdminNotificationsRead.fulfilled, (state) => {
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
            })
            .addCase(markAllAdminNotificationsRead.rejected, (state, action) => {
                state.markingAllRead = false;
                state.error = action.payload || "Failed to mark all notifications read";
            })

            // Reset on admin logout
            .addCase(adminLogout.fulfilled, () => initialState);
    }
});

export const {
    addRealtimeAdminNotification,
    clearNotificationsState,
    clearNotificationsError
} = adminNotificationsSlice.actions;

export default adminNotificationsSlice.reducer;

