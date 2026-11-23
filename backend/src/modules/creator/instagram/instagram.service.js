import createApiError from "../../../utils/ApiError.js";
import {
    generateOAuthState,
    consumeOAuthState
} from "./instagramOAuthState.helper.js";
import { encryptToken } from "../../../utils/helpers/encryption.helper.js";
import InstagramAccount from "./instagram.model.js";
import CreatorProfile from "../profile/profile.model.js";

// Helper to determine the configured frontend base URL without trailing slashes.
const getFrontendBaseUrl = () => {
    return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
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
const fetchAssignedInstagramAccounts = async (accessToken) => {
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
const fetchInstagramAccountProfile = async (instagramAccountId, accessToken) => {
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
        const metaError = new Error("Meta API rejected the request to fetch Instagram profile.");
        metaError.operation = "fetchInstagramAccountProfile";
        metaError.status = response?.status;
        if (data && typeof data === "object" && data.error) {
            metaError.metaCode = data.error.code;
            metaError.metaMessage = data.error.message;
            metaError.fbtraceId = data.error.fbtrace_id;
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

// Persists verified Instagram account credentials and profile metrics into MongoDB.
// Encrypts access token with AES-256-GCM, prevents duplicate/cross-creator accounts,
// calculates token expiration, updates InstagramAccount atomically, and syncs CreatorProfile.
const persistInstagramConnection = async ({ creatorId, tokenData, profileData }) => {
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

    // 5. Atomic upsert into InstagramAccount collection using { creator: creatorId }
    try {
        await InstagramAccount.findOneAndUpdate(
            { creator: creatorId },
            {
                $set: {
                    instagramUserId: profileData.instagramUserId.trim(),
                    username: profileData.username.trim(),
                    accountType: typeof profileData.accountType === "string" ? profileData.accountType.trim() : "",
                    profilePictureUrl: typeof profileData.profilePictureUrl === "string" ? profileData.profilePictureUrl.trim() : "",
                    followersCount: Math.floor(profileData.followersCount),
                    mediaCount: Math.floor(profileData.mediaCount),
                    encryptedAccessToken: encryptedToken,
                    tokenExpiresAt,
                    lastSyncedAt: new Date()
                }
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true
            }
        );
    } catch (dbErr) {
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

        return {
            success: false,
            redirectUrl: `${frontendBaseUrl}/creator/settings?instagram=error&message=${encodeURIComponent(
                "Failed to save Instagram connection to database."
            )}`
        };
    }

    // 6. Decoupled CreatorProfile synchronization (resilient: failures do not invalidate the Instagram connection)
    try {
        await CreatorProfile.findOneAndUpdate(
            { user: creatorId },
            {
                $set: {
                    followerCount: Math.floor(profileData.followersCount),
                    "socialLinks.instagram": `https://instagram.com/${profileData.username.trim()}`
                }
            }
        );
    } catch (profileSyncErr) {
        console.warn("CreatorProfile sync skipped or failed during Instagram connection:", profileSyncErr.message);
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
        discoveryResult = await fetchAssignedInstagramAccounts(tokenData.accessToken);
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
            tokenData.accessToken
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

    // 7. Step 5E: Persist encrypted credentials, profile metrics and sync CreatorProfile
    const persistenceResult = await persistInstagramConnection({
        creatorId,
        tokenData,
        profileData
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
        redirectUrl: persistenceResult.redirectUrl
    };
};

// Retrieves the connected Instagram account details for the authenticated creator.
// Excludes encrypted access tokens and returns safe public profile metrics.
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

    return {
        isConnected: true,
        account: {
            instagramUserId: account.instagramUserId,
            username: account.username,
            accountType: account.accountType || "",
            profilePictureUrl: account.profilePictureUrl || "",
            followersCount: typeof account.followersCount === "number" ? account.followersCount : 0,
            mediaCount: typeof account.mediaCount === "number" ? account.mediaCount : 0,
            lastSyncedAt: account.lastSyncedAt || null,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt
        }
    };
};

export {
    generateInstagramConnectUrl,
    processInstagramOAuthCallback,
    exchangeMetaAuthorizationCode,
    fetchAssignedInstagramAccounts,
    fetchInstagramAccountProfile,
    persistInstagramConnection,
    getConnectedInstagramAccount
};
