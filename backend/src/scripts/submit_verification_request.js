import dotenv from "dotenv";
import mongoose from "mongoose";
import Auth from "../modules/auth/auth.model.js";
import VerificationRequest from "../modules/admin/verification/verification.model.js";

dotenv.config();

const submitRequest = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find a creator user to submit request for
    const creator = await Auth.findOne({ role: "creator" });
    if (!creator) {
        console.error("No creator found in database.");
        process.exit(1);
    }

    // Check if there is already a pending request
    const existing = await VerificationRequest.findOne({
        user: creator._id,
        status: "pending"
    });

    if (existing) {
        console.log(`Creator ${creator.name} (${creator.email}) already has a pending verification request:`, existing._id);
        process.exit(0);
    }

    const newRequest = await VerificationRequest.create({
        user: creator._id,
        role: "creator",
        documentType: "passport",
        documentNumber: "PASS-" + Math.floor(100000 + Math.random() * 900000),
        documentUrls: [
            "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800"
        ],
        notes: "Identity verification request submitted by creator for profile badge.",
        status: "pending"
    });

    console.log("✓ Successfully submitted new Verification Request:");
    console.log("Request ID:", newRequest._id);
    console.log("Applicant:", creator.name, `(${creator.email})`);
    console.log("Role:", newRequest.role);
    console.log("Document Type:", newRequest.documentType);
    console.log("Status:", newRequest.status);

    await mongoose.disconnect();
};

submitRequest().catch((err) => {
    console.error("Error submitting verification request:", err);
    process.exit(1);
});

