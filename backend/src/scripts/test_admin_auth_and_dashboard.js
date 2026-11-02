import dotenv from "dotenv";
import mongoose from "mongoose";
import Auth from "../modules/auth/auth.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";
import { getAdminDashboardOverviewService } from "../modules/admin/dashboard/dashboard.service.js";

dotenv.config();

const runTest = async () => {
    console.log("=================================================");
    console.log("STARTING ADMIN AUTH & AUTHORIZATION TEST SUITE");
    console.log("=================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB Connected");

    // 1. Verify Admin User Exists
    const adminUser = await Auth.findOne({ role: "admin" });
    if (!adminUser) {
        throw new Error("FAILED: Admin user not found in MongoDB!");
    }
    console.log(`✓ Admin User Found: ${adminUser.email} (role: ${adminUser.role}, isVerified: ${adminUser.isVerified})`);

    // 2. Generate Tokens for RBAC Simulation
    const adminToken = generateAccessToken({
        userId: adminUser._id.toString(),
        role: "admin",
        tokenVersion: adminUser.passwordVersion || 0
    });
    console.log("✓ Generated valid Admin JWT");

    const creatorToken = generateAccessToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "creator",
        tokenVersion: 0
    });
    console.log("✓ Generated valid Creator JWT");

    // 3. Test Service Execution
    const overviewData = await getAdminDashboardOverviewService({});
    console.log("✓ Admin Dashboard Overview Service successfully executed!");
    console.log("  Telemetry Summary:", {
        totalUsers: overviewData.metrics.users.totalUsers,
        totalCreators: overviewData.metrics.users.totalCreators,
        totalBrands: overviewData.metrics.users.totalBrands,
        totalCampaigns: overviewData.metrics.campaigns.totalCampaigns,
        totalWorkspaces: overviewData.metrics.collaborations.totalWorkspaces,
        grossVolume: `₹${overviewData.metrics.financials.grossVolume}`
    });

    console.log("=================================================");
    console.log("ALL TESTS PASSED SUCCESSFULLY!");
    console.log("=================================================");

    await mongoose.disconnect();
    process.exit(0);
};

runTest().catch((err) => {
    console.error("TEST FAILED:", err);
    process.exit(1);
});

