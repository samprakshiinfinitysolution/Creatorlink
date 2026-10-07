import createApiError from "../../../utils/ApiError.js";


// Allowed campaign platforms.
const allowedPlatforms = [
    "instagram",
    "facebook",
    "youtube",
    "tiktok",
    "website"
];


// Allowed campaign statuses.
const allowedStatuses = [
    "draft",
    "published",
    "paused",
    "in_progress",
    "completed",
    "closed"
];


// Validates campaign creation data.
const validateCreateCampaign = (req, res, next) => {

    const {
        title,
        description,
        category,
        platform,
        budget,
        deadline,
        requiredCreators,
        deliverables
    } = req.body;


    // Check required fields.
    if (
        !title ||
        !description ||
        !category ||
        !platform ||
        budget === undefined ||
        !deadline ||
        requiredCreators === undefined ||
        !deliverables
    ) {
        throw createApiError(
            400,
            "All campaign fields are required"
        );
    }


    // Validate title.
    if (
        typeof title !== "string" ||
        title.length > 150
    ) {
        throw createApiError(
            400,
            "Title must be a string with maximum 150 characters"
        );
    }


    // Validate description.
    if (
        typeof description !== "string" ||
        description.length > 3000
    ) {
        throw createApiError(
            400,
            "Description must be a string with maximum 3000 characters"
        );
    }


    // Validate category.
    if (
        typeof category !== "string" ||
        category.length > 100
    ) {
        throw createApiError(
            400,
            "Category must be a string with maximum 100 characters"
        );
    }


    // Validate platform.
    if (!allowedPlatforms.includes(platform)) {
        throw createApiError(
            400,
            "Invalid platform"
        );
    }


    // Validate budget.
    if (
        typeof budget !== "number" ||
        budget < 0
    ) {
        throw createApiError(
            400,
            "Budget must be a valid positive number"
        );
    }


    // Validate deadline.
    if (Number.isNaN(Date.parse(deadline))) {
        throw createApiError(
            400,
            "Invalid deadline"
        );
    }


    // Validate required creators.
    if (
        typeof requiredCreators !== "number" ||
        requiredCreators < 1
    ) {
        throw createApiError(
            400,
            "Required creators must be at least 1"
        );
    }


    // Validate deliverables.
    if (
        !Array.isArray(deliverables) ||
        deliverables.length === 0
    ) {
        throw createApiError(
            400,
            "Deliverables must be a non-empty array"
        );
    }


    // Validate each deliverable.
    if (
        deliverables.some(
            (deliverable) =>
                typeof deliverable !== "string" ||
                !deliverable.trim()
        )
    ) {
        throw createApiError(
            400,
            "Each deliverable must be a valid string"
        );
    }


    next();
};


// Validates campaign update data.
const validateUpdateCampaign = (req, res, next) => {

    const allowedFields = [
        "title",
        "description",
        "category",
        "platform",
        "budget",
        "deadline",
        "requiredCreators",
        "deliverables",
        "status"
    ];


    const providedFields = Object.keys(req.body);


    // At least one field is required.
    if (providedFields.length === 0) {
        throw createApiError(
            400,
            "At least one field is required for update"
        );
    }


    // Prevent unknown fields from being updated.
    const invalidFields = providedFields.filter(
        (field) => !allowedFields.includes(field)
    );


    if (invalidFields.length > 0) {
        throw createApiError(
            400,
            `Invalid fields: ${invalidFields.join(", ")}`
        );
    }


    const {
        title,
        description,
        category,
        platform,
        budget,
        deadline,
        requiredCreators,
        deliverables,
        status
    } = req.body;


    // Validate title if provided.
    if (
        title !== undefined &&
        (
            typeof title !== "string" ||
            title.length > 150
        )
    ) {
        throw createApiError(
            400,
            "Title must be a string with maximum 150 characters"
        );
    }


    // Validate description if provided.
    if (
        description !== undefined &&
        (
            typeof description !== "string" ||
            description.length > 3000
        )
    ) {
        throw createApiError(
            400,
            "Description must be a string with maximum 3000 characters"
        );
    }


    // Validate category if provided.
    if (
        category !== undefined &&
        (
            typeof category !== "string" ||
            category.length > 100
        )
    ) {
        throw createApiError(
            400,
            "Category must be a string with maximum 100 characters"
        );
    }


    // Validate platform if provided.
    if (
        platform !== undefined &&
        !allowedPlatforms.includes(platform)
    ) {
        throw createApiError(
            400,
            "Invalid platform"
        );
    }


    // Validate budget if provided.
    if (
        budget !== undefined &&
        (
            typeof budget !== "number" ||
            budget < 0
        )
    ) {
        throw createApiError(
            400,
            "Budget must be a valid positive number"
        );
    }


    // Validate deadline if provided.
    if (
        deadline !== undefined &&
        Number.isNaN(Date.parse(deadline))
    ) {
        throw createApiError(
            400,
            "Invalid deadline"
        );
    }


    // Validate required creators if provided.
    if (
        requiredCreators !== undefined &&
        (
            typeof requiredCreators !== "number" ||
            requiredCreators < 1
        )
    ) {
        throw createApiError(
            400,
            "Required creators must be at least 1"
        );
    }


    // Validate deliverables if provided.
    if (deliverables !== undefined) {

        if (
            !Array.isArray(deliverables) ||
            deliverables.length === 0
        ) {
            throw createApiError(
                400,
                "Deliverables must be a non-empty array"
            );
        }


        if (
            deliverables.some(
                (deliverable) =>
                    typeof deliverable !== "string" ||
                    !deliverable.trim()
            )
        ) {
            throw createApiError(
                400,
                "Each deliverable must be a valid string"
            );
        }
    }


    // Validate status if provided.
    if (
        status !== undefined &&
        !allowedStatuses.includes(status)
    ) {
        throw createApiError(
            400,
            "Invalid campaign status"
        );
    }


    next();
};


export {
    validateCreateCampaign,
    validateUpdateCampaign
};