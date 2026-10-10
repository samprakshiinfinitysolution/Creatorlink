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
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.596.596 0 01-.643-.655 4.5 4.5 0 011.02-2.316A7.478 7.478 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
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

const getDeliverableStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      };
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
    case "approved":
      return {
        label: "Approved",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Pending",
        color: "bg-surface-muted text-text-secondary border-border-theme",
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
  const deliverables = Array.isArray(workspace?.deliverables) ? workspace.deliverables : [];
  const submissions = Array.isArray(workspace?.submissions) ? workspace.submissions : [];
  const revisions = Array.isArray(workspace?.revisions) ? workspace.revisions : [];
  const latestRevision = revisions.length > 0 ? revisions[revisions.length - 1] : null;

  const submittableDeliverable = deliverables.find(
    (d) => typeof d === "object" && (d.status === "pending" || d.status === "in_progress" || d.status === "revision_requested")
  );

  const canSubmitWork = workspace?.status === "in_progress" || workspace?.status === "revision_requested";
  const isRevisionMode = workspace?.status === "revision_requested";

  const activeDeliverables = deliverables.filter(
    (item) =>
      typeof item === "object" &&
      (item?.status === "submitted" ||
        item?.status === "revision_requested" ||
        item?.status === "approved" ||
        item?.status === "completed")
  );

  const pendingDeliverables = deliverables.filter(
    (item) =>
      typeof item === "string" ||
      item?.status === "pending" ||
      item?.status === "in_progress" ||
      (!item?.status ||
        (item.status !== "submitted" &&
          item.status !== "revision_requested" &&
          item.status !== "approved" &&
          item.status !== "completed"))
  );

  const renderDeliverableCard = (item, idx) => {
    const isStringItem = typeof item === "string";
    const title = isStringItem ? item : item.title || `Deliverable #${idx + 1}`;
    const status = isStringItem ? "pending" : item.status || "pending";
    const delivBadge = getDeliverableStatusBadge(status);

    return (
      <div
        key={!isStringItem && item._id ? item._id : idx}
        className="bg-surface border border-border-theme rounded-xl p-4 space-y-3 shadow-xs"
      >
        <div className="space-y-2.5">
          {/* Top Metadata Row: Status Badge & Due Date */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${delivBadge.color}`}
              >
                {delivBadge.label}
              </span>
              {!isStringItem && item.dueDate && (
                <span className="text-[11px] text-text-secondary flex items-center gap-1 font-medium">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Due: {formatDate(item.dueDate)}
                </span>
              )}
            </div>
          </div>

          {/* Main Content Row: Title (+ optional description) on left, Action Button on right */}
          <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <h3 className="font-serif font-semibold text-base text-foreground">
                {title}
              </h3>
              {!isStringItem && item.description && (
                <p className="text-xs text-text-secondary leading-normal mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>

            {/* Per-Deliverable Action Buttons */}
            {!isStringItem && (status === "pending" || status === "in_progress") && (
              <button
                type="button"
                onClick={() => handleOpenSubmitModal(item)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
              >
                <UploadIcon className="w-3.5 h-3.5" />
                <span>Submit Work</span>
              </button>
            )}
            {!isStringItem && status === "revision_requested" && (
              <button
                type="button"
                onClick={() => handleOpenSubmitModal(item)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Resubmit Work</span>
              </button>
            )}
          </div>
        </div>

        {/* Deliverable Submission Info inside Card */}
        {!isStringItem && item.submission && (
          <div className="bg-surface-muted/60 border border-border-theme/70 p-3 rounded-lg space-y-1.5 text-xs mt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">
                Submission: {item.submission.title || title}
              </span>
              {item.submittedAt && (
                <span className="text-[10px] text-text-secondary shrink-0">
                  {formatDateTime(item.submittedAt)}
                </span>
              )}
            </div>

            {item.submission.notes && (
              <p className="text-text-secondary bg-surface p-2 rounded-md border border-border-theme/50 leading-relaxed text-[11px]">
                {item.submission.notes}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-0.5">
              {item.submission.link && (
                <a
                  href={item.submission.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-secondary hover:underline font-medium"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Live Content Link</span>
                </a>
              )}
              {item.submission.fileUrl && (
                <a
                  href={item.submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-secondary hover:underline font-medium"
                >
                  <DocumentIcon className="w-3.5 h-3.5" />
                  <span>Asset File Reference</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          {/* Top Bar Navigation */}
          <div>
            <Link
              href="/creator/workspace"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-foreground transition-colors"
            >
              <ChevronLeftIcon />
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
                  The workspace you are looking for does not exist or you do not have permission to view it.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/creator/workspace"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
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
                <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-wide">
                    <ExclamationIcon className="w-4 h-4" />
                    <span>Revision Requested by Brand</span>
                    <span className="text-[10px] text-text-secondary font-normal ml-auto">
                      {formatDateTime(latestRevision.requestedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground bg-surface/80 p-3.5 rounded-xl border border-amber-500/20">
                    &ldquo;{latestRevision.feedback}&rdquo;
                  </p>
                </div>
              )}

              {/* Workspace Header Banner */}
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
                      {campaign?.title || "Collaboration Workspace"}
                    </h1>
                    <p className="text-xs text-text-secondary mt-1">
                      Brand Partner: <span className="text-foreground font-semibold">{brand?.name || brand?.email || "Brand"}</span>
                      {brand?.email && <span className="text-text-secondary"> ({brand.email})</span>}
                    </p>
                  </div>

                  {/* Action Buttons: Message Brand & Submit Work */}
                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    <Link
                      href={`/creator/messages?bookingId=${workspace.booking?._id || workspace.booking}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      <ChatBubbleIcon className="w-4 h-4 text-secondary" />
                      <span>Message Brand</span>
                    </Link>

                    {canSubmitWork && (
                      <button
                        type="button"
                        onClick={() => handleOpenSubmitModal(submittableDeliverable || deliverables[0] || null)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        <UploadIcon className="w-4 h-4" />
                        <span>{isRevisionMode ? "Resubmit Work" : "Submit Work"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Key Summary Stats Grid */}
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

              {/* 2-Column Main Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Required Deliverables & Overview */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Required Deliverables Checklist Cards */}
                  <div className="space-y-4">
                    <h2 className="font-serif font-semibold text-lg text-foreground px-1">
                      Required Campaign Deliverables ({deliverables.length})
                    </h2>
                    {deliverables.length > 0 ? (
                      <div className="space-y-6">
                        {/* Group 1: Active / Submitted / Reviewed Deliverables */}
                        {activeDeliverables.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {activeDeliverables.map((item, idx) => renderDeliverableCard(item, idx))}
                          </div>
                        )}

                        {/* Group 2: Pending / In Progress Deliverables */}
                        {pendingDeliverables.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {pendingDeliverables.map((item, idx) => renderDeliverableCard(item, idx))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-surface border border-border-theme rounded-2xl p-5 text-center">
                        <p className="text-xs text-text-secondary">No specific deliverables listed.</p>
                      </div>
                    )}
                  </div>

                  {/* Campaign & Service Details */}
                  <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                    <h2 className="font-serif font-semibold text-lg text-foreground">
                      Campaign Brief & Service Details
                    </h2>
                    {campaign?.description && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-foreground block">
                          Campaign Description:
                        </span>
                        <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                          {campaign.description}
                        </p>
                      </div>
                    )}
                    {service?.description && (
                      <div className="space-y-1 pt-2 border-t border-border-theme">
                        <span className="text-xs font-semibold text-foreground block">
                          Package Scope:
                        </span>
                        <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Submission & Revision History */}
                <div className="space-y-6">
                  {/* Submissions Section */}
                  <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif font-semibold text-base text-foreground">
                        Submitted Work ({submissions.length})
                      </h2>
                      {canSubmitWork && (
                        <button
                          type="button"
                          onClick={() => handleOpenSubmitModal(submittableDeliverable || deliverables[0] || null)}
                          className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                        >
                          + Submit Work
                        </button>
                      )}
                    </div>

                    {submissions.length === 0 ? (
                      <div className="bg-surface-muted/40 border border-border-theme/60 rounded-xl p-6 text-center space-y-2">
                        <UploadIcon className="w-6 h-6 text-text-secondary mx-auto" />
                        <p className="text-xs text-text-secondary font-medium">
                          No work submitted yet.
                        </p>
                        {canSubmitWork && (
                          <button
                            type="button"
                            onClick={() => handleOpenSubmitModal(submittableDeliverable || deliverables[0] || null)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary text-white text-xs font-semibold transition-all cursor-pointer mt-1"
                          >
                            <span>Submit Now</span>
                          </button>
                        )}
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
                                  <span>Live Content Link</span>
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
                              <span>Revision #{idx + 1}</span>
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
