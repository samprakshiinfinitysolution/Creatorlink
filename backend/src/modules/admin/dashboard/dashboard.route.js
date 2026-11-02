import express from "express";

import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";

import { getAdminDashboardOverview } from "./dashboard.controller.js";
import { validateGetAdminDashboardQuery } from "./dashboard.validation.js";

const router = express.Router();

// Strict RBAC: All Admin Dashboard routes require valid JWT authentication and role === "admin"
router.use(
    authenticateUser,
    authorizeRoles("admin")
);

// Fetches platform overview metrics, financial totals, and recent activity feed
router.get(
    "/overview",
    validateGetAdminDashboardQuery,
    getAdminDashboardOverview
);

// Fallback alias for root dashboard query
router.get(
    "/",
    validateGetAdminDashboardQuery,
    getAdminDashboardOverview
);

export default router;

