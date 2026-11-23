"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

// =========================================================
// SVG ICONS
// =========================================================
function CrownIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}

function LayersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l9.75 5.25 9.75-5.25-4.179-2.25m-11.321 4.5L2.25 16.5l9.75 5.25 9.75-5.25-4.179-2.25M12 3.75L2.25 9l9.75 5.25 9.75-5.25L12 3.75z" />
    </svg>
  );
}

function CalendarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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

function AlertIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

export default function CreatorSubscriptionDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [daysLeft, setDaysLeft] = useState(0);
  const [isPeriodEnded, setIsPeriodEnded] = useState(false);
  const [isGraceEnded, setIsGraceEnded] = useState(false);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadSubscriptionData = async () => {
      try {
        setError(null);
        const res = await axiosInstance.get("/subscriptions/creator/current");
        if (res.data?.success && isMounted) {
          const subData = res.data.data;
          setSubscription(subData);

          const nowMs = Date.now();
          if (subData?.currentPeriodEnd) {
            const diffMs = new Date(subData.currentPeriodEnd).getTime() - nowMs;
            setDaysLeft(Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))));
            setIsPeriodEnded(diffMs <= 0);
          } else {
            setDaysLeft(0);
            setIsPeriodEnded(true);
          }

          if (subData?.gracePeriodEnd) {
            setIsGraceEnded(new Date(subData.gracePeriodEnd).getTime() < nowMs);
          } else {
            setIsGraceEnded(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load Creator subscription:", err);
          setError(err.response?.data?.message || "Failed to load subscription details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSubscriptionData();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  const handleRetry = () => {
    setLoading(true);
    setReloadTrigger((prev) => prev + 1);
  };

  // Format Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Derive Subscription State & Entitlement (Server-aligned with evaluateCreatorEntitlement)
  const isSuspended = subscription?.status === "suspended";
  const isExpired = subscription?.status === "expired" || Boolean(subscription?.status === "active" && isPeriodEnded);
  const inGracePeriod = Boolean(subscription?.status === "past_due" && !isGraceEnded);
  const isCanceledActive = Boolean(subscription?.status === "canceled" && !isPeriodEnded);
  const isActive = Boolean(subscription?.status === "active" && !isExpired);
  const isPastDue = Boolean(subscription?.status === "past_due");
  const isCanceled = Boolean(subscription?.status === "canceled");

  // hasSubscription: True ONLY if the subscription has valid, active entitlement:
  // - active (not expired)
  // - canceled (until current period end)
  // - past_due (during grace period)
  // Suspended and expired subscriptions NEVER grant active access.
  const hasSubscription = Boolean(
    subscription &&
    !isSuspended &&
    !isExpired &&
    (isActive || isCanceledActive || inGracePeriod)
  );

  // Plan Details
  const planName =
    subscription?.planSnapshot?.name ||
    subscription?.plan?.name ||
    (subscription && !isExpired ? "Creator Membership" : "Free Membership");

  const billingCycle = subscription?.billingCycle
    ? subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)
    : "None";

  // Credit Allowances & Usage from Backend Models
  const monthlyCreditLimit =
    subscription?.planSnapshot?.monthlyApplicationCredits ||
    subscription?.quotaState?.monthlyCreditsAllocated ||
    subscription?.plan?.monthlyApplicationCredits ||
    0;

  const creditsUsed = subscription?.quotaState?.creditsUsed || 0;

  // Authoritative Remaining Credits: uses creditBalance if returned, or fallback
  const remainingCredits =
    subscription?.creditBalance?.currentBalance !== undefined
      ? subscription.creditBalance.currentBalance
      : Math.max(0, monthlyCreditLimit - creditsUsed);

  // Status Badge Rendering
  const renderStatusBadge = () => {
    if (isSuspended) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF1F2] dark:bg-[#2A1215] text-[#E11D48] dark:text-[#FB7185] border border-[#FECDD3] dark:border-[#4A1D24]">
          Suspended
        </span>
      );
    }
    if (isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] dark:bg-[#064E3B]/30 text-[#059669] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]">
          Active Plan
        </span>
      );
    }
    if (isPastDue) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] dark:bg-[#451A03]/30 text-[#D97706] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#78350F]">
          {inGracePeriod ? "Payment Past Due" : "Grace Period Expired"}
        </span>
      );
    }
    if (isCanceled) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] dark:bg-[#431407]/30 text-[#EA580C] dark:text-[#FB923C] border border-[#FED7AA] dark:border-[#7C2D12]">
          {isCanceledActive ? "Cancels at Period End" : "Canceled"}
        </span>
      );
    }
    if (!subscription || isExpired) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF5F8] dark:bg-[#2A171E] text-[#FF2D6C] dark:text-[#FF6B9D] border border-[#FFE4ED] dark:border-[#421D2A]">
          Free Tier
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F3F4F6] dark:bg-[#262626] text-[#374151] dark:text-[#D4D4D4] border border-[#E5E7EB] dark:border-[#404040]">
        {subscription?.status || "Inactive"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF7F8] dark:bg-[#111111] text-[#111111] dark:text-white flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-6xl w-full mx-auto">
          {/* Top Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF2D6C]">
                MEMBERSHIP & CREDITS
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-white mt-1">
                Subscription & Credits
              </h1>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1.5">
                Manage your creator plan, application credits, and billing validity.
              </p>
            </div>

            <Link
              href="/creator/subscription/plans"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#000000] text-white dark:bg-[#1E1E22] dark:border dark:border-[#333338] text-sm font-semibold hover:bg-neutral-900 dark:hover:bg-[#28282E] active:scale-[0.99] transition-all cursor-pointer self-start sm:self-center shrink-0 w-full sm:w-auto"
            >
              <CrownIcon className="w-4 h-4 text-[#FF2D6C]" />
              <span>{hasSubscription ? "Manage Plan" : "Upgrade Plan"}</span>
            </Link>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-[#FFF1F2] dark:bg-[#2A1215] border border-[#FECDD3] dark:border-[#4A1D24] text-xs text-[#E11D48] dark:text-[#FB7185] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertIcon className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1 font-semibold underline hover:no-underline cursor-pointer"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Suspended Notice Banner */}
          {isSuspended && (
            <div className="p-4 rounded-2xl bg-[#FFF1F2] dark:bg-[#2A1215] border border-[#FECDD3] dark:border-[#4A1D24] flex items-start gap-3 text-xs">
              <AlertIcon className="w-5 h-5 text-[#E11D48] dark:text-[#FB7185] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#9F1239] dark:text-[#FB7185]">
                  Subscription Suspended
                </span>
                <p className="text-[#BE123C] dark:text-[#FDA4AF] mt-0.5">
                  Your Creator subscription has been suspended by platform administration. Campaign applications and credit spending are currently paused.
                </p>
              </div>
            </div>
          )}

          {/* Past Due Warning Banner */}
          {isPastDue && inGracePeriod && (
            <div className="p-4 rounded-2xl bg-[#FFFBEB] dark:bg-[#261A0E] border border-[#FDE68A] dark:border-[#452B14] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <AlertIcon className="w-5 h-5 text-[#D97706] dark:text-[#FBBF24] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#92400E] dark:text-[#FBBF24]">
                    Payment Past Due — Grace Period Active
                  </span>
                  <p className="text-[#B45309] dark:text-[#FCD34D] mt-0.5">
                    Your renewal payment was unsuccessful. You are currently in a grace period ending on{" "}
                    <strong>{formatDate(subscription?.gracePeriodEnd)}</strong>. Please resolve payment to prevent credit expiration.
                  </p>
                </div>
              </div>
              <Link
                href="/creator/subscription/plans"
                className="px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-center whitespace-nowrap transition-colors"
              >
                Resolve Payment ↗
              </Link>
            </div>
          )}

          {/* Past Due Grace Period Expired Banner */}
          {isPastDue && !inGracePeriod && (
            <div className="p-4 rounded-2xl bg-[#FFF1F2] dark:bg-[#2A1215] border border-[#FECDD3] dark:border-[#4A1D24] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <AlertIcon className="w-5 h-5 text-[#E11D48] dark:text-[#FB7185] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#9F1239] dark:text-[#FB7185]">
                    Subscription Grace Period Expired
                  </span>
                  <p className="text-[#BE123C] dark:text-[#FDA4AF] mt-0.5">
                    Your renewal grace period has expired. Application access is disabled until payment is resolved.
                  </p>
                </div>
              </div>
              <Link
                href="/creator/subscription/plans"
                className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-center whitespace-nowrap transition-colors"
              >
                Resolve Payment ↗
              </Link>
            </div>
          )}

          {/* Cancellation Notice Banner */}
          {isCanceled && isCanceledActive && (
            <div className="p-4 rounded-2xl bg-[#FFF7ED] dark:bg-[#26170E] border border-[#FED7AA] dark:border-[#4A2614] flex items-start gap-3 text-xs">
              <AlertIcon className="w-5 h-5 text-[#EA580C] dark:text-[#FB923C] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#9A3412] dark:text-[#FB923C]">
                  Plan Scheduled for Cancellation
                </span>
                <p className="text-[#C2410C] dark:text-[#FDBA74] mt-0.5">
                  Your plan will not auto-renew and will expire on <strong>{formatDate(subscription?.currentPeriodEnd)}</strong>.
                  You retain full access to apply for campaigns with your remaining credits until the period ends.
                </p>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {loading ? (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
                <div className="h-48 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2A2A]" />
                <div className="h-48 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2A2A]" />
                <div className="h-48 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2A2A]" />
              </div>
              <div className="h-64 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2A2A] animate-pulse" />
            </div>
          ) : (
            <>
              {/* THREE SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* CARD 1: Current Membership */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col justify-between min-h-[190px] shadow-2xs transition-colors">
                  <div>
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF5F8] dark:bg-[#2A171E] border border-[#FFE4ED] dark:border-[#421D2A] flex items-center justify-center text-[#FF2D6C] shrink-0">
                        <CrownIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                          Current Membership
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-[#111111] dark:text-white leading-tight mt-0.5 truncate">
                          {planName}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed mt-4">
                      {isSuspended
                        ? "Subscription suspended by platform administration."
                        : hasSubscription
                        ? isCanceled
                          ? "Plan canceled; retains application access until period end."
                          : isPastDue
                          ? "Grace period active; resolve payment to keep benefits."
                          : `Enrolled in ${billingCycle.toLowerCase()} membership.`
                        : "Free tier accounts can manage portfolio and receive brand invites."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between mt-5">
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Account Status</span>
                    {renderStatusBadge()}
                  </div>
                </div>

                {/* CARD 2: Application Credits */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col justify-between min-h-[190px] shadow-2xs transition-colors">
                  <div>
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF5F8] dark:bg-[#2A171E] border border-[#FFE4ED] dark:border-[#421D2A] flex items-center justify-center text-[#FF2D6C] shrink-0">
                        <LayersIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                          Application Credits
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-bold text-[#111111] dark:text-white">
                            {hasSubscription ? remainingCredits : 0}
                          </span>
                          <span className="text-sm font-bold text-[#111111] dark:text-white">
                            / {hasSubscription ? monthlyCreditLimit : 0} Credits
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed mt-4">
                      {isSuspended
                        ? "Credits are locked while subscription is suspended."
                        : hasSubscription
                        ? "Each campaign application consumes exactly 1 credit."
                        : "Paid plans include monthly application credits."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between mt-5 text-xs">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Monthly Allowance</span>
                    <span className="font-bold text-[#111111] dark:text-white">
                      {hasSubscription ? monthlyCreditLimit : 0} Credits / Month
                    </span>
                  </div>
                </div>

                {/* CARD 3: Validity & Expiry */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col justify-between min-h-[190px] shadow-2xs transition-colors">
                  <div>
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF5F8] dark:bg-[#2A171E] border border-[#FFE4ED] dark:border-[#421D2A] flex items-center justify-center text-[#FF2D6C] shrink-0">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                          Validity & Expiry
                        </span>
                        <div className="mt-0.5">
                          <span className="text-lg sm:text-xl font-bold text-[#111111] dark:text-white leading-tight truncate block">
                            {isSuspended
                              ? "— Account Suspended"
                              : hasSubscription
                              ? `${daysLeft} Days Remaining`
                              : "— No active cycle"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed mt-4">
                      {isSuspended
                        ? "Contact support to resolve account suspension."
                        : hasSubscription
                        ? `Valid until ${formatDate(subscription?.currentPeriodEnd)}`
                        : "Subscribe to unlock monthly application credits."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between mt-5 text-xs">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Started On</span>
                    <span className="font-bold text-[#111111] dark:text-white">
                      {subscription?.currentPeriodStart ? formatDate(subscription.currentPeriodStart) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION */}
              {!hasSubscription ? (
                /* FREE CREATOR UPGRADE PROMPT (Exact Match to Screenshot in both light & dark mode) */
                <div className="rounded-2xl bg-[#FFF5F8] dark:bg-[#1E1418] border border-[#FFE4ED] dark:border-[#381E27] p-6 sm:p-8 transition-colors">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
                    {/* Left Column */}
                    <div className="lg:col-span-7 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FF2D6C]">
                        CREATOR MEMBERSHIP
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-white">
                        Unlock Campaign Applications
                      </h2>
                      <p className="text-sm text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed max-w-xl">
                        To actively apply to verified brand campaigns on CreatorLink, upgrade to an active Creator Membership plan.
                      </p>
                      <div className="pt-3">
                        <Link
                          href="/creator/subscription/plans"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#000000] text-white dark:bg-[#000000] dark:border dark:border-[#381E27] text-sm font-semibold hover:bg-neutral-900 dark:hover:bg-[#141416] active:scale-[0.99] transition-all cursor-pointer w-full sm:w-auto"
                        >
                          <span>Explore Membership Plans</span>
                          <span className="text-[#FF2D6C] font-bold text-base leading-none">›</span>
                        </Link>
                      </div>
                    </div>

                    {/* Right Column with subtle vertical divider on desktop */}
                    <div className="lg:col-span-5 border-t border-[#F3D7E2] dark:border-[#381E27] pt-6 lg:border-t-0 lg:pt-0 lg:pl-10 lg:border-l lg:border-[#F3D7E2] dark:lg:border-[#381E27] space-y-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFE4ED] dark:bg-[#331822] text-[#FF2D6C] dark:text-[#FF6B9D] flex items-center justify-center shrink-0">
                          <CheckIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-[#111111] dark:text-[#E4E4E7]">
                          Browse all campaigns
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFE4ED] dark:bg-[#331822] text-[#FF2D6C] dark:text-[#FF6B9D] flex items-center justify-center shrink-0">
                          <CheckIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-[#111111] dark:text-[#E4E4E7]">
                          Receive direct brand proposals
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFE4ED] dark:bg-[#331822] text-[#FF2D6C] dark:text-[#FF6B9D] flex items-center justify-center shrink-0">
                          <CheckIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-[#111111] dark:text-[#E4E4E7]">
                          Apply to campaigns with monthly credits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* PAID CREATOR ACTIVE MEMBERSHIP OVERVIEW */
                <div className="rounded-2xl bg-[#FFF5F8] dark:bg-[#1E1418] border border-[#FFE4ED] dark:border-[#381E27] p-6 sm:p-8 transition-colors">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
                    {/* Left Column */}
                    <div className="lg:col-span-7 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FF2D6C]">
                        CREATOR MEMBERSHIP
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-white">
                        {planName} Active Membership
                      </h2>
                      <p className="text-sm text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed max-w-xl">
                        Your subscription includes active campaign pitch capabilities and access to verified brand opportunities.
                      </p>
                      <div className="pt-3">
                        <Link
                          href="/creator/subscription/plans"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#000000] text-white dark:bg-[#000000] dark:border dark:border-[#381E27] text-sm font-semibold hover:bg-neutral-900 dark:hover:bg-[#141416] active:scale-[0.99] transition-all cursor-pointer w-full sm:w-auto"
                        >
                          <span>Manage Membership Plans</span>
                          <span className="text-[#FF2D6C] font-bold text-base leading-none">›</span>
                        </Link>
                      </div>
                    </div>

                    {/* Right Column with subtle vertical divider on desktop */}
                    <div className="lg:col-span-5 border-t border-[#F3D7E2] dark:border-[#381E27] pt-6 lg:border-t-0 lg:pt-0 lg:pl-10 lg:border-l lg:border-[#F3D7E2] dark:lg:border-[#381E27] space-y-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFE4ED] dark:bg-[#331822] text-[#FF2D6C] dark:text-[#FF6B9D] flex items-center justify-center shrink-0">
                          <CheckIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-[#111111] dark:text-[#E4E4E7]">
                          <strong>{monthlyCreditLimit} Campaign Applications</strong> / month
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFE4ED] dark:bg-[#331822] text-[#FF2D6C] dark:text-[#FF6B9D] flex items-center justify-center shrink-0">
                          <CheckIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-[#111111] dark:text-[#E4E4E7]">
                          Receive direct brand proposals with zero credit deductions
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFE4ED] dark:bg-[#331822] text-[#FF2D6C] dark:text-[#FF6B9D] flex items-center justify-center shrink-0">
                          <CheckIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-[#111111] dark:text-[#E4E4E7]">
                          Valid through {formatDate(subscription?.currentPeriodEnd)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
