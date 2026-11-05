import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    createProfile,
    getMyProfile,
    updateMyProfile,
    completeOnboardingApi
} from "./profile_api";

import {
    login,
    loginWithGoogle,
    logout,
    clearAuth
} from "../../auth/auth_slice";


// Handles creator profile creation.
const createCreatorProfile = createAsyncThunk(
    "profile/createProfile",
    async (profileData, { rejectWithValue }) => {

        try {
            const sanitized = { ...profileData };
            delete sanitized.isOnboarded;
            return await createProfile(sanitized);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Profile creation failed"
            );
        }
    }
);


// Handles fetching the logged-in creator profile.
const getCreatorProfile = createAsyncThunk(
    "profile/getMyProfile",
    async (_, { rejectWithValue }) => {

        try {

            return await getMyProfile();

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch profile"
            );
        }
    }
);


// Handles creator profile update.
const updateCreatorProfile = createAsyncThunk(
    "profile/updateProfile",
    async (profileData, { rejectWithValue }) => {

        try {
            const sanitized = { ...profileData };
            delete sanitized.isOnboarded;
            return await updateMyProfile(sanitized);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Profile update failed"
            );
        }
    }
);

// Handles completing creator onboarding with backend verification.
const completeCreatorOnboarding = createAsyncThunk(
    "profile/completeOnboarding",
    async (profileData, { rejectWithValue }) => {

        try {

            return await completeOnboardingApi(profileData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Creator onboarding completion failed"
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

    name: "profile",

    initialState,

    reducers: {

        clearProfile: (state) => {
            state.profile = null;
            state.error = null;
        }
    },

    extraReducers: (builder) => {

        builder

            // Create profile started.
            .addCase(createCreatorProfile.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Create profile successful.
            .addCase(createCreatorProfile.fulfilled, (state, action) => {

                state.loading = false;
                state.profile = action.payload.data;
                state.error = null;
            })

            // Create profile failed.
            .addCase(createCreatorProfile.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Get profile started.
            .addCase(getCreatorProfile.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Get profile successful.
            .addCase(getCreatorProfile.fulfilled, (state, action) => {

                state.loading = false;
                state.profile = action.payload.data;
                state.error = null;
            })

            // Get profile failed.
            .addCase(getCreatorProfile.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Update profile started.
            .addCase(updateCreatorProfile.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Update profile successful.
            .addCase(updateCreatorProfile.fulfilled, (state, action) => {

                state.loading = false;
                state.profile = action.payload.data;
                state.error = null;
            })

            // Update profile failed.
            .addCase(updateCreatorProfile.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })

            // Complete onboarding started.
            .addCase(completeCreatorOnboarding.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Complete onboarding successful.
            .addCase(completeCreatorOnboarding.fulfilled, (state, action) => {

                state.loading = false;
                state.profile = action.payload.data;
                state.error = null;
            })

            // Complete onboarding failed.
            .addCase(completeCreatorOnboarding.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })

            // Clear profile state when user logs in, logs out, or clears auth state.
            .addCase(login.fulfilled, (state) => {

                state.profile = null;
                state.loading = false;
                state.error = null;
            })

            .addCase(loginWithGoogle.fulfilled, (state) => {

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
    clearProfile
} = profileSlice.actions;


export {
    createCreatorProfile,
    getCreatorProfile,
    updateCreatorProfile,
    completeCreatorOnboarding
};


export default profileSlice.reducer;
