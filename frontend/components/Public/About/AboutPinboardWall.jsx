'use client';

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/theme/ScrollReveal';

const CARDS_DATA = [
  {
    id: 1,
    type: 'featured',
    category: 'CREATIVE WORK',
    label: 'CREATOR SHOWCASE',
    title: 'Audio & Visual Studio',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054768/creatorlink/public/editorial/xdrgoikjqafozpvsbjiw.webp',
  },
  {
    id: 2,
    type: 'standard',
    category: 'CAMPAIGN PRODUCTION',
    label: 'BRAND BRIEF',
    title: 'Botanicals Lifestyle',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054733/creatorlink/public/campaigns/cru8rs8ckm8iszusol6z.webp',
  },
  {
    id: 3,
    type: 'standard',
    category: 'COLLABORATION',
    label: 'PARTNERSHIP',
    title: 'Seasonal Collaboration',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054773/creatorlink/public/editorial/vtopzfgvylqioq3g2fbt.webp',
  },
  {
    id: 4,
    type: 'standard',
    category: 'CONTENT CREATION',
    label: 'EDITORIAL',
    title: 'Spatial Design & Living',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054730/creatorlink/public/editorial/kerribvpkxjoqrecd56w.webp',
  },
  {
    id: 5,
    type: 'standard',
    category: 'VISUAL ASSETS',
    label: 'PRODUCTION',
    title: 'Tableau Studio Work',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054714/creatorlink/public/editorial/se3wpecdot8jphnowzci.webp',
  },
  {
    id: 6,
    type: 'standard',
    category: 'CREATOR PORTFOLIO',
    label: 'CREATOR',
    title: 'Nordic Creative Journal',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792055800/creatorlink/public/editorial/bulw0yvv7mo8ioklrp5o.webp',
  },
  {
    id: 7,
    type: 'standard',
    category: 'DELIVERABLE REVIEW',
    label: 'CAMPAIGN',
    title: 'Content Review Sheet',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792056050/creatorlink/public/editorial/xus8b1zuskyogjb6g198.webp',
  },
  {
    id: 8,
    type: 'standard',
    category: 'STUDIO ARCHIVE',
    label: 'COMPLETED WORK',
    title: 'Brand Campaign Still',
    image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054717/creatorlink/public/editorial/ir7hxl0x2guq9j4yoxto.webp',
  },
];

const VALUES = [
  'Clear information.',
  'Respect for creative work.',
  'Open communication.',
  'Professional collaboration.',
];

export default function AboutPinboardWall() {
  const card1 = CARDS_DATA[0];
  const gridCards = CARDS_DATA.slice(1);

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[900px] h-[350px] sm:h-[600px] lg:h-[900px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. SECTION HEADER CONTENT
        ==================================================== */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6 text-left">
            <div className="max-w-2xl">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-bold tracking-wider text-secondary uppercase mb-4 shadow-xs font-sans">
                <span className="text-secondary text-sm">✦</span>
                <span>OUR COMMITMENT</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-4">
                Built Around Clarity, Creativity and Connection.
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base font-sans text-text-secondary leading-relaxed">
                We aim to make the collaboration journey easier to understand for both brands and creators. From discovering potential partners to discussing campaign expectations, the goal is to create a clear and approachable experience.
              </p>
            </div>

            {/* Supporting Values Pill List */}
            <div className="flex flex-wrap gap-2 max-w-md self-start lg:self-end">
              {VALUES.map((val) => (
                <div
                  key={val}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-sans font-semibold text-foreground shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ====================================================
            2. EDITORIAL GALLERY GRID
        ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* CARD 1: TALL SHOWCASE CARD (3 cols) */}
          <div className="sm:col-span-2 lg:col-span-3">
            <ScrollReveal direction="up" delay={40} className="h-full">
              <div className="group h-full min-h-[380px] lg:min-h-[500px] p-4 rounded-3xl bg-surface border border-border-theme shadow-md hover:shadow-xl transition-all flex flex-col justify-between text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-secondary">
                    {card1.category}
                  </span>
                  <span className="text-[10px] font-sans font-semibold text-text-secondary">
                    FEATURED
                  </span>
                </div>

                <div className="relative flex-1 w-full rounded-2xl overflow-hidden mb-3 bg-surface-muted min-h-[260px]">
                  <Image
                    src={card1.image}
                    alt={card1.title}
                    fill
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 25vw"
                  />
                </div>

                <div>
                  <h4 className="text-base font-serif font-bold text-foreground">
                    {card1.title}
                  </h4>
                  <p className="text-[11px] font-sans text-text-secondary mt-0.5">
                    {card1.label}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT GRID CARDS (9 cols: 2 to 8) */}
          <div className="sm:col-span-2 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {gridCards.map((card, idx) => (
              <ScrollReveal
                key={card.id}
                direction="up"
                delay={idx * 40 + 60}
              >
                <div className="group h-full p-4 rounded-3xl bg-surface border border-border-theme shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-secondary">
                      {card.category}
                    </span>
                    <span className="text-[9px] font-sans font-semibold text-text-secondary">
                      {card.label}
                    </span>
                  </div>

                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-surface-muted">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>

                  <h4 className="text-sm font-serif font-bold text-foreground truncate">
                    {card.title}
                  </h4>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
