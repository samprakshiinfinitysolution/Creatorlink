import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";

import {
    createProfileService,
    getMyProfileService,
    updateProfileService
} from "./profile.service.js";
import {
    getCreatorContactConsentService,
    updateCreatorContactConsentService
} from "../../subscriptions/contactUnlock.service.js";


// Create creator profile
const createProfile = asyncHandler(async (req, res) => {

    const profile = await createProfileService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        201,
        "Creator profile created successfully",
        profile
    );
});


// Get logged-in creator profile
const getMyProfile = asyncHandler(async (req, res) => {

    const profile = await getMyProfileService(
        req.user.userId
    );

    return sendResponse(
        res,
        200,
        "Creator profile fetched successfully",
        profile
    );
});


// Update logged-in creator profile
const updateMyProfile = asyncHandler(async (req, res) => {

    const profile = await updateProfileService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        200,
        "Creator profile updated successfully",
        profile
    );
});


// Get creator's own contact privacy and sharing consent settings
const getContactPrivacy = asyncHandler(async (req, res) => {
    const privacy = await getCreatorContactConsentService(req.user.userId);

    return sendResponse(
        res,
        200,
        "Creator contact privacy settings fetched successfully",
        privacy
    );
});


// Update creator's contact privacy and sharing consent settings
const updateContactPrivacy = asyncHandler(async (req, res) => {
    const updated = await updateCreatorContactConsentService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        200,
        "Creator contact privacy settings updated successfully",
        updated
    );
});


export {
    createProfile,
    getMyProfile,
    updateMyProfile,
    getContactPrivacy,
    updateContactPrivacy
};