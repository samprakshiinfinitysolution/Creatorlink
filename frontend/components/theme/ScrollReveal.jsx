"use client";

import React, { useState, useEffect, useRef } from "react";

const DIRECTION_CLASS_MAP = {
  up: "reveal-fade-up",
  left: "reveal-fade-left",
  right: "reveal-fade-right",
  scale: "reveal-scale",
};

/**
 * Reusable ScrollReveal component for smooth viewport-triggered reveal animations.
 *
 * @param {React.ReactNode} children - Element(s) to animate.
 * @param {"up" | "left" | "right" | "scale"} [direction="up"] - Reveal animation type.
 * @param {number | string} [delay=0] - Delay before animation starts (ms if number, or CSS time string).
 * @param {number | string} [duration] - Optional custom animation duration.
 * @param {string} [className=""] - Additional class names.
 * @param {boolean} [once=true] - Whether to reveal only once or trigger on every viewport entry.
 * @param {number} [threshold=0.1] - Viewport intersection threshold (0.0 to 1.0).
 * @param {string} [rootMargin="0px 0px -40px 0px"] - Observer root margin.
 * @param {React.ElementType} [as="div"] - HTML tag or component to render.
 * @param {React.CSSProperties} [style={}] - Inline styles to merge.
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration,
  className = "",
  once = true,
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  as: Component = "div",
  style = {},
  ...props
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Graceful fallback when IntersectionObserver is not supported
    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once, threshold, rootMargin]);

  const animationClass = DIRECTION_CLASS_MAP[direction] || DIRECTION_CLASS_MAP.up;

  const dynamicStyle = { ...style };

  if (delay && isRevealed) {
    dynamicStyle.transitionDelay =
      typeof delay === "number" ? `${delay}ms` : delay;
  }

  if (duration) {
    dynamicStyle.transitionDuration =
      typeof duration === "number" ? `${duration}ms` : duration;
  }

  return (
    <Component
      ref={elementRef}
      className={`${animationClass} ${isRevealed ? "is-revealed" : ""} ${className}`.trim()}
      style={dynamicStyle}
      {...props}
    >
      {children}
    </Component>
  );
}
