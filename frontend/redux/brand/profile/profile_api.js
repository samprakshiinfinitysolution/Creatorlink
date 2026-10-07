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


export {
    createProfile,
    getMyProfile,
    updateMyProfile
};
