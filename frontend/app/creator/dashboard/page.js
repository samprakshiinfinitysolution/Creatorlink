"use client";

import React, { useState } from "react";
import Link from "next/link";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

// =========================================================
// SVG METRIC ICONS
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

function ClockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckBadgeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

// =========================================================
// MOCK DATA FOR DEMO/PREVIEW
// =========================================================
const metrics = [
  {
    title: "Active Campaigns",
    value: "3",
    change: "+1 this week",
    icon: MegaPhoneIcon,
    accent: "text-secondary bg-secondary/10"
  },
  {
    title: "Total Earnings",
    value: "$12,450",
    change: "+18.4% vs last month",
    icon: CurrencyIcon,
    accent: "text-emerald-500 bg-emerald-500/10"
  },
  {
    title: "Pending Requests",
    value: "5",
    change: "2 require review",
    icon: ClockIcon,
    accent: "text-amber-500 bg-amber-500/10"
  },
  {
    title: "Completed Projects",
    value: "28",
    change: "100% on-time delivery",
    icon: CheckBadgeIcon,
    accent: "text-tertiary bg-tertiary/10"
  }
];

const recentCampaigns = [
  {
    id: "CAMP-101",
    brand: "Maison Synergie",
    title: "Lookbook Fall '26 Launch",
    category: "Beauty & Fashion",
    compensation: "$2,400",
    status: "In Progress",
    statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    deadline: "Oct 15, 2026"
  },
  {
    id: "CAMP-102",
    brand: "Velvet Dew Lipcare",
    title: "Hydration Serum Video Campaign",
    category: "Skincare",
    compensation: "$1,800",
    status: "Pending Review",
    statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    deadline: "Oct 10, 2026"
  },
  {
    id: "CAMP-103",
    brand: "Urban Chic Apparel",
    title: "Streetwear Reels Showcase",
    category: "Apparel & Lifestyle",
    compensation: "$3,200",
    status: "Completed",
    statusColor: "bg-secondary/10 text-secondary border-secondary/20",
    deadline: "Sep 28, 2026"
  }
];

export default function CreatorDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ReduxProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        {/* Sidebar Component */}
        <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Main Content Area Offset by Desktop Sidebar */}
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          {/* Header Bar Component */}
          <CreatorHeader setMobileOpen={setMobileOpen} />

          {/* Dashboard Main Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
            {/* Welcome Banner */}
            <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20 mb-3">
                  Overview
                </span>
                <h2 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
                  Welcome back, Aarohi ✦
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  Here is what is happening with your creator profile, campaign proposals, and services today.
                </p>
              </div>
              <Link
                href="/creator/services"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
              >
                <span>+ Add Service</span>
              </Link>
            </div>

            {/* 4 Metric Cards */}
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
                  href="/creator/campaigns"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
                >
                  <span>View All</span>
                  <ArrowRightIcon />
                </Link>
              </div>

              {/* Campaigns Table / Cards */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-theme text-text-secondary uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Campaign Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Compensation</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {recentCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-foreground block text-sm font-sans">
                            {c.title}
                          </span>
                          <span className="text-[11px] text-text-secondary block">
                            {c.brand}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary font-medium">
                          {c.category}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          {c.compensation}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${c.statusColor}`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-text-secondary font-medium">
                          {c.deadline}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/creator/services"
                className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs hover:border-secondary transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold text-foreground text-sm block font-sans">
                    Offer New Service
                  </span>
                  <span className="text-xs text-text-secondary mt-0.5 block">
                    Add custom package or pricing
                  </span>
                </div>
                <span className="text-secondary group-hover:translate-x-1 transition-transform">
                  <ArrowRightIcon />
                </span>
              </Link>

              <Link
                href="/creator/portfolio"
                className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs hover:border-secondary transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold text-foreground text-sm block font-sans">
                    Manage Portfolio
                  </span>
                  <span className="text-xs text-text-secondary mt-0.5 block">
                    Upload recent reel or lookbook
                  </span>
                </div>
                <span className="text-secondary group-hover:translate-x-1 transition-transform">
                  <ArrowRightIcon />
                </span>
              </Link>

              <Link
                href="/creator/messages"
                className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs hover:border-secondary transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold text-foreground text-sm block font-sans">
                    View Messages
                  </span>
                  <span className="text-xs text-text-secondary mt-0.5 block">
                    Chat with brands & agencies
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
    </ReduxProvider>
  );
}
