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


const router = express.Router();


// All brand profile APIs require authentication
// and brand role authorization.
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


export default router;