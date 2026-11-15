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
import Conversation from "../modules/messages/conversation.model.js";
import Message from "../modules/messages/message.model.js";
import Payment from "../modules/payments/payment.model.js";
import Review from "../modules/reviews/reviews.model.js";
import AuditLog from "../modules/admin/audit/audit.model.js";
import Notification from "../modules/notifications/notification.model.js";
import Subscription from "../modules/subscriptions/subscription.model.js";
import { createBrandTrialSubscriptionService } from "../modules/subscriptions/trial.service.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";
import {
    cancelCreatorBookingService,
    updateBrandBookingStatusService,
    updateCreatorBookingStatusService
} from "../modules/booking/booking.service.js";
import {
    cleanupWorkspaceForBooking,
    createWorkspaceForAcceptedBooking
} from "../modules/workspace/workspace.service.js";
import {
    overrideCollaborationStatusService
} from "../modules/admin/collaborations/collaborations.service.js";

const runWorkspaceProtectionTests = async () => {
    const { default: appRouter } = await import("../routes/index.js");
    console.log("================================================================================");
    console.log("STARTING CREATORLINK WORKSPACE CLEANUP PROTECTION VERIFICATION SUITE");
    console.log("================================================================================");

    // Enforce isolated test database
    const rawUri = process.env.MONGO_URI;
    if (!rawUri) {
        throw new Error("MONGO_URI environment variable is missing.");
    }
    const isolatedDbName = "creatorlink_workspace_protection_test";
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

    // Track document IDs for guaranteed multi-collection cleanup
    const trackedAuthIds = [];
    const trackedServiceIds = [];
    const trackedCampaignIds = [];
    const trackedBookingIds = [];
    const trackedWorkspaceIds = [];
    const trackedConversationIds = [];
    const trackedMessageIds = [];
    const trackedPaymentIds = [];
    const trackedReviewIds = [];
    const trackedAuditLogIds = [];

    let adminUser = null;
    let creatorUser = null;
    let brandUser = null;
    let testService = null;
    let testCampaign = null;

    try {
        // Initialize test accounts
        adminUser = await Auth.create({
            name: "Admin Protect Tester",
            email: `admin_ws_protect_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            role: "admin",
            isEmailVerified: true
        });
        trackedAuthIds.push(adminUser._id);

        creatorUser = await Auth.create({
            name: "Creator Protect Tester",
            email: `creator_ws_protect_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            role: "creator",
            isEmailVerified: true
        });
        trackedAuthIds.push(creatorUser._id);

        brandUser = await Auth.create({
            name: "Brand Protect Tester",
            email: `brand_ws_protect_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            role: "brand",
            isEmailVerified: true
        });
        trackedAuthIds.push(brandUser._id);

        // Grant active trial subscription to brand
        await createBrandTrialSubscriptionService({
            brandId: brandUser._id,
            email: brandUser.email,
            name: brandUser.name
        });

        testService = await CreatorService.create({
            creator: creatorUser._id,
            title: "Tech Promotion Package",
            category: "Technology",
            platform: "youtube",
            price: 20000,
            deliveryTime: 7,
            isActive: true
        });
        trackedServiceIds.push(testService._id);

        const createTestCampaign = async (suffix) => {
            const camp = await Campaign.create({
                brand: brandUser._id,
                title: `Workspace Protection Test Campaign - ${suffix}`,
                description: "Campaign to verify collaboration workspace preservation rules",
                category: "Technology",
                platform: ["youtube"],
                budget: 60000,
                deadline: new Date(Date.now() + 86400000 * 30),
                requiredCreators: 3,
                deliverables: ["1 Video Review"],
                status: "published"
            });
            trackedCampaignIds.push(camp._id);
            return camp;
        };

        console.log("✓ Initialized isolated test fixtures (Admin, Brand, Creator, Service)");

        // -------------------------------------------------------------
        // TEST 1: Pending Booking withdrawal when no Workspace exists
        // ------------------------
        // -------------------------------------
        console.log("\n--- TEST 1: Pending Booking withdrawal when no Workspace exists ---");
        const camp1 = await createTestCampaign("1");
        const booking1 = await Booking.create({
            campaign: camp1._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "pending",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking1._id);

        const cancelledBooking1 = await cancelCreatorBookingService(creatorUser._id.toString(), booking1._id.toString());
        const wsCheck1 = await Workspace.findOne({ booking: booking1._id });

        if (cancelledBooking1.status === "cancelled" && wsCheck1 === null) {
            console.log("✓ 1. Creator successfully withdrew pending application; status updated to cancelled with 0 workspaces created");
        } else {
            throw new Error(`Test 1 failed: status=${cancelledBooking1.status}, wsExists=${!!wsCheck1}`);
        }

        // -------------------------------------------------------------
        // TEST 2: Pending Booking rejection when no Workspace exists
        // -------------------------------------------------------------
        console.log("\n--- TEST 2: Pending Booking rejection when no Workspace exists ---");
        const camp2 = await createTestCampaign("2");
        const booking2 = await Booking.create({
            campaign: camp2._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "pending",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking2._id);

        const rejectedBooking2 = await updateBrandBookingStatusService(
            brandUser._id.toString(),
            booking2._id.toString(),
            "rejected"
        );
        const wsCheck2 = await Workspace.findOne({ booking: booking2._id });

        if (rejectedBooking2.status === "rejected" && wsCheck2 === null) {
            console.log("✓ 2. Brand successfully declined pending application; status updated to rejected with 0 workspaces created");
        } else {
            throw new Error(`Test 2 failed: status=${rejectedBooking2.status}, wsExists=${!!wsCheck2}`);
        }

        // -------------------------------------------------------------
        // TEST 3: Cancelled Workspace preservation without hard deletion
        // -------------------------------------------------------------
        console.log("\n--- TEST 3: Cancelled Workspace preservation without hard deletion ---");
        const camp3 = await createTestCampaign("3");
        const booking3 = await Booking.create({
            campaign: camp3._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "cancelled",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking3._id);

        const ws3 = await Workspace.create({
            booking: booking3._id,
            campaign: camp3._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: [{ title: "Deliverable 1", status: "pending" }],
            status: "cancelled"
        });
        trackedWorkspaceIds.push(ws3._id);

        await cleanupWorkspaceForBooking(booking3._id.toString());
        const refreshedWs3 = await Workspace.findById(ws3._id);

        if (refreshedWs3 && refreshedWs3.status === "cancelled") {
            console.log("✓ 3. Workspace with status 'cancelled' preserved in MongoDB without hard deletion; status remains 'cancelled'");
        } else {
            throw new Error(`Test 3 failed: ws=${JSON.stringify(refreshedWs3)}`);
        }

        // -------------------------------------------------------------
        // TEST 3B: In-progress Workspace protection (remains in_progress)
        // -------------------------------------------------------------
        console.log("\n--- TEST 3B: In-progress Workspace protection (remains in_progress) ---");
        const camp3B = await createTestCampaign("3B");
        const booking3B = await Booking.create({
            campaign: camp3B._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "cancelled",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking3B._id);

        const ws3B = await Workspace.create({
            booking: booking3B._id,
            campaign: camp3B._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: [{ title: "Deliverable 1", status: "pending" }],
            status: "in_progress"
        });
        trackedWorkspaceIds.push(ws3B._id);

        await cleanupWorkspaceForBooking(booking3B._id.toString());
        const refreshedWs3B = await Workspace.findById(ws3B._id);

        if (refreshedWs3B && refreshedWs3B.status === "in_progress") {
            console.log("✓ 3B. In-progress workspace strictly protected: not deleted, cancelled, or downgraded (status remains 'in_progress')");
        } else {
            throw new Error(`Test 3B failed: in_progress workspace was mutated: ${JSON.stringify(refreshedWs3B)}`);
        }

        // -------------------------------------------------------------
        // TEST 4: Completed Workspace preservation
        // -------------------------------------------------------------
        console.log("\n--- TEST 4: Completed Workspace preservation ---");
        const camp4 = await createTestCampaign("4");
        const booking4 = await Booking.create({
            campaign: camp4._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "cancelled",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking4._id);

        const ws4 = await Workspace.create({
            booking: booking4._id,
            campaign: camp4._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: [{ title: "Deliverable 1", status: "completed", approvedAt: new Date() }],
            status: "completed"
        });
        trackedWorkspaceIds.push(ws4._id);

        await cleanupWorkspaceForBooking(booking4._id.toString());
        const refreshedWs4 = await Workspace.findById(ws4._id);

        if (refreshedWs4 && refreshedWs4.status === "completed") {
            console.log("✓ 4. Completed workspace strictly preserved without deletion and status remains 'completed'");
        } else {
            throw new Error(`Test 4 failed: completed workspace was mutated: ${JSON.stringify(refreshedWs4)}`);
        }

        // -------------------------------------------------------------
        // TEST 5: Active/protected Workspace preservation
        // -------------------------------------------------------------
        console.log("\n--- TEST 5: Active/protected Workspace preservation ---");
        const camp5 = await createTestCampaign("5");
        const booking5 = await Booking.create({
            campaign: camp5._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "cancelled",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking5._id);

        const ws5 = await Workspace.create({
            booking: booking5._id,
            campaign: camp5._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: [{ title: "Deliverable 1", status: "submitted" }],
            status: "submitted"
        });
        trackedWorkspaceIds.push(ws5._id);

        await cleanupWorkspaceForBooking(booking5._id.toString());
        const refreshedWs5 = await Workspace.findById(ws5._id);

        if (refreshedWs5 && refreshedWs5.status === "submitted") {
            console.log("✓ 5. Submitted active workspace preserved and not deleted or downgraded");
        } else {
            throw new Error(`Test 5 failed: ws5 mutated: ${JSON.stringify(refreshedWs5)}`);
        }

        // -------------------------------------------------------------
        // TEST 6: Workspace with deliverable submissions/version history preservation
        // -------------------------------------------------------------
        console.log("\n--- TEST 6: Workspace with deliverable submissions/version history preservation ---");
        const camp6 = await createTestCampaign("6");
        const booking6 = await Booking.create({
            campaign: camp6._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "cancelled",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking6._id);

        const ws6 = await Workspace.create({
            booking: booking6._id,
            campaign: camp6._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: [{
                title: "Deliverable with Submissions",
                status: "revision_requested",
                revisionCount: 1,
                submissions: [{
                    version: 1,
                    title: "Draft 1",
                    link: "https://youtube.com/watch?v=sample1",
                    submittedAt: new Date()
                }]
            }],
            status: "revision_requested"
        });
        trackedWorkspaceIds.push(ws6._id);

        await cleanupWorkspaceForBooking(booking6._id.toString());
        const refreshedWs6 = await Workspace.findById(ws6._id);

        if (refreshedWs6 && refreshedWs6.deliverables[0].submissions.length === 1) {
            console.log("✓ 6. Workspace with deliverable version history preserved completely intact");
        } else {
            throw new Error(`Test 6 failed: submission history lost: ${JSON.stringify(refreshedWs6)}`);
        }

        // -------------------------------------------------------------
        // TEST 7: Workspace with Payment preservation
        // -------------------------------------------------------------
        console.log("\n--- TEST 7: Workspace with Payment preservation ---");
        const camp7 = await createTestCampaign("7");
        const booking7 = await Booking.create({
            campaign: camp7._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "cancelled",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking7._id);

        const ws7 = await Workspace.create({
            booking: booking7._id,
            campaign: camp7._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: [{ title: "Deliverable 1", status: "pending" }],
            status: "in_progress"
        });
        trackedWorkspaceIds.push(ws7._id);

        const payment7 = await Payment.create({
            workspace: ws7._id,
            booking: booking7._id,
            campaign: camp7._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            amount: 20000,
            currency: "INR",
            status: "paid",
            paymentMethod: "RAZORPAY_TEST"
        });
        trackedPaymentIds.push(payment7._id);

        await cleanupWorkspaceForBooking(booking7._id.toString());
        const refreshedWs7 = await Workspace.findById(ws7._id);
        const checkPayment7 = await Payment.findById(payment7._id);

        if (refreshedWs7 && checkPayment7 && checkPayment7.workspace.toString() === ws7._id.toString()) {
            console.log("✓ 7. Workspace with linked Payment record strictly preserved without dangling references");
        } else {
            throw new Error(`Test 7 failed: ws7=${!!refreshedWs7}, payment=${!!checkPayment7}`);
        }

        // -------------------------------------------------------------
        // TEST 8: Workspace with Review preservation
        // -------------------------------------------------------------
        console.log("\n--- TEST 8: Workspace with Review preservation ---");
        const camp8 = await createTestCampaign("8");
        const booking8 = await Booking.create({
            campaign: camp8._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "cancelled",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking8._id);

        const ws8 = await Workspace.create({
            booking: booking8._id,
            campaign: camp8._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: [{ title: "Deliverable 1", status: "completed" }],
            status: "completed"
        });
        trackedWorkspaceIds.push(ws8._id);

        const review8 = await Review.create({
            workspace: ws8._id,
            booking: booking8._id,
            campaign: camp8._id,
            reviewer: brandUser._id,
            reviewee: creatorUser._id,
            rating: 5,
            comment: "Exceptional collaboration delivery."
        });
        trackedReviewIds.push(review8._id);

        await cleanupWorkspaceForBooking(booking8._id.toString());
        const refreshedWs8 = await Workspace.findById(ws8._id);
        const checkReview8 = await Review.findById(review8._id);

        if (refreshedWs8 && checkReview8 && checkReview8.workspace.toString() === ws8._id.toString()) {
            console.log("✓ 8. Workspace with linked Review record strictly preserved without dangling references");
        } else {
            throw new Error(`Test 8 failed: ws8=${!!refreshedWs8}, review=${!!checkReview8}`);
        }

        // -------------------------------------------------------------
        // TEST 9: Conversation and Message history preservation
        // -------------------------------------------------------------
        console.log("\n--- TEST 9: Conversation and Message history preservation ---");
        const camp9 = await createTestCampaign("9");
        const booking9 = await Booking.create({
            campaign: camp9._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "cancelled",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking9._id);

        const conv9 = await Conversation.create({
            participants: [brandUser._id, creatorUser._id],
            booking: booking9._id,
            campaign: camp9._id,
            lastMessage: "Looking forward to collaborating",
            lastMessageAt: new Date()
        });
        trackedConversationIds.push(conv9._id);

        const msg9A = await Message.create({
            conversation: conv9._id,
            sender: brandUser._id,
            receiver: creatorUser._id,
            message: "Hello, welcome to the campaign collaboration."
        });
        trackedMessageIds.push(msg9A._id);

        const msg9B = await Message.create({
            conversation: conv9._id,
            sender: creatorUser._id,
            receiver: brandUser._id,
            message: "Thanks! Happy to discuss the deliverables."
        });
        trackedMessageIds.push(msg9B._id);

        await cleanupWorkspaceForBooking(booking9._id.toString());
        const checkConv9 = await Conversation.findById(conv9._id);
        const checkMsgCount = await Message.countDocuments({ conversation: conv9._id });

        if (checkConv9 && checkMsgCount === 2) {
            console.log("✓ 9. Conversation and all Message documents preserved; zero orphaned records created");
        } else {
            throw new Error(`Test 9 failed: convExists=${!!checkConv9}, msgCount=${checkMsgCount}`);
        }

        // -------------------------------------------------------------
        // TEST 10: Admin cancellation protection for ALL 5 protected Workspace statuses
        // -------------------------------------------------------------
        console.log("\n--- TEST 10: Admin cancellation protection for ALL 5 protected Workspace statuses ---");
        const protectedStatusesToTest = [
            { wsStatus: "completed", bookingStatus: "completed" },
            { wsStatus: "in_progress", bookingStatus: "accepted" },
            { wsStatus: "approved", bookingStatus: "accepted" },
            { wsStatus: "submitted", bookingStatus: "accepted" },
            { wsStatus: "revision_requested", bookingStatus: "accepted" }
        ];

        for (const item of protectedStatusesToTest) {
            const campProtected = await createTestCampaign(`10-${item.wsStatus}`);
            const bProtected = await Booking.create({
                campaign: campProtected._id,
                brand: brandUser._id,
                creator: creatorUser._id,
                service: testService._id,
                agreedPrice: 20000,
                deadline: new Date(Date.now() + 86400000 * 14),
                deliverables: ["1 Video Review"],
                status: item.bookingStatus,
                initiatedBy: "creator"
            });
            trackedBookingIds.push(bProtected._id);

            const wsProtected = await Workspace.create({
                booking: bProtected._id,
                campaign: campProtected._id,
                brand: brandUser._id,
                creator: creatorUser._id,
                service: testService._id,
                agreedPrice: 20000,
                deadline: new Date(Date.now() + 86400000 * 14),
                deliverables: [{
                    title: "Deliverable 1",
                    status: item.wsStatus === "completed" || item.wsStatus === "approved" ? "approved" : "pending"
                }],
                status: item.wsStatus
            });
            trackedWorkspaceIds.push(wsProtected._id);

            let adminOverrideBlocked = false;
            try {
                await overrideCollaborationStatusService(
                    wsProtected._id.toString(),
                    "cancelled",
                    `Admin cancellation attempt on ${item.wsStatus} workspace`,
                    adminUser._id.toString()
                );
            } catch (err) {
                if (err.statusCode === 400 && err.message.toLowerCase().includes("cannot cancel a collaboration")) {
                    adminOverrideBlocked = true;
                    console.log(`✓ 10 (${item.wsStatus}). Admin cancellation blocked with 400: "${err.message}"`);
                }
            }

            const checkWs = await Workspace.findById(wsProtected._id);
            const checkBooking = await Booking.findById(bProtected._id);

            if (adminOverrideBlocked && checkWs.status === item.wsStatus && checkBooking.status === item.bookingStatus) {
                console.log(`     Workspace (${checkWs.status}) and Booking (${checkBooking.status}) remained strictly unchanged in MongoDB`);
            } else {
                throw new Error(`Test 10 (${item.wsStatus}) failed: blocked=${adminOverrideBlocked}, wsStatus=${checkWs?.status}, bookingStatus=${checkBooking?.status}`);
            }
        }

        // Test 10-Downgrade: Admin override cannot downgrade protected statuses (e.g. approved -> in_progress)
        const campDowngrade = await createTestCampaign("10-downgrade");
        const bDowngrade = await Booking.create({
            campaign: campDowngrade._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "accepted",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(bDowngrade._id);

        const wsDowngrade = await Workspace.create({
            booking: bDowngrade._id,
            campaign: campDowngrade._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: [{ title: "Deliverable 1", status: "approved" }],
            status: "approved"
        });
        trackedWorkspaceIds.push(wsDowngrade._id);

        let downgradeBlocked = false;
        try {
            await overrideCollaborationStatusService(
                wsDowngrade._id.toString(),
                "in_progress",
                "Admin downgrade attempt from approved to in_progress",
                adminUser._id.toString()
            );
        } catch (err) {
            if (err.statusCode === 400 && err.message.toLowerCase().includes("cannot downgrade collaboration status")) {
                downgradeBlocked = true;
                console.log(`✓ 10 (Downgrade). Admin status downgrade blocked with 400: "${err.message}"`);
            }
        }

        const checkWsDowngrade = await Workspace.findById(wsDowngrade._id);
        const checkBDowngrade = await Booking.findById(bDowngrade._id);
        if (downgradeBlocked && checkWsDowngrade.status === "approved" && checkBDowngrade.status === "accepted") {
            console.log("     Approved workspace and accepted booking remained strictly unchanged against downgrade attempt");
        } else {
            throw new Error(`Test 10 (Downgrade) failed: blocked=${downgradeBlocked}, wsStatus=${checkWsDowngrade?.status}`);
        }

        // -------------------------------------------------------------
        // TEST 11: Concurrent acceptance attempts
        // -------------------------------------------------------------
        console.log("\n--- TEST 11: Concurrency safety during simultaneous acceptance attempts ---");
        const camp11 = await createTestCampaign("11");
        const booking11 = await Booking.create({
            campaign: camp11._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "pending",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking11._id);

        // Fire 2 concurrent acceptance calls simultaneously
        const [res11A, res11B] = await Promise.allSettled([
            updateBrandBookingStatusService(brandUser._id.toString(), booking11._id.toString(), "accepted"),
            updateBrandBookingStatusService(brandUser._id.toString(), booking11._id.toString(), "accepted")
        ]);

        const wsList11 = await Workspace.find({ booking: booking11._id });
        const finalBooking11 = await Booking.findById(booking11._id);
        trackedWorkspaceIds.push(...wsList11.map((w) => w._id));

        if (finalBooking11.status === "accepted" && wsList11.length === 1) {
            console.log("✓ 11. Concurrent acceptance calls settled safely; exactly ONE Workspace created with status 'accepted'");
        } else {
            throw new Error(`Test 11 failed: bookingStatus=${finalBooking11.status}, wsCount=${wsList11.length}`);
        }

        // -------------------------------------------------------------
        // TEST 12: Workspace creation failure and safe Booking rollback/recovery
        // -------------------------------------------------------------
        console.log("\n--- TEST 12: Workspace creation failure and safe Booking rollback/recovery ---");
        const camp12 = await createTestCampaign("12");
        const booking12 = await Booking.create({
            campaign: camp12._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "pending",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking12._id);

        const originalWorkspaceCreate = Workspace.create.bind(Workspace);
        let failWsCreate = true;
        Workspace.create = async function (...args) {
            if (failWsCreate) {
                throw new Error("Simulated database failure during Workspace creation");
            }
            return originalWorkspaceCreate(...args);
        };

        let rollbackCaught = false;
        try {
            await updateBrandBookingStatusService(brandUser._id.toString(), booking12._id.toString(), "accepted");
        } catch (err) {
            rollbackCaught = true;
            console.log(`✓ 12A. Caught expected workspace failure error: "${err.message}"`);
        } finally {
            failWsCreate = false;
            Workspace.create = originalWorkspaceCreate;
        }

        const rolledBackBooking12 = await Booking.findById(booking12._id);
        const wsCheck12 = await Workspace.findOne({ booking: booking12._id });

        if (rollbackCaught && rolledBackBooking12.status === "pending" && wsCheck12 === null) {
            console.log("✓ 12B. Compensating rollback restored Booking status to 'pending' without leaving orphaned state");
        } else {
            throw new Error(`Test 12 failed: status=${rolledBackBooking12?.status}, wsExists=${!!wsCheck12}`);
        }

        // -------------------------------------------------------------
        // TEST 13: No duplicate Workspace creation on repeated calls
        // -------------------------------------------------------------
        console.log("\n--- TEST 13: Idempotent Workspace initialization (No duplicates) ---");
        const camp13 = await createTestCampaign("13");
        const booking13 = await Booking.create({
            campaign: camp13._id,
            brand: brandUser._id,
            creator: creatorUser._id,
            service: testService._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            deliverables: ["1 Video Review"],
            status: "accepted",
            initiatedBy: "creator"
        });
        trackedBookingIds.push(booking13._id);

        const wsCall1 = await createWorkspaceForAcceptedBooking(booking13);
        const wsCall2 = await createWorkspaceForAcceptedBooking(booking13);
        trackedWorkspaceIds.push(wsCall1._id);

        const totalWs13 = await Workspace.countDocuments({ booking: booking13._id });

        if (totalWs13 === 1 && wsCall1._id.toString() === wsCall2._id.toString()) {
            console.log("✓ 13. Repeated createWorkspaceForAcceptedBooking calls returned identical workspace; duplicate count is exactly 0");
        } else {
            throw new Error(`Test 13 failed: totalWs=${totalWs13}, ws1=${wsCall1?._id}, ws2=${wsCall2?._id}`);
        }

        console.log("\n================================================================================");
        console.log("ALL 14 WORKSPACE CLEANUP PROTECTION TESTS PASSED WITH 100% SUCCESS!");
        console.log("================================================================================");

    } finally {
        console.log("\nCleaning up test data in isolated test database...");
        try {
            if (trackedMessageIds.length > 0) {
                await Message.deleteMany({ _id: { $in: trackedMessageIds } });
            }
            if (trackedConversationIds.length > 0) {
                await Conversation.deleteMany({ _id: { $in: trackedConversationIds } });
            }
            if (trackedReviewIds.length > 0) {
                await Review.deleteMany({ _id: { $in: trackedReviewIds } });
            }
            if (trackedPaymentIds.length > 0) {
                await Payment.deleteMany({ _id: { $in: trackedPaymentIds } });
            }
            if (trackedWorkspaceIds.length > 0) {
                await Workspace.deleteMany({ _id: { $in: trackedWorkspaceIds } });
            }
            if (trackedBookingIds.length > 0) {
                await Booking.deleteMany({ _id: { $in: trackedBookingIds } });
            }
            if (trackedCampaignIds.length > 0) {
                await Campaign.deleteMany({ _id: { $in: trackedCampaignIds } });
            }
            if (trackedServiceIds.length > 0) {
                await CreatorService.deleteMany({ _id: { $in: trackedServiceIds } });
            }
            if (trackedAuthIds.length > 0) {
                await Subscription.deleteMany({ brand: { $in: trackedAuthIds } });
                await Notification.deleteMany({
                    $or: [
                        { recipient: { $in: trackedAuthIds } },
                        { sender: { $in: trackedAuthIds } }
                    ]
                });
                await AuditLog.deleteMany({ admin: { $in: trackedAuthIds } });
                await Auth.deleteMany({ _id: { $in: trackedAuthIds } });
            }
            console.log("✓ Guaranteed multi-collection cleanup completed successfully.");
        } catch (cleanupErr) {
            console.error("Cleanup error in finally block:", cleanupErr);
        }

        server.close();
        await mongoose.disconnect();
        console.log("✓ Disconnected from isolated test database");
    }
};

runWorkspaceProtectionTests().catch((err) => {
    console.error("❌ Workspace protection test failed:", err);
    process.exit(1);
});
