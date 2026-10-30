'use client';

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/theme/ScrollReveal';

const CARDS_DATA = [
  {
    id: 1,
    type: 'featured',
    category: 'CREATOR PIN',
    label: 'CREATOR PIN',
    title: '@elena.sound',
    rightMeta: '15m audio',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054768/creatorlink/public/editorial/xdrgoikjqafozpvsbjiw.webp',
    isBw: true,
  },
  {
    id: 2,
    type: 'standard',
    category: 'BEAUTY / CLEAN',
    label: 'BRAND STILL',
    title: 'Aura Botanicals',
    rightBadge: 'VERIFIED',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054733/creatorlink/public/campaigns/cru8rs8ckm8iszusol6z.webp',
  },
  {
    id: 3,
    type: 'standard',
    category: 'COLLABORATION',
    label: 'COLLABORATION',
    title: 'Maison × Clara',
    rightMeta: 'season release',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054773/creatorlink/public/editorial/vtopzfgvylqioq3g2fbt.webp',
  },
  {
    id: 4,
    type: 'standard',
    category: 'CONTENT',
    label: 'CONTENT',
    title: 'Spatial Forms',
    rightMeta: 'ARCHIVE',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054730/creatorlink/public/editorial/kerribvpkxjoqrecd56w.webp',
  },
  {
    id: 5,
    type: 'standard',
    category: 'CONTENT BOARD',
    label: 'CONTENT BOARD',
    title: 'Tableau Studio',
    rightMeta: '4.8k saves',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054714/creatorlink/public/editorial/se3wpecdot8jphnowzci.webp',
  },
  {
    id: 6,
    type: 'standard',
    category: 'CREATOR BOARD',
    label: 'CREATOR BOARD',
    title: 'Nordic Journal',
    rightMeta: '6.2k saves',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792055800/creatorlink/public/editorial/bulw0yvv7mo8ioklrp5o.webp',
  },
  {
    id: 7,
    type: 'standard',
    category: 'GUILD REVIEW',
    label: 'GUILD REVIEW',
    title: 'Contact Sheet N° 09',
    rightStatusDot: true,
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792056050/creatorlink/public/editorial/xus8b1zuskyogjb6g198.webp',
  },
  {
    id: 8,
    type: 'standard',
    category: 'STUDIO ARCHIVE',
    label: 'STUDIO ARCHIVE',
    title: 'Set 04 / Paris',
    rightStatusDot: true,
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054717/creatorlink/public/editorial/ir7hxl0x2guq9j4yoxto.webp',
  },
];

