import assert from "assert";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import app from "../src/app.js";
import { connectTestDatabase } from "../src/config/database.js";
import { generateOAuthState } from "../src/modules/creator/instagram/instagramOAuthState.helper.js";
import InstagramOAuthState from "../src/modules/creator/instagram/instagramOAuthState.model.js";

console.log("===============================================================");
console.log("INSTAGRAM OAUTH CALLBACK SKELETON TEST SUITE");
console.log("===============================================================");

// Mock Meta Graph API calls while keeping local HTTP server requests real
const realFetch = global.fetch;
global.fetch = async (url, options) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    if (urlStr.includes("graph.facebook.com")) {
        if (urlStr.includes("/oauth/access_token")) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    access_token: "mock_meta_access_token_12345",
                    token_type: "bearer",
                    expires_in: 5184000
                })
            };
        }
        if (urlStr.includes("/assigned_instagram_accounts")) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    data: [
                        { id: "1784140001", username: "creator_test" }
                    ]
                })
            };
        }
        // Account profile endpoint
        return {
            ok: true,
            status: 200,
            json: async () => ({
                id: "1784140001",
                username: "creator_test",
                name: "Creator Test",
                profile_picture_url: "https://example.com/pic.jpg",
                followers_count: 12500,
                media_count: 85
            })
        };
    }
    return realFetch(url, options);
};

// Spin up an ephemeral local HTTP server to test real Express routing
const server = http.createServer(app);

