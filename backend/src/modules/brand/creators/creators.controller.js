import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import {
    getDiscoverCreatorsService,
    getDiscoverCreatorByIdService,
    saveCreatorService,
    unsaveCreatorService,
    getSavedCreatorsService,
    getSavedCreatorIdsService
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

// Brand saves a creator to shortlist
const saveCreator = asyncHandler(async (req, res) => {
    const result = await saveCreatorService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Creator saved to shortlist",
        result
    );
});

// Brand removes a creator from shortlist
const unsaveCreator = asyncHandler(async (req, res) => {
    const result = await unsaveCreatorService(
        req.user.userId,
        req.params.id
    );

    return sendResponse(
        res,
        200,
        "Creator removed from shortlist",
        result
    );
});

// Brand fetches full shortlist of saved creators
const getSavedCreators = asyncHandler(async (req, res) => {
    const result = await getSavedCreatorsService(req.user.userId);

    return sendResponse(
        res,
        200,
        "Saved creators fetched successfully",
        result
    );
});

// Brand fetches list of saved creator IDs
const getSavedCreatorIds = asyncHandler(async (req, res) => {
    const result = await getSavedCreatorIdsService(req.user.userId);

    return sendResponse(
        res,
        200,
        "Saved creator IDs fetched successfully",
        result
    );
});

export {
    getDiscoverCreators,
    getDiscoverCreatorById,
    saveCreator,
    unsaveCreator,
    getSavedCreators,
    getSavedCreatorIds
};
