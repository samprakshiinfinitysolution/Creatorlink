import sendResponse from "../../../utils/response.js";


// Validate platform content.
const validateContent = (contents) => {

    if (!Array.isArray(contents)) {
        return "contents must be an array";
    }


    const allowedPlatforms = [
        "instagram",
        "facebook",
        "youtube",
        "tiktok",
        "website"
    ];


    const allowedContentTypes = [
        "post",
        "reel",
        "story",
        "video",
        "short",
        "article",
        "other"
    ];


    for (const content of contents) {

        if (
            !content.platform ||
            !allowedPlatforms.includes(content.platform)
        ) {
            return "Invalid content platform";
        }


        if (
            !content.contentType ||
            !allowedContentTypes.includes(content.contentType)
        ) {
            return "Invalid content type";
        }


        if (
            !content.url ||
            typeof content.url !== "string"
        ) {
            return "Content URL is required";
        }


        if (
            content.title !== undefined &&
            (
                typeof content.title !== "string" ||
                content.title.length > 150
            )
        ) {
            return "Content title must not exceed 150 characters";
        }


        if (
            content.previewImage !== undefined &&
            typeof content.previewImage !== "string"
        ) {
            return "Preview image must be a string";
        }
    }


    return null;
};


// Validate portfolio creation.
const validateCreatePortfolio = (req, res, next) => {

    const {
        title,
        description,
        category,
        coverImage,
        contents,
        isPublic
    } = req.body;


    if (
        !title ||
        typeof title !== "string" ||
        !title.trim()
    ) {
        return sendResponse(
            res,
            400,
            "Portfolio title is required",
            null
        );
    }


    if (title.length > 150) {
        return sendResponse(
            res,
            400,
            "Portfolio title must not exceed 150 characters",
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
            category.length > 100
        )
    ) {
        return sendResponse(
            res,
            400,
            "Category must not exceed 100 characters",
            null
        );
    }


    if (
        coverImage !== undefined &&
        typeof coverImage !== "string"
    ) {
        return sendResponse(
            res,
            400,
            "Cover image must be a string",
            null
        );
    }


    if (contents !== undefined) {

        const contentError = validateContent(contents);

        if (contentError) {
            return sendResponse(
                res,
                400,
                contentError,
                null
            );
        }
    }


    if (
        isPublic !== undefined &&
        typeof isPublic !== "boolean"
    ) {
        return sendResponse(
            res,
            400,
            "isPublic must be a boolean",
            null
        );
    }


    next();
};


// Validate portfolio update.
const validateUpdatePortfolio = (req, res, next) => {

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
        coverImage,
        contents,
        isPublic
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
            "Title must be valid and must not exceed 150 characters",
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
            category.length > 100
        )
    ) {
        return sendResponse(
            res,
            400,
            "Category must not exceed 100 characters",
            null
        );
    }


    if (
        coverImage !== undefined &&
        typeof coverImage !== "string"
    ) {
        return sendResponse(
            res,
            400,
            "Cover image must be a string",
            null
        );
    }


    if (contents !== undefined) {

        const contentError = validateContent(contents);

        if (contentError) {
            return sendResponse(
                res,
                400,
                contentError,
                null
            );
        }
    }


    if (
        isPublic !== undefined &&
        typeof isPublic !== "boolean"
    ) {
        return sendResponse(
            res,
            400,
            "isPublic must be a boolean",
            null
        );
    }


    next();
};


export {
    validateCreatePortfolio,
    validateUpdatePortfolio
};