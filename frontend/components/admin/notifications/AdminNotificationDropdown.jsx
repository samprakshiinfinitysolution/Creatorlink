"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminDropdownNotifications,
  fetchAdminUnreadNotificationCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  addRealtimeAdminNotification
} from "@/redux/admin/notifications/notifications_slice";
import {
  socket,
  confirmSocketAuthSuccess,
  registerSocketConsumer,
  unregisterSocketConsumer,
  handleSocketConnectionError
} from "@/lib/socket";

// Relative time formatting helper
function formatTimeAgo(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (Number.isNaN(diffInSeconds) || diffInSeconds < 0) return "";
    if (diffInSeconds < 60) return "Just now";
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

// Icons
function BellIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
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

function AdminTypeIcon({ entityType, className = "w-4 h-4" }) {
  if (entityType === "verification") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    );
  }
  if (entityType === "payment") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (entityType === "campaign") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.111-1.53-.472-.433-.933-.778-1.92-1.026-2.953m2.69-1.248a48.36 48.36 0 004.832-.821c.642-.143 1.084-.716 1.084-1.376v-1.83c0-.66-.442-1.233-1.084-1.376a48.36 48.36 0 00-4.832-.821m0 6.222V9.618" />
      </svg>
    );
  }
  if (entityType === "user") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

