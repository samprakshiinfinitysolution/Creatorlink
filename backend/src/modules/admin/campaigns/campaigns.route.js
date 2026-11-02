import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    getAdminCampaigns,
    getAdminCampaignStats,
    getAdminCampaignById,
    moderateCampaignPause,
    moderateCampaignResume,
    moderateCampaignClose,
    safeDeleteAdminCampaign
} from "./campaigns.controller.js";
import {
    validateGetCampaignsQuery,
    validateCampaignIdParam,
    validateModerationPauseBody,
    validateModerationActionBody
} from "./campaigns.validation.js";

const router = express.Router();

// Strict RBAC: All Admin Campaigns routes require valid admin authentication
router.use(
    authenticateUser,
    authorizeRoles("admin")
);

// Fetches campaign moderation statistics overview
router.get(
    "/stats",
    getAdminCampaignStats
);

// Fetches paginated campaigns with multi-criteria filtering and moderation state
router.get(
    "/",
    validateGetCampaignsQuery,
    getAdminCampaigns
);

// Fetches deep campaign dossier by ID including brand profile, applicant bookings, and audit history
router.get(
    "/:id",
    validateCampaignIdParam,
    getAdminCampaignById
);

// Business Rule 2 & 3: Admin pauses campaign for moderation and places restriction
router.post(
    "/:id/pause",
    validateCampaignIdParam,
    validateModerationPauseBody,
    moderateCampaignPause
);

// Business Rule 2 & 3: Admin resumes campaign after moderation restrictions are resolved
router.post(
    "/:id/resume",
    validateCampaignIdParam,
    validateModerationActionBody,
    moderateCampaignResume
);

// Business Rule 2 & 5: Admin closes campaign when justified
router.post(
    "/:id/close",
    validateCampaignIdParam,
    validateModerationActionBody,
    moderateCampaignClose
);

// Backward-compatibility status update mapping
router.patch(
    "/:id/status",
    validateCampaignIdParam,
    async (req, res, next) => {
        const { status, moderationReason, reason } = req.body;
        req.body.reason = reason || moderationReason || "";
        if (status === "paused") {
            return moderateCampaignPause(req, res, next);
        } else if (status === "published") {
            return moderateCampaignResume(req, res, next);
        } else if (status === "closed") {
            return moderateCampaignClose(req, res, next);
        }
        return next();
    }
);

// Business Rule 6: Safe removal of campaign (with relationship checks)
router.delete(
    "/:id",
    validateCampaignIdParam,
    safeDeleteAdminCampaign
);

export default router;
