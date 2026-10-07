"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import { getBrandProfile } from "@/redux/brand/profile/profile_slice";
import { getBrandCampaigns } from "@/redux/brand/campaigns/campaigns_slice";

// =========================================================
// HELPER FORMATTERS
// =========================================================
function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case "published":
    case "active":
    case "in_progress":
      return {
        label: status === "in_progress" ? "In Progress" : status === "published" ? "Published" : "Active",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "draft":
      return {
        label: "Draft",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "completed":
    case "closed":
      return {
        label: status === "completed" ? "Completed" : "Closed",
        color: "bg-secondary/10 text-secondary border-secondary/20",
      };
    default:
      return {
        label: status || "Unknown",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
}

// =========================================================
// SVG METRIC & ACTION ICONS
// =========================================================
function MegaPhoneIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
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

function PlayIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972L6.917 19.332c-.75.412-1.667-.13-1.667-.986V5.653z" />
    </svg>
  );
}

function DocumentTextIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

// =========================================================
// DASHBOARD CONTENT COMPONENT
// =========================================================
function BrandDashboardContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();

  const { profile, loading: profileLoading, error: profileError } = useSelector(
    (state) => state.brandProfile || {}
  );

  const { user: authUser } = useSelector(
    (state) => state.auth || {}
  );

  const { campaigns, pagination, loading: campaignsLoading, error: campaignsError } = useSelector(
    (state) => state.brandCampaigns || {}
  );

  useEffect(() => {
    dispatch(getBrandProfile());
    dispatch(getBrandCampaigns({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }));
  }, [dispatch]);

  // Derived welcome display name: companyName -> user.name -> user.email
  const userObj = profile?.user || (authUser?.user ? authUser.user : authUser);
  const welcomeName =
    profile?.companyName ||
    profile?.brandName ||
    userObj?.name ||
    profile?.name ||
    userObj?.email ||
    profile?.email ||
    "Brand";

  // Statistical Metrics
  const totalCampaignsCount = pagination?.totalItems ?? (campaigns?.length || 0);

  const activeCount = campaigns?.filter(
    (c) => c.status === "published" || c.status === "in_progress"
  ).length || 0;

  const draftCount = campaigns?.filter(
    (c) => c.status === "draft"
  ).length || 0;

  const fetchedBudgetSum = campaigns?.reduce(
    (acc, c) => acc + (Number(c.budget) || 0),
    0
  ) || 0;

  const metrics = [
    {
      title: "Total Campaigns",
      value: profileLoading && campaignsLoading ? "..." : totalCampaignsCount.toString(),
      change: "Database total",
      icon: MegaPhoneIcon,
      accent: "text-secondary bg-secondary/10",
    },
    {
      title: "Active Campaigns",
      value: campaignsLoading ? "..." : activeCount.toString(),
      change: "In recent 5 fetched",
      icon: PlayIcon,
      accent: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Total Budget",
      value: campaignsLoading ? "..." : formatCurrency(fetchedBudgetSum),
      change: "Sum of recent 5 fetched",
      icon: CurrencyIcon,
      accent: "text-tertiary bg-tertiary/10",
    },
    {
      title: "Draft Campaigns",
      value: campaignsLoading ? "..." : draftCount.toString(),
      change: "In recent 5 fetched",
      icon: DocumentTextIcon,
      accent: "text-amber-500 bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar Component */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Dashboard Main Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Global Profile Error Alert */}
          {profileError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-xs font-sans">
              Unable to load complete brand profile. Displaying available default user information.
            </div>
          )}

          {/* Welcome Banner */}
          <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20 mb-3">
                Brand Overview
              </span>
              <h2 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
                {profileLoading ? (
                  <span className="inline-block w-48 h-8 bg-surface-muted rounded-md animate-pulse" />
                ) : (
                  `Welcome back, ${welcomeName} ✦`
                )}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Here is an overview of your active campaigns, creator proposals, and workspace deliverables today.
              </p>
            </div>
            <Link
              href="/brand/campaigns"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
            >
              <PlusIcon />
              <span>Create Campaign</span>
            </Link>
          </div>

          {/* 4 Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.title}
                  className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:border-secondary/40"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      {m.title}
                    </span>
                    <div className={`p-2 rounded-xl ${m.accent}`}>
                      <Icon />
                    </div>
                  </div>
                  <div>
                    <span className="font-serif text-2xl sm:text-3xl font-medium text-foreground block">
                      {m.value}
                    </span>
                    <span className="text-[11px] text-text-secondary mt-1 block">
                      {m.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Campaigns Section */}
          <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-medium text-lg sm:text-xl text-foreground">
                  Recent Campaigns
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Latest brand collaboration deliverables and statuses
                </p>
              </div>
              <Link
                href="/brand/campaigns"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
              >
                <span>View All</span>
                <ArrowRightIcon />
              </Link>
            </div>

            {/* Loading Skeleton State */}
            {campaignsLoading && (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-surface-muted rounded-xl animate-pulse w-full" />
                ))}
              </div>
            )}

            {/* Error State */}
            {!campaignsLoading && campaignsError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 text-xs font-sans flex items-center justify-between">
                <span>Unable to load campaigns. Please try again.</span>
                <button
                  type="button"
                  onClick={() => dispatch(getBrandCampaigns({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }))}
                  className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-medium cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!campaignsLoading && !campaignsError && campaigns.length === 0 && (
              <div className="text-center py-12 px-4 border border-dashed border-border-theme rounded-2xl space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <MegaPhoneIcon className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-medium text-lg text-foreground">
                  No campaigns yet
                </h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Create your first brand campaign to start receiving applications and collaborating with top creators.
                </p>
                <div className="pt-2">
                  <Link
                    href="/brand/campaigns"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white text-xs font-semibold transition-all hover:bg-secondary-dark"
                  >
                    <PlusIcon />
                    <span>Create Campaign</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Campaigns Table */}
            {!campaignsLoading && !campaignsError && campaigns.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-theme text-text-secondary uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Campaign Title</th>
                      <th className="py-3 px-4">Platform</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Budget</th>
                      <th className="py-3 px-4">Required Creators</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {campaigns.map((c) => {
                      const badge = getStatusBadge(c.status);
                      const reqCreators = typeof c.requiredCreators === "number"
                        ? c.requiredCreators
                        : Array.isArray(c.requiredCreators)
                        ? c.requiredCreators.length
                        : c.requiredCreators || 1;

                      return (
                        <tr key={c._id || c.id || c.title} className="hover:bg-surface-muted/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-foreground text-sm font-sans">
                            {c.title}
                          </td>
                          <td className="py-3.5 px-4 text-text-secondary font-medium capitalize">
                            {c.platform || "Multi-Platform"}
                          </td>
                          <td className="py-3.5 px-4 text-text-secondary font-medium">
                            {c.category || "General"}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-foreground">
                            {formatCurrency(c.budget)}
                          </td>
                          <td className="py-3.5 px-4 text-text-secondary font-medium">
                            {reqCreators}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-text-secondary font-medium">
                            {formatDate(c.deadline)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/brand/campaigns"
              className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs hover:border-secondary transition-all flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-foreground text-sm block font-sans">
                  Create Campaign
                </span>
                <span className="text-xs text-text-secondary mt-0.5 block">
                  Launch a new brief for creators
                </span>
              </div>
              <span className="text-secondary group-hover:translate-x-1 transition-transform">
                <ArrowRightIcon />
              </span>
            </Link>

            <Link
              href="/brand/profile"
              className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs hover:border-secondary transition-all flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-foreground text-sm block font-sans">
                  Edit Brand Profile
                </span>
                <span className="text-xs text-text-secondary mt-0.5 block">
                  Update company info & branding
                </span>
              </div>
              <span className="text-secondary group-hover:translate-x-1 transition-transform">
                <ArrowRightIcon />
              </span>
            </Link>

            <Link
              href="/brand/creators"
              className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs hover:border-secondary transition-all flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-foreground text-sm block font-sans">
                  Discover Creators
                </span>
                <span className="text-xs text-text-secondary mt-0.5 block">
                  Explore talent by niche & reach
                </span>
              </div>
              <span className="text-secondary group-hover:translate-x-1 transition-transform">
                <ArrowRightIcon />
              </span>
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function BrandDashboardPage() {
  return (
    <ReduxProvider>
      <BrandDashboardContent />
    </ReduxProvider>
  );
}
