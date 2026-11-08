import { reEvaluateBrandTrialEligibilityService } from "../../subscriptions/trial.service.js";
import BrandProfile from "./profile.model.js";
import Auth from "../../auth/auth.model.js";
import createApiError from "../../../utils/ApiError.js";
import { getUserVerificationStatusService } from "../../admin/verification/verification.service.js";
import { emitVerificationEventToAdmins } from "../../../socket/socket.js";


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

    // Create the profile using Auth._id with isOnboarded: false
    const profile = await BrandProfile.create({
        user: userId,
        isOnboarded: false,
        ...profileData
    });

    // Re-evaluate trial eligibility signals for Admin review (does not modify trial dates or quota)
    try {
        await reEvaluateBrandTrialEligibilityService(userId, profileData);
    } catch (err) {
        console.error("Trial eligibility check failed during brand profile creation:", err);
    }

    const profileObj = profile.toObject ? profile.toObject() : profile;

    try {
        profileObj.verification = await getUserVerificationStatusService(userId);
    } catch (verifErr) {
        console.error("Failed to attach verification status to brand profile:", verifErr);
    }

    return profileObj;
};


// Get the brand profile of the authenticated user.
const getMyProfileService = async (userId) => {

    let profile = await BrandProfile.findOne({
        user: userId
    }).populate(
        "user",
        "name email role"
    );

    if (!profile) {
        // If an authenticated user with role "brand" requests their profile,
        // automatically ensure an initial BrandProfile document exists with isOnboarded: false
        const authUser = await Auth.findById(userId).select("name email role");
        if (authUser && authUser.role === "brand") {
            profile = await BrandProfile.create({
                user: userId,
                companyName: authUser.name || "",
                isOnboarded: false
            });
            await profile.populate(
                "user",
                "name email role"
            );
        } else {
            throw createApiError(
                404,
                "Brand profile not found"
            );
        }
    } else if (profile.isOnboarded === undefined || profile.isOnboarded === null) {
        // Self-heal: ensure isOnboarded: false is explicitly persisted in MongoDB if missing
        profile.isOnboarded = false;
        await profile.save();
    }

    const profileObj = profile.toObject ? profile.toObject() : profile;

    try {
        profileObj.verification = await getUserVerificationStatusService(userId);
    } catch (verifErr) {
        console.error("Failed to attach verification status to brand profile:", verifErr);
    }

    return profileObj;
};


// Update the brand profile of the authenticated user.
const updateProfileService = async (userId, profileData = {}) => {

    const updateOps = { ...profileData };

    // Prevent direct client modification of protected system fields
    delete updateOps.isOnboarded;
    delete updateOps.isVerifiedBusiness;
    delete updateOps.user;

    // Flatten socialLinks object to dot notation to preserve existing keys during partial updates
    if (
        updateOps.socialLinks &&
        typeof updateOps.socialLinks === "object" &&
        !Array.isArray(updateOps.socialLinks)
    ) {
        for (const [key, value] of Object.entries(updateOps.socialLinks)) {
            updateOps[`socialLinks.${key}`] = typeof value === "string" ? value.trim() : value;
        }
        delete updateOps.socialLinks;
    }

    // Flatten contactInformation object to dot notation to preserve existing keys during partial updates
    if (
        updateOps.contactInformation &&
        typeof updateOps.contactInformation === "object" &&
        !Array.isArray(updateOps.contactInformation)
    ) {
        for (const [key, value] of Object.entries(updateOps.contactInformation)) {
            updateOps[`contactInformation.${key}`] = typeof value === "string" ? value.trim() : value;
        }
        delete updateOps.contactInformation;
    }

    const profile = await BrandProfile.findOneAndUpdate(
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
            "Brand profile not found"
        );
    }

    if (profile.isOnboarded === undefined || profile.isOnboarded === null) {
        profile.isOnboarded = false;
        await profile.save();
    }

    // Re-evaluate trial eligibility signals for Admin review (does not modify trial dates or quota)
    try {
        await reEvaluateBrandTrialEligibilityService(userId, profileData);
    } catch (err) {
        console.error("Trial eligibility check failed during brand profile update:", err);
    }

    const profileObj = profile.toObject ? profile.toObject() : profile;

    try {
        profileObj.verification = await getUserVerificationStatusService(userId);
    } catch (verifErr) {
        console.error("Failed to attach verification status to brand profile:", verifErr);
    }

    // Emit live profile update to admins so open verification detail modals show fresh data
    try {
        emitVerificationEventToAdmins("verification:applicant_profile_updated", {
            userId: userId.toString(),
            role: "brand",
            profile: profileObj
        });
    } catch (socketErr) {
        console.error("Failed to emit brand profile update to admins:", socketErr);
    }

    return profileObj;
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
            contactInformation: data.contactInformation || {},
            isOnboarded: false
        });
    } else {
        // Update with any freshly provided fields from Step 1 & 2
        if (data.companyName !== undefined) profile.companyName = data.companyName.trim();
        if (data.industry !== undefined) profile.industry = data.industry.trim();
        if (data.location !== undefined) profile.location = data.location.trim();
        if (data.description !== undefined) profile.description = data.description.trim();
        if (data.website !== undefined) profile.website = data.website.trim();
        if (data.logo !== undefined) profile.logo = data.logo.trim();

        // Deep merge social links to preserve already saved platforms
        if (data.socialLinks && typeof data.socialLinks === "object") {
            const currentSocial = profile.socialLinks?.toObject
                ? profile.socialLinks.toObject()
                : (profile.socialLinks || {});
            profile.socialLinks = {
                ...currentSocial,
                ...data.socialLinks
            };
        }

        // Deep merge contact details to preserve existing contact fields
        if (data.contactInformation && typeof data.contactInformation === "object") {
            const currentContact = profile.contactInformation?.toObject
                ? profile.contactInformation.toObject()
                : (profile.contactInformation || {});
            profile.contactInformation = {
                ...currentContact,
                ...data.contactInformation
            };
        }
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

    // Step 2: Company Description / Bio
    if (!profile.description || !profile.description.trim()) {
        throw createApiError(
            400,
            "Company Description / Bio is required to complete brand onboarding."
        );
    }

    // Step 2: Social Media (at least one non-empty profile string among Instagram, LinkedIn, YouTube, Facebook, Twitter/X)
    const socialLinks = profile.socialLinks || {};
    const hasAtLeastOneSocial = [
        socialLinks.instagram,
        socialLinks.linkedin,
        socialLinks.youtube,
        socialLinks.facebook,
        socialLinks.twitter
    ].some((link) => typeof link === "string" && link.trim().length > 0);

    if (!hasAtLeastOneSocial) {
        throw createApiError(
            400,
            "Please add at least one social media channel to complete brand onboarding."
        );
    }

    // Step 2: Brand Collaboration Contact (Name, Email, Phone all required)
    const contactInfo = profile.contactInformation || {};
    if (!contactInfo.name || typeof contactInfo.name !== "string" || !contactInfo.name.trim()) {
        throw createApiError(
            400,
            "Contact Name is required to complete brand onboarding."
        );
    }

    if (!contactInfo.email || typeof contactInfo.email !== "string" || !contactInfo.email.trim()) {
        throw createApiError(
            400,
            "Contact Email is required to complete brand onboarding."
        );
    }

    if (!contactInfo.phone || typeof contactInfo.phone !== "string" || !contactInfo.phone.trim()) {
        throw createApiError(
            400,
            "Contact Phone Number is required to complete brand onboarding."
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
