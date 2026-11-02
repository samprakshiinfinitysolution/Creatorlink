import axios from "axios";


const getBaseURL = () => {
    if (typeof window !== "undefined" && window.location.hostname) {
        const host = window.location.hostname;
        if (
            host === "localhost" ||
            host === "127.0.0.1" ||
            host.startsWith("192.168.") ||
            host.startsWith("10.") ||
            host.startsWith("172.")
        ) {
            return `${window.location.protocol}//${host}:5005/api`;
        }
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.21:5005/api";
};

const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    }
});

axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== "undefined" && window.location.hostname) {
        const host = window.location.hostname;
        if (
            host === "localhost" ||
            host === "127.0.0.1" ||
            host.startsWith("192.168.") ||
            host.startsWith("10.") ||
            host.startsWith("172.")
        ) {
            if (config.baseURL && (config.baseURL.includes(":5005") || config.baseURL.includes("localhost"))) {
                config.baseURL = `${window.location.protocol}//${host}:5005/api`;
            }
        }
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        if (config.headers?.delete) {
            config.headers.delete("Content-Type");
        } else if (config.headers) {
            delete config.headers["Content-Type"];
        }
    }
    return config;
});


let isRefreshing = false;
let pendingRequests = [];

const processPendingRequests = (error = null) => {
    pendingRequests.forEach((request) => {
        if (error) {
            request.reject(error);
        } else {
            request.resolve();
        }
    });
    pendingRequests = [];
};


axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            originalRequest?._retry
        ) {
            return Promise.reject(error);
        }

        // Do not try to refresh on auth login/register or refresh endpoints
        if (
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh") ||
            originalRequest?.url?.includes("/admin/auth/login") ||
            originalRequest?.url?.includes("/admin/auth/refresh")
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingRequests.push({
                    resolve,
                    reject
                });
            }).then(() => {
                return axiosInstance(originalRequest);
            });
        }

        isRefreshing = true;

        // Choose the appropriate refresh endpoint based on the requested route scope
        const isAdminRequest =
            originalRequest?.url?.includes("/admin/") ||
            (typeof window !== "undefined" && window.location.pathname?.startsWith("/admin"));

        const refreshEndpoint = isAdminRequest ? "/admin/auth/refresh" : "/auth/refresh";

        try {
            await axiosInstance.post(refreshEndpoint);
            processPendingRequests();
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            processPendingRequests(refreshError);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);


export default axiosInstance;
