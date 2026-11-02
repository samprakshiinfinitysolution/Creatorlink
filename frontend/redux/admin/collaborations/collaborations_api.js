import axiosInstance from "@/lib/axios";

// Lists collaborations with filtering and pagination
export const getAdminCollaborations = async (params = {}) => {
    const response = await axiosInstance.get("/admin/collaborations", { params });
    return response.data;
};

// Gets collaboration platform-wide statistics
export const getAdminCollaborationsStats = async () => {
    const response = await axiosInstance.get("/admin/collaborations/stats");
    return response.data;
};

// Gets collaboration details and workspace dossier by ID
export const getAdminCollaborationById = async (id) => {
    const response = await axiosInstance.get(`/admin/collaborations/${id}`);
    return response.data;
};

// Administratively overrides collaboration status
export const overrideCollaborationStatus = async (id, status, reason = "") => {
    const response = await axiosInstance.patch(`/admin/collaborations/${id}/status`, {
        status,
        reason
    });
    return response.data;
};

// Administratively extends collaboration deadline
export const extendCollaborationDeadline = async (id, newDeadline, reason = "") => {
    const response = await axiosInstance.patch(`/admin/collaborations/${id}/extend-deadline`, {
        newDeadline,
        reason
    });
    return response.data;
};

