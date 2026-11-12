"use client";
import React, { useState, useRef, useEffect } from "react";
import { CAMPAIGN_PLATFORMS, formatCampaignPlatforms, normalizeCampaignPlatforms } from "@/lib/campaignPlatforms";

export default function TargetPlatformSelector({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedList = normalizeCampaignPlatforms(value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const togglePlatform = (platformKey) => {
    if (disabled) return;
    const exists = selectedList.includes(platformKey);
    const updated = exists
      ? selectedList.filter((p) => p !== platformKey)
      : [...selectedList, platformKey];
    onChange(updated);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 bg-surface-muted/60 border text-left text-xs sm:text-sm rounded-xl px-3.5 py-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? "border-secondary" : "border-border-theme hover:border-secondary/60"
        }`}
        aria-expanded={isOpen}
      >
        <span className={`truncate ${selectedList.length > 0 ? "text-foreground font-medium" : "text-text-secondary"}`}>
          {selectedList.length > 0
            ? formatCampaignPlatforms(selectedList)
            : "Select target platforms..."}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedList.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary text-[10px] font-bold">
              {selectedList.length}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-30 bg-surface border border-border-theme rounded-xl shadow-xl p-1.5 space-y-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {CAMPAIGN_PLATFORMS.map((item) => {
            const isChecked = selectedList.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => togglePlatform(item.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isChecked
                    ? "bg-secondary/10 text-secondary"
                    : "text-foreground hover:bg-surface-muted/70"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    isChecked
                      ? "bg-secondary border-secondary text-white"
                      : "border-border-theme bg-background"
                  }`}
                >
                  {isChecked && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

