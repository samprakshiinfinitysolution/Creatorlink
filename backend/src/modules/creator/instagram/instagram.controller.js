import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import {
    generateInstagramConnectUrl,
    processInstagramOAuthCallback,
    getConnectedInstagramAccount,
    refreshInstagramAccountMetrics
} from "./instagram.service.js";

// Initiates the Meta Instagram Unified Login OAuth flow for the authenticated creator.
const initiateInstagramConnect = asyncHandler(async (req, res) => {
    const authUrl = await generateInstagramConnectUrl(req.user.userId);

    return sendResponse(
        res,
        200,
        "Instagram authorization URL generated successfully",
        {
            authUrl
        }
    );
});

// Handles the Meta Instagram Unified Login OAuth callback.
// Public endpoint: Creator authorization is verified cryptographically via single-use OAuth state.
// Tokens and credentials are stored strictly server-side and never exposed in responses or redirects.
const handleInstagramCallback = asyncHandler(async (req, res) => {
    const { code, state, error, error_reason, error_description } = req.query;

    const result = await processInstagramOAuthCallback({
        code,
        state,
        error,
        errorReason: error_reason,
        errorDescription: error_description
    });

    const fallbackUrl = `${(process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "")}/creator/settings?instagram=error`;
    const targetRedirect = result && typeof result.redirectUrl === "string" && result.redirectUrl.length > 0
        ? result.redirectUrl
        : fallbackUrl;

    return res.redirect(targetRedirect);
});

// Retrieves the connected Instagram account details for the authenticated creator.
// Returns isConnected: false when not connected, or isConnected: true with safe account details.
// Never exposes encrypted tokens or secrets.
const getConnectedInstagramAccountDetails = asyncHandler(async (req, res) => {
    const data = await getConnectedInstagramAccount(req.user.userId);

    return sendResponse(
        res,
        200,
        data.isConnected
            ? "Connected Instagram account retrieved successfully"
            : "No Instagram account connected for this creator",
        data
    );
});

// Manually refreshes Instagram metrics (profile & engagement) for the authenticated creator.
// Excludes encrypted credentials and returns safe updated account metrics.
const refreshInstagramAccount = asyncHandler(async (req, res) => {
    const data = await refreshInstagramAccountMetrics(req.user.userId);

    return sendResponse(
        res,
        200,
        data.message || "Instagram metrics refreshed successfully",
        data
    );
});

export {
    initiateInstagramConnect,
    handleInstagramCallback,
    getConnectedInstagramAccountDetails,
    refreshInstagramAccount
};
