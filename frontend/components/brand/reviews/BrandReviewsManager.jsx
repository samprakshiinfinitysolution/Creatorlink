"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandReviews,
  clearReviewError,
  clearReviewSuccess,
} from "@/redux/brand/reviews/reviews_slice";
import { fetchBrandWorkspaces } from "@/redux/brand/workspace/workspace_slice";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandSubmitReviewModal from "./BrandSubmitReviewModal";

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

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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
  return "CR";
};

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function BrandReviewsManager() {
  const dispatch = useDispatch();

  // Reviews slice state
  const { reviews, pagination, loading, error, successMessage } =
    useSelector((state) => state.brandReviews || {});

  // Workspace slice state (for selecting completed collaborations)
  const { workspaces, loading: workspacesLoading } = useSelector(
    (state) => state.brandWorkspace || {}
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("all");

  // "Write Review" Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [failedCoverUrls, setFailedCoverUrls] = useState({});

  // Fetch reviews on mount or page change
  useEffect(() => {
    dispatch(fetchBrandReviews({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  // When modal is opened, fetch workspaces to get completed collaborations
  useEffect(() => {
    if (isModalOpen) {
      dispatch(fetchBrandWorkspaces({ status: "completed", limit: 50 }));
    }
  }, [dispatch, isModalOpen]);

  // Identify eligible completed workspaces and filter out already-reviewed ones across pagination
  const completedWorkspaces = useMemo(() => {
    return (workspaces || []).filter((ws) => ws.status === "completed");
  }, [workspaces]);

  const reviewedWorkspaceIdSet = useMemo(() => {
    const set = new Set();
    (reviews || []).forEach((rev) => {
      const wsId =
        typeof rev.workspace === "object" && rev.workspace !== null
          ? rev.workspace._id
          : rev.workspace;
      if (wsId) set.add(wsId.toString());
    });
    return set;
  }, [reviews]);

  const unreviewedCompletedWorkspaces = useMemo(() => {
    return completedWorkspaces.filter((ws) => {
      // Backend getBrandWorkspacesService reliably attaches ws.review across pagination
      if (ws.review) return false;
      const wsId = ws._id ? ws._id.toString() : "";
      if (reviewedWorkspaceIdSet.has(wsId)) return false;
      return true;
    });
  }, [completedWorkspaces, reviewedWorkspaceIdSet]);

  const handleRefresh = () => {
    dispatch(fetchBrandReviews({ page: currentPage, limit: 10 }));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Safe client-side rating filter
  const filteredReviews = useMemo(() => {
    return (reviews || []).filter((review) => {
      if (ratingFilter === "all") return true;
      if (ratingFilter === "3_below") return Number(review.rating) <= 3;
      return Number(review.rating) === Number(ratingFilter);
    });
  }, [reviews, ratingFilter]);

  // Derived metrics
  const totalReviewsCount = pagination?.totalItems ?? (reviews?.length || 0);

  const averageRatingGiven = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const currentPageFiveStarPercentage = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const fiveStarCount = reviews.filter((r) => Number(r.rating) === 5).length;
    return Math.round((fiveStarCount / reviews.length) * 100);
  }, [reviews]);

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto min-w-0">
          {/* Header Section */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              {/* Verification Badge */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-[11px] tracking-wider uppercase text-[#ff2d6c] dark:text-[#ff4f87] font-sans">
                  Submitted Creator Evaluations
                </span>
              </div>

              <h1 className="font-serif font-medium text-3xl sm:text-4xl text-neutral-950 dark:text-white tracking-tight">
                Reviews And Creator Evaluations
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
                Manage performance reviews, star ratings, and feedback submitted for completed campaign collaborations.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-3 self-start md:self-auto shrink-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
                >
                  <RefreshIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer dark:bg-white dark:text-black dark:hover:bg-neutral-100"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Write Review</span>
                </button>
              </div>

              {totalReviewsCount > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className="w-3 h-3 text-amber-400 fill-amber-400"
                        filled={star <= Math.round(Number(averageRatingGiven) || 5)}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-white text-[11px]">
                    {Number(averageRatingGiven) > 0 ? averageRatingGiven : "0.0"} average rating (current page)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => dispatch(clearReviewSuccess())}
                className="text-xs underline font-semibold cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <span>{typeof error === "string" ? error : "An error occurred while loading reviews."}</span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="text-xs underline font-semibold cursor-pointer"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(clearReviewError())}
                  className="text-xs underline font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Average Rating */}
            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Average Rating (Current Page)
              </span>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="font-sans font-semibold text-[22px] sm:text-[28px] text-amber-500 tracking-tight">
                  {Number(averageRatingGiven) > 0 ? averageRatingGiven : "0.0"}
                </span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className="w-4 h-4 text-amber-400"
                      filled={star <= Math.round(Number(averageRatingGiven))}
                    />
                  ))}
                </div>
              </div>

              {/* Decorative mini bar graphic on right */}
              <div className="hidden xl:flex items-end gap-1 h-8 shrink-0 opacity-60" aria-hidden="true">
                <span className="w-1.5 h-3 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <span className="w-1.5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <span className="w-1.5 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <span className="w-1.5 h-9 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </div>
              <span className="text-[10px] text-text-secondary block">
                Average across reviews on this page
              </span>
            </div>

            {/* 2. Total Reviews Submitted */}
            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Total Reviews Submitted
              </span>
              <span className="font-sans font-semibold text-[22px] sm:text-[28px] text-foreground tracking-tight block pt-0.5">
                {totalReviewsCount}
              </span>
              <span className="text-[10px] text-text-secondary block">
                Completed collaboration evaluations
              </span>
            </div>

            {/* 3. Page 5-Star Share */}
            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Page 5-Star Share
              </span>
              <span className="font-sans font-semibold text-[22px] sm:text-[28px] text-emerald-500 tracking-tight block pt-0.5">
                {reviews.length > 0 ? `${currentPageFiveStarPercentage}%` : "0%"}
              </span>
              <span className="text-[10px] text-text-secondary block">
                {reviews.filter((r) => Number(r.rating) === 5).length} top-tier ratings awarded
              </span>
            </div>
          </div>

          {/* Rating Filter Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-text-secondary px-1">
              <span className="text-[11px] font-medium text-text-secondary">
                Filter reviews on current page:
              </span>
              <span className="text-[10px] text-text-secondary">
                Showing {filteredReviews.length} of {reviews.length} reviews on page
              </span>
            </div>
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-2 sm:p-2.5 shadow-xs flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-3">
              {[
                { id: "all", label: "All (Current Page)" },
                { id: "5", label: "5 Stars Only" },
                { id: "4", label: "4 Stars Only" },
                { id: "3_below", label: "3 Stars & Below" },
              ].map((tab) => {
                const isActive = ratingFilter === tab.id;
                const count =
                  tab.id === "all"
                    ? (reviews || []).length
                    : tab.id === "3_below"
                      ? (reviews || []).filter((r) => Number(r.rating) <= 3).length
                      : (reviews || []).filter((r) => Number(r.rating) === Number(tab.id)).length;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRatingFilter(tab.id)}
                    className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${isActive
                        ? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                        : "bg-neutral-100/90 dark:bg-surface-muted text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200/70 hover:text-neutral-950 dark:hover:text-white"
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums leading-none ${isActive
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
          </div>

          {/* Reviews Content Area */}
          {loading && reviews.length === 0 ? (
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
              <div className="w-14 h-14 rounded-2xl bg-surface-muted text-foreground flex items-center justify-center mx-auto border border-border-theme">
                <StarIcon className="w-7 h-7 text-amber-500" filled={true} />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-semibold text-lg text-foreground tracking-tight">
                  No Submitted Reviews Found
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                  {ratingFilter === "all"
                    ? "You haven't submitted any creator reviews yet. You can leave a review once all deliverables in a workspace are approved and the collaboration is completed."
                    : `No submitted reviews match the selected filter.`}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer dark:bg-white dark:text-black dark:hover:bg-neutral-100"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Write a Review</span>
                </button>
                <Link
                  href="/brand/workspace"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>View Completed Workspaces</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Reviews Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredReviews.map((review) => {
                const creatorName =
                  typeof review.reviewee === "object" && review.reviewee !== null
                    ? (review.reviewee.name || "Creator Partner")
                    : "Creator Partner";
                const initials = getInitials(creatorName);
                const rawRating = Number(review.rating);
                const hasValidRating =
                  Number.isFinite(rawRating) && rawRating >= 1 && rawRating <= 5;
                const ratingNum = hasValidRating ? rawRating : null;

                const campaignTitle =
                  typeof review.campaign === "object" && review.campaign !== null
                    ? (review.campaign.title || "Campaign Collaboration")
                    : "Campaign Collaboration";

                const coverImage =
                  review.campaign?.coverImage ||
                  review.campaign?.image ||
                  review.workspace?.coverImage ||
                  review.coverImage ||
                  null;

                const creatorAvatar =
                  review.reviewee?.avatar ||
                  review.reviewee?.profileImage ||
                  review.reviewee?.image ||
                  null;

                const agreedPriceFormatted = formatPrice(
                  review.workspace?.agreedPrice,
                  review.workspace?.currency
                );

                const reviewDate = formatDate(review.createdAt);
                const monthYearDate = formatMonthYear(
                  review.workspace?.createdAt || review.createdAt
                );

                const targetWorkspaceId =
                  review.workspace?._id ||
                  (typeof review.workspace === "string" ? review.workspace : null);

                const workspaceHref = targetWorkspaceId
                  ? `/brand/workspace/${targetWorkspaceId}`
                  : "/brand/workspace";

                return (
                  <div
                    key={review._id}
                    className="bg-white dark:bg-surface border border-neutral-200/90 dark:border-border-theme rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200"
                  >
                    <div className="space-y-3.5">
                      {/* Top Cover-Image Banner */}
                      <div className="h-28 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden relative border border-neutral-200/70 dark:border-border-theme/40 bg-neutral-100 dark:bg-surface-muted group/banner">
                        {coverImage && !failedCoverUrls[review._id] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={coverImage}
                            alt={campaignTitle}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/banner:scale-105"
                            onError={() =>
                              setFailedCoverUrls((prev) => ({
                                ...prev,
                                [review._id]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200 dark:from-neutral-900/60 dark:via-neutral-800/40 dark:to-surface flex items-center justify-between px-4 sm:px-5 relative overflow-hidden">
                            <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-neutral-300/30 dark:bg-white/5 blur-xl pointer-events-none" />
                            <div className="min-w-0 pr-8">
                              <span className="font-serif font-bold tracking-wider text-base sm:text-lg text-neutral-900 dark:text-neutral-100 uppercase truncate block">
                                {creatorName}
                              </span>
                              <span className="text-[10px] text-neutral-600 dark:text-neutral-400 tracking-wider font-sans uppercase mt-0.5 block truncate">
                                {campaignTitle}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Top-Right Open/External Link Icon */}
                        {targetWorkspaceId && (
                          <Link
                            href={workspaceHref}
                            title="Open workspace"
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/45 hover:bg-black/75 backdrop-blur-xs text-white/90 hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer z-10"
                          >
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>

                      {/* Creator Info & Rating Row */}
                      <div className="flex items-center justify-between gap-2.5 pt-0.5">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Creator Avatar */}
                          {creatorAvatar ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={creatorAvatar}
                              alt={creatorName}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                                if (fallback) fallback.classList.remove("hidden");
                              }}
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-2xs"
                            />
                          ) : null}
                          <div
                            className={`avatar-fallback w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-950 dark:bg-neutral-800 text-white font-sans font-bold text-xs sm:text-sm flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-2xs uppercase tracking-wider ${creatorAvatar ? "hidden" : ""
                              }`}
                          >
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                                {creatorName}
                              </h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-surface-muted text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-border-theme uppercase leading-none">
                                Creator
                              </span>
                            </div>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                              <CalendarIcon className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" />
                              <span>{reviewDate}</span>
                            </span>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1.5 bg-transparent px-2.5 py-1 sm:py-1.5 rounded-xl border border-amber-500/30 dark:border-amber-500/30 shrink-0">
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
                          {review.comment && review.comment.trim() ? `“${review.comment}”` : "“No written feedback comment provided.”"}
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

                    {/* Bottom Action Row: View workspace link */}
                    <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-border-theme/60 flex items-center justify-between relative">
                      <Link
                        href={workspaceHref}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors group/link"
                      >
                        <span>View workspace</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-900 dark:text-white transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && (totalPages > 1 || totalReviewsCount > 0) && (
            <div className="bg-surface border border-border-theme rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary shadow-xs">
              <span>
                Showing page <strong className="text-foreground">{pagination.page || currentPage}</strong> of{" "}
                <strong className="text-foreground">{totalPages}</strong> ({totalReviewsCount} total reviews)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Reusable Creator Rating & Review Modal */}
      <BrandSubmitReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaces={unreviewedCompletedWorkspaces}
        workspacesLoading={workspacesLoading}
        onSuccess={() => {
          if (currentPage === 1) {
            dispatch(fetchBrandReviews({ page: 1, limit: 10 }));
          } else {
            setCurrentPage(1);
          }
        }}
      />
    </div>
  );
}
