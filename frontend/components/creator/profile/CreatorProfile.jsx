"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import {
  getCreatorProfile,
  createCreatorProfile,
  updateCreatorProfile,
} from "@/redux/creator/profile/profile_slice";
import { uploadSingleImageApi } from "@/lib/upload";

// =========================================================
// HELPER FOR INITIALS & DATE
// =========================================================
function getCreatorDisplayInitial(name) {
  if (name && typeof name === "string" && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return "CR";
}

function formatJoinedDate(dateStr) {
  if (!dateStr) return "12 Aug 2024";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "12 Aug 2024";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(num) {
  if (typeof num !== "number" || isNaN(num)) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return new Intl.NumberFormat("en-IN").format(num);
}

// =========================================================
// ERROR FORMATTER HELPER (EXACT BRAND SYNTAX)
// =========================================================
function formatErrorMessage(err, fallback = "An unexpected error occurred.") {
  if (!err) return fallback;
  if (typeof err === "string") return err.trim() || fallback;
  if (typeof err === "object") {
    if (typeof err.message === "string" && err.message.trim()) {
      return err.message.trim();
    }
    if (typeof err.error === "string" && err.error.trim()) {
      return err.error.trim();
    }
    if (typeof err.msg === "string" && err.msg.trim()) {
      return err.msg.trim();
    }
    try {
      const json = JSON.stringify(err);
      if (json && json !== "{}") return json;
    } catch {
      // ignore serialization error
    }
  }
  return String(err) || fallback;
}

// =========================================================
// SVG ICONS
// =========================================================
function UserIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM2.25 12h19.5M12 2.25a15.3 15.3 0 014.5 9.75 15.3 15.3 0 01-4.5 9.75 15.3 15.3 0 01-4.5-9.75A15.3 15.3 0 0112 2.25z" />
    </svg>
  );
}

function UserGroupIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PencilIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

function MapPinIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function MailIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function CameraIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TiktokIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525 9.072v3.655c.677.305 1.428.483 2.222.483 2.879 0 5.214-2.335 5.214-5.214 0-.17-.01-.339-.028-.505A7.473 7.473 0 0023 6.002a7.483 7.483 0 01-4.23 1.205 5.225 5.225 0 00-3.771-1.608 5.214 5.214 0 00-5.214 5.214c0 .35.035.692.102 1.022-4.328-.217-8.167-2.29-10.736-5.441a5.187 5.187 0 00-.706 2.623c0 1.808.92 3.404 2.319 4.339a5.176 5.176 0 01-2.361-.652v.066c0 2.525 1.797 4.632 4.182 5.111a5.244 5.244 0 01-2.355.089c.663 2.07 2.587 3.577 4.869 3.619A10.46 10.46 0 010 20.354 14.75 14.75 0 007.981 22.69c9.577 0 14.815-7.933 14.815-14.815 0-.226-.005-.451-.015-.675A10.584 10.584 0 0024 4.557a10.373 10.373 0 01-3.003.823 5.24 5.24 0 002.3-2.893 10.457 10.457 0 01-3.32 1.269A5.204 5.204 0 0016.155 2c-2.879 0-5.214 2.335-5.214 5.214 0 .409.046.807.133 1.189A14.78 14.78 0 011.644 3.737a5.215 5.215 0 001.613 6.953 5.174 5.174 0 01-2.36-.652v.065c0 2.526 1.797 4.633 4.182 5.112a5.228 5.228 0 01-2.355.089c.663 2.07 2.587 3.577 4.869 3.619A10.46 10.46 0 010 20.354z" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function XMarkIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function SparklesIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function HeartIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function DeviceIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

function BoltIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function UtensilsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function TagIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.386l5.411-3.188c.826-.487 1.07-1.523.582-2.35l-7.69-13.06A2.25 2.25 0 0012.39 3H9.568z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function VideoCameraIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function PaletteIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.433-.432 1.09-.537 1.62-.252l2.365 1.272a1.875 1.875 0 01.99 1.65v.213" />
    </svg>
  );
}

function SquaresIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function LockClosedIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function CheckBadgeIcon({ className = "w-5 h-5 text-secondary" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LayersIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l9.75 5.25 9.75-5.25-4.179-2.25m-11.321 4.5L2.25 16.5l9.75 5.25 9.75-5.25-4.179-2.25M12 2.25L2.25 7.5l9.75 5.25 9.75-5.25L12 2.25z" />
    </svg>
  );
}

function ChartBarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function HandshakeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function GenderIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5m0-5l-6 6m1 4a5 5 0 11-7.07-7.07 5 5 0 017.07 7.07z" />
    </svg>
  );
}

function UsersIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function UploadIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function LinkIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function ShareIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  );
}

function EyeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function GenderFemaleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4a5 5 0 100 10 5 5 0 000-10zm0 10v6m-3-3h6" />
    </svg>
  );
}

function GenderMaleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14a5 5 0 100-10 5 5 0 000 10zm4-10h6m0 0v6m0-6L14 10" />
    </svg>
  );
}

function GenderNonBinaryIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.267-8-12.356-8-5.096 0-5.096 8 0 8 5.095 0 7.261-8 12.356-8z" />
    </svg>
  );
}

function GenderOtherIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function GenderPrivateIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  );
}

// =========================================================
// ONBOARDING & PROFILE CONSTANTS (SHARED TAXONOMY)
// =========================================================
const CATEGORIES = [
  {
    id: "fashion-luxury",
    name: "Fashion & Luxury",
    desc: "Haute couture, streetwear, designer styling & luxury goods",
    icon: SparklesIcon,
  },
  {
    id: "beauty-skincare",
    name: "Beauty & Skincare",
    desc: "Cosmetics, dermatology, routines, makeup & glam",
    icon: HeartIcon,
  },
  {
    id: "travel-lifestyle",
    name: "Travel & Lifestyle",
    desc: "Destinations, stays, city guides & aesthetic living",
    icon: GlobeIcon,
  },
  {
    id: "tech-gaming",
    name: "Tech & Gaming",
    desc: "Gadgets, PC setups, consoles, apps, AI & gameplay",
    icon: DeviceIcon,
  },
  {
    id: "fitness-wellness",
    name: "Fitness & Wellness",
    desc: "Workouts, nutrition, mindfulness & healthy lifestyle",
    icon: BoltIcon,
  },
  {
    id: "food-culinary",
    name: "Food & Culinary",
    desc: "Recipes, cafes, food reviews, cooking & baking",
    icon: UtensilsIcon,
  },
  {
    id: "apparel-lifestyle",
    name: "Apparel & Lifestyle",
    desc: "Everyday fits, activewear, capsule closets & accessories",
    icon: TagIcon,
  },
  {
    id: "photography",
    name: "Photography",
    desc: "Portraits, landscapes, editorial shoots & camera gear",
    icon: CameraIcon,
  },
  {
    id: "video-reels",
    name: "Video & Reels",
    desc: "Short-form video, TikToks, Reels, cinematics & vlogs",
    icon: VideoCameraIcon,
  },
  {
    id: "art-design",
    name: "Art & Design",
    desc: "Digital art, illustrations, UX/UI, pottery & creative works",
    icon: PaletteIcon,
  },
  {
    id: "other",
    name: "Other",
    desc: "Education, business, comedy, music & creative niches",
    icon: SquaresIcon,
  },
];

