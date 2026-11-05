"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import ScrollReveal from "@/components/theme/ScrollReveal";

// =========================================================
// HELPER FORMATTERS
// =========================================================
function getInitials(name) {
  if (!name || typeof name !== "string") return "CR";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatAudience(count) {
  if (count === null || count === undefined || isNaN(count)) return "Not added";
  const num = Number(count);
  if (num <= 0) return "Not added";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num % 1000 === 0 ? 0 : 1).replace(/\.0$/, "")}K`;
  return `${num}`;
}

function formatEngagement(rate) {
  if (rate === null || rate === undefined || isNaN(rate)) return "Not added";
  const num = Number(rate);
  if (num <= 0) return "Not added";
  return `${num.toFixed(1).replace(/\.0$/, "")}%`;
}

function formatBaseRate(amount, currency = "INR") {
  if (amount === null || amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return "Not added";
  }
  const symbol = currency === "USD" ? "$" : "₹";
  return `From ${symbol}${Number(amount).toLocaleString("en-IN")}`;
}

// =========================================================
// SVG ICONS
// =========================================================
function VerifiedCheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-secondary shrink-0 inline-block"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BookmarkIcon({ isSaved, className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={isSaved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

// =========================================================
// DYNAMIC CREATOR CARD COMPONENT
// =========================================================
function CreatorCard({ creator, index }) {
  const [isSaved, setIsSaved] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageSrc = !imageError && (creator.displayImage || creator.profileImage || creator.portfolio?.coverImage);

  // Dynamic Badge Assignment
  let badge = "FEATURED";
  let badgeColor = "bg-secondary text-white";
  if (creator.isVerifiedBadge) {
    badge = "VERIFIED PRO";
    badgeColor = "bg-tertiary text-white dark:bg-purple-600";
  } else if (index === 0) {
    badge = "LATEST #1";
    badgeColor = "bg-secondary text-white";
  } else if (creator.startingPrice) {
    badge = "BOOKING OPEN";
    badgeColor = "bg-emerald-500 text-white dark:bg-emerald-600";
  }

  const fitBadge = creator.engagementRate
    ? `${Math.min(99, Math.max(90, Math.round(90 + Number(creator.engagementRate))))}% Fit`
    : "Verified Profile";

  const deliverableText =
    creator.portfolio?.title ||
    (Array.isArray(creator.niches) && creator.niches.length > 0
      ? creator.niches[0]
      : "Not added");

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border-theme bg-surface shadow-xs hover:border-secondary/60 dark:hover:border-secondary/60 hover:shadow-[0_12px_35px_rgba(255,79,135,0.18)] dark:hover:shadow-[0_12px_35px_rgba(255,79,135,0.22)] hover:-translate-y-1 transition-all duration-300">
      {/* CREATOR IMAGE + TOP BADGES + DESKTOP HOVER OVERLAY */}
      <div className="relative w-full aspect-[4/4.8] shrink-0 overflow-hidden bg-black/5 dark:bg-white/5">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={creator.name || "Creator"}
            fill
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:blur-[2px] group-hover:brightness-[0.75]"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 bg-gradient-to-br from-surface-muted via-surface to-secondary/10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15 border border-secondary/30 text-secondary-dark text-xl font-bold shadow-xs">
              {getInitials(creator.name)}
            </div>
            <p className="mt-2.5 max-w-[160px] truncate text-xs font-semibold text-primary">
              {creator.name}
            </p>
            <p className="mt-0.5 max-w-[160px] truncate text-[10px] text-text-secondary">
              {creator.category || "Content Creator"}
            </p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-75 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />

        {/* Top-Left Status Badge */}
        <span
          className={`absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md z-10 ${badgeColor}`}
        >
          {badge}
        </span>

        {/* Top-Right Fit Badge */}
        <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-black/65 dark:bg-black/80 backdrop-blur-md border border-white/20 z-10">
          {fitBadge}
        </span>

        {/* DESKTOP HOVER OVERLAY BUTTONS (Media Kit & Book Now) */}
        <div className="hidden md:flex absolute inset-0 z-20 items-center justify-center gap-2.5 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] bg-black/30">
          <Link
            href="/creators"
            className="inline-flex items-center justify-center bg-white text-black font-semibold text-xs py-2.5 px-4 rounded-full shadow-md hover:bg-gray-100 hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
          >
            Media Kit
          </Link>
          <Link
            href="/signup?role=brand"
            className="inline-flex items-center justify-center bg-secondary text-white font-semibold text-xs py-2.5 px-4 rounded-full shadow-md hover:bg-secondary-dark hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* CARD BODY DETAILS */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        {/* Creator Name, Handle & Base Rate Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="truncate text-base sm:text-lg font-semibold text-foreground tracking-tight group-hover:text-secondary transition-colors">
                {creator.name}
              </h3>
              <VerifiedCheckIcon />
            </div>
            <p className="text-xs text-text-secondary truncate">
              {creator.handle} • {creator.category || "Creator"}
              {creator.location ? `, ${creator.location}` : ""}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="block text-[9px] uppercase tracking-wider text-text-secondary font-medium">
              BASE RATE
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {formatBaseRate(creator.startingPrice, creator.currency)}
            </span>
          </div>
        </div>

        {/* Metrics Row (Audience, Engagement, Deliverable) */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-muted border border-border-theme text-left">
          <div className="min-w-0">
            <span className="block text-[9px] uppercase tracking-wider text-text-secondary font-medium truncate">
              Audience
            </span>
            <span className="text-xs font-bold text-foreground truncate block">
              {formatAudience(creator.followerCount)}
            </span>
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] uppercase tracking-wider text-text-secondary font-medium truncate">
              Engagement
            </span>
            <span className="text-xs font-bold text-foreground truncate block">
              {formatEngagement(creator.engagementRate)}
            </span>
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] uppercase tracking-wider text-text-secondary font-medium truncate">
              Deliverable
            </span>
            <span className="text-xs font-bold text-foreground truncate block">
              {deliverableText}
            </span>
          </div>
        </div>

        {/* MOBILE ONLY BOTTOM ACTIONS (Send Campaign Brief + Bookmark Button) */}
        <div className="flex md:hidden items-center gap-2 pt-1">
          <Link
            href="/signup?role=brand"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white dark:bg-white dark:text-black hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white py-2.5 px-4 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span>Send Campaign Brief</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`inline-flex items-center justify-center w-9.5 h-9.5 rounded-xl border border-border-theme transition-all cursor-pointer ${
              isSaved
                ? "bg-secondary/10 border-secondary text-secondary"
                : "bg-surface-muted text-text-secondary hover:text-foreground hover:border-border-theme"
            }`}
            aria-label="Bookmark creator"
          >
            <BookmarkIcon isSaved={isSaved} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN SECTION COMPONENT
// =========================================================
export default function CuratedCatalog() {
  const [creators, setCreators] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalogData = async () => {
      try {
        const response = await axiosInstance.get("/homepage/featured");
        if (isMounted && response.data?.success && response.data?.data) {
          const data = response.data.data;
          // Prefer latestCreators sorted by newest createdAt, fallback to topCreators
          const list =
            Array.isArray(data.latestCreators) && data.latestCreators.length > 0
              ? data.latestCreators
              : Array.isArray(data.topCreators)
              ? data.topCreators
              : [];
          setCreators(list.slice(0, 4));
          if (typeof data.totalCreatorsCount === "number" && data.totalCreatorsCount > 0) {
            setTotalCount(data.totalCreatorsCount);
          }
        }
      } catch (err) {
        console.warn("CuratedCatalog fetch notice:", err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalogData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-background text-foreground transition-colors duration-300 py-10 md:py-20 px-4 sm:px-6 lg:px-12 border-t border-border-theme">
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[350px] w-[350px] rounded-full bg-secondary/[0.05] dark:bg-secondary/[0.03] blur-[120px]" />

      <div className="mx-auto max-w-[1440px]">
        {/* =========================================================
            MOBILE HEADER (< 768px)
        ========================================================= */}
        <ScrollReveal direction="up" className="flex md:hidden items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-serif tracking-tight text-foreground">
              Featured Creators
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Top engagement, verified profiles & high impact
            </p>
          </div>
          <Link
            href="/creators"
            className="text-xs font-bold tracking-wider text-secondary uppercase hover:underline cursor-pointer shrink-0 ml-2"
          >
            {totalCount ? `VIEW ALL (${totalCount})` : "VIEW ALL"}
          </Link>
        </ScrollReveal>

        {/* =========================================================
            DESKTOP HEADER (>= 768px)
        ========================================================= */}
        <ScrollReveal direction="up" className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-2">
              FEATURED CREATORS
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.15]">
              Your next collaboration is here.
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-sm lg:text-base text-text-secondary leading-relaxed">
              Hand-vetted creators with authentic audience metrics, clear pricing,
              and reliable campaign deliverables.
            </p>
          </div>
        </ScrollReveal>

        {/* =========================================================
            CREATORS GRID / LIST
        ========================================================= */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="flex flex-col h-[420px] rounded-2xl border border-border-theme bg-surface p-4 animate-pulse justify-between"
              >
                <div className="w-full aspect-[4/4.8] rounded-xl bg-surface-muted" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-surface-muted rounded w-3/4" />
                  <div className="h-3 bg-surface-muted rounded w-1/2" />
                </div>
                <div className="h-12 bg-surface-muted rounded-xl mt-3" />
              </div>
            ))}
          </div>
        ) : creators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {creators.map((creator, index) => (
              <ScrollReveal
                key={creator.id || index}
                direction="up"
                delay={index * 100}
                className="h-full"
              >
                <CreatorCard creator={creator} index={index} />
              </ScrollReveal>
            ))}
          </div>
        ) : null}

        {/* =========================================================
            CENTERED CTA BUTTON (DESKTOP ONLY)
        ========================================================= */}
        <ScrollReveal direction="up" delay={200} className="hidden md:flex mt-12 md:mt-14 justify-center">
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 rounded-full border border-border-theme bg-surface text-foreground text-xs md:text-sm font-semibold px-7 py-3.5 shadow-sm hover:border-secondary dark:hover:border-secondary hover:shadow-[0_0_25px_rgba(255,79,135,0.35)] dark:hover:shadow-[0_0_25px_rgba(255,79,135,0.25)] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <span>
              {totalCount
                ? `View All ${totalCount.toLocaleString("en-IN")} Curated Creators`
                : "View All Curated Creators"}
            </span>
            <ArrowRightIcon className="w-4 h-4 ml-0.5 text-foreground" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
