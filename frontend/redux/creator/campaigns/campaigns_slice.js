import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getDiscoverCampaigns,
    getDiscoverCampaignById,
    getAppliedCampaigns,
    getAppliedCampaignById,
    applyToCampaign as applyToCampaignApi,
    cancelBooking as cancelBookingApi
} from "./campaigns_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";


// Handles fetching discover campaigns list.
const fetchDiscoverCampaigns = createAsyncThunk(
    "creatorCampaigns/fetchDiscoverCampaigns",
    async (params = {}, { rejectWithValue }) => {

        try {

            return await getDiscoverCampaigns(params);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch discover campaigns"
            );
        }
    }
);


// Handles fetching single discover campaign by ID.
const fetchDiscoverCampaignById = createAsyncThunk(
    "creatorCampaigns/fetchDiscoverCampaignById",
    async (campaignId, { rejectWithValue }) => {

        try {

            return await getDiscoverCampaignById(campaignId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch campaign details"
            );
        }
    }
);


// Handles fetching creator's applied campaigns list.
const fetchAppliedCampaigns = createAsyncThunk(
    "creatorCampaigns/fetchAppliedCampaigns",
    async (params = {}, { rejectWithValue }) => {

        try {

            return await getAppliedCampaigns(params);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch applied campaigns"
            );
        }
    }
);


// Handles fetching single applied campaign details by booking ID.
const fetchAppliedCampaignById = createAsyncThunk(
    "creatorCampaigns/fetchAppliedCampaignById",
    async (bookingId, { rejectWithValue }) => {

        try {

            return await getAppliedCampaignById(bookingId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch applied campaign details"
            );
        }
    }
);


// Handles applying to a campaign (creating booking).
const applyToCampaign = createAsyncThunk(
    "creatorCampaigns/applyToCampaign",
    async (bookingData, { rejectWithValue }) => {

        try {

            return await applyToCampaignApi(bookingData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Campaign application failed"
            );
        }
    }
);


// Handles cancelling a pending campaign booking.
const cancelCampaignBooking = createAsyncThunk(
    "creatorCampaigns/cancelCampaignBooking",
    async (bookingId, { rejectWithValue }) => {

        try {

            return await cancelBookingApi(bookingId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Booking cancellation failed"
            );
        }
    }
);


const initialState = {
    discoverCampaigns: [],
    discoverPagination: null,
    selectedDiscoverCampaign: null,

    appliedCampaigns: [],
    appliedPagination: null,
    selectedAppliedCampaign: null,

    loading: false,
    submitting: false,
    error: null,
    successMessage: null
};


