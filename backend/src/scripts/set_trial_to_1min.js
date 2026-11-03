import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import Subscription from "../modules/subscriptions/subscription.model.js";

async function setTrialToOneMinute() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const now = new Date();
  const oneMinuteLater = new Date(now.getTime() + 60 * 1000);

  const result = await Subscription.updateMany(
    { billingCycle: "trial" },
    {
      $set: {
        trialStartDate: now,
        trialEndDate: oneMinuteLater,
        currentPeriodStart: now,
        currentPeriodEnd: oneMinuteLater,
        status: "trialing",
      },
    }
  );

  console.log(`Updated ${result.modifiedCount} trial subscriptions to expire in exactly 1 minute.`);
  console.log(`Trial Start: ${now.toLocaleTimeString()}`);
  console.log(`Trial End:   ${oneMinuteLater.toLocaleTimeString()}`);

  await mongoose.disconnect();
}

setTrialToOneMinute().catch(console.error);

