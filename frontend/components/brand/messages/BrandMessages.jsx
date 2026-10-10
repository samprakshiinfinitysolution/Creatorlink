"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "@/lib/socket";
import { refreshToken } from "@/redux/auth/auth_slice";
import {
  fetchBrandConversations,
  fetchBrandConversationById,
  sendBrandMessage,
  markBrandConversationRead,
  addNewBrandMessage,
  setBrandConversationRead,
  clearSelectedConversation,
  clearConversationRefreshFlag,
  clearSuccessMessage,
  clearError
} from "@/redux/brand/messages/messages_slice";

// =========================================================
// SVG ICONS
// =========================================================
function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function SendIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function BackArrowIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function ChatBubbleIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.596.596 0 01-.643-.655 4.5 4.5 0 011.02-2.316A7.478 7.478 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function CheckCheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5M4.5 12.75l3.75-3.75" />
    </svg>
  );
}

function CheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

// =========================================================
// HELPER UTILITIES
// =========================================================
function getInitials(name = "", email = "") {
  if (name && typeof name === "string" && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (email && typeof email === "string" && email.trim()) {
    return email.trim()[0].toUpperCase();
  }
  return "CR";
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function formatTimestampLabel(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  if (date >= startOfToday) {
    return formatTime(dateStr);
  }
  if (date >= startOfYesterday) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount));
}

