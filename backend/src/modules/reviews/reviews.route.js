import express from "express";

import authenticateUser from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
    createBrandReview,
    getBrandReviews,
    getCreatorReviews,
    getWorkspaceReview
} from "./reviews.controller.js";

import {
    validateCreateReview,
    validateGetReviewsQuery,
    validateWorkspaceIdParam
} from "./reviews.validation.js";

// =========================================================
// BRAND REVIEW ROUTER
// =========================================================
const brandReviewRouter = express.Router();

brandReviewRouter.use(
    authenticateUser,
    authorizeRoles("brand")
);

// Brand creates a review for a completed workspace
brandReviewRouter.post(
    "/",
    validateCreateReview,
    createBrandReview
);

// Brand fetches list of reviews submitted by them
brandReviewRouter.get(
    "/",
    validateGetReviewsQuery,
    getBrandReviews
);

// Brand fetches review details for a specific workspace
brandReviewRouter.get(
    "/workspace/:workspaceId",
    validateWorkspaceIdParam,
    getWorkspaceReview
);

// =========================================================
// CREATOR REVIEW ROUTER
// =========================================================
const creatorReviewRouter = express.Router();

creatorReviewRouter.use(
    authenticateUser,
    authorizeRoles("creator")
);

// Creator fetches list of reviews received by them
creatorReviewRouter.get(
    "/",
    validateGetReviewsQuery,
    getCreatorReviews
);

// Creator fetches review details for a specific workspace
creatorReviewRouter.get(
    "/workspace/:workspaceId",
    validateWorkspaceIdParam,
    getWorkspaceReview
);

export {
    brandReviewRouter,
    creatorReviewRouter
};
