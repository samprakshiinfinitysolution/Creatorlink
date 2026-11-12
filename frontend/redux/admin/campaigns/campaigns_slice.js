import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getAdminCampaigns as getAdminCampaignsApi,
    getAdminCampaignStats as getAdminCampaignStatsApi,
    getAdminCampaignById as getAdminCampaignByIdApi,
    moderatePauseCampaign as moderatePauseCampaignApi,
    moderateResumeCampaign as moderateResumeCampaignApi,
    moderateCloseCampaign as moderateCloseCampaignApi,
    updateAdminCampaignStatus as updateAdminCampaignStatusApi,
    deleteAdminCampaign as deleteAdminCampaignApi
} from "./campaigns_api";
import { adminLogout, clearAdminAuth } from "../auth/admin_auth_slice";

// Handles fetching campaigns with query parameters
export const fetchCampaigns = createAsyncThunk(
    "adminCampaigns/fetchCampaigns",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getAdminCampaignsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch campaigns"
            );
        }
    }
);

// Handles fetching campaign stats overview
export const fetchCampaignStats = createAsyncThunk(
    "adminCampaigns/fetchCampaignStats",
    async (_, { rejectWithValue }) => {
        try {
            return await getAdminCampaignStatsApi();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch campaign stats"
            );
        }
    }
);

// Handles fetching single campaign dossier by ID
export const fetchCampaignDetails = createAsyncThunk(
    "adminCampaigns/fetchCampaignDetails",
    async (id, { rejectWithValue }) => {
        try {
            return await getAdminCampaignByIdApi(id);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch campaign details"
            );
        }
    }
);

// Handles pausing campaign for moderation
export const pauseForModeration = createAsyncThunk(
    "adminCampaigns/pauseForModeration",
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            return await moderatePauseCampaignApi(id, reason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to pause campaign for moderation"
            );
        }
    }
);

// Handles resuming campaign after moderation resolved
export const resumeFromModeration = createAsyncThunk(
    "adminCampaigns/resumeFromModeration",
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            return await moderateResumeCampaignApi(id, reason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to resume campaign"
            );
        }
    }
);

// Handles closing campaign when justified
export const closeForModeration = createAsyncThunk(
    "adminCampaigns/closeForModeration",
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            return await moderateCloseCampaignApi(id, reason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to close campaign"
            );
        }
    }
);

// Backward compatibility status updater
export const changeCampaignStatus = createAsyncThunk(
    "adminCampaigns/changeCampaignStatus",
    async ({ id, status, moderationReason }, { rejectWithValue }) => {
        try {
            return await updateAdminCampaignStatusApi(id, status, moderationReason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update campaign status"
            );
        }
    }
);

// Handles safe deletion of a campaign
export const removeCampaign = createAsyncThunk(
    "adminCampaigns/removeCampaign",
    async ({ id, moderationReason }, { rejectWithValue }) => {
        try {
            return await deleteAdminCampaignApi(id, moderationReason);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to remove campaign"
            );
        }
    }
);

