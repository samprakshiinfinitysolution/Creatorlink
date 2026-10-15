import sharp from "sharp";

import createApiError from "../ApiError.js";

// Maximum allowed processed image size: 2 MiB in bytes.
const MAX_PROCESSED_SIZE_BYTES = 2 * 1024 * 1024;

// Progressive reduction ladder if initial conversion exceeds 2 MiB.
// Progressively scales down dimensions and quality, extending below 800px / q40 if needed.
const PROGRESSIVE_REDUCTION_STEPS = [
    { maxDimension: 2560, quality: 80 },
    { maxDimension: 2048, quality: 75 },
    { maxDimension: 1920, quality: 70 },
    { maxDimension: 1600, quality: 65 },
    { maxDimension: 1280, quality: 60 },
    { maxDimension: 1024, quality: 50 },
    { maxDimension: 800, quality: 40 },
    { maxDimension: 640, quality: 35 },
    { maxDimension: 480, quality: 30 },
    { maxDimension: 320, quality: 25 }
];

/**
 * Converts an image Buffer (JPEG, PNG, WebP) to an optimized WebP Buffer.
 *
 * Requirements:
 * - Uses Sharp to auto-orient using EXIF (.rotate()).
 * - Preserves PNG transparency/alpha channel.
 * - Output is strictly valid WebP format.
 * - Enforces a maximum processed output size of 2 MiB (2 * 1024 * 1024 bytes).
 * - If output exceeds 2 MiB, progressively scales down dimensions and quality.
 * - Safely catches and converts Sharp processing/decode errors into meaningful 400 ApiErrors.
 * - Throws a descriptive error if the image cannot be processed within 2 MiB or is invalid.
 * - Does not mutate the original input buffer.
 *
 * @param {Buffer} buffer - Raw input image file buffer.
 * @returns {Promise<Buffer>} - Converted and optimized WebP Buffer (<= 2 MiB).
 */
const convertImageToWebp = async (buffer) => {
    // 1. Validate input buffer.
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw createApiError(
            400,
            "Invalid image buffer provided"
        );
    }

    // 2. Safely verify that Sharp can read the image metadata.
    let metadata;
    try {
        metadata = await sharp(buffer).metadata();
    } catch (err) {
        throw createApiError(
            400,
            "Unsupported or corrupted image file"
        );
    }

    if (!metadata || !metadata.format) {
        throw createApiError(
            400,
            "Unable to parse image format from buffer"
        );
    }

    try {
        // 3. Initial attempt: preserve original dimensions, auto-orient, encode to WebP with high quality.
        let convertedBuffer = await sharp(buffer)
            .rotate()
            .webp({
                quality: 85,
                effort: 4,
                alphaQuality: 90
            })
            .toBuffer();

        if (convertedBuffer.length <= MAX_PROCESSED_SIZE_BYTES) {
            return convertedBuffer;
        }

        // 4. Progressive reduction: step through lower dimensions & qualities.
        for (const step of PROGRESSIVE_REDUCTION_STEPS) {
            let pipeline = sharp(buffer).rotate();

            if (step.maxDimension) {
                pipeline = pipeline.resize({
                    width: step.maxDimension,
                    height: step.maxDimension,
                    fit: "inside",
                    withoutEnlargement: true
                });
            }

            convertedBuffer = await pipeline
                .webp({
                    quality: step.quality,
                    effort: 4,
                    alphaQuality: Math.max(step.quality, 60)
                })
                .toBuffer();

            if (convertedBuffer.length <= MAX_PROCESSED_SIZE_BYTES) {
                return convertedBuffer;
            }
        }

        // 5. If even after all progressive reductions it exceeds 2 MiB, throw a clear API error.
        throw createApiError(
            400,
            "Unable to compress image below the 2 MB limit. Please provide a smaller image"
        );
    } catch (error) {
        // Preserve intentional API errors (e.g. 400 size limit error).
        if (error.statusCode) {
            throw error;
        }

        // Convert unexpected Sharp processing or decode errors into a 400 ApiError.
        throw createApiError(
            400,
            `Failed to process image: ${error.message || "Invalid or corrupted image data"}`
        );
    }
};

export { convertImageToWebp };
export default convertImageToWebp;
