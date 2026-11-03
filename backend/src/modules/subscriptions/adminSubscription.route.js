import express from "express";
import authenticateUser from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";
import {
    getAdminSubscriptionAnalytics,
    createSubscriptionPlanAdmin,
    updateSubscriptionPlanAdmin,
    togglePlanStatusAdmin,
    getAllPlansAdmin,
    getAllSubscribersAdmin,
    getSubscriberDetailAdmin,
    grantComplimentarySubscription,
    extendTrialAdmin,
    suspendSubscriptionAdmin,
    reinstateSubscriptionAdmin,
    cancelSubscriptionAdmin
} from "./adminSubscription.controller.js";

const router = express.Router();

// Strict RBAC: All Admin Subscription routes require verified Admin role
router.use(
    authenticateUser,
    authorizeRoles("admin")
);

// 1. Subscription Telemetry & Analytics Dashboard
router.get("/analytics", getAdminSubscriptionAnalytics);

// 2. Plan Management
router.get("/plans", getAllPlansAdmin);
router.post("/plans", createSubscriptionPlanAdmin);
router.patch("/plans/:planId", updateSubscriptionPlanAdmin);
router.patch("/plans/:planId/status", togglePlanStatusAdmin);

// 3. Subscriber Management
router.get("/subscribers", getAllSubscribersAdmin);
router.get("/subscribers/:subscriptionId", getSubscriberDetailAdmin);

// 4. Admin Privileged Actions (All require reason and record audit logs)
router.post("/actions/complimentary", grantComplimentarySubscription);
router.post("/actions/extend-trial", extendTrialAdmin);
router.post("/actions/suspend", suspendSubscriptionAdmin);
router.post("/actions/reinstate", reinstateSubscriptionAdmin);
router.post("/actions/cancel", cancelSubscriptionAdmin);

export default router;

