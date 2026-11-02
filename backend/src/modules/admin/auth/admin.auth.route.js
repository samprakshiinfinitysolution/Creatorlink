import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    adminLogin,
    adminRefreshToken,
    getAdminMe,
    adminLogout
} from "./admin.auth.controller.js";
import {
    validateAdminLogin
} from "./admin.auth.validation.js";

const router = express.Router();

// Dedicated Admin Login endpoint
router.post(
    "/login",
    validateAdminLogin,
    adminLogin
);

// Dedicated Admin token refresh endpoint (called automatically when adminAccessToken expires)
router.post(
    "/refresh",
    adminRefreshToken
);

// Protected Admin session restoration
router.get(
    "/me",
    authenticateUser,
    authorizeRoles("admin"),
    getAdminMe
);

// Protected Admin logout
router.post(
    "/logout",
    authenticateUser,
    authorizeRoles("admin"),
    adminLogout
);

export default router;
