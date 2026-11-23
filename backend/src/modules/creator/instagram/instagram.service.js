import mongoose from "mongoose";
import createApiError from "../../../utils/ApiError.js";
import {
    generateOAuthState,
    consumeOAuthState
} from "./instagramOAuthState.helper.js";
import { encryptToken, decryptToken } from "../../../utils/helpers/encryption.helper.js";
import InstagramAccount from "./instagram.model.js";
import CreatorProfile from "../profile/profile.model.js";

// Helper to determine the configured frontend base URL without trailing slashes.
const getFrontendBaseUrl = () => {
    return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
};

/**
 * Classifies a Meta Graph API error payload into a standardized diagnostic object.
 * Identifies token invalidation (Code 190) and categorizes known subcodes without exposing secrets.
 *
 * @param {Object} errorPayload - Raw error object from Meta response (data.error or response body).
 * @returns {Object} Normalized classification with isInvalidToken, code, subcode, and userFriendlyReason.
 */
const classifyMetaError = (errorPayload) => {
    if (!errorPayload || typeof errorPayload !== "object") {
        return {
            isInvalidToken: false,
            code: null,
            subcode: null,
            type: "UnknownError",
            metaMessage: "Unknown Meta API error.",
            userFriendlyReason: "Meta API request failed."
        };
    }

    const rawError = errorPayload.error || errorPayload;
    const code = Number.isInteger(Number(rawError.code)) ? Number(rawError.code) : null;
    const subcode = Number.isInteger(Number(rawError.error_subcode)) ? Number(rawError.error_subcode) : null;
    const type = typeof rawError.type === "string" ? rawError.type.trim() : "OAuthException";
    const metaMessage = typeof rawError.message === "string" ? rawError.message.trim() : "";
    const fbtraceId = typeof rawError.fbtrace_id === "string" ? rawError.fbtrace_id.trim() : null;

    // Strict detection: Code 190 represents OAuth token invalidation / revocation / expiration.
    // Explicitly reject permission errors (Code 10), parameter errors (Code 100), rate limits, etc.
    if (code === 190) {
        let userFriendlyReason = "Instagram access token has expired or is no longer valid. Please reconnect.";

        if (subcode === 458) {
            userFriendlyReason = "Instagram connection was revoked or the application was uninstalled.";
        } else if (subcode === 460) {
            userFriendlyReason = "Instagram session was reset or password was changed. Please reconnect.";
        } else if (subcode === 463) {
            userFriendlyReason = "Instagram access token has expired. Please reconnect.";
        } else if (subcode === 467) {
            userFriendlyReason = "Instagram access token has been invalidated or user logged out.";
        }

        return {
            isInvalidToken: true,
            code,
            subcode,
            type,
            metaMessage,
            userFriendlyReason,
            fbtraceId
        };
    }

    return {
        isInvalidToken: false,
        code,
        subcode,
        type,
        metaMessage,
        userFriendlyReason: code === 10
            ? "Application does not have permission or capability for this action."
            : (metaMessage || "Meta API request failed."),
        fbtraceId
    };
};

/**
 * Confirmed MongoDB server error signatures indicating transactions are not supported
 * by the current deployment topology (e.g. standalone mongod instance).
 */
const CONFIRMED_UNSUPPORTED_TRANSACTION_SIGNATURES = [
    /transaction numbers are only allowed on a replica set member or mongos/i,
    /cannot start a transaction on a standalone/i,
    /cannot run transaction on standalone/i,
    /this mongodb deployment does not support transactions/i,
    /transactions are not supported on standalone/i,
    /standalone instances do not support transactions/i
];

/**
 * Strictly classifies whether an error indicates lack of MongoDB transaction support.
 * Rejects generic IllegalOperation (code 20) errors unless accompanied by confirmed topology signatures.
 *
 * @param {Error|Object} err - Error caught during a database operation with session.
 * @returns {boolean} True strictly if error matches confirmed unsupported-transaction topology signatures.
 */
const isTransactionUnsupportedError = (err) => {
    if (!err) return false;

    const msg = typeof err.message === "string" ? err.message : "";
    if (!msg) return false;

    const matchesSignature = CONFIRMED_UNSUPPORTED_TRANSACTION_SIGNATURES.some((regex) => regex.test(msg));
    if (!matchesSignature) {
        return false;
    }

    const code = err.code;
    const codeName = typeof err.codeName === "string" ? err.codeName : "";
    const isIllegalOp = code === 20 || codeName === "IllegalOperation";

    return isIllegalOp || matchesSignature;
};

/**
 * Centrally handles Meta Graph API errors.
 * Classifies the error, updates MongoDB status to EXPIRED if token is revoked/invalid (Code 190),
 * and logs safe diagnostics without exposing tokens or secrets.
 *
 * @param {Object} errorPayload - Raw error object from Meta response (data.error or Error with meta properties).
 * @param {Object} [context={}] - Context containing creatorId, instagramUserId, and/or operation name.
 * @returns {Promise<Object>} Normalized classification result.
 */
const handleMetaGraphApiError = async (errorPayload, context = {}) => {
    const classification = classifyMetaError(errorPayload);
    const operation = context.operation || "MetaGraphApi";

    // Safe diagnostic logging: NEVER print access tokens, secrets, or encryption keys
    console.error(`[Meta Graph API Error] [${operation}]:`, {
        code: classification.code,
        subcode: classification.subcode,
        type: classification.type,
        message: classification.metaMessage,
        isInvalidToken: classification.isInvalidToken,
        fbtraceId: classification.fbtraceId
    });

    // If actual token invalidation is confirmed (Code 190), mark account as EXPIRED in MongoDB
    if (classification.isInvalidToken) {
        const query = {};
        if (context.creatorId) {
            query.creator = context.creatorId;
        } else if (context.instagramAccountId || context.instagramUserId) {
            query.instagramUserId = (context.instagramAccountId || context.instagramUserId).toString().trim();
        }

        if (Object.keys(query).length > 0) {
            try {
                await InstagramAccount.findOneAndUpdate(
                    query,
                    {
                        $set: {
                            status: "EXPIRED",
                            disconnectionReason: classification.userFriendlyReason
                        }
                    }
                );
            } catch (dbErr) {
                console.error("[Meta Graph API Error] Failed to update account status to EXPIRED:", dbErr.message);
            }
        }
    }

    return classification;
};

// Generates the official Meta Unified Login OAuth authorization URL for a CreatorLink creator.
const generateInstagramConnectUrl = async (creatorId) => {
    if (!creatorId) {
        throw createApiError(400, "Creator ID is required to generate Instagram connection URL.");
    }

    const appId = process.env.META_APP_ID;
    const configId = process.env.META_CONFIG_ID;
    const redirectUri = process.env.META_REDIRECT_URI;

    if (!appId || !configId || !redirectUri) {
        throw createApiError(
            500,
            "Meta Instagram integration is not properly configured. Missing required environment variables."
        );
    }

    // 1. Generate high-entropy, signed OAuth state and record in MongoDB for single-use verification
    const state = await generateOAuthState(creatorId);

    // 2. Construct the exact Unified Login authorization URL
    const authUrl = new URL("https://www.facebook.com/dialog/oauth");
    authUrl.searchParams.set("client_id", appId.trim());
    authUrl.searchParams.set("config_id", configId.trim());
    authUrl.searchParams.set("display", "popup");
    authUrl.searchParams.set("override_default_response_type", "true");
    authUrl.searchParams.set("prompt", "login");
    authUrl.searchParams.set("redirect_uri", redirectUri.trim());
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);

    return authUrl.toString();
};

