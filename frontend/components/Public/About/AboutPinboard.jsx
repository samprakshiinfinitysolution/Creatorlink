'use client';

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/theme/ScrollReveal';

export default function AboutPinboard() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. TOP HEADER CONTENT
        ==================================================== */}
        <ScrollReveal direction="up" delay={0}>
          <div className="max-w-3xl mb-12 sm:mb-16 text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-bold tracking-wider text-secondary uppercase mb-4 shadow-xs font-sans">
              <span className="text-secondary text-sm">✦</span>
              <span>A SHARED CREATIVE SPACE</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-5">
              Different Perspectives. One Shared Goal.
            </h2>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg font-sans text-text-secondary leading-relaxed max-w-2xl">
              Brands understand their vision and creators understand their audiences. CreatorLink brings these perspectives together so both sides can explore ideas and build collaborations with clear expectations.
            </p>
          </div>
        </ScrollReveal>

        {/* ====================================================
            2. MAIN PERSPECTIVES CANVAS (DUAL CARDS + CONNECTOR)
        ==================================================== */}
        <ScrollReveal direction="up" delay={100}>
          <div className="relative p-6 sm:p-8 lg:p-12 rounded-[32px] sm:rounded-[40px] bg-surface/70 border border-border-theme backdrop-blur-sm shadow-xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-stretch relative z-10">

              {/* LEFT CARD: THE BRAND PERSPECTIVE */}
              <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#FDF2F5] dark:bg-secondary/[0.08] border border-secondary/20 shadow-md flex flex-col justify-between transition-all duration-300 hover:shadow-xl text-left">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold tracking-wider text-secondary uppercase font-sans">
                      THE BRAND PERSPECTIVE
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-surface text-[10px] font-sans font-semibold text-text-secondary border border-border-theme">
                      Brand Vision
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] h-44 sm:h-52 bg-surface-muted mb-5">
                    <Image
                      src="https://res.cloudinary.com/atr5osne/image/upload/v1792054714/creatorlink/public/editorial/se3wpecdot8jphnowzci.webp"
                      alt="Brand Perspective"
                      fill
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-2">
                    Every Brand Has a Story to Tell.
                  </h3>

                  <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                    Brands can share their products, campaign goals and creative direction to help creators understand what they want to communicate.
                  </p>
                </div>
              </div>

              {/* CENTER CONNECTOR: COLLABORATION */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 lg:py-0">
                <div className="w-14 h-14 rounded-full bg-secondary text-white font-bold flex items-center justify-center shadow-lg text-lg mb-2">
                  ✦
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-secondary font-sans">
                  COLLABORATION
                </span>
                <span className="text-[11px] text-text-secondary font-sans mt-0.5">
                  Shared Alignment
                </span>
              </div>

              {/* RIGHT CARD: THE CREATOR PERSPECTIVE */}
              <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-surface border border-border-theme shadow-md flex flex-col justify-between transition-all duration-300 hover:shadow-xl text-left">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold tracking-wider text-secondary uppercase font-sans">
                      THE CREATOR PERSPECTIVE
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-[10px] font-sans font-semibold text-text-secondary border border-border-theme">
                      Creator Creativity
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] h-44 sm:h-52 bg-surface-muted mb-5">
                    <Image
                      src="https://res.cloudinary.com/atr5osne/image/upload/v1792054730/creatorlink/public/editorial/kerribvpkxjoqrecd56w.webp"
                      alt="Creator Perspective"
                      fill
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-2">
                    Every Creator Has a Unique Voice.
                  </h3>

                  <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                    Creators bring their personality, creativity and content style to help brands communicate in an engaging and relatable way.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
