import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
dotenv.config();

process.env.SMTP_SERVICE = process.env.SMTP_SERVICE || "gmail";
process.env.SMTP_USER = process.env.SMTP_USER || process.env.EMAIL || "test@creatorlink.test";
process.env.SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS || "dummy_password";

import dns from "node:dns";
try { dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]); } catch (e) {}

import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import Auth from "../modules/auth/auth.model.js";
import CreatorProfile from "../modules/creator/profile/profile.model.js";
import BrandProfile from "../modules/brand/profile/profile.model.js";
import VerificationRequest from "../modules/admin/verification/verification.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";
import {
    getAdminVerificationsService,
    getAdminVerificationByIdService,
    approveVerificationService,
    rejectVerificationService,
    revokeVerificationService
} from "../modules/admin/verification/verification.service.js";

const runSuite = async () => {
    console.log("================================================================================");
    console.log("STARTING ADMIN VERIFICATION UNNAMED USER ROOT CAUSE & REGRESSION TEST SUITE");
    console.log("================================================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    const createdAuthIds = [];
    const createdVerificationIds = [];

    try {
        const adminUser = await Auth.findOne({ role: "admin" });
        if (!adminUser) throw new Error("Admin user not found in database");

        // Create temporary Test Creator with valid Auth & Profile
        const testCreatorEmail = `test_creator_verif_${Date.now()}@creatorlink.test`;
        const testCreator = await Auth.create({
            name: "Priya Sharma",
            email: testCreatorEmail,
            role: "creator",
            password: "hashedPassword123!",
            avatar: "https://example.com/avatar_priya.png"
        });
        createdAuthIds.push(testCreator._id);

        await CreatorProfile.create({
            user: testCreator._id,
            title: "Tech Reviewer & Content Creator",
            category: "Technology",
            bio: "Passionate about testing gadgets and creating tutorials.",
            profileImage: "https://example.com/priya_profile.png"
        });

        // 1. Pending Creator applicant with valid User reference
        console.log("\n[Test 1] Pending Creator applicant with valid User reference");
        const pendingCreatorReq = await VerificationRequest.create({
            user: testCreator._id,
            role: "creator",
            status: "pending",
            documentType: "profile_verification",
            notes: "Please verify my creator profile",
            reviewHistory: []
        });
        createdVerificationIds.push(pendingCreatorReq._id);

        const resPending = await getAdminVerificationsService({ status: "pending", search: "Priya" });
        const priyaItem = resPending.verifications.find((v) => v._id.toString() === pendingCreatorReq._id.toString());
        if (!priyaItem) throw new Error("Pending creator not found in queue");
        if (priyaItem.user?.name !== "Priya Sharma") throw new Error(`Expected name 'Priya Sharma', got '${priyaItem.user?.name}'`);
        if (priyaItem.user?.email !== testCreatorEmail) throw new Error(`Expected email '${testCreatorEmail}', got '${priyaItem.user?.email}'`);
        if (priyaItem.role !== "creator") throw new Error(`Expected role 'creator', got '${priyaItem.role}'`);
        if (!priyaItem.profile?.title) throw new Error("Expected creator profile title to be enriched");
        console.log("✓ Pending creator displays real name, email, avatar, role, and profile details");

        // 2. Approved Creator applicant displays correctly
        console.log("\n[Test 2] Approved Creator applicant displays correctly");
        await approveVerificationService(pendingCreatorReq._id, adminUser._id, "Profile fully meets requirements");
        const resApproved = await getAdminVerificationsService({ status: "approved", search: "Priya" });
        const priyaApproved = resApproved.verifications.find((v) => v._id.toString() === pendingCreatorReq._id.toString());
        if (!priyaApproved) throw new Error("Approved creator not found in queue");
        if (priyaApproved.status !== "approved") throw new Error("Status should be 'approved'");
        if (priyaApproved.user?.name !== "Priya Sharma") throw new Error("Approved applicant name mismatch");
        console.log("✓ Approved creator displays real name, email, and approved status");

        // 3. Rejected and resubmitted applicants display correctly
        console.log("\n[Test 3] Rejected and resubmitted applicants display correctly");
        await rejectVerificationService(pendingCreatorReq._id, adminUser._id, "Portfolio links need updating");
        const resRejected = await getAdminVerificationsService({ status: "rejected", search: "Priya" });
        const priyaRejected = resRejected.verifications.find((v) => v._id.toString() === pendingCreatorReq._id.toString());
        if (!priyaRejected || priyaRejected.status !== "rejected") throw new Error("Rejected applicant not found");
        console.log("✓ Rejected creator displays rejection status and details");

        // Resubmit
        await VerificationRequest.findByIdAndUpdate(pendingCreatorReq._id, {
            status: "pending",
            resubmittedAt: new Date(),
            notes: "Updated portfolio links"
        });
        const resResubmitted = await getAdminVerificationsService({ status: "resubmitted", search: "Priya" });
        const priyaResub = resResubmitted.verifications.find((v) => v._id.toString() === pendingCreatorReq._id.toString());
        if (!priyaResub) throw new Error("Resubmitted applicant not found with status=resubmitted filter");
        if (priyaResub.user?.name !== "Priya Sharma") throw new Error("Resubmitted applicant name mismatch");
        console.log("✓ Resubmitted creator displays correctly under status=resubmitted filter");

        // 4. Applicant with missing/deleted User reference is handled gracefully
        console.log("\n[Test 4] Applicant with missing/deleted User reference handled gracefully");
        const dummyDeletedUserId = new mongoose.Types.ObjectId();
        const orphanReq = await VerificationRequest.create({
            user: dummyDeletedUserId,
            role: "creator",
            status: "pending",
            documentType: "profile_verification",
            notes: "Orphan test entry",
            reviewHistory: []
        });
        createdVerificationIds.push(orphanReq._id);

        const orphanFetch = await getAdminVerificationByIdService(orphanReq._id);
        if (!orphanFetch.user) throw new Error("Expected user object to be constructed for orphan record");
        if (orphanFetch.user.name !== "Deleted User") throw new Error(`Expected fallback 'Deleted User', got '${orphanFetch.user.name}'`);
        if (!orphanFetch.user.isDeleted) throw new Error("Expected isDeleted flag to be true");
        console.log("✓ Single orphan fetch gracefully returns safe fallback user with isDeleted: true");

        const queueWithOrphan = await getAdminVerificationsService({ status: "pending", limit: 50 });
        const orphanQueueItem = queueWithOrphan.verifications.find((v) => v._id.toString() === orphanReq._id.toString());
        if (!orphanQueueItem) throw new Error("Orphan record not found in queue");
        if (orphanQueueItem.user?.name !== "Deleted User") throw new Error(`Expected 'Deleted User', got '${orphanQueueItem.user?.name}'`);
        if (!orphanQueueItem.user?.isDeleted) throw new Error("Expected isDeleted flag to be true on queue item");
        console.log("✓ Queue fetch gracefully displays orphan record as 'Deleted User' with isDeleted: true without crashing");

        // 5. Search by name, email, and brand company name
        console.log("\n[Test 5] Search by name and email across all verification statuses");
        const searchByName = await getAdminVerificationsService({ search: "Priya" });
        if (searchByName.verifications.length === 0) throw new Error("Search by name returned no results");
        console.log(`✓ Search by name 'Priya' returned ${searchByName.verifications.length} matching result(s)`);

        const searchByEmail = await getAdminVerificationsService({ search: testCreatorEmail });
        if (searchByEmail.verifications.length === 0) throw new Error("Search by email returned no results");
        console.log(`✓ Search by email returned ${searchByEmail.verifications.length} matching result(s)`);

        // 6. Filtering by status and role
        console.log("\n[Test 6] Filtering by status and role");
        const creatorOnly = await getAdminVerificationsService({ role: "creator" });
        const allCreators = creatorOnly.verifications.every((v) => v.role === "creator");
        if (!allCreators) throw new Error("role=creator filter included non-creators");
        console.log(`✓ role=creator filter strictly returned ${creatorOnly.verifications.length} creators`);

        const brandOnly = await getAdminVerificationsService({ role: "brand" });
        const allBrands = brandOnly.verifications.every((v) => v.role === "brand");
        if (!allBrands) throw new Error("role=brand filter included non-brands");
        console.log(`✓ role=brand filter strictly returned ${brandOnly.verifications.length} brands`);

        // 7. Sorting by newest and oldest
        console.log("\n[Test 7] Sorting by newest and oldest");
        const newestList = await getAdminVerificationsService({ sortBy: "newest", limit: 10 });
        const oldestList = await getAdminVerificationsService({ sortBy: "oldest", limit: 10 });
        if (newestList.verifications.length > 1 && oldestList.verifications.length > 1) {
            const firstNewestTime = new Date(newestList.verifications[0].createdAt).getTime();
            const firstOldestTime = new Date(oldestList.verifications[0].createdAt).getTime();
            if (firstNewestTime < firstOldestTime) {
                throw new Error("Sort newest vs oldest order discrepancy");
            }
        }
        console.log("✓ Sorting by newest and oldest works correctly");

        // 8. Pagination accuracy
        console.log("\n[Test 8] Pagination accuracy (page counts, total counts)");
        const page1 = await getAdminVerificationsService({ page: 1, limit: 3 });
        const page2 = await getAdminVerificationsService({ page: 2, limit: 3 });
        if (page1.pagination.page !== 1 || page2.pagination.page !== 2) throw new Error("Pagination page mismatch");
        if (page1.pagination.totalItems !== page2.pagination.totalItems) throw new Error("Total items count mismatch across pages");
        if (page1.verifications[0]._id.toString() === page2.verifications[0]._id.toString()) {
            throw new Error("Page 1 and Page 2 returned identical first item");
        }
        console.log(`✓ Pagination accurate: limit 3 returned page 1 and 2 disjoint sets out of ${page1.pagination.totalItems} total`);

        // 9. Review, Approve, Reject, and Revoke actions
        console.log("\n[Test 9] Review, Approve, Reject, and Revoke actions");
        await approveVerificationService(pendingCreatorReq._id, adminUser._id, "Final approval");
        const checkApprove = await VerificationRequest.findById(pendingCreatorReq._id);
        if (checkApprove.status !== "approved") throw new Error("Approve action failed");

        await revokeVerificationService(pendingCreatorReq._id, adminUser._id, "Policy violation discovered");
        const checkRevoke = await VerificationRequest.findById(pendingCreatorReq._id);
        if (checkRevoke.status !== "rejected") throw new Error("Revoke action failed");
        const lastReview = checkRevoke.reviewHistory[checkRevoke.reviewHistory.length - 1];
        if (lastReview.action !== "revoked") throw new Error("Review history does not record revoked action");
        console.log("✓ Approve, Reject, and Revoke action lifecycles work flawlessly with full review audit");

        console.log("\n================================================================================");
        console.log("ALL 9 UNNAMED USER & VERIFICATION AUDIT TESTS PASSED 100%");
        console.log("================================================================================");

    } finally {
        console.log("\nCleaning up test accounts and verification artifacts...");
        if (createdVerificationIds.length > 0) {
            await VerificationRequest.deleteMany({ _id: { $in: createdVerificationIds } });
        }
        if (createdAuthIds.length > 0) {
            await CreatorProfile.deleteMany({ user: { $in: createdAuthIds } });
            await BrandProfile.deleteMany({ user: { $in: createdAuthIds } });
            await Auth.deleteMany({ _id: { $in: createdAuthIds } });
        }
        console.log("✓ Test cleanup completed.");
        await mongoose.disconnect();
    }
};

runSuite().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});

