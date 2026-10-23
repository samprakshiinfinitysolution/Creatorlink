import createApiError from "../../../utils/ApiError.js";


// Validate data while creating a brand profile.
const createProfileValidation = (req, res, next) => {

    const {
        companyName,
        description,
        industry,
        website,
        logo,
        location,
        socialLinks,
        contactInformation
    } = req.body;


    // Validate company name.
    if (companyName !== undefined) {

        if (typeof companyName !== "string") {
            throw createApiError(
                400,
                "Company name must be a string"
            );
        }

        if (companyName.length > 150) {
            throw createApiError(
                400,
                "Company name must not exceed 150 characters"
            );
        }
    }


    // Validate description.
    if (description !== undefined) {

        if (typeof description !== "string") {
            throw createApiError(
                400,
                "Description must be a string"
            );
        }

        if (description.length > 2000) {
            throw createApiError(
                400,
                "Description must not exceed 2000 characters"
            );
        }
    }


    // Validate industry.
    if (industry !== undefined) {

        if (typeof industry !== "string") {
            throw createApiError(
                400,
                "Industry must be a string"
            );
        }

        if (industry.length > 100) {
            throw createApiError(
                400,
                "Industry must not exceed 100 characters"
            );
        }
    }


    // Validate website.
    if (website !== undefined) {

        if (typeof website !== "string") {
            throw createApiError(
                400,
                "Website must be a string"
            );
        }
    }


    // Validate logo.
    if (logo !== undefined) {

        if (typeof logo !== "string") {
            throw createApiError(
                400,
                "Logo must be a string"
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


    // Validate social links.
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
    }


    // Validate contact information.
    if (contactInformation !== undefined) {

        if (
            typeof contactInformation !== "object" ||
            contactInformation === null ||
            Array.isArray(contactInformation)
        ) {
            throw createApiError(
                400,
                "contactInformation must be an object"
            );
        }
    }


    next();
};


// Validate data while updating a brand profile.
const updateProfileValidation = (req, res, next) => {

    const allowedFields = [
        "companyName",
        "description",
        "industry",
        "website",
        "logo",
        "location",
        "socialLinks",
        "contactInformation"
    ];


    // Prevent protected/system fields from being updated directly.
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