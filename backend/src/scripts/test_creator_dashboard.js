import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import connectDatabase from "../config/database.js";
import Payment from "../modules/payments/payment.model.js";
import Workspace from "../modules/workspace/workspace.model.js";
import Booking from "../modules/booking/booking.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import Auth from "../modules/auth/auth.model.js";
import CreatorService from "../modules/creator/services/services.model.js";
import Review from "../modules/reviews/reviews.model.js";
import Message from "../modules/messages/message.model.js";
import Notification from "../modules/notifications/notification.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";
import { getCreatorDashboardOverviewService } from "../modules/creator/dashboard/dashboard.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function makeHttpRequest({ path, cookie }) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: "localhost",
            port: 5005,
            path,
            method: "GET",
            headers: cookie ? { Cookie: cookie } : {}
        };

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({ statusCode: res.statusCode, body: parsed });
            });
        });

        req.on("error", (err) => reject(err));
        req.end();
    });
}

async function runTests() {
    console.log("=============================================================");
    console.log("       CREATOR DASHBOARD BACKEND AUTOMATED VERIFICATION");
    console.log("=============================================================");

    const summaryTable = [];
    let testError = null;
    let cleanupError = null;

    const createdAuthIds = [];
    const createdCampaignIds = [];
    const createdServiceIds = [];
    const createdBookingIds = [];
    const createdWorkspaceIds = [];
    const createdPaymentIds = [];
    const createdReviewIds = [];
    const createdMessageIds = [];
    const createdNotificationIds = [];

    const testCreatorId = new mongoose.Types.ObjectId();
    const testBrandId = new mongoose.Types.ObjectId();
    const testAdminId = new mongoose.Types.ObjectId();
    const testCampaignId = new mongoose.Types.ObjectId();
    const testBookingId = new mongoose.Types.ObjectId();

    const testWs1 = new mongoose.Types.ObjectId();
    const testWs2 = new mongoose.Types.ObjectId();
    const testWs3 = new mongoose.Types.ObjectId();
    const testWs4 = new mongoose.Types.ObjectId();

    try {
        await connectDatabase();

        console.log("Ensuring Payment schema indexes are initialized in MongoDB...");
        await Payment.init();
        console.log("Payment indexes initialized successfully.");

        // -----------------------------------------------------------------
        // SECTION 1: HTTP Endpoint, Authentication & Validation Tests
        // -----------------------------------------------------------------

        // 1. HTTP Authentication: missing credentials return 401
        console.log("\n--- [HTTP TEST 1: Missing credentials return 401] ---");
        const resNoAuth = await makeHttpRequest({ path: "/api/creator/dashboard" });
        const passNoAuth = resNoAuth.statusCode === 401 && resNoAuth.body?.message === "Access token is required";
        console.log(`Status: ${resNoAuth.statusCode} (expected: 401), Message: ${resNoAuth.body?.message}`);
        summaryTable.push({
            Test: "1. HTTP: Missing token returns 401",
            Expected: "401 Access token is required",
            Actual: `${resNoAuth.statusCode} ${resNoAuth.body?.message}`,
            Status: passNoAuth ? "PASS" : "FAIL"
        });

        // 1B. HTTP Authentication: invalid credentials return 401
        console.log("\n--- [HTTP TEST 1B: Invalid credentials return 401] ---");
        const resInvalidAuth = await makeHttpRequest({
            path: "/api/creator/dashboard",
            cookie: "accessToken=malformed.token.value"
        });
        const passInvalidAuth = resInvalidAuth.statusCode === 401 && resInvalidAuth.body?.message === "Invalid or expired access token";
        console.log(`Status: ${resInvalidAuth.statusCode} (expected: 401), Message: ${resInvalidAuth.body?.message}`);
        summaryTable.push({
            Test: "1B. HTTP: Invalid token returns 401",
            Expected: "401 Invalid or expired access token",
            Actual: `${resInvalidAuth.statusCode} ${resInvalidAuth.body?.message}`,
            Status: passInvalidAuth ? "PASS" : "FAIL"
        });

        // 2A. Role Authorization: brand token returns 403
        console.log("\n--- [HTTP TEST 2A: Brand token returns 403 for creator dashboard] ---");
        const brandToken = generateAccessToken({ userId: testBrandId.toString(), role: "brand" });
        const resBrandRole = await makeHttpRequest({
            path: "/api/creator/dashboard",
            cookie: `accessToken=${brandToken}`
        });
        const passBrandRole = resBrandRole.statusCode === 403 && resBrandRole.body?.message === "You do not have permission to access this resource";
        console.log(`Status: ${resBrandRole.statusCode} (expected: 403), Message: ${resBrandRole.body?.message}`);
        summaryTable.push({
            Test: "2A. HTTP: Brand role forbidden (403)",
            Expected: "403 You do not have permission to access this resource",
            Actual: `${resBrandRole.statusCode} ${resBrandRole.body?.message}`,
            Status: passBrandRole ? "PASS" : "FAIL"
        });

        // 2B. Role Authorization: admin token returns 403
        console.log("\n--- [HTTP TEST 2B: Admin token returns 403 for creator dashboard] ---");
        const adminToken = generateAccessToken({ userId: testAdminId.toString(), role: "admin" });
        const resAdminRole = await makeHttpRequest({
            path: "/api/creator/dashboard",
            cookie: `accessToken=${adminToken}`
        });
        const passAdminRole = resAdminRole.statusCode === 403 && resAdminRole.body?.message === "You do not have permission to access this resource";
        console.log(`Status: ${resAdminRole.statusCode} (expected: 403), Message: ${resAdminRole.body?.message}`);
        summaryTable.push({
            Test: "2B. HTTP: Admin role forbidden (403)",
            Expected: "403 You do not have permission to access this resource",
            Actual: `${resAdminRole.statusCode} ${resAdminRole.body?.message}`,
            Status: passAdminRole ? "PASS" : "FAIL"
        });

        // 3. Successful creator request returns HTTP 200 with standard response envelope
        console.log("\n--- [HTTP TEST 3: Successful creator request returns 200 with standard envelope] ---");
        const httpCreator = await Auth.create({
            name: "Verified HTTP Creator",
            email: `http.creator.${Date.now()}@example.com`,
            password: "hashedpassword123",
            role: "creator"
        });
        createdAuthIds.push(httpCreator._id);

        const creatorToken = generateAccessToken({ userId: httpCreator._id.toString(), role: "creator" });
        const creatorCookie = `accessToken=${creatorToken}`;

        const resCreatorAuth = await makeHttpRequest({
            path: "/api/creator/dashboard",
            cookie: creatorCookie
        });
        const passCreatorAuth =
            resCreatorAuth.statusCode === 200 &&
            resCreatorAuth.body?.success === true &&
            resCreatorAuth.body?.message === "Creator dashboard overview fetched successfully" &&
            resCreatorAuth.body?.data?.metrics !== undefined &&
            resCreatorAuth.body?.data?.creator !== undefined &&
            resCreatorAuth.body?.data?.creator?.id?.toString() === httpCreator._id.toString() &&
            resCreatorAuth.body?.data?.creator?.name === httpCreator.name &&
            resCreatorAuth.body?.data?.creator?.email === httpCreator.email;
        console.log(`Status: ${resCreatorAuth.statusCode} (expected: 200), Success: ${resCreatorAuth.body?.success}`);
        console.log(`Creator verification: id=${resCreatorAuth.body?.data?.creator?.id} (exp: ${httpCreator._id}), name='${resCreatorAuth.body?.data?.creator?.name}', email='${resCreatorAuth.body?.data?.creator?.email}'`);
        summaryTable.push({
            Test: "3. HTTP: Creator request returns 200 envelope & user details",
            Expected: `200 Success with envelope & creator id:${httpCreator._id}`,
            Actual: `${resCreatorAuth.statusCode} success:${resCreatorAuth.body?.success}, id:${resCreatorAuth.body?.data?.creator?.id}`,
            Status: passCreatorAuth ? "PASS" : "FAIL"
        });

        // 4. Query validation rejects invalid recentLimit and deadlinesLimit
        console.log("\n--- [HTTP TEST 4: Query validation rejects invalid parameters] ---");
        const invalidRecent0 = await makeHttpRequest({ path: "/api/creator/dashboard?recentLimit=0", cookie: creatorCookie });
        const invalidRecent51 = await makeHttpRequest({ path: "/api/creator/dashboard?recentLimit=51", cookie: creatorCookie });
        const invalidRecentStr = await makeHttpRequest({ path: "/api/creator/dashboard?recentLimit=abc", cookie: creatorCookie });
        const invalidRecentFloat = await makeHttpRequest({ path: "/api/creator/dashboard?recentLimit=2.5", cookie: creatorCookie });

        const invalidDeadlines0 = await makeHttpRequest({ path: "/api/creator/dashboard?deadlinesLimit=0", cookie: creatorCookie });
        const invalidDeadlines51 = await makeHttpRequest({ path: "/api/creator/dashboard?deadlinesLimit=51", cookie: creatorCookie });
        const invalidDeadlinesStr = await makeHttpRequest({ path: "/api/creator/dashboard?deadlinesLimit=xyz", cookie: creatorCookie });
        const invalidDeadlinesFloat = await makeHttpRequest({ path: "/api/creator/dashboard?deadlinesLimit=3.14", cookie: creatorCookie });

        const passQueryValidation =
            invalidRecent0.statusCode === 400 &&
            invalidRecent51.statusCode === 400 &&
            invalidRecentStr.statusCode === 400 &&
            invalidRecentFloat.statusCode === 400 &&
            invalidDeadlines0.statusCode === 400 &&
            invalidDeadlines51.statusCode === 400 &&
            invalidDeadlinesStr.statusCode === 400 &&
            invalidDeadlinesFloat.statusCode === 400;

        console.log(`recentLimit checks (0, 51, abc, 2.5): ${invalidRecent0.statusCode}, ${invalidRecent51.statusCode}, ${invalidRecentStr.statusCode}, ${invalidRecentFloat.statusCode} (all expected: 400)`);
        console.log(`deadlinesLimit checks (0, 51, xyz, 3.14): ${invalidDeadlines0.statusCode}, ${invalidDeadlines51.statusCode}, ${invalidDeadlinesStr.statusCode}, ${invalidDeadlinesFloat.statusCode} (all expected: 400)`);
        summaryTable.push({
            Test: "4. HTTP: Query validation rejects invalid limits",
            Expected: "400 Bad Request for all invalid limits",
            Actual: `recent:[${invalidRecent0.statusCode},${invalidRecent51.statusCode},${invalidRecentStr.statusCode},${invalidRecentFloat.statusCode}], deadlines:[${invalidDeadlines0.statusCode},${invalidDeadlines51.statusCode},${invalidDeadlinesStr.statusCode},${invalidDeadlinesFloat.statusCode}]`,
            Status: passQueryValidation ? "PASS" : "FAIL"
        });

        // 5. Custom valid query limits are applied correctly
        console.log("\n--- [HTTP TEST 5: Custom valid query limits are applied] ---");
        const limitsCreator = await Auth.create({
            name: "Limits Test Creator",
            email: `limits.creator.${Date.now()}@example.com`,
            password: "hashedpassword123",
            role: "creator"
        });
        createdAuthIds.push(limitsCreator._id);

        const limitsCreatorToken = generateAccessToken({ userId: limitsCreator._id.toString(), role: "creator" });
        const limitsCreatorCookie = `accessToken=${limitsCreatorToken}`;

        // Create 4 workspaces for limitsCreator (all candidates for recentWorkspaces, and 4 future in_progress for upcomingDeadlines)
        const limitsWs1 = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: new mongoose.Types.ObjectId(),
            brand: testBrandId,
            creator: limitsCreator._id,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 5000,
            status: "in_progress",
            deadline: new Date(Date.now() + 86400000 * 2)
        });
        createdWorkspaceIds.push(limitsWs1._id);

        const limitsWs2 = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: new mongoose.Types.ObjectId(),
            brand: testBrandId,
            creator: limitsCreator._id,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 6000,
            status: "in_progress",
            deadline: new Date(Date.now() + 86400000 * 3)
        });
        createdWorkspaceIds.push(limitsWs2._id);

        const limitsWs3 = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: new mongoose.Types.ObjectId(),
            brand: testBrandId,
            creator: limitsCreator._id,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 7000,
            status: "revision_requested",
            deadline: new Date(Date.now() + 86400000 * 4)
        });
        createdWorkspaceIds.push(limitsWs3._id);

        const limitsWs4 = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: new mongoose.Types.ObjectId(),
            brand: testBrandId,
            creator: limitsCreator._id,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 8000,
            status: "in_progress",
            deadline: new Date(Date.now() + 86400000 * 5)
        });
        createdWorkspaceIds.push(limitsWs4._id);

        // Create 2 upcoming pending bookings for limitsCreator (so total upcoming deadlines = 4 + 2 = 6)
        const limitsBk1 = await Booking.create({
            brand: testBrandId,
            creator: limitsCreator._id,
            campaign: new mongoose.Types.ObjectId(),
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 4000,
            deliverables: ["Deliverable 1"],
            status: "pending",
            initiatedBy: "brand",
            deadline: new Date(Date.now() + 86400000 * 6)
        });
        createdBookingIds.push(limitsBk1._id);

        const limitsBk2 = await Booking.create({
            brand: testBrandId,
            creator: limitsCreator._id,
            campaign: new mongoose.Types.ObjectId(),
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 4500,
            deliverables: ["Deliverable 2"],
            status: "pending",
            initiatedBy: "creator",
            deadline: new Date(Date.now() + 86400000 * 7)
        });
        createdBookingIds.push(limitsBk2._id);

        const resValidLimits = await makeHttpRequest({
            path: "/api/creator/dashboard?recentLimit=2&deadlinesLimit=3",
            cookie: limitsCreatorCookie
        });

        const recentWorkspacesResult = resValidLimits.body?.data?.recentWorkspaces;
        const upcomingDeadlinesResult = resValidLimits.body?.data?.upcomingDeadlines;

        const passValidLimits =
            resValidLimits.statusCode === 200 &&
            resValidLimits.body?.success === true &&
            Array.isArray(recentWorkspacesResult) &&
            recentWorkspacesResult.length === 2 &&
            Array.isArray(upcomingDeadlinesResult) &&
            upcomingDeadlinesResult.length === 3;

        console.log(`Status: ${resValidLimits.statusCode} (expected: 200)`);
        console.log(`recentWorkspaces count: ${recentWorkspacesResult?.length} (expected: 2, total available: 4)`);
        console.log(`upcomingDeadlines count: ${upcomingDeadlinesResult?.length} (expected: 3, total available: 6)`);

        summaryTable.push({
            Test: "5. HTTP: Custom valid query limits applied (length assertions)",
            Expected: "200 Success with recentWorkspaces.length: 2 and upcomingDeadlines.length: 3",
            Actual: `${resValidLimits.statusCode} recent:${recentWorkspacesResult?.length}, deadlines:${upcomingDeadlinesResult?.length}`,
            Status: passValidLimits ? "PASS" : "FAIL"
        });

        // -----------------------------------------------------------------
        // SECTION 2: Service Layer & Business Logic Tests
        // -----------------------------------------------------------------

        // SCENARIO 1: No payment records
        console.log("\n--- [SCENARIO 1: No payment records] ---");
        const res1 = await getCreatorDashboardOverviewService(testCreatorId);
        const pass1 =
            res1.metrics.totalEarnings.amount === 0 &&
            res1.metrics.totalEarnings.paidTransactionsCount === 0 &&
            res1.metrics.pendingPayments.directPendingAmount === 0 &&
            res1.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount === 0 &&
            res1.metrics.pendingPayments.amount === 0;

        console.log(`Scenario 1: ${pass1 ? "PASS ✓" : "FAIL ✗"}`);
        summaryTable.push({
            Test: "S1. Service: No payment records",
            Expected: "Earnings: 0, Direct Pending: 0, Unpaid Est: 0, Pending Total: 0",
            Actual: `Earnings: ${res1.metrics.totalEarnings.amount}, Direct Pending: ${res1.metrics.pendingPayments.directPendingAmount}, Unpaid Est: ${res1.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount}, Pending Total: ${res1.metrics.pendingPayments.amount}`,
            Status: pass1 ? "PASS" : "FAIL"
        });

        // SCENARIO 2: One paid payment
        console.log("\n--- [SCENARIO 2: One paid payment] ---");
        const p1 = await Payment.create({
            workspace: testWs1,
            booking: testBookingId,
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 5000,
            currency: "INR",
            status: "paid",
            isActive: true,
            paidAt: new Date()
        });
        createdPaymentIds.push(p1._id);

        const res2 = await getCreatorDashboardOverviewService(testCreatorId);
        const pass2 =
            res2.metrics.totalEarnings.amount === 5000 &&
            res2.metrics.totalEarnings.paidTransactionsCount === 1 &&
            res2.metrics.pendingPayments.directPendingAmount === 0;

        console.log(`Scenario 2: ${pass2 ? "PASS ✓" : "FAIL ✗"}`);
        summaryTable.push({
            Test: "S2. Service: One paid payment",
            Expected: "Earnings: 5000, Count: 1, Direct Pending: 0",
            Actual: `Earnings: ${res2.metrics.totalEarnings.amount}, Count: ${res2.metrics.totalEarnings.paidTransactionsCount}, Direct Pending: ${res2.metrics.pendingPayments.directPendingAmount}`,
            Status: pass2 ? "PASS" : "FAIL"
        });

        // SCENARIO 3: Multiple payment records on one workspace
        console.log("\n--- [SCENARIO 3: Multiple payment records linked to one workspace] ---");
        let duplicateActiveRejected = false;
        let duplicateRejectionError = null;
        try {
            const p1_duplicate_active = await Payment.create({
                workspace: testWs1,
                booking: testBookingId,
                campaign: testCampaignId,
                brand: testBrandId,
                creator: testCreatorId,
                amount: 5000,
                currency: "INR",
                status: "paid",
                isActive: true
            });
            createdPaymentIds.push(p1_duplicate_active._id);
        } catch (err) {
            if (err && err.code === 11000) {
                duplicateActiveRejected = true;
            } else {
                duplicateRejectionError = err;
                console.error("Duplicate active insert was rejected with non-11000 error:", err);
            }
        }

        const p1_historical_paid = await Payment.create({
            workspace: testWs1,
            booking: testBookingId,
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 2000,
            currency: "INR",
            status: "paid",
            isActive: false
        });
        createdPaymentIds.push(p1_historical_paid._id);

        const res3 = await getCreatorDashboardOverviewService(testCreatorId);
        const pass3 =
            duplicateActiveRejected === true &&
            duplicateRejectionError === null &&
            res3.metrics.totalEarnings.amount === 5000 &&
            res3.metrics.totalEarnings.paidTransactionsCount === 1 &&
            res3.metrics.pendingPayments.directPendingAmount === 0;

        console.log(`Scenario 3: ${pass3 ? "PASS ✓" : "FAIL ✗"}`);
        summaryTable.push({
            Test: "S3. Service: Multiple payments on workspace (deduplication & 11000)",
            Expected: "Code 11000 Rejected: true, Earnings: 5000, Count: 1",
            Actual: `Code 11000 Rejected: ${duplicateActiveRejected}, Earnings: ${res3.metrics.totalEarnings.amount}, Count: ${res3.metrics.totalEarnings.paidTransactionsCount}`,
            Status: pass3 ? "PASS" : "FAIL"
        });

        // SCENARIO 4: Pending / processing payment records
        console.log("\n--- [SCENARIO 4: Pending/processing payment records] ---");
        const p2 = await Payment.create({
            workspace: testWs2,
            booking: testBookingId,
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 3000,
            currency: "INR",
            status: "pending",
            isActive: true
        });
        createdPaymentIds.push(p2._id);

        const res4 = await getCreatorDashboardOverviewService(testCreatorId);
        const pass4 =
            res4.metrics.pendingPayments.directPendingAmount === 3000 &&
            res4.metrics.pendingPayments.directPendingCount === 1 &&
            res4.metrics.pendingPayments.amount === 3000 &&
            res4.metrics.totalEarnings.amount === 5000;

        console.log(`Scenario 4: ${pass4 ? "PASS ✓" : "FAIL ✗"}`);
        summaryTable.push({
            Test: "S4. Service: Pending payment records",
            Expected: "Direct Pending: 3000, Count: 1, Earnings: 5000",
            Actual: `Direct Pending: ${res4.metrics.pendingPayments.directPendingAmount}, Count: ${res4.metrics.pendingPayments.directPendingCount}, Earnings: ${res4.metrics.totalEarnings.amount}`,
            Status: pass4 ? "PASS" : "FAIL"
        });

        // SCENARIO 5: A completed workspace with no payment record
        console.log("\n--- [SCENARIO 5: Completed workspace with no payment record] ---");
        const ws3 = await Workspace.create({
            _id: testWs3,
            booking: new mongoose.Types.ObjectId(),
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testCreatorId,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 4500,
            currency: "INR",
            deadline: new Date(Date.now() + 86400000 * 7),
            status: "completed"
        });
        createdWorkspaceIds.push(ws3._id);

        const res5 = await getCreatorDashboardOverviewService(testCreatorId);
        const pass5 =
            res5.metrics.pendingPayments.directPendingAmount === 3000 &&
            res5.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount === 4500 &&
            res5.metrics.pendingPayments.unpaidWorkspacesCount === 1 &&
            res5.metrics.pendingPayments.totalOutstandingEstimated === 7500 &&
            res5.metrics.completedCollaborations.total === 1 &&
            res5.metrics.completedCampaigns.total === 1 &&
            res5.metrics.activeCollaborations.total === 0 &&
            res5.metrics.activeCampaigns.total === 0;

        console.log(`Scenario 5: ${pass5 ? "PASS ✓" : "FAIL ✗"}`);
        summaryTable.push({
            Test: "S5. Service: Completed workspace without payment",
            Expected: "Direct: 3000, Unpaid Est: 4500, Total Est: 7500, CompletedCollabs: 1, CompletedCampaigns: 1",
            Actual: `Direct: ${res5.metrics.pendingPayments.directPendingAmount}, Unpaid Est: ${res5.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount}, Total Est: ${res5.metrics.pendingPayments.totalOutstandingEstimated}, Collabs: ${res5.metrics.completedCollaborations.total}, Campaigns: ${res5.metrics.completedCampaigns.total}`,
            Status: pass5 ? "PASS" : "FAIL"
        });

        // SCENARIO 6: Refunded, failed, and cancelled payment records
        console.log("\n--- [SCENARIO 6: Refunded, failed, and cancelled payment records] ---");
        const pFailed = await Payment.create({
            workspace: testWs4,
            booking: testBookingId,
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 7000,
            currency: "INR",
            status: "failed",
            isActive: false
        });
        createdPaymentIds.push(pFailed._id);

        const pRefunded = await Payment.create({
            workspace: new mongoose.Types.ObjectId(),
            booking: testBookingId,
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 8000,
            currency: "INR",
            status: "refunded",
            isActive: false
        });
        createdPaymentIds.push(pRefunded._id);

        const pCancelled = await Payment.create({
            workspace: new mongoose.Types.ObjectId(),
            booking: testBookingId,
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 9000,
            currency: "INR",
            status: "cancelled",
            isActive: false
        });
        createdPaymentIds.push(pCancelled._id);

        const res6 = await getCreatorDashboardOverviewService(testCreatorId);
        const pass6 =
            res6.metrics.totalEarnings.amount === 5000 &&
            res6.metrics.pendingPayments.directPendingAmount === 3000;

        console.log(`Scenario 6: ${pass6 ? "PASS ✓" : "FAIL ✗"}`);
        summaryTable.push({
            Test: "S6. Service: Refunded/failed/cancelled records excluded",
            Expected: "Earnings: 5000, Direct Pending: 3000",
            Actual: `Earnings: ${res6.metrics.totalEarnings.amount}, Direct Pending: ${res6.metrics.pendingPayments.directPendingAmount}`,
            Status: pass6 ? "PASS" : "FAIL"
        });

        // SCENARIO 7: Multi-currency records (prevent silent currency mixing)
        console.log("\n--- [SCENARIO 7: Multi-currency records segregated without mixing] ---");
        const testWs5 = new mongoose.Types.ObjectId();
        const testWs6 = new mongoose.Types.ObjectId();

        const pUsd = await Payment.create({
            workspace: testWs5,
            booking: testBookingId,
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 200,
            currency: "USD",
            status: "paid",
            isActive: true,
            paidAt: new Date()
        });
        createdPaymentIds.push(pUsd._id);

        const wsUsd = await Workspace.create({
            _id: testWs6,
            booking: new mongoose.Types.ObjectId(),
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testCreatorId,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 150,
            currency: "USD",
            deadline: new Date(Date.now() + 86400000 * 7),
            status: "completed"
        });
        createdWorkspaceIds.push(wsUsd._id);

        const res7 = await getCreatorDashboardOverviewService(testCreatorId);
        const usdEarnings = res7.metrics.totalEarnings.byCurrency.find((c) => c.currency === "USD");
        const inrEarnings = res7.metrics.totalEarnings.byCurrency.find((c) => c.currency === "INR");
        const usdPending = res7.metrics.pendingPayments.byCurrency.find((c) => c.currency === "USD");
        const inrPending = res7.metrics.pendingPayments.byCurrency.find((c) => c.currency === "INR");

        const pass7 =
            res7.metrics.totalEarnings.amount === 5000 &&
            res7.metrics.totalEarnings.currency === "INR" &&
            res7.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount === 4500 &&
            inrEarnings?.amount === 5000 &&
            usdEarnings?.amount === 200 &&
            inrPending?.unpaidWorkspacesEstimatedAmount === 4500 &&
            usdPending?.unpaidWorkspacesEstimatedAmount === 150;

        console.log(`Scenario 7: ${pass7 ? "PASS ✓" : "FAIL ✗"}`);
        summaryTable.push({
            Test: "S7. Service: Multi-currency segregation",
            Expected: "INR Earnings: 5000 (no USD mix), USD Earnings: 200, INR Unpaid: 4500, USD Unpaid: 150",
            Actual: `INR Earnings: ${res7.metrics.totalEarnings.amount}, USD Earnings: ${usdEarnings?.amount}, INR Unpaid: ${res7.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount}, USD Unpaid: ${usdPending?.unpaidWorkspacesEstimatedAmount}`,
            Status: pass7 ? "PASS" : "FAIL"
        });

        // SCENARIO 8: USD earnings only, with no INR earnings
        console.log("\n--- [SCENARIO 8: USD earnings only (primary fields remain zero INR)] ---");
        const testUsdOnlyCreatorId = new mongoose.Types.ObjectId();
        const testWsUsdOnly = new mongoose.Types.ObjectId();

        const pUsdOnly = await Payment.create({
            workspace: testWsUsdOnly,
            booking: testBookingId,
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testUsdOnlyCreatorId,
            amount: 350,
            currency: "USD",
            status: "paid",
            isActive: true,
            paidAt: new Date()
        });
        createdPaymentIds.push(pUsdOnly._id);

        const res8 = await getCreatorDashboardOverviewService(testUsdOnlyCreatorId);
        const usdOnlyEarnings = res8.metrics.totalEarnings.byCurrency.find((c) => c.currency === "USD");

        const pass8 =
            res8.metrics.totalEarnings.amount === 0 &&
            res8.metrics.totalEarnings.currency === "INR" &&
            res8.metrics.totalEarnings.paidTransactionsCount === 0 &&
            usdOnlyEarnings?.amount === 350 &&
            usdOnlyEarnings?.paidTransactionsCount === 1;

        console.log(`Scenario 8: ${pass8 ? "PASS ✓" : "FAIL ✗"}`);
        summaryTable.push({
            Test: "S8. Service: USD earnings only (no INR earnings)",
            Expected: "Primary Earnings: 0 INR, Count: 0, USD byCurrency: 350",
            Actual: `Primary Earnings: ${res8.metrics.totalEarnings.amount} ${res8.metrics.totalEarnings.currency}, Count: ${res8.metrics.totalEarnings.paidTransactionsCount}, USD byCurrency: ${usdOnlyEarnings?.amount}`,
            Status: pass8 ? "PASS" : "FAIL"
        });

        // SCENARIO 9: USD pending & unpaid workspace amounts only
        console.log("\n--- [SCENARIO 9: USD pending only (primary fields remain zero INR)] ---");
        const testUsdPendingCreatorId = new mongoose.Types.ObjectId();
        const testWsUsdPending1 = new mongoose.Types.ObjectId();
        const testWsUsdPending2 = new mongoose.Types.ObjectId();

        const pUsdDirectPending = await Payment.create({
            workspace: testWsUsdPending1,
            booking: testBookingId,
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testUsdPendingCreatorId,
            amount: 120,
            currency: "USD",
            status: "pending",
            isActive: true
        });
        createdPaymentIds.push(pUsdDirectPending._id);

        const wsUsdUnpaid = await Workspace.create({
            _id: testWsUsdPending2,
            booking: new mongoose.Types.ObjectId(),
            campaign: testCampaignId,
            brand: testBrandId,
            creator: testUsdPendingCreatorId,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 250,
            currency: "USD",
            deadline: new Date(Date.now() + 86400000 * 7),
            status: "completed"
        });
        createdWorkspaceIds.push(wsUsdUnpaid._id);

        const res9 = await getCreatorDashboardOverviewService(testUsdPendingCreatorId);
        const usdPendingEntry = res9.metrics.pendingPayments.byCurrency.find((c) => c.currency === "USD");

        const pass9 =
            res9.metrics.pendingPayments.amount === 0 &&
            res9.metrics.pendingPayments.currency === "INR" &&
            res9.metrics.pendingPayments.count === 0 &&
            res9.metrics.pendingPayments.directPendingAmount === 0 &&
            res9.metrics.pendingPayments.directPendingCount === 0 &&
            res9.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount === 0 &&
            res9.metrics.pendingPayments.unpaidWorkspacesCount === 0 &&
            res9.metrics.pendingPayments.totalOutstandingEstimated === 0 &&
            usdPendingEntry?.directPendingAmount === 120 &&
            usdPendingEntry?.directPendingCount === 1 &&
            usdPendingEntry?.unpaidWorkspacesEstimatedAmount === 250 &&
            usdPendingEntry?.unpaidWorkspacesCount === 1 &&
            usdPendingEntry?.totalOutstandingEstimated === 370;

        console.log(`Scenario 9: ${pass9 ? "PASS ✓" : "FAIL ✗"}`);
        summaryTable.push({
            Test: "S9. Service: USD pending only (no INR pending)",
            Expected: "Primary Pending: 0 INR, Unpaid: 0 INR, Total Est: 0 INR, USD Direct: 120, USD Unpaid: 250, USD Est: 370",
            Actual: `Primary Pending: ${res9.metrics.pendingPayments.directPendingAmount} ${res9.metrics.pendingPayments.currency}, Unpaid: ${res9.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount}, USD Direct: ${usdPendingEntry?.directPendingAmount}, USD Unpaid: ${usdPendingEntry?.unpaidWorkspacesEstimatedAmount}`,
            Status: pass9 ? "PASS" : "FAIL"
        });

        // -----------------------------------------------------------------
        // SECTION 3: Dedicated Tests for Reviews, Unread, Deadlines,
        //            Pending Requests, Collaborations, Recent Workspaces & User
        // -----------------------------------------------------------------

        // SCENARIO 10: Reviews (average rating, review count, reviewer name, campaign title, zero-review fallback)
        console.log("\n--- [SCENARIO 10: Reviews summary and zero-review fallback] ---");
        const reviewCreatorId = new mongoose.Types.ObjectId();
        const reviewerBrand = await Auth.create({
            name: "Luxe Review Brand",
            email: `luxe.brand.${Date.now()}@example.com`,
            password: "hashedpassword123",
            role: "brand"
        });
        createdAuthIds.push(reviewerBrand._id);

        const reviewerCampaign = await Campaign.create({
            brand: reviewerBrand._id,
            title: "Summer Glam Review Campaign",
            description: "Review test campaign",
            category: "Beauty",
            platform: "instagram",
            budget: 20000,
            deadline: new Date(Date.now() + 86400000 * 15),
            requiredCreators: 1,
            deliverables: ["1 Reel"]
        });
        createdCampaignIds.push(reviewerCampaign._id);

        // 10A: Verify zero-review fallback state
        const resZeroReviews = await getCreatorDashboardOverviewService(reviewCreatorId);
        const passZeroReviews =
            resZeroReviews.metrics.reviews.averageRating === 0 &&
            resZeroReviews.metrics.reviews.totalReviews === 0 &&
            resZeroReviews.reviews.averageRating === 0 &&
            resZeroReviews.reviews.totalReviews === 0 &&
            Array.isArray(resZeroReviews.reviews.recent) &&
            resZeroReviews.reviews.recent.length === 0;

        // 10B: Create 2 reviews with ratings 5 and 4 -> expected average 4.5
        const revWs1 = new mongoose.Types.ObjectId();
        const rev1 = await Review.create({
            workspace: revWs1,
            reviewer: reviewerBrand._id,
            reviewee: reviewCreatorId,
            rating: 5,
            comment: "Flawless reel and fast turnaround!",
            campaign: reviewerCampaign._id
        });
        createdReviewIds.push(rev1._id);

        const revWs2 = new mongoose.Types.ObjectId();
        const rev2 = await Review.create({
            workspace: revWs2,
            reviewer: reviewerBrand._id,
            reviewee: reviewCreatorId,
            rating: 4,
            comment: "Very good creative collaboration.",
            campaign: reviewerCampaign._id
        });
        createdReviewIds.push(rev2._id);

        const resWithReviews = await getCreatorDashboardOverviewService(reviewCreatorId);
        const passWithReviews =
            resWithReviews.metrics.reviews.averageRating === 4.5 &&
            resWithReviews.metrics.reviews.totalReviews === 2 &&
            resWithReviews.reviews.averageRating === 4.5 &&
            resWithReviews.reviews.totalReviews === 2 &&
            resWithReviews.reviews.recent.length === 2 &&
            resWithReviews.reviews.recent[0].reviewerName === "Luxe Review Brand" &&
            resWithReviews.reviews.recent[0].campaignTitle === "Summer Glam Review Campaign";

        const pass10 = passZeroReviews && passWithReviews;
        console.log(`Zero reviews: avg=${resZeroReviews.reviews.averageRating}, total=${resZeroReviews.reviews.totalReviews}`);
        console.log(`With reviews: avg=${resWithReviews.reviews.averageRating} (expected: 4.5), total=${resWithReviews.reviews.totalReviews} (expected: 2)`);
        console.log(`Reviewer name: '${resWithReviews.reviews.recent[0]?.reviewerName}', campaign: '${resWithReviews.reviews.recent[0]?.campaignTitle}'`);
        summaryTable.push({
            Test: "S10. Service: Reviews summary & zero-review fallback",
            Expected: "Zero: 0/0/[], Active: avg 4.5, total 2, reviewer populated",
            Actual: `Zero:[${resZeroReviews.reviews.averageRating},${resZeroReviews.reviews.totalReviews}], Active:[${resWithReviews.reviews.averageRating},${resWithReviews.reviews.totalReviews},'${resWithReviews.reviews.recent[0]?.reviewerName}']`,
            Status: pass10 ? "PASS" : "FAIL"
        });

        // SCENARIO 11: Unread messages and notifications return correct counts
        console.log("\n--- [SCENARIO 11: Unread messages and notifications count] ---");
        const msgCreatorId = new mongoose.Types.ObjectId();
        const dummyConvId = new mongoose.Types.ObjectId();

        const msg1 = await Message.create({
            conversation: dummyConvId,
            sender: testBrandId,
            receiver: msgCreatorId,
            message: "Unread message 1",
            isRead: false
        });
        createdMessageIds.push(msg1._id);

        const msg2 = await Message.create({
            conversation: dummyConvId,
            sender: testBrandId,
            receiver: msgCreatorId,
            message: "Unread message 2",
            isRead: false
        });
        createdMessageIds.push(msg2._id);

        const msgRead = await Message.create({
            conversation: dummyConvId,
            sender: testBrandId,
            receiver: msgCreatorId,
            message: "Read message",
            isRead: true
        });
        createdMessageIds.push(msgRead._id);

        const notif1 = await Notification.create({
            recipient: msgCreatorId,
            type: "proposal_received",
            title: "New Proposal",
            message: "You received a new proposal",
            entityType: "booking",
            entityId: new mongoose.Types.ObjectId(),
            destination: "/creator/bookings",
            isRead: false
        });
        createdNotificationIds.push(notif1._id);

        const notifRead = await Notification.create({
            recipient: msgCreatorId,
            type: "payment_received",
            title: "Payment Received",
            message: "Payment captured",
            entityType: "payment",
            entityId: new mongoose.Types.ObjectId(),
            destination: "/creator/payments",
            isRead: true
        });
        createdNotificationIds.push(notifRead._id);

        const resUnread = await getCreatorDashboardOverviewService(msgCreatorId);
        const passUnread =
            resUnread.metrics.unreadCounts.messages === 2 &&
            resUnread.metrics.unreadCounts.notifications === 1;

        console.log(`Unread messages: ${resUnread.metrics.unreadCounts.messages} (expected: 2), notifications: ${resUnread.metrics.unreadCounts.notifications} (expected: 1)`);
        summaryTable.push({
            Test: "S11. Service: Unread messages & notifications counts",
            Expected: "Unread messages: 2, notifications: 1",
            Actual: `messages: ${resUnread.metrics.unreadCounts.messages}, notifications: ${resUnread.metrics.unreadCounts.notifications}`,
            Status: passUnread ? "PASS" : "FAIL"
        });

        // SCENARIO 12: Upcoming deadlines (past filtering, inactive status filtering, ascending sort, requested limit, booking source)
        console.log("\n--- [SCENARIO 12: Upcoming deadlines filtering, sorting and sources] ---");
        const deadlineCreatorId = new mongoose.Types.ObjectId();
        const deadlineBrand = await Auth.create({
            name: "Deadline Brand Partner",
            email: `deadline.brand.${Date.now()}@example.com`,
            password: "hashedpassword123",
            role: "brand"
        });
        createdAuthIds.push(deadlineBrand._id);

        const deadlineCampaign = await Campaign.create({
            brand: deadlineBrand._id,
            title: "Deadline Campaign Alpha",
            description: "Deadline tracking test",
            category: "Technology",
            platform: "youtube",
            budget: 40000,
            deadline: new Date(Date.now() + 86400000 * 30),
            requiredCreators: 2,
            deliverables: ["1 Video"]
        });
        createdCampaignIds.push(deadlineCampaign._id);

        const deadlineService = await CreatorService.create({
            creator: deadlineCreatorId,
            title: "Tech Video Review",
            category: "Technology",
            platform: "youtube",
            price: 25000
        });
        createdServiceIds.push(deadlineService._id);

        const nowMs = Date.now();
        const datePast = new Date(nowMs - 86400000 * 5); // 5 days in past
        const dateSoon = new Date(nowMs + 86400000 * 3); // 3 days in future (earlier)
        const dateLater = new Date(nowMs + 86400000 * 10); // 10 days in future (later)
        const dateFurthest = new Date(nowMs + 86400000 * 20); // 20 days in future

        // 12A. Past workspace deadline (should be excluded)
        const wsPast = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: deadlineCampaign._id,
            brand: deadlineBrand._id,
            creator: deadlineCreatorId,
            service: deadlineService._id,
            agreedPrice: 10000,
            deadline: datePast,
            status: "in_progress"
        });
        createdWorkspaceIds.push(wsPast._id);

        // 12B. Completed workspace deadline (inactive status, should be excluded)
        const wsCompleted = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: deadlineCampaign._id,
            brand: deadlineBrand._id,
            creator: deadlineCreatorId,
            service: deadlineService._id,
            agreedPrice: 10000,
            deadline: dateSoon,
            status: "completed"
        });
        createdWorkspaceIds.push(wsCompleted._id);

        // 12C. Active workspace deadline: in_progress at dateLater (should be included)
        const wsActiveLater = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: deadlineCampaign._id,
            brand: deadlineBrand._id,
            creator: deadlineCreatorId,
            service: deadlineService._id,
            agreedPrice: 15000,
            deadline: dateLater,
            status: "in_progress"
        });
        createdWorkspaceIds.push(wsActiveLater._id);

        // 12D. Active workspace deadline: revision_requested at dateFurthest (should be included)
        const wsActiveFurthest = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: deadlineCampaign._id,
            brand: deadlineBrand._id,
            creator: deadlineCreatorId,
            service: deadlineService._id,
            agreedPrice: 18000,
            deadline: dateFurthest,
            status: "revision_requested"
        });
        createdWorkspaceIds.push(wsActiveFurthest._id);

        // 12E. Booking deadline: brand proposal at dateSoon (should be included, earlier than dateLater)
        const bkBrandProposal = await Booking.create({
            brand: deadlineBrand._id,
            creator: deadlineCreatorId,
            campaign: deadlineCampaign._id,
            service: deadlineService._id,
            agreedPrice: 12000,
            deliverables: ["1 Video"],
            deadline: dateSoon,
            status: "pending",
            initiatedBy: "brand"
        });
        createdBookingIds.push(bkBrandProposal._id);

        // 12F. Booking deadline: campaign application (initiatedBy: creator)
        const deadlineCampaign2 = await Campaign.create({
            brand: deadlineBrand._id,
            title: "Creator Application Campaign",
            description: "Application tracking test",
            category: "Technology",
            platform: "youtube",
            budget: 40000,
            deadline: new Date(Date.now() + 86400000 * 30),
            requiredCreators: 1,
            deliverables: ["1 Video"]
        });
        createdCampaignIds.push(deadlineCampaign2._id);

        const dateApp = new Date(nowMs + 86400000 * 15);
        const bkCreatorApp = await Booking.create({
            brand: deadlineBrand._id,
            creator: deadlineCreatorId,
            campaign: deadlineCampaign2._id,
            service: deadlineService._id,
            agreedPrice: 14000,
            deliverables: ["1 Video"],
            deadline: dateApp,
            status: "pending",
            initiatedBy: "creator"
        });
        createdBookingIds.push(bkCreatorApp._id);

        // 12G. Booking with accepted status (inactive status, should be excluded)
        const bkAccepted = await Booking.create({
            brand: deadlineBrand._id,
            creator: deadlineCreatorId,
            campaign: new mongoose.Types.ObjectId(),
            service: deadlineService._id,
            agreedPrice: 14000,
            deliverables: ["1 Video"],
            deadline: dateSoon,
            status: "accepted",
            initiatedBy: "brand"
        });
        createdBookingIds.push(bkAccepted._id);

        // Request with limit = 3
        const resDeadlines = await getCreatorDashboardOverviewService(deadlineCreatorId, { deadlinesLimit: 3 });
        const deadlines = resDeadlines.upcomingDeadlines;

        const passDeadlinesLimit = deadlines.length === 3;
        const passAscendingOrder =
            new Date(deadlines[0].deadline) <= new Date(deadlines[1].deadline) &&
            new Date(deadlines[1].deadline) <= new Date(deadlines[2].deadline);

        // The earliest deadline is dateSoon (brand proposal booking)
        const firstItem = deadlines[0];
        const passBrandProposalSource =
            firstItem.sourceType === "brand_proposal" &&
            firstItem.brandName === "Deadline Brand Partner";

        // Second earliest is dateLater (workspace deadline)
        const secondItem = deadlines[1];
        const passWorkspaceSource =
            secondItem.sourceType === "workspace" &&
            secondItem.brandName === "Deadline Brand Partner";

        // Query all deadlines without tight limit to verify creator application source type
        const resAllDeadlines = await getCreatorDashboardOverviewService(deadlineCreatorId, { deadlinesLimit: 10 });
        const creatorAppItem = resAllDeadlines.upcomingDeadlines.find((d) => d.id.toString() === bkCreatorApp._id.toString());
        const passCreatorAppSource = creatorAppItem?.sourceType === "campaign_application";

        // Verify past and inactive items are completely excluded
        const hasPast = resAllDeadlines.upcomingDeadlines.some((d) => d.id.toString() === wsPast._id.toString());
        const hasCompleted = resAllDeadlines.upcomingDeadlines.some((d) => d.id.toString() === wsCompleted._id.toString());
        const hasAccepted = resAllDeadlines.upcomingDeadlines.some((d) => d.id.toString() === bkAccepted._id.toString());
        const passExclusions = !hasPast && !hasCompleted && !hasAccepted;

        const pass12 = passDeadlinesLimit && passAscendingOrder && passBrandProposalSource && passWorkspaceSource && passCreatorAppSource && passExclusions;

        console.log(`Deadlines count (limit 3): ${deadlines.length} (expected: 3)`);
        console.log(`Ascending order verified: ${passAscendingOrder}`);
        console.log(`First item source: ${firstItem.sourceType} (expected: brand_proposal)`);
        console.log(`Second item source: ${secondItem.sourceType} (expected: workspace)`);
        console.log(`Creator application source: ${creatorAppItem?.sourceType} (expected: campaign_application)`);
        console.log(`Exclusions (past, completed, accepted): ${passExclusions}`);

        summaryTable.push({
            Test: "S12. Service: Upcoming deadlines filtering, sorting & sources",
            Expected: "Limit: 3, Ascending: true, Sources: brand_proposal/workspace/campaign_application, Exclusions: true",
            Actual: `Limit:${deadlines.length}, Asc:${passAscendingOrder}, 1st:${firstItem.sourceType}, 2nd:${secondItem.sourceType}, App:${creatorAppItem?.sourceType}, Excl:${passExclusions}`,
            Status: pass12 ? "PASS" : "FAIL"
        });

        // SCENARIO 13: Pending request counts and active collaboration status breakdown
        console.log("\n--- [SCENARIO 13: Pending requests and active collaboration status breakdown] ---");
        const statusCreatorId = new mongoose.Types.ObjectId();

        // 13A. Pending bookings: 1 initiated by brand, 2 initiated by creator
        const bkBrand1 = await Booking.create({
            brand: testBrandId,
            creator: statusCreatorId,
            campaign: new mongoose.Types.ObjectId(),
            service: deadlineService._id,
            agreedPrice: 5000,
            deliverables: ["1 Video"],
            deadline: dateLater,
            status: "pending",
            initiatedBy: "brand"
        });
        createdBookingIds.push(bkBrand1._id);

        const bkCreator1 = await Booking.create({
            brand: testBrandId,
            creator: statusCreatorId,
            campaign: new mongoose.Types.ObjectId(),
            service: deadlineService._id,
            agreedPrice: 5000,
            deliverables: ["1 Video"],
            deadline: dateLater,
            status: "pending",
            initiatedBy: "creator"
        });
        createdBookingIds.push(bkCreator1._id);

        const bkCreator2 = await Booking.create({
            brand: testBrandId,
            creator: statusCreatorId,
            campaign: new mongoose.Types.ObjectId(),
            service: deadlineService._id,
            agreedPrice: 5000,
            deliverables: ["1 Video"],
            deadline: dateLater,
            status: "pending",
            initiatedBy: "creator"
        });
        createdBookingIds.push(bkCreator2._id);

        // 13B. Active workspaces: 1 in_progress, 1 submitted, 1 revision_requested
        const wsInProg = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: testCampaignId,
            brand: testBrandId,
            creator: statusCreatorId,
            service: deadlineService._id,
            agreedPrice: 6000,
            deadline: dateLater,
            status: "in_progress"
        });
        createdWorkspaceIds.push(wsInProg._id);

        const wsSubmitted = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: testCampaignId,
            brand: testBrandId,
            creator: statusCreatorId,
            service: deadlineService._id,
            agreedPrice: 6000,
            deadline: dateLater,
            status: "submitted"
        });
        createdWorkspaceIds.push(wsSubmitted._id);

        const wsRevision = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: testCampaignId,
            brand: testBrandId,
            creator: statusCreatorId,
            service: deadlineService._id,
            agreedPrice: 6000,
            deadline: dateLater,
            status: "revision_requested"
        });
        createdWorkspaceIds.push(wsRevision._id);

        const resStatus = await getCreatorDashboardOverviewService(statusCreatorId);
        const pendingReq = resStatus.metrics.pendingRequests;
        const activeCollab = resStatus.metrics.activeCollaborations;

        const passPendingReq =
            pendingReq.proposalsReceived === 1 &&
            pendingReq.applicationsSubmitted === 2 &&
            pendingReq.revisionsRequested === 1 &&
            pendingReq.total === 4;

        const passActiveCollab =
            activeCollab.total === 3 &&
            activeCollab.breakdown.inProgress === 1 &&
            activeCollab.breakdown.submitted === 1 &&
            activeCollab.breakdown.revisionRequested === 1;

        const pass13 = passPendingReq && passActiveCollab;
        console.log(`Pending requests: total=${pendingReq.total} (exp: 4), proposals=${pendingReq.proposalsReceived} (exp: 1), apps=${pendingReq.applicationsSubmitted} (exp: 2), revisions=${pendingReq.revisionsRequested} (exp: 1)`);
        console.log(`Active collabs: total=${activeCollab.total} (exp: 3), inProgress=${activeCollab.breakdown.inProgress}, submitted=${activeCollab.breakdown.submitted}, revisionRequested=${activeCollab.breakdown.revisionRequested}`);

        summaryTable.push({
            Test: "S13. Service: Pending requests & active collaborations breakdown",
            Expected: "Pending: total 4 (1/2/1), Active: total 3 (1/1/1)",
            Actual: `Pending:[${pendingReq.total},${pendingReq.proposalsReceived},${pendingReq.applicationsSubmitted},${pendingReq.revisionsRequested}], Active:[${activeCollab.total},${activeCollab.breakdown.inProgress},${activeCollab.breakdown.submitted},${activeCollab.breakdown.revisionRequested}]`,
            Status: pass13 ? "PASS" : "FAIL"
        });

        // SCENARIO 14: Recent workspace formatting (brand, service, compensation, currency, deliverable count)
        console.log("\n--- [SCENARIO 14: Recent workspace formatting] ---");
        const formatCreatorId = new mongoose.Types.ObjectId();
        const formatBrand = await Auth.create({
            name: "Vogue Brand Partner",
            email: `vogue.brand.${Date.now()}@example.com`,
            password: "hashedpassword123",
            role: "brand"
        });
        createdAuthIds.push(formatBrand._id);

        const formatCampaign = await Campaign.create({
            brand: formatBrand._id,
            title: "Vogue Autumn Collection",
            description: "High fashion campaign",
            category: "Fashion",
            platform: "instagram",
            budget: 60000,
            deadline: dateLater,
            requiredCreators: 1,
            deliverables: ["2 Reels"]
        });
        createdCampaignIds.push(formatCampaign._id);

        const formatService = await CreatorService.create({
            creator: formatCreatorId,
            title: "Premium Fashion Reel",
            category: "Fashion",
            platform: "instagram",
            price: 28000
        });
        createdServiceIds.push(formatService._id);

        const formatWs = await Workspace.create({
            booking: new mongoose.Types.ObjectId(),
            campaign: formatCampaign._id,
            brand: formatBrand._id,
            creator: formatCreatorId,
            service: formatService._id,
            agreedPrice: 28000,
            currency: "INR",
            deadline: dateLater,
            status: "in_progress",
            deliverables: [
                { title: "Deliverable 1: Storyboard", status: "pending" },
                { title: "Deliverable 2: Final Reel", status: "pending" }
            ]
        });
        createdWorkspaceIds.push(formatWs._id);

        const resFormat = await getCreatorDashboardOverviewService(formatCreatorId);
        const recentWsItem = resFormat.recentWorkspaces.find((w) => w.id.toString() === formatWs._id.toString());

        const pass14 =
            recentWsItem !== undefined &&
            recentWsItem.brand?.name === "Vogue Brand Partner" &&
            recentWsItem.service?.title === "Premium Fashion Reel" &&
            recentWsItem.service?.price === 28000 &&
            recentWsItem.compensation === 28000 &&
            recentWsItem.currency === "INR" &&
            recentWsItem.deliverablesCount === 2 &&
            recentWsItem.status === "in_progress";

        console.log(`Recent workspace: brand=${recentWsItem?.brand?.name}, service=${recentWsItem?.service?.title}, price=${recentWsItem?.service?.price}, compensation=${recentWsItem?.compensation}, currency=${recentWsItem?.currency}, deliverablesCount=${recentWsItem?.deliverablesCount}`);
        summaryTable.push({
            Test: "S14. Service: Recent workspace formatting",
            Expected: "brand: 'Vogue Brand Partner', service: 'Premium Fashion Reel', comp: 28000, curr: 'INR', count: 2",
            Actual: `brand:'${recentWsItem?.brand?.name}', service:'${recentWsItem?.service?.title}', comp:${recentWsItem?.compensation}, curr:'${recentWsItem?.currency}', count:${recentWsItem?.deliverablesCount}`,
            Status: pass14 ? "PASS" : "FAIL"
        });

        // SCENARIO 15: Creator user object contains expected id, name, and email
        console.log("\n--- [SCENARIO 15: Creator user basic info] ---");
        const userCreator = await Auth.create({
            name: "Aria Creator",
            email: `aria.creator.${Date.now()}@example.com`,
            password: "hashedpassword123",
            role: "creator"
        });
        createdAuthIds.push(userCreator._id);

        const resUser = await getCreatorDashboardOverviewService(userCreator._id);
        const pass15 =
            resUser.creator !== undefined &&
            resUser.creator.id.toString() === userCreator._id.toString() &&
            resUser.creator.name === "Aria Creator" &&
            resUser.creator.email === userCreator.email;

        console.log(`Creator user: id=${resUser.creator?.id}, name='${resUser.creator?.name}', email='${resUser.creator?.email}'`);
        summaryTable.push({
            Test: "S15. Service: Creator user basic info",
            Expected: `id:${userCreator._id}, name:'Aria Creator', email:'${userCreator.email}'`,
            Actual: `id:${resUser.creator?.id}, name:'${resUser.creator?.name}', email:'${resUser.creator?.email}'`,
            Status: pass15 ? "PASS" : "FAIL"
        });

    } catch (err) {
        testError = err;
        console.error("Test execution error encountered:", err);
    } finally {
        console.log("\n[CLEANUP] Cleaning up test records from database...");
        const cleanupErrors = [];

        try {
            if (createdPaymentIds.length > 0) {
                await Payment.deleteMany({ _id: { $in: createdPaymentIds } });
                console.log(`Payment test records cleaned up (${createdPaymentIds.length} records).`);
            }
        } catch (payDelErr) {
            console.error("Cleanup error while deleting payments:", payDelErr);
            cleanupErrors.push(payDelErr);
        }

        try {
            if (createdWorkspaceIds.length > 0) {
                await Workspace.deleteMany({ _id: { $in: createdWorkspaceIds } });
                console.log(`Workspace test records cleaned up (${createdWorkspaceIds.length} records).`);
            }
        } catch (wsDelErr) {
            console.error("Cleanup error while deleting workspaces:", wsDelErr);
            cleanupErrors.push(wsDelErr);
        }

        try {
            if (createdBookingIds.length > 0) {
                await Booking.deleteMany({ _id: { $in: createdBookingIds } });
                console.log(`Booking test records cleaned up (${createdBookingIds.length} records).`);
            }
        } catch (bkDelErr) {
            console.error("Cleanup error while deleting bookings:", bkDelErr);
            cleanupErrors.push(bkDelErr);
        }

        try {
            if (createdCampaignIds.length > 0) {
                await Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
                console.log(`Campaign test records cleaned up (${createdCampaignIds.length} records).`);
            }
        } catch (cmpDelErr) {
            console.error("Cleanup error while deleting campaigns:", cmpDelErr);
            cleanupErrors.push(cmpDelErr);
        }

        try {
            if (createdServiceIds.length > 0) {
                await CreatorService.deleteMany({ _id: { $in: createdServiceIds } });
                console.log(`CreatorService test records cleaned up (${createdServiceIds.length} records).`);
            }
        } catch (srvDelErr) {
            console.error("Cleanup error while deleting creator services:", srvDelErr);
            cleanupErrors.push(srvDelErr);
        }

        try {
            if (createdReviewIds.length > 0) {
                await Review.deleteMany({ _id: { $in: createdReviewIds } });
                console.log(`Review test records cleaned up (${createdReviewIds.length} records).`);
            }
        } catch (revDelErr) {
            console.error("Cleanup error while deleting reviews:", revDelErr);
            cleanupErrors.push(revDelErr);
        }

        try {
            if (createdMessageIds.length > 0) {
                await Message.deleteMany({ _id: { $in: createdMessageIds } });
                console.log(`Message test records cleaned up (${createdMessageIds.length} records).`);
            }
        } catch (msgDelErr) {
            console.error("Cleanup error while deleting messages:", msgDelErr);
            cleanupErrors.push(msgDelErr);
        }

        try {
            if (createdNotificationIds.length > 0) {
                await Notification.deleteMany({ _id: { $in: createdNotificationIds } });
                console.log(`Notification test records cleaned up (${createdNotificationIds.length} records).`);
            }
        } catch (notifDelErr) {
            console.error("Cleanup error while deleting notifications:", notifDelErr);
            cleanupErrors.push(notifDelErr);
        }

        try {
            if (createdAuthIds.length > 0) {
                await Auth.deleteMany({ _id: { $in: createdAuthIds } });
                console.log(`Auth test records cleaned up (${createdAuthIds.length} records).`);
            }
        } catch (authDelErr) {
            console.error("Cleanup error while deleting auth records:", authDelErr);
            cleanupErrors.push(authDelErr);
        }

        console.log("Disconnecting database...");
        try {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
                console.log("Database disconnected.");
            } else {
                console.log("Database was not connected.");
            }
        } catch (discErr) {
            console.error("Error during database disconnection:", discErr);
            cleanupErrors.push(discErr);
        }

        if (cleanupErrors.length > 0) {
            cleanupError = new Error(
                cleanupErrors.map((e) => e?.message || String(e)).join(" | ")
            );
        }
    }

    console.log("\n=============================================================");
    console.log("                      TEST RUN SUMMARY");
    console.log("=============================================================");
    console.table(summaryTable);

    const hasFailures = summaryTable.some((r) => r.Status !== "PASS");
    if (hasFailures || testError || cleanupError) {
        console.error("\n❌ TEST SUITE FAILED: One or more scenarios, assertions, or cleanup tasks did not pass.");
        if (cleanupError) {
            console.error("Cleanup failure details:", cleanupError?.message || cleanupError);
        }
        if (testError) {
            console.error("Test execution error details:", testError?.message || testError);
        }
        process.exit(1);
    } else {
        console.log("\n✅ ALL TEST SCENARIOS PASSED SUCCESSFULLY.");
        process.exit(0);
    }
}

runTests();
