"use client";

import React from "react";
import Link from "next/link";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function PricingGrowthCTA() {
  const scrollToPlans = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[700px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[180px]" />

      <div className="mx-auto max-w-[1140px] relative z-10">
        <ScrollReveal direction="scale" delay={80}>
          <div className="bg-surface-muted dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 lg:p-16 shadow-sm text-center relative overflow-hidden transition-all duration-300">
            {/* Eyebrow Pill */}
            <div className="inline-block bg-white/80 dark:bg-secondary/20 text-secondary dark:text-pink-200 border border-pink-200/60 dark:border-pink-500/20 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full px-4 py-1 mb-5 sm:mb-6 shadow-2xs">
              START TODAY
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4 max-w-xl mx-auto">
              Start Building Better Collaborations Today.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-lg mx-auto mb-8 sm:mb-10">
              Whether you&apos;re a brand searching for creative talent or a creator ready to showcase your work, CreatorLink gives you a place to begin.
            </p>

            {/* Two Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-6 sm:mb-8">
              {/* Brand CTA */}
              <button
                type="button"
                onClick={scrollToPlans}
                className="w-full sm:w-auto text-center bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-2xs"
              >
                Explore Brand Plans
              </button>

              {/* Creator CTA */}
              <Link
                href="/signup?role=creator"
                className="w-full sm:w-auto text-center bg-white dark:bg-slate-900/90 text-slate-900 dark:text-foreground font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full border border-slate-200/80 dark:border-white/20 hover:border-secondary hover:text-secondary dark:hover:text-pink-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-2xs"
              >
                Join as a Creator
              </Link>
            </div>

            {/* Supporting Text */}
            <p className="text-xs text-slate-500 dark:text-text-muted font-sans">
              Flexible for brands. Accessible for creators. Built for collaboration.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
