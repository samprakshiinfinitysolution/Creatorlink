"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { getServices } from "@/redux/creator/services/services_slice";

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

function CheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

export default function ApplyToCampaignModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  campaignBudget,
  onContinue = () => {},
  submitting = false,
  submitError = null,
}) {
  const dispatch = useDispatch();
  const { services, loading, error } = useSelector((state) => state.services);

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [isStepValidated, setIsStepValidated] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setSelectedServiceId("");
    setProposedPrice("");
    setMessage("");
    setValidationError(null);
    setIsStepValidated(false);
    onClose();
  };

  // Fetch active creator services when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getServices({ isActive: "true" }));
    }
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  const activeServices = Array.isArray(services)
    ? services.filter((s) => s && (s.isActive === true || s.isActive === undefined))
    : [];

  const handleSelectService = (service) => {
    const serviceId = service._id || service.id;
    setSelectedServiceId(serviceId);
    if (typeof service.price === "number") {
      setProposedPrice(service.price);
    } else {
      setProposedPrice("");
    }
    setValidationError(null);
    setIsStepValidated(false);
  };

  const handlePriceChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setProposedPrice("");
    } else {
      const num = Number(val);
      if (!isNaN(num) && num >= 0) {
        setProposedPrice(num);
      }
    }
    setValidationError(null);
    setIsStepValidated(false);
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    if (val.length <= 2000) {
      setMessage(val);
    }
    setValidationError(null);
    setIsStepValidated(false);
  };

  const handleRetryServices = () => {
    dispatch(getServices({ isActive: "true" }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (submitting) return;
    setValidationError(null);

    if (!selectedServiceId) {
      setValidationError("Please select an active service package for this campaign application.");
      return;
    }

    if (proposedPrice === "" || proposedPrice === null || proposedPrice === undefined) {
      setValidationError("Please enter a valid proposed price.");
      return;
    }

    const parsedPrice = Number(proposedPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setValidationError("Proposed price must be a valid non-negative number.");
      return;
    }

    setIsStepValidated(true);

    onContinue({
      campaignId,
      serviceId: selectedServiceId,
      proposedPrice: parsedPrice,
      message: message.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-border-theme flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20 uppercase tracking-wide">
              Application Proposal
            </span>
            <h2 className="font-serif font-semibold text-xl text-foreground mt-1">
              Apply to Campaign
            </h2>
            {campaignTitle && (
              <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                Campaign: <span className="text-foreground font-medium">{campaignTitle}</span>
              </p>
            )}
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
          {/* Error Banner for Fetching Services */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3">
              <span>{typeof error === "string" ? error : "Failed to load services."}</span>
              <button
                type="button"
                onClick={handleRetryServices}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
              >
                <RefreshIcon />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Submission Error Banner */}
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs font-medium">
              {typeof submitError === "string" ? submitError : "Campaign application failed. Please try again."}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && activeServices.length === 0 ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-surface-muted rounded-md w-1/3" />
              <div className="h-20 bg-surface-muted rounded-xl" />
              <div className="h-20 bg-surface-muted rounded-xl" />
            </div>
          ) : activeServices.length === 0 ? (
            /* No Active Services Empty State */
            <div className="bg-surface-muted/40 border border-border-theme rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                <BriefcaseIcon />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-medium text-base text-foreground">
                  No active services found
                </h3>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  You need at least one active service package before applying to brand campaigns.
                </p>
              </div>
              <div className="pt-1">
                <Link
                  href="/creator/services"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Go to Creator Services</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Active Services Selection */
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Select Service Package <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {activeServices.map((service) => {
                    const serviceId = service._id || service.id;
                    const isSelected = selectedServiceId === serviceId;

                    return (
                      <div
                        key={serviceId}
                        onClick={() => handleSelectService(service)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-secondary bg-secondary/10 shadow-xs"
                            : "border-border-theme bg-surface hover:border-secondary/40"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? "border-secondary bg-secondary text-white"
                                : "border-border-theme bg-surface-muted"
                            }`}
                          >
                            {isSelected && <CheckIcon className="w-3 h-3" />}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <span className="font-medium text-xs text-foreground block truncate">
                              {service.title}
                            </span>
                            <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                              <span>Platform: {service.platform || "General"}</span>
                              <span>•</span>
                              <span>{service.deliveryTime || 7} Days Delivery</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-serif font-semibold text-sm text-foreground block">
                            {service.currency === "INR" || !service.currency ? "₹" : `${service.currency} `}
                            {new Intl.NumberFormat("en-IN").format(service.price || 0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proposed Price Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Proposed Price (₹) <span className="text-red-500">*</span></span>
                  {campaignBudget !== undefined && (
                    <span className="text-[11px] font-normal text-text-secondary">
                      Campaign Budget: ₹{new Intl.NumberFormat("en-IN").format(campaignBudget)}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  value={proposedPrice}
                  onChange={handlePriceChange}
                  placeholder="Enter proposed price"
                  disabled={submitting}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors disabled:opacity-60"
                />
              </div>

              {/* Proposal Message Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Proposal Pitch Message <span className="text-text-secondary font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-text-secondary">
                    {message.length}/2000
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Tell the brand why you're a good fit for this campaign..."
                  disabled={submitting}
                  className="w-full text-xs p-3.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors resize-none disabled:opacity-60"
                />
              </div>

              {/* Validation Error Banner */}
              {validationError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs font-medium">
                  {validationError}
                </div>
              )}

              {/* Validation Success Step Notice */}
              {isStepValidated && !validationError && !submitError && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-3 rounded-xl text-xs font-medium">
                  Application form validated successfully. Submitting proposal...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border-theme flex items-center justify-end gap-3 bg-surface-muted/30">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          {activeServices.length > 0 && (
            <button
              type="button"
              onClick={handleContinue}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
