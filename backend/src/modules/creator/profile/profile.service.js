import CreatorProfile from "./profile.model.js";
import createApiError from "../../../utils/ApiError.js";


// Create a creator profile for the authenticated user.
const createProfileService = async (userId, profileData) => {

    // Check whether this Auth user already has a creator profile.
    const existingProfile = await CreatorProfile.findOne({
        user: userId
    });

    if (existingProfile) {
        throw createApiError(
            409,
            "Creator profile already exists"
        );
    }

    // Create the profile using Auth._id.
    const profile = await CreatorProfile.create({
        user: userId,
        ...profileData
    });

    return profile;
};


// Get the creator profile of the authenticated user.
const getMyProfileService = async (userId) => {

    const profile = await CreatorProfile.findOne({
        user: userId
    }).populate(
        "user",
        "name email role"
    );

    if (!profile) {
        throw createApiError(
            404,
            "Creator profile not found"
        );
    }

    return profile;
};


// Update the creator profile of the authenticated user.
const updateProfileService = async (userId, profileData) => {

    const profile = await CreatorProfile.findOneAndUpdate(
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
            "Creator profile not found"
        );
    }

    return profile;
};


export {
    createProfileService,
    getMyProfileService,
    updateProfileService
};