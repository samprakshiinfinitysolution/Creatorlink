"use client";

import React, { useState, useEffect, useRef } from "react";
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
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from "@/redux/creator/portfolio/portfolio_slice";
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
import {
  uploadSingleImageApi,
  uploadSingleVideoApi,
} from "@/lib/upload";

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
// 11 CREATOR NICHES (MATCHING CREATORLINK TAXONOMY)
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

// Quick suggestions for popular creative hubs
const POPULAR_LOCATIONS = [
  "Mumbai, Maharashtra",
  "Delhi NCR, India",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Goa, India",
  "Remote / Worldwide",
];

// Popular suggested keywords for creators
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

// 4-Step Onboarding Definition
const STEPS_META = [
  { number: 1, title: "Profile Info", subtitle: "Identity & Reach" },
  { number: 2, title: "Portfolio", subtitle: "Visual Showcase" },
  { number: 3, title: "Identity", subtitle: "Demographics" },
  { number: 4, title: "Services", subtitle: "Packages & Rates" },
];

// Content Types mapped to Platforms
const PLATFORM_CONTENT_TYPES = {
  instagram: [
    { value: "reel", label: "Reel" },
    { value: "post", label: "Dedicated Post" },
    { value: "story", label: "Story" },
    { value: "other", label: "Other" },
  ],
  youtube: [
    { value: "video", label: "Dedicated Video" },
    { value: "short", label: "YouTube Short" },
    { value: "other", label: "Community Post / Other" },
  ],
  tiktok: [
    { value: "video", label: "TikTok Video" },
    { value: "story", label: "TikTok Story" },
    { value: "other", label: "Other" },
  ],
  facebook: [
    { value: "post", label: "Feed Post" },
    { value: "reel", label: "Facebook Reel" },
    { value: "video", label: "Video" },
    { value: "story", label: "Story" },
    { value: "other", label: "Other" },
  ],
  website: [
    { value: "article", label: "Article / Blog Review" },
    { value: "post", label: "Banner / Post" },
    { value: "other", label: "Other" },
  ],
  multiple: [
    { value: "cross_platform_bundle", label: "Cross-Platform Bundle" },
    { value: "campaign_package", label: "Full Campaign Package" },
    { value: "other", label: "Other" },
  ],
  other: [
    { value: "custom", label: "Custom Collaboration" },
    { value: "consultation", label: "Consultation / Strategy" },
    { value: "other", label: "Other" },
  ],
};

// Gender Options matching backend enum
const GENDER_OPTIONS = [
  { id: "female", label: "Female", desc: "She / Her" },
  { id: "male", label: "Male", desc: "He / Him" },
  { id: "non-binary", label: "Non-binary", desc: "They / Them / Enby" },
  { id: "other", label: "Other", desc: "Self-described identity" },
  { id: "prefer_not_to_say", label: "Prefer not to say", desc: "Keep private" },
];

// Suggested Popular Creator Content & Spoken Languages
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

// Optional Ethnicity Demographic Options
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

function PhotoIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ArrowUpTrayIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
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

function ExternalLinkIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
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

