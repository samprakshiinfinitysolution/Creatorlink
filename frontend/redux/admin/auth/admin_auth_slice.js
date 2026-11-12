import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    adminLoginApi,
    getAdminMeApi,
    adminRefreshTokenApi,
    adminLogoutApi
} from "./admin_auth_api";

// Async thunk for dedicated Admin Login
export const adminLogin = createAsyncThunk(
    "adminAuth/adminLogin",
    async (credentials, { rejectWithValue }) => {
        try {
            return await adminLoginApi(credentials);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Admin login failed"
            );
        }
    }
);

// Async thunk for verifying and restoring active Admin session
export const getAdminMe = createAsyncThunk(
    "adminAuth/getAdminMe",
    async (_, { rejectWithValue }) => {
        try {
            return await getAdminMeApi();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to restore admin session"
            );
        }
    }
);

// Async thunk for Admin Token Refresh
export const adminRefreshToken = createAsyncThunk(
    "adminAuth/adminRefreshToken",
    async (_, { rejectWithValue }) => {
        try {
            return await adminRefreshTokenApi();
        } catch (error) {
            const isAuthFailure =
                error.response?.status === 401 ||
                error.response?.status === 403;
            return rejectWithValue(
                error.response?.data?.message ||
                (isAuthFailure ? "Admin session expired" : "Failed to refresh admin token"),
                { isAuthFailure }
            );
        }
    }
);

// Async thunk for Admin Logout
export const adminLogout = createAsyncThunk(
    "adminAuth/adminLogout",
    async (_, { rejectWithValue }) => {
        try {
            return await adminLogoutApi();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Admin logout failed"
            );
        }
    }
);

const initialState = {
    adminUser: null,
    loading: false,
    isChecking: true,
    error: null
};

const adminAuthSlice = createSlice({
    name: "adminAuth",
    initialState,
    reducers: {
        updateAdminUser: (state, action) => {
            state.adminUser = { ...state.adminUser, ...action.payload };
        },
        clearAdminAuth: (state) => {
            state.adminUser = null;
            state.error = null;
            state.isChecking = false;
        },
        clearAdminError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Admin Login
            .addCase(adminLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(adminLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.adminUser = action.payload?.data?.user || action.payload?.user || null;
                state.isChecking = false;
                state.error = null;
            })
            .addCase(adminLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get Admin Me
            .addCase(getAdminMe.pending, (state) => {
                state.isChecking = true;
                state.error = null;
            })
            .addCase(getAdminMe.fulfilled, (state, action) => {
                state.isChecking = false;
                state.adminUser = action.payload?.data?.user || action.payload?.user || null;
            })
            .addCase(getAdminMe.rejected, (state) => {
                state.isChecking = false;
                state.adminUser = null;
            })

            // Admin Logout
            .addCase(adminLogout.fulfilled, (state) => {
                state.adminUser = null;
                state.isChecking = false;
                state.error = null;
            })

            // Admin Token Refresh
            .addCase(adminRefreshToken.fulfilled, (state, action) => {
                const user = action.payload?.data?.user || action.payload?.user;
                if (user) {
                    state.adminUser = user;
                }
            })
            .addCase(adminRefreshToken.rejected, (state, action) => {
                if (action.payload?.isAuthFailure) {
                    state.adminUser = null;
                }
            });
    }
});

export const { updateAdminUser, clearAdminAuth, clearAdminError } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;

