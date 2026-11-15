"use client";

import React, { useState, useRef, useEffect, useCallback, useId } from "react";

/**
 * DropdownFilter
 * 
 * Accessible, customizable dropdown filter component styled to match CreatorLink Brand reference.
 * Displays selected/active options with a soft grey background (neutral-200/80 in light mode,
 * neutral-800 in dark mode) instead of browser default blue accent, while preserving the pink
 * border, typography, spacing, and rounded corners of the dropdown controls.
 */
export default function DropdownFilter({
  value,
  onChange,
  options = [],
  className = "",
  buttonClassName = "",
  placeholder = "Select...",
  name,
  id,
  disabled = false,
  "aria-label": ariaLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);
  const autoId = useId();
  const selectId = id || autoId;

  // Normalize options to [{ value, label }] format
  const normalizedOptions = React.useMemo(() => {
    return (options || []).map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          value: opt.value !== undefined ? String(opt.value) : "",
          label: opt.label !== undefined ? String(opt.label) : String(opt.value ?? ""),
        };
      }
      return {
        value: String(opt),
        label: String(opt),
      };
    });
  }, [options]);

  const strValue = value !== undefined && value !== null ? String(value) : "";
  const selectedOption = normalizedOptions.find((o) => o.value === strValue);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        const idx = normalizedOptions.findIndex((o) => o.value === strValue);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      } else {
        setHighlightedIndex(-1);
      }
      return next;
    });
  };

  const handleSelect = useCallback(
    (optValue) => {
      if (disabled) return;
      if (typeof onChange === "function") {
        // Create synthetic event for drop-in compatibility with (e) => setVal(e.target.value)
        const syntheticEvent = {
          target: { value: optValue, name: name || selectId },
          currentTarget: { value: optValue, name: name || selectId },
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        onChange(syntheticEvent, optValue);
      }
      setIsOpen(false);
    },
    [disabled, onChange, name, selectId]
  );

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        toggleOpen();
      } else if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        toggleOpen();
      } else {
        setHighlightedIndex((prev) =>
          prev < normalizedOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        toggleOpen();
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : normalizedOptions.length - 1
        );
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "Tab") {
      if (isOpen) {
        setIsOpen(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={selectId}
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || displayLabel}
        className={`bg-surface-muted/60 border text-foreground text-xs rounded-xl px-3 py-2.5 transition-colors cursor-pointer flex items-center justify-between gap-2 select-none min-w-[130px] ${
          isOpen
            ? "border-secondary ring-1 ring-secondary/30"
            : "border-border-theme hover:border-secondary/60 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${buttonClassName}`}
      >
        <span className="truncate font-medium">{displayLabel}</span>
        <svg
          className={`w-3.5 h-3.5 text-text-secondary shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-secondary" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${selectId}-opt-${highlightedIndex}` : undefined
          }
          className="absolute left-0 mt-1.5 z-40 min-w-full w-max max-w-xs bg-surface dark:bg-[#1b1b1b] border border-border-theme rounded-xl shadow-xl p-1 space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100 font-sans text-xs"
        >
          {normalizedOptions.map((opt, idx) => {
            const isSelected = opt.value === strValue;
            const isHighlighted = idx === highlightedIndex;

            return (
              <div
                key={opt.value || idx}
                id={`${selectId}-opt-${idx}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 select-none ${
                  isSelected
                    ? "bg-neutral-200/80 dark:bg-neutral-800 text-foreground font-semibold"
                    : isHighlighted
                    ? "bg-surface-muted/90 dark:bg-surface-muted/40 text-foreground"
                    : "text-foreground hover:bg-surface-muted/80 dark:hover:bg-surface-muted/40"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 text-secondary shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
