import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { connectTestDatabase } from "../src/config/database.js";
import {
    exchangeMetaAuthorizationCode,
    processInstagramOAuthCallback
} from "../src/modules/creator/instagram/instagram.service.js";
import { generateOAuthState } from "../src/modules/creator/instagram/instagramOAuthState.helper.js";
import InstagramOAuthState from "../src/modules/creator/instagram/instagramOAuthState.model.js";

console.log("===============================================================");
console.log("META AUTHORIZATION CODE EXCHANGE (STEP 5B) TEST SUITE");
console.log("===============================================================");

const originalFetch = global.fetch;
const originalEnv = { ...process.env };
let testCreatorId = null;

try {
    // -------------------------------------------------------------------------
    // 1. Missing / Invalid Code Validation
    // -------------------------------------------------------------------------
    console.log("\n--- 1. Testing Code Validation ---");
    await assert.rejects(
        () => exchangeMetaAuthorizationCode(""),
        /Authorization code is required/
    );
    await assert.rejects(
        () => exchangeMetaAuthorizationCode("   "),
        /Authorization code is required/
    );
    await assert.rejects(
        () => exchangeMetaAuthorizationCode(null),
        /Authorization code is required/
    );
    await assert.rejects(
        () => exchangeMetaAuthorizationCode(12345),
        /Authorization code is required/
    );
    console.log("✓ Empty, whitespace, non-string and null authorization codes rejected.");

    // -------------------------------------------------------------------------
    // 2. Missing Environment Variables
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Testing Missing Environment Variables ---");
    delete process.env.META_APP_SECRET;
    await assert.rejects(
        () => exchangeMetaAuthorizationCode("test_code"),
        /missing required environment variables/
    );

    process.env.META_APP_SECRET = originalEnv.META_APP_SECRET || "mock_secret";
    delete process.env.META_APP_ID;
    await assert.rejects(
        () => exchangeMetaAuthorizationCode("test_code"),
        /missing required environment variables/
    );

    process.env.META_APP_ID = originalEnv.META_APP_ID || "1004649452078527";
    delete process.env.META_REDIRECT_URI;
    await assert.rejects(
        () => exchangeMetaAuthorizationCode("test_code"),
        /missing required environment variables/
    );

    // Restore env vars
    process.env.META_APP_ID = originalEnv.META_APP_ID || "1004649452078527";
    process.env.META_APP_SECRET = originalEnv.META_APP_SECRET || "mock_secret";
    process.env.META_REDIRECT_URI = originalEnv.META_REDIRECT_URI || "https://creatorlink-hu9o.onrender.com/api/creator/instagram/callback";
    console.log("✓ Missing META_APP_ID, META_APP_SECRET, and META_REDIRECT_URI properly rejected.");

    // -------------------------------------------------------------------------
    // 3. Successful Token Exchange (Mocked Meta Response)
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing Successful Token Exchange ---");
    let capturedUrl = null;
    let capturedOptions = null;

    global.fetch = async (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return {
            ok: true,
            status: 200,
            json: async () => ({
                access_token: "MOCK_META_ACCESS_TOKEN_ABC123XYZ",
                token_type: "bearer",
                expires_in: 5184000
            })
        };
    };

    const tokenResult = await exchangeMetaAuthorizationCode("mock_auth_code_valid_123");
    assert.strictEqual(tokenResult.accessToken, "MOCK_META_ACCESS_TOKEN_ABC123XYZ");
    assert.strictEqual(tokenResult.tokenType, "bearer");
    assert.strictEqual(tokenResult.expiresIn, 5184000);

    // Verify exact URLSearchParams passed to Meta
    assert.ok(capturedUrl.startsWith("https://graph.facebook.com/v27.0/oauth/access_token"));
    const parsedUrl = new URL(capturedUrl);
    assert.strictEqual(parsedUrl.searchParams.get("client_id"), process.env.META_APP_ID.trim());
    assert.strictEqual(parsedUrl.searchParams.get("client_secret"), process.env.META_APP_SECRET.trim());
    assert.strictEqual(parsedUrl.searchParams.get("redirect_uri"), process.env.META_REDIRECT_URI.trim());
    assert.strictEqual(parsedUrl.searchParams.get("code"), "mock_auth_code_valid_123");
    console.log("✓ Successful exchange returns internal accessToken, tokenType and expiresIn.");
    console.log("✓ Endpoint and all 4 URLSearchParams (client_id, client_secret, redirect_uri, code) verified.");

    // -------------------------------------------------------------------------
    // 4. Safe expiresIn Handling (Omitted, null, 0, negative, string, valid)
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Testing Safe expiresIn Handling Variations ---");

    // A. Omitted expires_in (common for non-expiring System User tokens)
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            access_token: "MOCK_SYSTEM_USER_TOKEN",
            token_type: "bearer"
            // expires_in omitted
        })
    });
    const omittedRes = await exchangeMetaAuthorizationCode("mock_code");
    assert.strictEqual(omittedRes.expiresIn, null, "Omitted expires_in must safely resolve to null");

    // B. Explicit null expires_in
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            access_token: "MOCK_SYSTEM_USER_TOKEN",
            token_type: "bearer",
            expires_in: null
        })
    });
    const nullRes = await exchangeMetaAuthorizationCode("mock_code");
    assert.strictEqual(nullRes.expiresIn, null, "null expires_in must safely resolve to null");

    // C. Zero expires_in
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            access_token: "MOCK_SYSTEM_USER_TOKEN",
            expires_in: 0
        })
    });
    const zeroRes = await exchangeMetaAuthorizationCode("mock_code");
    assert.strictEqual(zeroRes.expiresIn, null, "0 expires_in must safely resolve to null");

    // D. Negative expires_in
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            access_token: "MOCK_SYSTEM_USER_TOKEN",
            expires_in: -100
        })
    });
    const negativeRes = await exchangeMetaAuthorizationCode("mock_code");
    assert.strictEqual(negativeRes.expiresIn, null, "Negative expires_in must safely resolve to null");

    // E. Invalid string expires_in
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            access_token: "MOCK_SYSTEM_USER_TOKEN",
            expires_in: "never_expires"
        })
    });
    const invalidStrRes = await exchangeMetaAuthorizationCode("mock_code");
    assert.strictEqual(invalidStrRes.expiresIn, null, "Non-numeric string expires_in must safely resolve to null");

    // F. Numeric string expires_in
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            access_token: "MOCK_SYSTEM_USER_TOKEN",
            expires_in: "5184000"
        })
    });
    const numStrRes = await exchangeMetaAuthorizationCode("mock_code");
    assert.strictEqual(numStrRes.expiresIn, 5184000, "Numeric string expires_in must parse safely to integer");

    console.log("✓ All expiresIn variations (omitted, null, 0, negative, string, valid) handled safely.");

    // -------------------------------------------------------------------------
    // 5. Invalid access_token Types Validation
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Testing Invalid access_token Types ---");

    const invalidTokens = [
        "", // empty string
        "    ", // whitespace
        12345, // number
        true, // boolean
        {}, // object
        ["token"], // array
        null, // null
        undefined // undefined
    ];

    for (const invalidToken of invalidTokens) {
        global.fetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                access_token: invalidToken,
                token_type: "bearer"
            })
        });

        await assert.rejects(
            () => exchangeMetaAuthorizationCode("any_code"),
            /failed to return a valid access token/,
            `Expected rejection for invalid access_token: ${JSON.stringify(invalidToken)}`
        );
    }
    console.log("✓ Invalid access_token types (empty, whitespace, number, boolean, object, array, null) strictly rejected.");

    // -------------------------------------------------------------------------
    // 6. Meta API Error Response (e.g. invalid code or expired code from Meta)
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Testing Meta API Error Response ---");
    global.fetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({
            error: {
                message: "This authorization code has been used.",
                type: "OAuthException",
                code: 100,
                error_subcode: 36009
            }
        })
    });

    await assert.rejects(
        () => exchangeMetaAuthorizationCode("expired_meta_code"),
        /Meta OAuth service rejected the authorization code/
    );
    console.log("✓ Meta API 400 error safely rejected with meaningful error.");

    // -------------------------------------------------------------------------
    // 7. Network Failure
    // -------------------------------------------------------------------------
    console.log("\n--- 7. Testing Network Failure ---");
    global.fetch = async () => {
        throw new Error("ENOTFOUND graph.facebook.com");
    };

    await assert.rejects(
        () => exchangeMetaAuthorizationCode("any_code"),
        /Network error occurred while contacting Meta OAuth service/
    );
    console.log("✓ Network failure caught safely and normalized.");

    // -------------------------------------------------------------------------
    // 8. Malformed / Non-JSON Response
    // -------------------------------------------------------------------------
    console.log("\n--- 8. Testing Malformed Non-JSON Response ---");
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => {
            throw new SyntaxError("Unexpected token < in JSON at position 0");
        }
    });

    await assert.rejects(
        () => exchangeMetaAuthorizationCode("any_code"),
        /Received malformed or non-JSON response/
    );
    console.log("✓ Malformed non-JSON response handled safely.");

    // -------------------------------------------------------------------------
    // 9. Integration with processInstagramOAuthCallback & Secrets Hygiene
    // -------------------------------------------------------------------------
    console.log("\n--- 9. Testing processInstagramOAuthCallback & Secrets Hygiene ---");
    await connectTestDatabase();
    console.log("✓ Connected to isolated MongoDB test database for callback integration verification");

    testCreatorId = new mongoose.Types.ObjectId();
    const testSecretToken = "HIGHLY_CONFIDENTIAL_META_ACCESS_TOKEN_XYZ_999";
    const testAuthCode = "SECRET_AUTHORIZATION_CODE_ABC_123";

    // Pre-clean test records
    await InstagramOAuthState.deleteMany({ creator: testCreatorId });
    await mongoose.connection.collection("instagramaccounts").deleteMany({
        $or: [{ creator: testCreatorId }, { instagramUserId: "1784140001" }]
    });

    // A. Successful exchange integration
    global.fetch = async (url) => {
        const urlStr = typeof url === "string" ? url : url.toString();
        if (urlStr.includes("/oauth/access_token")) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    access_token: testSecretToken,
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
                    data: [{ id: "1784140001", username: "creator_test" }]
                })
            };
        }
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
    };

    const validState = await generateOAuthState(testCreatorId);
    const callbackResult = await processInstagramOAuthCallback({
        code: testAuthCode,
        state: validState
    });

    assert.strictEqual(callbackResult.success, true);
    assert.strictEqual(callbackResult.creatorId, testCreatorId.toString());
    assert.strictEqual(callbackResult.accessToken, undefined, "Access token must NOT be returned in callback result");

    // CRITICAL: Ensure redirectUrl NEVER contains secrets, tokens, or codes
    assert.ok(
        !callbackResult.redirectUrl.includes(testSecretToken),
        "Access token MUST NOT be leaked in redirectUrl!"
    );
    assert.ok(
        !callbackResult.redirectUrl.includes(testAuthCode),
        "Authorization code MUST NOT be leaked in redirectUrl!"
    );
    assert.ok(
        !callbackResult.redirectUrl.includes(process.env.META_APP_SECRET),
        "App secret MUST NOT be leaked in redirectUrl!"
    );
    const expectedFrontend = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
    assert.strictEqual(
        callbackResult.redirectUrl,
        `${expectedFrontend}/creator/settings?instagram=success&username=creator_test`,
        "Clean redirect URL must strictly indicate success upon persistence"
    );
    console.log("✓ Token processed; redirectUrl strictly clean with verified ?instagram=success status.");
    console.log("✓ Verified ZERO leakage of access_token, auth_code, or app_secret in redirect URLs.");

    // B. Token exchange failure integration: Must redirect to error without success flag
    console.log("Testing: Token exchange failure integration...");
    global.fetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({
            error: { message: "Invalid code" }
        })
    });

    const failureState = await generateOAuthState(testCreatorId);
    const failureResult = await processInstagramOAuthCallback({
        code: "invalid_code",
        state: failureState
    });

    assert.strictEqual(failureResult.success, false, "Must return success: false on exchange failure");
    assert.strictEqual(failureResult.accessToken, undefined, "Must NOT return an accessToken on failure");
    assert.ok(failureResult.redirectUrl.includes("instagram=error"), "Must redirect with error status on failure");
    assert.ok(!failureResult.redirectUrl.includes("instagram=success"), "Must NOT include success status on failure");
    assert.ok(!failureResult.redirectUrl.includes("Invalid code"), "Must NOT leak raw Meta error in redirect");
    console.log("✓ Failure redirects safely to ?instagram=error and leaves NO misleading success status.");

} finally {
    global.fetch = originalFetch;
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
    for (const key of Object.keys(process.env)) {
        if (!(key in originalEnv)) {
            delete process.env[key];
        }
    }
    Object.assign(process.env, originalEnv);
}

console.log("\n===============================================================");
console.log("ALL STEP 5B TOKEN EXCHANGE TESTS PASSED (100%)!");
console.log("===============================================================");
