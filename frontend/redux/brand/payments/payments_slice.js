import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    createBrandPaymentOrder as createBrandPaymentOrderApi,
    verifyBrandPayment as verifyBrandPaymentApi,
    reportBrandPaymentFailure as reportBrandPaymentFailureApi,
    getBrandPayments as getBrandPaymentsApi,
    getBrandPaymentById as getBrandPaymentByIdApi
} from "./payments_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";

// Handles creating Razorpay order for brand payment
const createPaymentOrder = createAsyncThunk(
    "brandPayments/createPaymentOrder",
    async (workspaceId, { rejectWithValue }) => {
        try {
            return await createBrandPaymentOrderApi(workspaceId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to create payment order"
            );
        }
    }
);

// Handles verifying Razorpay payment signature & status
const verifyPayment = createAsyncThunk(
    "brandPayments/verifyPayment",
    async (paymentData, { rejectWithValue }) => {
        try {
            return await verifyBrandPaymentApi(paymentData);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to verify payment with gateway"
            );
        }
    }
);

// Handles reporting Razorpay payment failure
const reportFailedPayment = createAsyncThunk(
    "brandPayments/reportFailedPayment",
    async (failureData, { rejectWithValue }) => {
        try {
            return await reportBrandPaymentFailureApi(failureData);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to report payment failure"
            );
        }
    }
);

// Handles fetching brand payment history list
const fetchBrandPayments = createAsyncThunk(
    "brandPayments/fetchBrandPayments",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getBrandPaymentsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch payment history"
            );
        }
    }
);

// Handles fetching single payment by ID
const fetchBrandPaymentById = createAsyncThunk(
    "brandPayments/fetchBrandPaymentById",
    async (paymentId, { rejectWithValue }) => {
        try {
            return await getBrandPaymentByIdApi(paymentId);
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
    creatingOrder: false,
    verifyingPayment: false,
    error: null,
    orderData: null,
    successMessage: null
};

const brandPaymentsSlice = createSlice({
    name: "brandPayments",
    initialState,
    reducers: {
        clearSelectedPayment: (state) => {
            state.selectedPayment = null;
        },
        clearOrderData: (state) => {
            state.orderData = null;
        },
        clearPaymentState: (state) => {
            state.payments = [];
            state.selectedPayment = null;
            state.pagination = null;
            state.loading = false;
            state.creatingOrder = false;
            state.verifyingPayment = false;
            state.error = null;
            state.orderData = null;
            state.successMessage = null;
        },
        clearPaymentSuccessMessage: (state) => {
            state.successMessage = null;
        },
        clearPaymentError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Payment Order
            .addCase(createPaymentOrder.pending, (state) => {
                state.creatingOrder = true;
                state.error = null;
            })
            .addCase(createPaymentOrder.fulfilled, (state, action) => {
                state.creatingOrder = false;
                state.orderData = action.payload?.data || null;
                state.error = null;
            })
            .addCase(createPaymentOrder.rejected, (state, action) => {
                state.creatingOrder = false;
                state.error = action.payload;
            })

            // Verify Payment
            .addCase(verifyPayment.pending, (state) => {
                state.verifyingPayment = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.verifyingPayment = false;
                state.orderData = null;
                state.successMessage = action.payload?.message || "Payment verified successfully";
                const updatedPayment = action.payload?.data?.payment;
                if (updatedPayment) {
                    const idx = state.payments.findIndex(
                        (item) => item._id === updatedPayment._id
                    );
                    if (idx !== -1) {
                        state.payments[idx] = updatedPayment;
                    }
                    if (state.selectedPayment && state.selectedPayment._id === updatedPayment._id) {
                        state.selectedPayment = updatedPayment;
                    }
                }
                state.error = null;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.verifyingPayment = false;
                state.error = action.payload;
            })

            // Report Failed Payment
            .addCase(reportFailedPayment.pending, (state) => {
                state.verifyingPayment = true;
                state.error = null;
            })
            .addCase(reportFailedPayment.fulfilled, (state, action) => {
                state.verifyingPayment = false;
                state.orderData = null;
                const updatedPayment = action.payload?.data?.payment;
                if (updatedPayment) {
                    const idx = state.payments.findIndex(
                        (item) => item._id === updatedPayment._id
                    );
                    if (idx !== -1) {
                        state.payments[idx] = updatedPayment;
                    }
                    if (state.selectedPayment && state.selectedPayment._id === updatedPayment._id) {
                        state.selectedPayment = updatedPayment;
                    }
                }
                state.error = null;
            })
            .addCase(reportFailedPayment.rejected, (state, action) => {
                state.verifyingPayment = false;
                state.error = action.payload;
            })

            // Fetch Brand Payments
            .addCase(fetchBrandPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrandPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload?.data?.payments || [];
                state.pagination = action.payload?.data?.pagination || null;
                state.error = null;
            })
            .addCase(fetchBrandPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Brand Payment By ID
            .addCase(fetchBrandPaymentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrandPaymentById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPayment = action.payload?.data || null;
                state.error = null;
            })
            .addCase(fetchBrandPaymentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Clear state on auth actions
            .addCase(login.fulfilled, (state) => {
                state.payments = [];
                state.selectedPayment = null;
                state.pagination = null;
                state.loading = false;
                state.creatingOrder = false;
                state.verifyingPayment = false;
                state.error = null;
                state.orderData = null;
                state.successMessage = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.payments = [];
                state.selectedPayment = null;
                state.pagination = null;
                state.loading = false;
                state.creatingOrder = false;
                state.verifyingPayment = false;
                state.error = null;
                state.orderData = null;
                state.successMessage = null;
            })
            .addCase(clearAuth, (state) => {
                state.payments = [];
                state.selectedPayment = null;
                state.pagination = null;
                state.loading = false;
                state.creatingOrder = false;
                state.verifyingPayment = false;
                state.error = null;
                state.orderData = null;
                state.successMessage = null;
            });
    }
});

export const {
    clearSelectedPayment,
    clearOrderData,
    clearPaymentState,
    clearPaymentSuccessMessage,
    clearPaymentError
} = brandPaymentsSlice.actions;

export {
    createPaymentOrder,
    verifyPayment,
    reportFailedPayment,
    fetchBrandPayments,
    fetchBrandPaymentById
};

export default brandPaymentsSlice.reducer;
