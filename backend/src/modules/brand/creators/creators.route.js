import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    getDiscoverCreators,
    getDiscoverCreatorById,
    saveCreator,
    unsaveCreator,
    getSavedCreators,
    getSavedCreatorIds
} from "./creators.controller.js";
import {
    checkCreatorUnlockStatus,
    unlockCreatorContact
} from "../../subscriptions/subscription.controller.js";
import {
    validateGetDiscoverCreators,
    validateGetCreatorById
} from "./creators.validation.js";

const router = express.Router();

// Enforce authentication and brand role authorization across all creator discovery endpoints
router.use(
    authenticateUser,
    authorizeRoles("brand")
);

// GET /brand/creators/saved - Fetch saved creators shortlist for the brand
router.get(
    "/saved",
    getSavedCreators
);

// GET /brand/creators/saved/ids - Fetch array of saved creator IDs
router.get(
    "/saved/ids",
    getSavedCreatorIds
);

// POST /brand/creators/:id/save - Save creator to shortlist
router.post(
    "/:id/save",
    validateGetCreatorById,
    saveCreator
);

// DELETE /brand/creators/:id/save - Remove creator from shortlist
router.delete(
    "/:id/save",
    validateGetCreatorById,
    unsaveCreator
);

// GET /brand/creators - Search, filter, sort and paginate discoverable creators
router.get(
    "/",
    validateGetDiscoverCreators,
    getDiscoverCreators
);

// GET /brand/creators/:id - Fetch full public profile details for a specific creator
router.get(
    "/:id",
    validateGetCreatorById,
    getDiscoverCreatorById
);

// Check contact unlock status for a creator
router.get(
    "/:id/unlock-status",
    checkCreatorUnlockStatus
);

// Unlock contact details for a creator
router.post(
    "/:id/unlock",
    unlockCreatorContact
);

export default router;
