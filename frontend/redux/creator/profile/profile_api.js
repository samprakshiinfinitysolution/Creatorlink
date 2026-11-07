import axiosInstance from "@/lib/axios";

// Creates a new creator profile.
const createProfile = async (profileData) => {
    const response = await axiosInstance.post(
        "/creator/profile",
        profileData
    );
    return response.data;
};

// Gets the currently logged-in creator's profile.
const getMyProfile = async () => {
    const response = await axiosInstance.get(
        "/creator/profile/me"
    );
    return response.data;
};

// Updates the currently logged-in creator's profile.
const updateMyProfile = async (profileData) => {
    const response = await axiosInstance.patch(
        "/creator/profile/me",
        profileData
    );
    return response.data;
};

// Completes creator onboarding with backend verification.
const completeOnboardingApi = async (profileData) => {
    const response = await axiosInstance.post(
        "/creator/profile/complete-onboarding",
        profileData
    );
    return response.data;
};

// Gets creator's verification status and history.
const getVerificationStatusApi = async () => {
    const response = await axiosInstance.get(
        "/creator/profile/verification"
    );
    return response.data;
};

// Submits or re-submits creator verification request.
const submitVerificationApi = async (data = {}) => {
    const response = await axiosInstance.post(
        "/creator/profile/verification",
        data
    );
    return response.data;
};

export {
    createProfile,
    getMyProfile,
    updateMyProfile,
    completeOnboardingApi,
    getVerificationStatusApi,
    submitVerificationApi
};
