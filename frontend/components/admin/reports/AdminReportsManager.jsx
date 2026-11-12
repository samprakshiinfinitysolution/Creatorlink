"use client";

import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import AdminAvatar from "@/components/admin/AdminAvatar";

// =========================================================
// SVG ICONS
// =========================================================
function ChartBarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function ArrowDownTrayIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function TrophyIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.004 0V5.625a1.875 1.875 0 10-3.75 0v8.625m3.75 0h-3.75M16.5 7.5A3 3 0 0119.5 10.5v.75a3 3 0 01-3 3h-.75M7.5 7.5A3 3 0 004.5 10.5v.75a3 3 0 003 3h.75" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

export default function AdminReportsManager() {
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(`/admin/reports/overview?months=${months}`);
      setData(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load platform reports");
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Export summary as JSON download
  const handleExportData = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `creatorlink-platform-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const summary = data?.summary || {};
  const campaigns = data?.campaigns || {};
  const workspaces = data?.workspaces || {};
  const leaders = data?.leaders || {};

  const totalCampaignsCount = (campaigns.byStatus || []).reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalWorkspacesCount = (workspaces.byStatus || []).reduce((acc, curr) => acc + (curr.count || 0), 0);
  const completedWorkspacesCount = (workspaces.byStatus || []).find((s) => s.status === "completed")?.count || 0;
  const completionRate = totalWorkspacesCount > 0 ? Math.round((completedWorkspacesCount / totalWorkspacesCount) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-secondary/15 via-surface to-surface border border-secondary/20 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Platform Intelligence
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Reports & Performance Analytics
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Cross-platform metrics, campaign category distribution, creator completion rates, and top performers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Months Selector */}
            <div className="inline-flex rounded-xl bg-surface-muted p-1 border border-border-theme">
              {[
                { label: "3M", value: 3 },
                { label: "6M", value: 6 },
                { label: "12M", value: 12 }
              ].map((pill) => (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setMonths(pill.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    months === pill.value
                      ? "bg-foreground text-background shadow-xs"
                      : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExportData}
              disabled={loading || !data}
              className="py-1.5 px-3.5 rounded-xl bg-surface hover:bg-surface-muted border border-border-theme text-foreground text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-secondary" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-medium flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
            className="underline hover:no-underline font-semibold ml-4 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {loading ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Users */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme shadow-xs space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Community Base</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            {loading ? "..." : (summary.totalUsers ?? 0)}
          </h3>
          <p className="text-xs text-text-secondary">
            <span className="font-semibold text-foreground">{summary.totalCreators ?? 0}</span> Creators •{" "}
            <span className="font-semibold text-foreground">{summary.totalBrands ?? 0}</span> Brands
          </p>
        </div>

        {/* Card 2: Verification Ratio */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme shadow-xs space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Verified Profiles</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {loading ? "..." : `${summary.verificationRatio ?? 0}%`}
            </h3>
            <span className="text-xs text-text-secondary">
              ({summary.verifiedUsers ?? 0} verified)
            </span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Verified blue checkmark ratio
          </p>
        </div>

        {/* Card 3: Campaigns Volume */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme shadow-xs space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Tracked Campaigns</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            {loading ? "..." : totalCampaignsCount}
          </h3>
          <p className="text-xs text-text-secondary">
            Across active brands and agencies
          </p>
        </div>

        {/* Card 4: Collab Completion Rate */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme shadow-xs space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Workspace Success</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            {loading ? "..." : `${completionRate}%`}
          </h3>
          <p className="text-xs text-text-secondary">
            <span className="font-semibold text-foreground">{completedWorkspacesCount}</span> of{" "}
            <span className="font-semibold text-foreground">{totalWorkspacesCount}</span> completed
          </p>
        </div>
      </div>

      {/* 3. Distribution Analytics: Categories & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-theme shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Campaigns by Category</h3>
              <p className="text-xs text-text-secondary">Distribution across influencer marketing verticals</p>
            </div>
            <ChartBarIcon className="w-5 h-5 text-secondary" />
          </div>

          <div className="space-y-3.5">
            {(!campaigns.byCategory || campaigns.byCategory.length === 0) ? (
              <p className="text-xs text-text-secondary py-4 text-center">No category distribution data.</p>
            ) : (
              campaigns.byCategory.map((cat) => {
                const percentage = totalCampaignsCount > 0 ? Math.round((cat.count / totalCampaignsCount) * 100) : 0;
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{cat.category}</span>
                      <span className="text-text-secondary font-medium">
                        {cat.count} campaigns ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Campaign Lifecycle Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-theme shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Campaign Status Pipeline</h3>
              <p className="text-xs text-text-secondary">Status distribution across the brand ecosystem</p>
            </div>
            <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(!campaigns.byStatus || campaigns.byStatus.length === 0) ? (
              <p className="text-xs text-text-secondary py-4 col-span-2 text-center">No status data available.</p>
            ) : (
              campaigns.byStatus.map((item) => (
                <div key={item.status} className="p-4 rounded-2xl bg-surface-muted border border-border-theme space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    {item.status}
                  </span>
                  <p className="text-xl font-bold text-foreground">{item.count}</p>
                  <p className="text-[11px] text-text-secondary truncate">
                    Budget: ₹{Number(item.budget || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Top Performers Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Creators */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-theme shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-foreground">Top Performing Creators</h3>
          </div>
          <p className="text-xs text-text-secondary">Ranked by successfully completed collaboration workspaces.</p>

          <div className="divide-y divide-border-theme">
            {(!leaders.topCreators || leaders.topCreators.length === 0) ? (
              <p className="text-xs text-text-secondary py-6 text-center">No completed collaborations recorded yet.</p>
            ) : (
              leaders.topCreators.map((cr, idx) => (
                <div key={cr._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-xs font-bold text-text-secondary">#{idx + 1}</span>
<AdminAvatar
                      src={cr.avatar || cr.profileImage}
                      name={cr.name}
                      type="creator"
                      size="w-8 h-8"
                      shape="rounded-full"
                      className="shrink-0"
                      fallbackColor="bg-secondary/15 text-secondary"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{cr.name || "Creator"}</p>
                      <p className="text-[11px] text-text-secondary truncate">{cr.email}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-foreground">{cr.completedCollabs} Collabs</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ₹{Number(cr.totalEarned || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Brands */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-theme shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-foreground">Top Active Brands</h3>
          </div>
          <p className="text-xs text-text-secondary">Ranked by total published campaigns and budget allocation.</p>

          <div className="divide-y divide-border-theme">
            {(!leaders.topBrands || leaders.topBrands.length === 0) ? (
              <p className="text-xs text-text-secondary py-6 text-center">No active brands recorded yet.</p>
            ) : (
              leaders.topBrands.map((br, idx) => (
                <div key={br._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-xs font-bold text-text-secondary">#{idx + 1}</span>
<AdminAvatar
                      src={br.avatar || br.logo}
                      name={br.name}
                      type="brand"
                      size="w-8 h-8"
                      shape="rounded-full"
                      className="shrink-0"
                      fallbackColor="bg-blue-500/15 text-blue-500"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{br.name || "Brand"}</p>
                      <p className="text-[11px] text-text-secondary truncate">{br.email}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-foreground">{br.totalCampaigns} Campaigns</p>
                    <p className="text-[11px] text-secondary font-semibold">
                      ₹{Number(br.totalBudget || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

