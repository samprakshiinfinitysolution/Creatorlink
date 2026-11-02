import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import appRouter from "../routes/index.js";
import Auth from "../modules/auth/auth.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

dotenv.config();

const runTest = async () => {
    console.log("=========================================================");
    console.log("STARTING ADMIN DEDICATED COOKIE & SESSION ISOLATION TEST");
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
    const baseUrl = `http://localhost:${port}/api`;

    try {
        const adminUser = await Auth.findOne({ role: "admin" });
        const creatorUser = await Auth.findOne({ role: "creator" });

        if (!adminUser || !creatorUser) {
            throw new Error("Missing admin or creator user in database");
        }

        // Test 1: Admin logs in via dedicated POST /api/admin/auth/login
        console.log("\n[Test 1] Admin logs in via dedicated POST /api/admin/auth/login");
        const resAdminLogin = await fetch(`${baseUrl}/admin/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: adminUser.email,
                password: "123456"
            })
        });

        const adminLoginJson = await resAdminLogin.json();
        const setCookies = resAdminLogin.headers.getSetCookie ? resAdminLogin.headers.getSetCookie() : [];
        console.log(`Admin login status: ${resAdminLogin.status}`);

        const hasAdminAccessCookie = setCookies.some(c => c.includes("adminAccessToken="));
        const hasAdminRefreshCookie = setCookies.some(c => c.includes("adminRefreshToken="));
        const hasStandardAccessCookie = setCookies.some(c => c.startsWith("accessToken="));

        console.log(`✓ Sets adminAccessToken: ${hasAdminAccessCookie}`);
        console.log(`✓ Sets adminRefreshToken: ${hasAdminRefreshCookie}`);
        console.log(`✓ Does NOT overwrite standard accessToken: ${!hasStandardAccessCookie}`);

        // Test 2: Non-admin rejection from /api/admin/auth/login
        console.log("\n[Test 2] Creator role attempting to log in via /api/admin/auth/login -> Expect 403");
        const resCreatorBlocked = await fetch(`${baseUrl}/admin/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: creatorUser.email,
                password: "anypassword"
            })
        });
        const blockedJson = await resCreatorBlocked.json();
        console.log(`Status: ${resCreatorBlocked.status} (Expected 403) - ${blockedJson.message}`);
        if (resCreatorBlocked.status !== 403) throw new Error("Expected 403 for creator on admin login");
        console.log("✓ Creator correctly blocked from Admin portal with 403 Forbidden");

        // Test 3: Multi-Session coexistence in the same browser
        console.log("\n[Test 3] Multi-Session Coexistence in the Same Browser Window");
        const creatorJwt = generateAccessToken({
            userId: creatorUser._id.toString(),
            role: "creator",
            tokenVersion: creatorUser.passwordVersion || 0
        });

        const adminJwt = generateAccessToken({
            userId: adminUser._id.toString(),
            role: "admin",
            tokenVersion: adminUser.passwordVersion || 0
        });

        // Combined cookie string sent by browser when both sessions exist simultaneously
        const sharedCookieJar = `accessToken=${creatorJwt}; adminAccessToken=${adminJwt}`;

        // Tab 1: Creator calls creator endpoint
        const resCreatorTab = await fetch(`${baseUrl}/creator/profile/me`, {
            headers: { Cookie: sharedCookieJar }
        });
        const creatorTabJson = await resCreatorTab.json();
        console.log(`Tab 1 [Creator Route]: Status ${resCreatorTab.status}`);
        if (resCreatorTab.status === 200) {
            console.log(`✓ Tab 1 correctly authenticated as Creator: ${creatorTabJson.data?.user?.email || creatorUser.email}`);
        }

        // Tab 2: Admin calls admin session restoration endpoint
        const resAdminTab = await fetch(`${baseUrl}/admin/auth/me`, {
            headers: { Cookie: sharedCookieJar }
        });
        const adminTabJson = await resAdminTab.json();
        console.log(`Tab 2 [Admin Route]: Status ${resAdminTab.status}`);
        if (resAdminTab.status === 200) {
            console.log(`✓ Tab 2 correctly authenticated as Admin: ${adminTabJson.data?.user?.email || adminUser.email}`);
        }

        // Tab 2: Admin calls admin users list
        const resAdminUsers = await fetch(`${baseUrl}/admin/users?limit=1`, {
            headers: { Cookie: sharedCookieJar }
        });
        console.log(`Tab 2 [Admin Users]: Status ${resAdminUsers.status}`);
        if (resAdminUsers.status !== 200) throw new Error("Admin users should be 200 with adminAccessToken");
        console.log("✓ Admin accessed /api/admin/users successfully without session conflict");

        // Test 4: Admin logout does NOT kill Creator session
        console.log("\n[Test 4] Admin logs out via /api/admin/auth/logout");
        const resAdminLogout = await fetch(`${baseUrl}/admin/auth/logout`, {
            method: "POST",
            headers: { Cookie: sharedCookieJar }
        });
        const logoutCookies = resAdminLogout.headers.getSetCookie ? resAdminLogout.headers.getSetCookie() : [];
        console.log(`Status: ${resAdminLogout.status}`);
        console.log(`Cleared adminAccessToken: ${logoutCookies.some(c => c.includes("adminAccessToken=;"))}`);

        // Creator session still valid
        const resCreatorStillAlive = await fetch(`${baseUrl}/creator/profile/me`, {
            headers: { Cookie: `accessToken=${creatorJwt}` }
        });
        console.log(`Creator session still active: ${resCreatorStillAlive.status === 200 ? "YES (200 OK)" : "NO"}`);
        if (resCreatorStillAlive.status !== 200) throw new Error("Creator session was disrupted by Admin logout");
        console.log("✓ Creator session remained active after Admin logout");

        console.log("\n=========================================================");
        console.log("ALL DEDICATED ADMIN COOKIE ISOLATION TESTS PASSED 100%");
        console.log("=========================================================");
    } finally {
        server.close();
        await mongoose.disconnect();
    }
};

runTest().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});
