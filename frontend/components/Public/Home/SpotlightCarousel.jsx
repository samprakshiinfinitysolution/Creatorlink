"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import ScrollReveal from "@/components/theme/ScrollReveal";

function getInitials(name) {
  if (!name || typeof name !== "string") return "CL";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatAmount(amount, currency = "INR") {
  if (amount === null || amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return "Amount not disclosed";
  }
  const symbol = currency === "USD" ? "$" : "₹";
  return `${symbol}${Number(amount).toLocaleString("en-IN")}`;
}

function StatusBadge({ status }) {
  const norm = (status || "accepted").toLowerCase();
  if (norm === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }
  if (norm === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-0.5 text-[11px] font-semibold text-secondary-dark dark:text-secondary border border-secondary/20">
      <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
      Active Collaboration
    </span>
  );
}

function EntityAvatar({ image, name, size = "md", isBrand = false }) {
  const sizeClasses = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 sm:h-20 sm:w-20 text-base sm:text-lg"
  };

  const rounded = isBrand ? "rounded-2xl" : "rounded-full";

  if (image) {
    return (
      <div className={`relative ${sizeClasses[size]} ${rounded} overflow-hidden shrink-0 border border-border-theme bg-surface-muted shadow-xs`}>
        <Image
          src={image}
          alt={name || "Entity"}
          fill
          className="h-full w-full object-cover"
          sizes="120px"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex ${sizeClasses[size]} ${rounded} shrink-0 items-center justify-center font-bold border border-secondary/30 shadow-xs select-none ${isBrand
          ? "bg-primary/10 text-primary dark:bg-white/10 dark:text-white"
          : "bg-secondary/15 text-secondary-dark dark:text-secondary"
        }`}
    >
      {getInitials(name)}
    </div>
  );
}

export default function SpotlightCarousel() {
  const [collabData, setCollabData] = useState({
    latestCollaboration: null,
    relatedCollaborations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCollaborations = async () => {
      try {
        const response = await axiosInstance.get("/homepage/featured");
        if (isMounted && response.data?.success && response.data?.data) {
          setCollabData({
            latestCollaboration: response.data.data.latestCollaboration || null,
            relatedCollaborations: response.data.data.relatedCollaborations || []
          });
        }
      } catch (err) {
        console.warn("Featured collaborations notice:", err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCollaborations();
    return () => {
      isMounted = false;
    };
  }, []);

  const latest = collabData.latestCollaboration;
  const related = collabData.relatedCollaborations || [];

  return (
    <section className="relative overflow-hidden bg-background text-foreground transition-colors duration-300 py-12 md:py-20 px-4 sm:px-6 lg:px-10 xl:px-12 border-t border-border-theme">
      {/* Ambient background aura */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-[350px] w-[600px] rounded-full bg-secondary/[0.035] dark:bg-secondary/[0.02] blur-[140px]" />

      <div className="mx-auto max-w-[1380px] relative z-10">
        {/* =========================================================
            SECTION HEADER
        ========================================================= */}
        <ScrollReveal direction="up" className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 w-full">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-2 font-sans">
              BRAND ↔ CREATOR SHOWCASE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium tracking-tight text-foreground leading-[1.15]">
              Real Collaborations. Real Results.
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-xl">
              Discover verified collaborations between leading brands and creators managed seamlessly on CreatorLink.
            </p>
          </div>

          <Link
            href="/how-it-works"
            className="group inline-flex items-center justify-between gap-4 w-full sm:w-[260px] md:w-[280px] h-[48px] px-5 rounded-full border border-secondary/40 dark:border-secondary/50 bg-surface text-foreground shadow-[0_0_20px_rgba(255,79,135,0.12)] hover:border-secondary hover:shadow-[0_0_25px_rgba(255,79,135,0.25)] transition-all duration-300 shrink-0 self-start md:self-auto"
          >
            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">Explore Collaborations</span>
            <svg
              className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform duration-300 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </ScrollReveal>

        {/* =========================================================
            EMPTY STATE IF NO COLLABORATIONS IN DATABASE
        ========================================================= */}
        {!loading && !latest && related.length === 0 && (
          <ScrollReveal direction="up">
            <div className="rounded-3xl border border-dashed border-border-theme bg-surface/60 p-10 sm:p-14 text-center max-w-2xl mx-auto my-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary-dark">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-foreground">
                No Public Collaborations Available Yet
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
                Verified collaborations between brands and creators will automatically appear here once campaign agreements are accepted.
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* =========================================================
            1. MAIN LATEST COLLABORATION (PROMINENT HERO SHOWCASE)
        ========================================================= */}
        {latest && (
          <ScrollReveal direction="up" delay={100} className="mb-12 md:mb-16">
            <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-border-theme bg-surface shadow-[0_15px_45px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-5 sm:p-8 lg:p-10 transition-all duration-300">
              {/* Subtle top ambient glow inside card */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-[220px] w-[220px] rounded-full bg-secondary/10 blur-[80px]" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-[220px] w-[220px] rounded-full bg-secondary/10 blur-[80px]" />

              {/* CARD TOP META BAR */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-border-theme">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white text-[11px] font-bold shadow-xs">
                    ✦
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-secondary-dark dark:text-secondary font-sans">
                    LATEST VERIFIED COLLABORATION
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={latest.status} />
                  {latest.createdAt && (
                    <span className="hidden sm:inline text-[11px] text-text-secondary">
                      {new Date(latest.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* BRAND ↔ CREATOR INTERACTION ROW */}
              <div className="relative z-10 mt-7 sm:mt-9 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                {/* ----------------- LEFT: BRAND CARD ----------------- */}
                <div className="lg:col-span-4 flex items-center gap-4 sm:gap-5 rounded-2xl border border-border-theme/80 bg-background/60 p-4 sm:p-5 shadow-xs">
                  <EntityAvatar
                    image={latest.brand?.logo}
                    name={latest.brand?.name}
                    size="lg"
                    isBrand={true}
                  />

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                      BRAND PARTNER
                    </span>
                    <h3 className="truncate text-base sm:text-lg font-bold text-foreground font-serif mt-0.5">
                      {latest.brand?.name || "Brand Partner"}
                    </h3>
                    {latest.brand?.category && (
                      <span className="mt-1 inline-block rounded-full bg-secondary/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-secondary-dark dark:text-secondary">
                        {latest.brand.category}
                      </span>
                    )}
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
                      <span>✓</span> Verified Brand
                    </p>
                  </div>
                </div>

                {/* ----------------- CENTER: COLLABORATION BRIDGE ----------------- */}
                <div className="lg:col-span-4 flex flex-col items-center text-center px-2 py-3 lg:py-0">
                  {/* Connecting Arrow graphic on Desktop */}
                  <div className="w-full hidden lg:flex items-center justify-center gap-2 mb-3">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-border-theme via-secondary/50 to-secondary" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white text-xs font-bold shadow-xs">
                      ↔
                    </div>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-secondary via-secondary/50 to-border-theme" />
                  </div>

                  {/* Campaign Title */}
                  <h4 className="text-base sm:text-lg font-serif font-bold text-foreground max-w-sm leading-snug">
                    {latest.title}
                  </h4>

                  {/* Deal Amount */}
                  <div className="mt-2.5">
                    {latest.amount ? (
                      <div className="inline-flex items-baseline gap-1.5 rounded-full bg-secondary/10 px-3.5 py-1 border border-secondary/25">
                        <span className="text-[10.5px] uppercase tracking-wider text-text-secondary font-medium">
                          Deal Value:
                        </span>
                        <span className="text-sm sm:text-base font-bold text-secondary-dark dark:text-secondary">
                          {formatAmount(latest.amount, latest.currency)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary font-medium italic">
                        Amount not disclosed
                      </span>
                    )}
                  </div>

                  {/* Deliverables badges */}
                  {Array.isArray(latest.deliverables) && latest.deliverables.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-xs">
                      {latest.deliverables.map((deliv, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-surface-muted border border-border-theme px-2 py-0.5 text-[10px] font-medium text-text-secondary"
                        >
                          {deliv}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* ----------------- RIGHT: CREATOR CARD ----------------- */}
                <div className="lg:col-span-4 flex items-center justify-between sm:justify-start lg:justify-end gap-4 sm:gap-5 rounded-2xl border border-border-theme/80 bg-background/60 p-4 sm:p-5 shadow-xs">
                  <div className="min-w-0 flex-1 text-left sm:text-left lg:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                      CREATOR PARTNER
                    </span>
                    <h3 className="truncate text-base sm:text-lg font-bold text-foreground font-serif mt-0.5">
                      {latest.creator?.name || "Creator"}
                    </h3>
                    <p className="truncate text-xs text-text-secondary mt-0.5 font-medium">
                      {latest.creator?.handle}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1 sm:justify-start lg:justify-end">
                      <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary-dark dark:text-secondary">
                        {latest.creator?.category || "Creator"}
                      </span>
                    </div>
                  </div>

                  <EntityAvatar
                    image={latest.creator?.profileImage}
                    name={latest.creator?.name}
                    size="lg"
                    isBrand={false}
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* =========================================================
            2. SIMILAR NICHE COLLABORATIONS (RELATED CARDS GRID)
        ========================================================= */}
        {related.length > 0 && (
          <ScrollReveal direction="up" delay={200}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block font-sans">
                  SIMILAR NICHE COLLABORATIONS
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mt-0.5">
                  Recent Brand ↔ Creator Partnerships
                </h3>
              </div>
              <span className="text-xs text-text-secondary">
                {related.length} Verified Partnerships
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {related.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border-theme bg-surface p-5 shadow-xs hover:border-secondary/50 hover:shadow-[0_12px_30px_rgba(255,79,135,0.12)] transition-all duration-300"
                >
                  <div>
                    {/* Header: Category + Status */}
                    <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-border-theme">
                      <span className="truncate rounded-md bg-secondary/[0.08] px-2.5 py-1 text-[10.5px] font-semibold text-primary dark:text-foreground">
                        {item.creator?.category || item.brand?.category || "Collaboration"}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    {/* Collaboration Title */}
                    <h4 className="mt-3.5 text-sm sm:text-base font-serif font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2">
                      {item.title}
                    </h4>

                    {/* Brand ↔ Creator Row */}
                    <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-background/50 border border-border-theme/70 p-3">
                      {/* Left: Brand */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <EntityAvatar
                          image={item.brand?.logo}
                          name={item.brand?.name}
                          size="sm"
                          isBrand={true}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground">
                            {item.brand?.name || "Brand"}
                          </p>
                          <p className="text-[9.5px] text-text-secondary uppercase tracking-wider">
                            Brand
                          </p>
                        </div>
                      </div>

                      {/* Center Arrow */}
                      <span className="text-secondary text-xs font-bold shrink-0 px-1">
                        ↔
                      </span>

                      {/* Right: Creator */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end text-right">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground">
                            {item.creator?.name || "Creator"}
                          </p>
                          <p className="truncate text-[9.5px] text-text-secondary">
                            {item.creator?.handle}
                          </p>
                        </div>
                        <EntityAvatar
                          image={item.creator?.profileImage}
                          name={item.creator?.name}
                          size="sm"
                          isBrand={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Amount & Deliverables count */}
                  <div className="mt-4 pt-3 border-t border-border-theme flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block">
                        Deal Value
                      </span>
                      <span className="font-bold text-foreground text-xs sm:text-sm">
                        {formatAmount(item.amount, item.currency)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block">
                        Scope
                      </span>
                      <span className="text-xs font-medium text-secondary-dark dark:text-secondary">
                        {Array.isArray(item.deliverables) && item.deliverables.length > 0
                          ? `${item.deliverables.length} Deliverable${item.deliverables.length > 1 ? "s" : ""}`
                          : "Custom Scope"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

      </div>
    </section>
  );
}