export default function AboutPinboardWall() {
  const card1 = CARDS_DATA[0];
  const gridCards = CARDS_DATA.slice(1);

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[900px] h-[350px] sm:h-[600px] lg:h-[900px] bg-secondary/10 blur-[130px] sm:blur-[170px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. SECTION HEADER
        ==================================================== */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 lg:mb-16 gap-4 sm:gap-6">
            <div className="flex flex-col items-start max-w-2xl">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-[10px] sm:text-xs font-mono font-bold tracking-wider text-secondary uppercase mb-4 shadow-sm">
                <span className="text-secondary text-xs sm:text-sm">◫</span>
                <span>THE LIVING FEED</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15]">
                The Curated Pinboard Wall.
              </h2>
            </div>

            {/* Right Supporting Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border-theme text-[10px] sm:text-xs font-mono font-bold tracking-wider text-text-secondary uppercase shadow-sm shrink-0 self-start md:self-end">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>LIVE PINNED COLLABORATIONS</span>
            </div>
          </div>
        </ScrollReveal>

        {/* ====================================================
            2. MASONRY/EDITORIAL PINBOARD GRID
            Desktop: 12-column grid.
            Left (3 cols): Tall Card 1 spanning rows.
            Right (9 cols): 3x3 layout of cards 2 to 8.
        ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* --------------------------------------------------
              CARD 1: TALL FEATURED CREATOR PIN
          -------------------------------------------------- */}
          <ScrollReveal
            direction="up"
            delay={0}
            className="sm:col-span-2 lg:col-span-3 lg:row-span-3 h-full"
          >
            <div className="group relative rounded-[20px] sm:rounded-[26px] bg-surface border border-border-theme overflow-hidden shadow-md flex flex-col justify-between h-full min-h-[460px] sm:min-h-[540px] lg:min-h-0 transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.01] hover:shadow-xl">
              {/* Image Container with Zoom & Hover Overlays */}
              <div className="relative w-full flex-1 overflow-hidden min-h-[360px] sm:min-h-[440px] lg:min-h-0">
                {/* Category Badge Top-Left */}
                <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[9px] font-semibold tracking-wider uppercase shadow-sm opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  {card1.category}
                </div>

                {/* Pin Button Top-Right */}
                <button
                  type="button"
                  aria-label={`Pin ${card1.title}`}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-full bg-secondary/20 dark:bg-secondary/30 backdrop-blur-md border border-secondary/30 text-secondary font-mono text-[9px] font-bold flex items-center gap-1 shadow-sm opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto hover:bg-surface hover:text-secondary hover:border-secondary hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <span>🔖</span>
                  <span>Pin</span>
                </button>

                <Image
                  src={card1.image}
                  alt={card1.title}
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 grayscale contrast-125"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Footer Metadata */}
              <div className="p-4 sm:p-5 flex items-center justify-between bg-surface border-t border-border-theme/40 shrink-0">
                <div>
                  <span className="font-mono text-[9px] sm:text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-0.5">
                    {card1.label}
                  </span>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
                    {card1.title}
                  </h3>
                </div>
                {card1.rightMeta && (
                  <span className="font-serif italic text-xs text-secondary shrink-0">
                    {card1.rightMeta}
                  </span>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* --------------------------------------------------
              CARDS 2 - 8: EDITORIAL GRID CARDS
          -------------------------------------------------- */}
          {gridCards.map((card, index) => (
            <ScrollReveal
              key={card.id}
              direction="up"
              delay={(index + 1) * 40}
              className="sm:col-span-1 lg:col-span-3 h-full"
            >
              <div
                className="group relative rounded-[20px] sm:rounded-[26px] bg-surface border border-border-theme overflow-hidden shadow-md flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.01] hover:shadow-xl h-full"
              >
                {/* Image Wrapper with Zoom & Hover Overlays */}
                <div className="relative w-full h-36 sm:h-44 overflow-hidden">
                  {/* Category Badge Top-Left */}
                  <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[9px] font-semibold tracking-wider uppercase shadow-sm opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {card.category}
                  </div>

                  {/* Pin Button Top-Right */}
                  <button
                    type="button"
                    aria-label={`Pin ${card.title}`}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-full bg-secondary/20 dark:bg-secondary/30 backdrop-blur-md border border-secondary/30 text-secondary font-mono text-[9px] font-bold flex items-center gap-1 shadow-sm opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto hover:bg-surface hover:text-secondary hover:border-secondary hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <span>🔖</span>
                    <span>Pin</span>
                  </button>

                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Card Bottom Footer Row */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between bg-surface border-t border-border-theme/40 shrink-0">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-mono text-[9px] sm:text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-0.5 truncate">
                      {card.label}
                    </span>
                    <h3 className="font-sans text-xs sm:text-sm font-bold text-foreground truncate">
                      {card.title}
                    </h3>
                  </div>

                  {/* Right Metadata / Badge / Dot */}
                  <div className="shrink-0 flex items-center">
                    {card.rightBadge && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-[9px] font-mono font-bold tracking-wider uppercase">
                        {card.rightBadge}
                      </span>
                    )}

                    {card.rightMeta && (
                      <span
                        className={`text-[10px] font-medium tracking-wide ${
                          card.rightMeta === 'season release'
                            ? 'font-serif italic text-secondary'
                            : card.rightMeta === 'ARCHIVE'
                            ? 'font-mono text-[9px] font-bold text-text-secondary tracking-widest uppercase'
                            : 'font-mono text-text-secondary'
                        }`}
                      >
                        {card.rightMeta}
                      </span>
                    )}

                    {card.rightStatusDot && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm" />
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}

        </div>

      </div>
    </section>
  );
}