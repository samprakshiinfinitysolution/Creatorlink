import { reEvaluateBrandTrialEligibilityService } from "../../subscriptions/trial.service.js";
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

    // Re-evaluate trial eligibility signals for Admin review (does not modify trial dates or quota)
    try {
        await reEvaluateBrandTrialEligibilityService(userId, profileData);
    } catch (err) {
        console.error("Trial eligibility check failed during brand profile creation:", err);
    }

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

    // Re-evaluate trial eligibility signals for Admin review (does not modify trial dates or quota)
    try {
        await reEvaluateBrandTrialEligibilityService(userId, profileData);
    } catch (err) {
        console.error("Trial eligibility check failed during brand profile update:", err);
    }

    return profile;
};


// Finalizes brand onboarding after strictly verifying required profile fields.
const completeOnboardingService = async (userId, data = {}) => {

    // 1. Fetch existing profile or create one if none exists yet
    let profile = await BrandProfile.findOne({
        user: userId
    });

    if (!profile) {
        profile = await BrandProfile.create({
            user: userId,
            companyName: data.companyName ? data.companyName.trim() : "",
            industry: data.industry ? data.industry.trim() : "",
            location: data.location ? data.location.trim() : "",
            description: data.description ? data.description.trim() : "",
            website: data.website ? data.website.trim() : "",
            logo: data.logo ? data.logo.trim() : "",
            socialLinks: data.socialLinks || {},
            contactInformation: data.contactInformation || {}
        });
    } else {
        // Update with any freshly provided fields from Step 1 & 2
        if (data.companyName !== undefined) profile.companyName = data.companyName.trim();
        if (data.industry !== undefined) profile.industry = data.industry.trim();
        if (data.location !== undefined) profile.location = data.location.trim();
        if (data.description !== undefined) profile.description = data.description.trim();
        if (data.website !== undefined) profile.website = data.website.trim();
        if (data.logo !== undefined) profile.logo = data.logo.trim();
        if (data.socialLinks !== undefined) profile.socialLinks = data.socialLinks;
        if (data.contactInformation !== undefined) profile.contactInformation = data.contactInformation;
    }

    // 2. Strict backend verification of required fields before granting onboarded status
    if (!profile.companyName || !profile.companyName.trim()) {
        throw createApiError(
            400,
            "Company name is required to complete brand onboarding."
        );
    }

    if (!profile.industry || !profile.industry.trim()) {
        throw createApiError(
            400,
            "Industry is required to complete brand onboarding."
        );
    }

    if (!profile.location || !profile.location.trim()) {
        throw createApiError(
            400,
            "Location is required to complete brand onboarding."
        );
    }

    // 3. Mark profile as onboarded
    profile.isOnboarded = true;
    await profile.save();

    // Re-evaluate trial eligibility signals for Admin review
    try {
        await reEvaluateBrandTrialEligibilityService(userId, {
            companyName: profile.companyName,
            website: profile.website,
            location: profile.location
        });
    } catch (err) {
        console.error("Trial eligibility check failed during onboarding completion:", err);
    }

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
