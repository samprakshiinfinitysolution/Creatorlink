import createApiError from "../../../utils/ApiError.js";


// Allowed campaign platforms.
const allowedPlatforms = [
    "instagram",
    "facebook",
    "youtube",
    "tiktok",
    "website"
];

// Helper to validate and normalize platform input.
// Supports string, comma-separated string, or array of strings.
// Rejects invalid types, empty items, and unsupported platform names.
const normalizePlatformInput = (value) => {
    let rawList = [];
    if (Array.isArray(value)) {
        if (value.length === 0) {
            throw createApiError(400, "Invalid platform. Select at least one valid target platform.");
        }
        for (const item of value) {
            if (typeof item !== "string" || !item.trim()) {
                throw createApiError(400, "Each platform must be a valid non-empty string");
            }
            rawList.push(item.trim().toLowerCase());
        }
    } else if (typeof value === "string") {
        if (!value.trim()) {
            throw createApiError(400, "Invalid platform. Select at least one valid target platform.");
        }
        const items = value.split(",");
        for (const item of items) {
            const trimmed = item.trim().toLowerCase();
            if (!trimmed) {
                throw createApiError(400, "Each platform must be a valid non-empty string");
            }
            rawList.push(trimmed);
        }
    } else {
        throw createApiError(400, "Platform must be a string or an array of strings");
    }

    const uniqueList = Array.from(new Set(rawList));
    const invalidItems = uniqueList.filter((p) => !allowedPlatforms.includes(p));
    if (invalidItems.length > 0) {
        throw createApiError(
            400,
            `Invalid platform: ${invalidItems.join(", ")}. Allowed: ${allowedPlatforms.join(", ")}`
        );
    }

    return uniqueList;
};

// Numeric validation helpers
const isValidNumericInput = (val) => {
    if (typeof val === "number") {
        return Number.isFinite(val);
    }
    if (typeof val === "string" && val.trim() !== "") {
        const num = Number(val.trim());
        return Number.isFinite(num);
    }
    return false;
};

