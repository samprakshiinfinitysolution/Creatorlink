import mongoose from "mongoose";
import Review from "./reviews.model.js";
import Workspace from "../workspace/workspace.model.js";
import createApiError from "../../utils/ApiError.js";
import {
    getPagination,
    getPaginationData
} from "../../utils/pagination.js";

// Brand submits a review for a completed workspace
const createBrandReviewService = async (brandId, payload) => {
    const targetWorkspaceId = payload.workspaceId || payload.workspace;
    const { rating, comment } = payload;

    const workspace = await Workspace.findById(targetWorkspaceId);
    if (!workspace) {
        throw createApiError(
            404,
            "Workspace not found"
        );
    }

    // Verify brand ownership of the workspace
    if (workspace.brand.toString() !== brandId.toString()) {
        throw createApiError(
            403,
            "You are not authorized to submit a review for this workspace"
        );
    }

    // Verify workspace completion
    if (workspace.status !== "completed") {
        throw createApiError(
            400,
            "Reviews can only be submitted for completed collaborations"
        );
    }

    // Verify user has not already submitted a review for this workspace
    const existingReview = await Review.findOne({
        workspace: workspace._id,
        reviewer: brandId
    });
    if (existingReview) {
        throw createApiError(
            400,
            "You have already submitted a review for this workspace"
        );
    }

    // Create review using trusted workspace relationships and authenticated reviewer ID
    const newReview = new Review({
        workspace: workspace._id,
        booking: workspace.booking,
        campaign: workspace.campaign,
        reviewer: brandId,
        reviewee: workspace.creator,
        rating: Number(rating),
        comment: comment ? String(comment).trim() : ""
    });

    try {
        await newReview.save();
    } catch (error) {
        if (error.code === 11000) {
            throw createApiError(
                400,
                "You have already submitted a review for this workspace"
            );
        }
        throw error;
    }

    const populatedReview = await Review.findById(newReview._id)
        .populate({
            path: "reviewer",
            select: "name role"
        })
        .populate({
            path: "reviewee",
            select: "name role"
        })
        .populate({
            path: "campaign",
            select: "title"
        })
        .populate({
            path: "workspace",
            select: "status agreedPrice currency"
        });

    return populatedReview;
};

// Brand fetches reviews submitted by them
const getBrandReviewsService = async (brandId, query = {}) => {
    const { page, limit } = query;
    const { page: currentPage, limit: itemsPerPage, skip } = getPagination(page, limit);

    const filter = { reviewer: brandId };

    const totalReviews = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage)
        .populate({
            path: "reviewee",
            select: "name role"
        })
        .populate({
            path: "campaign",
            select: "title"
        })
        .populate({
            path: "workspace",
            select: "status agreedPrice currency"
        });

    const pagination = getPaginationData(currentPage, itemsPerPage, totalReviews);

    return {
        reviews,
        pagination
    };
};

// Creator fetches reviews received by them
const getCreatorReviewsService = async (creatorId, query = {}) => {
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
        throw createApiError(
            400,
            "Invalid Creator ID format"
        );
    }

    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);

    const { page, limit } = query;
    const { page: currentPage, limit: itemsPerPage, skip } = getPagination(page, limit);

    const filter = { reviewee: creatorObjectId };

    const totalReviews = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage)
        .populate({
            path: "reviewer",
            select: "name role"
        })
        .populate({
            path: "campaign",
            select: "title"
        })
        .populate({
            path: "workspace",
            select: "status agreedPrice currency"
        });

    // Calculate average rating for creator
    let averageRating = 0;
    if (totalReviews > 0) {
        const stats = await Review.aggregate([
            { $match: { reviewee: creatorObjectId } },
            { $group: { _id: "$reviewee", avgRating: { $avg: "$rating" } } }
        ]);
        if (stats.length > 0 && stats[0].avgRating) {
            averageRating = Number(stats[0].avgRating.toFixed(1));
        }
    }

    const pagination = getPaginationData(currentPage, itemsPerPage, totalReviews);

    return {
        reviews,
        stats: {
            totalReviews,
            averageRating
        },
        pagination
    };
};

// Fetch review details for a specific workspace (checking user authorization)
const getWorkspaceReviewService = async (workspaceId, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        throw createApiError(
            404,
            "Workspace not found"
        );
    }

    const isBrand = workspace.brand.toString() === userId.toString();
    const isCreator = workspace.creator.toString() === userId.toString();

    if (!isBrand && !isCreator) {
        throw createApiError(
            403,
            "You do not have permission to view reviews for this workspace"
        );
    }

    // Find the review submitted for this workspace by the requesting user, or all reviews for this workspace
    const review = await Review.findOne({
        workspace: workspaceId,
        reviewer: userId
    })
        .populate({
            path: "reviewer",
            select: "name role"
        })
        .populate({
            path: "reviewee",
            select: "name role"
        })
        .populate({
            path: "campaign",
            select: "title"
        })
        .populate({
            path: "workspace",
            select: "status agreedPrice currency"
        });

    return review;
};

export {
    createBrandReviewService,
    getBrandReviewsService,
    getCreatorReviewsService,
    getWorkspaceReviewService
};
