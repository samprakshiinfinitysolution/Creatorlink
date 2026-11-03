import express from "express";

import authenticateUser from "../../../middleware/auth.middleware.js";

import {
    createProfile,
    getMyProfile,
    updateMyProfile,
    getContactPrivacy,
    updateContactPrivacy
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

// All creator profile APIs require authentication.
router.use(authenticateUser);

// Create creator profile.
router.post(
    "/",
    createProfileValidation,
    createProfile
);

// Get logged-in creator profile.
router.get(
    "/me",
    getMyProfile
);

// Update logged-in creator profile.
router.patch(
    "/me",
    updateProfileValidation,
    updateMyProfile
);

// Creator contact privacy & direct sharing consent settings.
router.get(
    "/contact-privacy",
    getContactPrivacy
);

router.put(
    "/contact-privacy",
    updateContactPrivacy
);

// Submit verification request for creator.
router.post(
    "/verification",
    validateSubmitVerificationBody,
    submitUserVerification
);

// Get verification status and history for creator.
router.get(
    "/verification",
    getUserVerificationStatus
);

export default router;
