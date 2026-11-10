
import { Server } from "socket.io";
import { parseCookie } from "cookie";
import Conversation from "../modules/messages/conversation.model.js";
import Workspace from "../modules/workspace/workspace.model.js";
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

    // Helper to authenticate a single credential candidate pair (Admin or Standard).
    // Eliminates cross-role token mixing by ensuring access token and refresh token always belong to the same context.
    const authenticateCandidate = async (candidate) => {
        const { token, refreshToken, isExplicitAdmin } = candidate;

        if (!token && !refreshToken) {
            return { status: "missing_credentials" };
        }

        let decodedToken = null;

        // 1. Try validating access token first if present
        if (token) {
            try {
                decodedToken = verifyAccessToken(token);
            } catch (tokenErr) {
                if (tokenErr.name === "TokenExpiredError") {
                    // Access token expired: return expected authentication error so the frontend
                    // triggers its refresh-token flow to obtain and send a fresh access-token cookie.
                    return { status: "error", error: new Error("Invalid or expired access token") };
                } else if (
                    tokenErr.name === "JsonWebTokenError" ||
                    tokenErr.name === "NotBeforeError"
                ) {
                    return { status: "error", error: new Error("Invalid access token") };
                } else {
                    console.error(`[SocketAuth Diagnostic] Unexpected access token verification error: ${tokenErr?.name}: ${tokenErr?.message}`);
                    return { status: "error", error: new Error("Socket authentication failed") };
                }
            }
        }

        if (decodedToken) {
            const user = await Auth.findById(decodedToken.userId).select("_id role sessions");
            if (!user) {
                return { status: "error", error: new Error("Invalid or expired session") };
            }

            // Explicit admin context requires admin role
            if (isExplicitAdmin && user.role !== "admin") {
                return { status: "error", error: new Error("Invalid or expired session") };
            }

            // Both access token and refresh token must come from the same candidate pair
            if (!refreshToken) {
                return { status: "error", error: new Error("Invalid or expired session") };
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
                    return { status: "error", error: new Error("Invalid or expired session") };
                }
                console.error(`[SocketAuth Diagnostic] Unexpected refresh token verification error: ${refreshErr?.name}: ${refreshErr?.message}`);
                return { status: "error", error: new Error("Socket authentication failed") };
            }

            if (decodedRefresh.userId !== decodedToken.userId) {
                return { status: "error", error: new Error("Invalid or expired session") };
            }

            const hashedToken = hashRefreshToken(refreshToken);
            const hasActiveSession = user.sessions?.some(
                (s) => s.refreshToken === hashedToken
            );
            if (!hasActiveSession) {
                return { status: "error", error: new Error("Invalid or expired session") };
            }

            return {
                status: "success",
                user: {
                    userId: user._id.toString(),
                    role: user.role
                }
            };
        }

        // 2. If access token is missing, authenticate via active refresh token session (fallback)
        if (!refreshToken) {
            return { status: "missing_credentials" };
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
                return { status: "error", error: new Error("Invalid or expired session") };
            }
            console.error(`[SocketAuth Diagnostic] Unexpected fallback refresh token verification error: ${refreshErr?.name}: ${refreshErr?.message}`);
            return { status: "error", error: new Error("Socket authentication failed") };
        }

        const hashedToken = hashRefreshToken(refreshToken);
        const user = await Auth.findOne({
            _id: decodedRefresh.userId,
            "sessions.refreshToken": hashedToken
        }).select("_id role");

        if (!user) {
            return { status: "error", error: new Error("Invalid or expired session") };
        }

        if (isExplicitAdmin && user.role !== "admin") {
            return { status: "error", error: new Error("Invalid or expired session") };
        }

        return {
            status: "success",
            user: {
                userId: user._id.toString(),
                role: user.role
            }
        };
    };

    // Authenticate Socket.IO using HttpOnly cookies with strict context isolation.
    io.use(async (socket, next) => {
        try {
            const headerCookie = socket.handshake.headers?.cookie || "";
            const cookies = parseCookie(headerCookie);
            const referer = socket.handshake.headers?.referer || "";
            const authRole = socket.handshake.auth?.role || socket.handshake.query?.role;
            const isAdminContext = authRole === "admin" || referer.includes("/admin");

            // Separate credential pairs strictly to prevent cross-role token mixing:
            // Admin tokens are never paired with standard tokens, and vice versa.
            const adminCandidate = {
                token: cookies.adminAccessToken || (authRole === "admin" ? socket.handshake.auth?.token : undefined),
                refreshToken: cookies.adminRefreshToken || (authRole === "admin" ? socket.handshake.auth?.refreshToken : undefined),
                isExplicitAdmin: true
            };

            const standardCandidate = {
                token: cookies.accessToken || (authRole !== "admin" ? socket.handshake.auth?.token : undefined),
                refreshToken: cookies.refreshToken || (authRole !== "admin" ? socket.handshake.auth?.refreshToken : undefined),
                isExplicitAdmin: false
            };

            // Enforce strict authorization isolation between Admin and Standard contexts:
            // - If in Admin context: ONLY admin credentials may authenticate. Never fall back to standard tokens (prevents authorization bypass).
            // - If in Standard context (Brand/Creator): ONLY standard credentials may authenticate. Never fall back to admin tokens.
            // - If neutral context (no referer or role hint): check standard first, then admin.
            const isNeutralContext = !referer && !authRole;
            const candidates = isAdminContext
                ? [adminCandidate]
                : isNeutralContext
                    ? [standardCandidate, adminCandidate]
                    : [standardCandidate];

            let lastError = null;

            for (const candidate of candidates) {
                const result = await authenticateCandidate(candidate);

                if (result.status === "success") {
                    socket.data.user = result.user;
                    return next();
                }

                if (result.status === "error") {
                    // Immediately halt and return the error for the active candidate
                    // so that frontend can refresh expired access tokens properly.
                    return next(result.error);
                }

                // If candidate had missing_credentials, record fallback and check next candidate
                lastError = new Error("Authentication required");
            }

            return next(lastError || new Error("Authentication required"));
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
            if (socket.data.user.role === "admin") {
                socket.join("role:admin");
            }
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

        // Join workspace room only if the authenticated user is an authorized participant (creator or brand).
        socket.on("workspace:join", async (workspaceId, callback) => {
            try {
                if (
                    typeof workspaceId !== "string" ||
                    !/^[a-f\d]{24}$/i.test(workspaceId)
                ) {
                    return callback?.({
                        success: false,
                        message: "Invalid workspace ID"
                    });
                }

                let workspace;
                if (socket.data?.user?.role === "admin") {
                    workspace = await Workspace.findById(workspaceId).select("_id");
                } else {
                    workspace = await Workspace.findOne({
                        _id: workspaceId,
                        $or: [
                            { creator: socket.data.user.userId },
                            { brand: socket.data.user.userId }
                        ]
                    }).select("_id");
                }

                if (!workspace) {
                    return callback?.({
                        success: false,
                        message: "Workspace not found or access denied"
                    });
                }

                await socket.join(`workspace:${workspaceId}`);

                callback?.({
                    success: true,
                    workspaceId
                });
            } catch (error) {
                console.error("Workspace join failed:", error);

                callback?.({
                    success: false,
                    message: "Unable to join workspace"
                });
            }
        });

        socket.on("workspace:leave", async (workspaceId) => {
            if (
                typeof workspaceId === "string" &&
                /^[a-f\d]{24}$/i.test(workspaceId)
            ) {
                await socket.leave(`workspace:${workspaceId}`);
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

const emitNotificationToAdmins = (notificationData, excludeAdminId = null) => {
    if (!ioInstance) {
        return false;
    }

    try {
        if (excludeAdminId) {
            const sockets = ioInstance.sockets?.adapter?.rooms?.get("role:admin");
            if (sockets) {
                for (const socketId of sockets) {
                    const clientSocket = ioInstance.sockets.sockets.get(socketId);
                    if (clientSocket && clientSocket.data?.user?.userId !== excludeAdminId.toString()) {
                        clientSocket.emit("notification:new", notificationData);
                    }
                }
            }
        } else {
            ioInstance.to("role:admin").emit("notification:new", notificationData);
        }
        return true;
    } catch (error) {
        console.error("Socket admin notification broadcast failed:", error?.message || error);
        return false;
    }
};

const emitWorkspaceEvent = (workspaceId, eventName, payload) => {
    if (!ioInstance || !workspaceId) {
        return false;
    }

    try {
        ioInstance.to(`workspace:${workspaceId.toString()}`).emit(eventName, payload);
        // Also emit to all connected admins monitoring collaborations and platform telemetry
        ioInstance.to("role:admin").emit(eventName, payload);
        return true;
    } catch (error) {
        console.error(`Socket workspace event emission failed (${eventName}):`, error?.message || error);
        return false;
    }
};

const emitVerificationEventToUser = (userId, eventName, payload) => {
    if (!ioInstance || !userId) {
        return false;
    }

    try {
        ioInstance.to(`user:${userId.toString()}`).emit(eventName, payload);
        return true;
    } catch (error) {
        console.error(`Socket verification event emission failed (${eventName}) for user ${userId}:`, error?.message || error);
        return false;
    }
};

const emitVerificationEventToAdmins = (eventName, payload) => {
    if (!ioInstance) {
        return false;
    }

    try {
        ioInstance.to("role:admin").emit(eventName, payload);
        return true;
    } catch (error) {
        console.error(`Socket verification event emission failed (${eventName}) for admins:`, error?.message || error);
        return false;
    }
};

const emitReviewEventToUser = (userId, eventName, payload) => {
    if (!ioInstance || !userId) {
        return false;
    }

    try {
        ioInstance.to(`user:${userId.toString()}`).emit(eventName, payload);
        return true;
    } catch (error) {
        console.error(`Socket review event emission failed (${eventName}) for user ${userId}:`, error?.message || error);
        return false;
    }
};

const emitPaymentEventToUser = (userId, eventName, payload) => {
    if (!ioInstance || !userId) {
        return false;
    }

    try {
        ioInstance.to(`user:${userId.toString()}`).emit(eventName, payload);
        return true;
    } catch (error) {
        console.error(`Socket payment event emission failed (${eventName}) for user ${userId}:`, error?.message || error);
        return false;
    }
};

export {
    initializeSocket,
    getIO,
    emitNotificationToUser,
    emitNotificationToAdmins,
    emitWorkspaceEvent,
    emitVerificationEventToUser,
    emitVerificationEventToAdmins,
    emitReviewEventToUser,
    emitPaymentEventToUser
};

export default initializeSocket;
