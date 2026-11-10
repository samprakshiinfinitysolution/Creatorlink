import { Router } from "express";

import authRoutes from "../modules/auth/auth.route.js";
import creatorProfileRoutes from "../modules/creator/profile/profile.route.js";
import creatorPortfolioRoutes from "../modules/creator/portfolio/portfolio.route.js";
import creatorServiceRoutes from "../modules/creator/services/services.route.js";
import creatorCampaignRoutes from "../modules/creator/campaigns/campaigns.route.js";
import creatorDashboardRoutes from "../modules/creator/dashboard/dashboard.route.js";
import brandProfileRoutes from "../modules/brand/profile/profile.route.js";
import campaignRoutes from "../modules/brand/campaigns/campaign.route.js";
import brandDashboardRoutes from "../modules/brand/dashboard/dashboard.route.js";
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
import {
    creatorPaymentRouter,
    brandPaymentRouter
} from "../modules/payments/payment.route.js";
import {
    creatorReviewRouter,
    brandReviewRouter
} from "../modules/reviews/reviews.route.js";
import brandCreatorsRouter from "../modules/brand/creators/creators.route.js";
import uploadRoutes from "../modules/upload/upload.route.js";
import notificationRouter from "../modules/notifications/notification.route.js";
import adminAuthRoutes from "../modules/admin/auth/admin.auth.route.js";
import adminDashboardRoutes from "../modules/admin/dashboard/dashboard.route.js";
import adminUsersRoutes from "../modules/admin/users/users.route.js";
import adminVerificationRoutes from "../modules/admin/verification/verification.route.js";
import adminCampaignRoutes from "../modules/admin/campaigns/campaigns.route.js";
import adminCollaborationRoutes from "../modules/admin/collaborations/collaborations.route.js";
import homepageRoutes from "../modules/homepage/homepage.route.js";
import subscriptionRoutes from "../modules/subscriptions/subscription.route.js";
import adminSubscriptionRoutes from "../modules/subscriptions/adminSubscription.route.js";
import adminSettingsRoutes from "../modules/admin/settings/settings.route.js";
import adminReportsRoutes from "../modules/admin/reports/reports.route.js";
import authenticateUser from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = Router();

// Homepage / Public routes.
router.use("/homepage", homepageRoutes);

// Authentication routes.
router.use("/auth", authRoutes);

// Notification routes (shared endpoints and role aliases).
router.use("/notifications", notificationRouter);
router.use("/creator/notifications", notificationRouter);
router.use("/brand/notifications", notificationRouter);

// Creator routes.
router.use("/creator/dashboard", creatorDashboardRoutes);
router.use("/creator/profile", creatorProfileRoutes);
router.use("/creator/portfolio", creatorPortfolioRoutes);
router.use("/creator/services", creatorServiceRoutes);
router.use("/creator/campaigns", creatorCampaignRoutes);
router.use("/creator/bookings", creatorBookingRouter);
router.use("/creator/workspace", creatorWorkspaceRouter);
router.use("/creator/messages", creatorMessagesRouter);
router.use("/creator/payments", creatorPaymentRouter);
router.use("/creator/reviews", creatorReviewRouter);

// Subscription routes.
router.use("/subscriptions", subscriptionRoutes);
router.use("/brand/subscriptions", subscriptionRoutes);

// Brand routes.
router.use("/brand/dashboard", brandDashboardRoutes);
router.use("/brand/profile", brandProfileRoutes);
router.use("/brand/campaigns", campaignRoutes);
router.use("/brand/creators", brandCreatorsRouter);
router.use("/brand/bookings", brandBookingRouter);
router.use("/brand/workspace", brandWorkspaceRouter);
router.use("/brand/messages", brandMessagesRouter);
router.use("/brand/payments", brandPaymentRouter);
router.use("/brand/reviews", brandReviewRouter);

// Admin routes.
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/notifications", authenticateUser, authorizeRoles("admin"), notificationRouter);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/users", adminUsersRoutes);
router.use("/admin/verifications", adminVerificationRoutes);
router.use("/admin/campaigns", adminCampaignRoutes);
router.use("/admin/collaborations", adminCollaborationRoutes);
router.use("/admin/subscriptions", adminSubscriptionRoutes);
router.use("/admin/settings", adminSettingsRoutes);
router.use("/admin/reports", adminReportsRoutes);

// Upload routes.
router.use("/upload", uploadRoutes);

export default router;
