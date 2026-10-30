
import { Server } from "socket.io";
import { parseCookie } from "cookie";
import Conversation from "../modules/messages/conversation.model.js";
import Auth from "../modules/auth/auth.model.js";
import {
    verifyAccessToken,
    verifyRefreshToken,
    hashRefreshToken
} from "../utils/helpers/token.helper.js";

const EXPECTED_AUTH_ERRORS = new Set([
    "Invalid access token",
    "Authentication required",
    "Invalid or expired session",
    "Invalid or expired access token"
]);

let ioInstance = null;

const initializeSocket = (httpServer) => {
    const allowedOrigins = [
        ...new Set([
            ...((process.env.FRONTEND_URL || "").split(",").map((o) => o.trim().replace(/\/+$/, "")).filter(Boolean)),

            "http://192.168.1.21:3005",
            "http://localhost:3005",
            "http://127.0.0.1:3005"
        ].filter(Boolean))
    ];

    const isOriginAllowed = (origin) => {
        if (!origin) {
            return true;
        }
        const normalizedOrigin = typeof origin === "string" ? origin.trim().replace(/\/+$/, "") : "";
        return allowedOrigins.includes(normalizedOrigin);
    };

    const io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {

                if (isOriginAllowed(origin)) {
                    return callback(null, true);
                }
                return callback(new Error("Not allowed by CORS"));
            },
            credentials: true
        },
        allowRequest: (req, callback) => {
            const origin = req.headers.origin;
            if (isOriginAllowed(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        }
    });

    ioInstance = io;

    // Authenticate Socket.IO using HttpOnly cookies (with fallback to valid refresh token session).
    io.use(async (socket, next) => {
        try {
            const headerCookie = socket.handshake.headers.cookie || "";
            const cookies = parseCookie(headerCookie);
            const token = cookies.accessToken || socket.handshake.auth?.token;

            let decodedToken = null;

            // 1. Try validating access token first
            if (token) {
                try {
                    decodedToken = verifyAccessToken(token);
                } catch (tokenErr) {
                    if (tokenErr.name === "TokenExpiredError") {
                        // Access token expired: return expected authentication error so the frontend
                        // triggers its refresh-token flow to obtain and send a fresh access-token cookie.
                        return next(new Error("Invalid or expired access token"));
                    } else if (
                        tokenErr.name === "JsonWebTokenError" ||
                        tokenErr.name === "NotBeforeError"
                    ) {
                        // Unrelated verification error: do NOT silently fall back to refresh token
                        return next(new Error("Invalid access token"));
                    } else {
                        // Unexpected token verification error: log on backend and do NOT leak details
                        console.error(`[SocketAuth Diagnostic] Unexpected access token verification error: ${tokenErr?.name}: ${tokenErr?.message}`);
                        return next(new Error("Socket authentication failed"));
                    }
                }
            }

            if (decodedToken) {
                // Ensure user still exists in the database
                const user = await Auth.findById(decodedToken.userId).select("_id role sessions");
                if (!user) {
                    return next(new Error("Invalid or expired session"));
                }

                // Compatible session-revocation check:
                // Limitation: The access token schema only embeds { userId, role } without a session ID (jti/sessionId),
                // while Auth.sessions tracks sessions strictly by hashed refresh tokens.
                // A standalone access token cannot identify which session it belongs to in user.sessions.
                // Therefore, user.sessions.length > 0 cannot be treated as proof that this access token is active.
                // The safest compatible approach without weakening authentication is to require the session's
                // refreshToken and verify that it matches an active session in user.sessions.
                const refreshToken = cookies.refreshToken || socket.handshake.auth?.refreshToken;
                if (!refreshToken) {
                    return next(new Error("Invalid or expired session"));
                }

                let decodedRefresh;
                try {
                    decodedRefresh = verifyRefreshToken(refreshToken);
                } catch (refreshErr) {
                    if (
                        refreshErr.name === "TokenExpiredError" ||
                        refreshErr.name === "JsonWebTokenError" ||
                        refreshErr.name === "NotBeforeError"
                    ) {
                        return next(new Error("Invalid or expired session"));
                    }
                    console.error(`[SocketAuth Diagnostic] Unexpected refresh token verification error: ${refreshErr?.name}: ${refreshErr?.message}`);
                    return next(new Error("Socket authentication failed"));
                }

                if (decodedRefresh.userId !== decodedToken.userId) {
                    return next(new Error("Invalid or expired session"));
                }

                const hashedToken = hashRefreshToken(refreshToken);
                const hasActiveSession = user.sessions?.some(
                    (s) => s.refreshToken === hashedToken
                );
                if (!hasActiveSession) {
                    return next(new Error("Invalid or expired session"));
                }

                socket.data.user = {
                    userId: user._id.toString(),
                    role: user.role
                };
                return next();
            }

            // 2. If access token is missing, authenticate via active refresh token session (fallback)
            const refreshToken = cookies.refreshToken || socket.handshake.auth?.refreshToken;
            if (!refreshToken) {
                return next(new Error("Authentication required"));
            }

            let decodedRefresh;
            try {
                decodedRefresh = verifyRefreshToken(refreshToken);
            } catch (refreshErr) {
                if (
                    refreshErr.name === "TokenExpiredError" ||
                    refreshErr.name === "JsonWebTokenError" ||
                    refreshErr.name === "NotBeforeError"
                ) {
                    return next(new Error("Invalid or expired session"));
                }
                console.error(`[SocketAuth Diagnostic] Unexpected fallback refresh token verification error: ${refreshErr?.name}: ${refreshErr?.message}`);
                return next(new Error("Socket authentication failed"));
            }

            const hashedToken = hashRefreshToken(refreshToken);
            const user = await Auth.findOne({
                _id: decodedRefresh.userId,
                "sessions.refreshToken": hashedToken
            }).select("_id role");

            if (!user) {
                return next(new Error("Invalid or expired session"));
            }

            socket.data.user = {
                userId: user._id.toString(),
                role: user.role
            };

            return next();
        } catch (error) {
            const errorCategory =
                error?.name === "CastError" ? "DATABASE_CAST_ERROR"
                    : (error?.name === "MongooseServerSelectionError" || error?.name === "MongoNetworkError" || error?.name === "MongoTimeoutError") ? "DATABASE_CONNECTION_ERROR"
                        : error?.name === "MongooseError" ? "DATABASE_OPERATION_ERROR"
                            : error instanceof TypeError ? "RUNTIME_TYPE_ERROR"
                                : "UNEXPECTED_MIDDLEWARE_ERROR";

            console.error(`[SocketAuth Diagnostic] ${errorCategory}: ${error?.name}: ${error?.message}`);

            if (error instanceof Error && EXPECTED_AUTH_ERRORS.has(error.message)) {
                return next(new Error(error.message));
            }
            if (error?.name === "CastError") {
                return next(new Error("Invalid access token"));
            }
            return next(new Error("Socket authentication failed"));
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
                socket.data?.user?.userId || socket.id
            );
        });
    });

    return io;
};

const getIO = () => ioInstance;

const emitNotificationToUser = (userId, notificationData) => {
    if (!ioInstance || !userId) {
        return false;
    }

    try {
        ioInstance.to(`user:${userId.toString()}`).emit("notification:new", notificationData);
        return true;
    } catch (error) {
        console.error("Socket notification emission failed:", error?.message || error);
        return false;
    }
};

export {
    initializeSocket,
    getIO,
    emitNotificationToUser
};

export default initializeSocket;
