import express from "express";

import authenticateUser from "../../../middleware/auth.middleware.js";

import {
    createProfile,
    getMyProfile,
    updateMyProfile
} from "./profile.controller.js";

import {
    createProfileValidation,
    updateProfileValidation
} from "./profile.validation.js";


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


export default router;