export default function AdminNotificationDropdown() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [markingIds, setMarkingIds] = useState([]);
  const [actionError, setActionError] = useState(null);

  const dropdownRef = useRef(null);
  const consumerId = useId();

  const { adminUser } = useSelector((state) => state.adminAuth || {});
  const currentAdminId = adminUser?._id || adminUser?.id;
  const currentAdminIdRef = useRef(currentAdminId);

  useEffect(() => {
    currentAdminIdRef.current = currentAdminId;
  }, [currentAdminId]);

  const {
    dropdownNotifications = [],
    unreadCount = 0,
    dropdownLoading = false,
    markingAllRead = false,
    error = null
  } = useSelector((state) => state.adminNotifications || {});

  // Register socket consumer and listen for real-time notifications
  useEffect(() => {
    if (!currentAdminId) {
      unregisterSocketConsumer(consumerId);
      return;
    }

    registerSocketConsumer(consumerId, currentAdminId);

    const handleNewNotification = (notification) => {
      if (!notification || !notification._id) return;

      const targetRecipient =
        notification.recipient?._id ||
        notification.recipient?.id ||
        notification.recipient;

      // Accept if recipient is this admin, or if broadcast without explicit recipient mismatch
      if (
        targetRecipient &&
        currentAdminIdRef.current &&
        String(targetRecipient) !== String(currentAdminIdRef.current)
      ) {
        return;
      }

      dispatch(addRealtimeAdminNotification(notification));
    };

    const handleConnectSuccess = () => {
      confirmSocketAuthSuccess();
    };

    socket.on("connect", handleConnectSuccess);
    socket.on("notification:new", handleNewNotification);

    return () => {
      unregisterSocketConsumer(consumerId);
      socket.off("connect", handleConnectSuccess);
      socket.off("notification:new", handleNewNotification);
    };
  }, [dispatch, currentAdminId, consumerId]);

  // Fetch unread count on mount
  useEffect(() => {
    if (currentAdminId) {
      dispatch(fetchAdminUnreadNotificationCount());
    }
  }, [dispatch, currentAdminId]);

  // Fetch recent dropdown notifications when opened
  useEffect(() => {
    if (isOpen) {
      setActionError(null);
      dispatch(fetchAdminDropdownNotifications());
      dispatch(fetchAdminUnreadNotificationCount());
    }
  }, [dispatch, isOpen]);

  // Close on outside click and Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = async (item) => {
    if (!item) return;

    if (item._id && !item.isRead) {
      if (markingIds.includes(item._id)) return;
      setActionError(null);
      setMarkingIds((prev) => [...prev, item._id]);
      try {
        await dispatch(markAdminNotificationRead(item._id)).unwrap();
      } catch (err) {
        setActionError(typeof err === "string" ? err : "Failed to mark notification as read");
        return;
      } finally {
        setMarkingIds((prev) => prev.filter((id) => id !== item._id));
      }
    }

    setIsOpen(false);

    if (
      typeof item?.destination === "string" &&
      item.destination.startsWith("/") &&
      !item.destination.startsWith("//")
    ) {
      router.push(item.destination);
    }
  };

  const handleMarkItemRead = async (e, item) => {
    e.stopPropagation();
    if (!item?._id || item?.isRead || markingIds.includes(item._id)) return;
    setActionError(null);
    setMarkingIds((prev) => [...prev, item._id]);
    try {
      await dispatch(markAdminNotificationRead(item._id)).unwrap();
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Failed to mark notification as read");
    } finally {
      setMarkingIds((prev) => prev.filter((id) => id !== item._id));
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0 && !markingAllRead) {
      dispatch(markAllAdminNotificationsRead());
    }
  };

  const numUnread = Number(unreadCount) || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Admin Notifications${numUnread > 0 ? ` (${numUnread} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted border border-border-theme transition-colors cursor-pointer"
      >
        <BellIcon />
        {numUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold font-sans flex items-center justify-center ring-2 ring-surface shadow-sm">
            {numUnread > 99 ? "99+" : numUnread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fixed inset-x-2 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 sm:max-w-md bg-surface border border-border-theme rounded-2xl shadow-xl z-50 text-foreground font-sans select-none overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-theme flex items-center justify-between gap-2 bg-surface">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-semibold text-sm text-foreground">Notifications</h2>
              {numUnread > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 shrink-0">
                  {numUnread} unread
                </span>
              )}
            </div>

            {numUnread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className="text-xs font-medium text-primary hover:underline cursor-pointer disabled:opacity-50 transition-colors shrink-0"
              >
                {markingAllRead ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border-theme/40 overscroll-contain">
            {actionError && (
              <div className="p-2.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between gap-2 px-4">
                <span className="text-[11px] text-rose-500 truncate">{actionError}</span>
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  className="text-[11px] font-semibold text-text-secondary hover:text-foreground cursor-pointer shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {dropdownLoading && dropdownNotifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-secondary">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : dropdownNotifications.length === 0 ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary">
                  <BellIcon className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-sm font-medium text-foreground">No notifications yet</p>
                <p className="text-xs text-text-secondary max-w-[200px]">
                  Administrative alerts and moderation activity will appear here.
                </p>
              </div>
            ) : (
              dropdownNotifications.map((item) => {
                const isMarking = markingIds.includes(item._id);
                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3.5 px-4 flex items-start gap-3 transition-colors cursor-pointer group hover:bg-surface-muted/60 ${
                      !item.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Entity Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.entityType === "verification"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : item.entityType === "payment"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : item.entityType === "campaign"
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          : "bg-surface-muted text-text-secondary"
                      }`}
                    >
                      <AdminTypeIcon entityType={item.entityType} className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs truncate ${!item.isRead ? "font-semibold text-foreground" : "font-medium text-text-secondary"}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-text-secondary shrink-0">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {/* Actions: Unread dot or Mark read check */}
                    <div className="shrink-0 flex items-center self-center pl-1">
                      {!item.isRead ? (
                        <button
                          type="button"
                          onClick={(e) => handleMarkItemRead(e, item)}
                          disabled={isMarking}
                          title="Mark as read"
                          aria-label="Mark notification as read"
                          className="w-5 h-5 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          {isMarking ? (
                            <span className="w-2 h-2 rounded-full border border-primary border-t-transparent animate-spin" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </button>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-transparent" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link to Full Notification Center */}
          <div className="p-2.5 border-t border-border-theme bg-surface text-center">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-block w-full py-1.5 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-surface-muted rounded-xl transition-colors cursor-pointer text-center"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

