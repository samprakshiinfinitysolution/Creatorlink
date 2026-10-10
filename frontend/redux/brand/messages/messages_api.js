import axiosInstance from "@/lib/axios";


// Gets brand conversations list with optional query parameters (page, limit).
const getBrandConversations = async (params = {}) => {

    const response = await axiosInstance.get(
        "/brand/messages/conversations",
        {
            params
        }
    );

    return response.data;
};


// Gets single brand conversation thread and messages by conversation ID.
const getBrandConversationById = async (conversationId) => {

    const response = await axiosInstance.get(
        `/brand/messages/conversations/${conversationId}`
    );

    return response.data;
};


// Sends a message from brand to creator.
const sendBrandMessage = async (messageData) => {

    const response = await axiosInstance.post(
        "/brand/messages/send",
        messageData
    );

    return response.data;
};


// Marks messages in a conversation as read for brand.
const markBrandConversationRead = async (conversationId) => {

    const response = await axiosInstance.patch(
        `/brand/messages/conversations/${conversationId}/read`
    );

    return response.data;
};


export {
    getBrandConversations,
    getBrandConversationById,
    sendBrandMessage,
    markBrandConversationRead
};