// Exchanges Meta authorization code for an access token via Graph API.
// Validates configuration, constructs URLSearchParams, and parses the response safely.
const exchangeMetaAuthorizationCode = async (code) => {
    if (!code || typeof code !== "string" || code.trim().length === 0) {
        throw new Error("Authorization code is required for token exchange.");
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
        throw new Error("Meta Instagram integration is missing required environment variables.");
    }

    const params = new URLSearchParams({
        client_id: appId.trim(),
        client_secret: appSecret.trim(),
        redirect_uri: redirectUri.trim(),
        code: code.trim()
    });

    const tokenUrl = `https://graph.facebook.com/v27.0/oauth/access_token?${params.toString()}`;

    let response;
    try {
        response = await fetch(tokenUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
    } catch {
        throw new Error("Network error occurred while contacting Meta OAuth service.");
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error("Received malformed or non-JSON response from Meta OAuth service.");
    }

    if (
        !response.ok ||
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        data.error ||
        typeof data.access_token !== "string" ||
        data.access_token.trim().length === 0
    ) {
        throw new Error("Meta OAuth service rejected the authorization code or failed to return a valid access token.");
    }

    // Safely parse expiresIn: handle missing, null, zero, negative, or invalid values without assuming response shape
    let expiresIn = null;
    if (data.expires_in !== undefined && data.expires_in !== null) {
        const parsedExpiresIn = Number(data.expires_in);
        if (Number.isFinite(parsedExpiresIn) && parsedExpiresIn > 0) {
            expiresIn = Math.floor(parsedExpiresIn);
        }
    }

    const tokenType = typeof data.token_type === "string" && data.token_type.trim().length > 0
        ? data.token_type.trim().toLowerCase()
        : "bearer";

    return {
        accessToken: data.access_token.trim(),
        tokenType,
        expiresIn
    };
};

// Discovers assigned Instagram Professional accounts via Meta Graph API v27.0.
// Handles zero, single, and multiple assigned accounts safely.
const fetchAssignedInstagramAccounts = async (accessToken, context = {}) => {
    if (!accessToken || typeof accessToken !== "string" || accessToken.trim().length === 0) {
        throw new Error("Access token is required for account discovery.");
    }

    const discoveryUrl = "https://graph.facebook.com/v27.0/me/assigned_instagram_accounts?fields=id,username";

    let response;
    try {
        response = await fetch(discoveryUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken.trim()}`,
                Accept: "application/json"
            }
        });
    } catch {
        throw new Error("Network error occurred while discovering assigned Instagram accounts.");
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error("Received malformed or non-JSON response during Instagram account discovery.");
    }

    if (!response.ok || !data || data.error) {
        if (data && typeof data === "object" && data.error) {
            await handleMetaGraphApiError(data.error, {
                ...context,
                operation: "fetchAssignedInstagramAccounts"
            });
        }
        throw new Error("Meta API rejected the request to discover assigned Instagram accounts.");
    }

    if (!data || !Array.isArray(data.data)) {
        throw new Error("Invalid response format received from Meta account discovery endpoint.");
    }

    const accounts = data.data;

    if (accounts.length === 0) {
        throw new Error("No connected Instagram Professional account found.");
    }

    const parsedAccounts = [];
    for (const acc of accounts) {
        if (
            !acc ||
            typeof acc !== "object" ||
            Array.isArray(acc) ||
            typeof acc.id !== "string" ||
            acc.id.trim().length === 0 ||
            typeof acc.username !== "string" ||
            acc.username.trim().length === 0
        ) {
            throw new Error("Malformed Instagram account record received from Meta Graph API.");
        }

        parsedAccounts.push({
            id: acc.id.trim(),
            username: acc.username.trim()
        });
    }

    // If exactly one account is present, select it automatically.
    // If multiple accounts are present, DO NOT arbitrarily select data[0]. Return requiresSelection: true.
    if (parsedAccounts.length === 1) {
        return {
            accounts: parsedAccounts,
            selectedAccount: parsedAccounts[0],
            requiresSelection: false
        };
    }

    return {
        accounts: parsedAccounts,
        selectedAccount: null,
        requiresSelection: true
    };
};

// Fetches verified profile fields and metrics for a specific Instagram Professional account.
// Validates types strictly, checks ID parity, and ensures metric values are non-negative finite numbers.
const fetchInstagramAccountProfile = async (instagramAccountId, accessToken, context = {}) => {
    if (!instagramAccountId || typeof instagramAccountId !== "string" || instagramAccountId.trim().length === 0) {
        throw new Error("Instagram account ID must be a non-empty string.");
    }

    if (!accessToken || typeof accessToken !== "string" || accessToken.trim().length === 0) {
        throw new Error("Access token is required to fetch Instagram profile.");
    }

    const cleanAccountId = instagramAccountId.trim();
    const profileUrl = `https://graph.facebook.com/v27.0/${encodeURIComponent(cleanAccountId)}?fields=id,username,name,profile_picture_url,followers_count,media_count`;

    let response;
    try {
        response = await fetch(profileUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken.trim()}`,
                Accept: "application/json"
            }
        });
    } catch {
        const netErr = new Error("Network error occurred while fetching Instagram profile metrics.");
        netErr.operation = "fetchInstagramAccountProfile";
        throw netErr;
    }

    let data;
    try {
        data = await response.json();
    } catch {
        const parseErr = new Error("Received malformed or non-JSON response while fetching Instagram profile.");
        parseErr.operation = "fetchInstagramAccountProfile";
        parseErr.status = response?.status;
        throw parseErr;
    }

    if (!response.ok || !data || data.error) {
        let classification = null;
        if (data && typeof data === "object" && data.error) {
            classification = await handleMetaGraphApiError(data.error, {
                ...context,
                instagramAccountId: cleanAccountId,
                operation: "fetchInstagramAccountProfile"
            });
        }

        const metaError = new Error("Meta API rejected the request to fetch Instagram profile.");
        metaError.operation = "fetchInstagramAccountProfile";
        metaError.status = response?.status;
        if (data && typeof data === "object" && data.error) {
            metaError.metaCode = data.error.code;
            metaError.metaSubcode = data.error.error_subcode;
            metaError.metaMessage = data.error.message;
            metaError.fbtraceId = data.error.fbtrace_id;
            metaError.isInvalidToken = classification?.isInvalidToken || false;
            metaError.userFriendlyReason = classification?.userFriendlyReason || "";
        }
        throw metaError;
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Invalid profile payload received from Meta Graph API.");
    }

    // 1. Strict ID validation & parity verification
    if (typeof data.id !== "string" || data.id.trim().length === 0) {
        throw new Error("Invalid or missing Instagram user ID in profile response.");
    }

    if (data.id.trim() !== cleanAccountId) {
        throw new Error("Profile response ID does not match requested Instagram account ID.");
    }

    // 2. Strict username validation
    if (typeof data.username !== "string" || data.username.trim().length === 0) {
        throw new Error("Invalid or missing Instagram username in profile response.");
    }

    // 3. Strictly type-safe followers_count validation (must be an actual JavaScript number, not string/boolean/NaN)
    const followers = data.followers_count;
    if (
        typeof followers !== "number" ||
        !Number.isFinite(followers) ||
        Number.isNaN(followers) ||
        followers < 0
    ) {
        throw new Error("Invalid followers_count received from Meta Graph API: must be a non-negative finite number.");
    }

    // 4. Strictly type-safe media_count validation (must be an actual JavaScript number, not string/boolean/NaN)
    const media = data.media_count;
    if (
        typeof media !== "number" ||
        !Number.isFinite(media) ||
        Number.isNaN(media) ||
        media < 0
    ) {
        throw new Error("Invalid media_count received from Meta Graph API: must be a non-negative finite number.");
    }

    // 5. Safe optional field handling
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const profilePictureUrl = typeof data.profile_picture_url === "string" ? data.profile_picture_url.trim() : "";

    let accountType = "";
    if (typeof data.account_type === "string") {
        const normalized = data.account_type.trim().toUpperCase();
        if (normalized === "BUSINESS") {
            accountType = "BUSINESS";
        } else if (normalized === "MEDIA_CREATOR" || normalized === "CREATOR") {
            accountType = "CREATOR";
        }
    }

    return {
        instagramUserId: data.id.trim(),
        username: data.username.trim(),
        name,
        accountType,
        profilePictureUrl,
        followersCount: Math.floor(followers),
        mediaCount: Math.floor(media)
    };
};

/**
 * Fetches recent media posts from Meta Graph API for engagement calculation.
 * Implements bounded pagination (max 2 pages, limit 25, max 50 items inspected)
 * using fixed https://graph.facebook.com/v27.0/ host and paging.cursors.after.
 * Returns up to 12 eligible posts (with valid string id, non-negative like_count and comments_count).
 * Excludes posts with missing or invalid metrics.
 *
 * @param {string} instagramAccountId - Unique Instagram user ID.
 * @param {string} accessToken - Valid Meta access token.
 * @param {Object} [context={}] - Context for error handling (creatorId, operation).
 * @returns {Promise<Object>} Normalized result with eligiblePosts, inspectedCount, pagesFetched.
 */
const fetchRecentInstagramMedia = async (instagramAccountId, accessToken, context = {}) => {
    if (!instagramAccountId || typeof instagramAccountId !== "string" || instagramAccountId.trim().length === 0) {
        throw new Error("Instagram account ID must be a non-empty string.");
    }

    if (!accessToken || typeof accessToken !== "string" || accessToken.trim().length === 0) {
        throw new Error("Access token is required to fetch Instagram media.");
    }

    const cleanAccountId = instagramAccountId.trim();
    const TARGET_ELIGIBLE_POSTS = 12;
    const BATCH_SIZE = 25;
    const MAX_PAGES = 2;
    const MAX_INSPECTED_MEDIA = 50;

    const eligiblePosts = [];
    let inspectedCount = 0;
    let currentCursor = null;
    let pagesFetched = 0;

    while (
        pagesFetched < MAX_PAGES &&
        eligiblePosts.length < TARGET_ELIGIBLE_POSTS &&
        inspectedCount < MAX_INSPECTED_MEDIA
    ) {
        const mediaUrl = new URL(`https://graph.facebook.com/v27.0/${encodeURIComponent(cleanAccountId)}/media`);
        mediaUrl.searchParams.set("fields", "id,media_type,like_count,comments_count,timestamp");
        mediaUrl.searchParams.set("limit", String(BATCH_SIZE));

        if (currentCursor) {
            mediaUrl.searchParams.set("after", currentCursor);
        }

        let response;
        try {
            response = await fetch(mediaUrl.toString(), {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken.trim()}`,
                    Accept: "application/json"
                }
            });
        } catch {
            const netErr = new Error("Network error occurred while fetching Instagram media.");
            netErr.operation = "fetchRecentInstagramMedia";
            throw netErr;
        }

        let data;
        try {
            data = await response.json();
        } catch {
            const parseErr = new Error("Received malformed or non-JSON response while fetching Instagram media.");
            parseErr.operation = "fetchRecentInstagramMedia";
            parseErr.status = response?.status;
            throw parseErr;
        }

        if (!response.ok || !data || data.error) {
            let classification = null;
            if (data && typeof data === "object" && data.error) {
                classification = await handleMetaGraphApiError(data.error, {
                    ...context,
                    instagramAccountId: cleanAccountId,
                    operation: "fetchRecentInstagramMedia"
                });
            }

            const metaError = new Error("Meta API rejected the request to fetch Instagram media.");
            metaError.operation = "fetchRecentInstagramMedia";
            metaError.status = response?.status;
            if (data && typeof data === "object" && data.error) {
                metaError.metaCode = data.error.code;
                metaError.metaSubcode = data.error.error_subcode;
                metaError.metaMessage = data.error.message;
                metaError.fbtraceId = data.error.fbtrace_id;
                metaError.isInvalidToken = classification?.isInvalidToken || false;
                metaError.userFriendlyReason = classification?.userFriendlyReason || "";
            }
            throw metaError;
        }

        // Validate payload structure: response must be an object with an Array 'data' property
        if (!data || typeof data !== "object" || !Array.isArray(data.data)) {
            const malformedErr = new Error("Invalid or malformed media payload received from Meta Graph API: expected 'data' array.");
            malformedErr.operation = "fetchRecentInstagramMedia";
            malformedErr.status = response?.status;
            throw malformedErr;
        }

        pagesFetched++;

        const rawItems = data.data;
        if (rawItems.length === 0) {
            break;
        }

        for (const item of rawItems) {
            if (inspectedCount >= MAX_INSPECTED_MEDIA) {
                break;
            }
            inspectedCount++;

            // Strict qualification check:
            // 1. Valid non-empty string ID
            // 2. Non-negative numeric like_count (must be a finite number >= 0)
            // 3. Non-negative numeric comments_count (must be a finite number >= 0)
            const hasValidId = typeof item?.id === "string" && item.id.trim().length > 0;
            const hasValidLikes =
                typeof item?.like_count === "number" &&
                Number.isFinite(item.like_count) &&
                item.like_count >= 0;
            const hasValidComments =
                typeof item?.comments_count === "number" &&
                Number.isFinite(item.comments_count) &&
                item.comments_count >= 0;

            if (hasValidId && hasValidLikes && hasValidComments) {
                eligiblePosts.push({
                    id: item.id.trim(),
                    mediaType: typeof item.media_type === "string" ? item.media_type.trim() : "",
                    likeCount: Math.floor(item.like_count),
                    commentsCount: Math.floor(item.comments_count),
                    timestamp: item.timestamp || null
                });

                if (eligiblePosts.length >= TARGET_ELIGIBLE_POSTS) {
                    break;
                }
            }
        }

        // Check for next page cursor
        const nextCursor = data?.paging?.cursors?.after;
        if (
            eligiblePosts.length < TARGET_ELIGIBLE_POSTS &&
            typeof nextCursor === "string" &&
            nextCursor.trim().length > 0 &&
            pagesFetched < MAX_PAGES &&
            inspectedCount < MAX_INSPECTED_MEDIA
        ) {
            currentCursor = nextCursor.trim();
        } else {
            break;
        }
    }

    return {
        success: true,
        eligiblePosts: eligiblePosts.slice(0, TARGET_ELIGIBLE_POSTS),
        inspectedCount,
        pagesFetched
    };
};

/**
 * Calculates Instagram Engagement Rate and metric averages from eligible recent posts and verified follower count.
 *
 * Formula:
 * Average Likes = Total Likes / Eligible Post Count
 * Average Comments = Total Comments / Eligible Post Count
 * Engagement Rate = ((Average Likes + Average Comments) / Followers Count) * 100
 *
 * Both Engagement Rate and metric averages are rounded to 2 decimal places.
 * If eligible post count is 0, or followers count is invalid/zero, calculation is considered unavailable.
 * Never calculates a fake 0% engagement rate on unavailable metrics.
 *
 * @param {Array} eligiblePosts - Array of qualified media items containing numeric like_count/likeCount and comments_count/commentsCount
 * @param {number} followersCount - Verified non-negative follower count
 * @returns {Object} Structured calculation result
 */
const calculateInstagramEngagement = (eligiblePosts, followersCount) => {
    // 1. Strict validation of followers count: must be a positive finite number (> 0)
    if (
        typeof followersCount !== "number" ||
        !Number.isFinite(followersCount) ||
        followersCount <= 0
    ) {
        return {
            isAvailable: false,
            engagementRate: null,
            averageLikes: null,
            averageComments: null,
            engagementPostCount: 0
        };
    }

    // 2. Strict validation of posts array
    if (!Array.isArray(eligiblePosts) || eligiblePosts.length === 0) {
        return {
            isAvailable: false,
            engagementRate: null,
            averageLikes: null,
            averageComments: null,
            engagementPostCount: 0
        };
    }

    // 3. Filter strictly for items with finite, non-negative like count and comments count
    const validPosts = eligiblePosts.filter((post) => {
        if (!post || typeof post !== "object") return false;

        const likes = typeof post.likeCount === "number"
            ? post.likeCount
            : (typeof post.like_count === "number" ? post.like_count : null);

        const comments = typeof post.commentsCount === "number"
            ? post.commentsCount
            : (typeof post.comments_count === "number" ? post.comments_count : null);

        return (
            likes !== null &&
            Number.isFinite(likes) &&
            likes >= 0 &&
            comments !== null &&
            Number.isFinite(comments) &&
            comments >= 0
        );
    });

    if (validPosts.length === 0) {
        return {
            isAvailable: false,
            engagementRate: null,
            averageLikes: null,
            averageComments: null,
            engagementPostCount: 0
        };
    }

    const postCount = validPosts.length;
    const totalLikes = validPosts.reduce((acc, p) => {
        const l = typeof p.likeCount === "number" ? p.likeCount : p.like_count;
        return acc + l;
    }, 0);

    const totalComments = validPosts.reduce((acc, p) => {
        const c = typeof p.commentsCount === "number" ? p.commentsCount : p.comments_count;
        return acc + c;
    }, 0);

    const averageLikes = Math.round((totalLikes / postCount) * 100) / 100;
    const averageComments = Math.round((totalComments / postCount) * 100) / 100;

    // Formula: ER = ((Average Likes + Average Comments) / Followers Count) * 100
    const rawER = ((averageLikes + averageComments) / followersCount) * 100;
    const engagementRate = Math.round(rawER * 100) / 100;

    return {
        isAvailable: true,
        engagementRate,
        averageLikes,
        averageComments,
        engagementPostCount: postCount
    };
};

// Persists verified Instagram account credentials and profile metrics into MongoDB.
// Encrypts access token with AES-256-GCM, prevents duplicate/cross-creator accounts,
// calculates token expiration, updates InstagramAccount atomically, and syncs CreatorProfile.
const persistInstagramConnection = async ({ creatorId, tokenData, profileData, engagementMetrics = null }) => {
    const frontendBaseUrl = getFrontendBaseUrl();

    // 1. Strict input validation before any database operations
    if (!creatorId) {
        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent("Creator ID is required for persistence.")}`
        };
    }

    if (!tokenData || typeof tokenData !== "object" || typeof tokenData.accessToken !== "string" || tokenData.accessToken.trim().length === 0) {
        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent("Valid access token is required for persistence.")}`
        };
    }

    if (
        !profileData ||
        typeof profileData !== "object" ||
        typeof profileData.instagramUserId !== "string" ||
        profileData.instagramUserId.trim().length === 0 ||
        typeof profileData.username !== "string" ||
        profileData.username.trim().length === 0 ||
        typeof profileData.followersCount !== "number" ||
        !Number.isFinite(profileData.followersCount) ||
        profileData.followersCount < 0 ||
        typeof profileData.mediaCount !== "number" ||
        !Number.isFinite(profileData.mediaCount) ||
        profileData.mediaCount < 0
    ) {
        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent("Valid Instagram profile data is required for persistence.")}`
        };
    }

    // 2. Cross-creator conflict check: ensure this Instagram account isn't already bound to another creator
    try {
        const conflictingAccount = await InstagramAccount.findOne({
            instagramUserId: profileData.instagramUserId.trim(),
            creator: { $ne: creatorId }
        });

        if (conflictingAccount) {
            return {
                success: false,
                redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(
                    "This Instagram account is already connected to another CreatorLink profile."
                )}`
            };
        }
    } catch {
        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(
                "Database error occurred while checking account availability."
            )}`
        };
    }

    // 3. Encrypt access token using existing AES-256-GCM helper (never store plaintext tokens)
    let encryptedToken;
    try {
        encryptedToken = encryptToken(tokenData.accessToken.trim());
    } catch {
        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(
                "Failed to securely store Instagram credentials."
            )}`
        };
    }

    // 4. Calculate token expiration date: valid positive number -> Date; otherwise null
    let tokenExpiresAt = null;
    if (
        typeof tokenData.expiresIn === "number" &&
        Number.isFinite(tokenData.expiresIn) &&
        tokenData.expiresIn > 0
    ) {
        tokenExpiresAt = new Date(Date.now() + tokenData.expiresIn * 1000);
    }

    // 5. Prepare update payloads for InstagramAccount and CreatorProfile
    const igSetFields = {
        instagramUserId: profileData.instagramUserId.trim(),
        username: profileData.username.trim(),
        accountType: typeof profileData.accountType === "string" ? profileData.accountType.trim() : "",
        profilePictureUrl: typeof profileData.profilePictureUrl === "string" ? profileData.profilePictureUrl.trim() : "",
        followersCount: Math.floor(profileData.followersCount),
        mediaCount: Math.floor(profileData.mediaCount),
        encryptedAccessToken: encryptedToken,
        tokenExpiresAt,
        status: "CONNECTED",
        disconnectionReason: "",
        needsProfileSync: false,
        lastSyncedAt: new Date()
    };

    const profileSetFields = {
        followerCount: Math.floor(profileData.followersCount),
        "socialLinks.instagram": `https://instagram.com/${profileData.username.trim()}`
    };

    // If new calculation is available, persist it.
    // If explicitly unavailable (e.g. successful API call returned 0 eligible posts or 0 followers),
    // mark metrics as unavailable (null).
    // If engagementMetrics is null (e.g. media API network error during OAuth connect),
    // preserve previously saved Engagement Rate and averages (do NOT overwrite).
    if (engagementMetrics && engagementMetrics.isAvailable) {
        igSetFields.engagementRate = engagementMetrics.engagementRate;
        igSetFields.averageLikes = engagementMetrics.averageLikes;
        igSetFields.averageComments = engagementMetrics.averageComments;
        igSetFields.engagementPostCount = engagementMetrics.engagementPostCount;
        igSetFields.engagementLastSyncedAt = new Date();

        profileSetFields.engagementRate = engagementMetrics.engagementRate;
    } else if (engagementMetrics && !engagementMetrics.isAvailable) {
        igSetFields.engagementRate = null;
        igSetFields.averageLikes = null;
        igSetFields.averageComments = null;
        igSetFields.engagementPostCount = typeof engagementMetrics.engagementPostCount === "number" ? engagementMetrics.engagementPostCount : 0;
        igSetFields.engagementLastSyncedAt = new Date();

        profileSetFields.engagementRate = null;
    }

    // 6. Consistent multi-collection persistence with transaction fallback
    let session = null;
    let useTransaction = false;
    try {
        if (mongoose?.connection?.readyState === 1 && typeof mongoose?.startSession === "function") {
            session = await mongoose.startSession();
            session.startTransaction();
            useTransaction = true;
        }
    } catch {
        if (session) {
            try { await session.endSession(); } catch {}
            session = null;
        }
        useTransaction = false;
    }

    let didUpdateInstagramAccount = false;
    try {
        const sessionOpt = useTransaction && session ? { session } : {};

        // In standalone mode, use born-dirty strategy: write needsProfileSync: true upfront.
        // In transaction mode, write needsProfileSync: false initially because transaction commits atomically.
        const initialNeedsProfileSync = !useTransaction;

        const savedAccount = await InstagramAccount.findOneAndUpdate(
            { creator: creatorId },
            {
                $set: {
                    ...igSetFields,
                    needsProfileSync: initialNeedsProfileSync
                },
                $inc: { syncVersion: 1 }
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true,
                ...sessionOpt
            }
        );
        didUpdateInstagramAccount = true;
        const currentVersion = typeof savedAccount.syncVersion === "number" ? savedAccount.syncVersion : 1;

        let profileUpdated = false;
        try {
            const updatedProfile = await CreatorProfile.findOneAndUpdate(
                {
                    user: creatorId,
                    $or: [
                        { instagramSyncVersion: { $lt: currentVersion } },
                        { instagramSyncVersion: null },
                        { instagramSyncVersion: { $exists: false } }
                    ]
                },
                {
                    $set: {
                        ...profileSetFields,
                        instagramSyncVersion: currentVersion
                    }
                },
                { returnDocument: "after", ...sessionOpt }
            );

            if (updatedProfile) {
                profileUpdated = true;
            } else {
                const profileExists = await CreatorProfile.exists({ user: creatorId }).session(sessionOpt.session || null);
                if (profileExists) {
                    profileUpdated = true; // Profile is already on newer syncVersion
                }
            }
        } catch (profileErr) {
            if (useTransaction) {
                // In transaction mode, rethrow so entire transaction aborts atomically
                throw profileErr;
            }
            console.error("[Instagram Persistence Profile Sync Error]:", profileErr.message);
        }

        if (useTransaction) {
            if (!profileUpdated) {
                // Profile does not exist: ensure needsProfileSync: true is persisted in transaction before commit
                await InstagramAccount.updateOne(
                    { creator: creatorId },
                    { $set: { needsProfileSync: true } },
                    { ...sessionOpt }
                );
            }
            if (session) {
                await session.commitTransaction();
            }
        } else if (profileUpdated) {
            // Standalone mode: clear the born-dirty flag only with an exact version match
            try {
                await InstagramAccount.updateOne(
                    {
                        creator: creatorId,
                        syncVersion: currentVersion,
                        needsProfileSync: true
                    },
                    { $set: { needsProfileSync: false } }
                );
            } catch (clearErr) {
                console.error("[Instagram Persistence Flag Clear Error]:", clearErr.message);
            }
        }
    } catch (dbErr) {
        if (useTransaction && session) {
            try {
                await session.abortTransaction();
            } catch {}
            try {
                await session.endSession();
            } catch {}
            session = null;
        }

        // Standalone fallback: execute one-time retry ONLY on confirmed unsupported-topology signatures
        if (useTransaction && isTransactionUnsupportedError(dbErr)) {
            useTransaction = false;
            try {
                const savedAccount = await InstagramAccount.findOneAndUpdate(
                    { creator: creatorId },
                    {
                        $set: {
                            ...igSetFields,
                            needsProfileSync: true // Born-dirty in standalone fallback
                        },
                        $inc: { syncVersion: 1 }
                    },
                    {
                        upsert: true,
                        returnDocument: "after",
                        runValidators: true
                    }
                );
                didUpdateInstagramAccount = true;
                const currentVersion = typeof savedAccount.syncVersion === "number" ? savedAccount.syncVersion : 1;

                let profileUpdated = false;
                try {
                    const updatedProfile = await CreatorProfile.findOneAndUpdate(
                        {
                            user: creatorId,
                            $or: [
                                { instagramSyncVersion: { $lt: currentVersion } },
                                { instagramSyncVersion: null },
                                { instagramSyncVersion: { $exists: false } }
                            ]
                        },
                        {
                            $set: {
                                ...profileSetFields,
                                instagramSyncVersion: currentVersion
                            }
                        },
                        { returnDocument: "after" }
                    );

                    if (updatedProfile) {
                        profileUpdated = true;
                    } else {
                        const profileExists = await CreatorProfile.exists({ user: creatorId });
                        if (profileExists) {
                            profileUpdated = true;
                        }
                    }
                } catch (standaloneProfileErr) {
                    console.error("[Instagram Standalone Persistence Profile Sync Error]:", standaloneProfileErr.message);
                }

                if (profileUpdated) {
                    try {
                        await InstagramAccount.updateOne(
                            {
                                creator: creatorId,
                                syncVersion: currentVersion,
                                needsProfileSync: true
                            },
                            { $set: { needsProfileSync: false } }
                        );
                    } catch {}
                }

                return {
                    success: true,
                    redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=success&username=${encodeURIComponent(
                        profileData.username.trim()
                    )}`
                };
            } catch (retryErr) {
                dbErr = retryErr;
            }
        }

        if (dbErr && dbErr.code === 11000) {
            const isInstagramIdConflict =
                (dbErr.keyPattern && dbErr.keyPattern.instagramUserId) ||
                (dbErr.message && dbErr.message.includes("instagramUserId"));

            const safeMsg = isInstagramIdConflict
                ? "This Instagram account is already connected to another CreatorLink profile."
                : "A connection request for this creator is already being processed.";

            return {
                success: false,
                redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(
                    safeMsg
                )}`
            };
        }

        console.error("[Instagram Persistence Error]:", dbErr.message);
        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(
                "Failed to save Instagram connection to database."
            )}`
        };
    } finally {
        if (session) {
            try {
                await session.endSession();
            } catch {}
        }
    }

    // 7. Success redirect: only reached after successful InstagramAccount persistence
    return {
        success: true,
        redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=success&username=${encodeURIComponent(
            profileData.username.trim()
        )}`
    };
};

