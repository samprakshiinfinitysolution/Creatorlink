import axiosInstance from "@/lib/axios";


// Creates a new brand campaign.
const createCampaign = async (campaignData) => {

    const response = await axiosInstance.post(
        "/brand/campaigns",
        campaignData
    );

    return response.data;
};


// Gets brand campaigns with optional query parameters (page, limit, search, category, platform, status, sortBy, sortOrder).
const getBrandCampaigns = async (params = {}) => {

    const response = await axiosInstance.get(
        "/brand/campaigns",
        {
            params
        }
    );

    return response.data;
};


// Gets one campaign by ID.
const getCampaignById = async (campaignId) => {

    const response = await axiosInstance.get(
        `/brand/campaigns/${campaignId}`
    );

    return response.data;
};


// Updates one campaign by ID.
const updateCampaign = async (campaignId, campaignData) => {

    const response = await axiosInstance.patch(
        `/brand/campaigns/${campaignId}`,
        campaignData
    );

    return response.data;
};


export {
    createCampaign,
    getBrandCampaigns,
    getCampaignById,
    updateCampaign
};
