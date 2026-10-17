import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import {
    getDiscoverCreatorsService,
    getDiscoverCreatorByIdService
} from "./creators.service.js";

// Brand fetches discoverable creators with filtering, sorting, and pagination
const getDiscoverCreators = asyncHandler(async (req, res) => {
    const result = await getDiscoverCreatorsService(req.query);

    return sendResponse(
        res,
        200,
        "Creators fetched successfully",
        result
    );
});

// Brand fetches single creator public profile details by ID
const getDiscoverCreatorById = asyncHandler(async (req, res) => {
    const creator = await getDiscoverCreatorByIdService(req.params.id);

    return sendResponse(
        res,
        200,
        "Creator details fetched successfully",
        creator
    );
});

export {
    getDiscoverCreators,
    getDiscoverCreatorById
};
