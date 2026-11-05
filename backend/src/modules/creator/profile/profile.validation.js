import createApiError from "../../../utils/ApiError.js";


// Supported profile fields for creation and updates.
const ALLOWED_PROFILE_FIELDS = [
    "name",
    "bio",
    "category",
    "location",
    "profileImage",
    "isPublic",
    "socialLinks",
    "title",
    "keywords",
    "niches",
    "dob",
    "gender",
    "languages",
    "ethnicity",
    "followerCount",
    "engagementRate"
];


// Validate data while creating a creator profile.
const createProfileValidation = (req, res, next) => {

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        throw createApiError(
            400,
            "Request body must be an object"
        );
    }

    // Prevent protected/system or unsupported fields from being submitted.
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter(
        (field) => !ALLOWED_PROFILE_FIELDS.includes(field)
    );

    if (invalidFields.length > 0) {
        throw createApiError(
            400,
            `These fields are not allowed: ${invalidFields.join(", ")}`
        );
    }

    const {
        name,
        bio,
        category,
        location,
        profileImage,
        isPublic,
        socialLinks,
        title,
        keywords,
        niches,
        dob,
        gender,
        languages,
        ethnicity,
        followerCount,
        engagementRate
    } = req.body;


    // Validate name.
    if (name !== undefined) {

        if (typeof name !== "string") {
            throw createApiError(
                400,
                "Name must be a string"
            );
        }

        const trimmedName = name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 70) {
            throw createApiError(
                400,
                "Full Name must be between 2 and 70 characters"
            );
        }
    }


    // Validate bio.
    if (bio !== undefined) {

        if (typeof bio !== "string") {
            throw createApiError(
                400,
                "Bio must be a string"
            );
        }

        if (bio.length > 1000) {
            throw createApiError(
                400,
                "Bio must not exceed 1000 characters"
            );
        }
    }


    // Validate category.
    if (category !== undefined) {

        if (typeof category !== "string") {
            throw createApiError(
                400,
                "Category must be a string"
            );
        }

        if (category.length > 100) {
            throw createApiError(
                400,
                "Category must not exceed 100 characters"
            );
        }
    }


    // Validate location.
    if (location !== undefined) {

        if (typeof location !== "string") {
            throw createApiError(
                400,
                "Location must be a string"
            );
        }

        if (location.length > 100) {
            throw createApiError(
                400,
                "Location must not exceed 100 characters"
            );
        }
    }


    // Validate profile image URL/value.
    if (profileImage !== undefined) {

        if (typeof profileImage !== "string") {
            throw createApiError(
                400,
                "Profile image must be a string"
            );
        }
    }


    // Validate isPublic visibility flag.
    if (isPublic !== undefined) {

        if (typeof isPublic !== "boolean") {
            throw createApiError(
                400,
                "isPublic must be a boolean"
            );
        }
    }


    // socialLinks must be an object.
    if (socialLinks !== undefined) {

        if (
            typeof socialLinks !== "object" ||
            socialLinks === null ||
            Array.isArray(socialLinks)
        ) {
            throw createApiError(
                400,
                "socialLinks must be an object"
            );
        }


        // Reject unknown social link platforms.
        const allowedSocialKeys = [
            "instagram",
            "facebook",
            "youtube",
            "tiktok",
            "website",
            "twitter",
            "linkedin"
        ];

        const receivedSocialKeys = Object.keys(socialLinks);
        const invalidSocialKeys = receivedSocialKeys.filter(
            (key) => !allowedSocialKeys.includes(key)
        );

        if (invalidSocialKeys.length > 0) {
            throw createApiError(
                400,
                `These social links are not supported: ${invalidSocialKeys.join(", ")}`
            );
        }


        // Validate individual social links.
        const {
            instagram,
            facebook,
            youtube,
            tiktok,
            website,
            twitter,
            linkedin
        } = socialLinks;


        if (
            instagram !== undefined &&
            typeof instagram !== "string"
        ) {
            throw createApiError(
                400,
                "Instagram link must be a string"
            );
        }


        if (
            facebook !== undefined &&
            typeof facebook !== "string"
        ) {
            throw createApiError(
                400,
                "Facebook link must be a string"
            );
        }


        if (
            youtube !== undefined &&
            typeof youtube !== "string"
        ) {
            throw createApiError(
                400,
                "YouTube link must be a string"
            );
        }


        if (
            tiktok !== undefined &&
            typeof tiktok !== "string"
        ) {
            throw createApiError(
                400,
                "TikTok link must be a string"
            );
        }


        if (
            website !== undefined &&
            typeof website !== "string"
        ) {
            throw createApiError(
                400,
                "Website link must be a string"
            );
        }

        if (
            twitter !== undefined &&
            typeof twitter !== "string"
        ) {
            throw createApiError(
                400,
                "Twitter link must be a string"
            );
        }

        if (
            linkedin !== undefined &&
            typeof linkedin !== "string"
        ) {
            throw createApiError(
                400,
                "LinkedIn link must be a string"
            );
        }
    }


    // Validate title.
    if (title !== undefined) {

        if (typeof title !== "string") {
            throw createApiError(
                400,
                "Title must be a string"
            );
        }

        if (title.length > 150) {
            throw createApiError(
                400,
                "Title must not exceed 150 characters"
            );
        }
    }


    // Validate keywords.
    if (keywords !== undefined) {

        if (!Array.isArray(keywords)) {
            throw createApiError(
                400,
                "Keywords must be an array"
            );
        }

        if (keywords.length > 10) {
            throw createApiError(
                400,
                "Keywords cannot exceed 10 items"
            );
        }

        if (keywords.some((keyword) => typeof keyword !== "string")) {
            throw createApiError(
                400,
                "Each keyword must be a string"
            );
        }
    }


    // Validate niches.
    if (niches !== undefined) {

        if (!Array.isArray(niches)) {
            throw createApiError(
                400,
                "Niches must be an array"
            );
        }

        if (niches.length > 3) {
            throw createApiError(
                400,
                "Niches cannot exceed 3 items"
            );
        }

        if (niches.some((niche) => typeof niche !== "string")) {
            throw createApiError(
                400,
                "Each niche must be a string"
            );
        }
    }


    // Validate dob (date of birth).
    if (dob !== undefined && dob !== null && dob !== "") {

        if (
            (typeof dob !== "string" && !(dob instanceof Date)) ||
            Number.isNaN(new Date(dob).getTime())
        ) {
            throw createApiError(
                400,
                "Date of birth must be a valid date"
            );
        }
    }


    // Validate gender.
    if (gender !== undefined && gender !== null && gender !== "") {

        const allowedGenders = [
            "male",
            "female",
            "non-binary",
            "other",
            "prefer_not_to_say"
        ];

        if (typeof gender !== "string" || !allowedGenders.includes(gender)) {
            throw createApiError(
                400,
                `Gender must be one of: ${allowedGenders.join(", ")}`
            );
        }
    }


    // Validate languages.
    if (languages !== undefined) {

        if (!Array.isArray(languages)) {
            throw createApiError(
                400,
                "Languages must be an array"
            );
        }

        if (languages.length > 10) {
            throw createApiError(
                400,
                "Languages cannot exceed 10 items"
            );
        }

        if (languages.some((language) => typeof language !== "string")) {
            throw createApiError(
                400,
                "Each language must be a string"
            );
        }
    }


    // Validate ethnicity.
    if (ethnicity !== undefined) {

        if (typeof ethnicity !== "string") {
            throw createApiError(
                400,
                "Ethnicity must be a string"
            );
        }
    }


    // Validate followerCount (numeric, integer only, minimum 0).
    if (followerCount !== undefined && followerCount !== null && followerCount !== "") {
        const parsedFollowers = Number(followerCount);
        if (
            Number.isNaN(parsedFollowers) ||
            !Number.isInteger(parsedFollowers) ||
            parsedFollowers < 0
        ) {
            throw createApiError(
                400,
                "Follower count must be a non-negative integer"
            );
        }
    }

    // Validate engagementRate (numeric percentage, 0 to 100).
    if (engagementRate !== undefined && engagementRate !== null && engagementRate !== "") {
        const parsedEng = Number(engagementRate);
        if (
            Number.isNaN(parsedEng) ||
            parsedEng < 0 ||
            parsedEng > 100
        ) {
            throw createApiError(
                400,
                "Engagement rate must be between 0 and 100"
            );
        }
    }

    next();
};


// Validate data while updating a creator profile.
const updateProfileValidation = (req, res, next) => {

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        throw createApiError(
            400,
            "Request body must be an object"
        );
    }

    // Prevent protected/system fields from being updated
    // directly by the client.
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter(
        (field) => !ALLOWED_PROFILE_FIELDS.includes(field)
    );


    if (invalidFields.length > 0) {
        throw createApiError(
            400,
            `These fields cannot be updated: ${invalidFields.join(", ")}`
        );
    }


    // Reuse the same validation rules used during creation.
    return createProfileValidation(req, res, next);
};


export {
    createProfileValidation,
    updateProfileValidation
};
