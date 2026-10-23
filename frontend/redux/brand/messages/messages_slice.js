import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getBrandConversations as getBrandConversationsApi,
    getBrandConversationById as getBrandConversationByIdApi,
    sendBrandMessage as sendBrandMessageApi,
    markBrandConversationRead as markBrandConversationReadApi
} from "./messages_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";


// Fetch brand conversations.
const fetchBrandConversations = createAsyncThunk(
    "brandMessages/fetchBrandConversations",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getBrandConversationsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch conversations"
            );
        }
    }
);


// Fetch one conversation and its messages for brand.
const fetchBrandConversationById = createAsyncThunk(
    "brandMessages/fetchBrandConversationById",
    async (conversationId, { rejectWithValue }) => {
        try {
            return await getBrandConversationByIdApi(conversationId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch conversation details"
            );
        }
    }
);


// Send a brand message.
const sendBrandMessage = createAsyncThunk(
    "brandMessages/sendBrandMessage",
    async (messageData, { rejectWithValue }) => {
        try {
            return await sendBrandMessageApi(messageData);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to send message"
            );
        }
    }
);


// Mark received messages as read for brand.
const markBrandConversationRead = createAsyncThunk(
    "brandMessages/markBrandConversationRead",
    async (conversationId, { rejectWithValue, getState }) => {
        try {
            const response =
                await markBrandConversationReadApi(conversationId);

            const user = getState()?.auth?.user;

            return {
                response,
                conversationId,
                currentUserId: user?._id || user?.id || null
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to mark messages as read"
            );
        }
    }
);


const initialState = {
    conversations: [],
    selectedConversation: null,
    activeConversationId: null,
    activeRequestId: null,
    messages: [],
    pagination: null,
    loading: false,
    conversationsLoading: false,
    conversationLoading: false,
    sending: false,
    markingRead: false,
    refreshConversationsNeeded: false,
    error: null,
    successMessage: null
};


