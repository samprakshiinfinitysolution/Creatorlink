import axiosInstance from "@/lib/axios";

// Creator fetches received reviews list with optional pagination
const getCreatorReviews = async (params = {}) => {
    const response = await axiosInstance.get(
        "/creator/reviews",
        { params }
    );
    return response.data;
};

// Creator submits a review for brand on a completed workspace
const createCreatorReview = async (reviewData) => {
    const response = await axiosInstance.post(
        "/creator/reviews",
        reviewData
    );
    return response.data;
};

export {
    getCreatorReviews,
    createCreatorReview
};
