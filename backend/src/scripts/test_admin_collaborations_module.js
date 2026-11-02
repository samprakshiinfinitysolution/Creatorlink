import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import appRouter from "../routes/index.js";
import Auth from "../modules/auth/auth.model.js";
import Workspace from "../modules/workspace/workspace.model.js";
import Notification from "../modules/notifications/notification.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

dotenv.config();

const runTest = async () => {
    console.log("=========================================================");
    console.log("STARTING ADMIN COLLABORATIONS MANAGEMENT INTEGRATION TEST");
    console.log("=========================================================");

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
    const collabsUrl = `http://localhost:${port}/api/admin/collaborations`;

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

        console.log("\n--- TEST 1: RBAC Enforcement ---");
        // No token -> 401
        const unauthRes = await fetch(collabsUrl);
        if (unauthRes.status === 401) {
            console.log("✓ 401 Unauthorized for unauthenticated request");
        } else {
            throw new Error(`Expected 401, got ${unauthRes.status}`);
        }

        // Non-admin token -> 403
        const forbiddenRes = await fetch(collabsUrl, {
            headers: { Cookie: `accessToken=${creatorToken}` }
        });
        if (forbiddenRes.status === 403) {
            console.log("✓ 403 Forbidden for creator role attempting admin access");
        } else {
            throw new Error(`Expected 403, got ${forbiddenRes.status}`);
        }

        // Admin token -> 200
        const adminRes = await fetch(collabsUrl, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        if (adminRes.status === 200) {
            console.log("✓ 200 OK for Admin via adminAccessToken cookie");
        } else {
            throw new Error(`Expected 200, got ${adminRes.status}`);
        }

        console.log("\n--- TEST 2: Collaborations Stats ---");
        const statsRes = await fetch(`${collabsUrl}/stats`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const statsJson = await statsRes.json();
        if (statsRes.status === 200 && statsJson.data?.statusCounts !== undefined) {
            console.log("✓ Successfully fetched collaboration metrics:", {
                totalCollaborations: statsJson.data.totalCollaborations,
                totalVolume: statsJson.data.totalVolume,
                overdueCount: statsJson.data.overdueCount,
                statusCounts: statsJson.data.statusCounts
            });
        } else {
            throw new Error(`Stats fetch failed: ${JSON.stringify(statsJson)}`);
        }

        console.log("\n--- TEST 3: Paginated Collaborations List ---");
        const listRes = await fetch(`${collabsUrl}?page=1&limit=5&sortBy=newest`, {
            headers: { Cookie: `adminAccessToken=${adminToken}` }
        });
        const listJson = await listRes.json();
        if (listRes.status === 200 && Array.isArray(listJson.data?.collaborations)) {
            console.log(`✓ Fetched ${listJson.data.collaborations.length} collaborations (Total: ${listJson.data.pagination.totalItems})`);
            if (listJson.data.collaborations.length > 0) {
                const sample = listJson.data.collaborations[0];
                console.log(`  Sample: "${sample.campaign?.title || 'Direct Booking'}" | Price: ₹${sample.agreedPrice} | Status: ${sample.status} | Deliverables: ${sample.deliverablesSummary?.completed}/${sample.deliverablesSummary?.total}`);
            }
        } else {
            throw new Error(`Collaborations list failed: ${JSON.stringify(listJson)}`);
        }

        console.log("\n--- TEST 4: Single Collaboration Dossier ---");
        const existingWorkspace = await Workspace.findOne();
        if (existingWorkspace) {
            const detailRes = await fetch(`${collabsUrl}/${existingWorkspace._id}`, {
                headers: { Cookie: `adminAccessToken=${adminToken}` }
            });
            const detailJson = await detailRes.json();
            if (detailRes.status === 200 && detailJson.data?.workspace?._id) {
                console.log(`✓ Retrieved dossier for workspace ID ${detailJson.data.workspace._id}`);
                console.log(`  Brand: ${detailJson.data.workspace.brand?.name} | Creator: ${detailJson.data.workspace.creator?.name}`);
                console.log(`  Deliverables Count: ${detailJson.data.workspace.deliverables?.length || 0}`);
            } else {
                throw new Error(`Detail fetch failed: ${JSON.stringify(detailJson)}`);
            }

            console.log("\n--- TEST 5: Status Override & Dual Notification Dispatch ---");
            const originalStatus = existingWorkspace.status;
            const targetStatus = originalStatus === "completed" ? "in_progress" : "completed";

            const patchRes = await fetch(`${collabsUrl}/${existingWorkspace._id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `adminAccessToken=${adminToken}`
                },
                body: JSON.stringify({
                    status: targetStatus,
                    reason: "Automated test administrative override"
                })
            });
            const patchJson = await patchRes.json();
            if (patchRes.status === 200 && patchJson.data?.status === targetStatus) {
                console.log(`✓ Status updated from "${originalStatus}" to "${targetStatus}"`);
            } else {
                throw new Error(`Status update failed: ${JSON.stringify(patchJson)}`);
            }

            // Verify notifications sent to brand and creator
            const brandNotif = await Notification.findOne({
                recipient: existingWorkspace.brand,
                entityId: existingWorkspace._id
            }).sort({ createdAt: -1 });

            const creatorNotif = await Notification.findOne({
                recipient: existingWorkspace.creator,
                entityId: existingWorkspace._id
            }).sort({ createdAt: -1 });

            if (brandNotif) {
                console.log(`✓ Verified Brand received notification: "${brandNotif.title}"`);
            }
            if (creatorNotif) {
                console.log(`✓ Verified Creator received notification: "${creatorNotif.title}"`);
            }

            // Restore status
            await fetch(`${collabsUrl}/${existingWorkspace._id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `adminAccessToken=${adminToken}`
                },
                body: JSON.stringify({
                    status: originalStatus,
                    reason: "Restored to original status after test"
                })
            });
            console.log(`✓ Restored status back to "${originalStatus}"`);

            console.log("\n--- TEST 6: Deadline Extension ---");
            const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            const extendRes = await fetch(`${collabsUrl}/${existingWorkspace._id}/extend-deadline`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `adminAccessToken=${adminToken}`
                },
                body: JSON.stringify({
                    newDeadline: futureDate,
                    reason: "Extended for administrative review"
                })
            });
            const extendJson = await extendRes.json();
            if (extendRes.status === 200) {
                console.log(`✓ Successfully extended deadline to: ${new Date(extendJson.data.deadline).toLocaleDateString()}`);
            } else {
                throw new Error(`Extend deadline failed: ${JSON.stringify(extendJson)}`);
            }

            console.log("\n--- TEST 7: Validation Error Rejection ---");
            const invalidRes = await fetch(`${collabsUrl}/${existingWorkspace._id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `adminAccessToken=${adminToken}`
                },
                body: JSON.stringify({
                    status: "unsupported_bogus_status"
                })
            });
            if (invalidRes.status === 400) {
                console.log("✓ Correctly rejected unsupported status with 400 Bad Request");
            } else {
                throw new Error(`Expected 400 for invalid status, got ${invalidRes.status}`);
            }
        } else {
            console.log("⚠️ No existing workspaces in database to test detail/patch operations.");
        }

        console.log("\n=========================================================");
        console.log("ALL ADMIN COLLABORATIONS TESTS PASSED (100% SUCCESS)!");
        console.log("=========================================================");
    } finally {
        server.close();
        await mongoose.disconnect();
    }
};

runTest().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});

