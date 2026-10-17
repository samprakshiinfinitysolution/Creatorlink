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

function getTimeRemaining(deadlineStr) {
  if (!deadlineStr) return null;
  const target = new Date(deadlineStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (isNaN(diffMs)) return null;

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: "Past due", urgent: true };
  if (diffDays === 0) return { label: "Due today", urgent: true };
  if (diffDays === 1) return { label: "Due tomorrow", urgent: true };
  if (diffDays <= 3) return { label: `${diffDays} days left`, urgent: true };
  return { label: `${diffDays} days left`, urgent: false };
}

function getSourceBadge(sourceType) {
  const normalized = typeof sourceType === "string" ? sourceType.trim().toLowerCase() : "";
  switch (normalized) {
    case "workspace":
      return {
        label: "Workspace Deliverable",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    case "brand_proposal":
      return {
        label: "Brand Proposal",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "campaign_application":
      return {
        label: "Campaign Application",
        color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      };
    default:
      return {
        label: sourceType ? String(sourceType).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()) : "Deadline",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
}

function getSourceLink(sourceType, id) {
  const normalized = typeof sourceType === "string" ? sourceType.trim().toLowerCase() : "";
  switch (normalized) {
    case "workspace":
      return id ? `/creator/workspace/${id}` : "/creator/workspace";
    case "brand_proposal":
    case "campaign_application":
    default:
      return "/creator/campaigns";
  }
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function CalendarCheckIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75l2.25 2.25 4.5-4.5" />
    </svg>
  );
}

export default function CreatorUpcomingDeadlines({ deadlines = [] }) {
  const safeDeadlines = Array.isArray(deadlines) ? deadlines : [];

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-lg sm:text-xl text-foreground">
            Upcoming Deadlines
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Closest collaboration milestones, deliverables, and proposal deadlines
          </p>
        </div>
        <Link
          href="/creator/workspace"
          className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
        >
          <span>View All</span>
          <ArrowRightIcon />
        </Link>
      </div>

      {safeDeadlines.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-border-theme rounded-xl space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CalendarCheckIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-medium text-base text-foreground">
            No upcoming deadlines
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            All workspace deliverables and campaign milestones are on schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeDeadlines.map((item, idx) => {
            const normalizedSourceType =
              typeof item.sourceType === "string"
                ? item.sourceType.trim().toLowerCase()
                : "";
            const sourceBadge = getSourceBadge(item.sourceType);
            const remaining = getTimeRemaining(item.deadline);
            const itemId = item.id || item._id;
            const targetLink = getSourceLink(item.sourceType, itemId);
            const price = item.agreedPrice ?? item.budget ?? item.compensation;
            const title =
              (typeof item.title === "string" && item.title.trim()) ||
              (typeof item.campaign?.title === "string" && item.campaign.title.trim()) ||
              (normalizedSourceType === "workspace"
                ? "Workspace Deliverable"
                : normalizedSourceType === "brand_proposal"
                ? "Brand Proposal"
                : normalizedSourceType === "campaign_application"
                ? "Campaign Application"
                : "Milestone Deliverable");
            const brandName = item.brandName || item.brand?.name || "";
            const platform = item.platform || item.campaign?.platform || "";
            const deliverablesCount = item.deliverablesCount;

            return (
              <Link
                key={itemId || idx}
                href={targetLink}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted/50 hover:border-secondary/40 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${sourceBadge.color}`}
                    >
                      {sourceBadge.label}
                    </span>
                    {typeof deliverablesCount === "number" && deliverablesCount > 0 && (
                      <span className="text-[10px] text-text-secondary">
                        {deliverablesCount} deliverable{deliverablesCount === 1 ? "" : "s"}
                      </span>
                    )}
                    {remaining && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          remaining.urgent
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : "bg-surface-muted text-text-secondary border border-border-theme"
                        }`}
                      >
                        {remaining.label}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground text-xs sm:text-sm font-sans truncate group-hover:text-secondary transition-colors">
                    {title}
                  </h4>
                  <p className="text-[11px] text-text-secondary truncate">
                    {brandName ? `Brand: ${brandName} · ` : ""}
                    {platform ? `${platform} · ` : ""}
                    Due {formatDate(item.deadline)}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                  {price !== undefined && price !== null && (
                    <span className="font-semibold text-foreground text-xs font-sans">
                      {formatCurrency(price, item.currency || "INR")}
                    </span>
                  )}
                  <span className="text-[10px] font-medium text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    View details →
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
