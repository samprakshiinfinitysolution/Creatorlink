"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function CreatorVisualGallery() {
  // Clean static gallery data ready for future backend integration
  const [galleryItems] = useState([
    // TOP ROW (Items 1 - 5)
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      alt: "Fashion & Art Gallery Creator",
      handle: "@serena.gallery",
      category: "EDITORIAL",
      aspectRatio: "aspect-[4/5]",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      alt: "Slow Living & Artisanal Morning Breakfast",
      handle: "@slow.kitchen",
      category: "SLOW LIVING",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
      alt: "Coastal Lifestyle Overlooking Amalfi Coast",
      handle: "@journey.with.maya",
      category: "TRAVEL",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      alt: "Macro Skincare Dew Droplet Detail",
      handle: "@botanical.dew",
      category: "BEAUTY",
      aspectRatio: "aspect-[2/3]",
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
      alt: "Minimalist Serene Living Lounge Interior",
      handle: "@minimal.sanctuary",
      category: "ARCHITECTURE",
      aspectRatio: "aspect-[4/3]",
    },

    // BOTTOM ROW (Items 6 - 10)
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      alt: "Coffee & Creative Lifestyle Creator at Workspace",
      handle: "@aarohi.mehta",
      category: "CREATOR",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?auto=format&fit=crop&w=800&q=80",
      alt: "Handcrafted Leather Sandals on Sunset Beach Sand",
      handle: "@sol.atelier",
      category: "CRAFT",
      aspectRatio: "aspect-[1/1]",
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
      alt: "Female Artist Painting in Sunlit Studio",
      handle: "@canvas.notes",
      category: "STUDIO",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 9,
      src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      alt: "Layered Gold Necklaces Fine Jewelry Detail",
      handle: "@luxe.details",
      category: "QUIET LUXURY",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 10,
      src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      alt: "Vintage Convertible Drive Along Coastal Cliff",
      handle: "ESCAPE",
      category: "ESCAPE",
      aspectRatio: "aspect-[4/3]",
    },
  ]);

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO & DESIGNED HEADING
        ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            10 / VISUAL GALLERY
          </span>

          {/* Heading with "STYLE" highlight pill */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5">
            <span>YOUR</span>
            <span className="inline-block bg-slate-900 dark:bg-slate-900 text-[#FCE7F3] rounded-2xl sm:rounded-[22px] px-4 sm:px-6 py-0.5 sm:py-1 font-serif text-2xl sm:text-4xl lg:text-5xl align-middle shadow-md tracking-wide">
              STYLE
            </span>
            <span>MATTERS.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-xl mx-auto">
            Join over 12,000 discerning creators showcasing authentic work across beauty, architecture, travel, and quiet luxury.
          </p>
        </div>

        {/* =========================================================
            2. VISUAL GALLERY GRID (EDITORIAL STAGGERED LAYOUT)
            Breakpoints:
            - Desktop: 5 columns
            - Tablet: 3 columns
            - Mobile: 2 columns
            - Very small mobile: 1 column
        ========================================================= */}
        <div className="grid grid-cols-1 max-[400px]:grid-cols-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-5 items-start">
          {galleryItems.map((item) => (
            <article
              key={item.id}
              className="group relative bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-sm hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.22)] hover:-translate-y-1.5 transition-all duration-300 ease-out w-full"
            >
              <div className={`relative w-full ${item.aspectRatio} overflow-hidden bg-slate-100 dark:bg-white/5`}>
                <Image src={item.src} alt={item.alt} fill className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw" />

                {/* Subtle Dark Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Editorial Metadata Label on Hover */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none flex flex-col items-start gap-0.5">
                  <span className="text-[11px] sm:text-xs font-mono font-medium text-white tracking-tight drop-shadow-md">
                    {item.handle}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-widest text-pink-200/90 drop-shadow-md">
                    {item.category}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
