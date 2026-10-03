import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    loginUser,
    registerUser,
    refreshAccessToken,
    logoutUser, getCurrentUser
} from "./auth_api";


// Handles user login.
const login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {

        try {

            return await loginUser(credentials);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    }
);


// Handles user registration.
const register = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {

        try {

            return await registerUser(userData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    }
);


// Handles access-token refresh.
const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async (_, { rejectWithValue }) => {

        try {

            return await refreshAccessToken();

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Session expired"
            );
        }
    }
);


// Handles logout.
const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {

        try {

            return await logoutUser();

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Logout failed"
            );
        }
    }
);


// Handles get current user.
const getMe = createAsyncThunk(
    "auth/getMe",
    async (_, thunkAPI) => {

        try {

            return await getCurrentUser();

        } catch (error) {

            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch user"
            );
        }
    }
);




const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
};


const authSlice = createSlice({

    name: "auth",
    initialState,
    reducers: {

        clearAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            // Login started.
            .addCase(login.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Login successful.
            .addCase(login.fulfilled, (state, action) => {

                state.loading = false;
                state.user = action.payload.data.user;
                state.isAuthenticated = true;
                state.error = null;
            })

            // Login failed.
            .addCase(login.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Registration started.
            .addCase(register.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Registration successful.
            .addCase(register.fulfilled, (state) => {

                state.loading = false;
                state.error = null;
            })

            // Registration failed.
            .addCase(register.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Refresh started.
            .addCase(refreshToken.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Refresh successful.
            .addCase(refreshToken.fulfilled, (state) => {

                state.loading = false;
                state.error = null;
            })

            // Refresh failed.
            .addCase(refreshToken.rejected, (state, action) => {

                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            })
             // CURRENT USER
            .addCase(getMe.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            .addCase(getMe.fulfilled, (state, action) => {

                state.loading = false;
                state.error = null;

                state.user = action.payload.data;
                state.isAuthenticated = true;
            })

            .addCase(getMe.rejected, (state, action) => {

                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            })


            // Logout started.
            .addCase(logout.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Logout successful.
            .addCase(logout.fulfilled, (state) => {

                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })

            // Logout failed.
            .addCase(logout.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            });
    }
});


export const {
    clearAuth
} = authSlice.actions;


export {
    login,
    register,
    refreshToken,
    logout
};


export default authSlice.reducer;