import axiosInstance from "@/lib/axios";


// Gets creator conversations list with optional query parameters (page, limit).
const getCreatorConversations = async (params = {}) => {

    const response = await axiosInstance.get(
        "/creator/messages/conversations",
        {
            params
        }
    );

    return response.data;
};


// Gets single creator conversation thread and messages by conversation ID.
const getCreatorConversationById = async (conversationId) => {

    const response = await axiosInstance.get(
        `/creator/messages/conversations/${conversationId}`
    );

    return response.data;
};


// Sends a message from creator to brand.
const sendCreatorMessage = async (messageData) => {

    const response = await axiosInstance.post(
        "/creator/messages/send",
        messageData
    );

    return response.data;
};


// Marks messages in a conversation as read for creator.
const markCreatorConversationRead = async (conversationId) => {

    const response = await axiosInstance.patch(
        `/creator/messages/conversations/${conversationId}/read`
    );

    return response.data;
};


export {
    getCreatorConversations,
    getCreatorConversationById,
    sendCreatorMessage,
    markCreatorConversationRead
};
