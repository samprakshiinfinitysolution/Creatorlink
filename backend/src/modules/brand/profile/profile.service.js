import BrandProfile from "./profile.model.js";
import createApiError from "../../../utils/ApiError.js";


// Create a brand profile for the authenticated user.
const createProfileService = async (userId, profileData) => {

    // Check whether this Auth user already has a brand profile.
    const existingProfile = await BrandProfile.findOne({
        user: userId
    });

    if (existingProfile) {
        throw createApiError(
            409,
            "Brand profile already exists"
        );
    }

    // Create the profile using Auth._id.
    const profile = await BrandProfile.create({
        user: userId,
        ...profileData
    });

    return profile;
};


// Get the brand profile of the authenticated user.
const getMyProfileService = async (userId) => {

    const profile = await BrandProfile.findOne({
        user: userId
    }).populate(
        "user",
        "name email role"
    );

    if (!profile) {
        throw createApiError(
            404,
            "Brand profile not found"
        );
    }

    return profile;
};


// Update the brand profile of the authenticated user.
const updateProfileService = async (userId, profileData) => {

    const profile = await BrandProfile.findOneAndUpdate(
        {
            user: userId
        },
        {
            $set: profileData
        },
        {
            new: true,
            runValidators: true
        }
    ).populate(
        "user",
        "name email role"
    );

    if (!profile) {
        throw createApiError(
            404,
            "Brand profile not found"
        );
    }

    return profile;
};


export {
    createProfileService,
    getMyProfileService,
    updateProfileService
};