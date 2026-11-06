import mongoose from "mongoose";
import VerificationRequest from "./verification.model.js";
import Auth from "../../auth/auth.model.js";
import CreatorProfile from "../../creator/profile/profile.model.js";
import BrandProfile from "../../brand/profile/profile.model.js";
import { createNotificationService } from "../../notifications/notification.service.js";
import createApiError from "../../../utils/ApiError.js";
import { getPagination, getPaginationData } from "../../../utils/pagination.js";

/**
 * Fetches a paginated list of verification requests for the admin queue.
 */
export const getAdminVerificationsService = async (queryParams) => {
    const {
        page = 1,
        limit = 10,
        role = "all",
        status = "all",
        sortBy = "newest",
        search = ""
    } = queryParams;

    const filter = {};

    // Filter by role
    if (role && role !== "all") {
        filter.role = role.toLowerCase();
    }

    // Filter by status
    if (status && status !== "all") {
        filter.status = status.toLowerCase();
    }

    // Search by user name or email, or documentNumber
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
        const searchRegex = new RegExp(trimmedSearch, "i");
        const matchingUsers = await Auth.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        }).select("_id");

        const matchingUserIds = matchingUsers.map((u) => u._id);

        filter.$or = [
            { user: { $in: matchingUserIds } },
            { documentNumber: searchRegex }
        ];
    }

    const { skip, limit: parsedLimit } = getPagination(page, limit);
    const sortOrder = sortBy.toLowerCase() === "oldest" ? 1 : -1;

    const [requests, totalItems] = await Promise.all([
        VerificationRequest.find(filter)
            .populate("user", "name email role isVerified avatar createdAt")
            .populate("reviewedBy", "name email role")
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(parsedLimit)
            .lean(),
        VerificationRequest.countDocuments(filter)
    ]);

    // Attach profile summary for quick administrative context
    const enrichedRequests = await Promise.all(
        requests.map(async (req) => {
            let profileData = null;
            if (req.role === "creator" && req.user?._id) {
                profileData = await CreatorProfile.findOne({ user: req.user._id })
                    .select("category profileImage location followerCount isVerifiedBadge")
                    .lean();
            } else if (req.role === "brand" && req.user?._id) {
                profileData = await BrandProfile.findOne({ user: req.user._id })
                    .select("companyName industry logo location isVerifiedBusiness")
                    .lean();
            }
            return {
                ...req,
                profile: profileData
            };
        })
    );

    const pagination = getPaginationData(totalItems, page, parsedLimit);

    return {
        verifications: enrichedRequests,
        pagination
    };
};

/**
 * Fetches complete dossier for a single verification request by ID.
 */
export const getAdminVerificationByIdService = async (id) => {
    const request = await VerificationRequest.findById(id)
        .populate("user", "name email role isVerified avatar createdAt")
        .populate("reviewedBy", "name email role")
        .lean();

    if (!request) {
        throw createApiError(404, "Verification request not found");
    }

    let profile = null;
    if (request.role === "creator" && request.user?._id) {
        profile = await CreatorProfile.findOne({ user: request.user._id }).lean();
    } else if (request.role === "brand" && request.user?._id) {
        profile = await BrandProfile.findOne({ user: request.user._id }).lean();
    }

    return {
        ...request,
        profile
    };
};

/**
 * Approves a verification request, updates profile verification badge, and dispatches notification.
 */
export const approveVerificationService = async (id, adminId) => {
    const request = await VerificationRequest.findById(id);

    if (!request) {
        throw createApiError(404, "Verification request not found");
    }

    if (request.status !== "pending") {
        throw createApiError(
            400,
            `Cannot approve request with status '${request.status}'. Only pending requests can be approved.`
        );
    }

    // Update verification request
    request.status = "approved";
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.rejectionReason = null;
    await request.save();

    // Activate profile badge consistency
    await Auth.findByIdAndUpdate(request.user, { isVerified: true });
    if (request.role === "creator") {
        await CreatorProfile.findOneAndUpdate(
            { user: request.user },
            { isVerifiedBadge: true }
        );
    } else if (request.role === "brand") {
        await BrandProfile.findOneAndUpdate(
            { user: request.user },
            { isVerifiedBusiness: true }
        );
    }

    // Dispatch notification to applicant
    try {
        await createNotificationService({
            recipient: request.user,
            sender: adminId,
            type: "verification_approved",
            title: "Verification Approved!",
            message:
                request.role === "creator"
                    ? "Congratulations! Your creator profile verification has been approved. Your verified badge is now active."
                    : "Congratulations! Your brand business verification has been approved.",
            entityType: "verification",
            entityId: request._id,
            destination: request.role === "creator" ? "/creator/profile" : "/brand/profile"
        });
    } catch (notifErr) {
        console.error("Failed to dispatch verification approval notification:", notifErr);
    }

    return request;
};

/**
 * Rejects a verification request with mandatory justification and dispatches notification.
 */
export const rejectVerificationService = async (id, adminId, rejectionReason) => {
    const request = await VerificationRequest.findById(id);

    if (!request) {
        throw createApiError(404, "Verification request not found");
    }

    if (request.status !== "pending") {
        throw createApiError(
            400,
            `Cannot reject request with status '${request.status}'. Only pending requests can be rejected.`
        );
    }

    // Update verification request
    request.status = "rejected";
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason.trim();
    await request.save();

    // Ensure badge remains inactive
    await Auth.findByIdAndUpdate(request.user, { isVerified: false });
    if (request.role === "creator") {
        await CreatorProfile.findOneAndUpdate(
            { user: request.user },
            { isVerifiedBadge: false }
        );
    } else if (request.role === "brand") {
        await BrandProfile.findOneAndUpdate(
            { user: request.user },
            { isVerifiedBusiness: false }
        );
    }

    // Dispatch notification to applicant
    try {
        await createNotificationService({
            recipient: request.user,
            sender: adminId,
            type: "verification_rejected",
            title: "Verification Request Rejected",
            message: `Your verification request was rejected. Reason: ${rejectionReason.trim()}`,
            entityType: "verification",
            entityId: request._id,
            destination: request.role === "creator" ? "/creator/profile" : "/brand/profile"
        });
    } catch (notifErr) {
        console.error("Failed to dispatch verification rejection notification:", notifErr);
    }

    return request;
};

/**
 * Submits a new verification request on behalf of the authenticated Creator or Brand.
 */
export const submitUserVerificationService = async (userId, role, data) => {
    // Check if there is already a pending verification request
    const existingPending = await VerificationRequest.findOne({
        user: userId,
        status: "pending"
    });

    if (existingPending) {
        throw createApiError(
            400,
            "You already have a pending verification request currently under administrative review."
        );
    }

    const newRequest = await VerificationRequest.create({
        user: userId,
        role,
        documentType: data.documentType,
        documentNumber: data.documentNumber ? data.documentNumber.trim() : "",
        documentUrls: data.documentUrls,
        notes: data.notes ? data.notes.trim() : "",
        status: "pending"
    });

    return newRequest;
};

/**
 * Fetches the current verification status and history for the authenticated user.
 */
export const getUserVerificationStatusService = async (userId) => {
    const [latest, history] = await Promise.all([
        VerificationRequest.findOne({ user: userId }).sort({ createdAt: -1 }),
        VerificationRequest.find({ user: userId })
            .sort({ createdAt: -1 })
            .select("-documentNumber")
            .lean()
    ]);

    return {
        current: latest,
        history
    };
};
