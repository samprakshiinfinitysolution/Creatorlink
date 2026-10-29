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


// Changes the password for the currently authenticated user.
const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {

    const response = await axiosInstance.patch(
        "/auth/change-password",
        {
            currentPassword,
            newPassword,
            confirmPassword
        }
    );

    return response.data;
};


// Requests a password reset link for the given email.
const forgotPassword = async (email) => {

    const response = await axiosInstance.post(
        "/auth/forgot-password",
        { email }
    );

    return response.data;
};


// Resets user password using a valid reset token.
const resetPassword = async ({ token, newPassword, confirmPassword }) => {

    const response = await axiosInstance.post(
        "/auth/reset-password",
        {
            token,
            newPassword,
            confirmPassword
        }
    );

    return response.data;
};


// Authenticates user with verified Google credentials or authorization code.
const googleAuth = async ({ idToken, credential, code, role }) => {

    const response = await axiosInstance.post(
        "/auth/google",
        {
            idToken,
            credential,
            code,
            role
        }
    );

    return response.data;
};


// Fetches the public Google Client ID configuration from the server.
const getGoogleClientId = async () => {

    const response = await axiosInstance.get(
        "/auth/google/client-id"
    );

    return response.data;
};


// Verifies email OTP and activates user account.
const verifyEmailOtp = async ({ email, otp }) => {

    const response = await axiosInstance.post(
        "/auth/verify-email-otp",
        { email, otp }
    );

    return response.data;
};


// Resends a fresh email verification OTP.
const resendVerificationOtp = async (email) => {

    const response = await axiosInstance.post(
        "/auth/resend-email-otp",
        { email }
    );

    return response.data;
};


export {
    loginUser,
    registerUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    changePassword,
    forgotPassword,
    resetPassword,
    googleAuth,
    getGoogleClientId,
    verifyEmailOtp,
    resendVerificationOtp
};