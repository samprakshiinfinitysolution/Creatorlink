import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getCreatorBookings as getCreatorBookingsApi,
    getCreatorBookingById as getCreatorBookingByIdApi,
    updateCreatorBookingStatus as updateCreatorBookingStatusApi,
    cancelCreatorBooking as cancelCreatorBookingApi
} from "./bookings_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";

// Handles fetching creator bookings list with pagination and filters.
const fetchCreatorBookings = createAsyncThunk(
    "creatorBookings/fetchCreatorBookings",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getCreatorBookingsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch creator bookings"
            );
        }
    }
);

// Handles fetching a single creator booking by ID.
const fetchCreatorBookingById = createAsyncThunk(
    "creatorBookings/fetchCreatorBookingById",
    async (bookingId, { rejectWithValue }) => {
        try {
            return await getCreatorBookingByIdApi(bookingId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch booking details"
            );
        }
    }
);

// Handles updating a brand-initiated booking proposal ("accepted" or "rejected").
const updateCreatorBookingStatus = createAsyncThunk(
    "creatorBookings/updateCreatorBookingStatus",
    async ({ bookingId, status }, { rejectWithValue }) => {
        try {
            const updateRes = await updateCreatorBookingStatusApi(bookingId, status);

            try {
                // Enrich with fresh populated booking details if available
                const freshRes = await getCreatorBookingByIdApi(bookingId);
                if (freshRes && freshRes.data) {
                    return {
                        ...updateRes,
                        data: freshRes.data
                    };
                }
            } catch {
                // If secondary fetch fails, fallback to standard update response
            }

            return updateRes;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to update booking proposal status"
            );
        }
    }
);

// Handles cancelling a pending booking application initiated by the creator.
const cancelCreatorBooking = createAsyncThunk(
    "creatorBookings/cancelCreatorBooking",
    async (bookingId, { rejectWithValue }) => {
        try {
            const cancelRes = await cancelCreatorBookingApi(bookingId);

            try {
                // Enrich with fresh populated booking details if available
                const freshRes = await getCreatorBookingByIdApi(bookingId);
                if (freshRes && freshRes.data) {
                    return {
                        ...cancelRes,
                        data: freshRes.data
                    };
                }
            } catch {
                // If secondary fetch fails, fallback to standard cancel response
            }

            return cancelRes;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to cancel booking application"
            );
        }
    }
);

const initialState = {
    bookings: [],
    selectedBooking: null,
    pagination: null,
    loading: false,
    submitting: false,
    error: null,
    successMessage: null
};

const bookingsSlice = createSlice({
    name: "creatorBookings",
    initialState,
    reducers: {
        clearSelectedBooking: (state) => {
            state.selectedBooking = null;
        },
        clearBookingState: (state) => {
            state.bookings = [];
            state.selectedBooking = null;
            state.pagination = null;
            state.loading = false;
            state.submitting = false;
            state.error = null;
            state.successMessage = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        clearBookingError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Creator Bookings
            .addCase(fetchCreatorBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCreatorBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload?.data?.bookings || [];
                state.pagination = action.payload?.data?.pagination || null;
                state.error = null;
            })
            .addCase(fetchCreatorBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Creator Booking By ID
            .addCase(fetchCreatorBookingById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCreatorBookingById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedBooking = action.payload?.data || null;
                state.error = null;
            })
            .addCase(fetchCreatorBookingById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Creator Booking Status (Accept / Reject)
            .addCase(updateCreatorBookingStatus.pending, (state) => {
                state.submitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateCreatorBookingStatus.fulfilled, (state, action) => {
                state.submitting = false;
                state.successMessage = action.payload?.message || "Booking proposal updated successfully";

                const updatedBooking = action.payload?.data;
                if (updatedBooking) {
                    const index = state.bookings.findIndex(
                        (item) => item._id === updatedBooking._id
                    );

                    if (index !== -1) {
                        state.bookings[index] = updatedBooking;
                    }

                    if (state.selectedBooking && state.selectedBooking._id === updatedBooking._id) {
                        state.selectedBooking = updatedBooking;
                    }
                }

                state.error = null;
            })
            .addCase(updateCreatorBookingStatus.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })

            // Cancel Creator Booking Application
            .addCase(cancelCreatorBooking.pending, (state) => {
                state.submitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(cancelCreatorBooking.fulfilled, (state, action) => {
                state.submitting = false;
                state.successMessage = action.payload?.message || "Booking application cancelled successfully";

                const updatedBooking = action.payload?.data;
                if (updatedBooking) {
                    const index = state.bookings.findIndex(
                        (item) => item._id === updatedBooking._id
                    );

                    if (index !== -1) {
                        state.bookings[index] = updatedBooking;
                    }

                    if (state.selectedBooking && state.selectedBooking._id === updatedBooking._id) {
                        state.selectedBooking = updatedBooking;
                    }
                }

                state.error = null;
            })
            .addCase(cancelCreatorBooking.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })

            // Reset state on auth lifecycle events
            .addCase(login.fulfilled, (state) => {
                state.bookings = [];
                state.selectedBooking = null;
                state.pagination = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.bookings = [];
                state.selectedBooking = null;
                state.pagination = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(clearAuth, (state) => {
                state.bookings = [];
                state.selectedBooking = null;
                state.pagination = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            });
    }
});

export const {
    clearSelectedBooking,
    clearBookingState,
    clearSuccessMessage,
    clearBookingError
} = bookingsSlice.actions;

export {
    fetchCreatorBookings,
    fetchCreatorBookingById,
    updateCreatorBookingStatus,
    cancelCreatorBooking
};

export default bookingsSlice.reducer;

