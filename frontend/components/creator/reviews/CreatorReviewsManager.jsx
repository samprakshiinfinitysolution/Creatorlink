"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCreatorReviews,
  clearReviewsError,
} from "@/redux/creator/reviews/reviews_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

// =========================================================
// SVG ICONS
// =========================================================
function StarIcon({ className = "w-4 h-4", filled = true }) {
  return (
    <svg
      className={className}
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

function MessageSquareTextIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8m-8 4h5" />
    </svg>
  );
}

function BarChartIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 14v6M12 8v12M18 11v9" />
    </svg>
  );
}

function DocumentTextIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function CalendarIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

function FolderIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h3.379c.464 0 .91.184 1.238.513l1.414 1.414a1.5 1.5 0 001.06.44h6.909A2.25 2.25 0 0121.75 14.37v4.88a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 19.25v-6.5z"
      />
    </svg>
  );
}

function CashIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <rect x="2.5" y="6" width="19" height="12" rx="2" strokeWidth={1.75} />
      <circle cx="12" cy="12" r="2.75" strokeWidth={1.75} />
      <path strokeLinecap="round" d="M6 12h.01M18 12h.01" strokeWidth={2} />
    </svg>
  );
}

function QuoteIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function DotsHorizontalIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}

// =========================================================
// HELPER UTILITIES
// =========================================================
const formatPrice = (amount, currency = "INR") => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) return null;
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(numericAmount)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "N/A";
  }
};

const formatMonthYear = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    const year = d.getFullYear();
    return `${month} ${year}`;
  } catch {
    return "N/A";
  }
};

