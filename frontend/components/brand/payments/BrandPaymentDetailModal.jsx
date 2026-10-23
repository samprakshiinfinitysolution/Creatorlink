"use client";

import React from "react";

function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

const formatPrice = (amount, currency = "INR") => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) return "N/A";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(numericAmount)}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "paid":
      return { label: "Paid", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    case "pending":
      return { label: "Pending", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    case "processing":
      return { label: "Processing", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" };
    case "failed":
      return { label: "Failed", color: "bg-red-500/10 text-red-500 border-red-500/20" };
    default:
      return { label: status || "Unknown", color: "bg-surface-muted text-text-secondary border-border-theme" };
  }
};

export default function BrandPaymentDetailModal({ isOpen, onClose, payment }) {
  if (!isOpen || !payment) return null;

  const badge = getStatusBadge(payment.status);

  const campaignTitle =
    typeof payment.campaign === "object" && payment.campaign !== null && payment.campaign.title
      ? payment.campaign.title
      : "Campaign Workspace";

  const creatorName =
    typeof payment.creator === "object" && payment.creator !== null && payment.creator.name
      ? payment.creator.name
      : "Creator";

  const razorpayPaymentId = (payment.razorpayPaymentId || "").trim();
  const razorpayOrderId = (payment.razorpayOrderId || "").trim();
  const transactionId = (payment.transactionId || "").trim();

  const isUniqueTxRef =
    transactionId &&
    transactionId !== razorpayPaymentId &&
    transactionId !== razorpayOrderId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border-theme flex items-center justify-between bg-surface">
          <div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${badge.color}`}>
              {badge.label}
            </span>
            <h2 className="font-serif font-semibold text-xl text-foreground mt-1">
              Payment Receipt Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar text-xs">
          <div className="bg-surface-muted/60 p-4 rounded-xl border border-border-theme/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary font-medium">
                {payment.status === "paid" ? "Amount Paid" : "Payment Amount"}
              </span>
              <span className="font-sans font-semibold text-lg text-foreground">
                {formatPrice(payment.amount, payment.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border-theme/40 pt-2">
              <span className="text-text-secondary font-medium">Payment Mode</span>
              <span className="font-semibold text-foreground px-2 py-0.5 bg-secondary/10 text-secondary rounded border border-secondary/20 font-mono text-[11px]">
                {payment.paymentMethod || "RAZORPAY_TEST"}
              </span>
            </div>

            {payment.isTestMode && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <span>⚠️ Razorpay Test Mode Simulation</span>
              </div>
            )}
          </div>

          {/* Campaign & Creator info */}
          <div className="space-y-2 border-t border-border-theme/50 pt-3">
            <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider text-text-secondary">
              Collaboration Information
            </h3>
            <div className="space-y-1.5 bg-surface-muted/40 p-3 rounded-xl border border-border-theme/50">
              <div className="flex justify-between">
                <span className="text-text-secondary">Campaign:</span>
                <span className="font-semibold text-foreground">
                  {campaignTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Creator Partner:</span>
                <span className="font-semibold text-foreground">
                  {creatorName}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-2 border-t border-border-theme/50 pt-3">
            <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider text-text-secondary">
              Transaction Identifiers
            </h3>
            <div className="space-y-2 font-mono text-[11px] bg-surface-muted/40 p-3 rounded-xl border border-border-theme/50">
              {razorpayPaymentId && (
                <div>
                  <span className="text-text-secondary block font-sans text-[10px]">Razorpay Payment ID:</span>
                  <span className="text-foreground select-all font-semibold">{razorpayPaymentId}</span>
                </div>
              )}
              {razorpayOrderId && (
                <div>
                  <span className="text-text-secondary block font-sans text-[10px]">Razorpay Order ID:</span>
                  <span className="text-foreground select-all font-semibold">{razorpayOrderId}</span>
                </div>
              )}
              {isUniqueTxRef && (
                <div>
                  <span className="text-text-secondary block font-sans text-[10px]">Transaction Reference:</span>
                  <span className="text-foreground select-all font-semibold">{transactionId}</span>
                </div>
              )}
              <div>
                <span className="text-text-secondary block font-sans text-[10px]">Internal Record ID:</span>
                <span className="text-foreground select-all">{payment._id}</span>
              </div>
              <div>
                <span className="text-text-secondary block font-sans text-[10px]">Created At:</span>
                <span className="text-foreground font-sans text-xs">{formatDateTime(payment.createdAt)}</span>
              </div>
              {payment.paidAt && (
                <div>
                  <span className="text-text-secondary block font-sans text-[10px]">Verified Paid At:</span>
                  <span className="text-foreground font-sans text-xs text-emerald-500 font-semibold">{formatDateTime(payment.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-theme flex justify-end bg-surface">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#252525] hover:bg-[#111111] text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
