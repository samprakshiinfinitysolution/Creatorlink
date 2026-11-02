import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import appRouter from "../routes/index.js";
import Auth from "../modules/auth/auth.model.js";

dotenv.config();

const runTest = async () => {
    console.log("=========================================================");
    console.log("STARTING ADMIN AUTO-REFRESH & GUARD RESILIENCE TEST");
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
        if (!adminUser) throw new Error("Missing admin user in database");

        // 1. Admin logs in
        console.log("\n[Test 1] Admin logs in via POST /api/admin/auth/login");
        const resLogin = await fetch(`${baseUrl}/admin/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: adminUser.email,
                password: "123456"
            })
        });

        const setCookies = resLogin.headers.getSetCookie ? resLogin.headers.getSetCookie() : [];
        const adminRefreshCookieStr = setCookies.find(c => c.includes("adminRefreshToken="));
        if (!adminRefreshCookieStr) throw new Error("Missing adminRefreshToken in login response");

        const adminRefreshTokenValue = adminRefreshCookieStr.split(";")[0];
        console.log("✓ Admin logged in successfully");
        console.log(`✓ Acquired: ${adminRefreshTokenValue.slice(0, 30)}...`);

        // 2. Simulate access token expiration by calling /api/admin/auth/refresh
        console.log("\n[Test 2] Refreshing expired admin token via POST /api/admin/auth/refresh");
        const resRefresh = await fetch(`${baseUrl}/admin/auth/refresh`, {
            method: "POST",
            headers: { Cookie: adminRefreshTokenValue }
        });

        const refreshJson = await resRefresh.json();
        console.log(`Status: ${resRefresh.status} (Expected 200)`);
        if (resRefresh.status !== 200) throw new Error("Admin token refresh failed");

        const refreshCookies = resRefresh.headers.getSetCookie ? resRefresh.headers.getSetCookie() : [];
        const newAccessCookieStr = refreshCookies.find(c => c.includes("adminAccessToken="));
        if (!newAccessCookieStr) throw new Error("Missing new adminAccessToken in refresh response");

        const newAccessTokenValue = newAccessCookieStr.split(";")[0];
        console.log("✓ Admin access token successfully refreshed!");
        console.log(`✓ New adminAccessToken: ${newAccessTokenValue.slice(0, 30)}...`);

        // 3. Verify access to protected admin route with the refreshed token
        console.log("\n[Test 3] Verifying access with refreshed admin token to /api/admin/auth/me");
        const resMe = await fetch(`${baseUrl}/admin/auth/me`, {
            headers: { Cookie: newAccessTokenValue }
        });
        const meJson = await resMe.json();
        console.log(`Status: ${resMe.status} (Expected 200)`);
        if (resMe.status !== 200 || meJson.data?.user?.email !== adminUser.email) {
            throw new Error("Failed to verify user with refreshed admin token");
        }
        console.log(`✓ Refreshed token authenticated successfully as: ${meJson.data.user.email}`);

        console.log("\n=========================================================");
        console.log("ADMIN AUTO-REFRESH TEST PASSED 100%!");
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

