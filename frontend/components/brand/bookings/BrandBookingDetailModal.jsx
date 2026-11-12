"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandBookingById,
  updateBrandBookingStatus,
  clearSelectedBooking,
} from "@/redux/brand/bookings/bookings_slice";
import { formatCampaignPlatforms } from "@/lib/campaignPlatforms";

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

function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  booking: propBooking = null,
}) {
  const dispatch = useDispatch();

  const { selectedBooking, bookings: listBookings, loading, error, submitting, successMessage } = useSelector(
    (state) => state.brandBookings || {}
  );

  const [confirmAction, setConfirmAction] = useState(null); // 'accept' | 'reject' | null
  const [localFeedback, setLocalFeedback] = useState(null);
  const [subStatus, setSubStatus] = useState(null);

  // Fetch full details when modal opens with bookingId
  useEffect(() => {
    if (isOpen && bookingId) {
      dispatch(fetchBrandBookingById(bookingId));
      axiosInstance
        .get("/api/subscriptions/status")
        .then((res) => {
          if (res.data?.data) {
            setSubStatus(res.data.data);
          }
        })
        .catch(() => {});
      queueMicrotask(() => {
        setConfirmAction(null);
        if (confirmAction === "accept" && subStatus && subStatus.hasEntitlement === false) {
      setLocalFeedback({
        type: "error",
        message: "An active subscription or free trial is required to accept booking applications and launch new collaborations. Please upgrade your plan.",
      });
      setConfirmAction(null);
      return;
    }

    setLocalFeedback(null);
      });
    }
  }, [dispatch, isOpen, bookingId]);

  const handleClose = () => {
    if (submitting) return;
    setConfirmAction(null);
    if (confirmAction === "accept" && subStatus && subStatus.hasEntitlement === false) {
      setLocalFeedback({
        type: "error",
        message: "An active subscription or free trial is required to accept booking applications and launch new collaborations. Please upgrade your plan.",
      });
      setConfirmAction(null);
      return;
    }

    setLocalFeedback(null);
    dispatch(clearSelectedBooking());
    onClose();
  };

  const handleRetryDetail = () => {
    if (bookingId) {
      dispatch(fetchBrandBookingById(bookingId));
      axiosInstance
        .get("/api/subscriptions/status")
        .then((res) => {
          if (res.data?.data) {
            setSubStatus(res.data.data);
          }
        })
        .catch(() => {});
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmAction || !bookingId || submitting) return;
    if (booking?.initiatedBy === "brand") return;

    if (confirmAction === "accept" && subStatus && subStatus.hasEntitlement === false) {
      setLocalFeedback({
        type: "error",
        message: "An active subscription or free trial is required to accept booking applications and launch new collaborations. Please upgrade your plan.",
      });
      setConfirmAction(null);
      return;
    }

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

  const booking =
    propBooking ||
    (selectedBooking && ((selectedBooking._id || selectedBooking.id) === bookingId) ? selectedBooking : null) ||
    (Array.isArray(listBookings) ? listBookings.find((b) => (b._id || b.id) === bookingId) : null) ||
    selectedBooking;
  const isPending = booking?.status?.toLowerCase() === "pending";
  const isBrandInitiated = booking?.initiatedBy === "brand";
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
  const campaignPlatform = formatCampaignPlatforms(booking?.campaign?.platform, "N/A");
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

  // Profile metrics for eligibility comparison
  const rawFollowers =
    booking?.creator?.followerCount ??
    booking?.creator?.followers ??
    booking?.creatorProfile?.followerCount ??
    booking?.creatorProfile?.followersCount ??
    booking?.creator?.profile?.followerCount ??
    booking?.creator?.creatorProfile?.followerCount;

  const creatorFollowers =
    rawFollowers !== undefined && rawFollowers !== null && rawFollowers !== "" && !isNaN(Number(rawFollowers))
      ? Number(rawFollowers)
      : null;

  const rawEngagement =
    booking?.creator?.engagementRate ??
    booking?.creatorProfile?.engagementRate ??
    booking?.creator?.profile?.engagementRate ??
    booking?.creator?.creatorProfile?.engagementRate;

  const creatorEngagement =
    rawEngagement !== undefined && rawEngagement !== null && rawEngagement !== "" && !isNaN(Number(rawEngagement))
      ? Number(rawEngagement)
      : null;

  const hasCampaign = Boolean(booking?.campaign);

  const rawMinFollowers =
    booking?.campaign?.creatorRequirements?.minFollowers ??
    booking?.campaign?.minFollowers;
  const minFollowersReq =
    typeof rawMinFollowers === "number"
      ? rawMinFollowers
      : rawMinFollowers !== undefined && rawMinFollowers !== null && !isNaN(Number(rawMinFollowers))
        ? Number(rawMinFollowers)
        : 0;

  const rawMinEngagement =
    booking?.campaign?.creatorRequirements?.minEngagementRate ??
    booking?.campaign?.minEngagementRate;
  const minEngagementReq =
    typeof rawMinEngagement === "number"
      ? rawMinEngagement
      : rawMinEngagement !== undefined && rawMinEngagement !== null && !isNaN(Number(rawMinEngagement))
        ? Number(rawMinEngagement)
        : 0;

  const getFollowersComparison = () => {
    if (!hasCampaign) {
      return {
        requirement: "Direct Booking (No Minimum)",
        actual: creatorFollowers !== null ? `${creatorFollowers.toLocaleString()} Followers` : "Not Available",
        status: "meets",
        statusLabel: "Meets Requirements",
        badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }

    const requirementText = minFollowersReq > 0
      ? `${minFollowersReq.toLocaleString()} Followers`
      : "No Minimum";

    if (minFollowersReq <= 0) {
      return {
        requirement: requirementText,
        actual: creatorFollowers !== null ? `${creatorFollowers.toLocaleString()} Followers` : "Not Available",
        status: "meets",
        statusLabel: "Meets Requirements",
        badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }

    if (creatorFollowers === null) {
      return {
        requirement: requirementText,
        actual: "Not Available",
        status: "na",
        statusLabel: "Not Available",
        badgeColor: "bg-surface-muted text-text-secondary border-border-theme",
      };
    }

    if (creatorFollowers >= minFollowersReq) {
      return {
        requirement: requirementText,
        actual: `${creatorFollowers.toLocaleString()} Followers`,
        status: "meets",
        statusLabel: "Meets Requirements",
        badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }

    return {
      requirement: requirementText,
      actual: `${creatorFollowers.toLocaleString()} Followers`,
      status: "below",
      statusLabel: "Below Requirements",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    };
  };

  const getEngagementComparison = () => {
    if (!hasCampaign) {
      return {
        requirement: "Direct Booking (No Minimum)",
        actual: creatorEngagement !== null ? `${creatorEngagement}% Engagement` : "Not Available",
        status: "meets",
        statusLabel: "Meets Requirements",
        badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }

    const requirementText = minEngagementReq > 0
      ? `${minEngagementReq}% Engagement`
      : "No Minimum";

    if (minEngagementReq <= 0) {
      return {
        requirement: requirementText,
        actual: creatorEngagement !== null ? `${creatorEngagement}% Engagement` : "Not Available",
        status: "meets",
        statusLabel: "Meets Requirements",
        badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }

    if (creatorEngagement === null) {
      return {
        requirement: requirementText,
        actual: "Not Available",
        status: "na",
        statusLabel: "Not Available",
        badgeColor: "bg-surface-muted text-text-secondary border-border-theme",
      };
    }

    if (creatorEngagement >= minEngagementReq) {
      return {
        requirement: requirementText,
        actual: `${creatorEngagement}% Engagement`,
        status: "meets",
        statusLabel: "Meets Requirements",
        badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }

    return {
      requirement: requirementText,
      actual: `${creatorEngagement}% Engagement`,
      status: "below",
      statusLabel: "Below Requirements",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    };
  };

  const followersComparison = getFollowersComparison();
  const engagementComparison = getEngagementComparison();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-border-theme flex items-center justify-between bg-surface">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20 uppercase tracking-wide">
                {isBrandInitiated ? "Direct Proposal" : "Booking Request Details"}
              </span>
              {booking?.status && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <h2 className="font-sans font-semibold text-xl text-foreground tracking-tight mt-1">
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

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
              className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 border ${localFeedback.type === "success"
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
          {booking && (
            <div className="space-y-6">

              {/* Creator & Proposal Overview Card */}
              <div className="bg-surface-muted/40 border border-border-theme rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Creator & Proposal Summary
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-text-secondary block">Creator Name</span>
                    <span className="text-sm font-semibold text-foreground block mt-0.5 break-words">{creatorName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block">Creator Email</span>
                    <span className="text-sm font-semibold text-foreground block mt-0.5 break-all">{creatorEmail}</span>
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
                    <span className="text-xs text-text-secondary block mb-1">{isBrandInitiated ? "Brand Proposal Message / Note:" : "Creator Message / Pitch:"}</span>
                    <p className="text-xs text-foreground bg-surface p-3 rounded-xl border border-border-theme whitespace-pre-line">
                      {message}
                    </p>
                  </div>
                )}
              </div>

              {/* Creator Eligibility & Profile Metrics Card */}
              <div className="bg-surface-muted/40 border border-border-theme rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Creator Eligibility & Profile Metrics
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface border border-border-theme text-text-secondary">
                    Soft Guideline
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[460px]">
                    <thead>
                      <tr className="border-b border-border-theme text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        <th className="pb-2.5 pr-4 font-semibold">Metric</th>
                        <th className="pb-2.5 px-4 font-semibold">Campaign Requirement</th>
                        <th className="pb-2.5 px-4 font-semibold">Creator Actual</th>
                        <th className="pb-2.5 pl-4 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-theme/60 text-xs">
                      {/* Followers Row */}
                      <tr>
                        <td className="py-3 pr-4 font-medium text-foreground whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                            <span>Followers</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-medium whitespace-nowrap">
                          {followersComparison.requirement}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                          {followersComparison.actual}
                        </td>
                        <td className="py-3 pl-4 text-right whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${followersComparison.badgeColor}`}>
                            {followersComparison.statusLabel}
                          </span>
                        </td>
                      </tr>

                      {/* Engagement Rate Row */}
                      <tr>
                        <td className="py-3 pr-4 font-medium text-foreground whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                            <span>Engagement Rate</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-medium whitespace-nowrap">
                          {engagementComparison.requirement}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                          {engagementComparison.actual}
                        </td>
                        <td className="py-3 pl-4 text-right whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${engagementComparison.badgeColor}`}>
                            {engagementComparison.statusLabel}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Soft Guideline Note */}
                <div className="flex items-start gap-2 pt-2 border-t border-border-theme/60 text-[11px] text-text-secondary">
                  <svg className="w-4 h-4 text-text-secondary/70 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <span>
                    Campaign eligibility criteria serve as a soft guideline to inform your decision. You retain full autonomy to accept or decline any proposal.
                  </span>
                </div>
              </div>

              {/* Campaign Information Card */}
              <div className="bg-surface-muted/40 border border-border-theme rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Campaign Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-text-secondary block">Campaign Title</span>
                    <span className="font-semibold text-foreground block mt-0.5 break-words">{campaignTitle}</span>
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
            isBrandInitiated ? (
              <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
                  <ClockIcon className="w-4 h-4 shrink-0" />
                  <span>Awaiting Creator Response</span>
                </div>
              </div>
            ) : (
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
                    className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${confirmAction === "accept"
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
                    onClick={() => {
                      if (subStatus && subStatus.hasEntitlement === false) {
                        setLocalFeedback({
                          type: "error",
                          message: "An active subscription or free trial is required to accept booking applications and launch new collaborations. Please upgrade your plan.",
                        });
                        return;
                      }
                      setConfirmAction("accept");
                    }}
                    disabled={submitting}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckIcon />
                    <span>Accept Request</span>
                  </button>
                </div>
              )}
            </div>
            )
          )}

          {/* Accepted or In-Progress Workspace Action */}
          {(booking?.status?.toLowerCase() === "accepted" ||
            booking?.status?.toLowerCase() === "in_progress") && (
              <Link
                href={`/brand/workspace/${booking._id || booking.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>Open Workspace</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            )}
        </div>
      </div>
    </div>
  );
}
