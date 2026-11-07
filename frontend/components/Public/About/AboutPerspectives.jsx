'use client';

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/theme/ScrollReveal';

export default function AboutPerspectives() {
  const missionPoints = [
    {
      title: 'Make creator discovery easier.',
      desc: 'Connect brands with genuine creative talent across different categories and styles.',
    },
    {
      title: 'Encourage meaningful brand partnerships.',
      desc: 'Build collaboration opportunities focused on authentic engagement and shared success.',
    },
    {
      title: 'Promote clear communication.',
      desc: 'Set clear expectations on briefs, deliverables, timelines and compensation from the start.',
    },
    {
      title: 'Create opportunities for creative growth.',
      desc: 'Help creators and businesses learn, scale, and build lasting professional relationships.',
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[800px] h-[350px] sm:h-[600px] lg:h-[800px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. SECTION HEADER
        ==================================================== */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-bold tracking-wider text-secondary uppercase mb-4 shadow-xs font-sans">
              <span className="text-secondary text-sm">✦</span>
              <span>OUR MISSION</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground max-w-3xl leading-[1.15] mb-5">
              Making Creator Collaborations More Accessible.
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg font-sans text-text-secondary leading-relaxed max-w-2xl">
              Our mission is to make it easier for brands and creators to find each other and work together. We want to create a space where creative talent can be discovered, brand ideas can find the right voices and collaboration opportunities can become easier to explore.
            </p>
          </div>
        </ScrollReveal>

        {/* ====================================================
            2. MISSION SPLIT: IMAGE SHOWCASE & 4 SUPPORTING POINTS
        ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center max-w-6xl mx-auto">
          
          {/* Visual Showcase (5 Cols) */}
          <ScrollReveal direction="up" delay={60} className="lg:col-span-5 w-full">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-surface-muted border border-border-theme shadow-xl">
              <Image
                src="https://res.cloudinary.com/atr5osne/image/upload/v1792054740/creatorlink/public/editorial/hwajtuk9gwkhujb9glj8.webp"
                alt="CreatorLink Mission"
                fill
                className="w-full h-full object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                <span className="text-xs uppercase font-extrabold tracking-widest text-secondary block mb-1 font-sans">
                  PURPOSE-DRIVEN
                </span>
                <p className="font-serif text-lg font-bold">
                  Empowering Creators &amp; Brands Everywhere.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* 4 Supporting Points Grid (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {missionPoints.map((point, idx) => (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={idx * 60 + 80}
              >
                <div className="h-full bg-surface border border-border-theme hover:border-secondary/60 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
                    ✓
                  </div>
                  <h3 className="font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                    {point.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
