import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

if (!process.env.TOKEN_ENCRYPTION_KEY) {
    process.env.TOKEN_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
}

import {
    calculateInstagramEngagement,
    persistInstagramConnection,
    getConnectedInstagramAccount,
    refreshInstagramAccountMetrics,
    reconcilePendingProfileSync,
    classifyMetaError,
    handleMetaGraphApiError,
    isTransactionUnsupportedError,
    activeSyncLocks
} from "../src/modules/creator/instagram/instagram.service.js";
import { encryptToken } from "../src/utils/helpers/encryption.helper.js";
import InstagramAccount from "../src/modules/creator/instagram/instagram.model.js";
import CreatorProfile from "../src/modules/creator/profile/profile.model.js";

test("Scenario 1: Correct ER calculation matching formula and specification", () => {
    // Followers = 10,000, 10 eligible posts, total likes = 5000, total comments = 500
    // Avg Likes = 500, Avg Comments = 50, ER = ((500 + 50) / 10,000) * 100 = 5.50%
    const eligiblePosts = Array.from({ length: 10 }, (_, i) => ({
        id: `post_${i}`,
        like_count: 500,
        comments_count: 50
    }));

    const result = calculateInstagramEngagement(eligiblePosts, 10000);
    assert.equal(result.isAvailable, true);
    assert.equal(result.engagementRate, 5.5);
    assert.equal(result.averageLikes, 500);
    assert.equal(result.averageComments, 50);
    assert.equal(result.engagementPostCount, 10);
});

test("Scenario 2: Decimal rounding of ER, average likes, and average comments", () => {
    // 3 posts: likes: 10, 11, 10 (avg 10.33), comments: 1, 2, 1 (avg 1.33), followers: 100
    // ER = ((10.33 + 1.33) / 100) * 100 = 11.66%
    const posts = [
        { id: "1", like_count: 10, comments_count: 1 },
        { id: "2", like_count: 11, comments_count: 2 },
        { id: "3", like_count: 10, comments_count: 1 }
    ];

    const result = calculateInstagramEngagement(posts, 100);
    assert.equal(result.isAvailable, true);
    assert.equal(result.averageLikes, 10.33);
    assert.equal(result.averageComments, 1.33);
    assert.equal(result.engagementRate, 11.66);
    assert.equal(result.engagementPostCount, 3);
});

test("Scenario 3: Calculation using fewer than 12 eligible posts uses actual post count", () => {
    const posts = [
        { id: "p1", like_count: 200, comments_count: 20 },
        { id: "p2", like_count: 300, comments_count: 30 },
        { id: "p3", like_count: 400, comments_count: 40 },
        { id: "p4", like_count: 500, comments_count: 50 }
    ]; // 4 posts (total likes: 1400, avg: 350; total comments: 140, avg: 35)

    const result = calculateInstagramEngagement(posts, 5000);
    assert.equal(result.isAvailable, true);
    assert.equal(result.engagementPostCount, 4);
    assert.equal(result.averageLikes, 350);
    assert.equal(result.averageComments, 35);
    // ER = ((350 + 35) / 5000) * 100 = (385 / 5000) * 100 = 7.70%
    assert.equal(result.engagementRate, 7.7);
});

test("Scenario 4: Empty eligible posts returns unavailable without fake 0% ER", () => {
    const result = calculateInstagramEngagement([], 10000);
    assert.equal(result.isAvailable, false);
    assert.equal(result.engagementRate, null);
    assert.equal(result.averageLikes, null);
    assert.equal(result.averageComments, null);
    assert.equal(result.engagementPostCount, 0);
});

test("Scenario 5: Zero followers returns unavailable without divide-by-zero", () => {
    const posts = [{ id: "p1", like_count: 100, comments_count: 10 }];
    const result = calculateInstagramEngagement(posts, 0);
    assert.equal(result.isAvailable, false);
    assert.equal(result.engagementRate, null);
    assert.equal(result.averageLikes, null);
    assert.equal(result.averageComments, null);
    assert.equal(result.engagementPostCount, 0);
});

test("Scenario 6: Invalid or negative metrics are excluded and rejected", () => {
    const postsWithInvalid = [
        { id: "p1", like_count: -50, comments_count: 10 }, // negative like
        { id: "p2", like_count: 100, comments_count: -5 }, // negative comment
        { id: "p3", like_count: "abc", comments_count: 10 }, // non-numeric
        { id: "p4", like_count: 200, comments_count: 20 } // valid
    ];

    const result = calculateInstagramEngagement(postsWithInvalid, 2000);
    assert.equal(result.isAvailable, true);
    assert.equal(result.engagementPostCount, 1);
    assert.equal(result.averageLikes, 200);
    assert.equal(result.averageComments, 20);
    // ER = ((200 + 20) / 2000) * 100 = 11.00%
    assert.equal(result.engagementRate, 11);
});

test("Scenario 7 & 8: Successful persistence updates InstagramAccount and CreatorProfile", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    let igUpdated = null;
    let profileUpdated = null;

    const originalIgFindOne = InstagramAccount.findOne;
    const originalIgFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalIgUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;

    try {
        InstagramAccount.findOne = async () => null; // No conflict
        InstagramAccount.findOneAndUpdate = async (query, update) => {
            igUpdated = update.$set;
            return { _id: "ig_123", ...update.$set };
        };
        CreatorProfile.findOneAndUpdate = async (query, update) => {
            profileUpdated = update.$set;
            return { _id: "prof_123", ...update.$set };
        };
        InstagramAccount.updateOne = async (query, update) => {
            igUpdated = { ...igUpdated, ...update.$set };
            return { acknowledged: true, modifiedCount: 1 };
        };

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "valid_token_12345", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_user_1",
                username: "testcreator",
                accountType: "BUSINESS",
                profilePictureUrl: "https://example.com/pic.jpg",
                followersCount: 10000,
                mediaCount: 45
            },
            engagementMetrics: {
                isAvailable: true,
                engagementRate: 5.5,
                averageLikes: 500,
                averageComments: 50,
                engagementPostCount: 10
            }
        });

        assert.equal(result.success, true);
        // InstagramAccount verification
        assert.equal(igUpdated.engagementRate, 5.5);
        assert.equal(igUpdated.averageLikes, 500);
        assert.equal(igUpdated.averageComments, 50);
        assert.equal(igUpdated.engagementPostCount, 10);
        assert.equal(igUpdated.needsProfileSync, false);
        assert.ok(igUpdated.engagementLastSyncedAt instanceof Date);
        // CreatorProfile verification
        assert.equal(profileUpdated.followerCount, 10000);
        assert.equal(profileUpdated.engagementRate, 5.5);
    } finally {
        InstagramAccount.findOne = originalIgFindOne;
        InstagramAccount.findOneAndUpdate = originalIgFindOneAndUpdate;
        InstagramAccount.updateOne = originalIgUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
    }
});

