import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
dotenv.config();

// Ensure dummy email credentials exist for nodemailer if not in .env
process.env.SMTP_SERVICE = process.env.SMTP_SERVICE || "gmail";
process.env.SMTP_USER = process.env.SMTP_USER || process.env.EMAIL || "test@creatorlink.com";
process.env.SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS || "dummy_password";

import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import Auth from "../modules/auth/auth.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import CreatorService from "../modules/creator/services/services.model.js";
import Booking from "../modules/booking/booking.model.js";
import Workspace from "../modules/workspace/workspace.model.js";
import Payment from "../modules/payments/payment.model.js";
import Review from "../modules/reviews/reviews.model.js";
import AuditLog from "../modules/admin/audit/audit.model.js";
import Notification from "../modules/notifications/notification.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";
import { getAppliedCampaignByIdService } from "../modules/creator/campaigns/campaigns.service.js";
import { createNotificationSafe } from "../modules/notifications/notification.service.js";
import { initializeSocket, getIO } from "../socket/socket.js";

const runAdminCampaignDeleteTests = async () => {
    // Dynamically import router after environment variables are set
    const { default: appRouter } = await import("../routes/index.js");
    console.log("================================================================================");
    console.log("STARTING ADMIN CAMPAIGN DELETE INTEGRATION AND REGRESSION TEST SUITE");
    console.log("================================================================================");

    // Enforce isolated test database
    const rawUri = process.env.MONGO_URI;
    if (!rawUri) {
        throw new Error("MONGO_URI environment variable is missing.");
    }
    const isolatedDbName = "creatorlink_admin_delete_test";
    const parsedUri = new URL(rawUri);
    parsedUri.pathname = `/${isolatedDbName}`;
    const isolatedUri = parsedUri.toString();

    await mongoose.connect(isolatedUri);
    console.log(`✓ Connected to isolated test database: "${mongoose.connection.name}"`);
    if (mongoose.connection.name !== isolatedDbName) {
        throw new Error(`CRITICAL: Test database name mismatch! Expected '${isolatedDbName}', got '${mongoose.connection.name}'`);
    }

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

    // Initialize real Socket.IO instance and spy on emissions
    initializeSocket(server);
    const io = getIO();
    const emittedSocketEvents = [];
    if (io) {
        const originalTo = io.to.bind(io);
        io.to = (room) => {
            const roomObj = originalTo(room);
            const originalEmit = roomObj.emit.bind(roomObj);
            return {
                ...roomObj,
                emit: (eventName, data) => {
                    emittedSocketEvents.push({ room, eventName, data, timestamp: Date.now() });
                    return originalEmit(eventName, data);
                }
            };
        };
    }

    // Comprehensive document tracking across all 9 collections for guaranteed cleanup
    const trackedAuthIds = [];
    const trackedServiceIds = [];
    const trackedCampaignIds = [];
    const trackedBookingIds = [];
    const trackedWorkspaceIds = [];
    const trackedPaymentIds = [];
    const trackedReviewIds = [];
    const trackedAuditLogIds = [];
    const trackedNotificationIds = [];

    let adminUser = null;
    let creatorUser = null;
    let brandUser = null;

    let adminToken = "";
    let creatorToken = "";
    let brandToken = "";

    try {
        // Setup isolated test users
        adminUser = await Auth.create({
            email: `test_admin_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            name: "Test Admin",
            role: "admin",
            isEmailVerified: true
        });
        trackedAuthIds.push(adminUser._id);

        creatorUser = await Auth.create({
            email: `test_creator_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            name: "Test Creator",
            role: "creator",
            isEmailVerified: true
        });
        trackedAuthIds.push(creatorUser._id);

        const testService = await CreatorService.create({
            creator: creatorUser._id,
            title: "Test Social Promotion",
            category: "Technology",
            platform: "youtube",
            price: 25000,
            deliveryTime: 7,
            isActive: true
        });
        trackedServiceIds.push(testService._id);

        brandUser = await Auth.create({
            email: `test_brand_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            name: "Test Brand",
            role: "brand",
            isEmailVerified: true
        });
        trackedAuthIds.push(brandUser._id);

        adminToken = generateAccessToken({
            userId: adminUser._id.toString(),
            role: "admin",
            tokenVersion: 0
        });

        creatorToken = generateAccessToken({
            userId: creatorUser._id.toString(),
            role: "creator",
            tokenVersion: 0
        });

        brandToken = generateAccessToken({
            userId: brandUser._id.toString(),
            role: "brand",
            tokenVersion: 0
        });

        console.log("✓ Initialized isolated test users (Admin, Creator, Brand)");

        // -------------------------------------------------------------
        // SCENARIO 1: Authentication & RBAC Verification (Cookie Isolation)
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 1: RBAC & Cookie Isolation Verification ---");
        const fakeCampId = new mongoose.Types.ObjectId();

        // 1A. Unauthenticated request rejected
        const unauthRes = await fetch(`${baseUrl}/admin/campaigns/${fakeCampId}`, {
            method: "DELETE"
        });
        if (unauthRes.status === 401) {
            console.log("✓ 1A. Unauthenticated request rejected with 401 Unauthorized");
        } else {
            throw new Error(`Expected 401 for unauth delete, got ${unauthRes.status}`);
        }

        // 1B. Creator token via accessToken cookie rejected
        const creatorAccessTokenRes = await fetch(`${baseUrl}/admin/campaigns/${fakeCampId}`, {
            method: "DELETE",
            headers: {
                Cookie: `accessToken=${creatorToken}`
            }
        });
        if (creatorAccessTokenRes.status === 403) {
            console.log("✓ 1B. Creator request via accessToken rejected with 403 Forbidden");
        } else {
            throw new Error(`Expected 403 for creator accessToken delete, got ${creatorAccessTokenRes.status}`);
        }

        // 1C. Creator token via adminAccessToken cookie rejected
        const creatorAdminTokenRes = await fetch(`${baseUrl}/admin/campaigns/${fakeCampId}`, {
            method: "DELETE",
            headers: {
                Cookie: `adminAccessToken=${creatorToken}`
            }
        });
        if (creatorAdminTokenRes.status === 403) {
            console.log("✓ 1C. Creator request via adminAccessToken rejected with 403 Forbidden");
        } else {
            throw new Error(`Expected 403 for creator adminAccessToken delete, got ${creatorAdminTokenRes.status}`);
        }

        // 1D. Brand token via accessToken cookie rejected
        const brandAccessTokenRes = await fetch(`${baseUrl}/admin/campaigns/${fakeCampId}`, {
            method: "DELETE",
            headers: {
                Cookie: `accessToken=${brandToken}`
            }
        });
        if (brandAccessTokenRes.status === 403) {
            console.log("✓ 1D. Brand request via accessToken rejected with 403 Forbidden");
        } else {
            throw new Error(`Expected 403 for brand accessToken delete, got ${brandAccessTokenRes.status}`);
        }

        // 1E. Brand token via adminAccessToken cookie rejected
        const brandAdminTokenRes = await fetch(`${baseUrl}/admin/campaigns/${fakeCampId}`, {
            method: "DELETE",
            headers: {
                Cookie: `adminAccessToken=${brandToken}`
            }
        });
        if (brandAdminTokenRes.status === 403) {
            console.log("✓ 1E. Brand request via adminAccessToken rejected with 403 Forbidden");
        } else {
            throw new Error(`Expected 403 for brand adminAccessToken delete, got ${brandAdminTokenRes.status}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 2: Active Collaborations Block Deletion
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 2: Active Collaborations (accepted, in_progress, completed) Block Deletion ---");
        const campWithActiveBooking = await Campaign.create({
            brand: brandUser._id,
            title: "Active Booking Campaign Test",
            description: "Testing active booking protection",
            category: "Technology",
            platform: ["youtube"],
            budget: 50000,
            deadline: new Date(Date.now() + 86400000 * 30),
            requiredCreators: 2,
            deliverables: ["1 Video Review"],
            status: "published"
        });
        trackedCampaignIds.push(campWithActiveBooking._id);

        const activeBooking = await Booking.create({
            campaign: campWithActiveBooking._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 25000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "accepted"
        });
        trackedBookingIds.push(activeBooking._id);

        // Test with accepted booking
        let blockRes = await fetch(`${baseUrl}/admin/campaigns/${campWithActiveBooking._id}`, {
            method: "DELETE",
            headers: {
                Cookie: `adminAccessToken=${adminToken}`
            }
        });
        let blockJson = await blockRes.json();
        if (blockRes.status === 400 && blockJson.message.includes("accepted collaboration(s)")) {
            console.log(`✓ 2A. Deletion blocked with 400 for accepted booking: "${blockJson.message}"`);
        } else {
            throw new Error(`Expected 400 for accepted booking delete, got ${blockRes.status}: ${JSON.stringify(blockJson)}`);
        }

        // Test with in_progress booking
        activeBooking.status = "in_progress";
        await activeBooking.save();

        blockRes = await fetch(`${baseUrl}/admin/campaigns/${campWithActiveBooking._id}`, {
            method: "DELETE",
            headers: {
                Cookie: `adminAccessToken=${adminToken}`
            }
        });
        blockJson = await blockRes.json();
        if (blockRes.status === 400 && blockJson.message.includes("accepted collaboration(s)")) {
            console.log(`✓ 2B. Deletion blocked with 400 for in_progress booking`);
        } else {
            throw new Error(`Expected 400 for in_progress booking delete, got ${blockRes.status}`);
        }

        // Test with completed booking
        activeBooking.status = "completed";
        await activeBooking.save();

        blockRes = await fetch(`${baseUrl}/admin/campaigns/${campWithActiveBooking._id}`, {
            method: "DELETE",
            headers: {
                Cookie: `adminAccessToken=${adminToken}`
            }
        });
        blockJson = await blockRes.json();
        if (blockRes.status === 400 && blockJson.message.includes("accepted collaboration(s)")) {
            console.log(`✓ 2C. Deletion blocked with 400 for completed booking`);
        } else {
            throw new Error(`Expected 400 for completed booking delete, got ${blockRes.status}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 3: ANY Workspace (including completed) Blocks Deletion
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 3: Workspace Existence Blocks Deletion ---");
        activeBooking.status = "cancelled";
        await activeBooking.save();

        const testWorkspace = await Workspace.create({
            booking: activeBooking._id,
            campaign: campWithActiveBooking._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 25000,
            brief: "Workspace test brief",
            deliverables: [{ title: "Deliverable 1", status: "completed" }],
            deadline: new Date(Date.now() + 86400000 * 14),
            status: "completed"
        });
        trackedWorkspaceIds.push(testWorkspace._id);

        blockRes = await fetch(`${baseUrl}/admin/campaigns/${campWithActiveBooking._id}`, {
            method: "DELETE",
            headers: {
                Cookie: `adminAccessToken=${adminToken}`
            }
        });
        blockJson = await blockRes.json();
        if (blockRes.status === 400 && blockJson.message.includes("workspace(s) are linked to this campaign")) {
            console.log(`✓ 3. Deletion blocked with 400 when completed Workspace exists: "${blockJson.message}"`);
        } else {
            throw new Error(`Expected 400 for workspace existence delete, got ${blockRes.status}: ${JSON.stringify(blockJson)}`);
        }

        // Clean up test workspace
        await Workspace.deleteOne({ _id: testWorkspace._id });

        // -------------------------------------------------------------
        // SCENARIO 4: Payment Records Block Deletion
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 4: Payment Records Block Deletion ---");
        const testPayment = await Payment.create({
            workspace: new mongoose.Types.ObjectId(),
            booking: activeBooking._id,
            campaign: campWithActiveBooking._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            amount: 25000,
            currency: "INR",
            status: "paid",
            paymentMethod: "RAZORPAY_TEST"
        });
        trackedPaymentIds.push(testPayment._id);

        blockRes = await fetch(`${baseUrl}/admin/campaigns/${campWithActiveBooking._id}`, {
            method: "DELETE",
            headers: {
                Cookie: `adminAccessToken=${adminToken}`
            }
        });
        blockJson = await blockRes.json();
        if (blockRes.status === 400 && blockJson.message.includes("payment record(s) are linked to this campaign")) {
            console.log(`✓ 4. Deletion blocked with 400 when Payment record exists: "${blockJson.message}"`);
        } else {
            throw new Error(`Expected 400 for payment record delete, got ${blockRes.status}: ${JSON.stringify(blockJson)}`);
        }

        // Clean up test payment
        await Payment.deleteOne({ _id: testPayment._id });

        // -------------------------------------------------------------
        // SCENARIO 5: Review Records Block Deletion
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 5: Review Records Block Deletion ---");
        const testReview = await Review.create({
            workspace: new mongoose.Types.ObjectId(),
            campaign: campWithActiveBooking._id,
            booking: activeBooking._id,
            reviewer: brandUser._id,
            reviewee: creatorUser._id,
            rating: 5,
            comment: "Outstanding work on this campaign collaboration!"
        });
        trackedReviewIds.push(testReview._id);

        blockRes = await fetch(`${baseUrl}/admin/campaigns/${campWithActiveBooking._id}`, {
            method: "DELETE",
            headers: {
                Cookie: `adminAccessToken=${adminToken}`
            }
        });
        blockJson = await blockRes.json();
        if (blockRes.status === 400 && blockJson.message.includes("review record(s) are linked to this campaign")) {
            console.log(`✓ 5. Deletion blocked with 400 when Review record exists: "${blockJson.message}"`);
        } else {
            throw new Error(`Expected 400 for review record delete, got ${blockRes.status}: ${JSON.stringify(blockJson)}`);
        }

        // Clean up test review and campaign
        await Review.deleteOne({ _id: testReview._id });
        await Booking.deleteOne({ _id: activeBooking._id });
        await Campaign.deleteOne({ _id: campWithActiveBooking._id });

        // -------------------------------------------------------------
        // SCENARIO 6: Admin Deletes Eligible Campaign with Pending Bookings & Real-time Sockets
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 6: Admin Deletes Eligible Campaign with Pending Applications & Real-time Sockets ---");
        const eligibleCampaign = await Campaign.create({
            brand: brandUser._id,
            title: "Eligible Deletion Campaign",
            description: "Testing successful deletion flow with pending applications",
            category: "Fashion",
            platform: ["instagram"],
            budget: 30000,
            deadline: new Date(Date.now() + 86400000 * 20),
            requiredCreators: 1,
            deliverables: ["2 Instagram Reels"],
            status: "published"
        });
        trackedCampaignIds.push(eligibleCampaign._id);

        const pendingBooking1 = await Booking.create({
            campaign: eligibleCampaign._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 15000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["2 Instagram Reels"],
            status: "pending"
        });
        trackedBookingIds.push(pendingBooking1._id);

        // Historical rejected booking to verify it is NOT modified
        const historicalRejectedBooking = await Booking.create({
            campaign: eligibleCampaign._id,
            brand: brandUser._id,
            creator: new mongoose.Types.ObjectId(),
            service: testService._id,
            agreedPrice: 10000,
            deadline: new Date(Date.now() + 86400000 * 5),
            deliverables: ["1 Instagram Reel"],
            status: "rejected"
        });
        trackedBookingIds.push(historicalRejectedBooking._id);

        const socketCountBefore = emittedSocketEvents.length;

        const deleteRes = await fetch(`${baseUrl}/admin/campaigns/${eligibleCampaign._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({
                reason: "Administrative cleanup of duplicate campaign"
            })
        });
        const deleteJson = await deleteRes.json();
        if (deleteRes.status === 200 && deleteJson.success) {
            console.log(`✓ 6A. Campaign successfully deleted: "${deleteJson.message}"`);
        } else {
            throw new Error(`Expected 200 for eligible delete, got ${deleteRes.status}: ${JSON.stringify(deleteJson)}`);
        }

        // Verify hard deletion from MongoDB
        const deletedCampDoc = await Campaign.findById(eligibleCampaign._id);
        if (deletedCampDoc === null) {
            console.log("✓ 6B. Campaign document permanently removed from MongoDB (Hard Delete verified)");
        } else {
            throw new Error(`Campaign document was NOT deleted: ${JSON.stringify(deletedCampDoc)}`);
        }

        // Verify pending booking was cancelled
        const updatedBooking1 = await Booking.findById(pendingBooking1._id);
        if (updatedBooking1 && updatedBooking1.status === "cancelled") {
            console.log(`✓ 6C. Pending booking was transitioned to status: "${updatedBooking1.status}"`);
        } else {
            throw new Error(`Expected pending booking status to be cancelled, got ${updatedBooking1?.status}`);
        }

        // Verify historical rejected booking was NOT modified
        const checkRejectedBooking = await Booking.findById(historicalRejectedBooking._id);
        if (checkRejectedBooking && checkRejectedBooking.status === "rejected") {
            console.log("✓ 6D. Historical rejected booking remained untouched (status: rejected)");
        } else {
            throw new Error(`Historical rejected booking was modified: ${checkRejectedBooking?.status}`);
        }

        // Verify Creator Notification
        const creatorNotif = await Notification.findOne({
            recipient: creatorUser._id,
            entityId: eligibleCampaign._id,
            idempotencyKey: `notif_camp_del_${eligibleCampaign._id}_${pendingBooking1._id}`
        });
        if (creatorNotif && creatorNotif.type === "campaign_deleted") {
            trackedNotificationIds.push(creatorNotif._id);
            console.log(`✓ 6E. Creator received deletion notification: "${creatorNotif.title}" - "${creatorNotif.message}"`);
            console.log(`     Destination: "${creatorNotif.destination}"`);
        } else {
            throw new Error("Missing creator deletion notification or incorrect idempotencyKey");
        }

        // Verify Brand Notification
        const brandNotif = await Notification.findOne({
            recipient: brandUser._id,
            entityId: eligibleCampaign._id,
            idempotencyKey: `notif_camp_del_${eligibleCampaign._id}_brand`
        });
        if (brandNotif && brandNotif.type === "campaign_deleted") {
            trackedNotificationIds.push(brandNotif._id);
            console.log(`✓ 6F. Brand received deletion notification: "${brandNotif.title}" - "${brandNotif.message}"`);
            console.log(`     Destination: "${brandNotif.destination}"`);
        } else {
            throw new Error("Missing brand deletion notification or incorrect idempotencyKey");
        }

        // Verify Platform Audit Log
        const auditEntry = await AuditLog.findOne({
            targetType: "campaign",
            targetId: eligibleCampaign._id,
            action: "CAMPAIGN_SAFE_DELETE"
        });
        if (auditEntry && auditEntry.newState?.deleted === true) {
            trackedAuditLogIds.push(auditEntry._id);
            console.log(`✓ 6G. AuditLog recorded: action="${auditEntry.action}", reason="${auditEntry.reason}"`);
        } else {
            throw new Error("Missing or incomplete AuditLog entry for safe delete");
        }

        // Verify Real-time Socket.IO events dispatched to Creator and Brand
        const socketEventsAfter = emittedSocketEvents.slice(socketCountBefore);
        const creatorSocketEvent = socketEventsAfter.find(
            (e) => e.room === `user:${creatorUser._id}` && e.eventName === "notification:new"
        );
        const brandSocketEvent = socketEventsAfter.find(
            (e) => e.room === `user:${brandUser._id}` && e.eventName === "notification:new"
        );

        if (creatorSocketEvent && brandSocketEvent) {
            console.log("✓ 6H. Real-time Socket.IO notification events dispatched to both creator and brand rooms");
        } else {
            throw new Error(`Socket emission missing: creator=${!!creatorSocketEvent}, brand=${!!brandSocketEvent}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 7: Historical Records Remain Intact
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 7: Historical Record Preservation ---");
        const bookingCount = await Booking.countDocuments({
            _id: { $in: [pendingBooking1._id, historicalRejectedBooking._id] }
        });
        if (bookingCount === 2) {
            console.log("✓ 7A. Both Booking documents preserved in MongoDB collection");
        } else {
            throw new Error(`Expected 2 bookings preserved, found ${bookingCount}`);
        }

        const notifCount = await Notification.countDocuments({
            entityId: eligibleCampaign._id
        });
        if (notifCount === 2) {
            console.log("✓ 7B. Notification documents preserved in MongoDB collection");
        } else {
            throw new Error(`Expected 2 notifications, found ${notifCount}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 8: Notification Idempotency & Socket Duplicate Suppression on Retry
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 8: Retry Idempotency & Socket Duplicate Suppression ---");
        const initialNotifCount = await Notification.countDocuments({
            idempotencyKey: `notif_camp_del_${eligibleCampaign._id}_${pendingBooking1._id}`
        });
        const socketCountBeforeRetry = emittedSocketEvents.length;

        // 8A. Simulate duplicate notification dispatch with identical payload and idempotency key
        const retryNotif = await createNotificationSafe({
            recipient: creatorUser._id,
            sender: adminUser._id,
            type: "campaign_deleted",
            title: "Campaign Removed by Administration",
            message: "Retry test notification",
            entityType: "campaign",
            entityId: eligibleCampaign._id,
            destination: `/creator/campaigns/applied`,
            metadata: {
                campaignId: eligibleCampaign._id,
                bookingId: pendingBooking1._id,
                status: "cancelled"
            },
            idempotencyKey: `notif_camp_del_${eligibleCampaign._id}_${pendingBooking1._id}`
        });

        const postRetryNotifCount = await Notification.countDocuments({
            idempotencyKey: `notif_camp_del_${eligibleCampaign._id}_${pendingBooking1._id}`
        });
        const socketCountAfterRetry = emittedSocketEvents.length;

        if (
            initialNotifCount === 1 &&
            postRetryNotifCount === 1 &&
            String(retryNotif?._id) === String(creatorNotif?._id) &&
            socketCountAfterRetry === socketCountBeforeRetry
        ) {
            console.log("✓ 8A. Notification idempotency key prevented duplicate DB record and prevented duplicate socket emission");
        } else {
            throw new Error(`Idempotency or socket suppression failed: count before=${initialNotifCount}, count after=${postRetryNotifCount}, socket diff=${socketCountAfterRetry - socketCountBeforeRetry}`);
        }

        // 8B. Retry API DELETE endpoint on already deleted campaign
        const retryDeleteRes = await fetch(`${baseUrl}/admin/campaigns/${eligibleCampaign._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({
                reason: "Administrative cleanup retry"
            })
        });
        const retryDeleteJson = await retryDeleteRes.json();
        if (retryDeleteRes.status === 200 && retryDeleteJson.message.includes("already safely removed")) {
            console.log(`✓ 8B. Safe delete endpoint handled idempotent retry cleanly: "${retryDeleteJson.message}"`);
        } else {
            throw new Error(`Expected 200 with idempotent retry message, got ${retryDeleteRes.status}: ${JSON.stringify(retryDeleteJson)}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 9: Creator Old Booking Page Does Not Crash When Populated Campaign Is Null
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 9: Creator Old Booking Page Does Not Crash After Campaign Deletion ---");
        const appliedCampaignDetail = await getAppliedCampaignByIdService(
            creatorUser._id.toString(),
            pendingBooking1._id.toString()
        );

        if (appliedCampaignDetail) {
            console.log("✓ 9A. getAppliedCampaignByIdService returned cleanly for cancelled booking with deleted campaign");
            console.log(`     status: "${appliedCampaignDetail.status}"`);
            console.log(`     campaign: ${appliedCampaignDetail.campaign}`);
            console.log(`     brand name: "${appliedCampaignDetail.brand?.name}"`);
            if (appliedCampaignDetail.campaign === null && appliedCampaignDetail.status === "cancelled") {
                console.log("✓ 9B. Populated campaign safely returned null without throwing errors or crashing");
            } else {
                throw new Error(`Unexpected applied campaign detail payload: ${JSON.stringify(appliedCampaignDetail)}`);
            }
        } else {
            throw new Error("getAppliedCampaignByIdService returned falsy result");
        }

        // -------------------------------------------------------------
        // SCENARIO 10: Partial-Failure Recovery & Retry Verification
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 10: Partial-Failure Recovery & Retry Safety ---");

        // 10A: Campaign deletion succeeds, but Creator notification creation fails
        console.log("\n--- 10A: Creator Notification Failure & Subsequent Retry Recovery ---");
        const campFail1 = await Campaign.create({
            brand: brandUser._id,
            title: "Partial Failure 1 - Creator Notif Fail",
            description: "Testing creator notification failure resilience",
            category: "Technology",
            platform: ["youtube"],
            budget: 20000,
            deadline: new Date(Date.now() + 86400000 * 15),
            requiredCreators: 1,
            deliverables: ["1 Video"],
            status: "published"
        });
        trackedCampaignIds.push(campFail1._id);

        const bookingFail1 = await Booking.create({
            campaign: campFail1._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Video"],
            status: "pending"
        });
        trackedBookingIds.push(bookingFail1._id);

        const originalNotifCreate = Notification.create.bind(Notification);
        let failCreatorNotif = true;
        Notification.create = async function (...args) {
            const payload = args[0];
            if (
                failCreatorNotif &&
                payload?.recipient?.toString() === creatorUser._id.toString() &&
                payload?.metadata?.campaignId?.toString() === campFail1._id.toString()
            ) {
                throw new Error("Simulated transient network failure during Creator notification push");
            }
            return originalNotifCreate(...args);
        };

        const failRes1 = await fetch(`${baseUrl}/admin/campaigns/${campFail1._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({ reason: "Testing creator notification partial failure" })
        });
        const failJson1 = await failRes1.json();

        if (failRes1.status === 500 && failJson1.message.includes("Creator notification error")) {
            console.log(`✓ 10A-1. API correctly reported partial failure (status 500) and did not report false success: "${failJson1.message}"`);
        } else {
            throw new Error(`Expected 500 reporting partial creator notification failure, got ${failRes1.status}: ${JSON.stringify(failJson1)}`);
        }

        // Verify document is deleted and booking is cancelled despite notification failure
        const campDocAfterFail1 = await Campaign.findById(campFail1._id);
        const bookingDocAfterFail1 = await Booking.findById(bookingFail1._id);
        const creatorNotifFail1 = await Notification.findOne({
            idempotencyKey: `notif_camp_del_${campFail1._id}_${bookingFail1._id}`
        });

        if (campDocAfterFail1 === null) {
            console.log("✓ 10A-2. Campaign remains permanently deleted from MongoDB");
        } else {
            throw new Error("Campaign document was resurrected or not deleted!");
        }

        if (bookingDocAfterFail1 && bookingDocAfterFail1.status === "cancelled") {
            console.log(`✓ 10A-3. Pending booking remains cancelled (status: "${bookingDocAfterFail1.status}")`);
        } else {
            throw new Error(`Expected booking status to remain cancelled, got ${bookingDocAfterFail1?.status}`);
        }

        if (!creatorNotifFail1) {
            console.log("✓ 10A-4. Confirmed Creator notification was not created during failure");
        } else {
            throw new Error("Creator notification was unexpectedly created during failure simulation");
        }

        // Retry the delete request: Missing Creator notification must be recovered
        failCreatorNotif = false;
        Notification.create = originalNotifCreate;

        const retryRes1 = await fetch(`${baseUrl}/admin/campaigns/${campFail1._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({ reason: "Testing creator notification partial failure retry" })
        });
        const retryJson1 = await retryRes1.json();

        if (retryRes1.status === 200 && retryJson1.message.includes("safely removed")) {
            console.log(`✓ 10A-5. Retry succeeded with 200 OK: "${retryJson1.message}"`);
        } else {
            throw new Error(`Expected 200 on retry, got ${retryRes1.status}: ${JSON.stringify(retryJson1)}`);
        }

        const recoveredCreatorNotif = await Notification.findOne({
            idempotencyKey: `notif_camp_del_${campFail1._id}_${bookingFail1._id}`
        });
        if (recoveredCreatorNotif && recoveredCreatorNotif.type === "campaign_deleted") {
            trackedNotificationIds.push(recoveredCreatorNotif._id);
            console.log("✓ 10A-6. Missing Creator notification successfully recovered on retry");
        } else {
            throw new Error("Creator notification was NOT recovered on retry!");
        }

        // 10B: Campaign deletion succeeds, but Brand notification creation fails
        console.log("\n--- 10B: Brand Notification Failure & Subsequent Retry Recovery ---");
        const campFail2 = await Campaign.create({
            brand: brandUser._id,
            title: "Partial Failure 2 - Brand Notif Fail",
            description: "Testing brand notification failure resilience",
            category: "Fashion",
            platform: ["instagram"],
            budget: 25000,
            deadline: new Date(Date.now() + 86400000 * 15),
            requiredCreators: 1,
            deliverables: ["1 Reel"],
            status: "published"
        });
        trackedCampaignIds.push(campFail2._id);

        const bookingFail2 = await Booking.create({
            campaign: campFail2._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 25000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Reel"],
            status: "pending"
        });
        trackedBookingIds.push(bookingFail2._id);

        let failBrandNotif = true;
        Notification.create = async function (...args) {
            const payload = args[0];
            if (
                failBrandNotif &&
                payload?.recipient?.toString() === brandUser._id.toString() &&
                payload?.metadata?.campaignId?.toString() === campFail2._id.toString()
            ) {
                throw new Error("Simulated transient socket pipeline failure for Brand notification");
            }
            return originalNotifCreate(...args);
        };

        const failRes2 = await fetch(`${baseUrl}/admin/campaigns/${campFail2._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({ reason: "Testing brand notification partial failure" })
        });
        const failJson2 = await failRes2.json();

        if (failRes2.status === 500 && failJson2.message.includes("Brand notification error")) {
            console.log(`✓ 10B-1. API correctly reported partial failure (status 500): "${failJson2.message}"`);
        } else {
            throw new Error(`Expected 500 reporting partial brand notification failure, got ${failRes2.status}: ${JSON.stringify(failJson2)}`);
        }

        const campDocAfterFail2 = await Campaign.findById(campFail2._id);
        const bookingDocAfterFail2 = await Booking.findById(bookingFail2._id);
        const brandNotifFail2 = await Notification.findOne({
            idempotencyKey: `notif_camp_del_${campFail2._id}_brand`
        });

        if (campDocAfterFail2 === null) {
            console.log("✓ 10B-2. Campaign remains permanently deleted from MongoDB");
        } else {
            throw new Error("Campaign document was resurrected or not deleted!");
        }

        if (bookingDocAfterFail2 && bookingDocAfterFail2.status === "cancelled") {
            console.log(`✓ 10B-3. Pending booking remains cancelled (status: "${bookingDocAfterFail2.status}")`);
        } else {
            throw new Error(`Expected booking status to remain cancelled, got ${bookingDocAfterFail2?.status}`);
        }

        if (!brandNotifFail2) {
            console.log("✓ 10B-4. Confirmed Brand notification was not created during failure");
        } else {
            throw new Error("Brand notification was unexpectedly created during failure simulation");
        }

        // Retry the delete request: Missing Brand notification must be recovered
        failBrandNotif = false;
        Notification.create = originalNotifCreate;

        const retryRes2 = await fetch(`${baseUrl}/admin/campaigns/${campFail2._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({ reason: "Testing brand notification partial failure retry" })
        });
        const retryJson2 = await retryRes2.json();

        if (retryRes2.status === 200 && retryJson2.message.includes("safely removed")) {
            console.log(`✓ 10B-5. Retry succeeded with 200 OK: "${retryJson2.message}"`);
        } else {
            throw new Error(`Expected 200 on retry, got ${retryRes2.status}: ${JSON.stringify(retryJson2)}`);
        }

        const recoveredBrandNotif = await Notification.findOne({
            idempotencyKey: `notif_camp_del_${campFail2._id}_brand`
        });
        if (recoveredBrandNotif && recoveredBrandNotif.type === "campaign_deleted") {
            trackedNotificationIds.push(recoveredBrandNotif._id);
            console.log("✓ 10B-6. Missing Brand notification successfully recovered on retry");
        } else {
            throw new Error("Brand notification was NOT recovered on retry!");
        }

        // 10C: Campaign deletion succeeds, but AuditLog creation fails
        console.log("\n--- 10C: AuditLog Creation Failure & Subsequent Retry Recovery ---");
        const campFail3 = await Campaign.create({
            brand: brandUser._id,
            title: "Partial Failure 3 - AuditLog Fail",
            description: "Testing AuditLog creation failure resilience",
            category: "Technology",
            platform: ["youtube"],
            budget: 18000,
            deadline: new Date(Date.now() + 86400000 * 15),
            requiredCreators: 1,
            deliverables: ["1 Video"],
            status: "published"
        });
        trackedCampaignIds.push(campFail3._id);

        const bookingFail3 = await Booking.create({
            campaign: campFail3._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 18000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Video"],
            status: "pending"
        });
        trackedBookingIds.push(bookingFail3._id);

        const originalAuditLogCreate = AuditLog.create.bind(AuditLog);
        let failAuditLog = true;
        AuditLog.create = async function (...args) {
            const payload = args[0];
            if (failAuditLog && payload?.targetId?.toString() === campFail3._id.toString()) {
                throw new Error("Simulated AuditLog database write collision failure");
            }
            return originalAuditLogCreate(...args);
        };

        const failRes3 = await fetch(`${baseUrl}/admin/campaigns/${campFail3._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({ reason: "Testing AuditLog partial failure" })
        });
        const failJson3 = await failRes3.json();

        if (failRes3.status === 500 && failJson3.message.includes("AuditLog creation error")) {
            console.log(`✓ 10C-1. API correctly reported partial failure (status 500): "${failJson3.message}"`);
        } else {
            throw new Error(`Expected 500 reporting partial AuditLog failure, got ${failRes3.status}: ${JSON.stringify(failJson3)}`);
        }

        const campDocAfterFail3 = await Campaign.findById(campFail3._id);
        const bookingDocAfterFail3 = await Booking.findById(bookingFail3._id);
        const auditLogFail3 = await AuditLog.findOne({
            targetId: campFail3._id,
            action: "CAMPAIGN_SAFE_DELETE"
        });

        if (campDocAfterFail3 === null) {
            console.log("✓ 10C-2. Campaign remains permanently deleted from MongoDB");
        } else {
            throw new Error("Campaign document was resurrected or not deleted!");
        }

        if (bookingDocAfterFail3 && bookingDocAfterFail3.status === "cancelled") {
            console.log(`✓ 10C-3. Pending booking remains cancelled (status: "${bookingDocAfterFail3.status}")`);
        } else {
            throw new Error(`Expected booking status to remain cancelled, got ${bookingDocAfterFail3?.status}`);
        }

        if (!auditLogFail3) {
            console.log("✓ 10C-4. Confirmed AuditLog entry was not created during failure");
        } else {
            throw new Error("AuditLog entry was unexpectedly created during failure simulation");
        }

        // Retry the delete request: Missing AuditLog must be recovered
        failAuditLog = false;
        AuditLog.create = originalAuditLogCreate;

        const retryRes3 = await fetch(`${baseUrl}/admin/campaigns/${campFail3._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `adminAccessToken=${adminToken}`
            },
            body: JSON.stringify({ reason: "Testing AuditLog partial failure retry" })
        });
        const retryJson3 = await retryRes3.json();

        if (retryRes3.status === 200 && retryJson3.message.includes("safely removed")) {
            console.log(`✓ 10C-5. Retry succeeded with 200 OK: "${retryJson3.message}"`);
        } else {
            throw new Error(`Expected 200 on retry, got ${retryRes3.status}: ${JSON.stringify(retryJson3)}`);
        }

        const recoveredAuditLog = await AuditLog.findOne({
            targetId: campFail3._id,
            action: "CAMPAIGN_SAFE_DELETE"
        });
        if (recoveredAuditLog) {
            trackedAuditLogIds.push(recoveredAuditLog._id);
            console.log("✓ 10C-6. Missing AuditLog entry successfully recovered on retry");
        } else {
            throw new Error("AuditLog entry was NOT recovered on retry!");
        }

        console.log("\n================================================================================");
        console.log("ALL ADMIN CAMPAIGN DELETE SCENARIOS PASSED WITH 100% SUCCESS!");
        console.log("================================================================================");

    } finally {
        // Guaranteed cleanup across all 9 tracked collections
        console.log("\nCleaning up test data in isolated test database across all 9 collections...");
        try {
            if (trackedCampaignIds.length > 0) {
                await Campaign.deleteMany({ _id: { $in: trackedCampaignIds } });
            }
            if (trackedBookingIds.length > 0) {
                await Booking.deleteMany({ _id: { $in: trackedBookingIds } });
            }
            if (trackedWorkspaceIds.length > 0) {
                await Workspace.deleteMany({ _id: { $in: trackedWorkspaceIds } });
            }
            if (trackedPaymentIds.length > 0) {
                await Payment.deleteMany({ _id: { $in: trackedPaymentIds } });
            }
            if (trackedReviewIds.length > 0) {
                await Review.deleteMany({ _id: { $in: trackedReviewIds } });
            }
            if (trackedNotificationIds.length > 0 || trackedAuthIds.length > 0) {
                await Notification.deleteMany({
                    $or: [
                        { _id: { $in: trackedNotificationIds } },
                        { sender: { $in: trackedAuthIds } },
                        { recipient: { $in: trackedAuthIds } }
                    ]
                });
            }
            if (trackedAuditLogIds.length > 0 || trackedAuthIds.length > 0) {
                await AuditLog.deleteMany({
                    $or: [
                        { _id: { $in: trackedAuditLogIds } },
                        { admin: { $in: trackedAuthIds } },
                        { targetId: { $in: trackedCampaignIds } }
                    ]
                });
            }
            if (trackedServiceIds.length > 0) {
                await CreatorService.deleteMany({ _id: { $in: trackedServiceIds } });
            }
            if (trackedAuthIds.length > 0) {
                await Auth.deleteMany({ _id: { $in: trackedAuthIds } });
            }
            console.log("✓ Guaranteed cleanup completed across all collections.");
        } catch (cleanupErr) {
            console.error("Cleanup error in finally block:", cleanupErr);
        }

        server.close();
        await mongoose.disconnect();
        console.log("✓ Disconnected from isolated test database");
    }
};

runAdminCampaignDeleteTests().catch((err) => {
    console.error("❌ Test suite failed with error:", err);
    process.exit(1);
});
