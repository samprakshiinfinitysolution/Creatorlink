import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorMiddleware from "./middleware/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://10.255.135.1750:3005",
    "http://localhost:3005"
].filter(Boolean);

// Allows the frontend to communicate with the backend.
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true
    })
);

// Reads JSON data from requests.
app.use(express.json());

// Reads form data from requests.
app.use(express.urlencoded({ extended: true }));

// Reads cookies from requests.
app.use(cookieParser());

// Health check route.
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CreatorLink API is running"
    });
});


// Application routes.
app.use("/api", routes);

// Common error middleware.
app.use(errorMiddleware);


export default app;