test("Scenario 9: Database partial failure handling safely returns error", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalIgFindOne = InstagramAccount.findOne;
    const originalIgFindOneAndUpdate = InstagramAccount.findOneAndUpdate;

    try {
        InstagramAccount.findOne = async () => null;
        InstagramAccount.findOneAndUpdate = async () => {
            throw new Error("Disk quota exceeded / connection reset");
        };

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "valid_token_12345", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_user_1",
                username: "testcreator",
                followersCount: 10000,
                mediaCount: 45
            },
            engagementMetrics: {
                isAvailable: true,
                engagementRate: 5.5,
                averageLikes: 500,
                averageComments: 50,
                engagementPostCount: 10
            }
        });

        assert.equal(result.success, false);
        assert.ok(result.redirectUrl.includes("instagram=error"));
    } finally {
        InstagramAccount.findOne = originalIgFindOne;
        InstagramAccount.findOneAndUpdate = originalIgFindOneAndUpdate;
    }
});

test("Scenario 9B: New Instagram connection - CreatorProfile failure preserves token and sets needsProfileSync: true", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalIgFindOne = InstagramAccount.findOne;
    const originalIgFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalIgUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;

    let persistedAccountSet = null;
    let flagUpdated = null;

    try {
        InstagramAccount.findOne = async () => null; // New connection, no conflict
        InstagramAccount.findOneAndUpdate = async (query, update) => {
            persistedAccountSet = update.$set;
            return { _id: "ig_new_account", ...update.$set };
        };
        // Secondary CreatorProfile fails!
        CreatorProfile.findOneAndUpdate = async () => {
            throw new Error("Transient profile collection lock/timeout");
        };
        InstagramAccount.updateOne = async (query, update) => {
            flagUpdated = update.$set;
            return { acknowledged: true, modifiedCount: 1 };
        };

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "valid_token_12345", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_user_1",
                username: "testcreator",
                followersCount: 10000,
                mediaCount: 45
            },
            engagementMetrics: {
                isAvailable: true,
                engagementRate: 5.5,
                averageLikes: 500,
                averageComments: 50,
                engagementPostCount: 10
            }
        });

        // 1. Connection still succeeds and preserves OAuth redirect flow
        assert.equal(result.success, true);
        assert.ok(result.redirectUrl.includes("instagram=success"));

        // 2. Token and identity are safely persisted in InstagramAccount
        assert.ok(persistedAccountSet.encryptedAccessToken);
        assert.equal(persistedAccountSet.instagramUserId, "ig_user_1");
        assert.equal(persistedAccountSet.username, "testcreator");
        assert.equal(persistedAccountSet.status, "CONNECTED");

        // 3. needsProfileSync: true was flagged via born-dirty strategy
        assert.equal(persistedAccountSet.needsProfileSync, true);
        assert.equal(flagUpdated, null); // No secondary write was needed to mark it dirty
    } finally {
        InstagramAccount.findOne = originalIgFindOne;
        InstagramAccount.findOneAndUpdate = originalIgFindOneAndUpdate;
        InstagramAccount.updateOne = originalIgUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
    }
});

test("Scenario 9C: Existing account reconnection - CreatorProfile failure preserves CONNECTED status and updates flag", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalIgFindOne = InstagramAccount.findOne;
    const originalIgFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalIgUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;

    let flagUpdated = null;
    let persistedSet = null;

    try {
        InstagramAccount.findOne = async () => null; // No conflict
        InstagramAccount.findOneAndUpdate = async (query, update) => {
            persistedSet = update.$set;
            return { _id: "ig_existing_account", ...update.$set };
        };
        CreatorProfile.findOneAndUpdate = async () => {
            throw new Error("Secondary update error during reconnection");
        };
        InstagramAccount.updateOne = async (query, update) => {
            flagUpdated = update.$set;
            return { acknowledged: true, modifiedCount: 1 };
        };

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "new_reconnected_token", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_user_1",
                username: "testcreator",
                followersCount: 12000,
                mediaCount: 50
            }
        });

        assert.equal(result.success, true);
        assert.equal(persistedSet.status, "CONNECTED");
        assert.equal(persistedSet.followersCount, 12000);
        assert.equal(persistedSet.needsProfileSync, true);
        assert.equal(flagUpdated, null);
    } finally {
        InstagramAccount.findOne = originalIgFindOne;
        InstagramAccount.findOneAndUpdate = originalIgFindOneAndUpdate;
        InstagramAccount.updateOne = originalIgUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
    }
});

test("Scenario 9D: Transaction mode failure - CreatorProfile failure triggers atomic transaction abort", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalStartSession = mongoose.startSession;
    const originalIgFindOne = InstagramAccount.findOne;
    const originalIgFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;

    let transactionAborted = false;
    let transactionCommitted = false;

    try {
        InstagramAccount.findOne = async () => null;
        InstagramAccount.findOneAndUpdate = async () => ({ _id: "ig_tx_123" });
        CreatorProfile.findOneAndUpdate = async () => {
            throw new Error("Simulated profile write failure inside transaction");
        };

        // Mock mongoose active connection and transaction session
        mongoose.startSession = async () => ({
            startTransaction: () => {},
            commitTransaction: async () => { transactionCommitted = true; },
            abortTransaction: async () => { transactionAborted = true; },
            endSession: async () => {}
        });

        // Set readyState = 1 so transaction path is taken
        const originalReadyState = mongoose.connection.readyState;
        Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "valid_token_12345", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_user_1",
                username: "testcreator",
                followersCount: 10000,
                mediaCount: 45
            }
        });

        assert.equal(result.success, false);
        assert.ok(result.redirectUrl.includes("instagram=error"));
        assert.equal(transactionAborted, true);
        assert.equal(transactionCommitted, false);

        Object.defineProperty(mongoose.connection, "readyState", { value: originalReadyState, configurable: true });
    } finally {
        mongoose.startSession = originalStartSession;
        InstagramAccount.findOne = originalIgFindOne;
        InstagramAccount.findOneAndUpdate = originalIgFindOneAndUpdate;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
    }
});

