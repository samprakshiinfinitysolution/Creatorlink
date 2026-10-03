"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PricingPlans() {
  const [isYearly, setIsYearly] = useState(true);

  // Clean data structure for static pricing tiers ready for future API/backend data replacement
  const plansData = [
    {
      id: "free",
      topBanner: null,
      badge: "FREE TIER",
      saveBadge: null,
      title: "Free",
      description: "Perfect for getting started.",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      billedText: null,
      buttonLabel: "Join for Free",
      buttonHref: "/signup",
      featuresHeading: "INCLUDES:",
      features: [
        "Basic campaign discovery",
        "Limited creator profiles",
        "Basic campaign tools",
        "Limited applications",
        "Basic reporting",
      ],
      isHighlighted: false,
    },
    {
      id: "pro",
      topBanner: "MOST POPULAR",
      badge: "RECOMMENDED",
      saveBadge: "SAVE 20%",
      title: "Pro",
      description: "For growing campaigns.",
      monthlyPrice: "$299",
      yearlyPrice: "$249",
      billedText: "billed annually",
      buttonLabel: "Start Pro",
      buttonHref: "/signup?plan=pro",
      featuresHeading: "EVERYTHING IN FREE, PLUS:",
      features: [
        "Unlimited campaign creation",
        "Advanced creator discovery",
        "Direct creator applications",
        "Campaign management",
        "Collaboration tools",
        "Advanced reporting",
        "Priority support",
      ],
      isHighlighted: false,
    },
    {
      id: "premium",
      topBanner: "BEST VALUE",
      badge: "SCALING",
      saveBadge: "SAVE 17%",
      title: "Premium",
      description: "For brands running multiple campaigns.",
      monthlyPrice: "$399",
      yearlyPrice: "$333",
      billedText: "billed annually",
      buttonLabel: "Start Premium",
      buttonHref: "/signup?plan=premium",
      featuresHeading: "EVERYTHING IN PRO, PLUS:",
      features: [
        "Everything in Pro",
        "Unlimited campaigns",
        "Advanced creator matching",
        "In-depth campaign analytics",
        "Advanced collaboration",
        "Team workflows & roles",
        "Dedicated priority support",
      ],
      isHighlighted: false,
    },
    {
      id: "enterprise",
      topBanner: null,
      badge: "CUSTOM",
      saveBadge: null,
      title: "Enterprise",
      description: "Built for teams managing creator programs.",
      monthlyPrice: "$1,199",
      yearlyPrice: "$1,000",
      billedText: "billed annually",
      buttonLabel: "Start a Free Trial",
      buttonHref: "/signup?plan=enterprise",
      featuresHeading: "EVERYTHING IN PREMIUM, PLUS:",
      features: [
        "Multiple brands and teams",
        "Dedicated account manager",
        "Custom workflows & approvals",
        "Custom API & exports",
        "White-label client portals",
      ],
      isHighlighted: false,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground pt-34 sm:pt-28 lg:pt-41 pb-16 sm:pb-20 lg:pb-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">

      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-[550px] w-[800px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">

        {/* =========================================================
            1. TOP CONTENT: EYEBROW, HEADING WITH HIGHLIGHT & SUBTITLE
        ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">

          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 bg-secondary/15 dark:bg-secondary/20 border border-pink-200/80 dark:border-pink-500/20 rounded-full px-4 py-1.5 mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-800 dark:text-foreground font-sans">
              CREATOR HUB PRICING
            </span>
          </div>

          {/* Main Heading with "one plan." Highlight */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight sm:leading-snug mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span>Grow your creator marketing with</span>
            <span className="inline-block bg-secondary/20 dark:bg-secondary/30 text-slate-900 dark:text-pink-100 rounded-2xl sm:rounded-[22px] px-4 sm:px-5 py-0.5 sm:py-1 font-serif text-3xl sm:text-4xl lg:text-5xl align-middle shadow-xs">
              one plan.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-2xl mx-auto">
            Choose the plan that fits your campaigns, creators and growth. Transparent tiers built for digital tastemakers and forward-thinking brands.
          </p>
        </div>

        {/* =========================================================
            2. BILLING TOGGLE (MONTHLY / YEARLY)
        ========================================================= */}
        <div className="flex justify-center mb-16 sm:mb-20">
          <div className="bg-slate-200/70 dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-full p-1.5 inline-flex items-center gap-1 shadow-inner">

            {/* Monthly Button */}
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-sans font-medium transition-all duration-300 cursor-pointer ${!isYearly
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                : "text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              Monthly
            </button>

            {/* Yearly Button + Discount Badge */}
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-sans font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 ${isYearly
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                : "text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <span>Yearly</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary/20 dark:bg-secondary/30 text-secondary dark:text-pink-200 rounded-full px-2.5 py-0.5">
                SAVE UP TO 20%
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================
            3. PRICING CARDS GRID (4 EQUAL CARDS ON DESKTOP)
            Breakpoints:
            - Desktop: 4 columns
            - Tablet: 2 columns (2 x 2)
            - Mobile: 1 column
        ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 xl:gap-8 items-stretch pt-6">
          {plansData.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div key={plan.id} className="relative flex flex-col justify-end">

                {/* Top Floating Banner (Most Popular / Best Value) */}
                {plan.topBanner && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-md pointer-events-none whitespace-nowrap">
                    {plan.topBanner}
                  </div>
                )}

                {/* Main Card */}
                <article
                  className="group bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 hover:border-secondary/60 rounded-[28px] p-6 sm:p-7 shadow-sm hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.22)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 ease-out flex flex-col justify-between h-full text-left relative"
                >
                  <div>
                    {/* Header Badges Row */}
                    <div className="flex items-center justify-between gap-2 mb-4 min-h-[26px]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-text-muted bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full font-sans">
                        {plan.badge}
                      </span>
                      {plan.saveBadge && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/15 dark:bg-secondary/20 px-2.5 py-0.5 rounded-full font-sans">
                          {plan.saveBadge}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground mb-1">
                      {plan.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-sans text-slate-500 dark:text-text-muted leading-relaxed mb-6 min-h-[36px]">
                      {plan.description}
                    </p>

                    {/* Price Area */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-foreground">
                          {price}
                        </span>
                        <span className="text-xs sm:text-sm font-sans text-slate-500 dark:text-text-muted font-medium">
                          /mo
                        </span>
                      </div>
                      <div className="min-h-[18px] mt-1">
                        {isYearly && plan.billedText ? (
                          <span className="text-[11px] font-sans text-slate-400 dark:text-text-muted block">
                            {plan.billedText}
                          </span>
                        ) : (
                          <span className="text-[11px] font-sans text-transparent block">
                            placeholder
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={plan.buttonHref}
                      className="block text-center w-full py-3.5 px-6 rounded-full font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 shadow-xs cursor-pointer bg-slate-900 dark:bg-slate-800 text-white group-hover:bg-secondary group-hover:text-white"
                    >
                      {plan.buttonLabel}
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-slate-100 dark:border-white/10 my-6" />

                    {/* Features List Header */}
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-4">
                      {plan.featuresHeading}
                    </span>

                    {/* Features List */}
                    <ul className="space-y-3 font-sans text-xs sm:text-sm text-slate-600 dark:text-text-secondary">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-secondary font-bold text-xs leading-none mt-0.5">
                            ✓
                          </span>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
