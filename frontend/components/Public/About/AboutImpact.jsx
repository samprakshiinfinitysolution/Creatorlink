'use client';

import React from 'react';

const IMPACT_CARDS = [
  {
    id: '01',
    title: 'Verified Presence',
    description:
      'Auteurs build legitimate, enduring portfolios with transparent track records.',
    bottomLabel: '100% verified talent',
    bgStyle: 'bg-secondary/5 dark:bg-secondary/10',
    iconBg: 'bg-secondary/15 text-secondary border border-secondary/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: '02',
    title: 'Authentic Voices',
    description:
      'Prestige brands discover distinct niche aesthetics rather than repetitive mass tropes.',
    bottomLabel: 'niche > generic',
    bgStyle: 'bg-surface border-border-theme',
    iconBg: 'bg-secondary/15 text-secondary border border-secondary/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: '03',
    title: 'Creative Autonomy',
    description:
      'Automated milestone escrow ensures security for creators and verifiable delivery for brands.',
    bottomLabel: 'zero payment delays',
    bgStyle: 'bg-secondary/5 dark:bg-secondary/10',
    iconBg: 'bg-secondary/15 text-secondary border border-secondary/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6z" />
      </svg>
    ),
  },
  {
    id: '04',
    title: 'Ambassador Guilds',
    description:
      'Long-term cohorts replace one-off sponsorships with strategic multi-year brand councils.',
    bottomLabel: 'sustained loyalty',
    bgStyle: 'bg-surface border-border-theme',
    iconBg: 'bg-foreground text-background',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function AboutImpact() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] lg:w-[800px] h-[320px] sm:h-[500px] lg:h-[800px] bg-secondary/10 blur-[120px] sm:blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. SECTION HEADER CONTENT
        ==================================================== */}
        <div className="flex flex-col items-start mb-10 sm:mb-14 lg:mb-16">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-[10px] sm:text-xs font-mono font-bold tracking-wider text-secondary uppercase mb-4 sm:mb-6 shadow-sm">
            <span className="text-secondary text-xs sm:text-sm">⊕</span>
            <span>MEASURED IMPACT</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] max-w-2xl mb-4 sm:mb-6">
            Built around creative longevity, not fleeting impressions.
          </h2>

          {/* Supporting Paragraph */}
          <p className="text-sm sm:text-base lg:text-lg font-sans text-text-secondary leading-relaxed max-w-xl">
            True community value is measured by artistic trust, verified metrics, and long-term brand equity.
          </p>
        </div>

        {/* ====================================================
            2. FOUR IMPACT CARDS GRID
            Desktop: 4 columns in one row
            Tablet: 2x2 grid
            Mobile: 1 column
        ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {IMPACT_CARDS.map((card) => (
            <div
              key={card.id}
              className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-[22px] sm:rounded-[28px] border border-border-theme shadow-md ${card.bgStyle} transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-secondary hover:shadow-2xl hover:shadow-secondary/15 cursor-pointer min-h-[260px] sm:min-h-[280px]`}
            >
              {/* TOP: ICON CIRCLE */}
              <div className="mb-5 sm:mb-6">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300 ${card.iconBg}`}>
                  {card.icon}
                </div>
              </div>

              {/* MIDDLE & BOTTOM: TITLE, DESCRIPTION & EDITORIAL LABEL */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-secondary transition-colors mb-2 leading-snug">
                    {card.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Editorial Handwritten Label */}
                <div className="pt-3 border-t border-border-theme/40">
                  <span className="font-serif italic text-xs sm:text-sm text-secondary block transition-transform duration-300 group-hover:-translate-y-0.5">
                    {card.bottomLabel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
