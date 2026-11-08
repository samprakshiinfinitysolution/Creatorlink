"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { getCreatorProfile } from "@/redux/creator/profile/profile_slice";
import { socket, registerSocketConsumer, unregisterSocketConsumer } from "@/lib/socket";

function CreatorDashboardContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isOnboardedVerified, setIsOnboardedVerified] = useState(false);
  const hasFetchedDashboardRef = useRef(false);

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
          router.replace("/creator/onboarding");
        }
        return;
      }

      // 2. Profile not yet loaded into Redux (e.g. direct URL visit or page refresh)
      try {
        const response = await dispatch(getCreatorProfile()).unwrap();
        const profileData = response?.data || response;
        if (!isMounted) return;

        if (profileData?.isOnboarded === true) {
          setIsOnboardedVerified(true);
          setIsVerifying(false);
        } else {
          router.replace("/creator/onboarding");
        }
      } catch (err) {
        if (!isMounted) return;
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
          router.replace("/creator/onboarding");
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

  // Real-time synchronization for dashboard metrics, recent collaborations, and reviews
  useEffect(() => {
    const creatorId = user?._id || user?.id;
    if (!creatorId || !isOnboardedVerified) return;

    const consumerId = "creator_dashboard_overview_consumer";
    registerSocketConsumer(consumerId, creatorId);

    const handleRealtimeUpdate = (data) => {
      // Re-fetch overview when relevant notifications, deliverables or status events occur
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
  }, [user, isOnboardedVerified, handleFetchDashboard]);

  // If dashboard overview API returns 403 or onboarding rejection, redirect immediately
  useEffect(() => {
    if (error) {
      const errStr = typeof error === "string" ? error.toLowerCase() : "";
      if (errStr.includes("onboarding") || errStr.includes("403")) {
        router.replace("/creator/onboarding");
      }
    }
  }, [error, router]);

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
          {/* While verifying onboarding status or waiting for verification, render skeleton */}
          {isVerifying || !isOnboardedVerified ? (
            <CreatorDashboardSkeleton />
          ) : error && !dashboard ? (
            /* Case 1: First request failed and no cached data exists */
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
