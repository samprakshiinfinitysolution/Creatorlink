import asyncHandler from "../../../utils/asyncHandler.js";
import sendResponse from "../../../utils/response.js";
import { getReportsOverviewService } from "./reports.service.js";

const getReportsOverview = asyncHandler(async (req, res) => {
    const reports = await getReportsOverviewService(req.query);
    return sendResponse(res, 200, "Admin reports analytics fetched successfully", reports);
});

export {
    getReportsOverview
};

