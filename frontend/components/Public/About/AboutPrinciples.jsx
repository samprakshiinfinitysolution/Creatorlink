'use client';

import React from 'react';

export default function AboutPrinciples() {
  const principles = [
    {
      number: '01',
      badge: 'PRINCIPLE',
      title: 'AUTHENTICITY',
      quote: '"Creators know their audience best."',
      description:
        'Audiences immediately sense forced placement. When brands give creative liberty and honor a creator\'s visual voice, passive engagement turns into enduring loyalty.',
      footerRef: 'board ref: 01-trust',
      icon: '✓',
      rotation: 'lg:-rotate-[1deg]',
    },
    {
      number: '02',
      badge: 'PRINCIPLE',
      title: 'CREATIVITY',
      quote: '"Brands bring ideas. Creators bring perspective."',
      description:
        'Potent work happens at the crossroads. When strategic objectives merge with distinctive auteur signatures, the campaign transforms into collector-worthy storytelling.',
      footerRef: 'board ref: 02-craft',
      icon: '✦',
      rotation: 'lg:rotate-[0.5deg]',
    },
    {
      number: '03',
      badge: 'PRINCIPLE',
      title: 'RELATIONSHIPS',
      quote: '"Great partnerships grow beyond one campaign."',
      description:
        'One-off sponsorships fade instantly. We build pinboards for recurring ambassadorships, long-term creative councils, and compounding brand equity.',
      footerRef: 'board ref: 03-guild',
      icon: '∞',
      rotation: 'lg:rotate-[1deg]',
    },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ====================================================
            1. HEADER CONTENT
        ==================================================== */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-mono font-bold tracking-wider text-secondary uppercase mb-6 shadow-sm">
            <span className="text-secondary text-sm">✢</span>
            <span>OUR MANIFESTO</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-6">
            Authentic collaboration creates enduring culture.
          </h2>

          {/* Supporting Paragraph */}
          <p className="text-base sm:text-lg font-sans text-text-secondary leading-relaxed">
            We set aside disposable influencer feeds in favor of intentional, pinned partnerships rooted in shared taste and creative trust.
          </p>
        </div>

        {/* ====================================================
            2. THE 3 PRINCIPLE CARDS GRID
        ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {principles.map((principle, index) => (
            <div
              key={index}
              className={`group relative p-6 sm:p-8 rounded-[28px] bg-surface border border-border-theme shadow-lg backdrop-blur-sm flex flex-col justify-between transition-all duration-500 ease-out ${principle.rotation} hover:rotate-0 hover:-translate-y-2 hover:scale-[1.01] hover:border-secondary hover:shadow-2xl hover:shadow-secondary/15`}
            >
              {/* Card Top Row: Number & Principle Badge */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-secondary/40 group-hover:text-secondary group-hover:-translate-y-0.5 transition-all duration-300">
                    {principle.number}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-surface-muted border border-border-theme text-[10px] font-mono font-bold tracking-wider text-text-secondary uppercase group-hover:border-secondary/30 transition-colors">
                    {principle.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight mb-3 group-hover:text-secondary transition-colors duration-300">
                  {principle.title}
                </h3>

                {/* Italic Quote */}
                <p className="text-sm font-serif italic text-text-secondary mb-4 leading-snug">
                  {principle.quote}
                </p>

                {/* Description */}
                <p className="text-sm font-sans text-text-secondary leading-relaxed">
                  {principle.description}
                </p>
              </div>

              {/* Card Bottom Divider & Footer */}
              <div className="mt-8 pt-4 border-t border-border-theme flex items-center justify-between text-xs font-mono group-hover:border-secondary/30 transition-colors">
                <span className="font-serif italic text-text-secondary/70">
                  {principle.footerRef}
                </span>
                <span className="text-text-secondary group-hover:text-secondary transition-colors text-sm">
                  {principle.icon}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
