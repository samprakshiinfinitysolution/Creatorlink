import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ConnectionString from "mongodb-connection-string-url";

import app from "../app.js";
import Auth from "../modules/auth/auth.model.js";
import { hashPassword } from "../utils/helpers/password.helper.js";
import { generateAccessToken } from "../utils/helpers/token.helper.js";
import { changePasswordLimiter } from "../middleware/rateLimiter.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const LOCAL_TEST_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * Validate that tests strictly run against an isolated test database.
 * Never allows running against production or the default development database.
 */
const parseAndValidateTestDatabase = (uri) => {
    if (!uri || typeof uri !== "string" || !uri.trim()) {
        throw new Error(
            "CRITICAL SAFETY GUARD: MONGODB_TEST_URI is missing or empty. An explicitly configured test database URI is required to run tests. Do not run tests against production or unverified databases."
        );
    }

    const cleanUri = uri.trim();
    if (!/^(mongodb(?:\+srv)?):\/\//i.test(cleanUri)) {
        throw new Error(
            "Unsupported or malformed MongoDB URI scheme. Only 'mongodb://' and 'mongodb+srv://' are supported."
        );
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
        throw new Error(
            `Database name '${dbName}' does not follow the test database naming convention (must contain 'test' in the database name itself).`
        );
    }

    return dbName;
};

