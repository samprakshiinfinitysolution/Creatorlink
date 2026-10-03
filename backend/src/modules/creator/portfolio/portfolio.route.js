import express from "express";

import authenticateUser from "../../../middleware/auth.middleware.js";

import {
    createPortfolio,
    getMyPortfolios,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio
} from "./portfolio.controller.js";

import {
    validateCreatePortfolio,
    validateUpdatePortfolio
} from "./portfolio.validation.js";


const router = express.Router();


// All portfolio APIs require authentication.
router.use(authenticateUser);


// Create portfolio work.
router.post(
    "/",
    validateCreatePortfolio,
    createPortfolio
);


// Get all portfolio works.
router.get(
    "/",
    getMyPortfolios
);


// Get one portfolio work.
router.get(
    "/:id",
    getPortfolioById
);


// Update portfolio work.
router.patch(
    "/:id",
    validateUpdatePortfolio,
    updatePortfolio
);


// Delete portfolio work.
router.delete(
    "/:id",
    deletePortfolio
);


export default router;