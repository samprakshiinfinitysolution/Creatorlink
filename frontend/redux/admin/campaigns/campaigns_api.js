import axiosInstance from "@/lib/axios";

// Lists campaigns with filtering, search, and moderation state
export const getAdminCampaigns = async (params = {}) => {
    const response = await axiosInstance.get("/admin/campaigns", { params });
    return response.data;
};

// Gets campaign moderation statistics
export const getAdminCampaignStats = async () => {
    const response = await axiosInstance.get("/admin/campaigns/stats");
    return response.data;
};

// Gets campaign details and dossier by ID including audit history
export const getAdminCampaignById = async (id) => {
    const response = await axiosInstance.get(`/admin/campaigns/${id}`);
    return response.data;
};

// Admin pauses campaign for moderation and places restriction
export const moderatePauseCampaign = async (id, reason) => {
    const response = await axiosInstance.post(`/admin/campaigns/${id}/pause`, { reason });
    return response.data;
};

// Admin resumes campaign after moderation restrictions are resolved
export const moderateResumeCampaign = async (id, reason = "") => {
    const response = await axiosInstance.post(`/admin/campaigns/${id}/resume`, { reason });
    return response.data;
};

// Admin closes campaign when justified
export const moderateCloseCampaign = async (id, reason = "") => {
    const response = await axiosInstance.post(`/admin/campaigns/${id}/close`, { reason });
    return response.data;
};

// Backward-compatibility status update mapping
export const updateAdminCampaignStatus = async (id, status, moderationReason = "") => {
    const response = await axiosInstance.patch(`/admin/campaigns/${id}/status`, {
        status,
        reason: moderationReason
    });
    return response.data;
};

// Safe deletion of a campaign (ensuring no active/accepted bookings exist)
export const deleteAdminCampaign = async (id, reason = "") => {
    const response = await axiosInstance.delete(`/admin/campaigns/${id}`, {
        data: { reason }
    });
    return response.data;
};
