import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { connectTestDatabase } from "../src/config/database.js";
import {
    persistInstagramConnection,
    processInstagramOAuthCallback
} from "../src/modules/creator/instagram/instagram.service.js";
import { generateOAuthState } from "../src/modules/creator/instagram/instagramOAuthState.helper.js";
import InstagramOAuthState from "../src/modules/creator/instagram/instagramOAuthState.model.js";
import InstagramAccount from "../src/modules/creator/instagram/instagram.model.js";
import CreatorProfile from "../src/modules/creator/profile/profile.model.js";
import { decryptToken } from "../src/utils/helpers/encryption.helper.js";

console.log("===============================================================");
console.log("INSTAGRAM ENCRYPTION & MONGODB PERSISTENCE (STEP 5E) TEST SUITE");
console.log("===============================================================");

const originalFetch = global.fetch;
const originalEnv = { ...process.env };
const frontendBase = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");

const testCreator1 = new mongoose.Types.ObjectId();
const testCreator2 = new mongoose.Types.ObjectId();
const testCreator3 = new mongoose.Types.ObjectId();
const testCreator4 = new mongoose.Types.ObjectId();
const allTestCreators = [testCreator1, testCreator2, testCreator3, testCreator4];
const allTestInstagramIds = [
    "178414000100",
    "ig_pos_300",
    "ig_null_301",
    "ig_zero_302",
    "ig_miss_303",
    "ig_resilient_400",
    "178414000500"
];