const creatorCampaignsSlice = createSlice({

    name: "creatorCampaigns",

    initialState,

    reducers: {

        clearSelectedDiscoverCampaign: (state) => {
            state.selectedDiscoverCampaign = null;
        },

        clearSelectedAppliedCampaign: (state) => {
            state.selectedAppliedCampaign = null;
        },

        clearCampaignState: (state) => {
            state.discoverCampaigns = [];
            state.discoverPagination = null;
            state.selectedDiscoverCampaign = null;
            state.appliedCampaigns = [];
            state.appliedPagination = null;
            state.selectedAppliedCampaign = null;
            state.loading = false;
            state.submitting = false;
            state.error = null;
            state.successMessage = null;
        },

        clearSuccessMessage: (state) => {
            state.successMessage = null;
        }
    },

    extraReducers: (builder) => {

        builder

            // Fetch Discover Campaigns started.
            .addCase(fetchDiscoverCampaigns.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Discover Campaigns successful.
            .addCase(fetchDiscoverCampaigns.fulfilled, (state, action) => {

                state.loading = false;
                state.discoverCampaigns = action.payload?.data?.campaigns || [];
                state.discoverPagination = action.payload?.data?.pagination || null;
                state.error = null;
            })

            // Fetch Discover Campaigns failed.
            .addCase(fetchDiscoverCampaigns.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Fetch Discover Campaign By ID started.
            .addCase(fetchDiscoverCampaignById.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Discover Campaign By ID successful.
            .addCase(fetchDiscoverCampaignById.fulfilled, (state, action) => {

                state.loading = false;
                state.selectedDiscoverCampaign = action.payload?.data || null;
                state.error = null;
            })

            // Fetch Discover Campaign By ID failed.
            .addCase(fetchDiscoverCampaignById.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Fetch Applied Campaigns started.
            .addCase(fetchAppliedCampaigns.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Applied Campaigns successful.
            .addCase(fetchAppliedCampaigns.fulfilled, (state, action) => {

                state.loading = false;
                state.appliedCampaigns = action.payload?.data?.campaigns || [];
                state.appliedPagination = action.payload?.data?.pagination || null;
                state.error = null;
            })

            // Fetch Applied Campaigns failed.
            .addCase(fetchAppliedCampaigns.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Fetch Applied Campaign By ID started.
            .addCase(fetchAppliedCampaignById.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Applied Campaign By ID successful.
            .addCase(fetchAppliedCampaignById.fulfilled, (state, action) => {

                state.loading = false;
                state.selectedAppliedCampaign = action.payload?.data || null;
                state.error = null;
            })

            // Fetch Applied Campaign By ID failed.
            .addCase(fetchAppliedCampaignById.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Apply To Campaign started.
            .addCase(applyToCampaign.pending, (state) => {

                state.submitting = true;
                state.error = null;
                state.successMessage = null;
            })

            // Apply To Campaign successful.
            .addCase(applyToCampaign.fulfilled, (state, action) => {

                state.submitting = false;
                state.successMessage = action.payload?.message || "Campaign application submitted successfully";
                state.error = null;
            })

            // Apply To Campaign failed.
            .addCase(applyToCampaign.rejected, (state, action) => {

                state.submitting = false;
                state.error = action.payload;
            })


            // Cancel Campaign Booking started.
            .addCase(cancelCampaignBooking.pending, (state) => {

                state.submitting = true;
                state.error = null;
                state.successMessage = null;
            })

            // Cancel Campaign Booking successful.
            .addCase(cancelCampaignBooking.fulfilled, (state, action) => {

                state.submitting = false;
                state.successMessage = action.payload?.message || "Booking cancelled successfully";

                const updatedBooking = action.payload?.data;

                if (updatedBooking) {
                    const index = state.appliedCampaigns.findIndex(
                        (item) => item._id === updatedBooking._id || item.bookingId === updatedBooking._id
                    );

                    if (index !== -1) {
                        state.appliedCampaigns[index].status = "cancelled";
                    }

                    if (
                        state.selectedAppliedCampaign?._id === updatedBooking._id ||
                        state.selectedAppliedCampaign?.bookingId === updatedBooking._id
                    ) {
                        state.selectedAppliedCampaign.status = "cancelled";
                    }
                }

                state.error = null;
            })

            // Cancel Campaign Booking failed.
            .addCase(cancelCampaignBooking.rejected, (state, action) => {

                state.submitting = false;
                state.error = action.payload;
            })


            // Clear state on auth events.
            .addCase(login.fulfilled, (state) => {

                state.discoverCampaigns = [];
                state.discoverPagination = null;
                state.selectedDiscoverCampaign = null;
                state.appliedCampaigns = [];
                state.appliedPagination = null;
                state.selectedAppliedCampaign = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            })

            .addCase(logout.fulfilled, (state) => {

                state.discoverCampaigns = [];
                state.discoverPagination = null;
                state.selectedDiscoverCampaign = null;
                state.appliedCampaigns = [];
                state.appliedPagination = null;
                state.selectedAppliedCampaign = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            })

            .addCase(clearAuth, (state) => {

                state.discoverCampaigns = [];
                state.discoverPagination = null;
                state.selectedDiscoverCampaign = null;
                state.appliedCampaigns = [];
                state.appliedPagination = null;
                state.selectedAppliedCampaign = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            });
    }
});


export const {
    clearSelectedDiscoverCampaign,
    clearSelectedAppliedCampaign,
    clearCampaignState,
    clearSuccessMessage
} = creatorCampaignsSlice.actions;


export {
    fetchDiscoverCampaigns,
    fetchDiscoverCampaignById,
    fetchAppliedCampaigns,
    fetchAppliedCampaignById,
    applyToCampaign,
    cancelCampaignBooking
};


export default creatorCampaignsSlice.reducer;
