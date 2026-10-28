import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";
import createApiError from "../../utils/ApiError.js";
import {
    uploadImageToCloudinary,
    uploadMultipleImagesToCloudinary,
    uploadVideoToCloudinary
} from "../../utils/helpers/cloudinary.helper.js";

// Approved upload folders in Cloudinary.
const ALLOWED_FOLDERS = [
    "creatorlink/general",
    "creatorlink/profiles",
    "creatorlink/portfolios",
    "creatorlink/brands",
    "creatorlink/deliverables",
    "creatorlink/services",
    "creatorlink/campaigns"
];

const DEFAULT_FOLDER = "creatorlink/general";

/**
 * Validates and resolves the upload folder against an approved allowlist.
 *
 * @param {string} [requestedFolder]
 * @param {string} [defaultFolder="creatorlink/general"]
 * @returns {string}
 */
const resolveUploadFolder = (requestedFolder, defaultFolder = DEFAULT_FOLDER) => {
    if (!requestedFolder) {
        return defaultFolder;
    }

    if (ALLOWED_FOLDERS.includes(requestedFolder)) {
        return requestedFolder;
    }

    throw createApiError(
        400,
        `Invalid upload folder. Allowed folders: ${ALLOWED_FOLDERS.join(", ")}`
    );
};

/**
 * Handles single video upload to Cloudinary.
 * Expects req.file populated by uploadSingleVideo middleware.
 * Default folder for videos is "creatorlink/deliverables".
 */
const uploadSingleVideoHandler = asyncHandler(async (req, res) => {
    if (!req.file || !req.file.buffer) {
        throw createApiError(
            400,
            "Please provide a video file under the 'video' field"
        );
    }

    const folder = resolveUploadFolder(req.body.folder, "creatorlink/deliverables");
    const result = await uploadVideoToCloudinary(req.file.buffer, folder);

    return sendResponse(
        res,
        200,
        "Video uploaded successfully",
        result
    );
});

/**
 * Handles single image upload to Cloudinary.
 * Expects req.file populated by uploadSingleImage middleware.
 */
const uploadSingleImageHandler = asyncHandler(async (req, res) => {
    if (!req.file || !req.file.buffer) {
        throw createApiError(
            400,
            "Please provide an image file under the 'image' field"
        );
    }

    const folder = resolveUploadFolder(req.body.folder);
    const result = await uploadImageToCloudinary(req.file.buffer, folder);

    return sendResponse(
        res,
        200,
        "Image uploaded successfully",
        result
    );
});

/**
 * Handles multiple image upload to Cloudinary.
 * Expects req.files populated by uploadMultipleImages middleware.
 */
const uploadMultipleImagesHandler = asyncHandler(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw createApiError(
            400,
            "Please provide image files under the 'images' field"
        );
    }

    const folder = resolveUploadFolder(req.body.folder);
    const buffers = req.files.map((file) => file.buffer);
    const results = await uploadMultipleImagesToCloudinary(buffers, folder);

    return sendResponse(
        res,
        200,
        "Images uploaded successfully",
        results
    );
});

export {
    uploadSingleImageHandler,
    uploadMultipleImagesHandler,
    uploadSingleVideoHandler
};

