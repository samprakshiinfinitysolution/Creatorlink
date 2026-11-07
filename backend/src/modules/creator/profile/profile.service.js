import CreatorProfile from "./profile.model.js";
import Auth from "../../auth/auth.model.js";
import createApiError from "../../../utils/ApiError.js";
import Portfolio from "../portfolio/portfolio.model.js";
import CreatorService from "../services/services.model.js";
import { getUserVerificationStatusService } from "../../admin/verification/verification.service.js";


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
    delete sanitizedData.isOnboarded;

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

    const profileObj = profile.toObject();

    try {
        profileObj.verification = await getUserVerificationStatusService(userId);
    } catch (verifErr) {
        console.error("Failed to attach verification status to creator profile:", verifErr);
    }

    return profileObj;
};


// Update the creator profile of the authenticated user.
// Update the creator profile of the authenticated user.
const updateProfileService = async (userId, profileData) => {

    const updateOps = { ...profileData };

    // Protected fields cannot be overridden by client
    delete updateOps.user;
    delete updateOps.isDemo;
    delete updateOps.isVerifiedBadge;
    delete updateOps.isOnboarded;

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

    const profileObj = profile.toObject();

    try {
        profileObj.verification = await getUserVerificationStatusService(userId);
    } catch (verifErr) {
        console.error("Failed to attach verification status to creator profile:", verifErr);
    }

    return profileObj;
};


// Finalizes creator onboarding after strictly verifying required profile details, at least one portfolio item, and at least one active service.
const completeOnboardingService = async (userId, data = {}) => {

    // 1. Fetch existing profile or create one if none exists yet
    let profile = await CreatorProfile.findOne({
        user: userId
    });

    // Synchronize Auth user full name if provided
    if (data.name !== undefined) {
        const trimmedName = typeof data.name === "string" ? data.name.trim() : "";
        if (trimmedName.length >= 2 && trimmedName.length <= 70) {
            await Auth.findByIdAndUpdate(userId, { name: trimmedName });
        }
    }

    if (!profile) {
        const sanitizedData = { ...data };
        delete sanitizedData.user;
        delete sanitizedData.isDemo;
        delete sanitizedData.isVerifiedBadge;
        delete sanitizedData.isOnboarded;
        delete sanitizedData.name;

        profile = await CreatorProfile.create({
            ...sanitizedData,
            user: userId
        });
    } else {
        // Apply any freshly provided fields
        if (data.title !== undefined) profile.title = typeof data.title === "string" ? data.title.trim() : "";
        if (data.bio !== undefined) profile.bio = typeof data.bio === "string" ? data.bio.trim() : "";
        if (data.category !== undefined) profile.category = typeof data.category === "string" ? data.category.trim() : "";
        if (Array.isArray(data.keywords)) profile.keywords = data.keywords;
        if (data.location !== undefined) profile.location = typeof data.location === "string" ? data.location.trim() : "";
        if (data.profileImage !== undefined) profile.profileImage = data.profileImage;
        if (data.dob !== undefined) profile.dob = data.dob ? new Date(data.dob) : null;
        if (data.gender !== undefined) profile.gender = data.gender;
        if (Array.isArray(data.languages)) profile.languages = data.languages;
        if (data.ethnicity !== undefined) profile.ethnicity = data.ethnicity;
        if (data.socialLinks && typeof data.socialLinks === "object") {
            const existingSocial = profile.socialLinks?.toObject ? profile.socialLinks.toObject() : profile.socialLinks || {};
            profile.socialLinks = {
                ...existingSocial,
                ...data.socialLinks
            };
        }
    }

    // 2. Strict backend verification of required profile fields
    const resolvedTitle = profile.title && profile.title.trim();
    const resolvedBio = profile.bio && profile.bio.trim();
    const resolvedCategory = profile.category && profile.category.trim();
    const resolvedKeywords = Array.isArray(profile.keywords) && profile.keywords.length > 0;
    const resolvedLocation = profile.location && profile.location.trim();
    const resolvedDob = profile.dob && !Number.isNaN(new Date(profile.dob).getTime());
    const resolvedGender = profile.gender && profile.gender.trim();
    const resolvedLanguages = Array.isArray(profile.languages) && profile.languages.length > 0;

    const socialObj = profile.socialLinks?.toObject ? profile.socialLinks.toObject() : profile.socialLinks || {};
    const hasValidSocial = Boolean(
        socialObj &&
        Object.values(socialObj).some(
            (link) => typeof link === "string" && link.trim().length > 0
        )
    );

    if (
        !resolvedTitle ||
        !resolvedBio ||
        !resolvedCategory ||
        !resolvedKeywords ||
        !resolvedLocation ||
        !resolvedDob ||
        !resolvedGender ||
        !resolvedLanguages ||
        !hasValidSocial
    ) {
        throw createApiError(
            400,
            "Required profile details (headline, bio, category, keywords, location, date of birth, gender, languages, social links) must be completed before finishing onboarding."
        );
    }

    // 3. Verify at least one portfolio item exists
    const hasPortfolio = await Portfolio.exists({
        creator: userId
    });
    if (!hasPortfolio) {
        throw createApiError(
            400,
            "At least one portfolio project is required before completing onboarding."
        );
    }

    // 4. Verify at least one active service exists
    const hasActiveService = await CreatorService.exists({
        creator: userId,
        isActive: { $ne: false }
    });
    if (!hasActiveService) {
        throw createApiError(
            400,
            "At least one active service offering is required before completing onboarding."
        );
    }

    // 5. Mark as onboarded and persist
    profile.isOnboarded = true;
    await profile.save();

    return await profile.populate(
        "user",
        "name email role"
    );
};

export {
    createProfileService,
    getMyProfileService,
    updateProfileService,
    completeOnboardingService
};
