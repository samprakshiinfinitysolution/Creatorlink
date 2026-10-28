import { Readable } from "stream";

import cloudinary from "../../config/cloudinary.js";
import createApiError from "../ApiError.js";
import { convertImageToWebp } from "./image.helper.js";

// Default concurrency limit for multiple uploads.
const DEFAULT_CONCURRENCY = 3;

/**
 * Converts an image Buffer to WebP and uploads it to Cloudinary using upload_stream.
 *
 * @param {Buffer} buffer - Image file buffer.
 * @param {string} folder - Target Cloudinary folder path.
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadImageToCloudinary = async (buffer, folder) => {
    // Validate buffer.
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw createApiError(
            400,
            "Invalid image buffer provided"
        );
    }

    // Validate target folder.
    if (!folder || typeof folder !== "string" || !folder.trim()) {
        throw createApiError(
            400,
            "A valid upload folder must be specified"
        );
    }

    // Convert raw image buffer to optimized WebP buffer (max 2 MiB, auto-rotated, alpha-preserved).
    const webpBuffer = await convertImageToWebp(buffer);

    return new Promise((resolve, reject) => {
        let isSettled = false;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder.trim(),
                resource_type: "image",
                format: "webp"
            },
            (error, result) => {
                if (isSettled) return;
                isSettled = true;

                if (error) {
                    return reject(
                        createApiError(
                            500,
                            error.message || "Failed to upload image to Cloudinary"
                        )
                    );
                }

                if (!result || !result.secure_url) {
                    return reject(
                        createApiError(
                            500,
                            "Cloudinary upload succeeded but no secure URL was returned"
                        )
                    );
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        uploadStream.on("error", (streamError) => {
            if (isSettled) return;
            isSettled = true;

            reject(
                createApiError(
                    500,
                    streamError.message || "Cloudinary upload stream encountered an error"
                )
            );
        });

        // Stream the converted WebP buffer to Cloudinary.
        const readableStream = Readable.from(webpBuffer);

        readableStream.on("error", (streamError) => {
            if (isSettled) return;
            isSettled = true;

            reject(
                createApiError(
                    500,
                    streamError.message || "Image stream error"
                )
            );
        });

        readableStream.pipe(uploadStream);
    });
};

/**
 * Uploads an array of image Buffers to Cloudinary with controlled concurrency.
 *
 * @param {Buffer[]} buffers - Array of image file buffers.
 * @param {string} folder - Target Cloudinary folder path.
 * @param {number} [concurrency=3] - Maximum number of concurrent uploads.
 * @returns {Promise<Array<{ url: string, publicId: string }>>}
 */
const uploadMultipleImagesToCloudinary = async (
    buffers,
    folder,
    concurrency = DEFAULT_CONCURRENCY
) => {
    // Validate buffers array.
    if (!Array.isArray(buffers) || buffers.length === 0) {
        throw createApiError(
            400,
            "An array of image buffers is required"
        );
    }

    // Validate target folder.
    if (!folder || typeof folder !== "string" || !folder.trim()) {
        throw createApiError(
            400,
            "A valid upload folder must be specified"
        );
    }

    // Validate individual buffers.
    for (let i = 0; i < buffers.length; i++) {
        if (!Buffer.isBuffer(buffers[i]) || buffers[i].length === 0) {
            throw createApiError(
                400,
                `Invalid image buffer at index ${i}`
            );
        }
    }

    const limit = Math.max(1, concurrency);
    const results = new Array(buffers.length);
    let nextIndex = 0;

    // Concurrency worker.
    const worker = async () => {
        while (nextIndex < buffers.length) {
            const index = nextIndex++;
            results[index] = await uploadImageToCloudinary(
                buffers[index],
                folder
            );
        }
    };

    // Spawn up to `limit` workers.
    const workers = Array.from(
        { length: Math.min(limit, buffers.length) },
        () => worker()
    );

    await Promise.all(workers);

    return results;
};

/**
 * Uploads a video Buffer directly to Cloudinary using upload_stream with resource_type: "video".
 * Never passes video buffers to Sharp or convertImageToWebp.
 *
 * @param {Buffer} buffer - Video file buffer.
 * @param {string} folder - Target Cloudinary folder path.
 * @returns {Promise<{ url: string, publicId: string, duration?: number, format?: string }>}
 */
const uploadVideoToCloudinary = async (buffer, folder) => {
    // Validate buffer.
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw createApiError(
            400,
            "Invalid video buffer provided"
        );
    }

    // Validate target folder.
    if (!folder || typeof folder !== "string" || !folder.trim()) {
        throw createApiError(
            400,
            "A valid upload folder must be specified"
        );
    }

    return new Promise((resolve, reject) => {
        let isSettled = false;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder.trim(),
                resource_type: "video"
            },
            (error, result) => {
                if (isSettled) return;
                isSettled = true;

                if (error) {
                    return reject(
                        createApiError(
                            500,
                            error.message || "Failed to upload video to Cloudinary"
                        )
                    );
                }

                if (!result || !result.secure_url) {
                    return reject(
                        createApiError(
                            500,
                            "Cloudinary upload succeeded but no secure URL was returned"
                        )
                    );
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    duration: result.duration,
                    format: result.format
                });
            }
        );

        uploadStream.on("error", (streamError) => {
            if (isSettled) return;
            isSettled = true;

            reject(
                createApiError(
                    500,
                    streamError.message || "Cloudinary upload stream encountered an error"
                )
            );
        });

        // Stream the raw video buffer directly to Cloudinary without Sharp processing.
        const readableStream = Readable.from(buffer);

        readableStream.on("error", (streamError) => {
            if (isSettled) return;
            isSettled = true;

            reject(
                createApiError(
                    500,
                    streamError.message || "Video stream error"
                )
            );
        });

        readableStream.pipe(uploadStream);
    });
};

export {
    uploadImageToCloudinary,
    uploadMultipleImagesToCloudinary,
    uploadVideoToCloudinary
};

export default {
    uploadImageToCloudinary,
    uploadMultipleImagesToCloudinary,
    uploadVideoToCloudinary
};
