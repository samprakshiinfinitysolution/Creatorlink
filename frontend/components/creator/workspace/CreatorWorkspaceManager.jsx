"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchCreatorWorkspaces } from "@/redux/creator/workspace/workspace_slice";
import { getCreatorWorkspaces as getCreatorWorkspacesApi } from "@/redux/creator/workspace/workspace_api";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

// =========================================================
// SVG ICONS
// =========================================================
function WorkspaceIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function VideoCameraIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function PhotoIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
    </svg>
  );
}

function PaperAirplaneIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function ChatBubbleDotsIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12c0 4.004-3.694 7.25-8.25 7.25a9.22 9.22 0 01-3.684-.763L4.5 19.5l1.09-3.27C4.606 14.938 4.25 13.513 4.25 12c0-4.004 3.694-7.25 8.25-7.25s8.25 3.246 8.25 7.25z" />
      <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SparkleIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
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

function BriefcaseIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387M3.75 14.15a2.18 2.18 0 01-.75-1.661V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m4.5 8.006h4.5m-4.5 0a2.25 2.25 0 01-2.25-2.25v-.903c0-.496.186-.975.52-1.341l.228-.25a2.25 2.25 0 011.692-.756h3.64c.642 0 1.25.26 1.692.756l.228.25c.334.366.52.845.52 1.341v.903a2.25 2.25 0 01-2.25 2.25m-4.5 0h4.5M12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3z" />
    </svg>
  );
}

function ChatBubbleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008H8.625V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zM21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function MoreVerticalIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
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

function CheckCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// =========================================================
// HELPER UTILITIES & STATUS CONFIG
// =========================================================
const STATUS_TABS = [
  { id: "All", label: "All Workspaces" },
  { id: "in_progress", label: "In Progress" },
  { id: "submitted", label: "Submitted" },
  { id: "revision_requested", label: "Revision Requested" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const PLATFORM_MAP = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  website: "Website",
};

const formatPlatform = (val) => {
  if (!val) return "";
  return PLATFORM_MAP[val.toLowerCase()] || val;
};

const formatPrice = (amount, currency = "INR") => {
  if (typeof amount !== "number" || isNaN(amount)) return "N/A";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(amount)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-amber-50 text-amber-600 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
      };
    case "submitted":
      return {
        label: "Submitted",
        color: "bg-purple-50 text-purple-600 border-purple-200/70 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40",
      };
    case "revision_requested":
      return {
        label: "Revision Requested",
        color: "bg-rose-50 text-rose-600 border-rose-200/70 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-neutral-100 text-neutral-600 border-neutral-200/80 dark:bg-surface-muted dark:text-text-secondary dark:border-border-theme",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Active",
        color: "bg-neutral-100 text-neutral-600 border-neutral-200/80 dark:bg-surface-muted dark:text-text-secondary dark:border-border-theme",
      };
  }
};

