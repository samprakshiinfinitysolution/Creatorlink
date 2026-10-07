import dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5005;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
    await connectDatabase();

    app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
    });
};

startServer();