const toFiniteNumber = (val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string" && val.trim() !== "") return Number(val.trim());
    return NaN;
};


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
        if (audienceTargeting.gender !== undefined && audienceTargeting.gender !== null) {
            if (typeof audienceTargeting.gender !== "string") {
                throw createApiError(400, "Invalid audience gender. Allowed: all, male, female, other");
            }
            const normalizedGender = audienceTargeting.gender.trim().toLowerCase();
            if (!["all", "male", "female", "other"].includes(normalizedGender)) {
                throw createApiError(400, "Invalid audience gender. Allowed: all, male, female, other");
            }
            audienceTargeting.gender = normalizedGender;
        }
        if (audienceTargeting.age !== undefined && audienceTargeting.age !== null && typeof audienceTargeting.age !== "string") {
            throw createApiError(400, "Audience age must be a string");
        }
        if (audienceTargeting.geography !== undefined && audienceTargeting.geography !== null) {
            if (typeof audienceTargeting.geography === "string") {
                // String is allowed
            } else if (Array.isArray(audienceTargeting.geography)) {
                if (audienceTargeting.geography.some((geo) => typeof geo !== "string" || !geo.trim())) {
                    throw createApiError(400, "Every geography element must be a non-empty string");
                }
            } else {
                throw createApiError(400, "Audience geography must be a string or array of strings");
            }
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
        if (usageRights.duration !== undefined && usageRights.duration !== null) {
            if (typeof usageRights.duration !== "string") {
                throw createApiError(400, "Usage duration must be a string");
            }
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

    // Support either platform or platforms alias
    if (req.body.platform === undefined && req.body.platforms !== undefined) {
        req.body.platform = req.body.platforms;
        delete req.body.platforms;
    }

    // Validate explicitly provided budget fields for finite numbers
    if (req.body.budget !== undefined) {
        if (req.body.budget === null || !isValidNumericInput(req.body.budget)) {
            throw createApiError(400, "Budget must be a valid positive number");
        }
        const parsedBudget = toFiniteNumber(req.body.budget);
        if (parsedBudget < 0) {
            throw createApiError(400, "Budget must be a valid positive number");
        }
        req.body.budget = parsedBudget;
    }

    if (req.body.minBudget !== undefined) {
        if (req.body.minBudget === null || !isValidNumericInput(req.body.minBudget)) {
            throw createApiError(400, "Minimum budget must be a non-negative number");
        }
        const parsedMin = toFiniteNumber(req.body.minBudget);
        if (parsedMin < 0) {
            throw createApiError(400, "Minimum budget must be a non-negative number");
        }
        req.body.minBudget = parsedMin;
    }

    if (req.body.maxBudget !== undefined) {
        if (req.body.maxBudget === null || !isValidNumericInput(req.body.maxBudget)) {
            throw createApiError(400, "Maximum budget must be a non-negative number");
        }
        const parsedMax = toFiniteNumber(req.body.maxBudget);
        if (parsedMax < 0) {
            throw createApiError(400, "Maximum budget must be a non-negative number");
        }
        req.body.maxBudget = parsedMax;
    }

    // Auto-sync budget, minBudget, and maxBudget if omitted
    if (req.body.budget === undefined) {
        if (req.body.maxBudget !== undefined) {
            req.body.budget = req.body.maxBudget;
        } else if (req.body.minBudget !== undefined) {
            req.body.budget = req.body.minBudget;
        }
    }

    if (req.body.minBudget === undefined && req.body.budget !== undefined) {
        req.body.minBudget = req.body.budget;
    }

    if (req.body.maxBudget === undefined && req.body.budget !== undefined) {
        req.body.maxBudget = req.body.budget;
    }

    if (
        req.body.minBudget !== undefined &&
        req.body.maxBudget !== undefined &&
        req.body.minBudget > req.body.maxBudget
    ) {
        throw createApiError(400, "Minimum budget cannot exceed maximum budget");
    }

    // Validate required creators
    if (req.body.requiredCreators !== undefined && req.body.requiredCreators !== null) {
        if (!isValidNumericInput(req.body.requiredCreators)) {
            throw createApiError(400, "Required creators must be at least 1");
        }
        const parsedCreators = toFiniteNumber(req.body.requiredCreators);
        if (parsedCreators < 1) {
            throw createApiError(400, "Required creators must be at least 1");
        }
        req.body.requiredCreators = parsedCreators;
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
        platform === undefined ||
        platform === null ||
        budget === undefined ||
        budget === null ||
        !deadline ||
        requiredCreators === undefined ||
        requiredCreators === null ||
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


    // Validate and normalize platform (supports single or multiple platforms).
    req.body.platform = normalizePlatformInput(platform);


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

    if (req.body.platform === undefined && req.body.platforms !== undefined) {
        req.body.platform = req.body.platforms;
        delete req.body.platforms;
    }

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

    // Validate budget ranges if provided
    if (req.body.maxBudget !== undefined) {
        if (req.body.maxBudget === null || !isValidNumericInput(req.body.maxBudget)) {
            throw createApiError(400, "Maximum budget must be a non-negative number");
        }
        const parsedMax = toFiniteNumber(req.body.maxBudget);
        if (parsedMax < 0) {
            throw createApiError(400, "Maximum budget must be a non-negative number");
        }
        req.body.maxBudget = parsedMax;
    }

    if (req.body.minBudget !== undefined) {
        if (req.body.minBudget === null || !isValidNumericInput(req.body.minBudget)) {
            throw createApiError(400, "Minimum budget must be a non-negative number");
        }
        const parsedMin = toFiniteNumber(req.body.minBudget);
        if (parsedMin < 0) {
            throw createApiError(400, "Minimum budget must be a non-negative number");
        }
        req.body.minBudget = parsedMin;
    }

    if (req.body.budget !== undefined) {
        if (req.body.budget === null || !isValidNumericInput(req.body.budget)) {
            throw createApiError(400, "Budget must be a valid positive number");
        }
        const parsedBudget = toFiniteNumber(req.body.budget);
        if (parsedBudget < 0) {
            throw createApiError(400, "Budget must be a valid positive number");
        }
        req.body.budget = parsedBudget;
    }

    if (
        req.body.minBudget !== undefined &&
        req.body.maxBudget !== undefined &&
        req.body.minBudget > req.body.maxBudget
    ) {
        throw createApiError(400, "Minimum budget cannot exceed maximum budget");
    }

    // Validate required creators if provided
    if (req.body.requiredCreators !== undefined) {
        if (req.body.requiredCreators === null || !isValidNumericInput(req.body.requiredCreators)) {
            throw createApiError(400, "Required creators must be at least 1");
        }
        const parsedCreators = toFiniteNumber(req.body.requiredCreators);
        if (parsedCreators < 1) {
            throw createApiError(400, "Required creators must be at least 1");
        }
        req.body.requiredCreators = parsedCreators;
    }

    const {
        title,
        description,
        category,
        coverImage,
        platform,
        currency,
        deadline,
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


    // Validate platform if provided (supports single or multiple platforms).
    if (platform !== undefined) {
        const normalizedPlatforms = normalizePlatformInput(platform);
        if (
            normalizedPlatforms.length === 0 ||
            normalizedPlatforms.some((p) => !allowedPlatforms.includes(p))
        ) {
            throw createApiError(
                400,
                "Invalid platform. Select at least one valid target platform."
            );
        }
        req.body.platform = normalizedPlatforms;
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