// =========================================================
// BRAND MESSAGES COMPONENT
// =========================================================
export default function BrandMessages() {
  const dispatch = useDispatch();

  const {
    conversations = [],
    selectedConversation,
    messages = [],
    conversationsLoading,
    conversationLoading,
    sending,
    refreshConversationsNeeded,
    error,
    successMessage
  } = useSelector((state) => state.brandMessages || {});

  const { user: authUser } = useSelector((state) => state.auth || {});
  const { profile } = useSelector((state) => state.brandProfile || {});

  // Find brand participant from active conversation or profile or auth user
  const brandParticipant = selectedConversation?.participants?.find(
    (p) => p.role && p.role.toLowerCase() === "brand"
  );

  const bookingBrandId =
    typeof selectedConversation?.booking?.brand === "string"
      ? selectedConversation.booking.brand
      : (selectedConversation?.booking?.brand?._id || selectedConversation?.booking?.brand?.id);

  const currentBrandId =
    authUser?._id ||
    authUser?.user?._id ||
    authUser?.id ||
    authUser?.userId ||
    profile?.user?._id ||
    profile?.user?.id ||
    (typeof profile?.user === "string" ? profile.user : null) ||
    profile?._id ||
    profile?.id ||
    brandParticipant?._id ||
    brandParticipant?.id ||
    bookingBrandId;

  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial load: Fetch conversations list
  useEffect(() => {
    dispatch(fetchBrandConversations());
  }, [dispatch]);


  
  // Connect Socket.IO when the Brand Messages component mounts.
  useEffect(() => {
      if (!socket.connected) {
          socket.connect();
      }

      return () => {
          socket.disconnect();
      };
  }, []);



// Join the selected conversation's Socket.IO room.
useEffect(() => {
    const conversationId = selectedConversation?._id;

    if (!conversationId) return;

    const joinConversation = () => {
        socket.emit(
            "conversation:join",
            String(conversationId),
            (result) => {
                if (!result?.success) {
                    console.error(
                        "Failed to join conversation:",
                        result?.message
                    );
                }
            }
        );
    };

    if (socket.connected) {
        joinConversation();
    }

    socket.on("connect", joinConversation);

    return () => {
        socket.off("connect", joinConversation);

        if (socket.connected) {
            socket.emit(
                "conversation:leave",
                String(conversationId)
            );
        }
    };
}, [selectedConversation?._id]);

  const isRefreshingSocketRef = useRef(false);

  const selectedConversationRef = useRef(selectedConversation);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const currentBrandIdRef = useRef(currentBrandId);
  useEffect(() => {
    currentBrandIdRef.current = currentBrandId;
  }, [currentBrandId]);

  // Listen for incoming real-time socket messages, read receipts, and handle socket auth errors.
  useEffect(() => {
    const handleNewMessage = (payload) => {
      if (payload && payload.conversationId && payload.message) {
        dispatch(addNewBrandMessage(payload));

        const msgReceiverId =
          typeof payload.message.receiver === "string"
            ? payload.message.receiver
            : payload.message.receiver?._id;

        if (
          selectedConversationRef.current?._id &&
          String(selectedConversationRef.current._id) === String(payload.conversationId) &&
          currentBrandIdRef.current &&
          msgReceiverId &&
          String(msgReceiverId) === String(currentBrandIdRef.current)
        ) {
          dispatch(markBrandConversationRead(payload.conversationId));
        }
      }
    };

    const handleConversationRead = (payload) => {
      if (payload && payload.conversationId && payload.readerId) {
        dispatch(setBrandConversationRead(payload));
      }
    };

    const handleConnectError = async (err) => {
      const errorMessage = err?.message || "";
      console.error("Socket connection error:", errorMessage);

      const isAuthError =
        errorMessage === "Invalid or expired access token" ||
        errorMessage === "Authentication required";

      if (isAuthError && !isRefreshingSocketRef.current) {
        isRefreshingSocketRef.current = true;
        try {
          await dispatch(refreshToken()).unwrap();
          if (!socket.connected) {
            socket.connect();
          }
        } catch (refreshErr) {
          console.error("Token refresh failed for Socket.IO:", refreshErr);
          socket.disconnect();
        } finally {
          isRefreshingSocketRef.current = false;
        }
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:read", handleConversationRead);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("conversation:read", handleConversationRead);
      socket.off("connect_error", handleConnectError);
    };
  }, [dispatch]);


  // Refetch conversations list if a new message was sent to a brand-new conversation
  useEffect(() => {
    if (refreshConversationsNeeded) {
      dispatch(fetchBrandConversations());
      dispatch(clearConversationRefreshFlag());
    }
  }, [dispatch, refreshConversationsNeeded]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const searchParams = useSearchParams();
  const targetBookingId = searchParams?.get("bookingId");
  const targetConversationId = searchParams?.get("conversationId");

  // Handle selecting a conversation thread
  const handleSelectConversation = (conversationId) => {
    if (selectedConversation?._id && String(selectedConversation._id) === String(conversationId)) return;
    dispatch(clearSelectedConversation());
    dispatch(fetchBrandConversationById(conversationId));
    dispatch(markBrandConversationRead(conversationId));
  };

  // Auto-select conversation matching URL query parameter (bookingId or conversationId)
  useEffect(() => {
    if (!conversationsLoading && conversations.length > 0 && (targetBookingId || targetConversationId)) {
      const matchedConv = conversations.find(
        (c) =>
          (targetConversationId && String(c._id) === String(targetConversationId)) ||
          (targetBookingId && String(c.booking?._id || c.booking) === String(targetBookingId))
      );

      if (matchedConv && String(selectedConversation?._id) !== String(matchedConv._id)) {
        handleSelectConversation(matchedConv._id);
      }
    }
  }, [conversations, conversationsLoading, targetBookingId, targetConversationId]);

  // Handle message submission
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage || sending || !selectedConversation) return;

    // Identify recipient creator participant
    const recipient = selectedConversation.participants?.find(
      (p) =>
        (p.role && p.role.toLowerCase() === "creator") ||
        (currentBrandId && String(p._id || p.id) !== String(currentBrandId))
    ) || selectedConversation.participants?.find(
      (p) => String(p._id || p.id) !== String(currentBrandId)
    ) || selectedConversation.participants?.[0];

    const recipientId = recipient?._id || recipient?.id;
    const bookingId = selectedConversation.booking?._id || selectedConversation.booking;
    const campaignId = selectedConversation.campaign?._id || selectedConversation.campaign;

    if (!recipientId || !bookingId) return;

    const payload = {
      recipientId,
      bookingId,
      campaignId,
      message: trimmedMessage
    };

    const actionResult = await dispatch(sendBrandMessage(payload));
    if (sendBrandMessage.fulfilled.match(actionResult)) {
      setMessageInput("");
    }
  };

  // Filter conversations by search term
  const filteredConversations = conversations.filter((item) => {
    const creator = item.participants?.find(
      (p) =>
        (p.role && p.role.toLowerCase() === "creator") ||
        (currentBrandId && String(p._id || p.id) !== String(currentBrandId))
    ) || item.participants?.[0];

    const creatorName = creator?.name || "";
    const campaignTitle = item.campaign?.title || "";
    const query = searchQuery.toLowerCase();

    return (
      creatorName.toLowerCase().includes(query) ||
      campaignTitle.toLowerCase().includes(query) ||
      (item.lastMessage || "").toLowerCase().includes(query)
    );
  });

  // Extract selected thread's creator participant details
  const activeCreator = selectedConversation?.participants?.find(
    (p) =>
      (p.role && p.role.toLowerCase() === "creator") ||
      (currentBrandId && String(p._id || p.id) !== String(currentBrandId))
  ) || selectedConversation?.participants?.find(
    (p) => String(p._id || p.id) !== String(currentBrandId)
  ) || selectedConversation?.participants?.[0];

  const activeCreatorName = activeCreator?.name || "Creator";
  const activeCreatorEmail = activeCreator?.email || "";
  const activeCreatorInitials = getInitials(activeCreatorName, activeCreatorEmail);
  const activeCampaignTitle = selectedConversation?.campaign?.title;
  const activeBookingPrice = formatCurrency(selectedConversation?.booking?.agreedPrice);

  return (
    <div className="w-full max-w-full min-w-0 flex-1 flex flex-col h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-7rem)] bg-background overflow-hidden rounded-2xl border border-border-theme shadow-xs">
      {/* Banner / Toast Feedback */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-500 px-4 py-2 text-xs font-medium flex items-center justify-between shrink-0">
          <span className="truncate">{error}</span>
          <button
            type="button"
            onClick={() => dispatch(clearError())}
            className="text-red-500 hover:text-red-600 font-bold ml-2 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="w-full max-w-full flex-1 flex min-h-0 relative min-w-0">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CONVERSATION LIST */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-border-theme bg-surface flex flex-col shrink-0 min-w-0 max-w-full ${
            selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header & Search Bar */}
          <div className="p-3.5 sm:p-4 border-b border-border-theme space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-semibold text-base sm:text-lg text-foreground tracking-tight">
                Messages
              </h2>
              <button
                type="button"
                onClick={() => dispatch(fetchBrandConversations())}
                disabled={conversationsLoading}
                className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh conversations"
              >
                <RefreshIcon className={`w-4 h-4 ${conversationsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search creator or campaign..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-muted border border-border-theme text-xs text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors min-w-0"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border-theme/50">
            {conversationsLoading && conversations.length === 0 ? (
              // Loading Skeleton List
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-surface-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-surface-muted rounded-md w-2/3" />
                      <div className="h-2.5 bg-surface-muted rounded-md w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              // Empty List State
              <div className="p-8 text-center text-text-secondary space-y-2">
                <ChatBubbleIcon className="w-10 h-10 mx-auto text-text-secondary/40" />
                <p className="text-xs font-sans font-medium text-foreground">
                  {searchQuery ? "No matching conversations" : "No active conversations"}
                </p>
                <p className="text-[11px] text-text-secondary max-w-xs mx-auto">
                  {searchQuery
                    ? "Try adjusting your search query."
                    : "Messaging becomes available once a booking collaboration is accepted."}
                </p>
              </div>
            ) : (
              // Conversation Item Rows
              filteredConversations.map((item) => {
                const creator = item.participants?.find(
                  (p) =>
                    (p.role && p.role.toLowerCase() === "creator") ||
                    (currentBrandId && String(p._id || p.id) !== String(currentBrandId))
                ) || item.participants?.[0];

                const creatorName = creator?.name || "Creator";
                const creatorInitials = getInitials(creatorName, creator?.email);
                const isSelected = selectedConversation?._id && String(selectedConversation._id) === String(item._id);

                return (
                  <button
                    type="button"
                    key={item._id}
                    onClick={() => handleSelectConversation(item._id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer min-w-0 ${
                      isSelected
                        ? "bg-secondary/10 border-l-4 border-secondary"
                        : "hover:bg-surface-muted"
                    }`}
                  >
                    {/* Creator Initials Avatar */}
                    <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary font-semibold text-xs flex items-center justify-center shrink-0 border border-secondary/30 uppercase mt-0.5">
                      {creatorInitials}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs font-sans font-semibold text-foreground truncate">
                          {creatorName}
                        </h3>
                        <span className="text-[10px] text-text-secondary shrink-0">
                          {formatTimestampLabel(item.lastMessageAt || item.updatedAt)}
                        </span>
                      </div>

                      {/* Campaign Badge / Subtitle */}
                      {item.campaign?.title && (
                        <span className="inline-block text-[10px] font-medium text-secondary truncate max-w-full">
                          {item.campaign.title}
                        </span>
                      )}

                      {/* Last Message Snippet */}
                      <p className="text-[11px] text-text-secondary truncate mt-0.5">
                        {item.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: CHAT WINDOW */}
        {/* ========================================================= */}
        <div
          className={`flex-1 flex flex-col min-w-0 max-w-full bg-background ${
            selectedConversation ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-3 sm:p-3.5 px-3.5 sm:px-6 bg-surface border-b border-border-theme flex items-center justify-between shrink-0 min-w-0 max-w-full">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => dispatch(clearSelectedConversation())}
                    className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors shrink-0"
                  >
                    <BackArrowIcon />
                  </button>

                  {/* Active Creator Avatar */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary/15 text-secondary font-semibold text-xs flex items-center justify-center shrink-0 border border-secondary/30 uppercase">
                    {activeCreatorInitials}
                  </div>

                  {/* Active Creator Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-sans font-semibold text-foreground truncate">
                      {activeCreatorName}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-text-secondary min-w-0 truncate">
                      {activeCampaignTitle && (
                        <span className="truncate">{activeCampaignTitle}</span>
                      )}
                      {activeBookingPrice && (
                        <span className="text-emerald-500 font-medium shrink-0">
                          • {activeBookingPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Thread Container */}
              <div className="flex-1 p-3 sm:p-6 overflow-y-auto custom-scrollbar space-y-3 sm:space-y-3.5 bg-background min-w-0 max-w-full">
                {conversationLoading && messages.length === 0 ? (
                  // Loading Thread Skeleton
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="w-48 h-10 bg-surface-muted rounded-2xl animate-pulse" />
                    </div>
                    <div className="flex justify-end">
                      <div className="w-56 h-12 bg-surface-muted rounded-2xl animate-pulse" />
                    </div>
                    <div className="flex justify-start">
                      <div className="w-40 h-10 bg-surface-muted rounded-2xl animate-pulse" />
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  // Empty Messages Thread
                  <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary space-y-2 py-12">
                    <ChatBubbleIcon className="w-10 h-10 text-text-secondary/40" />
                    <p className="text-xs font-sans font-medium text-foreground">
                      No messages yet
                    </p>
                    <p className="text-[11px] text-text-secondary max-w-xs">
                      Send a message below to start the conversation with {activeCreatorName}.
                    </p>
                  </div>
                ) : (
                  // Message Bubble Items
                  messages.map((msg) => {
                    const senderId = typeof msg.sender === "string" ? msg.sender : (msg.sender?._id || msg.sender?.id);
                    const isBrandSender = Boolean(currentBrandId && senderId && String(senderId) === String(currentBrandId));

                    return (
                      <div
                        key={msg._id || msg.createdAt}
                        className={`flex flex-col ${isBrandSender ? "items-end" : "items-start"} w-full min-w-0`}
                      >
                        {/* Bubble Container */}
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-sans leading-relaxed break-words [overflow-wrap:anywhere] shadow-xs ${
                            isBrandSender
                              ? "bg-secondary text-white rounded-tr-xs"
                              : "bg-surface text-foreground border border-border-theme rounded-tl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.message}</p>

                          {/* Attachments if any */}
                          {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block underline text-[11px] truncate ${
                                    isBrandSender ? "text-white/90 hover:text-white" : "text-secondary hover:underline"
                                  }`}
                                >
                                  Attachment {idx + 1}
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Timestamp & Read Indicator */}
                          <div
                            className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                              isBrandSender ? "text-white/75" : "text-text-secondary"
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isBrandSender && (
                              <span>
                                {msg.isRead ? (
                                  <CheckCheckIcon className="w-3.5 h-3.5 text-white" />
                                ) : (
                                  <CheckIcon className="w-3.5 h-3.5 text-white/75" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="p-2.5 sm:p-3.5 px-3 sm:px-6 bg-surface border-t border-border-theme shrink-0 min-w-0 max-w-full">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 min-w-0 w-full">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Message ${activeCreatorName}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    disabled={sending}
                    className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-surface-muted border border-border-theme text-xs text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-secondary text-white font-sans font-medium text-xs flex items-center gap-1.5 hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
                  >
                    <span>Send</span>
                    <SendIcon />
                  </button>
                </form>
              </div>
            </>
          ) : (
            // No Conversation Selected Empty State
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary space-y-3">
              <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary/50">
                <ChatBubbleIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-serif font-semibold text-foreground text-base">
                  Select a Conversation
                </h3>
                <p className="text-xs text-text-secondary">
                  Choose a conversation from the left panel to view messages and collaborate with creators.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
