import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    createCampaign as createCampaignApi,
    getBrandCampaigns as getBrandCampaignsApi,
    getCampaignById as getCampaignByIdApi,
    updateCampaign as updateCampaignApi
} from "./campaigns_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";


// Handles campaign creation.
const createCampaign = createAsyncThunk(
    "brandCampaigns/createCampaign",
    async (campaignData, { rejectWithValue }) => {

        try {

            return await createCampaignApi(campaignData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Campaign creation failed"
            );
        }
    }
);


// Handles fetching brand campaigns list with optional params.
const getBrandCampaigns = createAsyncThunk(
    "brandCampaigns/getBrandCampaigns",
    async (params = {}, { rejectWithValue }) => {

        try {

            return await getBrandCampaignsApi(params);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch campaigns"
            );
        }
    }
);


// Handles fetching a single campaign by ID.
const getCampaignById = createAsyncThunk(
    "brandCampaigns/getCampaignById",
    async (campaignId, { rejectWithValue }) => {

        try {

            return await getCampaignByIdApi(campaignId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch campaign"
            );
        }
    }
);


// Handles campaign update by ID.
const updateCampaign = createAsyncThunk(
    "brandCampaigns/updateCampaign",
    async ({ campaignId, campaignData }, { rejectWithValue }) => {

        try {

            return await updateCampaignApi(campaignId, campaignData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Campaign update failed"
            );
        }
    }
);


const initialState = {
    campaigns: [],
    pagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    },
    selectedCampaign: null,
    loading: false,
    error: null
};


const campaignSlice = createSlice({

    name: "brandCampaigns",

    initialState,

    reducers: {

        clearCampaignState: (state) => {
            state.campaigns = [];
            state.selectedCampaign = null;
            state.error = null;
        },

        clearSelectedCampaign: (state) => {
            state.selectedCampaign = null;
        }
    },

    extraReducers: (builder) => {

        builder

            // Create campaign started.
            .addCase(createCampaign.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Create campaign successful.
            .addCase(createCampaign.fulfilled, (state, action) => {

                state.loading = false;
                if (action.payload?.data) {
                    state.campaigns.unshift(action.payload.data);
                }
                state.error = null;
            })

            // Create campaign failed.
            .addCase(createCampaign.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Get brand campaigns list started.
            .addCase(getBrandCampaigns.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Get brand campaigns list successful.
            .addCase(getBrandCampaigns.fulfilled, (state, action) => {

                state.loading = false;
                state.campaigns = action.payload?.data?.campaigns || [];
                state.pagination = action.payload?.data?.pagination || initialState.pagination;
                state.error = null;
            })

            // Get brand campaigns list failed.
            .addCase(getBrandCampaigns.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Get campaign by ID started.
            .addCase(getCampaignById.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Get campaign by ID successful.
            .addCase(getCampaignById.fulfilled, (state, action) => {

                state.loading = false;
                state.selectedCampaign = action.payload?.data || null;
                state.error = null;
            })

            // Get campaign by ID failed.
            .addCase(getCampaignById.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Update campaign started.
            .addCase(updateCampaign.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Update campaign successful.
            .addCase(updateCampaign.fulfilled, (state, action) => {

                state.loading = false;
                const updated = action.payload?.data;
                if (updated) {
                    state.selectedCampaign = updated;
                    const index = state.campaigns.findIndex(
                        (item) => item._id === updated._id
                    );
                    if (index !== -1) {
                        state.campaigns[index] = updated;
                    }
                }
                state.error = null;
            })

            // Update campaign failed.
            .addCase(updateCampaign.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Clear campaign state on auth events.
            .addCase(login.fulfilled, (state) => {

                state.campaigns = [];
                state.selectedCampaign = null;
                state.loading = false;
                state.error = null;
            })

            .addCase(logout.fulfilled, (state) => {

                state.campaigns = [];
                state.selectedCampaign = null;
                state.loading = false;
                state.error = null;
            })

            .addCase(clearAuth, (state) => {

                state.campaigns = [];
                state.selectedCampaign = null;
                state.loading = false;
                state.error = null;
            });
    }
});


export const {
    clearCampaignState,
    clearSelectedCampaign
} = campaignSlice.actions;


export {
    createCampaign,
    getBrandCampaigns,
    getCampaignById,
    updateCampaign
};


export default campaignSlice.reducer;
