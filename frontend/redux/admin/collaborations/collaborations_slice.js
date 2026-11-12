import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getAdminCollaborations as getAdminCollaborationsApi,
    getAdminCollaborationsStats as getAdminCollaborationsStatsApi,
    getAdminCollaborationById as getAdminCollaborationByIdApi,
    overrideCollaborationStatus as overrideCollaborationStatusApi,
    extendCollaborationDeadline as extendCollaborationDeadlineApi
} from "./collaborations_api";
import { adminLogout, clearAdminAuth } from "../auth/admin_auth_slice";

// Handles fetching collaborations with query parameters
export const fetchCollaborations = createAsyncThunk(
    "adminCollaborations/fetchCollaborations",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getAdminCollaborationsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch collaborations"
            );
        }
    }
);

// Handles fetching collaboration metrics
export const fetchCollaborationStats = createAsyncThunk(
    "adminCollaborations/fetchCollaborationStats",
    async (_, { rejectWithValue }) => {
        try {
            return await getAdminCollaborationsStatsApi();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch collaboration statistics"
            );
        }
    }
);

// Handles fetching single collaboration dossier by ID
export const fetchCollaborationDetails = createAsyncThunk(
    "adminCollaborations/fetchCollaborationDetails",
    async (id, { rejectWithValue }) => {
        try {
            return await getAdminCollaborationByIdApi(id);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch collaboration details"
            );
        }
    }
);

// Handles administratively overriding status
export const overrideStatus = createAsyncThunk(
    "adminCollaborations/overrideStatus",
    async ({ id, status, reason }, { rejectWithValue }) => {
        try {
            return await overrideCollaborationStatusApi(id, status, reason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to override collaboration status"
            );
        }
    }
);

// Handles extending collaboration deadline
export const extendDeadline = createAsyncThunk(
    "adminCollaborations/extendDeadline",
    async ({ id, newDeadline, reason }, { rejectWithValue }) => {
        try {
            return await extendCollaborationDeadlineApi(id, newDeadline, reason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to extend collaboration deadline"
            );
        }
    }
);

const initialState = {
    collaborations: [],
    stats: {
        totalCollaborations: 0,
        statusCounts: {
            in_progress: 0,
            submitted: 0,
            revision_requested: 0,
            completed: 0,
            cancelled: 0
        },
        totalVolume: 0,
        avgVolume: 0,
        overdueCount: 0
    },
    selectedCollaboration: null,
    pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    },
    loading: false,
    statsLoading: false,
    detailsLoading: false,
    actionLoading: false,
    error: null,
    actionError: null
};

const adminCollaborationsSlice = createSlice({
    name: "adminCollaborations",
    initialState,
    reducers: {
        clearSelectedCollaboration: (state) => {
            state.selectedCollaboration = null;
            state.detailsLoading = false;
        },
        clearCollaborationActionError: (state) => {
            state.actionError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch collaborations
            .addCase(fetchCollaborations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCollaborations.fulfilled, (state, action) => {
                state.loading = false;
                state.collaborations = action.payload?.data?.collaborations || [];
                state.pagination = action.payload?.data?.pagination || initialState.pagination;
            })
            .addCase(fetchCollaborations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load collaborations";
            })

            // Fetch collaboration stats
            .addCase(fetchCollaborationStats.pending, (state) => {
                state.statsLoading = true;
            })
            .addCase(fetchCollaborationStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.stats = action.payload?.data || initialState.stats;
            })
            .addCase(fetchCollaborationStats.rejected, (state) => {
                state.statsLoading = false;
            })

            // Fetch collaboration details
            .addCase(fetchCollaborationDetails.pending, (state) => {
                state.detailsLoading = true;
                state.selectedCollaboration = null;
            })
            .addCase(fetchCollaborationDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.selectedCollaboration = action.payload?.data || null;
            })
            .addCase(fetchCollaborationDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.payload || "Failed to load collaboration dossier";
            })

            // Override status
            .addCase(overrideStatus.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(overrideStatus.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updated = action.payload?.data;
                if (updated && updated._id) {
                    state.collaborations = state.collaborations.map((c) =>
                        c._id === updated._id ? { ...c, status: updated.status } : c
                    );
                    if (state.selectedCollaboration?.workspace?._id === updated._id) {
                        state.selectedCollaboration.workspace.status = updated.status;
                    }
                }
            })
            .addCase(overrideStatus.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload || "Failed to override status";
            })

            // Extend deadline
            .addCase(extendDeadline.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(extendDeadline.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updated = action.payload?.data;
                if (updated && updated._id) {
                    state.collaborations = state.collaborations.map((c) =>
                        c._id === updated._id ? { ...c, deadline: updated.deadline } : c
                    );
                    if (state.selectedCollaboration?.workspace?._id === updated._id) {
                        state.selectedCollaboration.workspace.deadline = updated.deadline;
                    }
                }
            })
            .addCase(extendDeadline.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload || "Failed to extend deadline";
            })

            // Clear on admin logout
            .addCase(adminLogout.fulfilled, () => initialState)
            .addCase(clearAdminAuth, () => initialState);
    }
});

export const { clearSelectedCollaboration, clearCollaborationActionError } =
    adminCollaborationsSlice.actions;
export default adminCollaborationsSlice.reducer;

