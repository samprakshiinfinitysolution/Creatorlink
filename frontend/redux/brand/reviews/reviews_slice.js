import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getBrandReviews as getBrandReviewsApi,
    submitBrandReview as submitBrandReviewApi,
    getBrandWorkspaceReview as getBrandWorkspaceReviewApi
} from "./reviews_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";

// Handles fetching submitted reviews list for authenticated brand
const fetchBrandReviews = createAsyncThunk(
    "brandReviews/fetchBrandReviews",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getBrandReviewsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch brand reviews"
            );
        }
    }
);

// Handles fetching review details for a specific workspace for authenticated brand
const fetchBrandWorkspaceReview = createAsyncThunk(
    "brandReviews/fetchBrandWorkspaceReview",
    async (workspaceId, { rejectWithValue }) => {
        try {
            return await getBrandWorkspaceReviewApi(workspaceId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch workspace review"
            );
        }
    }
);

// Handles submitting a review for a completed workspace collaboration
const submitBrandReviewThunk = createAsyncThunk(
    "brandReviews/submitBrandReview",
    async (payload, { rejectWithValue }) => {
        try {
            return await submitBrandReviewApi(payload);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to submit review"
            );
        }
    }
);

const initialState = {
    reviews: [],
    workspaceReview: null,
    workspaceReviewWorkspaceId: null,
    workspaceReviewRequestId: null,
    workspaceReviewLoading: false,
    workspaceReviewError: null,
    pagination: null,
    loading: false,
    submitting: false,
    error: null,
    successMessage: null
};

const brandReviewsSlice = createSlice({
    name: "brandReviews",
    initialState,
    reducers: {
        clearReviewError: (state) => {
            state.error = null;
        },
        clearReviewSuccess: (state) => {
            state.successMessage = null;
        },
        clearWorkspaceReview: (state) => {
            state.workspaceReview = null;
            state.workspaceReviewWorkspaceId = null;
            state.workspaceReviewRequestId = null;
            state.workspaceReviewLoading = false;
            state.workspaceReviewError = null;
        },
        clearReviewsState: (state) => {
            state.reviews = [];
            state.workspaceReview = null;
            state.workspaceReviewWorkspaceId = null;
            state.workspaceReviewRequestId = null;
            state.workspaceReviewLoading = false;
            state.workspaceReviewError = null;
            state.pagination = null;
            state.loading = false;
            state.submitting = false;
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Brand Reviews
            .addCase(fetchBrandReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrandReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload?.data?.reviews || [];
                state.pagination = action.payload?.data?.pagination || null;
                state.error = null;
            })
            .addCase(fetchBrandReviews.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload ||
                    action.error?.message ||
                    "An unexpected error occurred";
            })

            // Fetch Brand Workspace Review
            .addCase(fetchBrandWorkspaceReview.pending, (state, action) => {
                state.workspaceReviewWorkspaceId = action.meta.arg ? String(action.meta.arg) : null;
                state.workspaceReviewRequestId = action.meta.requestId;
                state.workspaceReview = null;
                state.workspaceReviewLoading = true;
                state.workspaceReviewError = null;
            })
            .addCase(fetchBrandWorkspaceReview.fulfilled, (state, action) => {
                const requestedWorkspaceId = action.meta.arg ? String(action.meta.arg) : null;
                // Stale response / race condition guard: only accept if both workspaceId and requestId match latest active request
                if (
                    state.workspaceReviewRequestId === action.meta.requestId &&
                    state.workspaceReviewWorkspaceId === requestedWorkspaceId
                ) {
                    state.workspaceReviewLoading = false;
                    state.workspaceReview = action.payload?.data || null;
                    state.workspaceReviewError = null;
                }
            })
            .addCase(fetchBrandWorkspaceReview.rejected, (state, action) => {
                const requestedWorkspaceId = action.meta.arg ? String(action.meta.arg) : null;
                // Stale rejection guard: only record error if both workspaceId and requestId match latest active request
                if (
                    state.workspaceReviewRequestId === action.meta.requestId &&
                    state.workspaceReviewWorkspaceId === requestedWorkspaceId
                ) {
                    state.workspaceReviewLoading = false;
                    state.workspaceReviewError =
                        action.payload ||
                        action.error?.message ||
                        "Failed to fetch workspace review";
                }
            })

            // Submit Brand Review
            .addCase(submitBrandReviewThunk.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(submitBrandReviewThunk.fulfilled, (state, action) => {
                state.submitting = false;
                state.successMessage =
                    action.payload?.message ||
                    "Review submitted successfully";
                const submittedWsId = action.meta.arg?.workspaceId ? String(action.meta.arg.workspaceId) : null;
                if (
                    action.payload?.data &&
                    state.workspaceReviewWorkspaceId &&
                    submittedWsId === state.workspaceReviewWorkspaceId
                ) {
                    state.workspaceReview = action.payload.data;
                    state.workspaceReviewError = null;
                }
                state.error = null;
            })
            .addCase(submitBrandReviewThunk.rejected, (state, action) => {
                state.submitting = false;
                state.error =
                    action.payload ||
                    action.error?.message ||
                    "An unexpected error occurred";
            })

            // Clear state on auth events
            .addCase(login.fulfilled, (state) => {
                state.reviews = [];
                state.workspaceReview = null;
                state.workspaceReviewWorkspaceId = null;
                state.workspaceReviewRequestId = null;
                state.workspaceReviewLoading = false;
                state.workspaceReviewError = null;
                state.pagination = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.reviews = [];
                state.workspaceReview = null;
                state.workspaceReviewWorkspaceId = null;
                state.workspaceReviewRequestId = null;
                state.workspaceReviewLoading = false;
                state.workspaceReviewError = null;
                state.pagination = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(clearAuth, (state) => {
                state.reviews = [];
                state.workspaceReview = null;
                state.workspaceReviewWorkspaceId = null;
                state.workspaceReviewRequestId = null;
                state.workspaceReviewLoading = false;
                state.workspaceReviewError = null;
                state.pagination = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            });
    }
});

export const {
    clearReviewError,
    clearReviewSuccess,
    clearWorkspaceReview,
    clearReviewsState
} = brandReviewsSlice.actions;

export {
    fetchBrandReviews,
    fetchBrandWorkspaceReview,
    submitBrandReviewThunk
};

export default brandReviewsSlice.reducer;
