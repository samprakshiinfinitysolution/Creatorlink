import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import {
    getAdminProfileService,
    updateAdminProfileService,
    uploadAdminAvatarService,
    deleteAdminAvatarService,
    changeAdminPasswordService,
    getSystemInfoService
} from "./settings.service.js";

const getAdminProfile = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id || req.user?.id;
    const profile = await getAdminProfileService(adminId);
    return sendResponse(res, 200, "Admin profile fetched successfully", profile);
});

const updateAdminProfile = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id || req.user?.id;
    const updated = await updateAdminProfileService(adminId, req.body);
    return sendResponse(res, 200, "Admin name updated successfully", updated);
});

const uploadAdminAvatar = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id || req.user?.id;
    const fileBuffer = req.file?.buffer;
    const updated = await uploadAdminAvatarService(adminId, fileBuffer);
    return sendResponse(res, 200, "Admin avatar updated successfully", updated);
});

const deleteAdminAvatar = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id || req.user?.id;
    const updated = await deleteAdminAvatarService(adminId);
    return sendResponse(res, 200, "Admin avatar removed successfully", updated);
});

const changeAdminPassword = asyncHandler(async (req, res) => {
    const adminId = req.user?.userId || req.user?._id || req.user?.id;
    const result = await changeAdminPasswordService(adminId, req.body);
    return sendResponse(res, 200, result.message, null);
});

const getSystemInfo = asyncHandler(async (req, res) => {
    const info = await getSystemInfoService();
    return sendResponse(res, 200, "System info fetched successfully", info);
});

export {
    getAdminProfile,
    updateAdminProfile,
    uploadAdminAvatar,
    deleteAdminAvatar,
    changeAdminPassword,
    getSystemInfo
};