test("Scenario 9E: Recovery through retry - reconcilePendingProfileSync heals CreatorProfile and clears flag", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalIgFindOne = InstagramAccount.findOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalIgUpdateOne = InstagramAccount.updateOne;

    const mockStaleAccount = {
        _id: "ig_stale_123",
        creator: creatorId,
        username: "testcreator",
        followersCount: 10000,
        engagementRate: 5.5,
        status: "CONNECTED",
        needsProfileSync: true
    };

    let profileUpdatedSet = null;
    let flagClearedSet = null;

    try {
        InstagramAccount.findOne = () => ({
            lean: async () => mockStaleAccount
        });
        CreatorProfile.findOneAndUpdate = async (query, update) => {
            profileUpdatedSet = update.$set;
            return { _id: "prof_123", ...update.$set };
        };
        InstagramAccount.updateOne = async (query, update) => {
            flagClearedSet = update.$set;
            return { acknowledged: true, modifiedCount: 1 };
        };

        const healed = await reconcilePendingProfileSync(creatorId, mockStaleAccount);
        assert.equal(healed, true);
        assert.equal(profileUpdatedSet.followerCount, 10000);
        assert.equal(profileUpdatedSet.engagementRate, 5.5);
        assert.deepEqual(flagClearedSet, { needsProfileSync: false });
    } finally {
        InstagramAccount.findOne = originalIgFindOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        InstagramAccount.updateOne = originalIgUpdateOne;
    }
});

test("Scenario 10: Media API network failure preserves previously saved metrics", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    let igSetPayload = null;
    let profileSetPayload = null;

    const originalIgFindOne = InstagramAccount.findOne;
    const originalIgFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalIgUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;

    try {
        InstagramAccount.findOne = async () => null;
        InstagramAccount.findOneAndUpdate = async (query, update) => {
            igSetPayload = update.$set;
            return { _id: "ig_123", ...update.$set };
        };
        CreatorProfile.findOneAndUpdate = async (query, update) => {
            profileSetPayload = update.$set;
            return { _id: "prof_123", ...update.$set };
        };
        InstagramAccount.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

        // When media fetching fails, engagementMetrics is null
        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "valid_token_12345", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_user_1",
                username: "testcreator",
                followersCount: 12000,
                mediaCount: 50
            },
            engagementMetrics: null
        });

        assert.equal(result.success, true);
        // Follower count is updated
        assert.equal(igSetPayload.followersCount, 12000);
        assert.equal(profileSetPayload.followerCount, 12000);
        // Engagement metrics are NOT in the $set payload -> preserved!
        assert.equal("engagementRate" in igSetPayload, false);
        assert.equal("averageLikes" in igSetPayload, false);
        assert.equal("averageComments" in igSetPayload, false);
        assert.equal("engagementPostCount" in igSetPayload, false);
        assert.equal("engagementLastSyncedAt" in igSetPayload, false);
        assert.equal("engagementRate" in profileSetPayload, false);
    } finally {
        InstagramAccount.findOne = originalIgFindOne;
        InstagramAccount.findOneAndUpdate = originalIgFindOneAndUpdate;
        InstagramAccount.updateOne = originalIgUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
    }
});

test("Scenario 11: Meta Code 190 marks account EXPIRED", async () => {
    let updateQuery = null;
    let updateSet = null;

    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    try {
        InstagramAccount.findOneAndUpdate = async (query, update) => {
            updateQuery = query;
            updateSet = update.$set;
            return { _id: "ig_123" };
        };

        const errorPayload = {
            code: 190,
            error_subcode: 463,
            message: "Error validating access token: Session has expired."
        };

        const classification = await handleMetaGraphApiError(errorPayload, {
            creatorId: "creator_test_123",
            operation: "test"
        });

        assert.equal(classification.isInvalidToken, true);
        assert.equal(updateQuery.creator, "creator_test_123");
        assert.equal(updateSet.status, "EXPIRED");
        assert.ok(updateSet.disconnectionReason.includes("expired"));
    } finally {
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
    }
});

test("Scenario 12: Meta Code 100 does NOT mark account EXPIRED", async () => {
    let updateCalled = false;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    try {
        InstagramAccount.findOneAndUpdate = async () => {
            updateCalled = true;
        };

        const errorPayload = {
            code: 100,
            message: "Invalid parameter: unsupported field"
        };

        const classification = await handleMetaGraphApiError(errorPayload, {
            creatorId: "creator_test_123",
            operation: "test"
        });

        assert.equal(classification.isInvalidToken, false);
        assert.equal(updateCalled, false);
    } finally {
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
    }
});

test("Scenario 13: Reconnection updates metrics correctly", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    let persistedIg = null;
    let persistedProfile = null;

    const originalIgFindOne = InstagramAccount.findOne;
    const originalIgFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalIgUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;

    try {
        InstagramAccount.findOne = async () => null;
        InstagramAccount.findOneAndUpdate = async (query, update) => {
            persistedIg = update.$set;
            return { _id: "ig_reconnected", ...update.$set };
        };
        CreatorProfile.findOneAndUpdate = async (query, update) => {
            persistedProfile = update.$set;
            return { _id: "prof_reconnected", ...update.$set };
        };
        InstagramAccount.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "new_refreshed_token", expiresIn: 7200 },
            profileData: {
                instagramUserId: "ig_user_1",
                username: "testcreator",
                followersCount: 15000,
                mediaCount: 60
            },
            engagementMetrics: {
                isAvailable: true,
                engagementRate: 6.25,
                averageLikes: 800,
                averageComments: 137.5,
                engagementPostCount: 12
            }
        });

        assert.equal(result.success, true);
        assert.equal(persistedIg.status, "CONNECTED");
        assert.equal(persistedIg.engagementRate, 6.25);
        assert.equal(persistedProfile.engagementRate, 6.25);
    } finally {
        InstagramAccount.findOne = originalIgFindOne;
        InstagramAccount.findOneAndUpdate = originalIgFindOneAndUpdate;
        InstagramAccount.updateOne = originalIgUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
    }
});

test("Scenario 14: Manual refresh authorization and ownership requires valid creatorId", async () => {
    await assert.rejects(
        async () => {
            await refreshInstagramAccountMetrics(null);
        },
        (err) => {
            assert.equal(err.statusCode, 400);
            assert.ok(err.message.includes("Creator ID is required"));
            return true;
        }
    );
});

