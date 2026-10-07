import axiosInstance from "@/lib/axios";


// Gets published discoverable campaigns for creators with optional query parameters.
const getDiscoverCampaigns = async (params = {}) => {

    const response = await axiosInstance.get(
        "/creator/campaigns",
        {
            params
        }
    );

    return response.data;
};


// Gets one published discoverable campaign by ID for creator view.
const getDiscoverCampaignById = async (campaignId) => {

    const response = await axiosInstance.get(
        `/creator/campaigns/${campaignId}`
    );

    return response.data;
};


// Gets campaigns applied to by the authenticated creator with optional query parameters.
const getAppliedCampaigns = async (params = {}) => {

    const response = await axiosInstance.get(
        "/creator/campaigns/applied",
        {
            params
        }
    );

    return response.data;
};


// Gets a single applied campaign detail by booking ID for creator view.
const getAppliedCampaignById = async (bookingId) => {

    const response = await axiosInstance.get(
        `/creator/campaigns/applied/${bookingId}`
    );

    return response.data;
};


// Submits a booking application for a campaign.
const applyToCampaign = async (bookingData) => {

    const response = await axiosInstance.post(
        "/creator/bookings",
        bookingData
    );

    return response.data;
};


// Cancels a pending booking application by booking ID.
const cancelBooking = async (bookingId) => {

    const response = await axiosInstance.patch(
        `/creator/bookings/${bookingId}/cancel`
    );

    return response.data;
};


export {
    getDiscoverCampaigns,
    getDiscoverCampaignById,
    getAppliedCampaigns,
    getAppliedCampaignById,
    applyToCampaign,
    cancelBooking
};
