import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";
import createApiError from "../../utils/ApiError.js";
import Subscription from "./subscription.model.js";
import SubscriptionPlan from "./plan.model.js";
import SubscriptionPayment from "./subscriptionPayment.model.js";
import Auth from "../auth/auth.model.js";
import { createBrandTrialSubscriptionService } from "./trial.service.js";
import { evaluateBrandEntitlement } from "./entitlement.service.js";
import { syncBrandSubscriptionExpiry } from "./expiry.service.js";
import {
    checkCreatorUnlockStatusService,
    unlockCreatorContactService,
    getBrandUnlockedCreatorsService
} from "./contactUnlock.service.js";

/**
 * Returns the authenticated Brand's current subscription document.
 * GET /api/subscriptions/current
 */
export const getCurrentSubscription = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;

    // Trigger proactive expiry evaluation and campaign pause sync
    await syncBrandSubscriptionExpiry(brandId);

    let subscription = await Subscription.findOne({ brand: brandId }).populate("plan");
    if (!subscription) {
        const brandUser = await Auth.findById(brandId).select("name email role");
        if (brandUser && brandUser.role === "brand") {
            const trialResult = await createBrandTrialSubscriptionService({
                brandId: brandUser._id,
                email: brandUser.email,
                name: brandUser.name
            });
            subscription = trialResult?.subscription || (await Subscription.findOne({ brand: brandId }).populate("plan"));
        }
    }

    return sendResponse(
        res,
        200,
        "Current subscription retrieved successfully",
        subscription || null
    );
});

/**
 * Returns full entitlement status breakdown (server UTC verified).
 * GET /api/subscriptions/status
 */
export const getSubscriptionStatus = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;

    // Trigger proactive expiry sync
    await syncBrandSubscriptionExpiry(brandId);

    const entitlement = await evaluateBrandEntitlement(brandId);

    return sendResponse(
        res,
        200,
        "Subscription entitlement status evaluated successfully",
        entitlement
    );
});

/**
 * Returns all active subscription plans available for purchase.
 * GET /api/subscriptions/plans
 */
export const getAvailablePlans = asyncHandler(async (req, res) => {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ priceMonthly: 1 });

    return sendResponse(
        res,
        200,
        "Available subscription plans retrieved successfully",
        plans
    );
});

/**
 * Returns contact unlock usage breakdown and quota remaining.
 * GET /api/subscriptions/usage
 */
export const getSubscriptionUsage = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;

    const entitlement = await evaluateBrandEntitlement(brandId);

    return sendResponse(
        res,
        200,
        "Subscription usage retrieved successfully",
        {
            billingCycle: entitlement.billingCycle,
            isTrial: entitlement.isTrial,
            status: entitlement.status,
            totalQuota: entitlement.totalContactQuota,
            usedQuota: entitlement.usedContactQuota,
            remainingQuota: entitlement.remainingContactQuota,
            canUnlockCreator: entitlement.canUnlockCreator,
            trialEndDate: entitlement.trialEndDate,
            currentPeriodEnd: entitlement.currentPeriodEnd
        }
    );
});

/**
 * Returns subscription history for the authenticated Brand.
 * GET /api/subscriptions/history
 */
export const getSubscriptionHistory = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;

    const history = await Subscription.find({ brand: brandId })
        .populate("plan")
        .sort({ createdAt: -1 });

    return sendResponse(
        res,
        200,
        "Subscription history retrieved successfully",
        history
    );
});

/**
 * Returns renewal, expiration, and billing cycle timing details.
 * GET /api/subscriptions/billing
 */
export const getSubscriptionBilling = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;

    let subscription = await Subscription.findOne({ brand: brandId }).populate("plan");
    if (!subscription) {
        const brandUser = await Auth.findById(brandId).select("name email role");
        if (brandUser && brandUser.role === "brand") {
            const trialResult = await createBrandTrialSubscriptionService({
                brandId: brandUser._id,
                email: brandUser.email,
                name: brandUser.name
            });
            subscription = trialResult?.subscription || (await Subscription.findOne({ brand: brandId }).populate("plan"));
        }
    }

    if (!subscription) {
        throw createApiError(404, "No subscription found for this brand");
    }

    const now = new Date();
    const isTrial = subscription.billingCycle === "trial";
    const isExpired = isTrial
        ? Boolean(subscription.trialEndDate && now >= subscription.trialEndDate)
        : Boolean(subscription.currentPeriodEnd && now >= subscription.currentPeriodEnd);

    return sendResponse(
        res,
        200,
        "Subscription billing details retrieved successfully",
        {
            status: subscription.status,
            billingCycle: subscription.billingCycle,
            isTrial,
            isExpired,
            isComplimentary: subscription.isComplimentary,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            canceledAt: subscription.canceledAt,
            trialStartDate: subscription.trialStartDate,
            trialEndDate: subscription.trialEndDate,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            gracePeriodEnd: subscription.gracePeriodEnd,
            planSnapshot: subscription.planSnapshot
        }
    );
});

/**
 * Returns subscription payment transaction records for the authenticated Brand.
 * GET /api/subscriptions/payments
 */
export const getSubscriptionPayments = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;

    const payments = await SubscriptionPayment.find({ brand: brandId })
        .populate("plan")
        .sort({ createdAt: -1 });

    return sendResponse(
        res,
        200,
        "Subscription payment history retrieved successfully",
        payments
    );
});

/**
 * Checks whether the Brand has unlocked a Creator.
 * GET /api/subscriptions/unlocks/check/:creatorId
 */
export const checkCreatorUnlockStatus = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;
    const { creatorId } = req.params;

    const result = await checkCreatorUnlockStatusService({
        brandId,
        creatorId
    });

    return sendResponse(
        res,
        200,
        "Creator unlock status checked successfully",
        result
    );
});

/**
 * Unlocks a Creator's direct contact information.
 * POST /api/subscriptions/unlocks/:creatorId
 */
export const unlockCreatorContact = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;
    const { creatorId } = req.params;

    const result = await unlockCreatorContactService({
        brandId,
        creatorId
    });

    return sendResponse(
        res,
        200,
        result.alreadyUnlocked
            ? "Creator contact information already unlocked"
            : "Creator contact information unlocked successfully",
        result
    );
});

/**
 * Returns all creators unlocked by the authenticated Brand.
 * GET /api/subscriptions/unlocks
 */
export const getBrandUnlockedCreators = asyncHandler(async (req, res) => {
    const brandId = req.user.userId || req.user._id;

    const unlocked = await getBrandUnlockedCreatorsService(brandId);

    return sendResponse(
        res,
        200,
        "Unlocked creators list retrieved successfully",
        unlocked
    );
});

export default {
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
};
