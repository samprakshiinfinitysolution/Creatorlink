import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";
import {
    getAdminSubscriptionAnalyticsService,
    createSubscriptionPlanAdminService,
    updateSubscriptionPlanAdminService,
    togglePlanStatusAdminService,
    getAllPlansAdminService,
    getAllSubscribersAdminService,
    getSubscriberDetailAdminService,
    grantComplimentarySubscriptionService,
    extendTrialAdminService,
    suspendSubscriptionAdminService,
    reinstateSubscriptionAdminService,
    cancelSubscriptionAdminService
} from "./adminSubscription.service.js";

export const getAdminSubscriptionAnalytics = asyncHandler(async (req, res) => {
    const data = await getAdminSubscriptionAnalyticsService();
    return sendResponse(res, 200, "Subscription analytics fetched successfully", data);
});

export const createSubscriptionPlanAdmin = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const plan = await createSubscriptionPlanAdminService(adminId, req.body);
    return sendResponse(res, 201, "Subscription plan created successfully", plan);
});

export const updateSubscriptionPlanAdmin = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const { planId } = req.params;
    const { reason, ...updateData } = req.body;
    const plan = await updateSubscriptionPlanAdminService(adminId, planId, updateData, reason);
    return sendResponse(res, 200, "Subscription plan updated successfully", plan);
});

export const togglePlanStatusAdmin = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const { planId } = req.params;
    const { isActive, reason } = req.body;
    const plan = await togglePlanStatusAdminService(adminId, planId, isActive, reason);
    return sendResponse(res, 200, "Subscription plan status toggled successfully", plan);
});

export const getAllPlansAdmin = asyncHandler(async (req, res) => {
    const plans = await getAllPlansAdminService();
    return sendResponse(res, 200, "All subscription plans fetched successfully", plans);
});

export const getAllSubscribersAdmin = asyncHandler(async (req, res) => {
    const result = await getAllSubscribersAdminService(req.query);
    return sendResponse(res, 200, "Subscribers list fetched successfully", result);
});

export const getSubscriberDetailAdmin = asyncHandler(async (req, res) => {
    const { subscriptionId } = req.params;
    const detail = await getSubscriberDetailAdminService(subscriptionId);
    return sendResponse(res, 200, "Subscriber detail fetched successfully", detail);
});

export const grantComplimentarySubscription = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const sub = await grantComplimentarySubscriptionService(adminId, req.body);
    return sendResponse(res, 200, "Complimentary subscription granted successfully", sub);
});

export const extendTrialAdmin = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const sub = await extendTrialAdminService(adminId, req.body);
    return sendResponse(res, 200, "Trial extended successfully", sub);
});

export const suspendSubscriptionAdmin = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const sub = await suspendSubscriptionAdminService(adminId, req.body);
    return sendResponse(res, 200, "Subscription suspended successfully", sub);
});

export const reinstateSubscriptionAdmin = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const sub = await reinstateSubscriptionAdminService(adminId, req.body);
    return sendResponse(res, 200, "Subscription reinstated successfully", sub);
});

export const cancelSubscriptionAdmin = asyncHandler(async (req, res) => {
    const adminId = req.user.userId || req.user._id;
    const sub = await cancelSubscriptionAdminService(adminId, req.body);
    return sendResponse(res, 200, "Subscription canceled successfully", sub);
});

export default {
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
};

