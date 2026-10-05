import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    createPortfolio,
    getMyPortfolios,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio
} from "./portfolio_api";


// Handles portfolio creation.
const createPortfolioItem = createAsyncThunk(
    "portfolio/createPortfolio",
    async (portfolioData, { rejectWithValue }) => {

        try {

            return await createPortfolio(portfolioData);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Portfolio creation failed"
            );
        }
    }
);


// Handles fetching all creator portfolio works.
const getPortfolios = createAsyncThunk(
    "portfolio/getPortfolios",
    async (_, { rejectWithValue }) => {

        try {

            return await getMyPortfolios();

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch portfolios"
            );
        }
    }
);


// Handles fetching one portfolio work.
const getPortfolio = createAsyncThunk(
    "portfolio/getPortfolio",
    async (portfolioId, { rejectWithValue }) => {

        try {

            return await getPortfolioById(portfolioId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch portfolio"
            );
        }
    }
);


// Handles portfolio update.
const updatePortfolioItem = createAsyncThunk(
    "portfolio/updatePortfolio",
    async (
        { portfolioId, portfolioData },
        { rejectWithValue }
    ) => {

        try {

            return await updatePortfolio(
                portfolioId,
                portfolioData
            );

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Portfolio update failed"
            );
        }
    }
);


// Handles portfolio deletion.
const deletePortfolioItem = createAsyncThunk(
    "portfolio/deletePortfolio",
    async (portfolioId, { rejectWithValue }) => {

        try {

            return await deletePortfolio(portfolioId);

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Portfolio deletion failed"
            );
        }
    }
);


const initialState = {
    portfolios: [],
    portfolio: null,
    loading: false,
    error: null
};


const portfolioSlice = createSlice({

    name: "portfolio",

    initialState,

    reducers: {

        clearPortfolio: (state) => {
            state.portfolio = null;
            state.error = null;
        },

        clearPortfolios: (state) => {
            state.portfolios = [];
            state.error = null;
        }
    },

    extraReducers: (builder) => {

        builder

            // Create portfolio started.
            .addCase(createPortfolioItem.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Create portfolio successful.
            .addCase(
                createPortfolioItem.fulfilled,
                (state, action) => {

                    state.loading = false;
                    state.portfolio = action.payload.data;

                    state.portfolios.unshift(
                        action.payload.data
                    );

                    state.error = null;
                }
            )

            // Create portfolio failed.
            .addCase(
                createPortfolioItem.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            )


            // Get all portfolios started.
            .addCase(getPortfolios.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Get all portfolios successful.
            .addCase(
                getPortfolios.fulfilled,
                (state, action) => {

                    state.loading = false;
                    state.portfolios = action.payload.data;
                    state.error = null;
                }
            )

            // Get all portfolios failed.
            .addCase(
                getPortfolios.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            )


            // Get one portfolio started.
            .addCase(getPortfolio.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Get one portfolio successful.
            .addCase(
                getPortfolio.fulfilled,
                (state, action) => {

                    state.loading = false;
                    state.portfolio = action.payload.data;
                    state.error = null;
                }
            )

            // Get one portfolio failed.
            .addCase(
                getPortfolio.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            )


            // Update portfolio started.
            .addCase(updatePortfolioItem.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Update portfolio successful.
            .addCase(
                updatePortfolioItem.fulfilled,
                (state, action) => {

                    state.loading = false;
                    state.portfolio = action.payload.data;

                    const updatedPortfolio =
                        action.payload.data;

                    const index = state.portfolios.findIndex(
                        (item) =>
                            item._id === updatedPortfolio._id
                    );

                    if (index !== -1) {
                        state.portfolios[index] =
                            updatedPortfolio;
                    }

                    state.error = null;
                }
            )

            // Update portfolio failed.
            .addCase(
                updatePortfolioItem.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            )


            // Delete portfolio started.
            .addCase(deletePortfolioItem.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            // Delete portfolio successful.
            .addCase(
                deletePortfolioItem.fulfilled,
                (state, action) => {

                    state.loading = false;

                    const deletedPortfolioId =
                        action.meta.arg;

                    state.portfolios =
                        state.portfolios.filter(
                            (item) =>
                                item._id !== deletedPortfolioId
                        );

                    if (
                        state.portfolio?._id ===
                        deletedPortfolioId
                    ) {
                        state.portfolio = null;
                    }

                    state.error = null;
                }
            )

            // Delete portfolio failed.
            .addCase(
                deletePortfolioItem.rejected,
                (state, action) => {

                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});


export const {
    clearPortfolio,
    clearPortfolios
} = portfolioSlice.actions;


export {
    createPortfolioItem,
    getPortfolios,
    getPortfolio,
    updatePortfolioItem,
    deletePortfolioItem
};


export default portfolioSlice.reducer;