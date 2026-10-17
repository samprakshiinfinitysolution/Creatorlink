import axiosInstance from "@/lib/axios";


// Creates a new creator service.
const createService = async (serviceData) => {

    const response = await axiosInstance.post(
        "/creator/services",
        serviceData
    );

    return response.data;
};


// Gets creator services with optional filters and pagination.
const getCreatorServices = async (query = {}) => {

    const response = await axiosInstance.get(
        "/creator/services",
        {
            params: query
        }
    );

    return response.data;
};


// Gets one creator service by ID.
const getServiceById = async (serviceId) => {

    const response = await axiosInstance.get(
        `/creator/services/${serviceId}`
    );

    return response.data;
};


// Updates one creator service.
const updateService = async (
    serviceId,
    serviceData
) => {

    const response = await axiosInstance.patch(
        `/creator/services/${serviceId}`,
        serviceData
    );

    return response.data;
};


// Deletes one creator service.
const deleteService = async (serviceId) => {

    const response = await axiosInstance.delete(
        `/creator/services/${serviceId}`
    );

    return response.data;
};


export {
    createService,
    getCreatorServices,
    getServiceById,
    updateService,
    deleteService
};