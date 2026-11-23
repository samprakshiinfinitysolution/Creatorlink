import assert from "assert";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import http from "http";
import mongoose from "mongoose";

import { connectTestDatabase } from "../src/config/database.js";
import { getConnectedInstagramAccount } from "../src/modules/creator/instagram/instagram.service.js";
import InstagramAccount from "../src/modules/creator/instagram/instagram.model.js";
import Auth from "../src/modules/auth/auth.model.js";
import app from "../src/app.js";
import { generateAccessToken } from "../src/utils/helpers/token.helper.js";

console.log("===============================================================");
console.log("GET CONNECTED INSTAGRAM ACCOUNT ENDPOINT TEST SUITE");
console.log("===============================================================");

await connectTestDatabase();
console.log("✓ Connected to isolated MongoDB test database");

let server = null;
const allTestCreators = [];
const allTestInstagramIds = [];
const allTestAuthIds = [];

try {
    // -------------------------------------------------------------
    // 1. Service Layer Tests
    // -------------------------------------------------------------
    console.log("\n--- 1. Testing getConnectedInstagramAccount Service ---");

    // Case 1A: creatorId is missing or falsy -> throws 400 ApiError
    let threwForMissingCreator = false;
    try {
        await getConnectedInstagramAccount(null);
    } catch (err) {
        threwForMissingCreator = true;
        assert.strictEqual(err.statusCode, 400);
        assert.ok(err.message.includes("Creator ID is required"));
    }
    assert.ok(threwForMissingCreator, "Should throw 400 when creatorId is null");
    console.log("✓ Service throws 400 error when creatorId is missing.");

    // Case 1B: Creator without Instagram account -> returns { isConnected: false, account: null }
    const unconnectedCreatorId = new mongoose.Types.ObjectId();
    allTestCreators.push(unconnectedCreatorId);

    const unconnectedResult = await getConnectedInstagramAccount(unconnectedCreatorId);
    assert.strictEqual(unconnectedResult.isConnected, false);
    assert.strictEqual(unconnectedResult.account, null);
    console.log("✓ Service returns { isConnected: false, account: null } for unconnected creator.");

    // Case 1C: Creator with connected Instagram account -> returns safe account details
    const connectedCreatorId = new mongoose.Types.ObjectId();
    const testInstagramUserId = "ig_test_user_998877";
    allTestCreators.push(connectedCreatorId);
    allTestInstagramIds.push(testInstagramUserId);

    // Pre-clean
    await InstagramAccount.deleteMany({
        $or: [
            { creator: connectedCreatorId },
            { instagramUserId: testInstagramUserId }
        ]
    });

    await InstagramAccount.create({
        creator: connectedCreatorId,
        instagramUserId: testInstagramUserId,
        username: "service_test_creator",
        accountType: "CREATOR",
        profilePictureUrl: "https://example.com/pfp.jpg",
        followersCount: 5432,
        mediaCount: 120,
        encryptedAccessToken: {
            iv: "test_iv_hex_12345",
            content: "test_ciphertext_secret_abc",
            tag: "test_auth_tag_67890"
        },
        tokenExpiresAt: new Date(Date.now() + 3600000),
        lastSyncedAt: new Date()
    });

    const connectedResult = await getConnectedInstagramAccount(connectedCreatorId);
    assert.strictEqual(connectedResult.isConnected, true);
    assert.ok(connectedResult.account, "Account details object must exist");
    assert.strictEqual(connectedResult.account.instagramUserId, testInstagramUserId);
    assert.strictEqual(connectedResult.account.username, "service_test_creator");
    assert.strictEqual(connectedResult.account.accountType, "CREATOR");
    assert.strictEqual(connectedResult.account.profilePictureUrl, "https://example.com/pfp.jpg");
    assert.strictEqual(connectedResult.account.followersCount, 5432);
    assert.strictEqual(connectedResult.account.mediaCount, 120);
    assert.ok(connectedResult.account.lastSyncedAt);

    // Assert that encryptedAccessToken is completely omitted
    assert.strictEqual(connectedResult.account.encryptedAccessToken, undefined);
    assert.strictEqual(connectedResult.account.iv, undefined);
    assert.strictEqual(connectedResult.account.content, undefined);
    assert.strictEqual(connectedResult.account.tag, undefined);
    console.log("✓ Service returns safe account details without exposing encrypted tokens.");

    // -------------------------------------------------------------
    // 2. HTTP Integration Tests
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing HTTP Integration for GET /api/creator/instagram/account ---");

    // Create Auth docs for HTTP tests
    const creatorAuthWithAccount = await Auth.create({
        name: "Creator With IG",
        email: `creator_with_ig_${Date.now()}@test.com`,
        password: "HashedPassword123!",
        role: "creator",
        isVerified: true
    });
    allTestAuthIds.push(creatorAuthWithAccount._id);

    const creatorAuthWithoutAccount = await Auth.create({
        name: "Creator Without IG",
        email: `creator_no_ig_${Date.now()}@test.com`,
        password: "HashedPassword123!",
        role: "creator",
        isVerified: true
    });
    allTestAuthIds.push(creatorAuthWithoutAccount._id);

    const brandAuthDoc = await Auth.create({
        name: "Brand User",
        email: `brand_user_${Date.now()}@test.com`,
        password: "HashedPassword123!",
        role: "brand",
        isVerified: true
    });
    allTestAuthIds.push(brandAuthDoc._id);

    const creatorWithAccountToken = generateAccessToken({
        userId: creatorAuthWithAccount._id.toString(),
        role: "creator",
        tokenVersion: creatorAuthWithAccount.passwordVersion || 0
    });
    const creatorWithoutAccountToken = generateAccessToken({
        userId: creatorAuthWithoutAccount._id.toString(),
        role: "creator",
        tokenVersion: creatorAuthWithoutAccount.passwordVersion || 0
    });
    const brandToken = generateAccessToken({
        userId: brandAuthDoc._id.toString(),
        role: "brand",
        tokenVersion: brandAuthDoc.passwordVersion || 0
    });

    // Create linked InstagramAccount for creatorAuthWithAccount
    const httpIgUserId = "ig_http_test_112233";
    allTestInstagramIds.push(httpIgUserId);

    await InstagramAccount.create({
        creator: creatorAuthWithAccount._id,
        instagramUserId: httpIgUserId,
        username: "http_test_creator",
        accountType: "BUSINESS",
        profilePictureUrl: "https://example.com/http_pfp.jpg",
        followersCount: 89000,
        mediaCount: 350,
        encryptedAccessToken: {
            iv: "http_iv_secret_1234",
            content: "http_super_secret_cipher_payload",
            tag: "http_auth_tag_val"
        },
        tokenExpiresAt: new Date(Date.now() + 7200000),
        lastSyncedAt: new Date()
    });

    // Start ephemeral server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // Test 2A: Unauthenticated request -> 401
    console.log("Testing: Unauthenticated request to GET /api/creator/instagram/account...");
    const unauthRes = await fetch(`${baseUrl}/api/creator/instagram/account`);
    const unauthBody = await unauthRes.json();
    assert.strictEqual(unauthRes.status, 401);
    assert.strictEqual(unauthBody.success, false);
    console.log("✓ 401 Unauthorized returned for unauthenticated request.");

    // Test 2B: Forbidden role (brand) -> 403
    console.log("Testing: Brand role request to GET /api/creator/instagram/account...");
    const brandRes = await fetch(`${baseUrl}/api/creator/instagram/account`, {
        headers: {
            Cookie: `accessToken=${brandToken}`
        }
    });
    const brandBody = await brandRes.json();
    assert.strictEqual(brandRes.status, 403);
    assert.strictEqual(brandBody.success, false);
    console.log("✓ 403 Forbidden returned for brand role.");

    // Test 2C: Authenticated creator with no connected Instagram account -> 200 with isConnected: false
    console.log("Testing: Authenticated creator without Instagram account...");
    const noAccountRes = await fetch(`${baseUrl}/api/creator/instagram/account`, {
        headers: {
            Cookie: `accessToken=${creatorWithoutAccountToken}`
        }
    });
    const noAccountBody = await noAccountRes.json();
    assert.strictEqual(noAccountRes.status, 200);
    assert.strictEqual(noAccountBody.success, true);
    assert.strictEqual(noAccountBody.message, "No Instagram account connected for this creator");
    assert.strictEqual(noAccountBody.data.isConnected, false);
    assert.strictEqual(noAccountBody.data.account, null);
    console.log("✓ 200 OK returned with isConnected: false and account: null for unconnected creator.");

    // Test 2D: Authenticated creator with connected Instagram account -> 200 with isConnected: true
    console.log("Testing: Authenticated creator with connected Instagram account...");
    const hasAccountRes = await fetch(`${baseUrl}/api/creator/instagram/account`, {
        headers: {
            Cookie: `accessToken=${creatorWithAccountToken}`
        }
    });
    const hasAccountBody = await hasAccountRes.json();
    assert.strictEqual(hasAccountRes.status, 200);
    assert.strictEqual(hasAccountBody.success, true);
    assert.strictEqual(hasAccountBody.message, "Connected Instagram account retrieved successfully");
    assert.strictEqual(hasAccountBody.data.isConnected, true);
    assert.ok(hasAccountBody.data.account, "Account data must be present");
    assert.strictEqual(hasAccountBody.data.account.instagramUserId, httpIgUserId);
    assert.strictEqual(hasAccountBody.data.account.username, "http_test_creator");
    assert.strictEqual(hasAccountBody.data.account.accountType, "BUSINESS");
    assert.strictEqual(hasAccountBody.data.account.profilePictureUrl, "https://example.com/http_pfp.jpg");
    assert.strictEqual(hasAccountBody.data.account.followersCount, 89000);
    assert.strictEqual(hasAccountBody.data.account.mediaCount, 350);
    assert.ok(hasAccountBody.data.account.lastSyncedAt);
    console.log("✓ 200 OK returned with isConnected: true and populated account metrics.");

    // Test 2E: Token secrecy assertion on HTTP response payload
    console.log("Testing: Strict secrecy check on HTTP response payload...");
    const rawPayload = JSON.stringify(hasAccountBody);
    assert.strictEqual(rawPayload.includes("encryptedAccessToken"), false);
    assert.strictEqual(rawPayload.includes("http_super_secret_cipher_payload"), false);
    assert.strictEqual(rawPayload.includes("http_iv_secret_1234"), false);
    assert.strictEqual(rawPayload.includes("http_auth_tag_val"), false);
    console.log("✓ Strict token secrecy verified: raw response contains no encrypted tokens, IVs, or secrets.");

} finally {
    if (server && server.listening) {
        await new Promise((resolve) => server.close(resolve));
    }
    try {
        if (mongoose.connection.readyState === 1) {
            if (allTestInstagramIds.length > 0 || allTestCreators.length > 0) {
                await InstagramAccount.deleteMany({
                    $or: [
                        { creator: { $in: [...allTestCreators, ...allTestAuthIds] } },
                        { instagramUserId: { $in: allTestInstagramIds } }
                    ]
                });
            }
            if (allTestAuthIds.length > 0) {
                await Auth.deleteMany({ _id: { $in: allTestAuthIds } });
            }
            console.log("✓ Test records cleaned up safely in finally block.");
        }
    } catch (cleanupErr) {
        console.error("Warning: Error during test cleanup:", cleanupErr.message);
    }
    await mongoose.disconnect();
}

console.log("\n===============================================================");
console.log("ALL GET CONNECTED INSTAGRAM ACCOUNT TESTS PASSED (100%)!");
console.log("===============================================================");
