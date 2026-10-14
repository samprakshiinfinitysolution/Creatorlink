import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import { getBrandDashboardOverviewService } from "./dashboard.service.js";

// Fetches Brand Dashboard overview data including metrics, upcoming deadlines, recent campaigns, and collaborations
const getBrandDashboardOverview = asyncHandler(async (req, res) => {
    const dashboardData = await getBrandDashboardOverviewService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Brand dashboard overview fetched successfully",
        dashboardData
    );
});

export {
    getBrandDashboardOverview
};
