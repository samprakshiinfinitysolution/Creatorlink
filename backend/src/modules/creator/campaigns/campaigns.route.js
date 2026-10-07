import express from "express";

import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";

import {
    getDiscoverCampaigns,
    getDiscoverCampaignById,
    getAppliedCampaigns,
    getAppliedCampaignById
} from "./campaigns.controller.js";

import {
    validateGetDiscoverCampaigns,
    validateGetAppliedCampaignsQuery
} from "./campaigns.validation.js";


const router = express.Router();


// All creator campaign APIs require authentication
// and creator role authorization.
router.use(
    authenticateUser,
    authorizeRoles("creator")
);


// Get published campaigns for creator discovery.
router.get(
    "/",
    validateGetDiscoverCampaigns,
    getDiscoverCampaigns
);


// Get list of campaigns applied to by the authenticated creator through Booking.
// Note: Placed before /:id to prevent route parameter collisions.
router.get(
    "/applied",
    validateGetAppliedCampaignsQuery,
    getAppliedCampaigns
);


// Get single applied campaign detail by booking ID for creator.
// Note: Placed before /:id to prevent route parameter collisions.
router.get(
    "/applied/:id",
    getAppliedCampaignById
);


// Get single published campaign details by ID.
router.get(
    "/:id",
    getDiscoverCampaignById
);


export default router;
