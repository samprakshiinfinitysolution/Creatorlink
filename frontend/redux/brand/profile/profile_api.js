import axiosInstance from "@/lib/axios";


// Creates a new brand profile.
const createProfile = async (profileData) => {

    const response = await axiosInstance.post(
        "/brand/profile",
        profileData
    );

    return response.data;
};


// Gets the currently logged-in brand profile.
const getMyProfile = async () => {

    const response = await axiosInstance.get(
        "/brand/profile/me"
    );

    return response.data;
};


// Updates the currently logged-in brand profile.
const updateMyProfile = async (profileData) => {

    const response = await axiosInstance.patch(
        "/brand/profile/me",
        profileData
    );

    return response.data;
};


// Completes brand onboarding with backend verification of required fields.
const completeOnboardingApi = async (profileData) => {

    const response = await axiosInstance.post(
        "/brand/profile/complete-onboarding",
        profileData
    );

    return response.data;
};


// Gets brand's verification status and history.
const getVerificationStatusApi = async () => {
    const response = await axiosInstance.get(
        "/brand/profile/verification"
    );
    return response.data;
};

// Submits or re-submits brand verification request.
const submitVerificationApi = async (data = {}) => {
    const response = await axiosInstance.post(
        "/brand/profile/verification",
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
