import multer from "multer";

import createApiError from "../utils/ApiError.js";

// Allowed MIME types for image uploads.
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

// Maximum allowed file size: 5 MB in bytes.
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maximum allowed files for multiple upload.
const MAX_MULTIPLE_FILES = 10;

// Store uploaded files in memory as Buffers for Cloudinary streaming.
const storage = multer.memoryStorage();

// Validate file type before accepting the upload.
const fileFilter = (req, file, cb) => {
    if (file && ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
    } else {
        cb(
            createApiError(
                400,
                "Only JPEG, PNG, and WEBP image files are allowed"
            ),
            false
        );
    }
};

// Configure Multer instance.
const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter
});

// Middleware for a single image upload from the 'image' form field.
const uploadSingleImage = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next(
                        createApiError(
                            400,
                            "File size must not exceed 5 MB"
                        )
                    );
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return next(
                        createApiError(
                            400,
                            "Unexpected field. Please upload a single image using the 'image' field"
                        )
                    );
                }
                return next(createApiError(400, err.message));
            }
            return next(err);
        }
        next();
    });
};

// Middleware for multiple images upload from the 'images' form field (max 10 files).
const uploadMultipleImages = (req, res, next) => {
    upload.array("images", MAX_MULTIPLE_FILES)(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next(
                        createApiError(
                            400,
                            "File size must not exceed 5 MB per file"
                        )
                    );
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
                    return next(
                        createApiError(
                            400,
                            `Maximum ${MAX_MULTIPLE_FILES} images allowed per request using the 'images' field`
                        )
                    );
                }
                return next(createApiError(400, err.message));
            }
            return next(err);
        }
        next();
    });
};

// Allowed MIME types for video uploads.
const ALLOWED_VIDEO_MIME_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime"
];

// Maximum allowed video file size: 50 MB in bytes.
const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024;

// Validate video file type before accepting the upload.
const videoFileFilter = (req, file, cb) => {
    if (file && ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
    } else {
        cb(
            createApiError(
                400,
                "Only MP4, WebM, and MOV video files are allowed"
            ),
            false
        );
    }
};

// Configure Multer video upload instance.
const uploadVideo = multer({
    storage,
    limits: {
        fileSize: MAX_VIDEO_FILE_SIZE
    },
    fileFilter: videoFileFilter
});

// Middleware for a single video upload from the 'video' form field.
const uploadSingleVideo = (req, res, next) => {
    uploadVideo.single("video")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next(
                        createApiError(
                            400,
                            "File size must not exceed 50 MB"
                        )
                    );
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return next(
                        createApiError(
                            400,
                            "Unexpected field. Please upload a single video using the 'video' field"
                        )
                    );
                }
                return next(createApiError(400, err.message));
            }
            return next(err);
        }
        next();
    });
};

export {
    uploadSingleImage,
    uploadMultipleImages,
    uploadSingleVideo,
    upload,
    uploadVideo
};
export default uploadSingleImage;
