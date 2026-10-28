"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppliedCampaigns,
  updateCreatorBookingStatus,
} from "@/redux/creator/campaigns/campaigns_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

// =========================================================
// SVG ICONS
// =========================================================
function MegaphoneIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}


function MoneyBagIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v2m-3-2a3 3 0 00-3 3v.5a5.5 5.5 0 00-2 4.25c0 4.5 4 7.25 8 7.25s8-2.75 8-7.25a5.5 5.5 0 00-2-4.25V7a3 3 0 00-3-3h-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11h6m-6 3h4m-1-4v5" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function CheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  );
}

function XCircleIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  );
}

function FlagIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M3 3.75a.75.75 0 01.75-.75h14.25a.75.75 0 01.6 1.2L16 7.5l2.6 3.3a.75.75 0 01-.6 1.2H3.75a.75.75 0 01-.75-.75V3.75zM3 12.75v7.5a.75.75 0 001.5 0v-7.5H3z" clipRule="evenodd" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function PlatformIcon({ platform, className = "w-4 h-4" }) {
  const norm = (platform || "").toLowerCase();
  if (norm.includes("youtube")) {
    return <YouTubeIcon className={`${className} text-black dark:text-white`} />;
  }
  if (norm.includes("instagram")) {
    return <InstagramIcon className={`${className} text-black dark:text-white`} />;
  }
  return (
    <svg className={`${className} text-black dark:text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

// =========================================================
// HELPER UTILITIES & STATUS CONFIG
// =========================================================
const STATUS_TABS = [
  { id: "All", label: "All Campaigns" },
  { id: "pending", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
  { id: "cancelled", label: "Cancelled" },
];

const PLATFORM_LABELS = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  website: "Website",
};

const formatPlatform = (val) => {
  if (!val) return "General";
  return PLATFORM_LABELS[val.toLowerCase()] || val;
};

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

const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        color: "text-amber-600 dark:text-amber-400",
        Icon: ClockIcon,
      };
    case "accepted":
      return {
        label: "Accepted",
        color: "text-emerald-600 dark:text-emerald-400",
        Icon: CheckCircleIcon,
      };
    case "in_progress":
      return {
        label: "Active",
        color: "text-emerald-600 dark:text-emerald-400",
        Icon: CheckCircleIcon,
      };
    case "completed":
      return {
        label: "Completed",
        color: "text-purple-600 dark:text-purple-400",
        Icon: FlagIcon,
      };
    case "rejected":
      return {
        label: "Rejected",
        color: "text-rose-600 dark:text-rose-400",
        Icon: XCircleIcon,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "text-neutral-600 dark:text-neutral-400",
        Icon: XCircleIcon,
      };
    default:
      return {
        label: status || "Unknown",
        color: "text-neutral-600 dark:text-neutral-400",
        Icon: ClockIcon,
      };
  }
};

const formatDeliverableItem = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    const text = item.title || item.name || item.type || item.deliverable || item.text || item.label || "";
    const count = item.count || item.quantity || item.amount;
    if (text && count) return `${count} ${text}`;
    if (text) return text;
  }
  return String(item);
};

export default function CreatorAppliedCampaignsManager() {
  const dispatch = useDispatch();
  const { appliedCampaigns, appliedPagination, loading, error } = useSelector(
    (state) => state.creatorCampaigns
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [failedImgUrls, setFailedImgUrls] = useState({});

  // Fetch applied campaigns on mount and when filters/page change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 9,
    };

    if (selectedStatus && selectedStatus !== "All") {
      params.status = selectedStatus;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    dispatch(fetchAppliedCampaigns(params));
  }, [dispatch, currentPage, selectedStatus, searchQuery]);

  const campaignsList = Array.isArray(appliedCampaigns) ? appliedCampaigns : [];

  const handleStatusChange = (statusId) => {
    setSelectedStatus(statusId);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    const params = {
      page: currentPage,
      limit: 9,
    };

    if (selectedStatus && selectedStatus !== "All") {
      params.status = selectedStatus;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    dispatch(fetchAppliedCampaigns(params));
  };

  const handleUpdateStatus = async (bookingId, status) => {
    if (!bookingId || processingBookingId) return;
    setProcessingBookingId(bookingId);
    setActionFeedback(null);

    try {
      const actionResult = await dispatch(
        updateCreatorBookingStatus({ bookingId, status })
      );

      if (updateCreatorBookingStatus.fulfilled.match(actionResult)) {
        const message =
          actionResult.payload?.message ||
          `Booking proposal ${status} successfully`;
        setActionFeedback({ type: "success", message });

        const params = {
          page: currentPage,
          limit: 9,
        };

        if (selectedStatus && selectedStatus !== "All") {
          params.status = selectedStatus;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        dispatch(fetchAppliedCampaigns(params));
      } else if (updateCreatorBookingStatus.rejected.match(actionResult)) {
        setActionFeedback({
          type: "error",
          message:
            actionResult.payload ||
            `Failed to ${status} booking proposal.`,
        });
      }
    } catch (err) {
      setActionFeedback({
        type: "error",
        message: err.message || `Failed to ${status} booking proposal.`,
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* 1. PAGE HEADER HERO WITH CAMPAIGN COLLABORATION & PROGRESS ILLUSTRATION */}
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-100/80 dark:bg-gradient-to-br dark:from-surface dark:via-surface dark:to-pink-950/20 border border-pink-200/80 dark:border-pink-900/40 rounded-3xl p-6 sm:p-7 lg:p-8 shadow-[0_4px_24px_rgba(255,45,108,0.06)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 transition-colors">
            {/* Ambient Blush-Pink Glow Accents */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pink-200/50 dark:bg-pink-600/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 right-48 w-72 h-72 rounded-full bg-rose-200/40 dark:bg-rose-600/5 blur-3xl pointer-events-none" />
            <div className="absolute -top-10 left-1/3 w-48 h-48 rounded-full bg-pink-100/40 dark:bg-pink-600/5 blur-2xl pointer-events-none" />

            {/* Left Content Area */}
            <div className="relative z-10 max-w-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-black dark:text-white border border-secondary/20">
                  Collaborations
                </span>
                {appliedPagination?.totalItems !== undefined && (
                  <span className="text-xs font-semibold text-text-secondary">
                    • {appliedPagination.totalItems} Campaign{appliedPagination.totalItems !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <h1 className="font-serif font-medium text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight">
                My Campaigns
              </h1>

              <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                View and track your campaign applications, active bookings, and collaboration statuses.
              </p>

              <div className="pt-1.5">
                <Link
                  href="/creator/campaigns/discover"
                  className="group/btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs sm:text-sm font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 hover:border-neutral-800 hover:shadow-md hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-300 ease-out shrink-0 cursor-pointer dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <span>Discover Campaigns</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 motion-reduce:transform-none" />
                </Link>
              </div>
            </div>

            {/* Right Decorative Composition: Static Campaign Journey Illustration */}
            <div className="relative z-10 hidden lg:flex flex-col items-center justify-center gap-3 w-[360px] xl:w-[420px] shrink-0 select-none pointer-events-none py-1">
              {/* Soft Ambient Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200/20 via-rose-100/30 to-pink-200/15 dark:from-pink-950/20 dark:to-transparent rounded-3xl blur-2xl -z-10" />

              {/* Top Row: Brand × Creator Collaboration Label & Sparkle Accent */}
              <div className="w-full flex items-center justify-between px-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-surface/90 backdrop-blur-sm border border-pink-200/80 dark:border-pink-900/50 shadow-xs shadow-pink-500/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse motion-reduce:animate-none" />
                  <span className="text-[10.5px] font-semibold text-foreground tracking-wide font-sans">
                    Brand <span className="text-pink-500 font-bold">×</span> Creator
                  </span>
                </div>

                {/* Subtle Decorative Black Sparkles */}
                <div className="flex items-center gap-1.5 text-black dark:text-white">
                  <svg className="w-3.5 h-3.5 fill-current animate-pulse motion-reduce:animate-none" viewBox="0 0 24 24">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                  <span className="w-1 h-1 rounded-full bg-black dark:bg-white opacity-80" />
                  <svg className="w-2.5 h-2.5 fill-current opacity-70 animate-pulse motion-reduce:animate-none [animation-delay:400ms]" viewBox="0 0 24 24">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                </div>
              </div>

              {/* Center: Horizontal 4-Milestone Campaign Journey */}
              <div className="relative w-full py-1">
                {/* Connecting Progress Line (Black/Dark Neutral with Subtle Animation) */}
                <div className="absolute top-5 left-7 right-7 h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-0 overflow-hidden rounded-full">
                  <div className="w-full h-full bg-gradient-to-r from-neutral-400 via-neutral-950 to-neutral-400 dark:from-neutral-600 dark:via-neutral-100 dark:to-neutral-600 animate-pulse motion-reduce:animate-none" />
                </div>

                {/* 4 Connected Milestones */}
                <div className="relative z-10 flex items-start justify-between">
                  {/* Milestone 1: Discover */}
                  <div className="flex flex-col items-center text-center w-16">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-surface border border-pink-100/90 dark:border-border-theme shadow-xs flex items-center justify-center text-text-secondary">
                      <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-medium text-text-secondary mt-1.5 font-sans">
                      Discover
                    </span>
                  </div>

                  {/* Milestone 2: Apply */}
                  <div className="flex flex-col items-center text-center w-16">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-surface border border-pink-100/90 dark:border-border-theme shadow-xs flex items-center justify-center text-text-secondary">
                      <svg className="w-4 h-4 text-text-secondary -rotate-45 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-medium text-text-secondary mt-1.5 font-sans">
                      Apply
                    </span>
                  </div>

                  {/* Milestone 3: Collaborate (Highlighted with black background and white icon) */}
                  <div className="flex flex-col items-center text-center w-16 -mt-1">
                    <div className="relative w-11 h-11 rounded-full bg-neutral-950 dark:bg-neutral-900 text-white shadow-md shadow-black/30 dark:shadow-black/60 ring-4 ring-neutral-200/90 dark:ring-neutral-700/60 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-neutral-950/20 dark:bg-white/20 animate-ping motion-reduce:animate-none -z-10" />
                      <div className="absolute -inset-1 rounded-full bg-black/10 dark:bg-white/10 blur-xs animate-pulse motion-reduce:animate-none -z-10" />
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4L16 11" />
                        <path d="m13 7 1.3-1.3a1 1 0 0 1 1.4 0l4.3 4.3a1 1 0 0 1 0 1.4L18 13" />
                        <path d="m2 12 5.3-5.3a1 1 0 0 1 1.4 0L12 10" />
                        <path d="m5 15 3 3a1 1 0 0 0 1.4 0l3.6-3.6" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-black dark:text-white mt-1.5 font-sans">
                      Collaborate
                    </span>
                  </div>

                  {/* Milestone 4: Complete */}
                  <div className="flex flex-col items-center text-center w-16">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-surface border border-pink-100/90 dark:border-border-theme shadow-xs flex items-center justify-center text-emerald-500">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-medium text-text-secondary mt-1.5 font-sans">
                      Complete
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Tiny Deliverables Checklist Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-transparent border border-pink-200/80 dark:border-pink-900/40 shadow-xs shadow-pink-500/5">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-foreground font-sans">
                  <span className="w-3.5 h-3.5 rounded-full bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                  <span>Campaign Brief</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-black dark:bg-white" />
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-foreground font-sans">
                  <span className="w-3.5 h-3.5 rounded-full bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                  <span>Deliverables Approved</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FILTER & SEARCH BAR */}
          <div className="bg-surface border border-border-theme rounded-2xl p-3 sm:p-4 shadow-xs space-y-3 sm:space-y-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar py-3 select-none">
              {STATUS_TABS.map((tab) => {
                const isActive = selectedStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleStatusChange(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-neutral-950 text-white font-semibold shadow-xs dark:bg-neutral-100 dark:text-neutral-950"
                        : "bg-surface-muted text-text-secondary hover:text-foreground hover:bg-surface-muted/80 border border-border-theme/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search applied campaigns..."
                className="w-full text-xs pl-10 pr-9 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-text-secondary hover:text-foreground cursor-pointer font-sans"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 3. ERROR BANNER */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-5 py-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span>{typeof error === "string" ? error : "Failed to load applied campaigns."}</span>
              </div>
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

          {/* ACTION FEEDBACK BANNER */}
          {actionFeedback && (
            <div
              className={`px-5 py-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs ${
                actionFeedback.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-500"
              }`}
            >
              <div className="flex items-center gap-2">
                {actionFeedback.type === "success" ? (
                  <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <RefreshIcon className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span>{actionFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionFeedback(null)}
                className="text-text-secondary hover:text-foreground text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 4. LOADING SKELETON STATE */}
          {loading && campaignsList.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs animate-pulse p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-surface-muted rounded-full w-24" />
                    <div className="h-5 bg-surface-muted rounded-full w-16" />
                  </div>
                  <div className="h-6 bg-surface-muted rounded-md w-3/4" />
                  <div className="h-4 bg-surface-muted rounded-md w-full" />
                  <div className="h-10 bg-surface-muted rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : campaignsList.length > 0 ? (
            /* 5. APPLIED CAMPAIGNS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaignsList.map((item) => {
                const bookingId = item._id || item.bookingId;
                const campaignObj = item.campaign || {};
                const brandObj = item.brand || {};
                const badge = getStatusBadge(item.status);
                const StatusIcon = badge.Icon;
                const displayPrice = item.agreedPrice || campaignObj.budget;
                const brandInitial = (brandObj.name || "B").charAt(0).toUpperCase();

                const deliverablesList =
                  (Array.isArray(item.deliverables) && item.deliverables.length > 0
                    ? item.deliverables
                    : campaignObj.deliverables) || [];
                const validDeliverables = deliverablesList
                  .map(formatDeliverableItem)
                  .filter(Boolean);

                const serviceTitle =
                  item.service?.title ||
                  (campaignObj.category ? `${campaignObj.category} Creator` : "Custom Deliverable");

                return (
                  <div
                    key={bookingId}
                    className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme hover:border-pink-200/90 dark:hover:border-pink-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(255,45,108,0.03)] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      {/* 1. TOP ROW: Category (Pink) & Proposal Text (Left), Status (Right) - Clean Text Without Pill Outlines */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase text-pink-500 dark:text-pink-400 truncate max-w-[130px]">
                            {campaignObj.category || "Fashion"}
                          </span>

                          {item.initiatedBy === "brand" ? (
                            <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400">
                              Brand Proposal
                            </span>
                          ) : (
                            <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase text-neutral-600 dark:text-text-secondary">
                              My Application
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase flex items-center gap-1.5 ${badge.color}`}
                        >
                          {StatusIcon && <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />}
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      {/* 2. CAMPAIGN VISUAL BANNER WITH FLOATING BRAND BADGE */}
                      <div className="h-28 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden relative border border-neutral-100 dark:border-border-theme/40 bg-surface-muted/60 dark:bg-surface-muted/20">
                        {(campaignObj.coverImage || campaignObj.image) && !failedImgUrls[bookingId] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={campaignObj.coverImage || campaignObj.image}
                            alt={campaignObj.title || "Campaign banner"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={() => setFailedImgUrls((prev) => ({ ...prev, [bookingId]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-pink-100/70 via-rose-50/50 to-amber-50/40 dark:from-pink-950/40 dark:via-purple-950/20 dark:to-surface-muted/40 flex items-center justify-center">
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-pink-200/40 dark:bg-pink-600/10 blur-xl pointer-events-none" />
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-rose-200/30 dark:bg-rose-600/10 blur-xl pointer-events-none" />
                            <div className="text-center px-3 relative z-10 opacity-70">
                              <span className="font-sans font-medium text-xs sm:text-sm text-foreground/80 tracking-wide line-clamp-1">
                                {campaignObj.title || "Editorial Brief"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Floating Brand Badge Bottom-Left */}
                        <div className="absolute bottom-2 left-2 bg-white/95 dark:bg-surface/95 backdrop-blur-xs px-2 py-0.5 rounded-lg shadow-xs border border-border-theme/60 flex items-center gap-1.5 max-w-[85%]">
                          <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-[8px] font-sans font-semibold shrink-0">
                            {brandInitial}
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-foreground truncate">
                            {brandObj.name || "Brand Partner"}
                          </span>
                        </div>
                      </div>

                      {/* 3. CAMPAIGN TITLE & BRAND ROW */}
                      <div>
                        <h2 className="font-sans font-semibold text-base sm:text-lg text-black dark:text-white line-clamp-1 group-hover:text-black dark:group-hover:text-white transition-colors tracking-tight">
                          {campaignObj.title || "Campaign Collaboration"}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-[8px] font-sans font-semibold shrink-0">
                            {brandInitial}
                          </div>
                          <span className="text-xs font-sans text-text-secondary truncate">
                            by {brandObj.name || "Brand User"}
                          </span>
                        </div>
                      </div>

                      {/* 4. DESCRIPTION / PROPOSAL MESSAGE */}
                      <p className="text-xs font-sans text-text-secondary line-clamp-2 leading-normal">
                        {item.message || campaignObj.description || "Looking for creators to promote our campaign collection..."}
                      </p>

                      {/* 5. COMPACT BLUSH-PINK PRICING PANEL */}
                      <div className="p-2.5 sm:p-3 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100/70 dark:border-pink-900/40 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-100/70 dark:bg-pink-900/40 border border-pink-200/60 dark:border-pink-800/40 flex items-center justify-center text-black dark:text-white shrink-0">
                          <MoneyBagIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-sans font-medium text-text-secondary block leading-none mb-0.5">
                            Agreed Price
                          </span>
                          <span className="font-sans font-bold text-xl sm:text-2xl text-foreground tabular-nums tracking-tight leading-none block">
                            {formatPrice(displayPrice, item.currency || "INR")}
                          </span>
                        </div>
                      </div>

                      {/* 6. ALIGNED COMPACT DATES */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-sans text-text-secondary">
                        <div className="flex items-center gap-2 p-2 rounded-xl border border-neutral-100 dark:border-border-theme/60 bg-neutral-50/50 dark:bg-surface-muted/20">
                          <div className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                            <CalendarIcon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] sm:text-[10px] text-text-secondary font-medium block leading-tight">
                              Start Date
                            </span>
                            <span className="text-[11px] sm:text-xs font-semibold text-foreground block truncate leading-tight mt-0.5">
                              {formatDate(item.startDate || item.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-xl border border-neutral-100 dark:border-border-theme/60 bg-neutral-50/50 dark:bg-surface-muted/20">
                          <div className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                            <ClockIcon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] sm:text-[10px] text-text-secondary font-medium block leading-tight">
                              End Date
                            </span>
                            <span className="text-[11px] sm:text-xs font-semibold text-foreground block truncate leading-tight mt-0.5">
                              {formatDate(item.deadline || campaignObj.deadline)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 7. DELIVERABLES PILLS */}
                      {validDeliverables.length > 0 && (
                        <div className="space-y-1 pt-0">
                          <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-text-secondary block">
                            DELIVERABLES ({validDeliverables.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {validDeliverables.map((itemText, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-sans font-medium bg-neutral-50 dark:bg-surface-muted/40 text-foreground border border-neutral-200/70 dark:border-border-theme"
                              >
                                <CheckIcon className="text-emerald-500 shrink-0 w-3 h-3" />
                                <span className="truncate max-w-[190px]">{itemText}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 8. SERVICE PACKAGE LINE */}
                      <div className="text-[11px] sm:text-xs font-sans text-text-secondary pt-0">
                        <span className="font-semibold text-foreground">Service Package:</span>{" "}
                        <span>{serviceTitle}</span>
                      </div>
                    </div>

                    {/* 9. BOTTOM METADATA & ACTIONS FOOTER */}
                    <div className="space-y-2 pt-2.5 border-t border-border-theme/40 mt-2.5">
                      {/* Quiet Metadata Footer: Platform & ID */}
                      <div className="flex items-center justify-between text-[11px] sm:text-xs font-sans text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <PlatformIcon platform={campaignObj.platform} className="w-3.5 h-3.5 shrink-0" />
                          <span>Platform: {formatPlatform(campaignObj.platform)}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-mono text-text-secondary">
                          ID: {bookingId ? String(bookingId).slice(-6) : ""}
                        </span>
                      </div>

                      {/* Primary Black Button for Accepted or In-Progress */}
                      {(item.status === "accepted" || item.status === "in_progress") && (
                        <div className="pt-0.5">
                          <Link
                            href={`/creator/workspace/${bookingId}`}
                            className="group/btn w-full py-2 px-3.5 rounded-xl bg-neutral-950 text-white font-sans font-semibold text-xs border border-neutral-900 shadow-xs hover:bg-neutral-900 hover:border-neutral-800 hover:shadow-xs hover:shadow-pink-500/10 active:scale-[0.99] transition-all duration-200 ease-out flex items-center justify-center gap-1.5 cursor-pointer dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200"
                          >
                            <span>Go to Workspace</span>
                            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                          </Link>
                        </div>
                      )}

                      {/* Interactive Buttons for Pending Brand Proposals */}
                      {item.initiatedBy === "brand" && item.status === "pending" && (
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            disabled={processingBookingId === bookingId}
                            onClick={() => handleUpdateStatus(bookingId, "accepted")}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingBookingId === bookingId ? (
                              <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckIcon className="w-3.5 h-3.5" />
                            )}
                            <span>Accept</span>
                          </button>

                          <button
                            type="button"
                            disabled={processingBookingId === bookingId}
                            onClick={() => handleUpdateStatus(bookingId, "rejected")}
                            className="flex-1 py-1.5 px-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-sans font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {/* Subtle Link Actions: View Details (Rejected / Creator Pending) or View Workspace (Completed) */}
                      {item.status === "rejected" && (
                        <div className="pt-0.5 text-center">
                          <Link
                            href={campaignObj._id ? `/creator/campaigns/${campaignObj._id}` : `/creator/campaigns`}
                            className="inline-flex items-center justify-center gap-1 text-xs font-sans font-semibold text-black dark:text-white hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                          >
                            <span>View Details</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {item.status === "completed" && (
                        <div className="pt-0.5 text-center">
                          <Link
                            href={`/creator/workspace/${bookingId}`}
                            className="inline-flex items-center justify-center gap-1 text-xs font-sans font-semibold text-black dark:text-white hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                          >
                            <span>View Workspace</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {item.initiatedBy !== "brand" && item.status === "pending" && (
                        <div className="pt-0.5 text-center">
                          <Link
                            href={campaignObj._id ? `/creator/campaigns/${campaignObj._id}` : `/creator/campaigns`}
                            className="inline-flex items-center justify-center gap-1 text-xs font-sans font-semibold text-black dark:text-white hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                          >
                            <span>View Details</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 6. EMPTY STATE */
            <div className="bg-surface border border-border-theme rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                <MegaphoneIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-medium text-xl text-foreground">
                  {selectedStatus === "All"
                    ? "No applied campaigns yet"
                    : `No ${selectedStatus} campaigns found`}
                </h3>
                <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                  {selectedStatus === "All"
                    ? "You have not applied to any campaigns yet. Explore the marketplace to find brand collaborations."
                    : `You currently have no campaign applications in ${selectedStatus} status.`}
                </p>
              </div>

              {selectedStatus === "All" && (
                <div className="pt-2">
                  <Link
                    href="/creator/campaigns/discover"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 hover:border-neutral-800 hover:shadow-xs hover:shadow-pink-500/10 active:scale-[0.99] transition-all duration-200 ease-out cursor-pointer dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200"
                  >
                    <span>Discover Campaigns</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 7. PAGINATION BAR */}
          {appliedPagination && appliedPagination.totalPages > 1 && (
            <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
              <div>
                Showing Page <span className="font-semibold text-foreground">{appliedPagination.page}</span> of{" "}
                <span className="font-semibold text-foreground">{appliedPagination.totalPages}</span> ({appliedPagination.totalItems} Total Applied Campaigns)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={appliedPagination.page <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon /> Previous
                </button>
                <button
                  type="button"
                  disabled={appliedPagination.page >= appliedPagination.totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, appliedPagination.totalPages))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
