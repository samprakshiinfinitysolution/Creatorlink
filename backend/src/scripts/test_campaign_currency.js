import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import connectDatabase from "../config/database.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function makeHttpRequest({ path, method = "GET", body = null, cookie = null }) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: "localhost",
            port: 5005,
            path,
            method,
            headers: {
                ...(cookie ? { Cookie: cookie } : {}),
                ...(payload ? {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(payload)
                } : {})
            }
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
        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

async function runCampaignCurrencyTests() {
    console.log("=============================================================");
    console.log("       CAMPAIGN CURRENCY VERIFICATION (INR ONLY)");
    console.log("=============================================================");

    let anyTestFailed = false;
    let cleanupError = null;
    const summaryTable = [];

    const testBrandId = new mongoose.Types.ObjectId();
    const brandToken = generateAccessToken({ userId: testBrandId.toString(), role: "brand" });
    const authCookie = `accessToken=${brandToken}`;

    const createdCampaignIds = [];

    const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
        await connectDatabase();

        // -------------------------------------------------------------
        // TEST 1: Creating a Campaign without currency results in INR
        // -------------------------------------------------------------
        console.log("\n--- [TEST 1: Create Campaign without currency] ---");
        const createNoCurrencyPayload = {
            title: "Test Campaign Without Currency",
            description: "Testing default currency assignment",
            category: "Technology",
            platform: "youtube",
            budget: 25000,
            deadline: futureDeadline,
            requiredCreators: 2,
            deliverables: ["1x YouTube Integration"]
        };

        const res1 = await makeHttpRequest({
            path: "/api/brand/campaigns",
            method: "POST",
            body: createNoCurrencyPayload,
            cookie: authCookie
        });

        const c1 = res1.body?.data;
        if (c1?._id) createdCampaignIds.push(new mongoose.Types.ObjectId(c1._id));

        const pass1 = res1.statusCode === 201 && c1?.currency === "INR";
        if (!pass1) anyTestFailed = true;

        console.log(`Status Code: ${res1.statusCode} (expected: 201)`);
        console.log(`Currency: ${c1?.currency} (expected: 'INR')`);
        summaryTable.push({
            Test: "1. Create without currency",
            Expected: "201 Created with currency: 'INR'",
            Actual: `${res1.statusCode} currency: '${c1?.currency}'`,
            Status: pass1 ? "PASS" : "FAIL"
        });

        // -------------------------------------------------------------
        // TEST 2: Creating a Campaign with currency: "INR" succeeds
        // -------------------------------------------------------------
        console.log("\n--- [TEST 2: Create Campaign with currency: 'INR'] ---");
        const createWithInrPayload = {
            title: "Test Campaign With INR",
            description: "Testing explicit INR currency assignment",
            category: "Fashion",
            platform: "instagram",
            budget: 45000,
            currency: "INR",
            deadline: futureDeadline,
            requiredCreators: 1,
            deliverables: ["1x Reel"]
        };

        const res2 = await makeHttpRequest({
            path: "/api/brand/campaigns",
            method: "POST",
            body: createWithInrPayload,
            cookie: authCookie
        });

        const c2 = res2.body?.data;
        if (c2?._id) createdCampaignIds.push(new mongoose.Types.ObjectId(c2._id));

        const pass2 = res2.statusCode === 201 && c2?.currency === "INR";
        if (!pass2) anyTestFailed = true;

        console.log(`Status Code: ${res2.statusCode} (expected: 201)`);
        console.log(`Currency: ${c2?.currency} (expected: 'INR')`);
        summaryTable.push({
            Test: "2. Create with currency: 'INR'",
            Expected: "201 Created with currency: 'INR'",
            Actual: `${res2.statusCode} currency: '${c2?.currency}'`,
            Status: pass2 ? "PASS" : "FAIL"
        });

        // -------------------------------------------------------------
        // TEST 3: Creating a Campaign with currency: "USD" is rejected
        // -------------------------------------------------------------
        console.log("\n--- [TEST 3: Create Campaign with currency: 'USD'] ---");
        const createWithUsdPayload = {
            title: "Test Campaign With USD",
            description: "Testing rejection of non-INR currency",
            category: "Technology",
            platform: "youtube",
            budget: 1000,
            currency: "USD",
            deadline: futureDeadline,
            requiredCreators: 1,
            deliverables: ["1x Video"]
        };

        const res3 = await makeHttpRequest({
            path: "/api/brand/campaigns",
            method: "POST",
            body: createWithUsdPayload,
            cookie: authCookie
        });

        const pass3 = res3.statusCode === 400 &&
            res3.body?.message === "Only INR currency is currently supported";
        if (!pass3) anyTestFailed = true;

        console.log(`Status Code: ${res3.statusCode} (expected: 400)`);
        console.log(`Message: ${res3.body?.message}`);
        summaryTable.push({
            Test: "3. Create with currency: 'USD'",
            Expected: "400 Only INR currency is currently supported",
            Actual: `${res3.statusCode} '${res3.body?.message}'`,
            Status: pass3 ? "PASS" : "FAIL"
        });

        // -------------------------------------------------------------
        // TEST 4: Updating a Campaign with currency: "USD" is rejected
        // -------------------------------------------------------------
        console.log("\n--- [TEST 4: Update Campaign with currency: 'USD'] ---");
        const targetCampaignId = c1?._id;

        const res4 = await makeHttpRequest({
            path: `/api/brand/campaigns/${targetCampaignId}`,
            method: "PATCH",
            body: { currency: "USD" },
            cookie: authCookie
        });

        const pass4 = res4.statusCode === 400 &&
            res4.body?.message === "Only INR currency is currently supported";
        if (!pass4) anyTestFailed = true;

        console.log(`Status Code: ${res4.statusCode} (expected: 400)`);
        console.log(`Message: ${res4.body?.message}`);
        summaryTable.push({
            Test: "4. Update with currency: 'USD'",
            Expected: "400 Only INR currency is currently supported",
            Actual: `${res4.statusCode} '${res4.body?.message}'`,
            Status: pass4 ? "PASS" : "FAIL"
        });

        // -------------------------------------------------------------
        // TEST 5: Updating a Campaign with currency: "INR" works
        // -------------------------------------------------------------
        console.log("\n--- [TEST 5: Update Campaign with currency: 'INR'] ---");
        const res5 = await makeHttpRequest({
            path: `/api/brand/campaigns/${targetCampaignId}`,
            method: "PATCH",
            body: { currency: "INR" },
            cookie: authCookie
        });

        const pass5 = res5.statusCode === 200 &&
            res5.body?.success === true &&
            res5.body?.data?.currency === "INR";
        if (!pass5) anyTestFailed = true;

        console.log(`Status Code: ${res5.statusCode} (expected: 200)`);
        console.log(`Updated Currency: ${res5.body?.data?.currency}`);
        summaryTable.push({
            Test: "5. Update with currency: 'INR'",
            Expected: "200 OK with currency: 'INR'",
            Actual: `${res5.statusCode} currency: '${res5.body?.data?.currency}'`,
            Status: pass5 ? "PASS" : "FAIL"
        });

        // -------------------------------------------------------------
        // TEST 6: Existing campaigns without a stored currency remain usable and display as INR
        // -------------------------------------------------------------
        console.log("\n--- [TEST 6: Backward compatibility for legacy campaigns without currency] ---");
        const legacyCampaignId = new mongoose.Types.ObjectId();
        createdCampaignIds.push(legacyCampaignId);

        // Insert directly via MongoDB collection driver to bypass Mongoose schema defaults at write time
        await Campaign.collection.insertOne({
            _id: legacyCampaignId,
            brand: testBrandId,
            title: "Legacy Campaign Before Currency Added",
            description: "Simulating pre-existing campaign with no currency field in DB",
            category: "Lifestyle",
            platform: "instagram",
            budget: 15000,
            // Notice: no currency field stored
            deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            requiredCreators: 1,
            deliverables: ["1x Story"],
            status: "published",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // 6A: Direct check in raw DB: verify currency field is truly missing in raw storage
        const rawDoc = await Campaign.collection.findOne({ _id: legacyCampaignId });
        const hasNoStoredCurrency = !("currency" in rawDoc);

        // 6B: Mongoose model findById: schema default applies
        const mongooseDoc = await Campaign.findById(legacyCampaignId);
        const mongooseCurrency = mongooseDoc?.currency;

        // 6C: HTTP GET /api/brand/campaigns/:id
        const res6Get = await makeHttpRequest({
            path: `/api/brand/campaigns/${legacyCampaignId}`,
            cookie: authCookie
        });

        // 6D: HTTP GET /api/brand/campaigns list
        const res6List = await makeHttpRequest({
            path: "/api/brand/campaigns",
            cookie: authCookie
        });
        const foundInList = res6List.body?.data?.campaigns?.find(
            (c) => c._id === legacyCampaignId.toString()
        );

        // 6E: HTTP PATCH /api/brand/campaigns/:id updating title
        const res6Patch = await makeHttpRequest({
            path: `/api/brand/campaigns/${legacyCampaignId}`,
            method: "PATCH",
            body: { title: "Updated Legacy Campaign Title" },
            cookie: authCookie
        });

        const pass6 = hasNoStoredCurrency &&
            mongooseCurrency === "INR" &&
            res6Get.statusCode === 200 &&
            res6Get.body?.data?.currency === "INR" &&
            foundInList?.currency === "INR" &&
            res6Patch.statusCode === 200 &&
            res6Patch.body?.data?.title === "Updated Legacy Campaign Title" &&
            res6Patch.body?.data?.currency === "INR";

        if (!pass6) anyTestFailed = true;

        console.log(`Raw DB document has currency field: ${!hasNoStoredCurrency} (expected: false)`);
        console.log(`Mongoose doc currency: ${mongooseCurrency} (expected: 'INR')`);
        console.log(`GET /:id status: ${res6Get.statusCode}, currency: ${res6Get.body?.data?.currency}`);
        console.log(`GET list item currency: ${foundInList?.currency}`);
        console.log(`PATCH update status: ${res6Patch.statusCode}, title: '${res6Patch.body?.data?.title}', currency: ${res6Patch.body?.data?.currency}`);

        summaryTable.push({
            Test: "6. Legacy campaign without stored currency",
            Expected: "Treated as 'INR', readable and updatable",
            Actual: `Mongoose: '${mongooseCurrency}', GET: '${res6Get.body?.data?.currency}', PATCH: '${res6Patch.body?.data?.currency}'`,
            Status: pass6 ? "PASS" : "FAIL"
        });

        // -------------------------------------------------------------
        // TEST 7: Campaign budget and all unrelated fields continue to work
        // -------------------------------------------------------------
        console.log("\n--- [TEST 7: Campaign budget and unrelated fields work] ---");
        const res7Create = await makeHttpRequest({
            path: "/api/brand/campaigns",
            method: "POST",
            body: {
                title: "Complete Fields Campaign",
                description: "Full field verification",
                category: "Gaming",
                platform: "youtube",
                budget: 80000,
                currency: "INR",
                deadline: futureDeadline,
                requiredCreators: 4,
                deliverables: ["2x 2hr Livestream"]
            },
            cookie: authCookie
        });

        const c7 = res7Create.body?.data;
        if (c7?._id) createdCampaignIds.push(new mongoose.Types.ObjectId(c7._id));

        const res7PatchBudget = await makeHttpRequest({
            path: `/api/brand/campaigns/${c7?._id}`,
            method: "PATCH",
            body: { budget: 95000 },
            cookie: authCookie
        });

        const pass7 = res7Create.statusCode === 201 &&
            c7?.budget === 80000 &&
            c7?.category === "Gaming" &&
            c7?.platform === "youtube" &&
            c7?.requiredCreators === 4 &&
            Array.isArray(c7?.deliverables) &&
            c7?.deliverables[0] === "2x 2hr Livestream" &&
            res7PatchBudget.statusCode === 200 &&
            res7PatchBudget.body?.data?.budget === 95000 &&
            res7PatchBudget.body?.data?.currency === "INR";

        if (!pass7) anyTestFailed = true;

        console.log(`Create with budget 80000 status: ${res7Create.statusCode}, budget: ${c7?.budget}`);
        console.log(`Update budget to 95000 status: ${res7PatchBudget.statusCode}, budget: ${res7PatchBudget.body?.data?.budget}, currency: ${res7PatchBudget.body?.data?.currency}`);

        summaryTable.push({
            Test: "7. Budget & unrelated fields",
            Expected: "Budget and all fields persist and update properly",
            Actual: `Created budget: ${c7?.budget}, Updated budget: ${res7PatchBudget.body?.data?.budget}`,
            Status: pass7 ? "PASS" : "FAIL"
        });

    } catch (err) {
        console.error("Test execution encountered an error:", err);
        anyTestFailed = true;
    } finally {
        console.log("\n--- [CLEANUP] ---");
        try {
            if (createdCampaignIds.length > 0) {
                const deleteRes = await Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
                console.log(`Cleaned up ${deleteRes.deletedCount} test campaigns.`);
            }
        } catch (err) {
            console.error("Error during campaign cleanup:", err);
            cleanupError = err;
        }

        try {
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB.");
        } catch (err) {
            console.error("Error during MongoDB disconnection:", err);
            cleanupError = cleanupError || err;
        }

        console.log("\n=============================================================");
        console.log("                     TEST SUMMARY TABLE");
        console.log("=============================================================");
        console.table(summaryTable);

        if (anyTestFailed || cleanupError) {
            console.error("\nTEST SUITE FAILED.");
            process.exit(1);
        } else {
            console.log("\nALL 7 TESTS PASSED SUCCESSFULLY!");
            process.exit(0);
        }
    }
}

runCampaignCurrencyTests();
