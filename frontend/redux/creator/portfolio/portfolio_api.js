import axiosInstance from "@/lib/axios";


// Creates a new portfolio work.
const createPortfolio = async (portfolioData) => {

    const response = await axiosInstance.post(
        "/creator/portfolio",
        portfolioData
    );

    return response.data;
};


// Gets all portfolio works of the logged-in creator.
const getMyPortfolios = async () => {

    const response = await axiosInstance.get(
        "/creator/portfolio"
    );

    return response.data;
};


// Gets one portfolio work by ID.
const getPortfolioById = async (portfolioId) => {

    const response = await axiosInstance.get(
        `/creator/portfolio/${portfolioId}`
    );

    return response.data;
};


// Updates one portfolio work.
const updatePortfolio = async (
    portfolioId,
    portfolioData
) => {

    const response = await axiosInstance.patch(
        `/creator/portfolio/${portfolioId}`,
        portfolioData
    );

    return response.data;
};


// Deletes one portfolio work.
const deletePortfolio = async (portfolioId) => {

    const response = await axiosInstance.delete(
        `/creator/portfolio/${portfolioId}`
    );

    return response.data;
};


export {
    createPortfolio,
    getMyPortfolios,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio
};