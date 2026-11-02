"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCreatorBookingById,
  updateCreatorBookingStatus,
  cancelCreatorBooking,
  clearSelectedBooking,
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
function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function WorkspaceIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

// =========================================================
// MAIN MODAL COMPONENT
// =========================================================
export default function CreatorBookingDetailModal({
  isOpen,
  onClose,
  bookingId,
}) {
  const dispatch = useDispatch();

  const { selectedBooking, loading, error, submitting } = useSelector(
    (state) => state.creatorBookings || {}
  );

  const [confirmAction, setConfirmAction] = useState(null); // 'accept' | 'reject' | 'cancel' | null
  const [localFeedback, setLocalFeedback] = useState(null);

  // Fetch full details when modal opens with bookingId
  useEffect(() => {
    if (isOpen && bookingId) {
      dispatch(fetchCreatorBookingById(bookingId));
      queueMicrotask(() => {
        setConfirmAction(null);
        setLocalFeedback(null);
      });
    }
  }, [dispatch, isOpen, bookingId]);

  const handleClose = () => {
    if (submitting) return;
    setConfirmAction(null);
    setLocalFeedback(null);
    dispatch(clearSelectedBooking());
    onClose();
  };

  const handleRetryDetail = () => {
    if (bookingId) {
      dispatch(fetchCreatorBookingById(bookingId));
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction || !bookingId || submitting) return;

    setLocalFeedback(null);

    if (confirmAction === "accept" || confirmAction === "reject") {
      const targetStatus = confirmAction === "accept" ? "accepted" : "rejected";

      const result = await dispatch(
        updateCreatorBookingStatus({
          bookingId,
          status: targetStatus,
        })
      );

      if (updateCreatorBookingStatus.fulfilled.match(result)) {
        setLocalFeedback({
          type: "success",
          text: targetStatus === "accepted"
            ? "Proposal accepted successfully! Workspace is ready."
            : "Proposal declined successfully.",
        });
        setConfirmAction(null);
      } else {
        setLocalFeedback({
          type: "error",
          text: typeof result.payload === "string" ? result.payload : "Failed to update proposal status.",
        });
      }
    } else if (confirmAction === "cancel") {
      const result = await dispatch(cancelCreatorBooking(bookingId));

      if (cancelCreatorBooking.fulfilled.match(result)) {
        setLocalFeedback({
          type: "success",
          text: "Application withdrawn successfully.",
        });
        setConfirmAction(null);
      } else {
        setLocalFeedback({
          type: "error",
          text: typeof result.payload === "string" ? result.payload : "Failed to withdraw application.",
        });
      }
    }
  };

  if (!isOpen) return null;

  const booking = selectedBooking;
  const isPending = booking?.status?.toLowerCase() === "pending";
  const isBrandInitiated = booking?.initiatedBy === "brand";
  const isAcceptedOrActive = booking?.status === "accepted" || booking?.status === "in_progress";
  const badge = getStatusBadge(booking?.status);

  const brandName =
    booking?.brand?.name ||
    booking?.brand?.displayName ||
    booking?.brand?.email ||
    "Brand Partner";

  const brandEmail = booking?.brand?.email || "N/A";
  const brandInitials = getBrandInitials(brandName);

  const campaignTitle = booking?.campaign?.title || "Collaboration Campaign";
  const campaignCategory = booking?.campaign?.category || "General";
  const platform =
    booking?.campaign?.platform ||
    booking?.service?.platform ||
    booking?.platform ||
    "General";

  const serviceTitle =
    booking?.service?.title || booking?.serviceTitle || "Requested Service";

  const agreedPrice = booking?.agreedPrice;
  const currency = booking?.currency || "INR";

  const deliverables = Array.isArray(booking?.deliverables)
    ? booking.deliverables
    : Array.isArray(booking?.campaign?.deliverables)
    ? booking.campaign.deliverables
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl bg-surface border border-border-theme rounded-3xl shadow-2xl overflow-hidden my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-theme bg-surface-muted/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] tracking-wider uppercase text-[#ff2d6c] font-sans">
                BOOKING DETAILS
              </span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
              >
                {badge.label}
              </span>
              {isBrandInitiated ? (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Direct Proposal
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                  Application
                </span>
              )}
            </div>
            <h2 className="font-serif font-medium text-xl sm:text-2xl text-foreground truncate max-w-md">
              {campaignTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              <div className="h-16 bg-surface-muted rounded-2xl animate-pulse" />
              <div className="h-28 bg-surface-muted rounded-2xl animate-pulse" />
              <div className="h-24 bg-surface-muted rounded-2xl animate-pulse" />
            </div>
          )}

          {/* Error Banner */}
          {error && !loading && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center justify-between gap-4">
              <span>{typeof error === "string" ? error : "Failed to load booking details."}</span>
              <button
                type="button"
                onClick={handleRetryDetail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Local Action Feedback Alert */}
          {localFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 transition-all ${
                localFeedback.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                  : "bg-red-500/10 border border-red-500/20 text-red-500"
              }`}
            >
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
              <span>{localFeedback.text}</span>
            </div>
          )}

          {!loading && booking && (
            <>
              {/* Brand Information Section */}
              <div className="p-4 rounded-2xl border border-border-theme bg-surface-muted/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center font-sans font-bold text-base shrink-0 shadow-xs">
                    {brandInitials}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                      Brand Client
                    </span>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base font-sans truncate">
                      {brandName}
                    </h3>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {brandEmail}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                    Agreed Price
                  </span>
                  <span className="text-base sm:text-lg font-bold text-foreground font-sans">
                    {formatCurrency(agreedPrice, currency)}
                  </span>
                </div>
              </div>

              {/* Core Collaboration Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-surface-muted/20 border border-border-theme">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Category
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground capitalize mt-1 block">
                    {campaignCategory}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-muted/20 border border-border-theme">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Platform
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground capitalize mt-1 block">
                    {platform}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-muted/20 border border-border-theme">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Delivery Deadline
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground mt-1 block">
                    {formatDate(booking.deadline)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-muted/20 border border-border-theme">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Applied / Sent
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground mt-1 block">
                    {formatDate(booking.createdAt)}
                  </span>
                </div>
              </div>

              {/* Selected Service Detail */}
              <div className="p-4 rounded-2xl border border-border-theme bg-surface-muted/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Package / Service
                  </span>
                  {booking.service?.deliveryTime && (
                    <span className="text-[11px] text-text-secondary font-medium">
                      Est. {booking.service.deliveryTime} day{booking.service.deliveryTime !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-foreground text-sm font-sans">
                  {serviceTitle}
                </div>
                {booking.service?.description && (
                  <p className="text-xs text-text-secondary leading-relaxed pt-1">
                    {booking.service.description}
                  </p>
                )}
              </div>

              {/* Deliverables Checklist */}
              {deliverables.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Campaign Deliverables ({deliverables.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-xl border border-border-theme bg-surface-muted/20 text-xs font-medium text-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d6c] shrink-0 mt-1.5" />
                        <span>{typeof item === "string" ? item : item.deliverable || item.text || item.title || JSON.stringify(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposal Note / Message */}
              {booking.message && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    {isBrandInitiated ? "Brand Proposal Message" : "Your Application Message"}
                  </span>
                  <div className="p-3.5 rounded-2xl border border-border-theme bg-surface-muted/20 text-xs text-foreground leading-relaxed italic">
                    "{booking.message}"
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-border-theme bg-surface-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left info or Go to Workspace button */}
          <div>
            {isAcceptedOrActive ? (
              <Link
                href="/creator/workspace"
                onClick={handleClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#252525] dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <WorkspaceIcon className="w-4 h-4" />
                <span>Open Collaboration Workspace</span>
              </Link>
            ) : (
              <span className="text-xs text-text-secondary">
                {isPending
                  ? isBrandInitiated
                    ? "Respond to brand's collaboration proposal"
                    : "You can withdraw while application is pending"
                  : `Booking is currently ${booking?.status}.`}
              </span>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* If pending and confirmation is active */}
            {confirmAction ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-text-secondary">
                  {confirmAction === "accept"
                    ? "Accept proposal?"
                    : confirmAction === "reject"
                    ? "Decline proposal?"
                    : "Withdraw application?"}
                </span>

                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={submitting}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity disabled:opacity-50 cursor-pointer ${
                    confirmAction === "accept"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submitting ? "Processing..." : "Confirm"}
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {/* Pending Brand Direct Proposal: Accept or Reject */}
                {isPending && isBrandInitiated && (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfirmAction("reject")}
                      disabled={submitting}
                      className="px-3.5 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      Decline
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmAction("accept")}
                      disabled={submitting}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                    >
                      Accept Proposal
                    </button>
                  </>
                )}

                {/* Pending Creator Application: Withdraw */}
                {isPending && !isBrandInitiated && (
                  <button
                    type="button"
                    onClick={() => setConfirmAction("cancel")}
                    disabled={submitting}
                    className="px-3.5 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    Withdraw Application
                  </button>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

