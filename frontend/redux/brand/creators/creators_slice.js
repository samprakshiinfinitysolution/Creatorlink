import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getBrandCreatorsApi,
    getBrandCreatorByIdApi,
    getSavedCreatorsApi,
    getSavedCreatorIdsApi,
    saveCreatorApi,
    unsaveCreatorApi
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

// Handles fetching full saved creators shortlist for the brand.
const fetchSavedCreators = createAsyncThunk(
    "brandCreators/fetchSavedCreators",
    async (_, { rejectWithValue }) => {
        try {
            return await getSavedCreatorsApi();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch saved creators"
            );
        }
    }
);

// Handles fetching array of saved creator IDs for fast bookmark lookup.
const fetchSavedCreatorIds = createAsyncThunk(
    "brandCreators/fetchSavedCreatorIds",
    async (_, { rejectWithValue }) => {
        try {
            return await getSavedCreatorIdsApi();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch saved creator IDs"
            );
        }
    }
);

// Handles saving a creator to the brand's shortlist.
const saveCreator = createAsyncThunk(
    "brandCreators/saveCreator",
    async (creatorId, { rejectWithValue }) => {
        try {
            return await saveCreatorApi(creatorId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to save creator"
            );
        }
    }
);

// Handles removing a creator from the brand's shortlist.
const unsaveCreator = createAsyncThunk(
    "brandCreators/unsaveCreator",
    async (creatorId, { rejectWithValue }) => {
        try {
            return await unsaveCreatorApi(creatorId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to remove creator from shortlist"
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
    error: null,
    detailsError: null,
    // Saved creators / shortlist state
    savedCreators: [],
    savedCreatorIds: [],
    savedLoading: false,
    savedError: null,
    savingId: null
};

const brandCreatorsSlice = createSlice({
    name: "brandCreators",
    initialState,
    reducers: {
        clearSelectedCreator: (state) => {
            state.selectedCreator = null;
            state.detailsError = null;
        },
        clearCreatorError: (state) => {
            state.error = null;
            state.detailsError = null;
            state.savedError = null;
        },
        clearCreatorsState: (state) => {
            state.creators = [];
            state.selectedCreator = null;
            state.pagination = null;
            state.loading = false;
            state.detailsLoading = false;
            state.error = null;
            state.detailsError = null;
            state.savedCreators = [];
            state.savedCreatorIds = [];
            state.savedLoading = false;
            state.savedError = null;
            state.savingId = null;
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
                state.detailsLoading = true;
                state.detailsError = null;
            })
            .addCase(fetchBrandCreatorById.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.selectedCreator = action.payload?.data || null;
                state.detailsError = null;
            })
            .addCase(fetchBrandCreatorById.rejected, (state, action) => {
                state.detailsLoading = false;
                state.detailsError = action.payload || action.error?.message || "Unable to fetch creator details";
            })

            // Fetch Saved Creators shortlist
            .addCase(fetchSavedCreators.pending, (state) => {
                state.savedLoading = true;
                state.savedError = null;
            })
            .addCase(fetchSavedCreators.fulfilled, (state, action) => {
                state.savedLoading = false;
                state.savedCreators = action.payload?.data?.creators || [];
                const ids = (action.payload?.data?.creators || []).map((c) => (c._id || c.id)?.toString()).filter(Boolean);
                state.savedCreatorIds = Array.from(new Set([...state.savedCreatorIds, ...ids]));
                state.savedError = null;
            })
            .addCase(fetchSavedCreators.rejected, (state, action) => {
                state.savedLoading = false;
                state.savedError = action.payload || "Unable to fetch saved creators";
            })

            // Fetch Saved Creator IDs
            .addCase(fetchSavedCreatorIds.fulfilled, (state, action) => {
                const ids = (action.payload?.data?.ids || []).map((id) => id?.toString()).filter(Boolean);
                state.savedCreatorIds = ids;
            })

            // Save Creator
            .addCase(saveCreator.pending, (state, action) => {
                state.savingId = action.meta.arg?.toString();
            })
            .addCase(saveCreator.fulfilled, (state, action) => {
                state.savingId = null;
                const savedId = (action.payload?.data?.creatorId || action.meta.arg)?.toString();
                if (savedId && !state.savedCreatorIds.includes(savedId)) {
                    state.savedCreatorIds.push(savedId);
                }
            })
            .addCase(saveCreator.rejected, (state) => {
                state.savingId = null;
            })

            // Unsave Creator
            .addCase(unsaveCreator.pending, (state, action) => {
                state.savingId = action.meta.arg?.toString();
            })
            .addCase(unsaveCreator.fulfilled, (state, action) => {
                state.savingId = null;
                const removedId = (action.payload?.data?.creatorId || action.meta.arg)?.toString();
                if (removedId) {
                    state.savedCreatorIds = state.savedCreatorIds.filter((id) => id !== removedId);
                    state.savedCreators = state.savedCreators.filter((c) => (c._id || c.id)?.toString() !== removedId);
                }
            })
            .addCase(unsaveCreator.rejected, (state) => {
                state.savingId = null;
            })

            // Clear state on auth events
            .addCase(login.fulfilled, (state) => {
                state.creators = [];
                state.selectedCreator = null;
                state.pagination = null;
                state.loading = false;
                state.detailsLoading = false;
                state.error = null;
                state.detailsError = null;
                state.savedCreators = [];
                state.savedCreatorIds = [];
                state.savedLoading = false;
                state.savedError = null;
                state.savingId = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.creators = [];
                state.selectedCreator = null;
                state.pagination = null;
                state.loading = false;
                state.detailsLoading = false;
                state.error = null;
                state.detailsError = null;
                state.savedCreators = [];
                state.savedCreatorIds = [];
                state.savedLoading = false;
                state.savedError = null;
                state.savingId = null;
            })
            .addCase(clearAuth, (state) => {
                state.creators = [];
                state.selectedCreator = null;
                state.pagination = null;
                state.loading = false;
                state.detailsLoading = false;
                state.error = null;
                state.detailsError = null;
                state.savedCreators = [];
                state.savedCreatorIds = [];
                state.savedLoading = false;
                state.savedError = null;
                state.savingId = null;
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
    fetchBrandCreatorById,
    fetchSavedCreators,
    fetchSavedCreatorIds,
    saveCreator,
    unsaveCreator
};

export default brandCreatorsSlice.reducer;
