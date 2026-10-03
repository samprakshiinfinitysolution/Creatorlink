import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";

import {
    createService,
    getMyServices,
    getServiceById,
    updateService,
    deleteService
} from "./services.service.js";


// Create a new creator service.
const createCreatorService = asyncHandler(
    async (req, res) => {

        const service = await createService(
            req.user.userId,
            req.body
        );


        return sendResponse(
            res,
            201,
            "Creator service created successfully",
            service
        );
    }
);


// Get creator's services.
const getCreatorServices = asyncHandler(
    async (req, res) => {

        const result = await getMyServices(
            req.user.userId,
            req.query
        );


        return sendResponse(
            res,
            200,
            "Creator services fetched successfully",
            result
        );
    }
);


// Get one service.
const getCreatorServiceById = asyncHandler(
    async (req, res) => {

        const service = await getServiceById(
            req.user.userId,
            req.params.id
        );


        return sendResponse(
            res,
            200,
            "Creator service fetched successfully",
            service
        );
    }
);


// Update service.
const updateCreatorService = asyncHandler(
    async (req, res) => {

        const service = await updateService(
            req.user.userId,
            req.params.id,
            req.body
        );


        return sendResponse(
            res,
            200,
            "Creator service updated successfully",
            service
        );
    }
);


// Delete service.
const deleteCreatorService = asyncHandler(
    async (req, res) => {

        await deleteService(
            req.user.userId,
            req.params.id
        );


        return sendResponse(
            res,
            200,
            "Creator service deleted successfully",
            null
        );
    }
);


export {
    createCreatorService,
    getCreatorServices,
    getCreatorServiceById,
    updateCreatorService,
    deleteCreatorService
};