async function verifyChangePasswordSecurity() {
    console.log("===============================================================");
    console.log("  CHANGE-PASSWORD RATE LIMITER INTEGRATION TEST");
    console.log("===============================================================");

    const rawTestUri = process.env.MONGODB_TEST_URI;
    const dbName = parseAndValidateTestDatabase(rawTestUri);
    const testMongoUri = rawTestUri.trim();

    const maskedUri = testMongoUri.replace(/\/\/[^@]+@/, "//***:***@");
    console.log(`[INFO] Target Test Database: '${dbName}' (${maskedUri})`);

    let isConnected = false;
    let server = null;
    const cleanupUserIds = [];

    try {
        // 1. Connect to isolated test database
        await mongoose.connect(testMongoUri);
        isConnected = true;
        console.log("[INFO] Connected successfully to test database.");

        // 2. Start real ephemeral HTTP server on dynamic port
        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const port = server.address().port;
        const targetUrl = `http://localhost:${port}/api/auth/change-password`;
        console.log(`[INFO] Live test server listening on http://localhost:${port}`);

        // 3. Create test user
        const originalPassword = "InitialPassword123!";
        const hashedPassword = await hashPassword(originalPassword);
        const testUser = await Auth.create({
            name: `RateLimitUser_${Date.now()}`,
            email: `ratelimit_${Date.now()}@test.com`,
            password: hashedPassword,
            role: "creator",
            passwordVersion: 0
        });
        cleanupUserIds.push(testUser._id);
        const testUserId = testUser._id.toString();
        console.log(`[INFO] Created test user: ${testUser.email} (ID: ${testUserId})`);

        // Generate valid access token for test user
        const accessToken = generateAccessToken({
            userId: testUserId,
            role: testUser.role,
            tokenVersion: 0
        });

        // 4. Test Unauthenticated Access Attempt -> Must reject with 401 and NOT hit rate limiter
        console.log("\n[TEST 1] Testing unauthenticated request (no token cookie)...");
        const resUnauth = await fetch(targetUrl, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword: "anyPassword",
                newPassword: "newValidPassword123"
            })
        });
        const unauthData = await resUnauth.json();
        console.log(`  -> Status: ${resUnauth.status}, Message: "${unauthData.message}"`);
        if (resUnauth.status !== 401) {
            throw new Error(`Expected HTTP 401 for unauthenticated request, got ${resUnauth.status}`);
        }
        console.log("  ✓ Unauthenticated request blocked by authenticateUser without consuming rate limit quota.");

        // 5. Test First 5 Authenticated Attempts -> Must NOT be blocked by rate limiter
        console.log("\n[TEST 2] Testing first 5 authenticated change-password requests with incorrect current password...");
        for (let attempt = 1; attempt <= 5; attempt++) {
            const res = await fetch(targetUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    cookie: `accessToken=${accessToken}`
                },
                body: JSON.stringify({
                    currentPassword: "WrongCurrentPassword123",
                    newPassword: "brandNewValidPassword456",
                    confirmPassword: "brandNewValidPassword456"
                })
            });

            const body = await res.json();
            const rateLimitHeader = res.headers.get("ratelimit");
            console.log(
                `  -> Request ${attempt}/5: HTTP ${res.status} | Body message: "${body.message}" | RateLimit: ${rateLimitHeader || "N/A"}`
            );

            if (res.status === 429) {
                throw new Error(`Request ${attempt} was prematurely blocked by rate limiter with 429!`);
            }
            if (res.status !== 400) {
                throw new Error(`Expected HTTP 400 for incorrect current password on request ${attempt}, got ${res.status}`);
            }
        }
        console.log("  ✓ All 5 initial requests successfully passed through rate limiter to controller validation.");

        // 6. Test 6th Request -> Must be blocked by rate limiter with HTTP 429 and standard JSON error envelope
        console.log("\n[TEST 3] Testing 6th request (exceeding 5 requests / 15 minutes quota)...");
        const resBlocked = await fetch(targetUrl, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                cookie: `accessToken=${accessToken}`
            },
            body: JSON.stringify({
                currentPassword: "WrongCurrentPassword123",
                newPassword: "brandNewValidPassword456",
                confirmPassword: "brandNewValidPassword456"
            })
        });

        const blockedBody = await resBlocked.json();
        console.log(`  -> Status: ${resBlocked.status}`);
        console.log(`  -> Body:`, JSON.stringify(blockedBody, null, 2));

        if (resBlocked.status !== 429) {
            throw new Error(`Expected HTTP 429 on 6th request, received status ${resBlocked.status}`);
        }

        // Validate JSON error envelope
        if (blockedBody.success !== false) {
            throw new Error(`Expected blocked body.success to be false, got: ${blockedBody.success}`);
        }
        if (blockedBody.statusCode !== 429) {
            throw new Error(`Expected blocked body.statusCode to be 429, got: ${blockedBody.statusCode}`);
        }
        const expectedMessage = "Too many password change attempts. Please try again after 15 minutes.";
        if (blockedBody.message !== expectedMessage) {
            throw new Error(`Expected message "${expectedMessage}", got: "${blockedBody.message}"`);
        }
        if (blockedBody.data !== null) {
            throw new Error(`Expected data to be null, got: ${blockedBody.data}`);
        }

        // Validate rate limit headers
        const rateLimitHeader = resBlocked.headers.get("ratelimit");
        const retryAfterHeader = resBlocked.headers.get("retry-after");
        const legacyHeader = resBlocked.headers.get("x-ratelimit-remaining");

        console.log(`  -> RateLimit Header: "${rateLimitHeader}"`);
        console.log(`  -> Retry-After Header: "${retryAfterHeader}"`);
        console.log(`  -> X-RateLimit-Remaining: "${legacyHeader}" (Should be null when legacyHeaders: false)`);

        if (!rateLimitHeader && !resBlocked.headers.get("ratelimit-policy")) {
            throw new Error("Expected standard RateLimit or RateLimit-Policy header to be present.");
        }
        if (legacyHeader !== null) {
            throw new Error("Expected legacy X-RateLimit headers to be disabled, but found x-ratelimit-remaining.");
        }
        console.log("  ✓ 6th request blocked with exact 429 JSON envelope and standard headers.");

        // 7. Test Rate Limiter Reset for User
        console.log("\n[TEST 4] Testing limiter key reset (resetKey) for the test user...");
        if (typeof changePasswordLimiter.resetKey === "function") {
            changePasswordLimiter.resetKey(testUserId);
            console.log(`  -> Called changePasswordLimiter.resetKey('${testUserId}')`);

            const resAfterReset = await fetch(targetUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    cookie: `accessToken=${accessToken}`
                },
                body: JSON.stringify({
                    currentPassword: "WrongCurrentPassword123",
                    newPassword: "brandNewValidPassword456",
                    confirmPassword: "brandNewValidPassword456"
                })
            });

            const afterResetBody = await resAfterReset.json();
            console.log(`  -> Request after reset: HTTP ${resAfterReset.status} | "${afterResetBody.message}"`);

            if (resAfterReset.status === 429) {
                throw new Error("Request after resetKey was still blocked with 429!");
            }
            if (resAfterReset.status !== 400) {
                throw new Error(`Expected HTTP 400 after reset, got ${resAfterReset.status}`);
            }
            console.log("  ✓ Counter reset verified successfully.");
        } else {
            console.log("  (Note: resetKey not exposed on store or middleware; skipping reset test)");
        }

        console.log("\n===============================================================");
        console.log(">>> ALL CHANGE-PASSWORD RATE LIMITER TESTS PASSED! <<<");
        console.log("===============================================================");

    } finally {
        console.log("\n--- Cleaning Up Security Test Resources ---");
        try {
            if (isConnected && cleanupUserIds.length > 0) {
                await Auth.deleteMany({ _id: { $in: cleanupUserIds } });
                console.log(`  Cleaned up ${cleanupUserIds.length} test user record(s).`);
            }
        } catch (cleanupErr) {
            console.error("  Warning: cleanup encountered an error:", cleanupErr.message);
        }

        try {
            if (server) {
                await new Promise((resolve) => server.close(resolve));
                console.log("  HTTP test server closed.");
            }
        } catch (serverErr) {
            console.error("  Warning: server close encountered an error:", serverErr.message);
        }

        try {
            if (isConnected) {
                await mongoose.disconnect();
                console.log("  Mongoose disconnected.");
            }
        } catch (disconnectErr) {
            console.error("  Warning: mongoose disconnect encountered an error:", disconnectErr.message);
        }
    }
}

verifyChangePasswordSecurity().catch((err) => {
    console.error("\n[FAILURE] Rate limiter security verification failed:", err.message);
    process.exit(1);
});
