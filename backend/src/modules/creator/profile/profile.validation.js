import createApiError from "../../../utils/ApiError.js";


// Validate data while creating a creator profile.
const createProfileValidation = (req, res, next) => {

    const {
        bio,
        category,
        location,
        profileImage,
        socialLinks
    } = req.body;


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


        // Validate individual social links.
        const {
            instagram,
            youtube,
            tiktok,
            website
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
    }


    next();
};


// Validate data while updating a creator profile.
const updateProfileValidation = (req, res, next) => {

    const allowedFields = [
        "bio",
        "category",
        "location",
        "profileImage",
        "socialLinks"
    ];


    // Prevent protected/system fields from being updated
    // directly by the client.
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter(
        (field) => !allowedFields.includes(field)
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