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
        label: "Under Review",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      };
    case "in_progress":
      return {
        label: "In Production",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      };
    case "revision_requested":
      return {
        label: "Revision Requested",
        color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    default:
      return {
        label: status
          ? String(status).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())
          : "Active",
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

function WorkspaceFolderIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

export default function CreatorRecentCollaborations({ collaborations = [] }) {
  const safeCollaborations = Array.isArray(collaborations) ? collaborations : [];

  return (
    <div className="bg-surface border border-border-theme hover:border-pink-200/80 dark:hover:border-pink-500/20 rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs transition-all duration-200 flex flex-col space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="font-heading font-medium text-lg sm:text-xl text-foreground tracking-tight">
            Recent Collaborations
          </h2>
          <p className="text-xs text-text-secondary font-sans mt-0.5">
            Active workspaces, deliverables, and brand review milestones
          </p>
        </div>
        <Link
          href="/creator/workspace"
          className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-black dark:text-white hover:underline shrink-0"
        >
          <span>View All</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      {safeCollaborations.length === 0 ? (
        <div className="py-6 px-4 rounded-2xl bg-surface-muted/30 border border-border-theme/60 text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <WorkspaceFolderIcon className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-heading font-medium text-sm sm:text-base text-foreground">
            No active collaborations
          </h3>
          <p className="text-xs text-text-secondary font-sans max-w-xs leading-relaxed">
            You don&apos;t have any ongoing workspaces yet. Discover open briefs to begin.
          </p>
          <div className="pt-1">
            <Link
              href="/creator/campaigns/discover"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-sans font-semibold hover:bg-secondary-dark transition-colors shadow-2xs"
            >
              <span>Discover Campaigns</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {safeCollaborations.map((collab, idx) => {
            const badge = getWorkspaceStatusBadge(collab.status);
            const brandName = collab.brand?.name || "Brand Partner";
            const serviceTitle = collab.service?.title || collab.category || "Custom Deliverable";
            const deliverables = collab.deliverablesCount ?? 0;
            const targetId = collab.id || collab._id;
            const workspaceHref = targetId ? `/creator/workspace/${targetId}` : "/creator/workspace";
            const price = collab.compensation ?? collab.agreedPrice;

            // Restrained brand initial
            const brandInitial = brandName.charAt(0).toUpperCase() || "B";

            return (
              <Link
                key={targetId || idx}
                href={workspaceHref}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-border-theme/60 bg-surface hover:bg-surface-muted/40 hover:border-pink-200/80 dark:hover:border-pink-500/30 transition-all duration-200"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Restrained Brand Initial Chip */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-muted text-foreground/90 border border-border-theme/70 flex items-center justify-center font-heading font-medium text-xs sm:text-sm shrink-0 group-hover:border-pink-200/80 dark:group-hover:border-pink-500/30 transition-colors mt-0.5 sm:mt-0">
                    {brandInitial}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {deliverables > 0 && (
                        <span className="text-[10px] text-text-secondary font-sans font-medium">
                          · {deliverables} deliverable{deliverables === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                    <h4
                      className="font-sans font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-secondary transition-colors"
                      title={collab.title || serviceTitle}
                    >
                      {collab.title || serviceTitle}
                    </h4>
                    <p className="text-[11px] text-text-secondary font-sans truncate">
                      <span className="font-medium text-foreground">{brandName}</span>
                      {collab.platform ? ` · ${collab.platform}` : ""}
                      {collab.deadline ? ` · Due ${formatDate(collab.deadline)}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-theme/40 pl-0 sm:pl-3">
                  {price !== undefined && price !== null && (
                    <span className="font-heading font-medium text-xs sm:text-sm text-foreground tabular-nums">
                      {formatCurrency(price, collab.currency || "INR")}
                    </span>
                  )}
                  <span className="text-[11px] font-sans font-medium text-black dark:text-white inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform mt-0.5">
                    <span>Open workspace</span>
                    <ArrowRightIcon className="w-3 h-3" />
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
