"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchCreatorWorkspaceById } from "@/redux/creator/workspace/workspace_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import CreatorSubmitWorkModal from "./CreatorSubmitWorkModal";

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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
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

function UploadIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
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

function ChatBubbleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008H8.625V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zM21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ClockIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

const formatPlatform = (val) => {
  if (!val) return "General";
  const map = {
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    tiktok: "TikTok",
    website: "Website",
  };
  return map[val.toLowerCase()] || val;
};

const getStatusBadge = (status) => {
  switch (status) {
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-amber-50 text-amber-600 border border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
      };
    case "submitted":
      return {
        label: "Submitted",
        color: "bg-purple-50 text-purple-600 border border-purple-200/70 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40",
      };
    case "revision_requested":
      return {
        label: "Revision Requested",
        color: "bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-emerald-50 text-emerald-600 border border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-neutral-100 text-neutral-600 border border-neutral-200/80 dark:bg-surface-muted dark:text-text-secondary dark:border-border-theme",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Active",
        color: "bg-neutral-100 text-neutral-600 border border-neutral-200/80 dark:bg-surface-muted dark:text-text-secondary dark:border-border-theme",
      };
  }
};

const getDeliverableStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        color: "bg-neutral-100 text-neutral-600 border-neutral-200/70 dark:bg-surface-muted dark:text-text-secondary dark:border-border-theme",
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-amber-50 text-amber-600 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
      };
    case "submitted":
      return {
        label: "Submitted",
        color: "bg-purple-50 text-purple-600 border-purple-200/70 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40",
      };
    case "revision_requested":
      return {
        label: "Revision Requested",
        color: "bg-rose-50 text-rose-600 border-rose-200/70 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40",
      };
    case "approved":
    case "completed":
      return {
        label: "Approved",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Pending",
        color: "bg-neutral-100 text-neutral-600 border-neutral-200/70 dark:bg-surface-muted dark:text-text-secondary dark:border-border-theme",
      };
  }
};

