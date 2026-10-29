"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBrandCampaigns } from "@/redux/brand/campaigns/campaigns_slice";
import {
  createBrandBooking,
  fetchBrandBookings,
} from "@/redux/brand/bookings/bookings_slice";

// =========================================================
// FORMATTING HELPERS & ICONS
// =========================================================
function formatCurrency(amount, currency = "INR") {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "N/A";
  const num = Number(amount);
  const currCode = (currency || "INR").toUpperCase();

  if (currCode === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currCode,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${currCode} ${num.toLocaleString()}`;
  }
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "CR";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
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

function CheckCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExclamationTriangleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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

// =========================================================
// BRAND CREATE BOOKING MODAL
// =========================================================
export default function BrandCreateBookingModal({
  isOpen,
  onClose,
  creator,
  service,
}) {
  const dispatch = useDispatch();

  const { campaigns, loading: campaignsLoading } = useSelector(
    (state) => state.brandCampaigns || {}
  );
  const { submitting } = useSelector((state) => state.brandBookings || {});

  // Form states
  const [userSelectedCampaignId, setUserSelectedCampaignId] = useState("");
  const [customPrice, setCustomPrice] = useState(null);
  const [message, setMessage] = useState("");

  // Validation & feedback states
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  // Filter only eligible campaigns backed by backend validation ("published" or "in_progress")
  const eligibleCampaigns = useMemo(() => {
    return Array.isArray(campaigns)
      ? campaigns.filter(
        (c) => c.status === "published" || c.status === "in_progress"
      )
      : [];
  }, [campaigns]);

  // Derived effective values
  const effectiveCampaignId = userSelectedCampaignId || (eligibleCampaigns.length > 0 ? eligibleCampaigns[0]._id : "");
  const proposedPrice = customPrice !== null ? customPrice : (service?.price !== undefined && service?.price !== null ? String(service.price) : "");

  // Load campaigns on open
  useEffect(() => {
    if (isOpen) {
      dispatch(getBrandCampaigns({ limit: 50 }));
    }
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  // Extract creator identifiers
  // Backend requires creator Auth User ID (User._id), NOT CreatorProfile ID
  const creatorAuthUserId = creator?.user?._id || service?.creator;
  const creatorName = creator?.user?.name || "Creator";
  const creatorCategory = creator?.category || "General";
  const creatorInitials = getInitials(creatorName);

  const serviceTitle = service?.title || "Custom Collaboration Service";
  const serviceCurrency = service?.currency || "INR";
  const serviceDefaultPrice = service?.price;
  const formattedDefaultPrice = formatCurrency(serviceDefaultPrice, serviceCurrency);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setApiError("");

    if (!effectiveCampaignId) {
      setValidationError("Please select an active/published campaign to back this proposal.");
      return;
    }

    if (!creatorAuthUserId) {
      setValidationError("Creator user identification is missing. Please close and re-open.");
      return;
    }

    if (!service?._id) {
      setValidationError("Selected service identification is missing.");
      return;
    }

    const priceNum = Number(proposedPrice);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setValidationError("Please enter a valid non-negative proposal price.");
      return;
    }

    const payload = {
      creatorId: creatorAuthUserId,
      serviceId: service._id,
      campaignId: effectiveCampaignId,
      proposedPrice: priceNum,
      message: message.trim(),
    };

    const actionResult = await dispatch(createBrandBooking(payload));

    if (createBrandBooking.fulfilled.match(actionResult)) {
      setSuccessInfo(actionResult.payload?.message || "Booking proposal submitted successfully!");
      // Refresh the brand bookings list using the project's established pattern
      dispatch(fetchBrandBookings());
    } else if (createBrandBooking.rejected.match(actionResult)) {
      setApiError(
        actionResult.payload ||
        "Unable to submit booking proposal. Please check your campaign details and try again."
      );
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setUserSelectedCampaignId("");
    setCustomPrice(null);
    setMessage("");
    setValidationError("");
    setApiError("");
    setSuccessInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 cursor-default"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-border-theme bg-surface flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-semibold text-base sm:text-lg text-foreground">
                Send Booking Proposal
              </h2>
              <p className="text-xs text-text-secondary">
                Pattern A: Campaign-backed proposal for {creatorName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
            title="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Success State */}
          {successInfo ? (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-in zoom-in duration-200">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">
                  Proposal Sent Successfully!
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  {successInfo} The creator will receive your booking request and can accept or reject it.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-secondary text-surface text-xs font-semibold hover:bg-secondary/90 transition-colors cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Creator & Service Summary Card */}
              <div className="bg-surface-muted/40 border border-border-theme rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface border border-border-theme flex items-center justify-center font-bold text-[11px] text-text-secondary">
                      {creatorInitials}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block truncate max-w-[200px]">
                        {creatorName}
                      </span>
                      <span className="text-[10px] text-text-secondary">
                        {creatorCategory}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                    {service?.platform || "Service"}
                  </span>
                </div>

                <div className="pt-2 border-t border-border-theme flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-medium text-foreground block truncate" title={serviceTitle}>
                      {serviceTitle}
                    </span>
                    {service?.deliveryTime && (
                      <span className="text-[11px] text-text-secondary inline-flex items-center gap-1 mt-0.5">
                        <ClockIcon className="w-3 h-3" />
                        {service.deliveryTime} days delivery
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-foreground block">
                      {formattedDefaultPrice}
                    </span>
                    <span className="text-[10px] text-text-secondary">Package standard</span>
                  </div>
                </div>
              </div>

              {/* Campaign Picker */}
              <div className="space-y-1.5">
                <label
                  htmlFor="campaign-select"
                  className="block text-xs font-bold text-text-secondary uppercase tracking-wider"
                >
                  Select Backing Campaign <span className="text-red-500">*</span>
                </label>

                {campaignsLoading ? (
                  <div className="h-10 rounded-xl bg-surface-muted animate-pulse border border-border-theme" />
                ) : eligibleCampaigns.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                      <span>No eligible campaigns available</span>
                    </div>
                    <p className="text-[11px]">
                      Under Pattern A, bookings require an existing campaign in <strong>published</strong> or <strong>in_progress</strong> status. Please publish a campaign first.
                    </p>
                  </div>
                ) : (
                  <select
                    id="campaign-select"
                    value={effectiveCampaignId}
                    onChange={(e) => setUserSelectedCampaignId(e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border-theme text-foreground text-xs font-medium focus:outline-hidden focus:border-secondary transition-colors cursor-pointer"
                  >
                    {eligibleCampaigns.map((camp) => (
                      <option key={camp._id} value={camp._id}>
                        {camp.title} ({camp.status}) — {formatCurrency(camp.budget, camp.currency || "INR")}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-[10px] text-text-secondary block">
                  Only campaigns with &apos;published&apos; or &apos;in_progress&apos; status are eligible for booking proposals.
                </span>
              </div>

              {/* Proposed Price Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="proposed-price"
                  className="block text-xs font-bold text-text-secondary uppercase tracking-wider"
                >
                  Proposed Price ({serviceCurrency}) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="proposed-price"
                    type="number"
                    min="0"
                    step="1"
                    value={proposedPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    disabled={submitting}
                    placeholder="Enter agreed or proposed amount"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-theme text-foreground text-xs font-semibold focus:outline-hidden focus:border-secondary transition-colors"
                  />
                </div>
                <span className="text-[10px] text-text-secondary block">
                  Prefilled from the creator&apos;s active service rate ({formattedDefaultPrice}). You may adjust if a custom quote was discussed.
                </span>
              </div>

              {/* Message / Brief Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="proposal-message"
                  className="block text-xs font-bold text-text-secondary uppercase tracking-wider"
                >
                  Proposal Note / Instructions (Optional)
                </label>
                <textarea
                  id="proposal-message"
                  rows={3}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  placeholder="Include specific instructions, deliverables schedule, or reference links for the creator..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-theme text-foreground text-xs focus:outline-hidden focus:border-secondary transition-colors resize-none custom-scrollbar"
                />
                <span className="text-[10px] text-text-secondary text-right block">
                  {message.length}/1000 characters
                </span>
              </div>

              {/* Validation Error Banner */}
              {validationError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* API / Duplicate Booking Error Banner */}
              {apiError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Submission Error</span>
                    <span>{apiError}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || eligibleCampaigns.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-black text-surface font-semibold hover:text-white/80 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Proposal...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-3.5 h-3.5" />
                      <span>Send Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
