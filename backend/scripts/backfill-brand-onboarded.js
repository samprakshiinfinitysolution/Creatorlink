import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envCandidates = [
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), "backend/.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const isApply = process.argv.includes("--apply");

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set!");
    process.exit(1);
  }

  console.log(`Mode: ${isApply ? "APPLY (writing changes)" : "DRY-RUN (preview only, run with --apply to execute)"}`);
  console.log("Connecting to MongoDB Atlas using backend config...");
  await mongoose.connect(mongoUri);
  console.log(`Connected to database: "${mongoose.connection.name}" successfully!\n`);

  const db = mongoose.connection.db;

  // 1. Fetch raw brand profiles to inspect exact BSON fields
  const rawProfiles = await db.collection("brandprofiles").find({}).toArray();
  console.log(`Found ${rawProfiles.length} existing brandprofiles in database:`);
  for (const doc of rawProfiles) {
    console.log(`- Profile ID: ${doc._id} | User: ${doc.user} | Company: "${doc.companyName || ''}" | isOnboarded: ${doc.isOnboarded} (field exists: ${Object.prototype.hasOwnProperty.call(doc, "isOnboarded")})`);
  }

  // 2. Fetch all Auth users with role: "brand"
  const brandUsers = await db.collection("auths").find({ role: "brand" }).toArray();
  console.log(`\nFound ${brandUsers.length} brand users in auths collection:`);
  for (const u of brandUsers) {
    const matchingProfile = rawProfiles.find((p) => p.user && p.user.toString() === u._id.toString());
    console.log(`- User ID: ${u._id} | Email: ${u.email} | Name: "${u.name}" | Profile ID: ${matchingProfile ? matchingProfile._id : 'NONE'} | isOnboarded: ${matchingProfile ? matchingProfile.isOnboarded : 'N/A'}`);
  }

  // 3. Find profiles needing isOnboarded field
  const profilesToUpdate = rawProfiles.filter(
    (p) => !Object.prototype.hasOwnProperty.call(p, "isOnboarded") || p.isOnboarded === null || p.isOnboarded === undefined
  );
  console.log(`\nProfiles needing isOnboarded set to false: ${profilesToUpdate.length}`);

  // 4. Find brand users without any profile
  const usersWithoutProfile = brandUsers.filter(
    (u) => !rawProfiles.some((p) => p.user && p.user.toString() === u._id.toString())
  );
  console.log(`Brand users needing initial profile created: ${usersWithoutProfile.length}`);

  if (isApply) {
    if (profilesToUpdate.length > 0) {
      const updateResult = await db.collection("brandprofiles").updateMany(
        {
          _id: { $in: profilesToUpdate.map((p) => p._id) },
          // Extra safety: NEVER overwrite existing true!
          $or: [
            { isOnboarded: { $exists: false } },
            { isOnboarded: null },
            { isOnboarded: undefined },
          ],
        },
        {
          $set: { isOnboarded: false },
        }
      );
      console.log(`\n[APPLIED] Updated ${updateResult.modifiedCount} existing brand profile(s) with isOnboarded: false`);
    }

    for (const u of usersWithoutProfile) {
      const newDoc = {
        user: u._id,
        companyName: u.name || "Brand Company",
        industry: "",
        location: "",
        logo: "",
        description: "",
        website: "",
        socialLinks: {},
        contactInformation: {
          email: u.email || "",
          phone: "",
          address: "",
        },
        isOnboarded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insertResult = await db.collection("brandprofiles").insertOne(newDoc);
      console.log(`[APPLIED] Created initial BrandProfile for user ${u.email} (${u._id}) with profile ID ${insertResult.insertedId}`);
    }

    // 5. Final verification
    const finalRawProfiles = await db.collection("brandprofiles").find({}).toArray();
    console.log(`\n=== Post-Backfill Verification ===`);
    console.log(`Total brandprofiles count: ${finalRawProfiles.length}`);
    let allValid = true;
    for (const doc of finalRawProfiles) {
      const hasField = Object.prototype.hasOwnProperty.call(doc, "isOnboarded");
      const isBool = typeof doc.isOnboarded === "boolean";
      console.log(`- Profile ID: ${doc._id} | User: ${doc.user} | Company: "${doc.companyName}" | isOnboarded: ${doc.isOnboarded} | Valid boolean: ${isBool}`);
      if (!hasField || !isBool) {
        allValid = false;
      }
    }
    console.log(`\nAll brand profiles have valid boolean isOnboarded: ${allValid ? "YES (SUCCESS)" : "NO (FAIL)"}`);
  } else {
    console.log("\nDry run complete. No modifications were made. Run with --apply to apply changes.");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
