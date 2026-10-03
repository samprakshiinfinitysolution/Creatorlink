import express from "express";

import authenticateUser
    from "../../../middleware/auth.middleware.js";

import {
    createCreatorService,
    getCreatorServices,
    getCreatorServiceById,
    updateCreatorService,
    deleteCreatorService
} from "./services.controller.js";

import {
    validateCreateService,
    validateUpdateService
} from "./services.validation.js";


const router = express.Router();


// All creator service APIs require authentication.
router.use(authenticateUser);


// Create service.
router.post(
    "/",
    validateCreateService,
    createCreatorService
);


// Get creator services.
router.get(
    "/",
    getCreatorServices
);


// Get one service.
router.get(
    "/:id",
    getCreatorServiceById
);


// Update service.
router.patch(
    "/:id",
    validateUpdateService,
    updateCreatorService
);


// Delete service.
router.delete(
    "/:id",
    deleteCreatorService
);


export default router;