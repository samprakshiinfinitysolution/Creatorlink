"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";

export default function BrandSubscriptionDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [statusRes, billingRes, paymentsRes, historyRes, unlocksRes] = await Promise.allSettled([
          axiosInstance.get("/subscriptions/status"),
          axiosInstance.get("/subscriptions/billing"),
          axiosInstance.get("/subscriptions/payments"),
          axiosInstance.get("/subscriptions/history"),
          axiosInstance.get("/subscriptions/unlocks"),
        ]);

        if (statusRes.status === "fulfilled" && statusRes.value.data?.success && isMounted) {
          setStatusData(statusRes.value.data.data);
        }
        if (statusRes.status === "fulfilled" && statusRes.value.data?.success && isMounted) {
          const sData = statusRes.value.data.data;
          setStatusData(sData);

          const targetDate = sData?.isTrial ? sData?.trialEndDate : sData?.currentPeriodEnd;
          if (targetDate) {
            const diffMs = new Date(targetDate).getTime() - Date.now();
            setDaysLeft(Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))));
          } else {
            setDaysLeft(0);
          }
        }
        if (paymentsRes.status === "fulfilled" && paymentsRes.value.data?.success && isMounted) {
          setPayments(paymentsRes.value.data.data || []);
        }
        if (unlocksRes.status === "fulfilled" && unlocksRes.value.data?.success && isMounted) {
          setUnlockedCount((unlocksRes.value.data.data || []).length);
        }
      } catch (err) {
        console.error("Failed to load subscription dashboard:", err);
        if (isMounted) setError("Failed to load subscription dashboard details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, []);

  const isTrial = statusData?.isTrial;
  const isExpired = statusData?.isExpired;
  const isActive = statusData?.hasEntitlement;

  const totalQuota = statusData?.totalContactQuota || 0;
  const usedQuota = statusData?.usedContactQuota || 0;
  const remainingQuota = statusData?.remainingContactQuota || 0;
  const quotaPercent = totalQuota > 0 ? Math.min(100, Math.round((usedQuota / totalQuota) * 100)) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <BrandHeader setMobileOpen={setMobileOpen} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="mb-1">
                <span className="font-bold text-[11px] tracking-wider uppercase text-purple-600 dark:text-purple-400">
                  MEMBERSHIP & BILLING
                </span>
              </div>
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-foreground tracking-wide">
                Subscription & Quota
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Monitor your active entitlements, remaining creator unlock quota, and billing cycles.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Link
                href="/brand/subscription/unlocked"
                className="px-4 py-2.5 rounded-xl border border-border-theme hover:bg-surface-muted text-foreground text-xs font-semibold tracking-wide transition-colors"
              >
                Unlocked Creators ({unlockedCount})
              </Link>
              <Link
                href="/brand/subscription/plans"
                className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity shadow-xs"
              >
                {isExpired ? "Reactivate Subscription" : "Upgrade Plan"}
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Expiration Notice Banner if expired */}
          {isExpired && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-300">
                    Your {isTrial ? "5-Day Free Trial" : "Subscription"} Has Expired
                  </span>
                  <p className="text-amber-800 dark:text-amber-400 mt-0.5">
                    Your campaigns are currently paused from receiving new applications, and direct contact unlocks are restricted.
                    Ongoing workspace collaborations and active deliverables continue uninterrupted.
                  </p>
                </div>
              </div>
              <Link
                href="/brand/subscription/plans"
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold whitespace-nowrap text-center hover:bg-amber-700 transition-colors"
              >
                Upgrade to Unlock ↗
              </Link>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              <div className="h-44 bg-surface rounded-2xl border border-border-theme"></div>
              <div className="h-44 bg-surface rounded-2xl border border-border-theme"></div>
              <div className="h-44 bg-surface rounded-2xl border border-border-theme"></div>
            </div>
          ) : (
            <>
              {/* Primary Telemetry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Status & Current Plan */}
                <div className="p-6 rounded-2xl bg-surface border border-border-theme shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Current Plan
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                            : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                        }`}
                      >
                        {statusData?.status || "None"}
                      </span>
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-foreground mt-2">
                      {statusData?.planSnapshot?.name || (isTrial ? "5-Day Free Trial" : "No Active Plan")}
                    </h2>
                    <p className="text-xs text-text-secondary mt-1">
                      Billing cycle: <span className="capitalize font-medium text-foreground">{statusData?.billingCycle || "None"}</span>
                      {statusData?.isComplimentary && " • Complimentary Grant"}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-theme flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Entitlement Access</span>
                    <span className="font-semibold text-foreground">
                      {isActive ? "Campaigns & Unlocks Enabled" : "Read-Only Marketplace"}
                    </span>
                  </div>
                </div>

                {/* 2. Contact Unlock Quota */}
                <div className="p-6 rounded-2xl bg-surface border border-border-theme shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Creator Contact Quota
                      </span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {remainingQuota} Remaining
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-serif font-bold text-foreground">{usedQuota}</span>
                      <span className="text-sm text-text-secondary">/ {totalQuota} Unlocks Used</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden mt-3">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${quotaPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-theme flex items-center justify-between text-xs text-text-secondary">
                    <span>{isTrial ? "Fixed 5-Day Trial Quota" : "Resets Monthly by UTC"}</span>
                    <Link href="/brand/subscription/plans" className="text-purple-600 font-semibold hover:underline">
                      Add Quota ↗
                    </Link>
                  </div>
                </div>

                {/* 3. Timing / Countdown */}
                <div className="p-6 rounded-2xl bg-surface border border-border-theme shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        {isTrial ? "Trial Countdown" : "Renewal Cycle"}
                      </span>
                      <span className="text-xs font-medium text-text-secondary">
                        {daysLeft > 0 ? `${daysLeft} Days Left` : "Cycle Ended"}
                      </span>
                    </div>

                    <div className="mt-2">
                      <span className="text-2xl font-serif font-bold text-foreground">
                        {daysLeft > 0 ? `${daysLeft} Days Remaining` : "Needs Renewal"}
                      </span>
                      <p className="text-xs text-text-secondary mt-1">
                        {isTrial
                          ? `Expires on ${new Date(statusData?.trialEndDate).toLocaleDateString()}`
                          : `Valid through ${new Date(statusData?.currentPeriodEnd).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-theme flex items-center justify-between text-xs text-text-secondary">
                    <span>Server UTC Synchronized</span>
                    <span>No Automatic Charge</span>
                  </div>
                </div>
              </div>

              {/* Payment History Section */}
              <section className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Subscription Payment Ledger</h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Verified records of your subscription purchases and renewals.
                    </p>
                  </div>
                </div>

                {payments.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-surface-muted/30 border border-border-theme text-xs text-text-secondary">
                    No payment transactions recorded yet. Free trial does not require any payment method.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border-theme text-text-secondary font-medium">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Plan</th>
                          <th className="py-2.5 px-3">Billing Cycle</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Order ID</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-theme">
                        {payments.map((p) => (
                          <tr key={p._id} className="hover:bg-surface-muted/30">
                            <td className="py-3 px-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-3 font-semibold text-foreground">{p.plan?.name || "Subscription Plan"}</td>
                            <td className="py-3 px-3 capitalize">{p.billingCycle}</td>
                            <td className="py-3 px-3 font-bold text-foreground">
                              {p.currency} {p.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-text-secondary">{p.razorpayOrderId}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

