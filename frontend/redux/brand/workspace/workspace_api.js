import axiosInstance from "@/lib/axios";


// Gets brand workspaces with optional query parameters (page, limit, status).
const getBrandWorkspaces = async (params = {}) => {

    const response = await axiosInstance.get(
        "/brand/workspace",
        {
            params
        }
    );

    return response.data;
};


// Gets single brand workspace by ID.
const getBrandWorkspaceById = async (workspaceId) => {

    const response = await axiosInstance.get(
        `/brand/workspace/${workspaceId}`
    );

    return response.data;
};


// Reviews workspace submission (approve or request revision) by brand.
const reviewBrandWorkspace = async (workspaceId, reviewData) => {

    const response = await axiosInstance.post(
        `/brand/workspace/${workspaceId}/review`,
        reviewData
    );

    return response.data;
};


export {
    getBrandWorkspaces,
    getBrandWorkspaceById,
    reviewBrandWorkspace
};
