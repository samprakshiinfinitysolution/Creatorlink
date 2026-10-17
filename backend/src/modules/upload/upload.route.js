import express from "express";

import authenticateUser from "../../middleware/auth.middleware.js";
import {
    uploadSingleImage,
    uploadMultipleImages
} from "../../middleware/upload.middleware.js";
import {
    uploadSingleImageHandler,
    uploadMultipleImagesHandler
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

export default router;
