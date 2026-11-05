import mongoose from "mongoose";
import dns from "node:dns";

// Connects the application to the MongoDB database.
const connectDatabase = async () => {
    try {
        // Prevent querySrv ECONNREFUSED when local ISP/router DNS fails to resolve SRV records
        try {
            dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
        } catch {
            // Fallback silently if custom DNS cannot be set
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDatabase;
