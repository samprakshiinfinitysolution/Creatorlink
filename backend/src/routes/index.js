import { Router } from "express";

import authRoutes from "../modules/auth/auth.route.js";
import creatorProfileRoutes from "../modules/creator/profile/profile.route.js";
import creatorPortfolioRoutes from "../modules/creator/portfolio/portfolio.route.js";
import creatorServiceRoutes from "../modules/creator/services/services.route.js";
import creatorCampaignRoutes from "../modules/creator/campaigns/campaigns.route.js";
import brandProfileRoutes from "../modules/brand/profile/profile.route.js";
import campaignRoutes from "../modules/brand/campaigns/campaign.route.js";
import {
    creatorBookingRouter,
    brandBookingRouter
} from "../modules/booking/booking.route.js";

const router = Router();

// Authentication routes.
router.use("/auth", authRoutes);

// Creator routes.
router.use("/creator/profile", creatorProfileRoutes);
router.use("/creator/portfolio", creatorPortfolioRoutes);
router.use("/creator/services", creatorServiceRoutes);
router.use("/creator/campaigns", creatorCampaignRoutes);
router.use("/creator/bookings", creatorBookingRouter);

// Brand routes.
router.use("/brand/profile", brandProfileRoutes);
router.use("/brand/campaigns", campaignRoutes);
router.use("/brand/bookings", brandBookingRouter);

export default router;