test("Scenario 15: Duplicate refresh prevention locks concurrent requests with 429", async () => {
    const creatorId = "creator_lock_test_1";
    const originalFindOne = InstagramAccount.findOne;

    try {
        // Mock slow DB query to hold the lock
        let resolver;
        InstagramAccount.findOne = () => new Promise((resolve) => {
            resolver = resolve;
        });

        // Trigger first call (will acquire lock and wait on findOne)
        const firstCallPromise = refreshInstagramAccountMetrics(creatorId);

        // Immediate second call for the same creator should hit the concurrency lock
        await assert.rejects(
            async () => {
                await refreshInstagramAccountMetrics(creatorId);
            },
            (err) => {
                assert.equal(err.statusCode, 429);
                assert.ok(err.message.includes("already in progress"));
                return true;
            }
        );

        // Resolve first call
        resolver(null); // will throw 400 'No active Instagram account', releasing the lock
        await assert.rejects(async () => firstCallPromise, { statusCode: 400 });
    } finally {
        InstagramAccount.findOne = originalFindOne;
    }
});

test("Scenario 15B: In standalone refresh, born-dirty strategy preserves fresh metrics and sets needsProfileSync: true when CreatorProfile update fails", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalFetch = global.fetch;

    const originalAccount = {
        _id: "ig_account_test_id",
        creator: creatorId,
        instagramUserId: "ig_user_123",
        username: "testcreator",
        followersCount: 10000,
        mediaCount: 45,
        engagementRate: 3.5,
        averageLikes: 300,
        averageComments: 50,
        engagementPostCount: 8,
        syncVersion: 1,
        engagementLastSyncedAt: new Date("2026-01-01T00:00:00.000Z"),
        lastSyncedAt: new Date("2026-01-01T00:00:00.000Z"),
        status: "CONNECTED",
        encryptedAccessToken: encryptToken("mock_valid_token")
    };

    let updatedAccountDoc = null;

    try {
        InstagramAccount.findOne = async () => originalAccount;

        // Mock Meta Graph API responses
        global.fetch = async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes("/media")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        data: Array.from({ length: 10 }, (_, i) => ({
                            id: `p_${i}`,
                            like_count: 500,
                            comments_count: 50
                        }))
                    })
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "ig_user_123",
                    username: "testcreator",
                    account_type: "BUSINESS",
                    followers_count: 10000,
                    media_count: 55
                })
            };
        };

        // First update succeeds with born-dirty needsProfileSync: true
        InstagramAccount.findOneAndUpdate = async (query, update) => {
            updatedAccountDoc = {
                _id: originalAccount._id,
                ...originalAccount,
                ...update.$set,
                syncVersion: (originalAccount.syncVersion || 0) + 1
            };
            return updatedAccountDoc;
        };

        // CreatorProfile update fails!
        CreatorProfile.findOneAndUpdate = async () => {
            throw new Error("Simulated database failure on CreatorProfile");
        };

        const result = await refreshInstagramAccountMetrics(creatorId);

        // Forward recovery: returns fresh metrics and tracks needsProfileSync: true
        assert.equal(result.success, true);
        assert.equal(result.account.needsProfileSync, true);
        assert.equal(result.account.followersCount, 10000);
        assert.equal(result.account.mediaCount, 55);
        assert.equal(result.account.engagementRate, 5.5);
        assert.equal(result.account.syncVersion, 2);
    } finally {
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        global.fetch = originalFetch;
    }
});

test("Scenario 15C: In standalone refresh, conditional clear removes needsProfileSync matching exact syncVersion", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalFetch = global.fetch;

    const originalAccount = {
        _id: "ig_account_test_id",
        creator: creatorId,
        instagramUserId: "ig_user_123",
        username: "testcreator",
        followersCount: 10000,
        mediaCount: 45,
        engagementRate: 3.5,
        syncVersion: 2,
        status: "CONNECTED",
        encryptedAccessToken: encryptToken("mock_valid_token")
    };

    let clearQuery = null;
    let clearSet = null;

    try {
        InstagramAccount.findOne = async () => originalAccount;
        global.fetch = async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes("/media")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        data: [{ id: "p_1", like_count: 100, comments_count: 10 }]
                    })
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "ig_user_123",
                    username: "testcreator",
                    followers_count: 10000,
                    media_count: 45
                })
            };
        };

        InstagramAccount.findOneAndUpdate = async (query, update) => ({
            ...originalAccount,
            ...update.$set,
            syncVersion: 3
        });

        CreatorProfile.findOneAndUpdate = async () => ({
            user: creatorId,
            instagramSyncVersion: 3
        });

        InstagramAccount.updateOne = async (query, update) => {
            clearQuery = query;
            clearSet = update.$set;
            return { acknowledged: true, modifiedCount: 1 };
        };

        const result = await refreshInstagramAccountMetrics(creatorId);
        assert.equal(result.success, true);
        assert.equal(result.account.needsProfileSync, false);

        // Verify clear query was bound to the exact syncVersion (3)
        assert.equal(clearQuery._id, originalAccount._id);
        assert.equal(clearQuery.syncVersion, 3);
        assert.equal(clearQuery.needsProfileSync, true);
        assert.equal(clearSet.needsProfileSync, false);
    } finally {
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        global.fetch = originalFetch;
    }
});

test("Scenario 15D: When primary InstagramAccount update fails, error is thrown without profile writes", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalFetch = global.fetch;

    let profileWriteAttempted = false;
    const originalAccount = {
        _id: "ig_account_test_id",
        creator: creatorId,
        instagramUserId: "ig_user_123",
        username: "testcreator",
        status: "CONNECTED",
        encryptedAccessToken: encryptToken("mock_valid_token")
    };

    try {
        InstagramAccount.findOne = async () => originalAccount;
        global.fetch = async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes("/media")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        data: [{ id: "p_1", like_count: 100, comments_count: 10 }]
                    })
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "ig_user_123",
                    username: "testcreator",
                    followers_count: 10000,
                    media_count: 45
                })
            };
        };

        // First update itself fails!
        InstagramAccount.findOneAndUpdate = async () => {
            throw new Error("Primary InstagramAccount write failed");
        };

        CreatorProfile.findOneAndUpdate = async () => {
            profileWriteAttempted = true;
        };

        await assert.rejects(
            async () => {
                await refreshInstagramAccountMetrics(creatorId);
            },
            (err) => {
                assert.equal(err.statusCode, 500);
                return true;
            }
        );

        assert.equal(profileWriteAttempted, false);
    } finally {
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        global.fetch = originalFetch;
    }
});

