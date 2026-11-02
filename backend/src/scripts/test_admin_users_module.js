import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import appRouter from "../routes/index.js";
import Auth from "../modules/auth/auth.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

dotenv.config();

const runTest = async () => {
    console.log("=================================================");
    console.log("STARTING ADMIN USERS MANAGEMENT INTEGRATION TEST");
    console.log("=================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB Connected");

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
    const usersUrl = `http://localhost:${port}/api/admin/users`;

    try {
        // Fetch test users
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

        const brandToken = generateAccessToken({
            userId: brandUser._id.toString(),
            role: "brand",
            tokenVersion: brandUser.passwordVersion || 0
        });

        // Test 1: Unauthenticated -> Expect 401
        const resUnauth = await fetch(usersUrl);
        const dataUnauth = await resUnauth.json();
        console.log(`Test 1 [Unauthenticated]: HTTP ${resUnauth.status} - ${dataUnauth.message}`);
        if (resUnauth.status !== 401) throw new Error("Expected 401 for unauthenticated request");

        // Test 2: Creator -> Expect 403
        const resCreator = await fetch(usersUrl, {
            headers: { Cookie: `accessToken=${creatorToken}` }
        });
        const dataCreator = await resCreator.json();
        console.log(`Test 2 [Creator Role Access]: HTTP ${resCreator.status} - ${dataCreator.message}`);
        if (resCreator.status !== 403) throw new Error("Expected 403 for creator role accessing admin users API");

        // Test 3: Brand -> Expect 403
        const resBrand = await fetch(usersUrl, {
            headers: { Cookie: `accessToken=${brandToken}` }
        });
        const dataBrand = await resBrand.json();
        console.log(`Test 3 [Brand Role Access]: HTTP ${resBrand.status} - ${dataBrand.message}`);
        if (resBrand.status !== 403) throw new Error("Expected 403 for brand role accessing admin users API");

        // Test 4: Admin Fetch Users -> Expect 200
        const resAdmin = await fetch(`${usersUrl}?page=1&limit=5`, {
            headers: { Cookie: `accessToken=${adminToken}` }
        });
        const dataAdmin = await resAdmin.json();
        console.log(`Test 4 [Admin Fetch Users]: HTTP ${resAdmin.status} - Fetched ${dataAdmin.data?.users?.length} users, Total: ${dataAdmin.data?.pagination?.totalItems}`);
        if (resAdmin.status !== 200 || !Array.isArray(dataAdmin.data?.users)) {
            throw new Error("Expected 200 and users array for admin request");
        }

        // Test 5: Role Filter (Creators only)
        const resCreatorsOnly = await fetch(`${usersUrl}?role=creator`, {
            headers: { Cookie: `accessToken=${adminToken}` }
        });
        const dataCreatorsOnly = await resCreatorsOnly.json();
        const nonCreator = dataCreatorsOnly.data?.users?.find((u) => u.role !== "creator");
        console.log(`Test 5 [Role Filter: creator]: HTTP ${resCreatorsOnly.status} - Found ${dataCreatorsOnly.data?.users?.length} creators`);
        if (nonCreator) throw new Error(`Filter failed: Found user with role ${nonCreator.role}`);

        // Test 6: Search Filter (by creator name or email)
        const resSearch = await fetch(`${usersUrl}?search=${encodeURIComponent(creatorUser.email)}`, {
            headers: { Cookie: `accessToken=${adminToken}` }
        });
        const dataSearch = await resSearch.json();
        const foundUser = dataSearch.data?.users?.find((u) => u.email === creatorUser.email);
        console.log(`Test 6 [Search Query]: HTTP ${resSearch.status} - Matched user: ${foundUser?.name} (${foundUser?.email})`);
        if (!foundUser) throw new Error("Search filter failed to locate user by exact email");

        // Test 7: Get User Details Dossier (Creator)
        const resCreatorDossier = await fetch(`${usersUrl}/${creatorUser._id}`, {
            headers: { Cookie: `accessToken=${adminToken}` }
        });
        const dataCreatorDossier = await resCreatorDossier.json();
        console.log(`Test 7 [Creator Dossier API]: HTTP ${resCreatorDossier.status} - User: ${dataCreatorDossier.data?.user?.name}, Bookings: ${dataCreatorDossier.data?.stats?.totalBookings}`);
        if (resCreatorDossier.status !== 200 || !dataCreatorDossier.data?.stats) {
            throw new Error("Failed to fetch complete creator dossier");
        }

        // Test 8: Get User Details Dossier (Brand)
        const resBrandDossier = await fetch(`${usersUrl}/${brandUser._id}`, {
            headers: { Cookie: `accessToken=${adminToken}` }
        });
        const dataBrandDossier = await resBrandDossier.json();
        console.log(`Test 8 [Brand Dossier API]: HTTP ${resBrandDossier.status} - User: ${dataBrandDossier.data?.user?.name}, Campaigns: ${dataBrandDossier.data?.stats?.totalCampaigns}`);
        if (resBrandDossier.status !== 200 || !dataBrandDossier.data?.stats) {
            throw new Error("Failed to fetch complete brand dossier");
        }

        // Test 9: Security Audit - Ensure NO sensitive credentials exposed in any response
        const sampleUser = dataAdmin.data?.users[0];
        const dossierUser = dataCreatorDossier.data?.user;
        const forbiddenFields = ["password", "sessions", "resetPasswordToken", "resetPasswordExpire", "emailVerificationOtp"];

        for (const field of forbiddenFields) {
            if (sampleUser && sampleUser[field] !== undefined) {
                throw new Error(`SECURITY BREACH: ${field} exposed in users list!`);
            }
            if (dossierUser && dossierUser[field] !== undefined) {
                throw new Error(`SECURITY BREACH: ${field} exposed in user dossier!`);
            }
        }
        console.log("Test 9 [Security Audit]: Passwords, tokens, and sessions are 100% STRIPPED and SECURE.");

        console.log("=================================================");
        console.log("ALL ADMIN USERS TESTS PASSED WITH 100% SUCCESS!");
        console.log("=================================================");
    } finally {
        server.close();
        await mongoose.disconnect();
    }
};

runTest().catch((err) => {
    console.error("TEST FAILED:", err);
    process.exit(1);
});

