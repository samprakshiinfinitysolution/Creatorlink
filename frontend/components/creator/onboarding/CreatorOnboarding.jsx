/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  getCreatorProfile,
  createCreatorProfile,
  updateCreatorProfile,
} from "@/redux/creator/profile/profile_slice";
import {
  getPortfolios,
  deletePortfolioItem,
} from "@/redux/creator/portfolio/portfolio_slice";
import PortfolioFormModal from "@/components/creator/portfolio/PortfolioFormModal";
import {
  getServices,
  deleteCreatorService,
} from "@/redux/creator/services/services_slice";
import ServiceFormModal, {
  getDeliverablesList,
  formatPrice,
  getPlatformLabel,
  getContentTypeLabel,
  ServiceCardCover,
} from "@/components/creator/services/ServiceFormModal";
import { uploadSingleImageApi } from "@/lib/upload";

// =========================================================
// ERROR FORMATTER HELPER
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
  }
  return String(err) || fallback;
}

// =========================================================
// CREATOR TAXONOMY & CONSTANTS
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

const POPULAR_LOCATIONS = [
  "Mumbai, Maharashtra",
  "Delhi NCR, India",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Goa, India",
  "Remote / Worldwide",
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

// 4-Step Onboarding Definition matching user requirement
const STEPS_META = [
  { number: 1, title: "Profile Info", subtitle: "Identity & Demographics" },
  { number: 2, title: "Portfolio", subtitle: "Visual Showcase" },
  { number: 3, title: "Services", subtitle: "Packages & Rates" },
  { number: 4, title: "Payment Details", subtitle: "Payout & Complete" },
];

const GENDER_OPTIONS = [
  { id: "male", label: "Male", desc: "He / Him" },
  { id: "female", label: "Female", desc: "She / Her" },
  { id: "non-binary", label: "Non-binary", desc: "They / Them / Enby" },
  { id: "other", label: "Other", desc: "Self-described identity" },
  { id: "prefer_not_to_say", label: "Prefer not to say", desc: "Keep private" },
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

// =========================================================
// SVG ICONS
// =========================================================
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

function GlobeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM2.25 12h19.5M12 2.25a15.3 15.3 0 014.5 9.75 15.3 15.3 0 01-4.5 9.75 15.3 15.3 0 01-4.5-9.75A15.3 15.3 0 0112 2.25z" />
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

function CameraIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
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

function CalendarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    </svg>
  );
}

function MapPinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
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

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
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

function PencilIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

function XTwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function UserIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function BanknotesIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}


function getPlatformIcon(platform) {
  switch (platform) {
    case "instagram":
      return <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />;
    case "youtube":
      return <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />;
    case "tiktok":
      return <TiktokIcon className="w-3.5 h-3.5 text-foreground" />;
    case "facebook":
      return <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />;
    case "multiple":
      return <SquaresIcon className="w-3.5 h-3.5 text-secondary" />;
    case "website":
      return <GlobeIcon className="w-3.5 h-3.5 text-secondary" />;
    default:
      return <SparklesIcon className="w-3.5 h-3.5 text-secondary" />;
  }
}