try {
    await connectTestDatabase();
    console.log("✓ Connected to isolated MongoDB test database");

    // Pre-clean any test records for these IDs
    await InstagramAccount.deleteMany({
        $or: [
            { creator: { $in: allTestCreators } },
            { instagramUserId: { $in: allTestInstagramIds } }
        ]
    });
    await CreatorProfile.deleteMany({ user: { $in: allTestCreators } });
    await InstagramOAuthState.deleteMany({ creator: { $in: allTestCreators } });

    // Ensure CreatorProfile exists for testCreator1 to test sync
    await CreatorProfile.create({
        user: testCreator1,
        title: "Test Creator 1",
        bio: "Testing bio",
        followerCount: null,
        socialLinks: { instagram: "" }
    });

    // -------------------------------------------------------------------------
    // 1. Input Validation Tests
    // -------------------------------------------------------------------------
    console.log("\n--- 1. Testing Input Validation in persistInstagramConnection ---");

    // Missing creatorId
    const resNoCreator = await persistInstagramConnection({
        creatorId: null,
        tokenData: { accessToken: "token123", expiresIn: 3600 },
        profileData: { instagramUserId: "ig_1", username: "user_1", followersCount: 10, mediaCount: 5 }
    });
    assert.strictEqual(resNoCreator.success, false);
    assert.ok(resNoCreator.redirectUrl.includes("instagram=error"));
    assert.ok(decodeURIComponent(resNoCreator.redirectUrl).includes("Creator ID is required"));

    // Missing accessToken
    const resNoToken = await persistInstagramConnection({
        creatorId: testCreator1,
        tokenData: { accessToken: "", expiresIn: 3600 },
        profileData: { instagramUserId: "ig_1", username: "user_1", followersCount: 10, mediaCount: 5 }
    });
    assert.strictEqual(resNoToken.success, false);
    assert.ok(resNoToken.redirectUrl.includes("instagram=error"));

    // Malformed profileData: negative followers count
    const resNegativeFollowers = await persistInstagramConnection({
        creatorId: testCreator1,
        tokenData: { accessToken: "valid_token", expiresIn: 3600 },
        profileData: { instagramUserId: "ig_1", username: "user_1", followersCount: -5, mediaCount: 5 }
    });
    assert.strictEqual(resNegativeFollowers.success, false);
    assert.ok(resNegativeFollowers.redirectUrl.includes("instagram=error"));

    // Malformed profileData: non-numeric mediaCount
    const resNonNumericMedia = await persistInstagramConnection({
        creatorId: testCreator1,
        tokenData: { accessToken: "valid_token", expiresIn: 3600 },
        profileData: { instagramUserId: "ig_1", username: "user_1", followersCount: 10, mediaCount: NaN }
    });
    assert.strictEqual(resNonNumericMedia.success, false);
    assert.ok(resNonNumericMedia.redirectUrl.includes("instagram=error"));
    console.log("✓ Invalid inputs rejected safely with clean error redirects.");

    // -------------------------------------------------------------------------
    // 2. Initial Connection & AES-256-GCM Encryption
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Testing Initial Connection & Encrypted Token Persistence ---");
    const plainToken1 = "EAAG_confidential_initial_system_user_token_abc123";
    const initialRes = await persistInstagramConnection({
        creatorId: testCreator1,
        tokenData: {
            accessToken: plainToken1,
            tokenType: "bearer",
            expiresIn: 5184000 // 60 days
        },
        profileData: {
            instagramUserId: "178414000100",
            username: "tech_guru",
            accountType: "CREATOR",
            profilePictureUrl: "https://example.com/pic1.jpg",
            followersCount: 45000,
            mediaCount: 110
        }
    });

    assert.strictEqual(initialRes.success, true, "Initial save must succeed");
    assert.strictEqual(
        initialRes.redirectUrl,
        `${frontendBase}/creator/settings?instagram=success&username=tech_guru`
    );

    // Verify document in MongoDB
    const savedAccount = await InstagramAccount.findOne({ creator: testCreator1 });
    assert.ok(savedAccount, "InstagramAccount document must exist in database");
    assert.strictEqual(savedAccount.creator.toString(), testCreator1.toString());
    assert.strictEqual(savedAccount.instagramUserId, "178414000100");
    assert.strictEqual(savedAccount.username, "tech_guru");
    assert.strictEqual(savedAccount.accountType, "CREATOR");
    assert.strictEqual(savedAccount.profilePictureUrl, "https://example.com/pic1.jpg");
    assert.strictEqual(savedAccount.followersCount, 45000);
    assert.strictEqual(savedAccount.mediaCount, 110);
    assert.ok(savedAccount.lastSyncedAt instanceof Date, "lastSyncedAt must be a Date");

    // Encryption Verification
    const enc = savedAccount.encryptedAccessToken;
    assert.ok(enc, "encryptedAccessToken subdocument must exist");
    assert.strictEqual(typeof enc.iv, "string");
    assert.strictEqual(enc.iv.length, 24, "IV must be 24-character hex (12 bytes)");
    assert.strictEqual(typeof enc.tag, "string");
    assert.strictEqual(enc.tag.length, 32, "Auth tag must be 32-character hex (16 bytes)");
    assert.strictEqual(typeof enc.content, "string");
    assert.ok(enc.content.length > 0, "Ciphertext must be non-empty hex string");

    // Strictly verify plaintext token is NEVER stored bare
    const rawAccountObj = savedAccount.toObject();
    const rawJsonStr = JSON.stringify(rawAccountObj);
    assert.ok(!rawJsonStr.includes(plainToken1), "Plaintext token must NEVER exist in saved MongoDB document!");

    // Verify decryption produces the exact original token
    const decrypted = decryptToken(savedAccount.encryptedAccessToken);
    assert.strictEqual(decrypted, plainToken1, "Decrypted token must exactly match plain token");

    // Verify tokenExpiresAt
    assert.ok(savedAccount.tokenExpiresAt instanceof Date, "tokenExpiresAt must be a Date");
    assert.ok(savedAccount.tokenExpiresAt.getTime() > Date.now(), "tokenExpiresAt must be in the future");

    // Verify CreatorProfile sync
    const syncedProfile = await CreatorProfile.findOne({ user: testCreator1 });
    assert.ok(syncedProfile, "CreatorProfile must be found");
    assert.strictEqual(syncedProfile.followerCount, 45000, "CreatorProfile.followerCount must sync");
    assert.strictEqual(
        syncedProfile.socialLinks.instagram,
        "https://instagram.com/tech_guru",
        "CreatorProfile.socialLinks.instagram must sync"
    );
    console.log("✓ Initial connection persisted with AES-256-GCM encryption and CreatorProfile synced.");

    // -------------------------------------------------------------------------
    // 3. Reconnection Without Duplicate Records
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing Reconnection Without Duplicate Records ---");
    const plainTokenRefreshed = "EAAG_refreshed_token_xyz987";
    const reconnectRes = await persistInstagramConnection({
        creatorId: testCreator1,
        tokenData: {
            accessToken: plainTokenRefreshed,
            tokenType: "bearer",
            expiresIn: 2592000 // 30 days
        },
        profileData: {
            instagramUserId: "178414000100", // same IG user
            username: "tech_guru",
            accountType: "BUSINESS",
            profilePictureUrl: "https://example.com/pic1_new.jpg",
            followersCount: 48500, // updated metric
            mediaCount: 115       // updated metric
        }
    });

    assert.strictEqual(reconnectRes.success, true);
    assert.strictEqual(
        reconnectRes.redirectUrl,
        `${frontendBase}/creator/settings?instagram=success&username=tech_guru`
    );

    // Verify single document constraint (NO DUPLICATES)
    const count = await InstagramAccount.countDocuments({ creator: testCreator1 });
    assert.strictEqual(count, 1, "Must NEVER create duplicate InstagramAccount documents on reconnect!");

    // Verify updated fields
    const updatedAccount = await InstagramAccount.findOne({ creator: testCreator1 });
    assert.strictEqual(updatedAccount.accountType, "BUSINESS", "accountType must be updated and saved as BUSINESS in MongoDB");
    assert.strictEqual(updatedAccount.followersCount, 48500);
    assert.strictEqual(updatedAccount.mediaCount, 115);
    assert.strictEqual(updatedAccount.profilePictureUrl, "https://example.com/pic1_new.jpg");

    // Verify refreshed token decryption
    const decryptedRefreshed = decryptToken(updatedAccount.encryptedAccessToken);
    assert.strictEqual(decryptedRefreshed, plainTokenRefreshed, "Decrypted token must match refreshed token");

    // Verify CreatorProfile updated
    const updatedProfile = await CreatorProfile.findOne({ user: testCreator1 });
    assert.strictEqual(updatedProfile.followerCount, 48500);
    console.log("✓ Reconnection updated existing record without duplicate documents.");

    // -------------------------------------------------------------------------
    // 4. Cross-Creator Account Conflict Prevention
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Testing Cross-Creator Account Conflict Prevention ---");
    // testCreator2 tries to claim the same Instagram ID owned by testCreator1
    const conflictRes = await persistInstagramConnection({
        creatorId: testCreator2,
        tokenData: {
            accessToken: "EAAG_attacker_or_other_creator_token",
            expiresIn: 3600
        },
        profileData: {
            instagramUserId: "178414000100", // Already owned by testCreator1!
            username: "imposter_or_second_creator",
            followersCount: 100,
            mediaCount: 5
        }
    });

    assert.strictEqual(conflictRes.success, false, "Cross-creator connection must be rejected");
    assert.ok(conflictRes.redirectUrl.includes("instagram=error"), "Must redirect with error status");
    assert.ok(
        decodeURIComponent(conflictRes.redirectUrl).includes("already connected to another CreatorLink profile"),
        "Must specify safe cross-creator conflict message"
    );

    // Verify testCreator1's account was NOT modified or overwritten
    const preservedAccount = await InstagramAccount.findOne({ creator: testCreator1 });
    assert.strictEqual(preservedAccount.username, "tech_guru", "Original owner's record must be preserved");

    // Verify testCreator2 has no InstagramAccount
    const creator2Account = await InstagramAccount.findOne({ creator: testCreator2 });
    assert.strictEqual(creator2Account, null, "Conflicting creator must NOT have an InstagramAccount record");
    console.log("✓ Cross-creator account conflict safely blocked; original account preserved.");

    // -------------------------------------------------------------------------
    // 5. Token Expiry Variations (Positive, Null, Zero, Missing)
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Testing Token Expiry Variations ---");

    // A. Positive expiresIn -> future Date
    const resPositive = await persistInstagramConnection({
        creatorId: testCreator3,
        tokenData: { accessToken: "token_pos", expiresIn: 7200 },
        profileData: { instagramUserId: "ig_pos_300", username: "user_pos", followersCount: 10, mediaCount: 2 }
    });
    assert.strictEqual(resPositive.success, true);
    const docPos = await InstagramAccount.findOne({ creator: testCreator3 });
    assert.ok(docPos.tokenExpiresAt instanceof Date);
    assert.ok(docPos.tokenExpiresAt.getTime() > Date.now());

    // B. Null expiresIn -> null
    await InstagramAccount.deleteMany({ creator: testCreator3 });
    const resNull = await persistInstagramConnection({
        creatorId: testCreator3,
        tokenData: { accessToken: "token_null", expiresIn: null },
        profileData: { instagramUserId: "ig_null_301", username: "user_null", followersCount: 10, mediaCount: 2 }
    });
    assert.strictEqual(resNull.success, true);
    const docNull = await InstagramAccount.findOne({ creator: testCreator3 });
    assert.strictEqual(docNull.tokenExpiresAt, null, "Null expiresIn must result in null tokenExpiresAt");

    // C. Zero expiresIn -> null
    await InstagramAccount.deleteMany({ creator: testCreator3 });
    const resZero = await persistInstagramConnection({
        creatorId: testCreator3,
        tokenData: { accessToken: "token_zero", expiresIn: 0 },
        profileData: { instagramUserId: "ig_zero_302", username: "user_zero", followersCount: 10, mediaCount: 2 }
    });
    assert.strictEqual(resZero.success, true);
    const docZero = await InstagramAccount.findOne({ creator: testCreator3 });
    assert.strictEqual(docZero.tokenExpiresAt, null, "Zero expiresIn must result in null tokenExpiresAt");

    // D. Missing expiresIn -> null
    await InstagramAccount.deleteMany({ creator: testCreator3 });
    const resMissing = await persistInstagramConnection({
        creatorId: testCreator3,
        tokenData: { accessToken: "token_missing" },
        profileData: { instagramUserId: "ig_miss_303", username: "user_miss", followersCount: 10, mediaCount: 2 }
    });
    assert.strictEqual(resMissing.success, true);
    const docMiss = await InstagramAccount.findOne({ creator: testCreator3 });
    assert.strictEqual(docMiss.tokenExpiresAt, null, "Missing expiresIn must result in null tokenExpiresAt");
    console.log("✓ Token expiry tested: positive (Date), null (null), zero (null), and missing (null).");

    // -------------------------------------------------------------------------
    // 6. CreatorProfile Sync Failure Resilience
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Testing CreatorProfile Sync Failure Resilience ---");
    // Temporarily mock CreatorProfile.findOneAndUpdate to reject
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    CreatorProfile.findOneAndUpdate = async () => {
        throw new Error("Simulated database failure during CreatorProfile sync");
    };

    try {
        const resilientRes = await persistInstagramConnection({
            creatorId: testCreator4,
            tokenData: { accessToken: "token_resilient", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_resilient_400",
                username: "resilient_creator",
                followersCount: 15000,
                mediaCount: 40
            }
        });

        // Connection must still succeed!
        assert.strictEqual(resilientRes.success, true, "Instagram connection must succeed even if CreatorProfile sync fails");
        assert.strictEqual(
            resilientRes.redirectUrl,
            `${frontendBase}/creator/settings?instagram=success&username=resilient_creator`
        );

        // InstagramAccount must still be saved
        const resilientAccount = await InstagramAccount.findOne({ creator: testCreator4 });
        assert.ok(resilientAccount, "InstagramAccount must be saved successfully despite profile sync failure");
        assert.strictEqual(resilientAccount.username, "resilient_creator");
        console.log("✓ CreatorProfile sync failure did NOT invalidate InstagramAccount persistence.");
    } finally {
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
    }

    // -------------------------------------------------------------------------
    // 7. Full processInstagramOAuthCallback Integration (End-to-End Persistence)
    // -------------------------------------------------------------------------
    console.log("\n--- 7. Testing processInstagramOAuthCallback End-to-End with Step 5E ---");
    const testSecretOAuthToken = "EAAG_final_step5e_e2e_token_secret_999";
    global.fetch = async (url) => {
        const urlStr = typeof url === "string" ? url : url.toString();
        if (urlStr.includes("/oauth/access_token")) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    access_token: testSecretOAuthToken,
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
                        { id: "178414000500", username: "e2e_creator" }
                    ]
                })
            };
        }
        if (urlStr.includes("178414000500")) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "178414000500",
                    username: "e2e_creator",
                    name: "E2E Creator",
                    profile_picture_url: "https://example.com/e2e.jpg",
                    followers_count: 75000,
                    media_count: 220
                })
            };
        }
        throw new Error(`Unexpected fetch URL in test: ${urlStr}`);
    };

    const validState = await generateOAuthState(testCreator4);
    const callbackResult = await processInstagramOAuthCallback({
        code: "e2e_auth_code_xyz",
        state: validState
    });

    assert.strictEqual(callbackResult.success, true);
    assert.strictEqual(callbackResult.creatorId, testCreator4.toString());
    assert.strictEqual(callbackResult.accessToken, undefined, "accessToken must NOT be returned in callback result");
    assert.strictEqual(
        callbackResult.redirectUrl,
        `${frontendBase}/creator/settings?instagram=success&username=e2e_creator`
    );

    // Verify in database that testCreator4 now has e2e_creator InstagramAccount
    const e2eAccount = await InstagramAccount.findOne({ creator: testCreator4 });
    assert.ok(e2eAccount);
    assert.strictEqual(e2eAccount.username, "e2e_creator");
    assert.strictEqual(e2eAccount.followersCount, 75000);
    assert.strictEqual(decryptToken(e2eAccount.encryptedAccessToken), testSecretOAuthToken);
    console.log("✓ Full OAuth callback saved encrypted account and returned strictly ?instagram=success.");

    // -------------------------------------------------------------------------
    // 8. Secrets Hygiene & URL Audit
    // -------------------------------------------------------------------------
    console.log("\n--- 8. Testing Secrets Hygiene & Redirect URL Audit ---");
    const testAuditUrls = [
        initialRes.redirectUrl,
        reconnectRes.redirectUrl,
        conflictRes.redirectUrl,
        callbackResult.redirectUrl
    ];

    for (const url of testAuditUrls) {
        assert.ok(!url.includes(plainToken1), "Token must NEVER appear in redirect URL");
        assert.ok(!url.includes(plainTokenRefreshed), "Token must NEVER appear in redirect URL");
        assert.ok(!url.includes(testSecretOAuthToken), "Token must NEVER appear in redirect URL");
        assert.ok(!url.includes(process.env.META_APP_SECRET || ""), "App secret must NEVER appear in redirect URL");
        assert.ok(!url.includes(process.env.TOKEN_ENCRYPTION_KEY || ""), "Encryption key must NEVER appear in redirect URL");
        assert.ok(!url.includes("e2e_auth_code_xyz"), "Auth code must NEVER appear in redirect URL");
        assert.ok(!url.includes("tag="), "Auth tag must not leak in redirect URL");
        assert.ok(!url.includes("iv="), "IV must not leak in redirect URL");
    }
    console.log("✓ Secrets hygiene audit passed: zero token/key/secret leakages across all redirect URLs.");

} finally {
    global.fetch = originalFetch;
    try {
        if (mongoose.connection.readyState === 1) {
            await InstagramAccount.deleteMany({
                $or: [
                    { creator: { $in: allTestCreators } },
                    { instagramUserId: { $in: allTestInstagramIds } }
                ]
            });
            await CreatorProfile.deleteMany({ user: { $in: allTestCreators } });
            await InstagramOAuthState.deleteMany({ creator: { $in: allTestCreators } });
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
    console.log("✓ Test environment restored and database disconnected.");
}

console.log("\n===============================================================");
console.log("ALL STEP 5E ENCRYPTION & PERSISTENCE TESTS PASSED (100%)!");
console.log("===============================================================");
