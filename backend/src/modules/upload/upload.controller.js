import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";
import createApiError from "../../utils/ApiError.js";
import {
    uploadImageToCloudinary,
    uploadMultipleImagesToCloudinary
} from "../../utils/helpers/cloudinary.helper.js";

// Approved upload folders in Cloudinary.
const ALLOWED_FOLDERS = [
    "creatorlink/general",
    "creatorlink/profiles",
    "creatorlink/portfolios",
    "creatorlink/brands",
    "creatorlink/deliverables"
];

const DEFAULT_FOLDER = "creatorlink/general";

/**
 * Validates and resolves the upload folder against an approved allowlist.
 *
 * @param {string} [requestedFolder]
 * @returns {string}
 */
const resolveUploadFolder = (requestedFolder) => {
    if (!requestedFolder) {
        return DEFAULT_FOLDER;
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
    uploadMultipleImagesHandler
};
