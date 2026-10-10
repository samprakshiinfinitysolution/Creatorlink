
import { Server } from "socket.io";
import { parseCookie } from "cookie";
import Conversation from "../modules/messages/conversation.model.js";
import { verifyAccessToken } from "../utils/helpers/token.helper.js";

const initializeSocket = (httpServer) => {
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:3005",
        "http://10.255.135.1750:3005"
    ].filter(Boolean);

    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    });

    // Authenticate Socket.IO using the existing HttpOnly cookie.
    io.use((socket, next) => {
        try {
            const headerCookie = socket.handshake.headers.cookie || "";
            const cookies = parseCookie(headerCookie);
            const token = cookies.accessToken;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decodedToken = verifyAccessToken(token);

            socket.data.user = {
                userId: decodedToken.userId,
                role: decodedToken.role
            };

            next();
        } catch (error) {
            console.error("Socket authentication error:", error?.message || error);
            next(new Error("Invalid or expired access token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(
            "Authenticated socket connected:",
            socket.data.user.userId
        );

        if (socket.data?.user?.userId) {
            socket.join(`user:${socket.data.user.userId}`);
        }

        // Join only if the authenticated user is a participant.
        socket.on("conversation:join", async (conversationId, callback) => {
            try {
                if (
                    typeof conversationId !== "string" ||
                    !/^[a-f\d]{24}$/i.test(conversationId)
                ) {
                    return callback?.({
                        success: false,
                        message: "Invalid conversation ID"
                    });
                }

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.data.user.userId
                }).select("_id");

                if (!conversation) {
                    return callback?.({
                        success: false,
                        message: "Conversation not found or access denied"
                    });
                }

                await socket.join(`conversation:${conversationId}`);

                callback?.({
                    success: true,
                    conversationId
                });
            } catch (error) {
                console.error("Conversation join failed:", error);

                callback?.({
                    success: false,
                    message: "Unable to join conversation"
                });
            }
        });

        socket.on("conversation:leave", async (conversationId) => {
            if (
                typeof conversationId === "string" &&
                /^[a-f\d]{24}$/i.test(conversationId)
            ) {
                await socket.leave(`conversation:${conversationId}`);
            }
        });

        socket.on("disconnect", () => {
            console.log(
                "Socket disconnected:",
                socket.data.user.userId
            );
        });
    });

    return io;
};

export default initializeSocket;