const brandMessagesSlice = createSlice({
    name: "brandMessages",
    initialState,

    reducers: {
        clearSelectedConversation: (state) => {
            state.selectedConversation = null;
            state.activeConversationId = null;
            state.activeRequestId = null;
            state.messages = [];
            state.conversationLoading = false;
            state.loading = state.conversationsLoading;
        },

        addNewBrandMessage: (state, action) => {
            const { conversationId, message } = action.payload || {};

            if (!conversationId || !message?._id) return;

            const convIdStr = String(conversationId);
            const selectedId = state.selectedConversation?._id;

            if (selectedId && String(selectedId) === convIdStr) {
                const alreadyExists = state.messages.some(
                    (item) => item._id && String(item._id) === String(message._id)
                );

                if (!alreadyExists) {
                    state.messages.push(message);
                }
            }

            const index = state.conversations.findIndex(
                (conversation) => String(conversation._id) === convIdStr
            );

            if (index !== -1) {
                state.conversations[index].lastMessage = message.message;
                state.conversations[index].lastMessageAt =
                    message.createdAt || message.updatedAt || new Date().toISOString();

                const [updatedConv] = state.conversations.splice(index, 1);
                state.conversations.unshift(updatedConv);
            } else {
                state.refreshConversationsNeeded = true;
            }
        },

        setBrandConversationRead: (state, action) => {
            const { conversationId, readerId } = action.payload || {};

            if (!conversationId || !readerId) return;

            const convIdStr = String(conversationId);
            const selectedId = state.selectedConversation?._id;

            if (selectedId && String(selectedId) === convIdStr) {
                state.messages = state.messages.map((message) => {
                    const receiverId =
                        typeof message.receiver === "string"
                            ? message.receiver
                            : message.receiver?._id;

                    if (receiverId && String(receiverId) === String(readerId)) {
                        return {
                            ...message,
                            isRead: true
                        };
                    }

                    return message;
                });
            }
        },

        clearMessagesState: () => initialState,

        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },

        clearError: (state) => {
            state.error = null;
        },

        clearConversationRefreshFlag: (state) => {
            state.refreshConversationsNeeded = false;
        }
    },

    extraReducers: (builder) => {
        builder

            // Fetch conversations.
            .addCase(fetchBrandConversations.pending, (state) => {
                state.loading = true;
                state.conversationsLoading = true;
                state.error = null;
            })

            .addCase(fetchBrandConversations.fulfilled, (state, action) => {
                state.conversationsLoading = false;
                state.loading = state.conversationLoading;

                state.conversations =
                    action.payload?.data?.conversations || [];

                state.pagination =
                    action.payload?.data?.pagination || null;

                state.refreshConversationsNeeded = false;
                state.error = null;
            })

            .addCase(fetchBrandConversations.rejected, (state, action) => {
                state.conversationsLoading = false;
                state.loading = state.conversationLoading;
                state.error =
                    action.payload || "Unable to fetch conversations";
            })


            // Fetch conversation details.
            .addCase(fetchBrandConversationById.pending, (state, action) => {
                state.loading = true;
                state.conversationLoading = true;
                state.activeConversationId = action.meta.arg;
                state.activeRequestId = action.meta.requestId;
                state.error = null;
            })

            .addCase(fetchBrandConversationById.fulfilled, (state, action) => {
                if (
                    !state.activeRequestId ||
                    state.activeRequestId !== action.meta.requestId
                ) {
                    return;
                }

                state.conversationLoading = false;
                state.loading = state.conversationsLoading;

                state.selectedConversation =
                    action.payload?.data?.conversation || null;

                state.messages =
                    action.payload?.data?.messages || [];

                state.error = null;
            })

            .addCase(fetchBrandConversationById.rejected, (state, action) => {
                if (
                    !state.activeRequestId ||
                    state.activeRequestId !== action.meta.requestId
                ) {
                    return;
                }

                state.conversationLoading = false;
                state.loading = state.conversationsLoading;

                state.error =
                    action.payload || "Unable to fetch conversation details";
            })


            // Send message.
            .addCase(sendBrandMessage.pending, (state) => {
                state.sending = true;
                state.error = null;
                state.successMessage = null;
            })

            .addCase(sendBrandMessage.fulfilled, (state, action) => {
                state.sending = false;

                state.successMessage =
                    action.payload?.message || "Message sent successfully";

                const sentMessage = action.payload?.data?.message;
                const conversationId = action.payload?.data?.conversationId;

                const sentConversationId =
                    conversationId ||
                    (typeof sentMessage?.conversation === "string"
                        ? sentMessage.conversation
                        : sentMessage?.conversation?._id);

                if (sentMessage) {
                    const selectedId = state.selectedConversation?._id;

                    if (
                        selectedId &&
                        sentConversationId &&
                        String(selectedId) === String(sentConversationId)
                    ) {
                        const alreadyExists = state.messages.some(
                            (message) =>
                                message._id &&
                                sentMessage._id &&
                                String(message._id) === String(sentMessage._id)
                        );

                        if (!alreadyExists) {
                            state.messages.push(sentMessage);
                        }
                    }

                    const index = state.conversations.findIndex(
                        (conversation) =>
                            String(conversation._id) ===
                            String(sentConversationId)
                    );

                    if (index !== -1) {
                        state.conversations[index].lastMessage =
                            sentMessage.message;

                        state.conversations[index].lastMessageAt =
                            sentMessage.createdAt;

                        const [updatedConv] = state.conversations.splice(index, 1);
                        state.conversations.unshift(updatedConv);
                    } else {
                        // A new conversation may have been created.
                        state.refreshConversationsNeeded = true;
                    }
                }

                state.error = null;
            })

            .addCase(sendBrandMessage.rejected, (state, action) => {
                state.sending = false;
                state.error =
                    action.payload || "Unable to send message";
            })


            // Mark conversation as read.
            .addCase(markBrandConversationRead.pending, (state) => {
                state.markingRead = true;
                state.error = null;
            })

            .addCase(markBrandConversationRead.fulfilled, (state, action) => {
                state.markingRead = false;

                const brandId = action.payload?.currentUserId;
                const reqConversationId = action.payload?.conversationId;
                const selectedId = state.selectedConversation?._id;

                if (
                    brandId &&
                    selectedId &&
                    reqConversationId &&
                    String(selectedId) === String(reqConversationId)
                ) {
                    state.messages = state.messages.map((message) => {
                        const receiverId =
                            typeof message.receiver === "string"
                                ? message.receiver
                                : message.receiver?._id;

                        if (
                            receiverId &&
                            String(receiverId) === String(brandId)
                        ) {
                            return {
                                ...message,
                                isRead: true
                            };
                        }

                        return message;
                    });
                }

                state.error = null;
            })

            .addCase(markBrandConversationRead.rejected, (state, action) => {
                state.markingRead = false;
                state.error =
                    action.payload || "Unable to mark messages as read";
            })


            // Reset state on authentication changes.
            .addCase(login.fulfilled, () => initialState)
            .addCase(logout.fulfilled, () => initialState)
            .addCase(clearAuth, () => initialState);
    }
});


export const {
    clearSelectedConversation,
    addNewBrandMessage,
    setBrandConversationRead,
    clearMessagesState,
    clearSuccessMessage,
    clearError,
    clearConversationRefreshFlag
} = brandMessagesSlice.actions;


export {
    fetchBrandConversations,
    fetchBrandConversationById,
    sendBrandMessage,
    markBrandConversationRead
};


export default brandMessagesSlice.reducer;
