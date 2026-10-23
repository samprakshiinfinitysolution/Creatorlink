import axiosInstance from "@/lib/axios";


// Sends login credentials to the backend.
const loginUser = async (credentials) => {

    const response = await axiosInstance.post(
        "/auth/login",
        credentials
    );

    return response.data;
};

// Get currently logged in user's details.
const getCurrentUser = async () => {

    const response = await axiosInstance.get(
        "/auth/me"
    );

    return response.data;
};


// Registers a new user.
const registerUser = async (userData) => {

    const response = await axiosInstance.post(
        "/auth/register",
        userData
    );

    return response.data;
};


// Refreshes the access token using the refresh-token cookie.
const refreshAccessToken = async () => {

    const response = await axiosInstance.post(
        "/auth/refresh"
    );

    return response.data;
};


// Logs out the current user.
const logoutUser = async () => {

    const response = await axiosInstance.post(
        "/auth/logout"
    );

    return response.data;
};


export {
    loginUser,
    registerUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser
};