import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import appRouter from "../routes/index.js";
import Auth from "../modules/auth/auth.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

dotenv.config();

const runHttpTest = async () => {
    console.log("=================================================");
    console.log("HTTP RBAC & ENDPOINT INTEGRATION TEST");
    console.log("=================================================");

    await mongoose.connect(process.env.MONGO_URI);

    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api", appRouter);

    // Global error handler matching server.js
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
    const baseUrl = `http://localhost:${port}/api/admin/dashboard/overview`;

    try {
        // Test 1: Unauthenticated request -> Expect 401
        const resUnauth = await fetch(baseUrl);
        const dataUnauth = await resUnauth.json();
        console.log(`Test 1 [Unauthenticated]: HTTP ${resUnauth.status} - ${dataUnauth.message}`);
        if (resUnauth.status !== 401) throw new Error("Expected 401 for unauthenticated request");

        // Test 2: Real Creator Account -> Expect 403
        const creatorUser = await Auth.findOne({ role: "creator" });
        const creatorToken = generateAccessToken({
            userId: creatorUser._id.toString(),
            role: "creator",
            tokenVersion: creatorUser.passwordVersion || 0
        });
        const resCreator = await fetch(baseUrl, {
            headers: {
                Cookie: `accessToken=${creatorToken}`
            }
        });
        const dataCreator = await resCreator.json();
        console.log(`Test 2 [Creator Role Access]: HTTP ${resCreator.status} - ${dataCreator.message}`);
        if (resCreator.status !== 403) throw new Error("Expected 403 for creator role accessing admin endpoint");

        // Test 3: Admin JWT -> Expect 200
        const adminUser = await Auth.findOne({ role: "admin" });
        const adminToken = generateAccessToken({
            userId: adminUser._id.toString(),
            role: "admin",
            tokenVersion: adminUser.passwordVersion || 0
        });
        const resAdmin = await fetch(baseUrl, {
            headers: {
                Cookie: `accessToken=${adminToken}`
            }
        });
        const dataAdmin = await resAdmin.json();
        console.log(`Test 3 [Admin Role Access]: HTTP ${resAdmin.status} - ${dataAdmin.message}`);
        if (resAdmin.status !== 200) throw new Error("Expected 200 for admin role accessing admin endpoint");

        console.log("=================================================");
        console.log("ALL HTTP RBAC TESTS PASSED WITH 100% SUCCESS!");
        console.log("=================================================");
    } finally {
        server.close();
        await mongoose.disconnect();
    }
};

runHttpTest().catch((err) => {
    console.error("HTTP TEST FAILED:", err);
    process.exit(1);
});
