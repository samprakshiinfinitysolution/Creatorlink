'use client';

import React from 'react';
import Image from 'next/image';

export default function AboutSharedVision({ ctaHref }) {
  return (
    <section className="relative py-20 lg:py-28 bg-[#181716] dark:bg-background text-white overflow-hidden border-t border-white/10">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[650px] lg:w-[900px] h-[400px] sm:h-[650px] lg:h-[900px] bg-secondary/10 blur-[140px] sm:blur-[180px] rounded-full pointer-events-none" />

      {/* Reduced Motion CSS fallback */}
      <style>{`
        @keyframes visionFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .vision-animate-fade-up {
          animation: visionFadeUp 0.8s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .vision-animate-fade-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ====================================================
              1. LEFT EDITORIAL CONTENT COLUMN
          ==================================================== */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col items-start vision-animate-fade-up">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-secondary uppercase mb-6 sm:mb-8 shadow-sm">
              <span className="text-secondary text-xs sm:text-sm">✢</span>
              <span>ONE SHARED BOARD</span>
            </div>

            {/* Main Editorial Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white leading-[1.12] mb-6 sm:mb-8">
              <span>Different perspectives.</span>
              <br />
              <span className="text-secondary italic">One singular vision.</span>
            </h2>

            {/* Editorial Info Strip Container */}
            <div className="relative inline-flex flex-col items-start px-4 sm:px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mb-6 sm:mb-8 shadow-inner">
              {/* Pink Striped Washi Tape Decor Strip */}
              <div
                className="w-8 h-2 rounded-sm bg-secondary/30 border border-secondary/40 mb-2 opacity-90"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, rgba(255,79,135,0.4) 0px, rgba(255,79,135,0.4) 3px, transparent 3px, transparent 7px)',
                }}
                aria-hidden="true"
              />

              {/* Info Strip Text */}
              <div className="font-mono text-[10px] sm:text-xs font-bold tracking-wider text-gray-200 uppercase flex flex-wrap items-center gap-2">
                <span>BRANDS</span>
                <span className="text-secondary font-sans font-normal text-xs">×</span>
                <span>CREATORS</span>
                <span className="text-secondary font-sans font-normal text-xs">→</span>
                <span className="text-white">CINEMATIC REALITY</span>
              </div>
            </div>

            {/* Supporting Paragraph */}
            <p className="font-sans text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl mb-8 sm:mb-10">
              When commercial gravity connects with authentic cultural auteuership, traditional ads vanish. In their place: artifacts that audiences pin, save, and celebrate.
            </p>

            {/* CTA Area */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
              {/* Primary Clickable CTA Button */}
              <a
                href={ctaHref || "https://creatorlink.io/signup"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-secondary text-primary-foreground font-sans font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-secondary/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer text-center"
              >
                Pin Your Spot in the Guild
              </a>

              {/* Secondary Supporting Label */}
              <span className="font-mono text-[10px] sm:text-xs font-bold text-gray-400 tracking-widest uppercase">
                INVITATION-ONLY GUILD
              </span>
            </div>

          </div>

          {/* ====================================================
              2. RIGHT CINEMATIC IMAGE CARD COLUMN
          ==================================================== */}
          <div className="md:col-span-5 lg:col-span-5 w-full">
            <div className="group relative rounded-[28px] sm:rounded-[36px] overflow-hidden border border-white/10 bg-white/5 shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-secondary/50 hover:shadow-secondary/20 hover:shadow-2xl">
              
              {/* Image Aspect Container */}
              <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1579632652768-6cb9dcf85912?auto=format&fit=crop&w=1000&q=80"
                  alt="Cinematic dialogue behind the scenes"
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* Inside Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-left z-10">
                  <span className="font-mono text-[10px] sm:text-xs font-bold text-secondary tracking-widest uppercase mb-1.5 sm:mb-2 block">
                    CINEMATIC DIALOGUE
                  </span>
                  <h4 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
                    &ldquo;Art that doesn&apos;t feel like advertising.&rdquo;
                  </h4>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