// =========================================================
// MAIN CREATOR ONBOARDING COMPONENT
// =========================================================
export default function CreatorOnboarding() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { profile } = useSelector((state) => state.profile || {});
  const { portfolios } = useSelector((state) => state.portfolio || {});
  const { services } = useSelector((state) => state.services || {});

  // Current onboarding step (1 = Profile Info, 2 = Portfolio, 3 = Services, 4 = Payment Details)
  const [currentStep, setCurrentStep] = useState(1);

  // Consolidated Step 1 form data (Basic Info + Demographics)
  const [formData, setFormData] = useState({
    profileImage: "",
    title: "",
    bio: "",
    category: "",
    keywords: [],
    niches: [],
    location: "",
    socialLinks: {
      instagram: "",
      youtube: "",
      facebook: "",
      tiktok: "",
      twitter: "",
      website: "",
    },
    dob: "",
    gender: "",
    languages: [],
    ethnicity: "",
  });

  // Step 4: Payment Details form data
  const [payoutData, setPayoutData] = useState({
    payoutType: "upi", // 'upi' or 'bank'
    upiId: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
  });

  // Profile image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Tag inputs & search
  const [keywordInput, setKeywordInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [nicheSearch, setNicheSearch] = useState("");

  const [validationError, setValidationError] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [deletingServiceId, setDeletingServiceId] = useState(null);
  const isMountedRef = useRef(true);

  // Step completion status derived from actual saved Redux data
  const hasValidSavedSocialLink = Boolean(
    profile?.socialLinks &&
      Object.values(profile.socialLinks).some(
        (link) => typeof link === "string" && link.trim().length > 0
      )
  );

  const isStep1Done = Boolean(
    profile &&
      typeof profile.title === "string" &&
      profile.title.trim().length > 0 &&
      typeof profile.bio === "string" &&
      profile.bio.trim().length > 0 &&
      typeof profile.category === "string" &&
      profile.category.trim().length > 0 &&
      Array.isArray(profile.niches) &&
      profile.niches.length > 0 &&
      Array.isArray(profile.keywords) &&
      profile.keywords.length > 0 &&
      typeof profile.location === "string" &&
      profile.location.trim().length > 0 &&
      profile.dob &&
      typeof profile.gender === "string" &&
      profile.gender.trim().length > 0 &&
      Array.isArray(profile.languages) &&
      profile.languages.length > 0 &&
      hasValidSavedSocialLink
  );

  const isStep2Done = Array.isArray(portfolios) && portfolios.length > 0;

  const isStep3Done =
    Array.isArray(services) &&
    services.some((s) => s && (s._id || s.id) && s.isActive !== false);

  const isStep4Done = Boolean(profile?.isOnboarded);

  const isStepCompleted = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return isStep1Done;
      case 2:
        return isStep2Done;
      case 3:
        return isStep3Done;
      case 4:
        return isStep4Done;
      default:
        return false;
    }
  };

  // Image upload handler
  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageUploadError("Please upload a valid image file (JPEG, PNG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image size must be less than 5 MB.");
      return;
    }

    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const uploadRes = await uploadSingleImageApi(file, "creatorlink/profiles");
      const uploadedUrl =
        uploadRes?.url ||
        uploadRes?.secure_url ||
        uploadRes?.data?.url ||
        uploadRes?.data?.secure_url;

      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, profileImage: uploadedUrl }));
        // If profile already exists, update immediately
        if (profile && (profile._id || profile.id)) {
          dispatch(updateCreatorProfile({ profileImage: uploadedUrl }));
        }
      } else {
        setImageUploadError("Could not retrieve uploaded image URL.");
      }
    } catch {
      setImageUploadError("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Populate data when loaded from backend
  const applyInitialDataResults = useCallback(
    ([profileResult, portfoliosResult, servicesResult]) => {
      if (!isMountedRef.current) return;

      let pStep1Done = false;
      let pStep2Done = false;
      let pStep3Done = false;

      // 1. Profile response
      if (profileResult.status === "fulfilled") {
        const p = profileResult.value?.data || profileResult.value;
        if (p) {
          if (p.isOnboarded) {
            router.replace("/creator/dashboard");
            return;
          }

          setFormData((prev) => {
            const initialNiches =
              Array.isArray(p.niches) && p.niches.length > 0
                ? p.niches
                : p.category
                ? [p.category]
                : prev.niches;

            let formattedDob = prev.dob || "";
            if (p.dob) {
              const d = new Date(p.dob);
              if (!Number.isNaN(d.getTime())) {
                formattedDob = d.toISOString().split("T")[0];
              }
            }

            return {
              profileImage: p.profileImage || prev.profileImage || "",
              title: p.title || prev.title || "",
              bio: p.bio || prev.bio || "",
              category: p.category || (Array.isArray(p.niches) && p.niches[0]) || prev.category || "",
              keywords:
                Array.isArray(p.keywords) && p.keywords.length > 0
                  ? p.keywords
                  : prev.keywords,
              niches: initialNiches,
              location: p.location || prev.location || "",
              socialLinks: {
                instagram: p.socialLinks?.instagram || prev.socialLinks.instagram || "",
                youtube: p.socialLinks?.youtube || prev.socialLinks.youtube || "",
                facebook: p.socialLinks?.facebook || prev.socialLinks.facebook || "",
                tiktok: p.socialLinks?.tiktok || prev.socialLinks.tiktok || "",
                twitter: p.socialLinks?.twitter || prev.socialLinks.twitter || "",
                website: p.socialLinks?.website || prev.socialLinks.website || "",
              },
              dob: formattedDob,
              gender: p.gender || prev.gender || "",
              languages:
                Array.isArray(p.languages) && p.languages.length > 0
                  ? p.languages
                  : prev.languages,
              ethnicity: p.ethnicity || prev.ethnicity || "",
            };
          });

          const pHasValidSocial = Boolean(
            p.socialLinks &&
              Object.values(p.socialLinks).some(
                (link) => typeof link === "string" && link.trim().length > 0
              )
          );

          pStep1Done = Boolean(
            typeof p.title === "string" &&
              p.title.trim().length > 0 &&
              typeof p.bio === "string" &&
              p.bio.trim().length > 0 &&
              typeof p.category === "string" &&
              p.category.trim().length > 0 &&
              Array.isArray(p.niches) &&
              p.niches.length > 0 &&
              Array.isArray(p.keywords) &&
              p.keywords.length > 0 &&
              typeof p.location === "string" &&
              p.location.trim().length > 0 &&
              p.dob &&
              typeof p.gender === "string" &&
              p.gender.trim().length > 0 &&
              Array.isArray(p.languages) &&
              p.languages.length > 0 &&
              pHasValidSocial
          );
        }
      } else {
        const errMsg = formatErrorMessage(profileResult.reason);
        const isNotFound = errMsg.toLowerCase().includes("not found") || errMsg.includes("404");
        if (!isNotFound) {
          setInitialLoadError((prev) =>
            prev ? `${prev} | Profile: ${errMsg}` : `Failed to load profile: ${errMsg}`
          );
        }
      }

      // 2. Portfolios response
      if (portfoliosResult.status === "fulfilled") {
        const loadedPortfolios = portfoliosResult.value?.data || portfoliosResult.value || [];
        pStep2Done = Array.isArray(loadedPortfolios) && loadedPortfolios.length > 0;
      } else {
        const errMsg = formatErrorMessage(portfoliosResult.reason);
        setInitialLoadError((prev) =>
          prev ? `${prev} | Portfolios: ${errMsg}` : `Failed to load portfolio items: ${errMsg}`
        );
      }

      // 3. Services response
      if (servicesResult.status === "fulfilled") {
        const loadedServices = servicesResult.value?.data || servicesResult.value || [];
        pStep3Done =
          Array.isArray(loadedServices) &&
          loadedServices.some((s) => s && (s._id || s.id) && s.isActive !== false);
      } else {
        const errMsg = formatErrorMessage(servicesResult.reason);
        setInitialLoadError((prev) =>
          prev ? `${prev} | Services: ${errMsg}` : `Failed to load services: ${errMsg}`
        );
      }

      // Auto-resume on earliest incomplete step
      if (!pStep1Done) {
        setCurrentStep(1);
      } else if (!pStep2Done) {
        setCurrentStep(2);
      } else if (!pStep3Done) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }

      setIsInitialLoading(false);
    },
    [router]
  );

  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;

    Promise.allSettled([
      dispatch(getCreatorProfile()).unwrap(),
      dispatch(getPortfolios()).unwrap(),
      dispatch(getServices({ limit: 50 })).unwrap(),
    ]).then((results) => {
      if (!isCancelled && isMountedRef.current) {
        applyInitialDataResults(results);
      }
    });

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
    };
  }, [dispatch, applyInitialDataResults]);

  const handleRetryInitialLoad = () => {
    if (!isMountedRef.current) return;
    setIsInitialLoading(true);
    setInitialLoadError(null);
    Promise.allSettled([
      dispatch(getCreatorProfile()).unwrap(),
      dispatch(getPortfolios()).unwrap(),
      dispatch(getServices({ limit: 50 })).unwrap(),
    ]).then((results) => {
      if (isMountedRef.current) {
        applyInitialDataResults(results);
      }
    });
  };

  // Helper handlers
  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
    setValidationError(null);
  };

  const handleNicheToggle = (nicheName) => {
    setFormData((prev) => {
      const exists = prev.niches.includes(nicheName);
      if (exists) {
        return {
          ...prev,
          niches: prev.niches.filter((n) => n !== nicheName),
        };
      }
      if (prev.niches.length >= 3) {
        setValidationError("You can select up to 3 niches.");
        return prev;
      }
      setValidationError(null);
      return {
        ...prev,
        niches: [...prev.niches, nicheName],
      };
    });
  };

  const handleAddKeyword = (e) => {
    e?.preventDefault();
    const cleanTag = keywordInput.trim().replace(/^#+/, "").toLowerCase();
    if (!cleanTag) return;
    if (formData.keywords.includes(cleanTag)) {
      setKeywordInput("");
      return;
    }
    if (formData.keywords.length >= 10) {
      setValidationError("You can add up to 10 keywords.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, cleanTag],
    }));
    setKeywordInput("");
    setValidationError(null);
  };

  const handleRemoveKeyword = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((t) => t !== tagToRemove),
    }));
  };

  const handleAddLanguage = (e) => {
    e?.preventDefault();
    const cleanLang = languageInput.trim();
    if (!cleanLang) return;
    if (formData.languages.includes(cleanLang)) {
      setLanguageInput("");
      return;
    }
    if (formData.languages.length >= 10) {
      setValidationError("You can add up to 10 languages.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, cleanLang],
    }));
    setLanguageInput("");
    setValidationError(null);
  };

  const handleRemoveLanguage = (langToRemove) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== langToRemove),
    }));
  };

  // Modals
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = async (id) => {
    if (!id || deletingProjectId) return;
    setDeletingProjectId(id);
    try {
      await dispatch(deletePortfolioItem(id)).unwrap();
      dispatch(getPortfolios());
    } catch (err) {
      setValidationError(formatErrorMessage(err, "Failed to delete portfolio project."));
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleOpenAddService = () => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = async (id) => {
    if (!id || deletingServiceId) return;
    setDeletingServiceId(id);
    try {
      await dispatch(deleteCreatorService(id)).unwrap();
      dispatch(getServices({ limit: 50 }));
    } catch (err) {
      setValidationError(formatErrorMessage(err, "Failed to delete service."));
    } finally {
      setDeletingServiceId(null);
    }
  };

  // Navigation & Submission
  const handleContinue = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;
    setValidationError(null);

    // ==========================================
    // STEP 1 VALIDATION & SUBMISSION
    // ==========================================
    if (currentStep === 1) {
      if (!formData.title || !formData.title.trim()) {
        setValidationError("Please enter your professional headline / title.");
        return;
      }
      if (formData.title.trim().length > 150) {
        setValidationError("Headline must not exceed 150 characters.");
        return;
      }

      if (!formData.bio || !formData.bio.trim()) {
        setValidationError("Please enter a bio or description.");
        return;
      }
      if (formData.bio.trim().length > 1000) {
        setValidationError("Bio must not exceed 1000 characters.");
        return;
      }

      if (!formData.category || !formData.category.trim()) {
        setValidationError("Please select your primary category.");
        return;
      }

      if (!Array.isArray(formData.niches) || formData.niches.length === 0) {
        setValidationError("Please select at least 1 niche (maximum 3).");
        return;
      }

      if (!Array.isArray(formData.keywords) || formData.keywords.length === 0) {
        setValidationError("Please add at least 1 content keyword or tag.");
        return;
      }

      if (!formData.location || !formData.location.trim()) {
        setValidationError("Please enter your location or city.");
        return;
      }

      const hasAtLeastOneSocialLink = Object.values(formData.socialLinks).some(
        (link) => typeof link === "string" && link.trim().length > 0
      );
      if (!hasAtLeastOneSocialLink) {
        setValidationError("Please provide at least one social media handle or link.");
        return;
      }

      if (!formData.dob || !formData.dob.trim()) {
        setValidationError("Please enter your date of birth.");
        return;
      }
      const dobDate = new Date(formData.dob);
      if (Number.isNaN(dobDate.getTime()) || dobDate > new Date()) {
        setValidationError("Please enter a valid date of birth.");
        return;
      }

      if (!formData.gender) {
        setValidationError("Please select your gender identity.");
        return;
      }

      if (!Array.isArray(formData.languages) || formData.languages.length === 0) {
        setValidationError("Please select or add at least one language.");
        return;
      }

      setIsSubmitting(true);
      setValidationError(null);

      const profilePayload = {
        title: formData.title.trim(),
        bio: formData.bio.trim(),
        category: formData.category.trim(),
        keywords: formData.keywords,
        niches: formData.niches,
        location: formData.location.trim(),
        socialLinks: {
          instagram: formData.socialLinks.instagram?.trim() || "",
          youtube: formData.socialLinks.youtube?.trim() || "",
          facebook: formData.socialLinks.facebook?.trim() || "",
          tiktok: formData.socialLinks.tiktok?.trim() || "",
          website: formData.socialLinks.website?.trim() || "",
        },
        dob: formData.dob,
        gender: formData.gender,
        languages: formData.languages,
        ethnicity: formData.ethnicity ? formData.ethnicity.trim() : "",
        ...(formData.profileImage ? { profileImage: formData.profileImage } : {}),
        isOnboarded: false,
      };

      try {
        const hasExistingProfile = Boolean(profile && (profile._id || profile.id));
        if (hasExistingProfile) {
          await dispatch(updateCreatorProfile(profilePayload)).unwrap();
        } else {
          try {
            await dispatch(createCreatorProfile(profilePayload)).unwrap();
          } catch (createErr) {
            const createErrMsg = formatErrorMessage(createErr);
            if (
              createErrMsg.toLowerCase().includes("already exists") ||
              createErrMsg.includes("409")
            ) {
              await dispatch(updateCreatorProfile(profilePayload)).unwrap();
            } else {
              throw createErr;
            }
          }
        }

        setSaveSuccessMessage("Profile information saved successfully.");
        setValidationError(null);
        setCurrentStep(2);
      } catch (err) {
        setValidationError(
          formatErrorMessage(err, "Failed to save profile. Please check your inputs.")
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ==========================================
    // STEP 2: PORTFOLIO VALIDATION
    // ==========================================
    if (currentStep === 2) {
      if (!Array.isArray(portfolios) || portfolios.length === 0) {
        setValidationError("Please add at least 1 portfolio project before continuing.");
        return;
      }
      setCurrentStep(3);
      setValidationError(null);
      return;
    }

    // ==========================================
    // STEP 3: SERVICES VALIDATION
    // ==========================================
    if (currentStep === 3) {
      const serviceList = Array.isArray(services) ? services : [];
      const activeServices = serviceList.filter((s) => s.isActive !== false);

      if (serviceList.length === 0 || activeServices.length === 0) {
        setValidationError("Please add at least 1 active service offering before continuing.");
        return;
      }
      setCurrentStep(4);
      setValidationError(null);
      return;
    }

    // ==========================================
    // STEP 4: PAYMENT DETAILS & COMPLETE ONBOARDING
    // ==========================================
    if (currentStep === 4) {
      // Cross-step verification
      if (!isStep1Done && (!formData.title || !formData.bio || !formData.dob)) {
        setValidationError("Profile information is incomplete. Please return to Step 1.");
        return;
      }
      if (!Array.isArray(portfolios) || portfolios.length === 0) {
        setValidationError("At least 1 portfolio project is required. Please return to Step 2.");
        return;
      }
      const activeServices = (Array.isArray(services) ? services : []).filter(
        (s) => s.isActive !== false
      );
      if (activeServices.length === 0) {
        setValidationError("At least 1 active service is required. Please return to Step 3.");
        return;
      }

      setIsSubmitting(true);
      setValidationError(null);

      // Derive starting rate safely
      const validActivePrices = activeServices
        .map((s) => Number(s?.price))
        .filter((price) => Number.isFinite(price) && price > 0);

      const startingRate = validActivePrices.length > 0 ? Math.min(...validActivePrices) : 0;

      const completionPayload = {
        title: formData.title.trim(),
        bio: formData.bio.trim(),
        category: formData.category.trim(),
        keywords: formData.keywords,
        niches: formData.niches,
        location: formData.location.trim(),
        socialLinks: {
          instagram: formData.socialLinks.instagram?.trim() || "",
          youtube: formData.socialLinks.youtube?.trim() || "",
          facebook: formData.socialLinks.facebook?.trim() || "",
          tiktok: formData.socialLinks.tiktok?.trim() || "",
          website: formData.socialLinks.website?.trim() || "",
        },
        dob: formData.dob,
        gender: formData.gender,
        languages: formData.languages,
        ethnicity: formData.ethnicity ? formData.ethnicity.trim() : "",
        ...(formData.profileImage ? { profileImage: formData.profileImage } : {}),
        startingRate,
        isOnboarded: true,
      };

      try {
        const hasExistingProfile = Boolean(profile && (profile._id || profile.id));
        if (hasExistingProfile) {
          await dispatch(updateCreatorProfile(completionPayload)).unwrap();
        } else {
          try {
            await dispatch(createCreatorProfile(completionPayload)).unwrap();
          } catch (createErr) {
            const createErrMsg = formatErrorMessage(createErr);
            if (
              createErrMsg.toLowerCase().includes("already exists") ||
              createErrMsg.includes("409")
            ) {
              await dispatch(updateCreatorProfile(completionPayload)).unwrap();
            } else {
              throw createErr;
            }
          }
        }
        router.replace("/creator/dashboard");
      } catch (err) {
        setValidationError(
          formatErrorMessage(err, "Failed to complete onboarding. Please try again.")
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff0f3] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between p-4 sm:p-8 lg:p-12 transition-colors duration-300 font-sans">
      {/* =========================================================
          TOP BAR: BRANDING & STEP BADGE
      ========================================================= */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6 sm:pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-serif text-xl sm:text-2xl font-bold tracking-wide text-neutral-950 dark:text-white"
        >
          <span>CREATORLINK</span>
          <span className="text-pink-500 text-xl sm:text-2xl leading-none">✦</span>
        </Link>

        <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400">
          Step {currentStep} of 4
        </span>
      </header>

      {/* =========================================================
          MAIN CONTAINER
      ========================================================= */}
      <main className="my-auto max-w-5xl w-full mx-auto">
        {/* Onboarding Heading */}
        <div className="text-center sm:text-left mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white font-sans">
            Creator Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Set up your creator profile to get discovered by brands and start receiving opportunities.
          </p>
        </div>

        {/* 4-Step Stepper Progress Bar */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-8 px-2 sm:px-4">
          {STEPS_META.map((s, idx) => {
            const isDone = isStepCompleted(s.number);
            const isCurrent = s.number === currentStep;

            return (
              <div key={s.number} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-pink-500 text-white shadow-md ring-4 ring-pink-100 dark:ring-pink-950/40"
                        : isDone
                        ? "bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950"
                        : "bg-white dark:bg-neutral-800 text-neutral-400 border border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    {isDone && !isCurrent ? <CheckIcon className="w-3.5 h-3.5" /> : s.number}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                      isCurrent
                        ? "text-pink-600 dark:text-pink-400 font-bold"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < STEPS_META.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 -mt-5 transition-all ${
                      isDone ? "bg-pink-500" : "bg-neutral-200 dark:bg-neutral-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Card Surface */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-sm transition-colors duration-300">
          {/* Alerts */}
          {initialLoadError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-sans font-medium flex items-center justify-between gap-3">
              <span>⚠ {initialLoadError}</span>
              <button
                type="button"
                onClick={handleRetryInitialLoad}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-950 text-white text-xs font-semibold cursor-pointer shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {saveSuccessMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-sans font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveSuccessMessage(null)}
                className="text-emerald-600 hover:opacity-75 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {validationError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-sans font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>⚠</span>
                <span>{validationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-red-500 hover:opacity-75 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {isInitialLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <svg className="animate-spin h-8 w-8 text-pink-500 mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Loading your creator workspace...
              </p>
            </div>
          ) : (
            <>
              {/* =========================================================
                  STEP 1: PROFILE INFO (CONSOLIDATED 2-COLUMN VIEW)
              ========================================================= */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Card Section Header */}
                  <div className="flex items-start gap-3.5 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 border border-pink-200/50 dark:border-pink-900/30">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
                        Profile Info
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Add your profile details, social links, and background information to complete your creator profile.
                      </p>
                    </div>
                  </div>

                  {/* 2-Column Responsive Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    {/* LEFT COLUMN: Identity & Bio */}
                    <div className="space-y-5">
                      {/* Profile Photo Upload Control (NO cover photo) */}
                      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 flex items-center gap-4">
                        <div className="relative group shrink-0">
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-400/60 dark:border-pink-500/40 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shadow-xs">
                            {formData.profileImage ? (
                              <img
                                src={formData.profileImage}
                                alt="Profile Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-pink-500 font-bold text-xl uppercase bg-pink-50 dark:bg-pink-950/30">
                                {(user?.name || formData.title || "C").slice(0, 2)}
                              </div>
                            )}
                            {isUploadingImage && (
                              <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center">
                                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage || isSubmitting}
                            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 border-2 border-white dark:border-neutral-900 flex items-center justify-center shadow-xs cursor-pointer transition-transform hover:scale-105"
                            title="Upload Profile Photo"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageFileSelect}
                            className="hidden"
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                              Profile Photo
                            </span>
                            <span className="text-[10px] text-pink-600 dark:text-pink-400 font-medium bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-200/50">
                              Recommended
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-tight">
                            Upload a square portrait (JPG, PNG, or WebP max 5 MB).
                          </p>
                          {imageUploadError && (
                            <p className="text-[11px] text-red-500 font-medium pt-0.5">
                              {imageUploadError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                          Name *
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={user?.name || user?.fullName || "Creator"}
                          className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium cursor-not-allowed"
                        />
                      </div>

                      {/* Professional Title / Headline */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                            Professional Title / Headline *
                          </label>
                          <span className="text-[11px] text-neutral-400">{formData.title.length}/150</span>
                        </div>
                        <input
                          id="title"
                          type="text"
                          maxLength={150}
                          disabled={isSubmitting}
                          value={formData.title}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, title: e.target.value }));
                            setValidationError(null);
                          }}
                          placeholder="e.g. YouTube Creator or Visual Storyteller"
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                        />
                      </div>

                      {/* Primary Category */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                            Primary Category *
                          </label>
                          <span className="text-[11px] text-pink-600 font-medium">
                            {formData.category || "Required"}
                          </span>
                        </div>
                        <select
                          id="category"
                          disabled={isSubmitting}
                          value={formData.category}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, category: e.target.value }));
                            setValidationError(null);
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all cursor-pointer"
                        >
                          <option value="">Select Primary Category</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Niches Multi-select */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                            Niches (Select up to 3) *
                          </label>
                          <span className="text-xs text-pink-600 font-medium">
                            {formData.niches.length}/3 selected
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={nicheSearch}
                            onChange={(e) => setNicheSearch(e.target.value)}
                            placeholder="Filter niche options..."
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs rounded-xl pl-8 pr-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-pink-500"
                          />
                          <SearchIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                          {CATEGORIES.filter((cat) => {
                            if (!nicheSearch.trim()) return true;
                            const term = nicheSearch.toLowerCase();
                            return cat.name.toLowerCase().includes(term);
                          }).map((cat) => {
                            const isSelected = formData.niches.includes(cat.name);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleNicheToggle(cat.name)}
                                className={`text-left p-2 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-pink-50 dark:bg-pink-950/40 border-pink-500 text-pink-700 dark:text-pink-300 font-medium"
                                    : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-pink-400"
                                }`}
                              >
                                <span className="truncate">{cat.name}</span>
                                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-pink-600 shrink-0 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Content Keywords */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                          Keywords & Tags *
                        </label>
                        {formData.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {formData.keywords.map((kw) => (
                              <span
                                key={kw}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 text-pink-700 dark:text-pink-300 text-xs font-medium"
                              >
                                <span>#{kw}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKeyword(kw)}
                                  className="hover:opacity-75 cursor-pointer"
                                >
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddKeyword(e);
                              }
                            }}
                            placeholder="Add tag and press Enter"
                            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-pink-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleAddKeyword}
                            disabled={!keywordInput.trim()}
                            className="px-3.5 py-2 rounded-xl bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950 text-xs font-medium cursor-pointer disabled:opacity-40"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {SUGGESTED_KEYWORDS.slice(0, 6).map((kw) => (
                            <button
                              key={kw}
                              type="button"
                              onClick={() => {
                                if (!formData.keywords.includes(kw)) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    keywords: [...prev.keywords, kw],
                                  }));
                                }
                              }}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 cursor-pointer"
                            >
                              + {kw}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bio / Description */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                            Bio / Description *
                          </label>
                          <span className="text-[11px] text-neutral-400">{formData.bio.length}/500</span>
                        </div>
                        <textarea
                          id="bio"
                          rows={4}
                          maxLength={500}
                          disabled={isSubmitting}
                          value={formData.bio}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, bio: e.target.value }));
                            setValidationError(null);
                          }}
                          placeholder="Describe who you are, the type of content you create, and what sets your voice apart..."
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Location, Socials, Demographics */}
                    <div className="space-y-5">
                      {/* Location */}
                      <div className="space-y-1.5">
                        <label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                          Location *
                        </label>
                        <div className="relative flex items-center">
                          <MapPinIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                          <input
                            id="location"
                            type="text"
                            disabled={isSubmitting}
                            value={formData.location}
                            onChange={(e) => {
                              setFormData((prev) => ({ ...prev, location: e.target.value }));
                              setValidationError(null);
                            }}
                            placeholder="e.g. Bhopal, MP, India or Mumbai, India"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, location: loc }));
                                setValidationError(null);
                              }}
                              className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                formData.location === loc
                                  ? "bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950 border-neutral-950 font-medium"
                                  : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                              }`}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Social Channels & Links */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                          Social Channels & Links
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Instagram */}
                          <div className="relative flex items-center">
                            <InstagramIcon className="w-4 h-4 text-pink-500 absolute left-3" />
                            <input
                              type="text"
                              name="instagram"
                              value={formData.socialLinks.instagram}
                              onChange={handleSocialChange}
                              placeholder="Instagram Username / URL"
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-pink-500 transition-all"
                            />
                          </div>
                          {/* YouTube */}
                          <div className="relative flex items-center">
                            <YoutubeIcon className="w-4 h-4 text-red-500 absolute left-3" />
                            <input
                              type="text"
                              name="youtube"
                              value={formData.socialLinks.youtube}
                              onChange={handleSocialChange}
                              placeholder="YouTube Channel URL"
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-pink-500 transition-all"
                            />
                          </div>
                          {/* TikTok */}
                          <div className="relative flex items-center">
                            <TiktokIcon className="w-4 h-4 text-neutral-900 dark:text-neutral-100 absolute left-3" />
                            <input
                              type="text"
                              name="tiktok"
                              value={formData.socialLinks.tiktok}
                              onChange={handleSocialChange}
                              placeholder="TikTok Username / URL"
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-pink-500 transition-all"
                            />
                          </div>
                          {/* Facebook */}
                          <div className="relative flex items-center">
                            <FacebookIcon className="w-4 h-4 text-blue-600 absolute left-3" />
                            <input
                              type="text"
                              name="facebook"
                              value={formData.socialLinks.facebook}
                              onChange={handleSocialChange}
                              placeholder="Facebook Profile URL"
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-pink-500 transition-all"
                            />
                          </div>
                          {/* X (Twitter) */}
                          <div className="relative flex items-center">
                            <XTwitterIcon className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 absolute left-3" />
                            <input
                              type="text"
                              name="twitter"
                              value={formData.socialLinks.twitter || ""}
                              onChange={handleSocialChange}
                              placeholder="X (Twitter) Username / URL"
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-pink-500 transition-all"
                            />
                          </div>
                          {/* Website / Media Kit */}
                          <div className="relative flex items-center">
                            <GlobeIcon className="w-4 h-4 text-neutral-500 absolute left-3" />
                            <input
                              type="text"
                              name="website"
                              value={formData.socialLinks.website}
                              onChange={handleSocialChange}
                              placeholder="Website / Media Kit URL"
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-pink-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Date of Birth & Gender Identity */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Date of Birth */}
                        <div className="space-y-1.5">
                          <label htmlFor="dob" className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                            Date of Birth *
                          </label>
                          <div className="relative flex items-center">
                            <CalendarIcon className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
                            <input
                              id="dob"
                              type="date"
                              max={new Date().toISOString().split("T")[0]}
                              disabled={isSubmitting}
                              value={formData.dob}
                              onChange={(e) => {
                                setFormData((prev) => ({ ...prev, dob: e.target.value }));
                                setValidationError(null);
                              }}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-pink-500 transition-all cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Gender Identity */}
                        <div className="space-y-1.5">
                          <label htmlFor="gender" className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                            Gender *
                          </label>
                          <select
                            id="gender"
                            disabled={isSubmitting}
                            value={formData.gender}
                            onChange={(e) => {
                              setFormData((prev) => ({ ...prev, gender: e.target.value }));
                              setValidationError(null);
                            }}
                            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-pink-500 transition-all cursor-pointer"
                          >
                            <option value="">Select Gender</option>
                            {GENDER_OPTIONS.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                          Languages (Spoken & Content) *
                        </label>
                        {formData.languages.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {formData.languages.map((lang) => (
                              <span
                                key={lang}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 text-pink-700 dark:text-pink-300 text-xs font-medium"
                              >
                                <span>{lang}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLanguage(lang)}
                                  className="hover:opacity-75 cursor-pointer"
                                >
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={languageInput}
                            onChange={(e) => setLanguageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddLanguage(e);
                              }
                            }}
                            placeholder="Type a language (e.g. English, Hindi) and press Enter"
                            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-pink-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleAddLanguage}
                            disabled={!languageInput.trim()}
                            className="px-3.5 py-2 rounded-xl bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950 text-xs font-medium cursor-pointer disabled:opacity-40"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {POPULAR_LANGUAGES.slice(0, 5).map((l) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => {
                                if (!formData.languages.includes(l)) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    languages: [...prev.languages, l],
                                  }));
                                }
                              }}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 cursor-pointer"
                            >
                              + {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ethnicity */}
                      <div className="space-y-1.5">
                        <label htmlFor="ethnicity" className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
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
                                ethnicity: prev.ethnicity && !ETHNICITY_OPTIONS.includes(prev.ethnicity) ? prev.ethnicity : "Other",
                              }));
                            } else {
                              setFormData((prev) => ({ ...prev, ethnicity: val }));
                            }
                            setValidationError(null);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-pink-500 transition-all cursor-pointer"
                        >
                          <option value="">Select ethnicity (optional) / Prefer not to disclose</option>
                          {ETHNICITY_OPTIONS.map((eth) => (
                            <option key={eth} value={eth}>{eth}</option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                        {(formData.ethnicity === "Other" ||
                          (formData.ethnicity && !ETHNICITY_OPTIONS.includes(formData.ethnicity))) && (
                          <input
                            type="text"
                            maxLength={100}
                            value={formData.ethnicity === "Other" ? "" : formData.ethnicity}
                            onChange={(e) => setFormData((prev) => ({ ...prev, ethnicity: e.target.value || "Other" }))}
                            placeholder="Specify ethnicity (optional)"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  STEP 2: PORTFOLIO WORK
              ========================================================= */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
                        Portfolio Work
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Showcase your top past collaborations, campaigns, or creative content. Add at least 1 project to proceed.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddProject}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {/* Projects List Counter */}
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 pt-1">
                    <span>Projects Added ({portfolios?.length || 0})</span>
                    <span className="text-pink-600 font-medium">
                      {portfolios && portfolios.length > 0
                        ? "✓ Portfolio requirement satisfied"
                        : "* At least 1 project required"}
                    </span>
                  </div>

                  {/* Portfolio Projects Cards */}
                  {Array.isArray(portfolios) && portfolios.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
                      {portfolios.map((item) => {
                        const projectId = item._id || item.id;
                        return (
                          <div
                            key={projectId}
                            className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xs hover:border-pink-500 transition-all"
                          >
                            <div className="aspect-video bg-neutral-200 dark:bg-neutral-700 relative overflow-hidden">
                              {item.coverImage ? (
                                <img
                                  src={item.coverImage}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <CameraIcon className="w-8 h-8" />
                                </div>
                              )}
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-xs text-[10px] text-white font-medium">
                                {item.category || "Creative"}
                              </span>
                            </div>
                            <div className="p-3.5 space-y-1 flex-1">
                              <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                {item.title}
                              </h3>
                              {item.description && (
                                <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="px-3.5 py-2.5 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-end gap-2 bg-white/40 dark:bg-neutral-900/40">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProject(item)}
                                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                              >
                                <PencilIcon className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(projectId)}
                                disabled={deletingProjectId === projectId}
                                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-red-500 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                              >
                                <TrashIcon className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-50 dark:bg-pink-950/30 text-pink-500 flex items-center justify-center">
                        <CameraIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                        No portfolio projects added yet
                      </h3>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                        Upload past content, campaign photos, or video links showcasing your creative abilities.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAddProject}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Your First Project</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================
                  STEP 3: SERVICES & PACKAGES
              ========================================================= */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
                        Services & Packages
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Set up your standard packages, deliverables, and rates. Brands can hire you directly using these offerings. Add at least 1 service to proceed.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddService}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add Service</span>
                    </button>
                  </div>

                  {/* Services Counter */}
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 pt-1">
                    <span>Services Created ({services?.length || 0})</span>
                    <span className="text-pink-600 font-medium">
                      {services?.some((s) => s.isActive !== false)
                        ? "✓ Active service requirement met"
                        : "* At least 1 active service required"}
                    </span>
                  </div>

                  {/* Services Cards */}
                  {Array.isArray(services) && services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                      {services.map((service) => {
                        const serviceId = service._id || service.id;
                        const validDeliverables = getDeliverablesList(service.deliverables);
                        const formattedPrice = formatPrice(service);

                        return (
                          <div
                            key={serviceId}
                            className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:border-pink-500 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <ServiceCardCover coverImage={service.coverImage} title={service.title}>
                                <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-neutral-900/90 shadow-xs border border-white/20">
                                  {getPlatformIcon(service.platform)}
                                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100">
                                    {getPlatformLabel(service.platform)}
                                  </span>
                                </div>
                                <div className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-neutral-900/90 shadow-xs border border-white/20 text-[10px] font-semibold">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      service.isActive !== false ? "bg-emerald-500" : "bg-amber-500"
                                    }`}
                                  />
                                  <span className={service.isActive !== false ? "text-emerald-600" : "text-amber-600"}>
                                    {service.isActive !== false ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </ServiceCardCover>

                              <div className="p-4 space-y-2.5">
                                <div>
                                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                    {service.title}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-neutral-500">
                                      {service.category || "Creative Campaign"}
                                    </span>
                                    {service.contentType && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/40 text-pink-600 text-[10px] font-semibold">
                                        {getContentTypeLabel(service.platform, service.contentType)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                  <span className="text-[11px] text-neutral-500">Starting from</span>
                                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                                    {formattedPrice}
                                  </span>
                                </div>

                                {validDeliverables.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {validDeliverables.slice(0, 3).map((deliv, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-900 text-[10px] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
                                      >
                                        ✓ {deliv}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="px-4 py-2.5 border-t border-neutral-200/60 dark:border-neutral-700/60 bg-white/40 dark:bg-neutral-900/40 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditService(service)}
                                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                              >
                                <PencilIcon className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteService(serviceId)}
                                disabled={deletingServiceId === serviceId}
                                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-red-500 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                              >
                                <TrashIcon className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-50 dark:bg-pink-950/30 text-pink-500 flex items-center justify-center">
                        <TagIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                        No services added yet
                      </h3>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                        Define your collaboration packages, delivery timelines, and starting rates for brands.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAddService}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Your First Service</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================
                  STEP 4: PAYMENT DETAILS & PAYOUT SETUP
              ========================================================= */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-3.5 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 border border-pink-200/50 dark:border-pink-900/30">
                      <BanknotesIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
                        Payment Details & Payout Setup
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Configure your payout details to receive milestone earnings safely directly into your bank account or UPI ID.
                      </p>
                    </div>
                  </div>

                  {/* Payout Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                      {/* Payout Type Tab */}
                      <div className="flex p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <button
                          type="button"
                          onClick={() => setPayoutData((prev) => ({ ...prev, payoutType: "upi" }))}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            payoutData.payoutType === "upi"
                              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                              : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          UPI / VPA ID
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayoutData((prev) => ({ ...prev, payoutType: "bank" }))}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            payoutData.payoutType === "bank"
                              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                              : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          Direct Bank Transfer
                        </button>
                      </div>

                      {payoutData.payoutType === "upi" ? (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                            UPI ID / Virtual Payment Address
                          </label>
                          <input
                            type="text"
                            value={payoutData.upiId}
                            onChange={(e) => setPayoutData((prev) => ({ ...prev, upiId: e.target.value }))}
                            placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:border-pink-500"
                          />
                          <p className="text-[11px] text-neutral-500">
                            Instant milestone disbursements will be processed to this verified UPI ID.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                              Account Holder / Beneficiary Name
                            </label>
                            <input
                              type="text"
                              value={payoutData.accountHolderName}
                              onChange={(e) => setPayoutData((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                              placeholder="Name as printed on bank passbook / check"
                              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs focus:outline-none focus:border-pink-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                              Bank Account Number
                            </label>
                            <input
                              type="password"
                              value={payoutData.accountNumber}
                              onChange={(e) => setPayoutData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                              placeholder="Enter account number"
                              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs focus:outline-none focus:border-pink-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                              Confirm Account Number
                            </label>
                            <input
                              type="text"
                              value={payoutData.confirmAccountNumber}
                              onChange={(e) => setPayoutData((prev) => ({ ...prev, confirmAccountNumber: e.target.value }))}
                              placeholder="Re-enter account number"
                              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs focus:outline-none focus:border-pink-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
                              Bank IFSC Code
                            </label>
                            <input
                              type="text"
                              value={payoutData.ifscCode}
                              onChange={(e) => setPayoutData((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                              placeholder="e.g. HDFC0001234"
                              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs uppercase focus:outline-none focus:border-pink-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Escrow Trust Badge */}
                      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <ShieldCheckIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            CreatorLink Escrow Protection
                          </h4>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">
                            Brands deposit milestone funds in advance into escrow before you begin work. Upon milestone completion and approval, earnings are directly disbursed to your verified payout account.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right column: Readiness Summary */}
                    <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                        Onboarding Readiness Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-xs">
                          <span className="font-medium">1. Profile Information</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckIcon className="w-3.5 h-3.5" /> Completed
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-xs">
                          <span className="font-medium">2. Portfolio Work</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckIcon className="w-3.5 h-3.5" /> {portfolios?.length || 0} Projects
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-xs">
                          <span className="font-medium">3. Services & Packages</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckIcon className="w-3.5 h-3.5" /> {services?.filter((s) => s.isActive !== false).length || 0} Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-xs">
                          <span className="font-medium">4. Payment Setup</span>
                          <span className="text-pink-600 font-semibold flex items-center gap-1">
                            Ready to Finish
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-500 pt-2 leading-relaxed">
                        Clicking Complete Onboarding finalizes your profile and activates full access to your creator dashboard, campaign discovery, and direct brand contracts.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  ACTION BUTTONS (BOTTOM BAR)
              ========================================================= */}
              <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={currentStep > 1 ? handleBack : () => router.push("/")}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {currentStep > 1 && <ArrowLeftIcon className="w-4 h-4 mr-1 inline-block" />}{currentStep === 1 ? "Cancel" : "Back"}
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={isSubmitting || deletingProjectId || deletingServiceId || isInitialLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white dark:text-neutral-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {currentStep === 1
                          ? "Continue"
                          : currentStep === 2
                          ? "Continue to Services"
                          : currentStep === 3
                          ? "Continue to Payment Details"
                          : "Complete Onboarding"}
                      </span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* =========================================================
          MODALS FOR PORTFOLIO AND SERVICES
      ========================================================= */}
      <PortfolioFormModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={editingProject}
        onSuccess={() => {
          setIsProjectModalOpen(false);
          dispatch(getPortfolios());
        }}
      />

      <ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        service={editingService}
        onSuccess={() => {
          setIsServiceModalOpen(false);
          dispatch(getServices({ limit: 50 }));
        }}
      />
    </div>
  );
}