export default function CreatorWorkspaceDetail({ workspaceId }) {
  const dispatch = useDispatch();
  const { selectedWorkspace, loading, error } = useSelector(
    (state) => state.creatorWorkspace
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchCreatorWorkspaceById(workspaceId));
    }
  }, [dispatch, workspaceId]);

  const handleRetry = () => {
    if (workspaceId) {
      dispatch(fetchCreatorWorkspaceById(workspaceId));
    }
  };

  const handleOpenSubmitModal = (deliverable = null) => {
    setSelectedDeliverable(deliverable);
    setIsSubmitModalOpen(true);
  };

  const handleCloseSubmitModal = () => {
    setIsSubmitModalOpen(false);
    setSelectedDeliverable(null);
  };

  const workspace = selectedWorkspace;
  const badge = getStatusBadge(workspace?.status);
  const campaign = workspace?.campaign;
  const brand = workspace?.brand;
  const service = workspace?.service;
  const brandName = brand?.name || brand?.email?.split("@")[0] || "Brand Partner";
  const brandInitial = brandName.charAt(0).toUpperCase() || "B";
  const deliverables = Array.isArray(workspace?.deliverables) ? workspace.deliverables : [];
  const rawSubmissions = Array.isArray(workspace?.submissions) ? workspace.submissions : [];
  const revisions = Array.isArray(workspace?.revisions) ? workspace.revisions : [];
  const latestRevision = revisions.length > 0 ? revisions[revisions.length - 1] : null;

  // Aggregate all submissions from top-level submissions array and individual deliverables
  const allSubmissions = [
    ...rawSubmissions,
    ...deliverables
      .filter((d) => d?.submission && !rawSubmissions.some((s) => s?._id === d.submission?._id))
      .map((d) => ({
        ...d.submission,
        deliverableTitle: d.title,
      })),
  ];

  const submittableDeliverable = deliverables.find(
    (d) => typeof d === "object" && (d.status === "pending" || d.status === "in_progress" || d.status === "revision_requested")
  );

  const canSubmitWork = workspace?.status === "in_progress" || workspace?.status === "revision_requested";
  const isRevisionMode = workspace?.status === "revision_requested";

  const agreedPriceFormatted = formatPrice(workspace?.agreedPrice, workspace?.currency);
  const deadlineFormatted = formatDate(workspace?.deadline);
  const platformLabel = formatPlatform(campaign?.platform || service?.platform);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Top Bar Navigation */}
          <div>
            <Link
              href="/creator/workspace"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-text-secondary hover:text-foreground transition-colors group cursor-pointer"
            >
              <ChevronLeftIcon className="transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Workspaces</span>
            </Link>
          </div>

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
              <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl sm:rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="h-4 bg-surface-muted rounded-full w-28" />
                <div className="h-7 bg-surface-muted rounded-md w-1/2" />
                <div className="h-3.5 bg-surface-muted rounded-md w-1/4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border-theme/40">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 bg-surface-muted rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-72 bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-6 shadow-xs" />
                <div className="h-72 bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-6 shadow-xs" />
              </div>
            </div>
          ) : !loading && !workspace ? (
            /* Not Found State */
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl sm:rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 border border-pink-100 dark:border-pink-900/40 flex items-center justify-center mx-auto">
                <ExclamationIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-medium text-xl text-foreground">
                  Workspace Not Found
                </h3>
                <p className="text-xs text-text-secondary font-sans max-w-sm mx-auto leading-relaxed">
                  The workspace you are looking for does not exist or you do not have permission to view it.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/creator/workspace"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-sans font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 transition-all cursor-pointer dark:bg-neutral-100 dark:text-neutral-950"
                >
                  <span>Return to Workspaces</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Main Workspace Details View */
            <div className="space-y-6">
              {/* Revision Feedback Banner (if active) */}
              {isRevisionMode && latestRevision && (
                <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 p-4 sm:p-5 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-sans font-semibold text-xs tracking-wide">
                    <ExclamationIcon className="w-4 h-4 shrink-0" />
                    <span>Revision Requested by Brand Partner</span>
                    <span className="text-[11px] text-text-secondary font-normal ml-auto">
                      {formatDateTime(latestRevision.requestedAt)}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-foreground bg-white/80 dark:bg-surface/80 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/30 leading-relaxed">
                    &ldquo;{latestRevision.feedback}&rdquo;
                  </p>
                </div>
              )}

              {/* Workspace Header Banner */}
              <div className="bg-gradient-to-r from-pink-50/80 via-pink-50/40 to-rose-50/60 dark:from-pink-950/30 dark:via-surface dark:to-pink-950/10 border border-pink-100/80 dark:border-border-theme rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {campaign?.category && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-sans font-semibold bg-white/80 dark:bg-surface-muted text-text-secondary border border-neutral-200/80 dark:border-border-theme">
                          {campaign.category}
                        </span>
                      )}
                    </div>

                    <h1 className="font-heading font-medium text-2xl sm:text-3xl text-foreground tracking-tight mt-2.5">
                      {campaign?.title || "Collaboration Workspace"}
                    </h1>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-4 h-4 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-[9px] font-heading font-bold shrink-0">
                        {brandInitial}
                      </div>
                      <p className="text-xs font-sans text-text-secondary">
                        Brand Partner: <span className="text-foreground font-semibold">{brandName}</span>
                        {brand?.email && <span className="text-text-secondary"> ({brand.email})</span>}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions: Message Brand & Submit Work */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Link
                      href={`/creator/messages?bookingId=${workspace.booking?._id || workspace.booking}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200/80 dark:border-border-theme bg-white dark:bg-surface hover:bg-neutral-100 dark:hover:bg-surface-muted text-foreground text-xs font-sans font-semibold transition-all shadow-2xs cursor-pointer shrink-0"
                    >
                      <ChatBubbleIcon className="w-4 h-4 text-pink-500" />
                      <span>Message Brand</span>
                    </Link>

                    {canSubmitWork && (
                      <button
                        type="button"
                        onClick={() => handleOpenSubmitModal(submittableDeliverable || deliverables[0] || null)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-sans font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 hover:border-neutral-800 hover:shadow-xs hover:shadow-pink-500/10 active:scale-[0.99] transition-all duration-200 ease-out cursor-pointer shrink-0 dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200"
                      >
                        <UploadIcon className="w-3.5 h-3.5" />
                        <span>{isRevisionMode ? "Resubmit Work" : "Submit Work"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Key Summary Stats Grid (4 Aligned Compact Panels) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3.5 border-t border-border-theme/40">
                  {/* Agreed Price */}
                  <div className="bg-white/80 dark:bg-surface-muted/40 p-2.5 sm:p-3 rounded-xl border border-neutral-200/70 dark:border-border-theme/60 shadow-2xs flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center text-xs font-semibold shrink-0">
                      ₹
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] sm:text-[11px] font-sans text-text-secondary block leading-none mb-0.5">
                        Agreed Price
                      </span>
                      <span className="font-heading font-medium text-sm sm:text-base text-foreground tabular-nums tracking-tight block truncate">
                        {agreedPriceFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="bg-white/80 dark:bg-surface-muted/40 p-2.5 sm:p-3 rounded-xl border border-neutral-200/70 dark:border-border-theme/60 shadow-2xs flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] sm:text-[11px] font-sans text-text-secondary block leading-none mb-0.5">
                        Deadline
                      </span>
                      <span className="font-sans font-semibold text-xs sm:text-sm text-foreground block truncate">
                        {deadlineFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Platform */}
                  <div className="bg-white/80 dark:bg-surface-muted/40 p-2.5 sm:p-3 rounded-xl border border-neutral-200/70 dark:border-border-theme/60 shadow-2xs flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-surface-muted text-neutral-600 dark:text-text-secondary flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold">#</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] sm:text-[11px] font-sans text-text-secondary block leading-none mb-0.5">
                        Platform
                      </span>
                      <span className="font-sans font-semibold text-xs sm:text-sm text-foreground block truncate capitalize">
                        {platformLabel}
                      </span>
                    </div>
                  </div>

                  {/* Selected Service */}
                  <div className="bg-white/80 dark:bg-surface-muted/40 p-2.5 sm:p-3 rounded-xl border border-neutral-200/70 dark:border-border-theme/60 shadow-2xs flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-surface-muted text-neutral-600 dark:text-text-secondary flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold">★</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] sm:text-[11px] font-sans text-text-secondary block leading-none mb-0.5">
                        Selected Service
                      </span>
                      <span className="font-sans font-semibold text-xs sm:text-sm text-foreground block truncate">
                        {service?.title || "Custom Package"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Column Main Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
                {/* Left Column: Required Deliverables & Campaign Brief (2 cols wide) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Required Campaign Deliverables */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2 px-0.5">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-medium text-lg sm:text-xl text-foreground">
                          Required Campaign Deliverables
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-sans font-bold bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-100 dark:border-pink-900/50">
                          {deliverables.length}
                        </span>
                      </div>
                    </div>

                    {deliverables.length > 0 ? (
                      /* 2-Column Grid on Desktop, 1 Column on Mobile */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
                        {deliverables.map((item, idx) => {
                          const isStringItem = typeof item === "string";
                          const title = isStringItem ? item : item.title || `Deliverable #${idx + 1}`;
                          const status = isStringItem ? "pending" : item.status || "pending";
                          const delivBadge = getDeliverableStatusBadge(status);

                          return (
                            <div
                              key={!isStringItem && item._id ? item._id : idx}
                              className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3 group"
                            >
                              <div className="space-y-2">
                                {/* Top Row: Status Badge & Due Date */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold border uppercase tracking-wider ${delivBadge.color}`}
                                  >
                                    {delivBadge.label}
                                  </span>
                                  {!isStringItem && item.dueDate && (
                                    <span className="text-[11px] font-sans text-text-secondary flex items-center gap-1 font-medium ml-auto">
                                      <CalendarIcon className="w-3.5 h-3.5 text-pink-500" />
                                      Due: {formatDate(item.dueDate)}
                                    </span>
                                  )}
                                </div>

                                {/* Deliverable Title & Optional Description */}
                                <div>
                                  <h3 className="font-heading font-medium text-sm sm:text-base text-foreground tracking-tight line-clamp-1 group-hover:text-secondary transition-colors">
                                    {title}
                                  </h3>
                                  {!isStringItem && item.description && (
                                    <p className="text-xs font-sans text-text-secondary leading-snug mt-1 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                {/* Submission Preview Box if deliverable has submission */}
                                {!isStringItem && item.submission && (
                                  <div className="bg-neutral-50/70 dark:bg-surface-muted/30 border border-neutral-200/60 dark:border-border-theme/60 p-2.5 rounded-xl space-y-1.5 text-xs mt-2.5">
                                    <div className="flex items-center justify-between gap-1.5 text-[11px]">
                                      <span className="font-sans font-semibold text-foreground truncate">
                                        {item.submission.title || "Submitted Content"}
                                      </span>
                                      {item.submittedAt && (
                                        <span className="text-[10px] font-sans text-text-secondary shrink-0">
                                          {formatDate(item.submittedAt)}
                                        </span>
                                      )}
                                    </div>
                                    {item.submission.notes && (
                                      <p className="text-[11px] font-sans text-text-secondary line-clamp-2 leading-snug">
                                        {item.submission.notes}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 pt-0.5">
                                      {item.submission.link && (
                                        <a
                                          href={item.submission.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-[11px] font-sans text-pink-500 hover:text-pink-600 hover:underline font-medium"
                                        >
                                          <LinkIcon className="w-3 h-3" />
                                          <span>Live Content Link</span>
                                        </a>
                                      )}
                                      {item.submission.fileUrl && (
                                        <a
                                          href={item.submission.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-[11px] font-sans text-pink-500 hover:text-pink-600 hover:underline font-medium"
                                        >
                                          <DocumentIcon className="w-3 h-3" />
                                          <span>Asset File Reference</span>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Deliverable Footer Action Button */}
                              <div className="pt-2.5 mt-2 border-t border-border-theme/40 flex items-center justify-between">
                                {!isStringItem && (status === "pending" || status === "in_progress") ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSubmitModal(item)}
                                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-neutral-950 text-white text-xs font-sans font-semibold hover:bg-neutral-900 hover:shadow-xs hover:shadow-pink-500/10 active:scale-[0.99] transition-all cursor-pointer dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
                                  >
                                    <UploadIcon className="w-3.5 h-3.5" />
                                    <span>Submit Work</span>
                                  </button>
                                ) : !isStringItem && status === "revision_requested" ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSubmitModal(item)}
                                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 text-white text-xs font-sans font-semibold hover:bg-amber-600 active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
                                  >
                                    <RefreshIcon className="w-3.5 h-3.5" />
                                    <span>Resubmit Work</span>
                                  </button>
                                ) : status === "submitted" ? (
                                  <div className="w-full flex items-center justify-center gap-1.5 text-[11px] font-sans text-purple-600 dark:text-purple-400 font-medium py-1">
                                    <ClockIcon className="w-3.5 h-3.5" />
                                    <span>Under Review by Brand</span>
                                  </div>
                                ) : (
                                  <div className="w-full flex items-center justify-center gap-1.5 text-[11px] font-sans text-emerald-600 dark:text-emerald-400 font-medium py-1">
                                    <CheckIcon className="w-3.5 h-3.5" />
                                    <span>Approved &amp; Completed</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-6 text-center shadow-xs">
                        <p className="text-xs text-text-secondary font-sans">No deliverables listed for this collaboration.</p>
                      </div>
                    )}
                  </div>

                  {/* Campaign Brief & Service Details */}
                  <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                    <h2 className="font-heading font-medium text-lg sm:text-xl text-foreground">
                      Campaign Brief &amp; Service Details
                    </h2>

                    {/* Campaign Description */}
                    {(campaign?.description || workspace?.brief) && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-sans font-semibold text-foreground uppercase tracking-wider block">
                          Campaign Description
                        </span>
                        <p className="text-xs font-sans text-text-secondary leading-relaxed whitespace-pre-line">
                          {campaign?.description || workspace?.brief}
                        </p>
                      </div>
                    )}

                    {/* Package Scope */}
                    {service?.description && (
                      <div className="space-y-1.5 pt-3 border-t border-border-theme/40">
                        <span className="text-xs font-sans font-semibold text-foreground uppercase tracking-wider block">
                          Package Scope
                        </span>
                        <p className="text-xs font-sans text-text-secondary leading-relaxed whitespace-pre-line">
                          {service.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Submitted Work & Revision History */}
                <div className="space-y-6">
                  {/* Submitted Work Section */}
                  <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-medium text-base sm:text-lg text-foreground">
                          Submitted Work
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-100 dark:border-pink-900/50">
                          {allSubmissions.length}
                        </span>
                      </div>
                      {canSubmitWork && (
                        <button
                          type="button"
                          onClick={() => handleOpenSubmitModal(submittableDeliverable || deliverables[0] || null)}
                          className="text-xs font-sans font-medium text-pink-500 hover:text-pink-600 transition-colors cursor-pointer"
                        >
                          + Submit Work
                        </button>
                      )}
                    </div>

                    {allSubmissions.length === 0 ? (
                      <div className="bg-neutral-50/60 dark:bg-surface-muted/30 border border-neutral-200/60 dark:border-border-theme/60 rounded-xl p-5 text-center space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center mx-auto">
                          <UploadIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-sans text-text-secondary font-medium">
                          No work submitted yet.
                        </p>
                        {canSubmitWork && (
                          <button
                            type="button"
                            onClick={() => handleOpenSubmitModal(submittableDeliverable || deliverables[0] || null)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-950 text-white text-xs font-sans font-semibold hover:bg-neutral-900 transition-all cursor-pointer mt-1 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
                          >
                            <span>Submit Now</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {allSubmissions.map((sub, idx) => (
                          <div
                            key={sub._id || idx}
                            className="bg-neutral-50/60 dark:bg-surface-muted/30 border border-neutral-200/70 dark:border-border-theme/70 p-3.5 rounded-xl space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-sans font-semibold text-foreground line-clamp-1">
                                {sub.title || sub.deliverableTitle || `Submission #${idx + 1}`}
                              </span>
                              <span className="text-[10px] font-sans text-text-secondary shrink-0">
                                {formatDateTime(sub.submittedAt)}
                              </span>
                            </div>

                            {sub.notes && (
                              <p className="text-text-secondary bg-white dark:bg-surface p-2.5 rounded-lg border border-neutral-200/60 dark:border-border-theme/50 line-clamp-3 leading-relaxed text-[11px] font-sans">
                                {sub.notes}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2 pt-1">
                              {sub.link && (
                                <a
                                  href={sub.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-sans text-pink-500 hover:text-pink-600 hover:underline font-medium"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  <span>Live Content Link</span>
                                </a>
                              )}
                              {sub.fileUrl && (
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-sans text-pink-500 hover:text-pink-600 hover:underline font-medium"
                                >
                                  <DocumentIcon className="w-3 h-3" />
                                  <span>Asset File Reference</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Revision Log Section */}
                  {revisions.length > 0 && (
                    <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-medium text-base sm:text-lg text-foreground">
                          Revision History
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/50">
                          {revisions.length}
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {revisions.map((rev, idx) => (
                          <div
                            key={rev._id || idx}
                            className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-3 rounded-xl space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] font-sans text-amber-600 dark:text-amber-400 font-semibold">
                              <span>Revision #{idx + 1}</span>
                              <span>{formatDateTime(rev.requestedAt)}</span>
                            </div>
                            <p className="text-foreground font-sans text-xs leading-relaxed">
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

      {/* Submit Work Modal */}
      <CreatorSubmitWorkModal
        isOpen={isSubmitModalOpen}
        onClose={handleCloseSubmitModal}
        workspaceId={workspaceId}
        targetDeliverable={selectedDeliverable}
        isResubmission={selectedDeliverable?.status === "revision_requested"}
      />
    </div>
  );
}
