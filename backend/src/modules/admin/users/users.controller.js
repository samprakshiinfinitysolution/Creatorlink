import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import {
    getAdminUsersService,
    getAdminUserByIdService
} from "./users.service.js";

// Fetches paginated platform users with filtering and search
const getAdminUsers = asyncHandler(async (req, res) => {
    const data = await getAdminUsersService(req.query);

    return sendResponse(
        res,
        200,
        "Users fetched successfully",
        data
    );
});

// Fetches single user dossier by ID
const getAdminUserById = asyncHandler(async (req, res) => {
    const data = await getAdminUserByIdService(req.params.id);

    return sendResponse(
        res,
        200,
        "User details fetched successfully",
        data
    );
});

export {
    getAdminUsers,
    getAdminUserById
};

