import { Router } from "express";
import { getHomepageFeatured } from "./homepage.controller.js";

const router = Router();

// GET /api/homepage/featured
router.get("/featured", getHomepageFeatured);

export default router;

