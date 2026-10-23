import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";

import {
    createBrandReviewService,
    getBrandReviewsService,
    getCreatorReviewsService,
    getWorkspaceReviewService
} from "./reviews.service.js";

// Brand creates a review for a completed workspace collaboration
const createBrandReview = asyncHandler(async (req, res) => {
    const result = await createBrandReviewService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        201,
        "Review submitted successfully",
        result
    );
});

// Brand fetches list of reviews they have submitted
const getBrandReviews = asyncHandler(async (req, res) => {
    const result = await getBrandReviewsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Brand reviews fetched successfully",
        result
    );
});

// Creator fetches list of reviews they have received
const getCreatorReviews = asyncHandler(async (req, res) => {
    const result = await getCreatorReviewsService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Creator reviews fetched successfully",
        result
    );
});

// Authenticated user fetches review details for a specific workspace
const getWorkspaceReview = asyncHandler(async (req, res) => {
    const result = await getWorkspaceReviewService(
        req.params.workspaceId,
        req.user.userId
    );

    return sendResponse(
        res,
        200,
        "Workspace review fetched successfully",
        result
    );
});

export {
    createBrandReview,
    getBrandReviews,
    getCreatorReviews,
    getWorkspaceReview
};
