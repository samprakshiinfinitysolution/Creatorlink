"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCreatorPayments,
  clearPaymentError,
} from "@/redux/creator/payments/payments_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import CreatorPaymentDetailModal from "./CreatorPaymentDetailModal";

// =========================================================
// SVG ICONS
// =========================================================
function WalletIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7V4a1 1 0 00-1-1H5a2 2 0 000 4h15a1 1 0 011 1v4h-3a2 2 0 000 4h3a1 1 0 001-1v-2a1 1 0 00-1-1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5v14a2 2 0 002 2h15a1 1 0 001-1v-4" />
    </svg>
  );
}

function FileTextIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
      <polyline strokeLinecap="round" strokeLinejoin="round" points="14 2 14 8 20 8" />
      <line strokeLinecap="round" strokeLinejoin="round" x1="16" y1="13" x2="8" y2="13" />
      <line strokeLinecap="round" strokeLinejoin="round" x1="16" y1="17" x2="8" y2="17" />
      <line strokeLinecap="round" strokeLinejoin="round" x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function HourglassIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 22h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 2h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 22v-4.172a2 2 0 00-.586-1.414L12 12l-4.414 4.414A2 2 0 007 17.828V22" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 2v4.172a2 2 0 00.586 1.414L12 12l4.414-4.414A2 2 0 0017 6.172V2" />
    </svg>
  );
}

function CreditCardIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
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

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