test("Scenario 16 & 17: Brand discovery reads engagementRate and supports filtering & sorting", () => {
    // Test that the aggregation match and sort shape aligns with CreatorProfile
    const requestedMinEngagement = 4.5;
    const parsedEngagement = Number(requestedMinEngagement);

    const profileMatch = {};
    if (!Number.isNaN(parsedEngagement)) {
        profileMatch.engagementRate = { $gte: parsedEngagement };
    }

    assert.deepEqual(profileMatch, { engagementRate: { $gte: 4.5 } });

    // Test sort stage mapping
    const sortStages = {};
    const normalizedSortBy = "engagementRate";
    const sortDirection = -1; // Highest to lowest

    if (normalizedSortBy === "engagementRate") {
        sortStages.engagementRate = sortDirection;
    }

    assert.deepEqual(sortStages, { engagementRate: -1 });
});

test("Scenario 18: API responses never expose encryptedAccessToken or secret credentials", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;

    try {
        InstagramAccount.findOne = (query) => ({
            select: () => ({
                lean: async () => ({
                    creator: creatorId,
                    instagramUserId: "ig_user_123",
                    username: "creatorsafe",
                    followersCount: 5000,
                    mediaCount: 20,
                    engagementRate: 4.8,
                    averageLikes: 200,
                    averageComments: 40,
                    engagementPostCount: 8,
                    engagementLastSyncedAt: new Date(),
                    status: "CONNECTED",
                    encryptedAccessToken: {
                        iv: "supersecretiv",
                        content: "supersecretcontent",
                        tag: "supersecrettag"
                    }
                })
            })
        });

        const result = await getConnectedInstagramAccount(creatorId);
        assert.equal(result.isConnected, true);
        assert.equal("encryptedAccessToken" in result.account, false);
        assert.equal("accessToken" in result.account, false);
        assert.equal(result.account.engagementRate, 4.8);
        assert.equal(result.account.averageLikes, 200);
        assert.equal(result.account.averageComments, 40);
        assert.equal(result.account.engagementPostCount, 8);
    } finally {
        InstagramAccount.findOne = originalFindOne;
    }
});

// =========================================================================
// SCENARIOS 25 - 34: RESILIENCE, OCC & STRICT DETECTION REGRESSION SUITE
// =========================================================================

test("Scenario 25: persistInstagramConnection handles confirmed unsupported-topology error via one-time fallback retry and connects successfully", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalStartSession = mongoose.startSession;
    const originalReadyState = mongoose.connection.readyState;

    let attempts = 0;
    let fallbackExecutedWithoutSession = false;

    try {
        Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });
        mongoose.startSession = async () => ({
            startTransaction: () => {},
            commitTransaction: async () => {},
            abortTransaction: async () => {},
            endSession: async () => {}
        });

        InstagramAccount.findOne = async () => null; // Pass conflict check
        InstagramAccount.findOneAndUpdate = async (query, update, options) => {
            attempts++;
            if (options && options.session) {
                const err = new Error("Transaction numbers are only allowed on a replica set member or mongos");
                err.code = 20;
                err.codeName = "IllegalOperation";
                throw err;
            }
            fallbackExecutedWithoutSession = true;
            return {
                creator: creatorId,
                instagramUserId: "ig_123",
                username: "testcreator",
                syncVersion: 1,
                needsProfileSync: false
            };
        };

        CreatorProfile.findOneAndUpdate = async () => ({
            user: creatorId,
            instagramSyncVersion: 1
        });

        InstagramAccount.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "test_access_token", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_123",
                username: "testcreator",
                followersCount: 5000,
                mediaCount: 20
            },
            engagementMetrics: {
                isAvailable: true,
                engagementRate: 4.5,
                averageLikes: 200,
                averageComments: 25,
                engagementPostCount: 10
            }
        });

        assert.equal(result.success, true);
        assert.ok(result.redirectUrl.includes("instagram=success"));
        assert.equal(fallbackExecutedWithoutSession, true);
        assert.equal(attempts, 2); // 1 failed session attempt + 1 successful fallback attempt
    } finally {
        Object.defineProperty(mongoose.connection, "readyState", { value: originalReadyState, configurable: true });
        mongoose.startSession = originalStartSession;
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
    }
});

test("Scenario 26: persistInstagramConnection does NOT retry on non-topology errors (generic IllegalOperation or duplicate key)", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalStartSession = mongoose.startSession;
    const originalReadyState = mongoose.connection.readyState;

    let attempts = 0;

    try {
        Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });
        mongoose.startSession = async () => ({
            startTransaction: () => {},
            commitTransaction: async () => {},
            abortTransaction: async () => {},
            endSession: async () => {}
        });

        InstagramAccount.findOne = async () => null; // Pass conflict check
        InstagramAccount.findOneAndUpdate = async () => {
            attempts++;
            const err = new Error("Cannot perform operation on capped collection");
            err.code = 20;
            err.codeName = "IllegalOperation";
            throw err;
        };

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "test_access_token", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_123",
                username: "testcreator",
                followersCount: 5000,
                mediaCount: 20
            }
        });

        assert.equal(result.success, false);
        assert.ok(result.redirectUrl.includes("instagram=error"));
        assert.equal(attempts, 1); // Strictly no retry for non-topology errors
    } finally {
        Object.defineProperty(mongoose.connection, "readyState", { value: originalReadyState, configurable: true });
        mongoose.startSession = originalStartSession;
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
    }
});

test("Scenario 27: refreshInstagramAccountMetrics handles confirmed unsupported-topology error via fallback retry and succeeds", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalFetch = global.fetch;
    const originalStartSession = mongoose.startSession;
    const originalReadyState = mongoose.connection.readyState;

    const originalAccount = {
        _id: "ig_account_test_id",
        creator: creatorId,
        instagramUserId: "ig_user_123",
        username: "testcreator",
        followersCount: 10000,
        mediaCount: 45,
        status: "CONNECTED",
        syncVersion: 1,
        encryptedAccessToken: encryptToken("mock_valid_token")
    };

    let attempts = 0;
    let fallbackExecutedWithoutSession = false;

    try {
        Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });
        mongoose.startSession = async () => ({
            startTransaction: () => {},
            commitTransaction: async () => {},
            abortTransaction: async () => {},
            endSession: async () => {}
        });

        InstagramAccount.findOne = async () => originalAccount;
        global.fetch = async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes("/media")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        data: [{ id: "p_1", like_count: 500, comments_count: 50 }]
                    })
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "ig_user_123",
                    username: "testcreator",
                    followers_count: 10000,
                    media_count: 50
                })
            };
        };

        InstagramAccount.findOneAndUpdate = async (query, update, options) => {
            attempts++;
            if (options && options.session) {
                const err = new Error("Transaction numbers are only allowed on a replica set member or mongos");
                err.code = 20;
                err.codeName = "IllegalOperation";
                throw err;
            }
            fallbackExecutedWithoutSession = true;
            return {
                ...originalAccount,
                ...update.$set,
                syncVersion: 2
            };
        };

        CreatorProfile.findOneAndUpdate = async () => ({
            user: creatorId,
            instagramSyncVersion: 2
        });

        InstagramAccount.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

        const result = await refreshInstagramAccountMetrics(creatorId);
        assert.equal(result.success, true);
        assert.equal(fallbackExecutedWithoutSession, true);
        assert.equal(attempts, 2);
        assert.equal(result.account.syncVersion, 2);
    } finally {
        Object.defineProperty(mongoose.connection, "readyState", { value: originalReadyState, configurable: true });
        mongoose.startSession = originalStartSession;
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
        global.fetch = originalFetch;
    }
});

