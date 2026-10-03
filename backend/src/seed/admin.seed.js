import dotenv from "dotenv";
import mongoose from "mongoose";

import Auth from "../modules/auth/auth.model.js";
import { hashPassword } from "../utils/helpers/password.helper.js";

dotenv.config();


// Creates the initial admin user.

const seedAdmin = async () => {

    try {

        // Connect to MongoDB.
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Database connected");


        // Check if an admin already exists.
        const existingAdmin = await Auth.findOne({
            role: "admin"
        });

        if (existingAdmin) {
            console.log("Admin already exists");

            await mongoose.disconnect();
            process.exit(0);
        }


        // Admin credentials come from environment variables.
        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;


        if (!name || !email || !password) {
            throw new Error(
                "Admin environment variables are missing"
            );
        }


        // Hash admin password before saving.
        const hashedPassword = await hashPassword(
            password
        );


        // Create admin user.
        await Auth.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            isVerified: true
        });


        console.log("Admin created successfully");

        await mongoose.disconnect();

        process.exit(0);

    } catch (error) {

        console.error(
            "Admin seed failed:",
            error.message
        );

        await mongoose.disconnect();

        process.exit(1);
    }
};


seedAdmin();