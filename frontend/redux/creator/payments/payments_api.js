import axiosInstance from "@/lib/axios";

// Creator fetches received payments list with optional pagination and status filter
const getCreatorPayments = async (params = {}) => {
    const response = await axiosInstance.get(
        "/creator/payments",
        { params }
    );
    return response.data;
};

// Creator fetches single received payment details by ID
const getCreatorPaymentById = async (paymentId) => {
    const response = await axiosInstance.get(
        `/creator/payments/${paymentId}`
    );
    return response.data;
};

export {
    getCreatorPayments,
    getCreatorPaymentById
};
