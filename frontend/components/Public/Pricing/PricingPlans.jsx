"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/theme/ScrollReveal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

const formatINR = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function PricingPlans() {
  const [audienceTab, setAudienceTab] = useState("brands"); // "brands" | "creators"
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin configured plans dynamically
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/subscriptions/plans`);
      if (!res.ok) {
        throw new Error(`Failed to load plans: HTTP ${res.status}`);
      }
      const data = await res.json();
      const planList = Array.isArray(data?.data) ? data.data : [];
      setPlans(planList);
    } catch (err) {
      console.error("Error fetching subscription plans:", err);
      setError("Unable to load the latest pricing plans at this moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Separate Brand plans and optional Creator plans
  const brandPlans = plans.filter(
    (p) => !p.targetRole || p.targetRole === "brand"
  );
  const creatorPlans = plans.filter((p) => p.targetRole === "creator");

  // Check if yearly billing option is supported across plans
  const hasYearlyOption = brandPlans.some(
    (p) => typeof p.priceYearly === "number" && p.priceYearly > 0
  );

  return (
    <section className="relative overflow-hidden bg-background text-foreground pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-24 px-2 sm:px-4 lg:px-6 border-b border-border-theme/60 transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-[550px] w-[800px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="w-full max-w-[1480px] mx-auto relative z-10 px-1 sm:px-2">
        
        {/* =========================================================
            1. TOP HERO SECTION: PROMINENT, EQUALLY ALIGNED IMAGE & CONTENT
        ========================================================= */}
        <div className="w-full mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-stretch">
            
            {/* LEFT COLUMN: HERO CONTENT (Large, Spacious & Aligned) */}
            <ScrollReveal
              direction="up"
              delay={0}
              className="lg:col-span-7 flex flex-col justify-center text-left"
            >
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 bg-secondary/15 dark:bg-secondary/20 border border-pink-200/80 dark:border-pink-500/20 rounded-full px-4 py-1.5 mb-5 shadow-xs self-start">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-foreground font-sans">
                  SIMPLE &amp; TRANSPARENT PRICING
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.12] mb-4">
                The Right Plan for Every Collaboration.
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-4 max-w-2xl">
                Whether you&apos;re a brand looking to build creator campaigns or a creator ready to explore new opportunities, CreatorLink offers flexible options to help you get started.
              </p>

              {/* Supporting Line */}
              <p className="text-sm sm:text-base font-semibold text-secondary dark:text-pink-300 font-sans mb-6">
                Clear pricing for brands. Flexible access for creators.
              </p>

              {/* 3 Core Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-200/80 dark:border-white/10 font-sans">
                <div className="flex items-center gap-2.5 bg-white/70 dark:bg-surface/70 border border-slate-200/70 dark:border-white/10 rounded-2xl p-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    5-Day Free Brand Trial
                  </span>
                </div>

                <div className="flex items-center gap-2.5 bg-white/70 dark:bg-surface/70 border border-slate-200/70 dark:border-white/10 rounded-2xl p-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Free to Join for Creators
                  </span>
                </div>

                <div className="flex items-center gap-2.5 bg-white/70 dark:bg-surface/70 border border-slate-200/70 dark:border-white/10 rounded-2xl p-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Zero Hidden Markup
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* RIGHT COLUMN: LARGE EDITORIAL IMAGE SHOWCASE (Matched Height & Symmetrical) */}
            <ScrollReveal
              direction="up"
              delay={40}
              className="lg:col-span-5 w-full flex"
            >
              <div className="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-xl bg-slate-900 min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col justify-between p-6 sm:p-8 group">
                {/* Background Image */}
                <Image
                  src="https://res.cloudinary.com/atr5osne/image/upload/v1792054714/creatorlink/public/editorial/se3wpecdot8jphnowzci.webp"
                  alt="CreatorLink Creator Collaboration"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out"
                  priority
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60 pointer-events-none" />

                {/* Top Floating Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-[11px] font-extrabold uppercase tracking-wider font-sans shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    DIRECT BRAND-CREATOR LINK
                  </span>
                  <span className="text-white/80 text-[11px] font-semibold font-sans bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    Verified Workflows
                  </span>
                </div>

                {/* Bottom Glass Overlay Card */}
                <div className="relative z-10 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-5 text-white text-left shadow-2xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-secondary text-sm">✦</span>
                    <span className="text-[11px] uppercase font-extrabold tracking-widest text-pink-200 font-sans">
                      COLLABORATION PLATFORM
                    </span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight mb-1.5 text-white">
                    Where Brands &amp; Creators Build Together.
                  </h3>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    Transparent budgets, direct creator messaging, and complete campaign management in one unified space.
                  </p>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>

        {/* =========================================================
            2. BOTTOM PRICING SECTION: EXACTLY AS IN USER SCREENSHOT
        ========================================================= */}
        <div className="w-full pt-8 sm:pt-10 border-t border-slate-200/80 dark:border-white/10">
          
          {/* Top Bar: Left = Tabs [For Brands | For Creators], Right = Monthly / Yearly Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            
            {/* Audience Tabs */}
            <div className="bg-slate-200/70 dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-full p-1.5 inline-flex items-center gap-1 shadow-inner self-start">
              <button
                type="button"
                onClick={() => setAudienceTab("brands")}
                className={`px-6 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-sans font-semibold transition-all duration-200 cursor-pointer ${
                  audienceTab === "brands"
                    ? "bg-slate-900 dark:bg-white dark:text-slate-950 text-white shadow-xs"
                    : "text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                For Brands
              </button>
              <button
                type="button"
                onClick={() => setAudienceTab("creators")}
                className={`px-6 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-sans font-semibold transition-all duration-200 cursor-pointer ${
                  audienceTab === "creators"
                    ? "bg-slate-900 dark:bg-white dark:text-slate-950 text-white shadow-xs"
                    : "text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                For Creators
              </button>
            </div>

            {/* Billing Toggle (Monthly / Yearly) */}
            {audienceTab === "brands" && hasYearlyOption && (
              <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-surface border border-slate-200/80 dark:border-white/10 px-4 py-2 rounded-full shadow-2xs self-start sm:self-auto">
                <span
                  className={`text-xs sm:text-sm font-semibold font-sans ${
                    !isYearly
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-text-muted"
                  }`}
                >
                  Monthly
                </span>
                <button
                  type="button"
                  onClick={() => setIsYearly(!isYearly)}
                  className="w-11 h-6 bg-slate-300 dark:bg-white/20 rounded-full relative p-0.5 transition-colors duration-200 cursor-pointer"
                  aria-label="Toggle Billing Frequency"
                >
                  <div
                    className={`w-5 h-5 bg-secondary rounded-full shadow-sm transform transition-transform duration-200 ${
                      isYearly ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span
                  className={`text-xs sm:text-sm font-semibold font-sans ${
                    isYearly
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-text-muted"
                  }`}
                >
                  Yearly
                </span>
              </div>
            )}

          </div>

          {/* Subtitle Description below the bar */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 sm:mb-10 text-left max-w-3xl">
            {audienceTab === "brands"
              ? "Choose a plan that fits your campaign goals and business needs. Every eligible brand plan includes a 5-day free trial, subject to the configured trial rules."
              : "Join CreatorLink, showcase your work and explore brand opportunities. A paid creator subscription is optional, not compulsory."}
          </p>

          {/* =======================================================
              BRAND PRICING CARDS (Matches User Screenshot)
          ======================================================= */}
          {audienceTab === "brands" && (
            <div>
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs sm:text-sm text-slate-500 font-sans">
                    Loading active brand subscription plans...
                  </p>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="bg-rose-50 dark:bg-surface border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 text-center max-w-md mx-auto my-6">
                  <p className="text-sm text-rose-700 dark:text-rose-400 font-medium mb-3">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={fetchPlans}
                    className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white text-xs font-semibold hover:bg-secondary transition-colors"
                  >
                    Retry Loading Plans
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && brandPlans.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No active brand plans are currently published. Please check back shortly.
                </div>
              )}

              {/* Dynamic Brand Pricing Cards Grid */}
              {!loading && !error && brandPlans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                  {brandPlans.map((plan, idx) => {
                    const displayPrice =
                      isYearly && plan.priceYearly
                        ? plan.priceYearly
                        : plan.priceMonthly;
                    const billingPeriodLabel =
                      isYearly && plan.priceYearly ? "/year" : "/month";

                    // Clean features array
                    const cleanFeatures = (plan.features || []).filter(
                      (f) =>
                        f &&
                        typeof f === "string" &&
                        !f.toLowerCase().includes("features (one per line)") &&
                        f.trim().length > 0
                    );

                    return (
                      <ScrollReveal
                        key={plan._id || plan.slug || idx}
                        direction="up"
                        delay={idx * 60}
                        className="h-full"
                      >
                        <div className="group bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 hover:border-secondary/60 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 flex flex-col justify-between h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative text-left">
                          
                          {/* 5-Day Free Trial Green Badge (Matches Screenshot) */}
                          {plan.trialAllowed && (
                            <div className="absolute -top-3.5 left-7 bg-[#059669] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm font-sans">
                              5-DAY FREE TRIAL ELIGIBLE
                            </div>
                          )}

                          <div>
                            {/* Plan Name & Currency Tag */}
                            <div className="flex items-center justify-between gap-2 mb-2 pt-1">
                              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-foreground">
                                {plan.name}
                              </h3>
                              {plan.currency && (
                                <span className="text-xs font-bold text-slate-400 dark:text-text-muted uppercase tracking-wider font-sans">
                                  {plan.currency}
                                </span>
                              )}
                            </div>

                            {/* Plan Short Description */}
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted mb-6 font-sans min-h-[36px]">
                              {plan.description ||
                                "Perfect for brands starting their creator collaborations."}
                            </p>

                            {/* Large Bold Price */}
                            <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/10">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-black text-slate-950 dark:text-white tracking-tight leading-none">
                                  {formatINR(displayPrice)}
                                </span>
                                <span className="text-sm sm:text-base font-medium text-slate-500 dark:text-text-muted font-sans">
                                  {billingPeriodLabel}
                                </span>
                              </div>
                              {isYearly && plan.priceYearly && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 font-sans">
                                  Billed annually as a single payment
                                </p>
                              )}
                            </div>

                            {/* Contact Unlock Limit Highlight Box (Matches Screenshot) */}
                            {plan.monthlyContactQuota && (
                              <div className="mb-6 bg-[#FFF1F2] dark:bg-secondary/10 border border-rose-100/90 dark:border-secondary/20 rounded-2xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-sans">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  Contact Unlock Limit:
                                </span>
                                <span className="font-bold text-[#E11D48] dark:text-pink-300">
                                  {plan.monthlyContactQuota} Creators / mo
                                </span>
                              </div>
                            )}

                            {/* Plan Features */}
                            <div className="space-y-3 mb-8">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-text-muted block font-sans">
                                WHAT&apos;S INCLUDED:
                              </span>
                              {cleanFeatures.map((feat, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans"
                                >
                                  <svg
                                    className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M4.5 12.75l6 6 9-13.5"
                                    />
                                  </svg>
                                  <span>{feat.replace(/^[-\s]+/, "")}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA Button & Trial Support Text */}
                          <div className="pt-4 border-t border-slate-100 dark:border-white/10 mt-auto">
                            <Link
                              href={`/signup?role=brand&plan=${encodeURIComponent(
                                plan.slug || plan.name
                              )}`}
                              className="w-full text-center block py-3.5 sm:py-4 px-6 rounded-full bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-semibold text-xs sm:text-sm hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer font-sans"
                            >
                              {plan.trialAllowed
                                ? "Start 5-Day Free Trial"
                                : "Choose Plan"}
                            </Link>

                            {plan.trialAllowed && (
                              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-text-muted text-center mt-2.5 font-sans leading-relaxed">
                                Try CreatorLink for 5 days and explore the platform before choosing to continue with a paid subscription.
                              </p>
                            )}
                          </div>

                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              CREATOR PRICING (When For Creators tab is active)
          ======================================================= */}
          {audienceTab === "creators" && (
            <ScrollReveal direction="scale" delay={60} className="max-w-4xl mx-auto">
              {creatorPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {/* Standard Free To Join Card */}
                  <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-[30px] p-6 sm:p-8 flex flex-col justify-between shadow-sm text-left">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full mb-3 inline-block font-sans">
                        FREE TO JOIN
                      </span>
                      <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                        Standard Creator Access
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted mb-4 font-sans">
                        Start showcasing your portfolio and connecting with brands at zero cost.
                      </p>
                      <div className="text-3xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white mb-6">
                        ₹0
                      </div>
                      <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans mb-8">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Create your creator profile.
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Showcase your niche and content.
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Explore brand collaboration opportunities.
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Build professional connections.
                        </li>
                      </ul>
                    </div>
                    <Link
                      href="/signup?role=creator"
                      className="w-full text-center block py-3.5 px-6 rounded-full bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-semibold text-xs sm:text-sm hover:bg-secondary transition-all font-sans"
                    >
                      Join as a Creator
                    </Link>
                  </div>

                  {/* Optional Creator Paid Plans */}
                  {creatorPlans.map((cPlan, cIdx) => (
                    <div
                      key={cPlan._id || cIdx}
                      className="bg-white dark:bg-surface border border-secondary/40 rounded-[30px] p-6 sm:p-8 flex flex-col justify-between shadow-md text-left"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-pink-50 dark:bg-secondary/20 px-3 py-1 rounded-full mb-3 inline-block font-sans">
                          OPTIONAL UPGRADE
                        </span>
                        <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                          {cPlan.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted mb-4 font-sans">
                          {cPlan.description}
                        </p>
                        <div className="text-3xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white mb-6">
                          {formatINR(cPlan.priceMonthly)}
                          <span className="text-xs sm:text-sm font-normal text-slate-500"> /month</span>
                        </div>
                        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans mb-8">
                          {(cPlan.features || []).map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="text-secondary font-bold">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link
                        href={`/signup?role=creator&plan=${encodeURIComponent(
                          cPlan.slug || cPlan.name
                        )}`}
                        className="w-full text-center block py-3.5 px-6 rounded-full bg-secondary text-white font-semibold text-xs sm:text-sm hover:bg-slate-950 transition-all font-sans"
                      >
                        Choose Optional Upgrade
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                /* Free-To-Join Card */
                <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-[32px] p-6 sm:p-10 shadow-sm text-left relative overflow-hidden">
                  <div className="inline-block bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold tracking-widest uppercase rounded-full px-3.5 py-1 mb-4 font-sans">
                    FREE TO JOIN
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 dark:text-foreground mb-3">
                    Your Creativity Should Have Room to Grow.
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-6">
                    Join CreatorLink, build your creator profile, showcase your work and explore collaboration opportunities with brands. You do not need to purchase a paid subscription just to get started.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6 font-sans">
                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10 flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </span>
                      <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                        Create your creator profile.
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10 flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </span>
                      <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                        Showcase your niche and content.
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10 flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </span>
                      <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                        Explore brand collaboration opportunities.
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10 flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </span>
                      <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                        Build professional connections.
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-text-muted font-sans mb-6 italic">
                    Optional paid creator features or plans may be available where enabled. You can get started without a compulsory paid subscription.
                  </p>

                  <Link
                    href="/signup?role=creator"
                    className="inline-block bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white transition-all shadow-sm cursor-pointer font-sans"
                  >
                    Join as a Creator
                  </Link>
                </div>
              )}
            </ScrollReveal>
          )}

        </div>

      </div>
    </section>
  );
}
