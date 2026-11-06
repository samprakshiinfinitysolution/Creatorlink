"use client";

import React, { useState } from "react";

/**
 * Dynamically generates 2-letter uppercase initials from a name or title.
 * Examples:
 * - "Rohan Sharma" -> "RS"
 * - "Brand User" -> "BU"
 * - "Summer Time" -> "ST"
 * - "Nike" -> "NI"
 * - "A" -> "A"
 * - "" -> fallback
 */
export function getInitials(name, fallback = "—") {
  if (!name || typeof name !== "string") return fallback;
  const cleaned = name.replace(/[-_]/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Universal Avatar component for Creator, Brand, Campaign, and Admin.
 * Handles:
 * 1. Rendering actual image if valid src exists.
 * 2. Dynamic initials generation if image is missing.
 * 3. Graceful fallback to initials if image loading fails (onError).
 * 4. Neutral placeholder if both image and name are unavailable.
 * 5. Preservation of existing container styles, shapes, colors, and layout.
 */
export default function AdminAvatar({
  src,
  name,
  type = "user", // "creator" | "brand" | "campaign" | "user" | "admin"
  size,
  shape,
  fallbackColor,
  className = "",
  imgClassName = "w-full h-full object-cover",
  fallback
}) {
  const [failedSrc, setFailedSrc] = useState(null);

  const defaultFallback =
    type === "creator"
      ? "CR"
      : type === "brand"
      ? "BU"
      : type === "campaign"
      ? "CP"
      : type === "admin"
      ? "AD"
      : "US";

  const initials = getInitials(name, fallback || defaultFallback);
  const validSrc = typeof src === "string" && src.trim().length > 0;
  const hasError = failedSrc === src;
  const shouldShowImage = validSrc && !hasError;

  // Compute size class if not already in className
  const resolvedSize = size || (className.match(/\bw-\S+/) ? "" : "w-8 h-8");

  // Compute shape class if not already in className
  const resolvedShape =
    shape ||
    (className.match(/\brounded-\S+/)
      ? ""
      : type === "campaign"
      ? "rounded-xl"
      : "rounded-full");

  // Compute color/styling class for fallback if not already in className
  const resolvedColor =
    fallbackColor ||
    (className.match(/\bbg-\S+/)
      ? ""
      : type === "creator"
      ? "bg-secondary/15 text-secondary"
      : type === "brand"
      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
      : type === "campaign"
      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
      : type === "admin"
      ? "bg-secondary/20 text-secondary"
      : "bg-surface-muted text-foreground");

  const combinedClasses = [
    "relative shrink-0 flex items-center justify-center font-bold uppercase overflow-hidden select-none",
    resolvedSize,
    resolvedShape,
    resolvedColor,
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={combinedClasses}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={name || type}
          onError={() => setFailedSrc(src)}
          className={imgClassName}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
