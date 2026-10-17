import axiosInstance from "@/lib/axios";

// Creator fetches received reviews list with optional pagination
const getCreatorReviews = async (params = {}) => {
    const response = await axiosInstance.get(
        "/creator/reviews",
        { params }
    );
    return response.data;
};

export {
    getCreatorReviews
};
