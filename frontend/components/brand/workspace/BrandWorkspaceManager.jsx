"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrandWorkspaces } from "@/redux/brand/workspace/workspace_slice";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";

// =========================================================
// SVG ICONS
// =========================================================
function WorkspaceIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.375l2.25-7.5A2.25 2.25 0 014.26 4.5h15.48a2.25 2.25 0 012.19 1.875l2.25 7.5m-19.5 0v5.625c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V13.875" />
    </svg>
  );
}

function ClipboardDocumentCheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function BanknotesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0v8.25m0 0h.75a.75.75 0 01.75.75v.75m16.5-10.5h-.75a.75.75 0 01-.75-.75v-.75m0 0v11.25m0 0a60.07 60.07 0 01-15.797 2.101M21.75 6v10.5m-18 0h18" />
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

function StarIcon({ className = "w-4 h-4", filled = true }) {
  return (
    <svg
      className={className}
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
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
        color: "text-amber-600 dark:text-amber-400",
      };
    case "submitted":
      return {
        label: "Submitted",
        color: "text-purple-600 dark:text-purple-400",
      };
    case "revision_requested":
      return {
        label: "Revision Requested",
        color: "text-rose-600 dark:text-rose-400",
      };
    case "completed":
      return {
        label: "Completed",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "text-neutral-600 dark:text-neutral-400",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Active",
        color: "text-neutral-600 dark:text-neutral-400",
      };
  }
};

