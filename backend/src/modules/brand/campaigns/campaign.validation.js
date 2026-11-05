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

// Helper to validate audience targeting object
const validateAudienceTargeting = (audienceTargeting) => {
    if (audienceTargeting !== undefined && audienceTargeting !== null) {
        if (typeof audienceTargeting !== "object" || Array.isArray(audienceTargeting)) {
            throw createApiError(400, "Audience targeting must be an object");
        }
        if (audienceTargeting.gender && !["all", "male", "female", "other"].includes(audienceTargeting.gender.toLowerCase())) {
            throw createApiError(400, "Invalid audience gender. Allowed: all, male, female, other");
        }
        if (audienceTargeting.age && typeof audienceTargeting.age !== "string") {
            throw createApiError(400, "Audience age must be a string");
        }
        if (audienceTargeting.geography && !Array.isArray(audienceTargeting.geography) && typeof audienceTargeting.geography !== "string") {
            throw createApiError(400, "Audience geography must be a string or array of strings");
        }
    }
};

// Helper to validate usage rights object
const validateUsageRights = (usageRights) => {
    if (usageRights !== undefined && usageRights !== null) {
        if (typeof usageRights !== "object" || Array.isArray(usageRights)) {
            throw createApiError(400, "Usage rights must be an object");
        }
        if (usageRights.organicUsage !== undefined && typeof usageRights.organicUsage !== "boolean") {
            throw createApiError(400, "organicUsage must be a boolean");
        }
        if (usageRights.paidAds !== undefined && typeof usageRights.paidAds !== "boolean") {
            throw createApiError(400, "paidAds must be a boolean");
        }
        if (usageRights.duration && typeof usageRights.duration !== "string") {
            throw createApiError(400, "Usage duration must be a string");
        }
        if (usageRights.exclusivity !== undefined && typeof usageRights.exclusivity !== "boolean") {
            throw createApiError(400, "exclusivity must be a boolean");
        }
    }
};

// Helper to validate creator requirements object
const validateCreatorRequirements = (creatorRequirements) => {
    if (creatorRequirements !== undefined && creatorRequirements !== null) {
        if (typeof creatorRequirements !== "object" || Array.isArray(creatorRequirements)) {
            throw createApiError(400, "Creator requirements must be an object");
        }
        if (creatorRequirements.minFollowers !== undefined && creatorRequirements.minFollowers !== null && creatorRequirements.minFollowers !== "") {
            const parsedFollowers = Number(creatorRequirements.minFollowers);
            if (!Number.isFinite(parsedFollowers) || parsedFollowers < 0) {
                throw createApiError(400, "Minimum followers must be a non-negative number");
            }
        }
        if (creatorRequirements.minEngagementRate !== undefined && creatorRequirements.minEngagementRate !== null && creatorRequirements.minEngagementRate !== "") {
            const parsedEng = Number(creatorRequirements.minEngagementRate);
            if (!Number.isFinite(parsedEng) || parsedEng < 0 || parsedEng > 100) {
                throw createApiError(400, "Minimum engagement rate must be a percentage between 0 and 100");
            }
        }
    }
};


