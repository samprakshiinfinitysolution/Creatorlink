import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";

import {
    createPortfolioService,
    getMyPortfoliosService,
    getPortfolioByIdService,
    updatePortfolioService,
    deletePortfolioService
} from "./portfolio.service.js";


// Create portfolio work.
const createPortfolio = asyncHandler(async (req, res) => {

    const portfolio = await createPortfolioService(
        req.user.userId,
        req.body
    );


    return sendResponse(
        res,
        201,
        "Portfolio work created successfully",
        portfolio
    );
});


// Get creator's portfolio works.
const getMyPortfolios = asyncHandler(async (req, res) => {

    const portfolios = await getMyPortfoliosService(
        req.user.userId
    );


    return sendResponse(
        res,
        200,
        "Portfolio works fetched successfully",
        portfolios
    );
});


// Get one portfolio work.
const getPortfolioById = asyncHandler(async (req, res) => {

    const portfolio = await getPortfolioByIdService(
        req.user.userId,
        req.params.id
    );


    return sendResponse(
        res,
        200,
        "Portfolio work fetched successfully",
        portfolio
    );
});


// Update portfolio work.
const updatePortfolio = asyncHandler(async (req, res) => {

    const portfolio = await updatePortfolioService(
        req.user.userId,
        req.params.id,
        req.body
    );


    return sendResponse(
        res,
        200,
        "Portfolio work updated successfully",
        portfolio
    );
});


// Delete portfolio work.
const deletePortfolio = asyncHandler(async (req, res) => {

    await deletePortfolioService(
        req.user.userId,
        req.params.id
    );


    return sendResponse(
        res,
        200,
        "Portfolio work deleted successfully",
        null
    );
});


export {
    createPortfolio,
    getMyPortfolios,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio
};