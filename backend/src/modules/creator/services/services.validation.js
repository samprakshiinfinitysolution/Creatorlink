import sendResponse from "../../../utils/response.js";


const allowedPlatforms = [
    "instagram",
    "youtube",
    "facebook",
    "tiktok",
    "website",
    "multiple",
    "other"
];


const allowedPricingTypes = [
    "fixed",
    "starting_from",
    "custom"
];


// Create service validation.
const validateCreateService = (req, res, next) => {

    const {
        title,
        description,
        category,
        platform,
        deliverables,
        pricingType,
        price,
        currency,
        deliveryTime,
        revisions,
        isActive
    } = req.body;


    if (
        !title ||
        typeof title !== "string" ||
        !title.trim()
    ) {
        return sendResponse(
            res,
            400,
            "Service title is required",
            null
        );
    }


    if (title.length > 150) {
        return sendResponse(
            res,
            400,
            "Service title must not exceed 150 characters",
            null
        );
    }


    if (
        description !== undefined &&
        (
            typeof description !== "string" ||
            description.length > 2000
        )
    ) {
        return sendResponse(
            res,
            400,
            "Description must not exceed 2000 characters",
            null
        );
    }


    if (
        !category ||
        typeof category !== "string" ||
        !category.trim()
    ) {
        return sendResponse(
            res,
            400,
            "Service category is required",
            null
        );
    }


    if (
        !platform ||
        !allowedPlatforms.includes(platform)
    ) {
        return sendResponse(
            res,
            400,
            "Invalid service platform",
            null
        );
    }


    if (deliverables !== undefined) {

        if (!Array.isArray(deliverables)) {
            return sendResponse(
                res,
                400,
                "Deliverables must be an array",
                null
            );
        }


        if (
            deliverables.some(
                (item) =>
                    typeof item !== "string" ||
                    !item.trim()
            )
        ) {
            return sendResponse(
                res,
                400,
                "Every deliverable must be a valid string",
                null
            );
        }
    }


    if (
        pricingType !== undefined &&
        !allowedPricingTypes.includes(pricingType)
    ) {
        return sendResponse(
            res,
            400,
            "Invalid pricing type",
            null
        );
    }


    if (
        price !== undefined &&
        (
            typeof price !== "number" ||
            price < 0
        )
    ) {
        return sendResponse(
            res,
            400,
            "Price must be a valid positive number",
            null
        );
    }


    if (
        currency !== undefined &&
        (
            typeof currency !== "string" ||
            currency.length !== 3
        )
    ) {
        return sendResponse(
            res,
            400,
            "Currency must contain a valid 3-letter code",
            null
        );
    }


    if (
        deliveryTime !== undefined &&
        (
            typeof deliveryTime !== "number" ||
            deliveryTime < 1
        )
    ) {
        return sendResponse(
            res,
            400,
            "Delivery time must be at least 1 day",
            null
        );
    }


    if (
        revisions !== undefined &&
        (
            typeof revisions !== "number" ||
            revisions < 0
        )
    ) {
        return sendResponse(
            res,
            400,
            "Revisions must be a valid non-negative number",
            null
        );
    }


    if (
        isActive !== undefined &&
        typeof isActive !== "boolean"
    ) {
        return sendResponse(
            res,
            400,
            "isActive must be a boolean",
            null
        );
    }


    next();
};


// Update validation.
const validateUpdateService = (req, res, next) => {

    if (Object.keys(req.body).length === 0) {
        return sendResponse(
            res,
            400,
            "At least one field is required for update",
            null
        );
    }


    const {
        title,
        description,
        category,
        platform,
        deliverables,
        pricingType,
        price,
        currency,
        deliveryTime,
        revisions,
        isActive
    } = req.body;


    if (
        title !== undefined &&
        (
            typeof title !== "string" ||
            !title.trim() ||
            title.length > 150
        )
    ) {
        return sendResponse(
            res,
            400,
            "Invalid service title",
            null
        );
    }


    if (
        description !== undefined &&
        (
            typeof description !== "string" ||
            description.length > 2000
        )
    ) {
        return sendResponse(
            res,
            400,
            "Description must not exceed 2000 characters",
            null
        );
    }


    if (
        category !== undefined &&
        (
            typeof category !== "string" ||
            !category.trim()
        )
    ) {
        return sendResponse(
            res,
            400,
            "Invalid service category",
            null
        );
    }


    if (
        platform !== undefined &&
        !allowedPlatforms.includes(platform)
    ) {
        return sendResponse(
            res,
            400,
            "Invalid service platform",
            null
        );
    }


    if (deliverables !== undefined) {

        if (!Array.isArray(deliverables)) {
            return sendResponse(
                res,
                400,
                "Deliverables must be an array",
                null
            );
        }
    }


    if (
        pricingType !== undefined &&
        !allowedPricingTypes.includes(pricingType)
    ) {
        return sendResponse(
            res,
            400,
            "Invalid pricing type",
            null
        );
    }


    if (
        price !== undefined &&
        (
            typeof price !== "number" ||
            price < 0
        )
    ) {
        return sendResponse(
            res,
            400,
            "Price must be a valid positive number",
            null
        );
    }


    if (
        currency !== undefined &&
        (
            typeof currency !== "string" ||
            currency.length !== 3
        )
    ) {
        return sendResponse(
            res,
            400,
            "Currency must contain a valid 3-letter code",
            null
        );
    }


    if (
        deliveryTime !== undefined &&
        (
            typeof deliveryTime !== "number" ||
            deliveryTime < 1
        )
    ) {
        return sendResponse(
            res,
            400,
            "Delivery time must be at least 1 day",
            null
        );
    }


    if (
        revisions !== undefined &&
        (
            typeof revisions !== "number" ||
            revisions < 0
        )
    ) {
        return sendResponse(
            res,
            400,
            "Revisions must be a valid non-negative number",
            null
        );
    }


    if (
        isActive !== undefined &&
        typeof isActive !== "boolean"
    ) {
        return sendResponse(
            res,
            400,
            "isActive must be a boolean",
            null
        );
    }


    next();
};


export {
    validateCreateService,
    validateUpdateService
};