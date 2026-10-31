"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import CreatorBookingDetailModal from "./CreatorBookingDetailModal";
import {
  fetchCreatorBookings,
  updateCreatorBookingStatus,
  cancelCreatorBooking,
  clearSuccessMessage,
} from "@/redux/creator/bookings/bookings_slice";

// =========================================================
// HELPER FORMATTERS & BADGES
// =========================================================
function formatCurrency(amount, currency = "INR") {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "₹0";
  const currCode = (currency || "INR").toUpperCase();
  if (currCode === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currCode,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getBrandInitials(name) {
  if (!name || typeof name !== "string") return "B";
  const trimmed = name.trim();
  if (!trimmed) return "B";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return trimmed[0].toUpperCase();
}

function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        label: "Pending",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "accepted":
      return {
        label: "Accepted",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "rejected":
      return {
        label: "Rejected",
        color: "bg-red-500/10 text-red-500 border-red-500/20",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Unknown",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
}

// =========================================================
// SVG ICONS
// =========================================================
function BookingsIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.573 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ArrowPathIcon({ className = "w-4 h-4" }) {
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

function WorkspaceIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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

function CheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

// =========================================================
// CONFIGURATIONS
// =========================================================
const STATUS_OPTIONS = [
  { value: "", label: "All Bookings" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const ORIGIN_OPTIONS = [
  { value: "all", label: "All Sources" },
  { value: "brand", label: "Direct Proposals" },
  { value: "creator", label: "Applications" },
];

// =========================================================
// MAIN MANAGER COMPONENT
// =========================================================
export default function CreatorBookingsManager() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Detail Modal State
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickProcessingId, setQuickProcessingId] = useState(null);
  const [localMessage, setLocalMessage] = useState(null);

  const dispatch = useDispatch();

  const { bookings, pagination, loading, error, successMessage } = useSelector(
    (state) => state.creatorBookings || {}
  );

  // Fetch bookings helper
  const fetchList = useCallback(
    (overrides = {}) => {
      const targetPage = overrides.page !== undefined ? overrides.page : page;
      const targetStatus = overrides.status !== undefined ? overrides.status : statusFilter;

      const params = {
        page: targetPage,
        limit: 10,
      };

      if (targetStatus) {
        params.status = targetStatus;
      }

      dispatch(fetchCreatorBookings(params));
    },
    [dispatch, page, statusFilter]
  );

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchCreatorBookings({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Clear global success toast message after 4s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
    fetchList({ status: newStatus, page: 1 });
  };

  const handlePageChange = (newPage) => {
    const totalPagesCount = pagination?.totalPages || pagination?.pages || 1;
    if (newPage < 1 || newPage > totalPagesCount) return;
    setPage(newPage);
    fetchList({ page: newPage });
  };

  const handleRetry = () => {
    fetchList();
  };

  // Quick Accept / Reject from table
  const handleQuickStatusUpdate = async (bookingId, targetStatus) => {
    if (!bookingId || quickProcessingId) return;
    setQuickProcessingId(bookingId);
    setLocalMessage(null);

    const result = await dispatch(
      updateCreatorBookingStatus({
        bookingId,
        status: targetStatus,
      })
    );

    setQuickProcessingId(null);

    if (updateCreatorBookingStatus.fulfilled.match(result)) {
      setLocalMessage({
        type: "success",
        text: targetStatus === "accepted"
          ? "Proposal accepted! Workspace initialized."
          : "Proposal declined.",
      });
    } else {
      setLocalMessage({
        type: "error",
        text: typeof result.payload === "string" ? result.payload : "Status update failed.",
      });
    }
  };

  // Quick Cancel / Withdraw application from table
  const handleQuickCancel = async (bookingId) => {
    if (!bookingId || quickProcessingId) return;
    setQuickProcessingId(bookingId);
    setLocalMessage(null);

    const result = await dispatch(cancelCreatorBooking(bookingId));
    setQuickProcessingId(null);

    if (cancelCreatorBooking.fulfilled.match(result)) {
      setLocalMessage({
        type: "success",
        text: "Application withdrawn successfully.",
      });
    } else {
      setLocalMessage({
        type: "error",
        text: typeof result.payload === "string" ? result.payload : "Cancellation failed.",
      });
    }
  };

  // Filter list client-side by origin and search query
  const filteredBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];

    return bookings.filter((b) => {
      // Origin filter
      if (originFilter === "brand" && b.initiatedBy !== "brand") return false;
      if (originFilter === "creator" && b.initiatedBy === "brand") return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const brandName = (b.brand?.name || "").toLowerCase();
        const brandEmail = (b.brand?.email || "").toLowerCase();
        const campaignTitle = (b.campaign?.title || "").toLowerCase();
        const serviceTitle = (b.service?.title || "").toLowerCase();
        const category = (b.campaign?.category || "").toLowerCase();

        return (
          brandName.includes(query) ||
          brandEmail.includes(query) ||
          campaignTitle.includes(query) ||
          serviceTitle.includes(query) ||
          category.includes(query)
        );
      }

      return true;
    });
  }, [bookings, originFilter, searchQuery]);

  const currentPage = pagination?.page || page;
  const totalPages = pagination?.totalPages || pagination?.pages || 1;
  const totalItems = pagination?.totalItems ?? pagination?.total ?? bookings.length;
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const getEmptyStateMessage = () => {
    if (searchQuery.trim()) {
      return `No bookings matching "${searchQuery}".`;
    }
    switch (statusFilter) {
      case "pending":
        return "No pending booking requests or proposals.";
      case "accepted":
        return "No accepted bookings.";
      case "in_progress":
        return "No in-progress collaborations.";
      case "completed":
        return "No completed collaborations.";
      case "rejected":
        return "No rejected proposals.";
      case "cancelled":
        return "No cancelled applications.";
      default:
        return "No collaboration bookings found.";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl w-full mx-auto min-w-0">
          {/* Page Hero Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-100/80 dark:bg-gradient-to-br dark:from-surface dark:via-surface dark:to-pink-950/20 border border-pink-200/80 dark:border-pink-900/40 rounded-3xl p-6 sm:p-7 lg:p-8 shadow-[0_4px_24px_rgba(255,45,108,0.06)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 transition-colors">
            <div className="relative z-10 max-w-xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[11px] tracking-wider uppercase text-[#ff2d6c] font-sans">
                  COLLABORATION MANAGEMENT
                </span>
                {totalItems > 0 && (
                  <span className="text-xs font-semibold text-text-secondary">
                    • {totalItems} Total Booking{totalItems !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
                Bookings & Proposals
              </h1>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Track your campaign applications, review brand direct hire proposals, and manage collaboration milestones.
              </p>
            </div>

            <div className="relative z-10 shrink-0 flex items-center gap-2.5">
              <Link
                href="/creator/campaigns/discover"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#ff2d6c] text-white font-semibold text-xs hover:bg-[#e0205c] transition-all shadow-xs cursor-pointer"
              >
                <span>Discover Campaigns</span>
              </Link>
            </div>
          </div>

          {/* Toast / Local Feedback Alert */}
          {(successMessage || localMessage) && (
            <div
              className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 shadow-xs transition-all ${
                (localMessage?.type === "error")
                  ? "bg-red-500/10 border border-red-500/20 text-red-500"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 shrink-0" />
                <span>{localMessage?.text || successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocalMessage(null);
                  dispatch(clearSuccessMessage());
                }}
                className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Filter Toolbar */}
          <div className="bg-surface border border-border-theme rounded-3xl p-4 shadow-xs space-y-3.5">
            {/* Top Row: Search and Origin Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by brand, campaign, or service..."
                  className="w-full pl-9 pr-4 py-2 bg-surface-muted/50 border border-border-theme rounded-2xl text-xs sm:text-sm text-foreground placeholder:text-text-secondary/60 focus:outline-none focus:border-[#ff2d6c] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Origin / Source Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Source:
                </span>
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  className="bg-surface-muted/50 border border-border-theme text-foreground text-xs sm:text-sm rounded-2xl px-3.5 py-2 focus:outline-none focus:border-[#ff2d6c] transition-colors cursor-pointer"
                >
                  {ORIGIN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom Row: Status Filter Tabs */}
            <div className="pt-2 border-t border-border-theme flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0">
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = statusFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleStatusFilterChange(opt.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-[#ff2d6c] text-white font-semibold shadow-xs"
                          : "bg-surface-muted/60 text-text-secondary hover:text-foreground hover:bg-surface-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl p-4 text-xs font-sans flex items-center justify-between gap-4">
              <span>{typeof error === "string" ? error : "Failed to load bookings. Please try again."}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Bookings Container */}
          <div className="bg-surface border border-border-theme rounded-3xl shadow-xs overflow-hidden min-w-0">
            {/* Loading Skeletons */}
            {loading && (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-surface-muted rounded-2xl animate-pulse w-full" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredBookings.length === 0 && (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-pink-500/10 text-[#ff2d6c] flex items-center justify-center">
                  <BookingsIcon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-medium text-lg text-foreground">
                  {getEmptyStateMessage()}
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {statusFilter || originFilter !== "all" || searchQuery
                    ? "Try adjusting your filters or search terms to see other booking proposals."
                    : "When brands send you direct collaboration proposals or you apply to campaigns, they will be tracked here."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/creator/campaigns/discover"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-xs font-semibold text-foreground transition-colors"
                  >
                    <span>Discover Open Campaigns</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Booking List Table */}
            {!loading && !error && filteredBookings.length > 0 && (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-theme bg-surface-muted/40 text-text-secondary uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3.5 px-5">Brand Client</th>
                      <th className="py-3.5 px-4">Campaign Title</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Agreed Price</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {filteredBookings.map((booking) => {
                      const brandName =
                        booking.brand?.name ||
                        booking.brand?.displayName ||
                        booking.brand?.email ||
                        "Brand Client";

                      const brandEmail = booking.brand?.email || "N/A";
                      const brandInitials = getBrandInitials(brandName);

                      const campaignTitle = booking.campaign?.title || "Campaign Collaboration";
                      const category = booking.campaign?.category || "General";
                      const platform =
                        booking.campaign?.platform ||
                        booking.service?.platform ||
                        "General";

                      const serviceTitle =
                        booking.service?.title || booking.serviceTitle || "Service Package";

                      const agreedPrice = booking.agreedPrice;
                      const currency = booking.currency || "INR";
                      const badge = getStatusBadge(booking.status);

                      const isBrandProposal = booking.initiatedBy === "brand";
                      const isPending = booking.status === "pending";
                      const isAcceptedOrActive =
                        booking.status === "accepted" || booking.status === "in_progress";

                      const isThisProcessing = quickProcessingId === booking._id;

                      return (
                        <tr
                          key={booking._id}
                          className="hover:bg-surface-muted/30 transition-colors"
                        >
                          {/* Brand Info */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center font-sans font-semibold text-xs sm:text-sm shrink-0 shadow-2xs">
                                {brandInitials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-foreground text-sm font-sans truncate">
                                  {brandName}
                                </div>
                                <div className="text-[11px] text-text-secondary mt-0.5 truncate">
                                  {brandEmail}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Campaign Title & Platform */}
                          <td className="py-4 px-4">
                            <div className="font-medium text-foreground text-xs sm:text-sm font-sans">
                              {campaignTitle}
                            </div>
                            <div className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-1.5 capitalize">
                              <span>{category}</span>
                              <span>•</span>
                              <span>{platform}</span>
                            </div>
                          </td>

                          {/* Type / Origin */}
                          <td className="py-4 px-4">
                            {isBrandProposal ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                Direct Proposal
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                                Application
                              </span>
                            )}
                          </td>

                          {/* Service Title */}
                          <td className="py-4 px-4 text-text-secondary font-medium">
                            <div className="text-foreground font-medium truncate max-w-[150px]">
                              {serviceTitle}
                            </div>
                            {booking.service?.deliveryTime && (
                              <div className="text-[10px] text-text-secondary mt-0.5">
                                {booking.service.deliveryTime}d delivery
                              </div>
                            )}
                          </td>

                          {/* Price */}
                          <td className="py-4 px-4 font-bold text-foreground">
                            {formatCurrency(agreedPrice, currency)}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 text-text-secondary font-medium whitespace-nowrap">
                            {formatDate(booking.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {/* Quick Accept/Reject for Brand Proposals */}
                              {isPending && isBrandProposal && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusUpdate(booking._id, "accepted")}
                                    disabled={isThisProcessing}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                                    title="Accept Proposal"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusUpdate(booking._id, "rejected")}
                                    disabled={isThisProcessing}
                                    className="px-2.5 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                                    title="Decline Proposal"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                              {/* Quick Withdraw for Pending Applications */}
                              {isPending && !isBrandProposal && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickCancel(booking._id)}
                                  disabled={isThisProcessing}
                                  className="px-2.5 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                                  title="Withdraw Application"
                                >
                                  Withdraw
                                </button>
                              )}

                              {/* Workspace Link if Active */}
                              {isAcceptedOrActive && (
                                <Link
                                  href="/creator/workspace"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-muted text-foreground text-xs font-semibold hover:bg-surface-muted/80 transition-colors border border-border-theme cursor-pointer"
                                  title="Open Collaboration Workspace"
                                >
                                  <WorkspaceIcon className="w-3.5 h-3.5" />
                                  <span>Workspace</span>
                                </Link>
                              )}

                              {/* Details Modal Trigger */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBookingId(booking._id);
                                  setIsModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-text-secondary hover:text-foreground text-xs font-semibold transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <EyeIcon className="w-4 h-4" />
                                <span>Details</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && filteredBookings.length > 0 && (
              <div className="border-t border-border-theme px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-text-secondary">
                  Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                  <span className="font-semibold text-foreground">{totalPages}</span> ({totalItems} total bookings)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Booking Detail Modal */}
      <CreatorBookingDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingId={selectedBookingId}
      />
    </div>
  );
}

