import mongoose from "mongoose";
import dns from "node:dns";

const configureDns = () => {
    try {
        dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    } catch {
        // Fallback silently if custom DNS cannot be set
    }
};

// Connects the application to the MongoDB database.
const connectDatabase = async (customUri = null) => {
    try {
        configureDns();

        const uri = customUri || process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MongoDB connection URI is missing.");
        }

        await mongoose.connect(uri);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

// Connects exclusively to an isolated test database with strict safety guards.
// Prevents accidental connection to or mutation of production data.
const connectTestDatabase = async () => {
    configureDns();

    if (process.env.NODE_ENV === "production") {
        throw new Error("CRITICAL SAFETY GUARD: Cannot run test suite in production environment!");
    }

    // 1. Check for dedicated test URI in environment
    const explicitTestUri =
        process.env.MONGODB_TEST_URI ||
        process.env.MONGO_URI_TEST ||
        process.env.TEST_MONGO_URI;

    let targetUri;
    let expectedDbName;

    if (explicitTestUri && explicitTestUri.trim().length > 0) {
        targetUri = explicitTestUri.trim();
        const parsed = new URL(targetUri);
        expectedDbName = (parsed.pathname || "").replace(/^\//, "").trim();
        if (!expectedDbName || !/test/i.test(expectedDbName)) {
            throw new Error(
                `CRITICAL SAFETY GUARD: Dedicated test database URI '${expectedDbName}' must contain 'test' in its database name.`
            );
        }
    } else {
        // 2. Explicit test-environment guard: derive isolated test DB from MONGO_URI
        const rawUri = process.env.MONGO_URI;
        if (!rawUri || typeof rawUri !== "string" || rawUri.trim().length === 0) {
            throw new Error("CRITICAL SAFETY GUARD: No MongoDB URI configured for test execution.");
        }

        const parsed = new URL(rawUri.trim());
        if (/prod|production/i.test(parsed.host) || /prod|production/i.test(parsed.pathname)) {
            throw new Error(
                "CRITICAL SAFETY GUARD: Configured MongoDB URI appears to target production. Refusing to run tests."
            );
        }

        expectedDbName = "creatorlink_instagram_test";
        parsed.pathname = `/${expectedDbName}`;
        targetUri = parsed.toString();
    }

    await mongoose.connect(targetUri);

    const actualDbName = mongoose.connection.name || mongoose.connection.db?.databaseName;
    if (!actualDbName || !/test/i.test(actualDbName)) {
        await mongoose.disconnect();
        throw new Error(
            `CRITICAL SAFETY GUARD: Connected database '${actualDbName}' does not satisfy the test isolation requirement.`
        );
    }

    console.log(`✓ Connected safely to isolated test database: "${actualDbName}"`);
    return mongoose.connection;
};

export default connectDatabase;
export { connectTestDatabase };
