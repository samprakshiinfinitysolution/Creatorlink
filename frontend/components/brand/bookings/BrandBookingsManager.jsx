"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandBookingDetailModal from "@/components/brand/bookings/BrandBookingDetailModal";
import { fetchBrandBookings } from "@/redux/brand/bookings/bookings_slice";

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
        color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-secondary/10 text-secondary border-secondary/20",
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

// Status filter options config
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function BrandBookingsManager() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Detail Modal State
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();

  const { bookings, pagination, loading, error } = useSelector(
    (state) => state.brandBookings || {}
  );

  // Helper to fetch bookings with current or overridden params
  const fetchBookingsList = useCallback(
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

      dispatch(fetchBrandBookings(params));
    },
    [dispatch, page, statusFilter]
  );

  // Initial fetch on mount
  useEffect(() => {
    dispatch(fetchBrandBookings({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Handlers
  const handleStatusFilterChange = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    setPage(1);
    fetchBookingsList({ status: val, page: 1 });
  };

  const handleRetry = () => {
    fetchBookingsList();
  };

  const handlePageChange = (newPage) => {
    const totalPagesCount = pagination?.pages || pagination?.totalPages || 1;
    if (newPage < 1 || newPage > totalPagesCount) return;
    setPage(newPage);
    fetchBookingsList({ page: newPage });
  };

  const currentPage = pagination?.page || page;
  const totalPages = pagination?.pages || pagination?.totalPages || 1;
  const totalItems = pagination?.total ?? pagination?.totalItems ?? bookings.length;
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Dynamic empty state message based on selected filter
  const getEmptyStateMessage = () => {
    switch (statusFilter) {
      case "pending":
        return "No pending booking requests.";
      case "accepted":
        return "No accepted bookings.";
      case "rejected":
        return "No rejected bookings.";
      case "cancelled":
        return "No cancelled bookings.";
      case "in_progress":
        return "No in-progress bookings.";
      case "completed":
        return "No completed bookings.";
      default:
        return "No booking requests found.";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar Component */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Bookings Main Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20 mb-2">
                Brand Workspace
              </span>
              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
                Bookings & Applications
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                View and manage creator applications and booking requests for your campaigns.
              </p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider shrink-0">
                Filter by Status:
              </span>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-secondary transition-colors cursor-pointer shrink-0"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Status Pill Bar for Desktop */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = statusFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setPage(1);
                      fetchBookingsList({ status: opt.value, page: 1 });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${isActive
                        ? "bg-secondary text-white font-semibold shadow-xs"
                        : "bg-surface-muted/60 text-text-secondary hover:text-foreground hover:bg-surface-muted"
                      }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-xs font-sans flex items-center justify-between gap-4">
              <span>{typeof error === "string" ? error : "Failed to load bookings. Please try again."}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowPathIcon />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Main Booking List Container */}
          <div className="bg-surface border border-border-theme rounded-2xl shadow-xs overflow-hidden">

            {/* Loading Skeleton State */}
            {loading && (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-surface-muted rounded-xl animate-pulse w-full" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && bookings.length === 0 && (
              <div className="text-center py-16 px-4 border-dashed border-border-theme space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <BookingsIcon />
                </div>
                <h3 className="font-serif font-medium text-lg text-foreground">
                  {getEmptyStateMessage()}
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {statusFilter
                    ? "Try switching to another status filter or clearing filters to see all booking requests."
                    : "When creators apply to your campaigns or bookings are initiated, they will appear here."}
                </p>
              </div>
            )}

            {/* Booking List Table (Desktop / Tablet / Mobile Responsive) */}
            {!loading && !error && bookings.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-theme bg-surface-muted/40 text-text-secondary uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3.5 px-5">Creator</th>
                      <th className="py-3.5 px-4">Campaign Title</th>
                      <th className="py-3.5 px-4">Category & Platform</th>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Agreed Price</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {bookings.map((booking) => {
                      const creatorName =
                        booking.creator?.name ||
                        booking.creator?.displayName ||
                        booking.creator?.user?.name ||
                        booking.creator?.email ||
                        "Creator";

                      const creatorEmail =
                        booking.creator?.email ||
                        booking.creator?.user?.email ||
                        "N/A";

                      const campaignTitle = booking.campaign?.title || "Campaign";
                      const campaignCategory = booking.campaign?.category || "N/A";
                      const platform =
                        booking.campaign?.platform ||
                        booking.service?.platform ||
                        booking.platform ||
                        "N/A";

                      const serviceTitle =
                        booking.service?.title || booking.serviceTitle || "Selected Service";

                      const agreedPrice = booking.agreedPrice;
                      const currency = booking.currency || "INR";
                      const badge = getStatusBadge(booking.status);

                      return (
                        <tr
                          key={booking._id || booking.id}
                          className="hover:bg-surface-muted/30 transition-colors"
                        >
                          {/* Creator Column */}
                          <td className="py-4 px-5">
                            <div className="font-semibold text-foreground text-sm font-sans">
                              {creatorName}
                            </div>
                            <div className="text-[11px] text-text-secondary mt-0.5">
                              {creatorEmail}
                            </div>
                          </td>

                          {/* Campaign Title Column */}
                          <td className="py-4 px-4">
                            <div className="font-medium text-foreground text-xs sm:text-sm font-sans">
                              {campaignTitle}
                            </div>
                            {booking.campaign?.deadline && (
                              <div className="text-[10px] text-text-secondary mt-0.5">
                                Deadline: {formatDate(booking.campaign.deadline)}
                              </div>
                            )}
                          </td>

                          {/* Category & Platform Column */}
                          <td className="py-4 px-4 text-text-secondary font-medium">
                            <div className="text-foreground font-medium">{campaignCategory}</div>
                            <div className="text-[11px] text-text-secondary capitalize mt-0.5">
                              {platform}
                            </div>
                          </td>

                          {/* Service Title Column */}
                          <td className="py-4 px-4 text-text-secondary font-medium">
                            {serviceTitle}
                          </td>

                          {/* Agreed Price Column */}
                          <td className="py-4 px-4 font-semibold text-foreground">
                            {formatCurrency(agreedPrice, currency)}
                          </td>

                          {/* Status Badge Column */}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Created Date Column */}
                          <td className="py-4 px-4 text-text-secondary font-medium">
                            {formatDate(booking.createdAt)}
                          </td>

                          {/* View Details Action Button */}
                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBookingId(booking._id || booking.id);
                                setIsModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-text-secondary hover:text-foreground text-xs font-semibold transition-colors cursor-pointer"
                              title="View Booking Details"
                            >
                              <EyeIcon />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && bookings.length > 0 && (
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeftIcon />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Brand Booking Detail Modal */}
      <BrandBookingDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingId={selectedBookingId}
      />
    </div>
  );
}
