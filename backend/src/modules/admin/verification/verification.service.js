import mongoose from "mongoose";
import VerificationRequest from "./verification.model.js";
import Auth from "../../auth/auth.model.js";
import CreatorProfile from "../../creator/profile/profile.model.js";
import BrandProfile from "../../brand/profile/profile.model.js";
import { createNotificationService, notifyAdminsSafe } from "../../notifications/notification.service.js";
import { emitVerificationEventToUser, emitVerificationEventToAdmins } from "../../../socket/socket.js";
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
                status: "pending",
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
 * Fetches a paginated list of verification requests for the admin queue (strictly read-only).
 * Applies role, status, search, and sorting filters without mutating database records.
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
        if (status.toLowerCase() === "resubmitted") {
            // Must be pending and have been resubmitted (either resubmittedAt is populated OR reviewHistory has prior reviews)
            filter.status = "pending";
            filter.$or = [
                { resubmittedAt: { $ne: null } },
                { "reviewHistory.0": { $exists: true } }
            ];
        } else {
            filter.status = status.toLowerCase();
        }
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
    const sortCriteria = status && status.toLowerCase() === "resubmitted"
        ? { resubmittedAt: sortOrder, updatedAt: sortOrder, createdAt: sortOrder }
        : { createdAt: sortOrder };

    const [requests, totalItems] = await Promise.all([
        VerificationRequest.find(filter)
            .populate("user", "name email role isVerified avatar createdAt")
            .populate("reviewedBy", "name email role avatar")
            .populate("reviewHistory.reviewedBy", "name email role avatar")
            .sort(sortCriteria)
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

    // Persist verified badge on specific Profile collection (Auth.isVerified remains independent email verification)
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

        // Notify peer admins about this approval (excluding the acting reviewer admin)
        const reviewer = await Auth.findById(adminId).select("name email role").lean();
        const reviewerName = reviewer?.name || "Administrator";
        const applicant = await Auth.findById(request.user).select("name email role").lean();
        const applicantName = applicant?.name || (request.role === "creator" ? "Creator" : "Brand");
        const roleLabel = request.role === "creator" ? "Creator" : "Brand";

        await notifyAdminsSafe({
            sender: adminId,
            type: "verification_approved",
            title: "Verification Approved",
            message: `${reviewerName} approved verification for ${applicantName} (${roleLabel}).`,
            entityType: "verification",
            entityId: request._id,
            destination: `/admin/verification?id=${request._id}`,
            metadata: {
                action: "approved",
                applicantId: request.user,
                reviewerId: adminId,
                role: request.role
            },
            idempotencyKey: `peer_verif_approved_${request._id}_${decisionTimestamp.getTime()}`
        }, { excludeAdminId: adminId });
    } catch (notifErr) {
        console.error("Failed to dispatch verification approval notification:", notifErr);
    }

    // Emit real-time verification status change to applicant and queue update to admins
    try {
        const reviewer = await Auth.findById(adminId).select("name email role").lean();
        const reviewerName = reviewer?.name || "Administrator";
        emitVerificationEventToUser(request.user, "verification:status_changed", {
            status: "approved",
            effectiveStatus: "approved",
            reason: cleanReason || null,
            isVerifiedBadge: true,
            reviewedAt: decisionTimestamp,
            reviewerName,
            role: request.role,
            request: request.toObject ? request.toObject() : request
        });
        emitVerificationEventToAdmins("verification:queue_updated", {
            action: "approved",
            requestId: request._id,
            request: request.toObject ? request.toObject() : request
        });
    } catch (socketErr) {
        console.error("Failed to emit approval verification socket events:", socketErr);
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
    const cleanReason = (rejectionReason && typeof rejectionReason === "string")
        ? rejectionReason.trim()
        : "";

    if (!cleanReason || cleanReason.length < 3) {
        throw createApiError(400, "A rejection reason of at least 3 characters is required");
    }

    if (cleanReason.length > 1000) {
        throw createApiError(400, "Rejection reason cannot exceed 1000 characters");
    }

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

    // Ensure verified badge is disabled on Profile (Auth.isVerified remains independent email verification)
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

        // Notify peer admins about this rejection (excluding the acting reviewer admin)
        const reviewer = await Auth.findById(adminId).select("name email role").lean();
        const reviewerName = reviewer?.name || "Administrator";
        const applicant = await Auth.findById(request.user).select("name email role").lean();
        const applicantName = applicant?.name || (request.role === "creator" ? "Creator" : "Brand");

        await notifyAdminsSafe({
            sender: adminId,
            type: "verification_rejected",
            title: "Verification Rejected",
            message: `${reviewerName} rejected verification for ${applicantName}. Reason: ${cleanReason}`,
            entityType: "verification",
            entityId: request._id,
            destination: `/admin/verification?id=${request._id}`,
            metadata: {
                action: "rejected",
                applicantId: request.user,
                reviewerId: adminId,
                role: request.role,
                reason: cleanReason
            },
            idempotencyKey: `peer_verif_rejected_${request._id}_${decisionTimestamp.getTime()}`
        }, { excludeAdminId: adminId });
    } catch (notifErr) {
        console.error("Failed to dispatch verification rejection notification:", notifErr);
    }

    // Emit real-time verification status change to applicant and queue update to admins
    try {
        const reviewer = await Auth.findById(adminId).select("name email role").lean();
        const reviewerName = reviewer?.name || "Administrator";
        emitVerificationEventToUser(request.user, "verification:status_changed", {
            status: "rejected",
            effectiveStatus: "rejected",
            reason: cleanReason,
            isVerifiedBadge: false,
            reviewedAt: decisionTimestamp,
            reviewerName,
            role: request.role,
            request: request.toObject ? request.toObject() : request
        });
        emitVerificationEventToAdmins("verification:queue_updated", {
            action: "rejected",
            requestId: request._id,
            request: request.toObject ? request.toObject() : request
        });
    } catch (socketErr) {
        console.error("Failed to emit rejection verification socket events:", socketErr);
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
    const cleanReason = (reason && typeof reason === "string")
        ? reason.trim()
        : "";

    if (!cleanReason || cleanReason.length < 3) {
        throw createApiError(400, "A reason of at least 3 characters is required to revoke verification status");
    }

    if (cleanReason.length > 1000) {
        throw createApiError(400, "Revocation reason cannot exceed 1000 characters");
    }

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

    // Deactivate verified badges on Profile (Auth.isVerified remains independent email verification)
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

        // Notify peer admins about this revocation (excluding the acting reviewer admin)
        const reviewer = await Auth.findById(adminId).select("name email role").lean();
        const reviewerName = reviewer?.name || "Administrator";
        const applicant = await Auth.findById(request.user).select("name email role").lean();
        const applicantName = applicant?.name || (request.role === "creator" ? "Creator" : "Brand");

        await notifyAdminsSafe({
            sender: adminId,
            type: "verification_revoked",
            title: "Verification Status Revoked",
            message: `${reviewerName} revoked verified status for ${applicantName}. Reason: ${cleanReason}`,
            entityType: "verification",
            entityId: request._id,
            destination: `/admin/verification?id=${request._id}`,
            metadata: {
                action: "revoked",
                applicantId: request.user,
                reviewerId: adminId,
                role: request.role,
                reason: cleanReason
            },
            idempotencyKey: `peer_verif_revoked_${request._id}_${decisionTimestamp.getTime()}`
        }, { excludeAdminId: adminId });
    } catch (notifErr) {
        console.error("Failed to dispatch verification revocation notification:", notifErr);
    }

    // Emit real-time verification status change to applicant and queue update to admins
    try {
        const reviewer = await Auth.findById(adminId).select("name email role").lean();
        const reviewerName = reviewer?.name || "Administrator";
        emitVerificationEventToUser(request.user, "verification:status_changed", {
            status: "rejected",
            effectiveStatus: "revoked",
            reason: cleanReason,
            isVerifiedBadge: false,
            reviewedAt: decisionTimestamp,
            reviewerName,
            role: request.role,
            request: request.toObject ? request.toObject() : request
        });
        emitVerificationEventToAdmins("verification:queue_updated", {
            action: "revoked",
            requestId: request._id,
            request: request.toObject ? request.toObject() : request
        });
    } catch (socketErr) {
        console.error("Failed to emit revocation verification socket events:", socketErr);
    }

    return request;
};

