import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });
dotenv.config({ path: "./.env" });

import { connectTestDatabase } from "../src/config/database.js";
import { fetchRecentInstagramMedia } from "../src/modules/creator/instagram/instagram.service.js";
import InstagramAccount from "../src/modules/creator/instagram/instagram.model.js";

console.log("===============================================================");
console.log("INSTAGRAM MEDIA FETCHING (PHASE 1) TEST SUITE");
console.log("===============================================================");

const originalFetch = global.fetch;
let testCreatorId = null;

try {
    const mockToken = "EAAGmock_valid_access_token_12345";
    const mockAccountId = "17841400000000001";

    // -------------------------------------------------------------------------
    // 0. Input Validation Tests
    // -------------------------------------------------------------------------
    console.log("\n--- 0. Testing Input Validation ---");
    await assert.rejects(
        () => fetchRecentInstagramMedia("", mockToken),
        /Instagram account ID must be a non-empty string/
    );
    await assert.rejects(
        () => fetchRecentInstagramMedia(mockAccountId, ""),
        /Access token is required to fetch Instagram media/
    );
    console.log("✓ Empty account ID and empty access token properly rejected.");

    // -------------------------------------------------------------------------
    // Test 1: 12 eligible posts found in first page (early exit, 1 request)
    // -------------------------------------------------------------------------
    console.log("\n--- Test 1: 12 eligible posts in first page ---");
    let fetchCountTest1 = 0;
    global.fetch = async (url) => {
        fetchCountTest1++;
        assert.ok(url.startsWith("https://graph.facebook.com/v27.0/17841400000000001/media"));
        const data = Array.from({ length: 20 }, (_, i) => ({
            id: `post_${i + 1}`,
            media_type: "IMAGE",
            like_count: (i + 1) * 10,
            comments_count: i + 1,
            timestamp: "2026-11-20T10:00:00+0000"
        }));
        return {
            ok: true,
            status: 200,
            json: async () => ({
                data,
                paging: { cursors: { after: "cursor_page_1" } }
            })
        };
    };

    const res1 = await fetchRecentInstagramMedia(mockAccountId, mockToken);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.eligiblePosts.length, 12, "Should return exactly 12 eligible posts");
    assert.strictEqual(res1.pagesFetched, 1, "Should fetch only 1 page");
    assert.strictEqual(fetchCountTest1, 1, "Should execute exactly 1 HTTP request");
    assert.strictEqual(res1.eligiblePosts[0].id, "post_1");
    assert.strictEqual(res1.eligiblePosts[11].id, "post_12");
    console.log("✓ Test 1 Passed: 12 eligible posts extracted from first page with early exit (1 request).");

    // -------------------------------------------------------------------------
    // Test 2: First page has 5 eligible, second page has 7 eligible (multi-page traversal)
    // -------------------------------------------------------------------------
    console.log("\n--- Test 2: First page has 5, second page has 7 eligible posts ---");
    let fetchCountTest2 = 0;
    const requestedUrlsTest2 = [];
    global.fetch = async (url) => {
        fetchCountTest2++;
        requestedUrlsTest2.push(url);
        if (fetchCountTest2 === 1) {
            assert.ok(!url.includes("after="), "First request should not have after cursor");
            const data = Array.from({ length: 5 }, (_, i) => ({
                id: `page1_post_${i + 1}`,
                media_type: "IMAGE",
                like_count: 50,
                comments_count: 5,
                timestamp: "2026-11-19T10:00:00+0000"
            }));
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    data,
                    paging: { cursors: { after: "cursor_after_p1" } }
                })
            };
        } else {
            assert.ok(url.includes("after=cursor_after_p1"), "Second request must use paging.cursors.after");
            const data = Array.from({ length: 10 }, (_, i) => ({
                id: `page2_post_${i + 1}`,
                media_type: "VIDEO",
                like_count: 100,
                comments_count: 10,
                timestamp: "2026-11-18T10:00:00+0000"
            }));
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    data,
                    paging: { cursors: { after: "cursor_after_p2" } }
                })
            };
        }
    };

    const res2 = await fetchRecentInstagramMedia(mockAccountId, mockToken);
    assert.strictEqual(res2.eligiblePosts.length, 12, "Should accumulate 5 + 7 = 12 eligible posts");
    assert.strictEqual(res2.pagesFetched, 2, "Should fetch 2 pages");
    assert.strictEqual(fetchCountTest2, 2, "Should execute exactly 2 HTTP requests");
    assert.strictEqual(res2.eligiblePosts[0].id, "page1_post_1");
    assert.strictEqual(res2.eligiblePosts[4].id, "page1_post_5");
    assert.strictEqual(res2.eligiblePosts[5].id, "page2_post_1");
    assert.strictEqual(res2.eligiblePosts[11].id, "page2_post_7");
    console.log("✓ Test 2 Passed: 5 posts from page 1 + 7 posts from page 2 = 12 eligible posts.");

    // -------------------------------------------------------------------------
    // Test 3: 50 posts inspected across 2 pages, but fewer than 12 eligible (returns available)
    // -------------------------------------------------------------------------
    console.log("\n--- Test 3: 50 posts inspected but only 8 eligible (returns available 8) ---");
    let fetchCountTest3 = 0;
    global.fetch = async () => {
        fetchCountTest3++;
        // Each page has 25 posts, but only 4 have valid metrics
        const data = Array.from({ length: 25 }, (_, i) => ({
            id: `p${fetchCountTest3}_item_${i + 1}`,
            media_type: "IMAGE",
            like_count: i < 4 ? 20 : null, // only first 4 eligible
            comments_count: i < 4 ? 2 : undefined
        }));
        return {
            ok: true,
            status: 200,
            json: async () => ({
                data,
                paging: { cursors: { after: `cursor_after_${fetchCountTest3}` } }
            })
        };
    };

    const res3 = await fetchRecentInstagramMedia(mockAccountId, mockToken);
    assert.strictEqual(res3.eligiblePosts.length, 8, "Should return all available 8 eligible posts");
    assert.strictEqual(res3.inspectedCount, 50, "Should inspect exactly 50 posts (25 + 25)");
    assert.strictEqual(res3.pagesFetched, 2, "Should not exceed 2 pages");
    assert.strictEqual(fetchCountTest3, 2, "Should execute exactly 2 HTTP requests");
    console.log("✓ Test 3 Passed: Inspected 50 posts, bounded at 2 pages, returned all 8 available eligible posts.");

    // -------------------------------------------------------------------------
    // Test 4: Missing or invalid metrics posts properly excluded
    // -------------------------------------------------------------------------
    console.log("\n--- Test 4: Missing/invalid metrics posts exclusion ---");
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            data: [
                { id: "valid_1", media_type: "IMAGE", like_count: 10, comments_count: 1 },
                { id: "invalid_no_likes", media_type: "IMAGE", like_count: null, comments_count: 5 },
                { id: "invalid_neg_likes", media_type: "IMAGE", like_count: -1, comments_count: 2 },
                { id: "invalid_no_comments", media_type: "IMAGE", like_count: 15, comments_count: undefined },
                { id: "invalid_neg_comments", media_type: "IMAGE", like_count: 20, comments_count: -5 },
                { id: "   ", media_type: "IMAGE", like_count: 5, comments_count: 1 }, // empty ID
                { id: "valid_2", media_type: "CAROUSEL_ALBUM", like_count: 30, comments_count: 0 } // valid 0 comments
            ]
        })
    });

    const res4 = await fetchRecentInstagramMedia(mockAccountId, mockToken);
    assert.strictEqual(res4.eligiblePosts.length, 2, "Only valid_1 and valid_2 should qualify");
    assert.strictEqual(res4.eligiblePosts[0].id, "valid_1");
    assert.strictEqual(res4.eligiblePosts[1].id, "valid_2");
    assert.strictEqual(res4.eligiblePosts[1].commentsCount, 0, "0 comments is non-negative and valid");
    console.log("✓ Test 4 Passed: Posts with null, negative, or missing metrics excluded; 0 comments allowed.");

    // -------------------------------------------------------------------------
    // Test 5A: Valid empty data: [] response
    // -------------------------------------------------------------------------
    console.log("\n--- Test 5A: Valid empty data: [] response ---");
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            data: []
        })
    });

    const res5A = await fetchRecentInstagramMedia(mockAccountId, mockToken);
    assert.strictEqual(res5A.success, true);
    assert.strictEqual(res5A.eligiblePosts.length, 0, "Should return empty array");
    assert.strictEqual(res5A.pagesFetched, 1);
    console.log("✓ Test 5A Passed: Valid empty data: [] returns empty array with success: true.");

    // -------------------------------------------------------------------------
    // Test 5B: Malformed response missing 'data' array throws error
    // -------------------------------------------------------------------------
    console.log("\n--- Test 5B: Malformed response missing 'data' array ---");
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            unexpected_field: "no_data_array_here"
        })
    });

    await assert.rejects(
        () => fetchRecentInstagramMedia(mockAccountId, mockToken),
        /Invalid or malformed media payload received from Meta Graph API: expected 'data' array/
    );
    console.log("✓ Test 5B Passed: Missing 'data' array throws malformed payload error.");

    // -------------------------------------------------------------------------
    // Test 5C: Malformed response where 'data' is not an array throws error
    // -------------------------------------------------------------------------
    console.log("\n--- Test 5C: Malformed response where 'data' is string/object instead of array ---");
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            data: "not an array"
        })
    });

    await assert.rejects(
        () => fetchRecentInstagramMedia(mockAccountId, mockToken),
        /Invalid or malformed media payload received from Meta Graph API: expected 'data' array/
    );
    console.log("✓ Test 5C Passed: Non-array 'data' property throws malformed payload error.");

    // -------------------------------------------------------------------------
    // Test 5D: Malformed non-JSON response throws error
    // -------------------------------------------------------------------------
    console.log("\n--- Test 5D: Malformed non-JSON response ---");
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => {
            throw new Error("Unexpected token < in JSON");
        }
    });

    await assert.rejects(
        () => fetchRecentInstagramMedia(mockAccountId, mockToken),
        /Received malformed or non-JSON response while fetching Instagram media/
    );
    console.log("✓ Test 5D Passed: Non-JSON body throws malformed response error.");

    // -------------------------------------------------------------------------
    // Test 6: Meta API Error (Non-190, e.g. Code 100 Bad Request)
    // -------------------------------------------------------------------------
    console.log("\n--- Test 6: Meta API Error (Code 100) ---");
    global.fetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({
            error: {
                message: "Invalid field parameter requested",
                type: "OAuthException",
                code: 100,
                fbtrace_id: "trace_err_100"
            }
        })
    });

    await assert.rejects(
        () => fetchRecentInstagramMedia(mockAccountId, mockToken),
        (err) => {
            assert.strictEqual(err.metaCode, 100);
            assert.strictEqual(err.isInvalidToken, false);
            return true;
        }
    );
    console.log("✓ Test 6 Passed: Code 100 rejects with metaCode: 100 and isInvalidToken: false.");

    // -------------------------------------------------------------------------
    // Test 7: Meta Code 190 (Token Invalidation marks account EXPIRED)
    // -------------------------------------------------------------------------
    console.log("\n--- Test 7: Meta Code 190 Invalidation marks account EXPIRED ---");
    await connectTestDatabase();
    testCreatorId = new mongoose.Types.ObjectId();

    await InstagramAccount.create({
        creator: testCreatorId,
        instagramUserId: mockAccountId,
        username: "test_ig_user",
        encryptedAccessToken: { iv: "iv", content: "c", tag: "t" },
        status: "CONNECTED",
        disconnectionReason: ""
    });

    global.fetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({
            error: {
                message: "Error validating access token: The session has been invalidated",
                type: "OAuthException",
                code: 190,
                error_subcode: 463,
                fbtrace_id: "trace_code_190"
            }
        })
    });

    await assert.rejects(
        () => fetchRecentInstagramMedia(mockAccountId, mockToken, {
            creatorId: testCreatorId,
            instagramAccountId: mockAccountId
        }),
        (err) => {
            assert.strictEqual(err.metaCode, 190);
            assert.strictEqual(err.isInvalidToken, true);
            return true;
        }
    );

    const expiredAccount = await InstagramAccount.findOne({ creator: testCreatorId }).lean();
    assert.strictEqual(expiredAccount.status, "EXPIRED", "Account status must be updated to EXPIRED");
    assert.ok(expiredAccount.disconnectionReason.length > 0, "disconnectionReason must be populated");
    console.log("✓ Test 7 Passed: Code 190 automatically marked account as EXPIRED in database with disconnectionReason.");

    // -------------------------------------------------------------------------
    // Test 8: Network failure leaves database metrics unchanged
    // -------------------------------------------------------------------------
    console.log("\n--- Test 8: Network failure preserves database metrics ---");
    const testCreatorIdNetwork = new mongoose.Types.ObjectId();
    await InstagramAccount.create({
        creator: testCreatorIdNetwork,
        instagramUserId: "ig_network_test",
        username: "network_user",
        encryptedAccessToken: { iv: "iv", content: "c", tag: "t" },
        followersCount: 10000,
        engagementRate: 4.5,
        status: "CONNECTED"
    });

    global.fetch = async () => {
        throw new TypeError("fetch failed: network socket disconnected");
    };

    await assert.rejects(
        () => fetchRecentInstagramMedia("ig_network_test", mockToken, { creatorId: testCreatorIdNetwork }),
        /Network error occurred while fetching Instagram media/
    );

    const netAccount = await InstagramAccount.findOne({ creator: testCreatorIdNetwork }).lean();
    assert.strictEqual(netAccount.status, "CONNECTED", "Status must remain CONNECTED on network failure");
    assert.strictEqual(netAccount.engagementRate, 4.5, "Engagement rate must remain unchanged");
    assert.strictEqual(netAccount.followersCount, 10000, "Followers count must remain unchanged");
    await InstagramAccount.deleteMany({ creator: testCreatorIdNetwork });
    console.log("✓ Test 8 Passed: Network failure throws error without touching database metrics or status.");

    // -------------------------------------------------------------------------
    // Test 9: Maximum 2 requests hard cap verification
    // -------------------------------------------------------------------------
    console.log("\n--- Test 9: Hard cap at 2 requests (never fetches page 3) ---");
    let fetchCountTest9 = 0;
    global.fetch = async () => {
        fetchCountTest9++;
        // Returns only 1 post per page, with infinite cursors
        return {
            ok: true,
            status: 200,
            json: async () => ({
                data: [{ id: `post_p${fetchCountTest9}`, like_count: 10, comments_count: 2 }],
                paging: { cursors: { after: `cursor_next_${fetchCountTest9}` } }
            })
        };
    };

    const res9 = await fetchRecentInstagramMedia(mockAccountId, mockToken);
    assert.strictEqual(fetchCountTest9, 2, "Fetch count must strictly not exceed MAX_PAGES (2)");
    assert.strictEqual(res9.pagesFetched, 2);
    assert.strictEqual(res9.eligiblePosts.length, 2);
    console.log("✓ Test 9 Passed: Even with continuous cursors, fetching strictly halts after 2 requests.");

    console.log("\n=================================================");
    console.log("ALL PHASE 1 MEDIA FETCHING TESTS PASSED (100%)");
    console.log("=================================================");
} finally {
    global.fetch = originalFetch;
    if (testCreatorId) {
        await InstagramAccount.deleteMany({ creator: testCreatorId });
    }
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
}
