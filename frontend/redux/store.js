import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import rootReducer from "./root_reducer.js";
import { clearAuth, login, logout, getMe, refreshToken } from "./auth/auth_slice.js";
import { clearSocketSession, startNewSocketSession } from "@/lib/socket";

const authSocketListenerMiddleware = createListenerMiddleware();

// Session initiation on successful login or getMe hydration
authSocketListenerMiddleware.startListening({
    matcher: isAnyOf(login.fulfilled, getMe.fulfilled),
    effect: (action) => {
        const user = action.payload?.data?.user || action.payload?.data;
        const userId = user?._id || user?.id;
        if (userId) {
            startNewSocketSession(userId);
        }
    }
});

// Session termination on explicit logout, clearAuth, or definitive auth failure (HTTP 401/403)
authSocketListenerMiddleware.startListening({
    matcher: (action) => {
        if (isAnyOf(clearAuth, logout.fulfilled, logout.rejected)(action)) {
            return true;
        }
        if (isAnyOf(refreshToken.rejected, getMe.rejected)(action)) {
            return Boolean(action.meta?.isAuthFailure);
        }
        return false;
    },
    effect: () => {
        clearSocketSession();
    }
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(authSocketListenerMiddleware.middleware)
});

export default store;