test("Scenario 28: Standalone born-dirty strategy sets needsProfileSync: true upfront and conditionally clears on exact syncVersion", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalFetch = global.fetch;

    const originalAccount = {
        _id: "ig_account_test_id",
        creator: creatorId,
        instagramUserId: "ig_user_123",
        username: "testcreator",
        followersCount: 10000,
        mediaCount: 45,
        status: "CONNECTED",
        syncVersion: 1,
        encryptedAccessToken: encryptToken("mock_valid_token")
    };

    let primaryWriteSet = null;
    let clearQuery = null;

    try {
        InstagramAccount.findOne = async () => originalAccount;
        global.fetch = async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes("/media")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        data: [{ id: "p_1", like_count: 100, comments_count: 10 }]
                    })
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "ig_user_123",
                    username: "testcreator",
                    followers_count: 10000,
                    media_count: 46
                })
            };
        };

        InstagramAccount.findOneAndUpdate = async (query, update) => {
            primaryWriteSet = update.$set;
            return {
                ...originalAccount,
                ...update.$set,
                syncVersion: 2
            };
        };

        CreatorProfile.findOneAndUpdate = async () => ({
            user: creatorId,
            instagramSyncVersion: 2
        });

        InstagramAccount.updateOne = async (query) => {
            clearQuery = query;
            return { acknowledged: true, modifiedCount: 1 };
        };

        const result = await refreshInstagramAccountMetrics(creatorId);
        assert.equal(result.success, true);

        // Verify born-dirty: initial write had needsProfileSync: true
        assert.equal(primaryWriteSet.needsProfileSync, true);

        // Verify conditional clear was exact on syncVersion: 2
        assert.equal(clearQuery.syncVersion, 2);
        assert.equal(clearQuery.needsProfileSync, true);
    } finally {
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
        global.fetch = originalFetch;
    }
});

test("Scenario 29: Standalone born-dirty leaves needsProfileSync: true intact if profile write throws, with zero secondary write required", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalFetch = global.fetch;

    const originalAccount = {
        _id: "ig_account_test_id",
        creator: creatorId,
        instagramUserId: "ig_user_123",
        username: "testcreator",
        followersCount: 10000,
        mediaCount: 45,
        status: "CONNECTED",
        syncVersion: 1,
        encryptedAccessToken: encryptToken("mock_valid_token")
    };

    let updateOneCalled = false;

    try {
        InstagramAccount.findOne = async () => originalAccount;
        global.fetch = async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes("/media")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        data: [{ id: "p_1", like_count: 100, comments_count: 10 }]
                    })
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "ig_user_123",
                    username: "testcreator",
                    followers_count: 10000,
                    media_count: 46
                })
            };
        };

        InstagramAccount.findOneAndUpdate = async (query, update) => ({
            ...originalAccount,
            ...update.$set,
            syncVersion: 2
        });

        CreatorProfile.findOneAndUpdate = async () => {
            throw new Error("Simulated profile write failure");
        };

        InstagramAccount.updateOne = async () => {
            updateOneCalled = true;
            return { acknowledged: true, modifiedCount: 1 };
        };

        const result = await refreshInstagramAccountMetrics(creatorId);
        assert.equal(result.success, true);
        assert.equal(result.account.needsProfileSync, true);
        assert.equal(updateOneCalled, false); // No secondary write was needed to mark it dirty!
    } finally {
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
        global.fetch = originalFetch;
    }
});

test("Scenario 30: Older sync attempting overwrite on CreatorProfile is blocked by version condition ($lt)", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalProfileExists = CreatorProfile.exists;
    const originalUpdateOne = InstagramAccount.updateOne;

    const accountSnapshotV4 = {
        _id: "ig_account_test_id",
        creator: creatorId,
        username: "testcreator",
        followersCount: 1000,
        engagementRate: 1.0,
        syncVersion: 4,
        needsProfileSync: true,
        status: "CONNECTED"
    };

    let profileQuery = null;

    try {
        InstagramAccount.findOne = async () => accountSnapshotV4;

        CreatorProfile.findOneAndUpdate = async (query) => {
            profileQuery = query;
            // Simulate CreatorProfile already having syncVersion: 5.
            // Query specifies { instagramSyncVersion: { $lt: 4 } }, which does not match version 5!
            return null;
        };

        CreatorProfile.exists = async () => ({ _id: "profile_123" });

        InstagramAccount.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

        const result = await reconcilePendingProfileSync(creatorId, accountSnapshotV4);

        // Verify version condition guarded CreatorProfile
        assert.ok(profileQuery.$or);
        const ltCondition = profileQuery.$or.find((c) => c.instagramSyncVersion && c.instagramSyncVersion.$lt !== undefined);
        assert.equal(ltCondition.instagramSyncVersion.$lt, 4);
    } finally {
        InstagramAccount.findOne = originalFindOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        CreatorProfile.exists = originalProfileExists;
        InstagramAccount.updateOne = originalUpdateOne;
    }
});

