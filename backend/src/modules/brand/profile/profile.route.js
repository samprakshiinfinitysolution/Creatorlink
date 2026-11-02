import express from "express";

import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    createProfile,
    getMyProfile,
    updateMyProfile
} from "./profile.controller.js";

import {
    createProfileValidation,
    updateProfileValidation
} from "./profile.validation.js";

import {
    submitUserVerification,
    getUserVerificationStatus
} from "../../admin/verification/verification.controller.js";

import {
    validateSubmitVerificationBody
} from "../../admin/verification/verification.validation.js";

const router = express.Router();

// All brand profile APIs require authentication and brand role authorization.
router.use(
    authenticateUser,
    authorizeRoles("brand")
);

// Create brand profile.
router.post(
    "/",
    createProfileValidation,
    createProfile
);

// Get logged-in brand profile.
router.get(
    "/me",
    getMyProfile
);

// Update logged-in brand profile.
router.patch(
    "/me",
    updateProfileValidation,
    updateMyProfile
);

// Submit verification request for brand.
router.post(
    "/verification",
    validateSubmitVerificationBody,
    submitUserVerification
);

// Get verification status and history for brand.
router.get(
    "/verification",
    getUserVerificationStatus
);

export default router;