/**
 * Submits or updates a verification request on behalf of the authenticated Creator or Brand.
 * No document upload is required.
 */
export const submitUserVerificationService = async (userId, role, data = {}) => {
    let existing = await VerificationRequest.findOne({ user: userId });

    if (existing) {
        if (existing.status === "pending") {
            throw createApiError(
                400,
                "You already have a pending verification request currently under review."
            );
        }

        if (existing.status === "approved") {
            throw createApiError(
                400,
                "Your account is already officially verified. Re-submission is not allowed."
            );
        }
    }

    const now = new Date();

    if (existing) {
        const isResubmission =
            existing.status !== "pending" ||
            (Array.isArray(existing.reviewHistory) && existing.reviewHistory.length > 0) ||
            Boolean(existing.resubmittedAt);

        existing.status = "pending";
        existing.role = role;
        existing.notes = data.notes ? data.notes.trim() : "";
        existing.rejectionReason = null;

        if (isResubmission) {
            existing.resubmittedAt = now;
            if (!Array.isArray(existing.resubmissionHistory)) {
                existing.resubmissionHistory = [];
            }
            existing.resubmissionHistory.push({
                resubmittedAt: now,
                notes: data.notes ? data.notes.trim() : ""
            });
        }

        await existing.save();

        // Dispatch persistent notification & Socket.IO event to all Administrators on resubmission
        if (isResubmission) {
            try {
                const applicant = await Auth.findById(userId).select("name email role").lean();
                const applicantName = applicant?.name || (role === "creator" ? "Creator" : "Brand");
                const roleLabel = role === "creator" ? "Creator" : "Brand";

                const admins = await Auth.find({ role: "admin" }).select("_id").lean();

                for (const admin of admins) {
                    await createNotificationService({
                        recipient: admin._id,
                        sender: userId,
                        type: "verification_resubmitted",
                        title: "Verification Re-submitted",
                        message: `${applicantName} (${roleLabel}) has re-submitted their verification application for administrative review.`,
                        entityType: "verification",
                        entityId: existing._id,
                        destination: `/admin/verification?id=${existing._id}`,
                        metadata: {
                            action: "resubmitted",
                            userId: userId,
                            role: role,
                            resubmittedAt: now
                        },
                        idempotencyKey: `verif_resubmit_${existing._id}_${now.getTime()}_${admin._id}`
                    });
                }
            } catch (notifErr) {
                console.error("Failed to dispatch admin notification for verification resubmission:", notifErr);
            }
        }

        // Emit real-time verification event to admins (queue update) and applicant
        try {
            const enrichedRequest = await VerificationRequest.findById(existing._id)
                .populate("user", "name email role isVerified avatar createdAt")
                .populate("reviewedBy", "name email role avatar")
                .populate("reviewHistory.reviewedBy", "name email role avatar")
                .lean();

            emitVerificationEventToAdmins("verification:queue_updated", {
                action: isResubmission ? "resubmitted" : "updated",
                requestId: existing._id,
                request: enrichedRequest || existing
            });

            emitVerificationEventToUser(userId, "verification:status_changed", {
                status: "pending",
                effectiveStatus: "pending",
                resubmittedAt: now,
                isVerifiedBadge: false,
                role,
                request: enrichedRequest || existing
            });
        } catch (socketErr) {
            console.error("Failed to emit resubmission verification socket events:", socketErr);
        }

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

    // Dispatch persistent notification & Socket.IO event to all Administrators for first-time submission
    try {
        const applicant = await Auth.findById(userId).select("name email role").lean();
        const applicantName = applicant?.name || (role === "creator" ? "Creator" : "Brand");
        const roleLabel = role === "creator" ? "Creator" : "Brand";

        const admins = await Auth.find({ role: "admin" }).select("_id").lean();

        for (const admin of admins) {
            await createNotificationService({
                recipient: admin._id,
                sender: userId,
                type: "verification_submitted",
                title: "New Verification Request",
                message: `${applicantName} (${roleLabel}) has submitted a new verification application for administrative review.`,
                entityType: "verification",
                entityId: newRequest._id,
                destination: `/admin/verification?id=${newRequest._id}`,
                metadata: {
                    action: "submitted",
                    userId: userId,
                    role: role,
                    submittedAt: new Date()
                },
                idempotencyKey: `verif_submit_${newRequest._id}_${admin._id}`
            });
        }
    } catch (notifErr) {
        console.error("Failed to dispatch admin notification for new verification submission:", notifErr);
    }

    // Emit real-time verification event to admins (new submission in queue) and applicant
    try {
        const enrichedNew = await VerificationRequest.findById(newRequest._id)
            .populate("user", "name email role isVerified avatar createdAt")
            .lean();

        emitVerificationEventToAdmins("verification:queue_updated", {
            action: "submitted",
            requestId: newRequest._id,
            request: enrichedNew || newRequest
        });

        emitVerificationEventToUser(userId, "verification:status_changed", {
            status: "pending",
            effectiveStatus: "pending",
            isVerifiedBadge: false,
            role,
            request: enrichedNew || newRequest
        });
    } catch (socketErr) {
        console.error("Failed to emit new submission verification socket events:", socketErr);
    }

    return newRequest;
};

/**
 * Fetches the current verification status and decision history for the authenticated user.
 */
export const getUserVerificationStatusService = async (userId) => {
    let request = await VerificationRequest.findOne({ user: userId })
        .populate("reviewedBy", "name email role avatar")
        .populate("reviewHistory.reviewedBy", "name email role avatar")
        .lean();

    if (!request) {
        const user = await Auth.findById(userId).select("_id role isVerified createdAt");
        if (user && ["creator", "brand"].includes(user.role)) {
            await ensureUserVerificationRecord(user);
            request = await VerificationRequest.findOne({ user: userId })
                .populate("reviewedBy", "name email role avatar")
                .populate("reviewHistory.reviewedBy", "name email role avatar")
                .lean();
        }
    }

    const history = Array.isArray(request?.reviewHistory) ? request.reviewHistory : [];
    const latestHistory = history.length > 0 ? history[history.length - 1] : null;
    const latestAction = latestHistory?.action || (request?.status === "approved" ? "approved" : request?.status === "rejected" ? "rejected" : "pending");

    // Differentiate between rejected vs revoked:
    // If request.status is "rejected" and the latest historical action was "revoked", effective status is "revoked".
    let effectiveStatus = "pending";
    if (request?.status === "approved") {
        effectiveStatus = "approved";
    } else if (request?.status === "rejected") {
        effectiveStatus = latestAction === "revoked" ? "revoked" : "rejected";
    }

    // Determine current authoritative reason:
    // If approved: no rejection reason. Any note is in request.notes.
    // If rejected or revoked: rejectionReason from request or latest history reason.
    const effectiveReason = effectiveStatus === "approved"
        ? (request?.notes || null)
        : (effectiveStatus === "rejected" || effectiveStatus === "revoked")
        ? (request?.rejectionReason || latestHistory?.reason || "Verification not approved by administrator.")
        : null;

    const reviewDate = request?.reviewedAt || latestHistory?.reviewedAt || null;
    const reviewerName = request?.reviewedBy?.name || latestHistory?.reviewedBy?.name || "Administrator";

    return {
        current: request,
        status: effectiveStatus,
        rawStatus: request?.status || "pending",
        reason: effectiveReason,
        reviewedAt: reviewDate,
        reviewerName,
        latestDecision: latestHistory,
        history,
        resubmittedAt: request?.resubmittedAt || null
    };
};
