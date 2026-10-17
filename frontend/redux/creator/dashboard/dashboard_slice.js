import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getCreatorDashboardOverview as getCreatorDashboardOverviewApi
} from "./dashboard_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";

// Handles fetching creator dashboard overview metrics, upcoming deadlines, recent collaborations, and reviews.
const getCreatorDashboardOverview = createAsyncThunk(
    "creatorDashboard/getCreatorDashboardOverview",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getCreatorDashboardOverviewApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch creator dashboard overview"
            );
        }
    }
);

const initialState = {
    dashboard: null,
    metrics: null,
    upcomingDeadlines: [],
    recentWorkspaces: [],
    reviews: null,
    creator: null,
    loading: false,
    error: null
};

const creatorDashboardSlice = createSlice({
    name: "creatorDashboard",
    initialState,
    reducers: {
        clearCreatorDashboard: () => initialState,
        clearCreatorDashboardError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Creator Dashboard Overview
            .addCase(getCreatorDashboardOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCreatorDashboardOverview.fulfilled, (state, action) => {
                state.loading = false;
                const dashboardData = action.payload?.data || null;
                state.dashboard = dashboardData;
                state.metrics = dashboardData?.metrics || null;
                state.upcomingDeadlines = dashboardData?.upcomingDeadlines || [];
                state.recentWorkspaces = dashboardData?.recentWorkspaces || [];
                state.reviews = dashboardData?.reviews || null;
                state.creator = dashboardData?.creator || null;
                state.error = null;
            })
            .addCase(getCreatorDashboardOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Unable to fetch creator dashboard overview";
            })

            // Reset state on authentication changes
            .addCase(login.fulfilled, () => initialState)
            .addCase(logout.fulfilled, () => initialState)
            .addCase(clearAuth, () => initialState);
    }
});

export const {
    clearCreatorDashboard,
    clearCreatorDashboardError
} = creatorDashboardSlice.actions;

export {
    getCreatorDashboardOverview,
    getCreatorDashboardOverview as fetchCreatorDashboardOverview
};

export default creatorDashboardSlice.reducer;
