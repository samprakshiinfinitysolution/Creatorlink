import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import Workspace from "../modules/workspace/workspace.model.js";
import { parseDeliverablesToObjects } from "../modules/workspace/workspace.service.js";

dotenv.config();

const migrateLegacyDeliverables = async () => {
    let totalWorkspaces = 0;
    let legacyFound = 0;
    let migratedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    let completedMigrated = 0;
    let submittedMigrated = 0;
    let inProgressMigrated = 0;

    try {
        await connectDatabase();
        console.log("Connected to database for legacy deliverables migration...\n");

        // Fetch raw documents directly using .lean() / raw MongoDB driver cursor to avoid Mongoose schema casting
        const allWorkspaces = await Workspace.collection.find({}).toArray();
        totalWorkspaces = allWorkspaces.length;

        console.log(`Total Workspaces found in DB: ${totalWorkspaces}`);

        for (const doc of allWorkspaces) {
            const rawDeliverables = doc.deliverables;

            // Check if deliverables is a legacy array of strings
            const isLegacy = Array.isArray(rawDeliverables) &&
                rawDeliverables.length > 0 &&
                typeof rawDeliverables[0] === "string";

            if (!isLegacy) {
                console.log(`[SKIP] Workspace ID: ${doc._id} - Deliverables already structured or empty.`);
                skippedCount++;
                continue;
            }

            legacyFound++;

            // Check workspace status support
            let targetDeliverableStatus = null;
            if (doc.status === "completed") {
                targetDeliverableStatus = "completed";
            } else if (doc.status === "submitted") {
                targetDeliverableStatus = "submitted";
            } else if (doc.status === "in_progress") {
                targetDeliverableStatus = "pending";
            } else {
                console.log(`[SKIP-UNKNOWN-STATUS] Workspace ID: ${doc._id} - Unsupported status '${doc.status}'. Skipping.`);
                skippedCount++;
                continue;
            }

            // Convert legacy string deliverables to structured objects using existing service helper
            const structuredDeliverables = parseDeliverablesToObjects(rawDeliverables, doc.deadline);

            // Apply status mapping based on workspace macro status
            structuredDeliverables.forEach((item) => {
                item.status = targetDeliverableStatus;
            });

            // Log details before updating document
            console.log(`\n--------------------------------------------------`);
            console.log(`Migrating Workspace ID   : ${doc._id}`);
            console.log(`Current Workspace Status : ${doc.status}`);
            console.log(`Old Deliverables (Strings):`, JSON.stringify(rawDeliverables));
            console.log(`New Deliverable Count    : ${structuredDeliverables.length}`);
            console.log(`New Deliverable Statuses : ${targetDeliverableStatus} (all ${structuredDeliverables.length})`);

            try {
                // Perform atomic update on deliverables field only
                const result = await Workspace.updateOne(
                    { _id: doc._id },
                    { $set: { deliverables: structuredDeliverables } }
                );

                if (result.modifiedCount === 1) {
                    migratedCount++;
                    if (doc.status === "completed") completedMigrated++;
                    else if (doc.status === "submitted") submittedMigrated++;
                    else if (doc.status === "in_progress") inProgressMigrated++;
                    console.log(`✓ SUCCESS: Workspace ${doc._id} updated successfully.`);
                } else {
                    console.error(`✗ FAILED: Workspace ${doc._id} was not modified.`);
                    failedCount++;
                }
            } catch (err) {
                console.error(`✗ ERROR updating Workspace ${doc._id}:`, err.message);
                failedCount++;
            }
        }

        // Print Summary Report
        console.log("\n=========================================");
        console.log("  DELIVERABLES MIGRATION SUMMARY REPORT  ");
        console.log("=========================================");
        console.log(`Total Workspaces Processed : ${totalWorkspaces}`);
        console.log(`Legacy Workspaces Found    : ${legacyFound}`);
        console.log(`Successfully Migrated      : ${migratedCount}`);
        console.log(`Skipped Workspaces         : ${skippedCount}`);
        console.log(`Failed Workspaces          : ${failedCount}`);
        console.log("-----------------------------------------");
        console.log(`Completed Migrated         : ${completedMigrated}`);
        console.log(`Submitted Migrated         : ${submittedMigrated}`);
        console.log(`In-Progress Migrated       : ${inProgressMigrated}`);
        console.log("=========================================\n");

    } catch (error) {
        console.error("Migration Script Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
};

migrateLegacyDeliverables();
