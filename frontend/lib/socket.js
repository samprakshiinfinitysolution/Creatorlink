
import { io } from "socket.io-client";

const getSocketURL = () => {
    if (typeof window !== "undefined" && window.location.hostname) {
        const host = window.location.hostname;
        if (
            host === "localhost" ||
            host === "127.0.0.1" ||
            host.startsWith("192.168.") ||
            host.startsWith("10.") ||
            host.startsWith("172.")
        ) {
            return `${window.location.protocol}//${host}:5005`;
        }
    }
    return process.env.NEXT_PUBLIC_SOCKET_URL || "http://192.168.1.23:5005";
};

export const socket = io(getSocketURL(), {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
});

let socketRefreshPromise = null;
let socketRetryPromise = null;
let socketAuthRetryCount = 0;
let socketAuthFailed = false;
let currentSessionUserId = null;
let currentSessionGeneration = 0;
const activeConsumers = new Set();

/**
 * Resets ONLY the retry counter.
 * Does not clear terminal authentication failure state.
 */
export const resetSocketAuthRetryCount = () => {
    socketAuthRetryCount = 0;
};

/**
 * Confirms successful authenticated connection.
 * Resets retry counter and clears authentication failure state.
 */
export const confirmSocketAuthSuccess = () => {
    socketAuthRetryCount = 0;
    socketAuthFailed = false;
};

/**
 * Starts a new authenticated session.
 * Resets failure state, establishes new session user ID, and connects if active consumers exist.
 * Does NOT invalidate an in-flight refresh or increment generation if the same user is re-hydrating.
 */
export const startNewSocketSession = (sessionUserId = null) => {
    const isDifferentUser = Boolean(
        (sessionUserId && sessionUserId !== currentSessionUserId) ||
        (!sessionUserId && currentSessionUserId)
    );
    const isInitialSession = currentSessionUserId === null && sessionUserId !== null;

    if (isDifferentUser || isInitialSession) {
        currentSessionGeneration += 1;
        socketRefreshPromise = null;
        socketRetryPromise = null;
        socketAuthRetryCount = 0;
        socketAuthFailed = false;
        const previousUserId = currentSessionUserId;
        currentSessionUserId = sessionUserId;

        if (previousUserId && (socket.connected || socket.active)) {
            socket.disconnect();
        }

        if (activeConsumers.size > 0 && !socket.connected && !socket.active) {
            socket.connect();
        }
        return;
    }

    // Same authenticated user re-hydrating (e.g. getMe.fulfilled for existing user):
    // Do NOT increment session generation.
    // Do NOT wipe an active in-flight socketRefreshPromise.
    // Do NOT clear socketAuthFailed or reset socketAuthRetryCount without confirmed authentication.
    if (
        !socketAuthFailed &&
        socketAuthRetryCount < 3 &&
        activeConsumers.size > 0 &&
        !socket.connected &&
        !socket.active &&
        !socketRefreshPromise
    ) {
        socket.connect();
    }
};

/**
 * Explicit session termination (logout).
 * Resets session tracking and disconnects the socket.
 */
export const clearSocketSession = () => {
    currentSessionGeneration += 1;
    currentSessionUserId = null;
    socketAuthRetryCount = 0;
    socketAuthFailed = false;
    socketRefreshPromise = null;
    socketRetryPromise = null;
    socket.disconnect();
};

/**
 * Halts automatic reconnection on terminal authentication error.
 */
export const handleSocketTerminalError = () => {
    socketAuthFailed = true;
    socket.disconnect();
};

export const registerSocketConsumer = (consumerId, sessionUserId = null) => {
    if (!consumerId) return;
    activeConsumers.add(consumerId);

    // If an authenticated session user ID is provided and differs from the current session:
    if (sessionUserId && sessionUserId !== currentSessionUserId) {
        startNewSocketSession(sessionUserId);
        return;
    }

    // If there is no active authenticated session, do not auto-connect
    if (!currentSessionUserId) {
        return;
    }

    // Do not bypass failure state: if auth failed or max retries were reached,
    // a new consumer registration alone in the same session must NOT reconnect.
    if (socketAuthFailed || socketAuthRetryCount >= 3) {
        return;
    }

    // If a refresh is currently in flight, let it complete and reconnect cleanly
    if (socketRefreshPromise) {
        return;
    }

    if (!socket.connected && !socket.active) {
        socket.connect();
    }
};

export const safeDisconnectSocket = () => {
    if (activeConsumers.size === 0) {
        socket.disconnect();
    }
};

export const unregisterSocketConsumer = (consumerId) => {
    if (!consumerId) return;
    activeConsumers.delete(consumerId);
    safeDisconnectSocket();
};

export const getActiveConsumerCount = () => activeConsumers.size;
export const isSocketAuthFailed = () => socketAuthFailed;
export const getSocketAuthRetryCount = () => socketAuthRetryCount;
export const getCurrentSessionGeneration = () => currentSessionGeneration;
export const getCurrentSessionUserId = () => currentSessionUserId;

