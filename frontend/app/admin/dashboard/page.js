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

export default function AdminDashboardPage() {
  const { user } = useSelector((state) => state.auth || {});

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch live metrics from the newly mounted Admin Overview API
  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/admin/dashboard/overview");
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

    fetchOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = dashboardData?.metrics || {};
  const users = metrics.users || {};
  const campaigns = metrics.campaigns || {};
  const collaborations = metrics.collaborations || {};
  const financials = metrics.financials || {};

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-secondary/15 via-surface to-surface border border-secondary/20 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold uppercase tracking-wider">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              <span>Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Welcome back, {user?.name || "Administrator"}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Platform administration, user verification, campaign moderation, and transaction telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Live Production State
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Users */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme hover:border-secondary/30 transition-all shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Total Users</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {loading ? "..." : (users.totalUsers ?? 0)}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              <span className="font-semibold text-foreground">{users.totalCreators ?? 0}</span> Creators •{" "}
              <span className="font-semibold text-foreground">{users.totalBrands ?? 0}</span> Brands
            </p>
          </div>
        </div>

        {/* Metric 2: Active Campaigns */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme hover:border-secondary/30 transition-all shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Campaigns</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <MegaphoneIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {loading ? "..." : (campaigns.totalCampaigns ?? 0)}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              <span className="font-semibold text-emerald-500">{campaigns.activeCampaigns ?? 0}</span> Live Active
            </p>
          </div>
        </div>

        {/* Metric 3: Active Collaborations */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme hover:border-secondary/30 transition-all shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Collaborations</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <WorkspaceIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {loading ? "..." : (collaborations.activeWorkspaces ?? 0)}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              <span className="font-semibold text-foreground">{collaborations.completedWorkspaces ?? 0}</span> Completed
            </p>
          </div>
        </div>

        {/* Metric 4: Platform Volume (GMV) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-theme hover:border-secondary/30 transition-all shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Gross Volume</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CurrencyRupeeIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {loading ? "..." : `₹${Number(financials.grossVolume || 0).toLocaleString("en-IN")}`}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              <span className="font-semibold text-foreground">{financials.totalPaidTransactions ?? 0}</span> Settled Transactions
            </p>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Management Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-serif font-bold text-foreground">
          Platform Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/users"
            className="group p-5 rounded-2xl bg-surface border border-border-theme hover:border-secondary/40 transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                User Management
              </h4>
              <p className="text-xs text-text-secondary">
                Search, inspect, and moderate creator and brand accounts.
              </p>
            </div>
            <ArrowUpRightIcon className="text-text-secondary group-hover:text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/verification"
            className="group p-5 rounded-2xl bg-surface border border-border-theme hover:border-secondary/40 transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                Verification Queue
              </h4>
              <p className="text-xs text-text-secondary">
                Review and approve blue checkmarks for top creators and brands.
              </p>
            </div>
            <ArrowUpRightIcon className="text-text-secondary group-hover:text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/campaigns"
            className="group p-5 rounded-2xl bg-surface border border-border-theme hover:border-secondary/40 transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                Campaign Moderation
              </h4>
              <p className="text-xs text-text-secondary">
                Audit active brand campaigns and enforce community guidelines.
              </p>
            </div>
            <ArrowUpRightIcon className="text-text-secondary group-hover:text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/collaborations"
            className="group p-5 rounded-2xl bg-surface border border-border-theme hover:border-secondary/40 transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                Active Collaborations
              </h4>
              <p className="text-xs text-text-secondary">
                Track live workspaces, deliverables, submissions, and deadlines.
              </p>
            </div>
            <ArrowUpRightIcon className="text-text-secondary group-hover:text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/payments"
            className="group p-5 rounded-2xl bg-surface border border-border-theme hover:border-secondary/40 transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                Payment Auditing
              </h4>
              <p className="text-xs text-text-secondary">
                Inspect Razorpay checkout transactions, orders, and refund logs.
              </p>
            </div>
            <ArrowUpRightIcon className="text-text-secondary group-hover:text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/admin/settings"
            className="group p-5 rounded-2xl bg-surface border border-border-theme hover:border-secondary/40 transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                Platform Settings
              </h4>
              <p className="text-xs text-text-secondary">
                Platform fee percentage, commission configuration, and system controls.
              </p>
            </div>
            <ArrowUpRightIcon className="text-text-secondary group-hover:text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}

