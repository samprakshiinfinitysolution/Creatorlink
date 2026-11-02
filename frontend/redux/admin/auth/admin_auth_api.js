import axiosInstance from "@/lib/axios";

// Calls dedicated Admin Login endpoint
export const adminLoginApi = async (credentials) => {
    const response = await axiosInstance.post("/admin/auth/login", credentials);
    return response.data;
};

// Restores active Admin session via dedicated Admin /me endpoint
export const getAdminMeApi = async () => {
    const response = await axiosInstance.get("/admin/auth/me");
    return response.data;
};

// Logs out Admin and clears dedicated admin cookies
export const adminLogoutApi = async () => {
    const response = await axiosInstance.post("/admin/auth/logout");
    return response.data;
};

