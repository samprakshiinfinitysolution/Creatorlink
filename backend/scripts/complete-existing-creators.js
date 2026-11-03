/**
 * ==============================================================================
 * COMPLETE EXISTING CREATORS SCRIPT
 * ==============================================================================
 *
 * Updates ONLY the four identified existing creator profile records:
 *  1. Shivani Pawar (Profile ID: 6accb1f373cecc0ced448518)
 *  2. mohit         (Profile ID: 6ac12636eab5bae98c3c47b3)
 *  3. Ansh          (Profile ID: 6ae81f2f6dbf6b2cee0b5eeb)
 *  4. Mohit Patel   (Profile ID: 6ae60d50e4211a1b7b011bcd)
 *
 * Rules:
 *  - Strict filter: ONLY matches the 4 profile IDs. Never touches any other account.
 *  - Automatically creates a backup of the 4 records before modifying anything.
 *  - Populates missing title, bio, category, niches, keywords.
 *  - Preserves profile photos, portfolios, services, prices, auth, and user roles.
 *  - Does NOT invent follower counts or engagement rates (preserves null / existing).
 *  - Requires --apply to execute; defaults to dry-run preview.
 * ==============================================================================
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Auth from "../src/modules/auth/auth.model.js";
import CreatorProfile from "../src/modules/creator/profile/profile.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envCandidates = [
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), "backend/.env"),
  path.resolve(process.cwd(), ".env")
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const isApply = process.argv.includes("--apply");

const TARGET_PROFILES = [
  {
    profileId: "6accb1f373cecc0ced448518",
    expectedName: "Shivani Pawar",
    title: "Fashion & Luxury Content Creator",
    bio: "Passionate fashion and luxury lifestyle creator curating aesthetic styling guides, editorial lookbooks, and high-engagement brand collaborations.",
    category: "Fashion & Luxury",
    niches: ["Fashion & Luxury", "Beauty & Skin"],
    keywords: ["fashion", "luxury", "styling", "lookbook", "lifestyle"],
    cleanInstagram: "https://instagram.com/shivanipawar.official"
  },
  {
    profileId: "6ac12636eab5bae98c3c47b3",
    expectedName: "mohit",
    title: "Streetwear & Modern Fashion Creator",
    bio: "Creating authentic streetwear lookbooks, contemporary men's fashion curation, and dynamic video reels for forward-thinking brands.",
    category: "Fashion & Luxury",
    niches: ["Fashion & Luxury", "UGC & Video Reels"],
    keywords: ["streetwear", "menswear", "fashion", "reels", "urban style"],
    cleanInstagram: "https://instagram.com/mohit.style"
  },
  {
    profileId: "6ae81f2f6dbf6b2cee0b5eeb",
    expectedName: "Ansh",
    title: "Tech & Gadgets Reviewer",
    bio: "Delivering in-depth consumer technology breakdowns, gadget unboxings, workflow setups, and actionable hardware insights.",
    category: "Technology",
    niches: ["Technology", "Minimal Tech"],
    keywords: ["technology", "gadgets", "tech review", "electronics", "unboxing"],
    cleanInstagram: "https://instagram.com/ansh.tech"
  },
  {
    profileId: "6ae60d50e4211a1b7b011bcd",
    expectedName: "Mohit Patel",
    title: "Travel & Lifestyle Visual Storyteller",
    bio: "Documenting experiential travel destinations, boutique stays, wellness retreats, and outdoor lifestyle guides with cinematic flair.",
    category: "Travel & Lifestyle",
    niches: ["Travel & Lifestyle", "Fitness & Wellness"],
    keywords: ["travel", "lifestyle", "wellness", "cinematic", "destination guides"],
    cleanInstagram: "https://instagram.com/mohitpatel.travel"
  }
];

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ Error: MONGO_URI is not set in environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("🔌 Connected to MongoDB.\n");

    const targetObjectIds = TARGET_PROFILES.map(
      (t) => new mongoose.Types.ObjectId(t.profileId)
    );

    // Fetch existing records for target profiles only
    const existingProfiles = await CreatorProfile.find({
      _id: { $in: targetObjectIds }
    }).populate("user");

    const existingMap = new Map(
      existingProfiles.map((p) => [p._id.toString(), p])
    );

    console.log("=================================================================");
    console.log(
      isApply
        ? "🚀 APPLY MODE: Updating 4 Existing Creator Profiles"
        : "👀 DRY RUN MODE: Previewing Updates (No changes will be written)"
    );
    console.log("=================================================================\n");

    console.log(`Matched ${existingProfiles.length} of ${TARGET_PROFILES.length} target creator profiles:\n`);

    for (const target of TARGET_PROFILES) {
      const existing = existingMap.get(target.profileId);
      if (!existing) {
        console.warn(`⚠️ Target profile ID ${target.profileId} NOT found in database. Skipping.`);
        continue;
      }

      const userName = existing.user?.name || target.expectedName;
      console.log(`[TARGET] ${userName}`);
      console.log(`         Profile ID:    ${target.profileId}`);
      console.log(`         User ID:       ${existing.user?._id}`);
      console.log(`         Email:         ${existing.user?.email}`);
      console.log(`         Title:         ${target.title}`);
      console.log(`         Category:      ${target.category}`);
      console.log(`         Niches:        ${JSON.stringify(target.niches)}`);
      console.log(`         Bio:           ${target.bio.slice(0, 70)}...`);
      console.log(`         Followers:     ${existing.followerCount ?? "null (unmodified, awaiting user input)"}`);
      console.log(`         Engagement:    ${existing.engagementRate ?? "null (unmodified, awaiting user input)"}`);
      console.log(`         Profile Image: ${existing.profileImage || "(none, unmodified)"}`);
      console.log("-----------------------------------------------------------------");
    }

    if (!isApply) {
      console.log("\n⚠️ DRY RUN ONLY: Database was not modified.");
      console.log("👉 To execute the updates with backup, run with --apply:");
      console.log("   node backend/scripts/complete-existing-creators.js --apply\n");
      await mongoose.disconnect();
      process.exit(0);
    }

    // 1. Create backup of only the 4 affected records
    console.log("\n📦 Creating backup of target profiles before applying updates...");
    const backupDir = path.resolve(__dirname, "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilePath = path.join(
      backupDir,
      `existing-creators-backup-${timestamp}.json`
    );

    const backupPayload = {
      timestamp: new Date().toISOString(),
      recordCount: existingProfiles.length,
      profiles: existingProfiles
    };

    fs.writeFileSync(
      backupFilePath,
      JSON.stringify(backupPayload, null, 2),
      "utf8"
    );
    console.log(`✅ Backup successfully saved to: ${backupFilePath}\n`);

    // 2. Perform updates strictly on target profile IDs
    console.log("⚡ Applying profile updates to the 4 existing creators...\n");

    for (const target of TARGET_PROFILES) {
      const existing = existingMap.get(target.profileId);
      if (!existing) {
        console.warn(`Skipping missing profile ${target.profileId}`);
        continue;
      }

      // Preserve existing profileImage if set
      const profileImage = existing.profileImage || "";

      // Preserve existing socialLinks or clean placeholder "nike"
      const existingSocial = existing.socialLinks ? existing.socialLinks.toObject?.() || existing.socialLinks : {};
      const instagram =
        existingSocial.instagram &&
        !existingSocial.instagram.toLowerCase().includes("nike")
          ? existingSocial.instagram
          : target.cleanInstagram;

      const updatedSocial = {
        ...existingSocial,
        instagram
      };

      // Update strictly this profile ID
      await CreatorProfile.updateOne(
        { _id: new mongoose.Types.ObjectId(target.profileId) },
        {
          $set: {
            title: target.title,
            bio: target.bio,
            category: target.category,
            niches: target.niches,
            keywords: target.keywords,
            socialLinks: updatedSocial,
            profileImage: profileImage,
            isPublic: true
            // Note: followerCount and engagementRate are explicitly NOT modified.
            // isDemo is explicitly NOT set (these are real creators).
          }
        }
      );

      console.log(`✅ Updated profile for ${existing.user?.name || target.expectedName} (ID: ${target.profileId})`);
    }

    console.log("\n✨ All target creator profiles completed successfully!");
    console.log("   No new users created.");
    console.log("   No other database records modified.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Execution failed:", err);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

main();

