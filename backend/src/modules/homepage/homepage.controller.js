import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/response.js";
import { getHomepageFeaturedService } from "./homepage.service.js";

/**
 * Controller to handle GET /api/homepage/featured
 * Returns top 4 creators and the latest brand collaboration
 */
export const getHomepageFeatured = asyncHandler(async (req, res) => {
    const data = await getHomepageFeaturedService();

    return sendResponse(
        res,
        200,
        "Featured homepage data fetched successfully",
        data
    );
});
