"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppliedCampaigns } from "@/redux/creator/campaigns/campaigns_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

// =========================================================
// SVG ICONS
// =========================================================
function MegaphoneIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function CurrencyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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

// =========================================================
// HELPER UTILITIES & STATUS CONFIG
// =========================================================
const STATUS_TABS = [
  { id: "All", label: "All Campaigns" },
  { id: "pending", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
  { id: "cancelled", label: "Cancelled" },
];

const PLATFORM_LABELS = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  website: "Website",
};

const formatPlatform = (val) => {
  if (!val) return "General";
  return PLATFORM_LABELS[val.toLowerCase()] || val;
};

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
    case "pending":
      return {
        label: "Pending",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      };
    case "accepted":
      return {
        label: "Accepted",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      };
    case "in_progress":
      return {
        label: "Active (In Progress)",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-secondary/10 text-secondary border-secondary/30",
      };
    case "rejected":
      return {
        label: "Rejected",
        color: "bg-red-500/10 text-red-500 border-red-500/30",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
    default:
      return {
        label: status || "Unknown",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
};

const formatDeliverableItem = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    const text = item.title || item.name || item.type || item.deliverable || item.text || item.label || "";
    const count = item.count || item.quantity || item.amount;
    if (text && count) return `${count} ${text}`;
    if (text) return text;
  }
  return String(item);
};

