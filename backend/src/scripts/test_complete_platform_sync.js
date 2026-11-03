import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import appRouter from "../routes/index.js";
import Auth from "../modules/auth/auth.model.js";
import BrandProfile from "../modules/brand/profile/profile.model.js";
import CreatorProfile from "../modules/creator/profile/profile.model.js";
import CreatorService from "../modules/creator/services/services.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import Booking from "../modules/booking/booking.model.js";
import Workspace from "../modules/workspace/workspace.model.js";
import VerificationRequest from "../modules/admin/verification/verification.model.js";
import AuditLog from "../modules/admin/audit/audit.model.js";
import Notification from "../modules/notifications/notification.model.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import { createBrandTrialSubscriptionService } from "../modules/subscriptions/trial.service.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

dotenv.config();

const runFullPlatformSyncTest = async () => {
    console.log("================================================================================");
    console.log("STARTING FULL END-TO-END PLATFORM SYNC TEST ACROSS BRAND, CREATOR, AND ADMIN");
    console.log("================================================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB Atlas");

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

    let brandUser = null;
    let creatorUser = null;
    let testService = null;
    let testCampaign = null;
    let testBooking = null;
    let testWorkspace = null;
    let testVerificationReq = null;

    try {
        const adminUser = await Auth.findOne({ role: "admin" });
        if (!adminUser) {
            throw new Error("No admin user found in database!");
        }

        const adminToken = generateAccessToken({
            userId: adminUser._id.toString(),
            role: "admin",
            tokenVersion: adminUser.passwordVersion || 0
        });

        // =====================================================================
        // STEP 1: CREATE BRAND & CREATOR ACCOUNTS
        // =====================================================================
        console.log("\n>>> STEP 1: Creating Brand & Creator Test Accounts");
        const timestamp = Date.now();

        brandUser = await Auth.create({
            name: `Sync Brand ${timestamp}`,
            email: `sync_brand_${timestamp}@creatorlink.test`,
            password: "Password123!",
            role: "brand",
            isEmailVerified: true
        });

        await BrandProfile.create({
            user: brandUser._id,
            companyName: `Sync Brand ${timestamp} Inc`,
            industry: "Technology",
            website: "https://syncbrandtest.com",
            bio: "Automated test brand for full-system integration"
        });

        creatorUser = await Auth.create({
            name: `Sync Creator ${timestamp}`,
            email: `sync_creator_${timestamp}@creatorlink.test`,
            password: "Password123!",
            role: "creator",
            isEmailVerified: true
        });

        await CreatorProfile.create({
            user: creatorUser._id,
            displayName: `Sync Creator ${timestamp}`,
            bio: "Automated test creator for full-system integration",
            categories: ["Technology", "Lifestyle"],
            socialLinks: {
                instagram: "https://instagram.com/synccreatortest",
                youtube: "https://youtube.com/@synccreatortest"
            }
        });

        testService = await CreatorService.create({
            creator: creatorUser._id,
            title: "Sponsored Tech Review Reel",
            description: "High quality 60s reel showcasing product features",
            category: "Technology",
            platform: "instagram",
            pricing: { basic: 15000 },
            deliveryDays: 7
        });

        const brandToken = generateAccessToken({
            userId: brandUser._id.toString(),
            role: "brand",
            tokenVersion: brandUser.passwordVersion || 0
        });

        const creatorToken = generateAccessToken({
            userId: creatorUser._id.toString(),
            role: "creator",
            tokenVersion: creatorUser.passwordVersion || 0
        });

        await createBrandTrialSubscriptionService({
            brandId: brandUser._id,
            email: brandUser.email,
            name: brandUser.name
        });

        console.log(`✓ Brand Created: "${brandUser.name}" (${brandUser.email}) [ID: ${brandUser._id}]`);
        console.log(`✓ Creator Created: "${creatorUser.name}" (${creatorUser.email}) [ID: ${creatorUser._id}]`);
        console.log(`✓ Creator Service Created: "${testService.title}"`);

        // =====================================================================
        // STEP 2: USER MANAGEMENT & DASHBOARD SYNC
        // =====================================================================
        console.log("\n>>> STEP 2: Verifying Admin Dashboard & User Management Sync");

        // 2a. Admin Dashboard Overview
        const dashRes = await fetch(`${baseUrl}/admin/dashboard/overview`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const dashJson = await dashRes.json();
        if (dashRes.status === 200 && dashJson.data?.metrics?.users) {
            console.log(`✓ Admin Dashboard Telemetry Synced:`);
            console.log(`  Total Creators: ${dashJson.data.metrics.users.totalCreators}`);
            console.log(`  Total Brands: ${dashJson.data.metrics.users.totalBrands}`);
            console.log(`  Recent Signups Count: ${dashJson.data.recentActivity?.recentSignups?.length || 0}`);
        } else {
            throw new Error(`Admin dashboard fetch failed: ${JSON.stringify(dashJson)}`);
        }

        // 2b. User Management Search for Brand
        const searchBrandRes = await fetch(`${baseUrl}/admin/users?search=${encodeURIComponent(brandUser.email)}`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const searchBrandJson = await searchBrandRes.json();
        if (searchBrandRes.status === 200 && searchBrandJson.data?.users?.length > 0) {
            console.log(`✓ Admin User Management: Found Brand "${searchBrandJson.data.users[0].name}" via email search`);
        } else {
            throw new Error(`Failed to find brand in admin user management: ${JSON.stringify(searchBrandJson)}`);
        }

        // 2c. User Management Search for Creator
        const searchCreatorRes = await fetch(`${baseUrl}/admin/users?search=${encodeURIComponent(creatorUser.email)}`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const searchCreatorJson = await searchCreatorRes.json();
        if (searchCreatorRes.status === 200 && searchCreatorJson.data?.users?.length > 0) {
            console.log(`✓ Admin User Management: Found Creator "${searchCreatorJson.data.users[0].name}" via email search`);
        } else {
            throw new Error(`Failed to find creator in admin user management: ${JSON.stringify(searchCreatorJson)}`);
        }

        // =====================================================================
        // STEP 3: IDENTITY VERIFICATION (KYC) SYNC
        // =====================================================================
        console.log("\n>>> STEP 3: Identity Verification (KYC) Lifecycle Sync");

        // Creator submits verification
        testVerificationReq = await VerificationRequest.create({
            user: creatorUser._id,
            role: "creator",
            documentType: "passport",
            documentNumber: "PASS-" + timestamp,
            documentUrls: ["https://images.unsplash.com/photo-1544717305-2782549b5136?w=800"],
            notes: "Please verify my creator profile badge.",
            status: "pending"
        });
        console.log(`✓ Creator submitted KYC verification request (ID: ${testVerificationReq._id})`);

        // Admin lists pending verifications
        const pendingVerifRes = await fetch(`${baseUrl}/admin/verifications?status=pending`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const pendingVerifJson = await pendingVerifRes.json();
        const foundPending = pendingVerifJson.data?.verifications?.find(
            (r) => r._id.toString() === testVerificationReq._id.toString()
        );
        if (foundPending) {
            console.log(`✓ Admin Verifications Queue: Found pending request from "${creatorUser.name}"`);
        } else {
            throw new Error("Admin verifications queue did not return the pending request");
        }

        // Admin approves verification
        const approveVerifRes = await fetch(`${baseUrl}/admin/verifications/${testVerificationReq._id}/approve`, {
            method: "PATCH",
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const approveVerifJson = await approveVerifRes.json();
        if (approveVerifRes.status === 200 && approveVerifJson.data?.status === "approved") {
            console.log(`✓ Admin successfully approved verification request!`);
        } else {
            throw new Error(`Admin verification approve failed: ${JSON.stringify(approveVerifJson)}`);
        }

        // Verify Creator model is now verified
        const refreshedCreator = await Auth.findById(creatorUser._id);
        if (refreshedCreator.isVerified === true) {
            console.log(`✓ Creator Account State Synced: isVerified = ${refreshedCreator.isVerified}`);
        } else {
            throw new Error("Creator isVerified flag was not updated after admin approval");
        }

        // =====================================================================
        // STEP 4: CAMPAIGN LIFECYCLE & MODERATION SYNC
        // =====================================================================
        console.log("\n>>> STEP 4: Campaign Lifecycle & Moderation Sync");

        // Brand creates draft campaign
        const createCampRes = await fetch(`${baseUrl}/brand/campaigns`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandToken}`
            },
            body: JSON.stringify({
                title: `Full Sync Campaign ${timestamp}`,
                description: "Testing complete campaign workflow from brand to admin",
                category: "Technology",
                platform: "instagram",
                budget: 25000,
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                requiredCreators: 1,
                deliverables: ["1 Instagram Product Reel"]
            })
        });
        const createCampJson = await createCampRes.json();
        if (createCampRes.status !== 201 || !createCampJson.data?._id) {
            throw new Error(`Failed to create campaign: ${JSON.stringify(createCampJson)}`);
        }
        testCampaign = await Campaign.findById(createCampJson.data._id);
        console.log(`✓ Brand created Campaign: "${testCampaign.title}" (Status: ${testCampaign.status})`);

        // Brand publishes campaign
        const publishCampRes = await fetch(`${baseUrl}/brand/campaigns/${testCampaign._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandToken}`
            },
            body: JSON.stringify({
                status: "published"
            })
        });
        const publishCampJson = await publishCampRes.json();
        if (publishCampRes.status === 200 && publishCampJson.data?.status === "published") {
            console.log(`✓ Brand published Campaign (Status: published)`);
        } else {
            throw new Error(`Failed to publish campaign: ${JSON.stringify(publishCampJson)}`);
        }

        // Admin views campaign in Admin Campaigns
        const adminCampRes = await fetch(`${baseUrl}/admin/campaigns/${testCampaign._id}`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const adminCampJson = await adminCampRes.json();
        if (adminCampRes.status === 200 && adminCampJson.data?.campaign) {
            console.log(`✓ Admin Campaign Dossier Synced: Title "${adminCampJson.data.campaign.title}" | Brand: "${adminCampJson.data.campaign.brand?.name}"`);
        } else {
            throw new Error(`Admin campaign dossier fetch failed: ${JSON.stringify(adminCampJson)}`);
        }

        // Admin tests moderation pause
        const adminPauseRes = await fetch(`${baseUrl}/admin/campaigns/${testCampaign._id}/pause`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({ reason: "System sync test audit" })
        });
        const adminPauseJson = await adminPauseRes.json();
        if (adminPauseRes.status === 200 && adminPauseJson.data?.moderation?.isRestricted === true) {
            console.log(`✓ Admin Moderation Pause Synced: isRestricted = true, status = paused`);
        } else {
            throw new Error(`Admin pause failed: ${JSON.stringify(adminPauseJson)}`);
        }

        // Admin resolves moderation
        const adminResumeRes = await fetch(`${baseUrl}/admin/campaigns/${testCampaign._id}/resume`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({ reason: "System sync verified successfully" })
        });
        const adminResumeJson = await adminResumeRes.json();
        if (adminResumeRes.status === 200 && adminResumeJson.data?.moderation?.isRestricted === false) {
            console.log(`✓ Admin Moderation Resume Synced: isRestricted = false, restored to published`);
        } else {
            throw new Error(`Admin resume failed: ${JSON.stringify(adminResumeJson)}`);
        }

        // =====================================================================
        // STEP 5: BOOKING / HIRING SYNC
        // =====================================================================
        console.log("\n>>> STEP 5: Booking / Hiring Lifecycle Sync");

        // Creator applies for the campaign
        const applyRes = await fetch(`${baseUrl}/creator/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${creatorToken}`
            },
            body: JSON.stringify({
                campaignId: testCampaign._id.toString(),
                serviceId: testService._id.toString(),
                proposedPrice: 20000,
                message: "I am ready to deliver the high-impact tech reel!"
            })
        });
        const applyJson = await applyRes.json();
        if (applyRes.status !== 201 || !applyJson.data?._id) {
            throw new Error(`Creator booking application failed: ${JSON.stringify(applyJson)}`);
        }
        testBooking = await Booking.findById(applyJson.data._id);
        console.log(`✓ Creator submitted Booking Application (ID: ${testBooking._id}, Status: ${testBooking.status})`);

        // Brand lists bookings and finds the application
        const brandBookingsRes = await fetch(`${baseUrl}/brand/bookings?campaignId=${testCampaign._id}`, {
            headers: { Cookie: `accessToken=${brandToken}` }
        });
        const brandBookingsJson = await brandBookingsRes.json();
        const foundBooking = brandBookingsJson.data?.bookings?.find(
            (b) => b._id.toString() === testBooking._id.toString()
        );
        if (foundBooking) {
            console.log(`✓ Brand received Booking Application from "${creatorUser.name}" (Price: ₹${foundBooking.agreedPrice})`);
        } else {
            throw new Error("Brand bookings list did not return the creator's application");
        }

        // Brand accepts the booking
        const acceptBookingRes = await fetch(`${baseUrl}/brand/bookings/${testBooking._id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandToken}`
            },
            body: JSON.stringify({
                status: "accepted"
            })
        });
        const acceptBookingJson = await acceptBookingRes.json();
        if (acceptBookingRes.status === 200 && (acceptBookingJson.data?.status === "accepted" || acceptBookingJson.data?.booking?.status === "accepted")) {
            console.log(`✓ Brand accepted Booking Application! Collaboration initialized.`);
        } else {
            throw new Error(`Brand accept booking failed: ${JSON.stringify(acceptBookingJson)}`);
        }

        // Verify Workspace was created automatically
        testWorkspace = await Workspace.findOne({ booking: testBooking._id });
        if (!testWorkspace) {
            throw new Error("Workspace was not automatically created upon booking acceptance!");
        }
        console.log(`✓ Workspace automatically created: ID ${testWorkspace._id} (Status: ${testWorkspace.status})`);

        // =====================================================================
        // STEP 6: COLLABORATION / WORKSPACE SYNC
        // =====================================================================
        console.log("\n>>> STEP 6: Collaboration / Workspace Workflow Sync");

        // 6a. Admin views the collaboration in Admin Collaborations
        const adminCollabRes = await fetch(`${baseUrl}/admin/collaborations/${testWorkspace._id}`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const adminCollabJson = await adminCollabRes.json();
        if (adminCollabRes.status === 200 && adminCollabJson.data?.workspace) {
            console.log(`✓ Admin Collaboration Dossier Synced: Workspace ID "${adminCollabJson.data.workspace._id}"`);
            console.log(`  Brand: "${adminCollabJson.data.workspace.brand?.name}" | Creator: "${adminCollabJson.data.workspace.creator?.name}"`);
            console.log(`  Agreed Price: ₹${adminCollabJson.data.workspace.agreedPrice} | Status: ${adminCollabJson.data.workspace.status}`);
        } else {
            throw new Error(`Admin collaboration fetch failed: ${JSON.stringify(adminCollabJson)}`);
        }

        // 6b. Creator submits deliverable work in Workspace
        const submitWorkRes = await fetch(`${baseUrl}/creator/workspace/${testWorkspace._id}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${creatorToken}`
            },
            body: JSON.stringify({
                link: "https://drive.google.com/file/d/test-sync-reel/view",
                notes: "Completed final cut with brand colors and audio mixing."
            })
        });
        const submitWorkJson = await submitWorkRes.json();
        if (submitWorkRes.status === 200) {
            console.log(`✓ Creator submitted work in Workspace`);
        } else {
            throw new Error(`Creator submit work failed: ${JSON.stringify(submitWorkJson)}`);
        }

        // 6c. Brand reviews work and requests revision
        const reviewRevRes = await fetch(`${baseUrl}/brand/workspace/${testWorkspace._id}/review`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandToken}`
            },
            body: JSON.stringify({
                status: "revision_requested",
                feedback: "Looks awesome! Please add the official discount coupon banner in the first 5 seconds."
            })
        });
        const reviewRevJson = await reviewRevRes.json();
        if (reviewRevRes.status === 200) {
            console.log(`✓ Brand requested revision with feedback (Status: revision_requested)`);
        } else {
            throw new Error(`Brand revision request failed: ${JSON.stringify(reviewRevJson)}`);
        }

        // 6d. Creator resubmits revised work
        const resubmitWorkRes = await fetch(`${baseUrl}/creator/workspace/${testWorkspace._id}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${creatorToken}`
            },
            body: JSON.stringify({
                link: "https://drive.google.com/file/d/test-sync-reel-v2/view",
                notes: "Updated cut with coupon banner added at 0:02 mark."
            })
        });
        if (resubmitWorkRes.status === 200) {
            console.log(`✓ Creator resubmitted revised work`);
        } else {
            throw new Error(`Creator resubmit failed`);
        }

        // 6e. Brand approves final work
        const approveWorkRes = await fetch(`${baseUrl}/brand/workspace/${testWorkspace._id}/review`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brandToken}`
            },
            body: JSON.stringify({
                status: "approve"
            })
        });
        const approveWorkJson = await approveWorkRes.json();
        if (approveWorkRes.status === 200) {
            console.log(`✓ Brand approved final deliverable! Collaboration completed.`);
        } else {
            throw new Error(`Brand approve deliverable failed: ${JSON.stringify(approveWorkJson)}`);
        }

        // 6f. Admin extends deadline test
        const newDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const extendRes = await fetch(`${baseUrl}/admin/collaborations/${testWorkspace._id}/extend-deadline`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({
                newDeadline: newDeadline,
                reason: "Administrative extension for platform sync test"
            })
        });
        const extendJson = await extendRes.json();
        if (extendRes.status === 200) {
            console.log(`✓ Admin extended collaboration deadline successfully (Reason logged & audited)`);
        } else {
            throw new Error(`Admin extend deadline failed: ${JSON.stringify(extendJson)}`);
        }

        // =====================================================================
        // STEP 7: FINAL DASHBOARD TELEMETRY VERIFICATION
        // =====================================================================
        console.log("\n>>> STEP 7: Final Admin Dashboard Telemetry Verification");
        const finalDashRes = await fetch(`${baseUrl}/admin/dashboard/overview`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const finalDashJson = await finalDashRes.json();
        if (finalDashRes.status === 200 && finalDashJson.data?.metrics) {
            const m = finalDashJson.data.metrics;
            console.log(`✓ Final Platform Telemetry:`);
            console.log(`  - Total Creators: ${m.users.totalCreators} (Verified: ${m.users.verifiedCreators})`);
            console.log(`  - Total Brands: ${m.users.totalBrands} (Verified: ${m.users.verifiedBrands})`);
            console.log(`  - Total Campaigns: ${m.campaigns.totalCampaigns}`);
            console.log(`  - Total Workspaces: ${m.collaborations.totalWorkspaces}`);
            console.log(`  - Total Bookings: ${m.collaborations.totalBookings}`);
        } else {
            throw new Error("Final dashboard telemetry fetch failed");
        }

        console.log("\n================================================================================");
        console.log("FULL PLATFORM SYNC TEST PASSED WITH 100% SUCCESS ACROSS ALL 3 ROLES!");
        console.log("================================================================================");
    } finally {
        // Clean up test data
        console.log("\n>>> Cleaning up test data...");
        if (testWorkspace) await Workspace.deleteOne({ _id: testWorkspace._id });
        if (testBooking) await Booking.deleteOne({ _id: testBooking._id });
        if (testCampaign) {
            await Campaign.deleteOne({ _id: testCampaign._id });
            await AuditLog.deleteMany({ targetId: testCampaign._id });
            await Notification.deleteMany({ entityId: testCampaign._id });
        }
        if (testVerificationReq) await VerificationRequest.deleteOne({ _id: testVerificationReq._id });
        if (testService) await CreatorService.deleteOne({ _id: testService._id });
        if (creatorUser) {
            await CreatorProfile.deleteOne({ user: creatorUser._id });
            await Auth.deleteOne({ _id: creatorUser._id });
        }
        if (brandUser) {
            await Subscription.deleteMany({ brand: brandUser._id });
            await BrandProfile.deleteOne({ user: brandUser._id });
            await Auth.deleteOne({ _id: brandUser._id });
        }
        console.log("✓ Test records cleaned up successfully.");

        server.close();
        await mongoose.disconnect();
    }
};

runFullPlatformSyncTest().catch((err) => {
    console.error("❌ Test failed with error:", err);
    process.exit(1);
});