// Validates campaign creation data.
const validateCreateCampaign = (req, res, next) => {

    // Auto-sync budget, minBudget, and maxBudget before validation
    if (req.body.budget === undefined || req.body.budget === null || req.body.budget === "") {
        if (req.body.maxBudget !== undefined && req.body.maxBudget !== null && req.body.maxBudget !== "") {
            req.body.budget = Number(req.body.maxBudget);
        } else if (req.body.minBudget !== undefined && req.body.minBudget !== null && req.body.minBudget !== "") {
            req.body.budget = Number(req.body.minBudget);
        }
    } else {
        req.body.budget = Number(req.body.budget);
    }

    if (req.body.minBudget !== undefined && req.body.minBudget !== null && req.body.minBudget !== "") {
        req.body.minBudget = Number(req.body.minBudget);
    } else if (req.body.budget !== undefined && !Number.isNaN(req.body.budget)) {
        req.body.minBudget = req.body.budget;
    }

    if (req.body.maxBudget !== undefined && req.body.maxBudget !== null && req.body.maxBudget !== "") {
        req.body.maxBudget = Number(req.body.maxBudget);
    } else if (req.body.budget !== undefined && !Number.isNaN(req.body.budget)) {
        req.body.maxBudget = req.body.budget;
    }

    const {
        title,
        description,
        category,
        coverImage,
        platform,
        budget,
        minBudget,
        maxBudget,
        currency,
        deadline,
        requiredCreators,
        deliverables,
        audienceTargeting,
        usageRights,
        creatorRequirements
    } = req.body;


    // Check required fields.
    if (
        !title ||
        !description ||
        !category ||
        !platform ||
        budget === undefined ||
        Number.isNaN(budget) ||
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


    // Validate cover image if provided.
    if (
        coverImage !== undefined &&
        (
            typeof coverImage !== "string" ||
            coverImage.length > 2000
        )
    ) {
        throw createApiError(
            400,
            "Cover image must be a string with maximum 2000 characters"
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
        Number.isNaN(budget) ||
        budget < 0
    ) {
        throw createApiError(
            400,
            "Budget must be a valid positive number"
        );
    }

    if (minBudget !== undefined && (typeof minBudget !== "number" || Number.isNaN(minBudget) || minBudget < 0)) {
        throw createApiError(400, "Minimum budget must be a non-negative number");
    }

    if (maxBudget !== undefined && (typeof maxBudget !== "number" || Number.isNaN(maxBudget) || maxBudget < 0)) {
        throw createApiError(400, "Maximum budget must be a non-negative number");
    }

    if (minBudget !== undefined && maxBudget !== undefined && minBudget > maxBudget) {
        throw createApiError(400, "Minimum budget cannot exceed maximum budget");
    }

    // Validate metadata objects
    validateAudienceTargeting(audienceTargeting);
    validateUsageRights(usageRights);
    validateCreatorRequirements(creatorRequirements);


    // Validate currency if provided (must be "INR").
    if (currency !== undefined) {
        if (
            typeof currency !== "string" ||
            currency.trim().toUpperCase() !== "INR"
        ) {
            throw createApiError(
                400,
                "Only INR currency is currently supported"
            );
        }
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
        "coverImage",
        "platform",
        "budget",
        "minBudget",
        "maxBudget",
        "audienceTargeting",
        "usageRights",
        "creatorRequirements",
        "currency",
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

    // Sync and validate budget ranges if provided
    if (req.body.maxBudget !== undefined && req.body.maxBudget !== null && req.body.maxBudget !== "") {
        req.body.maxBudget = Number(req.body.maxBudget);
        if (Number.isNaN(req.body.maxBudget) || req.body.maxBudget < 0) {
            throw createApiError(400, "Maximum budget must be a non-negative number");
        }
        if (req.body.budget === undefined) {
            req.body.budget = req.body.maxBudget;
        }
    }

    if (req.body.minBudget !== undefined && req.body.minBudget !== null && req.body.minBudget !== "") {
        req.body.minBudget = Number(req.body.minBudget);
        if (Number.isNaN(req.body.minBudget) || req.body.minBudget < 0) {
            throw createApiError(400, "Minimum budget must be a non-negative number");
        }
    }

    if (req.body.budget !== undefined && req.body.budget !== null && req.body.budget !== "") {
        req.body.budget = Number(req.body.budget);
        if (Number.isNaN(req.body.budget) || req.body.budget < 0) {
            throw createApiError(400, "Budget must be a valid positive number");
        }
    }

    if (
        req.body.minBudget !== undefined &&
        req.body.maxBudget !== undefined &&
        req.body.minBudget > req.body.maxBudget
    ) {
        throw createApiError(400, "Minimum budget cannot exceed maximum budget");
    }

    const {
        title,
        description,
        category,
        coverImage,
        platform,
        budget,
        currency,
        deadline,
        requiredCreators,
        deliverables,
        audienceTargeting,
        usageRights,
        creatorRequirements,
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


    // Validate cover image if provided.
    if (
        coverImage !== undefined &&
        (
            typeof coverImage !== "string" ||
            coverImage.length > 2000
        )
    ) {
        throw createApiError(
            400,
            "Cover image must be a string with maximum 2000 characters"
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


    // Validate currency if provided (must be "INR").
    if (currency !== undefined) {
        if (
            typeof currency !== "string" ||
            currency.trim().toUpperCase() !== "INR"
        ) {
            throw createApiError(
                400,
                "Only INR currency is currently supported"
            );
        }
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

    // Validate metadata objects if provided
    validateAudienceTargeting(audienceTargeting);
    validateUsageRights(usageRights);
    validateCreatorRequirements(creatorRequirements);


    next();
};


export {
    validateCreateCampaign,
    validateUpdateCampaign
};
