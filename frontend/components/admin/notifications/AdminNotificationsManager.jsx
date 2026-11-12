"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  markAdminCategoryNotificationsRead
} from "@/redux/admin/notifications/notifications_slice";
import { socket } from "@/lib/socket";

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

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
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

export default function AdminNotificationsManager() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread" | "read"
  const [selectedEntityType, setSelectedEntityType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [markingIds, setMarkingIds] = useState([]);

  const {
    notifications = [],
    pagination = {},
    unreadCount = 0,
    loading = false,
    markingAllRead = false,
    error = null
  } = useSelector((state) => state.adminNotifications || {});

  const loadNotifications = useCallback(() => {
    const params = {
      page: currentPage,
      limit: 10
    };

    if (activeTab === "unread") {
      params.isRead = false;
    } else if (activeTab === "read") {
      params.isRead = true;
    }

    if (selectedEntityType && selectedEntityType !== "all") {
      params.entityType = selectedEntityType;
    }

    dispatch(fetchAdminNotifications(params));
  }, [dispatch, currentPage, activeTab, selectedEntityType]);

  const loadNotificationsRef = useRef(loadNotifications);
  useEffect(() => {
    loadNotificationsRef.current = loadNotifications;
  }, [loadNotifications]);

  // Re-sync active notifications query upon genuine socket reconnection without resetting filters/page
  useEffect(() => {
    let wasDisconnected = false;

    const handleDisconnect = () => {
      wasDisconnected = true;
    };

    const handleConnect = () => {
      if (wasDisconnected) {
        wasDisconnected = false;
        if (typeof loadNotificationsRef.current === "function") {
          loadNotificationsRef.current();
        }
      }
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
    };
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleEntityTypeChange = (type) => {
    setSelectedEntityType(type);
    setCurrentPage(1);
  };

  const handleMarkRead = async (notificationId) => {
    if (!notificationId || markingIds.includes(notificationId)) return;
    setMarkingIds((prev) => [...prev, notificationId]);
    try {
      await dispatch(markAdminNotificationRead(notificationId)).unwrap();
    } catch {
      // Handled in slice
    } finally {
      setMarkingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAllRead || unreadCount === 0) return;
    try {
      await dispatch(markAllAdminNotificationsRead()).unwrap();
      loadNotifications();
    } catch {
      // Handled in slice
    }
  };

  const handleNavigate = async (item) => {
    if (!item) return;
    if (!item.isRead && item._id) {
      handleMarkRead(item._id);
    }
    if (
      typeof item.destination === "string" &&
      item.destination.startsWith("/") &&
      !item.destination.startsWith("//")
    ) {
      router.push(item.destination);
    }
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Admin Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time administrative telemetry, moderation activity, and platform events.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-border-theme hover:bg-surface-muted text-foreground transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <CheckIcon className="w-3.5 h-3.5 text-primary" />
            <span>{markingAllRead ? "Marking..." : "Mark All as Read"}</span>
          </button>
        )}
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-muted/60 rounded-xl border border-border-theme/40 self-start sm:self-auto">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "read", label: "Read" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-surface text-foreground shadow-xs border border-border-theme"
                    : "text-text-secondary hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Entity Type Filter Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Type:
          </span>
          <select
            value={selectedEntityType}
            onChange={(e) => handleEntityTypeChange(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-border-theme rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Event Types</option>
            <option value="verification">Verification</option>
            <option value="payment">Payments</option>
            <option value="campaign">Campaigns</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-surface border border-border-theme rounded-2xl shadow-xs overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-text-secondary">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : error && notifications.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <p className="text-sm font-semibold text-rose-500">Failed to load notifications</p>
            <p className="text-xs text-text-secondary mt-1">{error}</p>
            <button
              type="button"
              onClick={loadNotifications}
              className="mt-4 px-4 py-1.5 bg-foreground text-background rounded-xl text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-text-secondary">
              <BellIcon className="w-6 h-6 opacity-60" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No notifications found</p>
              <p className="text-xs text-text-secondary mt-1 max-w-sm">
                {activeTab === "unread"
                  ? "You have no unread administrative notifications."
                  : "No notifications match your current filter settings."}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border-theme/40">
            {notifications.map((item) => {
              const isMarking = markingIds.includes(item._id);
              return (
                <div
                  key={item._id}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition-colors hover:bg-surface-muted/40 ${
                    !item.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Entity Icon */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.entityType === "verification"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : item.entityType === "payment"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : item.entityType === "campaign"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : "bg-surface-muted text-text-secondary"
                    }`}
                  >
                    <AdminTypeIcon entityType={item.entityType} className="w-5 h-5" />
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm ${
                            !item.isRead
                              ? "font-bold text-foreground"
                              : "font-medium text-foreground/90"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-surface-muted border border-border-theme/60 text-text-secondary">
                          {item.entityType}
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-1">
                      {item.message}
                    </p>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {item.destination && (
                        <button
                          type="button"
                          onClick={() => handleNavigate(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          <span>View Details</span>
                          <ExternalLinkIcon />
                        </button>
                      )}

                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(item._id)}
                          disabled={isMarking}
                          className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-foreground cursor-pointer disabled:opacity-50"
                        >
                          <CheckIcon className="w-3 h-3" />
                          <span>{isMarking ? "Marking..." : "Mark as read"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unread dot indicator */}
                  {!item.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 self-center" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION BAR */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border-theme flex items-center justify-between text-xs text-text-secondary">
            <span>
              Page {currentPage} of {totalPages} ({pagination?.totalItems || 0} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
                className="p-1.5 rounded-lg border border-border-theme bg-surface hover:bg-surface-muted disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                className="p-1.5 rounded-lg border border-border-theme bg-surface hover:bg-surface-muted disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Next Page"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

