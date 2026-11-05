"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import ScrollReveal from "@/components/theme/ScrollReveal";

function getInitials(name) {
  if (!name || typeof name !== "string") return "CR";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatFollowers(count) {
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
  return `${num.toFixed(1).replace(/\.0$/, "")}% Eng`;
}

function formatPrice(amount, currency = "INR") {
  if (amount === null || amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return "Price on request";
  }
  const num = Number(amount);
  const symbol = currency === "USD" ? "$" : "₹";
  return `${symbol}${num.toLocaleString("en-IN")}`;
}

function CardMedia({ image, name, category, className = "h-full w-full" }) {
  if (image) {
    return (
      <Image
        src={image}
        alt={`${name} creator`}
        fill
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        sizes="50vw"
      />
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-surface-muted via-surface to-secondary/10 ${className}`}>
      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 border border-secondary/30 text-secondary-dark text-lg font-bold shadow-xs">
        {getInitials(name)}
      </div>
      <p className="max-w-[180px] truncate text-xs font-semibold text-primary">
        {name}
      </p>
      <p className="mt-0.5 text-[10px] text-text-secondary">
        {category || "Content Creator"}
      </p>
    </div>
  );
}

function MobileAvatar({ profileImage, portfolioCover, name }) {
  const imageSrc = profileImage || portfolioCover;
  if (imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt={`${name} creator`}
        fill
        className="h-full w-full object-cover"
        sizes="(max-width: 640px) 56px, 64px"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary/10 text-secondary-dark font-bold text-xs sm:text-sm select-none">
      {getInitials(name)}
    </div>
  );
}

const EMPTY_CREATOR = {
  name: "Creator",
  handle: "@creator",
  category: "Content Creator",
  profileImage: null,
  displayImage: null,
  followerCount: null,
  engagementRate: null,
  startingPrice: null,
  currency: "INR",
  portfolio: null,
  isDemo: false
};

export default function CreatorShowcase() {
  const [featuredData, setFeaturedData] = useState({
    topCreators: [],
    latestCollaboration: null
  });

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const response = await axiosInstance.get("/homepage/featured");
        if (isMounted && response.data?.success && response.data?.data) {
          setFeaturedData(response.data.data);
        }
      } catch (err) {
        console.warn("Featured homepage fetch notice:", err?.message);
      }
    };
    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCreator = (index) => {
    const c = featuredData.topCreators?.[index];
    if (!c) return EMPTY_CREATOR;
    const name =
      c.name && typeof c.name === "string" && c.name.trim() && c.name.trim().toLowerCase() !== "creator"
        ? c.name.trim()
        : (c.user?.name || "Creator");
    const rawHandle = c.handle && typeof c.handle === "string" ? c.handle.trim() : "";
    const isNikeHandle = rawHandle.toLowerCase() === "@nike" || rawHandle.toLowerCase() === "nike";
    const derivedHandle = `@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    const handle = rawHandle && !isNikeHandle ? rawHandle : derivedHandle;

    return {
      ...EMPTY_CREATOR,
      ...c,
      name,
      handle,
      category: c.category || "Content Creator",
      profileImage: c.profileImage || null,
      displayImage: c.displayImage || c.profileImage || c.portfolio?.coverImage || null,
      followerCount:
        typeof c.followerCount === "number" && !isNaN(c.followerCount) && c.followerCount > 0
          ? c.followerCount
          : null,
      engagementRate:
        typeof c.engagementRate === "number" && !isNaN(c.engagementRate) && c.engagementRate > 0
          ? c.engagementRate
          : null,
      startingPrice:
        typeof c.startingPrice === "number" && !isNaN(c.startingPrice) && c.startingPrice > 0
          ? c.startingPrice
          : null,
      currency: c.currency || "INR",
      isDemo: Boolean(c.isDemo)
    };
  };

  const creator0 = getCreator(0);
  const creator1 = getCreator(1);
  const creator2 = getCreator(2);
  const creator3 = getCreator(3);

  const latestCollab = featuredData.latestCollaboration;

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-background
        px-3.5
        pb-4
        pt-8
        text-foreground

        min-[380px]:px-5

        sm:px-6

        lg:px-10
        lg:pt-10
      "
    >
      <style>{`
        .creator-float-slow {
          animation: creatorFloat 6s ease-in-out infinite;
        }

        .creator-line-top {
          stroke-dashoffset: 0;
          animation: dashMoveLeftToRight 1s linear infinite;
        }

        .creator-line-bottom {
          stroke-dashoffset: 0;
          animation: dashMoveRightToLeft 1s linear infinite;
        }

        @keyframes dashMoveLeftToRight {
          to {
            stroke-dashoffset: -32;
          }
        }

        @keyframes dashMoveRightToLeft {
          to {
            stroke-dashoffset: 32;
          }
        }
      `}</style>

      {/* =====================================================
          MOBILE / TABLET SHOWCASE
          Below 1024px
      ===================================================== */}

      <ScrollReveal
        direction="scale"
        delay={150}
        className="
          relative
          mx-auto
          w-full
          max-w-[390px]
          sm:max-w-[420px]
          lg:hidden
        "
      >
        {/* ================= FIRST CREATOR MOBILE ================= */}

        <div
          className="
            creator-float
            relative
            z-20
            w-full
            max-w-[316px]
            mr-auto
            min-[390px]:max-w-[336px]
            sm:max-w-[356px]
          "
        >
          <div
            className="
              flex
              h-[86px]
              w-full
              items-center
              gap-2
              rounded-[22px]
              border
              border-border-theme
              bg-surface
              px-2.5
              shadow-[0_12px_35px_rgba(0,0,0,0.06)]
              transition-all
              duration-500
              hover:-translate-y-1
              min-[390px]:h-[92px]
              min-[390px]:gap-2.5
              min-[390px]:px-3
              sm:h-[100px]
              sm:gap-3
              sm:rounded-[26px]
              sm:px-3.5
            "
          >
            {/* IMAGE */}

            <div
              className="
                relative
                h-[50px]
                w-[50px]
                shrink-0
                overflow-hidden
                rounded-full
                border
                border-secondary/20
                min-[390px]:h-[56px]
                min-[390px]:w-[56px]
                sm:h-[64px]
                sm:w-[64px]
                bg-secondary/10
              "
            >
              <MobileAvatar
                profileImage={creator0.profileImage}
                portfolioCover={creator0.portfolio?.coverImage}
                name={creator0.name}
              />
            </div>

            {/* NAME + STATS */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[12.5px] font-semibold text-primary min-[390px]:text-[13px] sm:text-[14px]">
                  {creator0.name}
                </p>

                <span className="shrink-0 text-[11px] text-secondary-dark sm:text-[12px]">
                  ✦
                </span>

                {creator0.isDemo && (
                  <span className="shrink-0 rounded-full bg-secondary/10 px-1.5 py-0.5 text-[8.5px] font-medium text-secondary-dark border border-secondary/20">
                    Demo
                  </span>
                )}
              </div>

              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  text-[10.5px]
                  text-text-secondary
                  min-[390px]:text-[11px]
                  sm:gap-2
                  sm:text-[12px]
                "
              >
                <span className="whitespace-nowrap">
                  {formatFollowers(creator0.followerCount)}
                  {creator0.followerCount !== null ? " reach" : ""}
                </span>

                <span className="text-border-theme">•</span>

                <span className="whitespace-nowrap font-medium text-secondary-dark">
                  {formatEngagement(creator0.engagementRate)}
                </span>
              </div>
            </div>

            {/* CATEGORY + PRICE */}

            <div
              className="
                flex
                shrink-0
                flex-col
                items-end
                justify-center
                gap-1
                pr-1
                min-[390px]:gap-1.5
                sm:gap-2
              "
            >
              <span
                className="
                  rounded-full
                  bg-secondary/[0.12]
                  px-2
                  py-0.5
                  text-[9px]
                  font-semibold
                  text-secondary-dark
                  min-[390px]:text-[9.5px]
                  sm:px-2.5
                  sm:py-1
                  sm:text-[10px]
                "
              >
                {creator0.category}
              </span>

              <div className="text-right leading-none">
                {creator0.startingPrice ? (
                  <>
                    <p className="text-[9px] text-text-secondary min-[390px]:text-[9.5px] sm:text-[10px]">
                      From
                    </p>
                    <p className="mt-0.5 text-[11.5px] font-bold text-primary min-[390px]:text-[12px] sm:text-[13px]">
                      {formatPrice(creator0.startingPrice, creator0.currency)}
                    </p>
                  </>
                ) : (
                  <p className="mt-0.5 text-[10px] font-medium text-text-secondary sm:text-[11px]">
                    Price on request
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONNECTOR LINE ================= */}

        <div className="relative my-1 flex h-[22px] w-full items-center sm:my-1.5 sm:h-[26px]">
          <svg
            className="pointer-events-none h-full w-[120px] ml-5 min-[390px]:ml-7 overflow-visible"
            viewBox="0 0 60 24"
            fill="none"
          >
            <path
              d="M 8 0 C 8 16, 46 8, 46 24"
              stroke="var(--theme-secondary)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              className="opacity-60"
            />
          </svg>
        </div>

        {/* ================= SECOND CREATOR MOBILE ================= */}

        <div
          className="
            creator-float-slow
            relative
            z-20
            w-full
            max-w-[316px]
            ml-auto
            min-[390px]:max-w-[336px]
            sm:max-w-[356px]
          "
        >
          <div
            className="
              flex
              h-[84px]
              w-full
              items-center
              gap-2
              rounded-[22px]
              border
              border-border-theme
              bg-surface
              px-2.5
              shadow-[0_12px_35px_rgba(0,0,0,0.06)]
              transition-all
              duration-500
              hover:-translate-y-1
              min-[390px]:h-[88px]
              min-[390px]:gap-2.5
              min-[390px]:px-3
              sm:h-[92px]
              sm:gap-3
              sm:rounded-[26px]
              sm:px-3.5
            "
          >
            {/* IMAGE */}

            <div
              className="
                relative
                h-[48px]
                w-[48px]
                shrink-0
                overflow-hidden
                rounded-full
                border
                border-secondary/20
                min-[390px]:h-[54px]
                min-[390px]:w-[54px]
                sm:h-[60px]
                sm:w-[60px]
                bg-secondary/10
              "
            >
              <MobileAvatar
                profileImage={creator1.profileImage}
                portfolioCover={creator1.portfolio?.coverImage}
                name={creator1.name}
              />
            </div>

            {/* NAME + STATS */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[12.5px] font-semibold text-primary min-[390px]:text-[13px] sm:text-[14px]">
                  {creator1.name}
                </p>

                <span className="shrink-0 text-[11px] text-secondary-dark sm:text-[12px]">
                  ✦
                </span>

                {creator1.isDemo && (
                  <span className="shrink-0 rounded-full bg-secondary/10 px-1.5 py-0.5 text-[8.5px] font-medium text-secondary-dark border border-secondary/20">
                    Demo
                  </span>
                )}
              </div>

              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  text-[10.5px]
                  text-text-secondary
                  min-[390px]:text-[11px]
                  sm:gap-2
                  sm:text-[12px]
                "
              >
                <span className="whitespace-nowrap">
                  {formatFollowers(creator1.followerCount)}
                  {creator1.followerCount !== null ? " reach" : ""}
                </span>

                <span className="text-border-theme">•</span>

                <span className="whitespace-nowrap font-medium text-secondary-dark">
                  {formatEngagement(creator1.engagementRate)}
                </span>
              </div>
            </div>

            {/* CATEGORY */}

            <span
              className="
                shrink-0
                rounded-full
                bg-secondary/[0.08]
                px-2
                py-0.5
                text-[9px]
                font-semibold
                text-primary
                min-[390px]:text-[9.5px]
                sm:px-2.5
                sm:py-1
                sm:text-[10px]
              "
            >
              {creator1.category}
            </span>
          </div>
        </div>

        {/* ================= MOBILE OFFER / BADGE ================= */}

        <div
          className="
            relative
            z-30
            mt-3.5
            flex
            justify-center
            min-[380px]:justify-start
            min-[380px]:ml-6
            sm:ml-10
            sm:mt-4
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-secondary/60
              bg-primary
              px-3.5
              py-1.5
              shadow-[0_8px_25px_rgba(255,79,135,0.18)]
              dark:bg-surface
              dark:border-secondary/50
              sm:px-4.5
              sm:py-2
            "
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white">
              ✓
            </span>

            <p
              className="
                whitespace-nowrap
                text-[10.5px]
                font-medium
                text-white
                dark:text-primary
                min-[380px]:text-[11px]
              "
            >
              {latestCollab ? (
                <>
                  {latestCollab.brand?.name || latestCollab.brandName} Collaboration:{" "}
                  <span className="font-semibold text-secondary-dark dark:text-secondary">
                    {latestCollab.amount
                      ? `₹${latestCollab.amount.toLocaleString("en-IN")}`
                      : "Active Brief"}
                  </span>{" "}
                  •{" "}
                  {(latestCollab.deliverables?.length ?? latestCollab.deliverablesCount) > 0
                    ? `${latestCollab.deliverables?.length ?? latestCollab.deliverablesCount} Deliverables`
                    : latestCollab.title}
                </>
              ) : (
                <>
                  Brand Collaborations:{" "}
                  <span className="font-semibold text-secondary-dark dark:text-secondary">
                    Active
                  </span>{" "}
                  • Connect & Create
                </>
              )}
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* =====================================================
          DESKTOP SHOWCASE
          1024px+
      ===================================================== */}

      <ScrollReveal
        direction="scale"
        delay={150}
        className="
          relative
          mx-auto
          hidden
          h-[720px]
          max-w-[1500px]
          lg:block
        "
      >
        {/* ================= PINK DASHED LINE ================= */}

        <svg
          className="
            creator-line-top
            pointer-events-none
            absolute
            left-[17%]
            top-[27%]
            z-0
            h-[180px]
            w-[66%]
          "
          viewBox="0 0 900 180"
          fill="none"
        >
          <path
            d="M0 30 C180 70 270 70 420 55 C590 40 700 55 900 95"
            stroke="var(--theme-secondary)"
            strokeWidth="2"
            strokeDasharray="7 9"
            opacity="0.65"
          />
        </svg>

        {/* ================= PURPLE DASHED LINE ================= */}

        <svg
          className="
            creator-line-bottom
            pointer-events-none
            absolute
            left-[17%]
            top-[51%]
            z-0
            h-[180px]
            w-[66%]
          "
          viewBox="0 0 900 180"
          fill="none"
        >
          <path
            d="M0 80 C180 120 280 115 430 65 C600 10 720 55 900 105"
            stroke="var(--theme-tertiary)"
            strokeWidth="2"
            strokeDasharray="7 9"
            opacity="0.65"
          />
        </svg>

        {/* ================= FIRST CREATOR (TOP LEFT) ================= */}

        <div className="creator-float absolute left-[7%] top-[5%] z-10 w-[270px] -rotate-[3deg]">
          <div
            className="
              overflow-hidden
              rounded-[26px]
              border
              border-border-theme
              bg-surface
              p-3
              shadow-[0_18px_45px_rgba(0,0,0,0.08)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:rotate-0
              hover:scale-[1.03]
            "
          >
            <div className="relative h-[235px] overflow-hidden rounded-[19px] bg-secondary/5">
              <CardMedia
                image={creator0.displayImage}
                name={creator0.name}
                category={creator0.category}
              />

              {creator0.isDemo && (
                <div className="absolute left-3 top-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[9.5px] font-medium text-white/90 border border-white/10 tracking-wide">
                  Demo Profile
                </div>
              )}

              {creator0.engagementRate !== null ? (
                <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#333] shadow-xs">
                  <span className="mr-1 text-secondary">●</span>
                  {creator0.engagementRate}% ENG
                </div>
              ) : (
                <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium text-text-secondary shadow-xs">
                  Eng: Not added
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1 pb-1 pt-3">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[14px] font-semibold text-primary">
                    {creator0.name}
                    <span className="ml-1 text-secondary-dark">✦</span>
                  </p>
                  {creator0.isDemo && (
                    <span className="shrink-0 rounded-full bg-secondary/10 px-2 py-0.5 text-[9px] font-medium text-secondary-dark border border-secondary/20">
                      Demo Profile
                    </span>
                  )}
                </div>

                <p className="mt-1 truncate text-[12px] text-text-secondary">
                  {creator0.category}
                  {creator0.handle && !creator0.handle.toLowerCase().includes("nike")
                    ? ` • ${creator0.handle}`
                    : ""}
                </p>
              </div>

              <span className="shrink-0 rounded-lg bg-secondary/[0.08] px-2.5 py-1 text-[11px] font-semibold text-primary">
                {formatFollowers(creator0.followerCount)}
              </span>
            </div>

            <div className="border-t border-border-theme px-1 pt-2 text-[11px] text-text-secondary">
              {creator0.startingPrice
                ? `Collab From ${formatPrice(creator0.startingPrice, creator0.currency)}`
                : "Price on request"}
            </div>
          </div>
        </div>

        {/* ================= SECOND CREATOR (TOP RIGHT) ================= */}

        <div className="creator-float-slow absolute right-[7%] top-[1%] z-10 w-[270px] rotate-[3deg]">
          <div
            className="
              overflow-hidden
              rounded-[26px]
              border
              border-border-theme
              bg-surface
              p-3
              shadow-[0_18px_45px_rgba(0,0,0,0.08)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:rotate-0
              hover:scale-[1.03]
            "
          >
            <div className="relative h-[235px] overflow-hidden rounded-[19px] bg-secondary/5">
              <CardMedia
                image={creator1.displayImage}
                name={creator1.name}
                category={creator1.category}
              />

              {creator1.isDemo && (
                <div className="absolute left-3 top-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[9.5px] font-medium text-white/90 border border-white/10 tracking-wide">
                  Demo Profile
                </div>
              )}

              {creator1.engagementRate !== null ? (
                <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#333] shadow-xs">
                  <span className="mr-1 text-secondary">●</span>
                  {creator1.engagementRate}% ENG
                </div>
              ) : (
                <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium text-text-secondary shadow-xs">
                  Eng: Not added
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1 pb-1 pt-3">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[14px] font-semibold text-primary">
                    {creator1.name}
                    <span className="ml-1 text-secondary-dark">✦</span>
                  </p>
                  {creator1.isDemo && (
                    <span className="shrink-0 rounded-full bg-secondary/10 px-2 py-0.5 text-[9px] font-medium text-secondary-dark border border-secondary/20">
                      Demo Profile
                    </span>
                  )}
                </div>

                <p className="mt-1 truncate text-[12px] text-text-secondary">
                  {creator1.category}
                  {creator1.handle && !creator1.handle.toLowerCase().includes("nike")
                    ? ` • ${creator1.handle}`
                    : ""}
                </p>
              </div>

              <span className="shrink-0 rounded-lg bg-secondary/[0.08] px-2.5 py-1 text-[11px] font-semibold text-primary">
                {formatFollowers(creator1.followerCount)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border-theme px-1 pt-2 text-[11px]">
              <span className="text-text-secondary">
                {creator1.startingPrice ? "From" : "Rate"}
              </span>

              <span className="font-semibold text-primary">
                {formatPrice(creator1.startingPrice, creator1.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* ================= CENTER OFFER / COLLABORATION ================= */}

        <div className="absolute left-1/2 top-[38%] z-30 w-[290px] -translate-x-1/2">
          <div
            className="
              rounded-full
              border
              border-secondary/40
              bg-surface
              px-5
              py-3
              shadow-[0_15px_40px_rgba(255,79,135,0.15)]
            "
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-white">
                ✓
              </div>

              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-primary">
                  {latestCollab
                    ? `${latestCollab.brand?.name || latestCollab.brandName} Collaboration${
                        latestCollab.amount
                          ? `: ₹${latestCollab.amount.toLocaleString("en-IN")}`
                          : ""
                      }`
                    : "Brand Collaborations Active"}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-text-secondary">
                  {latestCollab
                    ? `${latestCollab.title} • ${
                        (latestCollab.deliverables?.length ?? latestCollab.deliverablesCount) > 0
                          ? `${latestCollab.deliverables?.length ?? latestCollab.deliverablesCount} Deliverables`
                          : "Active Collaboration"
                      }`
                    : "Verified collaboration partners"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= THIRD CREATOR (BOTTOM LEFT) ================= */}

        <div className="creator-float-slow absolute bottom-[8%] left-[15%] z-20 w-[300px] rotate-[2deg]">
          <div
            className="
              overflow-hidden
              rounded-[24px]
              border
              border-border-theme
              bg-surface
              p-3
              shadow-[0_18px_45px_rgba(0,0,0,0.08)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:rotate-0
              hover:scale-[1.03]
            "
          >
            <div className="relative h-[190px] overflow-hidden rounded-[18px] bg-secondary/5">
              <CardMedia
                image={creator2.displayImage}
                name={creator2.name}
                category={creator2.category}
              />

              {creator2.isDemo && (
                <div className="absolute right-3 top-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[9.5px] font-medium text-white/90 border border-white/10 tracking-wide">
                  Demo Profile
                </div>
              )}

              <div className="absolute bottom-3 left-3 rounded-full bg-[#222]/80 px-3 py-1 text-[10px] font-medium text-white shadow-xs">
                ▶ {creator2.category}
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pt-3">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[14px] font-semibold text-primary">
                    {creator2.name}
                    <span className="ml-1 text-secondary-dark">✦</span>
                  </p>
                  {creator2.isDemo && (
                    <span className="shrink-0 rounded-full bg-secondary/10 px-2 py-0.5 text-[9px] font-medium text-secondary-dark border border-secondary/20">
                      Demo Profile
                    </span>
                  )}
                </div>

                <p className="mt-1 truncate text-[12px] text-text-secondary">
                  {creator2.category}
                  {creator2.handle && !creator2.handle.toLowerCase().includes("nike")
                    ? ` • ${creator2.handle}`
                    : ""}{" "}
                  • {formatEngagement(creator2.engagementRate)}
                </p>
              </div>

              <span className="shrink-0 text-[13px] font-semibold text-secondary-dark">
                {creator2.startingPrice
                  ? `From ${formatPrice(creator2.startingPrice, creator2.currency)}`
                  : "Price on request"}
              </span>
            </div>
          </div>
        </div>

        {/* ================= FOURTH CREATOR (BOTTOM RIGHT) ================= */}

        <div className="creator-float absolute bottom-[8%] right-[15%] z-20 w-[300px] -rotate-[2deg]">
          <div
            className="
              overflow-hidden
              rounded-[24px]
              border
              border-border-theme
              bg-surface
              p-3
              shadow-[0_18px_45px_rgba(0,0,0,0.08)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:rotate-0
              hover:scale-[1.03]
            "
          >
            <div className="relative h-[190px] overflow-hidden rounded-[18px] bg-secondary/5">
              <CardMedia
                image={creator3.displayImage}
                name={creator3.name}
                category={creator3.category}
              />

              {creator3.isDemo && (
                <div className="absolute right-3 top-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[9.5px] font-medium text-white/90 border border-white/10 tracking-wide">
                  Demo Profile
                </div>
              )}

              <div className="absolute bottom-3 left-3 rounded-full bg-secondary px-3 py-1 text-[10px] font-medium text-white shadow-xs">
                {creator3.category}
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pt-3">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[14px] font-semibold text-primary">
                    {creator3.name}
                    <span className="ml-1 text-secondary-dark">✦</span>
                  </p>
                  {creator3.isDemo && (
                    <span className="shrink-0 rounded-full bg-secondary/10 px-2 py-0.5 text-[9px] font-medium text-secondary-dark border border-secondary/20">
                      Demo Profile
                    </span>
                  )}
                </div>

                <p className="mt-1 truncate text-[12px] text-text-secondary">
                  {creator3.category}
                  {creator3.handle && !creator3.handle.toLowerCase().includes("nike")
                    ? ` • ${creator3.handle}`
                    : ""}{" "}
                  • {formatFollowers(creator3.followerCount)}
                  {creator3.followerCount !== null ? " Reach" : ""} •{" "}
                  {formatEngagement(creator3.engagementRate)}
                </p>
              </div>

              <span className="shrink-0 text-[13px] font-semibold text-primary">
                {creator3.startingPrice
                  ? `From ${formatPrice(creator3.startingPrice, creator3.currency)}`
                  : "Price on request"}
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
