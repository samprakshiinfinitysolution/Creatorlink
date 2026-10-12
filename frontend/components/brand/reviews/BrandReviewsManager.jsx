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

function TagIcon({ className = "w-3.5 h-3.5" }) {
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
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.386a8.97 8.97 0 003.585-3.585c.486-.827.313-1.908-.386-2.607l-9.581-9.581A2.25 2.25 0 009.568 3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function BuildingOfficeIcon({ className = "w-3.5 h-3.5" }) {
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
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }) {
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
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

// =========================================================
// HELPER UTILITIES
// =========================================================
const formatPrice = (amount, currency = "INR") => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) return "N/A";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(numericAmount)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  // Identify eligible completed workspaces and filter out already-reviewed ones
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
    return completedWorkspaces.filter(
      (ws) => !reviewedWorkspaceIdSet.has(ws._id.toString())
    );
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
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Top Title Section & Action CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-wider">
                  Brand Creator Feedback
                </span>
              </div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground mt-1">
                Reviews & Creator Evaluations
              </h1>
              <p className="text-xs text-text-secondary mt-1">
                Manage performance reviews, star ratings, and testimonials submitted for completed campaign collaborations.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Write Review</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
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

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Total Reviews Submitted */}
            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Total Reviews Submitted
              </span>
              <span className="font-serif font-bold text-3xl text-foreground block pt-0.5">
                {totalReviewsCount}
              </span>
              <span className="text-[10px] text-text-secondary block">
                Completed collaboration evaluations
              </span>
            </div>

            {/* 2. Page Average Rating */}
            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Page Average Rating
              </span>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="font-serif font-bold text-3xl text-amber-400">
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
              <span className="text-[10px] text-text-secondary block">
                Average across reviews on this page
              </span>
            </div>

            {/* 3. 5-Star Share */}
            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Page 5-Star Share
              </span>
              <span className="font-serif font-bold text-3xl text-emerald-500 block pt-0.5">
                {reviews.length > 0 ? `${currentPageFiveStarPercentage}%` : "0%"}
              </span>
              <span className="text-[10px] text-text-secondary block">
                {reviews.filter((r) => Number(r.rating) === 5).length} top-tier ratings awarded
              </span>
            </div>
          </div>

          {/* Rating Filter Tabs */}
          <div className="bg-surface border border-border-theme rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {[
              { id: "all", label: "All Reviews" },
              { id: "5", label: "5 Stars Only" },
              { id: "4", label: "4 Stars Only" },
              { id: "3_below", label: "3 Stars & Below" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRatingFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  ratingFilter === tab.id
                    ? "bg-secondary text-white shadow-xs"
                    : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reviews Content Area */}
          {loading && reviews.length === 0 ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-surface-muted/60 rounded-2xl border border-border-theme/40"
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {filteredReviews.map((review) => {
                const creatorName =
                  typeof review.reviewee === "object" && review.reviewee !== null
                    ? review.reviewee.name
                    : "Creator Partner";
                const initials = getInitials(creatorName);
                const rawRating = Number(review.rating);
                const hasValidRating =
                  Number.isFinite(rawRating) && rawRating >= 1 && rawRating <= 5;
                const ratingNum = hasValidRating ? rawRating : null;

                const campaignTitle =
                  typeof review.campaign === "object" && review.campaign !== null
                    ? review.campaign.title
                    : "Campaign Workspace";

                const agreedPrice =
                  typeof review.workspace === "object" && review.workspace !== null
                    ? review.workspace.agreedPrice
                    : undefined;

                const currency =
                  typeof review.workspace === "object" && review.workspace !== null
                    ? review.workspace.currency
                    : "INR";

                const reviewDate = formatDate(review.createdAt);

                return (
                  <div
                    key={review._id}
                    className="bg-surface border border-border-theme rounded-2xl p-5 hover:border-secondary/40 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div className="space-y-3">
                      {/* Card Header: Creator info, Star rating, and Date */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Creator Avatar Initials */}
                          <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary font-semibold font-sans text-xs flex items-center justify-center border border-secondary/30 shrink-0 uppercase">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm text-foreground truncate">
                                {creatorName}
                              </h3>
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-surface-muted text-text-secondary border border-border-theme uppercase">
                                Creator
                              </span>
                            </div>
                            {reviewDate && reviewDate !== "N/A" && (
                              <span className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5">
                                <CalendarIcon className="w-3 h-3 text-text-secondary" />
                                {reviewDate}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20 shrink-0">
                          <span className="font-bold text-xs text-amber-500">
                            {hasValidRating ? ratingNum.toFixed(1) : "N/A"}
                          </span>
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className="w-3.5 h-3.5 text-amber-400"
                                filled={hasValidRating && star <= Math.round(ratingNum)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Campaign & Workspace Context Tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-muted text-text-secondary border border-border-theme text-[11px] font-medium">
                          <TagIcon className="w-3 h-3 text-text-secondary" />
                          <span className="truncate max-w-[220px]">{campaignTitle}</span>
                        </span>
                        {agreedPrice !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-muted text-text-secondary border border-border-theme text-[11px] font-medium">
                            <BuildingOfficeIcon className="w-3 h-3 text-text-secondary" />
                            <span>{formatPrice(agreedPrice, currency)}</span>
                          </span>
                        )}
                      </div>

                      {/* Qualitative Comment Quote */}
                      {review.comment && review.comment.trim() ? (
                        <div className="bg-surface-muted/60 p-3.5 rounded-xl border border-border-theme/60 text-xs text-foreground/90 leading-relaxed italic">
                          &ldquo;{review.comment}&rdquo;
                        </div>
                      ) : (
                        <div className="text-xs text-text-secondary italic">
                          No written feedback comment provided.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && totalPages > 1 && (
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
