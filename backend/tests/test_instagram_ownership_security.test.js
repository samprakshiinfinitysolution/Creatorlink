import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { connectTestDatabase } from "../src/config/database.js";
import {
    generateOAuthState,
    consumeOAuthState
} from "../src/modules/creator/instagram/instagramOAuthState.helper.js";
import InstagramOAuthState from "../src/modules/creator/instagram/instagramOAuthState.model.js";
import InstagramAccount from "../src/modules/creator/instagram/instagram.model.js";
import CreatorProfile from "../src/modules/creator/profile/profile.model.js";
import Auth from "../src/modules/auth/auth.model.js";
import {
    getConnectedInstagramAccount,
    refreshInstagramAccountMetrics,
    persistInstagramConnection,
    disconnectInstagramAccount
} from "../src/modules/creator/instagram/instagram.service.js";
import { getMyProfileService } from "../src/modules/creator/profile/profile.service.js";
import { invalidateHomepageCache } from "../src/modules/homepage/homepage.service.js";
import { encryptToken } from "../src/utils/helpers/encryption.helper.js";

console.log("===============================================================");
console.log("INSTAGRAM ACCOUNT OWNERSHIP & INTEGRATION SECURITY TEST SUITE");
console.log("===============================================================");

await connectTestDatabase();
console.log("✓ Connected safely to isolated test database");

// Ensure required collections exist prior to running any transactions
await Promise.all([
    Auth.createCollection().catch(() => {}),
    CreatorProfile.createCollection().catch(() => {}),
    InstagramAccount.createCollection().catch(() => {}),
    InstagramOAuthState.createCollection().catch(() => {})
]);

const creatorAId = new mongoose.Types.ObjectId();
const creatorBId = new mongoose.Types.ObjectId();
const testIgUserId = "17841499999999999";

