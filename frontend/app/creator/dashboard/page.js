"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import CreatorWelcomeBanner from "@/components/creator/dashboard/CreatorWelcomeBanner";
import CreatorMetricsGrid from "@/components/creator/dashboard/CreatorMetricsGrid";
import CreatorUpcomingDeadlines from "@/components/creator/dashboard/CreatorUpcomingDeadlines";
import CreatorRecentCollaborations from "@/components/creator/dashboard/CreatorRecentCollaborations";
import CreatorRecentReviews from "@/components/creator/dashboard/CreatorRecentReviews";
import CreatorQuickActions from "@/components/creator/dashboard/CreatorQuickActions";
import CreatorDashboardSkeleton from "@/components/creator/dashboard/CreatorDashboardSkeleton";
import { getCreatorDashboardOverview } from "@/redux/creator/dashboard/dashboard_slice";

function CreatorDashboardContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();

  const {
    dashboard,
    metrics,
    upcomingDeadlines,
    recentWorkspaces,
    reviews,
    creator,
    error,
  } = useSelector((state) => state.creatorDashboard || {});

  const { profile } = useSelector((state) => state.profile || {});
  const { user } = useSelector((state) => state.auth || {});

  // Dashboard API fetch handler with retry support
  const handleFetchDashboard = useCallback(() => {
    dispatch(getCreatorDashboardOverview({ recentLimit: 5, deadlinesLimit: 5 }));
  }, [dispatch]);

  // Initial dashboard fetch on mount (independent of profile)
  useEffect(() => {
    handleFetchDashboard();
  }, [handleFetchDashboard]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Header Bar Component */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Dashboard Main Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Case 1: First request failed and no cached data exists */}
          {error && !dashboard ? (
            <div className="bg-surface border border-red-500/20 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-medium text-lg sm:text-xl text-foreground">
                  Unable to load creator dashboard data
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
                  {typeof error === "string"
                    ? error
                    : "Something went wrong while fetching your dashboard overview. Please check your connection and try again."}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFetchDashboard}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Retry</span>
                </button>
              </div>
            </div>
          ) : !dashboard ? (
            /* Case 2: Initial render or request in flight before data arrives */
            <CreatorDashboardSkeleton />
          ) : (
            /* Case 3: Dashboard data successfully loaded */
            <>
              {/* If subsequent update failed but we already have dashboard data, show top warning */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-xs font-sans flex items-center justify-between gap-4">
                  <span>{typeof error === "string" ? error : "Unable to refresh dashboard data."}</span>
                  <button
                    type="button"
                    onClick={handleFetchDashboard}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* 1. Welcome Banner */}
              <CreatorWelcomeBanner
                user={user}
                creator={creator}
                profile={profile}
                metrics={metrics}
              />

              {/* 2. 4 Core Aggregate Metric Cards */}
              <CreatorMetricsGrid metrics={metrics} />

              {/* 3. Production Workflow Pipeline & Quick Action Tools */}
              <CreatorQuickActions metrics={metrics} />

              {/* 4. 2-Column Section: Deadlines & Active Collaborations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <CreatorUpcomingDeadlines deadlines={upcomingDeadlines} />
                <CreatorRecentCollaborations collaborations={recentWorkspaces} />
              </div>

              {/* 5. Recent Reviews & Testimonials */}
              <CreatorRecentReviews reviews={reviews} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CreatorDashboardPage() {
  return (
    <ReduxProvider>
      <CreatorDashboardContent />
    </ReduxProvider>
  );
}
