import Portfolio from "./portfolio.model.js";
import createApiError from "../../../utils/ApiError.js";


// Create a portfolio work for the authenticated creator.
const createPortfolioService = async (
    creatorId,
    portfolioData
) => {

    const portfolio = await Portfolio.create({
        creator: creatorId,
        ...portfolioData
    });


    return portfolio;
};


// Get all portfolio works of the authenticated creator.
const getMyPortfoliosService = async (creatorId) => {

    const portfolios = await Portfolio.find({
        creator: creatorId
    })
        .populate(
            "brand",
            "name email role"
        )
        .sort({
            createdAt: -1
        });


    return portfolios;
};


// Get one portfolio work owned by the creator.
const getPortfolioByIdService = async (
    creatorId,
    portfolioId
) => {

    const portfolio = await Portfolio.findOne({
        _id: portfolioId,
        creator: creatorId
    })
        .populate(
            "brand",
            "name email role"
        );


    if (!portfolio) {
        throw createApiError(
            404,
            "Portfolio item not found"
        );
    }


    return portfolio;
};


// Update portfolio work.
const updatePortfolioService = async (
    creatorId,
    portfolioId,
    portfolioData
) => {

    const portfolio = await Portfolio.findOneAndUpdate(
        {
            _id: portfolioId,
            creator: creatorId
        },
        {
            $set: portfolioData
        },
        {
            new: true,
            runValidators: true
        }
    )
        .populate(
            "brand",
            "name email role"
        );


    if (!portfolio) {
        throw createApiError(
            404,
            "Portfolio item not found"
        );
    }


    return portfolio;
};


// Delete portfolio work.
const deletePortfolioService = async (
    creatorId,
    portfolioId
) => {

    const portfolio = await Portfolio.findOneAndDelete({
        _id: portfolioId,
        creator: creatorId
    });


    if (!portfolio) {
        throw createApiError(
            404,
            "Portfolio item not found"
        );
    }


    return portfolio;
};


export {
    createPortfolioService,
    getMyPortfoliosService,
    getPortfolioByIdService,
    updatePortfolioService,
    deletePortfolioService
};