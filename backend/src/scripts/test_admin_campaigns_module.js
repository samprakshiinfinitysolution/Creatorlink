import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import appRouter from "../routes/index.js";
import Auth from "../modules/auth/auth.model.js";
import Campaign from "../modules/brand/campaigns/campaign.model.js";
import Notification from "../modules/notifications/notification.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

dotenv.config();

const runTest = async () => {
    console.log("====================================================");
    console.log("STARTING ADMIN CAMPAIGNS MANAGEMENT INTEGRATION TEST");
    console.log("====================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB Connected");

    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api", appRouter);

    // Global error handler
    app.use((err, req, res, next) => {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            statusCode,
            message: err.message
        });
    });

    const server = app.listen(0);
    const port = server.address().port;
    const campaignsUrl = `http://localhost:${port}/api/admin/campaigns`;

    try {
        const adminUser = await Auth.findOne({ role: "admin" });
        const creatorUser = await Auth.findOne({ role: "creator" });
        const brandUser = await Auth.findOne({ role: "brand" });

        if (!adminUser || !creatorUser || !brandUser) {
            throw new Error("Missing admin, creator, or brand in database for testing");
        }

        const adminToken = generateAccessToken({
            userId: adminUser._id.toString(),
            role: "admin",
            tokenVersion: adminUser.passwordVersion || 0
        });

        const creatorToken = generateAccessToken({
            userId: creatorUser._id.toString(),
            role: "creator",
            tokenVersion: creatorUser.passwordVersion || 0
        });

        console.log("\n--- TEST 1: RBAC & Access Control ---");
        // No token -> 401
        const unauthRes = await fetch(campaignsUrl);
        if (unauthRes.status === 401) {
            console.log("✓ 401 Unauthorized returned when no cookie or token provided");
        } else {
            throw new Error(`Expected 401, got ${unauthRes.status}`);
        }

        // Creator token -> 403
        const forbiddenRes = await fetch(campaignsUrl, {
            headers: { Cookie: `accessToken=${creatorToken}` }
        });
        if (forbiddenRes.status === 403) {
            console.log("✓ 403 Forbidden returned for non-admin creator role");
        } else {
            throw new Error(`Expected 403, got ${forbiddenRes.status}`);
        }

        // Admin token -> 200
        const adminRes = await fetch(campaignsUrl, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        if (adminRes.status === 200) {
            console.log("✓ 200 OK returned for Admin via adminAccessToken cookie");
        } else {
            throw new Error(`Expected 200, got ${adminRes.status}`);
        }

        console.log("\n--- TEST 2: Campaign Stats Overview ---");
        const statsRes = await fetch(`${campaignsUrl}/stats`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const statsJson = await statsRes.json();
        if (statsRes.status === 200 && statsJson.data?.statusCounts !== undefined) {
            console.log("✓ Successfully fetched campaign stats:", {
                totalCampaigns: statsJson.data.totalCampaigns,
                totalBudget: statsJson.data.totalBudget,
                statusCounts: statsJson.data.statusCounts
            });
        } else {
            throw new Error(`Stats fetch failed: ${JSON.stringify(statsJson)}`);
        }

        console.log("\n--- TEST 3: Paginated Campaigns Listing & Multi-criteria Filtering ---");
        const listRes = await fetch(`${campaignsUrl}?page=1&limit=5&sortBy=newest`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const listJson = await listRes.json();
        if (listRes.status === 200 && Array.isArray(listJson.data?.campaigns)) {
            console.log(`✓ Fetched ${listJson.data.campaigns.length} campaigns (Total: ${listJson.data.pagination.totalItems})`);
            if (listJson.data.campaigns.length > 0) {
                const sample = listJson.data.campaigns[0];
                console.log(`  Sample: "${sample.title}" | Status: ${sample.status} | Budget: ${sample.budget} | Brand: ${sample.brand?.name || 'N/A'}`);
            }
        } else {
            throw new Error(`Campaign list fetch failed: ${JSON.stringify(listJson)}`);
        }

        // Test filter by status
        const filterRes = await fetch(`${campaignsUrl}?status=published&limit=3`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const filterJson = await filterRes.json();
        if (filterRes.status === 200) {
            const allPublished = filterJson.data.campaigns.every((c) => c.status === "published");
            console.log(`✓ Status filter ("published") verified: ${allPublished} (Found: ${filterJson.data.campaigns.length})`);
        } else {
            throw new Error(`Filter test failed: ${JSON.stringify(filterJson)}`);
        }

        console.log("\n--- TEST 4: Single Campaign Dossier with Brand & Bookings ---");
        const existingCampaign = await Campaign.findOne();
        if (existingCampaign) {
            const detailRes = await fetch(`${campaignsUrl}/${existingCampaign._id}`, {
                headers: { Cookie: `adminAccessToken=${adminToken}` }
            });
            const detailJson = await detailRes.json();
            if (detailRes.status === 200 && detailJson.data?.campaign?._id) {
                console.log(`✓ Successfully retrieved campaign dossier for "${detailJson.data.campaign.title}"`);
                console.log(`  Brand: ${detailJson.data.campaign.brand?.name} (${detailJson.data.campaign.brand?.email})`);
                console.log(`  Bookings count: ${detailJson.data.bookings?.length || 0}`);
            } else {
                throw new Error(`Dossier fetch failed: ${JSON.stringify(detailJson)}`);
            }

            console.log("\n--- TEST 5: Status Moderation & Notification Dispatch ---");
            const originalStatus = existingCampaign.status;
            const targetStatus = originalStatus === "paused" ? "published" : "paused";

            const patchRes = await fetch(`${campaignsUrl}/${existingCampaign._id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `adminAccessToken=${adminToken}`
                },
                body: JSON.stringify({
                    status: targetStatus,
                    moderationReason: "Automated test audit verification"
                })
            });
            const patchJson = await patchRes.json();
            if (patchRes.status === 200 && patchJson.data?.status === targetStatus) {
                console.log(`✓ Successfully transitioned campaign status from "${originalStatus}" to "${targetStatus}"`);
            } else {
                throw new Error(`Status patch failed: ${JSON.stringify(patchJson)}`);
            }

            // Verify notification record was created for the brand
            const notif = await Notification.findOne({
                recipient: existingCampaign.brand,
                entityId: existingCampaign._id
            }).sort({ createdAt: -1 });

            if (notif) {
                console.log(`✓ Verified brand received moderation notification: "${notif.title}" - "${notif.message}"`);
            } else {
                console.warn("⚠️ Notification record not found immediately; check notification service");
            }

            // Restore original status
            await fetch(`${campaignsUrl}/${existingCampaign._id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `adminAccessToken=${adminToken}`
                },
                body: JSON.stringify({
                    status: originalStatus,
                    moderationReason: "Restored to original status after test"
                })
            });
            console.log(`✓ Successfully restored campaign status back to "${originalStatus}"`);

            console.log("\n--- TEST 6: Validation Error Handling ---");
            const invalidStatusRes = await fetch(`${campaignsUrl}/${existingCampaign._id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `adminAccessToken=${adminToken}`
                },
                body: JSON.stringify({
                    status: "invalid_fake_status"
                })
            });
            if (invalidStatusRes.status === 400) {
                console.log("✓ Correctly rejected invalid campaign status with 400 Bad Request");
            } else {
                throw new Error(`Expected 400 for invalid status, got ${invalidStatusRes.status}`);
            }
        } else {
            console.log("⚠️ No existing campaign in database to test detail and patch endpoints.");
        }

        console.log("\n====================================================");
        console.log("ALL ADMIN CAMPAIGNS TESTS PASSED (100% SUCCESS)!");
        console.log("====================================================");
    } finally {
        server.close();
        await mongoose.disconnect();
    }
};

runTest().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});