export default function BrandWorkspaceManager() {
  const dispatch = useDispatch();
  const { workspaces, pagination, summary, loading, error } = useSelector(
    (state) => state.brandWorkspace
  );
  const { workspaceReview, workspaceReviewWorkspaceId } = useSelector(
    (state) => state.brandReviews || {}
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [failedCoverUrls, setFailedCoverUrls] = useState({});
  const [failedCreatorAvatars, setFailedCreatorAvatars] = useState({});

  // Fetch workspaces when page or status tab changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 9,
    };
    if (activeTab !== "All") {
      params.status = activeTab;
    }
    dispatch(fetchBrandWorkspaces(params));
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
    dispatch(fetchBrandWorkspaces(params));
  };

  const handlePageChange = (newPage) => {
    const totalPages = pagination?.totalPages || pagination?.pages || 1;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Compute live summary statistics from backend aggregate summary (unfiltered dataset)
  const totalCount =
    typeof summary?.total === "number"
      ? summary.total
      : activeTab === "All" && typeof pagination?.totalItems === "number"
      ? pagination.totalItems
      : workspaces.length;

  const inProgressCount =
    typeof summary?.inProgress === "number"
      ? summary.inProgress
      : workspaces.filter(
          (w) =>
            w.status === "in_progress" ||
            w.status === "submitted" ||
            w.status === "revision_requested"
        ).length;

  const completedCount =
    typeof summary?.completed === "number"
      ? summary.completed
      : workspaces.filter((w) => w.status === "completed").length;

  const cancelledCount =
    typeof summary?.cancelled === "number"
      ? summary.cancelled
      : workspaces.filter((w) => w.status === "cancelled").length;

  const totalPages = pagination?.totalPages || pagination?.pages || 1;
  const totalItems = pagination?.totalItems || pagination?.total || workspaces.length;

  // Search filter applied on top of the active workspace list
  const displayedWorkspaces = workspaces.filter((ws) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const title = (ws.campaign?.title || "").toLowerCase();
    const creator = (ws.creator?.name || ws.creator?.email || "").toLowerCase();
    const category = (ws.campaign?.category || "").toLowerCase();
    const brief = (ws.brief || "").toLowerCase();
    return (
      title.includes(q) ||
      creator.includes(q) ||
      category.includes(q) ||
      brief.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* 1. HERO SECTION WITH CAMPAIGN REVIEW & APPROVAL OVERSIGHT & METRICS */}
          <div className="bg-gradient-to-r from-[#fff5f8] via-[#fffbfd] to-[#fff0f5] dark:bg-gradient-to-r dark:from-surface dark:via-surface dark:to-pink-950/20 border border-pink-100/90 dark:border-pink-900/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_24px_rgba(255,45,108,0.05)] relative overflow-hidden space-y-3.5 sm:space-y-4">
            {/* Ambient Soft Blush Background Accents */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-pink-200/25 dark:bg-pink-900/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 right-1/4 w-60 h-60 bg-rose-200/20 dark:bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Row: Heading on Left & Campaign Review & Approval Visual on Right */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
              {/* Left Column: Heading moved up & aligned to top */}
              <div className="max-w-xl space-y-1.5 pt-0.5">
                <div>
                  <span className="font-bold text-[11px] tracking-wider uppercase text-[#ff2d6c] dark:text-[#ff4f87] font-sans">
                    BRAND WORKSPACE
                  </span>
                </div>

                <h1 className="font-serif font-medium text-2xl sm:text-3xl lg:text-4xl text-neutral-950 dark:text-white tracking-tight">
                  Collaboration Workspaces
                </h1>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Monitor creator deliverables, review submitted content, and approve campaigns.
                </p>
              </div>

              {/* Right Column: Premium Campaign Review & Approval Lifecycle Visual */}
              <div className="flex items-center justify-center lg:justify-end w-full lg:w-auto shrink-0 select-none">
                <div className="w-full sm:w-[360px] lg:w-[390px] bg-white/95 dark:bg-surface/95 backdrop-blur-sm border border-neutral-200/80 dark:border-border-theme rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-border-theme pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-sans">
                        Campaign Review &amp; Approval
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-text-secondary bg-neutral-100 dark:bg-surface-muted px-2 py-0.5 rounded-full">
                      Lifecycle
                    </span>
                  </div>

                  {/* Stages List */}
                  <div className="relative pl-2 space-y-3 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-100 dark:before:bg-neutral-800">
                    {/* Stage 1: Review Queue */}
                    <div className="relative flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-surface">
                          <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white block leading-tight">
                            Review Queue
                          </span>
                          <span className="text-[10px] text-text-secondary truncate block leading-tight mt-0.5">
                            Draft inspection &amp; revision requests
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 shrink-0 border border-amber-200/60 dark:border-amber-800/60">
                        Stage 1
                      </span>
                    </div>

                    {/* Stage 2: Quality Sign-off */}
                    <div className="relative flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-surface">
                          <ShieldCheckIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white block leading-tight">
                            Quality Sign-off
                          </span>
                          <span className="text-[10px] text-text-secondary truncate block leading-tight mt-0.5">
                            Final asset &amp; deliverable sign-off
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                        Stage 2
                      </span>
                    </div>

                    {/* Stage 3: Payment Release */}
                    <div className="relative flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-surface">
                          <BanknotesIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white block leading-tight">
                            Payment Release
                          </span>
                          <span className="text-[10px] text-text-secondary truncate block leading-tight mt-0.5">
                            Secure escrow settlement &amp; rating
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 shrink-0 border border-neutral-200/80 dark:border-border-theme">
                        Stage 3
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: 4 Statistics Cards Integrated Inside Hero Section */}
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-4 border-t border-pink-100/90 dark:border-pink-900/30">
              {/* Total Workspaces (Neutral) */}
              <div className="bg-white/95 dark:bg-surface/90 backdrop-blur-xs border border-neutral-200/70 dark:border-border-theme rounded-xl sm:rounded-2xl py-2.5 px-3 sm:py-3 sm:px-4 shadow-2xs flex items-center gap-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 flex items-center justify-center shrink-0">
                  <WorkspaceIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-sans text-text-secondary block leading-none mb-1">
                    Total Workspaces
                  </span>
                  <span className="font-sans font-bold text-xl sm:text-2xl text-foreground tabular-nums tracking-tight leading-none block">
                    {totalCount}
                  </span>
                </div>
              </div>

              {/* In Progress (Amber) */}
              <div className="bg-white/95 dark:bg-surface/90 backdrop-blur-xs border border-neutral-200/70 dark:border-border-theme rounded-xl sm:rounded-2xl py-2.5 px-3 sm:py-3 sm:px-4 shadow-2xs flex items-center gap-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ClockIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-2" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-sans text-text-secondary block leading-none mb-1">
                    In Progress
                  </span>
                  <span className="font-sans font-bold text-xl sm:text-2xl text-foreground tabular-nums tracking-tight leading-none block">
                    {inProgressCount}
                  </span>
                </div>
              </div>

              {/* Completed (Emerald) */}
              <div className="bg-white/95 dark:bg-surface/90 backdrop-blur-xs border border-neutral-200/70 dark:border-border-theme rounded-xl sm:rounded-2xl py-2.5 px-3 sm:py-3 sm:px-4 shadow-2xs flex items-center gap-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircleIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-2" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-sans text-text-secondary block leading-none mb-1">
                    Completed
                  </span>
                  <span className="font-sans font-bold text-xl sm:text-2xl text-foreground tabular-nums tracking-tight leading-none block">
                    {completedCount}
                  </span>
                </div>
              </div>

              {/* Cancelled (Muted Neutral) */}
              <div className="bg-white/95 dark:bg-surface/90 backdrop-blur-xs border border-neutral-200/70 dark:border-border-theme rounded-xl sm:rounded-2xl py-2.5 px-3 sm:py-3 sm:px-4 shadow-2xs flex items-center gap-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-400 flex items-center justify-center shrink-0">
                  <XCircleIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-2" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-sans text-text-secondary block leading-none mb-1">
                    Cancelled
                  </span>
                  <span className="font-sans font-bold text-xl sm:text-2xl text-foreground tabular-nums tracking-tight leading-none block">
                    {cancelledCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. STATUS FILTERS & SEARCH CONTAINER */}
          <div className="bg-surface border border-border-theme rounded-2xl p-3 sm:p-4 shadow-xs space-y-3 sm:space-y-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar py-3">
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search workspaces by campaign, creator, or brief..."
                className="w-full text-xs pl-10 pr-9 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-foreground cursor-pointer text-xs"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 3. ERROR BANNER */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <span>{typeof error === "string" ? error : "Failed to load brand workspaces."}</span>
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

          {/* 4. LOADING SKELETON STATE */}
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
            /* 5. EMPTY STATE */
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 border border-pink-100 dark:border-pink-900/40 flex items-center justify-center mx-auto">
                <BriefcaseIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-semibold text-lg text-foreground tracking-tight">
                  {searchQuery.trim() ? "No workspaces found" : "No workspaces yet"}
                </h3>
                <p className="text-xs text-text-secondary font-sans max-w-sm mx-auto leading-relaxed">
                  {searchQuery.trim()
                    ? totalPages > 1
                      ? `No workspaces matching "${searchQuery.trim()}" found on page ${currentPage}. Try navigating other pages or clearing search.`
                      : `No workspaces match your search query "${searchQuery.trim()}". Try searching with a different campaign or creator term.`
                    : activeTab !== "All"
                    ? `You currently have no active workspaces with status "${STATUS_TABS.find((t) => t.id === activeTab)?.label || activeTab}".`
                    : "Once you accept a creator application or booking proposal, the collaboration workspace will appear here."}
                </p>
              </div>
              {(searchQuery.trim() || activeTab !== "All") && (
                <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border-theme hover:bg-surface-muted text-foreground font-sans text-xs font-semibold tracking-wide transition-all shadow-2xs cursor-pointer"
                    >
                      <span>Clear Search</span>
                    </button>
                  )}
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
            /* 6. WORKSPACE CARDS GRID (3 cols desktop, 2 cols tablet, 1 col mobile) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {displayedWorkspaces.map((ws) => {
                const badge = getStatusBadge(ws.status);
                const creatorName = ws.creator?.name || ws.creator?.email || "Creator Partner";
                const creatorInitial = (creatorName.charAt(0) || "C").toUpperCase();
                const creatorPhoto = ws.creator?.profileImage || ws.creator?.avatar || ws.creator?.image || null;
                const showCreatorPhoto = Boolean(creatorPhoto) && !failedCreatorAvatars[ws._id];
                const campaignTitle = ws.campaign?.title || ws.service?.title || "Campaign Workspace";
                const agreedPriceFormatted = formatPrice(ws.agreedPrice, ws.currency);
                const deadlineFormatted = formatDate(ws.deadline);
                const deliverables = Array.isArray(ws.deliverables) ? ws.deliverables : [];

                const category = ws.campaign?.category || "";
                const platform = formatPlatform(ws.campaign?.platform);
                const creatorSubtitle = category && platform
                  ? `${category} • ${platform}`
                  : category
                  ? `${category} • Collaboration`
                  : platform
                  ? `${platform} • Collaboration`
                  : "Creator Partner • Collaboration";

                const coverImage = ws.campaign?.coverImage || ws.campaign?.image || null;

                const bookingId =
                  typeof ws.booking === "object" && ws.booking !== null
                    ? ws.booking._id
                    : ws.booking;

                const isMatchingReduxReview =
                  workspaceReview &&
                  String(workspaceReviewWorkspaceId) === String(ws._id) &&
                  Number.isInteger(Number(workspaceReview.rating));

                const wsReview =
                  ws.review && typeof ws.review === "object" && Number.isInteger(Number(ws.review.rating))
                    ? ws.review
                    : isMatchingReduxReview
                    ? workspaceReview
                    : null;

                return (
                  <div
                    key={ws._id}
                    className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Creator Info, Status Badge & Menu */}
                      <div className="flex items-start justify-between gap-2.5">
                        {/* Creator Avatar & Name */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center font-sans font-semibold text-sm shrink-0 shadow-2xs overflow-hidden">
                            {showCreatorPhoto ? (
                              <img
                                src={creatorPhoto}
                                alt={creatorName}
                                className="w-full h-full object-cover"
                                onError={() =>
                                  setFailedCreatorAvatars((prev) => ({
                                    ...prev,
                                    [ws._id]: true,
                                  }))
                                }
                              />
                            ) : (
                              creatorInitial
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-sans font-semibold text-foreground block truncate">
                              Creator: {creatorName}
                            </span>
                            <span className="text-[11px] font-sans text-text-secondary block truncate mt-0.5">
                              {creatorSubtitle}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`text-[10px] sm:text-[11px] font-sans font-bold tracking-wider capitalize ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          {ws.status === "completed" && wsReview?.rating && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              title={wsReview.comment ? `Feedback: "${wsReview.comment}"` : "Rated by you"}
                            >
                              <StarIcon className="w-3 h-3 text-amber-500 shrink-0" filled={true} />
                              <span>Reviewed ({wsReview.rating}★)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Campaign Title */}
                      <h3 className="font-sans font-semibold text-base text-foreground line-clamp-1 mt-2.5 tracking-tight">
                        {campaignTitle}
                      </h3>

                      {/* Campaign Cover Image or Title Banner */}
                      {coverImage && !failedCoverUrls[ws._id] ? (
                        <div className="h-24 sm:h-28 rounded-xl overflow-hidden relative border border-neutral-100 dark:border-border-theme/40 mt-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coverImage}
                            alt={campaignTitle}
                            className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                            onError={() =>
                              setFailedCoverUrls((prev) => ({
                                ...prev,
                                [ws._id]: true,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <div className="h-24 sm:h-28 rounded-xl overflow-hidden relative border border-neutral-100 dark:border-border-theme/40 bg-gradient-to-br from-pink-50/90 via-rose-50/50 to-neutral-50/60 dark:from-pink-950/20 dark:via-surface-muted/30 dark:to-surface/40 flex items-center justify-center px-4 mt-3">
                          <span className="font-sans font-medium text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 line-clamp-1 tracking-wide">
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
                            <span className="font-sans font-semibold text-sm sm:text-base text-foreground block truncate tracking-tight mt-0.5">
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
                              href={`/brand/workspace/${ws._id}`}
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
                                  <div className="w-4 h-4 rounded-full bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
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
                        href={`/brand/workspace/${ws._id}`}
                        className="group/btn flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-950 text-white text-xs font-sans font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 hover:border-neutral-800 hover:shadow-xs hover:shadow-pink-500/10 active:scale-[0.99] transition-all duration-200 ease-out dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200"
                      >
                        <span>Manage Workspace</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                      </Link>
                      {bookingId && (
                        <Link
                          href={`/brand/messages?bookingId=${bookingId}`}
                          title="Message Creator"
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

          {/* 7. PAGINATION CONTROLS */}
          {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-theme pt-4 text-xs">
              <span className="text-text-secondary">
                {searchQuery.trim() ? (
                  <>
                    Showing <span className="font-semibold text-foreground">{displayedWorkspaces.length}</span> matching{" "}
                    {displayedWorkspaces.length === 1 ? "workspace" : "workspaces"} on Page{" "}
                    <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalPages}</span>
                  </>
                ) : (
                  <>
                    Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalPages}</span> ({totalItems} total)
                  </>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="p-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                        pageNum === currentPage
                          ? "bg-neutral-950 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-950"
                          : "bg-surface hover:bg-surface-muted text-text-secondary border border-border-theme"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="p-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
