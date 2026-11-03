"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import axiosInstance from "@/lib/axios";

// =========================================================
// SVG ICONS
// =========================================================
function UsersIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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

function WorkspaceIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function CurrencyRupeeIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SparklesIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const { user } = useSelector((state) => state.auth || {});

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("signups"); // "signups" | "payments" | "subscriptions" | "campaigns"

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/admin/dashboard/overview?timeRange=${timeRange}&recentLimit=8`);
        if (isMounted) {
          setDashboardData(res.data?.data || null);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load admin overview metrics");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [timeRange, reloadKey]);

  const metrics = dashboardData?.metrics || {};
  const users = metrics.users || {};
  const campaigns = metrics.campaigns || {};
  const collaborations = metrics.collaborations || {};
  const financials = metrics.financials || {};
  const subscriptions = metrics.subscriptions || {};
  const actionItems = metrics.actionItems || {};
  const recentActivity = dashboardData?.recentActivity || {};

  const hasPendingActions =
    (actionItems.pendingVerifications > 0) ||
    (actionItems.overdueWorkspaces > 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner & Time Range Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-secondary/15 via-surface to-surface border border-secondary/20 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold uppercase tracking-wider">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Platform Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Welcome back, {user?.name || "Administrator"}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Real-time platform telemetry, user verification queue, campaign moderation, subscriptions, and financial volume.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Live Production
              </span>
            </div>

            {/* Time Filter Buttons */}
            <div className="inline-flex rounded-xl bg-surface-muted p-1 border border-border-theme">
              {[
                { label: "7D", value: "7d" },
                { label: "30D", value: "30d" },
                { label: "90D", value: "90d" },
                { label: "1Y", value: "1y" },
                { label: "All", value: "all" }
              ].map((pill) => (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setTimeRange(pill.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    timeRange === pill.value
                      ? "bg-foreground text-background shadow-xs"
                      : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="underline hover:no-underline font-semibold ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Action Required / Priority Queue Alert */}
      {hasPendingActions && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-foreground flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Action Required in Administrative Queue</h4>
              <p className="text-xs text-text-secondary">
                Items requiring your manual inspection or dispute resolution.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {actionItems.pendingVerifications > 0 && (
              <Link
                href="/admin/verification"
                className="px-3.5 py-1.5 rounded-xl bg-surface border border-amber-500/40 hover:bg-amber-500/20 text-xs font-semibold text-foreground transition-all flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{actionItems.pendingVerifications} Pending Verification{actionItems.pendingVerifications > 1 ? "s" : ""}</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5 text-text-secondary" />
              </Link>
            )}

            {actionItems.overdueWorkspaces > 0 && (
              <Link
                href="/admin/collaborations"
                className="px-3.5 py-1.5 rounded-xl bg-surface border border-red-500/40 hover:bg-red-500/20 text-xs font-semibold text-foreground transition-all flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>{actionItems.overdueWorkspaces} Overdue Collab{actionItems.overdueWorkspaces > 1 ? "s" : ""}</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5 text-text-secondary" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3. Executive Telemetry KPI Grid (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        {/* Metric 1: Total Users */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme hover:border-secondary/30 transition-all shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Total Community</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                {loading ? "..." : (users.totalUsers ?? 0)}
              </h3>
              {Boolean(users.periodSignups) && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  +{users.periodSignups} new
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1">
              <span className="font-semibold text-foreground">{users.totalCreators ?? 0}</span> Creators •{" "}
              <span className="font-semibold text-foreground">{users.totalBrands ?? 0}</span> Brands
            </p>
          </div>
        </div>

        {/* Metric 2: Live Campaigns */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme hover:border-secondary/30 transition-all shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Campaigns</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <MegaphoneIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {loading ? "..." : (campaigns.totalCampaigns ?? 0)}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{campaigns.activeCampaigns ?? 0}</span> Active •{" "}
              <span className="font-semibold text-foreground">{campaigns.completedCampaigns ?? 0}</span> Closed
            </p>
          </div>
        </div>

        {/* Metric 3: Active Collaborations */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme hover:border-secondary/30 transition-all shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Workspaces</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <WorkspaceIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {loading ? "..." : (collaborations.activeWorkspaces ?? 0)}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              <span className="font-semibold text-foreground">{collaborations.completedWorkspaces ?? 0}</span> Completed
              {collaborations.overdueWorkspaces > 0 && (
                <span className="text-red-500 font-semibold ml-1.5">• {collaborations.overdueWorkspaces} Overdue</span>
              )}
            </p>
          </div>
        </div>

        {/* Metric 4: Platform Escrow GMV */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme hover:border-secondary/30 transition-all shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Collab Volume (GMV)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CurrencyRupeeIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {loading ? "..." : `₹${Number(financials.grossVolume || 0).toLocaleString("en-IN")}`}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              <span className="font-semibold text-foreground">{financials.totalPaidTransactions ?? 0}</span> Settled Orders
            </p>
          </div>
        </div>

        {/* Metric 5: Subscription Revenue & Health */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme hover:border-secondary/30 transition-all shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">SaaS Subscriptions</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {loading ? "..." : `₹${Number(financials.subscriptionRevenue || 0).toLocaleString("en-IN")}`}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{subscriptions.activePaid ?? 0}</span> Paid •{" "}
              <span className="font-semibold text-foreground">{subscriptions.activeTrials ?? 0}</span> Trials
            </p>
          </div>
        </div>
      </div>

      {/* 4. Live Activity Feed (Recent Records) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-foreground">
              Real-Time Platform Activity
            </h2>
            <p className="text-xs text-text-secondary">
              Inspect latest registrations, collaborations, campaigns, and membership checkouts.
            </p>
          </div>

          {/* Activity Category Tabs */}
          <div className="inline-flex rounded-xl bg-surface-muted p-1 border border-border-theme self-start sm:self-auto">
            {[
              { id: "signups", label: `Recent Signups (${recentActivity.signups?.length || 0})` },
              { id: "payments", label: `Collab Payments (${recentActivity.payments?.length || 0})` },
              { id: "subscriptions", label: `Subscriptions (${recentActivity.subscriptionPayments?.length || 0})` },
              { id: "campaigns", label: `Campaigns (${recentActivity.campaigns?.length || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-background shadow-xs"
                    : "text-text-secondary hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Box */}
        <div className="rounded-2xl bg-surface border border-border-theme shadow-xs overflow-hidden">
          {/* TAB 1: SIGNUPS */}
          {activeTab === "signups" && (
            <div className="divide-y divide-border-theme">
              {(!recentActivity.signups || recentActivity.signups.length === 0) ? (
                <div className="p-8 text-center text-xs text-text-secondary">No recent user signups recorded.</div>
              ) : (
                recentActivity.signups.map((usr) => (
                  <div key={usr._id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-muted/50 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm shrink-0">
                        {usr.name ? usr.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{usr.name || "Unnamed User"}</p>
                          {usr.isVerified && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              VERIFIED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate">{usr.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        usr.role === "creator"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}>
                        {usr.role}
                      </span>
                      <span className="text-[11px] text-text-secondary hidden sm:inline">
                        {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="divide-y divide-border-theme">
              {(!recentActivity.payments || recentActivity.payments.length === 0) ? (
                <div className="p-8 text-center text-xs text-text-secondary">No collaboration payments found.</div>
              ) : (
                recentActivity.payments.map((pmt) => (
                  <div key={pmt._id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-muted/50 transition-colors">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          ₹{Number(pmt.amount || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {pmt.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">
                        Brand: <span className="font-medium text-foreground">{pmt.brand?.name || "Brand"}</span> → Creator: <span className="font-medium text-foreground">{pmt.creator?.name || "Creator"}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-mono text-text-secondary truncate max-w-[140px]">
                        {pmt.razorpayPaymentId || "DIRECT"}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {pmt.paidAt ? new Date(pmt.paidAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : (pmt.createdAt ? new Date(pmt.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: SUBSCRIPTIONS */}
          {activeTab === "subscriptions" && (
            <div className="divide-y divide-border-theme">
              {(!recentActivity.subscriptionPayments || recentActivity.subscriptionPayments.length === 0) ? (
                <div className="p-8 text-center text-xs text-text-secondary">No recent subscription payments found.</div>
              ) : (
                recentActivity.subscriptionPayments.map((subPmt) => (
                  <div key={subPmt._id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-muted/50 transition-colors">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          ₹{Number(subPmt.amount || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {subPmt.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">
                        Brand: <span className="font-medium text-foreground">{subPmt.brand?.name || "Brand"}</span> • Plan: <span className="font-medium text-foreground">{subPmt.plan?.name || "Subscription"}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-mono text-text-secondary truncate max-w-[140px]">
                        {subPmt.razorpayPaymentId || "SUB_CAPTURED"}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {subPmt.createdAt ? new Date(subPmt.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: CAMPAIGNS */}
          {activeTab === "campaigns" && (
            <div className="divide-y divide-border-theme">
              {(!recentActivity.campaigns || recentActivity.campaigns.length === 0) ? (
                <div className="p-8 text-center text-xs text-text-secondary">No recent campaigns recorded.</div>
              ) : (
                recentActivity.campaigns.map((cmp) => (
                  <div key={cmp._id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-muted/50 transition-colors">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-semibold text-foreground truncate">{cmp.title}</h5>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-surface-muted text-text-secondary border border-border-theme">
                          {cmp.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">
                        By <span className="font-medium text-foreground">{cmp.brand?.name || "Brand"}</span> • Budget: ₹{Number(cmp.budget || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-foreground">
                        {cmp.requiredCreators || 1} Creator{cmp.requiredCreators > 1 ? "s" : ""}
                      </span>
                      <p className="text-[11px] text-text-secondary">
                        {cmp.createdAt ? new Date(cmp.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
