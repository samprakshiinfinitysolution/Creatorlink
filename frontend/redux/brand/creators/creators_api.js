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

export {
    getBrandCreatorsApi,
    getBrandCreatorByIdApi,
    getBrandCreatorsApi as getBrandCreators,
    getBrandCreatorByIdApi as getBrandCreatorById
};
