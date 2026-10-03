"use client";

import React from "react";

export default function BrandCampaignWorkspace() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes workspaceFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardScaleEntrance {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes sweepShine {
          from {
            transform: translateX(-100%) rotate(25deg);
          }
          to {
            transform: translateX(200%) rotate(25deg);
          }
        }

        .animate-fade-1 {
          animation: workspaceFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-2 {
          animation: workspaceFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }

        .animate-workspace-card {
          animation: cardScaleEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
        }

        .btn-shine::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 60%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transform: rotate(25deg);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .btn-shine:hover::after {
          opacity: 1;
          animation: sweepShine 0.8s ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-1,
          .animate-fade-2,
          .animate-workspace-card {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[650px] rounded-full bg-secondary/[0.04] blur-[150px]" />

      <div className="mx-auto max-w-[1240px] relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-secondary block mb-3 font-sans opacity-0 animate-fade-1">
            EVERY GREAT CAMPAIGN STARTS WITH AN IDEA.
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground leading-tight mb-4 opacity-0 animate-fade-1">
            Start with what you want to create.
          </h2>
          <p className="text-base sm:text-lg text-text-secondary font-sans leading-relaxed opacity-0 animate-fade-2">
            Draft your objective in seconds. Our algorithmic curation instantly maps the exact creators who live inside your target demographic.
          </p>
        </div>

        {/* Center Large Campaign Workspace Card */}
        <div className="opacity-0 animate-workspace-card max-w-4xl mx-auto">
          <div className="bg-surface border border-secondary/30 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-300">
            {/* Top Pink Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-secondary-dark to-tertiary" />

            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme/60">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold font-sans">
                <span>Draft Mode • Brand Workspace</span>
              </div>

              {/* Status Indicator with Pulsing Green Dot */}
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary font-sans">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span>Brief Ready to Match</span>
              </div>
            </div>

            {/* Main Campaign Title */}
            <div className="my-6 sm:my-8">
              <h3 className="text-2xl sm:text-3xl font-serif font-medium text-foreground tracking-tight">
                Summer Radiance Launch Campaign
              </h3>
            </div>

            {/* 4 Info Columns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-border-theme/60">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                  Primary Goal
                </span>
                <span className="text-sm font-semibold text-foreground font-sans">
                  Brand Awareness & Launch
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                  Platforms
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2.5 py-0.5 rounded bg-surface-muted text-xs font-medium text-foreground font-sans border border-border-theme">
                    Instagram
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-surface-muted text-xs font-medium text-foreground font-sans border border-border-theme">
                    TikTok
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                  Deliverables
                </span>
                <span className="text-sm font-semibold text-foreground font-sans">
                  2 Reels · 3 Stories
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                  Target Budget
                </span>
                <span className="text-base font-bold text-foreground font-sans">
                  ₹50,000
                </span>
              </div>
            </div>

            {/* Vibe Tags Row */}
            <div className="my-6 sm:my-8 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs font-semibold text-text-secondary font-sans mr-1">
                Vibe Tags:
              </span>
              {["#SunlitWarmth", "#GlassSkin", "#QuietLuxury", "#CleanAesthetic"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-surface-muted text-xs font-medium text-text-secondary font-sans border border-border-theme/80 hover:border-secondary/50 hover:text-secondary hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 border-t border-border-theme/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary font-sans">
                <span className="text-secondary text-sm">🛡</span>
                <span>100% Escrow Protection on every milestone</span>
              </div>

              <div className="relative inline-flex flex-col items-end gap-1">
                {/* CTA Button with Hover Sweep & Glow */}
                <button
                  type="button"
                  className="btn-shine relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-sm tracking-wide shadow-md hover:shadow-[0_8px_25px_rgba(255,79,135,0.35)] hover:scale-[1.02] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
                >
                  <span>Find Matching Creators</span>
                  <span className="text-xs">✦</span>
                </button>

                {/* Dark Tooltip Label */}
                <div className="mt-1 bg-black/90 text-white text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-md tracking-wide flex items-center gap-1 shadow-md">
                  <span>✦</span>
                  <span>Click to experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
