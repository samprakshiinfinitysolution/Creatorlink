import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    initiateInstagramConnect,
    handleInstagramCallback,
    getConnectedInstagramAccountDetails,
    refreshInstagramAccount,
    disconnectInstagramAccountHandler,
    selectInstagramAccount,
    getPendingInstagramAccounts
} from "./instagram.controller.js";

const router = express.Router();

// Retrieves eligible accounts from a valid selection ticket
router.post(
    "/pending-accounts",
    authenticateUser,
    authorizeRoles("creator"),
    getPendingInstagramAccounts
);

// Selects a specific Instagram account when Meta OAuth yields multiple accounts
router.post(
    "/select-account",
    authenticateUser,
    authorizeRoles("creator"),
    selectInstagramAccount
);

// Initiates Meta Instagram Unified Login OAuth for the currently authenticated creator.
router.get(
    "/connect",
    authenticateUser,
    authorizeRoles("creator"),
    initiateInstagramConnect
);

// Retrieves the connected Instagram account details for the authenticated creator.
router.get(
    "/account",
    authenticateUser,
    authorizeRoles("creator"),
    getConnectedInstagramAccountDetails
);

// Manually refreshes Instagram profile metrics and engagement statistics for the authenticated creator.
router.post(
    "/refresh",
    authenticateUser,
    authorizeRoles("creator"),
    refreshInstagramAccount
);

// Also provide /sync alias for convenience
router.post(
    "/sync",
    authenticateUser,
    authorizeRoles("creator"),
    refreshInstagramAccount
);

// Disconnects connected Instagram account and resets verified metrics.
router.post(
    "/disconnect",
    authenticateUser,
    authorizeRoles("creator"),
    disconnectInstagramAccountHandler
);

router.delete(
    "/account",
    authenticateUser,
    authorizeRoles("creator"),
    disconnectInstagramAccountHandler
);

// Public OAuth callback invoked by Meta after creator completes or cancels authorization.
// Single-use authentication and creator identity are verified cryptographically via state.
router.get(
    "/callback",
    handleInstagramCallback
);

export default router;
