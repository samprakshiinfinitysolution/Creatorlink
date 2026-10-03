"use client";

import React, { useState, useEffect, useRef } from "react";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================
const PROTOCOL_DATA = {
  eyebrow: "MAISON PROTOCOL",
  title: "From Idea to Cultural Impact",
  subtitle: "End-to-end escrow governance and pixel-level approvals.",
  features: [
    {
      id: "escrow",
      title: "Pre-funded Escrow Assurance",
      description:
        "Funds locked in smart escrow vaults until deliverables pass algorithmic and brand sign-off.",
    },
    {
      id: "video",
      title: "Frame-by-Frame Video Approvals",
      description:
        "Timecoded feedback, instant revision requests, and 4K master file handoffs.",
    },
  ],
  campaign: {
    status: "Active Live Campaign",
    statusDesktop: "Active Campaign in Progress",
    title: "Aura Fragrance Spring 2025",
    vaultLabel: "Escrow Vault",
    amount: "$18,500 USD",
    currentStageNumber: 4,
    totalStages: 6,
    activeStageName: "REVIEW",
    desktopStages: [
      { id: "brief", label: "Brief", status: "completed" },
      { id: "creator", label: "Creator", status: "completed" },
      { id: "deal", label: "Deal", status: "completed" },
      { id: "review", label: "Review", status: "active" },
      { id: "approve", label: "Approve", status: "pending" },
      { id: "payout", label: "Payout", status: "pending" },
    ],
    mobileStages: [
      { id: "brief", label: "Brief", status: "completed" },
      { id: "creator", label: "Creator", status: "completed" },
      { id: "deal", label: "Deal", status: "completed" },
      { id: "review", label: "Review", status: "active" },
      { id: "payout", label: "Payout", status: "pending" },
    ],
    desktopDeliverables: [
      {
        id: "hero-film",
        title: "Hero Campaign Film (4K Master)",
        type: "Video Deliverable",
        status: "Approved",
        statusType: "approved",
      },
      {
        id: "social-cuts",
        title: "Instagram Reels & TikTok Cuts (3x)",
        type: "Short-form Content",
        status: "Needs Review",
        statusType: "needs_review",
      },
    ],
    mobileDeliverables: [
      {
        id: "reels-unveil",
        title: "Reels: 4K Fragrance Unveiling",
        meta: "Elena Vance • 6Q • 9:16 ProRes",
        status: "Approved",
        statusType: "approved",
      },
      {
        id: "lookbook-assets",
        title: "Editorial Still Life Lookbook",
        meta: "Lucian Atelier • 5 Assets",
        status: "Needs Review",
        statusType: "needs_review",
      },
    ],
    mobilePills: [
      "100% Pre-funded Escrow",
      "Frame-by-Frame Video Approval",
    ],
  },
};

// =========================================================
// PIPELINE STAGE CARDS DATA
const PIPELINE_STAGES = [
  { id: "brief", label: "BRIEF", status: "completed", iconType: "check" },
  { id: "creator", label: "CREATOR", status: "completed", iconType: "check" },
  { id: "deal", label: "DEAL", status: "completed", iconType: "check" },
  { id: "review", label: "REVIEW", status: "active", iconType: "refresh" },
  { id: "approve", label: "APPROVE", status: "pending", iconType: "circle" },
  { id: "payout", label: "PAYOUT", status: "pending", iconType: "banknote" },
];