await new Promise((resolve) => server.listen(0, resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;
console.log(`✓ Ephemeral test server running at ${baseUrl}`);

const frontendBase = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
let testCreatorId = null;

try {
    await connectTestDatabase();
    console.log("✓ Connected to isolated MongoDB test database");

    testCreatorId = new mongoose.Types.ObjectId();

    // Pre-clean test records
    await InstagramOAuthState.deleteMany({ creator: testCreatorId });
    await mongoose.connection.collection("instagramaccounts").deleteMany({
        $or: [{ creator: testCreatorId }, { instagramUserId: "1784140001" }]
    });

    // 1. Test public route access (no Authorization header or cookies)
    console.log("\n--- 1. Testing Public Accessibility ---");
    const publicRes = await fetch(`${baseUrl}/api/creator/instagram/callback`, {
        redirect: "manual"
    });
    // Must NOT be 401 Unauthorized or 403 Forbidden; should redirect to frontend with error
    assert.strictEqual(publicRes.status, 302, "Callback route must be public and perform HTTP 302 redirect");
    const publicRedirectLocation = publicRes.headers.get("location");
    assert.ok(publicRedirectLocation.startsWith(frontendBase), "Must redirect to frontend");
    assert.ok(publicRedirectLocation.includes("instagram=error"), "Must include error status when params missing");
    console.log("✓ Route is public and does not require auth cookies or JWT.");

    // 2. Test Meta error handling (cancellation / user_denied)
    console.log("\n--- 2. Testing Meta Query Error Handling ---");
    const cancelledRes = await fetch(
        `${baseUrl}/api/creator/instagram/callback?error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied`,
        { redirect: "manual" }
    );
    assert.strictEqual(cancelledRes.status, 302);
    const cancelledLocation = cancelledRes.headers.get("location");
    assert.strictEqual(
        cancelledLocation,
        `${frontendBase}/creator/settings?instagram=cancelled`,
        "Must redirect to ?instagram=cancelled on user_denied"
    );
    console.log("✓ User cancellation (access_denied) correctly redirected to ?instagram=cancelled.");

    const genericErrorRes = await fetch(
        `${baseUrl}/api/creator/instagram/callback?error=server_error&error_description=Internal+error`,
        { redirect: "manual" }
    );
    assert.strictEqual(genericErrorRes.status, 302);
    const genericLocation = genericErrorRes.headers.get("location");
    assert.ok(genericLocation.includes("instagram=error"), "Must redirect with error status");
    console.log("✓ Generic Meta error correctly redirected with error status.");

    // 3. Test missing parameter validations
    console.log("\n--- 3. Testing Missing Parameter Validations ---");
    const missingCodeRes = await fetch(
        `${baseUrl}/api/creator/instagram/callback?state=somestate`,
        { redirect: "manual" }
    );
    assert.strictEqual(missingCodeRes.status, 302);
    assert.ok(missingCodeRes.headers.get("location").includes("instagram=error"));

    const missingStateRes = await fetch(
        `${baseUrl}/api/creator/instagram/callback?code=somecode`,
        { redirect: "manual" }
    );
    assert.strictEqual(missingStateRes.status, 302);
    assert.ok(missingStateRes.headers.get("location").includes("instagram=error"));
    console.log("✓ Missing code and missing state validations passed.");

    // 4. Test invalid / tampered state handling
    console.log("\n--- 4. Testing Tampered State Handling ---");
    const tamperedRes = await fetch(
        `${baseUrl}/api/creator/instagram/callback?code=mock_code&state=invalid_base64_tampered_payload`,
        { redirect: "manual" }
    );
    assert.strictEqual(tamperedRes.status, 302);
    const tamperedLocation = tamperedRes.headers.get("location");
    assert.ok(tamperedLocation.includes("instagram=error"));
    assert.ok(!tamperedLocation.includes("mock_code"), "Authorization code must NEVER be reflected in redirect URL");
    assert.ok(!tamperedLocation.includes("tampered"), "Internal error details must not be exposed");
    console.log("✓ Tampered state handled safely without leaking codes or internal errors.");

    // 5. Test valid state generation, consumption and success redirect
    console.log("\n--- 5. Testing Valid Flow & Atomic State Consumption ---");
    const validState = await generateOAuthState(testCreatorId);
    assert.strictEqual(typeof validState, "string");

    const successRes = await fetch(
        `${baseUrl}/api/creator/instagram/callback?code=mock_meta_auth_code_12345&state=${encodeURIComponent(validState)}`,
        { redirect: "manual" }
    );
    assert.strictEqual(successRes.status, 302);
    const successLocation = successRes.headers.get("location");
    assert.strictEqual(
        successLocation,
        `${frontendBase}/creator/settings?instagram=success&username=creator_test`,
        "Must redirect strictly to ?instagram=success upon completed persistence"
    );
    assert.ok(!successLocation.includes("mock_meta_auth_code_12345"), "Must not leak authorization code in redirect");
    assert.ok(!successLocation.includes(validState), "Must not leak state parameter in redirect");

    // Verify in MongoDB that the state was atomically consumed
    const decoded = JSON.parse(Buffer.from(validState, "base64url").toString("utf8"));
    const crypto = await import("crypto");
    const nonceHash = crypto.createHash("sha256").update(decoded.n).digest("hex");
    const dbRecord = await InstagramOAuthState.findOne({ nonceHash });
    assert.ok(dbRecord, "State document must exist");
    assert.strictEqual(dbRecord.isConsumed, true, "State must be marked isConsumed: true");
    console.log("✓ State atomically consumed in MongoDB and redirected strictly to ?instagram=success.");

    // 6. Test replay protection (using the exact same valid state a second time)
    console.log("\n--- 6. Testing Replay Protection on Consumed State ---");
    const replayRes = await fetch(
        `${baseUrl}/api/creator/instagram/callback?code=mock_meta_auth_code_12345&state=${encodeURIComponent(validState)}`,
        { redirect: "manual" }
    );
    assert.strictEqual(replayRes.status, 302);
    const replayLocation = replayRes.headers.get("location");
    assert.ok(replayLocation.includes("instagram=error"), "Replayed request must be rejected with error");
    assert.ok(
        replayLocation.includes(encodeURIComponent("already been used")),
        "Error message must indicate session has already been used"
    );
    console.log("✓ Replayed state rejected safely and redirected with user-friendly session reuse error.");

} finally {
    global.fetch = realFetch;
    try {
        if (mongoose.connection.readyState === 1) {
            await InstagramOAuthState.deleteMany({ creator: testCreatorId });
            await mongoose.connection.collection("instagramaccounts").deleteMany({
                $or: [{ creator: testCreatorId }, { instagramUserId: "1784140001" }]
            });
            console.log("✓ Test records cleaned up in finally block.");
        }
    } catch (cleanupErr) {
        console.error("Warning: Error during test cleanup:", cleanupErr.message);
    }
    await mongoose.disconnect();
    server.close();
    console.log("✓ Ephemeral server closed, fetch restored, and database disconnected.");
}

console.log("\n===============================================================");
console.log("ALL STEP 5A INSTAGRAM CALLBACK SKELETON TESTS PASSED (100%)!");
console.log("===============================================================");
