import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    getDiscoverCreators,
    getDiscoverCreatorById
} from "./creators.controller.js";
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

export default router;
