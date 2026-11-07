import mongoose from "mongoose";
import VerificationRequest from "./verification.model.js";
import Auth from "../../auth/auth.model.js";
import CreatorProfile from "../../creator/profile/profile.model.js";
import BrandProfile from "../../brand/profile/profile.model.js";
import { createNotificationService } from "../../notifications/notification.service.js";
import createApiError from "../../../utils/ApiError.js";
import { getPagination, getPaginationData } from "../../../utils/pagination.js";

/**
 * Ensures a single canonical VerificationRequest record exists for a registered Creator or Brand.
 */
export const ensureUserVerificationRecord = async (user) => {
    if (!user || !user._id || !["creator", "brand"].includes(user.role)) {
        return null;
    }

    try {
        const existing = await VerificationRequest.findOne({ user: user._id });
        if (!existing) {
            return await VerificationRequest.create({
                user: user._id,
                role: user.role,
                status: user.isVerified ? "approved" : "pending",
                createdAt: user.createdAt || new Date(),
                reviewHistory: []
            });
        }
        return existing;
    } catch (err) {
        if (err.code !== 11000) {
            console.error("ensureUserVerificationRecord error:", err);
        }
        return await VerificationRequest.findOne({ user: user._id });
    }
};

/**
 * Fetches a paginated list of verification requests for the admin queue.
 * Automatically synchronizes all registered creators and brands from Auth so every user is reviewable,
 * resolves duplicate entries, and applies role, status, and search filters.
 */
export const getAdminVerificationsService = async (queryParams) => {
    // 1. Auto-sync and deduplicate registered Creator and Brand users from Auth
    try {
        const allRegisteredUsers = await Auth.find({
            role: { $in: ["creator", "brand"] }
        }).select("_id role isVerified name email avatar createdAt").lean();

        if (allRegisteredUsers.length > 0) {
            const registeredUserIds = allRegisteredUsers.map((u) => u._id);
            const registeredUserIdSet = new Set(allRegisteredUsers.map((u) => u._id.toString()));

            // Purge orphaned verification requests whose user no longer exists in Auth
            await VerificationRequest.deleteMany({
                $or: [
                    { user: null },
                    { user: { $nin: registeredUserIds } }
                ]
            });

            // Fetch current valid requests
            const allExistingRequests = await VerificationRequest.find({
                user: { $in: registeredUserIds }
            }).sort({ createdAt: -1 });

            // Group requests by user ID to detect and resolve duplicates
            const requestMap = new Map();
            const duplicateIdsToDelete = [];

            for (const req of allExistingRequests) {
                const uIdStr = req.user.toString();
                if (!requestMap.has(uIdStr)) {
                    requestMap.set(uIdStr, req);
                } else {
                    // Duplicate found: keep the first (most authoritative) or approved one, discard extra
                    const kept = requestMap.get(uIdStr);
                    if (req.status === "approved" && kept.status !== "approved") {
                        duplicateIdsToDelete.push(kept._id);
                        requestMap.set(uIdStr, req);
                    } else {
                        duplicateIdsToDelete.push(req._id);
                    }
                }
            }

            if (duplicateIdsToDelete.length > 0) {
                await VerificationRequest.deleteMany({ _id: { $in: duplicateIdsToDelete } });
            }

            // Sync verification status for existing users (if Auth is verified, request must be approved)
            for (const u of allRegisteredUsers) {
                const existing = requestMap.get(u._id.toString());
                if (existing && u.isVerified && existing.status !== "approved") {
                    await VerificationRequest.findByIdAndUpdate(existing._id, { status: "approved" });
                    existing.status = "approved";
                }
            }

            // Create canonical verification request for any user missing one
            const missingUsers = allRegisteredUsers.filter(
                (u) => !requestMap.has(u._id.toString())
            );

            if (missingUsers.length > 0) {
                const newRecords = missingUsers.map((u) => ({
                    user: u._id,
                    role: u.role,
                    documentType: "profile_verification",
                    documentNumber: "",
                    documentUrls: [],
                    notes: "Auto-synced registered user account",
                    status: u.isVerified ? "approved" : "pending",
                    createdAt: u.createdAt || new Date(),
                    reviewHistory: []
                }));
                await VerificationRequest.insertMany(newRecords, { ordered: false });
            }
        }
    } catch (syncErr) {
        console.error("Auto-sync verification queue error:", syncErr);
    }

    const {
        page = 1,
        limit = 10,
        role = "all",
        status = "all",
        sortBy = "newest",
        search = ""
    } = queryParams;

    const { page: currentPage, limit: parsedLimit, skip } = getPagination(page, limit);

    const filter = {
        user: { $ne: null }
    };

    // Filter by role
    if (role && role !== "all") {
        filter.role = role.toLowerCase();
    }

    // Filter by status
    if (status && status !== "all") {
        filter.status = status.toLowerCase();
    }

    // Search by user name or email in Auth collection
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
        const searchRegex = new RegExp(trimmedSearch, "i");
        const matchingUsers = await Auth.find({
            role: { $in: ["creator", "brand"] },
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        }).select("_id").lean();

        const matchingUserIds = matchingUsers.map((u) => u._id);
        filter.user = { $in: matchingUserIds };
    }

    const sortOrder = sortBy.toLowerCase() === "oldest" ? 1 : -1;

    const [requests, totalItems] = await Promise.all([
        VerificationRequest.find(filter)
            .populate("user", "name email role isVerified avatar createdAt")
            .populate("reviewedBy", "name email role avatar")
            .populate("reviewHistory.reviewedBy", "name email role avatar")
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(parsedLimit)
            .lean(),
        VerificationRequest.countDocuments(filter)
    ]);

    // Attach profile snippets for fast queue rendering
    const enrichedRequests = await Promise.all(
        requests.map(async (req) => {
            let profileData = null;
            if (req.role === "creator" && req.user?._id) {
                profileData = await CreatorProfile.findOne({ user: req.user._id })
                    .select("category title bio profileImage location followerCount isVerifiedBadge")
                    .lean();
            } else if (req.role === "brand" && req.user?._id) {
                profileData = await BrandProfile.findOne({ user: req.user._id })
                    .select("companyName industry description website logo location isVerifiedBusiness")
                    .lean();
            }
            return {
                ...req,
                profile: profileData
            };
        })
    );

    const pagination = getPaginationData(currentPage, parsedLimit, totalItems);

    return {
        verifications: enrichedRequests,
        pagination
    };
};

