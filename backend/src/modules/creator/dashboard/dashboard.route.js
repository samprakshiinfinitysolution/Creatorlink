import express from "express";

import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";

import { getCreatorDashboardOverview } from "./dashboard.controller.js";
import { validateGetCreatorDashboardQuery } from "./dashboard.validation.js";

const router = express.Router();

// Creator Dashboard routes require authentication and creator role authorization
router.use(
    authenticateUser,
    authorizeRoles("creator")
);

// Get Creator Dashboard overview metrics, recent collaborations, and deadlines
router.get(
    "/",
    validateGetCreatorDashboardQuery,
    getCreatorDashboardOverview
);

export default router;
