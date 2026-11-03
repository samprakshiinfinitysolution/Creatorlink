import express from "express";
import authenticateUser from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";
import {
    getCurrentSubscription,
    getSubscriptionStatus,
    getAvailablePlans,
    getSubscriptionUsage,
    getSubscriptionHistory,
    getSubscriptionBilling,
    getSubscriptionPayments,
    checkCreatorUnlockStatus,
    unlockCreatorContact,
    getBrandUnlockedCreators
} from "./subscription.controller.js";

import {
    createSubscriptionOrder,
    verifySubscriptionPayment,
    handleSubscriptionWebhook
} from "./subscriptionPayment.controller.js";

const router = express.Router();

// Publicly viewable active subscription plans
router.get("/plans", getAvailablePlans);

// Brand-protected subscription endpoints
router.get("/current", authenticateUser, authorizeRoles("brand"), getCurrentSubscription);
router.get("/status", authenticateUser, authorizeRoles("brand"), getSubscriptionStatus);
router.get("/usage", authenticateUser, authorizeRoles("brand"), getSubscriptionUsage);
router.get("/history", authenticateUser, authorizeRoles("brand"), getSubscriptionHistory);
router.get("/billing", authenticateUser, authorizeRoles("brand"), getSubscriptionBilling);
router.get("/payments", authenticateUser, authorizeRoles("brand"), getSubscriptionPayments);

// Brand Contact Unlock endpoints
router.get("/unlocks", authenticateUser, authorizeRoles("brand"), getBrandUnlockedCreators);
router.get("/unlocks/check/:creatorId", authenticateUser, authorizeRoles("brand"), checkCreatorUnlockStatus);
router.post("/unlocks/:creatorId", authenticateUser, authorizeRoles("brand"), unlockCreatorContact);

// Razorpay Subscription Payment endpoints
router.post("/payment/order", authenticateUser, authorizeRoles("brand"), createSubscriptionOrder);
router.post("/payment/verify", authenticateUser, authorizeRoles("brand"), verifySubscriptionPayment);
router.post("/payment/webhook", handleSubscriptionWebhook);

export default router;
