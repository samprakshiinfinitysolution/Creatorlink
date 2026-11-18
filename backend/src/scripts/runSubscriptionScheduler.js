import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { runSubscriptionSchedulerJobs } from "../modules/subscriptions/subscriptionScheduler.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

async function main() {
    console.log("================================================================================");
    console.log("   CREATORLINK PRODUCTION SUBSCRIPTION SCHEDULER                                ");
    console.log("================================================================================");

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("FATAL: MONGO_URI environment variable is required to run the subscription scheduler.");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB successfully.\n");

        const result = await runSubscriptionSchedulerJobs();
        console.log("\nScheduler execution finished successfully:", JSON.stringify(result, null, 2));

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("\nScheduler execution encountered an unhandled error:", err);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
}

// Only auto-run if executed directly as entrypoint script
if (process.argv[1] && process.argv[1].endsWith("runSubscriptionScheduler.js")) {
    main();
}

export default main;
