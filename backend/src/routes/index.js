import { Router } from "express";

import authRoutes from "../modules/auth/auth.route.js";
import creatorProfileRoutes from "../modules/creator/profile/profile.route.js";
import creatorPortfolioRoutes from "../modules/creator/portfolio/portfolio.route.js";
import creatorServiceRoutes from "../modules/creator/services/services.route.js";

const router = Router();

// Authentication routes.
router.use("/auth", authRoutes);

// Creator profile routes.
router.use("/creator/profile", creatorProfileRoutes);
router.use("/creator/portfolio", creatorPortfolioRoutes);
router.use("/creator/services", creatorServiceRoutes);

export default router;