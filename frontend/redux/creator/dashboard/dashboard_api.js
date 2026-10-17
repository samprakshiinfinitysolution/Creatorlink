import axiosInstance from "@/lib/axios";

// Fetches creator dashboard overview metrics, upcoming deadlines, recent collaborations, and reviews.
const getCreatorDashboardOverview = async (params = {}) => {
    const response = await axiosInstance.get(
        "/creator/dashboard",
        {
            params
        }
    );

    return response.data;
};

export {
    getCreatorDashboardOverview
};