function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  const { profile } = useSelector((state) => state.profile);
  const { portfolios } = useSelector((state) => state.portfolio);
  const { services } = useSelector((state) => state.services);

  // Current onboarding page (1 = Profile, 2 = Portfolio, 3 = Identity, 4 = Services)
  const [currentStep, setCurrentStep] = useState(1);

  // Page 1 Form state + Page 3 Identity state
  const [formData, setFormData] = useState({
    title: "",
    bio: "",
    keywords: [],
    niches: [],
    location: "",
    socialLinks: {
      instagram: "",
      youtube: "",
      facebook: "",
      tiktok: "",
      website: "",
    },
    // Page 3: Identity
    dob: "",
    gender: "",
    languages: [],
    ethnicity: "",
  });

  // Local state for keyword input tag entry
  const [keywordInput, setKeywordInput] = useState("");
  // Local state for language input tag entry
  const [languageInput, setLanguageInput] = useState("");

  const [validationError, setValidationError] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Page 2: Project Modal & Form state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [modalError, setModalError] = useState(null);

  const initialProjectState = {
    title: "",
    description: "",
    platform: "instagram",
    contentType: "reel",
    url: "",
    coverImage: "",
    mediaType: "image",
  };
  const [projectForm, setProjectForm] = useState(initialProjectState);
  const fileInputRef = useRef(null);

  // Page 4: Service Modal state (using shared ServiceFormModal)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Dedicated loading and error states for initial fetch and deletions
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  // Step completion status derived from actual saved database / Redux data
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
      ((Array.isArray(profile.niches) && profile.niches.length > 0) ||
        (typeof profile.category === "string" &&
          profile.category.trim().length > 0)) &&
      Array.isArray(profile.keywords) &&
      profile.keywords.length > 0 &&
      typeof profile.location === "string" &&
      profile.location.trim().length > 0 &&
      hasValidSavedSocialLink
  );

  const isStep2Done = Array.isArray(portfolios) && portfolios.length > 0;

  const isStep3Done = Boolean(
    profile &&
      profile.dob &&
      typeof profile.gender === "string" &&
      profile.gender.trim().length > 0 &&
      Array.isArray(profile.languages) &&
      profile.languages.length > 0
  );

  const isStep4Done =
    Array.isArray(services) &&
    services.some((s) => s && (s._id || s.id) && s.isActive !== false);

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

  // Handler to parse and apply initial data response
  const applyInitialDataResults = React.useCallback(
    ([profileResult, portfoliosResult, servicesResult]) => {
      // 1. Handle Profile response
      if (profileResult.status === "fulfilled") {
        const p = profileResult.value?.data || profileResult.value;
        if (p) {
          // If creator has already completed onboarding, redirect to dashboard
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
              title: p.title || prev.title || "",
              bio: p.bio || prev.bio || "",
              keywords:
                Array.isArray(p.keywords) && p.keywords.length > 0
                  ? p.keywords
                  : prev.keywords,
              niches: initialNiches,
              location: p.location || prev.location || "",
              socialLinks: {
                instagram:
                  p.socialLinks?.instagram || prev.socialLinks.instagram || "",
                youtube:
                  p.socialLinks?.youtube || prev.socialLinks.youtube || "",
                facebook:
                  p.socialLinks?.facebook || prev.socialLinks.facebook || "",
                tiktok:
                  p.socialLinks?.tiktok || prev.socialLinks.tiktok || "",
                website:
                  p.socialLinks?.website || prev.socialLinks.website || "",
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
        }
      } else {
        const errMsg = formatErrorMessage(profileResult.reason);
        const isNotFound =
          errMsg.toLowerCase().includes("not found") || errMsg.includes("404");
        // Only 404 / "not found" is expected for new creators without saved profile
        if (!isNotFound) {
          setInitialLoadError((prev) =>
            prev ? `${prev} | Profile: ${errMsg}` : `Failed to load profile: ${errMsg}`
          );
        }
      }

      // 2. Handle Portfolios response
      if (portfoliosResult.status === "rejected") {
        const errMsg = formatErrorMessage(portfoliosResult.reason);
        setInitialLoadError((prev) =>
          prev
            ? `${prev} | Portfolios: ${errMsg}`
            : `Failed to load portfolio items: ${errMsg}`
        );
      }

      // 3. Handle Services response
      if (servicesResult.status === "rejected") {
        const errMsg = formatErrorMessage(servicesResult.reason);
        setInitialLoadError((prev) =>
          prev
            ? `${prev} | Services: ${errMsg}`
            : `Failed to load services: ${errMsg}`
        );
      }

      setIsInitialLoading(false);
    },
    [router]
  );

  // Fetch existing creator profile, portfolios, and services on mount
  useEffect(() => {
    let isCancelled = false;

    Promise.allSettled([
      dispatch(getCreatorProfile()).unwrap(),
      dispatch(getPortfolios()).unwrap(),
      dispatch(getServices({ limit: 50 })).unwrap(),
    ]).then((results) => {
      if (!isCancelled) {
        applyInitialDataResults(results);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [dispatch, applyInitialDataResults]);

  const handleRetryInitialLoad = () => {
    setIsInitialLoading(true);
    setInitialLoadError(null);
    Promise.allSettled([
      dispatch(getCreatorProfile()).unwrap(),
      dispatch(getPortfolios()).unwrap(),
      dispatch(getServices({ limit: 50 })).unwrap(),
    ]).then(applyInitialDataResults);
  };

  // Handle Niche selection (Toggle with maximum 3 items)
  const handleNicheToggle = (nicheName) => {
    setFormData((prev) => {
      const currentNiches = prev.niches || [];
      if (currentNiches.includes(nicheName)) {
        return {
          ...prev,
          niches: currentNiches.filter((n) => n !== nicheName),
        };
      }
      if (currentNiches.length >= 3) {
        setValidationError("You can select a maximum of 3 niches.");
        return prev;
      }
      setValidationError(null);
      return {
        ...prev,
        niches: [...currentNiches, nicheName],
      };
    });
  };

  // Handle Keyword additions
  const handleAddKeyword = (e) => {
    e?.preventDefault();
    const cleanWord = keywordInput.trim().toLowerCase();
    if (!cleanWord) return;

    if (formData.keywords.includes(cleanWord)) {
      setKeywordInput("");
      return;
    }

    if (formData.keywords.length >= 10) {
      setValidationError("You can add up to 10 keywords.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, cleanWord],
    }));
    setKeywordInput("");
    setValidationError(null);
  };

  // Handle Keyword chip removal
  const handleRemoveKeyword = (keywordToRemove) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((kw) => kw !== keywordToRemove),
    }));
    setValidationError(null);
  };

  // Handle Social Links input change
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

  // =========================================================
  // PAGE 3: IDENTITY HANDLERS
  // =========================================================
  const handleAddLanguage = (e) => {
    e?.preventDefault();
    const cleanLang = languageInput.trim();
    if (!cleanLang) return;

    // Capitalize first letter of words
    const formattedLang = cleanLang
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    if (
      formData.languages.some(
        (l) => l.toLowerCase() === formattedLang.toLowerCase()
      )
    ) {
      setLanguageInput("");
      return;
    }

    if (formData.languages.length >= 10) {
      setValidationError("You can add up to 10 languages.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, formattedLang],
    }));
    setLanguageInput("");
    setValidationError(null);
  };

  const handleRemoveLanguage = (langToRemove) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== langToRemove),
    }));
    setValidationError(null);
  };

  // =========================================================
  // PAGE 2: PORTFOLIO HANDLERS
  // =========================================================
  const handleOpenAddProject = () => {
    setEditingProjectId(null);
    setProjectForm(initialProjectState);
    setModalError(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (item) => {
    const primaryContent =
      Array.isArray(item.contents) && item.contents[0]
        ? item.contents[0]
        : {};

    const isVid =
      item.coverImage &&
      (item.coverImage.endsWith(".mp4") ||
        item.coverImage.endsWith(".webm") ||
        item.coverImage.endsWith(".mov"));

    setEditingProjectId(item._id || item.id);
    setProjectForm({
      title: item.title || "",
      description: item.description || "",
      platform: primaryContent.platform || "instagram",
      contentType: primaryContent.contentType || "reel",
      url: primaryContent.url || item.coverImage || "",
      coverImage: item.coverImage || primaryContent.previewImage || "",
      mediaType: isVid ? "video" : "image",
    });
    setModalError(null);
    setIsProjectModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      setModalError(
        "Please select a valid image (JPEG, PNG, WEBP) or video (MP4, WebM, MOV)."
      );
      return;
    }

    if (isImage && file.size > 5 * 1024 * 1024) {
      setModalError("Image file size must not exceed 5 MB.");
      return;
    }

    if (isVideo && file.size > 50 * 1024 * 1024) {
      setModalError("Video file size must not exceed 50 MB.");
      return;
    }

    setIsUploadingMedia(true);
    setModalError(null);

    try {
      let uploadRes;
      if (isVideo) {
        uploadRes = await uploadSingleVideoApi(file, "creatorlink/portfolios");
      } else {
        uploadRes = await uploadSingleImageApi(file, "creatorlink/portfolios");
      }

      const uploadedUrl =
        uploadRes?.url ||
        uploadRes?.secure_url ||
        uploadRes?.data?.url ||
        uploadRes?.data?.secure_url;

      if (uploadedUrl) {
        setProjectForm((prev) => ({
          ...prev,
          coverImage: uploadedUrl,
          mediaType: isVideo ? "video" : "image",
          // Suggest uploaded URL if project link is currently empty
          url: prev.url || uploadedUrl,
        }));
      } else {
        throw new Error("Media uploaded successfully but no URL was returned.");
      }
    } catch (err) {
      setModalError(
        formatErrorMessage(err, "Failed to upload media. Please try again.")
      );
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveProject = async (e) => {
    e?.preventDefault();
    if (isSubmittingProject || isUploadingMedia) return;
    setModalError(null);

    if (!projectForm.title || !projectForm.title.trim()) {
      setModalError("Please enter a project title.");
      return;
    }
    if (projectForm.title.trim().length > 150) {
      setModalError("Project title must not exceed 150 characters.");
      return;
    }

    if (!projectForm.platform) {
      setModalError("Please select a platform.");
      return;
    }

    if (!projectForm.contentType) {
      setModalError("Please select a content type.");
      return;
    }

    if (!projectForm.url || !projectForm.url.trim()) {
      setModalError("Please enter a project link or upload media.");
      return;
    }

    setIsSubmittingProject(true);

    const portfolioPayload = {
      title: projectForm.title.trim(),
      description: projectForm.description ? projectForm.description.trim() : "",
      category: formData.niches[0] || "General",
      coverImage: projectForm.coverImage || "",
      contents: [
        {
          platform: projectForm.platform,
          contentType: projectForm.contentType,
          url: projectForm.url.trim(),
          previewImage: projectForm.coverImage || "",
          title: projectForm.title.trim(),
        },
      ],
      isPublic: true,
    };

    try {
      if (editingProjectId) {
        await dispatch(
          updatePortfolioItem({
            portfolioId: editingProjectId,
            portfolioData: portfolioPayload,
          })
        ).unwrap();
      } else {
        await dispatch(createPortfolioItem(portfolioPayload)).unwrap();
      }

      await dispatch(getPortfolios()).unwrap();
      setIsProjectModalOpen(false);
      setEditingProjectId(null);
      setProjectForm(initialProjectState);
      setValidationError(null);
      setSaveSuccessMessage(
        editingProjectId
          ? "Portfolio project updated successfully."
          : "Portfolio project added successfully."
      );
    } catch (err) {
      setModalError(
        formatErrorMessage(err, "Failed to save portfolio project.")
      );
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!projectId || deletingProjectId) return;
    setDeletingProjectId(projectId);
    setValidationError(null);

    try {
      await dispatch(deletePortfolioItem(projectId)).unwrap();
      try {
        await dispatch(getPortfolios()).unwrap();
      } catch (refreshErr) {
        setValidationError(
          `Portfolio project was deleted, but failed to refresh portfolio list: ${formatErrorMessage(refreshErr)}`
        );
        return;
      }
      setSaveSuccessMessage("Portfolio project deleted successfully.");
    } catch (err) {
      setValidationError(
        formatErrorMessage(err, "Failed to delete portfolio project.")
      );
    } finally {
      setDeletingProjectId(null);
    }
  };

  // =========================================================
  // PAGE 4: SERVICES HANDLERS (USING SHARED MODAL)
  // =========================================================
  const handleOpenAddService = () => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleCloseServiceModal = () => {
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = async (serviceId) => {
    if (!serviceId || deletingServiceId) return;
    setDeletingServiceId(serviceId);
    setValidationError(null);

    try {
      await dispatch(deleteCreatorService(serviceId)).unwrap();
      try {
        await dispatch(getServices({ limit: 50 })).unwrap();
      } catch (refreshErr) {
        setValidationError(
          `Service package was deleted, but failed to refresh services list: ${formatErrorMessage(refreshErr)}`
        );
        return;
      }
      setSaveSuccessMessage("Service package deleted successfully.");
    } catch (err) {
      setValidationError(
        formatErrorMessage(err, "Failed to delete service.")
      );
    } finally {
      setDeletingServiceId(null);
    }
  };

  // Continue to Next Page
  const handleContinue = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;
    setValidationError(null);

    // ==========================================
    // PAGE 1 VALIDATION & SUBMISSION
    // ==========================================
    if (currentStep === 1) {
      if (!formData.title || !formData.title.trim()) {
        setValidationError("Please enter your profile headline / professional title.");
        return;
      }
      if (formData.title.trim().length > 150) {
        setValidationError("Profile headline must not exceed 150 characters.");
        return;
      }

      if (!formData.bio || !formData.bio.trim()) {
        setValidationError("Please provide a short bio or description.");
        return;
      }
      if (formData.bio.trim().length > 1000) {
        setValidationError("Bio must not exceed 1000 characters.");
        return;
      }

      if (!Array.isArray(formData.niches) || formData.niches.length === 0) {
        setValidationError("Please select at least 1 niche (maximum 3).");
        return;
      }
      if (formData.niches.length > 3) {
        setValidationError("You can select a maximum of 3 niches.");
        return;
      }

      if (!Array.isArray(formData.keywords) || formData.keywords.length === 0) {
        setValidationError("Please add at least 1 keyword representing your content.");
        return;
      }

      if (!formData.location || !formData.location.trim()) {
        setValidationError("Please enter your location or city.");
        return;
      }
      if (formData.location.trim().length > 100) {
        setValidationError("Location must not exceed 100 characters.");
        return;
      }

      const hasAtLeastOneSocialLink = Object.values(formData.socialLinks).some(
        (link) => typeof link === "string" && link.trim().length > 0
      );
      if (!hasAtLeastOneSocialLink) {
        setValidationError(
          "Please provide at least one social media link or website URL."
        );
        return;
      }

      setIsSubmitting(true);
      setValidationError(null);

      const profilePayload = {
        title: formData.title.trim(),
        bio: formData.bio.trim(),
        keywords: formData.keywords,
        niches: formData.niches,
        category: formData.niches[0] || "",
        location: formData.location.trim(),
        socialLinks: {
          instagram: formData.socialLinks.instagram.trim(),
          youtube: formData.socialLinks.youtube.trim(),
          facebook: formData.socialLinks.facebook.trim(),
          tiktok: formData.socialLinks.tiktok.trim(),
          website: formData.socialLinks.website.trim(),
        },
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

        // Successfully saved Page 1 -> Proceed to Page 2
        setSaveSuccessMessage("Profile information saved successfully.");
        setValidationError(null);
        setCurrentStep(2);
      } catch (err) {
        const errorMsg = formatErrorMessage(
          err,
          "Failed to save profile information. Please verify your inputs and try again."
        );
        setValidationError(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ==========================================
    // PAGE 2 VALIDATION & PROCEED TO PAGE 3
    // ==========================================
    if (currentStep === 2) {
      if (!Array.isArray(portfolios) || portfolios.length === 0) {
        setValidationError(
          "Please add at least 1 portfolio project before continuing to Identity verification."
        );
        return;
      }

      // Validated: Proceed to Page 3
      setCurrentStep(3);
      setValidationError(null);
      return;
    }

    // ==========================================
    // PAGE 3 VALIDATION & SUBMISSION
    // ==========================================
    if (currentStep === 3) {
      if (!formData.dob || !formData.dob.trim()) {
        setValidationError("Please enter your date of birth.");
        return;
      }

      const dobDate = new Date(formData.dob);
      if (Number.isNaN(dobDate.getTime())) {
        setValidationError("Please enter a valid date of birth.");
        return;
      }

      if (dobDate > new Date()) {
        setValidationError("Date of birth cannot be in the future.");
        return;
      }

      const allowedGenders = [
        "male",
        "female",
        "non-binary",
        "other",
        "prefer_not_to_say",
      ];
      if (!formData.gender || !allowedGenders.includes(formData.gender)) {
        setValidationError("Please select your gender identity.");
        return;
      }

      if (!Array.isArray(formData.languages) || formData.languages.length === 0) {
        setValidationError("Please select or add at least one language.");
        return;
      }

      if (formData.ethnicity && typeof formData.ethnicity !== "string") {
        setValidationError("Ethnicity must be a string.");
        return;
      }

      setIsSubmitting(true);
      setValidationError(null);

      const identityPayload = {
        dob: formData.dob,
        gender: formData.gender,
        languages: formData.languages,
        ethnicity: formData.ethnicity ? formData.ethnicity.trim() : "",
        isOnboarded: false,
      };

      try {
        const hasExistingProfile = Boolean(profile && (profile._id || profile.id));

        if (hasExistingProfile) {
          await dispatch(updateCreatorProfile(identityPayload)).unwrap();
        } else {
          try {
            await dispatch(createCreatorProfile(identityPayload)).unwrap();
          } catch (createErr) {
            const createErrMsg = formatErrorMessage(createErr);
            if (
              createErrMsg.toLowerCase().includes("already exists") ||
              createErrMsg.includes("409")
            ) {
              await dispatch(updateCreatorProfile(identityPayload)).unwrap();
            } else {
              throw createErr;
            }
          }
        }

        // Successfully saved Page 3 -> Proceed to Page 4
        setSaveSuccessMessage("Identity verification details saved successfully.");
        setValidationError(null);
        setCurrentStep(4);
      } catch (err) {
        const errorMsg = formatErrorMessage(
          err,
          "Failed to save identity details. Please check your inputs and try again."
        );
        setValidationError(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ==========================================
    // PAGE 4 VALIDATION & COMPLETE ONBOARDING
    // ==========================================
    if (currentStep === 4) {
      const serviceList = Array.isArray(services) ? services : [];
      if (serviceList.length === 0) {
        setValidationError(
          "Please add at least 1 service package to complete your onboarding."
        );
        return;
      }

      const activeServices = serviceList.filter((s) => s.isActive !== false);
      if (activeServices.length === 0) {
        setValidationError(
          "Please make sure at least 1 service package is active to complete onboarding."
        );
        return;
      }

      // Cross-step data validation
      if (!formData.title || !formData.title.trim()) {
        setValidationError("Profile headline is missing. Please return to Step 1.");
        return;
      }
      if (!formData.bio || !formData.bio.trim()) {
        setValidationError("Profile bio is missing. Please return to Step 1.");
        return;
      }
      if (!Array.isArray(formData.niches) || formData.niches.length === 0) {
        setValidationError("Niche selection is missing. Please return to Step 1.");
        return;
      }
      if (!Array.isArray(portfolios) || portfolios.length === 0) {
        setValidationError(
          "At least 1 portfolio project is required. Please return to Step 2."
        );
        return;
      }
      if (
        !formData.dob ||
        !formData.gender ||
        !Array.isArray(formData.languages) ||
        formData.languages.length === 0
      ) {
        setValidationError(
          "Identity verification details are incomplete. Please return to Step 3."
        );
        return;
      }

      setIsSubmitting(true);
      setValidationError(null);

      // Derive startingRate strictly from lowest price among active services with price > 0
      const pricedActiveServices = activeServices.filter(
        (s) => typeof s.price === "number" && s.price > 0
      );
      const startingRate =
        pricedActiveServices.length > 0
          ? Math.min(...pricedActiveServices.map((s) => s.price))
          : 0;

      const completionPayload = {
        title: formData.title.trim(),
        bio: formData.bio.trim(),
        keywords: formData.keywords,
        niches: formData.niches,
        category: formData.niches[0] || "",
        location: formData.location.trim(),
        socialLinks: {
          instagram: formData.socialLinks.instagram.trim(),
          youtube: formData.socialLinks.youtube.trim(),
          facebook: formData.socialLinks.facebook.trim(),
          tiktok: formData.socialLinks.tiktok.trim(),
          website: formData.socialLinks.website.trim(),
        },
        dob: formData.dob,
        gender: formData.gender,
        languages: formData.languages,
        ethnicity: formData.ethnicity ? formData.ethnicity.trim() : "",
        startingRate,
        isOnboarded: true,
      };

      try {
        await dispatch(updateCreatorProfile(completionPayload)).unwrap();
        // Successful onboarding completion: redirect to Creator Dashboard
        router.replace("/creator/dashboard");
      } catch (err) {
        const errorMsg = formatErrorMessage(
          err,
          "Failed to complete onboarding. Please verify your details and try again."
        );
        setValidationError(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  // Back step navigation
  const handleBack = () => {
    if (isSubmitting) return;
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-8 lg:p-12 transition-colors duration-300">
      {/* =========================================================
          TOP BAR: BRANDING & STEP BADGE (NO SKIP BUTTON)
      ========================================================= */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 sm:pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-serif text-xl sm:text-2xl font-medium tracking-wide text-foreground"
        >
          <span>CREATORLINK</span>
          <span className="text-secondary text-xl sm:text-2xl leading-none">✦</span>
        </Link>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
          Step {currentStep} of 4
        </span>
      </header>

      {/* =========================================================
          CENTERED ONBOARDING CARD
      ========================================================= */}
      <main className="my-auto max-w-3xl w-full mx-auto">
        <div className="bg-surface text-foreground rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-border-theme shadow-sm transition-colors duration-300">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Step {currentStep} of 4
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                  {currentStep === 1
                    ? "25%"
                    : currentStep === 2
                    ? "50%"
                    : currentStep === 3
                    ? "75%"
                    : "100%"}{" "}
                  Completed
                </span>
              </div>
              <span className="text-xs text-text-secondary font-medium hidden sm:inline-block">
                {currentStep === 1 && "Profile Information"}
                {currentStep === 2 && "Portfolio Work"}
                {currentStep === 3 && "Identity Verification"}
                {currentStep === 4 && "Services & Packages"}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${currentStep * 25}%` }}
              />
            </div>

            {/* Stepper Dots & Titles */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-4 pt-1">
              {STEPS_META.map((s) => {
                const isDone = isStepCompleted(s.number);
                const isCurrent = s.number === currentStep;
                const canNavigate =
                  !isSubmitting &&
                  !deletingProjectId &&
                  !deletingServiceId &&
                  !isInitialLoading &&
                  (isDone || s.number <= currentStep);

                return (
                  <button
                    key={s.number}
                    type="button"
                    disabled={!canNavigate}
                    onClick={() => {
                      if (canNavigate) {
                        setCurrentStep(s.number);
                        setValidationError(null);
                      }
                    }}
                    className={`text-left p-1.5 sm:p-2 rounded-xl transition-all ${
                      isCurrent
                        ? "bg-surface-muted border border-border-theme shadow-xs ring-1 ring-foreground/10"
                        : isDone
                        ? "cursor-pointer hover:bg-surface-muted/60"
                        : "cursor-default text-text-secondary"
                    } ${isSubmitting || deletingProjectId || deletingServiceId || isInitialLoading ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                          isDone && !isCurrent
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950"
                            : "border border-border-theme bg-surface-muted text-text-secondary"
                        }`}
                      >
                        {isDone && !isCurrent ? (
                          <CheckIcon className="w-3 h-3 text-white" />
                        ) : (
                          s.number
                        )}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs truncate ${
                          isCurrent
                            ? "text-foreground font-bold"
                            : isDone
                            ? "text-foreground font-semibold"
                            : "text-text-secondary font-medium"
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-text-secondary truncate hidden md:block">
                      {s.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Load Error Alert */}
          {initialLoadError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-sans font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">⚠</span>
                <span>{initialLoadError}</span>
              </div>
              <button
                type="button"
                onClick={handleRetryInitialLoad}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-semibold cursor-pointer shrink-0 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Success Feedback Alert */}
          {saveSuccessMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-sans font-medium flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveSuccessMessage(null)}
                className="text-emerald-600/70 hover:text-emerald-600 dark:text-emerald-400/70 dark:hover:text-emerald-400 p-1 cursor-pointer"
                aria-label="Dismiss message"
              >
                ✕
              </button>
            </div>
          )}

          {/* Validation Error Alert */}
          {validationError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-sans font-medium flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">⚠</span>
                <span>{validationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-red-500/70 hover:text-red-500 p-1 cursor-pointer"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {isInitialLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <svg className="animate-spin h-8 w-8 text-secondary mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-semibold text-foreground">Loading creator workspace...</p>
              <p className="text-xs text-text-secondary mt-1">Retrieving your profile, portfolio, and service details.</p>
            </div>
          ) : (
            <>
          {/* =========================================================
              PAGE 1: PROFILE INFORMATION
          ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-2">
                  Profile Information
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Introduce yourself to prospective brands. Your headline, bio, niches, and social links form your primary presence on CreatorLink.
                </p>
              </div>

              {/* 1. Profile Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="title"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                  >
                    Professional Headline / Title *
                  </label>
                  <span className="text-[11px] text-text-secondary">
                    {formData.title.length}/150
                  </span>
                </div>
                <input
                  id="title"
                  name="title"
                  type="text"
                  maxLength={150}
                  disabled={isSubmitting}
                  value={formData.title}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, title: e.target.value }));
                    setValidationError(null);
                  }}
                  placeholder="e.g. Luxury Fashion & Editorial Visual Creator"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-60"
                />
              </div>

              {/* 2. Bio / Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="bio"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                  >
                    About You / Bio *
                  </label>
                  <span className="text-[11px] text-text-secondary">
                    {formData.bio.length}/1000
                  </span>
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  maxLength={1000}
                  disabled={isSubmitting}
                  value={formData.bio}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, bio: e.target.value }));
                    setValidationError(null);
                  }}
                  placeholder="Tell brands who you are, the type of content you craft, and what sets your creative voice apart..."
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-none disabled:opacity-60"
                />
              </div>

              {/* 3. Niches (Multi-Select, Max 3) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block">
                    Niches (Select up to 3) *
                  </label>
                  <span
                    className={`text-xs font-medium ${
                      formData.niches.length === 3
                        ? "text-secondary font-semibold"
                        : "text-text-secondary"
                    }`}
                  >
                    {formData.niches.length}/3 selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => {
                    const isSelected = formData.niches.includes(cat.name);
                    const Icon = cat.icon;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleNicheToggle(cat.name)}
                        className={`group relative text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "bg-secondary/10 border-secondary text-foreground shadow-xs ring-1 ring-secondary/40"
                            : "bg-surface-muted/40 border-border-theme hover:bg-surface-muted hover:border-secondary/50 text-foreground"
                        } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <div
                          className={`p-2 rounded-lg transition-colors shrink-0 ${
                            isSelected
                              ? "bg-secondary text-white"
                              : "bg-surface border border-border-theme text-text-secondary group-hover:text-secondary group-hover:border-secondary/40"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-xs sm:text-sm font-semibold truncate text-foreground">
                              {cat.name}
                            </h3>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-secondary text-white flex items-center justify-center shrink-0">
                                <CheckIcon className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5 leading-snug">
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Content Keywords & Tags */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block">
                  Content Keywords & Search Tags *
                </label>

                {/* Active Tag Chips */}
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-medium"
                      >
                        <span>#{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:opacity-75 cursor-pointer"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Input Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddKeyword(e);
                      }
                    }}
                    placeholder="Type a tag (e.g. streetwear, luxury, ootd) and press Enter"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    disabled={isSubmitting || !keywordInput.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-muted hover:bg-background border border-border-theme text-foreground text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Suggested Keyword Chips */}
                <div>
                  <span className="text-[11px] text-text-secondary block mb-1.5">
                    Popular suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_KEYWORDS.map((sug) => {
                      const isAdded = formData.keywords.includes(sug);
                      return (
                        <button
                          key={sug}
                          type="button"
                          disabled={isSubmitting || isAdded}
                          onClick={() => {
                            if (!isAdded) {
                              setFormData((prev) => ({
                                ...prev,
                                keywords: [...prev.keywords, sug],
                              }));
                            }
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            isAdded
                              ? "bg-secondary/10 border-secondary/30 text-secondary cursor-default opacity-60"
                              : "bg-surface-muted/40 border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted cursor-pointer"
                          }`}
                        >
                          + {sug}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5. Location */}
              <div className="space-y-3">
                <label
                  htmlFor="location"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                >
                  Location / City *
                </label>

                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-text-secondary pointer-events-none">
                    <MapPinIcon className="w-4 h-4" />
                  </span>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    disabled={isSubmitting}
                    value={formData.location}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, location: e.target.value }));
                      setValidationError(null);
                    }}
                    placeholder="e.g. Mumbai, Maharashtra or London, UK"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-60"
                  />
                </div>

                {/* Quick Selection Hubs */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isActive = formData.location === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, location: loc }));
                          setValidationError(null);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? "bg-secondary text-white border-secondary font-medium"
                            : "bg-surface-muted/50 border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted"
                        } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Social Profiles & Handles */}
              <div className="space-y-4 pt-2 border-t border-border-theme">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground font-sans">
                    Social Profiles & Links *
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Add your active platforms. Provide at least one valid profile handle or website URL.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Instagram */}
                  <div className="space-y-1">
                    <label
                      htmlFor="instagram"
                      className="text-xs font-medium text-text-secondary flex items-center gap-1.5"
                    >
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                      <span>Instagram</span>
                    </label>
                    <input
                      id="instagram"
                      name="instagram"
                      type="text"
                      disabled={isSubmitting}
                      value={formData.socialLinks.instagram}
                      onChange={handleSocialChange}
                      placeholder="https://instagram.com/yourhandle"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/40 text-xs font-sans focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="space-y-1">
                    <label
                      htmlFor="youtube"
                      className="text-xs font-medium text-text-secondary flex items-center gap-1.5"
                    >
                      <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                      <span>YouTube</span>
                    </label>
                    <input
                      id="youtube"
                      name="youtube"
                      type="text"
                      disabled={isSubmitting}
                      value={formData.socialLinks.youtube}
                      onChange={handleSocialChange}
                      placeholder="https://youtube.com/@yourchannel"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/40 text-xs font-sans focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>

                  {/* Facebook */}
                  <div className="space-y-1">
                    <label
                      htmlFor="facebook"
                      className="text-xs font-medium text-text-secondary flex items-center gap-1.5"
                    >
                      <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Facebook</span>
                    </label>
                    <input
                      id="facebook"
                      name="facebook"
                      type="text"
                      disabled={isSubmitting}
                      value={formData.socialLinks.facebook}
                      onChange={handleSocialChange}
                      placeholder="https://facebook.com/yourprofile"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/40 text-xs font-sans focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-1">
                    <label
                      htmlFor="tiktok"
                      className="text-xs font-medium text-text-secondary flex items-center gap-1.5"
                    >
                      <TiktokIcon className="w-3.5 h-3.5 text-foreground" />
                      <span>TikTok</span>
                    </label>
                    <input
                      id="tiktok"
                      name="tiktok"
                      type="text"
                      disabled={isSubmitting}
                      value={formData.socialLinks.tiktok}
                      onChange={handleSocialChange}
                      placeholder="https://tiktok.com/@yourhandle"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/40 text-xs font-sans focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor="website"
                      className="text-xs font-medium text-text-secondary flex items-center gap-1.5"
                    >
                      <GlobeIcon className="w-3.5 h-3.5 text-secondary" />
                      <span>Website / Portfolio Link</span>
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      disabled={isSubmitting}
                      value={formData.socialLinks.website}
                      onChange={handleSocialChange}
                      placeholder="https://yourdomain.com or linktr.ee/..."
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/40 text-xs font-sans focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>
                </div>

                {/* 7. Connect Social Accounts Note */}
                <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border-theme text-xs text-text-secondary leading-relaxed flex items-start gap-2.5">
                  <span className="text-secondary text-base leading-none select-none mt-0.5">ℹ</span>
                  <div>
                    <span className="font-semibold text-foreground block mb-0.5">
                      Social Account Verification
                    </span>
                    Official direct platform OAuth connections will be available in future releases. For now, the profile links you enter above will be showcased to brands for manual discovery and portfolio inspection.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              PAGE 2: PORTFOLIO WORK
          ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-1">
                    Portfolio Work
                  </h1>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Showcase your top past collaborations, campaigns, or creative content. Add at least 1 project to proceed.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddProject}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>

              {/* Projects List Counter */}
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-text-secondary pt-2">
                <span>Projects Added ({portfolios?.length || 0})</span>
                <span className="text-secondary font-medium">
                  {portfolios?.length > 0 ? "✓ Minimum requirement met" : "* At least 1 required"}
                </span>
              </div>

              {/* Portfolio Projects Cards */}
              {Array.isArray(portfolios) && portfolios.length > 0 ? (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {portfolios.map((item) => {
                    const primaryContent =
                      Array.isArray(item.contents) && item.contents[0]
                        ? item.contents[0]
                        : {};
                    const platform = primaryContent.platform || "other";
                    const contentType = primaryContent.contentType || "post";
                    const projectUrl = primaryContent.url || item.coverImage;

                    return (
                      <div
                        key={item._id || item.id}
                        className="p-4 rounded-2xl bg-surface-muted/30 border border-border-theme hover:border-secondary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        {/* Left: Thumbnail & Project Meta */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Media Preview Box */}
                          <div className="w-16 h-16 rounded-xl bg-surface border border-border-theme overflow-hidden shrink-0 flex items-center justify-center relative">
                            {item.coverImage ? (
                              item.coverImage.endsWith(".mp4") ||
                              item.coverImage.endsWith(".webm") ||
                              item.coverImage.endsWith(".mov") ? (
                                <div className="flex flex-col items-center justify-center text-secondary">
                                  <VideoCameraIcon className="w-6 h-6" />
                                  <span className="text-[9px] font-bold uppercase mt-0.5">Video</span>
                                </div>
                              ) : (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={item.coverImage}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              )
                            ) : (
                              <div className="text-text-secondary/60 flex flex-col items-center">
                                <PhotoIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Content Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border-theme text-[11px] font-medium capitalize text-foreground">
                                {getPlatformIcon(platform)}
                                <span>{platform}</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 text-[10px] font-semibold uppercase text-secondary">
                                {contentType}
                              </span>
                            </div>

                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {item.title}
                            </h3>

                            {item.description && (
                              <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                            )}

                            {projectUrl && (
                              <a
                                href={projectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-secondary hover:underline truncate mt-1 max-w-full"
                              >
                                <span className="truncate">{projectUrl}</span>
                                <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProject(item)}
                            className="p-2 rounded-lg bg-surface border border-border-theme hover:border-secondary text-text-secondary hover:text-foreground transition-all cursor-pointer"
                            title="Edit Project"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(deletingProjectId)}
                            onClick={() => handleDeleteProject(item._id || item.id)}
                            className="p-2 rounded-lg bg-surface border border-border-theme hover:border-red-500 text-text-secondary hover:text-red-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Project"
                          >
                            {deletingProjectId === (item._id || item.id) ? (
                              <svg className="animate-spin w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <TrashIcon className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-10 px-6 rounded-2xl border-2 border-dashed border-border-theme bg-surface-muted/20">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-surface-muted flex items-center justify-center text-text-secondary">
                    <PhotoIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    No portfolio projects added yet
                  </h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">
                    Add your best reels, videos, dedicated reviews, or posts so brands can evaluate your content quality.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddProject}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Your First Project</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              PAGE 3: IDENTITY VERIFICATION
          ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-2">
                  Identity & Demographics
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Provide your demographic background and language proficiencies. This information helps match you with brand campaigns looking for specific creator perspectives.
                </p>
              </div>

              {/* 1. Date of Birth */}
              <div className="space-y-2">
                <label
                  htmlFor="dob"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                >
                  Date of Birth *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-text-secondary pointer-events-none">
                    <CalendarIcon className="w-4 h-4" />
                  </span>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    disabled={isSubmitting}
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.dob}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, dob: e.target.value }));
                      setValidationError(null);
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border-theme text-foreground text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all cursor-pointer disabled:opacity-60"
                  />
                </div>
                <p className="text-[11px] text-text-secondary">
                  Your birth date is kept private and used for demographic and campaign eligibility verification.
                </p>
              </div>

              {/* 2. Gender Identity */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block">
                    Gender Identity *
                  </label>
                  <span className="text-[11px] text-text-secondary">
                    {formData.gender
                      ? GENDER_OPTIONS.find((g) => g.id === formData.gender)?.label
                      : "Required"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {GENDER_OPTIONS.map((g) => {
                    const isSelected = formData.gender === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, gender: g.id }));
                          setValidationError(null);
                        }}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-secondary/10 border-secondary ring-1 ring-secondary/40 text-foreground"
                            : "bg-surface-muted/40 border-border-theme hover:bg-surface-muted hover:border-secondary/50 text-foreground"
                        } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="text-xs sm:text-sm font-semibold truncate text-foreground">
                            {g.label}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-secondary text-white flex items-center justify-center shrink-0">
                              <CheckIcon className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-text-secondary mt-1 block">
                          {g.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Languages Spoken / Content Languages */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block">
                    Languages (Spoken & Content) *
                  </label>
                  <span className="text-[11px] text-text-secondary">
                    {formData.languages.length} selected
                  </span>
                </div>

                {/* Selected Language Chips */}
                {formData.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-medium"
                      >
                        <span>{lang}</span>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleRemoveLanguage(lang)}
                          className="hover:opacity-75 cursor-pointer"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Language Input Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLanguage(e);
                      }
                    }}
                    placeholder="Type a language (e.g. English, Hindi, Spanish) and press Enter"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    disabled={isSubmitting || !languageInput.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-muted hover:bg-background border border-border-theme text-foreground text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Suggested Language Chips */}
                <div>
                  <span className="text-[11px] text-text-secondary block mb-1.5">
                    Popular suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_LANGUAGES.map((lang) => {
                      const isAdded = formData.languages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          disabled={isSubmitting || isAdded}
                          onClick={() => {
                            if (!isAdded) {
                              if (formData.languages.length >= 10) {
                                setValidationError("You can add up to 10 languages.");
                                return;
                              }
                              setFormData((prev) => ({
                                ...prev,
                                languages: [...prev.languages, lang],
                              }));
                              setValidationError(null);
                            }
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            isAdded
                              ? "bg-secondary/10 border-secondary/30 text-secondary cursor-default opacity-60"
                              : "bg-surface-muted/40 border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted cursor-pointer"
                          }`}
                        >
                          + {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Ethnicity (Optional) */}
              <div className="space-y-2 pt-2 border-t border-border-theme">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="ethnicity"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                  >
                    Ethnicity / Cultural Background (Optional)
                  </label>
                  <span className="text-[11px] text-text-secondary">Optional</span>
                </div>

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
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border-theme text-foreground text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all cursor-pointer disabled:opacity-60"
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
                    maxLength={100}
                    disabled={isSubmitting}
                    value={formData.ethnicity === "Other" ? "" : formData.ethnicity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ethnicity: e.target.value || "Other",
                      }))
                    }
                    placeholder="Please specify your ethnicity (optional)"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm font-sans focus:outline-none focus:border-secondary transition-all mt-2"
                  />
                )}

                <p className="text-[11px] text-text-secondary">
                  Brands frequently seek diverse creator voices for inclusive storytelling. This field is completely optional.
                </p>
              </div>
            </div>
          )}

          {/* =========================================================
              PAGE 4: SERVICES & PACKAGES
          ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-1">
                    Services & Packages
                  </h1>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Set up your standard packages, deliverables, and rates. Brands can hire you directly using these offerings. Add at least 1 service to complete onboarding.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddService}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>

              {/* Services Counter */}
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-text-secondary pt-2">
                <span>Services Created ({services?.length || 0})</span>
                <span className="text-secondary font-medium">
                  {services?.some((s) => s.isActive !== false)
                    ? "✓ Active service requirement met"
                    : "* At least 1 active service required"}
                </span>
              </div>

              {/* Services List / Cards */}
              {Array.isArray(services) && services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1">
                  {services.map((service) => {
                    const serviceId = service._id || service.id;
                    const validDeliverables = getDeliverablesList(service.deliverables);
                    const formattedPrice = formatPrice(service);

                    return (
                      <div
                        key={serviceId}
                        className="bg-surface border border-border-theme hover:border-secondary/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Service Cover with Platform & Status Badges */}
                          <ServiceCardCover coverImage={service.coverImage} title={service.title}>
                            {/* Platform Badge */}
                            <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xs shadow-xs border border-white/20">
                              {getPlatformIcon(service.platform)}
                              <span className="text-[10px] font-bold tracking-wider uppercase text-foreground">
                                {getPlatformLabel(service.platform)}
                              </span>
                            </div>

                            {/* Active Status Badge */}
                            <div className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xs shadow-xs border border-white/20 text-[10px] font-semibold">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  service.isActive !== false ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              <span
                                className={
                                  service.isActive !== false
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-amber-600 dark:text-amber-400"
                                }
                              >
                                {service.isActive !== false ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </ServiceCardCover>

                          {/* Card Content */}
                          <div className="p-4 space-y-2.5">
                            <div>
                              <h3 className="font-sans font-bold text-sm sm:text-base text-foreground line-clamp-1 tracking-tight">
                                {service.title}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                <p className="text-[11px] text-text-secondary line-clamp-1">
                                  {service.category || "Social Media Campaign"}
                                </p>
                                {service.contentType && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-semibold">
                                    {service.quantity && service.quantity > 1
                                      ? `${service.quantity}x `
                                      : ""}
                                    {getContentTypeLabel(
                                      service.platform,
                                      service.contentType
                                    )}
                                  </span>
                                )}
                              </div>
                              {service.description && (
                                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1">
                                  {service.description}
                                </p>
                              )}
                            </div>

                            {/* Pricing Row */}
                            <div className="p-2.5 sm:p-3 rounded-xl bg-surface-muted/50 border border-border-theme flex items-center justify-between">
                              <span className="text-[11px] font-medium text-text-secondary">
                                {service.pricingType === "custom"
                                  ? "Custom Quote"
                                  : service.pricingType === "starting_from"
                                  ? "Starting from"
                                  : "Fixed Rate"}
                              </span>
                              <span className="font-bold text-sm sm:text-base text-secondary">
                                {formattedPrice}
                              </span>
                            </div>

                            {/* Meta info (deliveryTime, revisions) */}
                            <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                              <span className="inline-flex items-center gap-1">
                                <ClockIcon className="w-3.5 h-3.5 text-text-secondary" />
                                <span>{service.deliveryTime || 7} Days Delivery</span>
                              </span>
                              <span>•</span>
                              <span>
                                {service.revisions != null ? service.revisions : 1} Revisions
                              </span>
                            </div>

                            {/* Deliverables tags */}
                            {validDeliverables.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {validDeliverables.slice(0, 3).map((deliv, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-surface-muted text-[10px] text-text-secondary border border-border-theme line-clamp-1"
                                  >
                                    ✓ {deliv}
                                  </span>
                                ))}
                                {validDeliverables.length > 3 && (
                                  <span className="text-[10px] text-text-secondary self-center">
                                    +{validDeliverables.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="px-4 py-3 border-t border-border-theme bg-surface-muted/30 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditService(service)}
                            className="px-3 py-1.5 rounded-lg border border-border-theme bg-surface hover:bg-surface-muted text-text-secondary hover:text-foreground text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(deletingServiceId)}
                            onClick={() => handleDeleteService(serviceId)}
                            className="px-3 py-1.5 rounded-lg border border-border-theme bg-surface hover:bg-red-500/10 hover:border-red-500/30 text-text-secondary hover:text-red-500 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingServiceId === serviceId ? (
                              <>
                                <svg className="animate-spin w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <TrashIcon className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-10 px-6 rounded-2xl border-2 border-dashed border-border-theme bg-surface-muted/20">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-surface-muted flex items-center justify-center text-text-secondary">
                    <SquaresIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    No services created yet
                  </h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">
                    Add standard packages and offerings detailing your platform, deliverables, and rates so brands can collaborate with you.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddService}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Your First Service</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              ACTION CONTROLS (BACK & CONTINUE)
          ========================================================= */}
          <div className="mt-8 pt-6 border-t border-border-theme flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting || deletingProjectId || deletingServiceId || isInitialLoading}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-surface-muted hover:bg-background border border-border-theme text-foreground font-sans font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>
                  {currentStep === 2
                    ? "Back to Profile Info"
                    : currentStep === 3
                    ? "Back to Portfolio"
                    : currentStep === 4
                    ? "Back to Identity"
                    : "Back"}
                </span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting || deletingProjectId || deletingServiceId || isInitialLoading}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 font-sans font-semibold text-xs sm:text-sm tracking-wide shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer sm:ml-auto w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white dark:text-neutral-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>
                    {currentStep === 1
                      ? "Saving Profile..."
                      : currentStep === 3
                      ? "Saving Identity..."
                      : currentStep === 4
                      ? "Completing Onboarding..."
                      : "Processing..."}
                  </span>
                </span>
              ) : (
                <>
                  <span>
                    {currentStep === 1
                      ? "Continue to Portfolio"
                      : currentStep === 2
                      ? "Continue to Identity"
                      : currentStep === 3
                      ? "Continue to Services"
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
          MODAL: ADD / EDIT PORTFOLIO PROJECT
      ========================================================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-surface text-foreground rounded-2xl border border-border-theme shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-theme">
              <h2 className="text-lg font-serif font-medium text-foreground">
                {editingProjectId ? "Edit Portfolio Project" : "Add Portfolio Project"}
              </h2>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Error Alert */}
            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
                <span>⚠</span>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-4">
              {/* 1. Project Title */}
              <div className="space-y-1.5">
                <label
                  htmlFor="projTitle"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                >
                  Project Title *
                </label>
                <input
                  id="projTitle"
                  type="text"
                  maxLength={150}
                  disabled={isSubmittingProject}
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Summer Haute Couture Reel Campaign"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm font-sans focus:outline-none focus:border-secondary transition-all"
                />
              </div>

              {/* 2. Platform & Content Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="projPlatform"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                  >
                    Platform *
                  </label>
                  <select
                    id="projPlatform"
                    disabled={isSubmittingProject}
                    value={projectForm.platform}
                    onChange={(e) => {
                      const newPlat = e.target.value;
                      const defaultType =
                        PLATFORM_CONTENT_TYPES[newPlat]?.[0]?.value || "other";
                      setProjectForm((prev) => ({
                        ...prev,
                        platform: newPlat,
                        contentType: defaultType,
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs font-sans focus:outline-none focus:border-secondary transition-all cursor-pointer"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="website">Website / Blog</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="projContentType"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                  >
                    Content Type *
                  </label>
                  <select
                    id="projContentType"
                    disabled={isSubmittingProject}
                    value={projectForm.contentType}
                    onChange={(e) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        contentType: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs font-sans focus:outline-none focus:border-secondary transition-all cursor-pointer"
                  >
                    {(PLATFORM_CONTENT_TYPES[projectForm.platform] || [
                      { value: "other", label: "Other" },
                    ]).map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Project URL / Link */}
              <div className="space-y-1.5">
                <label
                  htmlFor="projUrl"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                >
                  Project Link / Published URL *
                </label>
                <input
                  id="projUrl"
                  type="text"
                  disabled={isSubmittingProject}
                  value={projectForm.url}
                  onChange={(e) =>
                    setProjectForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://instagram.com/reel/... or https://youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm font-sans focus:outline-none focus:border-secondary transition-all"
                />
              </div>

              {/* 4. Media Upload (Image or Video to Cloudinary) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block">
                  Project Media (Image or Video)
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  className="hidden"
                />

                {projectForm.coverImage ? (
                  <div className="relative p-3 rounded-xl border border-secondary/30 bg-secondary/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-surface border border-border-theme overflow-hidden shrink-0 flex items-center justify-center">
                        {projectForm.mediaType === "video" ? (
                          <VideoCameraIcon className="w-6 h-6 text-secondary" />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={projectForm.coverImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          {projectForm.mediaType === "video" ? "Video uploaded" : "Image uploaded"}
                        </span>
                        <span className="text-[11px] text-text-secondary block truncate max-w-[200px]">
                          {projectForm.coverImage}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface border border-border-theme text-foreground hover:bg-surface-muted transition-all cursor-pointer"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setProjectForm((prev) => ({
                            ...prev,
                            coverImage: "",
                          }))
                        }
                        className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Remove Media"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingMedia || isSubmittingProject}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-border-theme hover:border-secondary bg-background hover:bg-surface-muted/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 disabled:opacity-50"
                  >
                    {isUploadingMedia ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-secondary">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <ArrowUpTrayIcon className="w-5 h-5 text-secondary" />
                        <span className="text-xs font-semibold text-foreground">
                          Upload project cover or sample media
                        </span>
                        <span className="text-[11px] text-text-secondary">
                          Images up to 5MB (PNG, JPG, WebP) or Videos up to 50MB (MP4, WebM)
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 5. Project Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="projDesc"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans block"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="projDesc"
                  rows={3}
                  maxLength={2000}
                  disabled={isSubmittingProject}
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Outline what you created, results achieved, brand collaborated with, or creative styling..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm font-sans focus:outline-none focus:border-secondary transition-all resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-border-theme flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  disabled={isSubmittingProject || isUploadingMedia}
                  className="px-4 py-2.5 rounded-xl border border-border-theme bg-surface-muted hover:bg-background text-foreground text-xs sm:text-sm font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProject || isUploadingMedia}
                  className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProject ? "Saving Project..." : editingProjectId ? "Update Project" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: ADD / EDIT SERVICE (REUSABLE COMPONENT)
      ========================================================= */}
      <ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={handleCloseServiceModal}
        service={editingService}
        defaultCategory={formData.niches[0] || "Social Media Campaign"}
        onSuccess={async () => {
          await dispatch(getServices({ limit: 50 }));
          setSaveSuccessMessage(
            editingService
              ? "Service package updated successfully."
              : "Service package created successfully."
          );
        }}
      />



      {/* =========================================================
          FOOTER COPYRIGHT & HELP
      ========================================================= */}
      <footer className="max-w-3xl w-full mx-auto text-center pt-6 text-xs text-text-secondary font-sans">
        Need assistance? You can update all profile and portfolio information anytime in your Creator Settings.
      </footer>
    </div>
  );
}
