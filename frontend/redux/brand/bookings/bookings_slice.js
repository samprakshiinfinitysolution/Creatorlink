import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getBrandBookings as getBrandBookingsApi,
    getBrandBookingById as getBrandBookingByIdApi,
    updateBrandBookingStatus as updateBrandBookingStatusApi
} from "./bookings_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";


// Handles fetching brand bookings list with optional params.
const fetchBrandBookings = createAsyncThunk(
    "brandBookings/fetchBrandBookings",
    async (params = {}, { rejectWithValue }) => {

        try {

            return await getBrandBookingsApi(params);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch brand bookings"
            );
        }
    }
);


// Handles fetching a single brand booking by ID.
const fetchBrandBookingById = createAsyncThunk(
    "brandBookings/fetchBrandBookingById",
    async (bookingId, { rejectWithValue }) => {

        try {

            return await getBrandBookingByIdApi(bookingId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch booking details"
            );
        }
    }
);


// Handles updating brand booking status ("accepted" or "rejected").
const updateBrandBookingStatus = createAsyncThunk(
    "brandBookings/updateBrandBookingStatus",
    async ({ bookingId, status }, { rejectWithValue }) => {

        try {

            const updateRes = await updateBrandBookingStatusApi(bookingId, status);

            try {
                const freshRes = await getBrandBookingByIdApi(bookingId);
                if (freshRes && freshRes.data) {
                    return {
                        ...updateRes,
                        data: freshRes.data
                    };
                }
            } catch {
                // If fetching fresh populated booking fails, fallback to update status response
            }

            return updateRes;

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to update booking status"
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

    name: "brandBookings",

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
        }
    },

    extraReducers: (builder) => {

        builder

            // Fetch Brand Bookings started.
            .addCase(fetchBrandBookings.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Brand Bookings successful.
            .addCase(fetchBrandBookings.fulfilled, (state, action) => {

                state.loading = false;
                state.bookings = action.payload?.data?.bookings || [];
                state.pagination = action.payload?.data?.pagination || null;
                state.error = null;
            })

            // Fetch Brand Bookings failed.
            .addCase(fetchBrandBookings.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Fetch Brand Booking By ID started.
            .addCase(fetchBrandBookingById.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Brand Booking By ID successful.
            .addCase(fetchBrandBookingById.fulfilled, (state, action) => {

                state.loading = false;
                state.selectedBooking = action.payload?.data || null;
                state.error = null;
            })

            // Fetch Brand Booking By ID failed.
            .addCase(fetchBrandBookingById.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Update Brand Booking Status started.
            .addCase(updateBrandBookingStatus.pending, (state) => {

                state.submitting = true;
                state.error = null;
                state.successMessage = null;
            })

            // Update Brand Booking Status successful.
            .addCase(updateBrandBookingStatus.fulfilled, (state, action) => {

                state.submitting = false;
                state.successMessage = action.payload?.message || "Booking status updated successfully";

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

            // Update Brand Booking Status failed.
            .addCase(updateBrandBookingStatus.rejected, (state, action) => {

                state.submitting = false;
                state.error = action.payload;
            })


            // Clear state on auth events.
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
    clearSuccessMessage
} = bookingsSlice.actions;


export {
    fetchBrandBookings,
    fetchBrandBookingById,
    updateBrandBookingStatus
};


export default bookingsSlice.reducer;
