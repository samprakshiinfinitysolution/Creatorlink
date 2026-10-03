"use client";

import React from "react";

// =========================================================
// MAIN COMPONENT: COLLABORATION CTA
// =========================================================
export default function CollaborationCTA() {
  return (
    <section className="relative bg-background text-foreground py-14 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">
      <div className="mx-auto max-w-[1440px]">
        {/* Outer Dark CTA Box Container */}
        <div className="relative overflow-hidden bg-primary dark:bg-[#161616] text-white rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] p-8 sm:p-12 md:p-16 lg:p-20 shadow-2xl border border-white/10">
          {/* Subtle Ambient Pink/Burgundy Gradient Glow (Right Side) */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-secondary/25 via-secondary/[0.08] to-transparent blur-[70px] opacity-70" />

          {/* Top/Left Subtle Ambient Glow */}
          <div className="pointer-events-none absolute left-1/4 -top-20 h-[250px] w-[250px] rounded-full bg-secondary/[0.05] blur-[90px]" />

          {/* Centered CTA Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-secondary block mb-4">
              THE FUTURE OF INFLUENCE
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-serif font-medium tracking-tight text-white leading-[1.15] mb-5">
              Your next great collaboration starts here.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-white/70 font-sans leading-relaxed max-w-2xl mb-8 sm:mb-10">
              Join over 10,000 elite tastemakers and 400+ world-class luxury houses
              reshaping modern digital commerce.
            </p>

            {/* Buttons Row (Stacked on Mobile, Side-by-side on Desktop) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full sm:w-auto">
              {/* Button 1: Find Your Creator -> */}
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-sm sm:text-base tracking-wide shadow-[0_4px_22px_rgba(255,79,135,0.35)] hover:shadow-[0_6px_28px_rgba(213,22,98,0.55)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-100 transition-all duration-300 ease-out cursor-pointer select-none"
              >
                <span>Find Your Creator</span>
                <span className="text-base leading-none">→</span>
              </button>

              {/* Button 2: Join as Creator */}
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-sans font-semibold text-sm sm:text-base tracking-wide border border-white/20 hover:border-white/40 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-100 transition-all duration-300 ease-out cursor-pointer select-none"
              >
                <span>Join as Creator</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
