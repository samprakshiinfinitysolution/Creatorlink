import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
dotenv.config();

// Ensure dummy email credentials exist for nodemailer if not in .env
process.env.SMTP_SERVICE = process.env.SMTP_SERVICE || "gmail";
process.env.SMTP_USER = process.env.SMTP_USER || process.env.EMAIL || "test@creatorlink.test";
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
import { initializeSocket, getIO } from "../socket/socket.js";

const runBrandCampaignDeleteTests = async () => {
    const { default: appRouter } = await import("../routes/index.js");
    console.log("================================================================================");
    console.log("STARTING BRAND CAMPAIGN DELETE INTEGRATION AND REGRESSION TEST SUITE");
    console.log("================================================================================");

    // Enforce isolated test database
    const rawUri = process.env.MONGO_URI;
    if (!rawUri) {
        throw new Error("MONGO_URI environment variable is missing.");
    }
    const isolatedDbName = "creatorlink_brand_delete_test";
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

    let brand1 = null;
    let brand2 = null;
    let creator1 = null;
    let creator2 = null;
    let adminUser = null;

    let brand1Token = "";
    let brand2Token = "";
    let creator1Token = "";
    let adminToken = "";

    try {
        // Setup isolated test users
        brand1 = await Auth.create({
            email: `test_brand1_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            name: "Test Brand 1",
            role: "brand",
            isEmailVerified: true
        });
        trackedAuthIds.push(brand1._id);

        brand2 = await Auth.create({
            email: `test_brand2_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            name: "Test Brand 2",
            role: "brand",
            isEmailVerified: true
        });
        trackedAuthIds.push(brand2._id);

        creator1 = await Auth.create({
            email: `test_creator1_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            name: "Test Creator 1",
            role: "creator",
            isEmailVerified: true
        });
        trackedAuthIds.push(creator1._id);

        creator2 = await Auth.create({
            email: `test_creator2_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            name: "Test Creator 2",
            role: "creator",
            isEmailVerified: true
        });
        trackedAuthIds.push(creator2._id);

        adminUser = await Auth.create({
            email: `test_admin_${Date.now()}@creatorlink.test`,
            password: "Password123!",
            name: "Test Admin",
            role: "admin",
            isEmailVerified: true
        });
        trackedAuthIds.push(adminUser._id);

        const testService1 = await CreatorService.create({
            creator: creator1._id,
            title: "Test Social Promotion 1",
            category: "Technology",
            platform: "youtube",
            price: 20000,
            deliveryTime: 7,
            isActive: true
        });
        trackedServiceIds.push(testService1._id);

        const testService2 = await CreatorService.create({
            creator: creator2._id,
            title: "Test Social Promotion 2",
            category: "Technology",
            platform: "instagram",
            price: 15000,
            deliveryTime: 5,
            isActive: true
        });
        trackedServiceIds.push(testService2._id);

        brand1Token = generateAccessToken({ userId: brand1._id.toString(), role: "brand", tokenVersion: 0 });
        brand2Token = generateAccessToken({ userId: brand2._id.toString(), role: "brand", tokenVersion: 0 });
        creator1Token = generateAccessToken({ userId: creator1._id.toString(), role: "creator", tokenVersion: 0 });
        adminToken = generateAccessToken({ userId: adminUser._id.toString(), role: "admin", tokenVersion: 0 });

        console.log("✓ Initialized isolated test users (Brand 1, Brand 2, Creator 1, Creator 2, Admin)");

        const createTestCampaign = async (brandId, titleSuffix = "General") => {
            const camp = await Campaign.create({
                brand: brandId,
                title: `Brand Campaign Delete Test - ${titleSuffix} ${Date.now()}`,
                description: "Integration test for brand campaign delete",
                category: "Technology",
                platform: ["instagram"],
                budget: 30000,
                deadline: new Date(Date.now() + 86400000 * 14),
                requiredCreators: 2,
                deliverables: ["1 Instagram Reel"],
                status: "published"
            });
            trackedCampaignIds.push(camp._id);
            return camp;
        };

        // -------------------------------------------------------------
        // SCENARIO 1: Authentication & Authorization (RBAC)
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 1: RBAC & Authorization Verification ---");
        const fakeCampId = new mongoose.Types.ObjectId();

        const unauthRes = await fetch(`${baseUrl}/brand/campaigns/${fakeCampId}`, {
            method: "DELETE"
        });
        if (unauthRes.status === 401) {
            console.log("✓ 1A. Unauthenticated request rejected with 401 Unauthorized");
        } else {
            throw new Error(`Expected 401 for unauth request, got ${unauthRes.status}`);
        }

        const creatorRes = await fetch(`${baseUrl}/brand/campaigns/${fakeCampId}`, {
            method: "DELETE",
            headers: { Cookie: `accessToken=${creator1Token}` }
        });
        if (creatorRes.status === 403) {
            console.log("✓ 1B. Creator request rejected with 403 Forbidden");
        } else {
            throw new Error(`Expected 403 for creator role, got ${creatorRes.status}`);
        }

        const adminRes = await fetch(`${baseUrl}/brand/campaigns/${fakeCampId}`, {
            method: "DELETE",
            headers: { Cookie: `accessToken=${adminToken}` }
        });
        if (adminRes.status === 403) {
            console.log("✓ 1C. Admin request on Brand route rejected with 403 Forbidden");
        } else {
            throw new Error(`Expected 403 for admin role on brand route, got ${adminRes.status}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 2: Brand deletes campaign with NO Bookings
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 2: Brand deletes campaign with NO Bookings ---");
        const campNoBookings = await createTestCampaign(brand1._id, "No Bookings");

        const deleteNoBookingsRes = await fetch(`${baseUrl}/brand/campaigns/${campNoBookings._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            },
            body: JSON.stringify({ reason: "No longer needed" })
        });
        const deleteNoBookingsJson = await deleteNoBookingsRes.json();

        if (deleteNoBookingsRes.status === 200 && deleteNoBookingsJson.success) {
            console.log(`✓ 2A. Deletion succeeded with 200 OK: "${deleteNoBookingsJson.message}"`);
        } else {
            throw new Error(`Expected 200 for deletion with no bookings, got ${deleteNoBookingsRes.status}: ${JSON.stringify(deleteNoBookingsJson)}`);
        }

        const campDocAfterDel = await Campaign.findById(campNoBookings._id);
        if (campDocAfterDel === null) {
            console.log("✓ 2B. Campaign document is permanently deleted from MongoDB (Hard Delete verified)");
        } else {
            throw new Error("Campaign document still exists in MongoDB!");
        }

        const auditLog2 = await AuditLog.findOne({
            targetId: campNoBookings._id,
            action: "BRAND_CAMPAIGN_DELETE"
        });
        if (auditLog2 && auditLog2.admin.toString() === brand1._id.toString() && auditLog2.metadata?.actorRole === "brand") {
            trackedAuditLogIds.push(auditLog2._id);
            console.log("✓ 2C. AuditLog created with action BRAND_CAMPAIGN_DELETE and brand actor details");
        } else {
            throw new Error("AuditLog was not properly created for brand campaign delete!");
        }

        const brandNotif2 = await Notification.findOne({
            idempotencyKey: `notif_brand_camp_del_${campNoBookings._id}_brand`
        });
        if (brandNotif2 && brandNotif2.recipient.toString() === brand1._id.toString()) {
            trackedNotificationIds.push(brandNotif2._id);
            console.log("✓ 2D. Brand confirmation notification created with deterministic key");
        } else {
            throw new Error("Brand confirmation notification was not created!");
        }

        const brandSocketEvent = emittedSocketEvents.find(
            (e) => e.room === `user:${brand1._id}` && e.eventName === "notification:new"
        );
        if (brandSocketEvent) {
            console.log("✓ 2E. Socket.IO notification event emitted to brand user room");
        } else {
            throw new Error("Socket.IO event was not emitted to brand room!");
        }

        // -------------------------------------------------------------
        // SCENARIOS 3 & 4: Brand deletes campaign with ONLY pending Bookings
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 3 & 4: Pending Bookings Transition & Creator Notifications ---");
        const campWithPending = await createTestCampaign(brand1._id, "Pending Bookings");

        const booking1 = await Booking.create({
            campaign: campWithPending._id,
            brand: brand1._id,
            creator: creator1._id,
            service: testService1._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Reel"],
            status: "pending"
        });
        trackedBookingIds.push(booking1._id);

        const booking2 = await Booking.create({
            campaign: campWithPending._id,
            brand: brand1._id,
            creator: creator2._id,
            service: testService2._id,
            agreedPrice: 15000,
            deadline: new Date(Date.now() + 86400000 * 8),
            deliverables: ["1 Story"],
            status: "pending"
        });
        trackedBookingIds.push(booking2._id);

        const deletePendingRes = await fetch(`${baseUrl}/brand/campaigns/${campWithPending._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            },
            body: JSON.stringify({ reason: "Campaign cancelled due to strategy change" })
        });
        const deletePendingJson = await deletePendingRes.json();

        if (deletePendingRes.status === 200 && deletePendingJson.success) {
            console.log(`✓ 3A. Deletion with pending bookings succeeded: "${deletePendingJson.message}"`);
        } else {
            throw new Error(`Expected 200 for deletion with pending bookings, got ${deletePendingRes.status}`);
        }

        const campDocAfterDel2 = await Campaign.findById(campWithPending._id);
        if (campDocAfterDel2 === null) {
            console.log("✓ 3B. Campaign document permanently hard-deleted from MongoDB");
        } else {
            throw new Error("Campaign document was not hard deleted!");
        }

        const b1After = await Booking.findById(booking1._id);
        const b2After = await Booking.findById(booking2._id);

        if (
            b1After.status === "cancelled" &&
            b1After.rejectionReason === "campaign_deleted" &&
            b2After.status === "cancelled" &&
            b2After.rejectionReason === "campaign_deleted"
        ) {
            console.log("✓ 3C. Both pending Bookings safely transitioned to 'cancelled' with rejectionReason: 'campaign_deleted'");
        } else {
            throw new Error(`Bookings status invalid! b1: ${b1After?.status}/${b1After?.rejectionReason}, b2: ${b2After?.status}/${b2After?.rejectionReason}`);
        }

        // Check creator notifications
        const notifCreator1 = await Notification.findOne({
            idempotencyKey: `notif_brand_camp_del_${campWithPending._id}_${booking1._id}`
        });
        const notifCreator2 = await Notification.findOne({
            idempotencyKey: `notif_brand_camp_del_${campWithPending._id}_${booking2._id}`
        });

        if (notifCreator1 && notifCreator2) {
            trackedNotificationIds.push(notifCreator1._id, notifCreator2._id);
            console.log("✓ 4A. Affected Creators both received notifications with deterministic idempotency keys");
            if (notifCreator1.message.includes("cancelled") && notifCreator1.message.includes("strategy change")) {
                console.log("✓ 4B. Notification message correctly contains brand reason");
            }
        } else {
            throw new Error("One or both Creator notifications were missing!");
        }

        const creator1Socket = emittedSocketEvents.find((e) => e.room === `user:${creator1._id}` && e.eventName === "notification:new");
        const creator2Socket = emittedSocketEvents.find((e) => e.room === `user:${creator2._id}` && e.eventName === "notification:new");
        if (creator1Socket && creator2Socket) {
            console.log("✓ 4C. Socket.IO notification events dispatched to both affected Creators");
        } else {
            throw new Error("Socket events missing for one or both creators!");
        }

        // -------------------------------------------------------------
        // SCENARIO 5: Duplicate Prevention on Retry
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 5: Duplicate Notifications Prevented on Retry ---");
        const initialNotifCount = await Notification.countDocuments({
            idempotencyKey: {
                $in: [
                    `notif_brand_camp_del_${campWithPending._id}_${booking1._id}`,
                    `notif_brand_camp_del_${campWithPending._id}_${booking2._id}`,
                    `notif_brand_camp_del_${campWithPending._id}_brand`
                ]
            }
        });

        const retryRes = await fetch(`${baseUrl}/brand/campaigns/${campWithPending._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            },
            body: JSON.stringify({ reason: "Retrying delete operation" })
        });
        const retryJson = await retryRes.json();

        if (retryRes.status === 200 && retryJson.message.includes("safely removed")) {
            console.log(`✓ 5A. Retry succeeded idempotently with 200 OK: "${retryJson.message}"`);
        } else {
            throw new Error(`Expected 200 on retry, got ${retryRes.status}: ${JSON.stringify(retryJson)}`);
        }

        const countAfterRetry = await Notification.countDocuments({
            idempotencyKey: {
                $in: [
                    `notif_brand_camp_del_${campWithPending._id}_${booking1._id}`,
                    `notif_brand_camp_del_${campWithPending._id}_${booking2._id}`,
                    `notif_brand_camp_del_${campWithPending._id}_brand`
                ]
            }
        });

        if (countAfterRetry === initialNotifCount) {
            console.log("✓ 5B. Zero duplicate Notification documents created on retry (idempotency key protection confirmed)");
        } else {
            throw new Error(`Duplicate notifications created! Expected ${initialNotifCount}, got ${countAfterRetry}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 6: Brand cannot delete another Brand's campaign (403 Forbidden)
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 6: Cross-Brand Deletion Prevention (403 Forbidden) ---");
        const campBrand1 = await createTestCampaign(brand1._id, "Brand 1 Only");

        const crossBrandRes = await fetch(`${baseUrl}/brand/campaigns/${campBrand1._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand2Token}`
            }
        });
        const crossBrandJson = await crossBrandRes.json();

        if (crossBrandRes.status === 403) {
            console.log(`✓ 6A. Cross-brand delete attempt blocked with 403 Forbidden: "${crossBrandJson.message}"`);
        } else {
            throw new Error(`Expected 403 for cross-brand deletion, got ${crossBrandRes.status}: ${JSON.stringify(crossBrandJson)}`);
        }

        const campStillExists = await Campaign.findById(campBrand1._id);
        if (campStillExists) {
            console.log("✓ 6B. Target campaign document remains untouched in MongoDB");
        } else {
            throw new Error("Target campaign was unexpectedly deleted!");
        }

        // -------------------------------------------------------------
        // SCENARIO 7: Block deletion with accepted Booking (400 Bad Request)
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 7: Block deletion with accepted Booking ---");
        const campAccepted = await createTestCampaign(brand1._id, "Accepted Booking");

        const acceptedBooking = await Booking.create({
            campaign: campAccepted._id,
            brand: brand1._id,
            creator: creator1._id,
            service: testService1._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Reel"],
            status: "accepted"
        });
        trackedBookingIds.push(acceptedBooking._id);

        const deleteAcceptedRes = await fetch(`${baseUrl}/brand/campaigns/${campAccepted._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            }
        });
        const deleteAcceptedJson = await deleteAcceptedRes.json();

        if (deleteAcceptedRes.status === 400 && deleteAcceptedJson.message.includes("accepted collaboration")) {
            console.log(`✓ 7A. Deletion blocked with 400 Bad Request: "${deleteAcceptedJson.message}"`);
        } else {
            throw new Error(`Expected 400 for accepted booking, got ${deleteAcceptedRes.status}: ${JSON.stringify(deleteAcceptedJson)}`);
        }

        const campAcceptedCheck = await Campaign.findById(campAccepted._id);
        if (campAcceptedCheck) {
            console.log("✓ 7B. Campaign document remains untouched");
        } else {
            throw new Error("Campaign with accepted booking was unexpectedly deleted!");
        }

        // -------------------------------------------------------------
        // SCENARIO 8: Block deletion with in_progress Booking (400 Bad Request)
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 8: Block deletion with in_progress Booking ---");
        const campInProgress = await createTestCampaign(brand1._id, "In Progress Booking");

        const inProgressBooking = await Booking.create({
            campaign: campInProgress._id,
            brand: brand1._id,
            creator: creator1._id,
            service: testService1._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Reel"],
            status: "in_progress"
        });
        trackedBookingIds.push(inProgressBooking._id);

        const deleteInProgressRes = await fetch(`${baseUrl}/brand/campaigns/${campInProgress._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            }
        });
        const deleteInProgressJson = await deleteInProgressRes.json();

        if (deleteInProgressRes.status === 400 && deleteInProgressJson.message.includes("accepted collaboration")) {
            console.log(`✓ 8A. Deletion blocked with 400 Bad Request: "${deleteInProgressJson.message}"`);
        } else {
            throw new Error(`Expected 400 for in_progress booking, got ${deleteInProgressRes.status}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 9: Block deletion with completed Booking (400 Bad Request)
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 9: Block deletion with completed Booking ---");
        const campCompleted = await createTestCampaign(brand1._id, "Completed Booking");

        const completedBooking = await Booking.create({
            campaign: campCompleted._id,
            brand: brand1._id,
            creator: creator1._id,
            service: testService1._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Reel"],
            status: "completed"
        });
        trackedBookingIds.push(completedBooking._id);

        const deleteCompletedRes = await fetch(`${baseUrl}/brand/campaigns/${campCompleted._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            }
        });
        const deleteCompletedJson = await deleteCompletedRes.json();

        if (deleteCompletedRes.status === 400 && deleteCompletedJson.message.includes("completed bookings")) {
            console.log(`✓ 9A. Deletion blocked with 400 Bad Request: "${deleteCompletedJson.message}"`);
        } else {
            throw new Error(`Expected 400 for completed booking, got ${deleteCompletedRes.status}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 10: Block deletion with Workspace linked (400 Bad Request)
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 10: Block deletion with any Workspace linked ---");
        const campWorkspace = await createTestCampaign(brand1._id, "Workspace Linked");

        const dummyBooking10 = await Booking.create({
            campaign: campWorkspace._id,
            brand: brand1._id,
            creator: creator1._id,
            service: testService1._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Reel"],
            status: "pending"
        });
        trackedBookingIds.push(dummyBooking10._id);

        const testWorkspace = await Workspace.create({
            booking: dummyBooking10._id,
            campaign: campWorkspace._id,
            brand: brand1._id,
            creator: creator1._id,
            service: testService1._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 14),
            status: "in_progress"
        });
        trackedWorkspaceIds.push(testWorkspace._id);

        const deleteWorkspaceRes = await fetch(`${baseUrl}/brand/campaigns/${campWorkspace._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            }
        });
        const deleteWorkspaceJson = await deleteWorkspaceRes.json();

        if (deleteWorkspaceRes.status === 400 && deleteWorkspaceJson.message.includes("workspace(s) are linked")) {
            console.log(`✓ 10A. Deletion blocked with 400 Bad Request: "${deleteWorkspaceJson.message}"`);
        } else {
            throw new Error(`Expected 400 for workspace link, got ${deleteWorkspaceRes.status}: ${JSON.stringify(deleteWorkspaceJson)}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 11: Block deletion with Payment or Review history
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 11: Block deletion with Payment or Review history ---");
        // 11A: Payment history
        const campPayment = await createTestCampaign(brand1._id, "Payment Linked");
        const dummyBooking11 = await Booking.create({
            campaign: campPayment._id,
            brand: brand1._id,
            creator: creator1._id,
            service: testService1._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Reel"],
            status: "pending"
        });
        trackedBookingIds.push(dummyBooking11._id);

        const testPayment = await Payment.create({
            workspace: new mongoose.Types.ObjectId(),
            campaign: campPayment._id,
            booking: dummyBooking11._id,
            brand: brand1._id,
            creator: creator1._id,
            amount: 20000,
            currency: "inr",
            status: "paid",
            paymentMethod: "card"
        });
        trackedPaymentIds.push(testPayment._id);

        const deletePaymentRes = await fetch(`${baseUrl}/brand/campaigns/${campPayment._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            }
        });
        const deletePaymentJson = await deletePaymentRes.json();

        if (deletePaymentRes.status === 400 && deletePaymentJson.message.includes("payment record(s) are linked")) {
            console.log(`✓ 11A. Deletion blocked with 400 Bad Request due to Payment history: "${deletePaymentJson.message}"`);
        } else {
            throw new Error(`Expected 400 for payment record, got ${deletePaymentRes.status}: ${JSON.stringify(deletePaymentJson)}`);
        }

        // 11B: Review history
        const campReview = await createTestCampaign(brand1._id, "Review Linked");
        const dummyBooking11B = await Booking.create({
            campaign: campReview._id,
            brand: brand1._id,
            creator: creator2._id,
            service: testService2._id,
            agreedPrice: 15000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Story"],
            status: "pending"
        });
        trackedBookingIds.push(dummyBooking11B._id);

        const testReview = await Review.create({
            workspace: new mongoose.Types.ObjectId(),
            campaign: campReview._id,
            booking: dummyBooking11B._id,
            reviewer: brand1._id,
            reviewee: creator2._id,
            rating: 5,
            comment: "Great collaboration!"
        });
        trackedReviewIds.push(testReview._id);

        const deleteReviewRes = await fetch(`${baseUrl}/brand/campaigns/${campReview._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            }
        });
        const deleteReviewJson = await deleteReviewRes.json();

        if (deleteReviewRes.status === 400 && deleteReviewJson.message.includes("review record(s) are linked")) {
            console.log(`✓ 11B. Deletion blocked with 400 Bad Request due to Review history: "${deleteReviewJson.message}"`);
        } else {
            throw new Error(`Expected 400 for review record, got ${deleteReviewRes.status}: ${JSON.stringify(deleteReviewJson)}`);
        }

        // -------------------------------------------------------------
        // SCENARIO 12: Partial Failure & Retry Recovery
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 12: Partial Failure Handling & Retry Recovery ---");

        // 12A: Rollback on Campaign Deletion Failure
        console.log("\n--- 12A: Rollback on Campaign Deletion Failure ---");
        const campRollback = await createTestCampaign(brand1._id, "Rollback Test");
        const bookingRollback = await Booking.create({
            campaign: campRollback._id,
            brand: brand1._id,
            creator: creator1._id,
            service: testService1._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Reel"],
            status: "pending"
        });
        trackedBookingIds.push(bookingRollback._id);

        const originalFindByIdAndDelete = Campaign.findByIdAndDelete;
        Campaign.findByIdAndDelete = async function () {
            throw new Error("Simulated storage cluster write lock failure during findByIdAndDelete");
        };

        const rollbackRes = await fetch(`${baseUrl}/brand/campaigns/${campRollback._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            }
        });
        const rollbackJson = await rollbackRes.json();

        Campaign.findByIdAndDelete = originalFindByIdAndDelete;

        if (rollbackRes.status === 500 && rollbackJson.message.includes("Failed to permanently delete campaign")) {
            console.log(`✓ 12A-1. API cleanly caught campaign delete failure with 500: "${rollbackJson.message}"`);
        } else {
            throw new Error(`Expected 500 on simulated delete failure, got ${rollbackRes.status}`);
        }

        const rolledBackBooking = await Booking.findById(bookingRollback._id);
        if (rolledBackBooking && rolledBackBooking.status === "pending") {
            console.log("✓ 12A-2. Pending booking successfully rolled back to 'pending' after campaign delete failure");
        } else {
            throw new Error(`Booking was not rolled back! Status: ${rolledBackBooking?.status}`);
        }

        // 12B: Creator notification failure & recovery
        console.log("\n--- 12B: Creator Notification Failure & Recovery ---");
        const campFailCreator = await createTestCampaign(brand1._id, "Fail Creator Notif");
        const bookingFailCreator = await Booking.create({
            campaign: campFailCreator._id,
            brand: brand1._id,
            creator: creator1._id,
            service: testService1._id,
            agreedPrice: 20000,
            deadline: new Date(Date.now() + 86400000 * 10),
            deliverables: ["1 Reel"],
            status: "pending"
        });
        trackedBookingIds.push(bookingFailCreator._id);

        const originalNotifCreate = Notification.create;
        let blockCreatorNotif = true;
        Notification.create = async function (...args) {
            const payload = args[0];
            if (
                blockCreatorNotif &&
                payload?.recipient?.toString() === creator1._id.toString() &&
                payload?.metadata?.campaignId?.toString() === campFailCreator._id.toString()
            ) {
                throw new Error("Simulated transient socket pipeline failure for Creator notification");
            }
            return originalNotifCreate.apply(this, args);
        };

        const failCreatorRes = await fetch(`${baseUrl}/brand/campaigns/${campFailCreator._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            },
            body: JSON.stringify({ reason: "Testing creator notification failure" })
        });
        const failCreatorJson = await failCreatorRes.json();

        if (failCreatorRes.status === 500 && failCreatorJson.message.includes("Creator notification error")) {
            console.log(`✓ 12B-1. API correctly reported partial failure (status 500): "${failCreatorJson.message}"`);
        } else {
            throw new Error(`Expected 500 reporting creator notif failure, got ${failCreatorRes.status}: ${JSON.stringify(failCreatorJson)}`);
        }

        // Verify Campaign is deleted and booking is cancelled despite notification failure
        const campCheck12B = await Campaign.findById(campFailCreator._id);
        const bookingCheck12B = await Booking.findById(bookingFailCreator._id);
        if (campCheck12B === null && bookingCheck12B?.status === "cancelled") {
            console.log("✓ 12B-2. Campaign remains deleted and booking remains cancelled");
        } else {
            throw new Error("Campaign or booking state inconsistent after partial failure!");
        }

        // Unblock notification and retry
        blockCreatorNotif = false;
        Notification.create = originalNotifCreate;

        const retryCreatorRes = await fetch(`${baseUrl}/brand/campaigns/${campFailCreator._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            },
            body: JSON.stringify({ reason: "Retrying after creator notif unblocked" })
        });
        const retryCreatorJson = await retryCreatorRes.json();

        if (retryCreatorRes.status === 200 && retryCreatorJson.message.includes("safely removed")) {
            console.log(`✓ 12B-3. Retry succeeded with 200 OK: "${retryCreatorJson.message}"`);
        } else {
            throw new Error(`Expected 200 on retry, got ${retryCreatorRes.status}: ${JSON.stringify(retryCreatorJson)}`);
        }

        const recoveredCreatorNotif = await Notification.findOne({
            idempotencyKey: `notif_brand_camp_del_${campFailCreator._id}_${bookingFailCreator._id}`
        });
        if (recoveredCreatorNotif) {
            trackedNotificationIds.push(recoveredCreatorNotif._id);
            console.log("✓ 12B-4. Missing Creator notification successfully recovered on retry");
        } else {
            throw new Error("Creator notification was NOT recovered on retry!");
        }

        // 12C: Brand notification failure & recovery
        console.log("\n--- 12C: Brand Notification Failure & Recovery ---");
        const campFailBrand = await createTestCampaign(brand1._id, "Fail Brand Notif");
        let blockBrandNotif = true;
        Notification.create = async function (...args) {
            const payload = args[0];
            if (
                blockBrandNotif &&
                payload?.recipient?.toString() === brand1._id.toString() &&
                payload?.metadata?.campaignId?.toString() === campFailBrand._id.toString()
            ) {
                throw new Error("Simulated transient socket pipeline failure for Brand notification");
            }
            return originalNotifCreate.apply(this, args);
        };

        const failBrandRes = await fetch(`${baseUrl}/brand/campaigns/${campFailBrand._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            },
            body: JSON.stringify({ reason: "Testing brand notification failure" })
        });
        const failBrandJson = await failBrandRes.json();

        if (failBrandRes.status === 500 && failBrandJson.message.includes("Brand notification error")) {
            console.log(`✓ 12C-1. API correctly reported partial failure (status 500): "${failBrandJson.message}"`);
        } else {
            throw new Error(`Expected 500 reporting brand notif failure, got ${failBrandRes.status}: ${JSON.stringify(failBrandJson)}`);
        }

        blockBrandNotif = false;
        Notification.create = originalNotifCreate;

        const retryBrandRes = await fetch(`${baseUrl}/brand/campaigns/${campFailBrand._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            },
            body: JSON.stringify({ reason: "Retrying after brand notif unblocked" })
        });
        const retryBrandJson = await retryBrandRes.json();

        if (retryBrandRes.status === 200 && retryBrandJson.message.includes("safely removed")) {
            console.log(`✓ 12C-2. Retry succeeded with 200 OK: "${retryBrandJson.message}"`);
        } else {
            throw new Error(`Expected 200 on retry, got ${retryBrandRes.status}: ${JSON.stringify(retryBrandJson)}`);
        }

        const recoveredBrandNotif = await Notification.findOne({
            idempotencyKey: `notif_brand_camp_del_${campFailBrand._id}_brand`
        });
        if (recoveredBrandNotif) {
            trackedNotificationIds.push(recoveredBrandNotif._id);
            console.log("✓ 12C-3. Missing Brand notification successfully recovered on retry");
        } else {
            throw new Error("Brand notification was NOT recovered on retry!");
        }

        // 12D: AuditLog failure & recovery
        console.log("\n--- 12D: AuditLog Creation Failure & Recovery ---");
        const campFailAudit = await createTestCampaign(brand1._id, "Fail AuditLog");
        const originalAuditLogCreate = AuditLog.create;
        let blockAuditLog = true;
        AuditLog.create = async function (...args) {
            if (blockAuditLog) {
                throw new Error("Simulated database timeout during AuditLog creation");
            }
            return originalAuditLogCreate.apply(this, args);
        };

        const failAuditRes = await fetch(`${baseUrl}/brand/campaigns/${campFailAudit._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            },
            body: JSON.stringify({ reason: "Testing audit log failure" })
        });
        const failAuditJson = await failAuditRes.json();

        if (failAuditRes.status === 500 && failAuditJson.message.includes("AuditLog creation error")) {
            console.log(`✓ 12D-1. API correctly reported partial failure (status 500): "${failAuditJson.message}"`);
        } else {
            throw new Error(`Expected 500 reporting audit log failure, got ${failAuditRes.status}: ${JSON.stringify(failAuditJson)}`);
        }

        blockAuditLog = false;
        AuditLog.create = originalAuditLogCreate;

        const retryAuditRes = await fetch(`${baseUrl}/brand/campaigns/${campFailAudit._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${brand1Token}`
            },
            body: JSON.stringify({ reason: "Retrying after audit log unblocked" })
        });
        const retryAuditJson = await retryAuditRes.json();

        if (retryAuditRes.status === 200 && retryAuditJson.message.includes("safely removed")) {
            console.log(`✓ 12D-2. Retry succeeded with 200 OK: "${retryAuditJson.message}"`);
        } else {
            throw new Error(`Expected 200 on retry, got ${retryAuditRes.status}: ${JSON.stringify(retryAuditJson)}`);
        }

        const recoveredAuditLog = await AuditLog.findOne({
            targetId: campFailAudit._id,
            action: "BRAND_CAMPAIGN_DELETE"
        });
        if (recoveredAuditLog) {
            trackedAuditLogIds.push(recoveredAuditLog._id);
            console.log("✓ 12D-3. Missing AuditLog entry successfully recovered on retry");
        } else {
            throw new Error("AuditLog entry was NOT recovered on retry!");
        }

        // -------------------------------------------------------------
        // SCENARIO 13: Admin Campaign Delete Regression
        // -------------------------------------------------------------
        console.log("\n--- SCENARIO 13: Admin Campaign Delete Regression Verification ---");
        const campAdminDelete = await createTestCampaign(brand1._id, "Admin Regression Delete");

        const adminDeleteRes = await fetch(`${baseUrl}/admin/campaigns/${campAdminDelete._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${adminToken}`
            },
            body: JSON.stringify({ reason: "Admin regression test deletion" })
        });
        const adminDeleteJson = await adminDeleteRes.json();

        if (adminDeleteRes.status === 200 && adminDeleteJson.success) {
            console.log(`✓ 13A. Admin campaign delete succeeded with 200 OK: "${adminDeleteJson.message}"`);
        } else {
            throw new Error(`Expected 200 for admin campaign delete, got ${adminDeleteRes.status}: ${JSON.stringify(adminDeleteJson)}`);
        }

        const adminCampCheck = await Campaign.findById(campAdminDelete._id);
        if (adminCampCheck === null) {
            console.log("✓ 13B. Admin-deleted campaign is permanently removed from MongoDB");
        } else {
            throw new Error("Admin-deleted campaign still exists!");
        }

        console.log("\n================================================================================");
        console.log("ALL BRAND CAMPAIGN DELETE SCENARIOS PASSED WITH 100% SUCCESS!");
        console.log("================================================================================");

    } finally {
        console.log("\nCleaning up test data in isolated test database across all collections...");
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

runBrandCampaignDeleteTests().catch((err) => {
    console.error("❌ Test suite failed with error:", err);
    process.exit(1);
});

