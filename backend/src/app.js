import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorMiddleware from "./middleware/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

// Allows the frontend to communicate with the backend.
app.use(
    cors({
        origin: "http://localhost:3005",
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