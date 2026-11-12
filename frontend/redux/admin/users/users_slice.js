import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getAdminUsers as getAdminUsersApi,
    getAdminUserById as getAdminUserByIdApi
} from "./users_api";
import { adminLogout, clearAdminAuth } from "../auth/admin_auth_slice";

// Handles fetching users list with query parameters
const fetchAdminUsers = createAsyncThunk(
    "adminUsers/fetchAdminUsers",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getAdminUsersApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch platform users"
            );
        }
    }
);

// Handles fetching single user details dossier by ID
const fetchAdminUserById = createAsyncThunk(
    "adminUsers/fetchAdminUserById",
    async (userId, { rejectWithValue }) => {
        try {
            return await getAdminUserByIdApi(userId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch user details"
            );
        }
    }
);

const initialState = {
    users: [],
    pagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0
    },
    selectedUserDossier: null,
    loading: false,
    detailLoading: false,
    error: null,
    detailError: null
};

const adminUsersSlice = createSlice({
    name: "adminUsers",
    initialState,
    reducers: {
        clearSelectedUser: (state) => {
            state.selectedUserDossier = null;
            state.detailError = null;
        },
        clearAdminUsersError: (state) => {
            state.error = null;
            state.detailError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch users list
            .addCase(fetchAdminUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload?.data?.users || [];
                state.pagination = action.payload?.data?.pagination || state.pagination;
                state.error = null;
            })
            .addCase(fetchAdminUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch user by ID
            .addCase(fetchAdminUserById.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchAdminUserById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedUserDossier = action.payload?.data || null;
                state.detailError = null;
            })
            .addCase(fetchAdminUserById.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload;
            })

            // Reset state upon admin logout
            .addCase(adminLogout.fulfilled, () => initialState)
            .addCase(clearAdminAuth, () => initialState);
    }
});

export const { clearSelectedUser, clearAdminUsersError } = adminUsersSlice.actions;
export { fetchAdminUsers, fetchAdminUserById };
export default adminUsersSlice.reducer;