const SUGGESTED_KEYWORDS = [
  "fashion",
  "styling",
  "streetwear",
  "beauty",
  "skincare",
  "lifestyle",
  "tech reviews",
  "gaming",
  "fitness",
  "travel",
  "foodie",
  "ugc",
  "reels",
  "cinematic",
];

const GENDER_OPTIONS = [
  { id: "female", label: "Female", desc: "She / Her", icon: GenderFemaleIcon },
  { id: "male", label: "Male", desc: "He / Him", icon: GenderMaleIcon },
  { id: "non-binary", label: "Non-binary", desc: "They / Them / Enby", icon: GenderNonBinaryIcon },
  { id: "other", label: "Other", desc: "Self-described identity", icon: GenderOtherIcon },
  { id: "prefer_not_to_say", label: "Prefer not to say", desc: "Keep private", icon: GenderPrivateIcon },
];

const POPULAR_LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Bengali",
  "Portuguese",
  "Russian",
  "Japanese",
  "Korean",
  "Italian",
  "Punjabi",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Malayalam",
];

const ETHNICITY_OPTIONS = [
  "Asian / South Asian",
  "Asian / East Asian",
  "Asian / Southeast Asian",
  "Black / African descent",
  "Hispanic / Latino",
  "Middle Eastern / North African",
  "White / Caucasian",
  "Indigenous / Native",
  "Mixed / Multiracial",
];

