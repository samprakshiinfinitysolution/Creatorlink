"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";

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

export default function BrandPlansCheckout() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Fetch available plans & current subscription
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansRes, subRes] = await Promise.allSettled([
          axiosInstance.get("/subscriptions/plans"),
          axiosInstance.get("/subscriptions/current"),
        ]);

        if (plansRes.status === "fulfilled" && plansRes.value.data?.success && isMounted) {
          setPlans(plansRes.value.data.data || []);
        }
        if (subRes.status === "fulfilled" && subRes.value.data?.success && isMounted) {
          setCurrentSubscription(subRes.value.data.data);
        }
      } catch (err) {
        console.error("Failed to load plans:", err);
        if (isMounted) setError("Failed to load available subscription plans.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubscribe = async (plan) => {
    setSelectedPlan(plan);
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
        description: `${plan.name} (${billingCycle.toUpperCase()}) Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.brand?.name || "",
          email: orderData.brand?.email || "",
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

            if (verifyRes.data?.success) {
              setSuccessData({
                plan: plan.name,
                billingCycle,
                paymentId: response.razorpay_payment_id,
              });
            }
          } catch (verifyErr) {
            console.error("Verification failed:", verifyErr);
            setError(verifyErr.response?.data?.message || "Payment verification failed. Please contact support.");
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Subscription checkout error:", err);
      setError(err.response?.data?.message || err.message || "Failed to initialize checkout.");
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <BrandHeader setMobileOpen={setMobileOpen} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-6xl w-full mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-bold text-[11px] tracking-wider uppercase text-purple-600 dark:text-purple-400">
              BRAND MEMBERSHIP
            </span>
            <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-foreground tracking-wide">
              Scale Your Influencer Partnerships
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Unlock verified creator contact details, launch multi-channel campaigns, and streamline collaboration workflows.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="pt-4 flex items-center justify-center">
              <div className="inline-flex items-center p-1 rounded-xl bg-surface border border-border-theme shadow-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    billingCycle === "monthly"
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                      : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === "yearly"
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                      : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  <span>Yearly Billing</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                    Save ~17%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 max-w-2xl mx-auto text-center">
              {error}
            </div>
          )}

          {/* Success Modal */}
          {successData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-surface border border-border-theme rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-foreground">Subscription Activated!</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  You have successfully subscribed to <strong className="text-foreground">{successData.plan}</strong> ({successData.billingCycle}).
                  Your creator contact unlocks and campaign capabilities are now fully active.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/brand/subscription")}
                    className="w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    Go to Subscription Dashboard →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-surface border border-border-theme"></div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center p-12 rounded-2xl bg-surface border border-border-theme text-xs text-text-secondary max-w-md mx-auto space-y-2">
              <p className="font-semibold text-foreground text-sm">No Paid Plans Configured</p>
              <p>Administration has not published any active paid tiers yet. Your 5-day free trial remains active.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan) => {
                const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
                const isCurrentPlan = currentSubscription?.planSnapshot?.slug === plan.slug && currentSubscription?.status === "active";

                return (
                  <div
                    key={plan._id}
                    className={`p-6 rounded-2xl bg-surface border flex flex-col justify-between transition-all relative ${
                      isCurrentPlan
                        ? "border-purple-500 shadow-md ring-2 ring-purple-500/20"
                        : "border-border-theme shadow-xs hover:shadow-md"
                    }`}
                  >
                    {isCurrentPlan && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white">
                        Active Plan
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-serif font-bold text-xl text-foreground">{plan.name}</h3>
                        <p className="text-xs text-text-secondary mt-1 min-h-[32px]">{plan.description}</p>
                      </div>

                      <div className="pt-2 pb-1 border-b border-border-theme">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold font-serif text-foreground">
                            {plan.currency} {price.toLocaleString()}
                          </span>
                          <span className="text-xs text-text-secondary">
                            / {billingCycle === "yearly" ? "year" : "month"}
                          </span>
                        </div>
                        <span className="text-[11px] text-text-secondary block mt-0.5">
                          {plan.monthlyContactQuota} Creator Contact Unlocks / month
                        </span>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-2.5 text-xs text-foreground pt-1">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span><strong>{plan.monthlyContactQuota}</strong> Creator Unlocks per month</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>Unlimited Campaign Creation & Publishing</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>Interactive Workspace Collaborations</span>
                        </li>
                        {Array.isArray(plan.features) &&
                          plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => handleSubscribe(plan)}
                        disabled={checkoutLoading || isCurrentPlan}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
                          isCurrentPlan
                            ? "bg-surface-muted text-text-secondary cursor-not-allowed"
                            : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
                        }`}
                      >
                        {isCurrentPlan ? "Current Plan" : checkoutLoading && selectedPlan?._id === plan._id ? "Processing Order..." : `Select ${plan.name}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Trust Banner */}
          <div className="p-6 rounded-2xl bg-surface-muted/30 border border-border-theme grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
            <div>
              <span className="font-bold text-foreground block mb-0.5">Zero Automatic Rollover</span>
              <span className="text-text-secondary">Free trials never charge automatically. You choose when to upgrade.</span>
            </div>
            <div>
              <span className="font-bold text-foreground block mb-0.5">Permanent Unlocks</span>
              <span className="text-text-secondary">Repeated unlocks of the same creator never consume extra quota.</span>
            </div>
            <div>
              <span className="font-bold text-foreground block mb-0.5">Secured by Razorpay</span>
              <span className="text-text-secondary">Industry standard 256-bit SSL encrypted payment verification.</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

