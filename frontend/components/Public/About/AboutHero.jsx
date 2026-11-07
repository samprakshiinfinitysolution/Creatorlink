'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/theme/ScrollReveal';

export default function AboutHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 3-Stage Growth & Journey Slides
  const journeySlides = [
    {
      id: 1,
      phase: 'PHASE 01 · THE FOUNDATION',
      title: 'Where We Started: The Creative Spark',
      subtitle: 'Breaking down opaque agency barriers so genuine creators could be recognized directly.',
      image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054714/creatorlink/public/editorial/se3wpecdot8jphnowzci.webp',
      badge: 'Authentic Craft',
      stat: '0% Middleman Fees',
    },
    {
      id: 2,
      phase: 'PHASE 02 · THE CONNECTION',
      title: 'How We Evolved: The Direct Bridge',
      subtitle: 'Building a transparent collaboration pipeline connecting brands and creators with mutual clarity.',
      image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054740/creatorlink/public/editorial/hwajtuk9gwkhujb9glj8.webp',
      badge: 'Direct Partnerships',
      stat: 'Verified Briefs & Milestones',
    },
    {
      id: 3,
      phase: 'PHASE 03 · THE EXPANSION',
      title: 'Where We Are Heading: Scaled Impact',
      subtitle: 'Nurturing a modern ecosystem where creator businesses scale and brands build lasting relationships.',
      image: 'https://res.cloudinary.com/atr5osne/image/upload/v1792054730/creatorlink/public/editorial/kerribvpkxjoqrecd56w.webp',
      badge: 'Ecosystem Growth',
      stat: 'Built for Scale',
    },
  ];

  // Auto-play sliding timer (4.5s)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % journeySlides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, journeySlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % journeySlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + journeySlides.length) % journeySlides.length);
  };

  return (
    <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-24 px-2 sm:px-4 lg:px-6 bg-background text-foreground overflow-hidden border-b border-border-theme/60 transition-colors duration-300">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-tertiary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1536px] mx-auto relative z-10 px-1 sm:px-2">
        
        {/* ====================================================
            FULL-WIDTH 2-COLUMN STAGE:
            LEFT = SLIDING JOURNEY CAROUSEL (~50%)
            RIGHT = HEADLINE, STORY & DUAL CTAS (~50%)
        ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">

          {/* ==================================================
              LEFT SIDE: JOURNEY & GROWTH IMAGE SLIDER (50%)
          ================================================== */}
          <ScrollReveal
            direction="up"
            delay={0}
            className="lg:col-span-6 w-full order-2 lg:order-1"
          >
            <div
              className="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-2xl bg-slate-950 min-h-[440px] sm:min-h-[520px] lg:min-h-[580px] xl:min-h-[620px] flex flex-col justify-between p-6 sm:p-8 select-none group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Sliding Background Images */}
              {journeySlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    priority={idx === 0}
                  />
                  {/* High-Contrast Vignette Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60 pointer-events-none" />
                </div>
              ))}

              {/* TOP BAR: Status Tag + Slide Step Count */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-[11px] font-extrabold uppercase tracking-wider font-sans shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>OUR GROWTH JOURNEY</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-xs font-mono font-bold">
                  <span>0{currentSlide + 1}</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white/60">0{journeySlides.length}</span>
                </div>
              </div>

              {/* BOTTOM CARD: Active Slide Details + Progress Indicator */}
              <div className="relative z-10 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white text-left shadow-2xl">
                
                {/* Phase Tag & Metric Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-widest text-pink-200">
                    {journeySlides[currentSlide].phase}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary/30 border border-secondary/40 text-[10px] font-sans font-bold text-white uppercase tracking-wider">
                    {journeySlides[currentSlide].badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight mb-2 text-white">
                  {journeySlides[currentSlide].title}
                </h3>

                {/* Subtitle / Story */}
                <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed mb-4">
                  {journeySlides[currentSlide].subtitle}
                </p>

                {/* Footer Controls: Dots & Navigation Arrows */}
                <div className="flex items-center justify-between pt-3 border-t border-white/15">
                  {/* Carousel Progress Dots */}
                  <div className="flex items-center gap-2">
                    {journeySlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentSlide
                            ? 'w-7 bg-secondary shadow-sm'
                            : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Previous & Next Arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous slide"
                      className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next slide"
                      className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      →
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </ScrollReveal>

          {/* ==================================================
              RIGHT SIDE: HERO CONTENT & CTAS (~50%)
          ================================================== */}
          <ScrollReveal
            direction="up"
            delay={40}
            className="lg:col-span-6 w-full flex flex-col justify-center text-left order-1 lg:order-2"
          >
            {/* Top Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface border border-border-theme shadow-xs backdrop-blur-md mb-5 self-start">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-secondary uppercase font-sans">
                ABOUT CREATORLINK
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] xl:text-6xl font-serif font-medium tracking-tight leading-[1.12] text-foreground mb-4">
              Bringing Brands and Creators{' '}
              <span className="relative inline-block font-serif italic text-secondary px-3 sm:px-5 py-0.5 rounded-full bg-secondary/15 border border-secondary/20">
                Together
              </span>{' '}
              to Create More.
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-4 max-w-xl">
              CreatorLink is a platform built to connect brands with creative talent. We make it easier to discover creators, explore collaboration opportunities and bring great ideas to life through meaningful partnerships.
            </p>

            {/* Supporting Line */}
            <p className="text-xs sm:text-sm font-semibold text-secondary dark:text-pink-300 font-sans mb-6">
              One platform. Two sides. More opportunities to create together.
            </p>

            {/* Dual Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 mb-7 w-full sm:w-auto">
              <Link
                href="/creators"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-sans font-semibold text-xs tracking-wider uppercase shadow-md hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Explore Creators</span>
                <span>→</span>
              </Link>

              <Link
                href="/brands"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-surface border border-border-theme hover:border-secondary text-foreground font-sans font-semibold text-xs tracking-wider uppercase shadow-xs transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>For Brands</span>
              </Link>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-200/80 dark:border-white/10 font-sans">
              <div className="flex items-center gap-2 bg-surface border border-border-theme rounded-2xl p-3 shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </span>
                <span className="text-xs font-semibold text-foreground">
                  5-Day Brand Trial
                </span>
              </div>

              <div className="flex items-center gap-2 bg-surface border border-border-theme rounded-2xl p-3 shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Free Creator Access
                </span>
              </div>

              <div className="flex items-center gap-2 bg-surface border border-border-theme rounded-2xl p-3 shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </span>
                <span className="text-xs font-semibold text-foreground">
                  100% Direct Collabs
                </span>
              </div>
            </div>

          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
