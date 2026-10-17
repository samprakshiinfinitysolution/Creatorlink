import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ConnectionString from "mongodb-connection-string-url";

import app from "../app.js";
import Auth from "../modules/auth/auth.model.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const LOCAL_TEST_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

// Parse and validate the MongoDB database name from supported protocols (mongodb:// and mongodb+srv://)
const parseAndValidateTestDatabase = (uri) => {
    if (!uri || typeof uri !== "string" || !uri.trim()) {
        throw new Error("CRITICAL SAFETY GUARD: MONGODB_TEST_URI is missing or empty. An explicitly configured test database URI is required to run tests. Do not run tests against production or unverified databases.");
    }

    const cleanUri = uri.trim();
    if (!/^(mongodb(?:\+srv)?):\/\//i.test(cleanUri)) {
        throw new Error("Unsupported or malformed MongoDB URI scheme. Only 'mongodb://' and 'mongodb+srv://' are supported.");
    }

    let cs;
    try {
        cs = new ConnectionString(cleanUri);
    } catch (parseErr) {
        throw new Error(`Malformed MongoDB connection string: ${parseErr.message}`);
    }

    const hosts = cs.hosts || [];
    if (hosts.length === 0) {
        throw new Error("MONGODB_TEST_URI contains no valid host definitions.");
    }

    for (const hostEntry of hosts) {
        const hostname = hostEntry.startsWith("[")
            ? hostEntry.slice(1, hostEntry.indexOf("]")).toLowerCase()
            : hostEntry.split(":")[0].toLowerCase();

        if (!LOCAL_TEST_HOSTS.has(hostname) && process.env.ALLOW_REMOTE_TEST_DB !== "true") {
            throw new Error(
                `Host '${hostname}' is not a permitted local test host (allowed: localhost, 127.0.0.1, ::1). Set ALLOW_REMOTE_TEST_DB=true to explicitly permit an intentional remote test environment.`
            );
        }
    }

    const rawPath = (cs.pathname || "").replace(/^\//, "").trim();
    if (!rawPath || rawPath.includes("/") || rawPath.includes("?")) {
        throw new Error("Database name in MONGODB_TEST_URI is missing, ambiguous, or invalid.");
    }

    const dbName = decodeURIComponent(rawPath);
    if (!/test/i.test(dbName)) {
        throw new Error(`Database name '${dbName}' does not follow the test database naming convention (must contain 'test' in the database name itself).`);
    }

    return dbName;
};

async function runHttpTests() {
    console.log("=== TESTING HTTP AUTHORIZATION & ENDPOINT MOUNTING ===");

    const rawTestUri = process.env.MONGODB_TEST_URI;
    const dbName = parseAndValidateTestDatabase(rawTestUri);
    const testMongoUri = rawTestUri.trim();

    const maskedUri = testMongoUri.replace(/\/\/[^@]+@/, "//***:***@");
    console.log(`Validated dedicated test database '${dbName}': ${maskedUri}`);

    let isConnected = false;
    let server = null;
    const cleanupUserIds = [];

    try {
        // Connect to MongoDB
        await mongoose.connect(testMongoUri);
        isConnected = true;
        console.log("Connected to dedicated test database for HTTP tests.");

        // Start HTTP server on dynamic port
        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const port = server.address().port;
        const baseUrl = `http://localhost:${port}/api/brand/creators`;

        // 1. Unauthenticated request (no token cookie) -> 401 Unauthorized
        const resUnauth = await fetch(baseUrl);
        const dataUnauth = await resUnauth.json();
        console.log(`  1. No token -> status ${resUnauth.status}:`, dataUnauth.message);
        if (resUnauth.status !== 401) {
            throw new Error(`Expected 401 for unauthenticated request, got ${resUnauth.status}`);
        }

        // 2. Creator role access attempt on Brand route -> 403 Forbidden
        const creatorUser = await Auth.create({
            name: `http_test_creator_${Date.now()}`,
            email: `http_creator_${Date.now()}@test.com`,
            password: "hashedpassword123",
            role: "creator"
        });
        cleanupUserIds.push(creatorUser._id);

        const creatorToken = generateAccessToken({
            userId: creatorUser._id.toString(),
            role: creatorUser.role
        });

        const resForbidden = await fetch(baseUrl, {
            headers: {
                cookie: `accessToken=${creatorToken}`
            }
        });
        const dataForbidden = await resForbidden.json();
        console.log(`  2. Creator token on brand route -> status ${resForbidden.status}:`, dataForbidden.message);
        if (resForbidden.status !== 403) {
            throw new Error(`Expected 403 for creator token on brand route, got ${resForbidden.status}`);
        }

        // 3. Authorized Brand role access -> 200 OK
        const brandUser = await Auth.create({
            name: `http_test_brand_${Date.now()}`,
            email: `http_brand_${Date.now()}@test.com`,
            password: "hashedpassword123",
            role: "brand"
        });
        cleanupUserIds.push(brandUser._id);

        const brandToken = generateAccessToken({
            userId: brandUser._id.toString(),
            role: brandUser.role
        });

        const resBrand = await fetch(baseUrl, {
            headers: {
                cookie: `accessToken=${brandToken}`
            }
        });
        const dataBrand = await resBrand.json();
        console.log(`  3. Brand token -> status ${resBrand.status}:`, dataBrand.message);
        if (resBrand.status !== 200) {
            throw new Error(`Expected 200 for brand token, got ${resBrand.status}`);
        }

        if (!dataBrand.data || !Array.isArray(dataBrand.data.creators) || !dataBrand.data.pagination) {
            throw new Error("Response structure missing data.creators array or data.pagination object!");
        }

        // Verify email privacy at HTTP response level
        for (const creator of dataBrand.data.creators) {
            if (creator.user && creator.user.email !== undefined) {
                throw new Error("HTTP response leaked private user.email!");
            }
        }
        console.log("  ✓ Verified HTTP response payload format and email privacy.");

        console.log("\n>>> ALL HTTP ROUTE & AUTHORIZATION TESTS PASSED! <<<");

    } finally {
        console.log("\n--- Cleaning Up HTTP Test Resources ---");
        try {
            if (isConnected && cleanupUserIds.length > 0) {
                await Auth.deleteMany({ _id: { $in: cleanupUserIds } });
                console.log(`  Cleaned up ${cleanupUserIds.length} test accounts.`);
            }
        } catch (cleanupErr) {
            console.error("  Warning: test user cleanup encountered an error:", cleanupErr.message);
        }

        try {
            if (server) {
                await new Promise((resolve) => server.close(resolve));
                console.log("  HTTP server closed.");
            }
        } catch (serverErr) {
            console.error("  Warning: HTTP server close encountered an error:", serverErr.message);
        }

        try {
            if (isConnected) {
                await mongoose.disconnect();
                console.log("  MongoDB disconnected cleanly.");
            }
        } catch (disconnectErr) {
            console.error("  Warning: mongoose disconnect encountered an error:", disconnectErr.message);
        }
    }
}

runHttpTests().catch((err) => {
    console.error("HTTP test failed:", err.message);
    process.exit(1);
});