// Processes the Meta Instagram Unified Login OAuth callback.
// Verifies authorization parameters, handles Meta errors, atomically consumes OAuth state,
// exchanges authorization code for an access token, discovers assigned accounts, and fetches profile metrics.
const processInstagramOAuthCallback = async ({
    code,
    state,
    error,
    errorReason,
    errorDescription
}) => {
    const frontendBaseUrl = getFrontendBaseUrl();

    // 1. Handle Meta-reported authorization errors (e.g. user denied or cancelled permissions)
    if (error || errorReason || errorDescription) {
        if (error === "access_denied" || errorReason === "user_denied") {
            return {
                success: false,
                redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=cancelled`
            };
        }

        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent("Instagram authorization failed. Please try again.")}`
        };
    }

    // 2. Validate the presence and types of code and state
    if (
        !code ||
        typeof code !== "string" ||
        code.trim().length === 0 ||
        !state ||
        typeof state !== "string" ||
        state.trim().length === 0
    ) {
        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent("Required authorization parameters were not provided.")}`
        };
    }

    // 3. Atomically consume OAuth state and securely retrieve authenticated creator ID
    let creatorId;
    try {
        const consumed = await consumeOAuthState(state.trim());
        creatorId = consumed.creatorId;
    } catch (stateErr) {
        let safeMessage = "Invalid or untrusted authorization session.";
        const errMsg = (stateErr && stateErr.message) || "";

        if (errMsg.includes("expired")) {
            safeMessage = "Authorization session expired. Please try connecting again.";
        } else if (errMsg.includes("already been consumed") || errMsg.includes("replay")) {
            safeMessage = "Authorization session has already been used. Please try connecting again.";
        }

        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(safeMessage)}`
        };
    }

    // 4. Step 5B: Exchange authorization code with Meta Graph API
    let tokenData;
    try {
        tokenData = await exchangeMetaAuthorizationCode(code.trim());
    } catch (exchangeErr) {
        let safeMessage = "Failed to complete Instagram authorization. Please try again.";
        const errMsg = (exchangeErr && exchangeErr.message) || "";

        if (errMsg.includes("Network error")) {
            safeMessage = "Unable to reach Instagram servers. Please try again.";
        } else if (errMsg.includes("missing required environment variables")) {
            safeMessage = "Instagram integration is improperly configured.";
        }

        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(safeMessage)}`
        };
    }

    // 5. Step 5C: Discover assigned Instagram Professional accounts
    let discoveryResult;
    try {
        discoveryResult = await fetchAssignedInstagramAccounts(tokenData.accessToken, { creatorId });
    } catch (discoveryErr) {
        let safeMessage = "Unable to find connected Instagram account. Please ensure an Instagram Creator or Business account is linked and selected.";
        const errMsg = (discoveryErr && discoveryErr.message) || "";

        if (errMsg.includes("Network error")) {
            safeMessage = "Unable to reach Instagram servers during account discovery.";
        }

        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(safeMessage)}`
        };
    }

    // If multiple accounts are connected, do NOT arbitrarily select data[0].
    // The connection is NOT completed because an account has not been selected or bound.
    // Return a clearly distinguishable requiresSelection result without marking connection as completed.
    // NOTE: For production multi-account support, when frontend account selection is implemented,
    // a secure server-side pending authorization session (e.g. encrypted temporary storage with
    // a single-use nonce and short TTL) will be required so the creator can pick an account
    // without exposing access tokens or keeping insecure state.
    if (discoveryResult.requiresSelection) {
        return {
            success: false,
            completed: false,
            requiresSelection: true,
            creatorId,
            accounts: discoveryResult.accounts,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=multiple_accounts`
        };
    }

    // 6. Step 5C: Fetch profile details & metrics for the single discovered account
    let profileData;
    try {
        profileData = await fetchInstagramAccountProfile(
            discoveryResult.selectedAccount.id,
            tokenData.accessToken,
            { creatorId, instagramAccountId: discoveryResult.selectedAccount.id }
        );
    } catch (profileErr) {
        console.error("[Instagram Profile Fetch Error]", {
            operation: profileErr?.operation || "fetchInstagramAccountProfile",
            status: profileErr?.status || null,
            metaCode: profileErr?.metaCode || null,
            metaMessage: profileErr?.metaMessage || profileErr?.message || null,
            fbtraceId: profileErr?.fbtraceId || null
        });

        let safeMessage = "Failed to load Instagram profile metrics. Please try again.";
        const errMsg = (profileErr && profileErr.message) || "";

        if (errMsg.includes("Network error")) {
            safeMessage = "Unable to reach Instagram servers during profile retrieval.";
        }

        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(safeMessage)}`
        };
    }

    // 7. Step 5D: Fetch recent media items for engagement calculation (non-fatal if it fails)
    let mediaResult = { success: false, eligiblePosts: [] };
    try {
        mediaResult = await fetchRecentInstagramMedia(
            discoveryResult.selectedAccount.id,
            tokenData.accessToken,
            { creatorId, instagramAccountId: discoveryResult.selectedAccount.id }
        );
    } catch (mediaErr) {
        console.warn("[Instagram Media Fetch Non-fatal Error during OAuth Connect]", {
            operation: mediaErr?.operation || "fetchRecentInstagramMedia",
            message: mediaErr?.message
        });
        // Media API failure must not fail an otherwise valid Instagram connection
    }

    // Step 5E: Calculate engagement metrics from eligible posts and followers count
    let engagementMetrics = null;
    const postsToCalculate = mediaResult?.eligiblePosts || mediaResult?.posts || [];
    if (mediaResult?.success && Array.isArray(postsToCalculate)) {
        engagementMetrics = calculateInstagramEngagement(postsToCalculate, profileData.followersCount);
    }

    // Step 5F: Persist credentials, profile data, and engagement metrics
    const persistenceResult = await persistInstagramConnection({
        creatorId,
        tokenData,
        profileData,
        engagementMetrics
    });

    if (!persistenceResult.success) {
        return {
            success: false,
            redirectUrl: persistenceResult.redirectUrl
        };
    }

    // 8. Internal return for callers/tests.
    // Secrets hygiene: Tokens are stored encrypted in MongoDB and never returned or exposed.
    return {
        success: true,
        creatorId,
        profile: profileData,
        engagement: engagementMetrics,
        redirectUrl: persistenceResult.redirectUrl
    };
};

