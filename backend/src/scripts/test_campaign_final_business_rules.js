import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import appRouter from "../routes/index.js";
import Auth from "../modules/auth/auth.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import CreatorService from "../modules/creator/services/services.model.js";
import Booking from "../modules/booking/booking.model.js";
import Workspace from "../modules/workspace/workspace.model.js";
import AuditLog from "../modules/admin/audit/audit.model.js";
import Notification from "../modules/notifications/notification.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

dotenv.config();

const runRegressionTests = async () => {
    console.log("================================================================================");
    console.log("STARTING CREATORLINK CAMPAIGN MANAGEMENT FINAL BUSINESS RULES REGRESSION SUITE");
    console.log("================================================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api", appRouter);

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
    const baseUrl = `http://localhost:${port}/api`;

    let testCampaign = null;
    let testBooking = null;
    let testWorkspace = null;
    let testService = null;
    let createdTempBrand = false;
    let brandUserB = null;

    try {
        // 1. Find or set up test accounts
        const adminUser = await Auth.findOne({ role: "admin" });
        const creatorUser = await Auth.findOne({ role: "creator" });
        const brandUsers = await Auth.find({ role: "brand" }).limit(2);

        if (!adminUser || !creatorUser || brandUsers.length < 1) {
            throw new Error("Missing test users (admin, creator, or brand)");
        }

        const brandUserA = brandUsers[0];
        brandUserB = brandUsers[1];

        // If only 1 brand in DB, create a temporary brand B for cross-brand test
        if (!brandUserB) {
            brandUserB = await Auth.create({
                name: "Brand B Test Corp",
                email: `brand_b_test_${Date.now()}@test.com`,
                password: "Password123!",
                role: "brand",
                isEmailVerified: true
            });
            createdTempBrand = true;
        }

        // Ensure creator has a service
        testService = await CreatorService.findOne({ creator: creatorUser._id });
        if (!testService) {
            testService = await CreatorService.create({
                creator: creatorUser._id,
                title: "Sponsored Tech Review",
                description: "Full YouTube review video",
                category: "Technology",
                platform: "instagram",
                pricing: { basic: 15000 },
                deliveryDays: 7
            });
        }

        const adminToken = generateAccessToken({
            userId: adminUser._id.toString(),
            role: "admin",
            tokenVersion: adminUser.passwordVersion || 0
        });

        const brandAToken = generateAccessToken({
            userId: brandUserA._id.toString(),
            role: "brand",
            tokenVersion: brandUserA.passwordVersion || 0
        });

        const brandBToken = generateAccessToken({
            userId: brandUserB._id.toString(),
            role: "brand",
            tokenVersion: brandUserB.passwordVersion || 0
        });

        const creatorToken = generateAccessToken({
            userId: creatorUser._id.toString(),
            role: "creator",
            tokenVersion: creatorUser.passwordVersion || 0
        });

        console.log("\n--- TEST 1: Brand Normal Lifecycle (Create Draft -> Edit -> Publish) ---");
        // Brand A creates a campaign
        const createRes = await fetch(`${baseUrl}/brand/campaigns`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandAToken}`
            },
            body: JSON.stringify({
                title: `Automated Test Campaign ${Date.now()}`,
                description: "Test description for regression test suite verification",
                category: "Technology",
                platform: "instagram",
                budget: 15000,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                requiredCreators: 1,
                deliverables: ["1 Dedicated Product Review Video"]
            })
        });

        const createJson = await createRes.json();
        if (createRes.status !== 201 || !createJson.data?._id) {
            throw new Error(`Failed to create campaign: ${JSON.stringify(createJson)}`);
        }
        testCampaign = await Campaign.findById(createJson.data._id);
        console.log(`✓ Brand A created draft campaign: ID ${testCampaign._id} (Status: ${testCampaign.status})`);

        // Brand A edits the campaign and publishes it
        const publishRes = await fetch(`${baseUrl}/brand/campaigns/${testCampaign._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandAToken}`
            },
            body: JSON.stringify({
                status: "published",
                description: "Updated description before publish"
            })
        });
        const publishJson = await publishRes.json();
        if (publishRes.status !== 200 || publishJson.data?.status !== "published") {
            throw new Error(`Failed to publish campaign: ${JSON.stringify(publishJson)}`);
        }
        console.log(`✓ Brand A successfully published campaign (Status: published)`);

        console.log("\n--- TEST 2: Brand Ownership Isolation (Brand B cannot modify Brand A's campaign) ---");
        const crossBrandRes = await fetch(`${baseUrl}/brand/campaigns/${testCampaign._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandBToken}`
            },
            body: JSON.stringify({
                title: "Hacked by Brand B"
            })
        });
        const crossBrandJson = await crossBrandRes.json();
        if (crossBrandRes.status === 403) {
            console.log(`✓ Correctly rejected Brand B with 403 Forbidden: "${crossBrandJson.message}"`);
        } else {
            throw new Error(`Expected 403 Forbidden for cross-brand edit, got ${crossBrandRes.status}`);
        }

        console.log("\n--- TEST 3: Create Booking & Workspace to test Pause Non-interference ---");
        // Setup an accepted booking & workspace linked to this campaign
        testBooking = await Booking.create({
            campaign: testCampaign._id,
            brand: brandUserA._id,
            creator: creatorUser._id,
            service: testService._id,
            status: "accepted",
            agreedPrice: 15000,
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        });
        testWorkspace = await Workspace.create({
            booking: testBooking._id,
            campaign: testCampaign._id,
            brand: brandUserA._id,
            creator: creatorUser._id,
            service: testService._id,
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            status: "in_progress",
            agreedPrice: 15000
        });
        console.log(`✓ Established test accepted booking (${testBooking._id}) and in_progress workspace (${testWorkspace._id})`);

        console.log("\n--- TEST 4: Admin Pauses Campaign for Moderation ---");
        const adminPauseRes = await fetch(`${baseUrl}/admin/campaigns/${testCampaign._id}/pause`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({
                reason: "Compliance review for flagged claims"
            })
        });
        const adminPauseJson = await adminPauseRes.json();
        if (adminPauseRes.status !== 200 || !adminPauseJson.data?.moderation?.isRestricted) {
            throw new Error(`Admin moderation pause failed: ${JSON.stringify(adminPauseJson)}`);
        }
        console.log(`✓ Admin paused campaign for moderation:`);
        console.log(`  Status: ${adminPauseJson.data.status}`);
        console.log(`  isRestricted: ${adminPauseJson.data.moderation.isRestricted}`);
        console.log(`  Restriction Reason: "${adminPauseJson.data.moderation.restrictionReason}"`);

        // Check AuditLog
        const auditRecord = await AuditLog.findOne({
            targetType: "campaign",
            targetId: testCampaign._id,
            action: "CAMPAIGN_MODERATION_PAUSE"
        }).sort({ createdAt: -1 });

        if (auditRecord && auditRecord.reason === "Compliance review for flagged claims") {
            console.log(`✓ AuditLog recorded admin action correctly (Admin ID: ${auditRecord.admin}, Action: ${auditRecord.action})`);
        } else {
            throw new Error("AuditLog record for moderation pause not found or missing reason");
        }

        // Check Brand Notification
        const brandNotif = await Notification.findOne({
            recipient: brandUserA._id,
            entityId: testCampaign._id
        }).sort({ createdAt: -1 });
        if (brandNotif) {
            console.log(`✓ Brand received notification: "${brandNotif.title}" - "${brandNotif.message}"`);
        } else {
            throw new Error("Brand notification for moderation pause was not created");
        }

        console.log("\n--- TEST 5: Verify Accepted Bookings & Workspaces Remain Intact During Pause ---");
        const refreshedBooking = await Booking.findById(testBooking._id);
        const refreshedWorkspace = await Workspace.findById(testWorkspace._id);
        if (refreshedBooking.status === "accepted" && refreshedWorkspace.status === "in_progress") {
            console.log(`✓ Accepted booking status intact: "${refreshedBooking.status}"`);
            console.log(`✓ Workspace collaboration status intact: "${refreshedWorkspace.status}"`);
        } else {
            throw new Error("Bookings or workspaces were inappropriately mutated during campaign pause!");
        }

        console.log("\n--- TEST 6: Brand Cannot Bypass Admin Moderation Restrictions ---");
        const brandBypassRes = await fetch(`${baseUrl}/brand/campaigns/${testCampaign._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandAToken}`
            },
            body: JSON.stringify({
                status: "published"
            })
        });
        const brandBypassJson = await brandBypassRes.json();
        if (brandBypassRes.status === 403) {
            console.log(`✓ Brand bypass attempt blocked with 403 Forbidden: "${brandBypassJson.message}"`);
        } else {
            throw new Error(`Expected 403 Forbidden when brand tries to resume restricted campaign, got ${brandBypassRes.status}`);
        }

        console.log("\n--- TEST 7: Creator Cannot Apply to Paused / Restricted Campaign ---");
        const creatorApplyRes = await fetch(`${baseUrl}/creator/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${creatorToken}`
            },
            body: JSON.stringify({
                campaignId: testCampaign._id.toString(),
                serviceId: testService._id.toString(),
                proposedPrice: 15000,
                message: "I would love to participate in this campaign"
            })
        });
        const creatorApplyJson = await creatorApplyRes.json();
        if (creatorApplyRes.status === 400) {
            console.log(`✓ Creator application correctly blocked with 400 Bad Request: "${creatorApplyJson.message}"`);
        } else {
            throw new Error(`Expected 400 Bad Request when applying to paused/restricted campaign, got ${creatorApplyRes.status}`);
        }

        console.log("\n--- TEST 8: Admin Resumes Campaign After Moderation Resolution ---");
        const adminResumeRes = await fetch(`${baseUrl}/admin/campaigns/${testCampaign._id}/resume`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({
                reason: "Compliance review completed and verified approved"
            })
        });
        const adminResumeJson = await adminResumeRes.json();
        if (adminResumeRes.status !== 200 || adminResumeJson.data?.moderation?.isRestricted !== false) {
            throw new Error(`Admin resume failed: ${JSON.stringify(adminResumeJson)}`);
        }
        console.log(`✓ Admin resumed campaign:`);
        console.log(`  Status restored to: ${adminResumeJson.data.status}`);
        console.log(`  isRestricted: ${adminResumeJson.data.moderation.isRestricted}`);

        const resumeAudit = await AuditLog.findOne({
            targetType: "campaign",
            targetId: testCampaign._id,
            action: "CAMPAIGN_MODERATION_RESUME"
        }).sort({ createdAt: -1 });
        if (resumeAudit) {
            console.log(`✓ AuditLog recorded resume action (Action: ${resumeAudit.action})`);
        } else {
            throw new Error("AuditLog for moderation resume not found");
        }

        console.log("\n--- TEST 9: Completion Protection Rule ---");
        // Brand attempts to mark campaign completed while workspace is still in_progress
        const completeAttemptRes = await fetch(`${baseUrl}/brand/campaigns/${testCampaign._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandAToken}`
            },
            body: JSON.stringify({
                status: "completed"
            })
        });
        const completeAttemptJson = await completeAttemptRes.json();
        if (completeAttemptRes.status === 400) {
            console.log(`✓ Completion attempt blocked with 400 Bad Request: "${completeAttemptJson.message}"`);
        } else {
            throw new Error(`Expected 400 when marking campaign completed with active workspaces, got ${completeAttemptRes.status}`);
        }

        console.log("\n--- TEST 10: Safe Deletion Check (Cannot delete campaign with active collaborations) ---");
        const deleteRes = await fetch(`${baseUrl}/admin/campaigns/${testCampaign._id}`, {
            method: "DELETE",
            headers: {
                Cookie: `adminAccessToken=${adminToken}`
            }
        });
        const deleteJson = await deleteRes.json();
        if (deleteRes.status === 400) {
            console.log(`✓ Admin safe deletion protection triggered with 400 Bad Request: "${deleteJson.message}"`);
        } else {
            throw new Error(`Expected 400 Bad Request when deleting campaign with accepted bookings, got ${deleteRes.status}`);
        }

        console.log("\n--- TEST 11: Admin Closes Campaign with Justification ---");
        const adminCloseRes = await fetch(`${baseUrl}/admin/campaigns/${testCampaign._id}/close`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({
                reason: "Administrative closure - campaign completed lifecycle test"
            })
        });
        const adminCloseJson = await adminCloseRes.json();
        if (adminCloseRes.status === 200 && adminCloseJson.data?.status === "closed") {
            console.log(`✓ Admin closed campaign with audit: Status "${adminCloseJson.data.status}"`);
        } else {
            throw new Error(`Admin close failed: ${JSON.stringify(adminCloseJson)}`);
        }

        console.log("\n================================================================================");
        console.log("ALL 11 CAMPAIGN FINAL BUSINESS RULES REGRESSION TESTS PASSED (100% SUCCESS)!");
        console.log("================================================================================");
    } finally {
        // Clean up test data
        if (testWorkspace) await Workspace.deleteOne({ _id: testWorkspace._id });
        if (testBooking) await Booking.deleteOne({ _id: testBooking._id });
        if (testCampaign) {
            await Campaign.deleteOne({ _id: testCampaign._id });
            await AuditLog.deleteMany({ targetId: testCampaign._id });
            await Notification.deleteMany({ entityId: testCampaign._id });
        }
        if (createdTempBrand && brandUserB) {
            await Auth.deleteOne({ _id: brandUserB._id });
        }
        server.close();
        await mongoose.disconnect();
    }
};

runRegressionTests().catch((err) => {
    console.error("❌ Regression test failed:", err);
    process.exit(1);
});
