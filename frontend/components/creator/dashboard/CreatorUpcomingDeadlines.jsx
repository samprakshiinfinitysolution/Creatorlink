import React, { useState } from "react";
import Link from "next/link";

function getInitials(title, fallback = "DL") {
  if (!title || typeof title !== "string") return fallback;
  const clean = title.trim();
  if (!clean) return fallback;
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const first = words[0][0] || "";
    const second = words[1][0] || "";
    return (first + second).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function DeliverableCoverBadge({ title, coverImage, fallbackText = "DL" }) {
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(title, fallbackText);
  const rawSrc = typeof coverImage === "string" ? coverImage.trim() : null;
  const showImage = Boolean(rawSrc && !hasError);

  if (showImage) {
    return (
      <div className="w-10 h-10 rounded-xl bg-surface-muted/60 border border-border-theme overflow-hidden shrink-0 flex items-center justify-center mt-0.5 sm:mt-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={rawSrc}
          src={rawSrc}
          alt={title || "Deliverable"}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center shrink-0 font-semibold text-xs text-secondary tracking-wider font-sans select-none mt-0.5 sm:mt-0"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

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
  if (diffDays < 0) return { label: "Past due", type: "past_due" };
  if (diffDays === 0) return { label: "Due today", type: "today" };
  if (diffDays === 1) return { label: "Due tomorrow", type: "tomorrow" };
  if (diffDays <= 3) return { label: `${diffDays} days left`, type: "urgent" };
  return { label: `${diffDays} days left`, type: "normal" };
}

function getSourceBadge(sourceType) {
  const normalized = typeof sourceType === "string" ? sourceType.trim().toLowerCase() : "";
  switch (normalized) {
    case "workspace":
      return {
        label: "Workspace Deliverable",
        color: "bg-transparent text-blue-600 dark:text-blue-400 border border-blue-500/30",
      };
    case "brand_proposal":
      return {
        label: "Brand Proposal",
        color: "bg-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30",
      };
    case "campaign_application":
      return {
        label: "Campaign Pitch",
        color: "bg-transparent text-purple-600 dark:text-purple-400 border border-purple-500/30",
      };
    default:
      return {
        label: sourceType
          ? String(sourceType).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())
          : "Deadline",
        color: "bg-transparent text-text-secondary border border-border-theme",
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

function CalendarCheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75l2.25 2.25 4.5-4.5" />
    </svg>
  );
}

export default function CreatorUpcomingDeadlines({ deadlines = [] }) {
  const safeDeadlines = Array.isArray(deadlines) ? deadlines : [];

  return (
    <div className="bg-surface border border-border-theme hover:border-pink-200/80 dark:hover:border-pink-500/20 rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs transition-all duration-200 flex flex-col space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="font-serif font-medium text-lg sm:text-xl text-foreground tracking-tight">
            Upcoming Deadlines
          </h2>
          <p className="text-xs text-text-secondary font-sans mt-0.5">
            Active milestones, deliverables, and brand proposal deadlines
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
      {safeDeadlines.length === 0 ? (
        <div className="py-6 px-4 rounded-2xl bg-surface-muted/30 border border-border-theme/60 text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarCheckIcon className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-serif font-medium text-sm sm:text-base text-foreground">
            You&apos;re on schedule
          </h3>
          <p className="text-xs text-text-secondary font-sans max-w-xs leading-relaxed">
            No pending deliverables or campaign milestones require your attention today.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
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
                ? "Campaign Pitch"
                : "Milestone Deliverable");
            const brandName = item.brandName || item.brand?.name || "";
            const platform = item.platform || item.campaign?.platform || "";
            const deliverablesCount = item.deliverablesCount;

            // Subtle urgency pill
            let urgencyClass = "bg-transparent text-text-secondary border border-border-theme/60";
            if (remaining?.type === "today" || remaining?.type === "past_due") {
              urgencyClass = "bg-transparent text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold";
            } else if (remaining?.type === "tomorrow" || remaining?.type === "urgent") {
              urgencyClass = "bg-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold";
            }

            const coverImage =
              item.coverImage ||
              item.campaign?.coverImage ||
              item.thumbnail ||
              item.image ||
              "";

            return (
              <Link
                key={itemId || idx}
                href={targetLink}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-border-theme/60 bg-surface hover:bg-surface-muted/40 hover:border-pink-200/80 dark:hover:border-pink-500/30 transition-all duration-200"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <DeliverableCoverBadge
                    title={title}
                    coverImage={coverImage}
                    fallbackText="DL"
                  />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${sourceBadge.color}`}
                      >
                        {sourceBadge.label}
                      </span>
                      {remaining && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans border ${urgencyClass}`}
                        >
                          {remaining.type === "today" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          )}
                          <span>{remaining.label}</span>
                        </span>
                      )}
                      {typeof deliverablesCount === "number" && deliverablesCount > 0 && (
                        <span className="text-[10px] text-text-secondary font-sans font-medium">
                          · {deliverablesCount} deliverable{deliverablesCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                    <h4
                      className="font-sans font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-secondary transition-colors"
                      title={title}
                    >
                      {title}
                    </h4>
                    <p className="text-[11px] text-text-secondary font-sans truncate">
                      {brandName ? <span className="font-medium text-foreground">{brandName}</span> : ""}
                      {brandName && (platform || item.deadline) ? " · " : ""}
                      {platform ? `${platform} · ` : ""}
                      Due {formatDate(item.deadline)}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-theme/40 pl-0 sm:pl-3">
                  {price !== undefined && price !== null && (
                    <span className="font-sans font-semibold text-xs sm:text-sm text-foreground tabular-nums">
                      {formatCurrency(price, item.currency || "INR")}
                    </span>
                  )}
                  <span className="text-[11px] font-sans font-medium text-secondary inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform mt-0.5">
                    <span>View milestone</span>
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
