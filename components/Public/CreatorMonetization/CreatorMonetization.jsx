"use client";

import React from "react";
import Image from "next/image";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================
const MONETIZATION_DATA = {
  eyebrow: "CREATOR MONETIZATION SUITE",
  title: "Your content deserves more than likes.",
  description:
    "Stop waiting 90 days for brand checks. Maison Synergie gives you a bespoke, couture storefront with guaranteed upfront escrow payments, zero chasing invoices, and direct access to luxury European & American houses.",
  features: [
    {
      id: "pre-funded",
      title: "Pre-funded contracts before you pick up the camera",
      description:
        "Brands fund the full creative fee into escrow upon proposal acceptance.",
      icon: "banknote",
    },
    {
      id: "legally-vetted",
      title: "Standardized legally vetted IP & usage rights agreements",
      description:
        "Every deal clearly outlines whitelisting duration, licensing territory, and organic rights.",
      icon: "legal",
    },
    {
      id: "same-day",
      title: "Same-day payouts via Stripe, Wise, or direct bank transfer",
      description:
        "Escrow unlocks immediately when content delivery milestones are checked off.",
      icon: "lightning",
    },
  ],
  ctaText: "Create Your Creator Profile",
  creator: {
    name: "Juliette Moreau",
    handleLocation: "@juliette.moreau • Paris & New York",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    initials: "JM",
    pendingLabel: "PENDING ESCROW",
    pendingAmount: "$6,420.00 USD",
    menuLabel: "COUTURE DELIVERABLE MENU",
    desktopDeliverables: [
      {
        id: "tiktok",
        title: "Dedicated TikTok Video",
        subtext: "60s 4K UHD, 1 revision round included",
        price: "$450",
        type: "video",
      },
      {
        id: "carousel",
        title: "Instagram Carousel",
        subtext: "6-slide editorial still story + caption craft",
        price: "$680",
        type: "image",
      },
      {
        id: "whitelisting",
        title: "Global Ads Whitelisting",
        subtext: "30-day direct Spark Ads & Meta token authorization",
        price: "$220",
        type: "rocket",
      },
    ],
    mobileDeliverables: [
      {
        id: "m-tiktok",
        title: "Dedicated TikTok Video (60s)",
        price: "$450",
      },
      {
        id: "m-carousel",
        title: "Instagram Carousel (3 Slides)",
        price: "$680",
      },
      {
        id: "m-whitelisting",
        title: "Global Ads Whitelisting (30 Days)",
        price: "$220",
      },
    ],
    mobileCardTitle: "Juliette Moreau Rate Card",
    mobileCardSubtext: "Verified Creator Tier 1 • $6,420 Escrow Balance",
  },
};

// =========================================================
// SVG ICONS
// =========================================================
function BanknoteIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function ScaleIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6l9-4 9 4M3 6v14a1 1 0 001 1h16a1 1 0 001-1V6M3 6l9 4 9-4M9 21V9m6 12V9"
      />
    </svg>
  );
}

function ZapIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function VideoIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function ImageIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function RocketIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 010 12.728"
      />
    </svg>
  );
}

function VerifiedCheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        className="fill-secondary stroke-white dark:stroke-black"
      />
    </svg>
  );
}

function LockIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function CreatorMonetization() {
  const { eyebrow, title, description, features, ctaText, creator } =
    MONETIZATION_DATA;

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-12 md:py-24 px-4 sm:px-6 lg:px-10 xl:px-12 border-t border-border-theme transition-colors duration-300">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.03] blur-[140px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        {/* =========================================================
            DESKTOP TWO-COLUMN COMPOSITION (HIDDEN ON MOBILE)
        ========================================================= */}
        <div className="hidden md:grid md:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* LEFT COLUMN: CONTENT & FEATURES */}
          <div className="md:col-span-6 flex flex-col justify-center">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-secondary block mb-3">
              {eyebrow}
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-4">
              {title}
            </h2>

            <p className="text-sm lg:text-base text-text-secondary leading-relaxed mb-8 max-w-xl">
              {description}
            </p>

            {/* 3 FEATURE ROWS */}
            <div className="space-y-6 mb-10">
              {features.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  {/* Pink Circular Icon */}
                  <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {item.icon === "banknote" && <BanknoteIcon />}
                    {item.icon === "legal" && <ScaleIcon />}
                    {item.icon === "lightning" && <ZapIcon />}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA BUTTON */}
            <div>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white dark:bg-white dark:text-black hover:bg-secondary hover:text-white dark:hover:bg-secondary dark:hover:text-white hover:shadow-[0_0_25px_rgba(255,79,135,0.4)] text-xs font-semibold shadow-xs transition-all duration-300 cursor-pointer group"
              >
                <span>{ctaText}</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300 text-sm">
                  →
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: PAYOUT DASHBOARD CARD */}
          <div className="md:col-span-6">
            <div className="rounded-3xl border border-border-theme bg-surface p-6 lg:p-8 shadow-sm transition-all duration-300">
              {/* TOP CREATOR HEADER */}
              <div className="flex items-center justify-between pb-6 border-b border-border-theme">
                <div className="flex items-center gap-3.5">
                  {/* Initials / Avatar Circle */}
                  <div className="relative w-12 h-12 rounded-full bg-secondary text-white font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                    {creator.initials}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-foreground font-serif">
                        {creator.name}
                      </h3>
                      {/* Verified Badge */}
                      <span className="inline-flex text-secondary">
                        <VerifiedCheckIcon />
                      </span>
                    </div>

                    <span className="text-xs text-text-secondary block mt-0.5">
                      {creator.handleLocation}
                    </span>
                  </div>
                </div>

                {/* Right Side Pending Escrow */}
                <div className="text-right">
                  <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase block">
                    {creator.pendingLabel}
                  </span>
                  <span className="text-base font-bold text-secondary block mt-0.5">
                    {creator.pendingAmount}
                  </span>
                </div>
              </div>

              {/* COUTURE DELIVERABLE MENU */}
              <div className="pt-6">
                <span className="text-[11px] font-bold tracking-wider text-text-secondary uppercase block mb-4">
                  {creator.menuLabel}
                </span>

                {/* 3 DELIVERABLE ROWS */}
                <div className="space-y-3">
                  {creator.desktopDeliverables.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-surface-muted/60 border border-border-theme/60 flex items-center justify-between gap-4 hover:border-secondary/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-surface border border-border-theme text-secondary shrink-0">
                          {item.type === "video" && <VideoIcon />}
                          {item.type === "image" && <ImageIcon />}
                          {item.type === "rocket" && <RocketIcon />}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-foreground">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-text-secondary block mt-0.5">
                            {item.subtext}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-bold font-serif text-foreground shrink-0 ml-2">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                <div className="mt-6 pt-4 border-t border-border-theme flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <LockIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Stripe Verified Vault</span>
                  </div>

                  <button
                    type="button"
                    className="text-xs font-semibold text-secondary hover:underline cursor-pointer inline-flex items-center gap-1 transition-all"
                  >
                    <span>Instant Bank Transfer</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            MOBILE COMPOSITION (MATCHES MOBILE REFERENCE SCREENSHOT)
        ========================================================= */}
        <div className="block md:hidden">
          {/* MOBILE SECTION HEADER WITH INSTANT PAYOUTS BADGE */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif font-medium text-foreground tracking-tight">
              Creator Payout Card
            </h2>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              Instant Payouts
            </span>
          </div>

          {/* SINGLE WHITE/SURFACE ROUNDED CARD */}
          <div className="bg-surface border border-border-theme rounded-[24px] p-5 shadow-sm">
            {/* CREATOR HEADER */}
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-border-theme/60">
              <Image src={creator.avatar} alt={creator.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover shrink-0 border border-border-theme shadow-xs" />

              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {creator.mobileCardTitle}
                </h3>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  {creator.mobileCardSubtext}
                </span>
              </div>
            </div>

            {/* PAYOUT ROWS WITH CLEAN HORIZONTAL DIVIDERS */}
            <div className="space-y-0">
              {creator.mobileDeliverables.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between py-3.5 text-xs ${
                    idx !== 0 ? "border-t border-border-theme/60" : ""
                  }`}
                >
                  <span className="font-medium text-text-secondary">
                    {item.title}
                  </span>
                  <span className="font-bold font-serif text-foreground ml-3">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
