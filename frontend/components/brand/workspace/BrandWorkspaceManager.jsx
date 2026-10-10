"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrandWorkspaces } from "@/redux/brand/workspace/workspace_slice";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";

// =========================================================
// SVG ICONS
// =========================================================
function WorkspaceIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function BriefcaseIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387M3.75 14.15a2.18 2.18 0 01-.75-1.661V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m4.5 8.006h4.5m-4.5 0a2.25 2.25 0 01-2.25-2.25v-.903c0-.496.186-.975.52-1.341l.228-.25a2.25 2.25 0 011.692-.756h3.64c.642 0 1.25.26 1.692.756l.228.25c.334.366.52.845.52 1.341v.903a2.25 2.25 0 01-2.25 2.25m-4.5 0h4.5M12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3z" />
    </svg>
  );
}

function ChatBubbleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008H8.625V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zM21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

// =========================================================
// HELPER UTILITIES & STATUS CONFIG
// =========================================================
const STATUS_TABS = [
  { id: "All", label: "All Workspaces" },
  { id: "in_progress", label: "In Progress" },
  { id: "submitted", label: "Submitted" },
  { id: "revision_requested", label: "Revision Requested" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const formatPrice = (amount, currency = "INR") => {
  if (typeof amount !== "number" || isNaN(amount)) return "N/A";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(amount)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "submitted":
      return {
        label: "Submitted",
        color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      };
    case "revision_requested":
      return {
        label: "Revision Requested",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-red-500/10 text-red-500 border-red-500/20",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Unknown",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
};

export default function BrandWorkspaceManager() {
  const dispatch = useDispatch();
  const { workspaces, pagination, loading, error } = useSelector(
    (state) => state.brandWorkspace
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch workspaces when page or status tab changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
    };
    if (activeTab !== "All") {
      params.status = activeTab;
    }
    dispatch(fetchBrandWorkspaces(params));
  }, [dispatch, currentPage, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    const params = {
      page: currentPage,
      limit: 10,
    };
    if (activeTab !== "All") {
      params.status = activeTab;
    }
    dispatch(fetchBrandWorkspaces(params));
  };

  const handlePageChange = (newPage) => {
    const totalPages = pagination?.totalPages || pagination?.pages || 1;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const totalPages = pagination?.totalPages || pagination?.pages || 1;
  const totalItems = pagination?.totalItems || pagination?.total || workspaces.length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/20">
                  <WorkspaceIcon className="w-5 h-5" />
                </span>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20">
                  Brand Workspace
                </span>
              </div>
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
                Collaboration Workspaces
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Monitor creator deliverables, review submitted content, and approve campaigns.
              </p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="border-b border-border-theme flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-secondary text-white shadow-xs"
                      : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <span>{typeof error === "string" ? error : "Failed to load brand workspaces."}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors cursor-pointer shrink-0"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && workspaces.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="bg-surface border border-border-theme rounded-2xl p-5 space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-surface-muted rounded-md w-2/3" />
                    <div className="h-5 bg-surface-muted rounded-full w-20" />
                  </div>
                  <div className="h-3 bg-surface-muted rounded-md w-1/2" />
                  <div className="h-16 bg-surface-muted rounded-xl" />
                  <div className="h-9 bg-surface-muted rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : !loading && workspaces.length === 0 ? (
            /* Empty State */
            <div className="bg-surface border border-border-theme rounded-2xl p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                <BriefcaseIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-lg text-foreground">
                  No workspaces found
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {activeTab !== "All"
                    ? `You currently have no active workspaces with status "${activeTab.replace(/_/g, " ")}".`
                    : "Once you accept a creator application for your campaign, the collaboration workspace will appear here."}
                </p>
              </div>
            </div>
          ) : (
            /* Workspace Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workspaces.map((ws) => {
                const badge = getStatusBadge(ws.status);
                const creatorName = ws.creator?.name || ws.creator?.email || "Creator Partner";
                const campaignTitle = ws.campaign?.title || "Campaign Workspace";
                const agreedPriceFormatted = formatPrice(ws.agreedPrice, ws.currency);
                const deadlineFormatted = formatDate(ws.deadline);
                const deliverables = Array.isArray(ws.deliverables) ? ws.deliverables : [];

                const bookingId =
                  typeof ws.booking === "object" && ws.booking !== null
                    ? ws.booking._id
                    : ws.booking;

                return (
                  <div
                    key={ws._id}
                    className="bg-surface border border-border-theme rounded-2xl p-5 hover:border-secondary/40 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div className="space-y-3">
                      {/* Card Header & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-semibold text-text-secondary block truncate">
                            Creator: {creatorName}
                          </span>
                          <h3 className="font-serif font-semibold text-base text-foreground line-clamp-1 mt-0.5">
                            {campaignTitle}
                          </h3>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Price & Deadline Metadata */}
                      <div className="grid grid-cols-2 gap-2 bg-surface-muted/60 p-3 rounded-xl border border-border-theme/50 text-xs">
                        <div>
                          <span className="text-[10px] text-text-secondary block">Agreed Price</span>
                          <span className="font-serif font-semibold text-foreground">
                            {agreedPriceFormatted}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-secondary block flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Deadline
                          </span>
                          <span className="font-medium text-foreground">
                            {deadlineFormatted}
                          </span>
                        </div>
                      </div>

                      {/* Deliverables Checklist Summary */}
                      {deliverables.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-foreground block">
                            Required Deliverables:
                          </span>
                          <div className="space-y-1">
                            {deliverables.slice(0, 3).map((item, idx) => {
                              const title = typeof item === "string" ? item : item?.title || "Deliverable";
                              return (
                                <div
                                  key={item?._id || idx}
                                  className="flex items-center gap-2 text-xs text-text-secondary"
                                >
                                  <div className="w-4 h-4 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                                    <CheckIcon className="w-3 h-3" />
                                  </div>
                                  <span className="line-clamp-1">{title}</span>
                                </div>
                              );
                            })}
                            {deliverables.length > 3 && (
                              <span className="text-[10px] text-text-secondary pl-6 block">
                                + {deliverables.length - 3} more deliverables
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Action */}
                    <div className="pt-2 border-t border-border-theme flex items-center gap-2">
                      <Link
                        href={`/brand/workspace/${ws._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        <span>Manage Workspace</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Link>
                      {bookingId && (
                        <Link
                          href={`/brand/messages?bookingId=${bookingId}`}
                          title="Message Creator"
                          className="p-2.5 rounded-xl bg-surface-muted hover:bg-secondary/15 text-text-secondary hover:text-secondary border border-border-theme transition-all cursor-pointer shrink-0"
                        >
                          <ChatBubbleIcon className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-theme pt-4 text-xs">
              <span className="text-text-secondary">
                Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> ({totalItems} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="p-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                        pageNum === currentPage
                          ? "bg-secondary text-white shadow-xs"
                          : "bg-surface hover:bg-surface-muted text-text-secondary border border-border-theme"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="p-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
