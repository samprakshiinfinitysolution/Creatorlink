"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandBookingById,
  updateBrandBookingStatus,
  clearSelectedBooking,
} from "@/redux/brand/bookings/bookings_slice";

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

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function BrandBookingDetailModal({
  isOpen,
  onClose,
  bookingId,
}) {
  const dispatch = useDispatch();

  const { selectedBooking, loading, error, submitting, successMessage } = useSelector(
    (state) => state.brandBookings || {}
  );

  const [confirmAction, setConfirmAction] = useState(null); // 'accept' | 'reject' | null
  const [localFeedback, setLocalFeedback] = useState(null);

  // Fetch full details when modal opens with bookingId
  useEffect(() => {
    if (isOpen && bookingId) {
      dispatch(fetchBrandBookingById(bookingId));
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
      dispatch(fetchBrandBookingById(bookingId));
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmAction || !bookingId || submitting) return;

    setLocalFeedback(null);
    const targetStatus = confirmAction === "accept" ? "accepted" : "rejected";

    const result = await dispatch(
      updateBrandBookingStatus({
        bookingId,
        status: targetStatus,
      })
    );

    if (updateBrandBookingStatus.fulfilled.match(result)) {
      setLocalFeedback({
        type: "success",
        text: `Booking request successfully ${targetStatus}.`,
      });
      setConfirmAction(null);
    } else {
      setLocalFeedback({
        type: "error",
        text: typeof result.payload === "string" ? result.payload : "Status update failed.",
      });
    }
  };

  if (!isOpen) return null;

  const booking = selectedBooking;
  const isPending = booking?.status?.toLowerCase() === "pending";
  const badge = getStatusBadge(booking?.status);

  // Safely extract nested fields
  const creatorName =
    booking?.creator?.name ||
    booking?.creator?.displayName ||
    booking?.creator?.user?.name ||
    booking?.creator?.email ||
    "Creator";

  const creatorEmail =
    booking?.creator?.email ||
    booking?.creator?.user?.email ||
    "N/A";

  const campaignTitle = booking?.campaign?.title || "N/A";
  const campaignCategory = booking?.campaign?.category || "N/A";
  const campaignPlatform = booking?.campaign?.platform || "N/A";
  const campaignBudget = booking?.campaign?.budget;
  const campaignDeadline = booking?.campaign?.deadline;

  const serviceTitle = booking?.service?.title || booking?.serviceTitle || "N/A";
  const servicePrice = booking?.service?.price;
  const serviceDeliveryTime = booking?.service?.deliveryTime;
  const servicePlatform = booking?.service?.platform;

  const agreedPrice = booking?.agreedPrice;
  const currency = booking?.currency || "INR";
  const message = booking?.message;
  const deliverables =
    Array.isArray(booking?.deliverables) && booking.deliverables.length > 0
      ? booking.deliverables
      : Array.isArray(booking?.campaign?.deliverables)
      ? booking.campaign.deliverables
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-border-theme flex items-center justify-between bg-surface">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20 uppercase tracking-wide">
                Booking Request Details
              </span>
              {booking?.status && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <h2 className="font-serif font-semibold text-xl text-foreground mt-1">
              {campaignTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Loading State Skeleton */}
          {loading && !booking && (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-surface-muted rounded-md w-1/3" />
              <div className="h-24 bg-surface-muted rounded-xl" />
              <div className="h-24 bg-surface-muted rounded-xl" />
              <div className="h-24 bg-surface-muted rounded-xl" />
            </div>
          )}

          {/* Error State with Retry */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3">
              <span>{typeof error === "string" ? error : "Failed to load booking details."}</span>
              <button
                type="button"
                onClick={handleRetryDetail}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowPathIcon />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Feedback Success / Error Banners */}
          {localFeedback && (
            <div
              className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                localFeedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-red-500/10 border-red-500/30 text-red-500"
              }`}
            >
              {localFeedback.type === "success" && <CheckCircleIcon className="w-4 h-4 shrink-0" />}
              <span>{localFeedback.text}</span>
            </div>
          )}

          {successMessage && !localFeedback && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Booking Details Grid */}
          {!loading && booking && (
            <div className="space-y-6">
              
              {/* Creator & Proposal Overview Card */}
              <div className="bg-surface-muted/40 border border-border-theme rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Creator & Proposal Summary
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-text-secondary block">Creator Name</span>
                    <span className="text-sm font-semibold text-foreground block mt-0.5">{creatorName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block">Creator Email</span>
                    <span className="text-sm font-semibold text-foreground block mt-0.5">{creatorEmail}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block">Agreed Price</span>
                    <span className="text-sm font-semibold text-secondary block mt-0.5">
                      {formatCurrency(agreedPrice, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block">Booking Status</span>
                    <span className="inline-block mt-0.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Proposal Message */}
                {message && (
                  <div className="pt-2 border-t border-border-theme">
                    <span className="text-xs text-text-secondary block mb-1">Creator Message / Pitch:</span>
                    <p className="text-xs text-foreground bg-surface p-3 rounded-xl border border-border-theme whitespace-pre-line">
                      {message}
                    </p>
                  </div>
                )}
              </div>

              {/* Campaign Information Card */}
              <div className="bg-surface-muted/40 border border-border-theme rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Campaign Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-text-secondary block">Campaign Title</span>
                    <span className="font-semibold text-foreground block mt-0.5">{campaignTitle}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Category</span>
                    <span className="font-semibold text-foreground block mt-0.5">{campaignCategory}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Platform</span>
                    <span className="font-semibold text-foreground capitalize block mt-0.5">{campaignPlatform}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Campaign Budget</span>
                    <span className="font-semibold text-foreground block mt-0.5">{formatCurrency(campaignBudget)}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Campaign Deadline</span>
                    <span className="font-semibold text-foreground block mt-0.5">{formatDate(campaignDeadline)}</span>
                  </div>
                </div>
              </div>

              {/* Selected Service Package Card */}
              <div className="bg-surface-muted/40 border border-border-theme rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Selected Service Package
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-text-secondary block">Service Title</span>
                    <span className="font-semibold text-foreground block mt-0.5">{serviceTitle}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Standard Service Price</span>
                    <span className="font-semibold text-foreground block mt-0.5">
                      {servicePrice !== undefined ? formatCurrency(servicePrice, currency) : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Delivery Time</span>
                    <span className="font-semibold text-foreground block mt-0.5">
                      {serviceDeliveryTime ? `${serviceDeliveryTime} Days` : "N/A"}
                    </span>
                  </div>
                  {servicePlatform && (
                    <div>
                      <span className="text-text-secondary block">Service Platform</span>
                      <span className="font-semibold text-foreground capitalize block mt-0.5">{servicePlatform}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deliverables Checklist */}
              {deliverables.length > 0 && (
                <div className="bg-surface-muted/40 border border-border-theme rounded-2xl p-5 space-y-3">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Deliverables List
                  </span>
                  <ul className="space-y-2">
                    {deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-foreground">
                        <span className="w-4 h-4 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                          <CheckIcon className="w-3 h-3" />
                        </span>
                        <span>{typeof item === "string" ? item : item.title || JSON.stringify(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dates & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-surface-muted/20 border border-border-theme p-4 rounded-2xl">
                <div>
                  <span className="text-text-secondary block">Start Date</span>
                  <span className="font-medium text-foreground block mt-0.5">{formatDate(booking.startDate)}</span>
                </div>
                <div>
                  <span className="text-text-secondary block">Booking Deadline</span>
                  <span className="font-medium text-foreground block mt-0.5">{formatDate(booking.deadline)}</span>
                </div>
                <div>
                  <span className="text-text-secondary block">Requested Date</span>
                  <span className="font-medium text-foreground block mt-0.5">{formatDate(booking.createdAt)}</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 sm:p-5 border-t border-border-theme flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-muted/30">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>

          {/* Pending Status Actions & Confirmation Box */}
          {isPending && (
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
              {confirmAction ? (
                /* Inline Confirmation Step */
                <div className="flex items-center gap-2 bg-surface border border-border-theme p-2 rounded-xl w-full sm:w-auto">
                  <span className="text-xs font-medium text-foreground px-2">
                    {confirmAction === "accept"
                      ? "Accept this booking request?"
                      : "Reject this booking request?"}
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmStatusChange}
                    disabled={submitting}
                    className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      confirmAction === "accept"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </span>
                    ) : (
                      <span>Confirm {confirmAction === "accept" ? "Accept" : "Reject"}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    disabled={submitting}
                    className="px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-foreground text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* Primary Accept / Reject Buttons */
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setConfirmAction("reject")}
                    disabled={submitting}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XIcon />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction("accept")}
                    disabled={submitting}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckIcon />
                    <span>Accept Request</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
