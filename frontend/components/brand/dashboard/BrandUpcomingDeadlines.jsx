"use client";

import React, { useState } from "react";
import Link from "next/link";

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

function getSourceLink(sourceType, id) {
  const normalized = typeof sourceType === "string" ? sourceType.trim().toLowerCase() : "";
  switch (normalized) {
    case "workspace":
      return id ? `/brand/workspace/${id}` : "/brand/workspace";
    case "creator_proposal":
    case "brand_proposal":
      return "/brand/bookings";
    case "campaign":
    default:
      return "/brand/campaigns";
  }
}

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

function DeliverableAvatar({ title, thumbnail, fallbackText = "DL" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const initials = getInitials(title, fallbackText);
  const hasFailed = Boolean(thumbnail && failedUrl === thumbnail);

  if (thumbnail && !hasFailed) {
    return (
      <div className="w-10 h-10 rounded-xl bg-surface-muted/60 border border-border-theme overflow-hidden shrink-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={thumbnail}
          src={thumbnail}
          alt={title || "Deliverable"}
          className="w-full h-full object-cover"
          onError={() => setFailedUrl(thumbnail)}
        />
      </div>
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0 font-bold text-xs text-secondary tracking-wider font-sans select-none"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// =========================================================
// SVG ICONS
// =========================================================
function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function CalendarCheckIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75l2.25 2.25 4.5-4.5" />
    </svg>
  );
}

function CalendarIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

export default function BrandUpcomingDeadlines({ deadlines = [] }) {
  const safeDeadlines = Array.isArray(deadlines) ? deadlines : [];

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans font-bold text-lg sm:text-xl text-foreground tracking-tight">
            Upcoming Deliverables
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Closest workspace milestones, reviews, and deadlines
          </p>
        </div>
        <Link
          href="/brand/workspace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
        >
          <span>View All</span>
          <ArrowRightIcon />
        </Link>
      </div>

      {safeDeadlines.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-border-theme rounded-2xl space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CalendarCheckIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-medium text-base text-foreground">
            No upcoming deliverables
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto font-sans">
            All milestone deliverables and proposals are fully up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeDeadlines.slice(0, 5).map((item, idx) => {
            const itemId = item.id || item._id;
            const targetLink = getSourceLink(item.sourceType, itemId);

            // Platform display name (e.g. "Instagram", "YouTube")
            const platformName = item.platform
              ? String(item.platform)
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              : "Multiple";

            // Creator count: only when real count is available (e.g. campaign.requiredCreators)
            const creatorCount =
              typeof item.requiredCreators === "number" && item.requiredCreators > 0
                ? item.requiredCreators
                : Array.isArray(item.requiredCreators) && item.requiredCreators.length > 0
                ? item.requiredCreators.length
                : null;

            const creatorCountText =
              creatorCount !== null
                ? `${creatorCount} ${creatorCount === 1 ? "Creator" : "Creators"}`
                : null;

            const subline = creatorCountText
              ? `${platformName} · ${creatorCountText}`
              : platformName;

            // Clamped progress calculation for workspaces
            const rawProgress =
              typeof item.deliverablesProgress === "number" ? item.deliverablesProgress : 0;
            const clampedProgress = Math.min(100, Math.max(0, Math.round(rawProgress)));
            const isWorkspace = item.sourceType === "workspace";
            const isCampaign = item.sourceType === "campaign";
            const hasDeliverables =
              isWorkspace &&
              typeof item.deliverablesCount === "number" &&
              item.deliverablesCount > 0;

            return (
              <Link
                key={itemId || idx}
                href={targetLink}
                className="group block p-3 sm:p-3.5 rounded-xl border border-border-theme bg-surface-muted/40 hover:bg-surface-muted/70 hover:border-secondary/40 transition-all space-y-2"
              >
                {/* Top: Thumbnail/Avatar + Title + Platform/Creators + Date */}
                <div className="flex items-start gap-3">
                  <DeliverableAvatar
                    title={item.title}
                    thumbnail={item.thumbnail || item.image}
                    fallbackText={isCampaign ? "CP" : "WS"}
                  />
                  <div className="min-w-0 flex-1">
                    <h4
                      className="font-semibold text-foreground text-sm font-sans truncate group-hover:text-secondary transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </h4>

                    {/* Platform & Creator Count on same line */}
                    <p className="text-xs text-text-secondary truncate mt-0.5 font-sans">
                      {subline}
                    </p>

                    {/* Calendar & Deadline on next line */}
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1 font-sans">
                      <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-text-secondary/70" />
                      <span>{formatDate(item.deadline)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Deliverables Progress Bar or Contextual Details */}
                {hasDeliverables ? (
                  <div className="pt-1.5 border-t border-border-theme/40 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider font-sans">
                      <span className="text-text-secondary uppercase text-[10px]">
                        DELIVERABLES PROGRESS
                      </span>
                      <span className="text-secondary font-bold text-xs font-sans">
                        {clampedProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border-theme/30">
                      <div
                        className="bg-secondary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${clampedProgress}%` }}
                      />
                    </div>
                  </div>
                ) : isWorkspace ? (
                  <div className="pt-1.5 border-t border-border-theme/40 text-[11px] text-text-secondary italic font-sans">
                    Pending milestone setup
                  </div>
                ) : isCampaign && creatorCount !== null ? (
                  <div className="pt-1.5 border-t border-border-theme/40 flex items-center justify-between text-xs font-sans">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
                      TARGET CREATORS
                    </span>
                    <span className="font-medium text-foreground text-xs font-sans">
                      {creatorCount} {creatorCount === 1 ? "Creator" : "Creators"}
                    </span>
                  </div>
                ) : !isCampaign && !isWorkspace ? (
                  <div className="pt-1.5 border-t border-border-theme/40 text-[11px] text-text-secondary font-sans">
                    {item.sourceType === "creator_proposal"
                      ? "Proposal awaiting review"
                      : "Proposal sent to creator"}
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
