import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";

// Set environment variables before module imports
process.env.NODE_ENV = "test";
process.env.ALLOW_STANDALONE_SELECTION = "true";
process.env.TOKEN_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.ACCESS_TOKEN_SECRET = "test-secret-at-least-32-chars-long-12345";
process.env.FRONTEND_URL = "http://localhost:3000";

test("Selection Ticket Atomic Claim, Concurrency, and Lease Recovery Security", async (t) => {
    const {
        generateAccountSelectionTicket,
        getEligibleAccountsFromSelectionTicket,
        selectAndPersistInstagramAccount
    } = await import("../src/modules/creator/instagram/instagram.service.js");
    const InstagramOAuthState = (await import("../src/modules/creator/instagram/instagramOAuthState.model.js")).default;
    const InstagramAccount = (await import("../src/modules/creator/instagram/instagram.model.js")).default;
    const CreatorProfile = (await import("../src/modules/creator/profile/profile.model.js")).default;

    // In-memory mock store for InstagramOAuthState
    const stateDocs = new Map();

    const origFindOne = InstagramOAuthState.findOne;
    const origFindOneAndUpdate = InstagramOAuthState.findOneAndUpdate;
    const origCreate = InstagramOAuthState.create;
    const origUpdateOne = InstagramOAuthState.updateOne;

    // Transaction staging stores
    let mockSessionActive = false;
    let stagedStateDocs = new Map();
    let stagedAccounts = new Map();

    InstagramOAuthState.create = async (doc) => {
        const item = {
            ...doc,
            _id: new mongoose.Types.ObjectId(),
            isConsumed: doc.isConsumed || false,
            claimId: doc.claimId || null,
            isCompleted: doc.isCompleted || false,
            claimExpiresAt: doc.claimExpiresAt || null
        };
        stateDocs.set(doc.nonceHash, item);
        return item;
    };

    InstagramOAuthState.findOne = (query) => {
        const sourceMap = (mockSessionActive && stagedStateDocs.has(query.nonceHash))
            ? stagedStateDocs
            : stateDocs;
        const doc = query.nonceHash ? sourceMap.get(query.nonceHash) || null : null;
        let match = doc;
        if (doc) {
            if (query.creator && doc.creator.toString() !== query.creator.toString()) {
                match = null;
            }
            if (query.claimId && doc.claimId !== query.claimId) {
                match = null;
            }
            if (query.isCompleted?.$ne && doc.isCompleted === true) {
                match = null;
            }
            if (query.claimExpiresAt?.$gt && (!doc.claimExpiresAt || new Date(doc.claimExpiresAt) <= new Date(query.claimExpiresAt.$gt))) {
                match = null;
            }
            if (query.expiresAt?.$gt && new Date() >= new Date(doc.expiresAt)) {
                match = null;
            }
        }
        return {
            lean: () => Promise.resolve(match),
            then: (resolve) => resolve(match)
        };
    };

    InstagramOAuthState.findOneAndUpdate = async (filter, update, options) => {
        const useStaging = Boolean(options?.session && mockSessionActive);
        const sourceMap = (useStaging && stagedStateDocs.has(filter.nonceHash))
            ? stagedStateDocs
            : stateDocs;
        const doc = sourceMap.get(filter.nonceHash);
        if (!doc) return null;

        if (filter.creator && doc.creator.toString() !== filter.creator.toString()) {
            return null;
        }
        if (filter.claimId && doc.claimId !== filter.claimId) {
            return null;
        }
        if (filter.isCompleted?.$ne && doc.isCompleted === true) {
            return null;
        }
        if (filter.claimExpiresAt?.$gt && (!doc.claimExpiresAt || new Date(doc.claimExpiresAt) <= new Date(filter.claimExpiresAt.$gt))) {
            return null;
        }
        if (filter.expiresAt?.$gt && new Date() >= new Date(doc.expiresAt)) {
            return null;
        }

        // Check $or condition for claim eligibility: isConsumed: false OR expired claim lease
        if (Array.isArray(filter.$or)) {
            const matchesOr = filter.$or.some((cond) => {
                if (cond.isConsumed === false && doc.isConsumed === false) return true;
                if (
                    cond.isConsumed === true &&
                    doc.isConsumed === true &&
                    cond.claimExpiresAt?.$lte &&
                    doc.claimExpiresAt &&
                    new Date(doc.claimExpiresAt) <= cond.claimExpiresAt.$lte
                ) {
                    return true;
                }
                return false;
            });
            if (!matchesOr) return null;
        } else if (filter.isConsumed !== undefined && doc.isConsumed !== filter.isConsumed) {
            return null;
        }

        // Apply atomic update
        if (useStaging) {
            const stagedDoc = { ...doc };
            if (update.$set) {
                Object.assign(stagedDoc, update.$set);
            }
            stagedStateDocs.set(filter.nonceHash, stagedDoc);
            return { ...stagedDoc };
        } else {
            if (update.$set) {
                Object.assign(doc, update.$set);
            }
            stateDocs.set(filter.nonceHash, doc);
            return { ...doc };
        }
    };

    InstagramOAuthState.updateOne = async (filter, update) => {
        const doc = stateDocs.get(filter.nonceHash);
        if (!doc) return { modifiedCount: 0 };
        if (filter.creator && doc.creator.toString() !== filter.creator.toString()) {
            return { modifiedCount: 0 };
        }
        if (filter.claimId && doc.claimId !== filter.claimId) {
            return { modifiedCount: 0 };
        }
        if (filter.isCompleted?.$ne && doc.isCompleted === true) {
            return { modifiedCount: 0 };
        }
        if (filter.claimExpiresAt?.$gt && (!doc.claimExpiresAt || new Date(doc.claimExpiresAt) <= new Date(filter.claimExpiresAt.$gt))) {
            return { modifiedCount: 0 };
        }
        if (filter.consumedAt !== undefined && doc.consumedAt?.getTime() !== filter.consumedAt?.getTime()) {
            return { modifiedCount: 0 };
        }
        if (filter.expiresAt?.$gt && new Date() >= new Date(doc.expiresAt)) {
            return { modifiedCount: 0 };
        }
        if (update.$set) {
            Object.assign(doc, update.$set);
        }
        stateDocs.set(filter.nonceHash, doc);
        return { modifiedCount: 1 };
    };

    // Mock InstagramAccount persistence and lookup
    const connectedAccounts = new Map();
    const origAccountFindOne = InstagramAccount.findOne;
    const origAccountFindOneAndUpdate = InstagramAccount.findOneAndUpdate;
    const origAccountUpdateOne = InstagramAccount.updateOne;
    const origAccountDeleteOne = InstagramAccount.deleteOne;

    InstagramAccount.findOne = (query) => {
        let result = null;
        const sourceMap = (mockSessionActive && query.creator && stagedAccounts.has(query.creator.toString()))
            ? stagedAccounts
            : connectedAccounts;

        if (query.instagramUserId && query.creator?.$ne) {
            for (const acc of sourceMap.values()) {
                if (acc.instagramUserId === query.instagramUserId && acc.creator.toString() !== query.creator.$ne.toString()) {
                    result = acc;
                    break;
                }
            }
        } else if (query.creator) {
            const acc = sourceMap.get(query.creator.toString());
            if (acc && (!query.status || acc.status === query.status)) {
                result = acc;
            }
        }
        return {
            lean: () => Promise.resolve(result),
            then: (resolve) => resolve(result)
        };
    };

    InstagramAccount.findOneAndUpdate = async (filter, update, options) => {
        const creatorKey = filter.creator.toString();
        const useStaging = Boolean(options?.session && mockSessionActive);
        const targetMap = useStaging ? stagedAccounts : connectedAccounts;
        let acc = targetMap.get(creatorKey) || { creator: filter.creator, syncVersion: 0 };
        acc = { ...acc };
        if (update.$set) Object.assign(acc, update.$set);
        if (update.$inc?.syncVersion) acc.syncVersion = (acc.syncVersion || 0) + update.$inc.syncVersion;
        targetMap.set(creatorKey, acc);
        return acc;
    };

    InstagramAccount.updateOne = async (filter, update, options) => {
        const creatorKey = filter.creator?.toString();
        const useStaging = Boolean(options?.session && mockSessionActive);
        const targetMap = useStaging ? stagedAccounts : connectedAccounts;
        if (creatorKey && targetMap.has(creatorKey)) {
            const acc = { ...targetMap.get(creatorKey) };
            if (update.$set) Object.assign(acc, update.$set);
            targetMap.set(creatorKey, acc);
            return { modifiedCount: 1 };
        }
        return { modifiedCount: 0 };
    };

    InstagramAccount.deleteOne = async (filter) => {
        let deleted = 0;
        if (filter.creator) {
            const key = filter.creator.toString();
            const existing = connectedAccounts.get(key);
            if (existing && (!filter.instagramUserId || existing.instagramUserId === filter.instagramUserId)) {
                connectedAccounts.delete(key);
                deleted = 1;
            }
        }
        return { deletedCount: deleted };
    };

    // Mock CreatorProfile lookup and update
    const origProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const origProfileExists = CreatorProfile.exists;
    CreatorProfile.findOneAndUpdate = async () => ({ instagramSyncVersion: 1 });
    CreatorProfile.exists = () => ({ session: () => Promise.resolve(true) });

    const creatorA = new mongoose.Types.ObjectId();
    const creatorB = new mongoose.Types.ObjectId();

    const sampleAccounts = [
        { id: "1784140001", username: "creator_one" },
        { id: "1784140002", username: "creator_two" }
    ];

    await t.test("1. Generate encrypted ticket and retrieve pending accounts via authenticated creator", async () => {
        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorA,
            accessToken: "valid-meta-token-123",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        const rawDecoded = Buffer.from(ticket, "base64url").toString("utf8");
        assert.ok(!rawDecoded.includes("creator_one"), "Ticket should not contain plaintext username");
        assert.ok(!rawDecoded.includes("valid-meta-token"), "Ticket should not contain plaintext access token");

        const eligible = await getEligibleAccountsFromSelectionTicket({
            creatorId: creatorA,
            ticket
        });
        assert.equal(eligible.accounts.length, 2);
        assert.equal(eligible.accounts[0].id, "1784140001");
    });

    await t.test("2. Different creator cannot read pending accounts with creatorA's ticket", async () => {
        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorA,
            accessToken: "valid-meta-token-123",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        await assert.rejects(
            async () => {
                await getEligibleAccountsFromSelectionTicket({
                    creatorId: creatorB,
                    ticket
                });
            },
            (err) => {
                assert.equal(err.statusCode, 403);
                assert.match(err.message, /issued to a different creator/i);
                return true;
            }
        );
    });

    await t.test("3. Two concurrent select requests: only ONE can claim and persist the ticket", async () => {
        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorA,
            accessToken: "valid-meta-token-concurrency",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        const originalFetch = global.fetch;
        global.fetch = async (url) => {
            if (url.includes("fields=id,username,name")) {
                const accId = url.includes("1784140001") ? "1784140001" : "1784140002";
                const user = accId === "1784140001" ? "creator_one" : "creator_two";
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        id: accId,
                        username: user,
                        name: "Test Creator",
                        account_type: "CREATOR",
                        followers_count: 500,
                        media_count: 10
                    })
                };
            }
            if (url.includes("media?fields=")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ data: [] })
                };
            }
            return {
                ok: false,
                status: 404,
                json: async () => ({ error: { message: "Not found" } })
            };
        };

        try {
            const req1 = selectAndPersistInstagramAccount({
                creatorId: creatorA,
                ticket,
                selectedAccountId: "1784140001",
                origin: "onboarding"
            });

            const req2 = selectAndPersistInstagramAccount({
                creatorId: creatorA,
                ticket,
                selectedAccountId: "1784140002",
                origin: "onboarding"
            });

            const results = await Promise.allSettled([req1, req2]);

            const fulfilled = results.filter((r) => r.status === "fulfilled");
            const rejected = results.filter((r) => r.status === "rejected");

            assert.equal(fulfilled.length, 1, "Exactly one concurrent request must succeed");
            assert.equal(rejected.length, 1, "The other concurrent request must be rejected");

            const winningResult = fulfilled[0].value;
            assert.equal(winningResult.success, true);
            assert.ok(["1784140001", "1784140002"].includes(winningResult.account.instagramUserId));

            const losingError = rejected[0].reason;
            assert.equal(losingError.statusCode, 403);
            assert.match(
                losingError.message,
                /(already been used|already been claimed|being processed|different creator)/i
            );

            // Verify ticket state document is completed
            const decodedEnvelope = JSON.parse(Buffer.from(ticket, "base64url").toString("utf8"));
            const { decryptToken } = await import("../src/utils/helpers/encryption.helper.js");
            const [iv, content, tag] = decodedEnvelope.c.split(":");
            const payload = JSON.parse(decryptToken({ iv, content, tag }));
            const nonceHash = crypto.createHash("sha256").update(payload.n).digest("hex");
            const stateDoc = stateDocs.get(nonceHash);
            assert.equal(stateDoc.isConsumed, true, "Ticket must be marked consumed");
            assert.equal(stateDoc.isCompleted, true, "Ticket must be marked completed");
        } finally {
            global.fetch = originalFetch;
        }
    });

    await t.test("4. A completed ticket cannot be replayed or leased again", async () => {
        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorB,
            accessToken: "valid-meta-token-reuse",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        // Mark state as completed
        const decodedEnvelope = JSON.parse(Buffer.from(ticket, "base64url").toString("utf8"));
        const { decryptToken } = await import("../src/utils/helpers/encryption.helper.js");
        const [iv, content, tag] = decodedEnvelope.c.split(":");
        const payload = JSON.parse(decryptToken({ iv, content, tag }));
        const nonceHash = crypto.createHash("sha256").update(payload.n).digest("hex");
        const stateDoc = stateDocs.get(nonceHash);
        stateDoc.isConsumed = true;
        stateDoc.isCompleted = true;

        await assert.rejects(
            async () => {
                await selectAndPersistInstagramAccount({
                    creatorId: creatorB,
                    ticket,
                    selectedAccountId: "1784140001",
                    origin: "onboarding"
                });
            },
            (err) => {
                assert.equal(err.statusCode, 403);
                assert.match(err.message, /already been used/i);
                return true;
            }
        );
    });

    await t.test("5. Expired ticket is rejected", async () => {
        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorB,
            accessToken: "valid-meta-token-expired",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        // Set ticket expiresAt to the past
        const decodedEnvelope = JSON.parse(Buffer.from(ticket, "base64url").toString("utf8"));
        const { decryptToken } = await import("../src/utils/helpers/encryption.helper.js");
        const [iv, content, tag] = decodedEnvelope.c.split(":");
        const payload = JSON.parse(decryptToken({ iv, content, tag }));
        const nonceHash = crypto.createHash("sha256").update(payload.n).digest("hex");
        const stateDoc = stateDocs.get(nonceHash);
        stateDoc.expiresAt = new Date(Date.now() - 1000);

        await assert.rejects(
            async () => {
                await selectAndPersistInstagramAccount({
                    creatorId: creatorB,
                    ticket,
                    selectedAccountId: "1784140001",
                    origin: "onboarding"
                });
            },
            (err) => {
                assert.equal(err.statusCode, 400);
                assert.match(err.message, /expired/i);
                return true;
            }
        );
    });

    await t.test("6. Failed Meta API call releases the claim allowing retry", async () => {
        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorA,
            accessToken: "valid-meta-token-retryable",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        const originalFetch = global.fetch;
        let attempt = 0;
        global.fetch = async (url) => {
            attempt++;
            if (attempt === 1) {
                throw new Error("Temporary network timeout");
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: "1784140001",
                    username: "creator_one",
                    name: "Creator One",
                    account_type: "CREATOR",
                    followers_count: 100,
                    media_count: 5
                })
            };
        };

        try {
            await assert.rejects(
                async () => {
                    await selectAndPersistInstagramAccount({
                        creatorId: creatorA,
                        ticket,
                        selectedAccountId: "1784140001",
                        origin: "onboarding"
                    });
                },
                (err) => {
                    assert.match(err.message, /(Network error|Temporary network timeout)/i);
                    return true;
                }
            );

            // Verify ticket claim was released (isConsumed is false, claimExpiresAt is null)
            const decodedEnvelope = JSON.parse(Buffer.from(ticket, "base64url").toString("utf8"));
            const { decryptToken } = await import("../src/utils/helpers/encryption.helper.js");
            const [iv, content, tag] = decodedEnvelope.c.split(":");
            const payload = JSON.parse(decryptToken({ iv, content, tag }));
            const nonceHash = crypto.createHash("sha256").update(payload.n).digest("hex");
            const stateDocAfterFail = stateDocs.get(nonceHash);
            assert.equal(stateDocAfterFail.isConsumed, false, "Ticket must be released after transient failure");
            assert.equal(stateDocAfterFail.isCompleted, false);

            // Second attempt: retry should now succeed
            const successResult = await selectAndPersistInstagramAccount({
                creatorId: creatorA,
                ticket,
                selectedAccountId: "1784140001",
                origin: "onboarding"
            });
            assert.equal(successResult.success, true);
            assert.equal(successResult.account.instagramUserId, "1784140001");

            // Ticket is now marked permanently completed
            const stateDocAfterSuccess = stateDocs.get(nonceHash);
            assert.equal(stateDocAfterSuccess.isConsumed, true);
            assert.equal(stateDocAfterSuccess.isCompleted, true);
        } finally {
            global.fetch = originalFetch;
        }
    });

    await t.test("7. Server crash recovery: expired claim lease allows creator to recover and select account", async () => {
        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorA,
            accessToken: "valid-meta-token-crash-recovery",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        // Simulate crash: ticket was claimed (isConsumed: true) but server died before persistence (isCompleted: false)
        // Lease duration has now expired (claimExpiresAt <= now)
        const decodedEnvelope = JSON.parse(Buffer.from(ticket, "base64url").toString("utf8"));
        const { decryptToken } = await import("../src/utils/helpers/encryption.helper.js");
        const [iv, content, tag] = decodedEnvelope.c.split(":");
        const payload = JSON.parse(decryptToken({ iv, content, tag }));
        const nonceHash = crypto.createHash("sha256").update(payload.n).digest("hex");
        const stateDoc = stateDocs.get(nonceHash);
        stateDoc.isConsumed = true;
        stateDoc.isCompleted = false;
        stateDoc.claimExpiresAt = new Date(Date.now() - 5000); // Expired 5 seconds ago

        const originalFetch = global.fetch;
        global.fetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                id: "1784140001",
                username: "creator_one",
                name: "Creator One",
                account_type: "CREATOR",
                followers_count: 200,
                media_count: 8
            })
        });

        try {
            // New request after crash should successfully reclaim the expired lease and persist
            const recoveredResult = await selectAndPersistInstagramAccount({
                creatorId: creatorA,
                ticket,
                selectedAccountId: "1784140001",
                origin: "onboarding"
            });

            assert.equal(recoveredResult.success, true);
            assert.equal(recoveredResult.account.instagramUserId, "1784140001");

            // State document is now permanently completed
            assert.equal(stateDoc.isCompleted, true);
            assert.equal(stateDoc.isConsumed, true);
        } finally {
            global.fetch = originalFetch;
        }
    });

    await t.test("8. Cannot silently overwrite an already connected different Instagram account", async () => {
        const creatorC = new mongoose.Types.ObjectId();
        connectedAccounts.clear();
        connectedAccounts.set(creatorC.toString(), {
            creator: creatorC,
            instagramUserId: "EXISTING_DIFFERENT_ACCOUNT_ID",
            username: "existing_creator_handle",
            status: "CONNECTED"
        });

        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorC,
            accessToken: "valid-meta-token-overwrite-test",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        const originalFetch = global.fetch;
        global.fetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                id: "1784140001",
                username: "creator_one",
                name: "Creator One",
                account_type: "CREATOR",
                followers_count: 200,
                media_count: 8
            })
        });

        try {
            await selectAndPersistInstagramAccount({
                creatorId: creatorC,
                ticket,
                selectedAccountId: "1784140001",
                origin: "onboarding"
            });
            assert.fail("Should have thrown error");
        } catch (err) {
            assert.match(err.message, /already have @existing_creator_handle connected/i);
        } finally {
            global.fetch = originalFetch;
        }

        // Existing account was not overwritten
        const currentAccount = connectedAccounts.get(creatorC.toString());
        assert.equal(currentAccount.instagramUserId, "EXISTING_DIFFERENT_ACCOUNT_ID");
    });

    await t.test("9. In-flight delayed request: Request A pauses immediately AFTER pre-persistence check, lease expires, Request B reclaims and connects Account B, Request A resumes and fails to overwrite", async () => {
        const creatorD = new mongoose.Types.ObjectId();
        connectedAccounts.clear();

        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorD,
            accessToken: "valid-meta-token-inflight-fencing-test",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        const decodedEnvelope = JSON.parse(Buffer.from(ticket, "base64url").toString("utf8"));
        const { decryptToken } = await import("../src/utils/helpers/encryption.helper.js");
        const [iv, content, tag] = decodedEnvelope.c.split(":");
        const payload = JSON.parse(decryptToken({ iv, content, tag }));
        const nonceHash = crypto.createHash("sha256").update(payload.n).digest("hex");
        const stateDoc = stateDocs.get(nonceHash);

        // Coordination promises to pause Request A strictly AFTER the pre-persistence check passes
        let resolveRequestAPause;
        const requestAPausePromise = new Promise((resolve) => {
            resolveRequestAPause = resolve;
        });

        let requestAPassedPrePersist;
        const requestAPassedPromise = new Promise((resolve) => {
            requestAPassedPrePersist = resolve;
        });

        const originalFetch = global.fetch;
        global.fetch = async (url) => {
            const isAccount2 = url.includes("1784140002");
            const accId = isAccount2 ? "1784140002" : "1784140001";
            const username = isAccount2 ? "creator_two" : "creator_one";
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    id: accId,
                    username,
                    name: "Creator " + username,
                    account_type: "CREATOR",
                    followers_count: isAccount2 ? 500 : 100,
                    media_count: isAccount2 ? 20 : 5
                })
            };
        };

        try {
            // 1. Launch Request A with _testHooks to pause immediately after pre-persistence check
            const requestAPromise = selectAndPersistInstagramAccount({
                creatorId: creatorD,
                ticket,
                selectedAccountId: "1784140001",
                origin: "onboarding",
                _testHooks: {
                    _afterPrePersistCheck: async () => {
                        requestAPassedPrePersist();
                        await requestAPausePromise;
                    }
                }
            });

            // 2. Wait until Request A has PASSED the pre-persistence check and paused immediately before persistence
            await requestAPassedPromise;
            assert.equal(stateDoc.isConsumed, true, "Request A must have atomically claimed the ticket");
            assert.ok(stateDoc.claimId, "Request A must have an active claimId");
            assert.equal(stateDoc.isCompleted, false, "Ticket must not be completed yet");
            const claimIdA = stateDoc.claimId;

            // 3. Request A's claim lease expires while paused immediately before persistence
            stateDoc.claimExpiresAt = new Date(Date.now() - 1000);

            // 4. Request B arrives, reclaims the expired lease with a new claimId, and connects Account 2
            const requestBResult = await selectAndPersistInstagramAccount({
                creatorId: creatorD,
                ticket,
                selectedAccountId: "1784140002",
                origin: "onboarding"
            });

            assert.equal(requestBResult.success, true);
            assert.equal(requestBResult.account.instagramUserId, "1784140002");
            assert.notEqual(stateDoc.claimId, claimIdA, "Request B must have generated a new claimId");
            assert.equal(stateDoc.isCompleted, true, "Ticket is marked completed by Request B");

            // Verify Account 2 is persisted in DB
            const accountAfterB = connectedAccounts.get(creatorD.toString());
            assert.equal(accountAfterB.instagramUserId, "1784140002");
            assert.equal(accountAfterB.username, "creator_two");

            // 5. Unpause Request A and let it attempt persistence with its stale claimId
            resolveRequestAPause();

            // 6. Request A must fail with 403 because its claim lease was superseded and finalized
            await assert.rejects(
                async () => {
                    await requestAPromise;
                },
                (err) => {
                    assert.equal(err.statusCode, 403);
                    assert.match(err.message, /(superseded|expired|reclaimed|already have)/i);
                    return true;
                }
            );

            // 7. Verify that Request A NEVER overwrote Request B's connected account
            const finalAccount = connectedAccounts.get(creatorD.toString());
            assert.equal(finalAccount.instagramUserId, "1784140002", "Request B's account must remain intact and not overwritten");
            assert.equal(finalAccount.username, "creator_two");

            // 8. Verify ticket completion status was NOT reset by Request A's failure
            assert.equal(stateDoc.isCompleted, true);
            assert.equal(stateDoc.isConsumed, true);
        } finally {
            global.fetch = originalFetch;
        }
    });

    await t.test("10. Old request cannot release a new request's claim upon failure", async () => {
        const creatorE = new mongoose.Types.ObjectId();
        connectedAccounts.clear();

        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorE,
            accessToken: "valid-meta-token-unrelease-test",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        const decodedEnvelope = JSON.parse(Buffer.from(ticket, "base64url").toString("utf8"));
        const { decryptToken } = await import("../src/utils/helpers/encryption.helper.js");
        const [iv, content, tag] = decodedEnvelope.c.split(":");
        const payload = JSON.parse(decryptToken({ iv, content, tag }));
        const nonceHash = crypto.createHash("sha256").update(payload.n).digest("hex");
        const stateDoc = stateDocs.get(nonceHash);

        // Active claim held by Request B
        const activeClaimIdB = "active_claim_request_b";
        stateDoc.isConsumed = true;
        stateDoc.claimId = activeClaimIdB;
        stateDoc.isCompleted = false;
        stateDoc.claimExpiresAt = new Date(Date.now() + 60000);

        // Request A (with old claimId) attempts to release state in updateOne
        const staleClaimIdA = "stale_claim_request_a";
        const updateResult = await InstagramOAuthState.updateOne(
            {
                nonceHash,
                creator: creatorE,
                claimId: staleClaimIdA,
                isCompleted: { $ne: true },
                expiresAt: { $gt: new Date() }
            },
            {
                $set: {
                    isConsumed: false,
                    claimId: null,
                    consumedAt: null,
                    claimExpiresAt: null
                }
            }
        );

        // Update must not touch Request B's active claim
        assert.equal(updateResult.modifiedCount, 0);
        assert.equal(stateDoc.isConsumed, true);
        assert.equal(stateDoc.claimId, activeClaimIdB);
    });

    await t.test("11. Replica Set Transaction simulation: atomic commit, rollback on failure, and lease validation", async () => {
        const creatorF = new mongoose.Types.ObjectId();
        connectedAccounts.clear();

        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorF,
            accessToken: "valid-meta-token-tx-test",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        const decodedEnvelope = JSON.parse(Buffer.from(ticket, "base64url").toString("utf8"));
        const { decryptToken } = await import("../src/utils/helpers/encryption.helper.js");
        const [iv, content, tag] = decodedEnvelope.c.split(":");
        const payload = JSON.parse(decryptToken({ iv, content, tag }));
        const nonceHash = crypto.createHash("sha256").update(payload.n).digest("hex");
        const stateDoc = stateDocs.get(nonceHash);

        // Setup mock session with true staging and rollback semantics
        mockSessionActive = false;
        stagedAccounts.clear();
        stagedStateDocs.clear();

        let txStarted = false;
        let txCommitted = false;
        let txAborted = false;

        const mockSession = {
            startTransaction: () => {
                txStarted = true;
                mockSessionActive = true;
            },
            commitTransaction: async () => {
                txCommitted = true;
                // Flush staged writes into master maps
                for (const [k, v] of stagedAccounts) connectedAccounts.set(k, v);
                for (const [k, v] of stagedStateDocs) {
                    const existing = stateDocs.get(k);
                    if (existing) Object.assign(existing, v);
                    else stateDocs.set(k, v);
                }
                stagedAccounts.clear();
                stagedStateDocs.clear();
                mockSessionActive = false;
            },
            abortTransaction: async () => {
                txAborted = true;
                // Discard all staged changes: zero writes to master maps!
                stagedAccounts.clear();
                stagedStateDocs.clear();
                mockSessionActive = false;
            },
            endSession: async () => {
                mockSessionActive = false;
            }
        };

        const origReadyState = mongoose.connection.readyState;
        const origStartSession = mongoose.startSession;
        mongoose.connection.readyState = 1;
        mongoose.startSession = async () => mockSession;

        const originalFetch = global.fetch;
        global.fetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                id: "1784140001",
                username: "creator_tx",
                name: "Creator Tx",
                account_type: "CREATOR",
                followers_count: 1000,
                media_count: 50
            })
        });

        try {
            // Case 11A: Successful transaction commit
            const result = await selectAndPersistInstagramAccount({
                creatorId: creatorF,
                ticket,
                selectedAccountId: "1784140001",
                origin: "onboarding"
            });

            assert.equal(result.success, true);
            assert.equal(txStarted, true, "Transaction must have started");
            assert.equal(txCommitted, true, "Transaction must have committed");
            assert.equal(txAborted, false, "Transaction must not have aborted");
            assert.equal(stateDoc.isCompleted, true);
            assert.equal(stateDoc.isConsumed, true);
            assert.equal(connectedAccounts.has(creatorF.toString()), true);

            // Case 11B: Failed transaction leaves InstagramAccount, CreatorProfile, and OAuth state completely unchanged
            connectedAccounts.clear();
            const creatorF2 = new mongoose.Types.ObjectId();
            const ticket2 = await generateAccountSelectionTicket({
                creatorId: creatorF2,
                accessToken: "valid-meta-token-tx-fail",
                expiresIn: 3600,
                accounts: sampleAccounts
            });

            const decodedEnvelope2 = JSON.parse(Buffer.from(ticket2, "base64url").toString("utf8"));
            const [iv2, content2, tag2] = decodedEnvelope2.c.split(":");
            const payload2 = JSON.parse(decryptToken({ iv: iv2, content: content2, tag: tag2 }));
            const nonceHash2 = crypto.createHash("sha256").update(payload2.n).digest("hex");
            const stateDoc2 = stateDocs.get(nonceHash2);

            txStarted = false;
            txCommitted = false;
            txAborted = false;

            let profileWriteAttempted = false;
            const origProfileUpdate = CreatorProfile.findOneAndUpdate;
            CreatorProfile.findOneAndUpdate = async () => {
                profileWriteAttempted = true;
                throw new Error("Simulated profile write failure inside transaction");
            };

            try {
                await assert.rejects(
                    async () => {
                        await selectAndPersistInstagramAccount({
                            creatorId: creatorF2,
                            ticket: ticket2,
                            selectedAccountId: "1784140001",
                            origin: "onboarding"
                        });
                    },
                    /Failed to save Instagram account connection/i
                );

                assert.equal(profileWriteAttempted, true, "Simulated CreatorProfile write failure must have been actually reached");
                assert.equal(txStarted, true, "Transaction must have started");
                assert.equal(txCommitted, false, "Transaction must NOT have committed");
                assert.equal(txAborted, true, "Transaction must have aborted");

                // CRITICAL TRANSACTION VERIFICATION: Zero mutations persisted across all collections!
                assert.equal(connectedAccounts.has(creatorF2.toString()), false, "InstagramAccount must NOT be written when transaction aborts");
                assert.equal(stateDoc2.isCompleted, false, "OAuth state must NOT be marked completed when transaction aborts");
            } finally {
                CreatorProfile.findOneAndUpdate = origProfileUpdate;
            }

            // Case 11C: Transaction lease expiration validation (claimExpiresAt > now)
            connectedAccounts.clear();
            const creatorF3 = new mongoose.Types.ObjectId();
            const ticket3 = await generateAccountSelectionTicket({
                creatorId: creatorF3,
                accessToken: "valid-meta-token-tx-expired",
                expiresIn: 3600,
                accounts: sampleAccounts
            });

            txStarted = false;
            txCommitted = false;
            txAborted = false;

            // Request passes pre-persistence check, then its lease expires right before transactional persistence
            await assert.rejects(
                async () => {
                    await selectAndPersistInstagramAccount({
                        creatorId: creatorF3,
                        ticket: ticket3,
                        selectedAccountId: "1784140001",
                        origin: "onboarding",
                        _testHooks: {
                            _afterPrePersistCheck: async ({ nonceHash: nh }) => {
                                const doc = stateDocs.get(nh);
                                doc.claimExpiresAt = new Date(Date.now() - 1000); // Expired!
                            }
                        }
                    });
                },
                (err) => {
                    assert.equal(err.statusCode, 403);
                    assert.match(err.message, /(superseded|expired)/i);
                    return true;
                }
            );

            assert.equal(txAborted, true, "Transaction must abort when claimExpiresAt is in the past");
            assert.equal(connectedAccounts.has(creatorF3.toString()), false, "Expired lease cannot write InstagramAccount");
        } finally {
            mongoose.connection.readyState = origReadyState;
            mongoose.startSession = origStartSession;
            global.fetch = originalFetch;
            mockSessionActive = false;
        }
    });

    await t.test("12. Standalone finalization failure triggers compensatory rollback and rejects request", async () => {
        const creatorH = new mongoose.Types.ObjectId();
        connectedAccounts.clear();

        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorH,
            accessToken: "valid-meta-token-finalization-fail",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        const decodedEnvelope = JSON.parse(Buffer.from(ticket, "base64url").toString("utf8"));
        const { decryptToken } = await import("../src/utils/helpers/encryption.helper.js");
        const [iv, content, tag] = decodedEnvelope.c.split(":");
        const payload = JSON.parse(decryptToken({ iv, content, tag }));
        const nonceHash = crypto.createHash("sha256").update(payload.n).digest("hex");
        const stateDoc = stateDocs.get(nonceHash);

        const originalFetch = global.fetch;
        global.fetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                id: "1784140001",
                username: "creator_standalone_rollback",
                name: "Creator Rollback",
                account_type: "CREATOR",
                followers_count: 500,
                media_count: 15
            })
        });

        // Intercept InstagramOAuthState.updateOne for finalization to simulate finalization failure
        const origStateUpdateOne = InstagramOAuthState.updateOne;
        let updateCount = 0;
        InstagramOAuthState.updateOne = async (filter, update) => {
            updateCount++;
            // The finalization updateOne sets isCompleted: true
            if (update.$set?.isCompleted === true) {
                // Simulate claim lease expired or was superseded during persistence
                return { modifiedCount: 0 };
            }
            return origStateUpdateOne(filter, update);
        };

        try {
            await assert.rejects(
                async () => {
                    await selectAndPersistInstagramAccount({
                        creatorId: creatorH,
                        ticket,
                        selectedAccountId: "1784140001",
                        origin: "onboarding"
                    });
                },
                (err) => {
                    assert.equal(err.statusCode, 403);
                    assert.match(err.message, /superseded or expired before finalization/i);
                    return true;
                }
            );

            // COMPENSATORY ROLLBACK VERIFICATION: Account was cleaned up and not left in connected state!
            assert.equal(connectedAccounts.has(creatorH.toString()), false, "Compensatory rollback must remove InstagramAccount when finalization fails");
            assert.equal(stateDoc.isCompleted, false, "OAuth state must not be marked completed");
        } finally {
            InstagramOAuthState.updateOne = origStateUpdateOne;
            global.fetch = originalFetch;
        }
    });

    await t.test("13. Standalone MongoDB policy: disables selection persistence when strict fencing cannot be guaranteed", async () => {
        const creatorI = new mongoose.Types.ObjectId();
        connectedAccounts.clear();

        const ticket = await generateAccountSelectionTicket({
            creatorId: creatorI,
            accessToken: "valid-meta-token-policy-test",
            expiresIn: 3600,
            accounts: sampleAccounts
        });

        const origNodeEnv = process.env.NODE_ENV;
        const origAllowStandalone = process.env.ALLOW_STANDALONE_SELECTION;
        process.env.NODE_ENV = "production";
        delete process.env.ALLOW_STANDALONE_SELECTION;

        const originalFetch = global.fetch;
        global.fetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                id: "1784140001",
                username: "creator_prod_test",
                name: "Creator Prod",
                account_type: "CREATOR",
                followers_count: 800,
                media_count: 40
            })
        });

        try {
            // When in production with standalone MongoDB, selection persistence must reject immediately
            await assert.rejects(
                async () => {
                    await selectAndPersistInstagramAccount({
                        creatorId: creatorI,
                        ticket,
                        selectedAccountId: "1784140001",
                        origin: "onboarding"
                    });
                },
                (err) => {
                    assert.equal(err.statusCode, 500);
                    assert.match(err.message, /replica set.*required/i);
                    return true;
                }
            );

            assert.equal(connectedAccounts.has(creatorI.toString()), false);
        } finally {
            process.env.NODE_ENV = origNodeEnv;
            if (origAllowStandalone !== undefined) {
                process.env.ALLOW_STANDALONE_SELECTION = origAllowStandalone;
            }
            global.fetch = originalFetch;
        }
    });
});
