"use client";

import React from "react";
import Image from "next/image";

export default function HowItWorksMosaic() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1280px] relative z-10 text-center">
        
        {/* -------------------------------------------------------
            SECTION HEADER: EYEBROW, HEADING, DESCRIPTION
        ------------------------------------------------------- */}
        <div className="max-w-xl mx-auto mb-10 sm:mb-14">
          {/* Eyebrow */}
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-text-muted block mb-3 font-sans text-center">
            LOOKBOOK CANVAS
          </span>

          {/* Editorial Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4 text-center">
            The Living Mosaic of <br className="hidden sm:inline" />
            Collaborative Culture
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-lg mx-auto text-center">
            Every piece of content created through Creator Hub reflects timeless craftsmanship and commercial impact.
          </p>
        </div>


        {/* -------------------------------------------------------
            COMPACT CENTERED MOSAIC GRID (850px MAX WIDTH)
        ------------------------------------------------------- */}
        <div className="max-w-[860px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
          
          {/* COLUMN 1: Campaign Still + Agency Directors */}
          <div className="space-y-4 sm:space-y-5">
            
            {/* Card 1: Campaign Still */}
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs hover:-translate-y-1 hover:scale-[1.01] hover:border-pink-200 dark:hover:border-pink-500/30 hover:shadow-md transition-all duration-300 ease-out cursor-pointer group text-left">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80" alt="Botanical Silk Serum Macro Campaign still" fill className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>

              <div className="p-4 sm:p-5 bg-white dark:bg-surface border-t border-slate-100 dark:border-white/10">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-1">
                  CAMPAIGN STILL
                </span>
                <h3 className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-foreground leading-snug">
                  Botanical Silk Serum Macro Campaign
                </h3>
              </div>
            </div>

            {/* Card 4: Agency Directors Testimonial */}
            <div className="bg-[#FDF2F5] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl p-5 sm:p-6 shadow-2xs hover:-translate-y-1 hover:scale-[1.01] hover:border-pink-200 dark:hover:border-pink-500/30 hover:shadow-md transition-all duration-300 ease-out cursor-pointer text-left">
              <span className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200 font-sans font-bold text-[9px] tracking-wider uppercase px-2.5 py-0.5 rounded-full inline-block shadow-2xs mb-4">
                AGENCY DIRECTORS
              </span>

              <p className="font-serif text-sm sm:text-base italic font-medium text-slate-900 dark:text-foreground leading-relaxed mb-5">
                “Creator Hub converted our quarterly influencer chaos into an automated luxury production house.”
              </p>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 font-sans font-bold text-[11px] flex items-center justify-center border border-pink-200/60 dark:border-pink-500/20 flex-shrink-0 mr-2.5 shadow-2xs">
                  VL
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-foreground mb-0.2">
                    Vogue Labs Asia
                  </h4>
                  <span className="font-sans text-[10px] text-slate-500 dark:text-text-muted font-medium block">
                    Brand Guild Member
                  </span>
                </div>
              </div>
            </div>

          </div>


          {/* COLUMN 2: Featured Artist (Taller Center) + Trust & Governance */}
          <div className="space-y-4 sm:space-y-5">
            
            {/* Card 2: Featured Artist */}
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs hover:-translate-y-1 hover:scale-[1.01] hover:border-pink-200 dark:hover:border-pink-500/30 hover:shadow-md transition-all duration-300 ease-out cursor-pointer group text-left relative">
              
              {/* Badge Top Right */}
              <div className="absolute top-3 right-3 z-10 pointer-events-none">
                <span className="bg-[#FCE7F3] dark:bg-secondary/40 text-slate-900 dark:text-pink-100 border border-pink-200/60 dark:border-pink-500/20 text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full font-sans shadow-2xs inline-block">
                  FEATURED ARTIST
                </span>
              </div>

              {/* Taller Portrait Image */}
              <div className="relative aspect-[3/3.8] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" alt="Devika Rao featured artist editorial" fill className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>

              <div className="p-4 sm:p-5 bg-white dark:bg-surface border-t border-slate-100 dark:border-white/10">
                <h3 className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-foreground mb-0.5 leading-snug">
                  Devika Rao
                </h3>
                <span className="font-sans text-[11px] text-slate-500 dark:text-text-muted block font-medium">
                  Architectural Stylist &amp; Storyteller · 64K
                </span>
              </div>
            </div>

            {/* Card 5: Trust & Governance */}
            <div className="bg-[#FDF2F5] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl p-5 sm:p-6 shadow-2xs hover:-translate-y-1 hover:scale-[1.01] hover:border-pink-200 dark:hover:border-pink-500/30 hover:shadow-md transition-all duration-300 ease-out cursor-pointer text-left">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-1.5">
                TRUST &amp; GOVERNANCE
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground block mb-1 leading-none">
                100%
              </span>
              <p className="font-sans text-[11px] sm:text-xs text-slate-600 dark:text-text-secondary leading-relaxed">
                Funds safeguarded in institutional-grade escrow until dual-party creative validation.
              </p>
            </div>

          </div>


          {/* COLUMN 3: Verified Production */}
          <div className="space-y-4 sm:space-y-5 md:col-span-2 lg:col-span-1">
            
            {/* Card 3: Verified Production */}
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs hover:-translate-y-1 hover:scale-[1.01] hover:border-pink-200 dark:hover:border-pink-500/30 hover:shadow-md transition-all duration-300 ease-out cursor-pointer group text-left">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80" alt="Water and Radiance production scene" fill className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>

              <div className="p-4 sm:p-5 bg-white dark:bg-surface border-t border-slate-100 dark:border-white/10">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-1">
                  VERIFIED PRODUCTION
                </span>
                <h3 className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-foreground leading-snug">
                  Water &amp; Radiance Story Reel
                </h3>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
