import axiosInstance from "@/lib/axios";

// Brand initiates Razorpay order creation for a completed workspace
const createBrandPaymentOrder = async (workspaceId) => {
    const response = await axiosInstance.post(
        "/brand/payments/create-order",
        { workspaceId }
    );
    return response.data;
};

// Brand verifies Razorpay payment signature & payment status after Checkout
const verifyBrandPayment = async (paymentData) => {
    const response = await axiosInstance.post(
        "/brand/payments/verify",
        paymentData
    );
    return response.data;
};

// Brand reports a failed payment attempt verified server-side with gateway
const reportBrandPaymentFailure = async (paymentData) => {
    const response = await axiosInstance.post(
        "/brand/payments/report-failed",
        paymentData
    );
    return response.data;
};

// Brand fetches their payments history list with optional pagination and status filter
const getBrandPayments = async (params = {}) => {
    const response = await axiosInstance.get(
        "/brand/payments",
        { params }
    );
    return response.data;
};

// Brand fetches single payment by ID
const getBrandPaymentById = async (paymentId) => {
    const response = await axiosInstance.get(
        `/brand/payments/${paymentId}`
    );
    return response.data;
};

export {
    createBrandPaymentOrder,
    verifyBrandPayment,
    reportBrandPaymentFailure,
    getBrandPayments,
    getBrandPaymentById
};
