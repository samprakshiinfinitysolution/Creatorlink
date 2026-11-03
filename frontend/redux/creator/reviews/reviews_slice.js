import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getCreatorReviews as getCreatorReviewsApi,
    createCreatorReview as createCreatorReviewApi
} from "./reviews_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";

// Handles fetching received reviews list for authenticated creator
const fetchCreatorReviews = createAsyncThunk(
    "creatorReviews/fetchCreatorReviews",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getCreatorReviewsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch creator reviews"
            );
        }
    }
);

// Handles submitting a review for a brand on a completed workspace
const submitCreatorReview = createAsyncThunk(
    "creatorReviews/submitCreatorReview",
    async (reviewData, { rejectWithValue }) => {
        try {
            return await createCreatorReviewApi(reviewData);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to submit review for brand"
            );
        }
    }
);

const initialState = {
    reviews: [],
    stats: {
        totalReviews: 0,
        averageRating: 0
    },
    pagination: null,
    loading: false,
    submittingReview: false,
    reviewSuccess: false,
    error: null
};

const creatorReviewsSlice = createSlice({
    name: "creatorReviews",
    initialState,
    reducers: {
        clearReviewsState: (state) => {
            state.reviews = [];
            state.stats = {
                totalReviews: 0,
                averageRating: 0
            };
            state.pagination = null;
            state.loading = false;
            state.error = null;
        },
        clearReviewsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Creator Reviews List
            .addCase(fetchCreatorReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCreatorReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload?.data?.reviews || [];
                state.stats = action.payload?.data?.stats || {
                    totalReviews: 0,
                    averageRating: 0
                };
                state.pagination = action.payload?.data?.pagination || null;
                state.error = null;
            })
            .addCase(fetchCreatorReviews.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload ||
                    action.error?.message ||
                    "Failed to fetch creator reviews";
            })

            // Submit Creator Review for Brand
            .addCase(submitCreatorReview.pending, (state) => {
                state.submittingReview = true;
                state.reviewSuccess = false;
                state.error = null;
            })
            .addCase(submitCreatorReview.fulfilled, (state) => {
                state.submittingReview = false;
                state.reviewSuccess = true;
                state.error = null;
            })
            .addCase(submitCreatorReview.rejected, (state, action) => {
                state.submittingReview = false;
                state.reviewSuccess = false;
                state.error = action.payload || "Failed to submit review";
            })

            // Clear state on auth events
            .addCase(login.fulfilled, (state) => {
                state.reviews = [];
                state.stats = {
                    totalReviews: 0,
                    averageRating: 0
                };
                state.pagination = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.reviews = [];
                state.stats = {
                    totalReviews: 0,
                    averageRating: 0
                };
                state.pagination = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(clearAuth, (state) => {
                state.reviews = [];
                state.stats = {
                    totalReviews: 0,
                    averageRating: 0
                };
                state.pagination = null;
                state.loading = false;
                state.error = null;
            });
    }
});

export const {
    clearReviewsState,
    clearReviewsError
} = creatorReviewsSlice.actions;

export {
    fetchCreatorReviews,
    submitCreatorReview
};

export default creatorReviewsSlice.reducer;