export default function CreatorAppliedCampaignsManager() {
  const dispatch = useDispatch();
  const { appliedCampaigns, appliedPagination, loading, error } = useSelector(
    (state) => state.creatorCampaigns
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch applied campaigns on mount and when filters/page change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 9,
    };

    if (selectedStatus && selectedStatus !== "All") {
      params.status = selectedStatus;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    dispatch(fetchAppliedCampaigns(params));
  }, [dispatch, currentPage, selectedStatus, searchQuery]);

  const campaignsList = Array.isArray(appliedCampaigns) ? appliedCampaigns : [];

  const handleStatusChange = (statusId) => {
    setSelectedStatus(statusId);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    const params = {
      page: currentPage,
      limit: 9,
    };

    if (selectedStatus && selectedStatus !== "All") {
      params.status = selectedStatus;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    dispatch(fetchAppliedCampaigns(params));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* 1. PAGE HEADER BANNER */}
          <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20">
                  Collaborations
                </span>
                {appliedPagination?.totalItems !== undefined && (
                  <span className="text-xs font-semibold text-text-secondary">
                    • {appliedPagination.totalItems} Campaign{appliedPagination.totalItems !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
                My Campaigns
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                View and track your campaign applications, active bookings, and collaboration statuses.
              </p>
            </div>

            <Link
              href="/creator/campaigns/discover"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>Discover Campaigns</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 2. FILTER & SEARCH BAR */}
          <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs space-y-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {STATUS_TABS.map((tab) => {
                const isActive = selectedStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleStatusChange(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-secondary text-white font-semibold shadow-xs"
                        : "bg-surface-muted text-text-secondary hover:text-foreground hover:bg-surface-muted/80 border border-border-theme/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search applied campaigns by title, description, or category..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>

          {/* 3. ERROR BANNER */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-5 py-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span>{typeof error === "string" ? error : "Failed to load applied campaigns."}</span>
              </div>
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

          {/* 4. LOADING SKELETON STATE */}
          {loading && campaignsList.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs animate-pulse p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-surface-muted rounded-full w-24" />
                    <div className="h-5 bg-surface-muted rounded-full w-16" />
                  </div>
                  <div className="h-6 bg-surface-muted rounded-md w-3/4" />
                  <div className="h-4 bg-surface-muted rounded-md w-full" />
                  <div className="h-10 bg-surface-muted rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : campaignsList.length > 0 ? (
            /* 5. APPLIED CAMPAIGNS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaignsList.map((item) => {
                const bookingId = item._id || item.bookingId;
                const campaignObj = item.campaign || {};
                const brandObj = item.brand || {};
                const badge = getStatusBadge(item.status);
                const displayPrice = item.agreedPrice || campaignObj.budget;

                return (
                  <div
                    key={bookingId}
                    className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs hover:border-secondary/40 transition-all duration-200 flex flex-col justify-between p-6 group"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Category & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-wide truncate max-w-[140px]">
                          {campaignObj.category || "General"}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Title & Brand Name */}
                      <div>
                        <h2 className="font-serif font-medium text-xl text-foreground line-clamp-2 group-hover:text-secondary transition-colors">
                          {campaignObj.title || "Campaign"}
                        </h2>
                        {brandObj.name && (
                          <span className="text-xs text-text-secondary font-medium block mt-1">
                            by {brandObj.name}
                          </span>
                        )}
                      </div>

                      {/* Description / Application Proposal Message */}
                      <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                        {item.message || campaignObj.description || "No proposal message provided."}
                      </p>

                      {/* Agreed Price / Budget Banner */}
                      <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-theme flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                          <CurrencyIcon className="text-secondary shrink-0" />
                          <span className="font-medium">Agreed Price</span>
                        </div>
                        <span className="font-serif font-semibold text-lg text-foreground">
                          {formatPrice(displayPrice, item.currency || "INR")}
                        </span>
                      </div>

                      {/* Dates: Start Date & Deadline */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                        <div className="flex items-center gap-1.5 bg-surface-muted/30 p-2.5 rounded-xl border border-border-theme/50">
                          <CalendarIcon className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="truncate">Start: {formatDate(item.startDate || item.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-surface-muted/30 p-2.5 rounded-xl border border-border-theme/50">
                          <ClockIcon className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="truncate">Ends: {formatDate(item.deadline || campaignObj.deadline)}</span>
                        </div>
                      </div>

                      {/* Deliverables List */}
                      {Array.isArray(item.deliverables) && item.deliverables.length > 0 && (() => {
                        const validDeliverables = item.deliverables
                          .map(formatDeliverableItem)
                          .filter(Boolean);

                        if (validDeliverables.length === 0) return null;

                        return (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary block">
                              Deliverables ({validDeliverables.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {validDeliverables.map((itemText, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-muted text-foreground border border-border-theme/80"
                                >
                                  <CheckIcon className="text-emerald-500 shrink-0 w-3.5 h-3.5" />
                                  <span className="truncate max-w-[200px]">{itemText}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Card Footer: Platform Label */}
                    <div className="pt-4 mt-4 border-t border-border-theme flex items-center justify-between text-xs text-text-secondary">
                      <span>Platform: {formatPlatform(campaignObj.platform)}</span>
                      <span className="text-[10px] font-mono">ID: {bookingId ? String(bookingId).slice(-6) : ""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 6. EMPTY STATE */
            <div className="bg-surface border border-border-theme rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                <MegaphoneIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-medium text-xl text-foreground">
                  {selectedStatus === "All"
                    ? "No applied campaigns yet"
                    : `No ${selectedStatus} campaigns found`}
                </h3>
                <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                  {selectedStatus === "All"
                    ? "You have not applied to any campaigns yet. Explore the marketplace to find brand collaborations."
                    : `You currently have no campaign applications in ${selectedStatus} status.`}
                </p>
              </div>

              {selectedStatus === "All" && (
                <div className="pt-2">
                  <Link
                    href="/creator/campaigns/discover"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                  >
                    <span>Discover Campaigns</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 7. PAGINATION BAR */}
          {appliedPagination && appliedPagination.totalPages > 1 && (
            <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
              <div>
                Showing Page <span className="font-semibold text-foreground">{appliedPagination.page}</span> of{" "}
                <span className="font-semibold text-foreground">{appliedPagination.totalPages}</span> ({appliedPagination.totalItems} Total Applied Campaigns)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={appliedPagination.page <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon /> Previous
                </button>
                <button
                  type="button"
                  disabled={appliedPagination.page >= appliedPagination.totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, appliedPagination.totalPages))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