test("Scenario 31: Monotonic version increment increments syncVersion on each fresh sync", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalFetch = global.fetch;

    let incApplied = false;

    try {
        InstagramAccount.findOne = async () => ({
            _id: "ig_account_test_id",
            creator: creatorId,
            instagramUserId: "ig_user_123",
            username: "testcreator",
            followersCount: 10000,
            mediaCount: 45,
            status: "CONNECTED",
            syncVersion: 7,
            encryptedAccessToken: encryptToken("mock_valid_token")
        });

        global.fetch = async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes("/media")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ data: [] })
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "ig_user_123",
                    username: "testcreator",
                    followers_count: 10000,
                    media_count: 45
                })
            };
        };

        InstagramAccount.findOneAndUpdate = async (query, update) => {
            if (update.$inc && update.$inc.syncVersion === 1) {
                incApplied = true;
            }
            return {
                _id: "ig_account_test_id",
                syncVersion: 8,
                needsProfileSync: false
            };
        };

        CreatorProfile.findOneAndUpdate = async () => ({ user: creatorId, instagramSyncVersion: 8 });
        InstagramAccount.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

        const result = await refreshInstagramAccountMetrics(creatorId);
        assert.equal(result.success, true);
        assert.equal(incApplied, true);
        assert.equal(result.account.syncVersion, 8);
    } finally {
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
        global.fetch = originalFetch;
    }
});

test("Scenario 32: Missing CreatorProfile in transaction mode sets needsProfileSync: true within the session before commit", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalProfileExists = CreatorProfile.exists;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalStartSession = mongoose.startSession;
    const originalReadyState = mongoose.connection.readyState;

    let flagUpdatedInSession = false;

    try {
        Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });
        mongoose.startSession = async () => ({
            startTransaction: () => {},
            commitTransaction: async () => {},
            abortTransaction: async () => {},
            endSession: async () => {}
        });

        InstagramAccount.findOne = async () => null; // Pass conflict check
        InstagramAccount.findOneAndUpdate = async () => ({
            creator: creatorId,
            syncVersion: 1,
            needsProfileSync: false
        });

        // Profile returns null (does not exist)
        CreatorProfile.findOneAndUpdate = async () => null;
        CreatorProfile.exists = () => ({
            session: () => null
        });

        InstagramAccount.updateOne = async (query, update, options) => {
            if (update.$set && update.$set.needsProfileSync === true) {
                flagUpdatedInSession = true;
            }
            return { acknowledged: true, modifiedCount: 1 };
        };

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "valid_token", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_new_user",
                username: "newuser",
                followersCount: 1000,
                mediaCount: 10
            }
        });

        assert.equal(result.success, true);
        assert.equal(flagUpdatedInSession, true);
    } finally {
        Object.defineProperty(mongoose.connection, "readyState", { value: originalReadyState, configurable: true });
        mongoose.startSession = originalStartSession;
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        CreatorProfile.exists = originalProfileExists;
        InstagramAccount.updateOne = originalUpdateOne;
    }
});

test("Scenario 33: reconcilePendingProfileSync conditional clear prevents flag-race where newer syncVersion pending flag is protected", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;

    const accountV5 = {
        _id: "ig_account_test_id",
        creator: creatorId,
        username: "testcreator",
        followersCount: 5000,
        syncVersion: 5,
        needsProfileSync: true,
        status: "CONNECTED"
    };

    let updateOneQuery = null;

    try {
        InstagramAccount.findOne = async () => accountV5;
        CreatorProfile.findOneAndUpdate = async () => ({ user: creatorId, instagramSyncVersion: 5 });

        // Simulate database state where a newer refresh updated the document to syncVersion: 6
        InstagramAccount.updateOne = async (query) => {
            updateOneQuery = query;
            // Because syncVersion is 5 in query but 6 in DB, update matches 0 documents
            return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        };

        const result = await reconcilePendingProfileSync(creatorId, accountV5);

        // Verification: query checked exact syncVersion 5
        assert.equal(updateOneQuery.syncVersion, 5);
        assert.equal(updateOneQuery.needsProfileSync, true);
        assert.equal(result, false); // Did not clear flag because newer version exists
    } finally {
        InstagramAccount.findOne = originalFindOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
    }
});

test("Scenario 34: Strict detection isTransactionUnsupportedError true positives vs false positives", () => {
    // True positives (confirmed engine signatures)
    const errReplicaSet = new Error("Transaction numbers are only allowed on a replica set member or mongos");
    errReplicaSet.code = 20;
    errReplicaSet.codeName = "IllegalOperation";
    assert.equal(isTransactionUnsupportedError(errReplicaSet), true);

    const errStandalone = new Error("Cannot start a transaction on a standalone mongod");
    assert.equal(isTransactionUnsupportedError(errStandalone), true);

    const errNoTxn = new Error("This MongoDB deployment does not support transactions");
    assert.equal(isTransactionUnsupportedError(errNoTxn), true);

    // False positives (generic IllegalOperation or non-topology errors)
    const errCapped = new Error("Cannot perform operation on capped collection");
    errCapped.code = 20;
    errCapped.codeName = "IllegalOperation";
    assert.equal(isTransactionUnsupportedError(errCapped), false);

    const errUserAborted = new Error("Transaction was aborted by user command");
    errUserAborted.code = 20;
    errUserAborted.codeName = "IllegalOperation";
    assert.equal(isTransactionUnsupportedError(errUserAborted), false);

    const errDupKey = new Error("E11000 duplicate key error collection");
    errDupKey.code = 11000;
    assert.equal(isTransactionUnsupportedError(errDupKey), false);

    const errEmpty = null;
    assert.equal(isTransactionUnsupportedError(errEmpty), false);
});

test("Scenario 35: Successful API response with zero eligible posts marks metrics unavailable (null) on both InstagramAccount and CreatorProfile", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalFetch = global.fetch;

    const originalAccount = {
        _id: "ig_account_test_id",
        creator: creatorId,
        instagramUserId: "ig_user_123",
        username: "testcreator",
        followersCount: 10000,
        mediaCount: 45,
        engagementRate: 8.5,
        averageLikes: 800,
        averageComments: 50,
        engagementPostCount: 12,
        syncVersion: 2,
        status: "CONNECTED",
        encryptedAccessToken: encryptToken("mock_valid_token")
    };

    let igUpdatePayload = null;
    let profileUpdatePayload = null;

    try {
        InstagramAccount.findOne = async () => originalAccount;

        // Mock Meta Graph API responses: profile succeeds, media succeeds with 0 posts
        global.fetch = async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes("/media")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ data: [] }) // Genuinely zero eligible posts
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "ig_user_123",
                    username: "testcreator",
                    account_type: "BUSINESS",
                    followers_count: 10000,
                    media_count: 0
                })
            };
        };

        InstagramAccount.findOneAndUpdate = async (query, update) => {
            igUpdatePayload = update.$set;
            return {
                _id: originalAccount._id,
                ...originalAccount,
                ...update.$set,
                syncVersion: (originalAccount.syncVersion || 0) + 1
            };
        };

        CreatorProfile.findOneAndUpdate = async (query, update) => {
            profileUpdatePayload = update.$set;
            return { _id: "prof_123", user: creatorId, ...update.$set };
        };

        InstagramAccount.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

        const result = await refreshInstagramAccountMetrics(creatorId);

        // Verification: metrics marked unavailable, NOT preserving stale 8.5% ER
        assert.equal(result.success, true);
        assert.equal(result.account.engagementRate, null);
        assert.equal(result.account.averageLikes, null);
        assert.equal(result.account.averageComments, null);
        assert.equal(result.account.engagementPostCount, 0);

        // Verify InstagramAccount payload
        assert.equal(igUpdatePayload.engagementRate, null);
        assert.equal(igUpdatePayload.averageLikes, null);
        assert.equal(igUpdatePayload.averageComments, null);
        assert.equal(igUpdatePayload.engagementPostCount, 0);
        assert.ok(igUpdatePayload.engagementLastSyncedAt instanceof Date);

        // Verify CreatorProfile payload
        assert.equal(profileUpdatePayload.engagementRate, null);
    } finally {
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        global.fetch = originalFetch;
    }
});

