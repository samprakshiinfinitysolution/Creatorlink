import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getCreatorPayments as getCreatorPaymentsApi,
    getCreatorPaymentById as getCreatorPaymentByIdApi
} from "./payments_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";

// Handles fetching received payments list for authenticated creator
const fetchCreatorPayments = createAsyncThunk(
    "creatorPayments/fetchCreatorPayments",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getCreatorPaymentsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch received payment history"
            );
        }
    }
);

// Handles fetching single received payment receipt details by ID
const fetchCreatorPaymentById = createAsyncThunk(
    "creatorPayments/fetchCreatorPaymentById",
    async (paymentId, { rejectWithValue }) => {
        try {
            return await getCreatorPaymentByIdApi(paymentId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch payment details"
            );
        }
    }
);

const initialState = {
    payments: [],
    selectedPayment: null,
    pagination: null,
    loading: false,
    detailLoading: false,
    error: null
};

const creatorPaymentsSlice = createSlice({
    name: "creatorPayments",
    initialState,
    reducers: {
        clearSelectedPayment: (state) => {
            state.selectedPayment = null;
        },
        clearPaymentState: (state) => {
            state.payments = [];
            state.selectedPayment = null;
            state.pagination = null;
            state.loading = false;
            state.detailLoading = false;
            state.error = null;
        },
        clearPaymentError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Creator Payments List
            .addCase(fetchCreatorPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCreatorPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload?.data?.payments || [];
                state.pagination = action.payload?.data?.pagination || null;
                state.error = null;
            })
            .addCase(fetchCreatorPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Creator Payment By ID
            .addCase(fetchCreatorPaymentById.pending, (state) => {
                state.detailLoading = true;
                state.error = null;
            })
            .addCase(fetchCreatorPaymentById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedPayment = action.payload?.data || null;
                state.error = null;
            })
            .addCase(fetchCreatorPaymentById.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = action.payload;
            })

            // Clear state on auth events
            .addCase(login.fulfilled, (state) => {
                state.payments = [];
                state.selectedPayment = null;
                state.pagination = null;
                state.loading = false;
                state.detailLoading = false;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.payments = [];
                state.selectedPayment = null;
                state.pagination = null;
                state.loading = false;
                state.detailLoading = false;
                state.error = null;
            })
            .addCase(clearAuth, (state) => {
                state.payments = [];
                state.selectedPayment = null;
                state.pagination = null;
                state.loading = false;
                state.detailLoading = false;
                state.error = null;
            });
    }
});

export const {
    clearSelectedPayment,
    clearPaymentState,
    clearPaymentError
} = creatorPaymentsSlice.actions;

export {
    fetchCreatorPayments,
    fetchCreatorPaymentById
};

export default creatorPaymentsSlice.reducer;
