import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    createService,
    getCreatorServices,
    getServiceById,
    updateService,
    deleteService
} from "./services_api";


// Handles service creation.
const createCreatorService = createAsyncThunk(
    "services/createService",
    async (serviceData, { rejectWithValue }) => {

        try {

            return await createService(serviceData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Service creation failed"
            );
        }
    }
);


// Handles fetching creator services.
const getServices = createAsyncThunk(
    "services/getServices",
    async (query = {}, { rejectWithValue }) => {

        try {

            return await getCreatorServices(query);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch services"
            );
        }
    }
);


// Handles fetching one creator service.
const getService = createAsyncThunk(
    "services/getService",
    async (serviceId, { rejectWithValue }) => {

        try {

            return await getServiceById(serviceId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch service"
            );
        }
    }
);


// Handles service update.
const updateCreatorService = createAsyncThunk(
    "services/updateService",
    async (
        { serviceId, serviceData },
        { rejectWithValue }
    ) => {

        try {

            return await updateService(
                serviceId,
                serviceData
            );

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Service update failed"
            );
        }
    }
);


// Handles service deletion.
const deleteCreatorService = createAsyncThunk(
    "services/deleteService",
    async (serviceId, { rejectWithValue }) => {

        try {

            return await deleteService(serviceId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Service deletion failed"
            );
        }
    }
);


const initialState = {
    services: [],
    service: null,
    pagination: null,
    loading: false,
    error: null
};


const servicesSlice = createSlice({

    name: "services",

    initialState,

    reducers: {

        clearService: (state) => {
            state.service = null;
            state.error = null;
        },

        clearServices: (state) => {
            state.services = [];
            state.pagination = null;
            state.error = null;
        }
    },

    extraReducers: (builder) => {

        builder

            // Create service started.
            .addCase(
                createCreatorService.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            // Create service successful.
            .addCase(
                createCreatorService.fulfilled,
                (state, action) => {

                    state.loading = false;
                    state.service = action.payload.data;

                    state.services.unshift(
                        action.payload.data
                    );

                    state.error = null;
                }
            )

            // Create service failed.
            .addCase(
                createCreatorService.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            )


            // Get services started.
            .addCase(
                getServices.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            // Get services successful.
            .addCase(
                getServices.fulfilled,
                (state, action) => {

                    state.loading = false;

                    state.services =
                        action.payload.data.services;

                    state.pagination =
                        action.payload.data.pagination;

                    state.error = null;
                }
            )

            // Get services failed.
            .addCase(
                getServices.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            )


            // Get one service started.
            .addCase(
                getService.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            // Get one service successful.
            .addCase(
                getService.fulfilled,
                (state, action) => {

                    state.loading = false;
                    state.service = action.payload.data;
                    state.error = null;
                }
            )

            // Get one service failed.
            .addCase(
                getService.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            )


            // Update service started.
            .addCase(
                updateCreatorService.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            // Update service successful.
            .addCase(
                updateCreatorService.fulfilled,
                (state, action) => {

                    state.loading = false;

                    const updatedService =
                        action.payload.data;

                    state.service = updatedService;

                    const index =
                        state.services.findIndex(
                            (item) =>
                                item._id === updatedService._id
                        );

                    if (index !== -1) {

                        state.services[index] =
                            updatedService;
                    }

                    state.error = null;
                }
            )

            // Update service failed.
            .addCase(
                updateCreatorService.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            )


            // Delete service started.
            .addCase(
                deleteCreatorService.pending,
                (state) => {

                    state.loading = true;
                    state.error = null;
                }
            )

            // Delete service successful.
            .addCase(
                deleteCreatorService.fulfilled,
                (state, action) => {

                    state.loading = false;

                    const deletedServiceId =
                        action.meta.arg;

                    state.services =
                        state.services.filter(
                            (item) =>
                                item._id !== deletedServiceId
                        );

                    if (
                        state.service?._id ===
                        deletedServiceId
                    ) {
                        state.service = null;
                    }

                    state.error = null;
                }
            )

            // Delete service failed.
            .addCase(
                deleteCreatorService.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});


export const {
    clearService,
    clearServices
} = servicesSlice.actions;


export {
    createCreatorService,
    getServices,
    getService,
    updateCreatorService,
    deleteCreatorService
};


export default servicesSlice.reducer;