// In-flight concurrency lock to prevent simultaneous reconciliation runs for the same creator in this process
const activeSyncLocks = new Set();

/**
 * Reconciles CreatorProfile metrics from the connected InstagramAccount if needsProfileSync is true.
 * Safely heals any desynchronization caused by previous standalone database errors or missing profiles.
 *
 * Implements strict version-conditional OCC to prevent stale writes across multiple backend instances.
 *
 * @param {string|ObjectId} creatorId - Creator ID
 * @param {Object} [cachedAccount=null] - Optional already-loaded InstagramAccount document
 * @returns {Promise<boolean>} True if reconciliation occurred and succeeded, false otherwise
 */
const reconcilePendingProfileSync = async (creatorId, cachedAccount = null) => {
    if (!creatorId) return false;
    const creatorKey = creatorId.toString();

    // In-process concurrency guard: avoid redundant concurrent runs in the same event loop
    if (activeSyncLocks.has(creatorKey) || activeRefreshLocks.has(creatorKey)) {
        return false;
    }

    activeSyncLocks.add(creatorKey);
    try {
        const account = cachedAccount || await InstagramAccount.findOne({ creator: creatorId }).lean();
        if (!account || !account.needsProfileSync || account.status !== "CONNECTED") {
            return false;
        }

        const syncVersion = typeof account.syncVersion === "number" ? account.syncVersion : 1;

        const profileUpdate = {
            followerCount: typeof account.followersCount === "number" ? account.followersCount : 0,
            "socialLinks.instagram": `https://instagram.com/${account.username ? account.username.trim() : ""}`,
            instagramSyncVersion: syncVersion
        };

        if (typeof account.engagementRate === "number") {
            profileUpdate.engagementRate = account.engagementRate;
        } else {
            profileUpdate.engagementRate = null;
        }

        // 1. Version-gated update to CreatorProfile:
        // Only update if CreatorProfile has not already been updated by an equal or newer syncVersion
        const updatedProfile = await CreatorProfile.findOneAndUpdate(
            {
                user: creatorId,
                $or: [
                    { instagramSyncVersion: { $lt: syncVersion } },
                    { instagramSyncVersion: null },
                    { instagramSyncVersion: { $exists: false } }
                ]
            },
            {
                $set: profileUpdate
            },
            { returnDocument: "after" }
        );

        if (!updatedProfile) {
            // Check if profile does not exist vs profile is already on a newer version
            const profileExists = await CreatorProfile.exists({ user: creatorId });
            if (!profileExists) {
                // Profile document does not exist yet. Retain needsProfileSync: true.
                console.warn(`[Instagram Reconcile] CreatorProfile for ${creatorId} not found. Retaining needsProfileSync: true.`);
                return false;
            }
            // If profileExists is true, CreatorProfile is ALREADY on a newer version ($lt condition failed).
            // This older reconciliation is obsolete, so we fall through to clear the flag ONLY if account.syncVersion matches.
        }

        // 2. Exact version-bound conditional clear on InstagramAccount:
        // Clears needsProfileSync ONLY if syncVersion exactly matches the snapshot reconciled.
        // If a newer refresh committed a higher syncVersion in the interim, matchedCount is 0,
        // preserving needsProfileSync: true for the newer version across all backend instances.
        const clearResult = await InstagramAccount.updateOne(
            {
                _id: account._id,
                syncVersion: account.syncVersion,
                needsProfileSync: true
            },
            {
                $set: { needsProfileSync: false }
            }
        );

        return clearResult.modifiedCount > 0;
    } catch (reconcileErr) {
        console.error("[Instagram Reconcile Pending Profile Sync Error]:", reconcileErr.message);
        return false;
    } finally {
        activeSyncLocks.delete(creatorKey);
    }
};

