"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandPayments,
  clearPaymentError,
} from "@/redux/brand/payments/payments_slice";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandPaymentDetailModal from "./BrandPaymentDetailModal";

// =========================================================
// SVG ICONS
// =========================================================
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

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "paid":
      return {
        label: "Paid",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "pending":
      return {
        label: "Pending",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "processing":
      return {
        label: "Processing",
        color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      };
    case "failed":
      return {
        label: "Failed",
        color: "bg-red-500/10 text-red-500 border-red-500/20",
      };
    default:
      return {
        label: status || "Unknown",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
};

export default function BrandPaymentsManager() {
  const dispatch = useDispatch();
  const { payments, pagination, loading, error } = useSelector(
    (state) => state.brandPayments
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
    dispatch(fetchBrandPayments(params));
  }, [dispatch, currentPage, selectedStatus]);

  const handleRefresh = () => {
    const params = {
      page: currentPage,
      limit: 10,
    };
    if (selectedStatus !== "all") {
      params.status = selectedStatus;
    }
    dispatch(fetchBrandPayments(params));
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

  const paidCount = payments.filter((p) => p.status === "paid").length;
  const pendingCount = payments.filter((p) => p.status === "pending" || p.status === "processing").length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="px-3 sm:px-5 lg:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6 flex-1 max-w-[1536px] w-full mx-auto min-w-0">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="mb-2">
                <span className="font-bold text-[11px] tracking-wider uppercase text-[#ff2d6c] dark:text-[#ff4f87] font-sans">
                  TEST MODE ENABLED
                </span>
              </div>
              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground mt-1">
                Payment History And Escrow Receipts
              </h1>
              <p className="text-xs text-text-secondary mt-1">
                Monitor and verify Razorpay payments for completed campaign workspaces.
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
            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Page Paid Volume
              </span>
              <span className="font-sans font-semibold text-2xl text-emerald-500 tracking-tight block">
                {formatPrice(totalPaidAmount)}
              </span>
              <span className="text-[10px] text-text-secondary block">
                Verified paid records on current page
              </span>
            </div>

            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Total Account Records
              </span>
              <span className="font-sans font-semibold text-2xl text-foreground tracking-tight block">
                {pagination?.totalItems ?? payments.length}
              </span>
              <span className="text-[10px] text-text-secondary block">
                Total payment entries across all pages
              </span>
            </div>

            <div className="bg-surface border border-border-theme p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Page Pending / Processing
              </span>
              <span className="font-sans font-semibold text-2xl text-amber-500 tracking-tight block">
                {pendingCount}
              </span>
              <span className="text-[10px] text-text-secondary block">
                Awaiting Checkout or Verification on this page
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4">
              <span>{typeof error === "string" ? error : "Failed to load payment history."}</span>
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
          <div className="bg-surface border border-border-theme rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar min-w-0 w-full max-w-full">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${selectedStatus === tab.id
                    ? "bg-[#252525] text-white shadow-xs"
                    : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payments Table / List */}
          <div className="bg-surface border border-border-theme rounded-2xl shadow-xs overflow-hidden min-w-0">
            {loading ? (
              /* Loading Skeleton */
              <div className="p-6 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-surface-muted rounded-xl w-full" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-secondary/8 text-[#252525] dark:text-white flex items-center justify-center mx-auto border border-secondary/15">
                  <CreditCardIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-semibold text-lg text-foreground">
                    No Payment History Found
                  </h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                    {selectedStatus === "all"
                      ? "You haven't initiated any campaign workspace payments yet. Payments can be released once all deliverables in a workspace are approved."
                      : `No payment records match the filter '${selectedStatus}'.`}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/brand/workspace"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#252525] hover:bg-[#111111] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <span>View Completed Workspaces</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Payments Data Table */
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted/60 text-text-secondary font-semibold uppercase tracking-wider text-[10px] border-b border-border-theme">
                    <tr>
                      <th className="py-3.5 px-4">Campaign & Creator</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4">Razorpay Ref</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme/60">
                    {payments.map((payment) => {
                      const badge = getStatusBadge(payment.status);
                      const campaignTitle =
                        typeof payment.campaign === "object" && payment.campaign !== null
                          ? payment.campaign.title
                          : "Campaign Workspace";
                      const creatorName =
                        typeof payment.creator === "object" && payment.creator !== null
                          ? payment.creator.name
                          : "Creator Partner";

                      return (
                        <tr
                          key={payment._id}
                          className="hover:bg-surface-muted/40 transition-colors"
                        >
                          {/* Campaign & Creator */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-foreground block line-clamp-1">
                                {campaignTitle}
                              </span>
                              <span className="text-[11px] text-text-secondary block">
                                Creator: {creatorName}
                              </span>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-sans font-semibold text-sm text-foreground">
                            {formatPrice(payment.amount, payment.currency)}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider inline-block ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Method */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-muted text-foreground border border-border-theme">
                              {payment.paymentMethod || "RAZORPAY_TEST"}
                            </span>
                          </td>

                          {/* Ref */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-text-secondary">
                            {payment.transactionId || payment.razorpayPaymentId || payment.razorpayOrderId || "—"}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                            {formatDate(payment.paidAt || payment.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(payment)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-medium transition-colors cursor-pointer"
                            >
                              <EyeIcon className="w-3.5 h-3.5 text-text-secondary" />
                              <span>Details</span>
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
            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 border-t border-border-theme flex items-center justify-between gap-4 text-xs">
                <span className="text-text-secondary">
                  Showing Page <strong className="text-foreground">{pagination.currentPage}</strong> of{" "}
                  <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.totalItems} records)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage <= 1 || loading}
                    className="p-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                    disabled={currentPage >= pagination.totalPages || loading}
                    className="p-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Payment Detail Modal */}
      <BrandPaymentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        payment={selectedPaymentDetail}
      />
    </div>
  );
}
