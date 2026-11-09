"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import {
  getBrandProfile,
  createBrandProfile,
  updateBrandProfile,
} from "@/redux/brand/profile/profile_slice";
import { uploadSingleImageApi } from "@/lib/upload";
import ProfileVerificationStatusCard from "@/components/common/ProfileVerificationStatusCard";

// =========================================================
// HELPER FOR INITIALS & DATE
// =========================================================
function getBrandDisplayInitial(name) {
  if (name && typeof name === "string" && name.trim()) {
    return name.trim()[0].toUpperCase();
  }
  return "M";
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
function BuildingIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5h.75m-.75 3h.75m-.75 3h.75" />
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

function CheckBadgeIcon({ className = "w-4 h-4 text-secondary" }) {
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

function CheckCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function CalendarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function BriefcaseIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v1.069m7.5 0c1.298.11 2.58.261 3.84.451m-15.18 0c1.26-.19 2.542-.341 3.84-.451" />
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

function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function StarIcon({ className = "w-4 h-4", filled = true }) {
  return (
    <svg
      className={className}
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

function LockClosedIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

// =========================================================
// SHARED LOGO PREVIEW COMPONENT
// =========================================================
function BrandLogoPreview({
  url,
  alt = "Company Logo",
  initials = "M",
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
      className={`relative ${className} rounded-2xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center bg-gradient-to-br from-[#ff5388] via-[#ff3b77] to-[#ff2d6c] text-white`}
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
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"
              }`}
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center select-none font-serif font-semibold text-3xl sm:text-4xl text-white tracking-wide">
          <div className="flex items-center">
            <span>{initials || "M"}</span>
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
// BRAND PROFILE FORM / VIEW COMPONENT
// =========================================================
export default function BrandProfileForm() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastFetchError, setLastFetchError] = useState("");

  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(
    (state) => state.brandProfile || {}
  );
  const { user: authUser } = useSelector(
    (state) => state.auth || {}
  );

  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    industry: "",
    website: "",
    logo: "",
    location: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      linkedin: "",
      youtube: "",
    },
    contactInformation: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Fetch brand profile on mount
  useEffect(() => {
    let isMounted = true;
    dispatch(getBrandProfile()).finally(() => {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        companyName: profile.companyName || "",
        description: profile.description || "",
        industry: profile.industry || "",
        website: profile.website || "",
        logo: profile.logo || "",
        location: profile.location || "",
        socialLinks: {
          instagram: profile.socialLinks?.instagram || "",
          facebook: profile.socialLinks?.facebook || "",
          linkedin: profile.socialLinks?.linkedin || "",
          youtube: profile.socialLinks?.youtube || "",
        },
        contactInformation: {
          name: profile.contactInformation?.name || "",
          email: profile.contactInformation?.email || "",
          phone: profile.contactInformation?.phone || "",
        },
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

  // Nested contact information change handler
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contactInformation: {
        ...(prev.contactInformation || {}),
        [name]: value,
      },
    }));
  };

  // Logo file selection and upload
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
    setIsUploadingLogo(true);

    try {
      const uploadRes = await uploadSingleImageApi(file);
      const uploadedUrl =
        uploadRes?.url ||
        uploadRes?.secure_url ||
        uploadRes?.data?.url ||
        uploadRes?.data?.secure_url;

      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          logo: uploadedUrl,
        }));

        if (profile && (profile._id || profile.id) && !isEditing) {
          const updatePayload = {
            ...profile,
            logo: uploadedUrl,
          };
          const actionResult = await dispatch(updateBrandProfile(updatePayload));
          if (updateBrandProfile.fulfilled.match(actionResult)) {
            setSuccessMessage("Brand logo updated successfully!");
          }
        }
      } else {
        setUploadError("Could not retrieve uploaded image URL.");
      }
    } catch (err) {
      const errMsg = formatErrorMessage(
        err?.response?.data?.message || err?.message || err,
        "Failed to upload logo image."
      );
      setUploadError(errMsg);
    } finally {
      setIsUploadingLogo(false);
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
    if (profile) {
      setFormData({
        companyName: profile.companyName || "",
        description: profile.description || "",
        industry: profile.industry || "",
        website: profile.website || "",
        logo: profile.logo || "",
        location: profile.location || "",
        socialLinks: {
          instagram: profile.socialLinks?.instagram || "",
          facebook: profile.socialLinks?.facebook || "",
          linkedin: profile.socialLinks?.linkedin || "",
          youtube: profile.socialLinks?.youtube || "",
        },
        contactInformation: {
          name: profile.contactInformation?.name || "",
          email: profile.contactInformation?.email || "",
          phone: profile.contactInformation?.phone || "",
        },
      });
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    setSuccessMessage("");
    setSaveError("");
    setUploadError("");

    const hasExistingProfile = Boolean(profile && (profile._id || profile.id));

    try {
      setIsSubmitting(true);
      let actionResult;
      if (hasExistingProfile) {
        actionResult = await dispatch(updateBrandProfile(formData));
      } else {
        actionResult = await dispatch(createBrandProfile(formData));
      }

      if (
        updateBrandProfile.fulfilled.match(actionResult) ||
        createBrandProfile.fulfilled.match(actionResult)
      ) {
        setSuccessMessage(
          hasExistingProfile
            ? "Brand profile updated successfully!"
            : "Brand profile created successfully!"
        );
        setIsEditing(false);
      } else {
        const errMsg = formatErrorMessage(
          actionResult?.payload || error,
          hasExistingProfile
            ? "Failed to update brand profile."
            : "Failed to create brand profile."
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
      const actionResult = await dispatch(getBrandProfile());
      if (getBrandProfile.fulfilled.match(actionResult)) {
        setLastFetchError("");
      } else if (getBrandProfile.rejected.match(actionResult)) {
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

  // Dynamic values using actual profile and auth state
  const brandName = profile?.companyName || authUser?.name || "Brand User";
  const category = profile?.industry || "";
  const location = profile?.location || "";
  const websiteUrl = profile?.website || "";
  const displayInitial = getBrandDisplayInitial(brandName);
  const description = profile?.description || "";
  const instagramUrl = profile?.socialLinks?.instagram || "";
  const youtubeUrl = profile?.socialLinks?.youtube || "";
  const facebookUrl = profile?.socialLinks?.facebook || "";
  const linkedinUrl = profile?.socialLinks?.linkedin || "";
  const contactName = profile?.contactInformation?.name || authUser?.name || "Not specified";
  const contactEmail = profile?.contactInformation?.email || authUser?.email || "Not specified";
  const contactPhone = profile?.contactInformation?.phone || "Not specified";
  const joinedOn = formatJoinedDate(profile?.createdAt || authUser?.createdAt);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Hidden File Input for Logo Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload brand logo file"
      />

      {/* Sidebar Component */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar Component */}
        <BrandHeader setMobileOpen={setMobileOpen} />

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
                    Brand Profile
                  </h1>
                  <p className="text-xs sm:text-sm text-text-secondary mt-0.5 font-sans">
                    Update your company information, social presence, and primary point of contact.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 font-sans">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting || isUploadingLogo}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-border-theme bg-white dark:bg-[#16161e] hover:bg-slate-50 dark:hover:bg-surface-muted text-slate-900 dark:text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploadingLogo}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#fff0f4] dark:bg-[#2a171f] text-[#ff2d6c] border border-[#ff2d6c]/20 mb-2 font-sans">
                  ACCOUNT MANAGEMENT
                </span>
                <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-foreground tracking-wide">
                  Brand Profile
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 font-sans">
                  Manage your company information, social presence, and primary point of contact.
                </p>
              </div>

              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage("");
                  setSaveError("");
                  setUploadError("");
                  setIsEditing(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#252525] hover:bg-[#111111] text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
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
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
          {/* VIEW MODE: EXACT MATCH TO USER'S REFERENCE SCREENSHOT */}
          {/* ========================================================= */}
          {!isEditing && (
            <div className="space-y-6">

              {/* 1. HERO BANNER CARD */}
              <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xs">
                {/* Dreamy subtle pastel wave accent in corner */}
                <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 pointer-events-none opacity-40 dark:opacity-10 overflow-hidden select-none">
                  <svg
                    viewBox="0 0 400 200"
                    preserveAspectRatio="none"
                    className="w-full h-full text-pink-100 dark:text-pink-950"
                  >
                    <path
                      d="M100,0 C220,130 180,180 400,200 L400,0 Z"
                      fill="currentColor"
                      fillOpacity="0.5"
                    />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Avatar + Title + Category + Location + Website */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                    {/* Brand Logo Avatar */}
                    <div className="relative shrink-0">
                      <BrandLogoPreview
                        url={profile?.logo}
                        alt={brandName}
                        initials={displayInitial}
                        isUploading={isUploadingLogo}
                        className="w-20 h-20 sm:w-22 sm:h-22"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        aria-label="Change brand logo"
                        title="Change brand logo"
                        className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-surface border border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted shadow-xs transition-colors cursor-pointer ${isUploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                      >
                        <CameraIcon className="w-3.5 h-3.5 text-secondary" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-serif font-semibold text-2xl sm:text-[26px] text-slate-900 dark:text-foreground tracking-wide break-words">
                          {brandName}
                        </h2>
                        {Boolean(profile?.isVerifiedBusiness) && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 shadow-xs"
                            title="Official Verified Business"
                          >
                            <CheckBadgeIcon className="w-3.5 h-3.5" />
                            Verified Business
                          </span>
                        )}
                      </div>

                      {/* Location, Joined Date, Website & Social Channels */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-sans text-text-secondary pt-0.5">
                        {location && (
                          <span className="inline-flex items-center gap-1.5 text-text-secondary">
                            <MapPinIcon className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                            <span>{location}</span>
                          </span>
                        )}

                        {location && joinedOn && (
                          <span className="text-border-theme">•</span>
                        )}

                        {joinedOn && (
                          <span className="inline-flex items-center gap-1.5 text-text-secondary">
                            <CalendarIcon className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                            <span>Joined {joinedOn}</span>
                          </span>
                        )}

                        {(location || joinedOn) && (websiteUrl || instagramUrl || youtubeUrl || facebookUrl || linkedinUrl) && (
                          <span className="text-border-theme hidden sm:inline">|</span>
                        )}

                        {websiteUrl && (
                          <a
                            href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#ff2d6c] hover:underline font-medium truncate max-w-[220px]"
                            title={websiteUrl}
                          >
                            <GlobeIcon className="w-3.5 h-3.5 text-[#ff2d6c] shrink-0" />
                            <span className="truncate">{websiteUrl.replace(/^https?:\/\/(www\.)?/, "")}</span>
                            <ExternalLinkIcon className="w-3 h-3 text-[#ff2d6c] shrink-0" />
                          </a>
                        )}

                        {(instagramUrl || youtubeUrl || facebookUrl || linkedinUrl) && (
                          <div className="flex items-center gap-1.5 ml-0.5">
                            {instagramUrl && (
                              <a
                                href={instagramUrl.startsWith("http") ? instagramUrl : `https://${instagramUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-md text-text-secondary hover:text-[#ff2d6c] hover:bg-[#fff0f4] dark:hover:bg-[#ff2d6c]/10 transition-colors"
                                title="Instagram"
                              >
                                <InstagramIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {youtubeUrl && (
                              <a
                                href={youtubeUrl.startsWith("http") ? youtubeUrl : `https://${youtubeUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-md text-text-secondary hover:text-[#ff2d6c] hover:bg-[#fff0f4] dark:hover:bg-[#ff2d6c]/10 transition-colors"
                                title="YouTube"
                              >
                                <YoutubeIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {facebookUrl && (
                              <a
                                href={facebookUrl.startsWith("http") ? facebookUrl : `https://${facebookUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-md text-text-secondary hover:text-[#ff2d6c] hover:bg-[#fff0f4] dark:hover:bg-[#ff2d6c]/10 transition-colors"
                                title="Facebook"
                              >
                                <FacebookIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {linkedinUrl && (
                              <a
                                href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-md text-text-secondary hover:text-[#ff2d6c] hover:bg-[#fff0f4] dark:hover:bg-[#ff2d6c]/10 transition-colors"
                                title="LinkedIn"
                              >
                                <LinkedinIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}

                        {!location && !joinedOn && !websiteUrl && !instagramUrl && !youtubeUrl && !facebookUrl && !linkedinUrl && (
                          <span className="text-text-secondary/60 italic">Location and social links not set</span>
                        )}
                      </div>

                      {/* Bottom Badges Row: Profile Active + Highlighted Category / Niche Badge */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Profile Active Badge */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckIcon className="w-3 h-3 shrink-0" />
                          <span>Profile Active</span>
                        </span>

                        {/* Highlighted Category / Niche Badge with Sparkles */}
                        {category && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff0f4] dark:bg-[#ff2d6c]/10 text-[#ff2d6c] border border-[#ff2d6c]/20">
                            <SparklesIcon className="w-3.5 h-3.5 text-[#ff2d6c] shrink-0" />
                            <span>{category}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: 3 Stats Columns */}
                  <div className="flex items-center justify-around sm:justify-end gap-6 sm:gap-8 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border-theme/60">
                    <div className="text-center sm:text-left">
                      <span className="block text-[22px] sm:text-[24px] font-semibold font-sans text-slate-900 dark:text-foreground leading-none">
                        12
                      </span>
                      <span className="block text-[10px] sm:text-[11px] text-text-secondary mt-1.5 font-sans leading-tight">
                        Active<br className="hidden sm:inline" /> Campaigns
                      </span>
                    </div>
                    <div className="h-10 w-px bg-border-theme" />
                    <div className="text-center sm:text-left">
                      <span className="block text-[22px] sm:text-[24px] font-semibold font-sans text-slate-900 dark:text-foreground leading-none">
                        48K
                      </span>
                      <span className="block text-[10px] sm:text-[11px] text-text-secondary mt-1.5 font-sans leading-tight">
                        Total<br className="hidden sm:inline" /> Reach
                      </span>
                    </div>
                    <div className="h-10 w-px bg-border-theme" />
                    <div className="text-center sm:text-left">
                      <span className="block text-[22px] sm:text-[24px] font-semibold font-sans text-slate-900 dark:text-foreground leading-none">
                        4.8
                      </span>
                      <span className="block text-[10px] sm:text-[11px] text-text-secondary mt-1.5 font-sans leading-tight">
                        Brand<br className="hidden sm:inline" /> Rating
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Verification Status & Feedback */}
              <ProfileVerificationStatusCard
                role="brand"
                verification={profile?.verification}
                onRefresh={() => dispatch(getBrandProfile())}
              />

              {/* 2. TWO-COLUMN MAIN CONTENT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

                {/* LEFT COLUMN: 8 COLS */}
                <div className="lg:col-span-8 space-y-5 sm:space-y-6">

                  {/* Card 1: Company Overview */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="flex items-center gap-2.5">
                      <BuildingIcon className="w-4 h-4 text-black dark:text-white" />
                      <h3 className="font-semibold text-base text-slate-900 dark:text-foreground font-sans tracking-wide">
                        Company Overview
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans whitespace-pre-line">
                      {description || (
                        <span className="italic text-text-secondary/70">
                          No company description provided yet. Click &apos;Edit Profile&apos; to add information about your company.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Card 2: Creator Reviews & Reputation */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <StarIcon className="w-5 h-5 fill-amber-400 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-foreground font-sans">
                          Creator Reviews & Ratings
                        </h4>
                        <p className="text-xs text-text-secondary mt-0.5 font-sans">
                          Verified ratings, testimonials, and feedback received from creators on completed collaborations.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/brand/reviews"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      <span>View Creator Reviews</span>
                      <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                    </Link>
                  </div>

                  {/* Card 3: Social Presence */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="flex items-center gap-2.5">
                      <GlobeIcon className="w-4 h-4 text-black dark:text-white" />
                      <h3 className="font-semibold text-base text-slate-900 dark:text-foreground font-sans tracking-wide">
                        Social Presence
                      </h3>
                    </div>
                    {(instagramUrl || youtubeUrl || facebookUrl || linkedinUrl) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                        {/* Instagram */}
                        {instagramUrl && (
                          <a
                            href={instagramUrl.startsWith("http") ? instagramUrl : `https://${instagramUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 sm:p-3.5 rounded-xl border border-border-theme bg-white dark:bg-surface-muted/30 hover:border-secondary/40 hover:bg-surface-muted/50 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 shadow-xs">
                                <InstagramIcon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-semibold text-slate-900 dark:text-foreground group-hover:text-secondary transition-colors font-sans">
                                  Instagram
                                </span>
                                <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-sans">
                                  {instagramUrl.replace(/^https?:\/\/(www\.)?/, "")}
                                </span>
                              </div>
                            </div>
                            <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary/60 group-hover:text-secondary shrink-0 transition-colors" />
                          </a>
                        )}

                        {/* YouTube */}
                        {youtubeUrl && (
                          <a
                            href={youtubeUrl.startsWith("http") ? youtubeUrl : `https://${youtubeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 sm:p-3.5 rounded-xl border border-border-theme bg-white dark:bg-surface-muted/30 hover:border-secondary/40 hover:bg-surface-muted/50 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <div className="w-9 h-9 rounded-xl bg-[#ff0000] flex items-center justify-center text-white shrink-0 shadow-xs">
                                <YoutubeIcon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-semibold text-slate-900 dark:text-foreground group-hover:text-secondary transition-colors font-sans">
                                  YouTube
                                </span>
                                <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-sans">
                                  {youtubeUrl.replace(/^https?:\/\/(www\.)?/, "")}
                                </span>
                              </div>
                            </div>
                            <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary/60 group-hover:text-secondary shrink-0 transition-colors" />
                          </a>
                        )}

                        {/* Facebook */}
                        {facebookUrl && (
                          <a
                            href={facebookUrl.startsWith("http") ? facebookUrl : `https://${facebookUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 sm:p-3.5 rounded-xl border border-border-theme bg-white dark:bg-surface-muted/30 hover:border-secondary/40 hover:bg-surface-muted/50 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <div className="w-9 h-9 rounded-xl bg-[#1877f2] flex items-center justify-center text-white shrink-0 shadow-xs">
                                <FacebookIcon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-semibold text-slate-900 dark:text-foreground group-hover:text-secondary transition-colors font-sans">
                                  Facebook
                                </span>
                                <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-sans">
                                  {facebookUrl.replace(/^https?:\/\/(www\.)?/, "")}
                                </span>
                              </div>
                            </div>
                            <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary/60 group-hover:text-secondary shrink-0 transition-colors" />
                          </a>
                        )}

                        {/* LinkedIn */}
                        {linkedinUrl && (
                          <a
                            href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 sm:p-3.5 rounded-xl border border-border-theme bg-white dark:bg-surface-muted/30 hover:border-secondary/40 hover:bg-surface-muted/50 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <div className="w-9 h-9 rounded-xl bg-[#0077b5] flex items-center justify-center text-white shrink-0 shadow-xs">
                                <LinkedinIcon className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-semibold text-slate-900 dark:text-foreground group-hover:text-secondary transition-colors font-sans">
                                  LinkedIn
                                </span>
                                <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-sans">
                                  {linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}
                                </span>
                              </div>
                            </div>
                            <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary/60 group-hover:text-secondary shrink-0 transition-colors" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary/70 italic font-sans">
                        No social channels linked yet. Click &apos;Edit Profile&apos; to connect your social profiles.
                      </p>
                    )}
                  </div>

                  {/* Card 4: Contact Information */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="flex items-center gap-2.5">
                      <UserGroupIcon className="w-4 h-4 text-black dark:text-white" />
                      <h3 className="font-semibold text-base text-slate-900 dark:text-foreground font-sans tracking-wide">
                        Contact Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                      <div>
                        <span className="block text-text-secondary uppercase tracking-wider text-[10px] font-semibold mb-1">
                          Contact Name
                        </span>
                        <span className="font-medium text-slate-900 dark:text-foreground text-xs">
                          {contactName}
                        </span>
                      </div>
                      <div>
                        <span className="block text-text-secondary uppercase tracking-wider text-[10px] font-semibold mb-1">
                          Contact Email
                        </span>
                        <span className="font-medium text-slate-900 dark:text-foreground text-xs">
                          {contactEmail}
                        </span>
                      </div>
                      <div>
                        <span className="block text-text-secondary uppercase tracking-wider text-[10px] font-semibold mb-1">
                          Contact Phone
                        </span>
                        <span className="font-medium text-slate-900 dark:text-foreground text-xs">
                          {contactPhone}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: 4 COLS */}
                <div className="lg:col-span-4 space-y-5 sm:space-y-6">

                  {/* Card 1: Brand Details */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border-theme/60">
                      <BriefcaseIcon className="w-4 h-4 text-black dark:text-white" />
                      <h3 className="font-semibold text-base text-slate-900 dark:text-foreground font-sans tracking-wide">
                        Brand Details
                      </h3>
                    </div>
                    <div className="space-y-3.5 text-xs font-sans">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-secondary font-medium">Category</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fff0f4] dark:bg-[#ff2d6c]/10 text-[#ff2d6c] border border-[#ff2d6c]/20">
                          {category || "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-secondary font-medium">Website</span>
                        {websiteUrl ? (
                          <a
                            href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ff2d6c] hover:underline font-medium inline-flex items-center gap-1 truncate max-w-[170px]"
                          >
                            <span className="truncate">{websiteUrl.replace(/^https?:\/\/(www\.)?/, "")}</span>
                            <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-text-secondary/70 italic">Not set</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-secondary font-medium">Location</span>
                        <span className="font-medium text-slate-900 dark:text-foreground">
                          {location || "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-secondary font-medium">Joined On</span>
                        <span className="font-medium text-slate-900 dark:text-foreground">
                          {joinedOn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Brand Highlights */}
                  <div className="bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border-theme/60">
                      <SparklesIcon className="w-4 h-4 text-black dark:text-white" />
                      <h3 className="font-semibold text-base text-slate-900 dark:text-foreground font-sans tracking-wide">
                        Brand Highlights
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 font-sans">
                      <div>
                        <span className="block text-[17px] font-semibold text-slate-900 dark:text-foreground leading-tight">
                          50+
                        </span>
                        <span className="block text-[10px] text-text-secondary mt-0.5 leading-snug">
                          Creators Collaborated
                        </span>
                      </div>
                      <div>
                        <span className="block text-[17px] font-semibold text-slate-900 dark:text-foreground leading-tight">
                          8
                        </span>
                        <span className="block text-[10px] text-text-secondary mt-0.5 leading-snug">
                          Countries Reached
                        </span>
                      </div>
                      <div>
                        <span className="block text-[17px] font-semibold text-slate-900 dark:text-foreground leading-tight">
                          120K+
                        </span>
                        <span className="block text-[10px] text-text-secondary mt-0.5 leading-snug">
                          Total Engagement
                        </span>
                      </div>
                      <div>
                        <span className="block text-[17px] font-semibold text-slate-900 dark:text-foreground leading-tight">
                          4.8
                        </span>
                        <span className="block text-[10px] text-text-secondary mt-0.5 leading-snug">
                          Avg. Campaign Rating
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* EDIT MODE: FULL PROFILE FORM */}
          {/* ========================================================= */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Admin Verification Feedback Banner (visible while editing) */}
              {(profile?.verification?.status === "rejected" || profile?.verification?.status === "revoked") && (
                <div className="p-4 sm:p-5 bg-rose-500/10 border border-rose-500/25 rounded-2xl sm:rounded-3xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300">
                      Admin Verification Feedback — Action Required Before Re-submitting
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      <span className="font-semibold text-foreground">Feedback / Reason: </span>
                      {profile.verification.reason || "Please update your company details according to platform verification standards."}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      Update the relevant details below and click &ldquo;Save Profile&rdquo;. Once saved, you can re-submit your verification request for administrative review.
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Company Details Card */}
              <div className="bg-white dark:bg-[#131318] border border-slate-200/90 dark:border-[#22222e] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-border-theme/60 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-surface-muted dark:bg-[#1f1f28] flex items-center justify-center text-black dark:text-white shrink-0">
                    <BuildingIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground font-sans tracking-wide">
                      Company Details
                    </h2>
                    <p className="text-xs text-text-secondary font-sans mt-0.5">
                      Basic information about your brand, identity, and logo.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 font-sans">
                  {/* Company Logo and File Upload (On Top) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Company Logo
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-surface-muted/30 border border-slate-200 dark:border-border-theme">
                      {/* Logo Preview with Upload Button */}
                      <div className="relative shrink-0">
                        <BrandLogoPreview
                          url={formData.logo}
                          alt={formData.companyName || "Brand Logo Preview"}
                          initials={getBrandDisplayInitial(formData.companyName)}
                          isUploading={isUploadingLogo}
                          className="w-20 h-20 rounded-2xl"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingLogo}
                          aria-label="Upload company logo image"
                          title="Upload company logo image"
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
                            disabled={isUploadingLogo}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-neutral-900 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                          >
                            <UploadIcon className="w-3.5 h-3.5 text-white" />
                            <span>{isUploadingLogo ? "Uploading..." : "Upload Logo Image"}</span>
                          </button>

                          <span className="text-xs text-text-secondary">or</span>

                          <div className="relative flex-1 min-w-[170px]">
                            <LinkIcon className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="url"
                              name="logo"
                              value={formData.logo}
                              onChange={handleInputChange}
                              placeholder="Paste logo image URL"
                              disabled={isUploadingLogo}
                              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                            />
                          </div>

                          {formData.logo ? (
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                              disabled={isUploadingLogo}
                              className="px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>

                        <p className="text-[11px] text-text-secondary">
                          JPEG, PNG or WebP (max 5 MB)
                        </p>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label
                              htmlFor="logo-url-input"
                              className="block text-[11px] font-medium text-text-secondary"
                            >
                              Or enter Logo Image URL:
                            </label>
                            {Boolean(formData.logo && (formData.logo.includes("cloudinary.com") || formData.logo.includes("res.cloudinary.com"))) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md border border-secondary/20">
                                <LockClosedIcon className="w-3 h-3" />
                                <span>Locked (Uploaded)</span>
                              </span>
                            )}
                          </div>
                          <div className="relative flex items-center">
                            <input
                              id="logo-url-input"
                              type="url"
                              name="logo"
                              value={formData.logo}
                              readOnly={Boolean(formData.logo && (formData.logo.includes("cloudinary.com") || formData.logo.includes("res.cloudinary.com")))}
                              onChange={(e) => {
                                if (formData.logo && (formData.logo.includes("cloudinary.com") || formData.logo.includes("res.cloudinary.com"))) return;
                                handleInputChange(e);
                              }}
                              placeholder="https://example.com/logo.png"
                              disabled={isUploadingLogo}
                              className={`w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none transition-colors disabled:opacity-60 ${
                                formData.logo && (formData.logo.includes("cloudinary.com") || formData.logo.includes("res.cloudinary.com"))
                                  ? "bg-surface-muted/90 border border-border-theme font-mono text-[11px] cursor-not-allowed select-all pr-9"
                                  : "bg-surface border border-border-theme text-foreground focus:border-secondary"
                              }`}
                            />
                            {Boolean(formData.logo && (formData.logo.includes("cloudinary.com") || formData.logo.includes("res.cloudinary.com"))) && (
                              <div className="absolute right-3 text-secondary pointer-events-none" title="URL locked after upload">
                                <LockClosedIcon className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          {Boolean(formData.logo && (formData.logo.includes("cloudinary.com") || formData.logo.includes("res.cloudinary.com"))) && (
                            <p className="text-[10px] text-text-secondary mt-1">
                              🔒 Uploaded via Cloudinary (locked against accidental editing).
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Company Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Corp"
                        required
                        className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                      />
                    </div>

                    {/* Industry */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        Industry / Category
                      </label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        placeholder="e.g. Fashion & Apparel"
                        className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. Mumbai, India"
                        className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                      />
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                        Website URL
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://yourbrand.com"
                        className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Company Overview / Description
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of your brand, products, and campaign focus..."
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Social Links Card */}
              <div className="bg-white dark:bg-[#131318] border border-slate-200/90 dark:border-[#22222e] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-border-theme/60 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-surface-muted dark:bg-[#1f1f28] flex items-center justify-center text-black dark:text-white shrink-0">
                    <GlobeIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground font-sans tracking-wide">
                      Social Links
                    </h2>
                    <p className="text-xs text-text-secondary font-sans mt-0.5">
                      Connect your brand social media profiles.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-sans">
                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Instagram
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.socialLinks.instagram}
                      onChange={handleSocialChange}
                      placeholder="https://instagram.com/yourbrand"
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                    />
                  </div>

                  {/* Facebook */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Facebook
                    </label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.socialLinks.facebook}
                      onChange={handleSocialChange}
                      placeholder="https://facebook.com/yourbrand"
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleSocialChange}
                      placeholder="https://linkedin.com/company/yourbrand"
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      YouTube
                    </label>
                    <input
                      type="text"
                      name="youtube"
                      value={formData.socialLinks.youtube}
                      onChange={handleSocialChange}
                      placeholder="https://youtube.com/@yourbrand"
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Contact Information Card */}
              <div className="bg-white dark:bg-[#131318] border border-slate-200/90 dark:border-[#22222e] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-border-theme/60 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-surface-muted dark:bg-[#1f1f28] flex items-center justify-center text-black dark:text-white shrink-0">
                    <UserGroupIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground font-sans tracking-wide">
                      Contact Information
                    </h2>
                    <p className="text-xs text-text-secondary font-sans mt-0.5">
                      Primary point of contact for creator communications.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 font-sans">
                  {/* Contact Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.contactInformation.name}
                      onChange={handleContactChange}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                    />
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.contactInformation.email}
                      onChange={handleContactChange}
                      placeholder="contact@brand.com"
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.contactInformation.phone}
                      onChange={handleContactChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-border-theme text-foreground placeholder:text-text-secondary/50 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Action Buttons (Cancel & Submit) */}
              <div className="flex items-center justify-end gap-3 pt-2 font-sans">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting || isUploadingLogo}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-border-theme bg-white dark:bg-[#16161e] hover:bg-slate-50 dark:hover:bg-surface-muted text-slate-900 dark:text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingLogo}
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

            </form>
          )}

        </main>
      </div>
    </div>
  );
}
