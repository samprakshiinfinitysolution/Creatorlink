"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/lib/axios";
import { getServices } from "@/redux/creator/services/services_slice";
import ServiceFormModal from "@/components/creator/services/ServiceFormModal";

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

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

function TicketIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

// Helper to determine if an API error message is specifically related to creator subscription or application credits
const isSubscriptionOrCreditError = (err) => {
  if (!err) return false;
  const msg = (typeof err === "string" ? err : err.message || "").toLowerCase();

  // If the error pertains to the brand's subscription, do not misclassify as a creator subscription error
  if (msg.includes("brand's subscription") || msg.includes("brand subscription")) {
    return false;
  }

  return (
    msg.includes("creator subscription") ||
    msg.includes("application credit") ||
    msg.includes("application credits") ||
    msg.includes("insufficient application") ||
    msg.includes("active creator subscription") ||
    msg.includes("upgrade or renew your plan") ||
    msg.includes("renew your plan")
  );
};

export default function ApplyToCampaignModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  campaignBudget,
  minBudget,
  maxBudget,
  campaignCategory = "Social Media Campaign",
  campaignPlatform = "instagram",
  brand,
  onContinue = () => {},
  submitting = false,
  submitError = null,
}) {
  const dispatch = useDispatch();
  const { services, loading, error } = useSelector((state) => state.services);

  const brandName = brand?.companyName || brand?.name || "Brand Partner";
  const brandLogo = brand?.logo || brand?.avatar || brand?.profileImage || "";
  const brandInitial = (brandName.trim()[0] || "B").toUpperCase();

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [isStepValidated, setIsStepValidated] = useState(false);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [successBannerMsg, setSuccessBannerMsg] = useState(null);

  // Soft Subscription & Credit State (undefined = unknown; null = confirmed no subscription)
  const [subChecking, setSubChecking] = useState(true);
  const [subChecked, setSubChecked] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(undefined);

  const handleClose = () => {
    if (submitting) return;
    setSelectedServiceId("");
    setProposedPrice("");
    setMessage("");
    setValidationError(null);
    setIsStepValidated(false);
    setIsCreateServiceOpen(false);
    setSuccessBannerMsg(null);
    setSubscriptionData(undefined);
    setSubChecking(true);
    setSubChecked(false);
    onClose();
  };

  // Fetch active creator services & perform soft subscription check when modal opens
  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      dispatch(getServices({ isActive: "true" }));

      const checkSubscription = async () => {
        try {
          const res = await axiosInstance.get("/subscriptions/creator/current");
          if (isMounted) {
            if (res.data?.success) {
              const returnedData = res.data.data;
              if (returnedData === null) {
                // Confirmed no subscription exists (Free tier confirmed by backend)
                setSubscriptionData(null);
              } else if (returnedData && typeof returnedData === "object" && !Array.isArray(returnedData)) {
                // Valid subscription document object
                setSubscriptionData(returnedData);
              } else {
                // data field is missing, undefined, or invalid: eligibility is unknown
                setSubscriptionData(undefined);
              }
            } else {
              // Unsuccessful response: eligibility is unknown; never assume Free account
              setSubscriptionData(undefined);
            }
            setSubChecked(true);
          }
        } catch (err) {
          // If check fails or network issues occur: eligibility is unknown; do NOT block creator
          console.warn("Could not retrieve current creator subscription:", err);
          if (isMounted) {
            setSubscriptionData(undefined);
            setSubChecked(true);
          }
        } finally {
          if (isMounted) {
            setSubChecking(false);
          }
        }
      };

      checkSubscription();
    }

    return () => {
      isMounted = false;
    };
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  const activeServices = Array.isArray(services)
    ? services.filter((s) => s && (s.isActive === true || s.isActive === undefined))
    : [];

  // Derive remaining credit balance safely without unverified assumptions
  const remainingCredits =
    subscriptionData?.creditBalance?.currentBalance !== undefined
      ? subscriptionData.creditBalance.currentBalance
      : typeof subscriptionData?.quotaState?.monthlyCreditsAllocated === "number" &&
        typeof subscriptionData?.quotaState?.creditsUsed === "number"
      ? Math.max(0, subscriptionData.quotaState.monthlyCreditsAllocated - subscriptionData.quotaState.creditsUsed)
      : typeof subscriptionData?.planSnapshot?.monthlyApplicationCredits === "number" &&
        typeof subscriptionData?.quotaState?.creditsUsed === "number"
      ? Math.max(0, subscriptionData.planSnapshot.monthlyApplicationCredits - subscriptionData.quotaState.creditsUsed)
      : null;

  // Derive eligibility safely following backend evaluateCreatorEntitlement rules
  const getEntitlementAssessment = () => {
    // If check hasn't completed, is still loading, or returned an unsuccessful response:
    // Eligibility is unknown -> keep submission enabled and let authoritative backend evaluate.
    if (subChecking || !subChecked || subscriptionData === undefined) {
      return { isConfirmedIneligible: false, reasonType: null };
    }

    // 1. Confirmed No Subscription (Free account confirmed by successful API response)
    if (subscriptionData === null) {
      return { isConfirmedIneligible: true, reasonType: "no_subscription" };
    }

    const now = new Date();
    const status = subscriptionData.status;
    const periodEnd = subscriptionData.currentPeriodEnd ? new Date(subscriptionData.currentPeriodEnd) : null;
    const graceEnd = subscriptionData.gracePeriodEnd ? new Date(subscriptionData.gracePeriodEnd) : null;

    // 2. Suspended by platform administration
    if (status === "suspended") {
      return { isConfirmedIneligible: true, reasonType: "suspended" };
    }

    // 3. Status explicitly expired
    if (status === "expired") {
      return { isConfirmedIneligible: true, reasonType: "expired" };
    }

    // 4. Active status: valid while currentPeriodEnd is in the future
    if (status === "active") {
      if (periodEnd && !isNaN(periodEnd.getTime()) && now >= periodEnd) {
        return { isConfirmedIneligible: true, reasonType: "expired" };
      }
      if (remainingCredits !== null && remainingCredits === 0) {
        return { isConfirmedIneligible: true, reasonType: "zero_credits" };
      }
      return { isConfirmedIneligible: false, reasonType: null };
    }

    // 5. Canceled status: per backend entitlement rules, remains active and entitled until currentPeriodEnd
    if (status === "canceled") {
      if (periodEnd && !isNaN(periodEnd.getTime())) {
        if (now < periodEnd) {
          // Entitled until end of billing cycle
          if (remainingCredits !== null && remainingCredits === 0) {
            return { isConfirmedIneligible: true, reasonType: "zero_credits" };
          }
          return { isConfirmedIneligible: false, reasonType: null };
        } else {
          return { isConfirmedIneligible: true, reasonType: "expired" };
        }
      }
      // If periodEnd is missing, frontend cannot reliably determine -> do not block
      return { isConfirmedIneligible: false, reasonType: null };
    }

    // 6. Past-due status: per backend entitlement rules, remains active within gracePeriodEnd
    if (status === "past_due") {
      if (graceEnd && !isNaN(graceEnd.getTime())) {
        if (now <= graceEnd) {
          // Active within grace period
          if (remainingCredits !== null && remainingCredits === 0) {
            return { isConfirmedIneligible: true, reasonType: "zero_credits" };
          }
          return { isConfirmedIneligible: false, reasonType: null };
        } else {
          return { isConfirmedIneligible: true, reasonType: "grace_expired" };
        }
      }
      // If gracePeriodEnd is missing or indeterminate, keep submission enabled and let backend decide
      return { isConfirmedIneligible: false, reasonType: null };
    }

    // Any other status: if frontend cannot reliably determine, keep submission enabled
    return { isConfirmedIneligible: false, reasonType: null };
  };

  const { isConfirmedIneligible, reasonType } = getEntitlementAssessment();

  const handleSelectService = (service) => {
    const serviceId = service._id || service.id;
    const normalizedServiceId = String(serviceId);
    const isSameService = String(selectedServiceId) === normalizedServiceId;

    if (isSameService) {
      setSelectedServiceId("");
      setProposedPrice("");
    } else {
      setSelectedServiceId(serviceId);
      if (typeof service.price === "number") {
        setProposedPrice(service.price);
      } else {
        setProposedPrice("");
      }
    }
    setValidationError(null);
    setIsStepValidated(false);
  };

  const handleServiceCreated = (response) => {
    const newService = response?.data || response;
    const newId = newService?._id || newService?.id;

    // Refresh active services in Redux
    dispatch(getServices({ isActive: "true" }));

    if (newId) {
      setSelectedServiceId(newId);
      if (typeof newService.price === "number") {
        setProposedPrice(newService.price);
      }
      setSuccessBannerMsg(
        `"${newService.title || "New Service"}" created and selected for this proposal!`
      );
    }
    setIsCreateServiceOpen(false);
    setValidationError(null);
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
    if (submitting || isConfirmedIneligible) return;
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

    // Preserve exact existing payload contract
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
            <div className="flex items-center gap-2 mt-1">
              {brandLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={brandLogo}
                  alt={brandName}
                  className="w-4 h-4 rounded-full object-contain object-center shrink-0 border border-border-theme"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-[8px] font-sans font-semibold shrink-0">
                  {brandInitial}
                </div>
              )}
              <p className="text-xs text-text-secondary truncate">
                <span className="font-medium text-foreground">{brandName}</span>
                {campaignTitle && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{campaignTitle}</span>
                  </>
                )}
              </p>
            </div>
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
          {/* Brand & Campaign Summary Banner */}
          <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border-theme flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {brandLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={brandLogo}
                  alt={brandName}
                  className="w-10 h-10 rounded-xl object-contain object-center shrink-0 border border-border-theme"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-pink-100/70 dark:bg-pink-950/40 text-black dark:text-white border border-pink-200/60 dark:border-pink-800/40 flex items-center justify-center text-sm font-sans font-semibold shrink-0">
                  {brandInitial}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-wider uppercase text-pink-500 dark:text-pink-400 block">
                  Target Brand
                </span>
                <span className="text-sm font-semibold text-foreground block truncate">
                  {brandName}
                </span>
                <span className="text-xs text-text-secondary block truncate">
                  {campaignTitle || "Brand Campaign"}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-text-secondary font-medium block">
                Budget
              </span>
              <span className="text-xs sm:text-sm font-semibold text-foreground block">
                {minBudget && maxBudget && minBudget !== maxBudget
                  ? `₹${new Intl.NumberFormat("en-IN").format(minBudget)} – ₹${new Intl.NumberFormat("en-IN").format(maxBudget)}`
                  : `₹${new Intl.NumberFormat("en-IN").format(maxBudget || campaignBudget || minBudget || 0)}`}
              </span>
            </div>
          </div>

          {/* Application Credit Information Bar */}
          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <TicketIcon className="w-4 h-4 text-secondary shrink-0" />
              <span>
                Consumes <strong>1 Application Credit</strong> on successful application
              </span>
            </div>

            {subChecking ? (
              <div className="flex items-center gap-1.5 text-text-secondary text-[11px]">
                <div className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Checking credits...</span>
              </div>
            ) : remainingCredits !== null ? (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center self-start sm:self-auto ${
                  remainingCredits > 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {remainingCredits} {remainingCredits === 1 ? "credit" : "credits"} available
              </span>
            ) : null}
          </div>

          {/* Ineligible Subscription / Zero Credits Advisory Banner */}
          {isConfirmedIneligible && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <span>⚠️</span>
                  <span>
                    {reasonType === "no_subscription"
                      ? "Active Subscription Required to Apply"
                      : reasonType === "zero_credits"
                      ? "Zero Application Credits Remaining"
                      : reasonType === "suspended"
                      ? "Subscription Suspended"
                      : "Subscription Inactive or Expired"}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  {reasonType === "no_subscription"
                    ? "Applying to brand campaigns requires an active Creator membership. Free accounts can manage portfolio and services, but need an active plan to pitch."
                    : reasonType === "zero_credits"
                    ? "You have used all application credits for your current billing cycle. Upgrade your plan to receive additional application credits immediately."
                    : reasonType === "suspended"
                    ? "Your Creator subscription has been suspended by administration. Please manage your account to restore pitching privileges."
                    : "Your Creator subscription has expired or billing period has ended. Renew your plan to unlock campaign pitches and receive monthly credits."}
                </p>
              </div>
              <Link
                href="/creator/subscription/plans"
                className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs text-center"
              >
                <span>
                  {reasonType === "no_subscription"
                    ? "Upgrade to Apply"
                    : reasonType === "zero_credits"
                    ? "Get More Credits"
                    : "Renew Subscription"}
                </span>
                <span>→</span>
              </Link>
            </div>
          )}

          {/* Success Banner when service is created */}
          {successBannerMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                <span>{successBannerMsg}</span>
              </span>
              <button
                type="button"
                onClick={() => setSuccessBannerMsg(null)}
                className="text-text-secondary hover:text-foreground p-1 cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
            isSubscriptionOrCreditError(submitError) ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-200">
                    <span>⚠️</span>
                    <span>Subscription or Credit Required</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {typeof submitError === "string"
                      ? submitError
                      : submitError.message || "An active subscription or credit is required."}
                  </p>
                </div>
                <Link
                  href="/creator/subscription/plans"
                  className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs text-center"
                >
                  <span>Upgrade / Renew Plan</span>
                  <span>→</span>
                </Link>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs font-medium animate-in fade-in">
                {typeof submitError === "string"
                  ? submitError
                  : submitError.message || "Campaign application failed. Please try again."}
              </div>
            )
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
                  You need a service package to apply. Create a new service tailored for this campaign now.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateServiceOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-white text-xs font-semibold tracking-wide shadow-xs hover:bg-secondary/90 active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>+ Create Service for Campaign</span>
                </button>
                <Link
                  href="/creator/services"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors"
                >
                  <span>Go to Services</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Active Services Selection */
            <div className="space-y-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-foreground block">
                    Select Service Package <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreateServiceOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-secondary hover:text-white bg-secondary/10 hover:bg-secondary border border-secondary/30 transition-all cursor-pointer shadow-2xs"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>+ Create New Service</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {activeServices.map((service) => {
                    const serviceId = service._id || service.id;
                    const isSelected = Boolean(selectedServiceId) && String(selectedServiceId) === String(serviceId);

                    return (
                      <div
                        key={serviceId}
                        onClick={() => handleSelectService(service)}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
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
                            <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-text-secondary flex-wrap">
                              <span>Platform: {service.platform || "General"}</span>
                              <span>•</span>
                              <span>{service.deliveryTime || 7} Days Delivery</span>
                              {service.contentType && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{service.contentType.replace(/_/g, " ")}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-sans font-semibold text-sm text-foreground block">
                            {service.currency === "INR" || !service.currency ? "₹" : `${service.currency} `}
                            {new Intl.NumberFormat("en-IN").format(service.price || 0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Create New Service Inline Card */}
                  <button
                    type="button"
                    onClick={() => setIsCreateServiceOpen(true)}
                    className="p-3 rounded-xl border border-dashed border-border-theme hover:border-secondary bg-surface-muted/20 hover:bg-secondary/5 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-text-secondary hover:text-secondary cursor-pointer group"
                  >
                    <span className="w-5 h-5 rounded-lg bg-surface border border-border-theme group-hover:border-secondary/50 group-hover:bg-secondary/10 flex items-center justify-center text-xs text-foreground group-hover:text-secondary transition-colors">
                      +
                    </span>
                    <span>Want a different package? Create a new service specifically for this campaign</span>
                  </button>
                </div>
              </div>

              {/* Proposed Price Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Proposed Price (₹) <span className="text-red-500">*</span></span>
                  {(minBudget || maxBudget || campaignBudget !== undefined) && (
                    <span className="text-[11px] font-normal text-text-secondary">
                      Campaign Budget: {
                        minBudget && maxBudget && minBudget !== maxBudget
                          ? `₹${new Intl.NumberFormat("en-IN").format(minBudget)} – ₹${new Intl.NumberFormat("en-IN").format(maxBudget)}`
                          : `₹${new Intl.NumberFormat("en-IN").format(maxBudget || campaignBudget || minBudget || 0)}`
                      }
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
              disabled={submitting || isConfirmedIneligible}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide border shadow-xs transition-all duration-200 ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isConfirmedIneligible
                  ? "bg-surface-muted text-text-secondary border-border-theme"
                  : "bg-neutral-950 text-white border-neutral-900 hover:bg-neutral-900 hover:border-neutral-800 hover:shadow-xs hover:shadow-pink-500/10 active:scale-[0.99] dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin dark:border-neutral-900" />
                  <span>Submitting...</span>
                </>
              ) : isConfirmedIneligible ? (
                <span>Subscription Required</span>
              ) : (
                <span>Continue</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Create New Service Package Modal */}
      <ServiceFormModal
        isOpen={isCreateServiceOpen}
        onClose={() => setIsCreateServiceOpen(false)}
        defaultCategory={campaignCategory || "Social Media Campaign"}
        defaultPlatform={campaignPlatform || "instagram"}
        onSuccess={handleServiceCreated}
        zIndex="z-[70]"
      />
    </div>
  );
}