try {
    // Clean up test records
    await InstagramOAuthState.deleteMany({ creator: { $in: [creatorAId, creatorBId] } });
    await InstagramAccount.deleteMany({ $or: [{ creator: { $in: [creatorAId, creatorBId] } }, { instagramUserId: testIgUserId }] });
    await CreatorProfile.deleteMany({ user: { $in: [creatorAId, creatorBId] } });
    await Auth.deleteMany({ _id: { $in: [creatorAId, creatorBId] } });

    // Seed test auth users
    await Auth.create([
        { _id: creatorAId, name: "Creator A", email: "creator.a@test.com", password: "Password123!", role: "creator" },
        { _id: creatorBId, name: "Creator B", email: "creator.b@test.com", password: "Password123!", role: "creator" }
    ]);

    // Seed test creator profiles
    await CreatorProfile.create([
        { user: creatorAId, title: "Creator A Title", bio: "Bio A", category: "Tech", keywords: ["tech"], isPublic: true },
        { user: creatorBId, title: "Creator B Title", bio: "Bio B", category: "Fashion", keywords: ["fashion"], isPublic: true }
    ]);

    // -------------------------------------------------------------------------
    // 1. OAuth State Ownership Binding & Cryptographic Integrity
    // -------------------------------------------------------------------------
    console.log("\n--- 1. Testing OAuth State Ownership Binding & CSRF Protection ---");
    const stateA = await generateOAuthState(creatorAId);
    assert.strictEqual(typeof stateA, "string");
    assert.ok(stateA.length > 30);

    // Tampered creator ID must be rejected by HMAC signature verification
    const decodedStateA = JSON.parse(Buffer.from(stateA, "base64url").toString("utf8"));
    const tamperedPayload = {
        ...decodedStateA,
        c: creatorBId.toString() // Malicious attacker attempting to swap creatorId
    };
    const tamperedState = Buffer.from(JSON.stringify(tamperedPayload), "utf8").toString("base64url");

    await assert.rejects(
        () => consumeOAuthState(tamperedState),
        /Invalid OAuth state signature\. Potential CSRF or tampering detected\./
    );
    console.log("✓ Tampered creatorId in OAuth state strictly rejected by HMAC signature.");

    // Consuming valid state extracts the exact initiating creator ID
    const consumed = await consumeOAuthState(stateA);
    assert.strictEqual(consumed.creatorId, creatorAId.toString());
    console.log("✓ Valid OAuth state securely yields authenticated creator ID.");

    // Replay attack: consuming the state again must fail
    await assert.rejects(
        () => consumeOAuthState(stateA),
        /already been consumed \(replay attack detected\)/
    );
    console.log("✓ Replay attack prevented: consumed state cannot be used a second time.");

    // -------------------------------------------------------------------------
    // 2. Cross-User Account Linking & Conflict Protection
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Testing Cross-User Account Linking Protection ---");

    // Connect Instagram account to Creator A
    const persistenceResultA = await persistInstagramConnection({
        creatorId: creatorAId,
        tokenData: { accessToken: "valid_meta_access_token_creator_a", expiresIn: 3600 },
        profileData: {
            instagramUserId: testIgUserId,
            username: "creator_a_insta",
            accountType: "CREATOR",
            followersCount: 500,
            mediaCount: 20
        },
        engagementMetrics: {
            isAvailable: true,
            engagementRate: 5.5,
            averageLikes: 25,
            averageComments: 2.5,
            engagementPostCount: 10
        }
    });

    assert.strictEqual(persistenceResultA.success, true);
    console.log("✓ Creator A successfully connected Instagram account.");

    // Creator B attempts to link the SAME Instagram account (testIgUserId)
    const persistenceResultB = await persistInstagramConnection({
        creatorId: creatorBId,
        tokenData: { accessToken: "valid_meta_access_token_creator_b", expiresIn: 3600 },
        profileData: {
            instagramUserId: testIgUserId,
            username: "creator_a_insta",
            accountType: "CREATOR",
            followersCount: 500,
            mediaCount: 20
        },
        engagementMetrics: {
            isAvailable: true,
            engagementRate: 5.5,
            averageLikes: 25,
            averageComments: 2.5,
            engagementPostCount: 10
        }
    });

    assert.strictEqual(persistenceResultB.success, false);
    assert.ok(persistenceResultB.redirectUrl.includes("already%20connected%20to%20another%20CreatorLink%20profile") || persistenceResultB.redirectUrl.includes("already connected"));
    console.log("✓ Cross-user conflict blocked: Creator B cannot hijack Creator A's Instagram account.");

    // -------------------------------------------------------------------------
    // 3. Ownership Verification on Reads, Refreshes & Disconnects
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing Ownership Verification on Reads, Refreshes & Disconnects ---");

    // Creator A reads account -> Returns connected
    const accountDetailsA = await getConnectedInstagramAccount(creatorAId);
    assert.strictEqual(accountDetailsA.isConnected, true);
    assert.strictEqual(accountDetailsA.account.username, "creator_a_insta");
    assert.strictEqual(accountDetailsA.account.followersCount, 500);
    assert.strictEqual(accountDetailsA.account.encryptedAccessToken, undefined); // Token never leaked
    console.log("✓ Creator A can read their own connected Instagram account without leaking tokens.");

    // Creator B reads account -> Returns isConnected: false, account: null
    const accountDetailsB = await getConnectedInstagramAccount(creatorBId);
    assert.strictEqual(accountDetailsB.isConnected, false);
    assert.strictEqual(accountDetailsB.account, null);
    console.log("✓ Creator B cannot read Creator A's Instagram account (returns null).");

    // Creator B attempts to refresh metrics -> Must reject with 400
    await assert.rejects(
        () => refreshInstagramAccountMetrics(creatorBId),
        /No active Instagram account connected to refresh\./
    );
    console.log("✓ Creator B cannot refresh Creator A's Instagram account.");

    // Creator B attempts to disconnect -> Cannot disconnect Creator A's account
    const disconnectResultB = await disconnectInstagramAccount(creatorBId);
    assert.strictEqual(disconnectResultB.success, true);
    assert.strictEqual(disconnectResultB.message, "No active Instagram connection found to disconnect.");

    const stillConnectedA = await getConnectedInstagramAccount(creatorAId);
    assert.strictEqual(stillConnectedA.isConnected, true);
    console.log("✓ Creator B cannot disconnect Creator A's Instagram account.");

    // -------------------------------------------------------------------------
    // 4. Profile Synchronization & Orphaned Snapshot Auto-Healing
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Testing Profile Synchronization & Orphaned Snapshot Auto-Healing ---");

    // Verify Creator A's profile received metrics
    const profileA = await CreatorProfile.findOne({ user: creatorAId }).lean();
    assert.strictEqual(profileA.followerCount, 500);
    assert.strictEqual(profileA.engagementRate, 5.5);
    assert.strictEqual(profileA.instagramSyncVersion, 1);
    console.log("✓ Creator A's CreatorProfile is synchronized with verified metrics.");

    // Simulate the exact user issue: Creator B's profile contains an orphaned Instagram snapshot
    // (followerCount: 25, engagementRate: 8, instagramSyncVersion: 4), but Creator B has NO InstagramAccount
    await CreatorProfile.updateOne(
        { user: creatorBId },
        {
            $set: {
                followerCount: 25,
                engagementRate: 8,
                instagramSyncVersion: 4,
                "socialLinks.instagram": "https://instagram.com/samprakshi_infinity_solution"
            }
        }
    );

    // Call getMyProfileService for Creator B
    const myProfileB = await getMyProfileService(creatorBId);
    assert.strictEqual(myProfileB.instagramConnection, null);
    assert.strictEqual(myProfileB.followerCount, null);
    assert.strictEqual(myProfileB.engagementRate, null);
    assert.strictEqual(myProfileB.instagramSyncVersion, null);
    console.log("✓ Orphaned snapshot auto-healed: Ghost metrics nullified when no InstagramAccount exists.");

    // -------------------------------------------------------------------------
    // 5. Explicit Disconnect Flow & Cleanup
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Testing Explicit Disconnect Flow & Cleanup ---");
    const disconnectResultA = await disconnectInstagramAccount(creatorAId);
    assert.strictEqual(disconnectResultA.success, true);
    assert.strictEqual(disconnectResultA.message, "Instagram account disconnected successfully");

    // InstagramAccount status is now DISCONNECTED
    const disconnectedAccountA = await InstagramAccount.findOne({ creator: creatorAId }).lean();
    assert.strictEqual(disconnectedAccountA.status, "DISCONNECTED");
    assert.strictEqual(disconnectedAccountA.disconnectionReason, "Disconnected by creator");

    // getConnectedInstagramAccount returns isConnected: false, account: null
    const checkAfterDisconnectA = await getConnectedInstagramAccount(creatorAId);
    assert.strictEqual(checkAfterDisconnectA.isConnected, false);
    assert.strictEqual(checkAfterDisconnectA.account, null);
    assert.strictEqual(checkAfterDisconnectA.status, "DISCONNECTED");

    // CreatorProfile verified metrics are reset to null
    const profileAfterDisconnectA = await CreatorProfile.findOne({ user: creatorAId }).lean();
    assert.strictEqual(profileAfterDisconnectA.followerCount, null);
    assert.strictEqual(profileAfterDisconnectA.engagementRate, null);
    assert.strictEqual(profileAfterDisconnectA.instagramSyncVersion, null);
    console.log("✓ Disconnect cleans up account status and CreatorProfile verified metrics.");

    // -------------------------------------------------------------------------
    // 6. Homepage Cache Invalidation
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Testing Homepage Invalidation Function ---");
    assert.strictEqual(typeof invalidateHomepageCache, "function");
    invalidateHomepageCache();
    console.log("✓ invalidateHomepageCache runs safely without exceptions.");

    console.log("\n===============================================================");
    console.log("ALL OWNERSHIP & INTEGRATION REGRESSION TESTS PASSED (100%)!");
    console.log("===============================================================");
} finally {
    // Clean up test records
    await InstagramOAuthState.deleteMany({ creator: { $in: [creatorAId, creatorBId] } });
    await InstagramAccount.deleteMany({ $or: [{ creator: { $in: [creatorAId, creatorBId] } }, { instagramUserId: testIgUserId }] });
    await CreatorProfile.deleteMany({ user: { $in: [creatorAId, creatorBId] } });
    await Auth.deleteMany({ _id: { $in: [creatorAId, creatorBId] } });
    await mongoose.disconnect();
}
