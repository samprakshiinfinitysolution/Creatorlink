"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDiscoverCampaigns,
  fetchAppliedCampaigns,
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

function UsersIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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

function LayersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l9.75 5.25 9.75-5.25-4.179-2.25m-11.321 4.5L2.25 16.5l9.75 5.25 9.75-5.25-4.179-2.25M2.25 7.5L12 2.25l9.75 5.25L12 12.75 2.25 7.5z" />
    </svg>
  );
}

function TrendingUpIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.5 4.5 7.5-7.5M16.5 8.25H21v4.5" />
    </svg>
  );
}

function VerifiedBadgeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
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

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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

// =========================================================
// HELPER UTILITIES & CONFIG
// =========================================================
const DEFAULT_CATEGORIES = [
  "All",
  "Fashion",
  "Beauty",
  "Lifestyle",
  "Tech",
  "Fitness",
  "Food",
  "Travel",
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

const formatBudget = (amount, currency = "INR") => {
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

const STATIC_SHOWCASE_CARDS = [
  {
    id: "beauty",
    category: "Beauty",
    dotColor: "bg-pink-500",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
    fallbackGradient: "from-pink-100 to-rose-200 dark:from-pink-950/60 dark:to-rose-900/40",
    brandInitial: "G",
    brandName: "GlowLab",
    title: "Skincare Routine Reel",
    deliverables: "Instagram Reels • 3 Deliverables",
    budget: "₹15,000",
    tiltClass: "-rotate-3 sm:-rotate-4 translate-y-1 z-10 hover:rotate-0 hover:translate-y-0",
  },
  {
    id: "travel",
    category: "Travel",
    dotColor: "bg-blue-500",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80",
    fallbackGradient: "from-sky-100 to-blue-200 dark:from-sky-950/60 dark:to-blue-900/40",
    brandInitial: "V",
    brandName: "Vista Travel",
    title: "Summer Getaway Content",
    deliverables: "Instagram + YouTube • 4 Deliverables",
    budget: "₹25,000",
    tiltClass: "-rotate-0.5 -translate-y-1 z-20 hover:rotate-0 hover:-translate-y-2 shadow-lg",
  },
  {
    id: "tech",
    category: "Tech",
    dotColor: "bg-purple-500",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80",
    fallbackGradient: "from-purple-100 to-indigo-200 dark:from-purple-950/60 dark:to-indigo-900/40",
    brandInitial: "Z",
    brandName: "ZyloTech",
    title: "Product Showcase Video",
    deliverables: "YouTube Video • 2 Deliverables",
    budget: "₹8,500",
    tiltClass: "rotate-3 sm:rotate-4 translate-y-1 z-10 hover:rotate-0 hover:translate-y-0",
  },
];

export default function CreatorDiscoverCampaignsManager() {
  const dispatch = useDispatch();
  const { discoverCampaigns, discoverPagination, appliedCampaigns, loading, error } = useSelector(
    (state) => state.creatorCampaigns
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showcaseImgErrors, setShowcaseImgErrors] = useState({});
  const [failedCampaignImgUrls, setFailedCampaignImgUrls] = useState({});

  // Fetch discover campaigns and applied campaigns on mount and when filters/page change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 9,
    };

    if (selectedCategory && selectedCategory !== "All") {
      params.category = selectedCategory;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    dispatch(fetchDiscoverCampaigns(params));
    dispatch(fetchAppliedCampaigns({ limit: 100 }));
  }, [dispatch, currentPage, selectedCategory, searchQuery]);

  const campaignsList = useMemo(
    () => (Array.isArray(discoverCampaigns) ? discoverCampaigns : []),
    [discoverCampaigns]
  );

  // Dynamically compute category options based on defaults and active campaigns
  const categoryOptions = useMemo(() => {
    const dynamicSet = new Set(
      campaignsList
        .map((c) => c.category)
        .filter((cat) => Boolean(cat) && typeof cat === "string")
    );
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...dynamicSet]));
  }, [campaignsList]);

  // Build a lookup set of campaign IDs the creator has already applied to
  const appliedCampaignIds = useMemo(() => {
    return new Set(
      (Array.isArray(appliedCampaigns) ? appliedCampaigns : [])
        .map((item) => {
          if (!item) return null;
          if (typeof item.campaign === "string") return item.campaign;
          if (item.campaign && item.campaign._id) return String(item.campaign._id);
          if (item.campaignId) return String(item.campaignId);
          return null;
        })
        .filter(Boolean)
    );
  }, [appliedCampaigns]);

  // Dynamically derive active briefs count and available categories count
  const activeBriefsCount =
    discoverPagination?.totalItems !== undefined && discoverPagination.totalItems !== null
      ? discoverPagination.totalItems
      : campaignsList.length;

  const categoriesCount =
    categoryOptions.filter((cat) => cat !== "All").length || 4;

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    const params = {
      page: currentPage,
      limit: 9,
    };

    if (selectedCategory && selectedCategory !== "All") {
      params.category = selectedCategory;
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    dispatch(fetchDiscoverCampaigns(params));
    dispatch(fetchAppliedCampaigns({ limit: 100 }));
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
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          {/* 1. DISCOVER CAMPAIGNS HERO SECTION (PREMIUM CAMPAIGN-FOCUSED 2-COLUMN HERO) */}
          <div className="bg-gradient-to-br from-[#FFF0F4] via-[#FFF5F8] to-[#FFEBF2] dark:from-pink-950/25 dark:via-surface dark:to-pink-950/15 border border-[#FCE7F0] dark:border-pink-900/30 rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 lg:p-5 shadow-xs relative overflow-hidden space-y-2.5 sm:space-y-3">
            {/* Ambient Background Accents */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-pink-200/30 dark:bg-pink-900/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-rose-200/25 dark:bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

            {/* TOP ROW: Badge + Active Briefs count */}
            <div className="flex items-center gap-2 relative z-10">
              <span className="font-bold text-[11px] tracking-wider uppercase text-[#ff2d6c] dark:text-[#ff4f87] font-sans">
                Marketplace
              </span>
              <span className="text-xs sm:text-sm font-sans font-medium text-neutral-600 dark:text-text-secondary">
                • {activeBriefsCount} Active Brief{activeBriefsCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* TWO-COLUMN HERO BODY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center relative z-10">
              {/* LEFT COLUMN: Heading, Subtitle & 3 Compact Highlight Cards */}
              <div className="lg:col-span-6 xl:col-span-6 space-y-2 sm:space-y-2.5">
                <h1 className="font-serif font-medium text-2xl min-[360px]:text-3xl sm:text-3xl lg:text-[34px] xl:text-[36px] text-neutral-900 dark:text-white tracking-tight leading-[1.1] break-words">
                  Discover Campaigns
                </h1>
                <p className="text-xs sm:text-xs lg:text-sm text-neutral-600 dark:text-neutral-300 font-sans max-w-lg leading-relaxed">
                  Find the right brand partnerships and turn your creativity into paid collaborations.
                </p>

                {/* 3 Compact Highlight Cards */}
                <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1 sm:pt-1.5">
                  {/* Card 1: Active Briefs */}
                  <div className="bg-white/95 dark:bg-surface/90 backdrop-blur-xs border border-pink-100/80 dark:border-border-theme rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 shadow-2xs">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFEBF2] dark:bg-pink-950/60 text-black dark:text-white flex items-center justify-center shrink-0">
                      <MegaphoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-base font-bold text-neutral-900 dark:text-white leading-tight">
                        {activeBriefsCount}
                      </div>
                      <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-sans truncate">
                        Active Briefs
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Categories */}
                  <div className="bg-white/95 dark:bg-surface/90 backdrop-blur-xs border border-pink-100/80 dark:border-border-theme rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 shadow-2xs">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFEBF2] dark:bg-pink-950/60 text-black dark:text-white flex items-center justify-center shrink-0">
                      <LayersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-base font-bold text-neutral-900 dark:text-white leading-tight">
                        {categoriesCount}
                      </div>
                      <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-sans truncate">
                        Categories
                      </div>
                    </div>
                  </div>

                  {/* Card 3: New Opportunities */}
                  <div className="min-[360px]:col-span-2 sm:col-span-1 bg-white/95 dark:bg-surface/90 backdrop-blur-xs border border-pink-100/80 dark:border-border-theme rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 shadow-2xs">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFEBF2] dark:bg-pink-950/60 text-black dark:text-white flex items-center justify-center shrink-0">
                      <TrendingUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-base font-bold text-neutral-900 dark:text-white leading-tight">
                        New
                      </div>
                      <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-sans truncate">
                        Opportunities weekly
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: ELEGANT STATIC CAMPAIGN SHOWCASE (BEAUTY, TRAVEL, TECH) */}
              <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center py-0.5 sm:py-1 relative w-full max-w-full overflow-hidden sm:overflow-visible">
                {/* Decorative Sparkle 1 (Top Center-Left) */}
                <div className="absolute top-0.5 left-2 sm:left-12 text-black dark:text-white pointer-events-none">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
                  </svg>
                </div>

                {/* Decorative Sparkle 2 (Bottom Left) */}
                <div className="absolute bottom-0.5 left-4 sm:left-24 text-black dark:text-white pointer-events-none">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
                  </svg>
                </div>

                {/* Decorative Sparkle 3 (Top Right) */}
                <div className="absolute top-0.5 right-2 sm:right-6 text-black dark:text-white pointer-events-none">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
                  </svg>
                </div>

                {/* Decorative Subtle Swoosh / Accent Arc */}
                <svg
                  className="absolute -bottom-2 right-1 sm:right-4 w-28 sm:w-36 h-10 text-neutral-400/40 dark:text-neutral-500/40 pointer-events-none"
                  fill="none"
                  viewBox="0 0 180 50"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M10 45 C 50 10, 120 50, 170 15" strokeLinecap="round" />
                </svg>

                {/* Three Overlapping Static Showcase Cards Container */}
                <div className="relative flex items-center justify-center scale-[0.74] min-[360px]:scale-[0.82] min-[390px]:scale-[0.90] sm:scale-95 lg:scale-100 origin-center transition-transform my-[-14px] min-[360px]:my-[-8px] min-[390px]:my-[-4px] sm:my-0">
                  {STATIC_SHOWCASE_CARDS.map((card, idx) => (
                    <div
                      key={card.id}
                      className={`w-32 min-[360px]:w-36 sm:w-38 lg:w-40 shrink-0 bg-white dark:bg-surface border border-pink-100/90 dark:border-border-theme rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-[0_6px_18px_rgba(255,45,108,0.06)] dark:shadow-none select-none transition-all duration-300 ease-out cursor-default ${idx > 0 ? "-ml-5 sm:-ml-6" : ""
                        } ${card.tiltClass}`}
                    >
                      {/* Visual Card Image Banner with Category Pill */}
                      <div className="relative h-20 sm:h-22 lg:h-24 rounded-lg sm:rounded-xl overflow-hidden mb-1.5 bg-neutral-100 dark:bg-surface-muted">
                        <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-semibold bg-white/95 dark:bg-surface/90 text-neutral-800 dark:text-neutral-200 shadow-2xs flex items-center gap-1 backdrop-blur-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`} />
                          {card.category}
                        </span>

                        {!showcaseImgErrors[card.id] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover"
                            onError={() =>
                              setShowcaseImgErrors((prev) => ({ ...prev, [card.id]: true }))
                            }
                          />
                        ) : (
                          <div
                            className={`w-full h-full bg-gradient-to-br ${card.fallbackGradient} flex items-center justify-center`}
                          >
                            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                              {card.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Brand Info Row */}
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-neutral-900 text-white text-[8px] sm:text-[9px] font-bold flex items-center justify-center shrink-0">
                          {card.brandInitial}
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-900 dark:text-white truncate">
                          {card.brandName}
                        </span>
                        <VerifiedBadgeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E11D48] shrink-0" />
                      </div>

                      {/* Campaign Title */}
                      <h4 className="text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-white truncate leading-snug">
                        {card.title}
                      </h4>

                      {/* Deliverables Meta */}
                      <p className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 font-sans truncate mt-0.5 mb-1.5">
                        {card.deliverables}
                      </p>

                      {/* Footer Row: Price & Circular Arrow Button */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-border-theme/40">
                        <span className="text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-white">
                          {card.budget}
                        </span>
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-pink-100/70 dark:bg-pink-950/60 text-black dark:text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          →
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Floating Click Cursor Accent */}
                  <div className="absolute right-0 sm:-right-1 top-1/2 -translate-y-2 z-30 pointer-events-none drop-shadow-md">
                    <svg
                      className="w-4 h-4 text-black fill-black dark:text-white dark:fill-white stroke-white dark:stroke-black stroke-[1.5]"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 3l16 7-7.5 2.5L10 20z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SEARCH & CATEGORY FILTERS SECTION */}
          <div className="bg-surface border border-border-theme rounded-2xl p-3 sm:p-4 shadow-xs space-y-3 sm:space-y-4">
            {/* Category Navigation Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar py-3">
              {categoryOptions.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-neutral-950 text-white font-semibold shadow-xs dark:bg-neutral-100 dark:text-neutral-950"
                        : "bg-surface-muted text-text-secondary hover:text-foreground hover:bg-surface-muted/80 border border-border-theme/60"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Clean Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <SearchIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search briefs..."
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
                <span>{typeof error === "string" ? error : "Failed to load discover campaigns."}</span>
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

          {/* 4. LOADING SKELETON STATE */}
          {loading && campaignsList.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl sm:rounded-3xl p-5 space-y-3.5 shadow-xs animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-surface-muted rounded-full w-20" />
                    <div className="h-5 bg-surface-muted rounded-full w-16" />
                  </div>
                  <div className="h-28 bg-surface-muted rounded-xl w-full" />
                  <div className="h-5 bg-surface-muted rounded-md w-3/4" />
                  <div className="h-4 bg-surface-muted rounded-md w-full" />
                  <div className="h-10 bg-surface-muted rounded-xl w-full" />
                  <div className="h-8 bg-surface-muted rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : campaignsList.length > 0 ? (
            /* 5. CAMPAIGNS GRID (3 columns desktop, 2 tablet, 1 mobile) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {campaignsList.map((campaign) => {
                const campaignId = String(campaign._id || campaign.id);
                const isApplied = appliedCampaignIds.has(campaignId);
                const brandName = campaign.brand?.name || "Brand Partner";
                const brandInitial = brandName.charAt(0).toUpperCase() || "B";

                const validDeliverables = Array.isArray(campaign.deliverables)
                  ? campaign.deliverables.map(formatDeliverableItem).filter(Boolean)
                  : [];

                return (
                  <div
                    key={campaignId}
                    className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme hover:border-pink-200/90 dark:hover:border-pink-500/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_2px_12px_rgba(255,45,108,0.03)] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      {/* Top Row: Category (Pink Text) & Applied Badge (Left), Platform (Right) - Clean Text Without Pill Outlines */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase text-pink-500 dark:text-pink-400 truncate max-w-[130px]">
                            {campaign.category || "General"}
                          </span>

                          {isApplied && (
                            <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                              Applied
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase flex items-center gap-1 text-neutral-600 dark:text-neutral-300 shrink-0">
                          <PlatformIcon platform={campaign.platform} className="w-3.5 h-3.5 shrink-0" />
                          <span>{formatPlatform(campaign.platform)}</span>
                        </span>
                      </div>

                      {/* Campaign Visual Banner with Subtle Ambient Fallback */}
                      <div className="h-28 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden relative border border-neutral-100 dark:border-border-theme/40 bg-surface-muted/60 dark:bg-surface-muted/20">
                        {(campaign.coverImage || campaign.image) && !failedCampaignImgUrls[campaign._id || campaign.id] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={campaign.coverImage || campaign.image}
                            alt={campaign.title || "Campaign brief banner"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={() =>
                              setFailedCampaignImgUrls((prev) => ({
                                ...prev,
                                [campaign._id || campaign.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-pink-100/70 via-rose-50/50 to-amber-50/40 dark:from-pink-950/40 dark:via-purple-950/20 dark:to-surface-muted/40 flex items-center justify-center">
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-pink-200/40 dark:bg-pink-600/10 blur-xl pointer-events-none" />
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-rose-200/30 dark:bg-rose-600/10 blur-xl pointer-events-none" />
                            <div className="text-center px-3 relative z-10 opacity-70">
                              <span className="font-sans font-medium text-xs sm:text-sm text-foreground/80 tracking-wide line-clamp-1">
                                {campaign.title || "Brand Brief"}
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
                            {brandName}
                          </span>
                        </div>
                      </div>

                      {/* Campaign Title & Brand */}
                      <div>
                        <h2 className="font-sans font-semibold text-base sm:text-lg text-black dark:text-white line-clamp-2 sm:line-clamp-1 group-hover:text-black dark:group-hover:text-white transition-colors tracking-tight break-words">
                          {campaign.title}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-[8px] font-sans font-semibold shrink-0">
                            {brandInitial}
                          </div>
                          <span className="text-xs font-sans text-text-secondary truncate">
                            by {brandName}
                          </span>
                        </div>
                      </div>

                      {/* Concise Description */}
                      <p className="text-xs font-sans text-text-secondary line-clamp-2 leading-normal">
                        {campaign.description || "No description provided for this brief."}
                      </p>

                      {/* Compact Blush-Pink Budget Panel */}
                      <div className="p-2.5 sm:p-3 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100/70 dark:border-pink-900/40 flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-100/70 dark:bg-pink-900/40 border border-pink-200/60 dark:border-pink-800/40 flex items-center justify-center text-black dark:text-white shrink-0">
                          <MoneyBagIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] sm:text-[11px] font-sans font-medium text-text-secondary block leading-none mb-0.5">
                            Campaign Budget
                          </span>
                          <span className="font-sans font-bold text-lg min-[360px]:text-xl sm:text-2xl text-foreground tabular-nums tracking-tight leading-none block truncate">
                            {formatBudget(campaign.budget, campaign.currency || "INR")}
                          </span>
                        </div>
                      </div>

                      {/* Aligned Specs: End Date & Required Creators */}
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs font-sans text-text-secondary">
                        <div className="flex items-center gap-1.5 sm:gap-2 p-2 rounded-xl border border-neutral-100 dark:border-border-theme/60 bg-neutral-50/50 dark:bg-surface-muted/20 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                            <ClockIcon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] sm:text-[10px] text-text-secondary font-medium block leading-tight">
                              End Date
                            </span>
                            <span className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-semibold text-foreground block truncate leading-tight mt-0.5">
                              {formatDate(campaign.deadline)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 p-2 rounded-xl border border-neutral-100 dark:border-border-theme/60 bg-neutral-50/50 dark:bg-surface-muted/20 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                            <UsersIcon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] sm:text-[10px] text-text-secondary font-medium block leading-tight">
                              Creators
                            </span>
                            <span className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-semibold text-foreground block truncate leading-tight mt-0.5">
                              {campaign.requiredCreators || 1} Needed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Deliverables List */}
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
                                <span className="truncate max-w-[130px] min-[360px]:max-w-[190px]">{itemText}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Action: Full-Width Pink Button */}
                    <div className="pt-3 mt-2 border-t border-border-theme/40">

                      <Link
                        href={`/creator/campaigns/${campaignId}`}


                        className="group/button w-full inline-flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-neutral-950 text-white text-xs font-sans font-semibold tracking-wide border border-neutral-800 shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:border-neutral-700 hover:shadow-[0_5px_16px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:shadow-[0_3px_8px_rgba(0,0,0,0.08)] dark:hover:border-neutral-300"


                      >
                        <span>View Campaign</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </Link>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 6. EMPTY STATE */
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 border border-pink-100 dark:border-pink-900/40 flex items-center justify-center mx-auto">
                <MegaphoneIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-medium text-xl text-foreground">
                  {selectedCategory === "All" && !searchQuery
                    ? "No campaigns available"
                    : "No matching campaigns found"}
                </h3>
                <p className="text-xs text-text-secondary font-sans max-w-xs mx-auto leading-relaxed">
                  {selectedCategory === "All" && !searchQuery
                    ? "There are currently no active discoverable briefs. Check back soon for new brand collaborations."
                    : "No briefs match your current filter criteria. Try adjusting your search term or select another category."}
                </p>
              </div>
              {(selectedCategory !== "All" || searchQuery) && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("All");
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 text-white font-sans text-xs font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 hover:border-neutral-800 hover:shadow-xs hover:shadow-pink-500/10 active:scale-[0.99] transition-all duration-200 ease-out cursor-pointer dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200"
                  >
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 7. PAGINATION BAR */}
          {discoverPagination && discoverPagination.totalPages > 1 && (
            <div className="bg-white dark:bg-surface border border-neutral-200/80 dark:border-border-theme rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-text-secondary">
              <div className="text-center sm:text-left">
                Showing Page <span className="font-semibold text-foreground">{discoverPagination.page}</span> of{" "}
                <span className="font-semibold text-foreground">{discoverPagination.totalPages}</span> ({discoverPagination.totalItems} Total Campaigns)
              </div>

              <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={discoverPagination.page <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200/80 dark:border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon /> Previous
                </button>
                <button
                  type="button"
                  disabled={discoverPagination.page >= discoverPagination.totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, discoverPagination.totalPages))}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200/80 dark:border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
