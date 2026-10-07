import express from "express";

import authenticateUser from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
    getCreatorWorkspaces,
    getCreatorWorkspaceById,
    submitCreatorWorkspaceWork,
    getBrandWorkspaces,
    getBrandWorkspaceById,
    reviewBrandWorkspace
} from "./workspace.controller.js";

import {
    validateCreatorSubmission,
    validateBrandReview,
    validateGetWorkspacesQuery
} from "./workspace.validation.js";

// =========================================================
// CREATOR WORKSPACE ROUTER
// =========================================================
const creatorWorkspaceRouter = express.Router();

creatorWorkspaceRouter.use(
    authenticateUser,
    authorizeRoles("creator")
);

// Creator fetches their workspaces list.
creatorWorkspaceRouter.get(
    "/",
    validateGetWorkspacesQuery,
    getCreatorWorkspaces
);

// Creator fetches single workspace by ID.
creatorWorkspaceRouter.get(
    "/:id",
    getCreatorWorkspaceById
);

// Creator submits work / deliverables.
creatorWorkspaceRouter.post(
    "/:id/submit",
    validateCreatorSubmission,
    submitCreatorWorkspaceWork
);

// =========================================================
// BRAND WORKSPACE ROUTER
// =========================================================
const brandWorkspaceRouter = express.Router();

brandWorkspaceRouter.use(
    authenticateUser,
    authorizeRoles("brand")
);

// Brand fetches their workspaces list.
brandWorkspaceRouter.get(
    "/",
    validateGetWorkspacesQuery,
    getBrandWorkspaces
);

// Brand fetches single workspace by ID.
brandWorkspaceRouter.get(
    "/:id",
    getBrandWorkspaceById
);

// Brand reviews workspace submission (approve / request revision).
brandWorkspaceRouter.post(
    "/:id/review",
    validateBrandReview,
    reviewBrandWorkspace
);

export {
    creatorWorkspaceRouter,
    brandWorkspaceRouter
};