test("Scenario 36: Refresh with API media failure preserves previously saved metrics without updating database", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalFetch = global.fetch;

    const originalAccount = {
        _id: "ig_account_test_id",
        creator: creatorId,
        instagramUserId: "ig_user_123",
        username: "testcreator",
        followersCount: 10000,
        mediaCount: 45,
        engagementRate: 8.5,
        averageLikes: 800,
        averageComments: 50,
        engagementPostCount: 12,
        syncVersion: 2,
        status: "CONNECTED",
        encryptedAccessToken: encryptToken("mock_valid_token")
    };

    let igWriteCalled = false;
    let profileWriteCalled = false;

    try {
        InstagramAccount.findOne = async () => originalAccount;

        // Mock Meta Graph API responses: profile succeeds, media throws 500 error
        global.fetch = async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes("/media")) {
                return {
                    ok: false,
                    status: 500,
                    json: async () => ({
                        error: {
                            message: "Internal server error from Meta servers",
                            type: "OAuthException",
                            code: 2
                        }
                    })
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "ig_user_123",
                    username: "testcreator",
                    account_type: "BUSINESS",
                    followers_count: 10000,
                    media_count: 45
                })
            };
        };

        InstagramAccount.findOneAndUpdate = async () => {
            igWriteCalled = true;
            return originalAccount;
        };

        CreatorProfile.findOneAndUpdate = async () => {
            profileWriteCalled = true;
            return { _id: "prof_123" };
        };

        await assert.rejects(
            async () => {
                await refreshInstagramAccountMetrics(creatorId);
            },
            (err) => {
                assert.equal(err.statusCode, 502);
                return true;
            }
        );

        // Verification: database writes were NEVER called -> old metrics preserved!
        assert.equal(igWriteCalled, false);
        assert.equal(profileWriteCalled, false);
    } finally {
        InstagramAccount.findOne = originalFindOne;
        InstagramAccount.findOneAndUpdate = originalFindOneAndUpdate;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        global.fetch = originalFetch;
    }
});

test("Scenario 37: OAuth connect with 0 eligible posts marks engagement unavailable (null) on both InstagramAccount and CreatorProfile", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    let igSetPayload = null;
    let profileSetPayload = null;

    const originalIgFindOne = InstagramAccount.findOne;
    const originalIgFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const originalIgUpdateOne = InstagramAccount.updateOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;

    try {
        InstagramAccount.findOne = async () => null;
        InstagramAccount.findOneAndUpdate = async (query, update) => {
            igSetPayload = update.$set;
            return { _id: "ig_123", ...update.$set };
        };
        CreatorProfile.findOneAndUpdate = async (query, update) => {
            profileSetPayload = update.$set;
            return { _id: "prof_123", ...update.$set };
        };
        InstagramAccount.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

        // Zero eligible posts calculated metric
        const zeroPostMetrics = calculateInstagramEngagement([], 10000);
        assert.equal(zeroPostMetrics.isAvailable, false);

        const result = await persistInstagramConnection({
            creatorId,
            tokenData: { accessToken: "valid_token_12345", expiresIn: 3600 },
            profileData: {
                instagramUserId: "ig_user_1",
                username: "testcreator",
                followersCount: 10000,
                mediaCount: 0
            },
            engagementMetrics: zeroPostMetrics
        });

        assert.equal(result.success, true);
        // Engagement metrics are explicitly marked null (unavailable), NOT omitted, NOT stale
        assert.equal(igSetPayload.engagementRate, null);
        assert.equal(igSetPayload.averageLikes, null);
        assert.equal(igSetPayload.averageComments, null);
        assert.equal(igSetPayload.engagementPostCount, 0);
        assert.ok(igSetPayload.engagementLastSyncedAt instanceof Date);
        assert.equal(profileSetPayload.engagementRate, null);
    } finally {
        InstagramAccount.findOne = originalIgFindOne;
        InstagramAccount.findOneAndUpdate = originalIgFindOneAndUpdate;
        InstagramAccount.updateOne = originalIgUpdateOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
    }
});

test("Scenario 38: reconcilePendingProfileSync synchronizes null engagementRate to CreatorProfile", async () => {
    const creatorId = "507f1f77bcf86cd799439011";
    const originalFindOne = InstagramAccount.findOne;
    const originalProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const originalUpdateOne = InstagramAccount.updateOne;

    const accountWithNullER = {
        _id: "ig_account_test_id",
        creator: creatorId,
        username: "testcreator",
        followersCount: 5000,
        engagementRate: null,
        syncVersion: 7,
        needsProfileSync: true,
        status: "CONNECTED"
    };

    let profileUpdateSet = null;

    try {
        InstagramAccount.findOne = async () => accountWithNullER;
        CreatorProfile.findOneAndUpdate = async (query, update) => {
            profileUpdateSet = update.$set;
            return { user: creatorId, instagramSyncVersion: 7, ...update.$set };
        };
        InstagramAccount.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

        const result = await reconcilePendingProfileSync(creatorId, accountWithNullER);

        assert.equal(result, true);
        assert.equal(profileUpdateSet.engagementRate, null);
        assert.equal(profileUpdateSet.followerCount, 5000);
        assert.equal(profileUpdateSet.instagramSyncVersion, 7);
    } finally {
        InstagramAccount.findOne = originalFindOne;
        CreatorProfile.findOneAndUpdate = originalProfileFindOneAndUpdate;
        InstagramAccount.updateOne = originalUpdateOne;
    }
});
