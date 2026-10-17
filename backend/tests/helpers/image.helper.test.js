import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import sharp from "sharp";

import { convertImageToWebp } from "../../src/utils/helpers/image.helper.js";

const MAX_PROCESSED_SIZE_BYTES = 2 * 1024 * 1024; // 2 MiB = 2,097,152 bytes

describe("Image Helper (convertImageToWebp)", () => {
    it("converts a JPEG image to valid WebP format under 2 MiB", async () => {
        const inputJpeg = await sharp({
            create: {
                width: 1200,
                height: 800,
                channels: 3,
                background: { r: 180, g: 120, b: 70 }
            }
        })
            .jpeg({ quality: 90 })
            .toBuffer();

        const result = await convertImageToWebp(inputJpeg);

        assert.ok(Buffer.isBuffer(result), "Result must be a Buffer");
        assert.ok(
            result.length <= MAX_PROCESSED_SIZE_BYTES,
            `Result size (${result.length} B) must not exceed 2 MiB`
        );

        const metadata = await sharp(result).metadata();
        assert.equal(metadata.format, "webp", "Output format must be webp");
        assert.equal(metadata.width, 1200, "Width should match original");
        assert.equal(metadata.height, 800, "Height should match original");
    });

    it("preserves PNG transparency and alpha channel", async () => {
        // Create a 400x400 image with variable alpha gradient
        const width = 400;
        const height = 400;
        const rgbaData = Buffer.alloc(width * height * 4);
        for (let i = 0; i < rgbaData.length; i += 4) {
            rgbaData[i] = 255; // R
            rgbaData[i + 1] = 100; // G
            rgbaData[i + 2] = 50; // B
            rgbaData[i + 3] = (i / 4) % 256; // Alpha gradient
        }

        const inputPng = await sharp(rgbaData, {
            raw: { width, height, channels: 4 }
        })
            .png()
            .toBuffer();

        const result = await convertImageToWebp(inputPng);

        assert.ok(Buffer.isBuffer(result));
        assert.ok(result.length <= MAX_PROCESSED_SIZE_BYTES);

        const metadata = await sharp(result).metadata();
        assert.equal(metadata.format, "webp");
        assert.equal(metadata.hasAlpha, true, "Alpha channel must be preserved");
    });

    it("accepts WebP input and optimizes it to valid WebP format", async () => {
        const inputWebp = await sharp({
            create: {
                width: 600,
                height: 400,
                channels: 3,
                background: { r: 50, g: 150, b: 250 }
            }
        })
            .webp({ quality: 95 })
            .toBuffer();

        const result = await convertImageToWebp(inputWebp);

        assert.ok(Buffer.isBuffer(result));
        assert.ok(result.length <= MAX_PROCESSED_SIZE_BYTES);

        const metadata = await sharp(result).metadata();
        assert.equal(metadata.format, "webp");
        assert.equal(metadata.width, 600);
        assert.equal(metadata.height, 400);
    });

    it("auto-rotates images using EXIF orientation", async () => {
        // Create 300x100 JPEG with EXIF orientation 6 (90 degrees CW)
        const orientedJpeg = await sharp({
            create: {
                width: 300,
                height: 100,
                channels: 3,
                background: { r: 255, g: 0, b: 0 }
            }
        })
            .withMetadata({ orientation: 6 })
            .jpeg()
            .toBuffer();

        const result = await convertImageToWebp(orientedJpeg);
        const metadata = await sharp(result).metadata();

        assert.equal(metadata.format, "webp");
        // Orientation 6 transposes width and height (300x100 -> 100x300)
        assert.equal(metadata.width, 100, "Width should be transposed by auto-rotation");
        assert.equal(metadata.height, 300, "Height should be transposed by auto-rotation");
    });

    it("enforces maximum 2 MiB limit on large high-detail images via progressive reduction", async () => {
        // 2500x2000 uncompressible random noise image (~15 MB raw)
        const width = 2500;
        const height = 2000;
        const noiseBytes = crypto.randomBytes(width * height * 3);
        const largeNoisePng = await sharp(noiseBytes, {
            raw: { width, height, channels: 3 }
        })
            .png({ compressionLevel: 0 })
            .toBuffer();

        assert.ok(
            largeNoisePng.length > MAX_PROCESSED_SIZE_BYTES,
            "Input image must exceed 2 MiB"
        );

        const result = await convertImageToWebp(largeNoisePng);

        assert.ok(Buffer.isBuffer(result));
        assert.ok(
            result.length <= MAX_PROCESSED_SIZE_BYTES,
            `Result size (${result.length} B) must be strictly <= 2 MiB (${MAX_PROCESSED_SIZE_BYTES} B)`
        );

        const metadata = await sharp(result).metadata();
        assert.equal(metadata.format, "webp");
    });

    it("does not enlarge smaller images", async () => {
        const smallJpeg = await sharp({
            create: {
                width: 320,
                height: 240,
                channels: 3,
                background: { r: 100, g: 200, b: 100 }
            }
        })
            .jpeg()
            .toBuffer();

        const result = await convertImageToWebp(smallJpeg);
        const metadata = await sharp(result).metadata();

        assert.equal(metadata.format, "webp");
        assert.equal(metadata.width, 320, "Small width must not be enlarged");
        assert.equal(metadata.height, 240, "Small height must not be enlarged");
    });

    it("does not mutate the original input buffer", async () => {
        const sampleJpeg = await sharp({
            create: {
                width: 200,
                height: 200,
                channels: 3,
                background: { r: 120, g: 60, b: 200 }
            }
        })
            .jpeg()
            .toBuffer();

        const initialHash = crypto
            .createHash("sha256")
            .update(sampleJpeg)
            .digest("hex");

        await convertImageToWebp(sampleJpeg);

        const finalHash = crypto
            .createHash("sha256")
            .update(sampleJpeg)
            .digest("hex");

        assert.equal(
            finalHash,
            initialHash,
            "Original input buffer must remain identical after processing"
        );
    });

    it("rejects null or non-buffer inputs with 400 ApiError", async () => {
        await assert.rejects(
            async () => convertImageToWebp(null),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "Invalid image buffer provided");
                return true;
            }
        );

        await assert.rejects(
            async () => convertImageToWebp("not-a-buffer"),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "Invalid image buffer provided");
                return true;
            }
        );
    });

    it("rejects empty buffer with 400 ApiError", async () => {
        await assert.rejects(
            async () => convertImageToWebp(Buffer.alloc(0)),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "Invalid image buffer provided");
                return true;
            }
        );
    });

    it("rejects corrupt binary data with 400 ApiError", async () => {
        const corruptBuffer = Buffer.from("this is definitely not an image file");

        await assert.rejects(
            async () => convertImageToWebp(corruptBuffer),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "Unsupported or corrupted image file");
                return true;
            }
        );
    });

    it("rejects truncated image header with 400 ApiError", async () => {
        const truncatedJpeg = Buffer.from([
            0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46
        ]);

        await assert.rejects(
            async () => convertImageToWebp(truncatedJpeg),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "Unsupported or corrupted image file");
                return true;
            }
        );
    });
});
