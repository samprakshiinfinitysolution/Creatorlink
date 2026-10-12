import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getBrandCreatorsApi,
    getBrandCreatorByIdApi
} from "./creators_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";

// Handles fetching discoverable creators list with filters, pagination, and sorting.
const fetchBrandCreators = createAsyncThunk(
    "brandCreators/fetchBrandCreators",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getBrandCreatorsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch creators"
            );
        }
    }
);

// Handles fetching a single creator's public profile details by ID.
const fetchBrandCreatorById = createAsyncThunk(
    "brandCreators/fetchBrandCreatorById",
    async (id, { rejectWithValue }) => {
        try {
            return await getBrandCreatorByIdApi(id);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch creator details"
            );
        }
    }
);

const initialState = {
    creators: [],
    selectedCreator: null,
    pagination: null,
    loading: false,
    detailsLoading: false,
    error: null
};

const brandCreatorsSlice = createSlice({
    name: "brandCreators",
    initialState,
    reducers: {
        clearSelectedCreator: (state) => {
            state.selectedCreator = null;
        },
        clearCreatorError: (state) => {
            state.error = null;
        },
        clearCreatorsState: (state) => {
            state.creators = [];
            state.selectedCreator = null;
            state.pagination = null;
            state.loading = false;
            state.detailsLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Brand Creators list
            .addCase(fetchBrandCreators.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrandCreators.fulfilled, (state, action) => {
                state.loading = false;
                state.creators = action.payload?.data?.creators || [];
                state.pagination = action.payload?.data?.pagination || null;
                state.error = null;
            })
            .addCase(fetchBrandCreators.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error?.message || "Unable to fetch creators";
            })

            // Fetch Brand Creator By ID
            .addCase(fetchBrandCreatorById.pending, (state) => {
                state.loading = true;
                state.detailsLoading = true;
                state.error = null;
            })
            .addCase(fetchBrandCreatorById.fulfilled, (state, action) => {
                state.loading = false;
                state.detailsLoading = false;
                state.selectedCreator = action.payload?.data || null;
                state.error = null;
            })
            .addCase(fetchBrandCreatorById.rejected, (state, action) => {
                state.loading = false;
                state.detailsLoading = false;
                state.error = action.payload || action.error?.message || "Unable to fetch creator details";
            })

            // Clear state on auth events
            .addCase(login.fulfilled, (state) => {
                state.creators = [];
                state.selectedCreator = null;
                state.pagination = null;
                state.loading = false;
                state.detailsLoading = false;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.creators = [];
                state.selectedCreator = null;
                state.pagination = null;
                state.loading = false;
                state.detailsLoading = false;
                state.error = null;
            })
            .addCase(clearAuth, (state) => {
                state.creators = [];
                state.selectedCreator = null;
                state.pagination = null;
                state.loading = false;
                state.detailsLoading = false;
                state.error = null;
            });
    }
});

export const {
    clearSelectedCreator,
    clearCreatorError,
    clearCreatorsState
} = brandCreatorsSlice.actions;

export {
    fetchBrandCreators,
    fetchBrandCreatorById
};

export default brandCreatorsSlice.reducer;
