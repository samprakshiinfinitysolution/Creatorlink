import dotenv from "dotenv";
import mongoose from "mongoose";
import Auth from "../modules/auth/auth.model.js";

dotenv.config();

const check = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await Auth.findOne({ email: "admin@gmail.com" });
    console.log("Admin ID:", admin?._id);
    console.log("Sessions length:", admin?.sessions?.length);
    console.log("Password version:", admin?.passwordVersion);
    console.log("Recent sessions:", admin?.sessions?.slice(-3));
    await mongoose.disconnect();
};

check().catch(console.error);