// =========================================================
// HELPER UTILITIES & STATUS BADGES
// =========================================================
const formatPrice = (amount, currency = "INR") => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) return "N/A";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(numericAmount)}`;
};

const formatPaymentDate = (dateString) => {
  if (!dateString) return { date: "N/A", time: null };
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { date: "N/A", time: null };
    const date = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { date, time };
  } catch {
    return { date: "N/A", time: null };
  }
};

const getStatusBadge = (status) => {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "paid":
    case "completed":
      return {
        label: "COMPLETED",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-200/80 dark:border-emerald-800/50",
        iconType: "check",
      };
    case "pending":
      return {
        label: "PENDING",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200/80 dark:border-amber-800/50",
        iconType: "pending",
      };
    case "processing":
      return {
        label: "PROCESSING",
        bg: "bg-purple-50 dark:bg-purple-950/40",
        text: "text-purple-700 dark:text-purple-400",
        border: "border-purple-200/80 dark:border-purple-800/50",
        iconType: "processing",
      };
    case "failed":
      return {
        label: "FAILED",
        bg: "bg-red-50 dark:bg-red-950/40",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200/80 dark:border-red-800/50",
        iconType: "failed",
      };
    default:
      return {
        label: (status || "UNKNOWN").toUpperCase(),
        bg: "bg-neutral-100 dark:bg-surface-muted",
        text: "text-neutral-700 dark:text-neutral-300",
        border: "border-neutral-200 dark:border-border-theme",
        iconType: "default",
      };
  }
};

const getCampaignInitials = (title) => {
  if (title && typeof title === "string" && title.trim()) {
    const words = title.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].slice(0, 2).toUpperCase();
  }
  return "CP";
};

function CampaignAvatar({ image, title }) {
  const [failedUrl, setFailedUrl] = useState(null);

  const initials = getCampaignInitials(title);
  const isImageValid = Boolean(image && typeof image === "string" && image.trim() && failedUrl !== image);

  if (isImageValid) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-secondary/10 dark:bg-secondary/15 shrink-0 border border-neutral-200/60 dark:border-border-theme">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title || "Campaign"}
          onError={() => setFailedUrl(image)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={title || "Campaign avatar"}
      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-secondary/10 dark:bg-secondary/15 text-neutral-950 dark:text-white flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-border-theme font-bold text-xs sm:text-sm tracking-wide select-none"
    >
      {initials}
    </div>
  );
}

export default function CreatorPaymentsManager() {
  const dispatch = useDispatch();
  const { payments, pagination, loading, error } = useSelector(
    (state) => state.creatorPayments
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
    };
    if (selectedStatus !== "all") {
      params.status = selectedStatus;
    }
    dispatch(fetchCreatorPayments(params));
  }, [dispatch, currentPage, selectedStatus]);

  const handleRefresh = () => {
    const params = {
      page: currentPage,
      limit: 10,
    };
    if (selectedStatus !== "all") {
      params.status = selectedStatus;
    }
    dispatch(fetchCreatorPayments(params));
  };

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleViewDetails = (payment) => {
    setSelectedPaymentDetail(payment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPaymentDetail(null);
  };

  // Calculate summary stats from current payments list
  const totalPaidAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const pendingCount = payments.filter((p) => p.status === "pending" || p.status === "processing").length;
  const hasTestModeRecord = payments.some((p) => p.isTestMode);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {hasTestModeRecord && (
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-wider">
                    Razorpay Test Mode Enabled
                  </span>
                </div>
              )}
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground mt-1">
                Received Payments & Earnings
              </h1>
              <p className="text-xs text-text-secondary mt-1">
                View verified payment records and escrow receipts for your campaign collaborations.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-neutral-950 dark:text-white flex items-center justify-center shrink-0">
                <WalletIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                  Page Paid Volume
                </span>
                <span className="font-serif font-bold text-2xl text-emerald-500 block">
                  {formatPrice(totalPaidAmount)}
                </span>
                <span className="text-[10px] text-text-secondary block">
                  Verified paid records on current page
                </span>
              </div>
            </div>

            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-neutral-950 dark:text-white flex items-center justify-center shrink-0">
                <FileTextIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                  Total Account Records
                </span>
                <span className="font-serif font-bold text-2xl text-foreground block">
                  {pagination?.totalItems ?? payments.length}
                </span>
                <span className="text-[10px] text-text-secondary block">
                  Total received payment entries across all pages
                </span>
              </div>
            </div>

            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-neutral-950 dark:text-white flex items-center justify-center shrink-0">
                <HourglassIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                  Page Pending / Processing
                </span>
                <span className="font-serif font-bold text-2xl text-amber-500 block">
                  {pendingCount}
                </span>
                <span className="text-[10px] text-text-secondary block">
                  Awaiting Brand payment or verification on this page
                </span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4">
              <span>{typeof error === "string" ? error : "Failed to load received payment history."}</span>
              <button
                type="button"
                onClick={() => dispatch(clearPaymentError())}
                className="text-xs underline font-semibold cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
            {[
              { id: "all", label: "All Payments" },
              { id: "paid", label: "Paid Only" },
              { id: "pending", label: "Pending" },
              { id: "processing", label: "Processing" },
              { id: "failed", label: "Failed" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleStatusFilterChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === tab.id
                    ? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                    : "bg-neutral-100/90 dark:bg-surface-muted text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payments Data Table */}
          <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl shadow-xs overflow-hidden">
            {loading ? (
              /* Loading Skeleton */
              <div className="p-6 space-y-3.5 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-surface-muted rounded-xl w-full" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-surface-muted text-black dark:text-white flex items-center justify-center mx-auto border border-neutral-200 dark:border-border-theme">
                  <CreditCardIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-semibold text-lg text-foreground">
                    No Received Payments Found
                  </h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                    {selectedStatus === "all"
                      ? "You haven't received any payments yet. Once brands approve your completed workspace deliverables and release payment, records will appear here."
                      : `No payment records match the filter '${selectedStatus}'.`}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/creator/workspace"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer dark:bg-white dark:text-black dark:hover:bg-neutral-100"
                  >
                    <span>View Active Workspaces</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Data Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[720px]">
                  <thead className="bg-neutral-50/70 dark:bg-surface-muted/60 text-text-secondary font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] border-b border-neutral-200/80 dark:border-border-theme">
                    <tr>
                      <th className="py-3 px-4">Campaign &amp; Brand</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Razorpay Ref</th>
                      <th className="py-3 px-4">
                        <div className="inline-flex items-center gap-1">
                          <span>Date</span>
                          <svg
                            className="w-3 h-3 text-neutral-400 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                          </svg>
                        </div>
                      </th>
                      <th className="py-3 px-4">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-border-theme/40">
                    {payments.map((payment) => {
                      const badge = getStatusBadge(payment.status);
                      const campaignTitle =
                        typeof payment.campaign === "object" && payment.campaign !== null && payment.campaign.title
                          ? payment.campaign.title
                          : "Campaign Workspace";
                      const brandName =
                        typeof payment.brand === "object" && payment.brand !== null && payment.brand.name
                          ? payment.brand.name
                          : "Brand Partner";
                      const campaignImage =
                        typeof payment.campaign === "object" && payment.campaign !== null
                          ? (typeof payment.campaign.coverImage === "string" ? payment.campaign.coverImage : payment.campaign.coverImage?.url) ||
                            (typeof payment.campaign.image === "string" ? payment.campaign.image : payment.campaign.image?.url) ||
                            (Array.isArray(payment.campaign.images) && payment.campaign.images.length > 0
                              ? (typeof payment.campaign.images[0] === "string" ? payment.campaign.images[0] : payment.campaign.images[0]?.url)
                              : null)
                          : null;
                      const dateObj = formatPaymentDate(payment.paidAt || payment.createdAt);

                      return (
                        <tr
                          key={payment._id}
                          className="hover:bg-neutral-50/60 dark:hover:bg-surface-muted/40 transition-colors"
                        >
                          {/* Campaign & Brand */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <CampaignAvatar image={campaignImage} title={campaignTitle} />
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground text-xs sm:text-sm line-clamp-1">
                                    {campaignTitle}
                                  </span>
                                  <svg className="w-3.5 h-3.5 text-text-secondary/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                  </svg>
                                </div>
                                <span className="text-[11px] text-text-secondary block truncate">
                                  Brand: {brandName}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-4 font-sans font-bold text-sm sm:text-base text-neutral-950 dark:text-white tabular-nums tracking-tight whitespace-nowrap">
                            {formatPrice(payment.amount, payment.currency)}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border uppercase ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.iconType === "check" && (
                                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </span>
                              )}
                              {badge.iconType === "pending" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              )}
                              {badge.iconType === "processing" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
                              )}
                              {badge.iconType === "failed" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              )}
                              <span>{badge.label}</span>
                            </span>
                          </td>

                          {/* Payment Method */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-block font-mono text-[10.5px] px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-surface-muted text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-border-theme font-medium tracking-wide">
                              {payment.paymentMethod || "RAZORPAY_TEST"}
                            </span>
                          </td>

                          {/* Razorpay Ref */}
                          <td className="py-3 px-4 font-mono text-xs text-text-secondary whitespace-nowrap">
                            {payment.transactionId || payment.razorpayPaymentId || payment.razorpayOrderId || "-"}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-xs whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="font-medium text-neutral-800 dark:text-neutral-200 block">
                                {dateObj.date}
                              </span>
                              {dateObj.time && (
                                <span className="text-[10px] text-text-secondary block">
                                  {dateObj.time}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* View Receipt */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(payment)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-border-theme bg-white dark:bg-surface hover:bg-neutral-50 dark:hover:bg-surface-muted text-neutral-900 dark:text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                            >
                              <EyeIcon className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                              <span>View Receipt</span>
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
            {payments.length > 0 && (
              <div className="px-6 py-4 border-t border-neutral-100 dark:border-border-theme/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {(() => {
                  const totalRecords = pagination?.totalItems ?? payments.length;
                  const currentPageNum = pagination?.page || pagination?.currentPage || currentPage || 1;
                  const totalPages = pagination?.totalPages || 1;
                  const limit = pagination?.limit || 10;
                  const startRecord = totalRecords === 0 ? 0 : (currentPageNum - 1) * limit + 1;
                  const endRecord = Math.min(currentPageNum * limit, totalRecords);

                  return (
                    <>
                      <span className="text-text-secondary">
                        Showing {startRecord} to {endRecord} of {totalRecords} payments
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPageNum <= 1 || loading}
                          aria-label="Previous page"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-neutral-200/80 dark:border-border-theme bg-white dark:bg-surface hover:bg-neutral-50 dark:hover:bg-surface-muted text-neutral-700 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                        >
                          <ChevronLeftIcon className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs flex items-center justify-center shadow-xs">
                          {currentPageNum}
                        </span>

                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPageNum >= totalPages || loading}
                          aria-label="Next page"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-neutral-200/80 dark:border-border-theme bg-white dark:bg-surface hover:bg-neutral-50 dark:hover:bg-surface-muted text-neutral-700 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                        >
                          <ChevronRightIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Payment Detail Modal */}
      <CreatorPaymentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        payment={selectedPaymentDetail}
      />
    </div>
  );
}
