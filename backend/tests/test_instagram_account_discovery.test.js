import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { connectTestDatabase } from "../src/config/database.js";
import {
    fetchAssignedInstagramAccounts,
    fetchInstagramAccountProfile,
    processInstagramOAuthCallback,
    classifyMetaError,
    handleMetaGraphApiError,
    getConnectedInstagramAccount,
    persistInstagramConnection
} from "../src/modules/creator/instagram/instagram.service.js";
import { generateOAuthState } from "../src/modules/creator/instagram/instagramOAuthState.helper.js";
import InstagramOAuthState from "../src/modules/creator/instagram/instagramOAuthState.model.js";
import InstagramAccount from "../src/modules/creator/instagram/instagram.model.js";

console.log("===============================================================");
console.log("INSTAGRAM ACCOUNT DISCOVERY & PROFILE FETCH (STEP 5C) TEST SUITE");
console.log("===============================================================");

const originalFetch = global.fetch;
const originalEnv = { ...process.env };
let testCreatorId = null;

try {
    const mockToken = "EAAGmock_business_integration_system_user_token_12345";

    // -------------------------------------------------------------------------
    // 1. Account Discovery: Input Validation
    // -------------------------------------------------------------------------
    console.log("\n--- 1. Testing Discovery Input Validation ---");
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(""),
        /Access token is required/
    );
    await assert.rejects(
        () => fetchAssignedInstagramAccounts("   "),
        /Access token is required/
    );
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(null),
        /Access token is required/
    );
    console.log("✓ Empty, whitespace, and null access tokens rejected.");

    // -------------------------------------------------------------------------
    // 2. Account Discovery: Zero Accounts (data: [])
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Testing Zero Assigned Accounts ---");
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            data: []
        })
    });

    await assert.rejects(
        () => fetchAssignedInstagramAccounts(mockToken),
        /No connected Instagram Professional account found/
    );
    console.log("✓ Empty account array (data: []) rejected safely.");

    // -------------------------------------------------------------------------
    // 3. Account Discovery: Mixed Valid & Malformed Records (Must Reject Entire Response)
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing Malformed Account Records (No Silent Removal) ---");

    // A. One valid account + one account with empty username
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            data: [
                { id: "1784140001", username: "valid_account" },
                { id: "1784140002", username: "" } // Malformed!
            ]
        })
    });
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(mockToken),
        /Malformed Instagram account record/
    );

    // B. Account missing id
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            data: [
                { username: "valid_name" } // missing id!
            ]
        })
    });
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(mockToken),
        /Malformed Instagram account record/
    );

    // C. Account record is null / non-object
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            data: [
                { id: "1784140001", username: "valid_account" },
                null
            ]
        })
    });
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(mockToken),
        /Malformed Instagram account record/
    );

    // D. Account with non-string id
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            data: [
                { id: 1784140001, username: "valid_name" }
            ]
        })
    });
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(mockToken),
        /Malformed Instagram account record/
    );

    console.log("✓ Malformed account records strictly rejected (entire discovery fails; no silent removal).");

    // -------------------------------------------------------------------------
    // 4. Account Discovery: Exactly One Account
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Testing Exactly One Assigned Account ---");
    let capturedDiscoveryUrl = null;
    let capturedDiscoveryHeaders = null;

    global.fetch = async (url, options) => {
        capturedDiscoveryUrl = url;
        capturedDiscoveryHeaders = options.headers;
        return {
            ok: true,
            status: 200,
            json: async () => ({
                data: [
                    { id: "1784140001", username: "solo_creator" }
                ]
            })
        };
    };

    const singleResult = await fetchAssignedInstagramAccounts(mockToken);
    assert.strictEqual(singleResult.requiresSelection, false, "Must not require selection when exactly one account");
    assert.ok(singleResult.selectedAccount, "Single account must be selected");
    assert.strictEqual(singleResult.selectedAccount.id, "1784140001");
    assert.strictEqual(singleResult.selectedAccount.username, "solo_creator");
    assert.strictEqual(singleResult.accounts.length, 1);

    // Verify endpoint and Authorization Bearer header
    assert.strictEqual(
        capturedDiscoveryUrl,
        "https://graph.facebook.com/v27.0/me/assigned_instagram_accounts?fields=id,username"
    );
    assert.strictEqual(capturedDiscoveryHeaders.Authorization, `Bearer ${mockToken}`);
    console.log("✓ Exactly one account automatically selected; URL and Bearer token verified.");

    // -------------------------------------------------------------------------
    // 5. Account Discovery: Multiple Accounts (Mandatory Non-Arbitrary Selection)
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Testing Multiple Assigned Accounts ---");
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            data: [
                { id: "1784140001", username: "brand_account" },
                { id: "1784140002", username: "personal_creator_account" },
                { id: "1784140003", username: "agency_account" }
            ]
        })
    });

    const multiResult = await fetchAssignedInstagramAccounts(mockToken);
    assert.strictEqual(multiResult.requiresSelection, true, "Must flag requiresSelection: true");
    assert.strictEqual(multiResult.selectedAccount, null, "MUST NOT arbitrarily select data[0]!");
    assert.strictEqual(multiResult.accounts.length, 3);
    assert.strictEqual(multiResult.accounts[0].username, "brand_account");
    assert.strictEqual(multiResult.accounts[1].username, "personal_creator_account");
    assert.strictEqual(multiResult.accounts[2].username, "agency_account");
    console.log("✓ Multiple accounts handled safely: requiresSelection is true, data[0] is NOT auto-selected.");

    // -------------------------------------------------------------------------
    // 6. Account Discovery: Meta API Errors & Network Failures
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Testing Discovery Meta API & Network Failures ---");

    // A. Meta 401 Unauthorized / Invalid Token
    global.fetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({
            error: {
                message: "Invalid OAuth access token.",
                type: "OAuthException",
                code: 190
            }
        })
    });
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(mockToken),
        /Meta API rejected the request to discover assigned Instagram accounts/
    );

    // B. Meta 403 Forbidden / Missing Permissions
    global.fetch = async () => ({
        ok: false,
        status: 403,
        json: async () => ({
            error: {
                message: "(#10) Application does not have capability for this action.",
                type: "OAuthException",
                code: 10
            }
        })
    });
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(mockToken),
        /Meta API rejected the request to discover assigned Instagram accounts/
    );

    // C. Network Failure
    global.fetch = async () => {
        throw new Error("ETIMEDOUT 157.240.22.35");
    };
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(mockToken),
        /Network error occurred while discovering assigned Instagram accounts/
    );

    // D. Malformed non-JSON
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => {
            throw new SyntaxError("Unexpected token < in JSON");
        }
    });
    await assert.rejects(
        () => fetchAssignedInstagramAccounts(mockToken),
        /Received malformed or non-JSON response/
    );
    console.log("✓ Discovery API 401, 403, network timeout, and malformed JSON errors rejected safely.");

    // -------------------------------------------------------------------------
    // 7. Profile Fetch: Input Validation & ID Parity
    // -------------------------------------------------------------------------
    console.log("\n--- 7. Testing Profile Fetch Input Validation & ID Parity ---");
    await assert.rejects(
        () => fetchInstagramAccountProfile("", mockToken),
        /Instagram account ID must be a non-empty string/
    );
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", ""),
        /Access token is required/
    );

    // Mismatched response ID test
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "9999999999", // Different ID from requested!
            username: "hacker_account",
            followers_count: 500,
            media_count: 10
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Profile response ID does not match requested Instagram account ID/
    );
    console.log("✓ Profile ID parity mismatch strictly rejected.");

    // -------------------------------------------------------------------------
    // 8. Profile Fetch: Strict Type-Safe Metric Validations
    // -------------------------------------------------------------------------
    console.log("\n--- 8. Testing Strict Type-Safe Profile Metric Validations ---");

    // Missing followers_count
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_valid",
            media_count: 10
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Invalid followers_count/
    );

    // Numeric string followers_count (MUST NOT be coerced)
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_valid",
            followers_count: "48500", // numeric string!
            media_count: 10
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Invalid followers_count/
    );

    // Non-numeric string followers_count
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_valid",
            followers_count: "one_million",
            media_count: 10
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Invalid followers_count/
    );

    // Boolean followers_count (true must NOT coerce to 1)
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_valid",
            followers_count: true,
            media_count: 10
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Invalid followers_count/
    );

    // Negative followers_count
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_valid",
            followers_count: -5,
            media_count: 10
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Invalid followers_count/
    );

    // Missing media_count
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_valid",
            followers_count: 100
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Invalid media_count/
    );

    // Numeric string media_count (MUST NOT be coerced)
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_valid",
            followers_count: 100,
            media_count: "142" // numeric string!
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Invalid media_count/
    );

    // Boolean media_count
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_valid",
            followers_count: 100,
            media_count: false
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Invalid media_count/
    );

    // Negative media_count
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_valid",
            followers_count: 100,
            media_count: -1
        })
    });
    await assert.rejects(
        () => fetchInstagramAccountProfile("1784140001", mockToken),
        /Invalid media_count/
    );
    console.log("✓ Strict followers_count & media_count validations passed (strings, booleans, negatives rejected).");

    // -------------------------------------------------------------------------
    // 9. Profile Fetch: Valid Zero Metrics
    // -------------------------------------------------------------------------
    console.log("\n--- 9. Testing Valid Zero Metrics ---");
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "fresh_new_creator",
            followers_count: 0,
            media_count: 0
        })
    });

    const zeroProfile = await fetchInstagramAccountProfile("1784140001", mockToken);
    assert.strictEqual(zeroProfile.followersCount, 0, "followersCount of 0 must be accepted");
    assert.strictEqual(zeroProfile.mediaCount, 0, "mediaCount of 0 must be accepted");
    assert.strictEqual(zeroProfile.name, "", "Missing optional name defaults to empty string");
    assert.strictEqual(zeroProfile.profilePictureUrl, "", "Missing optional profilePictureUrl defaults to empty string");
    console.log("✓ Valid zero metrics (followers_count: 0, media_count: 0) accepted successfully.");

    // -------------------------------------------------------------------------
    // 10. Profile Fetch: Successful Retrieval & Model Compatibility
    // -------------------------------------------------------------------------
    console.log("\n--- 10. Testing Profile Retrieval & Model Compatibility ---");
    let capturedProfileUrl = null;
    let capturedProfileHeaders = null;

    global.fetch = async (url, options) => {
        capturedProfileUrl = url;
        capturedProfileHeaders = options.headers;
        return {
            ok: true,
            status: 200,
            json: async () => ({
                id: "1784140001",
                username: "top_creator_official",
                name: "Alex Designer",
                profile_picture_url: "https://scontent.cdninstagram.com/profile.jpg",
                followers_count: 48500,
                media_count: 142
            })
        };
    };

    const profile = await fetchInstagramAccountProfile("1784140001", mockToken);

    // Verify all 6 required fields
    assert.strictEqual(profile.instagramUserId, "1784140001");
    assert.strictEqual(profile.username, "top_creator_official");
    assert.strictEqual(profile.name, "Alex Designer");
    assert.strictEqual(profile.profilePictureUrl, "https://scontent.cdninstagram.com/profile.jpg");
    assert.strictEqual(profile.followersCount, 48500);
    assert.strictEqual(profile.mediaCount, 142);

    // Verify model compatibility with InstagramAccount schema paths
    const schema = InstagramAccount.schema;
    assert.ok(schema.path("instagramUserId"), "InstagramAccount model must have instagramUserId");
    assert.ok(schema.path("username"), "InstagramAccount model must have username");
    assert.ok(schema.path("profilePictureUrl"), "InstagramAccount model must have profilePictureUrl");
    assert.ok(schema.path("followersCount"), "InstagramAccount model must have followersCount");
    assert.ok(schema.path("mediaCount"), "InstagramAccount model must have mediaCount");

    // Verify Graph API URL & Bearer token
    assert.strictEqual(
        capturedProfileUrl,
        "https://graph.facebook.com/v27.0/1784140001?fields=id,username,name,profile_picture_url,followers_count,media_count"
    );
    assert.strictEqual(capturedProfileHeaders.Authorization, `Bearer ${mockToken}`);
    assert.strictEqual(profile.accountType, "", "Missing account_type defaults to empty string");
    console.log("✓ Profile successfully fetched with verified field parity and InstagramAccount model compatibility.");

    // -------------------------------------------------------------------------
    // 10B. Profile Fetch: Account Type Normalization (BUSINESS, MEDIA_CREATOR, CREATOR, Unknown, Missing)
    // -------------------------------------------------------------------------
    console.log("\n--- 10B. Testing Account Type Parsing & Normalization ---");

    // Case 1: BUSINESS
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "biz_account",
            account_type: "BUSINESS",
            followers_count: 1000,
            media_count: 50
        })
    });
    const bizProfile = await fetchInstagramAccountProfile("1784140001", mockToken);
    assert.strictEqual(bizProfile.accountType, "BUSINESS", "BUSINESS must normalize to BUSINESS");

    // Case 2: MEDIA_CREATOR
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "media_creator_account",
            account_type: "MEDIA_CREATOR",
            followers_count: 2000,
            media_count: 80
        })
    });
    const mediaCreatorProfile = await fetchInstagramAccountProfile("1784140001", mockToken);
    assert.strictEqual(mediaCreatorProfile.accountType, "CREATOR", "MEDIA_CREATOR must normalize to CREATOR");

    // Case 3: CREATOR
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "creator_account",
            account_type: "CREATOR",
            followers_count: 3000,
            media_count: 90
        })
    });
    const creatorProfile = await fetchInstagramAccountProfile("1784140001", mockToken);
    assert.strictEqual(creatorProfile.accountType, "CREATOR", "CREATOR must normalize to CREATOR");

    // Case 4: Missing account_type
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "missing_type_account",
            followers_count: 4000,
            media_count: 100
        })
    });
    const missingTypeProfile = await fetchInstagramAccountProfile("1784140001", mockToken);
    assert.strictEqual(missingTypeProfile.accountType, "", "Missing account_type must default to empty string");

    // Case 5: Null account_type
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "null_type_account",
            account_type: null,
            followers_count: 5000,
            media_count: 110
        })
    });
    const nullTypeProfile = await fetchInstagramAccountProfile("1784140001", mockToken);
    assert.strictEqual(nullTypeProfile.accountType, "", "Null account_type must default to empty string");

    // Case 6: Unknown account_type
    global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
            id: "1784140001",
            username: "unknown_type_account",
            account_type: "PERSONAL",
            followers_count: 6000,
            media_count: 120
        })
    });
    const unknownTypeProfile = await fetchInstagramAccountProfile("1784140001", mockToken);
    assert.strictEqual(unknownTypeProfile.accountType, "", "Unknown account_type must default to empty string");
    console.log("✓ Account type normalization passed: BUSINESS, MEDIA_CREATOR -> CREATOR, CREATOR -> CREATOR, missing/null/unknown -> empty string.");

    // -------------------------------------------------------------------------
    // 11. Integration Flow: processInstagramOAuthCallback with Discovery & Profile
    // -------------------------------------------------------------------------
    console.log("\n--- 11. Testing End-to-End Callback Integration ---");
    await connectTestDatabase();
    console.log("✓ Connected to isolated MongoDB test database");

    testCreatorId = new mongoose.Types.ObjectId();
    const testSecretToken = "EAAGtest_confidential_token_xyz_step5c";

    // Pre-clean test records
    await InstagramOAuthState.deleteMany({ creator: testCreatorId });
    await InstagramAccount.deleteMany({ $or: [{ creator: testCreatorId }, { instagramUserId: "1784140001" }] });

    // Scenario A: Exactly 1 account -> completes discovery & profile fetch -> success
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
                    data: [{ id: "1784140001", username: "solo_creator" }]
                })
            };
        }
        return {
            ok: true,
            status: 200,
            json: async () => ({
                id: "1784140001",
                username: "solo_creator",
                name: "Solo Creator",
                profile_picture_url: "https://example.com/solo.jpg",
                followers_count: 25000,
                media_count: 50
            })
        };
    };

    const validState1 = await generateOAuthState(testCreatorId);
    const resultSingle = await processInstagramOAuthCallback({
        code: "valid_code_single",
        state: validState1
    });

    assert.strictEqual(resultSingle.success, true);
    assert.strictEqual(resultSingle.creatorId, testCreatorId.toString());
    assert.strictEqual(resultSingle.accessToken, undefined, "accessToken must NOT be returned in callback result");
    assert.ok(resultSingle.profile, "Profile data must be returned internally");
    assert.strictEqual(resultSingle.profile.instagramUserId, "1784140001");
    assert.strictEqual(resultSingle.profile.username, "solo_creator");
    assert.strictEqual(resultSingle.profile.accountType, "", "Profile accountType must default to empty string when not provided by Meta");
    assert.strictEqual(resultSingle.profile.followersCount, 25000);
    assert.strictEqual(resultSingle.profile.mediaCount, 50);

    // Verify persistence in MongoDB
    const persistedAccount = await InstagramAccount.findOne({ creator: testCreatorId });
    assert.ok(persistedAccount, "Account must be persisted in MongoDB");
    assert.strictEqual(persistedAccount.accountType, "", "Persisted account must have accountType saved as empty string in MongoDB");

    // Secrets hygiene
    assert.ok(!resultSingle.redirectUrl.includes(testSecretToken), "Token must NEVER leak in redirectUrl");
    const expectedFrontend = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
    assert.strictEqual(
        resultSingle.redirectUrl,
        `${expectedFrontend}/creator/settings?instagram=success&username=solo_creator`,
        "Must redirect strictly to ?instagram=success upon persistence"
    );
    console.log("✓ Single account flow: discovery, profile fetch and persistence completed with strict ?instagram=success.");

    // Scenario B: Multiple accounts -> NOT reported as a completed connection!
    console.log("Testing: Multiple accounts integration (must NOT report completed connection)...");
    global.fetch = async (url) => {
        const urlStr = typeof url === "string" ? url : url.toString();
        if (urlStr.includes("/oauth/access_token")) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    access_token: testSecretToken,
                    token_type: "bearer"
                })
            };
        }
        if (urlStr.includes("/assigned_instagram_accounts")) {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    data: [
                        { id: "1784140001", username: "account_one" },
                        { id: "1784140002", username: "account_two" }
                    ]
                })
            };
        }
        throw new Error("Profile should NOT be fetched when multiple accounts require selection!");
    };

    const validState2 = await generateOAuthState(testCreatorId);
    const resultMulti = await processInstagramOAuthCallback({
        code: "valid_code_multi",
        state: validState2
    });

    // Verify multiple-account callback semantics: MUST NOT report completed connection and MUST NOT leak accessToken
    assert.strictEqual(resultMulti.success, false, "Multiple accounts must NOT mark success as true");
    assert.strictEqual(resultMulti.completed, false, "Multiple accounts must NOT be reported as completed");
    assert.strictEqual(resultMulti.requiresSelection, true, "Must return requiresSelection: true");
    assert.strictEqual(resultMulti.accessToken, undefined, "accessToken must NOT be returned in multiple-accounts result");
    assert.strictEqual(resultMulti.accounts.length, 2);
    assert.strictEqual(resultMulti.profile, undefined, "Profile must not be arbitrarily fetched");
    assert.ok(resultMulti.redirectUrl.includes("instagram=multiple_accounts"));
    console.log("✓ Multiple accounts integration: connection NOT completed (requiresSelection: true, no accessToken exposed).");

    // -------------------------------------------------------------------------
    // 12. Phase 2: Meta Graph API Error Classification & Token Invalidation
    // -------------------------------------------------------------------------
    console.log("\n--- 12. Testing Meta Error Classification & Token Invalidation ---");

    // 12A. classifyMetaError Unit Checks
    // Code 190 without subcode
    const generic190 = classifyMetaError({ code: 190, message: "Invalid OAuth access token." });
    assert.strictEqual(generic190.isInvalidToken, true);
    assert.strictEqual(generic190.code, 190);
    assert.ok(generic190.userFriendlyReason.includes("expired or is no longer valid"));

    // Code 190 Subcode 458 (Deauthorized/Revoked)
    const sub458 = classifyMetaError({ code: 190, error_subcode: 458, message: "User revoked" });
    assert.strictEqual(sub458.isInvalidToken, true);
    assert.strictEqual(sub458.subcode, 458);
    assert.ok(sub458.userFriendlyReason.includes("revoked or the application was uninstalled"));

    // Code 190 Subcode 460 (Password changed/session reset)
    const sub460 = classifyMetaError({ code: 190, error_subcode: 460, message: "Password reset" });
    assert.strictEqual(sub460.isInvalidToken, true);
    assert.strictEqual(sub460.subcode, 460);
    assert.ok(sub460.userFriendlyReason.includes("session was reset or password was changed"));

    // Code 190 Subcode 463 (Token expired)
    const sub463 = classifyMetaError({ code: 190, error_subcode: 463, message: "Session expired" });
    assert.strictEqual(sub463.isInvalidToken, true);
    assert.strictEqual(sub463.subcode, 463);
    assert.ok(sub463.userFriendlyReason.includes("access token has expired"));

    // Code 190 Subcode 467 (Invalidated/Logged out)
    const sub467 = classifyMetaError({ code: 190, error_subcode: 467, message: "Logged out" });
    assert.strictEqual(sub467.isInvalidToken, true);
    assert.strictEqual(sub467.subcode, 467);
    assert.ok(sub467.userFriendlyReason.includes("invalidated or user logged out"));

    // Code 10: Permission error MUST NOT be classified as invalid token
    const code10 = classifyMetaError({ code: 10, message: "Application does not have capability" });
    assert.strictEqual(code10.isInvalidToken, false);
    assert.strictEqual(code10.code, 10);
    assert.ok(code10.userFriendlyReason.includes("does not have permission"));

    // Code 100: Parameter error MUST NOT be classified as invalid token
    const code100 = classifyMetaError({ code: 100, message: "Tried accessing nonexisting field" });
    assert.strictEqual(code100.isInvalidToken, false);
    assert.strictEqual(code100.code, 100);

    // Null/undefined error
    const nullError = classifyMetaError(null);
    assert.strictEqual(nullError.isInvalidToken, false);

    console.log("✓ Meta error classification passed: Code 190 & subcodes (458, 460, 463, 467) detected; Code 10 & 100 NOT marked invalid.");

    // 12B. handleMetaGraphApiError: Invalidation updates document status to EXPIRED
    const testPhase2Creator = new mongoose.Types.ObjectId();
    const testPhase2IgId = "17841499999999999";
    await InstagramAccount.deleteMany({ creator: testPhase2Creator });

    await InstagramAccount.create({
        creator: testPhase2Creator,
        instagramUserId: testPhase2IgId,
        username: "phase2_creator",
        followersCount: 1000,
        mediaCount: 10,
        encryptedAccessToken: { iv: "a".repeat(24), content: "b".repeat(32), tag: "c".repeat(32) },
        status: "CONNECTED",
        disconnectionReason: ""
    });

    // Verify initial status is CONNECTED
    const initialAccount = await getConnectedInstagramAccount(testPhase2Creator);
    assert.strictEqual(initialAccount.isConnected, true);
    assert.strictEqual(initialAccount.account.status, "CONNECTED");
    assert.strictEqual(initialAccount.account.disconnectionReason, "");

    // Simulate Code 10 permission error -> status MUST NOT change
    await handleMetaGraphApiError(
        { code: 10, message: "(#10) Missing capability" },
        { creatorId: testPhase2Creator, operation: "testPermissionCheck" }
    );
    const afterCode10Account = await getConnectedInstagramAccount(testPhase2Creator);
    assert.strictEqual(afterCode10Account.isConnected, true);
    assert.strictEqual(afterCode10Account.account.status, "CONNECTED", "Status must remain CONNECTED on Code 10");
    assert.strictEqual(afterCode10Account.account.disconnectionReason, "", "Reason must remain empty on Code 10");

    // Simulate Code 100 parameter error -> status MUST NOT change
    await handleMetaGraphApiError(
        { code: 100, message: "Invalid field" },
        { creatorId: testPhase2Creator, operation: "testParamCheck" }
    );
    const afterCode100Account = await getConnectedInstagramAccount(testPhase2Creator);
    assert.strictEqual(afterCode100Account.isConnected, true);
    assert.strictEqual(afterCode100Account.account.status, "CONNECTED", "Status must remain CONNECTED on Code 100");

    // Simulate Code 190 token invalidation -> status MUST update to EXPIRED
    await handleMetaGraphApiError(
        { code: 190, error_subcode: 463, message: "Session expired" },
        { creatorId: testPhase2Creator, operation: "testProfileSync" }
    );
    const afterCode190Account = await getConnectedInstagramAccount(testPhase2Creator);
    assert.strictEqual(afterCode190Account.isConnected, false, "isConnected must be false when EXPIRED");
    assert.strictEqual(afterCode190Account.account.status, "EXPIRED", "Status must be EXPIRED on Code 190");
    assert.ok(afterCode190Account.account.disconnectionReason.includes("access token has expired"));

    // Cleanup Phase 2 test records
    await InstagramAccount.deleteMany({ creator: testPhase2Creator });
    console.log("✓ handleMetaGraphApiError passed: Code 190 marks document EXPIRED; Code 10 & Code 100 retain CONNECTED status.");

} finally {
    global.fetch = originalFetch;
    try {
        if (mongoose.connection.readyState === 1) {
            await InstagramOAuthState.deleteMany({ creator: testCreatorId });
            await InstagramAccount.deleteMany({ $or: [{ creator: testCreatorId }, { instagramUserId: "1784140001" }] });
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
console.log("ALL STEP 5C DISCOVERY & PROFILE FETCH TESTS PASSED (100%)!");
console.log("===============================================================");
