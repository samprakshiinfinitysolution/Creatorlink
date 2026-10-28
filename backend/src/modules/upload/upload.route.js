import express from "express";

import authenticateUser from "../../middleware/auth.middleware.js";
import {
    uploadSingleImage,
    uploadMultipleImages,
    uploadSingleVideo
} from "../../middleware/upload.middleware.js";
import {
    uploadSingleImageHandler,
    uploadMultipleImagesHandler,
    uploadSingleVideoHandler
} from "./upload.controller.js";

const router = express.Router();

// All upload routes require authentication.
router.use(authenticateUser);

// Upload a single image (form field 'image').
router.post(
    "/image",
    uploadSingleImage,
    uploadSingleImageHandler
);

// Upload multiple images (form field 'images', max 10).
router.post(
    "/images",
    uploadMultipleImages,
    uploadMultipleImagesHandler
);

// Upload a single video (form field 'video').
router.post(
    "/video",
    uploadSingleVideo,
    uploadSingleVideoHandler
);

export default router;
