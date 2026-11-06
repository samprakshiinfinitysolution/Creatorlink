"use client";

import React from "react";
import Image from "next/image";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksMosaic() {
  const cards = [
    {
      id: 1,
      badge: "CREATOR IDENTITY",
      title: "Creative Freedom",
      description: "Bring your unique style and ideas to every collaboration.",
      image: "https://res.cloudinary.com/atr5osne/image/upload/v1792056018/creatorlink/public/campaigns/kplj9loopnrtw679uypx.webp",
      alt: "Creative Freedom Showcase",
    },
    {
      id: 2,
      badge: "ALIGNMENT",
      title: "Clear Communication",
      description: "Keep brands and creators aligned from the first conversation to the final deliverable.",
      image: "https://res.cloudinary.com/atr5osne/image/upload/v1792056035/creatorlink/public/creators/ivls2e0jr20rlu4kncza.webp",
      alt: "Clear Communication Showcase",
    },
    {
      id: 3,
      badge: "COLLABORATIVE SUCCESS",
      title: "Shared Goals",
      description: "Work together towards campaign outcomes that matter to both sides.",
      image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054733/creatorlink/public/campaigns/cru8rs8ckm8iszusol6z.webp",
      alt: "Shared Goals Showcase",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1280px] relative z-10 text-center">
        
        {/* -------------------------------------------------------
            SECTION HEADER: EYEBROW, HEADING, DESCRIPTION
        ------------------------------------------------------- */}
        <ScrollReveal direction="up" delay={0} className="max-w-xl mx-auto mb-10 sm:mb-14">
          {/* Eyebrow */}
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-3 font-sans text-center">
            THE CREATORLINK COMMUNITY
          </span>

          {/* Editorial Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4 text-center">
            Better Connections Create Better Work.
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-lg mx-auto text-center">
            Great collaborations happen when creativity, clear communication and shared expectations come together.
          </p>
        </ScrollReveal>


        {/* -------------------------------------------------------
            3 PILLAR CARDS GRID
        ------------------------------------------------------- */}
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {cards.map((card, idx) => (
            <ScrollReveal
              key={card.id}
              direction="up"
              delay={idx * 80}
              className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs hover:-translate-y-1 hover:scale-[1.01] hover:border-pink-200 dark:hover:border-pink-500/30 hover:shadow-md transition-all duration-300 ease-out text-left flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-200/60 dark:border-white/10 text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full font-sans shadow-2xs inline-block backdrop-blur-xs">
                      {card.badge}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-2 leading-snug">
                    {card.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-text-secondary leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
                <div className="h-1 w-10 bg-secondary/30 rounded-full group-hover:w-16 group-hover:bg-secondary transition-all duration-300" />
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>

    </section>
  );
}
