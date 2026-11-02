import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    getAdminCollaborationsStats,
    getAdminCollaborations,
    getAdminCollaborationById,
    overrideCollaborationStatus,
    extendCollaborationDeadline
} from "./collaborations.controller.js";
import {
    validateGetCollaborationsQuery,
    validateCollaborationIdParam,
    validateOverrideStatusBody,
    validateExtendDeadlineBody
} from "./collaborations.validation.js";

const router = express.Router();

// Strict RBAC: All Admin Collaborations routes require valid admin authentication
router.use(
    authenticateUser,
    authorizeRoles("admin")
);

// Fetches overall collaboration and workspace metrics
router.get(
    "/stats",
    getAdminCollaborationsStats
);

// Fetches paginated collaborations with search and filters
router.get(
    "/",
    validateGetCollaborationsQuery,
    getAdminCollaborations
);

// Fetches deep collaboration workspace dossier by ID
router.get(
    "/:id",
    validateCollaborationIdParam,
    getAdminCollaborationById
);

// Administratively overrides collaboration status
router.patch(
    "/:id/status",
    validateCollaborationIdParam,
    validateOverrideStatusBody,
    overrideCollaborationStatus
);

// Administratively extends collaboration deadline
router.patch(
    "/:id/extend-deadline",
    validateCollaborationIdParam,
    validateExtendDeadlineBody,
    extendCollaborationDeadline
);

export default router;

