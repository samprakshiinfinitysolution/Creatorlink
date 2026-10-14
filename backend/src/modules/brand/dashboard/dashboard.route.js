import express from "express";

import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";

import { getBrandDashboardOverview } from "./dashboard.controller.js";
import { validateGetBrandDashboardQuery } from "./dashboard.validation.js";

const router = express.Router();

// Brand Dashboard routes require authentication and brand role authorization
router.use(
    authenticateUser,
    authorizeRoles("brand")
);

// Get Brand Dashboard overview metrics, recent campaigns, collaborations, and deadlines
router.get(
    "/",
    validateGetBrandDashboardQuery,
    getBrandDashboardOverview
);

export default router;
