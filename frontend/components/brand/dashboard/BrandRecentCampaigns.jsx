"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    case "draft":
      return {
        label: "Draft",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-secondary/10 text-secondary border-secondary/20",
      };
    case "closed":
      return {
        label: "Closed",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
    default:
      return {
        label: status ? String(status).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Draft",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
}

function getPlatformBadge(platform) {
  const norm = typeof platform === "string" ? platform.trim().toLowerCase() : "";
  switch (norm) {
    case "instagram":
      return {
        label: "Instagram",
        icon: InstagramIcon,
        className: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
      };
    case "youtube":
      return {
        label: "YouTube",
        icon: YoutubeIcon,
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      };
    case "tiktok":
      return {
        label: "TikTok",
        icon: TiktokIcon,
        className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      };
    case "facebook":
      return {
        label: "Facebook",
        icon: FacebookIcon,
        className: "bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-600/20",
      };
    case "website":
      return {
        label: "Website",
        icon: GlobeIcon,
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    case "multiple":
    default: {
      const displayLabel = platform
        ? String(platform).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "Multiple";
      return {
        label: displayLabel,
        icon: GlobeIcon,
        className: "bg-surface-muted text-text-secondary border-border-theme",
      };
    }
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

function CampaignAvatar({ title, thumbnail }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const initials = getCampaignInitials(title);

  const hasFailed = Boolean(thumbnail && failedUrl === thumbnail);

  if (thumbnail && !hasFailed) {
    return (
      <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 overflow-hidden shrink-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={thumbnail}
          src={thumbnail}
          alt={title || "Campaign"}
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
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TiktokIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.28 6.34 6.34 0 0 0 9.34 21.6 6.34 6.34 0 0 0 15.68 15.28V8.72a8.18 8.18 0 0 0 4.77 1.52V6.79a4.84 4.84 0 0 1-.86-.1z" />
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

function MoreVerticalIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
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

function CopyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
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

function AlertCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

export default function BrandRecentCampaigns({ campaigns = [] }) {
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const [openMenuId, setOpenMenuId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const menuRef = useRef(null);
  const lastTriggerRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Track component mounted lifecycle and clean up pending feedback timeouts
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown on outside click or Escape key with focus restoration
  useEffect(() => {
    if (!openMenuId) return;

    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpenMenuId(null);
        if (lastTriggerRef.current) {
          lastTriggerRef.current.focus();
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuId]);

  // When menu opens via keyboard, set focus to first item for accessibility
  useEffect(() => {
    if (openMenuId && menuRef.current) {
      const firstItem = menuRef.current.querySelector(
        'a[role="menuitem"], button[role="menuitem"]'
      );
      if (firstItem && document.activeElement === lastTriggerRef.current) {
        firstItem.focus();
      }
    }
  }, [openMenuId]);

  // Keyboard navigation within the dropdown menu (Arrow keys)
  const handleMenuKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const menu = menuRef.current;
      if (!menu) return;
      const items = Array.from(
        menu.querySelectorAll('a[role="menuitem"], button[role="menuitem"]')
      );
      const currentIndex = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
      }
    }
  };

  const handleCopyId = useCallback((id) => {
    if (!id || !isMountedRef.current) return;

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    const applyFeedback = (status) => {
      if (!isMountedRef.current) return;
      setCopyFeedback({ id, status });
      copyTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setCopyFeedback(null);
        if (status === "success") {
          setOpenMenuId(null);
        }
      }, 1500);
    };

    const fallbackCopy = () => {
      if (!isMountedRef.current) return;
      let textArea = null;
      let successful = false;

      try {
        textArea = document.createElement("textarea");
        textArea.value = String(id);
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.setAttribute("readonly", "");
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        successful = document.execCommand("copy");
      } catch {
        successful = false;
      } finally {
        if (textArea && textArea.parentNode) {
          textArea.parentNode.removeChild(textArea);
        }
      }

      applyFeedback(successful ? "success" : "error");
    };

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(String(id))
        .then(() => {
          if (!isMountedRef.current) return;
          applyFeedback("success");
        })
        .catch(() => {
          if (!isMountedRef.current) return;
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  }, []);

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-5 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-lg sm:text-xl text-foreground">
            Recent Campaigns
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Latest campaign briefs, platform targets, and budgets
          </p>
        </div>
        <Link
          href="/brand/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
        >
          <span>View All</span>
          <ArrowRightIcon />
        </Link>
      </div>

      {safeCampaigns.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-border-theme rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <MegaphoneIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-medium text-base sm:text-lg text-foreground">
            No campaigns yet
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto font-sans">
            Create your first brand brief to start connecting with creators and driving deliverables.
          </p>
          <div className="pt-2">
            <Link
              href="/brand/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all shadow-xs"
            >
              <PlusIcon />
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar -mx-6 px-6 min-h-[160px]">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-border-theme text-text-secondary uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-3">Campaign</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Budget</th>
                <th className="py-3 px-3">Creators</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Deadline</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {safeCampaigns.map((c, idx) => {
                const campaignId = c.id || c._id;
                const badge = getStatusBadge(c.status);
                const platformBadge = getPlatformBadge(c.platform);
                const PlatformIcon = platformBadge.icon;
                const isOpen = openMenuId === campaignId;
                const isLastRow = safeCampaigns.length > 2 && idx >= safeCampaigns.length - 2;
                const reqCreators =
                  typeof c.requiredCreators === "number"
                    ? c.requiredCreators
                    : Array.isArray(c.requiredCreators)
                    ? c.requiredCreators.length
                    : c.requiredCreators || 1;

                return (
                  <tr
                    key={campaignId || idx}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    {/* Campaign (Avatar + Title + Category) */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <CampaignAvatar title={c.title} thumbnail={c.thumbnail || c.image} />
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                          <Link
                            href="/brand/campaigns"
                            className="font-semibold text-foreground text-xs sm:text-sm font-sans hover:text-secondary transition-colors block truncate"
                            title={c.title}
                          >
                            {c.title}
                          </Link>
                          <span className="text-[11px] text-text-secondary block truncate mt-0.5">
                            {c.category || "General"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Platform Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${platformBadge.className}`}
                      >
                        <PlatformIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{platformBadge.label}</span>
                      </span>
                    </td>

                    {/* Budget */}
                    <td className="py-3.5 px-3 font-semibold text-foreground whitespace-nowrap">
                      {formatCurrency(c.budget, c.currency || "INR")}
                    </td>

                    {/* Creators */}
                    <td className="py-3.5 px-3 text-text-secondary font-medium whitespace-nowrap">
                      {reqCreators} {reqCreators === 1 ? "creator" : "creators"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-3 text-text-secondary font-medium whitespace-nowrap">
                      {formatDate(c.deadline)}
                    </td>

                    {/* Actions (Three-Dot Menu) */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap relative">
                      <div
                        className="relative inline-block text-left"
                        ref={isOpen ? menuRef : null}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOpen) {
                              setOpenMenuId(null);
                            } else {
                              lastTriggerRef.current = e.currentTarget;
                              setOpenMenuId(campaignId);
                            }
                          }}
                          aria-label={`Campaign actions for ${c.title || "campaign"}`}
                          aria-expanded={isOpen}
                          aria-haspopup="menu"
                          className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/40"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>

                        {isOpen && (
                          <div
                            role="menu"
                            onKeyDown={handleMenuKeyDown}
                            className={`absolute right-0 w-44 bg-surface border border-border-theme rounded-xl shadow-lg p-1.5 z-50 text-foreground font-sans ${
                              isLastRow ? "bottom-full mb-1.5" : "top-full mt-1.5"
                            }`}
                          >
                            <Link
                              href="/brand/campaigns"
                              onClick={() => setOpenMenuId(null)}
                              role="menuitem"
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted focus:bg-surface-muted focus:outline-none focus:ring-1 focus:ring-secondary/30 rounded-lg transition-colors"
                            >
                              <EyeIcon className="w-4 h-4 text-text-secondary shrink-0" />
                              <span>View Details</span>
                            </Link>

                            {campaignId && (
                              <button
                                type="button"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyId(campaignId);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted focus:bg-surface-muted focus:outline-none focus:ring-1 focus:ring-secondary/30 rounded-lg transition-colors text-left cursor-pointer"
                              >
                                {copyFeedback?.id === campaignId && copyFeedback?.status === "success" ? (
                                  <>
                                    <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="text-emerald-500 font-medium">Copied ID!</span>
                                  </>
                                ) : copyFeedback?.id === campaignId && copyFeedback?.status === "error" ? (
                                  <>
                                    <AlertCircleIcon className="w-4 h-4 text-red-500 shrink-0" />
                                    <span className="text-red-500 font-medium">Failed to copy</span>
                                  </>
                                ) : (
                                  <>
                                    <CopyIcon className="w-4 h-4 text-text-secondary shrink-0" />
                                    <span>Copy Campaign ID</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