// Retrieves the connected Instagram account details for the authenticated creator.
// Excludes encrypted access tokens and returns safe public profile metrics and engagement statistics.
const getConnectedInstagramAccount = async (creatorId) => {
    if (!creatorId) {
        throw createApiError(400, "Creator ID is required to fetch connected Instagram account.");
    }

    const account = await InstagramAccount.findOne({ creator: creatorId })
        .select("-encryptedAccessToken")
        .lean();

    if (!account) {
        return {
            isConnected: false,
            account: null
        };
    }

    const isConnected = account.status ? account.status === "CONNECTED" : true;

    // Self-healing: if pending profile sync was flagged from a previous standalone database glitch, attempt reconciliation
    if (account.needsProfileSync && isConnected) {
        const healed = await reconcilePendingProfileSync(creatorId, account);
        if (healed) {
            account.needsProfileSync = false;
        }
    }

    return {
        isConnected,
        account: {
            instagramUserId: account.instagramUserId,
            username: account.username,
            accountType: account.accountType || "",
            profilePictureUrl: account.profilePictureUrl || "",
            followersCount: typeof account.followersCount === "number" ? account.followersCount : 0,
            mediaCount: typeof account.mediaCount === "number" ? account.mediaCount : 0,
            engagementRate: typeof account.engagementRate === "number" ? account.engagementRate : null,
            averageLikes: typeof account.averageLikes === "number" ? account.averageLikes : null,
            averageComments: typeof account.averageComments === "number" ? account.averageComments : null,
            engagementPostCount: typeof account.engagementPostCount === "number" ? account.engagementPostCount : 0,
            engagementLastSyncedAt: account.engagementLastSyncedAt || null,
            needsProfileSync: Boolean(account.needsProfileSync),
            status: account.status || "CONNECTED",
            disconnectionReason: account.disconnectionReason || "",
            lastSyncedAt: account.lastSyncedAt || null,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt
        }
    };
};