/**
 * Fetches complete dossier and full decision history for a single verification request by ID.
 */
export const getAdminVerificationByIdService = async (id) => {
    const request = await VerificationRequest.findById(id)
        .populate("user", "name email role isVerified avatar createdAt")
        .populate("reviewedBy", "name email role avatar")
        .populate("reviewHistory.reviewedBy", "name email role avatar")
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
 * Approves a verification request, activates verified badge across Auth and Profiles,
 * appends a permanent "approved" entry to review history, and notifies the account owner.
 */
export const approveVerificationService = async (id, adminId, reason = "") => {
    const request = await VerificationRequest.findById(id);

    if (!request) {
        throw createApiError(404, "Verification request not found");
    }

    const previousStatus = request.status || "pending";
    const cleanReason = (reason && typeof reason === "string" && reason.trim())
        ? reason.trim()
        : "";

    const decisionTimestamp = new Date();

    // Update verification request state
    request.status = "approved";
    request.reviewedBy = adminId;
    request.reviewedAt = decisionTimestamp;
    request.rejectionReason = null;
    if (cleanReason) {
        request.notes = cleanReason;
    }

    // Append permanent decision history entry
    if (!Array.isArray(request.reviewHistory)) {
        request.reviewHistory = [];
    }
    request.reviewHistory.push({
        reviewedBy: adminId,
        action: "approved",
        previousStatus,
        newStatus: "approved",
        reason: cleanReason || "Verification approved and verified badge activated.",
        reviewedAt: decisionTimestamp
    });

    await request.save();

    // Persist verified badge on Auth and specific Profile collection
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

    // Dispatch persistent and realtime notification to applicant
    try {
        await createNotificationService({
            recipient: request.user,
            sender: adminId,
            type: "verification_approved",
            title: "Verification Approved!",
            message:
                request.role === "creator"
                    ? `Congratulations! Your creator profile verification has been approved.${cleanReason ? ` Note: ${cleanReason}` : " Your verified badge is now active."}`
                    : `Congratulations! Your brand business verification has been approved.${cleanReason ? ` Note: ${cleanReason}` : ""}`,
            entityType: "verification",
            entityId: request._id,
            destination: request.role === "creator" ? "/creator/profile" : "/brand/profile",
            metadata: {
                action: "approved",
                status: "approved",
                reviewer: adminId,
                reviewedAt: decisionTimestamp,
                reason: cleanReason || null
            }
        });
    } catch (notifErr) {
        console.error("Failed to dispatch verification approval notification:", notifErr);
    }

    return request;
};

/**
 * Rejects a pending verification request, keeps badge inactive,
 * appends a permanent "rejected" entry to review history, and notifies the account owner with the reason.
 */
export const rejectVerificationService = async (id, adminId, rejectionReason) => {
    const request = await VerificationRequest.findById(id);

    if (!request) {
        throw createApiError(404, "Verification request not found");
    }

    const previousStatus = request.status || "pending";
    const cleanReason = (rejectionReason && typeof rejectionReason === "string" && rejectionReason.trim())
        ? rejectionReason.trim()
        : "Verification request rejected by administrator.";

    const decisionTimestamp = new Date();

    // Update verification request state
    request.status = "rejected";
    request.reviewedBy = adminId;
    request.reviewedAt = decisionTimestamp;
    request.rejectionReason = cleanReason;

    // Append permanent decision history entry
    if (!Array.isArray(request.reviewHistory)) {
        request.reviewHistory = [];
    }
    request.reviewHistory.push({
        reviewedBy: adminId,
        action: "rejected",
        previousStatus,
        newStatus: "rejected",
        reason: cleanReason,
        reviewedAt: decisionTimestamp
    });

    await request.save();

    // Ensure verified badge is disabled
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

    // Dispatch persistent and realtime notification to applicant
    try {
        await createNotificationService({
            recipient: request.user,
            sender: adminId,
            type: "verification_rejected",
            title: "Verification Request Rejected",
            message: `Your verification request was rejected. Reason: ${cleanReason}`,
            entityType: "verification",
            entityId: request._id,
            destination: request.role === "creator" ? "/creator/profile" : "/brand/profile",
            metadata: {
                action: "rejected",
                status: "rejected",
                reviewer: adminId,
                reviewedAt: decisionTimestamp,
                rejectionReason: cleanReason
            }
        });
    } catch (notifErr) {
        console.error("Failed to dispatch verification rejection notification:", notifErr);
    }

    return request;
};

/**
 * Revokes a previously approved verification, deactivates badge across Auth and Profiles,
 * appends a permanent "revoked" entry to review history, and notifies the account owner with the reason.
 */
export const revokeVerificationService = async (id, adminId, reason) => {
    const request = await VerificationRequest.findById(id);

    if (!request) {
        throw createApiError(404, "Verification request not found");
    }

    const previousStatus = request.status || "approved";
    const cleanReason = (reason && typeof reason === "string" && reason.trim())
        ? reason.trim()
        : "Verification status revoked by administrator.";

    const decisionTimestamp = new Date();

    // Update verification request state
    request.status = "rejected";
    request.reviewedBy = adminId;
    request.reviewedAt = decisionTimestamp;
    request.rejectionReason = cleanReason;

    // Append permanent decision history entry with action 'revoked'
    if (!Array.isArray(request.reviewHistory)) {
        request.reviewHistory = [];
    }
    request.reviewHistory.push({
        reviewedBy: adminId,
        action: "revoked",
        previousStatus,
        newStatus: "rejected",
        reason: cleanReason,
        reviewedAt: decisionTimestamp
    });

    await request.save();

    // Deactivate verified badges
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

    // Dispatch persistent and realtime notification to applicant
    try {
        await createNotificationService({
            recipient: request.user,
            sender: adminId,
            type: "verification_revoked",
            title: "Verification Status Revoked",
            message: `Your verified status has been revoked by an administrator. Reason: ${cleanReason}`,
            entityType: "verification",
            entityId: request._id,
            destination: request.role === "creator" ? "/creator/profile" : "/brand/profile",
            metadata: {
                action: "revoked",
                status: "rejected",
                reviewer: adminId,
                reviewedAt: decisionTimestamp,
                reason: cleanReason
            }
        });
    } catch (notifErr) {
        console.error("Failed to dispatch verification revocation notification:", notifErr);
    }

    return request;
};

/**
 * Submits or updates a verification request on behalf of the authenticated Creator or Brand.
 * No document upload is required.
 */
export const submitUserVerificationService = async (userId, role, data = {}) => {
    let existing = await VerificationRequest.findOne({ user: userId });

    if (existing && existing.status === "pending") {
        throw createApiError(
            400,
            "You already have a pending verification request currently under review."
        );
    }

    if (existing) {
        existing.status = "pending";
        existing.role = role;
        existing.notes = data.notes ? data.notes.trim() : "";
        existing.rejectionReason = null;
        await existing.save();
        return existing;
    }

    const newRequest = await VerificationRequest.create({
        user: userId,
        role,
        documentType: data.documentType || "profile_verification",
        documentNumber: data.documentNumber ? data.documentNumber.trim() : "",
        documentUrls: Array.isArray(data.documentUrls) ? data.documentUrls : [],
        notes: data.notes ? data.notes.trim() : "",
        status: "pending",
        reviewHistory: []
    });

    return newRequest;
};

/**
 * Fetches the current verification status and decision history for the authenticated user.
 */
export const getUserVerificationStatusService = async (userId) => {
    const request = await VerificationRequest.findOne({ user: userId })
        .populate("reviewedBy", "name email role")
        .populate("reviewHistory.reviewedBy", "name email role")
        .lean();

    return {
        current: request,
        history: request?.reviewHistory || []
    };
};
