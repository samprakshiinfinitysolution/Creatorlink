"use client";

import React, { useState, useEffect, useRef } from "react";

// Module-level flag: prevents re-triggering during internal in-app client navigation
let hasInitialPageLoaded = false;

export default function ThreeDotLoader({
  minDuration = 600,
  fadeDuration = 450,
  safetyTimeout = 3000,
  forceShow = false,
}) {
  const shouldShow = forceShow || !hasInitialPageLoaded;
  const [isRendered, setIsRendered] = useState(shouldShow);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef(null);
  const unmountTimerRef = useRef(null);
  const safetyTimerRef = useRef(null);

  useEffect(() => {
    if (!shouldShow) return;

    // Minimum display duration before initiating smooth exit transition
    exitTimerRef.current = setTimeout(() => {
      setIsExiting(true);
      hasInitialPageLoaded = true;

      // Complete unmount after fade-out transition finishes
      unmountTimerRef.current = setTimeout(() => {
        setIsRendered(false);
      }, fadeDuration);
    }, minDuration);

    // Hard fallback safety timer to prevent remaining visible indefinitely
    safetyTimerRef.current = setTimeout(() => {
      setIsExiting(true);
      hasInitialPageLoaded = true;
      setIsRendered(false);
    }, safetyTimeout);

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, [shouldShow, minDuration, fadeDuration, safetyTimeout]);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Loading CreatorLink"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity ease-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
      style={{ transitionDuration: `${fadeDuration}ms` }}
    >
      <style>{`
        @keyframes dotScalePulse {
          0%, 100% {
            transform: scale(0.65);
            opacity: 0.35;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }

        .three-dot-loader-dot {
          background-color: #000000;
          border-radius: 9999px;
          display: inline-block;
          animation: dotScalePulse 1.25s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          will-change: transform, opacity;
        }

        .dot-size-sm {
          width: 10px;
          height: 10px;
        }

        .dot-size-lg {
          width: 16px;
          height: 16px;
        }

        .dot-size-xs {
          width: 8px;
          height: 8px;
        }

        .dot-delay-1 {
          animation-delay: 0s;
        }

        .dot-delay-2 {
          animation-delay: 0.2s;
        }

        .dot-delay-3 {
          animation-delay: 0.4s;
        }

        @media (min-width: 640px) {
          .dot-size-sm {
            width: 12px;
            height: 12px;
          }
          .dot-size-lg {
            width: 18px;
            height: 18px;
          }
          .dot-size-xs {
            width: 10px;
            height: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .three-dot-loader-dot {
            animation: dotOpacityOnly 1.5s ease-in-out infinite !important;
            transform: none !important;
          }

          @keyframes dotOpacityOnly {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
          }
        }
      `}</style>

      {/* Screen-reader accessible label */}
      <span className="sr-only">Loading CreatorLink</span>

      {/* Three Horizontal Animating Dots */}
      <div className="flex items-center justify-center gap-3 sm:gap-3.5">
        <span className="three-dot-loader-dot dot-size-sm dot-delay-1" />
        <span className="three-dot-loader-dot dot-size-lg dot-delay-2" />
        <span className="three-dot-loader-dot dot-size-xs dot-delay-3" />
      </div>
    </div>
  );
}