// In-flight concurrency lock to prevent simultaneous duplicate refresh requests for the same creator
const activeRefreshLocks = new Set();

/**
 * Manually refreshes Instagram profile metrics and Engagement Rate for an authenticated creator.
 *
 * Verifies active connection, decrypts stored access token, fetches latest profile and recent media,
 * recalculates engagement metrics, and atomically updates InstagramAccount and CreatorProfile.
 * Handles Meta Code 190 by marking the account as EXPIRED.
 *
 * @param {string|ObjectId} creatorId - Authenticated creator ID
 * @returns {Promise<Object>} Safe refreshed account details
 */
const refreshInstagramAccountMetrics = async (creatorId) => {
    if (!creatorId) {
        throw createApiError(400, "Creator ID is required to refresh Instagram metrics.");
    }

    const creatorKey = creatorId.toString();
    if (activeRefreshLocks.has(creatorKey)) {
        throw createApiError(429, "An Instagram sync is already in progress for this account. Please wait a moment.");
    }

    activeRefreshLocks.add(creatorKey);

    try {
        const account = await InstagramAccount.findOne({ creator: creatorId });

        if (!account || account.status === "DISCONNECTED") {
            throw createApiError(400, "No active Instagram account connected to refresh.");
        }

        if (account.status === "EXPIRED") {
            throw createApiError(400, "Instagram connection has expired. Please reconnect your account.");
        }

        if (!account.encryptedAccessToken) {
            throw createApiError(400, "No stored Instagram credentials found. Please reconnect your account.");
        }

        // Decrypt access token
        let decryptedToken;
        try {
            decryptedToken = decryptToken(account.encryptedAccessToken);
        } catch (decryptErr) {
            console.error("[Instagram Refresh Error] Failed to decrypt token:", decryptErr.message);
            throw createApiError(500, "Failed to securely retrieve stored Instagram credentials.");
        }

        const context = {
            creatorId,
            instagramAccountId: account.instagramUserId,
            operation: "refreshInstagramAccountMetrics"
        };

        // 1. Fetch latest profile data to refresh follower count
        let profileData;
        try {
            profileData = await fetchInstagramAccountProfile(account.instagramUserId, decryptedToken, context);
        } catch (profileErr) {
            if (profileErr?.isInvalidToken || profileErr?.metaCode === 190) {
                throw createApiError(401, "Instagram connection has expired or been revoked. Please reconnect.");
            }
            throw createApiError(502, profileErr.userFriendlyReason || profileErr.message || "Failed to fetch profile metrics from Instagram.");
        }

        // 2. Fetch recent media posts
        let mediaResult;
        try {
            mediaResult = await fetchRecentInstagramMedia(account.instagramUserId, decryptedToken, context);
        } catch (mediaErr) {
            if (mediaErr?.isInvalidToken || mediaErr?.metaCode === 190) {
                throw createApiError(401, "Instagram connection has expired or been revoked. Please reconnect.");
            }
            throw createApiError(502, mediaErr.userFriendlyReason || mediaErr.message || "Failed to fetch recent media from Instagram.");
        }

        const followersCount = typeof profileData?.followersCount === "number" ? profileData.followersCount : account.followersCount;
        const mediaCount = typeof profileData?.mediaCount === "number" ? profileData.mediaCount : account.mediaCount;

        // 3. Calculate engagement
        const postsToCalculate = mediaResult?.eligiblePosts || mediaResult?.posts || [];
        const engagementMetrics = calculateInstagramEngagement(postsToCalculate, followersCount);

        // 4. Prepare updates
        const igUpdateFields = {
            followersCount: Math.floor(followersCount),
            mediaCount: Math.floor(mediaCount),
            needsProfileSync: false,
            lastSyncedAt: new Date()
        };

        const profileUpdateFields = {
            followerCount: Math.floor(followersCount)
        };

        if (engagementMetrics.isAvailable) {
            igUpdateFields.engagementRate = engagementMetrics.engagementRate;
            igUpdateFields.averageLikes = engagementMetrics.averageLikes;
            igUpdateFields.averageComments = engagementMetrics.averageComments;
            igUpdateFields.engagementPostCount = engagementMetrics.engagementPostCount;
            igUpdateFields.engagementLastSyncedAt = new Date();

            profileUpdateFields.engagementRate = engagementMetrics.engagementRate;
        } else {
            igUpdateFields.engagementRate = null;
            igUpdateFields.averageLikes = null;
            igUpdateFields.averageComments = null;
            igUpdateFields.engagementPostCount = typeof engagementMetrics.engagementPostCount === "number" ? engagementMetrics.engagementPostCount : 0;
            igUpdateFields.engagementLastSyncedAt = new Date();

            profileUpdateFields.engagementRate = null;
        }

        // 5. Consistent multi-collection persistence with transaction fallback
        let session = null;
        let useTransaction = false;
        try {
            if (mongoose?.connection?.readyState === 1 && typeof mongoose?.startSession === "function") {
                session = await mongoose.startSession();
                session.startTransaction();
                useTransaction = true;
            }
        } catch {
            if (session) {
                try { await session.endSession(); } catch {}
                session = null;
            }
            useTransaction = false;
        }

        let didUpdateInstagramAccount = false;
        try {
            const sessionOpt = useTransaction && session ? { session } : {};
            const initialNeedsProfileSync = !useTransaction;

            const updatedAccount = await InstagramAccount.findOneAndUpdate(
                { _id: account._id },
                {
                    $set: {
                        ...igUpdateFields,
                        needsProfileSync: initialNeedsProfileSync
                    },
                    $inc: { syncVersion: 1 }
                },
                { returnDocument: "after", ...sessionOpt }
            );
            didUpdateInstagramAccount = true;
            const currentVersion = typeof updatedAccount.syncVersion === "number" ? updatedAccount.syncVersion : 1;

            let profileUpdated = false;
            try {
                const updatedProfile = await CreatorProfile.findOneAndUpdate(
                    {
                        user: creatorId,
                        $or: [
                            { instagramSyncVersion: { $lt: currentVersion } },
                            { instagramSyncVersion: null },
                            { instagramSyncVersion: { $exists: false } }
                        ]
                    },
                    {
                        $set: {
                            ...profileUpdateFields,
                            instagramSyncVersion: currentVersion
                        }
                    },
                    { returnDocument: "after", ...sessionOpt }
                );

                if (updatedProfile) {
                    profileUpdated = true;
                } else {
                    const profileExists = await CreatorProfile.exists({ user: creatorId }).session(sessionOpt.session || null);
                    if (profileExists) {
                        profileUpdated = true; // Profile is already on newer syncVersion
                    }
                }
            } catch (profileErr) {
                if (useTransaction) {
                    throw profileErr;
                }
                console.error("[Instagram Refresh Profile Sync Error]:", profileErr.message);
            }

            if (useTransaction) {
                if (!profileUpdated) {
                    // Profile does not exist: ensure needsProfileSync: true is persisted in transaction before commit
                    await InstagramAccount.updateOne(
                        { _id: account._id },
                        { $set: { needsProfileSync: true } },
                        { ...sessionOpt }
                    );
                    updatedAccount.needsProfileSync = true;
                }
                if (session) {
                    await session.commitTransaction();
                }
            } else if (profileUpdated) {
                // Standalone mode: clear born-dirty flag only with exact syncVersion match
                try {
                    await InstagramAccount.updateOne(
                        {
                            _id: account._id,
                            syncVersion: currentVersion,
                            needsProfileSync: true
                        },
                        { $set: { needsProfileSync: false } }
                    );
                    updatedAccount.needsProfileSync = false;
                } catch (clearErr) {
                    console.error("[Instagram Refresh Flag Clear Error]:", clearErr.message);
                }
            }

            return {
                success: true,
                message: "Instagram metrics refreshed successfully",
                account: {
                    instagramUserId: updatedAccount.instagramUserId,
                    username: updatedAccount.username,
                    accountType: updatedAccount.accountType || "",
                    profilePictureUrl: updatedAccount.profilePictureUrl || "",
                    followersCount: updatedAccount.followersCount,
                    mediaCount: updatedAccount.mediaCount,
                    engagementRate: updatedAccount.engagementRate,
                    averageLikes: updatedAccount.averageLikes,
                    averageComments: updatedAccount.averageComments,
                    engagementPostCount: updatedAccount.engagementPostCount,
                    engagementLastSyncedAt: updatedAccount.engagementLastSyncedAt,
                    needsProfileSync: Boolean(updatedAccount.needsProfileSync),
                    syncVersion: updatedAccount.syncVersion,
                    status: updatedAccount.status,
                    lastSyncedAt: updatedAccount.lastSyncedAt
                }
            };
        } catch (dbErr) {
            if (useTransaction && session) {
                try { await session.abortTransaction(); } catch {}
                try { await session.endSession(); } catch {}
                session = null;
            }

            // Standalone fallback retry strictly on confirmed unsupported-topology signatures
            if (useTransaction && isTransactionUnsupportedError(dbErr)) {
                useTransaction = false;
                try {
                    const updatedAccount = await InstagramAccount.findOneAndUpdate(
                        { _id: account._id },
                        {
                            $set: {
                                ...igUpdateFields,
                                needsProfileSync: true // Born-dirty in standalone fallback
                            },
                            $inc: { syncVersion: 1 }
                        },
                        { returnDocument: "after" }
                    );
                    didUpdateInstagramAccount = true;
                    const currentVersion = typeof updatedAccount.syncVersion === "number" ? updatedAccount.syncVersion : 1;

                    let profileUpdated = false;
                    try {
                        const updatedProfile = await CreatorProfile.findOneAndUpdate(
                            {
                                user: creatorId,
                                $or: [
                                    { instagramSyncVersion: { $lt: currentVersion } },
                                    { instagramSyncVersion: null },
                                    { instagramSyncVersion: { $exists: false } }
                                ]
                            },
                            {
                                $set: {
                                    ...profileUpdateFields,
                                    instagramSyncVersion: currentVersion
                                }
                            },
                            { returnDocument: "after" }
                        );

                        if (updatedProfile) {
                            profileUpdated = true;
                        } else {
                            const profileExists = await CreatorProfile.exists({ user: creatorId });
                            if (profileExists) {
                                profileUpdated = true;
                            }
                        }
                    } catch (standaloneProfileErr) {
                        console.error("[Instagram Refresh Standalone Profile Sync Error]:", standaloneProfileErr.message);
                    }

                    if (profileUpdated) {
                        try {
                            await InstagramAccount.updateOne(
                                {
                                    _id: account._id,
                                    syncVersion: currentVersion,
                                    needsProfileSync: true
                                },
                                { $set: { needsProfileSync: false } }
                            );
                            updatedAccount.needsProfileSync = false;
                        } catch {}
                    }

                    return {
                        success: true,
                        message: "Instagram metrics refreshed successfully",
                        account: {
                            instagramUserId: updatedAccount.instagramUserId,
                            username: updatedAccount.username,
                            accountType: updatedAccount.accountType || "",
                            profilePictureUrl: updatedAccount.profilePictureUrl || "",
                            followersCount: updatedAccount.followersCount,
                            mediaCount: updatedAccount.mediaCount,
                            engagementRate: updatedAccount.engagementRate,
                            averageLikes: updatedAccount.averageLikes,
                            averageComments: updatedAccount.averageComments,
                            engagementPostCount: updatedAccount.engagementPostCount,
                            engagementLastSyncedAt: updatedAccount.engagementLastSyncedAt,
                            needsProfileSync: Boolean(updatedAccount.needsProfileSync),
                            syncVersion: updatedAccount.syncVersion,
                            status: updatedAccount.status,
                            lastSyncedAt: updatedAccount.lastSyncedAt
                        }
                    };
                } catch (standaloneErr) {
                    dbErr = standaloneErr;
                }
            }

            console.error("[Instagram Refresh Persistence Error]:", dbErr.message);
            throw createApiError(500, "Failed to save updated Instagram metrics to database.");
        } finally {
            if (session) {
                try { await session.endSession(); } catch {}
            }
        }
    } finally {
        activeRefreshLocks.delete(creatorKey);
    }
};

