import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import { getAdminDashboardOverviewService } from "./dashboard.service.js";

// Fetches comprehensive platform telemetry, metrics, and recent activity for the Admin Dashboard.
const getAdminDashboardOverview = asyncHandler(async (req, res) => {
    const dashboardData = await getAdminDashboardOverviewService(req.query);

    return sendResponse(
        res,
        200,
        "Admin dashboard overview fetched successfully",
        dashboardData
    );
});

export {
    getAdminDashboardOverview
};

