import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ConnectionString from "mongodb-connection-string-url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const LOCAL_TEST_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

// Parse and validate the MongoDB database name and host safety from supported protocols (mongodb:// and mongodb+srv://)
const parseAndValidateTestDatabase = (uri) => {
    if (!uri || typeof uri !== "string" || !uri.trim()) {
        throw new Error("MONGODB_TEST_URI is missing or empty. An explicitly configured test database URI is required.");
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

const checkReviewsIndexes = async () => {
    // 1. Validate only process.env.MONGODB_TEST_URI; never fall back to other database URI variables.
    const mongoUri = process.env.MONGODB_TEST_URI;

    // Reject production environment
    if (process.env.NODE_ENV === "production") {
        console.error("CRITICAL SAFETY GUARD: Refusing to execute script when NODE_ENV is set to 'production'.");
        process.exitCode = 1;
        return;
    }

    // 2. Parse and validate test database safely before connecting
    let dbName = "";
    try {
        dbName = parseAndValidateTestDatabase(mongoUri);
    } catch (valErr) {
        console.error(`CRITICAL ERROR: ${valErr.message}`);
        process.exitCode = 1;
        return;
    }

    // 3. Never print the full connection URI, credentials, or secrets.
    console.log(`✓ Connecting for read-only index inspection of test database: [REDACTED_URI]/[${dbName}]`);

    let isConnected = false;

    try {
        await mongoose.connect(mongoUri);
        isConnected = true;
        console.log("✓ Connected to MongoDB test database.");

        // 4. Keep the inspection read-only: use listCollections() and collection.indexes() only.
        const collections = await mongoose.connection.db.listCollections({ name: "reviews" }).toArray();
        if (collections.length > 0) {
            const indexes = await mongoose.connection.db.collection("reviews").indexes();
            console.log("\nActual Indexes present on 'reviews' collection in MongoDB:");
            console.log(JSON.stringify(indexes, null, 2));
        } else {
            console.log("\n'reviews' collection does not exist in MongoDB yet.");
        }
    } catch (err) {
        console.error("❌ Index inspection error:", err.message || "An error occurred during index inspection");
        process.exitCode = 1;
    } finally {
        // 5. Ensure mongoose.disconnect() runs in finally only when a connection was opened, and handle disconnect errors safely.
        if (isConnected) {
            try {
                await mongoose.disconnect();
                console.log("✓ Disconnected safely from MongoDB.");
            } catch (disconnectErr) {
                console.error("❌ Error disconnecting from MongoDB:", disconnectErr.message || "Failed to disconnect safely");
                process.exitCode = 1;
            }
        }
    }

    if (process.exitCode && process.exitCode !== 0) {
        process.exit(process.exitCode);
    }
};

checkReviewsIndexes();
