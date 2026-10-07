"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandWorkspaceById,
  clearSuccessMessage,
} from "@/redux/brand/workspace/workspace_slice";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandReviewModal from "./BrandReviewModal";

// =========================================================
// SVG ICONS
// =========================================================
function ChevronLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function LinkIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function DocumentIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ExclamationIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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

// =========================================================
// HELPER UTILITIES & STATUS BADGES
// =========================================================
const formatPrice = (amount, currency = "INR") => {
  if (typeof amount !== "number" || isNaN(amount)) return "N/A";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(amount)}`;
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
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "submitted":
      return {
        label: "Submitted",
        color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      };
    case "revision_requested":
      return {
        label: "Revision Requested",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-red-500/10 text-red-500 border-red-500/20",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Unknown",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
};

export default function BrandWorkspaceDetail({ workspaceId }) {
  const dispatch = useDispatch();
  const { selectedWorkspace, loading, error, successMessage } = useSelector(
    (state) => state.brandWorkspace
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState("approve"); // 'approve' | 'revision'

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchBrandWorkspaceById(workspaceId));
    }
  }, [dispatch, workspaceId]);

  const handleRetry = () => {
    if (workspaceId) {
      dispatch(fetchBrandWorkspaceById(workspaceId));
    }
  };

  const handleOpenReviewModal = (mode) => {
    setReviewMode(mode);
    setIsReviewModalOpen(true);
  };

  const workspace = selectedWorkspace;
  const badge = getStatusBadge(workspace?.status);
  const campaign = workspace?.campaign;
  const creator = workspace?.creator;
  const service = workspace?.service;
  const deliverables = Array.isArray(workspace?.deliverables) ? workspace.deliverables : [];
  const submissions = Array.isArray(workspace?.submissions) ? workspace.submissions : [];
  const revisions = Array.isArray(workspace?.revisions) ? workspace.revisions : [];

  // Review actions are ONLY visible when status === "submitted"
  const isSubmittedStatus = workspace?.status === "submitted";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Top Navigation */}
          <div>
            <Link
              href="/brand/workspace"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-foreground transition-colors"
            >
              <ChevronLeftIcon />
              <span>Back to Workspaces</span>
            </Link>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => dispatch(clearSuccessMessage())}
                className="text-text-secondary hover:text-foreground text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <span>{typeof error === "string" ? error : "Failed to load workspace details."}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors cursor-pointer shrink-0"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && !workspace ? (
            <div className="space-y-6 animate-pulse">
              <div className="bg-surface border border-border-theme rounded-2xl p-6 space-y-4">
                <div className="h-6 bg-surface-muted rounded-md w-1/3" />
                <div className="h-4 bg-surface-muted rounded-md w-1/4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-surface-muted rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-64 bg-surface border border-border-theme rounded-2xl p-6" />
                <div className="h-64 bg-surface border border-border-theme rounded-2xl p-6" />
              </div>
            </div>
          ) : !loading && !workspace ? (
            /* Not Found State */
            <div className="bg-surface border border-border-theme rounded-2xl p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                <ExclamationIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-lg text-foreground">
                  Workspace Not Found
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  The requested workspace does not exist or you do not have permission to view it.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/brand/workspace"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <span>Back to Workspaces</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Workspace Detail Content */
            <div className="space-y-6">
              {/* Header / Summary Card */}
              <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {campaign?.category && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border-theme">
                          {campaign.category}
                        </span>
                      )}
                    </div>
                    <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground mt-2">
                      {campaign?.title || "Campaign Workspace"}
                    </h1>
                    <div className="text-xs text-text-secondary mt-1 space-y-0.5">
                      <p>
                        Creator: <span className="text-foreground font-semibold">{creator?.name || "Creator Partner"}</span>
                        {creator?.email && <span className="text-text-secondary"> ({creator.email})</span>}
                      </p>
                    </div>
                  </div>

                  {/* Review Actions (Visible ONLY when workspace.status === "submitted") */}
                  {isSubmittedStatus && (
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal("revision")}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <span>Request Revision</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal("approve")}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>Approve & Complete</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Key Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border-theme">
                  <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-theme/50">
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                      Agreed Price
                    </span>
                    <span className="font-serif font-bold text-base text-foreground mt-0.5 block">
                      {formatPrice(workspace.agreedPrice, workspace.currency)}
                    </span>
                  </div>

                  <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-theme/50">
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      Deadline
                    </span>
                    <span className="font-medium text-xs text-foreground mt-1 block">
                      {formatDate(workspace.deadline)}
                    </span>
                  </div>

                  <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-theme/50">
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                      Platform
                    </span>
                    <span className="font-medium text-xs text-foreground mt-1 capitalize block">
                      {campaign?.platform || service?.platform || "General"}
                    </span>
                  </div>

                  <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-theme/50">
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                      Selected Service
                    </span>
                    <span className="font-medium text-xs text-foreground mt-1 line-clamp-1 block">
                      {service?.title || "Custom Package"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Deliverables & Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Required Deliverables Checklist */}
                  <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                    <h2 className="font-serif font-semibold text-lg text-foreground">
                      Required Campaign Deliverables
                    </h2>
                    {deliverables.length > 0 ? (
                      <div className="space-y-2.5">
                        {deliverables.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted/60 border border-border-theme/60 text-xs font-medium text-foreground"
                          >
                            <div className="w-5 h-5 rounded-full bg-secondary/15 text-secondary border border-secondary/20 flex items-center justify-center shrink-0">
                              <CheckIcon className="w-3.5 h-3.5" />
                            </div>
                            <span>{typeof item === "string" ? item : item.title || JSON.stringify(item)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary">No specific deliverables listed.</p>
                    )}
                  </div>

                  {/* Campaign & Service Details */}
                  <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                    <h2 className="font-serif font-semibold text-lg text-foreground">
                      Campaign & Service Brief
                    </h2>
                    {campaign?.description && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-foreground block">
                          Campaign Overview:
                        </span>
                        <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                          {campaign.description}
                        </p>
                      </div>
                    )}
                    {service?.description && (
                      <div className="space-y-1 pt-2 border-t border-border-theme">
                        <span className="text-xs font-semibold text-foreground block">
                          Service Package Details:
                        </span>
                        <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    )}
                    {service?.deliveryTime && (
                      <div className="pt-2 border-t border-border-theme text-xs text-text-secondary">
                        Delivery Time: <span className="font-semibold text-foreground">{service.deliveryTime} Days</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Submitted Work & Revision History */}
                <div className="space-y-6">
                  {/* Submitted Work Section */}
                  <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                    <h2 className="font-serif font-semibold text-base text-foreground">
                      Submitted Work ({submissions.length})
                    </h2>

                    {submissions.length === 0 ? (
                      <div className="bg-surface-muted/40 border border-border-theme/60 rounded-xl p-6 text-center space-y-2">
                        <p className="text-xs text-text-secondary font-medium">
                          No work submitted yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {submissions.map((sub, idx) => (
                          <div
                            key={sub._id || idx}
                            className="bg-surface-muted/60 border border-border-theme/70 p-4 rounded-xl space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-foreground line-clamp-1">
                                {sub.title || `Submission #${idx + 1}`}
                              </span>
                              <span className="text-[10px] text-text-secondary shrink-0">
                                {formatDateTime(sub.submittedAt)}
                              </span>
                            </div>

                            {sub.notes && (
                              <p className="text-text-secondary bg-surface p-2.5 rounded-lg border border-border-theme/50 line-clamp-3">
                                {sub.notes}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2 pt-1">
                              {sub.link && (
                                <a
                                  href={sub.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-secondary hover:underline font-medium"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  <span>View Content Link</span>
                                </a>
                              )}
                              {sub.fileUrl && (
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-secondary hover:underline font-medium"
                                >
                                  <DocumentIcon className="w-3 h-3" />
                                  <span>View Asset File</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Revision History Section */}
                  {revisions.length > 0 && (
                    <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
                      <h2 className="font-serif font-semibold text-base text-foreground">
                        Revision History ({revisions.length})
                      </h2>
                      <div className="space-y-3">
                        {revisions.map((rev, idx) => (
                          <div
                            key={rev._id || idx}
                            className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] text-amber-500 font-semibold">
                              <span>Revision Request #{idx + 1}</span>
                              <span>{formatDateTime(rev.requestedAt)}</span>
                            </div>
                            <p className="text-foreground leading-relaxed">
                              &ldquo;{rev.feedback}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review Modal */}
      <BrandReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        workspaceId={workspaceId}
        initialMode={reviewMode}
      />
    </div>
  );
}
