import {
    createAsyncThunk,
    createSlice
} from "@reduxjs/toolkit";

import {
    getCreatorConversations as getCreatorConversationsApi,
    getCreatorConversationById as getCreatorConversationByIdApi,
    sendCreatorMessage as sendCreatorMessageApi,
    markCreatorConversationRead as markCreatorConversationReadApi
} from "./messages_api";

import {
    login,
    logout,
    clearAuth
} from "../../auth/auth_slice";


// Fetch creator conversations.
const fetchCreatorConversations = createAsyncThunk(
    "creatorMessages/fetchCreatorConversations",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await getCreatorConversationsApi(params);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch conversations"
            );
        }
    }
);


// Fetch one conversation and its messages.
const fetchCreatorConversationById = createAsyncThunk(
    "creatorMessages/fetchCreatorConversationById",
    async (conversationId, { rejectWithValue }) => {
        try {
            return await getCreatorConversationByIdApi(conversationId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch conversation details"
            );
        }
    }
);


// Send a creator message.
const sendCreatorMessage = createAsyncThunk(
    "creatorMessages/sendCreatorMessage",
    async (messageData, { rejectWithValue }) => {
        try {
            return await sendCreatorMessageApi(messageData);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to send message"
            );
        }
    }
);


// Mark received messages as read.
const markCreatorConversationRead = createAsyncThunk(
    "creatorMessages/markCreatorConversationRead",
    async (conversationId, { rejectWithValue, getState }) => {
        try {
            const response =
                await markCreatorConversationReadApi(conversationId);

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


const creatorMessagesSlice = createSlice({
    name: "creatorMessages",
    initialState,

    reducers: {
        clearSelectedConversation: (state) => {
            state.selectedConversation = null;
            state.activeConversationId = null;
            state.messages = [];
            state.conversationLoading = false;
        },

        addNewCreatorMessage: (state, action) => {
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

        setCreatorConversationRead: (state, action) => {
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
            .addCase(fetchCreatorConversations.pending, (state) => {
                state.loading = true;
                state.conversationsLoading = true;
                state.error = null;
            })

            .addCase(fetchCreatorConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.conversationsLoading = false;

                state.conversations =
                    action.payload?.data?.conversations || [];

                state.pagination =
                    action.payload?.data?.pagination || null;

                state.refreshConversationsNeeded = false;
                state.error = null;
            })

            .addCase(fetchCreatorConversations.rejected, (state, action) => {
                state.loading = false;
                state.conversationsLoading = false;
                state.error =
                    action.payload || "Unable to fetch conversations";
            })


            // Fetch conversation details.
            .addCase(fetchCreatorConversationById.pending, (state, action) => {
                state.loading = true;
                state.conversationLoading = true;
                state.activeConversationId = action.meta.arg;
                state.error = null;
            })

            .addCase(fetchCreatorConversationById.fulfilled, (state, action) => {
                if (
                    !state.activeConversationId ||
                    String(state.activeConversationId) !== String(action.meta.arg)
                ) {
                    return;
                }

                state.loading = false;
                state.conversationLoading = false;

                state.selectedConversation =
                    action.payload?.data?.conversation || null;

                state.messages =
                    action.payload?.data?.messages || [];

                state.error = null;
            })

            .addCase(fetchCreatorConversationById.rejected, (state, action) => {
                if (
                    !state.activeConversationId ||
                    String(state.activeConversationId) !== String(action.meta.arg)
                ) {
                    return;
                }

                state.loading = false;
                state.conversationLoading = false;

                state.error =
                    action.payload || "Unable to fetch conversation details";
            })


            // Send message.
            .addCase(sendCreatorMessage.pending, (state) => {
                state.sending = true;
                state.error = null;
                state.successMessage = null;
            })

            .addCase(sendCreatorMessage.fulfilled, (state, action) => {
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

            .addCase(sendCreatorMessage.rejected, (state, action) => {
                state.sending = false;
                state.error =
                    action.payload || "Unable to send message";
            })


            // Mark conversation as read.
            .addCase(markCreatorConversationRead.pending, (state) => {
                state.markingRead = true;
                state.error = null;
            })

            .addCase(markCreatorConversationRead.fulfilled, (state, action) => {
                state.markingRead = false;

                const creatorId = action.payload?.currentUserId;
                const reqConversationId = action.payload?.conversationId;
                const selectedId = state.selectedConversation?._id;

                if (
                    creatorId &&
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
                            String(receiverId) === String(creatorId)
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

            .addCase(markCreatorConversationRead.rejected, (state, action) => {
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
    addNewCreatorMessage,
    setCreatorConversationRead,
    clearMessagesState,
    clearSuccessMessage,
    clearError,
    clearConversationRefreshFlag
} = creatorMessagesSlice.actions;


export {
    fetchCreatorConversations,
    fetchCreatorConversationById,
    sendCreatorMessage,
    markCreatorConversationRead
};


export default creatorMessagesSlice.reducer;
