// import dotenv from "dotenv";
// import app from "./app.js";
// import connectDatabase from "./config/database.js";

// dotenv.config();

// const PORT = process.env.PORT || 5005;
// const HOST = process.env.HOST || "0.0.0.0";

// const startServer = async () => {
//     await connectDatabase();

//     app.listen(PORT, HOST, () => {
//         console.log(`Server is running on http://${HOST}:${PORT}`);
//     });
// };

// startServer();










import dotenv from "dotenv";
import http from "http";

import app from "./app.js";
import connectDatabase from "./config/database.js";
import initializeSocket from "./socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5005;
const HOST = process.env.HOST || "0.0.0.0";

const httpServer = http.createServer(app);

// Initialize Socket.IO from the separate socket file.
const io = initializeSocket(httpServer);

// Make Socket.IO accessible to Express routes.
app.set("io", io);

const startServer = async () => {
    try {
        await connectDatabase();

        httpServer.listen(PORT, HOST, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
            console.log("Socket.IO server is ready");
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();











