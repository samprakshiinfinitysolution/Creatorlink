"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function TrustedBrands() {
  const categories = [
    { name: "Fashion & Beauty" },
    { name: "Lifestyle" },
    { name: "Food & Beverage" },
    { name: "Travel" },
    { name: "Technology" },
    { name: "Health & Wellness" },
  ];

  return (
    <section className="w-full bg-background text-foreground py-12 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-10 border-t border-b border-border-theme/60 transition-colors duration-300">
      <ScrollReveal direction="up" delay={0} className="mx-auto max-w-[1320px] text-center">
        {/* Eyebrow */}
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
          ECOSYSTEM &amp; NICHES
        </span>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-serif font-medium text-slate-900 dark:text-foreground mb-3">
          Built for Brands and Creators to Work Together.
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary max-w-xl mx-auto mb-8 font-sans">
          CreatorLink brings businesses and creative professionals together to build meaningful collaborations across diverse industries.
        </p>

        {/* Category Labels Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 items-center text-center">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-slate-100/70 dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl py-3 px-4 shadow-2xs hover:border-secondary/50 transition-colors"
            >
              <span className="text-xs sm:text-sm font-sans font-semibold text-slate-800 dark:text-slate-200">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
