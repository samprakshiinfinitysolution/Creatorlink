"use client";

import React, { useState } from "react";
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

function getStatusBadge(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  switch (normalized) {
    case "published":
    case "active":
      return {
        label: "Published",
        dotColor: "bg-emerald-500",
        textColor: "text-emerald-500 dark:text-emerald-400",
      };
    case "in_progress":
      return {
        label: "In Progress",
        dotColor: "bg-blue-500",
        textColor: "text-blue-500 dark:text-blue-400",
      };
    case "draft":
      return {
        label: "Draft",
        dotColor: "bg-amber-500",
        textColor: "text-amber-500 dark:text-amber-400",
      };
    case "paused":
      return {
        label: "Paused",
        dotColor: "bg-yellow-500",
        textColor: "text-yellow-600 dark:text-yellow-400",
      };
    case "completed":
      return {
        label: "Completed",
        dotColor: "bg-[#ff2d6c]",
        textColor: "text-[#ff2d6c] dark:text-[#ff4f87]",
      };
    case "closed":
      return {
        label: "Closed",
        dotColor: "bg-slate-400",
        textColor: "text-slate-500 dark:text-slate-400",
      };
    default:
      return {
        label: status ? String(status).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Draft",
        dotColor: "bg-slate-400",
        textColor: "text-slate-500 dark:text-slate-400",
      };
  }
}

