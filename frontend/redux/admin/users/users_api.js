import axiosInstance from "@/lib/axios";

// Fetches paginated platform users with filtering and search
const getAdminUsers = async (params = {}) => {
    const response = await axiosInstance.get("/admin/users", { params });
    return response.data;
};

// Fetches deep dossier for a single user by ID
const getAdminUserById = async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
};

export {
    getAdminUsers,
    getAdminUserById
};

