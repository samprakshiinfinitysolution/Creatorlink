import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import connectDatabase from "../config/database.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import Booking from "../modules/booking/booking.model.js";
import Workspace from "../modules/workspace/workspace.model.js";
import Payment from "../modules/payments/payment.model.js";
import Message from "../modules/messages/message.model.js";
import Notification from "../modules/notifications/notification.model.js";
import Auth from "../modules/auth/auth.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";
import { getBrandDashboardOverviewService } from "../modules/brand/dashboard/dashboard.service.js";

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

async function runBrandDashboardTests() {
    console.log("=============================================================");
    console.log("             BRAND DASHBOARD BACKEND VERIFICATION");
    console.log("=============================================================");

    let testError = null;
    let cleanupError = null;
    const summaryTable = [];

    const testBrandId = new mongoose.Types.ObjectId();
    const testCreatorId = new mongoose.Types.ObjectId();
    const testCampaignId = new mongoose.Types.ObjectId();
    const testWs1 = new mongoose.Types.ObjectId();
    const testWs2 = new mongoose.Types.ObjectId();
    const testWs3 = new mongoose.Types.ObjectId();

    const createdAuthIds = [];
    const createdCampaignIds = [];
    const createdBookingIds = [];
    const createdWorkspaceIds = [];
    const createdPaymentIds = [];

    try {
        await connectDatabase();
        await Payment.init();

        // -------------------------------------------------------------
        // SECTION 1: HTTP Endpoint Authentication & Authorization Tests
        // -------------------------------------------------------------
        console.log("\n--- [HTTP TEST 1: Unauthenticated request to /api/brand/dashboard] ---");
        const resUnauth = await makeHttpRequest({ path: "/api/brand/dashboard" });
        const passUnauth = resUnauth.statusCode === 401;
        console.log(`Status Code: ${resUnauth.statusCode} (expected: 401)`);
        console.log(`Response message: ${resUnauth.body?.message}`);
        summaryTable.push({
            Test: "1. HTTP: Unauthenticated Request",
            Expected: "401 Unauthorized",
            Actual: `${resUnauth.statusCode} ${resUnauth.body?.message}`,
            Status: passUnauth ? "PASS" : "FAIL"
        });

        console.log("\n--- [HTTP TEST 2: Creator role accessing /api/brand/dashboard] ---");
        const creatorToken = generateAccessToken({ userId: testCreatorId.toString(), role: "creator" });
        const resCreator = await makeHttpRequest({
            path: "/api/brand/dashboard",
            cookie: `accessToken=${creatorToken}`
        });
        const passCreator = resCreator.statusCode === 403;
        console.log(`Status Code: ${resCreator.statusCode} (expected: 403)`);
        console.log(`Response message: ${resCreator.body?.message}`);
        summaryTable.push({
            Test: "2. HTTP: Creator Role Forbidden",
            Expected: "403 Forbidden",
            Actual: `${resCreator.statusCode} ${resCreator.body?.message}`,
            Status: passCreator ? "PASS" : "FAIL"
        });

        console.log("\n--- [HTTP TEST 3: Brand role accessing /api/brand/dashboard] ---");
        const brandToken = generateAccessToken({ userId: testBrandId.toString(), role: "brand" });
        const resBrand = await makeHttpRequest({
            path: "/api/brand/dashboard",
            cookie: `accessToken=${brandToken}`
        });
        const passBrand =
            resBrand.statusCode === 200 &&
            resBrand.body?.success === true &&
            resBrand.body?.data?.metrics !== undefined &&
            resBrand.body?.data?.recentCampaigns !== undefined;
        console.log(`Status Code: ${resBrand.statusCode} (expected: 200)`);
        console.log(`Success: ${resBrand.body?.success}, Message: ${resBrand.body?.message}`);
        summaryTable.push({
            Test: "3. HTTP: Brand Role Authorized",
            Expected: "200 Success with dashboard metrics",
            Actual: `${resBrand.statusCode} metrics:${!!resBrand.body?.data?.metrics}`,
            Status: passBrand ? "PASS" : "FAIL"
        });

        // -------------------------------------------------------------
        // SECTION 2: Service Layer & Business Logic Tests
        // -------------------------------------------------------------
        console.log("\n--- [SERVICE TEST 4: Brand with zero records] ---");
        const freshBrandId = new mongoose.Types.ObjectId();
        const resZero = await getBrandDashboardOverviewService(freshBrandId);
        const passZero =
            resZero.metrics.campaigns.total === 0 &&
            resZero.metrics.campaigns.active === 0 &&
            resZero.metrics.pendingBookings.total === 0 &&
            resZero.metrics.collaborations.active === 0 &&
            resZero.metrics.totalSpending.amount === 0 &&
            resZero.metrics.pendingPayments.totalOutstandingEstimated === 0 &&
            resZero.metrics.unread.messages === 0 &&
            resZero.metrics.unread.notifications === 0;
        summaryTable.push({
            Test: "4. Service: Zero records brand",
            Expected: "All counts and spending 0",
            Actual: `Campaigns:${resZero.metrics.campaigns.total}, Active:${resZero.metrics.campaigns.active}, Spend:${resZero.metrics.totalSpending.amount}`,
            Status: passZero ? "PASS" : "FAIL"
        });

        console.log("\n--- [SERVICE TEST 5: Campaigns active vs draft/closed] ---");
        const c1 = await Campaign.create({
            brand: testBrandId,
            title: "Summer Launch Campaign",
            description: "Promote summer collection",
            category: "Fashion",
            platform: "instagram",
            budget: 50000,
            deadline: new Date(Date.now() + 86400000 * 10),
            requiredCreators: 3,
            deliverables: ["1 Instagram Reel", "1 Story"],
            status: "published"
        });
        createdCampaignIds.push(c1._id);

        const c2 = await Campaign.create({
            brand: testBrandId,
            title: "Winter Teaser Campaign",
            description: "Tease winter collection",
            category: "Fashion",
            platform: "youtube",
            budget: 30000,
            deadline: new Date(Date.now() + 86400000 * 20),
            requiredCreators: 2,
            deliverables: ["1 Video"],
            status: "draft"
        });
        createdCampaignIds.push(c2._id);

        const resCamp = await getBrandDashboardOverviewService(testBrandId);
        const passCamp =
            resCamp.metrics.campaigns.total === 2 &&
            resCamp.metrics.campaigns.active === 1 &&
            resCamp.metrics.campaigns.statusBreakdown.published === 1 &&
            resCamp.metrics.campaigns.statusBreakdown.draft === 1;
        summaryTable.push({
            Test: "5. Service: Campaigns active breakdown",
            Expected: "Total: 2, Active: 1, Published: 1, Draft: 1",
            Actual: `Total:${resCamp.metrics.campaigns.total}, Active:${resCamp.metrics.campaigns.active}, Pub:${resCamp.metrics.campaigns.statusBreakdown.published}, Draft:${resCamp.metrics.campaigns.statusBreakdown.draft}`,
            Status: passCamp ? "PASS" : "FAIL"
        });

        console.log("\n--- [SERVICE TEST 6: Bookings creator-initiated vs brand-initiated] ---");
        const b1 = await Booking.create({
            brand: testBrandId,
            creator: testCreatorId,
            campaign: c1._id,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 15000,
            deliverables: ["1 Reel"],
            deadline: new Date(Date.now() + 86400000 * 5),
            status: "pending",
            initiatedBy: "creator"
        });
        createdBookingIds.push(b1._id);

        const testCreatorId2 = new mongoose.Types.ObjectId();
        const b2 = await Booking.create({
            brand: testBrandId,
            creator: testCreatorId2,
            campaign: c1._id,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 20000,
            deliverables: ["1 Reel"],
            deadline: new Date(Date.now() + 86400000 * 6),
            status: "pending",
            initiatedBy: "brand"
        });
        createdBookingIds.push(b2._id);

        const resBook = await getBrandDashboardOverviewService(testBrandId);
        const passBook =
            resBook.metrics.pendingBookings.total === 2 &&
            resBook.metrics.pendingBookings.creatorApplications === 1 &&
            resBook.metrics.pendingBookings.brandProposals === 1;
        summaryTable.push({
            Test: "6. Service: Pending bookings breakdown",
            Expected: "Total: 2, CreatorApps: 1, BrandProps: 1",
            Actual: `Total:${resBook.metrics.pendingBookings.total}, CreatorApps:${resBook.metrics.pendingBookings.creatorApplications}, BrandProps:${resBook.metrics.pendingBookings.brandProposals}`,
            Status: passBook ? "PASS" : "FAIL"
        });

        console.log("\n--- [SERVICE TEST 7: Total spending deduplication with different amounts & lifecycle] ---");
        // 1. Paid payment (5000, active)
        const p1 = await Payment.create({
            workspace: testWs1,
            booking: b1._id,
            campaign: c1._id,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 5000,
            currency: "INR",
            status: "paid",
            isActive: true,
            paidAt: new Date()
        });
        createdPaymentIds.push(p1._id);

        // Historical paid record on same workspace with DIFFERENT amount (2000, inactive)
        const p1_historical = await Payment.create({
            workspace: testWs1,
            booking: b1._id,
            campaign: c1._id,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 2000,
            currency: "INR",
            status: "paid",
            isActive: false
        });
        createdPaymentIds.push(p1_historical._id);

        // 2. Direct pending payment in-flight (3000)
        const p2 = await Payment.create({
            workspace: testWs2,
            booking: b2._id,
            campaign: c1._id,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 3000,
            currency: "INR",
            status: "pending",
            isActive: true
        });
        createdPaymentIds.push(p2._id);

        // 3. Completed workspace with no payment record (backlog: 4000)
        const ws3 = await Workspace.create({
            _id: testWs3,
            booking: new mongoose.Types.ObjectId(),
            campaign: c1._id,
            brand: testBrandId,
            creator: testCreatorId,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 4000,
            currency: "INR",
            deadline: new Date(Date.now() + 86400000 * 8),
            status: "completed"
        });
        createdWorkspaceIds.push(ws3._id);

        const resPay = await getBrandDashboardOverviewService(testBrandId);
        const passPay =
            resPay.metrics.totalSpending.amount === 5000 &&
            resPay.metrics.totalSpending.paidTransactionsCount === 1 &&
            resPay.metrics.pendingPayments.directPendingAmount === 3000 &&
            resPay.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount === 4000 &&
            resPay.metrics.pendingPayments.totalOutstandingEstimated === 7000;

        console.log(`Condition Check:
  totalSpending.amount (deduplicated: canonical active 5000, NOT 2000 or 7000): ${resPay.metrics.totalSpending.amount} (expected: 5000)
  totalSpending.paidTransactionsCount: ${resPay.metrics.totalSpending.paidTransactionsCount} (expected: 1, NOT 2)
  directPendingAmount: ${resPay.metrics.pendingPayments.directPendingAmount} (expected: 3000)
  unpaidWorkspacesEstimatedAmount: ${resPay.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount} (expected: 4000)
  totalOutstandingEstimated: ${resPay.metrics.pendingPayments.totalOutstandingEstimated} (expected: 7000)`);
        summaryTable.push({
            Test: "7. Service: Deduplication & pending lifecycle",
            Expected: "Spend: 5000 (not 7000), Count: 1, DirectPending: 3000, UnpaidBacklog: 4000, TotalEst: 7000",
            Actual: `Spend:${resPay.metrics.totalSpending.amount}, Count:${resPay.metrics.totalSpending.paidTransactionsCount}, Direct:${resPay.metrics.pendingPayments.directPendingAmount}, Backlog:${resPay.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount}`,
            Status: passPay ? "PASS" : "FAIL"
        });

        console.log("\n--- [SERVICE TEST 8: Multi-currency records (INR/USD mixed)] ---");
        const testWs4 = new mongoose.Types.ObjectId();
        const testWs5 = new mongoose.Types.ObjectId();

        const pUsd = await Payment.create({
            workspace: testWs4,
            booking: b1._id,
            campaign: c1._id,
            brand: testBrandId,
            creator: testCreatorId,
            amount: 250,
            currency: "USD",
            status: "paid",
            isActive: true,
            paidAt: new Date()
        });
        createdPaymentIds.push(pUsd._id);

        const wsUsdUnpaid = await Workspace.create({
            _id: testWs5,
            booking: new mongoose.Types.ObjectId(),
            campaign: c1._id,
            brand: testBrandId,
            creator: testCreatorId,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 180,
            currency: "USD",
            deadline: new Date(Date.now() + 86400000 * 7),
            status: "completed"
        });
        createdWorkspaceIds.push(wsUsdUnpaid._id);

        const res8 = await getBrandDashboardOverviewService(testBrandId);
        const usdSpending = res8.metrics.totalSpending.byCurrency.find((c) => c.currency === "USD");
        const inrSpending = res8.metrics.totalSpending.byCurrency.find((c) => c.currency === "INR");
        const usdPending = res8.metrics.pendingPayments.byCurrency.find((c) => c.currency === "USD");
        const inrPending = res8.metrics.pendingPayments.byCurrency.find((c) => c.currency === "INR");

        const pass8 =
            res8.metrics.totalSpending.amount === 5000 &&
            res8.metrics.totalSpending.currency === "INR" &&
            res8.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount === 4000 &&
            inrSpending?.amount === 5000 &&
            usdSpending?.amount === 250 &&
            inrPending?.unpaidWorkspacesEstimatedAmount === 4000 &&
            usdPending?.unpaidWorkspacesEstimatedAmount === 180;

        console.log(`Condition Check:
  totalSpending.amount (INR primary): ${res8.metrics.totalSpending.amount} (expected: 5000, USD 250 not mixed)
  unpaidWorkspacesEstimatedAmount (INR primary): ${res8.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount} (expected: 4000, USD 180 not mixed)
  byCurrency INR spending: ${inrSpending?.amount} (expected: 5000)
  byCurrency USD spending: ${usdSpending?.amount} (expected: 250)
  byCurrency INR unpaid backlog: ${inrPending?.unpaidWorkspacesEstimatedAmount} (expected: 4000)
  byCurrency USD unpaid backlog: ${usdPending?.unpaidWorkspacesEstimatedAmount} (expected: 180)`);
        summaryTable.push({
            Test: "8. Service: Multi-currency segregation",
            Expected: "Primary Spend: 5000 INR, USD Spend: 250, Primary Unpaid: 4000 INR, USD Unpaid: 180",
            Actual: `Primary Spend:${res8.metrics.totalSpending.amount}, USD Spend:${usdSpending?.amount}, Primary Unpaid:${res8.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount}, USD Unpaid:${usdPending?.unpaidWorkspacesEstimatedAmount}`,
            Status: pass8 ? "PASS" : "FAIL"
        });

        console.log("\n--- [SERVICE TEST 9: USD-only brand records (primary INR remains zero)] ---");
        const testUsdOnlyBrandId = new mongoose.Types.ObjectId();
        const testWsUsdOnly = new mongoose.Types.ObjectId();

        const pUsdOnly = await Payment.create({
            workspace: testWsUsdOnly,
            booking: b1._id,
            campaign: c1._id,
            brand: testUsdOnlyBrandId,
            creator: testCreatorId,
            amount: 400,
            currency: "USD",
            status: "paid",
            isActive: true,
            paidAt: new Date()
        });
        createdPaymentIds.push(pUsdOnly._id);

        const res9 = await getBrandDashboardOverviewService(testUsdOnlyBrandId);
        const usdOnlySpending = res9.metrics.totalSpending.byCurrency.find((c) => c.currency === "USD");

        const pass9 =
            res9.metrics.totalSpending.amount === 0 &&
            res9.metrics.totalSpending.currency === "INR" &&
            res9.metrics.totalSpending.paidTransactionsCount === 0 &&
            usdOnlySpending?.amount === 400 &&
            usdOnlySpending?.paidTransactionsCount === 1;

        console.log(`Condition Check:
  totalSpending.amount (primary zero INR): ${res9.metrics.totalSpending.amount} (expected: 0, NOT 400 USD)
  totalSpending.currency (primary): ${res9.metrics.totalSpending.currency} (expected: INR)
  totalSpending.paidTransactionsCount: ${res9.metrics.totalSpending.paidTransactionsCount} (expected: 0)
  byCurrency USD spending amount: ${usdOnlySpending?.amount} (expected: 400)`);
        summaryTable.push({
            Test: "9. Service: USD spending only (no INR)",
            Expected: "Primary Spend: 0 INR, Count: 0, USD byCurrency: 400",
            Actual: `Primary Spend:${res9.metrics.totalSpending.amount} ${res9.metrics.totalSpending.currency}, Count:${res9.metrics.totalSpending.paidTransactionsCount}, USD byCurrency:${usdOnlySpending?.amount}`,
            Status: pass9 ? "PASS" : "FAIL"
        });

        console.log("\n--- [SERVICE TEST 10: USD pending & unpaid workspaces only] ---");
        const testUsdPendingBrandId = new mongoose.Types.ObjectId();
        const testWsUsdPending1 = new mongoose.Types.ObjectId();
        const testWsUsdPending2 = new mongoose.Types.ObjectId();

        const pUsdDirectPending = await Payment.create({
            workspace: testWsUsdPending1,
            booking: b1._id,
            campaign: c1._id,
            brand: testUsdPendingBrandId,
            creator: testCreatorId,
            amount: 120,
            currency: "USD",
            status: "pending",
            isActive: true
        });
        createdPaymentIds.push(pUsdDirectPending._id);

        const wsUsdUnpaid2 = await Workspace.create({
            _id: testWsUsdPending2,
            booking: new mongoose.Types.ObjectId(),
            campaign: c1._id,
            brand: testUsdPendingBrandId,
            creator: testCreatorId,
            service: new mongoose.Types.ObjectId(),
            agreedPrice: 200,
            currency: "USD",
            deadline: new Date(Date.now() + 86400000 * 7),
            status: "completed"
        });
        createdWorkspaceIds.push(wsUsdUnpaid2._id);

        const res10 = await getBrandDashboardOverviewService(testUsdPendingBrandId);
        const usdPendingEntry = res10.metrics.pendingPayments.byCurrency.find((c) => c.currency === "USD");

        const pass10 =
            res10.metrics.pendingPayments.amount === 0 &&
            res10.metrics.pendingPayments.currency === "INR" &&
            res10.metrics.pendingPayments.count === 0 &&
            res10.metrics.pendingPayments.directPendingAmount === 0 &&
            res10.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount === 0 &&
            res10.metrics.pendingPayments.totalOutstandingEstimated === 0 &&
            usdPendingEntry?.directPendingAmount === 120 &&
            usdPendingEntry?.unpaidWorkspacesEstimatedAmount === 200 &&
            usdPendingEntry?.totalOutstandingEstimated === 320;

        console.log(`Condition Check:
  pendingPayments.directPendingAmount (primary zero INR): ${res10.metrics.pendingPayments.directPendingAmount} (expected: 0)
  pendingPayments.unpaidWorkspacesEstimatedAmount (primary zero INR): ${res10.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount} (expected: 0)
  pendingPayments.totalOutstandingEstimated (primary zero INR): ${res10.metrics.pendingPayments.totalOutstandingEstimated} (expected: 0)
  byCurrency USD directPendingAmount: ${usdPendingEntry?.directPendingAmount} (expected: 120)
  byCurrency USD unpaidWorkspacesEstimatedAmount: ${usdPendingEntry?.unpaidWorkspacesEstimatedAmount} (expected: 200)
  byCurrency USD totalOutstandingEstimated: ${usdPendingEntry?.totalOutstandingEstimated} (expected: 320)`);
        summaryTable.push({
            Test: "10. Service: USD pending only (no INR)",
            Expected: "Primary Pending: 0 INR, Unpaid: 0 INR, USD Direct: 120, USD Unpaid: 200, USD Est: 320",
            Actual: `Primary Pending:${res10.metrics.pendingPayments.directPendingAmount}, Unpaid:${res10.metrics.pendingPayments.unpaidWorkspacesEstimatedAmount}, USD Direct:${usdPendingEntry?.directPendingAmount}, USD Unpaid:${usdPendingEntry?.unpaidWorkspacesEstimatedAmount}`,
            Status: pass10 ? "PASS" : "FAIL"
        });

        console.log("\n--- [SERVICE TEST 11: Campaign currency handling (default, deadline, recent)] ---");
        const passDefaultCurrency = c1.currency === "INR";
        const campaignDeadlineItem = resPay.upcomingDeadlines.find((d) => d.sourceType === "campaign");
        const passDeadlineCurrency = campaignDeadlineItem !== undefined && campaignDeadlineItem.currency === "INR";
        const recentCampaignItem = resPay.recentCampaigns.find((c) => c.id.toString() === c1._id.toString());
        const passRecentCurrency = recentCampaignItem !== undefined && recentCampaignItem.currency === "INR";
        const passUnrelatedFields =
            resPay.metrics.campaigns.total === 2 &&
            recentCampaignItem?.budget === 50000 &&
            recentCampaignItem?.title === "Summer Launch Campaign" &&
            campaignDeadlineItem?.title === "Summer Launch Campaign";

        const pass11 = passDefaultCurrency && passDeadlineCurrency && passRecentCurrency && passUnrelatedFields;

        console.log(`Condition Check:
  Campaign model default currency (unspecified): ${c1.currency} (expected: INR)
  Upcoming deadline currency: ${campaignDeadlineItem?.currency} (expected: INR)
  Recent campaign currency: ${recentCampaignItem?.currency} (expected: INR)
  Unrelated metrics & fields intact: ${passUnrelatedFields} (expected: true)`);

        summaryTable.push({
            Test: "11. Service: Campaign currency handling",
            Expected: "Model default INR, deadline currency: INR, recent currency: INR, metrics intact",
            Actual: `Default:${c1.currency}, Deadline:${campaignDeadlineItem?.currency}, Recent:${recentCampaignItem?.currency}, Intact:${passUnrelatedFields}`,
            Status: pass11 ? "PASS" : "FAIL"
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
            console.error("Error deleting payments:", payDelErr);
            cleanupErrors.push(payDelErr);
        }

        try {
            if (createdWorkspaceIds.length > 0) {
                await Workspace.deleteMany({ _id: { $in: createdWorkspaceIds } });
                console.log(`Workspace test records cleaned up (${createdWorkspaceIds.length} records).`);
            }
        } catch (wsDelErr) {
            console.error("Error deleting workspaces:", wsDelErr);
            cleanupErrors.push(wsDelErr);
        }

        try {
            if (createdBookingIds.length > 0) {
                await Booking.deleteMany({ _id: { $in: createdBookingIds } });
                console.log(`Booking test records cleaned up (${createdBookingIds.length} records).`);
            }
        } catch (bkDelErr) {
            console.error("Error deleting bookings:", bkDelErr);
            cleanupErrors.push(bkDelErr);
        }

        try {
            if (createdCampaignIds.length > 0) {
                await Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
                console.log(`Campaign test records cleaned up (${createdCampaignIds.length} records).`);
            }
        } catch (cmpDelErr) {
            console.error("Error deleting campaigns:", cmpDelErr);
            cleanupErrors.push(cmpDelErr);
        }

        try {
            if (createdAuthIds.length > 0) {
                await Auth.deleteMany({ _id: { $in: createdAuthIds } });
                console.log(`Auth test records cleaned up (${createdAuthIds.length} records).`);
            }
        } catch (authDelErr) {
            console.error("Error deleting auth records:", authDelErr);
            cleanupErrors.push(authDelErr);
        }

        console.log("Disconnecting database...");
        try {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
                console.log("Database disconnected.");
            }
        } catch (discErr) {
            console.error("Error disconnecting database:", discErr);
            cleanupErrors.push(discErr);
        }

        if (cleanupErrors.length > 0) {
            cleanupError = new Error(cleanupErrors.map(e => e?.message || String(e)).join(" | "));
        }
    }

    console.log("\n=============================================================");
    console.log("                      TEST RUN SUMMARY");
    console.log("=============================================================");
    console.table(summaryTable);

    const hasFailures = summaryTable.some((r) => r.Status !== "PASS");
    if (hasFailures || testError || cleanupError) {
        console.error("\n❌ TEST SUITE FAILED: One or more tests, assertions, or cleanup tasks did not pass.");
        if (cleanupError) console.error("Cleanup failure details:", cleanupError.message);
        if (testError) console.error("Test execution details:", testError.message);
        process.exit(1);
    } else {
        console.log("\n✅ ALL BRAND DASHBOARD TESTS PASSED SUCCESSFULLY.");
        process.exit(0);
    }
}

runBrandDashboardTests();
