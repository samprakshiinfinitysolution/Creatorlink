"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandDropdownNotifications,
  fetchBrandUnreadNotificationCount,
  markBrandNotificationRead,
  markAllBrandNotificationsRead,
  addRealtimeBrandNotification
} from "@/redux/brand/notifications/notifications_slice";
import {
  socket,
  confirmSocketAuthSuccess,
  registerSocketConsumer,
  unregisterSocketConsumer,
  handleSocketConnectionError
} from "@/lib/socket";
import { refreshToken } from "@/redux/auth/auth_slice";

// =========================================================
// TIME FORMATTER
// =========================================================
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

// =========================================================
// SVG ICONS
// =========================================================
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

function NotificationTypeIcon({ entityType, className = "w-4 h-4" }) {
  if (entityType === "payment") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (entityType === "workspace") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006A3.013 3.013 0 0118 15.75H6a3.013 3.013 0 01-2.25-1.044m16.5 0v-4.25" />
      </svg>
    );
  }
  if (entityType === "booking") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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
  if (entityType === "review") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

export default function BrandNotificationDropdown({
  isOpen = false,
  onToggle = () => {},
  onClose = () => {}
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const [markingIds, setMarkingIds] = useState([]);
  const [actionError, setActionError] = useState(null);

  const {
    dropdownNotifications: notifications = [],
    unreadCount = 0,
    dropdownLoading: loading = false,
    markingAllRead = false,
    dropdownError: error = null
  } = useSelector((state) => state.brandNotifications || {});

  const authUser = useSelector((state) => state.auth?.user);
  const brandProfile = useSelector((state) => state.brandProfile?.profile);
  const currentUserId =
    authUser?._id ||
    authUser?.id ||
    brandProfile?.user?._id ||
    (typeof brandProfile?.user === "string" ? brandProfile.user : null);

  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const consumerId = useId();

  // Connect socket and listen for real-time notifications
  useEffect(() => {
    if (!currentUserId) {
      unregisterSocketConsumer(consumerId);
      return;
    }

    registerSocketConsumer(consumerId, currentUserId);

    const handleNewNotification = (notification) => {
      if (!notification || !notification._id) return;

      const targetRecipient =
        notification.recipient?._id ||
        notification.recipient?.id ||
        notification.recipient;

      if (
        !currentUserIdRef.current ||
        !targetRecipient ||
        String(targetRecipient) !== String(currentUserIdRef.current)
      ) {
        return;
      }

      dispatch(addRealtimeBrandNotification(notification));
    };

    const handleConnectError = async (err) => {
      await handleSocketConnectionError(err, dispatch, refreshToken);
    };

    const handleConnectSuccess = () => {
      confirmSocketAuthSuccess();
    };

    socket.on("connect", handleConnectSuccess);
    socket.on("notification:new", handleNewNotification);
    socket.on("connect_error", handleConnectError);

    return () => {
      unregisterSocketConsumer(consumerId);
      socket.off("connect", handleConnectSuccess);
      socket.off("notification:new", handleNewNotification);
      socket.off("connect_error", handleConnectError);
    };
  }, [dispatch, currentUserId, consumerId]);

  // Fetch unread count on mount
  useEffect(() => {
    dispatch(fetchBrandUnreadNotificationCount());
  }, [dispatch]);

  // Fetch latest 10 notifications whenever opened
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchBrandDropdownNotifications());
      dispatch(fetchBrandUnreadNotificationCount());
    }
  }, [dispatch, isOpen]);

  // Close on outside click and Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleDropdownRetry = () => {
    setActionError(null);
    dispatch(fetchBrandDropdownNotifications());
    dispatch(fetchBrandUnreadNotificationCount());
  };

  const handleItemClick = async (item) => {
    if (!item) return;

    if (item._id && !item.isRead) {
      if (markingIds.includes(item._id)) return;
      setActionError(null);
      setMarkingIds((prev) => [...prev, item._id]);
      try {
        await dispatch(markBrandNotificationRead(item._id)).unwrap();
      } catch (err) {
        setActionError(
          typeof err === "string" ? err : "Failed to mark notification as read"
        );
        return;
      } finally {
        setMarkingIds((prev) => prev.filter((id) => id !== item._id));
      }
    }

    onClose();

    // Safe internal route navigation
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
      await dispatch(markBrandNotificationRead(item._id)).unwrap();
    } catch (err) {
      setActionError(
        typeof err === "string" ? err : "Failed to mark notification as read"
      );
    } finally {
      setMarkingIds((prev) => prev.filter((id) => id !== item._id));
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0 && !markingAllRead) {
      dispatch(markAllBrandNotificationsRead());
    }
  };

  const numUnread = Number(unreadCount) || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Notifications${numUnread > 0 ? ` (${numUnread} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted border border-border-theme transition-colors cursor-pointer"
      >
        <BellIcon />
        {numUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-white text-[10px] font-bold font-sans flex items-center justify-center ring-2 ring-surface shadow-sm">
            {numUnread > 99 ? "99+" : numUnread}
          </span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-[-3.5rem] sm:right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm sm:max-w-md bg-surface border border-border-theme rounded-2xl shadow-xl z-50 text-foreground font-sans select-none animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-theme flex items-center justify-between gap-2 bg-surface">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-semibold text-sm text-foreground">Notifications</h2>
              {numUnread > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 shrink-0">
                  {numUnread} unread
                </span>
              )}
            </div>

            {numUnread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className="text-xs font-medium text-secondary hover:underline cursor-pointer disabled:opacity-50 transition-colors shrink-0"
              >
                {markingAllRead ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border-theme/40 overscroll-contain">
            {actionError && (
              <div className="p-2.5 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between gap-2 px-4">
                <span className="text-[11px] text-red-500 truncate">{actionError}</span>
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  className="text-[11px] font-semibold text-text-secondary hover:text-foreground cursor-pointer shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}
            {error && notifications.length > 0 && (
              <div className="p-2.5 bg-red-500/10 border-b border-red-500/20 text-center flex items-center justify-between gap-2 px-4">
                <span className="text-[11px] text-red-500 truncate">{error}</span>
                <button
                  type="button"
                  onClick={handleDropdownRetry}
                  className="text-xs font-semibold text-secondary hover:underline cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            )}
            {loading && notifications.length === 0 ? (
              // Loading Skeleton
              <div className="p-4 space-y-3.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-surface-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-surface-muted rounded w-2/3" />
                      <div className="h-3 bg-surface-muted rounded w-full" />
                      <div className="h-2.5 bg-surface-muted rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error && notifications.length === 0 ? (
              // Error State
              <div className="p-6 text-center">
                <p className="text-xs text-red-500 mb-2">{error}</p>
                <button
                  type="button"
                  onClick={handleDropdownRetry}
                  className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              // Empty State
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary mb-2.5">
                  <BellIcon className="w-5 h-5 opacity-40" />
                </div>
                <p className="text-xs font-semibold text-foreground">No notifications yet</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  You&apos;re all caught up! Updates will appear here.
                </p>
              </div>
            ) : (
              // Notification Items
              notifications.slice(0, 10).map((item) => {
                const isUnread = !item.isRead;
                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3 sm:p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                      isUnread
                        ? "bg-secondary/5 hover:bg-secondary/10"
                        : "hover:bg-surface-muted"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnread
                          ? "bg-secondary/20 text-secondary"
                          : "bg-surface-muted text-text-secondary"
                      }`}
                    >
                      <NotificationTypeIcon
                        entityType={item.entityType}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <h3
                          className={`text-xs leading-snug truncate ${
                            isUnread
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/90"
                          }`}
                        >
                          {item.title}
                        </h3>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-[11px] text-text-secondary line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] text-text-secondary">
                        <span>{formatTimeAgo(item.createdAt)}</span>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkItemRead(e, item)}
                            disabled={markingIds.includes(item._id)}
                            title="Mark as read"
                            className="inline-flex items-center gap-1 hover:text-secondary p-0.5 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckIcon className="w-3 h-3" />
                            <span>{markingIds.includes(item._id) ? "Marking..." : "Mark read"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: Link to Full Notifications Center */}
          <div className="p-2 border-t border-border-theme bg-surface-muted/20 text-center">
            <Link
              href="/brand/notifications"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-secondary hover:underline py-1 px-3 transition-colors"
            >
              <span>View all notifications</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