const initialState = {
    campaigns: [],
    stats: {
        totalCampaigns: 0,
        statusCounts: {
            draft: 0,
            published: 0,
            paused: 0,
            in_progress: 0,
            completed: 0,
            closed: 0
        },
        totalBudget: 0,
        avgBudget: 0,
        totalApplications: 0,
        restrictedCount: 0
    },
    selectedCampaign: null,
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

const adminCampaignsSlice = createSlice({
    name: "adminCampaigns",
    initialState,
    reducers: {
        clearSelectedCampaign: (state) => {
            state.selectedCampaign = null;
            state.detailsLoading = false;
        },
        clearCampaignActionError: (state) => {
            state.actionError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch campaigns
            .addCase(fetchCampaigns.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCampaigns.fulfilled, (state, action) => {
                state.loading = false;
                state.campaigns = action.payload?.data?.campaigns || [];
                state.pagination = action.payload?.data?.pagination || initialState.pagination;
            })
            .addCase(fetchCampaigns.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load campaigns";
            })

            // Fetch campaign stats
            .addCase(fetchCampaignStats.pending, (state) => {
                state.statsLoading = true;
            })
            .addCase(fetchCampaignStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.stats = action.payload?.data || initialState.stats;
            })
            .addCase(fetchCampaignStats.rejected, (state) => {
                state.statsLoading = false;
            })

            // Fetch campaign details
            .addCase(fetchCampaignDetails.pending, (state) => {
                state.detailsLoading = true;
                state.selectedCampaign = null;
            })
            .addCase(fetchCampaignDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.selectedCampaign = action.payload?.data || null;
            })
            .addCase(fetchCampaignDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.payload || "Failed to load campaign dossier";
            })

            // Pause for moderation
            .addCase(pauseForModeration.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(pauseForModeration.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updated = action.payload?.data;
                if (updated && updated._id) {
                    state.campaigns = state.campaigns.map((c) =>
                        c._id === updated._id
                            ? { ...c, status: updated.status, moderation: updated.moderation }
                            : c
                    );
                    if (state.selectedCampaign?.campaign?._id === updated._id) {
                        state.selectedCampaign.campaign.status = updated.status;
                        state.selectedCampaign.campaign.moderation = updated.moderation;
                    }
                }
            })
            .addCase(pauseForModeration.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload || "Failed to pause campaign";
            })

            // Resume from moderation
            .addCase(resumeFromModeration.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(resumeFromModeration.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updated = action.payload?.data;
                if (updated && updated._id) {
                    state.campaigns = state.campaigns.map((c) =>
                        c._id === updated._id
                            ? { ...c, status: updated.status, moderation: updated.moderation }
                            : c
                    );
                    if (state.selectedCampaign?.campaign?._id === updated._id) {
                        state.selectedCampaign.campaign.status = updated.status;
                        state.selectedCampaign.campaign.moderation = updated.moderation;
                    }
                }
            })
            .addCase(resumeFromModeration.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload || "Failed to resume campaign";
            })

            // Close for moderation
            .addCase(closeForModeration.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(closeForModeration.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updated = action.payload?.data;
                if (updated && updated._id) {
                    state.campaigns = state.campaigns.map((c) =>
                        c._id === updated._id
                            ? { ...c, status: updated.status, moderation: updated.moderation }
                            : c
                    );
                    if (state.selectedCampaign?.campaign?._id === updated._id) {
                        state.selectedCampaign.campaign.status = updated.status;
                        state.selectedCampaign.campaign.moderation = updated.moderation;
                    }
                }
            })
            .addCase(closeForModeration.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload || "Failed to close campaign";
            })

            // Change campaign status
            .addCase(changeCampaignStatus.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(changeCampaignStatus.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updated = action.payload?.data;
                if (updated && updated._id) {
                    state.campaigns = state.campaigns.map((c) =>
                        c._id === updated._id ? { ...c, status: updated.status } : c
                    );
                    if (state.selectedCampaign?.campaign?._id === updated._id) {
                        state.selectedCampaign.campaign.status = updated.status;
                    }
                }
            })
            .addCase(changeCampaignStatus.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload || "Failed to update campaign status";
            })

            // Remove campaign
            .addCase(removeCampaign.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(removeCampaign.fulfilled, (state, action) => {
                state.actionLoading = false;
                const campaignId = action.payload?.data?.campaignId;
                if (campaignId) {
                    state.campaigns = state.campaigns.filter((c) => c._id !== campaignId);
                    if (state.selectedCampaign?.campaign?._id === campaignId) {
                        state.selectedCampaign = null;
                    }
                }
            })
            .addCase(removeCampaign.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload || "Failed to remove campaign";
            })

            // Clear on admin logout
            .addCase(adminLogout.fulfilled, () => initialState)
            .addCase(clearAdminAuth, () => initialState);
    }
});

export const { clearSelectedCampaign, clearCampaignActionError } = adminCampaignsSlice.actions;
export default adminCampaignsSlice.reducer;
