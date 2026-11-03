/**
 * ==============================================================================
 * DEMO CREATOR SEED & REFRESH SCRIPT
 * ==============================================================================
 *
 * Safely seeds deterministic demo creator profiles for the CreatorLink platform.
 *
 * Rules:
 *  - DEFAULT IS DRY-RUN: Won't write to DB unless `--apply` flag is passed.
 *  - IDEMPOTENT: Uses deterministic demo email addresses (demo.creator.*@creatorlink.demo).
 *  - NON-DESTRUCTIVE: Never touches, modifies, or deletes real creators.
 *  - BACKUP: Automatically backs up existing demo records before applying changes.
 *
 * Usage:
 *  Dry run (preview only):
 *    node backend/scripts/seed-demo-creators.js
 *
 *  Apply changes:
 *    node backend/scripts/seed-demo-creators.js --apply
 * ==============================================================================
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Auth from "../src/modules/auth/auth.model.js";
import CreatorProfile from "../src/modules/creator/profile/profile.model.js";
import CreatorService from "../src/modules/creator/services/services.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate and load .env file
const envCandidates = [
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), "backend/.env"),
  path.resolve(process.cwd(), ".env")
];

let loadedEnv = false;
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loadedEnv = true;
    break;
  }
}

if (!loadedEnv) {
  dotenv.config();
}

const isApply = process.argv.includes("--apply");

const DEMO_CREATORS = [
  {
    email: "demo.creator.maya@creatorlink.demo",
    name: "Maya Lin",
    handle: "@maya.demo",
    category: "Fashion & Luxury",
    niches: ["Fashion & Luxury", "Lifestyle"],
    followerCount: 128000,
    engagementRate: 4.8,
    startingPrice: 18000,
    currency: "INR",
    profileImage:
      "https://res.cloudinary.com/atr5osne/image/upload/v1791822058/creatorlink/public/creators/creator_streetwear_maya_thorne.jpg",
    socialLinks: {
      instagram: "https://instagram.com/maya.demo",
      tiktok: "https://tiktok.com/@maya.demo"
    },
    bio: "Curating high-end fashion, minimal aesthetics, and luxury editorial stories for visionary brands.",
    title: "Fashion & Luxury Creator",
    serviceTitle: "Fashion Editorial & Brand Collaboration Reel",
    serviceDescription:
      "1 high-definition fashion lookbook reel with professional color grading and style curation."
  },
  {
    email: "demo.creator.lucian@creatorlink.demo",
    name: "Lucian Vance",
    handle: "@lucian.demo",
    category: "Tech & Lifestyle",
    niches: ["Tech & Lifestyle", "Editorial"],
    followerCount: 340000,
    engagementRate: 6.2,
    startingPrice: 45000,
    currency: "INR",
    profileImage:
      "https://res.cloudinary.com/atr5osne/image/upload/v1791822008/creatorlink/public/creators/creator_fashion_lucian_moreau.jpg",
    socialLinks: {
      instagram: "https://instagram.com/lucian.demo",
      youtube: "https://youtube.com/@lucian.demo"
    },
    bio: "Tech minimalist and industrial design enthusiast creating cinematic product storytelling.",
    title: "Tech & Lifestyle Creator",
    serviceTitle: "Cinematic Product Video & Editorial Showcase",
    serviceDescription:
      "Comprehensive 4K product integration reel and in-depth lifestyle feature."
  },
  {
    email: "demo.creator.clara@creatorlink.demo",
    name: "Clara Bell",
    handle: "@clara.demo",
    category: "UGC & Video Reels",
    niches: ["UGC & Video Reels", "Motion"],
    followerCount: 95000,
    engagementRate: 8.4,
    startingPrice: 15000,
    currency: "INR",
    profileImage:
      "https://res.cloudinary.com/atr5osne/image/upload/v1791822177/creatorlink/public/creators/creator_workspace_clara_vane.jpg",
    socialLinks: {
      instagram: "https://instagram.com/clara.demo",
      tiktok: "https://tiktok.com/@clara.demo"
    },
    bio: "High-converting UGC video creator specializing in organic hooks, product demos, and viral reels.",
    title: "UGC Video Specialist",
    serviceTitle: "Organic UGC Video Ad & Creative Reel",
    serviceDescription:
      "2 dynamic UGC reels optimized for high organic engagement and paid ad conversion."
  },
  {
    email: "demo.creator.sora@creatorlink.demo",
    name: "Sora Tanaka",
    handle: "@sora.demo",
    category: "Travel & Lifestyle",
    niches: ["Travel & Lifestyle", "Architecture"],
    followerCount: 215000,
    engagementRate: 5.1,
    startingPrice: 32000,
    currency: "INR",
    profileImage:
      "https://res.cloudinary.com/atr5osne/image/upload/v1791822180/creatorlink/public/editorial/editorial_architectural_interior_sora.jpg",
    socialLinks: {
      instagram: "https://instagram.com/sora.demo",
      youtube: "https://youtube.com/@sora.demo"
    },
    bio: "Architectural visual storyteller exploring modern sanctuaries, boutique stays, and curated travel.",
    title: "Travel & Architectural Visualist",
    serviceTitle: "Architectural Destination Showcase & Reel",
    serviceDescription:
      "Cinematic visual tour and editorial still collection for hospitality and travel brands."
  }
];

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ Error: MONGO_URI is not defined in the environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("🔌 Connected to MongoDB.\n");

    const demoEmails = DEMO_CREATORS.map((c) => c.email);

    // Inspect existing demo records
    const existingUsers = await Auth.find({ email: { $in: demoEmails } });
    const existingUserMap = new Map(existingUsers.map((u) => [u.email, u]));

    const existingUserIds = existingUsers.map((u) => u._id);
    const existingProfiles = await CreatorProfile.find({
      user: { $in: existingUserIds }
    });
    const existingServices = await CreatorService.find({
      creator: { $in: existingUserIds }
    });

    console.log("=================================================================");
    console.log(isApply ? "🚀 APPLY MODE: Committing Demo Creators" : "👀 DRY RUN MODE: Previewing Demo Creators (No changes made)");
    console.log("=================================================================\n");

    console.log(`Found ${existingUsers.length} existing demo user record(s).`);
    console.log(`Target demo creators to seed/update: ${DEMO_CREATORS.length}\n`);

    console.log("PLAN SUMMARY:");
    console.log("-----------------------------------------------------------------");
    for (const c of DEMO_CREATORS) {
      const exists = existingUserMap.has(c.email);
      const action = exists ? "UPDATE" : "CREATE";
      console.log(`[${action}] ${c.name} (${c.handle})`);
      console.log(`         Email:           ${c.email}`);
      console.log(`         Category:        ${c.category}`);
      console.log(`         Followers:       ${c.followerCount.toLocaleString()} (128K/340K/95K/215K)`);
      console.log(`         Engagement:      ${c.engagementRate}%`);
      console.log(`         Starting Price:  ₹${c.startingPrice.toLocaleString()} ${c.currency}`);
      console.log(`         Profile Image:   ${c.profileImage}`);
      console.log(`         isDemo Flag:     true`);
      console.log("-----------------------------------------------------------------");
    }

    if (!isApply) {
      console.log("\n⚠️  DRY RUN ONLY: No records were modified in the database.");
      console.log("👉 To apply these changes to MongoDB, run with the --apply flag:");
      console.log("   node backend/scripts/seed-demo-creators.js --apply\n");
      await mongoose.disconnect();
      process.exit(0);
    }

    // APPLY MODE
    console.log("\n📦 Creating backup before modifying database...");
    const backupDir = path.resolve(__dirname, "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilePath = path.join(backupDir, `demo-creators-backup-${timestamp}.json`);
    const backupPayload = {
      timestamp: new Date().toISOString(),
      existingUsers,
      existingProfiles,
      existingServices
    };
    fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), "utf8");
    console.log(`✅ Backup saved to: ${backupFilePath}\n`);

    console.log("⚡ Applying demo creator updates...");
    const defaultPasswordHash = await bcrypt.hash("DemoCreatorPass#2026!", 10);

    for (const creatorData of DEMO_CREATORS) {
      // 1. Upsert Auth
      let authUser = await Auth.findOne({ email: creatorData.email });
      if (!authUser) {
        authUser = await Auth.create({
          name: creatorData.name,
          email: creatorData.email,
          password: defaultPasswordHash,
          role: "creator",
          isVerified: true
        });
        console.log(`  + Created Auth user for ${creatorData.name} (${creatorData.email})`);
      } else {
        authUser.name = creatorData.name;
        authUser.role = "creator";
        authUser.isVerified = true;
        await authUser.save();
        console.log(`  ~ Updated Auth user for ${creatorData.name} (${creatorData.email})`);
      }

      // 2. Upsert CreatorProfile
      const profile = await CreatorProfile.findOneAndUpdate(
        { user: authUser._id },
        {
          $set: {
            user: authUser._id,
            title: creatorData.title,
            bio: creatorData.bio,
            category: creatorData.category,
            niches: creatorData.niches,
            profileImage: creatorData.profileImage,
            socialLinks: creatorData.socialLinks,
            followerCount: creatorData.followerCount,
            engagementRate: creatorData.engagementRate,
            isDemo: true,
            isPublic: true
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`  ~ Synced CreatorProfile for ${creatorData.name} (isDemo: true, followers: ${profile.followerCount}, engagement: ${profile.engagementRate}%)`);

      // 3. Upsert CreatorService (to supply startingPrice)
      await CreatorService.findOneAndUpdate(
        { creator: authUser._id, title: creatorData.serviceTitle },
        {
          $set: {
            creator: authUser._id,
            title: creatorData.serviceTitle,
            description: creatorData.serviceDescription,
            category: creatorData.category,
            platform: "instagram",
            contentType: "Reel",
            quantity: 1,
            pricingType: "starting_from",
            price: creatorData.startingPrice,
            currency: creatorData.currency,
            coverImage: creatorData.profileImage,
            isActive: true
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`  ~ Synced CreatorService for ${creatorData.name} (price: ₹${creatorData.startingPrice})\n`);
    }

    console.log("✨ All 4 demo creators seeded and synced successfully!");
    console.log("   Real user accounts were unaffected.");
    console.log("   Run the homepage query to verify they rank properly based on follower count.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed execution failed:", err);
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect error
    }
    process.exit(1);
  }
}

main();

