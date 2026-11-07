"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, CheckCircle2, Star } from "lucide-react";

export default function Hero() {
  const canvasRef = useRef(null);

  // Simulation Sequence State: 0 to 5
  // 0: Creator Transmitting Direct Pitch (Right -> Left)
  // 1: Brand Approved & Escrow Locked (Left -> Right) [Matches Prototype Image 1]
  // 2: Creator Delivering Content Draft (Right -> Left)
  // 3: 100% Content Approved! Releasing Instant Payout (Left -> Right)
  // 4: Mutual 5-Star Ratings & Reviews Exchanged
  // 5: Collaboration Successfully Completed & Settled [Matches Prototype Image 2]
  const [seqIndex, setSeqIndex] = useState(1);
  const [parcelProgress, setParcelProgress] = useState(50);
  const [parcelOpacity, setParcelOpacity] = useState(1);
  const [showFinale, setShowFinale] = useState(false);
  const [pulseLeft, setPulseLeft] = useState(false);
  const [pulseRight, setPulseRight] = useState(false);

  // Canvas Confetti / Explosion Engine for Finale Stage
  const triggerBlast = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;
    const colors = ["#f43f5e", "#ec4899", "#10b981", "#fbbf24", "#3b82f6", "#8b5cf6", "#ffffff"];

    const particles = [];
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        radius: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
        gravity: 0.28,
      });
    }

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animate();
  };

  // Live Collaboration Simulation Sequence
  useEffect(() => {
    let isCancelled = false;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const runLoop = async () => {
      while (!isCancelled) {
        // -------------------------------------------------------------
        // STAGE 0 (Step 1): Creator Sends Pitch Request (Right -> Left)
        // -------------------------------------------------------------
        setShowFinale(false);
        setSeqIndex(0);
        setParcelOpacity(1);
        setParcelProgress(85);
        await sleep(100);
        if (isCancelled) break;

        setParcelProgress(15);
        await sleep(1600);
        if (isCancelled) break;

        setPulseLeft(true);
        setTimeout(() => setPulseLeft(false), 500);
        await sleep(1200);
        if (isCancelled) break;

        // -------------------------------------------------------------
        // STAGE 1 (Step 2): Brand Accepts & Escrow Locked (Left -> Right)
        // -------------------------------------------------------------
        setSeqIndex(1);
        setParcelProgress(15);
        await sleep(100);
        if (isCancelled) break;

        setParcelProgress(85);
        await sleep(1800);
        if (isCancelled) break;

        setPulseRight(true);
        setTimeout(() => setPulseRight(false), 500);
        await sleep(1400);
        if (isCancelled) break;

        // -------------------------------------------------------------
        // STAGE 2 (Step 3): Creator Delivers Video Draft (Right -> Left)
        // -------------------------------------------------------------
        setSeqIndex(2);
        setParcelProgress(85);
        await sleep(100);
        if (isCancelled) break;

        setParcelProgress(15);
        await sleep(1700);
        if (isCancelled) break;

        setPulseLeft(true);
        setTimeout(() => setPulseLeft(false), 500);
        await sleep(1200);
        if (isCancelled) break;

        // -------------------------------------------------------------
        // STAGE 3 (Step 4): Brand Approves & Releases Payment (Left -> Right)
        // -------------------------------------------------------------
        setSeqIndex(3);
        setParcelProgress(15);
        await sleep(100);
        if (isCancelled) break;

        setParcelProgress(85);
        await sleep(1700);
        if (isCancelled) break;

        setPulseRight(true);
        setTimeout(() => setPulseRight(false), 500);
        await sleep(1000);
        if (isCancelled) break;

        // -------------------------------------------------------------
        // STAGE 4 (Step 5): Reviews Exchange
        // -------------------------------------------------------------
        setSeqIndex(4);
        setParcelOpacity(0);
        setPulseLeft(true);
        setPulseRight(true);
        setTimeout(() => {
          setPulseLeft(false);
          setPulseRight(false);
        }, 500);
        await sleep(1200);
        if (isCancelled) break;

        // -------------------------------------------------------------
        // STAGE 5 (Step 6): Finale Celebration / Trophy Banner
        // -------------------------------------------------------------
        setSeqIndex(5);
        setShowFinale(true);
        triggerBlast();

        await sleep(4200);
        if (isCancelled) break;

        setShowFinale(false);
        await sleep(600);
        if (isCancelled) break;
      }
    };

    runLoop();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-[#FCEEF2] to-[#FAF4F6] dark:from-background dark:via-background dark:to-background pt-18 sm:pt-23 md:pt-24 xl:pt-28 px-0 pb-16 transition-colors duration-300">

      {/* Dynamic Smooth 3D & Elevation Styles */}
      <style>{`
        .hero-perspective-stage {
          perspective: 1200px;
          perspective-origin: center center;
          transform-style: preserve-3d;
        }

        /* Continuous Smooth Automatic Float Animations (20° to 25° Elevation) */
        @keyframes autoFloatBrand {
          0%, 100% {
            transform: perspective(1200px) rotateX(10deg) rotateY(22deg) rotateZ(-3.5deg) translateY(0px);
          }
          50% {
            transform: perspective(1200px) rotateX(10deg) rotateY(22deg) rotateZ(-3.5deg) translateY(-12px);
          }
        }

        @keyframes autoFloatCreator {
          0%, 100% {
            transform: perspective(1200px) rotateX(10deg) rotateY(-22deg) rotateZ(3.5deg) translateY(0px);
          }
          50% {
            transform: perspective(1200px) rotateX(10deg) rotateY(-22deg) rotateZ(3.5deg) translateY(-12px);
          }
        }

        .hero-elevated-card-left {
          transform: perspective(1200px) rotateX(10deg) rotateY(22deg) rotateZ(-3.5deg);
          transform-style: preserve-3d;
          animation: autoFloatBrand 5s ease-in-out infinite;
          will-change: transform;
        }

        .hero-elevated-card-right {
          transform: perspective(1200px) rotateX(10deg) rotateY(-22deg) rotateZ(3.5deg);
          transform-style: preserve-3d;
          animation: autoFloatCreator 5s ease-in-out infinite 0.75s;
          will-change: transform;
        }

        /* Responsive Breakpoints - Smooth scaled elevation */
        @media (max-width: 1023px) {
          @keyframes autoFloatBrandTablet {
            0%, 100% {
              transform: perspective(1000px) rotateX(8deg) rotateY(16deg) rotateZ(-2deg) translateY(0px);
            }
            50% {
              transform: perspective(1000px) rotateX(8deg) rotateY(16deg) rotateZ(-2deg) translateY(-8px);
            }
          }
          @keyframes autoFloatCreatorTablet {
            0%, 100% {
              transform: perspective(1000px) rotateX(8deg) rotateY(-16deg) rotateZ(2deg) translateY(0px);
            }
            50% {
              transform: perspective(1000px) rotateX(8deg) rotateY(-16deg) rotateZ(2deg) translateY(-8px);
            }
          }
          .hero-elevated-card-left {
            animation: autoFloatBrandTablet 5s ease-in-out infinite;
          }
          .hero-elevated-card-right {
            animation: autoFloatCreatorTablet 5s ease-in-out infinite 0.75s;
          }
        }

        @media (max-width: 639px) {
          @keyframes autoFloatBrandMobile {
            0%, 100% {
              transform: perspective(800px) rotateX(6deg) rotateY(10deg) rotateZ(-1.5deg) translateY(0px);
            }
            50% {
              transform: perspective(800px) rotateX(6deg) rotateY(10deg) rotateZ(-1.5deg) translateY(-6px);
            }
          }
          @keyframes autoFloatCreatorMobile {
            0%, 100% {
              transform: perspective(800px) rotateX(6deg) rotateY(-10deg) rotateZ(1.5deg) translateY(0px);
            }
            50% {
              transform: perspective(800px) rotateX(6deg) rotateY(-10deg) rotateZ(1.5deg) translateY(-6px);
            }
          }
          .hero-elevated-card-left {
            animation: autoFloatBrandMobile 5s ease-in-out infinite;
          }
          .hero-elevated-card-right {
            animation: autoFloatCreatorMobile 5s ease-in-out infinite 0.75s;
          }
        }

        /* Glassmorphism Styling */
        .glass-card-brand {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(24px) saturate(180%);
          box-shadow: 0 32px 64px -16px rgba(244, 63, 94, 0.16), 0 12px 28px -6px rgba(0, 0, 0, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
        }

        .dark .glass-card-brand {
          background: rgba(24, 24, 30, 0.96);
          box-shadow: 0 35px 70px -16px rgba(0, 0, 0, 0.7), 0 0 45px rgba(244, 63, 94, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1);
        }

        .glass-card-creator {
          background: rgba(18, 19, 24, 0.96);
          backdrop-filter: blur(24px) saturate(180%);
          box-shadow: 0 35px 75px -16px rgba(0, 0, 0, 0.8), 0 0 45px rgba(244, 63, 94, 0.15), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12);
        }

        .text-gradient-rose {
          background: linear-gradient(135deg, #f43f5e 0%, #ff4f87 50%, #f43f5e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes laserFlow {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-laser-flow {
          background-size: 200% 100%;
          animation: laserFlow 2.8s linear infinite;
        }
      `}</style>

      {/* Confetti / Explosion Canvas overlay */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-50 h-full w-full"
      />

      {/* ================================================================= */}
      {/* 1. TOP HERO SECTION: LIVE MOVING PACKET COLLABORATION ARENA       */}
      {/* ================================================================= */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-3 pb-2 relative z-10">

        {/* Top Pill Indicator with Live Stage Status */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/95 dark:bg-surface/90 backdrop-blur-md border border-rose-200/90 dark:border-rose-500/30 shadow-xs transition-all duration-300">
            {seqIndex === 5 ? (
              <span className="text-base leading-none">🎉</span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 font-sans">
              {seqIndex === 0 && "● STEP 1: CREATOR TRANSMITTING DIRECT PITCH ➔ BRAND ●"}
              {seqIndex === 1 && "● STEP 2: BRAND APPROVED DEAL & SECURED ₹45,000 IN ESCROW ●"}
              {seqIndex === 2 && "● STEP 3: CREATOR DELIVERING CONTENT DRAFT TO BRAND ●"}
              {seqIndex === 3 && "● STEP 4: 100% CONTENT APPROVED! RELEASING INSTANT PAYOUT ●"}
              {seqIndex === 4 && "● STEP 5: MUTUAL 5-STAR RATINGS & REVIEWS EXCHANGED ●"}
              {seqIndex === 5 && "🎉 COLLABORATION SUCCESSFULLY COMPLETED & SETTLED! 🎉"}
            </span>
            {seqIndex === 5 && <span className="text-base leading-none">🎉</span>}
          </div>
        </div>

        {/* 3D LIVE COLLABORATION STAGE - Centered, Symmetrical, Reduced Gap & Larger Cards */}
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-3 xl:gap-5 min-h-[440px] hero-perspective-stage">

          {/* ============================================================= */}
          {/* LEFT 3D ELEVATED CARD: BRAND (boAt Lifestyle)                 */}
          {/* ============================================================= */}
          <div className="flex-1 max-w-[440px] xl:max-w-[465px] w-full flex justify-center lg:justify-end hero-perspective-stage">
            <div
              className={`w-full hero-elevated-card-left glass-card-brand rounded-3xl p-6 sm:p-7 border border-white/95 dark:border-white/10 relative text-left transition-shadow duration-300 ${pulseLeft ? "ring-2 ring-blue-500/50" : ""
                }`}
            >
              {/* Floating Status Badge */}
              <div
                className={`absolute -top-3.5 -right-2 text-white px-3.5 py-1 rounded-full text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 transition-colors z-20 ${seqIndex === 0
                  ? "bg-amber-500"
                  : seqIndex === 1
                    ? "bg-blue-600"
                    : seqIndex === 2
                      ? "bg-purple-600"
                      : "bg-emerald-600"
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>
                  {seqIndex === 0 && "Reviewing Proposal"}
                  {seqIndex === 1 && "₹45k Escrow Locked"}
                  {seqIndex === 2 && "Previewing Draft 👀"}
                  {seqIndex >= 3 && "Approved & Paid ✓"}
                </span>
              </div>

              {/* Brand Profile */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-rose-950 text-white flex flex-col items-center justify-center font-black shadow-lg border border-white/30 shrink-0">
                  <span className="text-xl sm:text-2xl tracking-tighter leading-none">boAt</span>
                  <span className="text-[9px] text-rose-400 font-semibold uppercase tracking-widest mt-0.5">Audio</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                      boAt Lifestyle
                    </h3>
                    {/* Badge Check Icon */}
                    <svg className="w-4 h-4 text-blue-500 fill-blue-500/20 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    D2C Consumer Tech • Delhi, IN
                  </p>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-0.5 font-sans">
                    <span>★ 4.9</span>
                    <span className="text-slate-400 font-normal">(184 campaigns closed)</span>
                  </div>
                </div>
              </div>

              {/* Financial Snapshot Box */}
              <div className="bg-rose-50/90 dark:bg-surface-muted/90 rounded-2xl p-4 sm:p-5 border border-rose-100/80 dark:border-white/10 mb-4 transition-all">
                <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
                  <span>Direct Campaign Budget</span>
                  <span className="text-rose-600 line-through font-bold">Agency: ₹75,000</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-3xl sm:text-4xl xl:text-[42px] font-black text-slate-950 dark:text-white tracking-tight font-serif">
                    ₹45,000
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
                    Saved ₹30,000 (40%)
                  </span>
                </div>
              </div>

              {/* Live Brand Feedback Snippet */}
              <div className="bg-white/80 dark:bg-white/[0.04] rounded-xl p-3 border border-slate-100 dark:border-white/10 flex items-start gap-2.5 transition-all text-left">
                {/* Quote Icon */}
                <span className="text-rose-500 font-serif font-black text-xl leading-none shrink-0 mt-0.5">
                  “
                </span>
                <div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic leading-snug">
                    {seqIndex === 0 && "\"Waiting for Ananya's pitch for the Nirvana ANC launch.\""}
                    {seqIndex === 1 && "\"Pitch approved! ₹45,000 locked in escrow. Happy filming!\""}
                    {seqIndex === 2 && "\"Checking sound sync, hook quality, and product tagging.\""}
                    {seqIndex === 3 && "\"The reel is outstanding! Releasing ₹45,000 payment instantly.\""}
                    {seqIndex >= 4 && "\"★★★★★ 4.8x ROAS generated. Ananya is our top-tier ambassador!\""}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block tracking-wider">
                    {seqIndex >= 4 ? "Rohan Mehta • Verified 5★ Rating" : "Rohan Mehta • Head of Growth"}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ============================================================= */}
          {/* CENTER: ACTIVE FLYING PACKET RUNWAY & FINALE BANNER           */}
          {/* ============================================================= */}
          <div className="w-full max-w-[260px] lg:w-[240px] xl:w-[260px] shrink-0 h-[280px] sm:h-[300px] relative flex items-center justify-center overflow-visible z-20">

            {/* Animated Connecting Neon Track Beam */}
            <div className="absolute w-full h-1.5 bg-gradient-to-r from-blue-500/30 via-pink-500/40 to-emerald-500/30 rounded-full blur-[1px]" />
            <div className="absolute w-full h-[2px] bg-gradient-to-r from-blue-400 via-rose-500 to-emerald-400 animate-laser-flow opacity-80" />

            {/* ================= THE MOVING FLYING PARCEL ================= */}
            <div
              className={`absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 top-1/2 shadow-2xl rounded-2xl p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3 border backdrop-blur-xl bg-white/95 dark:bg-surface/95 border-rose-200 dark:border-white/15 w-[230px] sm:w-[250px] transition-all duration-[1400ms] ease-[cubic-bezier(0.34,1.25,0.64,1)] ${showFinale || parcelOpacity === 0 ? "opacity-0 scale-75" : "opacity-100 scale-100"
                }`}
              style={{
                left: `${parcelProgress}%`,
              }}
            >
              {/* Parcel Icon Container */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-md shrink-0 transition-colors ${seqIndex === 0
                  ? "bg-rose-500"
                  : seqIndex === 1
                    ? "bg-blue-600"
                    : seqIndex === 2
                      ? "bg-purple-600"
                      : "bg-emerald-500"
                  }`}
              >
                {seqIndex === 0 ? (
                  /* Send Icon */
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 -rotate-45 ml-0.5 fill-current" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                ) : seqIndex === 1 ? (
                  /* Lock Icon */
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                ) : seqIndex === 2 ? (
                  /* Video Icon */
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                ) : (
                  /* Wallet Icon */
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                )}
              </div>

              {/* Parcel Text Details */}
              <div className="text-left min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[8px] sm:text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${seqIndex === 0
                      ? "bg-rose-100 text-rose-700"
                      : seqIndex === 1
                        ? "bg-blue-100 text-blue-700"
                        : seqIndex === 2
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                  >
                    Stage {seqIndex + 1}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 truncate">
                    {seqIndex === 0 || seqIndex === 2 ? "Creator ➔ Brand" : "Brand ➔ Creator"}
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                  {seqIndex === 0 && "Pitch Sent: Collab Request 🚀"}
                  {seqIndex === 1 && "Accepted: ₹45,000 Escrow Locked 🔒"}
                  {seqIndex === 2 && "Video Draft Sent for Approval 🎬"}
                  {seqIndex >= 3 && "Quality Approved: ₹45,000 Paid! 💸"}
                </p>

                <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {seqIndex === 0 && "Reel + 2 Stories proposal"}
                  {seqIndex === 1 && "Budget safely held. Brief verified."}
                  {seqIndex === 2 && "1x Reel + 2 Stories delivered early!"}
                  {seqIndex >= 3 && "Instant UPI Settlement to Creator"}
                </p>
              </div>
            </div>


            {/* ================= PROFESSIONAL COLLABORATION COMPLETION CARD ================= */}
            <div
              className={`absolute z-40 inset-x-0 p-4 sm:p-5 rounded-3xl
    bg-slate-950/95 border border-emerald-400/40
    shadow-[0_0_40px_rgba(16,185,129,0.18)]
    text-center text-white backdrop-blur-2xl
    transition-all duration-700 flex flex-col items-center justify-center
    ${showFinale
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-75 pointer-events-none"
                }`}
            >
              {/* Trophy Icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
    bg-gradient-to-br from-amber-300 to-yellow-500
    text-slate-950 flex items-center justify-center
    shadow-lg shadow-amber-500/20 mb-3">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />
              </div>

              {/* Completion Badge */}
              <div className="inline-flex items-center gap-1.5
    text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em]
    text-emerald-400 bg-emerald-400/10
    px-3 py-1 rounded-full border border-emerald-400/20 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Collaboration Completed
              </div>

              {/* Heading */}
              <h3 className="text-lg sm:text-xl font-extrabold
    text-white leading-tight">
                Great Work, Successfully Delivered.
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 mt-2
    max-w-sm leading-relaxed">
                The campaign deliverables are complete.
                Here's to meaningful partnerships and more creative collaborations.
              </p>

              {/* Completion Status */}
              <div className="mt-4 inline-flex items-center gap-2
    text-xs sm:text-sm font-semibold text-amber-300
    bg-white/5 px-4 py-2 rounded-xl
    border border-white/10">
                <Star className="w-4 h-4 fill-amber-300" />
                Another Successful Collaboration
              </div>
            </div>


          </div>

          {/* ============================================================= */}
          {/* RIGHT 3D ELEVATED CARD: CREATOR (Ananya Verma)                */}
          {/* ============================================================= */}
          <div className="flex-1 max-w-[440px] xl:max-w-[465px] w-full flex justify-center lg:justify-start hero-perspective-stage">
            <div
              className={`w-full hero-elevated-card-right glass-card-creator rounded-3xl p-6 sm:p-7 text-white border border-white/20 relative text-left transition-shadow duration-300 ${pulseRight ? "ring-2 ring-emerald-500/50" : ""
                }`}
            >
              {/* Floating Status Badge */}
              <div
                className={`absolute -top-3.5 -left-2 text-white px-3.5 py-1 rounded-full text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 transition-colors z-20 ${seqIndex >= 3 ? "bg-emerald-600" : "bg-rose-600"
                  }`}
              >
                <span>⚡</span>
                <span>
                  {seqIndex === 0 && "Pitching Deal"}
                  {seqIndex === 1 && "Contract Signed ✍️"}
                  {seqIndex === 2 && "Draft Submitted"}
                  {seqIndex >= 3 && "₹45,000 Credited! 💰"}
                </span>
              </div>

              {/* Creator Profile */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden ring-2 ring-rose-400 shadow-md relative bg-slate-800">
                    <Image
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="Ananya Verma"
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                      Ananya Verma
                    </h3>
                    {/* Badge Check Icon */}
                    <svg className="w-4 h-4 text-rose-400 fill-rose-400/20 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Tech &amp; D2C Unboxing • 450K Reach
                  </p>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mt-0.5 font-sans">
                    <span>★ 5.0</span>
                    <span className="text-slate-400 font-normal">(92 verified collabs)</span>
                  </div>
                </div>
              </div>

              {/* Creator Earning Box */}
              <div className="bg-white/10 rounded-2xl p-4 sm:p-5 border border-white/10 mb-4 transition-all">
                <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-sans">
                  <span>Creator Wallet Balance</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${seqIndex >= 3
                      ? "text-emerald-400 bg-emerald-500/20"
                      : "text-amber-300 bg-amber-500/20"
                      }`}
                  >
                    {seqIndex >= 3 ? "Paid Directly (0% Cut)" : "Pending Deal"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-3xl sm:text-4xl xl:text-[42px] font-black text-white tracking-tight font-serif">
                    {seqIndex >= 3 ? "₹45,000" : "₹0"}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    100% Direct Payout
                  </span>
                </div>
              </div>

              {/* Live Creator Feedback Snippet */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-start gap-2.5 transition-all text-left">
                {/* Sparkles Icon */}
                <span className="text-emerald-400 font-serif font-black text-base leading-none shrink-0 mt-0.5">
                  ✦
                </span>
                <div>
                  <p className="text-xs text-slate-300 font-medium italic leading-snug">
                    {seqIndex === 0 && "\"8.2% avg reel engagement. Sending pitch proposal now.\""}
                    {seqIndex === 1 && "\"Payment safely locked! Starting shoot for ANC earbuds.\""}
                    {seqIndex === 2 && "\"Video exported in 4K HDR. Sent for brand verification.\""}
                    {seqIndex === 3 && "\"Funds received directly in bank via UPI. Zero fees cut!\""}
                    {seqIndex >= 4 && "\"★★★★★ boAt team was incredibly clear with approvals & payouts!\""}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block tracking-wider">
                    {seqIndex >= 4 ? "Ananya Verma • Verified 5★ Rating" : "Verified Creator ID #4829"}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ================================================================= */}
      {/* 2. BOTTOM SECTION: ORIGINAL HERO HEADLINE, CONTENT & CTAS        */}
      {/* ================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-12 text-center relative z-20">

        {/* Original Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[70px] font-bold tracking-tight text-slate-950 dark:text-foreground leading-[1.08] mb-5 font-serif">
          Where Brands &amp; Creators<br />
          <span className="font-serif italic font-normal text-gradient-rose">
            Build Powerful Collaborations.
          </span>
        </h1>

        {/* Original Subheadline */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-text-secondary font-normal max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
          Discover opportunities, connect with the right partners, manage campaigns, create amazing content, and grow together — all in one platform.
        </p>

        {/* Original CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-9">
          <Link
            href="/creators"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-950 hover:bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-bold text-sm shadow-xl shadow-slate-950/25 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Find Creators</span>
            <span className="text-base leading-none transition-transform group-hover:translate-x-1">→</span>
          </Link>

          <Link
            href="/signup?role=creator"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white dark:bg-surface hover:bg-rose-50/80 dark:hover:bg-white/10 text-slate-800 dark:text-foreground font-bold text-sm border border-slate-200/90 dark:border-white/20 shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <span>Explore Opportunities</span>
          </Link>
        </div>

        {/* Original Bottom Feature Points */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-600 dark:text-text-secondary">
          {/* Shield Check */}
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure Payments</span>
          </span>

          <span className="text-rose-300 dark:text-rose-800">•</span>

          {/* Badge Check */}
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Verified Creators</span>
          </span>

          <span className="text-rose-300 dark:text-rose-800">•</span>

          {/* Message Square */}
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Direct Chat</span>
          </span>
        </div>

      </section>

    </section>
  );
}