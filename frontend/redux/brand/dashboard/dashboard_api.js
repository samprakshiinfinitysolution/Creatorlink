import axiosInstance from "@/lib/axios";

// Fetches brand dashboard overview metrics, upcoming deadlines, recent campaigns, and collaborations.
const getBrandDashboardOverview = async (params = {}) => {
    const response = await axiosInstance.get(
        "/brand/dashboard",
        {
            params
        }
    );

    return response.data;
};

export {
    getBrandDashboardOverview
};
