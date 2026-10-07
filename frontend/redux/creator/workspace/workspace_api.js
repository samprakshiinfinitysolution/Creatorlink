import axiosInstance from "@/lib/axios";


// Gets creator workspaces with optional query parameters (page, limit, status).
const getCreatorWorkspaces = async (params = {}) => {

    const response = await axiosInstance.get(
        "/creator/workspace",
        {
            params
        }
    );

    return response.data;
};


// Gets single creator workspace by ID.
const getCreatorWorkspaceById = async (workspaceId) => {

    const response = await axiosInstance.get(
        `/creator/workspace/${workspaceId}`
    );

    return response.data;
};


// Submits work / deliverables for a creator workspace.
const submitCreatorWorkspaceWork = async (workspaceId, submissionData) => {

    const response = await axiosInstance.post(
        `/creator/workspace/${workspaceId}/submit`,
        submissionData
    );

    return response.data;
};


export {
    getCreatorWorkspaces,
    getCreatorWorkspaceById,
    submitCreatorWorkspaceWork
};
