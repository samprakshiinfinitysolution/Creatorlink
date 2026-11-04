"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCampaigns,
  fetchCampaignStats,
  fetchCampaignDetails,
  changeCampaignStatus,
  clearSelectedCampaign
} from "@/redux/admin/campaigns/campaigns_slice";
import AdminCampaignDetailModal from "./AdminCampaignDetailModal";

// =========================================================
// SVG ICONS
// =========================================================
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

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CheckBadgeIcon({ className = "w-3.5 h-3.5 text-emerald-400" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

function PauseIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
  );
}

function PlayIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  );
}

const statusBadgeStyles = {
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  draft: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20",
  paused: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  completed: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  closed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
};

export default function AdminCampaignsManager() {
  const dispatch = useDispatch();
  const {
    campaigns = [],
    stats = {},
    pagination = {},
    loading,
    error,
    selectedCampaign
  } = useSelector((state) => state.adminCampaigns || {});

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // Load campaigns with query params
  const loadData = useCallback(() => {
    dispatch(
      fetchCampaigns({
        page,
        limit: 10,
        status: selectedStatus,
        platform: selectedPlatform,
        sortBy,
        search: search.trim() || undefined
      })
    );
  }, [dispatch, page, selectedStatus, selectedPlatform, sortBy, search]);

  useEffect(() => {
    dispatch(fetchCampaignStats());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadData]);

  const handleOpenModal = (campaignId) => {
    dispatch(fetchCampaignDetails(campaignId));
  };

  const handleCloseModal = () => {
    dispatch(clearSelectedCampaign());
  };

  const handleQuickToggleStatus = async (campaign) => {
    const targetStatus = campaign.status === "paused" ? "published" : "paused";
    await dispatch(
      changeCampaignStatus({
        id: campaign._id,
        status: targetStatus,
        moderationReason: "Quick moderation action via admin table"
      })
    );
    dispatch(fetchCampaignStats());
    loadData();
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedPlatform("all");
    setSortBy("newest");
    setPage(1);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatCampaignBudget = (c) => {
    if (!c) return "₹0";
    const min = c.minBudget;
    const max = c.maxBudget;
    if (min !== undefined && min !== null && max !== undefined && max !== null && !isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
      if (min === max) return formatCurrency(min);
      return `${formatCurrency(min)} – ${formatCurrency(max)}`;
    }
    return formatCurrency(c.budget);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">Campaign Moderation</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Monitor, audit, and moderate all platform influencer campaigns and deliverables.
          </p>
        </div>
      </div>

      {/* METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs hover:border-secondary/30 transition-all">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
            Total Campaigns
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-foreground mt-1.5 block">
            {stats.totalCampaigns || 0}
          </span>
        </div>

        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs hover:border-emerald-500/30 transition-all">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Published Active
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1.5 block">
            {stats.statusCounts?.published || 0}
          </span>
        </div>

        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs hover:border-blue-500/30 transition-all">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            In Progress
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-blue-600 dark:text-blue-400 mt-1.5 block">
            {stats.statusCounts?.in_progress || 0}
          </span>
        </div>

        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs hover:border-amber-500/30 transition-all">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Paused / Moderated
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-1.5 block">
            {stats.statusCounts?.paused || 0}
          </span>
        </div>

        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1 hover:border-secondary/30 transition-all">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
            Gross Budget
          </span>
          <span className="text-xl sm:text-2xl font-bold font-serif text-foreground mt-1.5 block truncate">
            {formatCurrency(stats.totalBudget)}
          </span>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SEARCH INPUT */}
          <div>
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Title, brand name, email..."
              className="w-full bg-surface-muted/60 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary"
            />
          </div>

          {/* STATUS FILTER */}
          <div>
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-muted/60 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="in_progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* PLATFORM FILTER */}
          <div>
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-muted/60 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:border-secondary capitalize cursor-pointer"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="website">Website</option>
            </select>
          </div>

          {/* SORT FILTER */}
          <div>
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-muted/60 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget_high">Budget: High to Low</option>
              <option value="budget_low">Budget: Low to High</option>
              <option value="deadline">Upcoming Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </div>
      )}

      {/* CAMPAIGNS TABLE */}
      <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/50 text-text-secondary uppercase text-[11px] tracking-wider border-b border-border-theme font-semibold">
              <tr>
                <th className="px-5 py-3.5">Campaign</th>
                <th className="px-5 py-3.5">Brand</th>
                <th className="px-5 py-3.5">Budget</th>
                <th className="px-5 py-3.5">Applications</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Deadline</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme text-foreground">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-36 mb-1.5" />
                      <div className="h-3 bg-surface-muted rounded w-20" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-28 mb-1.5" />
                      <div className="h-3 bg-surface-muted rounded w-32" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-16" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-12" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-16" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-20" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-7 bg-surface-muted rounded w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-text-secondary">
                    <p className="text-sm font-semibold text-foreground">No campaigns found</p>
                    <p className="text-xs text-text-secondary mt-1">
                      No campaigns match your current search and filter criteria.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-3 px-3.5 py-1.5 bg-foreground text-background rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-muted/30 transition-colors">
                    {/* CAMPAIGN TITLE & CATEGORY */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground truncate max-w-xs">{c.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-text-secondary capitalize">{c.category}</span>
                        <span className="text-text-secondary">•</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 capitalize">{c.platform}</span>
                      </div>
                    </td>

                    {/* BRAND INFO */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-foreground font-medium truncate max-w-[180px]">
                        <span className="truncate">
                          {c.brandProfile?.companyName || c.brand?.name || "Brand User"}
                        </span>
                        {(c.brandProfile?.isVerifiedBusiness || c.brand?.isVerified) && (
                          <CheckBadgeIcon className="w-3.5 h-3.5 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-text-secondary truncate max-w-[180px]">
                        {c.brand?.email}
                      </div>
                    </td>

                    {/* BUDGET */}
                    <td className="px-5 py-3.5 font-mono text-foreground font-medium">
                      {formatCampaignBudget(c)}
                    </td>

                    {/* APPLICATIONS */}
                    <td className="px-5 py-3.5 text-foreground">
                      <div className="font-semibold">{c.totalApplications || 0}</div>
                      <div className="text-[10px] text-text-secondary">
                        {c.acceptedApplications || 0} accepted
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase ${
                          statusBadgeStyles[c.status] || statusBadgeStyles.draft
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* DEADLINE */}
                    <td className="px-5 py-3.5 text-text-secondary text-[11px]">
                      {c.deadline ? new Date(c.deadline).toLocaleDateString() : "N/A"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Quick Pause / Resume */}
                        {c.status === "paused" ? (
                          <button
                            title="Resume Campaign"
                            onClick={() => handleQuickToggleStatus(c)}
                            className="p-1.5 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 transition-colors cursor-pointer"
                          >
                            <PlayIcon className="w-3.5 h-3.5" />
                          </button>
                        ) : c.status === "published" || c.status === "in_progress" ? (
                          <button
                            title="Pause Campaign"
                            onClick={() => handleQuickToggleStatus(c)}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                          >
                            <PauseIcon className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        {/* View Dossier Button */}
                        <button
                          onClick={() => handleOpenModal(c._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-border-theme hover:bg-surface-muted text-foreground transition-colors text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="px-5 py-3.5 bg-surface-muted/40 border-t border-border-theme flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <span>
            Showing{" "}
            <strong className="text-foreground">
              {campaigns.length > 0 ? (page - 1) * 10 + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-foreground">
              {Math.min(page * 10, pagination.totalItems || 0)}
            </strong>{" "}
            of <strong className="text-foreground">{pagination.totalItems || 0}</strong> campaigns
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-xl bg-surface border border-border-theme text-xs text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-text-secondary px-2 font-mono">
              Page {page} of {pagination.totalPages || 1}
            </span>

            <button
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-xl bg-surface border border-border-theme text-xs text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CAMPAIGN DOSSIER MODAL */}
      {selectedCampaign && (
        <AdminCampaignDetailModal
          data={selectedCampaign}
          onClose={handleCloseModal}
          onStatusChanged={() => {
            loadData();
            dispatch(fetchCampaignStats());
          }}
        />
      )}
    </div>
  );
}

