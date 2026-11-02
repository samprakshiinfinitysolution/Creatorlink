import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import appRouter from "../routes/index.js";
import Auth from "../modules/auth/auth.model.js";
import CreatorProfile from "../modules/creator/profile/profile.model.js";
import BrandProfile from "../modules/brand/profile/profile.model.js";
import VerificationRequest from "../modules/admin/verification/verification.model.js";
import Notification from "../modules/notifications/notification.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

dotenv.config();

const runTest = async () => {
    console.log("=======================================================");
    console.log("STARTING ADMIN VERIFICATION MANAGEMENT INTEGRATION TEST");
    console.log("=======================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB Connected");

    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api", appRouter);

    // Global error handler
    app.use((err, req, res, next) => {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            statusCode,
            message: err.message
        });
    });

    const server = app.listen(0);
    const port = server.address().port;
    const adminVerificationsUrl = `http://localhost:${port}/api/admin/verifications`;
    const creatorVerificationUrl = `http://localhost:${port}/api/creator/profile/verification`;
    const brandVerificationUrl = `http://localhost:${port}/api/brand/profile/verification`;

    let createdCreatorReqId = null;
    let createdBrandReqId = null;

    try {
        // Fetch test users
        const adminUser = await Auth.findOne({ role: "admin" });
        const creatorUser = await Auth.findOne({ role: "creator" });
        const brandUser = await Auth.findOne({ role: "brand" });

        if (!adminUser || !creatorUser || !brandUser) {
            throw new Error("Missing admin, creator, or brand in database for testing");
        }

        // Clean up any stale requests for test users before starting
        await VerificationRequest.deleteMany({
            user: { $in: [creatorUser._id, brandUser._id] }
        });

        // Ensure creator profile exists for test creator
        let creatorProf = await CreatorProfile.findOne({ user: creatorUser._id });
        if (!creatorProf) {
            creatorProf = await CreatorProfile.create({
                user: creatorUser._id,
                bio: "Test creator profile",
                category: "Technology",
                isVerifiedBadge: false
            });
        }

        // Ensure brand profile exists for test brand
        let brandProf = await BrandProfile.findOne({ user: brandUser._id });
        if (!brandProf) {
            brandProf = await BrandProfile.create({
                user: brandUser._id,
                companyName: "Test Brand Co",
                industry: "SaaS",
                isVerifiedBusiness: false
            });
        }

        const adminToken = generateAccessToken({
            userId: adminUser._id.toString(),
            role: "admin",
            tokenVersion: adminUser.passwordVersion || 0
        });

        const creatorToken = generateAccessToken({
            userId: creatorUser._id.toString(),
            role: "creator",
            tokenVersion: creatorUser.passwordVersion || 0
        });

        const brandToken = generateAccessToken({
            userId: brandUser._id.toString(),
            role: "brand",
            tokenVersion: brandUser.passwordVersion || 0
        });

        // TEST 1: Unauthenticated request to Admin verification queue -> 401
        console.log("\n[Test 1] Unauthenticated request to /api/admin/verifications");
        const resUnauth = await fetch(adminVerificationsUrl);
        const dataUnauth = await resUnauth.json();
        console.log(`Status: ${resUnauth.status} (Expected 401) - ${dataUnauth.message}`);
        if (resUnauth.status !== 401) throw new Error("Expected 401 for unauthenticated request");
        console.log("✓ Unauthenticated access correctly blocked with 401");

        // TEST 2: Unauthorized request by Creator -> 403
        console.log("\n[Test 2] Creator role accessing /api/admin/verifications");
        const resCreatorForbidden = await fetch(adminVerificationsUrl, {
            headers: { Cookie: `accessToken=${creatorToken}` }
        });
        const dataCreatorForbidden = await resCreatorForbidden.json();
        console.log(`Status: ${resCreatorForbidden.status} (Expected 403) - ${dataCreatorForbidden.message}`);
        if (resCreatorForbidden.status !== 403) throw new Error("Expected 403 for creator on admin endpoint");
        console.log("✓ Creator RBAC correctly blocked with 403");

        // TEST 3: Admin access to verification queue -> 200
        console.log("\n[Test 3] Admin accessing /api/admin/verifications");
        const resAdminQueue = await fetch(adminVerificationsUrl, {
            headers: { Cookie: `accessToken=${adminToken}` }
        });
        const queueJson = await resAdminQueue.json();
        console.log(`Status: ${resAdminQueue.status} (Expected 200)`);
        if (resAdminQueue.status !== 200 || !queueJson.data) throw new Error("Expected 200 for admin verification queue");
        console.log(`✓ Admin queue fetched successfully (${queueJson.data.verifications.length} items)`);

        // TEST 4: Creator submits verification request -> 201
        console.log("\n[Test 4] Creator submits verification request via POST /api/creator/profile/verification");
        const resSubmitCreator = await fetch(creatorVerificationUrl, {
            method: "POST",
            headers: {
                Cookie: `accessToken=${creatorToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                documentType: "passport",
                documentNumber: "PASS-998877",
                documentUrls: ["https://res.cloudinary.com/demo/image/upload/sample_passport.jpg"],
                notes: "Applying for verified creator badge"
            })
        });
        const submitCreatorJson = await resSubmitCreator.json();
        console.log(`Status: ${resSubmitCreator.status} (Expected 201)`);
        if (resSubmitCreator.status !== 201 || !submitCreatorJson.data?._id) {
            console.error("Submission failed:", submitCreatorJson);
            throw new Error("Failed to submit creator verification request");
        }
        createdCreatorReqId = submitCreatorJson.data._id;
        console.log(`✓ Creator verification request submitted: ${createdCreatorReqId}`);

        // TEST 5: Duplicate pending submission prevention -> 400
        console.log("\n[Test 5] Duplicate pending verification request prevention");
        const resDuplicate = await fetch(creatorVerificationUrl, {
            method: "POST",
            headers: {
                Cookie: `accessToken=${creatorToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                documentType: "national_id",
                documentUrls: ["https://res.cloudinary.com/demo/image/upload/sample_id.jpg"]
            })
        });
        const dupJson = await resDuplicate.json();
        console.log(`Status: ${resDuplicate.status} (Expected 400) - ${dupJson.message}`);
        if (resDuplicate.status !== 400) throw new Error("Expected 400 for duplicate pending submission");
        console.log("✓ Duplicate pending request correctly rejected with 400");

        // TEST 6: Admin gets verification request details by ID -> 200
        console.log(`\n[Test 6] Admin gets details for request ${createdCreatorReqId}`);
        const resDetail = await fetch(`${adminVerificationsUrl}/${createdCreatorReqId}`, {
            headers: { Cookie: `accessToken=${adminToken}` }
        });
        const detailJson = await resDetail.json();
        console.log(`Status: ${resDetail.status} (Expected 200)`);
        if (resDetail.status !== 200 || !detailJson.data) throw new Error("Expected 200 for detail endpoint");
        console.log(`✓ Details fetched for applicant ${detailJson.data.user?.name || detailJson.data.user?.fullName}, role: ${detailJson.data.role}`);

        // TEST 7: Admin approves verification request -> 200
        console.log(`\n[Test 7] Admin approves request ${createdCreatorReqId}`);
        const resApprove = await fetch(`${adminVerificationsUrl}/${createdCreatorReqId}/approve`, {
            method: "PATCH",
            headers: { Cookie: `accessToken=${adminToken}` }
        });
        const approveJson = await resApprove.json();
        console.log(`Status: ${resApprove.status} (Expected 200)`);
        if (resApprove.status !== 200 || approveJson.data.status !== "approved") {
            throw new Error("Expected 200 and status 'approved'");
        }
        console.log("✓ Request approved successfully");

        // TEST 8: Verify profile badge is active in MongoDB
        console.log("\n[Test 8] Check CreatorProfile.isVerifiedBadge in database");
        const updatedProfile = await CreatorProfile.findOne({ user: creatorUser._id });
        console.log(`CreatorProfile.isVerifiedBadge: ${updatedProfile?.isVerifiedBadge}`);
        if (!updatedProfile || updatedProfile.isVerifiedBadge !== true) {
            throw new Error("CreatorProfile.isVerifiedBadge should be true");
        }
        console.log("✓ Profile badge is now active (isVerifiedBadge: true)");

        // TEST 9: Verify Notification created for approval
        console.log("\n[Test 9] Check notification created for verification approval");
        const approvalNotif = await Notification.findOne({
            recipient: creatorUser._id,
            entityType: "verification",
            entityId: createdCreatorReqId
        });
        if (!approvalNotif) throw new Error("Expected approval notification in database");
        console.log(`✓ Notification created: "${approvalNotif.title}" - "${approvalNotif.message}"`);

        // TEST 10: Brand submits verification request -> 201
        console.log("\n[Test 10] Brand submits verification request via POST /api/brand/profile/verification");
        const resSubmitBrand = await fetch(brandVerificationUrl, {
            method: "POST",
            headers: {
                Cookie: `accessToken=${brandToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                documentType: "business_registration",
                documentNumber: "BR-443322",
                documentUrls: ["https://res.cloudinary.com/demo/image/upload/sample_reg.pdf"],
                notes: "Official company business registration certification"
            })
        });
        const submitBrandJson = await resSubmitBrand.json();
        console.log(`Status: ${resSubmitBrand.status} (Expected 201)`);
        if (resSubmitBrand.status !== 201 || !submitBrandJson.data?._id) {
            throw new Error("Failed to submit brand verification request");
        }
        createdBrandReqId = submitBrandJson.data._id;
        console.log(`✓ Brand verification request submitted: ${createdBrandReqId}`);

        // TEST 11: Admin rejects brand verification request with justification -> 200
        console.log(`\n[Test 11] Admin rejects brand request ${createdBrandReqId} with justification`);
        const rejectionReason = "Document image is blurry and registration date is unreadable.";
        const resReject = await fetch(`${adminVerificationsUrl}/${createdBrandReqId}/reject`, {
            method: "PATCH",
            headers: {
                Cookie: `accessToken=${adminToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ rejectionReason })
        });
        const rejectJson = await resReject.json();
        console.log(`Status: ${resReject.status} (Expected 200)`);
        if (resReject.status !== 200 || rejectJson.data.status !== "rejected") {
            throw new Error("Expected 200 and status 'rejected'");
        }
        if (rejectJson.data.rejectionReason !== rejectionReason) {
            throw new Error("Rejection reason was not saved properly");
        }
        console.log("✓ Request rejected with justification saved");

        // TEST 12: Verify BrandProfile.isVerifiedBusiness is false in MongoDB
        console.log("\n[Test 12] Check BrandProfile.isVerifiedBusiness in database");
        const brandProfile = await BrandProfile.findOne({ user: brandUser._id });
        console.log(`BrandProfile.isVerifiedBusiness: ${brandProfile?.isVerifiedBusiness}`);
        if (brandProfile && brandProfile.isVerifiedBusiness === true) {
            throw new Error("BrandProfile.isVerifiedBusiness should be false");
        }
        console.log("✓ Brand profile verified status is false");

        // TEST 13: Verify rejection notification created
        console.log("\n[Test 13] Check notification created for verification rejection");
        const rejectionNotif = await Notification.findOne({
            recipient: brandUser._id,
            entityType: "verification",
            entityId: createdBrandReqId
        });
        if (!rejectionNotif) throw new Error("Expected rejection notification in database");
        console.log(`✓ Notification created: "${rejectionNotif.title}" - "${rejectionNotif.message}"`);

        console.log("\n=======================================================");
        console.log("ALL 13 ADMIN VERIFICATION INTEGRATION TESTS PASSED 100%");
        console.log("=======================================================");
    } finally {
        // Cleanup created verification records and test state
        if (createdCreatorReqId) {
            await VerificationRequest.findByIdAndDelete(createdCreatorReqId);
            await Notification.deleteMany({ entityId: createdCreatorReqId });
        }
        if (createdBrandReqId) {
            await VerificationRequest.findByIdAndDelete(createdBrandReqId);
            await Notification.deleteMany({ entityId: createdBrandReqId });
        }
        server.close();
        await mongoose.disconnect();
    }
};

runTest().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
