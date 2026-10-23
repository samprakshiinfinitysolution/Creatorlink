"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandWelcomeBanner from "@/components/brand/dashboard/BrandWelcomeBanner";
import BrandMetricsGrid from "@/components/brand/dashboard/BrandMetricsGrid";
import BrandCampaignAnalytics from "@/components/brand/dashboard/BrandCampaignAnalytics";
import BrandRecentCampaigns from "@/components/brand/dashboard/BrandRecentCampaigns";
import BrandUpcomingDeadlines from "@/components/brand/dashboard/BrandUpcomingDeadlines";
import DashboardSkeleton from "@/components/brand/dashboard/DashboardSkeleton";
import { getBrandDashboardOverview } from "@/redux/brand/dashboard/dashboard_slice";

function BrandDashboardContent() {
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { dashboard, error, loading } = useSelector(
    (state) => state.brandDashboard || {}
  );
  const { profile } = useSelector(
    (state) => state.brandProfile || {}
  );
  const { user: authUser } = useSelector(
    (state) => state.auth || {}
  );

  // Dashboard API fetch handler with retry support
  const handleFetchDashboard = useCallback(() => {
    dispatch(getBrandDashboardOverview({ recentLimit: 5, deadlinesLimit: 5 }));
  }, [dispatch]);

  // Initial dashboard fetch on mount (independent of profile)
  useEffect(() => {
    handleFetchDashboard();
  }, [handleFetchDashboard]);

  const activeUser = dashboard?.user || profile?.user || authUser?.user || authUser || { name: profile?.name || "Brand User" };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Brand Sidebar for universal portal navigation */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Modern Top Header with White Search Bar and Profile Action Section */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Main Dashboard Container */}
        <main className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 max-w-[1536px] mx-auto min-w-0">
          {/* 1. Welcome Banner with soft pink styling and 3D pop-out girl illustration */}
          <BrandWelcomeBanner
            user={activeUser}
            profile={profile}
            metrics={dashboard?.metrics}
          />

          {/* Case 1: First request failed and no cached data exists */}
          {error && !dashboard ? (
            <div className="bg-surface border border-red-500/20 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 mx-auto rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-semibold text-base sm:text-lg text-foreground tracking-tight">
                  Unable to load analytics & metrics
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto font-sans">
                  {typeof error === "string" ? error : "Something went wrong while fetching your dashboard overview. Please check your connection and try again."}
                </p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleFetchDashboard}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Retry Overview</span>
                </button>
              </div>
            </div>
          ) : !dashboard && loading ? (
            /* Case 2: Initial render or request in flight before data arrives */
            <DashboardSkeleton />
          ) : dashboard ? (
            /* Case 3: Dashboard data successfully loaded */
            <>
              {/* If subsequent update failed but we already have dashboard data, show top warning */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-3.5 text-xs font-sans flex items-center justify-between gap-4">
                  <span>{typeof error === "string" ? error : "Unable to refresh dashboard data."}</span>
                  <button
                    type="button"
                    onClick={handleFetchDashboard}
                    className="px-3 py-1 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* 2. 4 Metric Cards */}
              <BrandMetricsGrid metrics={dashboard.metrics} />

              {/* 3. Campaign Analytics (Performance Line Chart + Status Donut Chart) */}
              <BrandCampaignAnalytics
                metrics={dashboard.metrics}
                recentCampaigns={dashboard.recentCampaigns}
              />

              {/* 4. Bottom Grid: Recent Campaigns Table (8 cols) + Upcoming Deliverables (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start min-w-0">
                <div className="lg:col-span-8 flex flex-col min-w-0">
                  <BrandRecentCampaigns campaigns={dashboard.recentCampaigns} />
                </div>
                <div className="lg:col-span-4 flex flex-col min-w-0">
                  <BrandUpcomingDeadlines deadlines={dashboard.upcomingDeadlines} />
                </div>
              </div>
            </>
          ) : null}
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