function getCampaignInitials(title) {
  if (!title || typeof title !== "string") return "CP";
  const clean = title.trim();
  if (!clean) return "CP";
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const first = words[0][0] || "";
    const second = words[1][0] || "";
    return (first + second).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function CampaignAvatar({ title, coverImage, thumbnail }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const initials = getCampaignInitials(title);
  const imageSrc = coverImage || thumbnail;
  const hasFailed = Boolean(imageSrc && failedUrl === imageSrc);

  if (imageSrc && !hasFailed) {
    return (
      <div className="w-10 h-10 rounded-xl bg-secondary/5 border border-secondary/10 overflow-hidden shrink-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={imageSrc}
          src={imageSrc}
          alt={title || "Campaign"}
          className="w-full h-full object-cover"
          onError={() => setFailedUrl(imageSrc)}
        />
      </div>
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center shrink-0 font-bold text-xs text-secondary tracking-wider font-sans select-none"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function getPlatformBadge(platform) {
  const norm = typeof platform === "string" ? platform.trim().toLowerCase() : "";
  switch (norm) {
    case "instagram":
      return {
        label: "Instagram",
        icon: InstagramIcon,
        iconColor: "text-pink-500",
      };
    case "youtube":
      return {
        label: "YouTube",
        icon: YoutubeIcon,
        iconColor: "text-red-500",
      };
    case "tiktok":
      return {
        label: "TikTok",
        icon: TiktokIcon,
        iconColor: "text-cyan-500",
      };
    case "facebook":
      return {
        label: "Facebook",
        icon: FacebookIcon,
        iconColor: "text-blue-600",
      };
    case "website":
      return {
        label: "Website",
        icon: GlobeIcon,
        iconColor: "text-emerald-500",
      };
    default: {
      const displayLabel = platform
        ? String(platform).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "General";
      return {
        label: displayLabel,
        icon: GlobeIcon,
        iconColor: "text-text-secondary",
      };
    }
  }
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

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function MegaphoneIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TiktokIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.47V8.84a8.27 8.27 0 0 0 4.89 1.57V6.96a4.83 4.83 0 0 1-1-.27z" />
    </svg>
  );
}

function GlobeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m-17.432-6.75A8.959 8.959 0 003 12c0 .778.099 1.533.284 2.253" />
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

function UsersIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.573 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PencilIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

export default function BrandRecentCampaigns({ campaigns = [] }) {
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-5 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground tracking-tight">
            Recent Campaigns
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">
            Latest campaign briefs, platform targets, and budgets
          </p>
        </div>
        <Link
          href="/brand/campaigns"
          className="text-xs font-semibold text-[#ff2d6c] hover:underline transition-colors"
        >
          View All
        </Link>
      </div>

      {safeCampaigns.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-border-theme rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary/8 text-[#252525] dark:text-white flex items-center justify-center">
            <MegaphoneIcon className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-semibold text-sm sm:text-base text-foreground">
            No campaigns yet
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto font-sans">
            Create your first brand brief to start connecting with creators and driving deliverables.
          </p>
          <div className="pt-2">
            <Link
              href="/brand/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#252525] hover:bg-[#111111] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <PlusIcon />
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar -mx-6 px-6 min-h-[160px]">
          <table className="w-full text-left text-xs border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-border-theme bg-surface-muted/40 text-text-secondary uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3.5 px-5 min-w-[220px]">Campaign</th>
                <th className="py-3.5 px-4 min-w-[120px]">Platform</th>
                <th className="py-3.5 px-4 min-w-[110px]">Category</th>
                <th className="py-3.5 px-4 min-w-[100px]">Budget</th>
                <th className="py-3.5 px-4 min-w-[90px]">Creators</th>
                <th className="py-3.5 px-4 min-w-[110px]">Status</th>
                <th className="py-3.5 px-4 min-w-[120px]">Deadline</th>
                <th className="py-3.5 px-5 text-right min-w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {safeCampaigns.map((c, idx) => {
                const campaignId = c._id || c.id;
                const badge = getStatusBadge(c.status);
                const platformInfo = getPlatformBadge(c.platform);
                const PlatformIcon = platformInfo.icon;
                const reqCreators =
                  typeof c.requiredCreators === "number"
                    ? c.requiredCreators
                    : Array.isArray(c.requiredCreators)
                      ? c.requiredCreators.length
                      : c.requiredCreators !== undefined && c.requiredCreators !== null
                        ? c.requiredCreators
                        : "—";

                return (
                  <tr
                    key={campaignId || idx}
                    className="hover:bg-surface-muted/30 transition-colors"
                  >
                    {/* Campaign Info (Avatar + Title + Category Subtitle) */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <CampaignAvatar title={c.title} coverImage={c.coverImage || c.image || c.thumbnail} />
                        <div className="min-w-0">
                          <Link
                            href="/brand/campaigns"
                            className="font-semibold text-foreground text-[13px] font-sans hover:text-secondary transition-colors text-left truncate block max-w-[240px]"
                            title={c.title}
                          >
                            {c.title}
                          </Link>
                          <span className="text-[11px] text-text-secondary truncate block max-w-[240px]">
                            {c.category || "General"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <PlatformIcon
                          className={`w-3.5 h-3.5 shrink-0 ${platformInfo.iconColor || "text-text-secondary"}`}
                        />
                        <span>{platformInfo.label}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-muted border border-border-theme text-foreground">
                        {c.category || "General"}
                      </span>
                    </td>

                    {/* Budget */}
                    <td className="py-4 px-4 font-semibold text-foreground whitespace-nowrap">
                      {formatCurrency(c.budget, c.currency || "INR")}
                    </td>

                    {/* Creators */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-text-secondary font-medium">
                        <UsersIcon className="w-3.5 h-3.5 text-text-secondary/70 shrink-0" />
                        <span>{reqCreators}</span>
                      </span>
                    </td>

                    {/* Status Column with Inline Dot + Text */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${badge.dotColor || "bg-slate-400"}`} />
                        <span className={`text-xs font-medium font-sans ${badge.textColor || "text-foreground"}`}>
                          {badge.label}
                        </span>
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-text-secondary font-medium">
                        <CalendarIcon className="w-3.5 h-3.5 text-text-secondary/70 shrink-0" />
                        <span>{formatDate(c.deadline)}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Link
                          href="/brand/campaigns"
                          className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                          title="View Campaign Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <Link
                          href="/brand/campaigns"
                          className="p-1.5 rounded-lg text-text-secondary hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                          title="Edit Campaign"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer summary matching campaigns design */}
      {safeCampaigns.length > 0 && (
        <div className="pt-2 border-t border-border-theme flex items-center justify-between text-xs text-text-secondary">
          <span>
            Showing <span className="font-semibold text-foreground">1–{safeCampaigns.length}</span> of{" "}
            <span className="font-semibold text-foreground">{safeCampaigns.length}</span> recent campaigns
          </span>
          <Link
            href="/brand/campaigns"
            className="text-xs font-semibold text-[#ff2d6c] hover:underline transition-colors"
          >
            Manage all in Campaigns
          </Link>
        </div>
      )}
    </div>
  );
}