export default function CreatorWorkspaceManager() {
  const dispatch = useDispatch();
  const { workspaces, pagination, loading, error } = useSelector(
    (state) => state.creatorWorkspace
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [allWorkspacesSummary, setAllWorkspacesSummary] = useState([]);

  // Fetch summary counts for the 4 header metric cards (unfiltered global count)
  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const res = await getCreatorWorkspacesApi({ limit: 100 });
        if (isMounted && res?.data?.workspaces) {
          setAllWorkspacesSummary(res.data.workspaces);
        }
      } catch {
        // Silently fall back to loaded workspaces if initial fetch fails
      }
    };
    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch workspaces when page or status tab changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 9,
    };
    if (activeTab !== "All") {
      params.status = activeTab;
    }
    dispatch(fetchCreatorWorkspaces(params));
  }, [dispatch, currentPage, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    const params = {
      page: currentPage,
      limit: 9,
    };
    if (activeTab !== "All") {
      params.status = activeTab;
    }
    dispatch(fetchCreatorWorkspaces(params));
  };

  const handlePageChange = (newPage) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Compute live summary statistics from actual data
  const summarySource = allWorkspacesSummary.length > 0 ? allWorkspacesSummary : workspaces;
  const totalCount = pagination?.totalItems ?? (allWorkspacesSummary.length > 0 ? allWorkspacesSummary.length : workspaces.length);
  const inProgressCount = summarySource.filter(
    (w) => w.status === "in_progress" || w.status === "submitted" || w.status === "revision_requested"
  ).length;
  const completedCount = summarySource.filter((w) => w.status === "completed").length;
  const cancelledCount = summarySource.filter((w) => w.status === "cancelled").length;

  // Search filter applied on top of the active workspace list
  const displayedWorkspaces = workspaces.filter((ws) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const title = (ws.campaign?.title || "").toLowerCase();
    const brand = (ws.brand?.name || ws.brand?.email || "").toLowerCase();
    const category = (ws.campaign?.category || "").toLowerCase();
    const brief = (ws.brief || "").toLowerCase();
    return (
      title.includes(q) ||
      brand.includes(q) ||
      category.includes(q) ||
      brief.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* 1. HERO SECTION WITH EXACT COLLABORATION DELIVERABLES ILLUSTRATION MATCHING REFERENCE */}
          <div className="bg-gradient-to-r from-[#fff5f8] via-[#fffbfd] to-[#fff0f5] dark:bg-gradient-to-r dark:from-surface dark:via-surface dark:to-pink-950/20 border border-pink-100/90 dark:border-pink-900/30 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_rgba(255,45,108,0.05)] relative overflow-hidden flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Ambient Soft Blush Background Accents */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-pink-200/25 dark:bg-pink-900/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 right-1/4 w-60 h-60 bg-rose-200/20 dark:bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Heading, Badge, Subtitle */}
            <div className="relative z-10 max-w-xl space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase bg-[#fce7f0] dark:bg-pink-950/60 text-pink-600 dark:text-white border border-pink-200/60 dark:border-pink-900/40">
                  WORKSPACE
                </span>
                <span className="text-xs sm:text-sm font-sans font-medium text-neutral-500 dark:text-neutral-400">
                  • Active Collaborations &amp; Deliverables
                </span>
              </div>

              <div className="flex items-center gap-3.5 sm:gap-4 pt-0.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme text-black dark:text-white shadow-xs flex items-center justify-center shrink-0">
                  <WorkspaceIcon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                </div>
                <h1 className="font-heading font-serif font-bold text-3xl sm:text-4xl lg:text-[42px] text-neutral-900 dark:text-white tracking-tight leading-tight">
                  Collaboration Workspace
                </h1>
              </div>

              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed max-w-lg">
                Track deliverables, submit campaign work, and review brand feedback.
              </p>
            </div>

            {/* Right Column: Polished Deliverables Illustration Matching Reference Screenshot */}
            <div className="relative z-10 flex items-center justify-center lg:justify-end w-full lg:w-auto shrink-0 select-none py-2">
              <div className="relative w-[340px] sm:w-[380px] h-[190px] sm:h-[210px]">
                {/* Dotted Accent Curve */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 380 210"
                  fill="none"
                >
                  <path
                    d="M 50 160 C 25 70, 140 25, 230 25 C 290 25, 360 45, 365 95"
                    stroke="rgba(244, 114, 182, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="3 4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Decorative Sparkles */}
                {/* Bottom-left black sparkle */}
                <div className="absolute left-6 bottom-3 text-black dark:text-white pointer-events-none animate-pulse motion-reduce:animate-none">
                  <SparkleIcon className="w-3.5 h-3.5 fill-current" />
                </div>
                {/* Top-center soft pink sparkle */}
                <div className="absolute left-32 top-3 text-pink-300 dark:text-pink-400 pointer-events-none">
                  <SparkleIcon className="w-3.5 h-3.5 fill-current" />
                </div>
                {/* Sparkle above Deliverables card */}
                <div className="absolute left-52 top-1 text-black dark:text-white pointer-events-none">
                  <SparkleIcon className="w-3 h-3 fill-current" />
                </div>
                {/* Top-right sparkle 1 (black, larger) */}
                <div className="absolute right-10 top-2 text-black dark:text-white pointer-events-none animate-pulse motion-reduce:animate-none [animation-delay:400ms]">
                  <SparkleIcon className="w-3.5 h-3.5 fill-current" />
                </div>
                {/* Top-right sparkle 2 (black, smaller) */}
                <div className="absolute right-3 top-8 text-black dark:text-white pointer-events-none opacity-80">
                  <SparkleIcon className="w-2.5 h-2.5 fill-current" />
                </div>

                {/* Floating Photo Icon Card (Top-Left) */}
                <div className="absolute left-4 sm:left-6 top-1 w-11 h-11 rounded-2xl bg-white dark:bg-surface border border-neutral-100 dark:border-border-theme shadow-md shadow-black/[0.04] flex items-center justify-center text-black dark:text-white z-20 creator-float motion-reduce:animate-none">
                  <PhotoIcon className="w-5 h-5 fill-current" />
                </div>

                {/* Floating Send/Paper Airplane Card (Mid-Left) */}
                <div className="absolute left-9 sm:left-12 bottom-6 sm:bottom-8 w-11 h-11 rounded-2xl bg-white dark:bg-surface border border-neutral-100 dark:border-border-theme shadow-md shadow-black/[0.04] flex items-center justify-center text-black dark:text-white z-20 creator-float motion-reduce:animate-none [animation-delay:600ms]">
                  <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                </div>

                {/* Floating Message Card with 3 dots (Bottom-Right of Deliverables card) */}
                <div className="absolute right-24 sm:right-28 bottom-2 sm:bottom-3 w-11 h-11 rounded-2xl bg-white dark:bg-surface border border-neutral-100 dark:border-border-theme shadow-md shadow-black/[0.04] flex items-center justify-center text-black dark:text-white z-20 creator-float motion-reduce:animate-none [animation-delay:1000ms]">
                  <ChatBubbleDotsIcon className="w-5 h-5 text-black dark:text-white" />
                </div>

                {/* Background Media Preview Card (Tilted Clockwise) */}
                <div className="absolute right-2 sm:right-4 top-5 w-44 sm:w-48 bg-white/95 dark:bg-surface/95 backdrop-blur-sm rounded-2xl border border-pink-100/70 dark:border-border-theme shadow-lg shadow-black/[0.04] p-3.5 rotate-[8deg] z-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-pink-100/70 dark:bg-pink-950/50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-pink-400 dark:text-pink-300 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="h-2 w-16 bg-pink-100/90 dark:bg-pink-900/40 rounded-full" />
                      <div className="h-1.5 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                      <div className="h-1.5 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Foreground Deliverables Checklist Card (Tilted Counter-Clockwise) */}
                <div className="absolute left-16 sm:left-20 top-0 w-48 sm:w-52 -rotate-[3deg] bg-white dark:bg-surface border border-neutral-100 dark:border-border-theme rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/[0.05] z-10">
                  <h4 className="text-sm sm:text-base font-bold font-sans text-neutral-900 dark:text-white mb-3">
                    Deliverables
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <CheckIcon className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5] shrink-0" />
                      <span className="text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Create Content
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckIcon className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5] shrink-0" />
                      <span className="text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Submit for Review
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckIcon className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5] shrink-0" />
                      <span className="text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Get Feedback
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                        <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-neutral-950 dark:text-white">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FOUR STATISTICS CARDS IN ONE HORIZONTAL ROW MATCHING REFERENCE */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Total Workspaces */}
            <div className="bg-white dark:bg-surface border border-neutral-100/90 dark:border-border-theme rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default motion-reduce:transform-none motion-reduce:transition-none">
              <div className="w-12 h-12 rounded-full bg-[#fce7f0] dark:bg-pink-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                <WorkspaceIcon className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-sans text-neutral-500 dark:text-text-secondary block leading-none mb-1.5">
                  Total Workspaces
                </span>
                <span className="font-heading font-serif font-bold text-2xl sm:text-3xl text-neutral-950 dark:text-white tabular-nums tracking-tight leading-none block">
                  {totalCount}
                </span>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white dark:bg-surface border border-neutral-100/90 dark:border-border-theme rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default motion-reduce:transform-none motion-reduce:transition-none">
              <div className="w-12 h-12 rounded-full bg-[#fef3c7] dark:bg-amber-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                <ClockIcon className="w-6 h-6 stroke-2" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-sans text-neutral-500 dark:text-text-secondary block leading-none mb-1.5">
                  In Progress
                </span>
                <span className="font-heading font-serif font-bold text-2xl sm:text-3xl text-neutral-950 dark:text-white tabular-nums tracking-tight leading-none block">
                  {inProgressCount}
                </span>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white dark:bg-surface border border-neutral-100/90 dark:border-border-theme rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default motion-reduce:transform-none motion-reduce:transition-none">
              <div className="w-12 h-12 rounded-full bg-[#dcfce7] dark:bg-emerald-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-6 h-6 stroke-2" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-sans text-neutral-500 dark:text-text-secondary block leading-none mb-1.5">
                  Completed
                </span>
                <span className="font-heading font-serif font-bold text-2xl sm:text-3xl text-neutral-950 dark:text-white tabular-nums tracking-tight leading-none block">
                  {completedCount}
                </span>
              </div>
            </div>

            {/* Cancelled */}
            <div className="bg-white dark:bg-surface border border-neutral-100/90 dark:border-border-theme rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default motion-reduce:transform-none motion-reduce:transition-none">
              <div className="w-12 h-12 rounded-full bg-[#f3f4f6] dark:bg-surface-muted text-black dark:text-white flex items-center justify-center shrink-0">
                <XCircleIcon className="w-6 h-6 stroke-2" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-sans text-neutral-500 dark:text-text-secondary block leading-none mb-1.5">
                  Cancelled
                </span>
                <span className="font-heading font-serif font-bold text-2xl sm:text-3xl text-neutral-950 dark:text-white tabular-nums tracking-tight leading-none block">
                  {cancelledCount}
                </span>
              </div>
            </div>
          </div>

          {/* 3. STATUS FILTERS & SEARCH CONTAINER */}
          <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs space-y-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {STATUS_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
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
                <SearchIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces by campaign or brand..."
                className="w-full text-xs pl-10 pr-9 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-text-secondary hover:text-foreground cursor-pointer font-sans"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 4. ERROR BANNER */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <span>{typeof error === "string" ? error : "Failed to load workspaces."}</span>
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

          {/* 5. LOADING SKELETON STATE */}
          {loading && workspaces.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-4 sm:p-5 space-y-3.5 animate-pulse shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-surface-muted" />
                      <div className="space-y-1">
                        <div className="h-3 bg-surface-muted rounded-md w-24" />
                        <div className="h-2.5 bg-surface-muted rounded-md w-16" />
                      </div>
                    </div>
                    <div className="h-5 bg-surface-muted rounded-full w-20" />
                  </div>
                  <div className="h-4 bg-surface-muted rounded-md w-3/4" />
                  <div className="h-3 bg-surface-muted rounded-md w-full" />
                  <div className="h-28 bg-surface-muted rounded-xl w-full" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 bg-surface-muted rounded-xl" />
                    <div className="h-12 bg-surface-muted rounded-xl" />
                  </div>
                  <div className="h-10 bg-surface-muted rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : !loading && displayedWorkspaces.length === 0 ? (
            /* 6. EMPTY STATE */
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 border border-pink-100 dark:border-pink-900/40 flex items-center justify-center mx-auto">
                <BriefcaseIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-medium text-xl text-foreground">
                  {searchQuery ? "No matching workspaces found" : "No workspaces found"}
                </h3>
                <p className="text-xs text-text-secondary font-sans max-w-sm mx-auto leading-relaxed">
                  {searchQuery
                    ? `No workspaces match your search query "${searchQuery}". Try searching with a different campaign or brand term.`
                    : activeTab !== "All"
                    ? `You currently have no workspaces in the "${STATUS_TABS.find((t) => t.id === activeTab)?.label || activeTab}" stage.`
                    : "Once a brand accepts your campaign application or booking proposal, your collaboration workspace will appear here."}
                </p>
              </div>
              {(searchQuery || activeTab !== "All") && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveTab("All");
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                  >
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 7. WORKSPACE CARDS GRID (3 cols desktop, 2 cols tablet, 1 col mobile) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {displayedWorkspaces.map((ws) => {
                const badge = getStatusBadge(ws.status);
                const campaignTitle = ws.campaign?.title || ws.service?.title || "Campaign Workspace";
                const brandName = ws.brand?.name || ws.brand?.email?.split("@")[0] || "Brand Partner";
                const brandInitial = brandName.charAt(0).toUpperCase() || "B";
                const agreedPriceFormatted = formatPrice(ws.agreedPrice, ws.currency);
                const deadlineFormatted = formatDate(ws.deadline);
                const deliverables = Array.isArray(ws.deliverables) ? ws.deliverables : [];

                const category = ws.campaign?.category || "";
                const platform = formatPlatform(ws.campaign?.platform);
                const brandSubtitle = category && platform
                  ? `${category} • ${platform}`
                  : category
                  ? `${category} • Collaboration`
                  : platform
                  ? `${platform} • Collaboration`
                  : "Brand Partner • Collaboration";

                const campaignDescription =
                  ws.brief ||
                  ws.campaign?.description ||
                  "Collaborate with brand partner, track deliverables, and complete milestones.";

                const coverImage = ws.campaign?.coverImage || ws.campaign?.image || null;

                const bookingId =
                  typeof ws.booking === "object" && ws.booking !== null
                    ? ws.booking._id
                    : ws.booking;

                return (
                  <div
                    key={ws._id}
                    className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Brand Info, Status Badge & Menu */}
                      <div className="flex items-start justify-between gap-2.5">
                        {/* Brand Avatar & Name */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center font-heading font-bold text-sm shrink-0 shadow-2xs">
                            {brandInitial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-sans font-semibold text-foreground block truncate">
                              Brand: {brandName}
                            </span>
                            <span className="text-[11px] font-sans text-text-secondary block truncate mt-0.5">
                              {brandSubtitle}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge & Three-Dot Menu */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-sans font-bold tracking-wider capitalize border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          <button
                            type="button"
                            title="Workspace options"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-neutral-100 dark:hover:bg-surface-muted transition-colors cursor-pointer"
                          >
                            <MoreVerticalIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Campaign Title & Description */}
                      <div className="mt-3">
                        <h3 className="font-heading font-medium text-base sm:text-lg text-foreground line-clamp-1 tracking-tight group-hover:text-secondary transition-colors">
                          {campaignTitle}
                        </h3>
                        {campaignDescription && (
                          <p className="text-xs font-sans text-text-secondary line-clamp-2 leading-relaxed mt-1">
                            {campaignDescription}
                          </p>
                        )}
                      </div>

                      {/* Campaign Image Banner with Soft Fallback */}
                      {coverImage ? (
                        <div className="h-28 sm:h-32 rounded-xl overflow-hidden relative border border-neutral-100 dark:border-border-theme/40 bg-surface-muted/30 mt-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coverImage}
                            alt={campaignTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-24 sm:h-28 rounded-xl overflow-hidden relative border border-neutral-100 dark:border-border-theme/40 bg-gradient-to-br from-pink-50/90 via-rose-50/50 to-neutral-50/60 dark:from-pink-950/20 dark:via-surface-muted/30 dark:to-surface/40 flex items-center justify-center px-4 mt-3">
                          <span className="font-heading font-medium text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 line-clamp-1 tracking-wide">
                            {campaignTitle}
                          </span>
                        </div>
                      )}

                      {/* Price and Deadline Panels (Aligned 2-Column Grid) */}
                      <div className="grid grid-cols-2 gap-2 mt-3.5">
                        {/* Agreed Price Panel */}
                        <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border border-neutral-200/70 dark:border-border-theme/60 bg-neutral-50/50 dark:bg-surface-muted/20">
                          <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-black dark:text-white flex items-center justify-center text-sm font-semibold shrink-0">
                            ₹
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] sm:text-[11px] font-sans text-text-secondary block leading-tight">
                              Agreed Price
                            </span>
                            <span className="font-heading font-medium text-sm sm:text-base text-foreground block truncate tracking-tight mt-0.5">
                              {agreedPriceFormatted}
                            </span>
                          </div>
                        </div>

                        {/* Deadline Panel */}
                        <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border border-neutral-200/70 dark:border-border-theme/60 bg-neutral-50/50 dark:bg-surface-muted/20">
                          <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] sm:text-[11px] font-sans text-text-secondary block leading-tight">
                              Deadline
                            </span>
                            <span className="font-sans font-semibold text-xs sm:text-sm text-foreground block truncate mt-0.5">
                              {deadlineFormatted}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Required Deliverables Checklist */}
                      {deliverables.length > 0 && (
                        <div className="mt-3.5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-sans font-semibold text-foreground">
                              Required Deliverables ({deliverables.length})
                            </span>
                            <Link
                              href={`/creator/workspace/${ws._id}`}
                              className="text-xs font-sans font-medium text-black hover:text-neutral-700 dark:text-white dark:hover:text-neutral-300 transition-colors inline-flex items-center gap-0.5"
                            >
                              <span>View All</span>
                              <span aria-hidden="true">&rarr;</span>
                            </Link>
                          </div>

                          <div className="space-y-1.5">
                            {deliverables.slice(0, 3).map((item, idx) => {
                              const title = typeof item === "string" ? item : item?.title || "Deliverable";
                              return (
                                <div
                                  key={item?._id || idx}
                                  className="flex items-center gap-2 text-xs font-sans text-text-secondary"
                                >
                                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <CheckIcon className="w-2.5 h-2.5" />
                                  </div>
                                  <span className="line-clamp-1">{title}</span>
                                </div>
                              );
                            })}
                            {deliverables.length > 3 && (
                              <span className="text-xs font-sans font-medium text-black dark:text-white block pt-0.5">
                                + {deliverables.length - 3} more deliverables
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions: Black Primary Button & Neutral Chat Button */}
                    <div className="pt-3 mt-3 border-t border-border-theme/40 flex items-center gap-2">
                      <Link
                        href={`/creator/workspace/${ws._id}`}
                        className="group/btn flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-950 text-white text-xs font-sans font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 hover:border-neutral-800 hover:shadow-xs hover:shadow-pink-500/10 active:scale-[0.99] transition-all duration-200 ease-out dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200"
                      >
                        <span>Open Workspace</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                      </Link>
                      {bookingId && (
                        <Link
                          href={`/creator/messages?bookingId=${bookingId}`}
                          title="Message Brand"
                          className="p-2.5 rounded-xl bg-white dark:bg-surface-muted hover:bg-neutral-100 dark:hover:bg-surface-muted/80 text-text-secondary hover:text-foreground border border-neutral-200/80 dark:border-border-theme transition-all cursor-pointer shrink-0 shadow-2xs"
                        >
                          <ChatBubbleIcon className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 8. PAGINATION CONTROLS */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-text-secondary">
              <div>
                Showing Page <span className="font-semibold text-foreground">{pagination.page || currentPage}</span> of{" "}
                <span className="font-semibold text-foreground">{pagination.totalPages}</span> ({pagination.totalItems} Total Workspaces)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200/80 dark:border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-7 h-7 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                        pageNum === currentPage
                          ? "bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-2xs"
                          : "bg-surface hover:bg-surface-muted text-text-secondary border border-border-theme/70"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages || loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200/80 dark:border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
