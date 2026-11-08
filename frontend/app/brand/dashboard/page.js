"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { getBrandProfile } from "@/redux/brand/profile/profile_slice";
import { socket, registerSocketConsumer, unregisterSocketConsumer } from "@/lib/socket";

function BrandDashboardContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isOnboardedVerified, setIsOnboardedVerified] = useState(false);
  const [timeframe, setTimeframe] = useState("6m");
  const hasFetchedDashboardRef = useRef(false);

  const { dashboard, error, loading } = useSelector(
    (state) => state.brandDashboard || {}
  );
  const { profile } = useSelector(
    (state) => state.brandProfile || {}
  );
  const { user: authUser } = useSelector(
    (state) => state.auth || {}
  );

  // Dashboard API fetch handler with retry and timeframe support
  const handleFetchDashboard = useCallback((tf = timeframe) => {
    const activeTf = typeof tf === "string" ? tf : timeframe;
    dispatch(getBrandDashboardOverview({ recentLimit: 5, deadlinesLimit: 5, timeframe: activeTf }));
  }, [dispatch, timeframe]);

  // Handle timeframe filter change without duplicate dispatches
  const handleTimeframeChange = useCallback((newTimeframe) => {
    if (!newTimeframe || newTimeframe === timeframe) return;
    setTimeframe(newTimeframe);
    dispatch(getBrandDashboardOverview({ recentLimit: 5, deadlinesLimit: 5, timeframe: newTimeframe }));
  }, [dispatch, timeframe]);

  // Onboarding verification check to guard dashboard access
  useEffect(() => {
    let isMounted = true;

    const verifyOnboarding = async () => {
      // 1. If profile is already populated in Redux store
      if (profile) {
        if (profile.isOnboarded === true) {
          if (isMounted) {
            setIsOnboardedVerified(true);
            setIsVerifying(false);
          }
        } else {
          router.replace("/brand/onboarding");
        }
        return;
      }

      // 2. Profile not yet loaded into Redux (e.g. direct URL visit or page refresh)
      try {
        const response = await dispatch(getBrandProfile()).unwrap();
        const profileData = response?.data || response;
        if (!isMounted) return;

        if (profileData?.isOnboarded === true) {
          setIsOnboardedVerified(true);
          setIsVerifying(false);
        } else {
          router.replace("/brand/onboarding");
        }
      } catch (err) {
        if (!isMounted) return;

        // If the fetch was aborted because another component (e.g. BrandHeader)
        // already has an in-flight request, do not redirect. Redux will update
        // when that request completes and re-trigger this effect via [profile].
        const isConditionAbort =
          err?.name === "ConditionError" ||
          (typeof err?.message === "string" &&
            err.message.includes("condition callback returning false"));
        if (isConditionAbort) {
          return;
        }

        const errMsg = typeof err === "string" ? err.toLowerCase() : "";
        if (
          errMsg.includes("unauthorized") ||
          errMsg.includes("401") ||
          errMsg.includes("token") ||
          errMsg.includes("log in")
        ) {
          router.replace("/login");
        } else {
          // If no profile exists (404) or onboarding incomplete, redirect to onboarding
          router.replace("/brand/onboarding");
        }
      }
    };

    verifyOnboarding();

    return () => {
      isMounted = false;
    };
  }, [dispatch, profile, router]);

  // Fetch dashboard overview only after onboarding is verified
  useEffect(() => {
    if (isOnboardedVerified && !hasFetchedDashboardRef.current) {
      hasFetchedDashboardRef.current = true;
      handleFetchDashboard();
    }
  }, [isOnboardedVerified, handleFetchDashboard]);

  // Real-time synchronization for dashboard metrics, campaign applicants, and deadlines
  useEffect(() => {
    const brandId = authUser?._id || authUser?.id;
    if (!brandId || !isOnboardedVerified) return;

    const consumerId = "brand_dashboard_overview_consumer";
    registerSocketConsumer(consumerId, brandId);

    const handleRealtimeUpdate = () => {
      handleFetchDashboard();
    };

    socket.on("notification:new", handleRealtimeUpdate);
    socket.on("workspace:approved", handleRealtimeUpdate);
    socket.on("workspace:deliverable_submitted", handleRealtimeUpdate);
    socket.on("workspace:revision_requested", handleRealtimeUpdate);

    return () => {
      unregisterSocketConsumer(consumerId);
      socket.off("notification:new", handleRealtimeUpdate);
      socket.off("workspace:approved", handleRealtimeUpdate);
      socket.off("workspace:deliverable_submitted", handleRealtimeUpdate);
      socket.off("workspace:revision_requested", handleRealtimeUpdate);
    };
  }, [authUser, isOnboardedVerified, handleFetchDashboard]);

  // If dashboard overview API returns 403 or onboarding rejection, redirect immediately
  useEffect(() => {
    if (error) {
      const errStr = typeof error === "string" ? error.toLowerCase() : "";
      if (errStr.includes("onboarding") || errStr.includes("403")) {
        router.replace("/brand/onboarding");
      }
    }
  }, [error, router]);

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
        <main className="flex-1 w-full px-3 sm:px-5 lg:px-4 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-5 space-y-4 sm:space-y-5 max-w-[1536px] mx-auto min-w-0">
          {/* While verifying onboarding status or waiting for verification, render skeleton */}
          {isVerifying || !isOnboardedVerified ? (
            <DashboardSkeleton />
          ) : (
            <>
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
                    timeframe={timeframe}
                    onTimeframeChange={handleTimeframeChange}
                    dashboardLoading={loading}
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
            </>
          )}
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
