import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getAdminVerifications as getAdminVerificationsApi,
    getAdminVerificationById as getAdminVerificationByIdApi,
    approveVerification as approveVerificationApi,
    rejectVerification as rejectVerificationApi,
    revokeVerification as revokeVerificationApi
} from "./verification_api";
import { logout, clearAuth } from "../../auth/auth_slice";

// Handles fetching verification requests with query parameters
export const fetchVerifications = createAsyncThunk(
    "adminVerification/fetchVerifications",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getAdminVerificationsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch verification requests"
            );
        }
    }
);

// Handles fetching single verification dossier by ID
export const fetchVerificationDetails = createAsyncThunk(
    "adminVerification/fetchVerificationDetails",
    async (id, { rejectWithValue }) => {
        try {
            return await getAdminVerificationByIdApi(id);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch verification request details"
            );
        }
    }
);

// Handles approving a verification request (supports string ID or { id, reason } object)
export const approveVerificationRequest = createAsyncThunk(
    "adminVerification/approveVerificationRequest",
    async (payload, { rejectWithValue }) => {
        try {
            const id = typeof payload === "string" ? payload : payload?.id;
            const reason = typeof payload === "object" ? payload?.reason : undefined;
            return await approveVerificationApi(id, reason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to approve verification request"
            );
        }
    }
);

// Handles rejecting a verification request with reason
export const rejectVerificationRequest = createAsyncThunk(
    "adminVerification/rejectVerificationRequest",
    async ({ id, rejectionReason }, { rejectWithValue }) => {
        try {
            return await rejectVerificationApi(id, rejectionReason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to reject verification request"
            );
        }
    }
);

// Handles revoking an approved verification status with reason
export const revokeVerificationRequest = createAsyncThunk(
    "adminVerification/revokeVerificationRequest",
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            return await revokeVerificationApi(id, reason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to revoke verification status"
            );
        }
    }
);

const initialState = {
    verifications: [],
    pagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0
    },
    selectedVerification: null,
    loading: false,
    detailsLoading: false,
    actionLoading: false,
    error: null,
    detailsError: null,
    actionError: null
};

const adminVerificationSlice = createSlice({
    name: "adminVerification",
    initialState,
    reducers: {
        clearSelectedVerification: (state) => {
            state.selectedVerification = null;
            state.detailsError = null;
        },
        clearVerificationError: (state) => {
            state.error = null;
            state.actionError = null;
        },
        updateRealtimeVerificationItem: (state, action) => {
            const updated = action.payload;
            if (!updated || !updated._id) return;
            const updatedId = String(updated._id);
            const index = state.verifications.findIndex(
                (item) => String(item._id) === updatedId
            );
            if (index !== -1) {
                // Update existing queue item
                state.verifications[index] = {
                    ...state.verifications[index],
                    ...updated,
                    user: updated.user || state.verifications[index].user,
                    profile: updated.profile || state.verifications[index].profile
                };
            } else {
                // Prepend new submission to top of queue
                state.verifications.unshift(updated);
                if (state.pagination && typeof state.pagination.totalItems === "number") {
                    state.pagination.totalItems += 1;
                }
            }
            if (state.selectedVerification && String(state.selectedVerification._id) === updatedId) {
                state.selectedVerification = {
                    ...state.selectedVerification,
                    ...updated,
                    user: updated.user || state.selectedVerification.user,
                    profile: updated.profile || state.selectedVerification.profile
                };
            }
        },
        updateRealtimeApplicantProfile: (state, action) => {
            const { userId, profile } = action.payload || {};
            if (!userId || !profile) return;
            const userIdStr = String(userId);
            // Update selected verification modal if active
            const selectedUserId = String(
                state.selectedVerification?.user?._id || state.selectedVerification?.user || ""
            );
            if (selectedUserId === userIdStr) {
                state.selectedVerification = {
                    ...state.selectedVerification,
                    profile: {
                        ...state.selectedVerification.profile,
                        ...profile
                    }
                };
            }
            // Update any matching item in queue
            state.verifications = state.verifications.map((item) => {
                const itemUserId = String(item.user?._id || item.user || "");
                if (itemUserId === userIdStr) {
                    return {
                        ...item,
                        profile: {
                            ...item.profile,
                            ...profile
                        }
                    };
                }
                return item;
            });
        }
    },
    extraReducers: (builder) => {
        builder
            // List
            .addCase(fetchVerifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerifications.fulfilled, (state, action) => {
                state.loading = false;
                state.verifications = action.payload.data?.verifications || [];
                state.pagination = action.payload.data?.pagination || state.pagination;
            })
            .addCase(fetchVerifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Details
            .addCase(fetchVerificationDetails.pending, (state) => {
                state.detailsLoading = true;
                state.detailsError = null;
            })
            .addCase(fetchVerificationDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.selectedVerification = action.payload.data || null;
            })
            .addCase(fetchVerificationDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.detailsError = action.payload;
            })

            // Approve
            .addCase(approveVerificationRequest.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(approveVerificationRequest.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updated = action.payload.data;
                if (updated) {
                    state.verifications = state.verifications.map((item) =>
                        item._id === updated._id
                            ? {
                                  ...item,
                                  status: "approved",
                                  reviewedAt: updated.reviewedAt,
                                  reviewHistory: updated.reviewHistory || item.reviewHistory
                              }
                            : item
                    );
                    if (state.selectedVerification?._id === updated._id) {
                        state.selectedVerification = {
                            ...state.selectedVerification,
                            ...updated
                        };
                    }
                }
            })
            .addCase(approveVerificationRequest.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })

            // Reject
            .addCase(rejectVerificationRequest.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(rejectVerificationRequest.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updated = action.payload.data;
                if (updated) {
                    state.verifications = state.verifications.map((item) =>
                        item._id === updated._id
                            ? {
                                  ...item,
                                  status: "rejected",
                                  reviewedAt: updated.reviewedAt,
                                  rejectionReason: updated.rejectionReason,
                                  reviewHistory: updated.reviewHistory || item.reviewHistory
                              }
                            : item
                    );
                    if (state.selectedVerification?._id === updated._id) {
                        state.selectedVerification = {
                            ...state.selectedVerification,
                            ...updated
                        };
                    }
                }
            })
            .addCase(rejectVerificationRequest.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })

            // Revoke
            .addCase(revokeVerificationRequest.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(revokeVerificationRequest.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updated = action.payload.data;
                if (updated) {
                    state.verifications = state.verifications.map((item) =>
                        item._id === updated._id
                            ? {
                                  ...item,
                                  status: "rejected",
                                  reviewedAt: updated.reviewedAt,
                                  rejectionReason: updated.rejectionReason,
                                  reviewHistory: updated.reviewHistory || item.reviewHistory,
                                  reviewHistory: updated.reviewHistory || item.reviewHistory
                              }
                            : item
                    );
                    if (state.selectedVerification?._id === updated._id) {
                        state.selectedVerification = {
                            ...state.selectedVerification,
                            ...updated
                        };
                    }
                }
            })
            .addCase(revokeVerificationRequest.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })

            // Reset on logout
            .addCase(logout.fulfilled, () => initialState)
            .addCase(clearAuth, () => initialState);
    }
});

export const {
    clearSelectedVerification,
    clearVerificationError,
    updateRealtimeVerificationItem,
    updateRealtimeApplicantProfile
} = adminVerificationSlice.actions;

export default adminVerificationSlice.reducer;