/**
 * Automatically synchronizes stale connected Instagram accounts.
 * Safe for external scheduling (cron/worker) or configurable in-process timer.
 * Respects token status (only CONNECTED), catches Code 190, avoids duplicate concurrent processing.
 *
 * @param {Object} options - Sync options
 * @returns {Promise<Object>} Aggregated synchronization report
 */
const syncStaleInstagramAccounts = async ({ staleThresholdHours = 24, batchLimit = 50 } = {}) => {
    const thresholdDate = new Date(Date.now() - staleThresholdHours * 60 * 60 * 1000);
    const staleAccounts = await InstagramAccount.find({
        status: "CONNECTED",
        $or: [
            { lastSyncedAt: { $lt: thresholdDate } },
            { lastSyncedAt: null },
            { engagementLastSyncedAt: { $lt: thresholdDate } },
            { engagementLastSyncedAt: null }
        ]
    }).limit(batchLimit);

    const results = {
        total: staleAccounts.length,
        synced: 0,
        failed: 0,
        skipped: 0
    };

    for (const account of staleAccounts) {
        const creatorKey = account.creator.toString();
        if (activeRefreshLocks.has(creatorKey)) {
            results.skipped++;
            continue;
        }

        try {
            await refreshInstagramAccountMetrics(account.creator);
            results.synced++;
        } catch (err) {
            results.failed++;
            console.error(`[AutoSync] Failed to sync account for creator ${creatorKey}:`, err.message);
        }

        // Small delay to prevent bursting against Meta Graph API rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return results;
};

export {
    generateInstagramConnectUrl,
    processInstagramOAuthCallback,
    exchangeMetaAuthorizationCode,
    fetchAssignedInstagramAccounts,
    fetchInstagramAccountProfile,
    fetchRecentInstagramMedia,
    calculateInstagramEngagement,
    persistInstagramConnection,
    getConnectedInstagramAccount,
    refreshInstagramAccountMetrics,
    reconcilePendingProfileSync,
    syncStaleInstagramAccounts,
    classifyMetaError,
    handleMetaGraphApiError,
    isTransactionUnsupportedError,
    activeSyncLocks
};