function formatDobForInput(dobVal) {
  if (!dobVal) return "";
  const d = new Date(dobVal);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function formatDobForDisplay(dobVal) {
  if (!dobVal) return "Not specified";
  const d = new Date(dobVal);
  if (isNaN(d.getTime())) return "Not specified";
  const formatted = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  return age > 0 ? `${formatted} (${age} years)` : formatted;
}

function getGenderDisplay(genderVal) {
  if (!genderVal) return "Not specified";
  const found = GENDER_OPTIONS.find((g) => g.id === genderVal);
  return found ? found.label : genderVal;
}

// =========================================================
// SHARED AVATAR PREVIEW COMPONENT (EXACT BRAND LOGO PREVIEW SYNTAX)
// =========================================================
function CreatorAvatarPreview({
  url,
  alt = "Creator Profile Picture",
  initials = "CR",
  isUploading = false,
  className = "w-20 h-20 sm:w-22 sm:h-22",
}) {
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [failedUrl, setFailedUrl] = useState(null);

  const cleanUrl = typeof url === "string" ? url.trim() : "";
  const isLoaded = Boolean(cleanUrl) && loadedUrl === cleanUrl;
  const isFailed = Boolean(cleanUrl) && failedUrl === cleanUrl;
  const isLoading = Boolean(cleanUrl) && !isLoaded && !isFailed;

  return (
    <div
      className={`relative ${className} rounded-2xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center bg-[#111111] dark:bg-[#16161e] border border-border-theme dark:border-[#262632] text-white`}
    >
      {cleanUrl && !isFailed ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-surface-muted animate-pulse flex items-center justify-center text-text-secondary/40 font-serif font-semibold text-2xl uppercase select-none tracking-wide">
              {initials}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={cleanUrl}
            src={cleanUrl}
            alt={alt}
            onLoad={() => {
              setLoadedUrl(cleanUrl);
            }}
            onError={() => {
              setFailedUrl(cleanUrl);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center select-none font-serif font-semibold text-3xl sm:text-4xl text-white tracking-wide">
          <div className="flex items-center">
            <span>{initials || "CR"}</span>
            <span className="text-xl sm:text-2xl font-light -mt-2.5 ml-0.5">⁺</span>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-1 z-10">
          <svg
            className="animate-spin h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-[10px] font-semibold">Uploading...</span>
        </div>
      )}
    </div>
  );
}

// =========================================================
// CREATOR PROFILE FORM / VIEW COMPONENT
// =========================================================
export default function CreatorProfile() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastFetchError, setLastFetchError] = useState("");

  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(
    (state) => state.profile || {}
  );
  const authUser = useSelector((state) => state.auth?.user);

  const [formData, setFormData] = useState({
    title: "",
    bio: "",
    category: "Fashion & Luxury",
    niches: [],
    keywords: [],
    location: "",
    profileImage: "",
    isPublic: true,
    socialLinks: {
      instagram: "",
      facebook: "",
      youtube: "",
      tiktok: "",
      website: "",
    },
    dob: "",
    gender: "",
    languages: [],
    ethnicity: "",
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [nicheSearch, setNicheSearch] = useState("");

  // Fetch creator profile on mount
  useEffect(() => {
    let isMounted = true;
    dispatch(getCreatorProfile()).finally(() => {
      if (isMounted) {
        setInitialFetchDone(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Sync form data whenever profile in Redux updates, unless the user is actively editing
  useEffect(() => {
    if (profile && !isEditing) {
      const initialNiches =
        Array.isArray(profile.niches) && profile.niches.length > 0
          ? profile.niches
          : profile.category
          ? [profile.category]
          : [];

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: profile.title || "",
        bio: profile.bio || "",
        category: profile.category || "Fashion & Luxury",
        niches: initialNiches,
        keywords: Array.isArray(profile.keywords) ? profile.keywords : [],
        location: profile.location || "",
        profileImage: profile.profileImage || "",
        isPublic: profile.isPublic ?? true,
        socialLinks: {
          instagram: profile.socialLinks?.instagram || "",
          facebook: profile.socialLinks?.facebook || "",
          youtube: profile.socialLinks?.youtube || "",
          tiktok: profile.socialLinks?.tiktok || "",
          website: profile.socialLinks?.website || "",
        },
        dob: formatDobForInput(profile.dob),
        gender: profile.gender || "",
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        ethnicity: profile.ethnicity || "",
      });
    }
  }, [profile, isEditing]);

  // Top-level input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Niches toggle handler (max 3) - independent of category
  const handleNicheToggle = (nicheName) => {
    setFormData((prev) => {
      const exists = prev.niches.includes(nicheName);
      if (exists) {
        const nextNiches = prev.niches.filter((n) => n !== nicheName);
        return {
          ...prev,
          niches: nextNiches,
        };
      }
      if (prev.niches.length >= 3) {
        return prev;
      }
      const nextNiches = [...prev.niches, nicheName];
      return {
        ...prev,
        niches: nextNiches,
      };
    });
  };

  // Keyword tag handlers (max 10)
  const handleAddKeyword = () => {
    const clean = keywordInput.trim().replace(/^#/, "");
    if (!clean) return;
    if (formData.keywords.includes(clean)) {
      setKeywordInput("");
      return;
    }
    if (formData.keywords.length >= 10) return;
    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, clean],
    }));
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kwToRemove) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((kw) => kw !== kwToRemove),
    }));
  };

  // Language tag handlers (max 10)
  const handleAddLanguage = () => {
    const clean = languageInput.trim();
    if (!clean) return;
    if (formData.languages.includes(clean)) {
      setLanguageInput("");
      return;
    }
    if (formData.languages.length >= 10) return;
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, clean],
    }));
    setLanguageInput("");
  };

  const handleRemoveLanguage = (langToRemove) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== langToRemove),
    }));
  };

  // Nested social links change handler
  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [name]: value,
      },
    }));
  };

  const handleToggleVisibility = () => {
    setFormData((prev) => ({
      ...prev,
      isPublic: !prev.isPublic,
    }));
  };

  // Image file selection and instant upload
  const handleFileSelect = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Please upload a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5 MB.");
      return;
    }

    setUploadError("");
    setIsUploadingImage(true);

    try {
      const uploadRes = await uploadSingleImageApi(file, "creatorlink/profiles");
      const uploadedUrl =
        uploadRes?.url ||
        uploadRes?.secure_url ||
        uploadRes?.data?.url ||
        uploadRes?.data?.secure_url;

      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          profileImage: uploadedUrl,
        }));

        if (profile && (profile._id || profile.id) && !isEditing) {
          const updatePayload = {
            profileImage: uploadedUrl,
          };
          const actionResult = await dispatch(updateCreatorProfile(updatePayload));
          if (updateCreatorProfile.fulfilled.match(actionResult)) {
            setSuccessMessage("Profile picture updated successfully!");
          }
        }
      } else {
        setUploadError("Could not retrieve uploaded image URL.");
      }
    } catch (err) {
      const errMsg = formatErrorMessage(
        err?.response?.data?.message || err?.message || err,
        "Failed to upload profile picture."
      );
      setUploadError(errMsg);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Reset form to active profile
  const handleCancel = () => {
    setIsEditing(false);
    setSaveError("");
    setUploadError("");
    setSuccessMessage("");
    setKeywordInput("");
    setLanguageInput("");
    setNicheSearch("");
    if (profile) {
      const initialNiches =
        Array.isArray(profile.niches) && profile.niches.length > 0
          ? profile.niches
          : profile.category
          ? [profile.category]
          : [];

      setFormData({
        title: profile.title || "",
        bio: profile.bio || "",
        category: profile.category || "Fashion & Luxury",
        niches: initialNiches,
        keywords: Array.isArray(profile.keywords) ? profile.keywords : [],
        location: profile.location || "",
        profileImage: profile.profileImage || "",
        isPublic: profile.isPublic ?? true,
        socialLinks: {
          instagram: profile.socialLinks?.instagram || "",
          facebook: profile.socialLinks?.facebook || "",
          youtube: profile.socialLinks?.youtube || "",
          tiktok: profile.socialLinks?.tiktok || "",
          website: profile.socialLinks?.website || "",
        },
        dob: formatDobForInput(profile.dob),
        gender: profile.gender || "",
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        ethnicity: profile.ethnicity || "",
      });
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSuccessMessage("");
    setSaveError("");
    setUploadError("");

    if (formData.title && formData.title.length > 150) {
      setSaveError("Professional headline must not exceed 150 characters.");
      return;
    }
    if (formData.bio && formData.bio.length > 1000) {
      setSaveError("Bio must not exceed 1000 characters.");
      return;
    }
    if (!formData.category || !formData.category.trim()) {
      setSaveError("Please select a primary category.");
      return;
    }
    if (formData.category.trim().length > 100) {
      setSaveError("Category must not exceed 100 characters.");
      return;
    }
    if (formData.niches && formData.niches.length > 3) {
      setSaveError("You can select a maximum of 3 niches.");
      return;
    }
    if (formData.keywords && formData.keywords.length > 10) {
      setSaveError("Keywords cannot exceed 10 tags.");
      return;
    }
    if (formData.languages && formData.languages.length > 10) {
      setSaveError("Languages cannot exceed 10 items.");
      return;
    }
    if (formData.dob && formData.dob.trim()) {
      const parsedDate = new Date(formData.dob);
      if (Number.isNaN(parsedDate.getTime())) {
        setSaveError("Please enter a valid date of birth.");
        return;
      }
      if (parsedDate > new Date()) {
        setSaveError("Date of birth cannot be in the future.");
        return;
      }
    }

    const hasExistingProfile = Boolean(profile && (profile._id || profile.id));

    const payload = {
      title: formData.title ? formData.title.trim() : "",
      bio: formData.bio ? formData.bio.trim() : "",
      category: formData.category.trim(),
      niches: Array.isArray(formData.niches) ? formData.niches : [],
      keywords: Array.isArray(formData.keywords) ? formData.keywords : [],
      location: formData.location ? formData.location.trim() : "",
      profileImage: formData.profileImage || "",
      isPublic: Boolean(formData.isPublic),
      socialLinks: {
        instagram: formData.socialLinks?.instagram ? formData.socialLinks.instagram.trim() : "",
        facebook: formData.socialLinks?.facebook ? formData.socialLinks.facebook.trim() : "",
        youtube: formData.socialLinks?.youtube ? formData.socialLinks.youtube.trim() : "",
        tiktok: formData.socialLinks?.tiktok ? formData.socialLinks.tiktok.trim() : "",
        website: formData.socialLinks?.website ? formData.socialLinks.website.trim() : "",
      },
      languages: Array.isArray(formData.languages) ? formData.languages : [],
      ethnicity: formData.ethnicity ? formData.ethnicity.trim() : "",
    };

    // Persist or clear optional DOB
    if (formData.dob && formData.dob.trim()) {
      const parsedDate = new Date(formData.dob);
      if (!Number.isNaN(parsedDate.getTime())) {
        payload.dob = formData.dob.trim();
      } else {
        payload.dob = null;
      }
    } else {
      payload.dob = null;
    }

    // Persist or clear optional Gender
    if (
      formData.gender &&
      ["male", "female", "non-binary", "other", "prefer_not_to_say"].includes(formData.gender)
    ) {
      payload.gender = formData.gender;
    } else {
      payload.gender = null;
    }

    try {
      setIsSubmitting(true);
      let actionResult;
      if (hasExistingProfile) {
        actionResult = await dispatch(updateCreatorProfile(payload));
      } else {
        actionResult = await dispatch(createCreatorProfile(payload));
      }

      if (
        updateCreatorProfile.fulfilled.match(actionResult) ||
        createCreatorProfile.fulfilled.match(actionResult)
      ) {
        setSuccessMessage(
          hasExistingProfile
            ? "Creator profile updated successfully!"
            : "Creator profile created successfully!"
        );
        setIsEditing(false);
      } else {
        const errMsg = formatErrorMessage(
          actionResult?.payload || error,
          hasExistingProfile
            ? "Failed to update creator profile."
            : "Failed to create creator profile."
        );
        setSaveError(errMsg);
      }
    } catch (err) {
      const errMsg = formatErrorMessage(
        err?.response?.data?.message || err?.message || err,
        "An unexpected error occurred while saving."
      );
      setSaveError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNotFoundError =
    Boolean(error) &&
    (typeof error === "string"
      ? error.toLowerCase().includes("not found")
      : typeof error === "object" && typeof error?.message === "string"
        ? error.message.toLowerCase().includes("not found")
        : false);

  const handleRetry = async () => {
    if (isRetrying || loading) return;
    try {
      setIsRetrying(true);
      setLastFetchError(
        formatErrorMessage(error, "An error occurred while loading your profile.")
      );
      const actionResult = await dispatch(getCreatorProfile());
      if (getCreatorProfile.fulfilled.match(actionResult)) {
        setLastFetchError("");
      } else if (getCreatorProfile.rejected.match(actionResult)) {
        setLastFetchError(
          formatErrorMessage(
            actionResult.payload,
            "An error occurred while loading your profile."
          )
        );
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const displayFetchError =
    (error && formatErrorMessage(error)) ||
    lastFetchError ||
    "An error occurred while loading your profile.";

  // Dynamic values falling back to reference defaults
  const creatorName = profile?.user?.name || authUser?.name || "Aarav Sharma";
  const title = profile?.title || formData.title || "";
  const category = profile?.category || formData.category || "Fashion & Luxury";
  const niches =
    Array.isArray(profile?.niches) && profile.niches.length > 0
      ? profile.niches
      : Array.isArray(formData.niches) && formData.niches.length > 0
      ? formData.niches
      : category
      ? [category]
      : [];
  const keywords =
    Array.isArray(profile?.keywords) && profile.keywords.length > 0
      ? profile.keywords
      : Array.isArray(formData.keywords)
      ? formData.keywords
      : [];
  const dob = profile?.dob || formData.dob || "";
  const gender = profile?.gender || formData.gender || "";
  const languages =
    Array.isArray(profile?.languages) && profile.languages.length > 0
      ? profile.languages
      : Array.isArray(formData.languages)
      ? formData.languages
      : [];
  const ethnicity = profile?.ethnicity || formData.ethnicity || "";
  const location = profile?.location || formData.location || "Mumbai, India";
  const displayEmail = profile?.user?.email || authUser?.email || "creator@creatorlink.io";
  const websiteUrl = profile?.socialLinks?.website || formData.socialLinks?.website || "https://aaravsharma.me";
  const displayInitial = getCreatorDisplayInitial(creatorName);
  const bio =
    profile?.bio ||
    formData.bio ||
    "Digital creator, fashion enthusiast, and creative visual storyteller collaborating with modern brands. Passionate about curating high-aesthetic lifestyle content and connecting authentic audiences with innovative products.";
  const instagramUrl = profile?.socialLinks?.instagram || formData.socialLinks?.instagram || "https://instagram.com/aaravsharma";
  const youtubeUrl = profile?.socialLinks?.youtube || formData.socialLinks?.youtube || "https://youtube.com/@aaravsharma";
  const tiktokUrl = profile?.socialLinks?.tiktok || formData.socialLinks?.tiktok || "https://tiktok.com/@aaravsharma";
  const facebookUrl = profile?.socialLinks?.facebook || formData.socialLinks?.facebook || "https://facebook.com/aaravsharma";
  const followerCount = profile?.followerCount || 128000;
  const engagementRate = profile?.engagementRate ? `${profile.engagementRate}%` : "4.8%";
  const collaborationsCount = profile?.collaborationsCount || profile?.completedCampaignsCount || 24;
  const isPublic = profile?.isPublic ?? formData.isPublic ?? true;
  const joinedOn = formatJoinedDate(profile?.createdAt || authUser?.createdAt);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Hidden File Input for Avatar Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload creator profile image file"
      />

      {/* Sidebar Component */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar Component */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Profile Main Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 max-w-[1400px] w-full mx-auto min-w-0">

          {/* Section Heading */}
          {isEditing ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-theme/60">
              <div className="flex items-start sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-2 -ml-2 rounded-xl text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                  title="Back to profile"
                  aria-label="Back to profile"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-foreground tracking-wide">
                    Creator Profile
                  </h1>
                  <p className="text-xs sm:text-sm text-text-secondary mt-0.5 font-sans">
                    Update your public creator identity, social channels, and marketplace visibility.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 font-sans">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting || isUploadingImage}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-border-theme bg-white dark:bg-[#16161e] hover:bg-slate-50 dark:hover:bg-surface-muted text-slate-900 dark:text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploadingImage}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-900 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4 text-white" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-2">
                <span className="font-semibold text-[11px] tracking-wider uppercase text-text-secondary font-sans inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>ACCOUNT MANAGEMENT</span>
                </span>
              </div>
              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-slate-900 dark:text-foreground tracking-wide">
                Creator Profile
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 font-sans">
                Manage your public creator identity, social channels, and marketplace visibility.
              </p>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl p-4 text-xs font-sans flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="text-emerald-500/70 hover:text-emerald-500 text-xs font-semibold cursor-pointer ml-2"
                aria-label="Dismiss success message"
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload Error Banner */}
          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-xs font-sans flex items-center justify-between">
              <span>{formatErrorMessage(uploadError, "Failed to upload image.")}</span>
              <button
                type="button"
                onClick={() => setUploadError("")}
                className="text-red-500/70 hover:text-red-500 text-xs font-semibold cursor-pointer ml-2"
                aria-label="Dismiss upload error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Save Error Banner */}
          {saveError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-xs font-sans flex items-center justify-between">
              <span>{formatErrorMessage(saveError, "Failed to save profile.")}</span>
              <button
                type="button"
                onClick={() => setSaveError("")}
                className="text-red-500/70 hover:text-red-500 text-xs font-semibold cursor-pointer ml-2"
                aria-label="Dismiss save error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Profile Fetch Error Banner with Retry */}
          {(error || isRetrying) && !isNotFoundError && !profile && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-xs font-sans flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>{displayFetchError}</span>
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying || loading}
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-[#111111] hover:bg-black text-red-400 border border-red-500/30 hover:border-red-500/50 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying || loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-red-500/40 border-t-red-500 rounded-full animate-spin" />
                    <span>Retrying...</span>
                  </span>
                ) : (
                  <span>Retry</span>
                )}
              </button>
            </div>
          )}

          {/* Initial Loading Skeleton */}
          {loading && !profile && !initialFetchDone && !isRetrying && (
            <div className="space-y-6 animate-pulse">
              <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-surface-muted shrink-0" />
                <div className="space-y-2 flex-1 w-full">
                  <div className="h-7 w-48 bg-surface-muted rounded-lg" />
                  <div className="h-4 w-72 bg-surface-muted rounded-md" />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW MODE: EXACT REFERENCE SYNTAX (PINK ACCENTS & CLEAN CARDS) */}
          {/* ========================================================= */}
          {!isEditing && (
            <div className="space-y-6">

              {/* 1. HERO BANNER CARD */}
              <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xs">
                {/* Ambient pink accent glow in top right corner */}
                <div className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-br from-secondary/20 via-secondary/5 to-transparent blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Avatar + Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
                    {/* Creator Avatar with Camera Button */}
                    <div className="relative shrink-0 self-start sm:self-auto">
                      <CreatorAvatarPreview
                        url={profile?.profileImage}
                        alt={creatorName}
                        initials={displayInitial}
                        isUploading={isUploadingImage}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        aria-label="Change profile picture"
                        title="Change profile picture"
                        className={`absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#111111] hover:bg-black text-white border border-[#2a2a36] hover:border-secondary/50 shadow-md transition-all cursor-pointer ${
                          isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <CameraIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Info: Name, Title, Location/Date, Badges */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-foreground tracking-wide truncate">
                          {creatorName}
                        </h2>
                        <CheckBadgeIcon className="w-5 h-5 text-secondary shrink-0" />
                      </div>

                      {title && (
                        <p className="text-sm sm:text-base font-normal text-text-secondary font-sans leading-snug">
                          {title}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-text-secondary pt-0.5">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                          <span>{location}</span>
                        </span>
                        <span className="text-border-theme">•</span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                          <span>Joined {joinedOn}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isPublic
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          <CheckIcon className="w-3 h-3 shrink-0" />
                          <span>{isPublic ? "Profile Active" : "Profile Private"}</span>
                        </span>

                        {/* Role / Category Badge */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30">
                          <SparklesIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{category || "Creator"}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Edit Profile Button */}
                  <div className="shrink-0 self-start md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessMessage("");
                        setSaveError("");
                        setUploadError("");
                        setIsEditing(!isEditing);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white border border-[#2a2a36] hover:border-secondary/50 text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
                    >
                      <PencilIcon className="w-4 h-4 text-white" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. TWO-COLUMN MAIN CONTENT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

                {/* LEFT COLUMN: 7 COLS on lg */}
                <div className="lg:col-span-7 space-y-5 sm:space-y-6">

                  {/* Card 1: About Me */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-2.5">
                      <UserIcon className="w-4 h-4 text-black dark:text-white" />
                      <h3 className="font-semibold text-base text-slate-900 dark:text-foreground font-sans tracking-wide">
                        About Me
                      </h3>
                    </div>

                    {/* Bio paragraph */}
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans whitespace-pre-line">
                      {bio}
                    </p>

                    {/* Niches Subsection */}
                    <div className="pt-3 border-t border-border-theme/60 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <LayersIcon className="w-4 h-4 text-black dark:text-white" />
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground font-sans">
                          Niches
                        </span>
                        {niches.length > 0 && (
                          <span className="text-xs text-text-secondary font-sans">({niches.length})</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {niches.length > 0 ? (
                          niches.map((niche) => (
                            <span
                              key={niche}
                              className="px-3.5 py-1 rounded-xl text-xs font-medium bg-secondary/15 text-secondary border border-secondary/30 font-sans"
                            >
                              {niche}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-text-secondary font-sans">No niches selected</span>
                        )}
                      </div>
                    </div>

                    {/* Keywords Subsection */}
                    <div className="pt-3 border-t border-border-theme/60 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-black dark:text-white" />
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground font-sans">
                          Keywords
                        </span>
                        {keywords.length > 0 && (
                          <span className="text-xs text-text-secondary font-sans">({keywords.length})</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {keywords.length > 0 ? (
                          keywords.map((kw) => (
                            <span
                              key={kw}
                              className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-muted text-text-secondary border border-border-theme hover:border-secondary/30 transition-colors font-sans"
                            >
                              #{kw.replace(/^#/, "")}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-text-secondary font-sans">No keywords specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Stats Grid Card */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-5 sm:p-6 shadow-xs">
                    <div className="grid grid-cols-3 divide-x divide-border-theme">
                      {/* Followers */}
                      <div className="text-center px-2">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-secondary/10 flex items-center justify-center text-black dark:text-white">
                          <UsersIcon className="w-4 h-4" />
                        </div>
                        <span className="block text-xl sm:text-2xl font-bold font-sans text-slate-900 dark:text-foreground">
                          {formatNumber(followerCount)}
                        </span>
                        <span className="block text-xs text-text-secondary mt-1 font-sans">Followers</span>
                      </div>

                      {/* Engagement */}
                      <div className="text-center px-2">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-secondary/10 flex items-center justify-center text-black dark:text-white">
                          <ChartBarIcon className="w-4 h-4" />
                        </div>
                        <span className="block text-xl sm:text-2xl font-bold font-sans text-slate-900 dark:text-foreground">
                          {engagementRate}
                        </span>
                        <span className="block text-xs text-text-secondary mt-1 font-sans">Engagement</span>
                      </div>

                      {/* Collaborations */}
                      <div className="text-center px-2">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-secondary/10 flex items-center justify-center text-black dark:text-white">
                          <HandshakeIcon className="w-4 h-4" />
                        </div>
                        <span className="block text-xl sm:text-2xl font-bold font-sans text-slate-900 dark:text-foreground">
                          {collaborationsCount || 24}
                        </span>
                        <span className="block text-xs text-text-secondary mt-1 font-sans">Collaborations</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: 5 COLS on lg */}
                <div className="lg:col-span-5 space-y-5 sm:space-y-6">

                  {/* Card 3: Identity & Demographics */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <LockClosedIcon className="w-4 h-4 text-black dark:text-white" />
                        <h3 className="font-semibold text-base text-slate-900 dark:text-foreground font-sans tracking-wide">
                          Identity & Demographics
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-secondary/15 text-secondary border border-secondary/30 font-sans">
                        <ShieldCheckIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>Private & Confidential</span>
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed font-sans">
                      This information is only used for campaign matching and is never shown on your public profile.
                    </p>

                    {/* Rows */}
                    <div className="space-y-3.5 pt-2 font-sans text-xs">
                      {/* Date of Birth */}
                      <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-theme/40">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <CalendarIcon className="w-4 h-4 text-black dark:text-white" />
                          <span className="font-medium">Date of Birth</span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-foreground text-right">
                          {formatDobForDisplay(dob)}
                        </span>
                      </div>

                      {/* Gender */}
                      <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-theme/40">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <GenderIcon className="w-4 h-4 text-black dark:text-white" />
                          <span className="font-medium">Gender</span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-foreground capitalize text-right">
                          {gender ? getGenderDisplay(gender) : "Not specified"}
                        </span>
                      </div>

                      {/* Languages */}
                      <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-theme/40 flex-wrap">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <GlobeIcon className="w-4 h-4 text-black dark:text-white" />
                          <span className="font-medium">Languages</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {languages.length > 0 ? (
                            languages.map((lang) => (
                              <span
                                key={lang}
                                className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-surface-muted text-text-secondary border border-border-theme"
                              >
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="font-medium text-slate-900 dark:text-foreground">Not specified</span>
                          )}
                        </div>
                      </div>

                      {/* Ethnicity */}
                      <div className="flex items-center justify-between gap-3 py-1.5">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <UserGroupIcon className="w-4 h-4 text-black dark:text-white" />
                          <span className="font-medium">Ethnicity / Cultural Background</span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-foreground text-right">
                          {ethnicity || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Contact & Location */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-2.5">
                      <MapPinIcon className="w-4 h-4 text-black dark:text-white" />
                      <h3 className="font-semibold text-base text-slate-900 dark:text-foreground font-sans tracking-wide">
                        Contact & Location
                      </h3>
                    </div>

                    {/* Rows */}
                    <div className="space-y-3.5 font-sans text-xs">
                      <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-theme/40">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <MapPinIcon className="w-4 h-4 text-black dark:text-white" />
                          <span className="font-medium">Location</span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-foreground text-right">{location}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-theme/40">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <MailIcon className="w-4 h-4 text-black dark:text-white" />
                          <span className="font-medium">Email</span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-foreground text-right truncate max-w-[220px]">
                          {displayEmail}
                        </span>
                      </div>

                      {/* Connected Socials / Website (if available) */}
                      {(websiteUrl || instagramUrl || youtubeUrl || tiktokUrl || facebookUrl) && (
                        <div className="pt-2 space-y-2">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary block">
                            Connected Channels
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {websiteUrl && (
                              <a
                                href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-secondary/10 text-text-secondary hover:text-secondary border border-border-theme hover:border-secondary/30 transition-all text-xs"
                              >
                                <GlobeIcon className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[140px]">{websiteUrl.replace(/^https?:\/\//, "")}</span>
                                <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                            {instagramUrl && (
                              <a
                                href={instagramUrl.startsWith("http") ? instagramUrl : `https://instagram.com/${instagramUrl.replace(/^@/, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-secondary/10 text-text-secondary hover:text-secondary border border-border-theme hover:border-secondary/30 transition-all text-xs"
                              >
                                <InstagramIcon className="w-3.5 h-3.5" />
                                <span>Instagram</span>
                                <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                            {youtubeUrl && (
                              <a
                                href={youtubeUrl.startsWith("http") ? youtubeUrl : `https://youtube.com/@${youtubeUrl.replace(/^@/, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-secondary/10 text-text-secondary hover:text-secondary border border-border-theme hover:border-secondary/30 transition-all text-xs"
                              >
                                <YoutubeIcon className="w-3.5 h-3.5" />
                                <span>YouTube</span>
                                <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                            {tiktokUrl && (
                              <a
                                href={tiktokUrl.startsWith("http") ? tiktokUrl : `https://tiktok.com/@${tiktokUrl.replace(/^@/, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-secondary/10 text-text-secondary hover:text-secondary border border-border-theme hover:border-secondary/30 transition-all text-xs"
                              >
                                <TiktokIcon className="w-3.5 h-3.5" />
                                <span>TikTok</span>
                                <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                            {facebookUrl && (
                              <a
                                href={facebookUrl.startsWith("http") ? facebookUrl : `https://facebook.com/${facebookUrl.replace(/^@/, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-secondary/10 text-text-secondary hover:text-secondary border border-border-theme hover:border-secondary/30 transition-all text-xs"
                              >
                                <FacebookIcon className="w-3.5 h-3.5" />
                                <span>Facebook</span>
                                <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* EDIT MODE: FULL CREATOR PROFILE FORM (MATCHING REFERENCE UI) */}
          {/* ========================================================= */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* CARD 1: Creator Identity & Bio */}
              <div className="bg-white dark:bg-[#131318] border border-slate-200/90 dark:border-[#22222e] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
                
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border-theme/60 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-surface-muted dark:bg-[#1f1f28] flex items-center justify-center text-black dark:text-white shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground font-sans tracking-wide">
                      Creator Identity & Bio
                    </h2>
                    <p className="text-xs text-text-secondary font-sans mt-0.5">
                      Basic information about your creator identity, niche, and profile photo.
                    </p>
                  </div>
                </div>

                {/* Top Section: Avatar + Headline & Category */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                  
                  {/* Left: Avatar with Camera button + Upload & URL */}
                  <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative shrink-0">
                      <CreatorAvatarPreview
                        url={formData.profileImage}
                        alt={creatorName}
                        initials={displayInitial}
                        isUploading={isUploadingImage}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        aria-label="Upload profile image"
                        title="Upload profile image"
                        className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <CameraIcon className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-neutral-900 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          <UploadIcon className="w-3.5 h-3.5 text-white" />
                          <span>{isUploadingImage ? "Uploading..." : "Upload Profile Photo"}</span>
                        </button>

                        <span className="text-xs text-text-secondary">or</span>

                        <div className="relative flex-1 min-w-[170px]">
                          <LinkIcon className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="url"
                            name="profileImage"
                            value={formData.profileImage}
                            onChange={handleInputChange}
                            placeholder="Paste image URL"
                            disabled={isUploadingImage}
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                          />
                        </div>

                        {formData.profileImage ? (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, profileImage: "" }))}
                            disabled={isUploadingImage}
                            className="px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>

                      <p className="text-[11px] text-text-secondary">
                        JPEG, PNG or WebP (max 5 MB)
                      </p>
                    </div>
                  </div>

                  {/* Right: Headline and Primary Category */}
                  <div className="lg:col-span-6 space-y-3.5">
                    
                    {/* Professional Headline */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="profile-title"
                          className="block text-xs font-semibold text-foreground uppercase tracking-wider"
                        >
                          Professional Headline / Title
                        </label>
                        <span className="text-[11px] text-text-secondary">
                          {formData.title ? formData.title.length : 0}/150
                        </span>
                      </div>
                      <input
                        id="profile-title"
                        type="text"
                        name="title"
                        maxLength={150}
                        disabled={isSubmitting}
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Luxury Fashion & Editorial Visual Creator"
                        className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                      />
                    </div>

                    {/* Primary Category */}
                    <div className="space-y-1">
                      <label
                        htmlFor="profile-category"
                        className="block text-xs font-semibold text-foreground uppercase tracking-wider"
                      >
                        Primary Category *
                      </label>
                      <select
                        id="profile-category"
                        name="category"
                        disabled={isSubmitting}
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-surface border border-secondary/60 text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors cursor-pointer"
                      >
                        <option value="">Select Primary Category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                        {formData.category &&
                          !CATEGORIES.some((c) => c.name === formData.category) && (
                            <option value={formData.category}>
                              {formData.category}
                            </option>
                          )}
                      </select>
                    </div>

                  </div>
                </div>

                {/* Location and Bio row (preserving full data and functionality) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-theme/60 font-sans">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai, India"
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Creator Bio / Story
                    </label>
                    <textarea
                      name="bio"
                      rows={2}
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Brief description of your content aesthetic and niche..."
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors resize-y"
                    />
                  </div>
                </div>

                {/* Section: Niches (Select up to 3) */}
                <div className="space-y-3 pt-3 border-t border-border-theme/60 font-sans">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Niches (Select up to 3) *
                    </label>
                    <span className="text-xs font-semibold text-secondary">
                      {formData.niches.length}/3 selected
                    </span>
                  </div>

                  {/* Taxonomy Filter Bar */}
                  <div className="relative">
                    <SearchIcon className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      disabled={isSubmitting}
                      value={nicheSearch}
                      onChange={(e) => setNicheSearch(e.target.value)}
                      placeholder="Filter niche options by name or description..."
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                    />
                    {nicheSearch && (
                      <button
                        type="button"
                        onClick={() => setNicheSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground text-xs p-0.5 cursor-pointer"
                        aria-label="Clear niche search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Niche Grid (3 columns on desktop matching reference image) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {CATEGORIES.filter((cat) => {
                      if (!nicheSearch.trim()) return true;
                      const term = nicheSearch.toLowerCase();
                      return (
                        cat.name.toLowerCase().includes(term) ||
                        cat.desc.toLowerCase().includes(term)
                      );
                    }).map((cat) => {
                      const isSelected = formData.niches.includes(cat.name);
                      const Icon = cat.icon;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleNicheToggle(cat.name)}
                          className={`group relative text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-[#ffeef3] dark:bg-secondary/15 border-secondary/60 text-foreground shadow-xs ring-1 ring-secondary/30"
                              : "bg-white dark:bg-surface border-border-theme hover:bg-slate-50 dark:hover:bg-surface-muted hover:border-secondary/40 text-foreground"
                          } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-1 rounded-lg text-black dark:text-white shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-sm font-semibold truncate text-foreground">
                                {cat.name}
                              </h3>
                              <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5 leading-snug">
                                {cat.desc}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                              <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Content Keywords & Search Tags */}
                <div className="space-y-3 pt-3 border-t border-border-theme/60 font-sans">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Content Keywords & Search Tags
                    </label>
                    <span className="text-[11px] text-text-secondary">
                      {formData.keywords.length}/10 tags
                    </span>
                  </div>

                  {/* Active Tag Chips */}
                  {formData.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffeef3] dark:bg-secondary/20 border border-secondary/40 text-secondary text-xs font-semibold"
                        >
                          <span>#{kw}</span>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleRemoveKeyword(kw)}
                            className="hover:opacity-70 cursor-pointer ml-0.5"
                            aria-label={`Remove keyword ${kw}`}
                          >
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tag Input Form */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon className="w-4 h-4 text-black dark:text-white absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        disabled={isSubmitting}
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                        placeholder="Type a tag (e.g. streetwear, luxury, ootd) and press Enter"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors disabled:opacity-60"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      disabled={isSubmitting || !keywordInput.trim() || formData.keywords.length >= 10}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-900 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <PlusIcon className="w-4 h-4 text-white" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Suggested Keyword Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-text-secondary mr-1">
                      Popular suggestions:
                    </span>
                    {SUGGESTED_KEYWORDS.map((sug) => {
                      const isAdded = formData.keywords.includes(sug);
                      return (
                        <button
                          key={sug}
                          type="button"
                          disabled={isSubmitting || isAdded || formData.keywords.length >= 10}
                          onClick={() => {
                            if (!isAdded && formData.keywords.length < 10) {
                              setFormData((prev) => ({
                                ...prev,
                                keywords: [...prev.keywords, sug],
                              }));
                            }
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            isAdded
                              ? "bg-[#ffeef3] dark:bg-secondary/10 border-secondary/30 text-secondary cursor-default opacity-60"
                              : "bg-white dark:bg-surface border-border-theme text-text-secondary hover:text-foreground hover:border-secondary/40 cursor-pointer"
                          }`}
                        >
                          + {sug}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* TWO-COLUMN GRID: Cards 2 & 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start font-sans">
                
                {/* CARD 2: Identity & Demographics */}
                <div className="bg-white dark:bg-[#131318] border border-slate-200/90 dark:border-[#22222e] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between gap-3 border-b border-border-theme/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-muted dark:bg-[#1f1f28] flex items-center justify-center text-black dark:text-white shrink-0">
                        <UserGroupIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground font-sans tracking-wide">
                          Identity & Demographics
                        </h2>
                        <p className="text-xs text-text-secondary font-sans mt-0.5">
                          Provide demographic background and language proficiencies for brand campaign matching.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-slate-900 dark:text-foreground font-sans shrink-0">
                      <LockClosedIcon className="w-3 h-3 text-black dark:text-white shrink-0" />
                      <span>Kept Confidential</span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* DATE OF BIRTH */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="dob"
                        className="block text-xs font-semibold text-foreground uppercase tracking-wider"
                      >
                        Date of Birth
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-black dark:text-white pointer-events-none">
                          <CalendarIcon className="w-4 h-4" />
                        </span>
                        <input
                          id="dob"
                          name="dob"
                          type="date"
                          disabled={isSubmitting}
                          max={new Date().toISOString().split("T")[0]}
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-all cursor-pointer disabled:opacity-60"
                        />
                      </div>
                    </div>

                    {/* GENDER IDENTITY */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        Gender Identity
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {GENDER_OPTIONS.map((g) => {
                          const isSelected = formData.gender === g.id;
                          const Icon = g.icon;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  gender: prev.gender === g.id ? "" : g.id,
                                }));
                              }}
                              className={`px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected
                                  ? "bg-[#ffeef3] dark:bg-secondary/15 border-secondary/60 text-foreground ring-1 ring-secondary/30"
                                  : "bg-white dark:bg-surface border-border-theme hover:border-secondary/40 text-foreground"
                              } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon className="w-4 h-4 text-black dark:text-white shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold truncate text-foreground">
                                  {g.label}
                                </span>
                              </div>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                                  <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Languages & Ethnicity */}
                <div className="bg-white dark:bg-[#131318] border border-slate-200/90 dark:border-[#22222e] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between gap-3 border-b border-border-theme/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-muted dark:bg-[#1f1f28] flex items-center justify-center text-black dark:text-white shrink-0">
                        <GlobeIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground font-sans tracking-wide">
                          Languages (Spoken & Content)
                        </h2>
                      </div>
                    </div>
                    <span className="text-xs text-text-secondary font-medium shrink-0">
                      {formData.languages.length}/10 selected
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Active Language Chips */}
                    {formData.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.languages.map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffeef3] dark:bg-secondary/20 border border-secondary/40 text-secondary text-xs font-semibold"
                          >
                            <span>{lang}</span>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleRemoveLanguage(lang)}
                              className="hover:opacity-70 cursor-pointer ml-0.5"
                              aria-label={`Remove language ${lang}`}
                            >
                              <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Language Input Form */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <SearchIcon className="w-4 h-4 text-black dark:text-white absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={languageInput}
                          onChange={(e) => setLanguageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddLanguage();
                            }
                          }}
                          placeholder="Type a language (e.g. English, Hindi, Spanish) and press Enter"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors disabled:opacity-60"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddLanguage}
                        disabled={isSubmitting || !languageInput.trim() || formData.languages.length >= 10}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-900 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        <PlusIcon className="w-4 h-4 text-white" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Suggested Language Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-text-secondary mr-1">
                        Popular suggestions:
                      </span>
                      {POPULAR_LANGUAGES.map((lang) => {
                        const isAdded = formData.languages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            disabled={isSubmitting || isAdded || formData.languages.length >= 10}
                            onClick={() => {
                              if (!isAdded && formData.languages.length < 10) {
                                setFormData((prev) => ({
                                  ...prev,
                                  languages: [...prev.languages, lang],
                                }));
                              }
                            }}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                              isAdded
                                ? "bg-[#ffeef3] dark:bg-secondary/10 border-secondary/30 text-secondary cursor-default opacity-60"
                                : "bg-white dark:bg-surface border-border-theme text-text-secondary hover:text-foreground hover:border-secondary/40 cursor-pointer"
                            }`}
                          >
                            + {lang}
                          </button>
                        );
                      })}
                    </div>

                    {/* ETHNICITY / CULTURAL BACKGROUND (OPTIONAL) */}
                    <div className="space-y-1.5 pt-3 border-t border-border-theme/60">
                      <label
                        htmlFor="ethnicity"
                        className="block text-xs font-semibold text-foreground uppercase tracking-wider"
                      >
                        Ethnicity / Cultural Background (Optional)
                      </label>

                      <select
                        id="ethnicity"
                        disabled={isSubmitting}
                        value={
                          ETHNICITY_OPTIONS.includes(formData.ethnicity)
                            ? formData.ethnicity
                            : formData.ethnicity
                            ? "Other"
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "Other") {
                            setFormData((prev) => ({
                              ...prev,
                              ethnicity:
                                prev.ethnicity && !ETHNICITY_OPTIONS.includes(prev.ethnicity)
                                  ? prev.ethnicity
                                  : "Other",
                            }));
                          } else {
                            setFormData((prev) => ({ ...prev, ethnicity: val }));
                          }
                        }}
                        className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <option value="">Select ethnicity (optional) / Prefer not to disclose</option>
                        {ETHNICITY_OPTIONS.map((eth) => (
                          <option key={eth} value={eth}>
                            {eth}
                          </option>
                        ))}
                        <option value="Other">Other / Self-described</option>
                      </select>

                      {/* If Other or custom */}
                      {(formData.ethnicity === "Other" ||
                        (formData.ethnicity && !ETHNICITY_OPTIONS.includes(formData.ethnicity))) && (
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={formData.ethnicity === "Other" ? "" : formData.ethnicity}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, ethnicity: e.target.value }))
                          }
                          placeholder="Please describe your cultural background or identity"
                          className="w-full mt-2 bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                        />
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* CARD 4: Social Channels & Links */}
              <div className="bg-white dark:bg-[#131318] border border-slate-200/90 dark:border-[#22222e] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-border-theme/60 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-surface-muted dark:bg-[#1f1f28] flex items-center justify-center text-black dark:text-white shrink-0">
                    <ShareIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground font-sans tracking-wide">
                      Social Channels & Links
                    </h2>
                    <p className="text-xs text-text-secondary font-sans mt-0.5">
                      Connect your social media handles and online portfolio
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 font-sans">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Instagram */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        Instagram
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-black dark:text-white pointer-events-none">
                          <InstagramIcon className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          name="instagram"
                          value={formData.socialLinks.instagram}
                          onChange={handleSocialChange}
                          placeholder="https://www.instagram.com/yourhandle"
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                        />
                      </div>
                    </div>

                    {/* TikTok */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        TikTok
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-black dark:text-white pointer-events-none">
                          <TiktokIcon className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          name="tiktok"
                          value={formData.socialLinks.tiktok}
                          onChange={handleSocialChange}
                          placeholder="https://tiktok.com/@yourhandle"
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Website / Media Kit URL */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        Website / Media Kit URL
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-black dark:text-white pointer-events-none">
                          <LinkIcon className="w-4 h-4" />
                        </span>
                        <input
                          type="url"
                          name="website"
                          value={formData.socialLinks.website}
                          onChange={handleSocialChange}
                          placeholder="https://yourportfolio.com or linktr.ee/..."
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* YouTube */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        YouTube
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-black dark:text-white pointer-events-none">
                          <YoutubeIcon className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          name="youtube"
                          value={formData.socialLinks.youtube}
                          onChange={handleSocialChange}
                          placeholder="https://youtube.com/@yourchannel"
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Facebook */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        Facebook
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-black dark:text-white pointer-events-none">
                          <FacebookIcon className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          name="facebook"
                          value={formData.socialLinks.facebook}
                          onChange={handleSocialChange}
                          placeholder="https://facebook.com/yourprofile"
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs sm:text-sm rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 5: Public Profile Visibility */}
              <div className="bg-white dark:bg-[#131318] border border-slate-200/90 dark:border-[#22222e] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-muted dark:bg-[#1f1f28] flex items-center justify-center text-black dark:text-white shrink-0">
                      <EyeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground tracking-wide font-sans">
                        Public Profile Visibility
                      </h3>
                      <p className="text-xs text-text-secondary font-sans mt-0.5">
                        {formData.isPublic
                          ? "Your profile is discoverable by brands searching for creators on CreatorLink."
                          : "Your profile is hidden from public brand discovery and search results."}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={handleToggleVisibility}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.isPublic ? "bg-black" : "bg-slate-300 dark:bg-neutral-700"
                    }`}
                    role="switch"
                    aria-checked={formData.isPublic}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        formData.isPublic ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Bottom Action Buttons (Cancel & Save Changes) */}
              <div className="flex items-center justify-end gap-3 pt-2 font-sans">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting || isUploadingImage}
                  className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-border-theme bg-white dark:bg-[#16161e] hover:bg-slate-50 dark:hover:bg-surface-muted text-slate-900 dark:text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="inline-flex items-center justify-center gap-1.5 px-8 py-2.5 rounded-xl bg-black hover:bg-neutral-900 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4 text-white" />
                      <span>{profile ? "Save Changes" : "Save Profile"}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </main>
      </div>
    </div>
  );
}
