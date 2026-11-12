"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandCampaignsHero from "@/components/brand/campaigns/BrandCampaignsHero";
import BrandBookingDetailModal from "@/components/brand/bookings/BrandBookingDetailModal";
import TargetPlatformSelector from "@/components/brand/campaigns/TargetPlatformSelector";
import { normalizeCampaignPlatforms, formatCampaignPlatforms } from "@/lib/campaignPlatforms";
import { uploadSingleImageApi } from "@/lib/upload";
import {
  getBrandCampaigns,
  createCampaign,
  getCampaignById,
  updateCampaign,
  clearSelectedCampaign,
} from "@/redux/brand/campaigns/campaigns_slice";
import { getBrandBookings as getBrandBookingsApi } from "@/redux/brand/bookings/bookings_api";
import { updateBrandBookingStatus } from "@/redux/brand/bookings/bookings_slice";
import { socket, registerSocketConsumer, unregisterSocketConsumer } from "@/lib/socket";

// =========================================================
// HELPER FORMATTERS & BADGES
// =========================================================
function formatBudgetRange(minBudget, maxBudget, fallbackBudget, currency = "INR") {
  const hasMin = minBudget !== undefined && minBudget !== null && !isNaN(Number(minBudget)) && Number(minBudget) > 0;
  const hasMax = maxBudget !== undefined && maxBudget !== null && !isNaN(Number(maxBudget)) && Number(maxBudget) > 0;

  if (hasMin && hasMax) {
    if (Number(minBudget) === Number(maxBudget)) {
      return formatCurrency(minBudget, currency);
    }
    return `${formatCurrency(minBudget, currency)} – ${formatCurrency(maxBudget, currency)}`;
  }
  if (hasMax) return formatCurrency(maxBudget, currency);
  if (hasMin) return `From ${formatCurrency(minBudget, currency)}`;
  return formatCurrency(fallbackBudget, currency);
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

function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function isValidImageUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
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
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "in_progress":
      return {
        label: "In Progress",
        dotColor: "bg-blue-500",
        textColor: "text-blue-500 dark:text-blue-400",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    case "draft":
      return {
        label: "Draft",
        dotColor: "bg-amber-500",
        textColor: "text-amber-500 dark:text-amber-400",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "paused":
      return {
        label: "Paused",
        dotColor: "bg-yellow-500",
        textColor: "text-yellow-600 dark:text-yellow-400",
        color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        dotColor: "bg-[#ff2d6c]",
        textColor: "text-[#ff2d6c] dark:text-[#ff4f87]",
        color: "bg-secondary/10 text-secondary border-secondary/20",
      };
    case "closed":
      return {
        label: "Closed",
        dotColor: "bg-slate-400",
        textColor: "text-slate-500 dark:text-slate-400",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
    default:
      return {
        label: status ? String(status).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Draft",
        dotColor: "bg-slate-400",
        textColor: "text-slate-500 dark:text-slate-400",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
}

function getBookingStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        label: "Pending",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "accepted":
      return {
        label: "Accepted",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "rejected":
      return {
        label: "Rejected",
        color: "bg-red-500/10 text-red-500 border-red-500/20",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-secondary/10 text-secondary border-secondary/20",
      };
    default:
      return {
        label: status ? String(status).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Unknown",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
}

function getCreatorInitials(name) {
  if (!name || typeof name !== "string") return "C";
  const clean = name.trim();
  if (!clean) return "C";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function formatFollowers(count) {
  if (count === undefined || count === null || isNaN(Number(count))) return "N/A";
  const num = Number(count);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
}

function StarIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function CreatorApplicantAvatar({ name, image }) {
  const [hasFailed, setHasFailed] = useState(false);
  const initials = getCreatorInitials(name);

  if (image && !hasFailed) {
    return (
      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-border-theme bg-surface-muted flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name || "Creator"}
          className="w-full h-full object-contain object-center"
          onError={() => setHasFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-full shrink-0 border border-border-theme bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs uppercase select-none">
      {initials}
    </div>
  );
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

function CampaignAvatar({ title, coverImage, thumbnail, image }) {
  const imgUrl = coverImage || image || thumbnail;
  const [failedUrl, setFailedUrl] = useState(null);
  const initials = getCampaignInitials(title);
  const hasFailed = Boolean(imgUrl && failedUrl === imgUrl);

  if (imgUrl && !hasFailed) {
    return (
      <div className="w-10 h-10 rounded-xl bg-secondary/5 border border-secondary/10 overflow-hidden shrink-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl}
          alt={title || "Campaign"}
          className="w-full h-full object-contain object-center"
          onError={() => setFailedUrl(imgUrl)}
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
        className: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
      };
    case "youtube":
      return {
        label: "YouTube",
        icon: YoutubeIcon,
        iconColor: "text-red-500",
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      };
    case "tiktok":
      return {
        label: "TikTok",
        icon: TiktokIcon,
        iconColor: "text-cyan-500",
        className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      };
    case "facebook":
      return {
        label: "Facebook",
        icon: FacebookIcon,
        iconColor: "text-blue-600",
        className: "bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-600/20",
      };
    case "website":
      return {
        label: "Website",
        icon: GlobeIcon,
        iconColor: "text-emerald-500",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    default: {
      const displayLabel = platform
        ? String(platform).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "General";
      return {
        label: displayLabel,
        icon: GlobeIcon,
        iconColor: "text-text-secondary",
        className: "bg-surface-muted text-text-secondary border-border-theme",
      };
    }
  }
}

// Backend-enforced status transition rules
function getValidNextStatuses(currentStatus) {
  switch (currentStatus?.toLowerCase()) {
    case "draft":
      return ["published", "closed"];
    case "published":
      return ["paused", "in_progress", "closed"];
    case "paused":
      return ["published", "closed"];
    case "in_progress":
      return ["completed", "closed"];
    case "completed":
    case "closed":
    default:
      return [];
  }
}

// =========================================================
// SVG ICONS
// =========================================================

function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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

function MegaPhoneIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArrowPathIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function XMarkIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

function InstagramIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
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

function FacebookIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function GlobeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  );
}

function PhotoIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ArrowUpTrayIcon({ className = "w-4 h-4" }) {
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

function LockClosedIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

// =========================================================
// REUSABLE CAMPAIGN COVER UPLOADER COMPONENT
// =========================================================
function CampaignCoverUpload({
  coverImage = "",
  onChange,
  onUploadingChange,
  disabled = false,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploaded, setIsUploaded] = useState(() =>
    Boolean(
      coverImage &&
        (coverImage.includes("cloudinary.com") ||
          coverImage.includes("res.cloudinary.com"))
    )
  );
  const [uploadError, setUploadError] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef(null);

  const [prevCover, setPrevCover] = useState(coverImage);
  if (prevCover !== coverImage) {
    setPrevCover(coverImage);
    setPreviewError(false);
  }

  const notifyUploading = (state) => {
    setIsUploading(state);
    if (onUploadingChange) onUploadingChange(state);
  };

  const processFile = async (file) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Please upload a valid image file (JPEG, PNG, or WebP).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadError(null);
    setPreviewError(false);
    notifyUploading(true);

    try {
      const uploadRes = await uploadSingleImageApi(file, "creatorlink/campaigns");
      const uploadedUrl =
        uploadRes?.url ||
        uploadRes?.secure_url ||
        uploadRes?.data?.url ||
        uploadRes?.data?.secure_url;

      if (uploadedUrl) {
        onChange(uploadedUrl);
        setIsUploaded(true);
      } else {
        setUploadError("Could not retrieve uploaded image URL.");
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to upload campaign cover image.";
      setUploadError(errMsg);
    } finally {
      notifyUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && !disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading || disabled) return;

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e) => {
    e?.stopPropagation();
    onChange("");
    setIsUploaded(false);
    setUploadError(null);
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isCoverLocked = Boolean(
    coverImage &&
      (isUploaded ||
        coverImage.includes("cloudinary.com") ||
        coverImage.includes("res.cloudinary.com"))
  );

  const hasImage = Boolean(coverImage && coverImage.trim());

  return (
    <div className="space-y-2.5">
      <div>
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Cover Image <span className="text-text-secondary font-normal lowercase">(optional)</span>
        </label>
        <p className="text-[11px] text-text-secondary mt-0.5">
          Upload a high-quality visual banner for this campaign (JPG, PNG, WebP, max 5MB)
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {hasImage ? (
        /* Image Exists: 2-Column Preview & Actions */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
          {/* Left: Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-border-theme bg-surface-muted/60 h-32 sm:h-36 group">
            {!previewError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={coverImage}
                alt="Campaign Cover Preview"
                className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-surface-muted text-text-secondary">
                <PhotoIcon className="w-6 h-6 opacity-40 mb-1" />
                <span className="text-[11px] font-medium opacity-80">Image preview unavailable</span>
              </div>
            )}

            {/* Floating Remove Button */}
            <button
              type="button"
              disabled={isUploading || disabled}
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
              title="Remove image"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>

            {isUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center gap-1.5 text-white p-3 text-center">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span className="text-xs font-medium">Uploading cover image...</span>
              </div>
            )}
          </div>

          {/* Right: Upload controls */}
          <div className="flex flex-col justify-between gap-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!isUploading && !disabled) fileInputRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all flex-1 min-h-[90px] ${
                isDragging
                  ? "border-secondary bg-secondary/10 scale-[0.99]"
                  : "border-border-theme hover:border-secondary/60 bg-surface-muted/30 hover:bg-surface-muted/60"
              } ${isUploading || disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-1.5">
                <ArrowUpTrayIcon className="w-4 h-4" />
              </div>
              <p className="font-semibold text-xs text-foreground">Click to upload</p>
              <p className="text-[10px] text-text-secondary mt-0.5">or drag and drop new image</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isUploading || disabled}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-muted border border-border-theme text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 flex-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <PhotoIcon className="w-3.5 h-3.5 text-text-secondary" />
                <span>Change Image</span>
              </button>
              <button
                type="button"
                disabled={isUploading || disabled}
                onClick={handleRemove}
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200/80 dark:border-red-900/60 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 flex-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Full-Width Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading && !disabled) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? "border-secondary bg-secondary/10 scale-[0.99]"
              : "border-border-theme hover:border-secondary/60 bg-surface-muted/20 hover:bg-surface-muted/50"
          } ${isUploading || disabled ? "pointer-events-none opacity-60" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-foreground">
              <ArrowPathIcon className="w-6 h-6 text-secondary animate-spin mb-1" />
              <span className="text-xs font-semibold">Uploading cover image...</span>
              <span className="text-[11px] text-text-secondary">Please wait</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-2">
                <ArrowUpTrayIcon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-xs sm:text-sm text-foreground">
                Click to upload <span className="font-normal text-text-secondary text-xs">or drag and drop</span>
              </p>
              <p className="text-[10px] text-text-secondary mt-1">
                JPG, PNG, WebP (Max 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* OR Divider */}
      <div className="relative my-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-theme/70" />
        </div>
        <div className="relative bg-surface px-2.5">
          <span className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase">
            OR
          </span>
        </div>
      </div>

      {/* Manual Image URL Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-semibold text-foreground">
            Paste Image URL
          </label>
          {isCoverLocked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md border border-secondary/20">
              <LockClosedIcon className="w-3 h-3" />
              <span>Locked (Uploaded)</span>
            </span>
          )}
        </div>
        <div className="relative flex items-center">
          <LinkIcon className="w-3.5 h-3.5 text-text-secondary absolute left-3.5 pointer-events-none" />
          <input
            type="url"
            readOnly={isCoverLocked}
            disabled={isUploading || disabled}
            value={coverImage}
            onChange={(e) => {
              if (isCoverLocked) return;
              const val = e.target.value;
              onChange(val);
              setPreviewError(false);
              if (!val.trim() || isValidImageUrl(val)) {
                setUploadError(null);
              }
            }}
            onPaste={(e) => {
              if (isCoverLocked) return;
              const pasted = e.clipboardData?.getData("text")?.trim();
              if (pasted && !isValidImageUrl(pasted)) {
                setUploadError("Please enter a valid HTTP or HTTPS URL.");
              } else {
                setUploadError(null);
              }
            }}
            onBlur={(e) => {
              if (isCoverLocked) return;
              const val = e.target.value?.trim();
              if (val && !isValidImageUrl(val)) {
                setUploadError("Please enter a valid HTTP or HTTPS URL.");
              }
            }}
            placeholder="https://images.unsplash.com/photo-..."
            className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border text-foreground placeholder:text-text-secondary/50 focus:outline-none transition-colors disabled:opacity-50 ${
              isCoverLocked
                ? "bg-surface-muted/90 border-border-theme font-mono text-[11px] cursor-not-allowed select-all"
                : "bg-surface-muted/60 border-border-theme focus:border-secondary"
            }`}
          />
          {isCoverLocked && (
            <div className="absolute right-3 text-text-secondary pointer-events-none" title="URL locked after upload">
              <LockClosedIcon className="w-3.5 h-3.5 text-secondary" />
            </div>
          )}
        </div>
        <p className="text-[11px] text-text-secondary mt-1">
          {isCoverLocked
            ? "🔒 Uploaded via Cloudinary (locked against accidental editing). Use Change Image or Remove Image to replace."
            : "Paste a valid image URL instead of uploading"}
        </p>
      </div>

      {uploadError && (
        <p className="text-xs text-red-500 font-medium">
          {uploadError}
        </p>
      )}
    </div>
  );
}

const STATUS_TABS = [
  { label: "All Campaigns", value: "" },
  { label: "In Progress", value: "in_progress" },
  { label: "Published", value: "published" },
  { label: "Completed", value: "completed" },
  { label: "Draft", value: "draft" },
  { label: "Paused", value: "paused" },
  { label: "Closed", value: "closed" },
];

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function BrandCampaignsManager() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Feedback Notification & Modal States
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subStatus, setSubStatus] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Campaign View Tabs & Applicants State
  const [activeViewTab, setActiveViewTab] = useState("details"); // "details" | "applicants"
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState(null);
  const [activeCampaignId, setActiveCampaignId] = useState(null);

  // Accept/Reject & Booking Detail Modal state
  const [confirmingApplicantAction, setConfirmingApplicantAction] = useState(null); // { bookingId, action: 'accept' | 'reject', creatorName }
  const [applicantActionFeedback, setApplicantActionFeedback] = useState(null); // { type: 'success' | 'error', text }
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [viewingBookingId, setViewingBookingId] = useState(null);

  // Uploading state for cover images
  const [isUploadingCreate, setIsUploadingCreate] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);

  // Create Form State
  const initialCreateForm = {
    title: "",
    description: "",
    category: "",
    coverImage: "",
    platform: ["instagram"],
    budget: "",
    minBudget: "",
    maxBudget: "",
    deadline: "",
    requiredCreators: "1",
    audienceAge: "All",
    audienceGender: "all",
    audienceGeography: "",
    usageOrganic: true,
    usagePaidAds: false,
    usageDuration: "30 days",
    usageExclusivity: false,
    minFollowers: "",
    minEngagementRate: "",
  };
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [createDeliverables, setCreateDeliverables] = useState([]);
  const [createDeliverableInput, setCreateDeliverableInput] = useState("");

  // Edit Form State
  const initialEditForm = {
    title: "",
    description: "",
    category: "",
    coverImage: "",
    platform: ["instagram"],
    budget: "",
    minBudget: "",
    maxBudget: "",
    deadline: "",
    requiredCreators: "1",
    status: "draft",
    audienceAge: "All",
    audienceGender: "all",
    audienceGeography: "",
    usageOrganic: true,
    usagePaidAds: false,
    usageDuration: "30 days",
    usageExclusivity: false,
    minFollowers: "",
    minEngagementRate: "",
  };
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editDeliverables, setEditDeliverables] = useState([]);
  const [editDeliverableInput, setEditDeliverableInput] = useState("");

  const dispatch = useDispatch();

  const { campaigns, pagination, selectedCampaign, loading, error } = useSelector(
    (state) => state.brandCampaigns || {}
  );
  const { profile } = useSelector(
    (state) => state.brandProfile || {}
  );
  const { user } = useSelector(
    (state) => state.auth || {}
  );
  const [dismissCampaignGuidance, setDismissCampaignGuidance] = useState(false);

  // Helper to trigger API dispatch with current filters + overrides
  const fetchCampaignsWithFilters = useCallback(
    (overrides = {}) => {
      const targetPage = overrides.page !== undefined ? overrides.page : page;
      const targetSearch = overrides.search !== undefined ? overrides.search : search;
      const targetCategory = overrides.category !== undefined ? overrides.category : category;
      const targetPlatform = overrides.platform !== undefined ? overrides.platform : platform;
      const targetStatus = overrides.status !== undefined ? overrides.status : status;

      const queryParams = {
        page: targetPage,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (targetSearch.trim()) queryParams.search = targetSearch.trim();
      if (targetCategory) queryParams.category = targetCategory;
      if (targetPlatform) queryParams.platform = targetPlatform;
      if (targetStatus) queryParams.status = targetStatus;

      dispatch(getBrandCampaigns(queryParams));
    },
    [dispatch, page, search, category, platform, status]
  );

  // Initial API Call on Mount
  useEffect(() => {
    dispatch(
      getBrandCampaigns({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
    // Fetch subscription entitlement status
    axiosInstance
      .get("/api/subscriptions/status")
      .then((res) => {
        if (res.data?.data) {
          setSubStatus(res.data.data);
        }
      })
      .catch((err) => {
        console.warn("Could not load subscription status:", err?.message);
      });
  }, [dispatch]);

  // Sync Edit Form whenever selectedCampaign updates in Redux
  useEffect(() => {
    if (isEditOpen && selectedCampaign) {
      queueMicrotask(() => {
        setEditForm({
          title: selectedCampaign.title || "",
          description: selectedCampaign.description || "",
          category: selectedCampaign.category || "",
          coverImage: selectedCampaign.coverImage || selectedCampaign.image || "",
          platform: normalizeCampaignPlatforms(selectedCampaign.platform, ["instagram"]),
          budget: selectedCampaign.budget !== undefined ? String(selectedCampaign.budget) : "",
          deadline: formatDateForInput(selectedCampaign.deadline),
          requiredCreators: selectedCampaign.requiredCreators !== undefined ? String(selectedCampaign.requiredCreators) : "1",
          status: selectedCampaign.status || "draft",
        });
        setEditDeliverables(
          Array.isArray(selectedCampaign.deliverables) ? [...selectedCampaign.deliverables] : []
        );
      });
    }
  }, [isEditOpen, selectedCampaign]);

  // Handlers for Toolbar Controls
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCampaignsWithFilters({ page: 1 });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    setPage(1);
    fetchCampaignsWithFilters({ category: val, page: 1 });
  };

  const handlePlatformChange = (e) => {
    const val = e.target.value;
    setPlatform(val);
    setPage(1);
    fetchCampaignsWithFilters({ platform: val, page: 1 });
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatus(val);
    setPage(1);
    fetchCampaignsWithFilters({ status: val, page: 1 });
  };

  const handleRetry = () => {
    fetchCampaignsWithFilters();
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return;
    setPage(newPage);
    fetchCampaignsWithFilters({ page: newPage });
  };

  // Deliverables Handlers for Create Form
  const addCreateDeliverable = () => {
    if (createDeliverableInput.trim()) {
      setCreateDeliverables((prev) => [...prev, createDeliverableInput.trim()]);
      setCreateDeliverableInput("");
    }
  };

  const removeCreateDeliverable = (index) => {
    setCreateDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  // Deliverables Handlers for Edit Form
  const addEditDeliverable = () => {
    if (editDeliverableInput.trim()) {
      setEditDeliverables((prev) => [...prev, editDeliverableInput.trim()]);
      setEditDeliverableInput("");
    }
  };

  const removeEditDeliverable = (index) => {
    setEditDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  // Frontend Validation Helper
  const validateCampaignForm = (data, deliverablesList) => {
    if (!data.title || !data.title.trim()) return "Campaign Title is required.";
    if (!data.description || !data.description.trim()) return "Description is required.";
    if (!data.category || !data.category.trim()) return "Category is required.";
    if (data.coverImage && data.coverImage.trim()) {
      if (!isValidImageUrl(data.coverImage)) {
        return "Cover image must be a valid HTTP or HTTPS URL.";
      }
    }
    if (normalizeCampaignPlatforms(data.platform).length === 0) return "At least one target platform is required.";
    const effBudget = data.maxBudget || data.budget;
    if (effBudget === "" || isNaN(Number(effBudget)) || Number(effBudget) < 0) {
      return "Budget (or Max Budget) must be a number greater than or equal to 0.";
    }
    if (data.minBudget && (isNaN(Number(data.minBudget)) || Number(data.minBudget) < 0)) {
      return "Min Budget must be a number greater than or equal to 0.";
    }
    if (data.minBudget && data.maxBudget) {
      if (Number(data.minBudget) > Number(data.maxBudget)) {
        return "Min Budget cannot exceed Max Budget.";
      }
    }
    if (data.minFollowers && (isNaN(Number(data.minFollowers)) || Number(data.minFollowers) < 0)) {
      return "Minimum followers must be a positive number.";
    }
    if (data.minEngagementRate && (isNaN(Number(data.minEngagementRate)) || Number(data.minEngagementRate) < 0 || Number(data.minEngagementRate) > 100)) {
      return "Minimum engagement rate must be between 0% and 100%.";
    }
    if (!data.deadline) return "Deadline date is required.";
    if (
      data.requiredCreators === "" ||
      isNaN(Number(data.requiredCreators)) ||
      Number(data.requiredCreators) < 1
    ) {
      return "Required Creators must be at least 1.";
    }
    if (!deliverablesList || deliverablesList.length === 0) {
      return "At least one deliverable item is required.";
    }
    return null;
  };

  // Handle Create Submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (submitting || isUploadingCreate) return;
    setFormError("");

    const valError = validateCampaignForm(createForm, createDeliverables);
    if (valError) {
      setFormError(valError);
      return;
    }

    setSubmitting(true);
    const effMaxBudget = createForm.maxBudget ? Number(createForm.maxBudget) : Number(createForm.budget || 0);
    const effMinBudget = createForm.minBudget ? Number(createForm.minBudget) : (createForm.budget ? Number(createForm.budget) : 0);

    const payload = {
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      category: createForm.category.trim(),
      coverImage: createForm.coverImage ? createForm.coverImage.trim() : "",
      platform: normalizeCampaignPlatforms(createForm.platform),
      budget: effMaxBudget,
      minBudget: effMinBudget,
      maxBudget: effMaxBudget,
      deadline: createForm.deadline,
      requiredCreators: Number(createForm.requiredCreators),
      deliverables: createDeliverables,
      audienceTargeting: {
        age: createForm.audienceAge || "All",
        gender: createForm.audienceGender || "all",
        geography: createForm.audienceGeography
          ? createForm.audienceGeography.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      },
      usageRights: {
        organicUsage: Boolean(createForm.usageOrganic),
        paidAds: Boolean(createForm.usagePaidAds),
        duration: createForm.usageDuration || "30 days",
        exclusivity: Boolean(createForm.usageExclusivity),
      },
      creatorRequirements: {
        minFollowers: createForm.minFollowers ? Number(createForm.minFollowers) : 0,
        minEngagementRate: createForm.minEngagementRate ? Number(createForm.minEngagementRate) : 0,
      },
    };

    const actionResult = await dispatch(createCampaign(payload));
    setSubmitting(false);

    if (createCampaign.fulfilled.match(actionResult)) {
      setIsCreateOpen(false);
      setCreateForm(initialCreateForm);
      setCreateDeliverables([]);
      setSuccessMsg("Campaign created successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchCampaignsWithFilters({ page: 1 });
    } else {
      setFormError(
        typeof actionResult.payload === "string"
          ? actionResult.payload
          : "Campaign creation failed."
      );
    }
  };

  // Fetch applicants for a campaign using existing Brand Bookings API
  const fetchCampaignApplicants = useCallback(async (campaignId) => {
    if (!campaignId) return;
    setApplicantsLoading(true);
    setApplicantsError(null);
    try {
      const response = await getBrandBookingsApi({
        campaignId,
        limit: 100,
        initiatedBy: "creator",
      });

      const rawBookings = response?.data?.bookings || response?.bookings || [];
      // Show only Creator applications (initiatedBy === "creator")
      // Exclude Brand-initiated bookings/proposals
      const creatorOnly = rawBookings.filter(
        (b) => b && (b.initiatedBy === "creator" || !b.initiatedBy)
      );
      setApplicants(creatorOnly);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load applicants for this campaign.";
      setApplicantsError(msg);
    } finally {
      setApplicantsLoading(false);
    }
  }, []);

  // Real-time synchronization for new applicants and campaign booking status updates
  useEffect(() => {
    const brandId = user?._id || user?.id;
    if (!brandId) return;

    const consumerId = "brand_campaigns_manager_consumer";
    registerSocketConsumer(consumerId, brandId);

    const handleRealtimeNotification = (notification) => {
      if (!notification) return;
      if (
        notification.entityType === "booking" ||
        notification.entityType === "campaign" ||
        (typeof notification.type === "string" && (notification.type.startsWith("booking:") || notification.type.startsWith("campaign:")))
      ) {
        fetchCampaignsWithFilters();
        if (activeCampaignId) {
          fetchCampaignApplicants(activeCampaignId);
        }
      }
    };

    socket.on("notification:new", handleRealtimeNotification);

    return () => {
      unregisterSocketConsumer(consumerId);
      socket.off("notification:new", handleRealtimeNotification);
    };
  }, [user, fetchCampaignsWithFilters, activeCampaignId, fetchCampaignApplicants]);

  // Handle Accept or Decline for an applicant
  const handleConfirmApplicantStatus = async (applicant, targetStatus) => {
    if (!applicant?._id || !targetStatus || updatingBookingId) return;

    if (targetStatus === "accepted" && subStatus && subStatus.hasEntitlement === false) {
      setApplicantActionFeedback({
        type: "error",
        text: "An active subscription or free trial is required to accept booking applications and launch new collaborations. Please upgrade your plan.",
      });
      setConfirmingApplicantAction(null);
      return;
    }

    setUpdatingBookingId(applicant._id);
    setApplicantActionFeedback(null);

    try {
      const result = await dispatch(
        updateBrandBookingStatus({
          bookingId: applicant._id,
          status: targetStatus,
        })
      );

      if (updateBrandBookingStatus.fulfilled.match(result)) {
        const creatorName =
          applicant.creator?.name ||
          applicant.creator?.displayName ||
          "Creator";

        setApplicants((prev) =>
          prev.map((app) =>
            app._id === applicant._id
              ? { ...app, status: targetStatus, ...(result.payload?.data || {}) }
              : app
          )
        );

        setApplicantActionFeedback({
          type: "success",
          text:
            targetStatus === "accepted"
              ? `Application from ${creatorName} accepted! Collaboration workspace and conversation initialized.`
              : `Application from ${creatorName} declined.`,
        });
        setConfirmingApplicantAction(null);
      } else {
        setApplicantActionFeedback({
          type: "error",
          text:
            typeof result.payload === "string"
              ? result.payload
              : "Failed to update application status.",
        });
      }
    } catch (err) {
      setApplicantActionFeedback({
        type: "error",
        text: err?.message || "Failed to update application status.",
      });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Sync effect when selectedCampaign or isViewOpen changes to clear stale applicants & fetch fresh
  useEffect(() => {
    const cid = selectedCampaign?._id || selectedCampaign?.id;
    if (isViewOpen && cid && cid !== activeCampaignId) {
      setActiveCampaignId(cid);
      setApplicants([]);
      fetchCampaignApplicants(cid);
    }
  }, [isViewOpen, selectedCampaign, activeCampaignId, fetchCampaignApplicants]);

  // Handle View Action Click
  const handleViewClick = (campaign) => {
    setFormError("");
    setApplicantActionFeedback(null);
    setConfirmingApplicantAction(null);
    setActiveViewTab("details");
    const campaignId = campaign._id || campaign.id;
    setActiveCampaignId(campaignId);
    setApplicants([]);
    if (campaignId) {
      dispatch(getCampaignById(campaignId));
      fetchCampaignApplicants(campaignId);
    }
    setIsViewOpen(true);
  };

  // Handle Edit Action Click
  const handleEditClick = (campaign) => {
    setFormError("");
    if (campaign) {
      setEditForm({
        title: campaign.title || "",
        description: campaign.description || "",
        category: campaign.category || "",
        coverImage: campaign.coverImage || campaign.image || "",
        platform: normalizeCampaignPlatforms(campaign.platform, ["instagram"]),
        budget: campaign.budget !== undefined ? String(campaign.budget) : "",
        minBudget: campaign.minBudget !== undefined && campaign.minBudget !== null ? String(campaign.minBudget) : (campaign.budget !== undefined ? String(campaign.budget) : ""),
        maxBudget: campaign.maxBudget !== undefined && campaign.maxBudget !== null ? String(campaign.maxBudget) : (campaign.budget !== undefined ? String(campaign.budget) : ""),
        deadline: formatDateForInput(campaign.deadline),
        requiredCreators: campaign.requiredCreators !== undefined ? String(campaign.requiredCreators) : "1",
        status: campaign.status || "draft",
        audienceAge: campaign.audienceTargeting?.age || "All",
        audienceGender: campaign.audienceTargeting?.gender || "all",
        audienceGeography: Array.isArray(campaign.audienceTargeting?.geography) ? campaign.audienceTargeting.geography.join(", ") : (campaign.audienceTargeting?.geography || ""),
        usageOrganic: campaign.usageRights?.organicUsage !== undefined ? Boolean(campaign.usageRights.organicUsage) : true,
        usagePaidAds: Boolean(campaign.usageRights?.paidAds),
        usageDuration: campaign.usageRights?.duration || "30 days",
        usageExclusivity: Boolean(campaign.usageRights?.exclusivity),
        minFollowers: campaign.creatorRequirements?.minFollowers ? String(campaign.creatorRequirements.minFollowers) : "",
        minEngagementRate: campaign.creatorRequirements?.minEngagementRate ? String(campaign.creatorRequirements.minEngagementRate) : "",
      });
      setEditDeliverables(
        Array.isArray(campaign.deliverables) ? [...campaign.deliverables] : []
      );
    }
    const campaignId = campaign._id || campaign.id;
    if (campaignId) {
      dispatch(getCampaignById(campaignId));
    }
    setIsEditOpen(true);
  };

  // Handle Edit Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (submitting || isUploadingEdit) return;
    setFormError("");

    const valError = validateCampaignForm(editForm, editDeliverables);
    if (valError) {
      setFormError(valError);
      return;
    }

    const campaignId = selectedCampaign?._id || selectedCampaign?.id;
    if (!campaignId) {
      setFormError("Campaign ID missing.");
      return;
    }

    setSubmitting(true);
    const effEditMaxBudget = editForm.maxBudget ? Number(editForm.maxBudget) : Number(editForm.budget || 0);
    const effEditMinBudget = editForm.minBudget ? Number(editForm.minBudget) : (editForm.budget ? Number(editForm.budget) : 0);

    const payload = {
      campaignId,
      campaignData: {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        coverImage: editForm.coverImage ? editForm.coverImage.trim() : "",
        platform: normalizeCampaignPlatforms(editForm.platform),
        budget: effEditMaxBudget,
        minBudget: effEditMinBudget,
        maxBudget: effEditMaxBudget,
        deadline: editForm.deadline,
        requiredCreators: Number(editForm.requiredCreators),
        deliverables: editDeliverables,
        status: editForm.status,
        audienceTargeting: {
          age: editForm.audienceAge || "All",
          gender: editForm.audienceGender || "all",
          geography: editForm.audienceGeography
            ? editForm.audienceGeography.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        },
        usageRights: {
          organicUsage: Boolean(editForm.usageOrganic),
          paidAds: Boolean(editForm.usagePaidAds),
          duration: editForm.usageDuration || "30 days",
          exclusivity: Boolean(editForm.usageExclusivity),
        },
        creatorRequirements: {
          minFollowers: editForm.minFollowers ? Number(editForm.minFollowers) : 0,
          minEngagementRate: editForm.minEngagementRate ? Number(editForm.minEngagementRate) : 0,
        },
      },
    };

    const actionResult = await dispatch(updateCampaign(payload));
    setSubmitting(false);

    if (updateCampaign.fulfilled.match(actionResult)) {
      setIsEditOpen(false);
      dispatch(clearSelectedCampaign());
      setSuccessMsg("Campaign updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
      // Removed redundant fetchCampaignsWithFilters() call because updateCampaign.fulfilled
      // already updates state.campaigns[index] in-place, preventing unnecessary full table skeleton loading.
    } else {
      setFormError(
        typeof actionResult.payload === "string"
          ? actionResult.payload
          : "Campaign update failed."
      );
    }
  };

  // Modal Closing Handlers
  const closeCreateModal = () => {
    if (submitting || isUploadingCreate) return;
    setIsCreateOpen(false);
    setFormError("");
    setCreateForm((prev) => ({ ...prev, coverImage: "" }));
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    dispatch(clearSelectedCampaign());
    setActiveCampaignId(null);
    setApplicants([]);
    setApplicantsLoading(false);
    setApplicantsError(null);
    setActiveViewTab("details");
    setApplicantActionFeedback(null);
    setConfirmingApplicantAction(null);
    setViewingBookingId(null);
  };

  const closeEditModal = () => {
    if (submitting || isUploadingEdit) return;
    setIsEditOpen(false);
    setFormError("");
    dispatch(clearSelectedCampaign());
  };

  const currentPage = pagination?.page || page;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems ?? campaigns.length;
  const hasPrevPage = pagination?.hasPrevPage ?? (currentPage > 1);
  const hasNextPage = pagination?.hasNextPage ?? (currentPage < totalPages);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Brand Sidebar for universal portal navigation */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Brand Header */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Campaigns Main Container */}
        <main className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 max-w-[1536px] mx-auto min-w-0">
          {/* Success Notification Alert */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl p-4 text-xs font-sans flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircleIcon className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Modern Reference Campaign Hero */}
          {/* Subscription Expired Warning Banner */}
          {subStatus && subStatus.hasEntitlement === false && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-500 text-xs">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-foreground text-sm">Subscription Required</p>
                  <p className="text-text-secondary mt-0.5">Your trial or subscription has expired. Creating new campaigns and publishing updates is currently locked.</p>
                </div>
              </div>
              <Link
                href="/brand/subscription/plans"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl text-xs whitespace-nowrap shadow hover:opacity-90 transition-opacity"
              >
                Upgrade Plan
              </Link>
            </div>
          )}

          {/* Form Error Banner if triggered outside modal */}
          {formError && !isCreateOpen && !isEditOpen && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl p-4 text-xs font-sans flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formError}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormError("")}
                className="text-rose-500 hover:text-rose-600 font-bold text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* First Campaign Guidance Banner for incomplete Brand profiles */}
          {!profile?.isOnboarded && !dismissCampaignGuidance && (
            <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 rounded-2xl p-4 text-xs font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[#ff2d6c] text-base shrink-0">✦</span>
                <p className="text-foreground leading-relaxed">
                  <strong className="font-semibold">Pro Tip for Campaigns:</strong> Creators are 3x more likely to accept proposals from brands with complete profiles and verified company links.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                <Link
                  href="/brand/onboarding"
                  className="font-semibold text-[#ff2d6c] hover:underline whitespace-nowrap cursor-pointer text-xs"
                >
                  Complete Brand Profile →
                </Link>
                <button
                  type="button"
                  onClick={() => setDismissCampaignGuidance(true)}
                  className="text-text-secondary hover:text-foreground text-xs p-1 cursor-pointer"
                  title="Dismiss tip"
                  aria-label="Dismiss first campaign tip"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <BrandCampaignsHero
            onCreateClick={() => {
              if (subStatus && subStatus.hasEntitlement === false) {
                setFormError("Active subscription or trial is required to create new campaigns. Please upgrade your plan.");
                return;
              }
              setFormError("");
              setIsCreateOpen(true);
            }}
          />

          {/* Status Tabs Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0 min-w-0 w-full max-w-full">
            {STATUS_TABS.map((tab) => {
              const isActive = status === tab.value;
              return (
                <button
                  key={tab.value || "all"}
                  type="button"
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                    fetchCampaignsWithFilters({ status: tab.value, page: 1 });
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 border ${isActive
                      ? "bg-[#252525] text-white border-[#252525] shadow-xs"
                      : "bg-surface border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-surface border border-border-theme rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">

            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-secondary transition-colors"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                <SearchIcon />
              </span>
            </form>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto shrink-0">

              {/* Category Filter */}
              <select
                value={category}
                onChange={handleCategoryChange}
                className="bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Fashion">Fashion</option>
                <option value="Beauty">Beauty</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Tech">Tech</option>
                <option value="Fitness">Fitness</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Travel">Travel</option>
                <option value="Gaming">Gaming</option>
              </select>

              {/* Platform Filter */}
              <select
                value={platform}
                onChange={handlePlatformChange}
                className="bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="website">Website</option>
              </select>

              {/* Status Filter */}
              <select
                value={status}
                onChange={handleStatusChange}
                className="bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>

            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-xs font-sans flex items-center justify-between gap-4">
              <span>{typeof error === "string" ? error : "Failed to load campaigns. Please try again."}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowPathIcon />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Main Campaign List Section */}
          <div className="bg-surface border border-border-theme rounded-2xl shadow-xs overflow-hidden min-w-0">

            {/* Loading State Skeleton */}
            {loading && !isViewOpen && !isEditOpen && (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-surface-muted rounded-xl animate-pulse w-full" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && campaigns.length === 0 && (
              <div className="text-center py-16 px-4 border-dashed border-border-theme space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary/8 text-[#252525] dark:text-white flex items-center justify-center">
                  <MegaPhoneIcon />
                </div>
                <h3 className="font-serif font-medium text-lg text-foreground">
                  No campaigns found
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {search || category || platform || status
                    ? "No campaigns match your selected search criteria or filters. Try adjusting your search parameters."
                    : "You haven't created any campaigns yet. Click the 'Create Campaign' button above to get started."}
                </p>
              </div>
            )}

            {/* Campaign Table (Responsive Modern Redesign) */}
            {!loading && !error && campaigns.length > 0 && (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-theme bg-surface-muted/40 text-text-secondary uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3.5 px-5 min-w-[220px]">Campaign</th>
                      <th className="py-3.5 px-4 min-w-[120px]">Platform</th>
                      <th className="py-3.5 px-4 min-w-[120px]">Category</th>
                      <th className="py-3.5 px-4 min-w-[110px]">Budget</th>
                      <th className="py-3.5 px-4 min-w-[100px]">Creators</th>
                      <th className="py-3.5 px-4 min-w-[110px]">Status</th>
                      <th className="py-3.5 px-4 min-w-[120px]">Deadline</th>
                      <th className="py-3.5 px-5 text-right min-w-[90px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {campaigns.map((c) => {
                      const id = c._id || c.id;
                      const badge = getStatusBadge(c.status);
                      const platformList = normalizeCampaignPlatforms(c.platform);
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
                          key={id || c.title}
                          className="hover:bg-surface-muted/30 transition-colors"
                        >
                          {/* Campaign Info (Avatar + Title + Category Subtitle) */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <CampaignAvatar title={c.title} coverImage={c.coverImage || c.image || c.thumbnail} />
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleViewClick(c)}
                                  className="font-semibold text-foreground text-[13px] font-sans hover:text-secondary transition-colors text-left line-clamp-2 break-words max-w-[360px] block cursor-pointer"
                                  title={c.title}
                                >
                                  {c.title}
                                </button>
                                <span className="text-[11px] text-text-secondary line-clamp-1 break-words block max-w-[360px]">
                                  {c.category || "General"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Platform */}
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
                              {platformList.length > 0 ? (
                                platformList.map((plat) => {
                                  const info = getPlatformBadge(plat);
                                  const PlatIcon = info.icon;
                                  return (
                                    <span
                                      key={plat}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-muted/70 border border-border-theme text-[11px] font-medium text-foreground"
                                    >
                                      <PlatIcon className={`w-3 h-3 shrink-0 ${info.iconColor || "text-text-secondary"}`} />
                                      <span>{info.label}</span>
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-xs text-text-secondary">General</span>
                              )}
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-4 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-muted border border-border-theme text-foreground">
                              {c.category || "General"}
                            </span>
                          </td>

                          {/* Budget */}
                          <td className="py-4 px-4 font-semibold text-foreground">
                            {formatCurrency(c.budget, c.currency)}
                          </td>

                          {/* Required Creators */}
                          <td className="py-4 px-4">
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
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 text-text-secondary font-medium">
                              <CalendarIcon className="w-3.5 h-3.5 text-text-secondary/70 shrink-0" />
                              <span>{formatDate(c.deadline)}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleViewClick(c)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                                title="View Campaign Details"
                              >
                                <EyeIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditClick(c)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                                title="Edit Campaign"
                              >
                                <PencilIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && campaigns.length > 0 && (
              <div className="border-t border-border-theme px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-text-secondary flex items-center gap-2">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {totalItems === 0 ? 0 : (currentPage - 1) * (pagination?.limit || 10) + 1}
                      –
                      {Math.min(currentPage * (pagination?.limit || 10), totalItems)}
                    </span>{" "}
                    of <span className="font-semibold text-foreground">{totalItems}</span> campaigns
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeftIcon />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>

      {/* ========================================================= */}
      {/* 1. CREATE CAMPAIGN MODAL */}
      {/* ========================================================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface border border-border-theme rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">

            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border-theme flex items-center justify-between">
              <div>
                <h3 className="font-serif font-medium text-lg text-foreground">
                  Create Campaign
                </h3>
                <p className="text-xs text-text-secondary">
                  Fill in the campaign details for content creators
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={submitting || isUploadingCreate}
                className="p-1 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <XMarkIcon />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">

              {/* Form Validation Error Banner */}
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-xs">
                  {formError}
                </div>
              )}

              {/* Cover Image Upload */}
              <CampaignCoverUpload
                coverImage={createForm.coverImage}
                onChange={(url) => setCreateForm((prev) => ({ ...prev, coverImage: url }))}
                onUploadingChange={setIsUploadingCreate}
                disabled={submitting}
              />

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Collection Launch"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Campaign Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your brand brief, content expectations, and guidelines..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors resize-y"
                />
              </div>

              {/* Category & Platform Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fashion, Tech, Beauty"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                {/* Platform */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Target Platform *
                  </label>
                  <TargetPlatformSelector
                    value={createForm.platform}
                    onChange={(selectedPlatforms) =>
                      setCreateForm({ ...createForm, platform: selectedPlatforms })
                    }
                    disabled={submitting}
                  />
                </div>

              </div>

              {/* Budget Range (Min & Max Budget) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Min Budget (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="20000"
                      value={createForm.minBudget}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCreateForm({
                          ...createForm,
                          minBudget: val,
                          budget: createForm.maxBudget || val,
                        });
                      }}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Max Budget (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="50000"
                      value={createForm.maxBudget}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCreateForm({
                          ...createForm,
                          maxBudget: val,
                          budget: val,
                        });
                      }}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

              {/* Deadline & Required Creators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                {/* Deadline */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                  />
                </div>

                {/* Required Creators */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Creators Needed *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="2"
                    value={createForm.requiredCreators}
                    onChange={(e) => setCreateForm({ ...createForm, requiredCreators: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

              </div>

              {/* Audience Targeting Section */}
              <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/30 space-y-3">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                  Audience Targeting
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Target Age Bracket
                    </label>
                    <select
                      value={createForm.audienceAge}
                      onChange={(e) => setCreateForm({ ...createForm, audienceAge: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                    >
                      <option value="All">All Ages</option>
                      <option value="13-17">13 - 17</option>
                      <option value="18-24">18 - 24</option>
                      <option value="25-34">25 - 34</option>
                      <option value="35-44">35 - 44</option>
                      <option value="45+">45+</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Gender
                    </label>
                    <select
                      value={createForm.audienceGender}
                      onChange={(e) => setCreateForm({ ...createForm, audienceGender: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                    >
                      <option value="all">All Genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Geography / Target Regions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. India, Mumbai, Delhi"
                      value={createForm.audienceGeography}
                      onChange={(e) => setCreateForm({ ...createForm, audienceGeography: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Usage Rights & Licensing Section */}
              <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/30 space-y-3">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                  Usage Rights & Licensing
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Usage Duration
                    </label>
                    <select
                      value={createForm.usageDuration}
                      onChange={(e) => setCreateForm({ ...createForm, usageDuration: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                    >
                      <option value="30 days">30 Days</option>
                      <option value="60 days">60 Days</option>
                      <option value="90 days">90 Days</option>
                      <option value="6 months">6 Months</option>
                      <option value="1 year">1 Year</option>
                      <option value="Perpetual">Perpetual</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center gap-2 pt-1 sm:pt-0">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={createForm.usageOrganic}
                        onChange={(e) => setCreateForm({ ...createForm, usageOrganic: e.target.checked })}
                        className="rounded border-border-theme text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <span>Organic Usage (Creator Feed)</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={createForm.usagePaidAds}
                        onChange={(e) => setCreateForm({ ...createForm, usagePaidAds: e.target.checked })}
                        className="rounded border-border-theme text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <span>Paid Ads / Whitelisting Amplification</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={createForm.usageExclusivity}
                        onChange={(e) => setCreateForm({ ...createForm, usageExclusivity: e.target.checked })}
                        className="rounded border-border-theme text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <span>Exclusivity Required</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Creator Eligibility Requirements Section */}
              <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/30 space-y-3">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                  Creator Eligibility Requirements
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Minimum Followers
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 10000 (0 for no limit)"
                      value={createForm.minFollowers}
                      onChange={(e) => setCreateForm({ ...createForm, minFollowers: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Minimum Engagement Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="e.g. 2.5 (0 for no limit)"
                      value={createForm.minEngagementRate}
                      onChange={(e) => setCreateForm({ ...createForm, minEngagementRate: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Deliverables List Builder */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Deliverables *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 1 Reel Video, 2 Instagram Stories"
                    value={createDeliverableInput}
                    onChange={(e) => setCreateDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCreateDeliverable();
                      }
                    }}
                    className="flex-1 bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-secondary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addCreateDeliverable}
                    className="px-4 py-2 rounded-xl bg-surface-muted border border-border-theme text-foreground text-xs font-semibold hover:border-secondary transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Tags list */}
                {createDeliverables.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {createDeliverables.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeCreateDeliverable(idx)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border-theme flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={submitting || isUploadingCreate}
                  className="px-4 py-2.5 rounded-xl border border-border-theme text-foreground text-xs font-semibold hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploadingCreate}
                  className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Campaign"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VIEW CAMPAIGN DETAILS MODAL */}
      {/* ========================================================= */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div
            className={`bg-surface border border-border-theme rounded-2xl w-full ${
              activeViewTab === "applicants" ? "max-w-3xl lg:max-w-4xl" : "max-w-2xl"
            } max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto transition-all`}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border-theme flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  Campaign Overview
                </span>
                <h3 className="font-serif font-medium text-lg text-foreground break-words line-clamp-2">
                  {selectedCampaign?.title || "Campaign"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeViewModal}
                className="p-1 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <XMarkIcon />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-4 sm:px-6 border-b border-border-theme flex items-center gap-4 sm:gap-6 bg-surface shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveViewTab("details")}
                className={`pt-3 pb-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative cursor-pointer border-b-2 ${
                  activeViewTab === "details"
                    ? "text-secondary border-secondary font-bold"
                    : "text-text-secondary border-transparent hover:text-foreground"
                }`}
              >
                Campaign Details
              </button>

              <button
                type="button"
                onClick={() => setActiveViewTab("applicants")}
                className={`pt-3 pb-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative flex items-center gap-2 cursor-pointer border-b-2 ${
                  activeViewTab === "applicants"
                    ? "text-secondary border-secondary font-bold"
                    : "text-text-secondary border-transparent hover:text-foreground"
                }`}
              >
                <span>Applicants</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeViewTab === "applicants"
                      ? "bg-secondary/15 text-secondary"
                      : "bg-surface-muted text-text-secondary"
                  }`}
                >
                  {applicantsLoading ? "..." : applicants.length}
                </span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 text-xs">
              {activeViewTab === "details" ? (
                <>
                  {loading && !selectedCampaign ? (
                    <div className="space-y-4 p-4 animate-pulse">
                      <div className="h-6 bg-surface-muted rounded-md w-2/3" />
                      <div className="h-20 bg-surface-muted rounded-xl w-full" />
                      <div className="h-10 bg-surface-muted rounded-xl w-full" />
                    </div>
                  ) : selectedCampaign ? (
                    <>
                      {/* Campaign Cover Banner (if present) */}
                      {(selectedCampaign.coverImage || selectedCampaign.image) && (
                        <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden border border-border-theme bg-surface-muted/60 shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedCampaign.coverImage || selectedCampaign.image}
                            alt={selectedCampaign.title || "Campaign banner"}
                            className="w-full h-full object-contain object-center"
                          />
                        </div>
                      )}

                      {/* Status & Category Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface-muted/50 border border-border-theme">
                        <div>
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                            Status
                          </span>
                          <div className="inline-flex items-center gap-2 mt-1">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                getStatusBadge(selectedCampaign.status).dotColor || "bg-slate-400"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium font-sans ${
                                getStatusBadge(selectedCampaign.status).textColor || "text-foreground"
                              }`}
                            >
                              {getStatusBadge(selectedCampaign.status).label}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                            Target Platforms
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {normalizeCampaignPlatforms(selectedCampaign.platform).length > 0 ? (
                              normalizeCampaignPlatforms(selectedCampaign.platform).map((plat) => {
                                const info = getPlatformBadge(plat);
                                const PlatIcon = info.icon;
                                return (
                                  <span
                                    key={plat}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-muted border border-border-theme text-[11px] font-semibold text-foreground"
                                  >
                                    <PlatIcon className={`w-3 h-3 shrink-0 ${info.iconColor || "text-text-secondary"}`} />
                                    <span>{info.label}</span>
                                  </span>
                                );
                              })
                            ) : (
                              <span className="font-semibold text-foreground">Multi-Platform</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                            Category
                          </span>
                          <span className="font-semibold text-foreground mt-0.5 block">
                            {selectedCampaign.category || "General"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                            Created On
                          </span>
                          <span className="font-semibold text-foreground mt-0.5 block">
                            {formatDate(selectedCampaign.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Overview / Description */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                          Description & Brief
                        </h4>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-line bg-surface-muted/30 p-4 rounded-xl border border-border-theme">
                          {selectedCampaign.description || "No description provided."}
                        </p>
                      </div>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                            Budget Range
                          </span>
                          <span className="font-serif font-semibold text-base text-foreground mt-0.5 block">
                            {formatBudgetRange(
                              selectedCampaign.minBudget,
                              selectedCampaign.maxBudget,
                              selectedCampaign.budget,
                              selectedCampaign.currency
                            )}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                            Creators Needed
                          </span>
                          <span className="font-serif font-semibold text-base text-foreground mt-0.5 block">
                            {selectedCampaign.requiredCreators || 1}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                            Deadline
                          </span>
                          <span className="font-serif font-semibold text-base text-foreground mt-0.5 block">
                            {formatDate(selectedCampaign.deadline)}
                          </span>
                        </div>
                      </div>

                      {/* Deliverables List */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                          Required Deliverables
                        </h4>
                        {Array.isArray(selectedCampaign.deliverables) && selectedCampaign.deliverables.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedCampaign.deliverables.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 rounded-xl bg-surface-muted border border-border-theme text-foreground font-medium"
                              >
                                ✓ {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-text-secondary">No deliverables specified.</p>
                        )}
                      </div>

                      {/* Audience Targeting & Requirements Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Audience Targeting Card */}
                        <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/20 space-y-2.5">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                            Target Audience Profile
                          </span>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">Age Bracket:</span>
                              <span className="font-semibold text-foreground">
                                {selectedCampaign.audienceTargeting?.age || "All Ages"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">Gender:</span>
                              <span className="font-semibold text-foreground capitalize">
                                {selectedCampaign.audienceTargeting?.gender || "All Genders"}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-text-secondary">Geographies:</span>
                              <span className="font-semibold text-foreground text-right break-words">
                                {Array.isArray(selectedCampaign.audienceTargeting?.geography) && selectedCampaign.audienceTargeting.geography.length > 0
                                  ? selectedCampaign.audienceTargeting.geography.join(", ")
                                  : "Global / Any"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Creator Requirements Card */}
                        <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/20 space-y-2.5">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                            Creator Eligibility Requirements
                          </span>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">Minimum Followers:</span>
                              <span className="font-semibold text-foreground">
                                {selectedCampaign.creatorRequirements?.minFollowers
                                  ? `${selectedCampaign.creatorRequirements.minFollowers.toLocaleString()}+ followers`
                                  : "Open to all"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">Min Engagement Rate:</span>
                              <span className="font-semibold text-foreground">
                                {selectedCampaign.creatorRequirements?.minEngagementRate
                                  ? `${selectedCampaign.creatorRequirements.minEngagementRate}%`
                                  : "No minimum"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Usage Rights & Licensing Details Card */}
                      <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/20 space-y-2.5">
                        <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                          Usage Rights & Licensing
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-text-secondary block">Duration</span>
                            <span className="font-semibold text-foreground block mt-0.5">
                              {selectedCampaign.usageRights?.duration || "30 days"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-text-secondary block">Organic Usage</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                              {selectedCampaign.usageRights?.organicUsage !== false ? "Included" : "Excluded"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-text-secondary block">Paid Ads Amplification</span>
                            <span className={`font-semibold block mt-0.5 ${selectedCampaign.usageRights?.paidAds ? "text-emerald-600 dark:text-emerald-400" : "text-text-secondary"}`}>
                              {selectedCampaign.usageRights?.paidAds ? "Allowed" : "Not Included"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-text-secondary block">Exclusivity</span>
                            <span className={`font-semibold block mt-0.5 ${selectedCampaign.usageRights?.exclusivity ? "text-amber-500" : "text-text-secondary"}`}>
                              {selectedCampaign.usageRights?.exclusivity ? "Exclusive Required" : "Non-exclusive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-text-secondary py-4 text-center">Unable to load campaign details.</p>
                  )}
                </>
              ) : (
                /* ========================================================= */
                /* APPLICANTS TAB CONTENT */
                /* ========================================================= */
                <div className="space-y-4">
                  {/* Feedback Notification Banner */}
                  {applicantActionFeedback && (
                    <div
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                        applicantActionFeedback.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-red-500/10 border-red-500/20 text-red-500"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {applicantActionFeedback.type === "success" ? (
                          <CheckCircleIcon className="w-4 h-4 shrink-0" />
                        ) : (
                          <span className="font-bold shrink-0">!</span>
                        )}
                        <span className="text-xs font-medium">{applicantActionFeedback.text}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setApplicantActionFeedback(null)}
                        className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Loading State */}
                  {applicantsLoading ? (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl border border-border-theme bg-surface-muted/40 animate-pulse space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-surface-muted" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-4 bg-surface-muted rounded-md w-1/3" />
                            <div className="h-3 bg-surface-muted rounded-md w-1/4" />
                          </div>
                        </div>
                        <div className="h-14 bg-surface-muted rounded-xl" />
                      </div>
                      <div className="p-4 rounded-2xl border border-border-theme bg-surface-muted/40 animate-pulse space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-surface-muted" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-4 bg-surface-muted rounded-md w-1/3" />
                            <div className="h-3 bg-surface-muted rounded-md w-1/4" />
                          </div>
                        </div>
                        <div className="h-14 bg-surface-muted rounded-xl" />
                      </div>
                    </div>
                  ) : applicantsError ? (
                    /* Error State with Retry */
                    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3 my-2">
                      <p className="text-xs text-red-500 font-medium">{applicantsError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const cid = activeCampaignId || selectedCampaign?._id || selectedCampaign?.id;
                          if (cid) fetchCampaignApplicants(cid);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-surface border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-surface-muted transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ArrowPathIcon className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    </div>
                  ) : applicants.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-12 px-4 space-y-3 border border-dashed border-border-theme rounded-2xl bg-surface-muted/20">
                      <div className="w-12 h-12 rounded-2xl bg-surface-muted border border-border-theme flex items-center justify-center mx-auto text-text-secondary">
                        <UsersIcon className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif font-medium text-base text-foreground">
                        No applications yet
                      </h4>
                      <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                        Content creators have not submitted proposals for this campaign yet. Applications will appear here as soon as creators apply.
                      </p>
                    </div>
                  ) : (
                    /* Applicants List */
                    <div className="space-y-3">
                      {applicants.map((applicant) => {
                        const creator = applicant.creator || {};
                        const creatorName =
                          creator.name ||
                          creator.displayName ||
                          creator.email ||
                          "Creator";
                        const creatorAvatar =
                          creator.profileImage ||
                          creator.avatar ||
                          creator.image ||
                          "";
                        const category =
                          creator.category ||
                          applicant.campaign?.category ||
                          "General";
                        const followersFormatted = formatFollowers(
                          creator.followers ?? creator.followerCount
                        );
                        const ratingDisplay =
                          creator.rating !== undefined && creator.rating !== null
                            ? `${creator.rating} ★ (${creator.reviewCount || 0})`
                            : "New (No reviews)";
                        const serviceTitle =
                          applicant.service?.title ||
                          applicant.serviceTitle ||
                          "Campaign Service";
                        const proposedPrice =
                          applicant.agreedPrice !== undefined
                            ? applicant.agreedPrice
                            : applicant.service?.price;
                        const currency = applicant.currency || selectedCampaign?.currency || "INR";
                        const statusBadge = getBookingStatusBadge(applicant.status);
                        const isPending = applicant.status === "pending";
                        const isConfirming =
                          confirmingApplicantAction?.bookingId === applicant._id;
                        const isUpdating = updatingBookingId === applicant._id;

                        return (
                          <div
                            key={applicant._id}
                            className="p-4 sm:p-5 rounded-2xl border border-border-theme bg-surface hover:border-secondary/30 transition-all duration-150 space-y-4"
                          >
                            {/* Top row: Creator details & Status badge */}
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <CreatorApplicantAvatar
                                  name={creatorName}
                                  image={creatorAvatar}
                                />
                                <div className="min-w-0">
                                  <h5 className="font-semibold text-sm text-foreground truncate">
                                    {creatorName}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-secondary flex-wrap">
                                    <span className="px-2 py-0.5 rounded-md bg-surface-muted border border-border-theme font-medium text-foreground">
                                      {category}
                                    </span>
                                    <span className="flex items-center gap-1 font-medium">
                                      <UsersIcon className="w-3.5 h-3.5 text-text-secondary" />
                                      <span>{followersFormatted}</span>
                                    </span>
                                    <span className="flex items-center gap-1 font-medium text-amber-500">
                                      <StarIcon className="w-3.5 h-3.5" />
                                      <span>{ratingDisplay}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge.color}`}
                                >
                                  {statusBadge.label}
                                </span>
                              </div>
                            </div>

                            {/* Middle specs: Service, Proposed Price, Application Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-surface-muted/40 border border-border-theme text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                                  Service Offering
                                </span>
                                <span
                                  className="font-medium text-foreground mt-0.5 block truncate"
                                  title={serviceTitle}
                                >
                                  {serviceTitle}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                                  Proposed Price
                                </span>
                                <span className="font-serif font-bold text-sm text-foreground mt-0.5 block">
                                  {formatCurrency(proposedPrice, currency)}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                                  Applied On
                                </span>
                                <span className="font-medium text-foreground mt-0.5 block">
                                  {formatDate(applicant.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Confirmation box if user clicked Accept or Reject */}
                            {isConfirming && (
                              <div className="p-3.5 rounded-xl bg-surface-muted border border-border-theme space-y-2.5 animate-in fade-in duration-100">
                                <p className="text-xs text-foreground font-medium">
                                  {confirmingApplicantAction.action === "accept"
                                    ? `Are you sure you want to accept ${creatorName}'s application? This will create a collaboration workspace and conversation.`
                                    : `Are you sure you want to decline ${creatorName}'s application?`}
                                </p>
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmingApplicantAction(null)}
                                    disabled={isUpdating}
                                    className="px-3 py-1.5 rounded-lg border border-border-theme text-text-secondary hover:text-foreground text-xs font-medium cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleConfirmApplicantStatus(
                                        applicant,
                                        confirmingApplicantAction.action === "accept"
                                          ? "accepted"
                                          : "rejected"
                                      )
                                    }
                                    disabled={isUpdating}
                                    className={`px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold cursor-pointer transition-colors ${
                                      confirmingApplicantAction.action === "accept"
                                        ? "bg-emerald-600 hover:bg-emerald-500"
                                        : "bg-red-600 hover:bg-red-500"
                                    }`}
                                  >
                                    {isUpdating
                                      ? "Processing..."
                                      : confirmingApplicantAction.action === "accept"
                                      ? "Confirm Accept"
                                      : "Confirm Decline"}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Bottom row actions */}
                            {!isConfirming && (
                              <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => setViewingBookingId(applicant._id)}
                                  className="text-xs text-secondary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <EyeIcon className="w-3.5 h-3.5" />
                                  <span>View Full Application</span>
                                </button>

                                {isPending && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmingApplicantAction({
                                          bookingId: applicant._id,
                                          action: "reject",
                                          creatorName,
                                        })
                                      }
                                      disabled={isUpdating}
                                      className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-semibold text-xs transition-colors cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmingApplicantAction({
                                          bookingId: applicant._id,
                                          action: "accept",
                                          creatorName,
                                        })
                                      }
                                      disabled={isUpdating}
                                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                                    >
                                      Accept
                                    </button>
                                  </div>
                                )}

                                {applicant.status === "accepted" && (
                                  <Link
                                    href="/brand/workspace"
                                    className="text-xs text-emerald-500 hover:underline font-medium inline-flex items-center gap-1"
                                  >
                                    <span>Collaboration Active — Open Workspace →</span>
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border-theme flex items-center justify-between">
              <span className="text-[11px] text-text-secondary">
                {activeViewTab === "applicants"
                  ? `${applicants.length} total applicant${applicants.length === 1 ? "" : "s"}`
                  : `Created ${formatDate(selectedCampaign?.createdAt)}`}
              </span>
              <button
                type="button"
                onClick={closeViewModal}
                className="px-5 py-2 rounded-xl bg-surface-muted border border-border-theme text-foreground text-xs font-semibold hover:border-secondary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. EDIT CAMPAIGN MODAL */}
      {/* ========================================================= */}
      {/* 4. BRAND BOOKING DETAIL MODAL */}
      <BrandBookingDetailModal
        isOpen={Boolean(viewingBookingId)}
        onClose={() => {
          setViewingBookingId(null);
          const cid = activeCampaignId || selectedCampaign?._id || selectedCampaign?.id;
          if (cid) {
            fetchCampaignApplicants(cid);
          }
        }}
        bookingId={viewingBookingId}
        booking={applicants.find((a) => (a._id || a.id) === viewingBookingId)}
      />

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface border border-border-theme rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">

            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border-theme flex items-center justify-between">
              <div>
                <h3 className="font-serif font-medium text-lg text-foreground">
                  Edit Campaign
                </h3>
                <p className="text-xs text-text-secondary">
                  Update campaign details and valid status transitions
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={submitting || isUploadingEdit}
                className="p-1 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <XMarkIcon />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">

              {/* Form Validation Error Banner */}
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-xs">
                  {formError}
                </div>
              )}

              {/* Cover Image Upload */}
              <CampaignCoverUpload
                coverImage={editForm.coverImage}
                onChange={(url) => setEditForm((prev) => ({ ...prev, coverImage: url }))}
                onUploadingChange={setIsUploadingEdit}
                disabled={submitting}
              />

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Campaign Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors resize-y"
                />
              </div>

              {/* Category, Platform & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                {/* Platform */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Target Platform *
                  </label>
                  <TargetPlatformSelector
                    value={editForm.platform}
                    onChange={(selectedPlatforms) =>
                      setEditForm({ ...editForm, platform: selectedPlatforms })
                    }
                    disabled={submitting}
                  />
                </div>

                {/* Status Transition dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Status Transition
                  </label>
                  {(() => {
                    const currentStatus = selectedCampaign?.status || editForm.status;
                    const validNext = getValidNextStatuses(currentStatus);

                    if (validNext.length === 0) {
                      return (
                        <div className="py-2.5">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(currentStatus).color
                              }`}
                          >
                            {getStatusBadge(currentStatus).label} (Locked)
                          </span>
                        </div>
                      );
                    }

                    return (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer capitalize"
                      >
                        <option value={currentStatus}>
                          Current: {getStatusBadge(currentStatus).label}
                        </option>
                        {validNext.map((st) => (
                          <option key={st} value={st}>
                            Move to: {getStatusBadge(st).label}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

              </div>

              {/* Budget Range (Min & Max Budget) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Min Budget (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="20000"
                      value={editForm.minBudget}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditForm({
                          ...editForm,
                          minBudget: val,
                          budget: editForm.maxBudget || val,
                        });
                      }}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Max Budget (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="50000"
                      value={editForm.maxBudget}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditForm({
                          ...editForm,
                          maxBudget: val,
                          budget: val,
                        });
                      }}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

              {/* Deadline & Required Creators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                {/* Deadline */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                  />
                </div>

                {/* Required Creators */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Creators Needed *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.requiredCreators}
                    onChange={(e) => setEditForm({ ...editForm, requiredCreators: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

              </div>

              {/* Audience Targeting Section */}
              <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/30 space-y-3">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                  Audience Targeting
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Target Age Bracket
                    </label>
                    <select
                      value={editForm.audienceAge}
                      onChange={(e) => setEditForm({ ...editForm, audienceAge: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                    >
                      <option value="All">All Ages</option>
                      <option value="13-17">13 - 17</option>
                      <option value="18-24">18 - 24</option>
                      <option value="25-34">25 - 34</option>
                      <option value="35-44">35 - 44</option>
                      <option value="45+">45+</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Gender
                    </label>
                    <select
                      value={editForm.audienceGender}
                      onChange={(e) => setEditForm({ ...editForm, audienceGender: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                    >
                      <option value="all">All Genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Geography / Target Regions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. India, Mumbai, Delhi"
                      value={editForm.audienceGeography}
                      onChange={(e) => setEditForm({ ...editForm, audienceGeography: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Usage Rights & Licensing Section */}
              <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/30 space-y-3">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                  Usage Rights & Licensing
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Usage Duration
                    </label>
                    <select
                      value={editForm.usageDuration}
                      onChange={(e) => setEditForm({ ...editForm, usageDuration: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                    >
                      <option value="30 days">30 Days</option>
                      <option value="60 days">60 Days</option>
                      <option value="90 days">90 Days</option>
                      <option value="6 months">6 Months</option>
                      <option value="1 year">1 Year</option>
                      <option value="Perpetual">Perpetual</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center gap-2 pt-1 sm:pt-0">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={editForm.usageOrganic}
                        onChange={(e) => setEditForm({ ...editForm, usageOrganic: e.target.checked })}
                        className="rounded border-border-theme text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <span>Organic Usage (Creator Feed)</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={editForm.usagePaidAds}
                        onChange={(e) => setEditForm({ ...editForm, usagePaidAds: e.target.checked })}
                        className="rounded border-border-theme text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <span>Paid Ads / Whitelisting Amplification</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={editForm.usageExclusivity}
                        onChange={(e) => setEditForm({ ...editForm, usageExclusivity: e.target.checked })}
                        className="rounded border-border-theme text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <span>Exclusivity Required</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Creator Eligibility Requirements Section */}
              <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/30 space-y-3">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                  Creator Eligibility Requirements
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Minimum Followers
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 10000 (0 for no limit)"
                      value={editForm.minFollowers}
                      onChange={(e) => setEditForm({ ...editForm, minFollowers: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-text-secondary font-medium">
                      Minimum Engagement Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="e.g. 2.5 (0 for no limit)"
                      value={editForm.minEngagementRate}
                      onChange={(e) => setEditForm({ ...editForm, minEngagementRate: e.target.value })}
                      className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Deliverables List Builder */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Deliverables *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add deliverable..."
                    value={editDeliverableInput}
                    onChange={(e) => setEditDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEditDeliverable();
                      }
                    }}
                    className="flex-1 bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-secondary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addEditDeliverable}
                    className="px-4 py-2 rounded-xl bg-surface-muted border border-border-theme text-foreground text-xs font-semibold hover:border-secondary transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Tags list */}
                {editDeliverables.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {editDeliverables.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeEditDeliverable(idx)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border-theme flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={submitting || isUploadingEdit}
                  className="px-4 py-2.5 rounded-xl border border-border-theme text-foreground text-xs font-semibold hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploadingEdit}
                  className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
