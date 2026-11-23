import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
import Booking from "../modules/booking/booking.model.js";

dotenv.config();

/**
 * Safe, non-destructive index verification and initialization script.
 * 
 * Safeguards:
 * 1. Explicitly detects and logs the exact database name and host before any action.
 * 2. Requires ALLOW_PROD_INDEX_MIGRATION=true if the connected database is not a test database.
 * 3. Scans for existing duplicate records non-destructively; aborts cleanly without data loss.
 * 4. Creates index in background mode to avoid locking production collections.
 */
async function verifyAndInitializeBookingIndex() {
    console.log("===============================================================================");
    console.log("             BOOKING UNIQUE INDEX SAFE VERIFICATION & MIGRATION                ");
    console.log("===============================================================================\n");

    const targetUri = process.env.INDEX_MIGRATION_MONGO_URI || process.env.TEST_MONGO_URI || process.env.MONGO_URI;

    if (!targetUri) {
        console.error("[ERROR] No MongoDB URI specified in environment (INDEX_MIGRATION_MONGO_URI, TEST_MONGO_URI, or MONGO_URI).");
        process.exit(1);
    }

    try {
        dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    } catch {
        // Fallback silently if custom DNS cannot be set
    }

    await mongoose.connect(targetUri);

    const connectedDbName = mongoose.connection.name || mongoose.connection.db?.databaseName;
    const connectedHost = mongoose.connection.host;

    console.log(`[TARGET DATABASE] Database: "${connectedDbName}"`);
    console.log(`[TARGET HOST]     Host:     "${connectedHost}"`);

    const isTestDb = connectedDbName && (
        connectedDbName.toLowerCase().includes("test") ||
        connectedDbName.toLowerCase().includes("isolated")
    );

    if (!isTestDb && process.env.ALLOW_PROD_INDEX_MIGRATION !== "true") {
        console.warn("\n[SAFEGUARD WARNING] The connected database appears to be a NON-TEST / PRODUCTION database.");
        console.warn(`Database name: "${connectedDbName}"`);
        console.warn("To confirm you want to verify/create indexes on this database, export ALLOW_PROD_INDEX_MIGRATION=true.");
        console.warn("Aborting safely without making any changes.\n");
        await mongoose.disconnect();
        process.exit(1);
    }

    const collection = mongoose.connection.collection("bookings");

    // 1. Inspect existing indexes
    const existingIndexes = await collection.indexes();
    console.log("\n[INFO] Existing indexes on 'bookings' collection:");
    existingIndexes.forEach((idx) => {
        console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${Boolean(idx.unique)})`);
    });

    const alreadyHasUniqueIndex = existingIndexes.some(
        (idx) => idx.key && idx.key.campaign === 1 && idx.key.creator === 1 && idx.unique === true
    );

    if (alreadyHasUniqueIndex) {
        console.log(`\n[SUCCESS] Compound unique index { campaign: 1, creator: 1 } already exists on database "${connectedDbName}".`);
        await mongoose.disconnect();
        return;
    }

    // 2. Non-destructive duplicate check
    console.log("\n[CHECK] Scanning collection for duplicate { campaign, creator } records before index creation...");
    const duplicates = await collection.aggregate([
        {
            $group: {
                _id: { campaign: "$campaign", creator: "$creator" },
                count: { $sum: 1 },
                bookingIds: { $push: "$_id" }
            }
        },
        {
            $match: {
                count: { $gt: 1 },
                "_id.campaign": { $ne: null },
                "_id.creator": { $ne: null }
            }
        }
    ]).toArray();

    if (duplicates.length > 0) {
        console.warn(`\n[WARNING] Found ${duplicates.length} duplicate application pair(s) in database "${connectedDbName}":`);
        duplicates.forEach((dup, i) => {
            console.warn(`  [${i + 1}] Campaign: ${dup._id.campaign}, Creator: ${dup._id.creator} (Count: ${dup.count})`);
            console.warn(`      Booking IDs: ${dup.bookingIds.join(", ")}`);
        });
        console.warn("\n[ACTION REQUIRED] Automatic unique index creation cannot proceed while duplicates exist.");
        console.warn("Resolve these duplicate records before creating the unique index.");
        await mongoose.disconnect();
        process.exit(1);
    }

    console.log(`[OK] No duplicate records found in database "${connectedDbName}". Creating unique index safely...`);
    await collection.createIndex(
        { campaign: 1, creator: 1 },
        { unique: true, background: true, name: "campaign_1_creator_1" }
    );
    console.log(`[SUCCESS] Compound unique index 'campaign_1_creator_1' successfully created on "${connectedDbName}".`);

    await mongoose.disconnect();
}

if (process.argv[1] && process.argv[1].endsWith("init_booking_unique_index.js")) {
    verifyAndInitializeBookingIndex().catch((err) => {
        console.error("[ERROR] Failed to verify/create booking unique index:", err);
        process.exit(1);
    });
}

export default verifyAndInitializeBookingIndex;
