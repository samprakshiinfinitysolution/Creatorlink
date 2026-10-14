import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import { getCreatorDashboardOverviewService } from "./dashboard.service.js";

// Fetches Creator Dashboard overview data including metrics, upcoming deadlines, and recent collaborations
const getCreatorDashboardOverview = asyncHandler(async (req, res) => {
    const dashboardData = await getCreatorDashboardOverviewService(
        req.user.userId,
        req.query
    );

    return sendResponse(
        res,
        200,
        "Creator dashboard overview fetched successfully",
        dashboardData
    );
});

export {
    getCreatorDashboardOverview
};
