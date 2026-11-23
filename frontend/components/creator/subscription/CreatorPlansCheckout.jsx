"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

// =========================================================
// DYNAMIC RAZORPAY SCRIPT LOADER
// =========================================================
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// =========================================================
// SVG ICONS
// =========================================================
function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function TicketIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

export default function CreatorPlansCheckout() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPlansAndCurrent = async () => {
      try {
        setLoading(true);
        setError(null);
        setSubscriptionError(null);
        // Clear previous stale plans on new fetch/retry so old data is not misleadingly shown
        setPlans([]);
        setCurrentSubscription(null);

        const [plansRes, currentRes] = await Promise.allSettled([
          axiosInstance.get("/subscriptions/creator/plans"),
          axiosInstance.get("/subscriptions/creator/current"),
        ]);

        if (isMounted) {
          // 1. Process Plans Response
          if (plansRes.status === "fulfilled" && plansRes.value.data?.success) {
            setPlans(plansRes.value.data.data || []);
          } else {
            setPlans([]);
            const errorMsg =
              plansRes.status === "rejected"
                ? plansRes.reason?.response?.data?.message || plansRes.reason?.message || "Failed to load Creator plans"
                : plansRes.value?.data?.message || "Failed to load Creator plans";
            setError(errorMsg);
          }

          // 2. Process Current Subscription Response safely
          if (currentRes.status === "fulfilled" && currentRes.value.data?.success) {
            setCurrentSubscription(currentRes.value.data.data);
            setSubscriptionError(null);
          } else {
            setCurrentSubscription(null);
            const subErrMsg =
              currentRes.status === "rejected"
                ? currentRes.reason?.response?.data?.message || currentRes.reason?.message || "Failed to verify current subscription status."
                : currentRes.value?.data?.message || "Failed to verify current subscription status.";
            setSubscriptionError(subErrMsg);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load Creator plans:", err);
          setError("Failed to load available plans. Please refresh the page.");
          setPlans([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlansAndCurrent();

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  // Format INR Currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // Razorpay Checkout Execution
  const handleSubscribe = async (plan) => {
    // Safety guard: Block checkout if current subscription status failed to load
    if (subscriptionError) {
      setError("Cannot proceed with checkout while current subscription status is unverified. Please retry verification.");
      return;
    }

    setSelectedPlanId(plan._id);
    setCheckoutLoading(true);
    setError(null);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setError("Razorpay SDK failed to load. Please check your internet connection.");
      setCheckoutLoading(false);
      return;
    }

    try {
      // 1. Create Order on Backend
      const orderRes = await axiosInstance.post("/subscriptions/payment/order", {
        planId: plan._id,
        billingCycle,
      });

      if (!orderRes.data?.success || !orderRes.data?.data) {
        throw new Error(orderRes.data?.message || "Order creation failed");
      }

      const orderData = orderRes.data.data;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "CreatorLink",
        description: `${plan.name} (${billingCycle.toUpperCase()}) Creator Membership`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.subscriber?.name || orderData.user?.name || orderData.brand?.name || "",
          email: orderData.subscriber?.email || orderData.user?.email || orderData.brand?.email || "",
        },
        theme: {
          color: "#000000",
        },
        handler: async (response) => {
          try {
            setCheckoutLoading(true);

            // 3. Verify Payment Signature on Backend
            const verifyRes = await axiosInstance.post("/subscriptions/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Explicitly handle failure response so errors are never silently ignored
            if (!verifyRes.data?.success) {
              throw new Error(verifyRes.data?.message || "Payment verification failed. Please contact support.");
            }

            // 4. Proactively refresh current subscription data immediately
            try {
              const refreshed = await axiosInstance.get("/subscriptions/creator/current");
              if (refreshed.data?.success && refreshed.data?.data) {
                setCurrentSubscription(refreshed.data.data);
                setSubscriptionError(null);
              }
            } catch (refreshErr) {
              console.warn("Could not pre-refresh subscription data:", refreshErr);
            }

            setSuccessData({
              planName: plan.name,
              billingCycle,
              paymentId: response.razorpay_payment_id,
              creditsGranted: plan.monthlyApplicationCredits || 0,
            });
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setError(verifyErr.response?.data?.message || verifyErr.message || "Payment verification failed. Please contact support.");
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false);
            setSelectedPlanId(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Subscription checkout error:", err);
      setError(err.response?.data?.message || err.message || "Failed to initialize checkout.");
      setCheckoutLoading(false);
      setSelectedPlanId(null);
    }
  };

  // Check active plan and button state
  const getPlanButtonState = (plan) => {
    // If current subscription status could not be verified, block purchasing safely
    if (subscriptionError) {
      return {
        label: "Verification Required",
        disabled: true,
        isCurrent: false,
        badgeText: null,
      };
    }

    const hasActiveSubscription = currentSubscription && currentSubscription.status === "active";
    const currentPlanId = currentSubscription?.plan?._id || currentSubscription?.plan;
    const isSamePlan = String(currentPlanId) === String(plan._id);
    const isSameCycle = currentSubscription?.billingCycle === billingCycle;

    if (hasActiveSubscription && isSamePlan && isSameCycle) {
      return {
        label: "Current Active Plan",
        disabled: true,
        isCurrent: true,
        badgeText: "Current Plan",
      };
    }

    if (hasActiveSubscription && isSamePlan && !isSameCycle) {
      return {
        label: billingCycle === "yearly" ? "Switch to Yearly Billing" : "Switch to Monthly Billing",
        disabled: false,
        isCurrent: false,
        badgeText: `Active (${currentSubscription.billingCycle})`,
      };
    }

    if (hasActiveSubscription && !isSamePlan) {
      return {
        label: `Switch to ${plan.name}`,
        disabled: false,
        isCurrent: false,
        badgeText: null,
      };
    }

    return {
      label: `Subscribe to ${plan.name}`,
      disabled: false,
      isCurrent: false,
      badgeText: null,
    };
  };

  return (
    <div className="min-h-screen bg-surface-muted/20 text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <CreatorHeader setMobileOpen={setMobileOpen} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-6xl w-full mx-auto">
          {/* Navigation Back */}
          <div>
            <Link
              href="/creator/subscription"
              className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Back to Subscription Dashboard</span>
            </Link>
          </div>

          {/* Header Title */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-bold text-[10px] tracking-wider uppercase text-secondary">
              CREATOR MEMBERSHIP PLANS
            </span>
            <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-foreground tracking-wide">
              Unlock Campaign Pitching & Applications
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Choose the right Creator plan to receive guaranteed monthly application credits, submit pitches directly to brand campaigns, and access collaborative workspaces.
            </p>

            {/* Monthly / Yearly Billing Toggle */}
            <div className="pt-4 flex items-center justify-center">
              <div className="p-1 rounded-2xl bg-surface border border-border-theme inline-flex items-center shadow-2xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${billingCycle === "monthly"
                    ? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                    : "text-text-secondary hover:text-foreground"
                    }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${billingCycle === "yearly"
                    ? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                    : "text-text-secondary hover:text-foreground"
                    }`}
                >
                  <span>Yearly Billing</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    Annual Discount
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner when plans already exist */}
          {error && plans.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="font-bold hover:underline cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Subscription Status Warning Banner */}
          {subscriptionError && plans.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2">
                <span className="font-bold shrink-0">⚠️ Notice:</span>
                <span>{subscriptionError} Plan purchase is paused to prevent duplicate or incorrect orders until your status is verified.</span>
              </div>
              <button
                type="button"
                onClick={() => setRetryTrigger((prev) => prev + 1)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold cursor-pointer shrink-0 transition-colors text-center"
              >
                Retry Verification
              </button>
            </div>
          )}

          {/* SUCCESS MODAL AFTER PAYMENT VERIFICATION */}
          {successData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-surface border border-border-theme rounded-2xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 text-2xl font-bold">
                  ✓
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-semibold text-2xl text-foreground">
                    Subscription Activated!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    You have successfully subscribed to <strong>{successData.planName}</strong> ({successData.billingCycle.toUpperCase()}).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted/50 border border-border-theme text-xs space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Payment ID:</span>
                    <span className="font-mono font-medium text-foreground truncate max-w-[200px]">
                      {successData.paymentId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Credits Allocated:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      +{successData.creditsGranted} Application Credits
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary pt-1 border-t border-border-theme leading-normal">
                    {successData.billingCycle === "yearly"
                      ? "Month 1 credit allowance granted immediately. Remaining monthly credits will be granted recurring on each month's anniversary date."
                      : "Monthly credits have been deposited into your balance."}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/creator/subscription")}
                    className="flex-1 py-3 rounded-xl bg-neutral-950 text-white text-xs font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 cursor-pointer dark:bg-white dark:text-black dark:border-white"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/creator/campaigns/discover")}
                    className="flex-1 py-3 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Browse Campaigns
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOADING SKELETON */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              <div className="h-96 bg-surface rounded-2xl border border-border-theme" />
              <div className="h-96 bg-surface rounded-2xl border border-border-theme" />
              <div className="h-96 bg-surface rounded-2xl border border-border-theme" />
            </div>
          ) : error && plans.length === 0 ? (
            /* DEDICATED ERROR CARD WITH RETRY */
            <div className="p-10 text-center rounded-2xl bg-surface border border-rose-500/30 max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-lg text-foreground">
                  Unable to Load Plans
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {error}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRetryTrigger((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-900 transition-all cursor-pointer dark:bg-white dark:text-neutral-950"
              >
                Retry Loading Plans
              </button>
            </div>
          ) : plans.length === 0 ? (
            /* EMPTY STATE */
            <div className="p-12 text-center rounded-2xl bg-surface border border-border-theme space-y-3">
              <SparklesIcon className="w-8 h-8 text-text-secondary mx-auto" />
              <h3 className="font-serif font-medium text-xl text-foreground">
                No Plans Available
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Creator subscription plans are currently being configured. Please check back shortly.
              </p>
            </div>
          ) : (
            /* PLANS PRICING GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan._id;
                const buttonState = getPlanButtonState(plan);
                const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
                const credits = plan.monthlyApplicationCredits || 0;

                return (
                  <div
                    key={plan._id}
                    className={`relative p-6 sm:p-7 rounded-2xl bg-surface border transition-all flex flex-col justify-between shadow-xs ${buttonState.isCurrent
                      ? "border-emerald-500 shadow-emerald-500/10"
                      : "border-border-theme hover:border-secondary/50 hover:shadow-md"
                      }`}
                  >
                    {/* Badge if current plan */}
                    {buttonState.badgeText && (
                      <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider shadow-xs">
                        {buttonState.badgeText}
                      </span>
                    )}

                    <div className="space-y-5">
                      {/* Plan Header */}
                      <div className="space-y-1.5">
                        <h3 className="font-serif font-semibold text-2xl text-foreground tracking-wide">
                          {plan.name}
                        </h3>
                        {plan.description && (
                          <p className="text-xs text-text-secondary leading-relaxed min-h-[36px]">
                            {plan.description}
                          </p>
                        )}
                      </div>

                      {/* Pricing Tag */}
                      <div className="p-4 rounded-xl bg-surface-muted/40 border border-border-theme space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="font-sans font-bold text-3xl sm:text-4xl text-foreground">
                            {formatPrice(price)}
                          </span>
                          <span className="text-xs text-text-secondary font-medium">
                            / {billingCycle === "yearly" ? "year" : "month"}
                          </span>
                        </div>
                        {billingCycle === "yearly" && plan.priceMonthly > 0 && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
                            Equiv. ~{formatPrice(Math.round(plan.priceYearly / 12))}/month
                          </span>
                        )}
                      </div>

                      {/* Application Credits Highlight */}
                      <div className="p-3.5 rounded-xl bg-secondary/10 border border-secondary/20 space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <TicketIcon className="w-4 h-4 text-secondary shrink-0" />
                            <span className="text-xs font-semibold text-foreground">
                              Application Allowance
                            </span>
                          </div>
                          <span className="text-xs font-bold text-secondary">
                            {credits} Credits / Month
                          </span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-normal">
                          {billingCycle === "yearly"
                            ? "Granted monthly on each billing cycle date (Month 1 allocated immediately, not all 12 months upfront)."
                            : "Granted every monthly billing cycle for campaign pitching."}
                        </p>
                      </div>

                      {/* Feature List */}
                      {Array.isArray(plan.features) && plan.features.length > 0 && (
                        <div className="space-y-2.5 pt-2">
                          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                            Included Perks
                          </span>
                          <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed"
                              >
                                <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Subscription Action Button */}
                    <div className="pt-6 mt-6 border-t border-border-theme">
                      {buttonState.disabled ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 rounded-xl bg-surface-muted text-text-secondary text-xs font-semibold border border-border-theme cursor-default"
                        >
                          {buttonState.label}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={checkoutLoading}
                          onClick={() => handleSubscribe(plan)}
                          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-950 text-white text-xs font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:border-white dark:hover:bg-neutral-200"
                        >
                          {isSelected && checkoutLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin dark:border-black" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="w-3.5 h-3.5 text-secondary" />
                              <span>{buttonState.label}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Secure Payment Footer Note */}
          <div className="text-center text-[11px] text-text-secondary pt-4 flex items-center justify-center gap-2">
            <span>🔒 Secured by Razorpay Payments</span>
            <span>•</span>
            <span>Monthly Application Credit Allocation</span>
            <span>•</span>
            <span>Cancel Anytime</span>
          </div>
        </main>
      </div>
    </div>
  );
}
