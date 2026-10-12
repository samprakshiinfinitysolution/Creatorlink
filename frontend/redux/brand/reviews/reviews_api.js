import axiosInstance from "@/lib/axios";

// Brand fetches list of reviews submitted by them with optional pagination
const getBrandReviews = async (params = {}) => {
    const response = await axiosInstance.get(
        "/brand/reviews",
        { params }
    );
    return response.data;
};

// Brand submits a review for a completed workspace collaboration
const submitBrandReview = async (payload) => {
    const response = await axiosInstance.post(
        "/brand/reviews",
        payload
    );
    return response.data;
};

// Brand fetches review details for a specific workspace
const getBrandWorkspaceReview = async (workspaceId) => {
    const response = await axiosInstance.get(
        `/brand/reviews/workspace/${workspaceId}`
    );
    return response.data;
};

export {
    getBrandReviews,
    submitBrandReview,
    getBrandWorkspaceReview
};
