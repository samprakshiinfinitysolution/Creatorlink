import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getBrandWorkspaces as getBrandWorkspacesApi,
    getBrandWorkspaceById as getBrandWorkspaceByIdApi,
    reviewBrandWorkspace as reviewBrandWorkspaceApi
} from "./workspace_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";


// Handles fetching brand workspaces list.
const fetchBrandWorkspaces = createAsyncThunk(
    "brandWorkspace/fetchBrandWorkspaces",
    async (params = {}, { rejectWithValue }) => {

        try {

            return await getBrandWorkspacesApi(params);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch brand workspaces"
            );
        }
    }
);


// Handles fetching single brand workspace by ID.
const fetchBrandWorkspaceById = createAsyncThunk(
    "brandWorkspace/fetchBrandWorkspaceById",
    async (workspaceId, { rejectWithValue }) => {

        try {

            return await getBrandWorkspaceByIdApi(workspaceId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch workspace details"
            );
        }
    }
);


// Handles reviewing workspace submission (approve / request revision) by brand.
const reviewBrandWorkspace = createAsyncThunk(
    "brandWorkspace/reviewBrandWorkspace",
    async ({ workspaceId, reviewData }, { rejectWithValue }) => {

        try {

            return await reviewBrandWorkspaceApi(workspaceId, reviewData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to review workspace"
            );
        }
    }
);


const initialState = {
    workspaces: [],
    selectedWorkspace: null,
    pagination: null,
    loading: false,
    submitting: false,
    error: null,
    successMessage: null
};


const brandWorkspaceSlice = createSlice({

    name: "brandWorkspace",

    initialState,

    reducers: {

        clearSelectedWorkspace: (state) => {
            state.selectedWorkspace = null;
        },

        clearWorkspaceState: (state) => {
            state.workspaces = [];
            state.selectedWorkspace = null;
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

            // Fetch Brand Workspaces started.
            .addCase(fetchBrandWorkspaces.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Brand Workspaces successful.
            .addCase(fetchBrandWorkspaces.fulfilled, (state, action) => {

                state.loading = false;
                state.workspaces = action.payload?.data?.workspaces || [];
                state.pagination = action.payload?.data?.pagination || null;
                state.error = null;
            })

            // Fetch Brand Workspaces failed.
            .addCase(fetchBrandWorkspaces.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Fetch Brand Workspace By ID started.
            .addCase(fetchBrandWorkspaceById.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Brand Workspace By ID successful.
            .addCase(fetchBrandWorkspaceById.fulfilled, (state, action) => {

                state.loading = false;
                state.selectedWorkspace = action.payload?.data || null;
                state.error = null;
            })

            // Fetch Brand Workspace By ID failed.
            .addCase(fetchBrandWorkspaceById.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Review Brand Workspace started.
            .addCase(reviewBrandWorkspace.pending, (state) => {

                state.submitting = true;
                state.error = null;
                state.successMessage = null;
            })

            // Review Brand Workspace successful.
            .addCase(reviewBrandWorkspace.fulfilled, (state, action) => {

                state.submitting = false;
                state.successMessage = action.payload?.message || "Workspace review updated successfully";

                const updatedWorkspace = action.payload?.data;

                if (updatedWorkspace) {
                    const index = state.workspaces.findIndex(
                        (item) => item._id === updatedWorkspace._id
                    );

                    if (index !== -1) {
                        state.workspaces[index] = updatedWorkspace;
                    }

                    if (state.selectedWorkspace && state.selectedWorkspace._id === updatedWorkspace._id) {
                        state.selectedWorkspace = updatedWorkspace;
                    }
                }

                state.error = null;
            })

            // Review Brand Workspace failed.
            .addCase(reviewBrandWorkspace.rejected, (state, action) => {

                state.submitting = false;
                state.error = action.payload;
            })


            // Clear state on auth events.
            .addCase(login.fulfilled, (state) => {

                state.workspaces = [];
                state.selectedWorkspace = null;
                state.pagination = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            })

            .addCase(logout.fulfilled, (state) => {

                state.workspaces = [];
                state.selectedWorkspace = null;
                state.pagination = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            })

            .addCase(clearAuth, (state) => {

                state.workspaces = [];
                state.selectedWorkspace = null;
                state.pagination = null;
                state.loading = false;
                state.submitting = false;
                state.error = null;
                state.successMessage = null;
            });
    }
});


export const {
    clearSelectedWorkspace,
    clearWorkspaceState,
    clearSuccessMessage
} = brandWorkspaceSlice.actions;


export {
    fetchBrandWorkspaces,
    fetchBrandWorkspaceById,
    reviewBrandWorkspace
};


export default brandWorkspaceSlice.reducer;
