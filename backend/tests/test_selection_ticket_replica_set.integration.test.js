import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import {
    generateAccountSelectionTicket,
    selectAndPersistInstagramAccount
} from "../src/modules/creator/instagram/instagram.service.js";
import InstagramOAuthState from "../src/modules/creator/instagram/instagramOAuthState.model.js";
import InstagramAccount from "../src/modules/creator/instagram/instagram.model.js";
import CreatorProfile from "../src/modules/creator/profile/profile.model.js";

test("Real MongoDB Replica Set Multi-Document Transaction Integration Test", async (t) => {
    const testUri = process.env.MONGODB_TEST_URI || process.env.MONGO_URI_TEST || process.env.TEST_MONGO_URI;

    if (!testUri) {
        console.log("--------------------------------------------------------------------------------");
        console.log("[SKIP] Real MongoDB replica set integration test skipped:");
        console.log("       No dedicated MONGODB_TEST_URI configured in environment.");
        console.log("       To run real integration tests against a live replica set, set MONGODB_TEST_URI.");
        console.log("--------------------------------------------------------------------------------");
        t.skip("MONGODB_TEST_URI not configured");
        return;
    }

    let isConnected = false;
    const origFetch = global.fetch;

    const creatorId = new mongoose.Types.ObjectId();
    const creatorIdRollback = new mongoose.Types.ObjectId();

    // Distinct account payloads for success test vs rollback test
    const sampleAccountsSuccess = [
        { id: "178414999901", username: "real_rs_creator" }
    ];
    const sampleAccountsRollback = [
        { id: "178414999902", username: "real_rs_creator_rollback" }
    ];

    const cleanupTestData = async () => {
        try {
            await InstagramAccount.deleteMany({
                $or: [
                    { creator: { $in: [creatorId, creatorIdRollback] } },
                    { instagramUserId: { $in: ["178414999901", "178414999902"] } }
                ]
            });
            await InstagramOAuthState.deleteMany({ creator: { $in: [creatorId, creatorIdRollback] } });
            await CreatorProfile.deleteMany({ user: { $in: [creatorId, creatorIdRollback] } });
        } catch (cleanErr) {
            console.error("[Test Cleanup Error]:", cleanErr.message);
        }
    };

    try {
        // Connect to target MongoDB instance
        await mongoose.connect(testUri);
        isConnected = true;

        // Verify replica set / transaction capability by executing a real write and confirming rollback
        let isReplicaSet = false;
        let testSession = null;
        const probeNonceHash = `capability_probe_${new mongoose.Types.ObjectId().toString()}`;
        try {
            testSession = await mongoose.startSession();
            testSession.startTransaction();

            // Real database write operation inside transaction session
            await InstagramOAuthState.create(
                [
                    {
                        nonceHash: probeNonceHash,
                        creator: new mongoose.Types.ObjectId(),
                        expiresAt: new Date(Date.now() + 60000)
                    }
                ],
                { session: testSession }
            );

            // Abort the transaction
            await testSession.abortTransaction();
            await testSession.endSession();
            testSession = null;

            // Confirm rollback: probe document must NOT exist in the database
            const probeDoc = await InstagramOAuthState.findOne({ nonceHash: probeNonceHash });
            if (probeDoc) {
                throw new Error("Transaction abort did not roll back probe document write.");
            }

            isReplicaSet = true;
        } catch (err) {
            console.log(`[INFO] Connected MongoDB instance does not support transactions or failed rollback check: ${err.message}`);
            t.skip("MongoDB instance does not support multi-document transactions");
            return;
        } finally {
            if (testSession) {
                try { await testSession.endSession(); } catch {}
            }
            try { await InstagramOAuthState.deleteOne({ nonceHash: probeNonceHash }); } catch {}
        }

        assert.ok(isReplicaSet, "Target database must support multi-document transactions");

        // Mock global.fetch across all test cases so NO real Meta API network calls are made
        global.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes("/media")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        data: [
                            {
                                id: "post_real_rs_1",
                                media_type: "IMAGE",
                                like_count: 50,
                                comments_count: 5,
                                timestamp: new Date().toISOString()
                            }
                        ]
                    })
                };
            }

            if (urlStr.includes("178414999902")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        id: "178414999902",
                        username: "real_rs_creator_rollback",
                        name: "Rollback Creator",
                        account_type: "CREATOR",
                        followers_count: 500,
                        media_count: 10
                    })
                };
            }

            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "178414999901",
                    username: "real_rs_creator",
                    name: "Real RS Creator",
                    account_type: "CREATOR",
                    followers_count: 1000,
                    media_count: 20
                })
            };
        };

        // Clean any existing test data for these isolated test IDs
        await cleanupTestData();

        // =========================================================================
        // Test Case 1: Real multi-document transaction commit
        // =========================================================================
        await CreatorProfile.create({
            user: creatorId,
            fullName: "Real RS Creator",
            email: "real_rs@test.com"
        });

        const ticket = await generateAccountSelectionTicket({
            creatorId,
            accessToken: "valid-meta-token-real-rs",
            expiresIn: 3600,
            accounts: sampleAccountsSuccess
        });

        const result = await selectAndPersistInstagramAccount({
            creatorId,
            ticket,
            selectedAccountId: "178414999901",
            origin: "onboarding"
        });

        assert.equal(result.success, true);

        // 1A. Verify InstagramAccount persisted in real MongoDB
        const savedAccount = await InstagramAccount.findOne({ creator: creatorId });
        assert.ok(savedAccount, "InstagramAccount must be persisted in real database");
        assert.equal(savedAccount.instagramUserId, "178414999901");
        assert.equal(savedAccount.username, "real_rs_creator");
        assert.equal(savedAccount.status, "CONNECTED");
        assert.equal(savedAccount.needsProfileSync, false, "needsProfileSync must be false on atomic transaction commit");

        // 1B. Verify CreatorProfile updated in real MongoDB
        const updatedProfile = await CreatorProfile.findOne({ user: creatorId });
        assert.ok(updatedProfile, "CreatorProfile must exist in real database");
        assert.equal(updatedProfile.followerCount, 1000);
        assert.equal(updatedProfile.socialLinks?.instagram, "https://instagram.com/real_rs_creator");

        // 1C. Verify InstagramOAuthState completed in real MongoDB
        const finalState = await InstagramOAuthState.findOne({ creator: creatorId });
        assert.ok(finalState, "OAuth state must exist in real database");
        assert.equal(finalState.isCompleted, true, "OAuth state must be marked completed");
        assert.ok(finalState.completedAt, "completedAt timestamp must be recorded");
        assert.equal(finalState.claimExpiresAt, null, "claimExpiresAt must be cleared upon completion");

        // =========================================================================
        // Test Case 2: Real transaction rollback on application-level error
        // Uses different account ID "178414999902" to avoid cross-creator conflict
        // =========================================================================
        await CreatorProfile.create({
            user: creatorIdRollback,
            fullName: "Rollback Creator",
            email: "rollback@test.com"
        });

        const rollbackTicket = await generateAccountSelectionTicket({
            creatorId: creatorIdRollback,
            accessToken: "valid-meta-token-real-rollback",
            expiresIn: 3600,
            accounts: sampleAccountsRollback
        });

        // Simulate CreatorProfile write failure (application-level failure inside transaction)
        let profileWriteAttempted = false;
        const origProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
        CreatorProfile.findOneAndUpdate = async (...args) => {
            profileWriteAttempted = true;
            throw new Error("Simulated profile write failure for real rollback test");
        };

        try {
            await assert.rejects(
                async () => {
                    await selectAndPersistInstagramAccount({
                        creatorId: creatorIdRollback,
                        ticket: rollbackTicket,
                        selectedAccountId: "178414999902",
                        origin: "onboarding"
                    });
                },
                /Failed to save Instagram account connection/i
            );

            // PROOF OF INVOCATION: Ensure failure occurred at profile write, NOT at conflict check
            assert.equal(
                profileWriteAttempted,
                true,
                "Simulated CreatorProfile write failure must have been actually reached and executed (not rejected early by a conflict check)"
            );

            // REAL MONGODB ROLLBACK VERIFICATION:
            // 2A. InstagramAccount must NOT exist for creatorIdRollback (atomically rolled back!)
            const accountAfterRollback = await InstagramAccount.findOne({ creator: creatorIdRollback });
            assert.equal(
                accountAfterRollback,
                null,
                "Real MongoDB transaction rollback must leave InstagramAccount uncreated"
            );

            // 2B. CreatorProfile must NOT have been updated with Instagram details
            const profileAfterRollback = await CreatorProfile.findOne({ user: creatorIdRollback });
            assert.ok(profileAfterRollback, "CreatorProfile still exists in its original state");
            assert.equal(
                profileAfterRollback.socialLinks?.instagram,
                undefined,
                "CreatorProfile was not modified by the rolled-back transaction"
            );

            // 2C. InstagramOAuthState must NOT be marked isCompleted
            const stateAfterRollback = await InstagramOAuthState.findOne({ creator: creatorIdRollback });
            assert.ok(stateAfterRollback, "OAuth state exists");
            assert.notEqual(
                stateAfterRollback.isCompleted,
                true,
                "OAuth state must not be completed after rollback"
            );
        } finally {
            CreatorProfile.findOneAndUpdate = origProfileFindOneAndUpdate;
        }

    } finally {
        // Restore original global.fetch
        global.fetch = origFetch;

        // Clean up isolated test records
        await cleanupTestData();

        // Disconnect from MongoDB in outer finally
        if (isConnected || mongoose.connection.readyState !== 0) {
            try {
                await mongoose.disconnect();
            } catch {}
        }
    }
});
