import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import sharp from "sharp";

import cloudinary from "../../src/config/cloudinary.js";
import {
    uploadImageToCloudinary,
    uploadMultipleImagesToCloudinary
} from "../../src/utils/helpers/cloudinary.helper.js";

describe("Cloudinary Helper (uploadImageToCloudinary & uploadMultipleImagesToCloudinary)", () => {
    let originalUploadStream;

    beforeEach(() => {
        // Save the original upload_stream method before each test
        originalUploadStream = cloudinary.uploader.upload_stream;
    });

    afterEach(() => {
        // Restore original upload_stream method after each test
        cloudinary.uploader.upload_stream = originalUploadStream;
    });

    it("converts raw image to WebP, streams to Cloudinary mock, and returns url and publicId", async () => {
        let capturedOptions = null;
        let capturedStreamedBuffer = null;

        const sampleJpeg = await sharp({
            create: {
                width: 400,
                height: 300,
                channels: 3,
                background: { r: 200, g: 100, b: 50 }
            }
        })
            .jpeg()
            .toBuffer();

        // Mock Cloudinary upload_stream
        cloudinary.uploader.upload_stream = (options, callback) => {
            capturedOptions = options;
            const chunks = [];

            const writable = new Writable({
                write(chunk, encoding, next) {
                    chunks.push(chunk);
                    next();
                },
                final(done) {
                    capturedStreamedBuffer = Buffer.concat(chunks);
                    callback(null, {
                        public_id: `${options.folder}/test_asset_123`,
                        secure_url: `https://res.cloudinary.com/test-cloud/image/upload/v12345/${options.folder}/test_asset_123.webp`,
                        format: options.format || "webp"
                    });
                    done();
                }
            });

            return writable;
        };

        const result = await uploadImageToCloudinary(sampleJpeg, "creatorlink/profiles");

        // 1. Assert response structure matches exact requirements
        assert.ok(result, "Result should be defined");
        assert.equal(typeof result.url, "string");
        assert.equal(typeof result.publicId, "string");
        assert.equal(result.publicId, "creatorlink/profiles/test_asset_123");
        assert.ok(result.url.endsWith(".webp"), "URL should end with .webp");

        // 2. Assert options passed to upload_stream
        assert.ok(capturedOptions, "Options must be passed to upload_stream");
        assert.equal(capturedOptions.folder, "creatorlink/profiles");
        assert.equal(capturedOptions.resource_type, "image");
        assert.equal(capturedOptions.format, "webp");

        // 3. Assert what was streamed to Cloudinary was indeed valid WebP (not raw JPEG)
        assert.ok(capturedStreamedBuffer, "Streamed buffer must be captured");
        const streamedMetadata = await sharp(capturedStreamedBuffer).metadata();
        assert.equal(
            streamedMetadata.format,
            "webp",
            "Buffer streamed to Cloudinary must be converted WebP"
        );
    });

    it("validates input buffer and rejects invalid buffers with 400 ApiError", async () => {
        await assert.rejects(
            async () => uploadImageToCloudinary(null, "creatorlink/general"),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "Invalid image buffer provided");
                return true;
            }
        );

        await assert.rejects(
            async () => uploadImageToCloudinary(Buffer.alloc(0), "creatorlink/general"),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "Invalid image buffer provided");
                return true;
            }
        );
    });

    it("validates target folder and rejects invalid folders with 400 ApiError", async () => {
        const sampleJpeg = await sharp({
            create: { width: 100, height: 100, channels: 3, background: { r: 10, g: 10, b: 10 } }
        })
            .jpeg()
            .toBuffer();

        await assert.rejects(
            async () => uploadImageToCloudinary(sampleJpeg, ""),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "A valid upload folder must be specified");
                return true;
            }
        );

        await assert.rejects(
            async () => uploadImageToCloudinary(sampleJpeg, "   "),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "A valid upload folder must be specified");
                return true;
            }
        );
    });

    it("handles Cloudinary callback upload error safely with 500 ApiError", async () => {
        const sampleJpeg = await sharp({
            create: { width: 100, height: 100, channels: 3, background: { r: 10, g: 10, b: 10 } }
        })
            .jpeg()
            .toBuffer();

        cloudinary.uploader.upload_stream = (options, callback) => {
            const writable = new Writable({
                write(chunk, enc, next) {
                    next();
                },
                final(done) {
                    callback(new Error("Cloudinary quota exceeded"));
                    done();
                }
            });
            return writable;
        };

        await assert.rejects(
            async () => uploadImageToCloudinary(sampleJpeg, "creatorlink/general"),
            (err) => {
                assert.equal(err.statusCode, 500);
                assert.equal(err.message, "Cloudinary quota exceeded");
                return true;
            }
        );
    });

    it("handles Cloudinary stream pipe error event safely with 500 ApiError", async () => {
        const sampleJpeg = await sharp({
            create: { width: 100, height: 100, channels: 3, background: { r: 10, g: 10, b: 10 } }
        })
            .jpeg()
            .toBuffer();

        cloudinary.uploader.upload_stream = (options, callback) => {
            const writable = new Writable({
                write(chunk, enc, next) {
                    next();
                },
                final(done) {
                    writable.emit("error", new Error("Socket pipe broken"));
                    done();
                }
            });
            return writable;
        };

        await assert.rejects(
            async () => uploadImageToCloudinary(sampleJpeg, "creatorlink/general"),
            (err) => {
                assert.equal(err.statusCode, 500);
                assert.equal(err.message, "Socket pipe broken");
                return true;
            }
        );
    });

    it("handles missing secure_url in Cloudinary response with 500 ApiError", async () => {
        const sampleJpeg = await sharp({
            create: { width: 100, height: 100, channels: 3, background: { r: 10, g: 10, b: 10 } }
        })
            .jpeg()
            .toBuffer();

        cloudinary.uploader.upload_stream = (options, callback) => {
            const writable = new Writable({
                write(chunk, enc, next) {
                    next();
                },
                final(done) {
                    callback(null, { public_id: "missing_url_id" });
                    done();
                }
            });
            return writable;
        };

        await assert.rejects(
            async () => uploadImageToCloudinary(sampleJpeg, "creatorlink/general"),
            (err) => {
                assert.equal(err.statusCode, 500);
                assert.equal(
                    err.message,
                    "Cloudinary upload succeeded but no secure URL was returned"
                );
                return true;
            }
        );
    });

    it("uploads multiple images with controlled concurrency (default 3) and preserves result order", async () => {
        const bufferCount = 5;
        const buffers = [];

        for (let i = 0; i < bufferCount; i++) {
            const buf = await sharp({
                create: {
                    width: 100 + i * 20,
                    height: 100 + i * 20,
                    channels: 3,
                    background: { r: i * 40, g: 100, b: 150 }
                }
            })
                .jpeg()
                .toBuffer();
            buffers.push(buf);
        }

        let currentlyActive = 0;
        let peakConcurrency = 0;

        // Mock upload_stream with a slight async delay to measure concurrency
        cloudinary.uploader.upload_stream = (options, callback) => {
            const writable = new Writable({
                write(chunk, enc, next) {
                    next();
                },
                final(done) {
                    currentlyActive++;
                    if (currentlyActive > peakConcurrency) {
                        peakConcurrency = currentlyActive;
                    }

                    setTimeout(() => {
                        currentlyActive--;
                        const uniqueId = `multi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                        callback(null, {
                            public_id: `${options.folder}/${uniqueId}`,
                            secure_url: `https://res.cloudinary.com/test-cloud/image/upload/v123/${options.folder}/${uniqueId}.webp`
                        });
                        done();
                    }, 20);
                }
            });
            return writable;
        };

        const results = await uploadMultipleImagesToCloudinary(
            buffers,
            "creatorlink/portfolios",
            3 // Concurrency limit
        );

        assert.equal(results.length, bufferCount, "Should return result for all 5 buffers");
        assert.ok(
            peakConcurrency <= 3,
            `Peak concurrency (${peakConcurrency}) must not exceed the limit of 3`
        );

        results.forEach((res, idx) => {
            assert.ok(res.url, `Result at index ${idx} must have url`);
            assert.ok(res.publicId, `Result at index ${idx} must have publicId`);
            assert.ok(res.url.endsWith(".webp"), `Result at index ${idx} url must end with .webp`);
        });
    });

    it("validates multiple upload arguments", async () => {
        await assert.rejects(
            async () => uploadMultipleImagesToCloudinary([], "creatorlink/general"),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "An array of image buffers is required");
                return true;
            }
        );

        await assert.rejects(
            async () => uploadMultipleImagesToCloudinary("not-an-array", "creatorlink/general"),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "An array of image buffers is required");
                return true;
            }
        );

        const sampleJpeg = await sharp({
            create: { width: 50, height: 50, channels: 3, background: { r: 10, g: 10, b: 10 } }
        })
            .jpeg()
            .toBuffer();

        await assert.rejects(
            async () => uploadMultipleImagesToCloudinary([sampleJpeg, "invalid-buffer"], "creatorlink/general"),
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.equal(err.message, "Invalid image buffer at index 1");
                return true;
            }
        );
    });
});
