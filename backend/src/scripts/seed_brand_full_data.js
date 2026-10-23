import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function seedBrandData() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.db;

  // 1. Get creator partners
  const mohit = await db.collection("auths").findOne({ email: "mohit@gmail.com" });
  const shivani = await db.collection("auths").findOne({ email: "sp@gmail.com" });
  const chinki = await db.collection("auths").findOne({ email: "chinki@gmail.com" });

  if (!mohit || !shivani || !chinki) {
    throw new Error("Required creator partners not found in database");
  }

  // 2. Target Brands:
  // Brand A: ansh@gmail.com (currently logged in)
  let ansh = await db.collection("auths").findOne({ email: "ansh@gmail.com" });
  if (!ansh) {
    const hashedPassword = await bcrypt.hash("Password@123", 10);
    const ins = await db.collection("auths").insertOne({
      name: "Ansh Synergie",
      email: "ansh@gmail.com",
      password: hashedPassword,
      role: "brand",
      isVerified: true,
      sessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    ansh = { _id: ins.insertedId, name: "Ansh Synergie", email: "ansh@gmail.com" };
  }

  // Brand B: brand_new@gmail.com (fresh new ID)
  let brandNew = await db.collection("auths").findOne({ email: "brand_new@gmail.com" });
  const defaultHashedPassword = await bcrypt.hash("Password@123", 10);
  if (!brandNew) {
    const ins = await db.collection("auths").insertOne({
      name: "Maison Synergie Luxe",
      email: "brand_new@gmail.com",
      password: defaultHashedPassword,
      role: "brand",
      isVerified: true,
      sessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    brandNew = { _id: ins.insertedId, name: "Maison Synergie Luxe", email: "brand_new@gmail.com" };
  }

  const brands = [ansh, brandNew];

  for (const b of brands) {
    console.log(`\n========================================`);
    console.log(`Seeding data for Brand: ${b.name} (${b.email}) - ID: ${b._id}`);
    console.log(`========================================`);

    // A. Upsert Brand Profile
    await db.collection("brandprofiles").updateOne(
      { user: b._id },
      {
        $set: {
          user: b._id,
          companyName: "Maison Synergie",
          description: "High-end luxury fashion, skincare, and modern lifestyle brand collaborating with digital innovators.",
          industry: "Luxury Fashion & Skincare",
          website: "https://maisonsynergie.com",
          location: "Mumbai, India",
          logo: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&auto=format&fit=crop",
          socialLinks: {
            instagram: "https://instagram.com/maisonsynergie",
            website: "https://maisonsynergie.com",
          },
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // B. Create Campaigns
    const now = new Date();
    const future15Days = new Date(now.getTime() + 15 * 86400000);
    const future25Days = new Date(now.getTime() + 25 * 86400000);
    const past5Days = new Date(now.getTime() - 5 * 86400000);
    const future10Days = new Date(now.getTime() + 10 * 86400000);

    // Campaign 1: Summer Glow Skincare (Published, will have completed unreviewed workspace)
    const c1 = await db.collection("campaigns").findOneAndUpdate(
      { brand: b._id, title: "Summer Glow Skincare Launch" },
      {
        $set: {
          brand: b._id,
          title: "Summer Glow Skincare Launch",
          description: "Promoting our new organic SPF 50 hydra-sunscreen line. Seeking beauty creators to showcase application texture and everyday glow.",
          category: "Beauty",
          platform: "instagram",
          budget: 45000,
          currency: "INR",
          deadline: future15Days,
          requiredCreators: 3,
          deliverables: ["1 Instagram 4K Reel", "2 High-engagement Stories", "Link in Bio Sticker"],
          status: "published",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const c1Doc = c1.value || await db.collection("campaigns").findOne({ brand: b._id, title: "Summer Glow Skincare Launch" });

    // Campaign 2: Festive Luxury Apparel Drop (Completed, will have reviewed workspace)
    const c2 = await db.collection("campaigns").findOneAndUpdate(
      { brand: b._id, title: "Festive Luxury Apparel Drop" },
      {
        $set: {
          brand: b._id,
          title: "Festive Luxury Apparel Drop",
          description: "Exclusive festive ethnic wear showcase featuring handwoven silk kurtas and evening gowns.",
          category: "Fashion",
          platform: "instagram",
          budget: 35000,
          currency: "INR",
          deadline: past5Days,
          requiredCreators: 1,
          deliverables: ["2 Festive Styling Reels", "Grid Carousel Post"],
          status: "completed",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const c2Doc = c2.value || await db.collection("campaigns").findOne({ brand: b._id, title: "Festive Luxury Apparel Drop" });

    // Campaign 3: Pro Audio ANC Wireless Earbuds (In Progress, with upcoming deadlines!)
    const c3 = await db.collection("campaigns").findOneAndUpdate(
      { brand: b._id, title: "Pro Audio ANC Wireless Earbuds" },
      {
        $set: {
          brand: b._id,
          title: "Pro Audio ANC Wireless Earbuds",
          description: "Reviewing spatial audio and active noise cancellation in bustling city environments.",
          category: "Tech",
          platform: "youtube",
          budget: 60000,
          currency: "INR",
          deadline: future25Days,
          requiredCreators: 2,
          deliverables: ["1 Dedicated Review Video (8-10 min)", "1 YouTube Short", "Link in Description"],
          status: "in_progress",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const c3Doc = c3.value || await db.collection("campaigns").findOne({ brand: b._id, title: "Pro Audio ANC Wireless Earbuds" });

    // Campaign 4: Wellness & Superfood Protein Shake
    await db.collection("campaigns").findOneAndUpdate(
      { brand: b._id, title: "Wellness & Superfood Protein Shake" },
      {
        $set: {
          brand: b._id,
          title: "Wellness & Superfood Protein Shake",
          description: "Clean plant protein daily smoothie routine for health enthusiasts and gym trainers.",
          category: "Fitness",
          platform: "instagram",
          budget: 25000,
          currency: "INR",
          deadline: future10Days,
          requiredCreators: 2,
          deliverables: ["1 Workout Reel", "Recipe Story with Code"],
          status: "published",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    // C. Get Creator Services
    const mohitService = await db.collection("creatorservices").findOne({ creator: mohit._id });
    const shivaniService = await db.collection("creatorservices").findOne({ creator: shivani._id });
    const chinkiService = await db.collection("creatorservices").findOne({ creator: chinki._id });

    // =========================================================================
    // COLLABORATION 1: UNREVIEWED COMPLETED WORKSPACE (Eligible for Review modal!)
    // =========================================================================
    let b1 = await db.collection("bookings").findOne({ brand: b._id, campaign: c1Doc._id, creator: mohit._id });
    if (!b1) {
      const insB1 = await db.collection("bookings").insertOne({
        brand: b._id,
        creator: mohit._id,
        campaign: c1Doc._id,
        service: mohitService?._id || new mongoose.Types.ObjectId(),
        agreedPrice: 45000,
        currency: "INR",
        message: "Hi Maison Synergie! I would love to create high aesthetic skincare reels for your SPF 50 launch.",
        deliverables: c1Doc.deliverables,
        status: "completed",
        paymentStatus: "paid",
        createdAt: new Date(now.getTime() - 10 * 86400000),
        updatedAt: new Date(),
      });
      b1 = { _id: insB1.insertedId };
    }

    const ws1Deliverables = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: "1 Instagram 4K Reel",
        description: "Hydra sunscreen texture shot & outdoor sunlight test",
        dueDate: new Date(now.getTime() - 3 * 86400000),
        status: "approved",
        submission: {
          title: "Reel v2 Finished Cut",
          link: "https://instagram.com/reel/demo123",
          fileUrl: "https://res.cloudinary.com/demo/video/upload/demo.mp4",
          notes: "Final approved 4K reel.",
          submittedAt: new Date(now.getTime() - 4 * 86400000),
        },
        approvedAt: new Date(now.getTime() - 2 * 86400000),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: "2 High-engagement Stories",
        description: "Before & after application story sequence",
        dueDate: new Date(now.getTime() - 2 * 86400000),
        status: "approved",
        submission: {
          title: "Stories Archive",
          link: "https://instagram.com/stories/demo456",
          fileUrl: "https://res.cloudinary.com/demo/image/upload/story.jpg",
          notes: "Stories with swipe up link sticker.",
          submittedAt: new Date(now.getTime() - 3 * 86400000),
        },
        approvedAt: new Date(now.getTime() - 1 * 86400000),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Link in Bio Sticker",
        description: "Direct tracking UTM link in bio for 48 hours",
        dueDate: new Date(now.getTime() - 1 * 86400000),
        status: "approved",
        approvedAt: new Date(now.getTime() - 1 * 86400000),
      },
    ];

    await db.collection("workspaces").updateOne(
      { booking: b1._id },
      {
        $set: {
          booking: b1._id,
          campaign: c1Doc._id,
          brand: b._id,
          creator: mohit._id,
          service: mohitService?._id || new mongoose.Types.ObjectId(),
          agreedPrice: 45000,
          currency: "INR",
          brief: "Highlight glowing skin, non-greasy absorption, and SPF 50 shield.",
          deliverables: ws1Deliverables,
          status: "completed",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date(now.getTime() - 10 * 86400000) },
      },
      { upsert: true }
    );
    // Ensure NO review exists for ws1 so it is eligible in the Write Review modal!
    const ws1Doc = await db.collection("workspaces").findOne({ booking: b1._id });
    await db.collection("reviews").deleteMany({ workspace: ws1Doc._id, reviewer: b._id });

    // Payment for Workspace 1
    await db.collection("payments").updateOne(
      { workspace: ws1Doc._id },
      {
        $set: {
          workspace: ws1Doc._id,
          booking: b1._id,
          campaign: c1Doc._id,
          brand: b._id,
          creator: mohit._id,
          amount: 45000,
          currency: "INR",
          paymentMethod: "RAZORPAY_TEST",
          status: "completed",
          paidAt: new Date(now.getTime() - 10 * 86400000),
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date(now.getTime() - 10 * 86400000) },
      },
      { upsert: true }
    );

    // =========================================================================
    // COLLABORATION 2: COMPLETED WORKSPACE WITH EXISTING 5-STAR REVIEW
    // =========================================================================
    let b2 = await db.collection("bookings").findOne({ brand: b._id, campaign: c2Doc._id, creator: shivani._id });
    if (!b2) {
      const insB2 = await db.collection("bookings").insertOne({
        brand: b._id,
        creator: shivani._id,
        campaign: c2Doc._id,
        service: shivaniService?._id || new mongoose.Types.ObjectId(),
        agreedPrice: 35000,
        currency: "INR",
        message: "Excited to partner on your festive luxury collection drop!",
        deliverables: c2Doc.deliverables,
        status: "completed",
        paymentStatus: "paid",
        createdAt: new Date(now.getTime() - 20 * 86400000),
        updatedAt: new Date(),
      });
      b2 = { _id: insB2.insertedId };
    }

    const ws2Deliverables = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: "2 Festive Styling Reels",
        description: "Silk saree and kurta lookbook with transition cuts",
        dueDate: new Date(now.getTime() - 6 * 86400000),
        status: "approved",
        approvedAt: new Date(now.getTime() - 5 * 86400000),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Grid Carousel Post",
        description: "Close-up fabric details and boutique styling",
        dueDate: new Date(now.getTime() - 5 * 86400000),
        status: "approved",
        approvedAt: new Date(now.getTime() - 4 * 86400000),
      },
    ];

    await db.collection("workspaces").updateOne(
      { booking: b2._id },
      {
        $set: {
          booking: b2._id,
          campaign: c2Doc._id,
          brand: b._id,
          creator: shivani._id,
          service: shivaniService?._id || new mongoose.Types.ObjectId(),
          agreedPrice: 35000,
          currency: "INR",
          brief: "Festive high fashion aesthetics, royal colour tones.",
          deliverables: ws2Deliverables,
          status: "completed",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date(now.getTime() - 20 * 86400000) },
      },
      { upsert: true }
    );

    const ws2Doc = await db.collection("workspaces").findOne({ booking: b2._id });

    // Review for Workspace 2
    await db.collection("reviews").updateOne(
      { workspace: ws2Doc._id, reviewer: b._id },
      {
        $set: {
          workspace: ws2Doc._id,
          booking: b2._id,
          campaign: c2Doc._id,
          reviewer: b._id,
          reviewee: shivani._id,
          rating: 5,
          comment: "Exceptional quality content! Shivani delivered 2 stunning 4K reels well ahead of the deadline with high organic engagement and fantastic aesthetic execution.",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date(now.getTime() - 4 * 86400000) },
      },
      { upsert: true }
    );

    // Payment for Workspace 2
    await db.collection("payments").updateOne(
      { workspace: ws2Doc._id },
      {
        $set: {
          workspace: ws2Doc._id,
          booking: b2._id,
          campaign: c2Doc._id,
          brand: b._id,
          creator: shivani._id,
          amount: 35000,
          currency: "INR",
          paymentMethod: "RAZORPAY_TEST",
          status: "completed",
          paidAt: new Date(now.getTime() - 20 * 86400000),
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date(now.getTime() - 20 * 86400000) },
      },
      { upsert: true }
    );

    // =========================================================================
    // COLLABORATION 3: IN-PROGRESS WORKSPACE WITH ACTIVE UPCOMING DELIVERABLES
    // =========================================================================
    let b3 = await db.collection("bookings").findOne({ brand: b._id, campaign: c3Doc._id, creator: chinki._id });
    if (!b3) {
      const insB3 = await db.collection("bookings").insertOne({
        brand: b._id,
        creator: chinki._id,
        campaign: c3Doc._id,
        service: chinkiService?._id || new mongoose.Types.ObjectId(),
        agreedPrice: 60000,
        currency: "INR",
        message: "Tech enthusiast ready to review the new ANC earbuds.",
        deliverables: c3Doc.deliverables,
        status: "active",
        paymentStatus: "escrow",
        createdAt: new Date(now.getTime() - 5 * 86400000),
        updatedAt: new Date(),
      });
      b3 = { _id: insB3.insertedId };
    }

    const ws3Deliverables = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Product Unboxing & B-Roll",
        description: "Studio macro unboxing shots and build quality inspection",
        dueDate: new Date(now.getTime() + 3 * 86400000),
        status: "pending",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Full Audio Review Video (8-10 min)",
        description: "Microphone test, ANC test in metro station, battery life benchmark",
        dueDate: new Date(now.getTime() + 7 * 86400000),
        status: "in_progress",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: "YouTube Short Clip",
        description: "30-sec punchy sound test snippet",
        dueDate: new Date(now.getTime() + 12 * 86400000),
        status: "pending",
      },
    ];

    await db.collection("workspaces").updateOne(
      { booking: b3._id },
      {
        $set: {
          booking: b3._id,
          campaign: c3Doc._id,
          brand: b._id,
          creator: chinki._id,
          service: chinkiService?._id || new mongoose.Types.ObjectId(),
          agreedPrice: 60000,
          currency: "INR",
          brief: "Focus on crystal clear bass, 45dB active noise cancellation, and seamless multipoint pairing.",
          deliverables: ws3Deliverables,
          status: "in_progress",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date(now.getTime() - 5 * 86400000) },
      },
      { upsert: true }
    );
  }

  console.log("\n========================================================");
  console.log("SUCCESSFULLY POPULATED COMPLETE DATA FOR BRANDS!");
  console.log("1. Active user: ansh@gmail.com (Password: Password@123)");
  console.log("2. New brand: brand_new@gmail.com (Password: Password@123)");
  console.log("- 4 Live Campaigns (Summer Glow, Festive Apparel, ANC Earbuds, Superfood)");
  console.log("- 1 Unreviewed Completed Workspace -> Available for manual review submission!");
  console.log("- 1 Completed Workspace with a 5-Star Review -> Visible on /brand/reviews!");
  console.log("- 1 Active In-Progress Workspace with 3 Upcoming Deliverables -> Visible on Dashboard!");
  console.log("- 2 Completed Payments (₹80,000 total) -> Showing on Dashboard charts!");
  console.log("========================================================\n");

  process.exit(0);
}

seedBrandData().catch((err) => {
  console.error("Error seeding brand data:", err);
  process.exit(1);
});
