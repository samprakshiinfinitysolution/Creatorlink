"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDiscoverCampaignById,
  fetchAppliedCampaigns,
  clearSelectedDiscoverCampaign,
  applyToCampaign,
} from "@/redux/creator/campaigns/campaigns_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import ApplyToCampaignModal from "@/components/creator/campaigns/ApplyToCampaignModal";

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

function ArrowLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function CurrencyIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UsersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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

function MegaphoneIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
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

function CalendarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

// =========================================================
// HELPER UTILITIES
// =========================================================
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

export default function CreatorCampaignDetail({ campaignId }) {
  const dispatch = useDispatch();
  const { selectedDiscoverCampaign, appliedCampaigns, loading, error, submitting } = useSelector(
    (state) => state.creatorCampaigns
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    if (campaignId) {
      dispatch(fetchDiscoverCampaignById(campaignId));
    }
    dispatch(fetchAppliedCampaigns({ limit: 100 }));

    return () => {
      dispatch(clearSelectedDiscoverCampaign());
    };
  }, [dispatch, campaignId]);

  const handleRetry = () => {
    if (campaignId) {
      dispatch(fetchDiscoverCampaignById(campaignId));
    }
  };

  const handleApplySubmit = async (payload) => {
    const resultAction = await dispatch(applyToCampaign(payload));
    if (applyToCampaign.fulfilled.match(resultAction)) {
      setIsApplyModalOpen(false);
      if (campaignId) {
        dispatch(fetchDiscoverCampaignById(campaignId));
      }
      dispatch(fetchAppliedCampaigns({ limit: 100 }));
    }
  };

  // Check if current creator has already applied to this campaign
  const isApplied = Boolean(
    campaignId &&
      Array.isArray(appliedCampaigns) &&
      appliedCampaigns.some((item) => {
        if (!item) return false;
        const targetId =
          typeof item.campaign === "string"
            ? item.campaign
            : item.campaign?._id || item.campaignId;
        return String(targetId) === String(campaignId);
      })
  );

  const campaign = selectedDiscoverCampaign;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Back Navigation Button */}
          <div>
            <Link
              href="/creator/campaigns/discover"
              className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeftIcon />
              <span>Back to Discover Campaigns</span>
            </Link>
          </div>

          {/* ERROR STATE */}
          {!campaign && error ? (
            <div className="bg-surface border border-border-theme rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
                <RefreshIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif font-medium text-xl text-foreground">
                  Unable to load campaign details
                </h2>
                <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                  {typeof error === "string" ? error : "An error occurred while fetching the campaign details."}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <RefreshIcon className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <Link
                  href="/creator/campaigns/discover"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-muted hover:bg-surface text-foreground text-xs font-semibold border border-border-theme transition-all cursor-pointer"
                >
                  <span>Discover Campaigns</span>
                </Link>
              </div>
            </div>
          ) : loading || (!campaign && loading) ? (
            /* LOADING SKELETON STATE */
            <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs animate-pulse space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-surface-muted rounded-full w-28" />
                <div className="h-6 bg-surface-muted rounded-full w-20" />
              </div>
              <div className="h-8 bg-surface-muted rounded-lg w-2/3" />
              <div className="h-4 bg-surface-muted rounded-md w-1/3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-surface-muted rounded-xl" />
                ))}
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-4 bg-surface-muted rounded-md w-full" />
                <div className="h-4 bg-surface-muted rounded-md w-full" />
                <div className="h-4 bg-surface-muted rounded-md w-3/4" />
              </div>
            </div>
          ) : !campaign ? (
            /* NOT FOUND STATE */
            <div className="bg-surface border border-border-theme rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                <MegaphoneIcon />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif font-medium text-xl text-foreground">
                  Campaign Not Found
                </h2>
                <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                  The campaign you are looking for may have been removed or is no longer active.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/creator/campaigns/discover"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                >
                  <span>Back to Discover Campaigns</span>
                </Link>
              </div>
            </div>
          ) : (
            /* MAIN CAMPAIGN DETAIL DISPLAY */
            <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
              {/* Top Row Badges & Status */}
              <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap border-b border-border-theme pb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-wide">
                    {campaign.category || "General"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-muted text-foreground border border-border-theme uppercase tracking-wide">
                    {formatPlatform(campaign.platform)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isApplied ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 uppercase tracking-wide">
                      Already Applied
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      <span>Apply to Campaign</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-muted text-text-secondary border border-border-theme uppercase tracking-wide">
                    Status: {campaign.status || "Published"}
                  </span>
                </div>

              </div>

              {/* Campaign Header & Brand Info */}
              <div className="space-y-2">
                <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
                  {campaign.title}
                </h1>
                {campaign.brand?.name && (
                  <p className="text-xs sm:text-sm text-text-secondary font-medium">
                    Posted by <span className="text-foreground font-semibold">{campaign.brand.name}</span>
                    {campaign.brand.email && ` (${campaign.brand.email})`}
                  </p>
                )}
              </div>

              {/* 4 Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Budget */}
                <div className="bg-surface-muted/60 border border-border-theme rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                    <CurrencyIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="font-medium">Budget</span>
                  </div>
                  <span className="font-serif font-semibold text-xl text-foreground block">
                    {formatBudget(campaign.budget)}
                  </span>
                </div>

                {/* Deadline */}
                <div className="bg-surface-muted/60 border border-border-theme rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                    <ClockIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="font-medium">Deadline</span>
                  </div>
                  <span className="font-sans font-semibold text-sm text-foreground block">
                    {formatDate(campaign.deadline)}
                  </span>
                </div>

                {/* Required Creators */}
                <div className="bg-surface-muted/60 border border-border-theme rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                    <UsersIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="font-medium">Creators Needed</span>
                  </div>
                  <span className="font-sans font-semibold text-sm text-foreground block">
                    {campaign.requiredCreators || 1} Creator{(campaign.requiredCreators || 1) > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Platform */}
                <div className="bg-surface-muted/60 border border-border-theme rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                    <CalendarIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="font-medium">Target Platform</span>
                  </div>
                  <span className="font-sans font-semibold text-sm text-foreground block truncate">
                    {formatPlatform(campaign.platform)}
                  </span>
                </div>
              </div>


              {/* Campaign Description */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif font-semibold text-lg text-foreground">
                  Campaign Description
                </h3>
                <div className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line bg-surface-muted/30 p-5 rounded-2xl border border-border-theme/60">
                  {campaign.description || "No detailed description provided."}
                </div>
              </div>

              {/* Deliverables Section */}
              {Array.isArray(campaign.deliverables) && campaign.deliverables.length > 0 && (() => {
                const validDeliverables = campaign.deliverables
                  .map(formatDeliverableItem)
                  .filter(Boolean);

                if (validDeliverables.length === 0) return null;

                return (
                  <div className="space-y-3 pt-2">
                    <h3 className="font-serif font-semibold text-lg text-foreground">
                      Required Deliverables ({validDeliverables.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {validDeliverables.map((itemText, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-muted/50 border border-border-theme text-xs font-medium text-foreground"
                        >
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                            <CheckIcon />
                          </div>
                          <span>{itemText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Footer Specs & Dates */}
              <div className="pt-4 border-t border-border-theme flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-text-secondary">
                <div>
                  Created: <span className="font-medium text-foreground">{formatDate(campaign.createdAt)}</span>
                </div>
                <div className="font-mono text-[10px]">
                  Campaign ID: {campaign._id || campaign.id}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Apply to Campaign Modal */}
      <ApplyToCampaignModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        campaignId={campaignId}
        campaignTitle={campaign?.title}
        campaignBudget={campaign?.budget}
        onContinue={handleApplySubmit}
        submitting={submitting}
        submitError={error}
      />
    </div>
  );
}

