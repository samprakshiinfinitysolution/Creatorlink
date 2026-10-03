"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function PricingCreatorDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");

  const creators = [
    {
      id: "aarohi",
      name: "Aarohi Mehta",
      category: "BEAUTY & SKINCARE",
      bestMatch: null,
      location: "Mumbai / London",
      audience: "124K",
      engagement: "6.8%",
      avgViews: "42K",
      buttonLabel: "View Media Kit",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "camille",
      name: "Camille Dupont",
      category: "PARISIAN CHIC",
      bestMatch: "BEST MATCH 98%",
      location: "Paris, France",
      audience: "88K",
      engagement: "8.2%",
      avgViews: "61K",
      buttonLabel: "Send Invitation",
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "sora",
      name: "Sora Lin",
      category: "DESIGN & VISUALS",
      bestMatch: null,
      location: "Seoul / New York",
      audience: "210K",
      engagement: "5.4%",
      avgViews: "94K",
      buttonLabel: "View Media Kit",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient light */}
      <div className="pointer-events-none absolute right-1/4 bottom-10 h-[500px] w-[500px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="mx-auto max-w-[1240px] relative z-10 text-center">
        
        {/* =========================================================
            1. TOP INTRO CONTENT
        ========================================================= */}
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3 text-center">
          CREATOR DISCOVERY
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4 text-center max-w-2xl mx-auto">
          Find creators who fit your campaign.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed text-center max-w-xl mx-auto mb-10">
          Filter millions of verified tastemakers by engagement velocity, aesthetic tags, and geographic impact.
        </p>

        {/* =========================================================
            2. SEARCH & FILTER BAR
        ========================================================= */}
        <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 sm:px-6 sm:py-4 shadow-sm max-w-[1020px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 text-left">
          
          {/* Search Icon & Real Input */}
          <div className="flex items-center gap-3 flex-1 w-full min-w-0 md:min-w-[240px]">
            <svg
              className="w-5 h-5 text-slate-400 dark:text-text-muted flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators by aesthetic, niche, location..."
              className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs sm:text-sm text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-text-muted font-sans p-0 m-0"
            />
          </div>

          {/* Active Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-text-secondary text-xs font-sans font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 hover:bg-slate-200/70 dark:hover:bg-white/20 transition-colors cursor-pointer">
              <span>Niche: Beauty & Wellness</span>
              <span className="text-slate-400 dark:text-text-muted hover:text-slate-900">×</span>
            </span>

            <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-text-secondary text-xs font-sans font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 hover:bg-slate-200/70 dark:hover:bg-white/20 transition-colors cursor-pointer">
              <span>Followers: 20k–100k</span>
              <span className="text-slate-400 dark:text-text-muted hover:text-slate-900">×</span>
            </span>

            <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-text-secondary text-xs font-sans font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 hover:bg-slate-200/70 dark:hover:bg-white/20 transition-colors cursor-pointer">
              <span>Engagement: &gt;4.5%</span>
              <span className="text-slate-400 dark:text-text-muted hover:text-slate-900">×</span>
            </span>
          </div>

        </div>

        {/* =========================================================
            3. CREATOR GRID (3 EDITORIAL CARDS)
        ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-[1140px] mx-auto items-stretch text-left">
          {creators.map((creator) => (
            <article
              key={creator.id}
              className="group bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 hover:border-secondary/60 rounded-[28px] overflow-hidden shadow-sm hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.22)] hover:-translate-y-1.5 hover:scale-[1.015] transition-all duration-300 ease-out flex flex-col justify-between h-full"
            >
              <div>
                {/* Creator Cover Image Container */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/5">
                  <Image src={creator.image} alt={creator.name} fill className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw" />

                  {/* Top Left Category Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-900 dark:text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase shadow-2xs">
                    {creator.category}
                  </div>

                  {/* Optional Top Right Best Match Badge */}
                  {creator.bestMatch && (
                    <div className="absolute top-3 right-3 z-10 bg-secondary/20 dark:bg-secondary/40 backdrop-blur-xs text-secondary dark:text-pink-100 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase shadow-2xs border border-pink-200/60 dark:border-pink-500/20">
                      {creator.bestMatch}
                    </div>
                  )}
                </div>

                {/* Creator Details Padding Box */}
                <div className="p-5 sm:p-6">
                  {/* Name & Location Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground">
                      {creator.name}
                    </h3>
                    <span className="text-xs font-sans text-slate-500 dark:text-text-muted">
                      {creator.location}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 dark:border-white/10 my-4" />

                  {/* 3-Column Statistics Row */}
                  <div className="grid grid-cols-3 gap-2 text-center my-4">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-1">
                        AUDIENCE
                      </span>
                      <span className="font-sans font-semibold text-sm sm:text-base text-slate-900 dark:text-foreground">
                        {creator.audience}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-1">
                        ENGAGEMENT
                      </span>
                      <span className="font-sans font-semibold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                        {creator.engagement}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-1">
                        AVG VIEWS
                      </span>
                      <span className="font-sans font-semibold text-sm sm:text-base text-slate-900 dark:text-foreground">
                        {creator.avgViews}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-white/10 my-4" />

                  {/* CTA Button */}
                  <Link
                    href="/signup"
                    className="block text-center w-full py-2.5 px-4 rounded-full font-sans text-xs font-semibold tracking-wide transition-all duration-300 shadow-2xs cursor-pointer border border-slate-200 dark:border-white/20 text-slate-900 dark:text-foreground hover:bg-secondary hover:text-white hover:border-secondary hover:-translate-y-0.5"
                  >
                    {creator.buttonLabel}
                  </Link>

                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