const getInitials = (name) => {
  if (name && typeof name === "string" && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  return "BP";
};

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function CreatorReviewsManager() {
  const dispatch = useDispatch();
  const { reviews, stats, pagination, loading, error } = useSelector(
    (state) => state.creatorReviews || {}
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    dispatch(fetchCreatorReviews({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handleRefresh = () => {
    dispatch(fetchCreatorReviews({ page: currentPage, limit: 10 }));
  };

  const handleFilterChange = (filter) => {
    setRatingFilter(filter);
  };

  // Safe client-side rating filtering if user clicks star filter tabs
  const filteredReviews = (reviews || []).filter((review) => {
    if (ratingFilter === "all") return true;
    return Number(review.rating) === Number(ratingFilter);
  });

  const totalReviewsCount = stats?.totalReviews ?? (pagination?.totalItems ?? (reviews?.length || 0));
  const avgRatingValue = Number(stats?.averageRating || 0);

  // Calculate 5-star percentage metric for current page
  const currentPageReviewCount = reviews?.length || 0;
  const currentPageFiveStarCount = (reviews || []).filter(
    (r) => Number(r.rating) === 5
  ).length;
  const currentPageFiveStarPercentage =
    currentPageReviewCount > 0
      ? Math.round((currentPageFiveStarCount / currentPageReviewCount) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Header Section */}
          <div className="relative overflow-hidden bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-6 sm:p-7 shadow-xs">
            {/* Subtle light background decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-10 overflow-hidden">
              <svg
                className="absolute -right-24 -top-16 w-[640px] h-[280px] text-neutral-200/70 dark:text-neutral-700"
                viewBox="0 0 640 280"
                fill="none"
              >
                <path
                  d="M0 120C160 30 320 220 480 110C540 70 590 90 640 120V280H0V120Z"
                  fill="currentColor"
                  fillOpacity="0.25"
                />
                <path
                  d="M80 180C220 80 380 230 540 140C580 115 615 125 640 140V280H80V180Z"
                  fill="currentColor"
                  fillOpacity="0.15"
                />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                {/* Verification Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-surface-muted border border-neutral-200/80 dark:border-border-theme text-xs font-semibold text-neutral-900 dark:text-white shadow-2xs">
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Verified Brand Feedback</span>
                </div>

                <h1 className="font-serif font-bold text-3xl sm:text-4xl text-neutral-950 dark:text-white tracking-tight">
                  Client Reviews &amp; Reputation
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
                  Trusted by top brands. Real feedback from completed collaborations.
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-3 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
                >
                  <RefreshIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>

                {totalReviewsCount > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className="w-3 h-3 text-amber-400 fill-amber-400"
                          filled={star <= Math.round(avgRatingValue || 5)}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-neutral-900 dark:text-white text-[11px]">
                      {avgRatingValue > 0 ? avgRatingValue.toFixed(1) : "5.0"} overall rating
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4">
              <span>{typeof error === "string" ? error : "Failed to load creator reviews."}</span>
              <button
                type="button"
                onClick={() => dispatch(clearReviewsError())}
                className="text-xs underline font-semibold cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Overall Average Rating */}
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xs flex items-center justify-between gap-3 sm:gap-4 min-h-[114px]">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 dark:bg-surface-muted text-neutral-950 dark:text-white flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-border-theme">
                  <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-950 dark:text-white" filled={false} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block truncate">
                    Overall Average Rating
                  </span>
                  <div className="flex items-center gap-2 h-8 sm:h-9">
                    <span className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral-950 dark:text-white tracking-tight leading-none">
                      {avgRatingValue > 0 ? avgRatingValue.toFixed(1) : "0.0"}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400"
                          filled={star <= Math.round(avgRatingValue)}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-text-secondary block truncate">
                    Based on all completed collaborations
                  </span>
                </div>
              </div>

              {/* Decorative mini bar graphic on right */}
              <div className="hidden xl:flex items-end gap-1 h-8 shrink-0 opacity-60" aria-hidden="true">
                <span className="w-1.5 h-3 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <span className="w-1.5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <span className="w-1.5 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <span className="w-1.5 h-9 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </div>
            </div>

            {/* 2. Total Received Reviews */}
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xs flex items-center justify-between gap-3 sm:gap-4 min-h-[114px]">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 dark:bg-surface-muted text-neutral-950 dark:text-white flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-border-theme">
                  <MessageSquareTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-950 dark:text-white" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block truncate">
                    Total Received Reviews
                  </span>
                  <div className="flex items-center h-8 sm:h-9">
                    <span className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral-950 dark:text-white tracking-tight leading-none">
                      {totalReviewsCount}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-secondary block truncate">
                    Verified brand client endorsements
                  </span>
                </div>
              </div>

              {/* Subtle document graphic on right */}
              <div className="hidden xl:flex w-9 h-9 rounded-full bg-neutral-50 dark:bg-surface-muted/60 text-neutral-400 dark:text-neutral-500 items-center justify-center shrink-0 border border-neutral-100 dark:border-border-theme/40" aria-hidden="true">
                <DocumentTextIcon className="w-4 h-4" />
              </div>
            </div>

            {/* 3. 5-Star Share */}
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xs flex items-center justify-between gap-3 sm:gap-4 min-h-[114px]">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 dark:bg-surface-muted text-neutral-950 dark:text-white flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-border-theme">
                  <BarChartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-950 dark:text-white" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block truncate">
                    5-Star Share
                  </span>
                  <div className="flex items-center h-8 sm:h-9">
                    <span className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral-950 dark:text-white tracking-tight leading-none">
                      {currentPageReviewCount > 0 ? `${currentPageFiveStarPercentage}%` : "0%"}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-secondary block truncate">
                    5-star reviews on current page
                  </span>
                </div>
              </div>

              {/* Circular gauge ring on right */}
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-100 dark:text-neutral-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-600 dark:text-emerald-500 transition-all duration-500 ease-out"
                    strokeDasharray={`${currentPageFiveStarPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-[11px] sm:text-xs text-neutral-950 dark:text-white">
                  {currentPageFiveStarPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Rating Filter Tabs */}
          <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-2 sm:p-2.5 shadow-xs flex items-center gap-2 sm:gap-2.5 overflow-x-auto custom-scrollbar">
            {[
              { id: "all", label: "All Reviews" },
              { id: "5", label: "5 Stars Only" },
              { id: "4", label: "4 Stars Only" },
              { id: "3", label: "3 Stars Only" },
            ].map((tab) => {
              const isActive = ratingFilter === tab.id;
             const count =
  tab.id === "all"
    ? totalReviewsCount
    : (reviews || []).filter(
        (review) => Number(review.rating) === Number(tab.id)
      ).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterChange(tab.id)}
                  className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                      : "bg-neutral-100/90 dark:bg-surface-muted text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200/70 hover:text-neutral-950 dark:hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums leading-none ${
                      isActive
                        ? "bg-neutral-700/70 text-white dark:bg-neutral-200 dark:text-neutral-950"
                        : "bg-white dark:bg-surface text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-border-theme shadow-2xs"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reviews Content Area */}
          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-surface-muted/60 rounded-2xl sm:rounded-3xl border border-border-theme/40"
                />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            /* Empty State */
            <div className="bg-surface border border-border-theme rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                <StarIcon className="w-7 h-7 text-secondary" filled={true} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-lg text-foreground">
                  No Client Reviews Found
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                  {ratingFilter === "all"
                    ? "You haven't received any client reviews yet. Once brands complete collaboration workspaces with you and submit their ratings, reviews will appear here."
                    : `No reviews match the ${ratingFilter}-star filter.`}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/creator/workspace"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span>View Active Workspaces</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Reviews Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredReviews.map((review) => {
                const brandName = review.reviewer?.name || "Brand Partner";
                const initials = getInitials(brandName);
                const rawRating = Number(review.rating);
                const hasValidRating =
                  Number.isFinite(rawRating) && rawRating >= 1 && rawRating <= 5;
                const ratingNum = hasValidRating ? rawRating : null;
                const campaignTitle = review.campaign?.title || "Collaboration Campaign";
                const agreedPriceFormatted = formatPrice(
                  review.workspace?.agreedPrice,
                  review.workspace?.currency
                );
                const reviewDate = formatDate(review.createdAt);
                const monthYearDate = formatMonthYear(
                  review.workspace?.createdAt || review.createdAt
                );

                const coverImage =
                  review.campaign?.coverImage ||
                  review.campaign?.image ||
                  review.workspace?.coverImage ||
                  review.coverImage ||
                  null;

                const brandAvatar =
                  review.reviewer?.avatar ||
                  review.reviewer?.profileImage ||
                  review.reviewer?.logo ||
                  null;

                const isVerified = Boolean(
                  review.reviewer?.isVerified ||
                  review.reviewer?.verified ||
                  review.brand?.isVerified
                );

                const targetWorkspaceId =
                  review.workspace?._id ||
                  (typeof review.workspace === "string" ? review.workspace : null);
                const workspaceHref = targetWorkspaceId
                  ? `/creator/workspace/${targetWorkspaceId}`
                  : "/creator/workspace";

                return (
                  <div
                    key={review._id}
                    className="bg-white dark:bg-surface border border-neutral-200/90 dark:border-border-theme rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200"
                  >
                    <div className="space-y-3.5">
                      {/* Top Cover-Image Banner */}
                      <div className="h-28 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden relative border border-neutral-200/70 dark:border-border-theme/40 bg-pink-50 dark:bg-surface-muted group/banner">
                        {coverImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={coverImage}
                            alt={campaignTitle}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/banner:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950/20 dark:via-rose-950/15 dark:to-surface flex items-center justify-between px-4 sm:px-5 relative overflow-hidden">
                            {/* Ambient Graphic in Fallback Banner */}
                            <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-pink-200/40 dark:bg-pink-500/10 blur-xl pointer-events-none" />
                            <div className="min-w-0 pr-8">
                              <span className="font-heading font-black tracking-widest text-base sm:text-lg text-neutral-900 dark:text-neutral-100 uppercase truncate block">
                                {brandName}
                              </span>
                              <span className="text-[10px] text-neutral-600 dark:text-neutral-400 tracking-wider font-sans uppercase mt-0.5 block truncate">
                                {campaignTitle}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Top-Right Open/External Link Icon */}
                        <Link
                          href={workspaceHref}
                          title="Open workspace"
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/45 hover:bg-black/75 backdrop-blur-xs text-white/90 hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer z-10"
                        >
                          <ExternalLinkIcon className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Brand Info & Rating Row */}
                      <div className="flex items-center justify-between gap-2.5 pt-0.5">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Brand Avatar */}
                          {brandAvatar ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={brandAvatar}
                              alt={brandName}
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-950 dark:bg-neutral-800 text-white font-sans font-bold text-xs sm:text-sm flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-2xs uppercase tracking-wider">
                              {initials}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                                {brandName}
                              </h3>
                              {isVerified && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 leading-none">
                                  <CheckCircleIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <span>Verified</span>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                              <CalendarIcon className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" />
                              <span>{reviewDate}</span>
                            </span>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 sm:py-1.5 rounded-xl border border-amber-200/70 dark:border-amber-800/50 shrink-0">
                          <span className="font-bold text-xs sm:text-sm text-amber-700 dark:text-amber-400 tabular-nums">
                            {hasValidRating ? ratingNum.toFixed(1) : "N/A"}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-400 dark:text-amber-300">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 dark:text-amber-300"
                                filled={hasValidRating && star <= Math.round(ratingNum)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Quotation Panel with Review Comment */}
                      <div className="bg-neutral-50/90 dark:bg-surface-muted/50 border border-neutral-200/60 dark:border-border-theme/60 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-start gap-2.5">
                        <QuoteIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300 italic line-clamp-3">
                          {review.comment ? `“${review.comment}”` : "“No written review provided.”"}
                        </p>
                      </div>

                      {/* Compact Metadata Row */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {/* Campaign Name */}
                        <div
                          title={campaignTitle}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200/70 dark:border-border-theme/70 bg-neutral-50/80 dark:bg-surface-muted/40 text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-2xs"
                        >
                          <FolderIcon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[130px] sm:max-w-[150px]">
                            {campaignTitle}
                          </span>
                        </div>

                        {/* Agreed Price / Currency */}
                        {agreedPriceFormatted && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200/70 dark:border-border-theme/70 bg-neutral-50/80 dark:bg-surface-muted/40 text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-2xs">
                            <CashIcon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                            <span>{agreedPriceFormatted}</span>
                          </div>
                        )}

                        {/* Relevant Date (Month & Year) */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200/70 dark:border-border-theme/70 bg-neutral-50/80 dark:bg-surface-muted/40 text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-2xs">
                          <CalendarIcon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                          <span>{monthYearDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row: View workspace & 3-dot menu */}
                    <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-border-theme/60 flex items-center justify-between relative">
                      <Link
                        href={workspaceHref}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors group/link"
                      >
                        <span>View workspace</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-900 dark:text-white transition-transform group-hover/link:translate-x-1" />
                      </Link>

                      {/* Three-Dot Menu Button with functional dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          aria-label="Review actions"
                          aria-haspopup="true"
                          aria-expanded={activeMenuId === review._id}
                          onClick={() =>
                            setActiveMenuId((prev) => (prev === review._id ? null : review._id))
                          }
                          className="w-8 h-8 rounded-xl border border-neutral-200/80 dark:border-border-theme bg-white dark:bg-surface hover:bg-neutral-100 dark:hover:bg-surface-muted text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        >
                          <DotsHorizontalIcon className="w-4 h-4" />
                        </button>

                        {activeMenuId === review._id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 bottom-10 w-44 bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl shadow-lg p-1.5 z-30 font-sans text-xs space-y-0.5 animate-in fade-in duration-150">
                              <Link
                                href={workspaceHref}
                                onClick={() => setActiveMenuId(null)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-surface-muted transition-colors text-left cursor-pointer"
                              >
                                <FolderIcon className="w-3.5 h-3.5 text-neutral-400" />
                                <span>Open Workspace</span>
                              </Link>
                              {review.comment && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                                      navigator.clipboard.writeText(review.comment);
                                    }
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-surface-muted transition-colors text-left cursor-pointer"
                                >
                                  <DocumentTextIcon className="w-3.5 h-3.5 text-neutral-400" />
                                  <span>Copy Review</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-surface border border-border-theme rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary shadow-xs">
              <span>
                Showing page <strong className="text-foreground">{pagination.page}</strong> of{" "}
                <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.totalItems} total reviews)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
