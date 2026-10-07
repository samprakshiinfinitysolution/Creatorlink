import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    createProfile,
    getMyProfile,
    updateMyProfile
} from "./profile_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";


// Handles brand profile creation.
const createBrandProfile = createAsyncThunk(
    "brandProfile/createProfile",
    async (profileData, { rejectWithValue }) => {

        try {

            return await createProfile(profileData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Brand profile creation failed"
            );
        }
    }
);


// Handles fetching the logged-in brand profile.
const getBrandProfile = createAsyncThunk(
    "brandProfile/getMyProfile",
    async (_, { rejectWithValue }) => {

        try {

            return await getMyProfile();

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch brand profile"
            );
        }
    }
);


// Handles brand profile update.
const updateBrandProfile = createAsyncThunk(
    "brandProfile/updateProfile",
    async (profileData, { rejectWithValue }) => {

        try {

            return await updateMyProfile(profileData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Brand profile update failed"
            );
        }
    }
);


const initialState = {
    profile: null,
    loading: false,
    error: null
};


const profileSlice = createSlice({

    name: "brandProfile",

    initialState,

    reducers: {

        clearBrandProfile: (state) => {
            state.profile = null;
            state.error = null;
        }
    },

    extraReducers: (builder) => {

        builder

            // Create profile started.
            .addCase(createBrandProfile.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Create profile successful.
            .addCase(createBrandProfile.fulfilled, (state, action) => {

                state.loading = false;
                state.profile = action.payload.data;
                state.error = null;
            })

            // Create profile failed.
            .addCase(createBrandProfile.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Get profile started.
            .addCase(getBrandProfile.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Get profile successful.
            .addCase(getBrandProfile.fulfilled, (state, action) => {

                state.loading = false;
                state.profile = action.payload.data;
                state.error = null;
            })

            // Get profile failed.
            .addCase(getBrandProfile.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Update profile started.
            .addCase(updateBrandProfile.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Update profile successful.
            .addCase(updateBrandProfile.fulfilled, (state, action) => {

                state.loading = false;
                state.profile = action.payload.data;
                state.error = null;
            })

            // Update profile failed.
            .addCase(updateBrandProfile.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })

            // Clear profile state when user logs in, logs out, or clears auth state.
            .addCase(login.fulfilled, (state) => {

                state.profile = null;
                state.loading = false;
                state.error = null;
            })

            .addCase(logout.fulfilled, (state) => {

                state.profile = null;
                state.loading = false;
                state.error = null;
            })

            .addCase(clearAuth, (state) => {

                state.profile = null;
                state.loading = false;
                state.error = null;
            });
    }
});


export const {
    clearBrandProfile
} = profileSlice.actions;


export {
    createBrandProfile,
    getBrandProfile,
    updateBrandProfile
};


export default profileSlice.reducer;
