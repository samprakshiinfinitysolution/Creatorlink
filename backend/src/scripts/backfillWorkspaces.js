import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDatabase from "../config/database.js";
import Booking from "../modules/booking/booking.model.js";
import Workspace from "../modules/workspace/workspace.model.js";
import { createWorkspaceForAcceptedBooking } from "../modules/workspace/workspace.service.js";

dotenv.config();

// One-time safe backfill script to create missing Workspaces for accepted Bookings.
const backfillWorkspaces = async () => {
    let totalAccepted = 0;
    let existingWorkspaces = 0;
    let newlyCreated = 0;
    let failedRecords = 0;

    try {
        await connectDatabase();

        // 1. Fetch all bookings with status "accepted"
        const acceptedBookings = await Booking.find({ status: "accepted" });
        totalAccepted = acceptedBookings.length;

        console.log(`Found ${totalAccepted} accepted booking(s) to process.`);

        // 2. Iterate through each accepted booking
        for (const booking of acceptedBookings) {
            try {
                // Check if workspace already exists for this booking
                const existing = await Workspace.findOne({ booking: booking._id });

                if (existing) {
                    existingWorkspaces++;
                } else {
                    // Create workspace using existing service helper
                    const created = await createWorkspaceForAcceptedBooking(booking);
                    if (created) {
                        newlyCreated++;
                    } else {
                        failedRecords++;
                    }
                }
            } catch (err) {
                console.error(`Failed to create workspace for booking ID ${booking._id}:`, err.message);
                failedRecords++;
            }
        }

        // 3. Print summary report
        console.log("\n=========================================");
        console.log("    WORKSPACE BACKFILL SUMMARY REPORT    ");
        console.log("=========================================");
        console.log(`Total Accepted Bookings Processed : ${totalAccepted}`);
        console.log(`Already Existing Workspaces       : ${existingWorkspaces}`);
        console.log(`Newly Created Workspaces          : ${newlyCreated}`);
        console.log(`Failed Records                    : ${failedRecords}`);
        console.log("=========================================\n");

    } catch (error) {
        console.error("Backfill script error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
        process.exit(0);
    }
};

backfillWorkspaces();
