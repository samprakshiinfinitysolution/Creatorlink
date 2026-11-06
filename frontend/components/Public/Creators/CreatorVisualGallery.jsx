"use client";

import React, { useState } from "react";
import Image from "next/image";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function CreatorVisualGallery() {
  const categories = [
    "Fashion & Beauty",
    "Food & Lifestyle",
    "Travel & Experiences",
    "Art & Creativity",
    "Technology & Digital Content",
  ];

  const [galleryItems] = useState([
    // TOP ROW (Items 1 - 5)
    {
      id: 1,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792054721/creatorlink/public/creators/lyhqi3si95n8so90e1gl.webp",
      alt: "Fashion & Art Inspiration",
      label: "Visual Styling",
      category: "Fashion & Beauty",
      aspectRatio: "aspect-[4/5]",
    },
    {
      id: 2,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792056000/creatorlink/public/editorial/tmvytlc1dprhgkrn5del.webp",
      alt: "Morning Food & Table Storytelling",
      label: "Morning Rituals",
      category: "Food & Lifestyle",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 3,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792054885/creatorlink/public/editorial/o5nw5mti6eh115xsuxfj.webp",
      alt: "Coastal Travel & Destination",
      label: "Coastal Journeys",
      category: "Travel & Experiences",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 4,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792054891/creatorlink/public/campaigns/l3ga6hm8eeyh0b4glc2o.webp",
      alt: "Product Detail Demonstration",
      label: "Product Focus",
      category: "Fashion & Beauty",
      aspectRatio: "aspect-[2/3]",
    },
    {
      id: 5,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792054897/creatorlink/public/editorial/mhkn5bujhgmqdurgheqz.webp",
      alt: "Interior & Architectural Design",
      label: "Spaces & Mood",
      category: "Art & Creativity",
      aspectRatio: "aspect-[4/3]",
    },

    // BOTTOM ROW (Items 6 - 10)
    {
      id: 6,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792054698/creatorlink/public/avatars/gye9m9prpdv81gc9ipkp.webp",
      alt: "Creative Workspace",
      label: "Digital Storytelling",
      category: "Technology & Digital Content",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 7,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792054902/creatorlink/public/campaigns/vgtcgq8lejpxdavms5ku.webp",
      alt: "Handcrafted Product Aesthetics",
      label: "Product Story",
      category: "Fashion & Beauty",
      aspectRatio: "aspect-[1/1]",
    },
    {
      id: 8,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792054913/creatorlink/public/editorial/hr87whbaii0lozxsyzyd.webp",
      alt: "Artist Studio Creative Process",
      label: "Studio Process",
      category: "Art & Creativity",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 9,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792054919/creatorlink/public/campaigns/eocmumqyfn0jr0ryguxl.webp",
      alt: "Accessory & Detail Shoot",
      label: "Curated Details",
      category: "Fashion & Beauty",
      aspectRatio: "aspect-[3/4]",
    },
    {
      id: 10,
      src: "https://res.cloudinary.com/atr5osne/image/upload/v1792054924/creatorlink/public/campaigns/dhmyvkdz6gcjmjbij8vz.webp",
      alt: "Travel Exploration Drive",
      label: "Road & Escape",
      category: "Travel & Experiences",
      aspectRatio: "aspect-[4/3]",
    },
  ]);

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO
        ========================================================= */}
        <ScrollReveal direction="up" delay={0} className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            09 / CREATIVE POSSIBILITIES
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4">
            Every Creator Has a Different Story.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-2xl mx-auto mb-6">
            From fashion and beauty to food, travel, lifestyle and technology, creativity comes in many forms. Showcase what makes your content unique and let your work inspire new opportunities.
          </p>

          {/* Category Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {categories.map((cat, idx) => (
              <span
                key={idx}
                className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-foreground text-xs font-sans font-medium px-3.5 py-1.5 rounded-full shadow-2xs"
              >
                {cat}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* Visual Heading & Description Banner */}
        <ScrollReveal direction="up" delay={60} className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-1">
            Your Niche. Your Voice. Your Style.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted font-sans">
            Show the world what you love creating.
          </p>
        </ScrollReveal>

        {/* =========================================================
            2. VISUAL GALLERY GRID (EDITORIAL STAGGERED LAYOUT)
            Breakpoints:
            - Desktop: 5 columns
            - Tablet: 3 columns
            - Mobile: 2 columns
            - Very small mobile: 1 column
        ========================================================= */}
        <div className="grid grid-cols-1 max-[400px]:grid-cols-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-5 items-start">
          {galleryItems.map((item, idx) => (
            <ScrollReveal
              key={item.id}
              as="article"
              direction="up"
              delay={(idx % 5) * 60}
              className="group relative bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-sm hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.22)] hover:-translate-y-1.5 transition-all duration-300 ease-out w-full"
            >
              <div className={`relative w-full ${item.aspectRatio} overflow-hidden bg-slate-100 dark:bg-white/5`}>
                <Image src={item.src} alt={item.alt} fill className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw" />

                {/* Subtle Dark Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Editorial Metadata Label on Hover */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none flex flex-col items-start gap-0.5">
                  <span className="text-[11px] sm:text-xs font-sans font-medium text-white tracking-tight drop-shadow-md">
                    {item.label}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-widest text-pink-200/90 drop-shadow-md">
                    {item.category}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
