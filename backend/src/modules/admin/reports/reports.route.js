import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import { getReportsOverview } from "./reports.controller.js";

const router = express.Router();

router.use(authenticateUser, authorizeRoles("admin"));

router.get("/overview", getReportsOverview);
router.get("/", getReportsOverview);

export default router;

