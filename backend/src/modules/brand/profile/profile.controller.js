import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";

import {
    createProfileService,
    getMyProfileService,
    updateProfileService
} from "./profile.service.js";


// Create brand profile
const createProfile = asyncHandler(async (req, res) => {

    const profile = await createProfileService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        201,
        "Brand profile created successfully",
        profile
    );
});


// Get logged-in brand profile
const getMyProfile = asyncHandler(async (req, res) => {

    const profile = await getMyProfileService(
        req.user.userId
    );

    return sendResponse(
        res,
        200,
        "Brand profile fetched successfully",
        profile
    );
});


// Update logged-in brand profile
const updateMyProfile = asyncHandler(async (req, res) => {

    const profile = await updateProfileService(
        req.user.userId,
        req.body
    );

    return sendResponse(
        res,
        200,
        "Brand profile updated successfully",
        profile
    );
});


export {
    createProfile,
    getMyProfile,
    updateMyProfile
};