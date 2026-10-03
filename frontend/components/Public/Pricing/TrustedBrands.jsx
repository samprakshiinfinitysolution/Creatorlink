"use client";

import React from "react";

export default function TrustedBrands() {
  const brands = [
    {
      name: "Acne Studios",
      className: "font-sans font-semibold tracking-tight text-slate-800 dark:text-text-secondary",
    },
    {
      name: "BYREDO",
      className: "font-mono tracking-[0.28em] font-normal uppercase text-slate-700 dark:text-text-secondary",
    },
    {
      name: "GANNI",
      className: "font-sans font-black tracking-wider uppercase text-slate-900 dark:text-foreground",
    },
    {
      name: "Glossier.",
      className: "font-serif italic font-medium tracking-normal text-slate-800 dark:text-text-secondary",
    },
    {
      name: "REFORMATION",
      className: "font-sans tracking-[0.32em] font-light uppercase text-slate-700 dark:text-text-secondary",
    },
    {
      name: "Aēsop",
      className: "font-serif font-normal tracking-wide text-slate-800 dark:text-text-secondary",
    },
  ];

  return (
    <section className="w-full bg-background text-foreground py-10 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-10 border-t border-b border-border-theme/60 transition-colors duration-300">
      <div className="mx-auto max-w-[1320px] text-center">
        
        {/* Eyebrow */}
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-6 sm:mb-8">
          TRUSTED BY MODERN BRANDS
        </span>

        {/* Brand Names Grid / Horizontal Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row lg:items-center lg:justify-between gap-y-6 gap-x-4 sm:gap-6 lg:gap-8 items-center text-center">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center justify-center py-1 group"
            >
              <span
                className={`text-sm sm:text-base md:text-lg lg:text-xl transition-all duration-300 ease-out hover:text-secondary dark:hover:text-secondary hover:-translate-y-[2px] hover:scale-[1.02] cursor-pointer inline-block ${brand.className}`}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
