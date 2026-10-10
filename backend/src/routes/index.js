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
import {
    creatorWorkspaceRouter,
    brandWorkspaceRouter
} from "../modules/workspace/workspace.route.js";
import {
    creatorMessagesRouter,
    brandMessagesRouter
} from "../modules/messages/messages.route.js";

const router = Router();

// Authentication routes.
router.use("/auth", authRoutes);

// Creator routes.
router.use("/creator/profile", creatorProfileRoutes);
router.use("/creator/portfolio", creatorPortfolioRoutes);
router.use("/creator/services", creatorServiceRoutes);
router.use("/creator/campaigns", creatorCampaignRoutes);
router.use("/creator/bookings", creatorBookingRouter);
router.use("/creator/workspace", creatorWorkspaceRouter);
router.use("/creator/messages", creatorMessagesRouter);

// Brand routes.
router.use("/brand/profile", brandProfileRoutes);
router.use("/brand/campaigns", campaignRoutes);
router.use("/brand/bookings", brandBookingRouter);
router.use("/brand/workspace", brandWorkspaceRouter);
router.use("/brand/messages", brandMessagesRouter);

export default router;