// SVG ICONS
// =========================================================
function CheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600 dark:text-emerald-400" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4 sm:w-4.5 sm:h-4.5 text-secondary" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function CircleOutlineIcon({ className = "w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-400 dark:text-neutral-500" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function BanknoteIcon({ className = "w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-400 dark:text-neutral-500" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function FilmIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
      />
    </svg>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function MaisonProtocol() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef(null);

  // IntersectionObserver to trigger progress line animation on viewport entry
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const { campaign, features } = PROTOCOL_DATA;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background text-foreground transition-colors duration-300 py-12 md:py-24 px-4 sm:px-6 lg:px-10 xl:px-12 border-t border-border-theme"
    >
      <style>{`
        @keyframes progressLightSweep {
          0% {
            transform: translateX(-150%);
          }

          100% {
            transform: translateX(350%);
          }
        }

        .progress-light-sweep {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40%;
          background: linear-gradient(90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.15) 30%,
              rgba(255, 255, 255, 0.65) 50%,
              rgba(255, 255, 255, 0.15) 70%,
              transparent 100%);
          animation: progressLightSweep 2.5s ease-in-out infinite;
        }
      `}</style>
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute left-0 top-1/3 h-[380px] w-[380px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.03] blur-[130px]" />

      <div className="mx-auto max-w-[1440px]">
        {/* =========================================================
            TWO COLUMN EDITORIAL LAYOUT (DESKTOP) / STACKED (MOBILE)
        ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* =========================================================
              LEFT COLUMN: HEADER & SUPPORTING FEATURES (DESKTOP)
          ========================================================= */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-2">
              {PROTOCOL_DATA.eyebrow}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-4">
              {PROTOCOL_DATA.title}
            </h2>
            <p className="text-sm lg:text-base text-text-secondary leading-relaxed mb-8">
              {PROTOCOL_DATA.subtitle}
            </p>

            {/* Supporting Feature Rows (Desktop Only) */}
            <div className="hidden md:flex flex-col space-y-6 pt-2 border-t border-border-theme">
              {features.map((feature, idx) => (
                <div key={feature.id} className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-surface-muted border border-border-theme text-secondary shrink-0 mt-0.5">
                    {idx === 0 ? <ShieldCheckIcon /> : <FilmIcon />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: CAMPAIGN GOVERNANCE CARD
          ========================================================= */}
          <div className="md:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-border-theme bg-surface p-5 sm:p-7 shadow-sm transition-all duration-300">
              {/* CARD HEADER: STATUS & CAMPAIGN DETAILS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme">
                <div>
                  {/* Status Indicator with Subtle Pulse */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="hidden sm:inline">{campaign.statusDesktop}</span>
                      <span className="sm:hidden">{campaign.status}</span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-serif text-foreground tracking-tight">
                    {campaign.title}
                  </h3>
                </div>

                {/* Vault & Amount + Actions Button */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium block">
                      {campaign.vaultLabel}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-foreground">
                      {campaign.amount}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white dark:bg-white dark:text-black hover:bg-secondary hover:text-white dark:hover:bg-secondary dark:hover:text-white hover:shadow-[0_0_20px_rgba(255,79,135,0.35)] text-xs font-semibold shadow-xs transition-all duration-300 cursor-pointer whitespace-nowrap"
                  >
                    Campaign Actions
                  </button>
                </div>
              </div>

              {/* =========================================================
                  MILESTONE PIPELINE (MATCHES REFERENCE SCREENSHOT)
              ========================================================= */}
              <div className="py-6 border-b border-border-theme">
                {/* Pipeline Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    MILESTONE PIPELINE
                  </span>
                  <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary inline-block shrink-0" />
                    <span>Stage 4 of 6 Active</span>
                  </span>
                </div>

                {/* CONTINUOUS 7PX PROGRESS LINE (ABOVE CARDS) */}
                <div className="relative mt-4 mb-5 w-full">
                  {/* Base Inactive Track (7px height, rounded full) */}
                  <div className="w-full h-[7px] bg-neutral-200/80 dark:bg-white/10 rounded-full overflow-hidden relative">
                    {/* Active Gradient Track (Green -> Pink gradient covering ~62% of track length) */}
                    <div
                      className="absolute top-0 left-0 h-full overflow-hidden transition-[width] duration-[1600ms] ease-out rounded-full"
                      style={{ width: isIntersecting ? "62%" : "0%" }}
                    >
                      <div className="relative w-full h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-secondary overflow-hidden">
                        {/* Moving Light / Pulse Sweep Effect on Active Line */}
                        <div className="progress-light-sweep pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6 MILESTONE CARDS IN ONE HORIZONTAL ROW */}
                <div className="grid grid-cols-6 gap-1.5 sm:gap-3 lg:gap-3.5 items-stretch w-full">
                  {PIPELINE_STAGES.map((stage) => {
                    const isCompleted = stage.status === "completed";
                    const isActive = stage.status === "active";

                    return (
                      <div
                        key={stage.id}
                        className={`py-3 px-1 sm:px-3 rounded-xl sm:rounded-[16px] text-center flex flex-col items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "bg-[#ffeef3] dark:bg-secondary/20 border border-secondary text-secondary shadow-[0_0_15px_rgba(255,79,135,0.2)]"
                            : isCompleted
                            ? "bg-[#f5eded]/80 dark:bg-white/[0.06] border border-border-theme/40 text-foreground"
                            : "bg-[#f5eded]/50 dark:bg-white/[0.03] border border-border-theme/30 text-text-secondary/60"
                        }`}
                      >
                        {/* Step Icon */}
                        <div className="mb-1.5 flex items-center justify-center">
                          {stage.iconType === "check" && <CheckCircleIcon />}
                          {stage.iconType === "refresh" && <RefreshIcon />}
                          {stage.iconType === "circle" && <CircleOutlineIcon />}
                          {stage.iconType === "banknote" && <BanknoteIcon />}
                        </div>

                        {/* Step Label */}
                        <span
                          className={`text-[9px] sm:text-xs font-bold uppercase tracking-wider block ${
                            isActive
                              ? "text-secondary font-extrabold"
                              : isCompleted
                              ? "text-foreground font-bold"
                              : "text-text-secondary/60 font-semibold"
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* =========================================================
                  APPROVAL / DELIVERABLE ROWS (DESKTOP)
              ========================================================= */}
              <div className="hidden md:block pt-6 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-3">
                  DELIVERABLE REVIEWS
                </span>

                {campaign.desktopDeliverables.map((item) => (
                  <div
                    key={item.id}
                    className="group/row flex items-center justify-between p-3.5 rounded-xl border border-border-theme bg-surface-muted hover:border-secondary/60 hover:shadow-[0_0_20px_rgba(255,79,135,0.18)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover/row:text-secondary transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-text-secondary block mt-0.5">
                        {item.type}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        item.statusType === "approved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-secondary/10 text-secondary border border-secondary/20 animate-pulse"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* =========================================================
                  APPROVAL / DELIVERABLE ROWS (MOBILE - MATCHES SCREENSHOT)
              ========================================================= */}
              <div className="block md:hidden pt-6 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-3">
                  DELIVERABLE REVIEWS
                </span>

                {campaign.mobileDeliverables.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border-theme bg-surface-muted"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-text-secondary block mt-0.5">
                        {item.meta}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 ml-2 ${
                        item.statusType === "approved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-secondary/10 text-secondary border border-secondary/20 animate-pulse"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}

                {/* Mobile Bottom Pills */}
                <div className="flex flex-wrap gap-2 pt-3">
                  {campaign.mobilePills.map((pill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-surface border border-border-theme text-foreground"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
