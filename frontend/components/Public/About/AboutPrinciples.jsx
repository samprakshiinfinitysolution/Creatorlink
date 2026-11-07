'use client';

import React from 'react';
import ScrollReveal from '@/components/theme/ScrollReveal';

export default function AboutPrinciples() {
  const principles = [
    {
      number: '01',
      title: 'AUTHENTICITY',
      quote: '"Real creativity starts with being yourself."',
      description:
        'Creators have their own voice, perspective and relationship with their audience. We believe collaborations should respect that individuality and encourage authentic content.',
      icon: '✓',
    },
    {
      number: '02',
      title: 'TRANSPARENCY',
      quote: '"Clear expectations create stronger partnerships."',
      description:
        'From campaign requirements to deliverables and compensation, both sides should understand what is expected before starting a collaboration.',
      icon: '✦',
    },
    {
      number: '03',
      title: 'COLLABORATION',
      quote: '"Better work happens when people work together."',
      description:
        'Brands and creators bring different strengths to the table. Open communication and shared goals can turn creative ideas into meaningful work.',
      icon: '∞',
    },
    {
      number: '04',
      title: 'GROWTH',
      quote: '"Every connection can open a new opportunity."',
      description:
        'We believe in building professional relationships that encourage creators and brands to learn, improve and explore future possibilities.',
      icon: '↗',
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. HEADER CONTENT
        ==================================================== */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-18">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-bold tracking-wider text-secondary uppercase mb-4 shadow-xs font-sans">
              <span className="text-secondary text-sm">✦</span>
              <span>WHAT WE BELIEVE</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-5">
              The Principles Behind Better Collaborations.
            </h2>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg font-sans text-text-secondary leading-relaxed max-w-2xl">
              We believe meaningful creator-brand partnerships begin with trust, respect and clear communication. These principles guide the experience we want to build through CreatorLink.
            </p>
          </div>
        </ScrollReveal>

        {/* ====================================================
            2. FOUR PRINCIPLE CARDS GRID
        ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {principles.map((p, idx) => (
            <ScrollReveal
              key={p.number}
              direction="up"
              delay={idx * 60}
              className="h-full"
            >
              <div className="group h-full bg-surface border border-border-theme hover:border-secondary/60 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
                <div>
                  {/* Top Bar: Number & Icon */}
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-theme">
                    <span className="font-mono text-2xl font-bold text-secondary">
                      {p.number}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold">
                      {p.icon}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                    {p.title}
                  </h3>

                  {/* Quote */}
                  <p className="text-xs sm:text-sm font-serif italic text-secondary dark:text-pink-300 mb-3 leading-snug">
                    {p.quote}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm font-sans text-text-secondary leading-relaxed">
                    {p.description}
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
