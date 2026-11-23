import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    initiateInstagramConnect,
    handleInstagramCallback,
    getConnectedInstagramAccountDetails,
    refreshInstagramAccount
} from "./instagram.controller.js";

const router = express.Router();

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

// Public OAuth callback invoked by Meta after creator completes or cancels authorization.
// Single-use authentication and creator identity are verified cryptographically via state.
router.get(
    "/callback",
    handleInstagramCallback
);

export default router;