export const handleSocketAuthRefresh = async (dispatch, refreshTokenThunk) => {
    // Reuse in-progress refresh promise before checking or enforcing retry limits
    if (socketRefreshPromise) {
        return socketRefreshPromise;
    }

    // If auth previously failed or max retries reached, halt further retries
    if (socketAuthFailed || socketAuthRetryCount >= 3) {
        console.error("Max socket auth retry attempts reached or auth previously failed. Halting socket reconnection.");
        if (socketAuthFailed) {
            socket.disconnect();
        } else {
            safeDisconnectSocket();
        }
        return false;
    }

    const capturedGeneration = currentSessionGeneration;
    socketAuthRetryCount += 1;

    let currentPromise;
    currentPromise = (async () => {
        let refreshSuccess = false;
        let isAuthFailure = false;
        let refreshError = null;

        try {
            const dispatchResult = dispatch(refreshTokenThunk());
            const action = await dispatchResult;

            if (action && typeof action === "object" && typeof action.unwrap === "function") {
                if ("meta" in action && action.meta?.requestStatus) {
                    if (action.meta.requestStatus === "fulfilled") {
                        refreshSuccess = true;
                    } else {
                        refreshSuccess = false;
                        isAuthFailure = Boolean(action.meta?.isAuthFailure);
                        refreshError = action.payload || action.error;
                    }
                } else {
                    try {
                        await action.unwrap();
                        refreshSuccess = true;
                    } catch (unwrapErr) {
                        refreshSuccess = false;
                        isAuthFailure = Boolean(unwrapErr?.meta?.isAuthFailure || unwrapErr?.isAuthFailure);
                        refreshError = unwrapErr;
                    }
                }
            } else if (action && typeof action === "object" && "meta" in action) {
                if (action.meta?.requestStatus === "fulfilled" || (!action.error && !action.meta?.rejectedWithValue)) {
                    refreshSuccess = true;
                } else {
                    refreshSuccess = false;
                    isAuthFailure = Boolean(action.meta?.isAuthFailure);
                    refreshError = action.payload || action.error;
                }
            } else {
                refreshSuccess = true;
            }
        } catch (err) {
            refreshSuccess = false;
            isAuthFailure = Boolean(err?.meta?.isAuthFailure || err?.isAuthFailure);
            refreshError = err;
        }

        try {
            // Invalidate if session changed or logged out during refresh
            if (capturedGeneration !== currentSessionGeneration || !currentSessionUserId) {
                return false;
            }

            if (refreshSuccess) {
                // Do not reset the retry counter immediately after refresh succeeds.
                // Reset it only after a confirmed successful authenticated socket connection via confirmSocketAuthSuccess().
                socket.disconnect();
                if (activeConsumers.size > 0) {
                    socket.connect();
                }
                return true;
            }

            // Failure handling
            console.error("Token refresh failed for Socket.IO notifications:", refreshError);

            if (isAuthFailure) {
                // Definitive authentication failure (HTTP 401/403):
                // Terminal auth flag is set and socket disconnected.
                // Centralized Redux listener in store.js terminates session via clearSocketSession().
                socketAuthFailed = true;
                socket.disconnect();
                return false;
            }

            // Temporary failure (network error, timeout, 5xx):
            // Do NOT permanently set socketAuthFailed.
            // Bounded recovery: if max retries reached, disconnect to stop loop; otherwise safe disconnect.
            if (socketAuthRetryCount >= 3) {
                console.error("Max socket auth retry attempts reached on temporary errors. Halting reconnection.");
                socket.disconnect();
            } else {
                safeDisconnectSocket();
            }
            return false;
        } finally {
            if (socketRefreshPromise === currentPromise) {
                socketRefreshPromise = null;
            }
        }
    })();

    socketRefreshPromise = currentPromise;
    return socketRefreshPromise;
};

/**
 * Centralized handler for Socket.IO connection errors.
 * Distinguishes recoverable auth errors from generic errors with bounded retries.
 */
export const handleSocketConnectionError = async (err, dispatch, refreshTokenThunk) => {
    const errorMessage = err?.message || "";
    const isRecoverableAuthError =
        errorMessage === "Invalid or expired access token" ||
        errorMessage === "Invalid access token" ||
        errorMessage === "Authentication required" ||
        errorMessage === "Invalid or expired session";

    if (isRecoverableAuthError) {
        return await handleSocketAuthRefresh(dispatch, refreshTokenThunk);
    }

    if (errorMessage === "Socket authentication failed") {
        console.error("Socket notification connection error:", errorMessage);

        // Deduplicate concurrent consumer retry triggers for the same connect_error
        if (socketRetryPromise) {
            return socketRetryPromise;
        }

        if (socketAuthFailed || socketAuthRetryCount >= 3) {
            console.error("Max socket retry attempts reached for 'Socket authentication failed'. Halting reconnection.");
            socketAuthFailed = true;
            socket.disconnect();
            return false;
        }

        const capturedGeneration = currentSessionGeneration;
        socketAuthRetryCount += 1;

        if (socketAuthRetryCount >= 3) {
            console.error("Max socket retry attempts reached for 'Socket authentication failed'. Halting reconnection.");
            socketAuthFailed = true;
            socket.disconnect();
            return false;
        }

        let currentPromise;
        currentPromise = (async () => {
            try {
                // Yield so concurrent connect_error handlers in the same tick deduplicate
                await Promise.resolve();

                if (capturedGeneration !== currentSessionGeneration || !currentSessionUserId) {
                    return false;
                }

                if (socketAuthFailed || socketAuthRetryCount >= 3) {
                    socket.disconnect();
                    return false;
                }

                if (activeConsumers.size > 0 && !socket.connected && !socket.active) {
                    socket.connect();
                    return true;
                }
                return false;
            } finally {
                if (socketRetryPromise === currentPromise) {
                    socketRetryPromise = null;
                }
            }
        })();

        socketRetryPromise = currentPromise;
        return socketRetryPromise;
    }

    console.error("Socket notification connection error:", errorMessage);
    safeDisconnectSocket();
    return false;
};
