"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandCreatorDetailModal from "@/components/brand/creators/BrandCreatorDetailModal";
import {
  fetchBrandCreators,
  clearSelectedCreator,
} from "@/redux/brand/creators/creators_slice";

// =========================================================
// SVG ICONS
// =========================================================
function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function StarIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function UsersIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.999-3.199a5.971 5.971 0 00-.94 3.199m0 0A5.995 5.995 0 0012 12.75m0 0A5.995 5.995 0 0117.058 15.52M12 9a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    </svg>
  );
}

function ArrowPathIcon({ className = "w-4 h-4" }) {
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

function CheckBadgeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
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

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// =========================================================
// HELPER FORMATTERS
// =========================================================
function formatFollowers(num) {
  if (num === undefined || num === null || isNaN(Number(num))) return "0";
  const val = Number(num);
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return val.toLocaleString("en-IN");
}

function formatStartingPrice(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
    return null;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function getInitials(name) {
  if (!name || typeof name !== "string" || !name.trim()) return "CR";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

// =========================================================
// FILTER CONFIGURATIONS (Aligned with Backend Support)
// =========================================================
const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "Fashion", label: "Fashion" },
  { value: "Beauty", label: "Beauty" },
  { value: "Lifestyle", label: "Lifestyle" },
  { value: "Tech", label: "Tech" },
  { value: "Fitness", label: "Fitness" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Travel", label: "Travel" },
  { value: "Gaming", label: "Gaming" },
];

const PLATFORM_OPTIONS = [
  { value: "", label: "All Platforms" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "website", label: "Website" },
];

const SORT_OPTIONS = [
  { value: "followerCount", label: "Most Followers" },
  { value: "engagementRate", label: "Highest Engagement" },
  { value: "rating", label: "Highest Rated" },
  { value: "minPrice", label: "Starting Price" },
  { value: "createdAt", label: "Recently Joined" },
  { value: "name", label: "Name (A-Z)" },
];

// =========================================================
// CREATOR CARD COMPONENT
// =========================================================
function CreatorCard({ creator, onViewProfile }) {
  const [imgError, setImgError] = useState(false);

  const name = creator.user?.name || "Creator";
  const initials = getInitials(name);
  const isVerified = Boolean(creator.user?.isVerified);
  const location = creator.location || "Global";
  const category = creator.category || "General";
  const bio = creator.bio || "Content Creator & Collaborator";
  const followersStr = formatFollowers(creator.followerCount);
  const engagement = typeof creator.engagementRate === "number" ? `${creator.engagementRate}%` : "0%";
  const hasRating = typeof creator.rating === "number" && creator.rating > 0;
  const ratingStr = hasRating ? `${creator.rating}` : "New";
  const reviewCount = creator.reviewCount || 0;
  const priceFormatted = formatStartingPrice(creator.minPrice);
  const servicesCount = Array.isArray(creator.services) ? creator.services.length : 0;
  const portfolioCount = Array.isArray(creator.portfolio) ? creator.portfolio.length : 0;

  return (
    <div className="bg-surface border border-border-theme hover:border-secondary/40 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Header: Avatar + Name + Category */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="relative w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-surface-muted border border-border-theme flex items-center justify-center font-bold text-sm text-text-secondary">
            {!imgError && creator.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creator.profileImage}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground text-sm font-sans truncate" title={name}>
                {name}
              </h3>
              {isVerified && (
                <span className="text-secondary shrink-0" title="Verified Creator">
                  <CheckBadgeIcon />
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary/10 text-secondary border border-secondary/20 truncate max-w-[120px]">
                {category}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-text-secondary truncate">
                <MapPinIcon />
                <span className="truncate">{location}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
          {bio}
        </p>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-muted/60 border border-border-theme mb-4 text-center">
          <div>
            <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-wider">Followers</span>
            <span className="font-bold text-foreground text-xs mt-0.5 block">{followersStr}</span>
          </div>
          <div className="border-x border-border-theme">
            <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-wider">Engagement</span>
            <span className="font-bold text-foreground text-xs mt-0.5 block">{engagement}</span>
          </div>
          <div>
            <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-wider">Rating</span>
            <span className="font-bold text-foreground text-xs mt-0.5 flex items-center justify-center gap-1">
              {hasRating ? (
                <>
                  <span className="text-amber-500"><StarIcon /></span>
                  <span>{ratingStr}</span>
                  {reviewCount > 0 && <span className="text-[10px] text-text-secondary font-normal">({reviewCount})</span>}
                </>
              ) : (
                <span className="text-secondary font-semibold">New</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Starting Price & Services / Portfolio count */}
      <div className="pt-3 border-t border-border-theme flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-text-secondary block font-medium">Starting from</span>
          <span className="font-semibold text-foreground text-xs">
            {priceFormatted ? priceFormatted : "Custom Quote"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
          {servicesCount > 0 && <span>{servicesCount} {servicesCount === 1 ? "Service" : "Services"}</span>}
          {servicesCount > 0 && portfolioCount > 0 && <span>•</span>}
          {portfolioCount > 0 && <span>{portfolioCount} Works</span>}
        </div>
      </div>

      {/* View Profile Action Button */}
      <div className="pt-3 border-t border-border-theme/60 mt-3">
        <button
          type="button"
          onClick={() => onViewProfile && onViewProfile(creator._id || creator.id)}
          className="w-full py-2 px-3 rounded-xl bg-surface-muted hover:bg-secondary text-text-secondary hover:text-white border border-border-theme hover:border-secondary font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs group-hover:border-secondary/40"
        >
          <EyeIcon className="w-3.5 h-3.5" />
          <span>View Profile</span>
        </button>
      </div>
    </div>
  );
}

// =========================================================
// SKELETON CARD COMPONENT
// =========================================================
function CreatorCardSkeleton() {
  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs animate-pulse flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-xl bg-surface-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-muted rounded w-2/3" />
            <div className="h-3 bg-surface-muted rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-1.5 mb-4">
          <div className="h-3 bg-surface-muted rounded w-full" />
          <div className="h-3 bg-surface-muted rounded w-4/5" />
        </div>
        <div className="h-12 bg-surface-muted rounded-xl mb-4" />
      </div>
      <div className="pt-3 border-t border-border-theme flex items-center justify-between">
        <div className="h-4 bg-surface-muted rounded w-24" />
        <div className="h-3 bg-surface-muted rounded w-16" />
      </div>
    </div>
  );
}

// =========================================================
// MAIN DISCOVERY MANAGER
// =========================================================
export default function BrandCreatorsManager() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detail Modal state
  const [selectedCreatorId, setSelectedCreatorId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Local filter states
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [sortBy, setSortBy] = useState("followerCount");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();
  const { creators, pagination, loading, error } = useSelector(
    (state) => state.brandCreators || {}
  );

  const handleOpenDetailModal = (creatorId) => {
    setSelectedCreatorId(creatorId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCreatorId(null);
    dispatch(clearSelectedCreator());
  };

  // Single-source API fetch effect triggered by state changes
  useEffect(() => {
    const params = {
      page,
      limit: 12,
      sortBy,
      sortOrder,
    };

    if (appliedSearch && appliedSearch.trim()) {
      params.search = appliedSearch.trim();
    }
    if (category && category.trim()) {
      params.category = category.trim();
    }
    if (platform && platform.trim()) {
      params.platform = platform.trim();
    }

    dispatch(fetchBrandCreators(params));
  }, [dispatch, page, appliedSearch, category, platform, sortBy, sortOrder]);

  // Form submit for search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed !== appliedSearch) {
      setAppliedSearch(trimmed);
      setPage(1);
    } else {
      // If user submits the exact same search term, trigger refetch
      const params = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
      };
      if (trimmed) params.search = trimmed;
      if (category) params.category = category;
      if (platform) params.platform = platform;
      dispatch(fetchBrandCreators(params));
    }
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchInput("");
    if (appliedSearch !== "") {
      setAppliedSearch("");
      setPage(1);
    }
  };

  // Category filter change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  // Platform filter change
  const handlePlatformChange = (e) => {
    setPlatform(e.target.value);
    setPage(1);
  };

  // Sort By change
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  // Sort Order change
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setCategory("");
    setPlatform("");
    setSortBy("followerCount");
    setSortOrder("desc");
    setPage(1);
  };

  // Retry on error
  const handleRetry = () => {
    const params = {
      page,
      limit: 12,
      sortBy,
      sortOrder,
    };
    if (appliedSearch && appliedSearch.trim()) params.search = appliedSearch.trim();
    if (category && category.trim()) params.category = category.trim();
    if (platform && platform.trim()) params.platform = platform.trim();
    dispatch(fetchBrandCreators(params));
  };

  // Pagination page change
  const handlePageChange = (newPage) => {
    const maxPages = pagination?.totalPages || 1;
    if (newPage < 1 || newPage > maxPages || newPage === page) return;
    setPage(newPage);
  };

  const currentPage = pagination?.page ?? pagination?.currentPage ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.totalItems ?? pagination?.totalRecords ?? (creators?.length || 0);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const hasActiveFilters = Boolean(
    appliedSearch || category || platform || sortBy !== "followerCount" || sortOrder !== "desc"
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Brand Sidebar */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Brand Header */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Discovery Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Page Heading & Summary */}
          <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20 mb-3">
                Talent Marketplace
              </span>
              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight flex items-center gap-2">
                <span>Discover Creators</span>
                <span className="text-secondary text-lg">✦</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Explore, evaluate, and collaborate with verified content creators across niches and platforms.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-2.5 rounded-xl bg-surface-muted/60 border border-border-theme text-xs font-medium text-text-secondary">
                Total Creators:{" "}
                <span className="font-bold text-foreground">
                  {loading && !creators?.length ? "..." : totalItems}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Search Bar Form */}
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search creators by name, bio, niche, or skills..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl pl-9 pr-24 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                  <SearchIcon />
                </span>

                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="p-1 rounded-md text-text-secondary hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                      title="Clear Search"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-xs"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Reset Filters Shortcut (if any filter is active) */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-xs font-semibold text-text-secondary hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border-theme text-xs">
              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={handlePlatformChange}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Field */}
              <div>
                <label className="block text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={handleSortByChange}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order Direction */}
              <div>
                <label className="block text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Direction
                </label>
                <select
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                >
                  <option value="desc">High to Low / Desc</option>
                  <option value="asc">Low to High / Asc</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-xs font-sans flex items-center justify-between gap-4">
              <span>{typeof error === "string" ? error : "Failed to load creators. Please try again."}</span>
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

          {/* Creators Content Area */}
          <div>
            {loading ? (
              /* Loading Skeletons Grid (8 items) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <CreatorCardSkeleton key={idx} />
                ))}
              </div>
            ) : creators && creators.length > 0 ? (
              /* Creators Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {creators.map((creator) => (
                  <CreatorCard
                    key={creator._id || creator.id}
                    creator={creator}
                    onViewProfile={handleOpenDetailModal}
                  />
                ))}
              </div>
            ) : !error ? (
              /* Empty State (Only rendered when there is NO error and creators list is empty) */
              <div className="bg-surface border border-border-theme rounded-2xl p-12 text-center shadow-xs">
                <div className="w-14 h-14 rounded-full bg-surface-muted text-text-secondary flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-medium text-lg text-foreground mb-1">
                  No Creators Found
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto mb-5">
                  We could not find any creators matching your filter criteria. Try expanding your search or clearing active filters.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-xs"
                  >
                    <ArrowPathIcon />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* Pagination Controls */}
          {!loading && !error && creators && creators.length > 0 && (
            <div className="bg-surface border border-border-theme rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <span className="text-xs text-text-secondary">
                Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> ({totalItems} total creators)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeftIcon />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Brand Creator Detail Modal */}
      <BrandCreatorDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        creatorId={selectedCreatorId}
      />
    </div>
  );
}
