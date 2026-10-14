import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getBrandDashboardOverview as getBrandDashboardOverviewApi
} from "./dashboard_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";

// Handles fetching brand dashboard overview metrics, recent campaigns, collaborations, and deadlines.
const getBrandDashboardOverview = createAsyncThunk(
    "brandDashboard/getBrandDashboardOverview",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getBrandDashboardOverviewApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch brand dashboard overview"
            );
        }
    }
);

const initialState = {
    dashboard: null,
    metrics: null,
    upcomingDeadlines: [],
    recentCampaigns: [],
    recentCollaborations: [],
    user: null,
    loading: false,
    error: null
};

const brandDashboardSlice = createSlice({
    name: "brandDashboard",
    initialState,
    reducers: {
        clearBrandDashboard: () => initialState,
        clearBrandDashboardError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Brand Dashboard Overview
            .addCase(getBrandDashboardOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBrandDashboardOverview.fulfilled, (state, action) => {
                state.loading = false;
                const dashboardData = action.payload?.data || null;
                state.dashboard = dashboardData;
                state.metrics = dashboardData?.metrics || null;
                state.upcomingDeadlines = dashboardData?.upcomingDeadlines || [];
                state.recentCampaigns = dashboardData?.recentCampaigns || [];
                state.recentCollaborations = dashboardData?.recentCollaborations || [];
                state.user = dashboardData?.user || null;
                state.error = null;
            })
            .addCase(getBrandDashboardOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Unable to fetch brand dashboard overview";
            })

            // Reset state on authentication changes
            .addCase(login.fulfilled, () => initialState)
            .addCase(logout.fulfilled, () => initialState)
            .addCase(clearAuth, () => initialState);
    }
});

export const {
    clearBrandDashboard,
    clearBrandDashboardError
} = brandDashboardSlice.actions;

export {
    getBrandDashboardOverview,
    getBrandDashboardOverview as fetchBrandDashboardOverview
};

export default brandDashboardSlice.reducer;
