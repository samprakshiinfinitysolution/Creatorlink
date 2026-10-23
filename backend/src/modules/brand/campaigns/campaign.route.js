import express from "express";

import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";

import {
    createCampaign,
    getMyCampaigns,
    getCampaignById,
    updateCampaign
} from "./campaign.controller.js";

import {
    validateCreateCampaign,
    validateUpdateCampaign
} from "./campaign.validation.js";


const router = express.Router();


// All campaign APIs require authentication
// and brand role authorization.
router.use(
    authenticateUser,
    authorizeRoles("brand")
);


// Create campaign.
router.post(
    "/",
    validateCreateCampaign,
    createCampaign
);


// Get all campaigns of logged-in brand.
router.get(
    "/",
    getMyCampaigns
);


// Get one campaign.
router.get(
    "/:id",
    getCampaignById
);


// Update campaign.
router.patch(
    "/:id",
    validateUpdateCampaign,
    updateCampaign
);


export default router;