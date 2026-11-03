import CreatorProfile from "./profile.model.js";
import Auth from "../../auth/auth.model.js";
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

    // Defense-in-depth: strip protected/system fields and ensure authenticated userId cannot be overridden
    const sanitizedData = { ...profileData };
    delete sanitizedData.user;
    delete sanitizedData.isDemo;
    delete sanitizedData.isVerifiedBadge;

    if (sanitizedData.followerCount !== undefined && sanitizedData.followerCount !== null && sanitizedData.followerCount !== "") {
        sanitizedData.followerCount = Math.round(Number(sanitizedData.followerCount));
    } else if (sanitizedData.followerCount === "") {
        sanitizedData.followerCount = null;
    }

    if (sanitizedData.engagementRate !== undefined && sanitizedData.engagementRate !== null && sanitizedData.engagementRate !== "") {
        sanitizedData.engagementRate = Number(parseFloat(sanitizedData.engagementRate).toFixed(2));
    } else if (sanitizedData.engagementRate === "") {
        sanitizedData.engagementRate = null;
    }


    // Synchronize Auth user full name if provided
    if (sanitizedData.name !== undefined) {
        const trimmedName = typeof sanitizedData.name === "string" ? sanitizedData.name.trim() : "";
        if (trimmedName.length >= 2 && trimmedName.length <= 70) {
            await Auth.findByIdAndUpdate(userId, { name: trimmedName });
        }
        delete sanitizedData.name;
    }

    // Create the profile using Auth._id.
    const profile = await CreatorProfile.create({
        ...sanitizedData,
        user: userId
    });

    await profile.populate(
        "user",
        "name email role"
    );

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
// Update the creator profile of the authenticated user.
const updateProfileService = async (userId, profileData) => {

    const updateOps = { ...profileData };

    // Protected fields cannot be overridden by client
    delete updateOps.user;
    delete updateOps.isDemo;
    delete updateOps.isVerifiedBadge;

    // Update follower count
    if (updateOps.followerCount !== undefined) {
        if (updateOps.followerCount === null || updateOps.followerCount === "") {
            updateOps.followerCount = null;
        } else {
            updateOps.followerCount = Math.round(Number(updateOps.followerCount));
        }
    }

    // Update engagement rate
    if (updateOps.engagementRate !== undefined) {
        if (updateOps.engagementRate === null || updateOps.engagementRate === "") {
            updateOps.engagementRate = null;
        } else {
            updateOps.engagementRate = Number(parseFloat(updateOps.engagementRate).toFixed(2));
        }
    }

    // Synchronize Auth user full name if provided
    if (updateOps.name !== undefined) {
        const trimmedName = typeof updateOps.name === "string" ? updateOps.name.trim() : "";
        if (trimmedName.length >= 2 && trimmedName.length <= 70) {
            await Auth.findByIdAndUpdate(userId, { name: trimmedName });
        }
        delete updateOps.name;
    }
    // Convert empty string dob or gender to null so Mongoose clears them without schema enum errors
    if (updateOps.dob === "") {
        updateOps.dob = null;
    }
    if (updateOps.gender === "") {
        updateOps.gender = null;
    }

    // Flatten socialLinks object to dot notation to preserve existing keys during partial updates
    if (
        updateOps.socialLinks &&
        typeof updateOps.socialLinks === "object" &&
        !Array.isArray(updateOps.socialLinks)
    ) {
        for (const [key, value] of Object.entries(updateOps.socialLinks)) {
            updateOps[`socialLinks.${key}`] = value;
        }
        delete updateOps.socialLinks;
    }

    const profile = await CreatorProfile.findOneAndUpdate(
        {
            user: userId
        },
        {
            $set: updateOps
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
