import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getCreatorWorkspaces as getCreatorWorkspacesApi,
    getCreatorWorkspaceById as getCreatorWorkspaceByIdApi,
    submitCreatorWorkspaceWork as submitCreatorWorkspaceWorkApi,
    submitCreatorDeliverableWork as submitCreatorDeliverableWorkApi
} from "./workspace_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";


// Handles fetching creator workspaces list.
const fetchCreatorWorkspaces = createAsyncThunk(
    "creatorWorkspace/fetchCreatorWorkspaces",
    async (params = {}, { rejectWithValue }) => {

        try {

            return await getCreatorWorkspacesApi(params);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch creator workspaces"
            );
        }
    }
);


// Handles fetching single creator workspace by ID.
const fetchCreatorWorkspaceById = createAsyncThunk(
    "creatorWorkspace/fetchCreatorWorkspaceById",
    async (workspaceId, { rejectWithValue }) => {

        try {

            return await getCreatorWorkspaceByIdApi(workspaceId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch workspace details"
            );
        }
    }
);


// Handles submitting work for a workspace by creator (legacy wrapper).
const submitCreatorWorkspaceWork = createAsyncThunk(
    "creatorWorkspace/submitCreatorWorkspaceWork",
    async ({ workspaceId, submissionData }, { rejectWithValue }) => {

        try {

            return await submitCreatorWorkspaceWorkApi(workspaceId, submissionData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to submit work"
            );
        }
    }
);


// Handles submitting work for a specific deliverable in a workspace by creator.
const submitCreatorDeliverableWork = createAsyncThunk(
    "creatorWorkspace/submitCreatorDeliverableWork",
    async ({ workspaceId, deliverableId, submissionData }, { rejectWithValue }) => {

        try {

            return await submitCreatorDeliverableWorkApi(workspaceId, deliverableId, submissionData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to submit deliverable work"
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


const creatorWorkspaceSlice = createSlice({

    name: "creatorWorkspace",

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

            // Fetch Creator Workspaces started.
            .addCase(fetchCreatorWorkspaces.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Creator Workspaces successful.
            .addCase(fetchCreatorWorkspaces.fulfilled, (state, action) => {

                state.loading = false;
                state.workspaces = action.payload?.data?.workspaces || [];
                state.pagination = action.payload?.data?.pagination || null;
                state.error = null;
            })

            // Fetch Creator Workspaces failed.
            .addCase(fetchCreatorWorkspaces.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Fetch Creator Workspace By ID started.
            .addCase(fetchCreatorWorkspaceById.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Fetch Creator Workspace By ID successful.
            .addCase(fetchCreatorWorkspaceById.fulfilled, (state, action) => {

                state.loading = false;
                state.selectedWorkspace = action.payload?.data || null;
                state.error = null;
            })

            // Fetch Creator Workspace By ID failed.
            .addCase(fetchCreatorWorkspaceById.rejected, (state, action) => {

                state.loading = false;
                state.error = action.payload;
            })


            // Submit Creator Workspace Work started.
            .addCase(submitCreatorWorkspaceWork.pending, (state) => {

                state.submitting = true;
                state.error = null;
                state.successMessage = null;
            })

            // Submit Creator Workspace Work successful.
            .addCase(submitCreatorWorkspaceWork.fulfilled, (state, action) => {

                state.submitting = false;
                state.successMessage = action.payload?.message || "Work submitted successfully";

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

            // Submit Creator Workspace Work failed.
            .addCase(submitCreatorWorkspaceWork.rejected, (state, action) => {

                state.submitting = false;
                state.error = action.payload;
            })


            // Submit Creator Deliverable Work started.
            .addCase(submitCreatorDeliverableWork.pending, (state) => {

                state.submitting = true;
                state.error = null;
                state.successMessage = null;
            })

            // Submit Creator Deliverable Work successful.
            .addCase(submitCreatorDeliverableWork.fulfilled, (state, action) => {

                state.submitting = false;
                state.successMessage = action.payload?.message || "Deliverable work submitted successfully";

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

            // Submit Creator Deliverable Work failed.
            .addCase(submitCreatorDeliverableWork.rejected, (state, action) => {

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
} = creatorWorkspaceSlice.actions;


export {
    fetchCreatorWorkspaces,
    fetchCreatorWorkspaceById,
    submitCreatorWorkspaceWork,
    submitCreatorDeliverableWork
};


export default creatorWorkspaceSlice.reducer;

