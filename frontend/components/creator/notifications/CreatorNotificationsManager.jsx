"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCreatorNotifications,
  fetchCreatorUnreadNotificationCount,
  markCreatorNotificationRead,
  markAllCreatorNotificationsRead
} from "@/redux/creator/notifications/notifications_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

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
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
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

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function NotificationTypeIcon({ entityType, className = "w-5 h-5" }) {
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

const CATEGORY_FILTERS = [
  { label: "All Categories", value: "all" },
  { label: "Bookings", value: "booking" },
  { label: "Workspace", value: "workspace" },
  { label: "Campaigns", value: "campaign" },
  { label: "Payments", value: "payment" },
  { label: "Reviews", value: "review" },
  { label: "Messages", value: "message" }
];

export default function CreatorNotificationsManager() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [readFilter, setReadFilter] = useState("all"); // "all" | "unread"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [markingIds, setMarkingIds] = useState([]);
  const [actionError, setActionError] = useState(null);
  const limit = 10;

  const {
    notifications = [],
    unreadCount = 0,
    pagination = null,
    loading = false,
    markingAllRead = false,
    error = null
  } = useSelector((state) => state.creatorNotifications || {});

  // Fetch notifications whenever page, readFilter, or categoryFilter changes
  useEffect(() => {
    const params = {
      page,
      limit
    };
    if (readFilter === "unread") {
      params.isRead = false;
    }
    if (categoryFilter !== "all") {
      params.entityType = categoryFilter;
    }
    dispatch(fetchCreatorNotifications(params));
    dispatch(fetchCreatorUnreadNotificationCount());
  }, [dispatch, page, readFilter, categoryFilter]);

  const handleTabChange = (newTab) => {
    if (newTab !== readFilter) {
      setActionError(null);
      setReadFilter(newTab);
      setPage(1);
    }
  };

  const handleCategoryChange = (cat) => {
    if (cat !== categoryFilter) {
      setActionError(null);
      setCategoryFilter(cat);
      setPage(1);
    }
  };

  const handleRetry = () => {
    setActionError(null);
    const params = {
      page,
      limit
    };
    if (readFilter === "unread") {
      params.isRead = false;
    }
    if (categoryFilter !== "all") {
      params.entityType = categoryFilter;
    }
    dispatch(fetchCreatorNotifications(params));
    dispatch(fetchCreatorUnreadNotificationCount());
  };

  const handleMarkAllRead = async () => {
    if (unreadCount > 0 && !markingAllRead) {
      setActionError(null);
      try {
        await dispatch(markAllCreatorNotificationsRead()).unwrap();
      } catch (err) {
        setActionError(
          typeof err === "string" ? err : "Failed to mark all notifications as read"
        );
      }
    }
  };

  const handleItemClick = async (item) => {
    if (!item) return;

    if (item._id && !item.isRead) {
      if (markingIds.includes(item._id)) return;
      setActionError(null);
      setMarkingIds((prev) => [...prev, item._id]);
      try {
        await dispatch(markCreatorNotificationRead(item._id)).unwrap();
      } catch (err) {
        setActionError(
          typeof err === "string" ? err : "Failed to mark notification as read"
        );
        return;
      } finally {
        setMarkingIds((prev) => prev.filter((id) => id !== item._id));
      }
    }

    if (
      typeof item?.destination === "string" &&
      item.destination.startsWith("/") &&
      !item.destination.startsWith("//")
    ) {
      router.push(item.destination);
    }
  };

  const handleMarkSingleRead = async (e, item) => {
    e.stopPropagation();
    if (!item?._id || item?.isRead || markingIds.includes(item._id)) {
      return;
    }
    setActionError(null);
    setMarkingIds((prev) => [...prev, item._id]);
    try {
      await dispatch(markCreatorNotificationRead(item._id)).unwrap();
    } catch (err) {
      setActionError(
        typeof err === "string" ? err : "Failed to mark notification as read"
      );
    } finally {
      setMarkingIds((prev) => prev.filter((id) => id !== item._id));
    }
  };

  // Exclude newly read items when in unread tab and filter by category if set
  const displayedNotifications = notifications.filter((item) => {
    if (readFilter === "unread" && item.isRead) return false;
    if (categoryFilter !== "all" && item.entityType !== categoryFilter) return false;
    return true;
  });

  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems ?? notifications.length;
  const hasPrevPage = pagination?.hasPrevPage ?? (currentPage > 1);
  const hasNextPage = pagination?.hasNextPage ?? (currentPage < totalPages);
  const numUnread = Number(unreadCount) || 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Notifications Center Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Header Title & Actions Banner */}
          <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20">
                  Notification Center
                </span>
                {numUnread > 0 && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-white">
                    {numUnread} Unread
                  </span>
                )}
              </div>
              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
                Notifications
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Stay updated on brand booking requests, milestone approvals, releases, and reviews.
              </p>
            </div>

            {numUnread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 text-xs font-semibold tracking-wide transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <CheckIcon className="w-4 h-4" />
                <span>{markingAllRead ? "Marking all..." : "Mark all as read"}</span>
              </button>
            )}
          </div>

          {/* Filter Bar: Tabs & Categories */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border-theme pb-4">
            {/* All vs Unread Tabs */}
            <div className="inline-flex p-1 bg-surface-muted rounded-xl self-start">
              <button
                type="button"
                onClick={() => handleTabChange("all")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  readFilter === "all"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-text-secondary hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("unread")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  readFilter === "unread"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-text-secondary hover:text-foreground"
                }`}
              >
                <span>Unread</span>
                {numUnread > 0 && (
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                )}
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                    categoryFilter === cat.value
                      ? "bg-secondary text-white border-secondary"
                      : "bg-surface text-text-secondary border-border-theme hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Feed Content */}
          <div className="space-y-2">
            {actionError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 flex items-center justify-between gap-3">
                <p className="text-xs sm:text-sm font-semibold">{actionError}</p>
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  className="text-xs font-semibold text-text-secondary hover:text-foreground cursor-pointer shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {error && notifications.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <p className="text-xs sm:text-sm font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 text-xs font-semibold tracking-wide transition-all cursor-pointer shrink-0"
                >
                  Try again
                </button>
              </div>
            )}

            {loading && notifications.length === 0 ? (
              // Loading Skeleton State
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-surface border border-border-theme rounded-xl sm:rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 flex items-start gap-3"
                  >
                    <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-surface-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-surface-muted rounded w-1/3" />
                      <div className="h-3 bg-surface-muted rounded w-3/4" />
                      <div className="h-2.5 bg-surface-muted rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error && notifications.length === 0 ? (
              // Error Alert State
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-6 text-center space-y-2">
                <p className="text-xs sm:text-sm font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                >
                  Try loading again
                </button>
              </div>
            ) : displayedNotifications.length === 0 ? (
              // Empty State
              <div className="bg-surface border border-border-theme rounded-2xl py-16 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-text-secondary mb-3">
                  <BellIcon className="w-6 h-6 opacity-40" />
                </div>
                <h3 className="font-semibold text-base text-foreground">No notifications found</h3>
                <p className="text-xs text-text-secondary mt-1 max-w-sm">
                  {readFilter === "unread"
                    ? "You have marked all your notifications as read. Check the 'All' tab for past activity."
                    : categoryFilter !== "all"
                    ? `No notifications found under the '${categoryFilter}' category.`
                    : "When brands send you booking proposals or approve deliverables, updates will appear here."}
                </p>
              </div>
            ) : (
              // Notifications Card List
              displayedNotifications.map((item) => {
                const isUnread = !item.isRead;
                const hasValidDestination =
                  typeof item?.destination === "string" &&
                  item.destination.startsWith("/") &&
                  !item.destination.startsWith("//");

                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item)}
                    className={`group bg-surface border rounded-xl sm:rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isUnread
                        ? "border-secondary/30 bg-secondary/5 hover:border-secondary/60 hover:bg-secondary/10"
                        : "border-border-theme hover:border-border-theme hover:bg-surface-muted/50"
                    }`}
                  >
                    {/* Left: Icon + Content */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isUnread
                            ? "bg-secondary text-white shadow-xs"
                            : "bg-surface-muted text-text-secondary"
                        }`}
                      >
                        <NotificationTypeIcon entityType={item.entityType} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-sm tracking-tight truncate ${
                              isUnread ? "font-bold text-foreground" : "font-medium text-foreground"
                            }`}
                          >
                            {item.title}
                          </h3>

                          {/* Entity Type Badge */}
                          {item.entityType && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider bg-surface-muted text-text-secondary border border-border-theme">
                              {item.entityType}
                            </span>
                          )}

                          {/* Sender name badge if populated */}
                          {item.sender?.name && (
                            <span className="text-[10px] text-text-secondary font-medium">
                              from {item.sender.name}
                            </span>
                          )}

                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-text-secondary leading-normal">
                          {item.message}
                        </p>

                        <div className="text-[11px] text-text-secondary/80">
                          {formatTimeAgo(item.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:self-center shrink-0 border-t sm:border-t-0 border-border-theme/40 pt-1.5 sm:pt-0">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkSingleRead(e, item)}
                          disabled={markingIds.includes(item._id)}
                          title="Mark as read"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckIcon className="w-3.5 h-3.5" />
                          <span>{markingIds.includes(item._id) ? "Marking..." : "Mark read"}</span>
                        </button>
                      )}

                      {hasValidDestination && (
                        <span className="text-xs font-semibold text-secondary group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                          <span>View Details</span>
                          <span aria-hidden="true">→</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {pagination && totalPages > 1 && (
            <div className="bg-surface border border-border-theme rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-text-secondary">
                Showing page <strong className="text-foreground">{currentPage}</strong> of{" "}
                <strong className="text-foreground">{totalPages}</strong> ({totalItems} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevPage}
                  className="px-3.5 py-1.5 rounded-xl border border-border-theme text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-secondary text-white"
                          : "text-text-secondary hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!hasNextPage}
                  className="px-3.5 py-1.5 rounded-xl border border-border-theme text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
