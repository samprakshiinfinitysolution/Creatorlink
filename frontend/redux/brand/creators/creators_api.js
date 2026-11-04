import axiosInstance from "@/lib/axios";

// Gets discoverable creators with optional query parameters (filters, pagination, sorting).
const getBrandCreatorsApi = async (params = {}) => {
    const response = await axiosInstance.get(
        "/brand/creators",
        {
            params
        }
    );

    return response.data;
};

// Gets single creator public profile details by ID.
const getBrandCreatorByIdApi = async (id) => {
    const response = await axiosInstance.get(
        `/brand/creators/${id}`
    );

    return response.data;
};

// Gets full saved creators shortlist for the authenticated brand.
const getSavedCreatorsApi = async () => {
    const response = await axiosInstance.get(
        "/brand/creators/saved"
    );

    return response.data;
};

// Gets array of saved creator IDs for fast lookup.
const getSavedCreatorIdsApi = async () => {
    const response = await axiosInstance.get(
        "/brand/creators/saved/ids"
    );

    return response.data;
};

// Saves a creator to the brand's shortlist.
const saveCreatorApi = async (creatorId) => {
    const response = await axiosInstance.post(
        `/brand/creators/${creatorId}/save`
    );

    return response.data;
};

// Removes a creator from the brand's shortlist.
const unsaveCreatorApi = async (creatorId) => {
    const response = await axiosInstance.delete(
        `/brand/creators/${creatorId}/save`
    );

    return response.data;
};

export {
    getBrandCreatorsApi,
    getBrandCreatorByIdApi,
    getSavedCreatorsApi,
    getSavedCreatorIdsApi,
    saveCreatorApi,
    unsaveCreatorApi,
    getBrandCreatorsApi as getBrandCreators,
    getBrandCreatorByIdApi as getBrandCreatorById,
    getSavedCreatorsApi as getSavedCreators,
    getSavedCreatorIdsApi as getSavedCreatorIds,
    saveCreatorApi as saveCreator,
    unsaveCreatorApi as unsaveCreator
};
