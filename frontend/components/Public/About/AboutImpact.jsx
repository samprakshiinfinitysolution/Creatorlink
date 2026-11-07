'use client';

import React from 'react';
import ScrollReveal from '@/components/theme/ScrollReveal';

const COMMUNITY_CARDS = [
  {
    id: '01',
    title: 'Creative Expression',
    description:
      'Give creators space to showcase their unique ideas, skills and content style.',
    badge: 'FOR CREATORS',
    icon: '✦',
  },
  {
    id: '02',
    title: 'Brand Discovery',
    description:
      'Help businesses explore creative talent and discover potential collaboration partners.',
    badge: 'FOR BRANDS',
    icon: '🔍',
  },
  {
    id: '03',
    title: 'Meaningful Relationships',
    description:
      'Encourage clear conversations, shared expectations and professional connections.',
    badge: 'FOR PARTNERSHIPS',
    icon: '🤝',
  },
];

export default function AboutImpact() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. SECTION HEADER
        ==================================================== */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-18">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-bold tracking-wider text-secondary uppercase mb-4 shadow-xs font-sans">
              <span className="text-secondary text-sm">✦</span>
              <span>BETTER TOGETHER</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-5">
              Different Talents. Shared Possibilities.
            </h2>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg font-sans text-text-secondary leading-relaxed max-w-2xl">
              Every creator brings a different perspective, and every brand has a different story. CreatorLink is designed to bring those differences together and create opportunities for people to work towards shared goals.
            </p>
          </div>
        </ScrollReveal>

        {/* ====================================================
            2. THREE COMMUNITY CARDS
        ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {COMMUNITY_CARDS.map((card, idx) => (
            <ScrollReveal
              key={card.id}
              direction="up"
              delay={idx * 60}
              className="h-full"
            >
              <div className="group h-full bg-surface border border-border-theme hover:border-secondary/60 rounded-[28px] p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-theme">
                    <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-[10px] font-sans font-bold uppercase tracking-wider">
                      {card.badge}
                    </span>
                    <span className="text-lg">
                      {card.icon}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
