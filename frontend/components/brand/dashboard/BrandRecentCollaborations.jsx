import React from "react";
import Link from "next/link";

function formatCurrency(amount, currency = "INR") {
  const numericAmount =
    amount === undefined || amount === null || isNaN(Number(amount))
      ? 0
      : Number(amount);
  const currCode =
    (currency && typeof currency === "string" ? currency.trim().toUpperCase() : "INR") || "INR";

  try {
    if (currCode === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(numericAmount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currCode,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `${currCode} ${numericAmount.toLocaleString()}`;
  }
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

function getWorkspaceStatusBadge(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  switch (normalized) {
    case "submitted":
      return {
        label: "Ready for Review",
        color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
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
    default:
      return {
        label: status ? String(status).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Active",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function WorkspaceFolderIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

export default function BrandRecentCollaborations({ collaborations = [] }) {
  const safeCollaborations = Array.isArray(collaborations) ? collaborations : [];

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-lg sm:text-xl text-foreground">
            Active Collaborations
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Creator deliverables, review milestones, and active workspaces
          </p>
        </div>
        <Link
          href="/brand/workspace"
          className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
        >
          <span>View All</span>
          <ArrowRightIcon />
        </Link>
      </div>

      {safeCollaborations.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-border-theme rounded-xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <WorkspaceFolderIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-medium text-base text-foreground">
            No active collaborations
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            You don't have any ongoing creator workspaces yet. Discover talent or accept applications to begin.
          </p>
          <div className="pt-1">
            <Link
              href="/brand/creators"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-secondary text-white text-xs font-medium hover:bg-secondary-dark transition-colors"
            >
              <span>Discover Creators</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {safeCollaborations.map((collab, idx) => {
            const badge = getWorkspaceStatusBadge(collab.status);
            const creatorName = collab.creator?.name || "Creator Partner";
            const serviceTitle = collab.service?.title || collab.category || "Custom Deliverable";
            const deliverables = collab.deliverablesCount ?? 0;
            const targetId = collab.id || collab._id;
            const workspaceHref = targetId ? `/brand/workspace/${targetId}` : "/brand/workspace";

            return (
              <Link
                key={targetId || idx}
                href={workspaceHref}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted/50 hover:border-secondary/40 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {deliverables} deliverable{deliverables === 1 ? "" : "s"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground text-xs sm:text-sm font-sans truncate group-hover:text-secondary transition-colors">
                    {collab.title || serviceTitle}
                  </h4>
                  <p className="text-[11px] text-text-secondary truncate">
                    <span className="font-medium text-foreground">{creatorName}</span>
                    {collab.platform ? ` · ${collab.platform}` : ""}
                    {collab.deadline ? ` · Due ${formatDate(collab.deadline)}` : ""}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                  <span className="font-semibold text-foreground text-xs font-sans">
                    {formatCurrency(collab.agreedPrice, collab.currency || "INR")}
                  </span>
                  <span className="text-[10px] font-medium text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    Open workspace →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
