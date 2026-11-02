import axiosInstance from "@/lib/axios";

// Lists verification requests with filtering and pagination
export const getAdminVerifications = async (params = {}) => {
    const response = await axiosInstance.get("/admin/verifications", { params });
    return response.data;
};

// Gets verification request details by ID
export const getAdminVerificationById = async (id) => {
    const response = await axiosInstance.get(`/admin/verifications/${id}`);
    return response.data;
};

// Approves a verification request
export const approveVerification = async (id) => {
    const response = await axiosInstance.patch(`/admin/verifications/${id}/approve`);
    return response.data;
};

// Rejects a verification request with a reason
export const rejectVerification = async (id, rejectionReason) => {
    const response = await axiosInstance.patch(`/admin/verifications/${id}/reject`, {
        rejectionReason
    });
    return response.data;
};

