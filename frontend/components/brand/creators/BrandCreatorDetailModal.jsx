"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandCreatorById,
  clearSelectedCreator,
  saveCreator,
  unsaveCreator,
} from "@/redux/brand/creators/creators_slice";
import BrandCreateBookingModal from "@/components/brand/bookings/BrandCreateBookingModal";
import BrandContactUnlockSection from "./BrandContactUnlockSection";

// =========================================================
// FORMATTING HELPERS
// =========================================================
function formatCurrency(amount, currency = "INR") {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "N/A";
  const num = Number(amount);
  const currCode = (currency || "INR").toUpperCase();

  if (currCode === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currCode,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${currCode} ${num.toLocaleString()}`;
  }
}

function formatFollowers(count) {
  if (!count || isNaN(Number(count))) return "0";
  const num = Number(count);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return num.toLocaleString();
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "CR";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function formatSocialUrl(platform, rawValue) {
  if (!rawValue || typeof rawValue !== "string") return null;
  const val = rawValue.trim();
  if (isValidUrl(val)) return val;

  const cleanHandle = val.replace(/^@/, "");
  switch (platform.toLowerCase()) {
    case "instagram":
      return `https://instagram.com/${cleanHandle}`;
    case "youtube":
      return val.startsWith("http") ? val : `https://youtube.com/@${cleanHandle}`;
    case "twitter":
    case "x":
      return `https://twitter.com/${cleanHandle}`;
    case "tiktok":
      return `https://tiktok.com/@${cleanHandle}`;
    case "linkedin":
      return val.startsWith("http") ? val : `https://linkedin.com/in/${cleanHandle}`;
    default:
      return null;
  }
}

// =========================================================
// SVG ICONS
// =========================================================
function BookmarkIcon({ className = "w-4 h-4", filled = false }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.58A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckBadgeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

function ArrowPathIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function ArrowPathRoundedSquareIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-10.5 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
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

function FolderIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h3.378c.84 0 1.632-.44 2.062-1.157L11.25 6.5A2.25 2.25 0 0113.25 5.25h6.25A2.25 2.25 0 0121.75 7.5v5.25m-19.5 0A2.25 2.25 0 004.5 15h15a2.25 2.25 0 002.25-2.25m-19.5 0v5.25A2.25 2.25 0 004.5 20.25h15a2.25 2.25 0 002.25-2.25V12.75" />
    </svg>
  );
}

function BriefcaseIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function PhotoIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ModalPortfolioCover({ cover, title, category }) {
  const [prevCover, setPrevCover] = useState(cover);
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [failedUrl, setFailedUrl] = useState(null);

  if (cover !== prevCover) {
    setPrevCover(cover);
    setLoadedUrl(null);
    setFailedUrl(null);
  }

  const cleanCover = typeof cover === "string" ? cover.trim() : "";
  const isImgLoaded = loadedUrl === cleanCover;
  const isImgError = Boolean(cleanCover) && failedUrl === cleanCover;
  const isImgLoading = Boolean(cleanCover) && !isImgLoaded && !isImgError;

  return (
    <div className="h-44 sm:h-48 w-full bg-surface-muted overflow-hidden relative border-b border-border-theme">
      {cleanCover && !isImgError ? (
        <>
          {isImgLoading && (
            <div className="absolute inset-0 bg-surface-muted animate-pulse flex items-center justify-center text-text-secondary/30">
              <SparklesIcon className="w-8 h-8 opacity-30 text-secondary" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={cleanCover}
            src={cleanCover}
            alt={title || "Portfolio Work"}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoadedUrl(cleanCover)}
            onError={() => setFailedUrl(cleanCover)}
            className={`w-full h-full object-contain object-center transition-opacity duration-300 ${
              isImgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100/80 dark:bg-surface-muted/60 text-text-secondary p-4 text-center">
          <PhotoIcon className="w-8 h-8 opacity-30 mb-1.5 text-secondary" />
          <span className="text-[11px] font-medium text-text-secondary/80">
            {category || "Creative Work"}
          </span>
        </div>
      )}
      {category && (
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs z-10">
          {category}
        </span>
      )}
    </div>
  );
}

function ModalServiceCover({ cover, title, platform, category, contentType }) {
  const [prevCover, setPrevCover] = useState(cover);
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [failedUrl, setFailedUrl] = useState(null);

  if (cover !== prevCover) {
    setPrevCover(cover);
    setLoadedUrl(null);
    setFailedUrl(null);
  }

  const cleanCover = typeof cover === "string" ? cover.trim() : "";
  const isImgLoaded = loadedUrl === cleanCover;
  const isImgError = Boolean(cleanCover) && failedUrl === cleanCover;
  const isImgLoading = Boolean(cleanCover) && !isImgLoaded && !isImgError;

  return (
    <div className="relative h-40 sm:h-44 w-full bg-surface-muted overflow-hidden border-b border-border-theme">
      {cleanCover && !isImgError ? (
        <>
          {isImgLoading && (
            <div className="absolute inset-0 bg-surface-muted animate-pulse flex items-center justify-center text-text-secondary/30">
              <SparklesIcon className="w-8 h-8 opacity-30 text-secondary" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={cleanCover}
            src={cleanCover}
            alt={title || "Service package"}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoadedUrl(cleanCover)}
            onError={() => setFailedUrl(cleanCover)}
            className={`w-full h-full object-contain object-center transition-opacity duration-300 ${
              isImgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100/80 dark:bg-surface-muted/60 text-text-secondary p-4 text-center">
          <PhotoIcon className="w-8 h-8 opacity-30 mb-1.5 text-secondary" />
          <span className="text-[11px] font-medium text-text-secondary/80">
            {platform ? `${platform.charAt(0).toUpperCase() + platform.slice(1)} Package` : "Service Package"}
          </span>
        </div>
      )}

      {/* Floating platform & content type chips on top of cover */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none gap-2 z-10">
        {platform && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs uppercase tracking-wider">
            {platform}
          </span>
        )}
        {contentType && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/50 text-white/90 backdrop-blur-xs capitalize">
            {contentType}
          </span>
        )}
      </div>
    </div>
  );
}

// =========================================================
// MAIN MODAL COMPONENT
// =========================================================
export default function BrandCreatorDetailModal({
  isOpen,
  onClose,
  creatorId,
}) {
  const dispatch = useDispatch();

  const { selectedCreator, detailsLoading, detailsError, error: listError, savedCreatorIds, savingId } = useSelector(
    (state) => state.brandCreators || {}
  );
  const error = detailsError ?? listError;

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "portfolio" | "services"
  const [loadedAvatarUrl, setLoadedAvatarUrl] = useState(null);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);

  // Fetch full details when modal opens with creatorId
  useEffect(() => {
    if (isOpen && creatorId) {
      dispatch(fetchBrandCreatorById(creatorId));
      queueMicrotask(() => {
        setActiveTab("overview");
      });
    }
  }, [dispatch, isOpen, creatorId]);

  const handleClose = () => {
    if (isBookingModalOpen) return;
    dispatch(clearSelectedCreator());
    setLoadedAvatarUrl(null);
    setFailedAvatarUrl(null);
    onClose();
  };

  const handleRetry = () => {
    if (creatorId) {
      setLoadedAvatarUrl(null);
      setFailedAvatarUrl(null);
      dispatch(fetchBrandCreatorById(creatorId));
    }
  };

  const handleOpenBooking = (serviceItem) => {
    setSelectedServiceForBooking(serviceItem);
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedServiceForBooking(null);
  };

  if (!isOpen) return null;

  const isCorrectCreator = Boolean(creatorId) && (selectedCreator?._id === creatorId || selectedCreator?.id === creatorId);
  const creator = isCorrectCreator ? selectedCreator : null;

  const currentCreatorId = creator?._id || creator?.id || creatorId;
  const isSaved = Boolean(
    currentCreatorId &&
    Array.isArray(savedCreatorIds) &&
    savedCreatorIds.includes(currentCreatorId.toString())
  );
  const isSaving = Boolean(currentCreatorId && savingId === currentCreatorId.toString());

  const handleToggleSave = () => {
    if (!currentCreatorId || isSaving) return;
    if (isSaved) {
      dispatch(unsaveCreator(currentCreatorId));
    } else {
      dispatch(saveCreator(currentCreatorId));
    }
  };

  const cleanAvatarUrl = typeof creator?.profileImage === "string" ? creator.profileImage.trim() : "";
  const isProfileImgLoaded = Boolean(cleanAvatarUrl) && loadedAvatarUrl === cleanAvatarUrl;
  const isProfileImgError = Boolean(cleanAvatarUrl) && failedAvatarUrl === cleanAvatarUrl;
  const isProfileImgLoading = Boolean(cleanAvatarUrl) && !isProfileImgLoaded && !isProfileImgError;

  const name = creator?.user?.name || "Creator";
  const initials = getInitials(name);
  const isVerified = Boolean(creator?.isVerifiedBadge);
  const location = creator?.location || "Global";
  const category = creator?.category || "General";
  const bio = creator?.bio || "No bio description provided.";
  const followersStr = formatFollowers(creator?.followerCount);
  const engagement = typeof creator?.engagementRate === "number" ? `${creator.engagementRate}%` : "0%";
  const hasRating = typeof creator?.rating === "number" && creator.rating > 0;
  const ratingStr = hasRating ? `${creator.rating}` : "New";
  const reviewCount = creator?.reviewCount || 0;
  const minPriceFormatted = formatCurrency(creator?.minPrice);

  const portfolioItems = Array.isArray(creator?.portfolio) ? creator.portfolio : [];
  const servicesItems = Array.isArray(creator?.services) ? creator.services : [];

  // Extract available social links
  const socialLinksObj = creator?.socialLinks && typeof creator.socialLinks === "object" ? creator.socialLinks : {};
  const activeSocialLinks = Object.entries(socialLinksObj)
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([platform, value]) => ({
      platform,
      rawValue: value,
      href: formatSocialUrl(platform, value),
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 cursor-default" onClick={handleClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-border-theme bg-surface flex items-start justify-between gap-4">
          {detailsLoading && !creator ? (
            <div className="flex items-center gap-3.5 min-w-0 animate-pulse">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface-muted shrink-0" />
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-5 sm:h-6 w-36 bg-surface-muted rounded-md" />
                  <div className="h-4 w-16 bg-surface-muted rounded-md" />
                </div>
                <div className="h-3.5 w-48 bg-surface-muted rounded-md" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 overflow-hidden bg-surface-muted border border-border-theme flex items-center justify-center font-bold text-sm sm:text-base text-text-secondary">
                {cleanAvatarUrl && !isProfileImgError ? (
                  <>
                    {isProfileImgLoading && (
                      <div className="absolute inset-0 bg-surface-muted animate-pulse flex items-center justify-center text-text-secondary/40 font-mono text-xs uppercase">
                        {initials}
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={cleanAvatarUrl}
                      src={cleanAvatarUrl}
                      alt={name}
                      onLoad={() => setLoadedAvatarUrl(cleanAvatarUrl)}
                      onError={() => setFailedAvatarUrl(cleanAvatarUrl)}
                      className={`w-full h-full object-contain object-center transition-opacity duration-300 ${isProfileImgLoaded ? "opacity-100" : "opacity-0"
                        }`}
                    />
                  </>
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-serif font-semibold text-lg sm:text-xl text-foreground truncate" title={name}>
                    {name}
                  </h2>
                  {isVerified && (
                    <span className="text-secondary shrink-0" title="Verified Creator">
                      <CheckBadgeIcon className="w-5 h-5" />
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                    {category}
                  </span>
                </div>
                {creator?.title && (
                  <p className="text-xs text-secondary font-medium mt-0.5 truncate" title={creator.title}>
                    {creator.title}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-text-secondary mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-text-secondary" />
                    <span>{location}</span>
                  </span>
                  <span>•</span>
                  <span>{portfolioItems.length} {portfolioItems.length === 1 ? "Portfolio Item" : "Portfolio Items"}</span>
                  <span>•</span>
                  <span>{servicesItems.length} {servicesItems.length === 1 ? "Active Service" : "Active Services"}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {creator && (
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={isSaving}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSaved
                    ? "bg-secondary/10 border-secondary/40 text-secondary hover:bg-secondary/20"
                    : "bg-surface-muted border-border-theme text-text-secondary hover:text-foreground hover:border-secondary/40"
                }`}
                title={isSaved ? "Remove from Shortlist" : "Save Creator to Shortlist"}
              >
                <BookmarkIcon className="w-4 h-4" filled={isSaved} />
                <span>{isSaving ? "Updating..." : isSaved ? "Saved" : "Save"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-border-theme bg-surface-muted/40 px-4 sm:px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "overview"
              ? "border-secondary text-secondary"
              : "border-transparent text-text-secondary hover:text-foreground"
              }`}
          >
            <span>Profile & Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("portfolio")}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "portfolio"
              ? "border-secondary text-secondary"
              : "border-transparent text-text-secondary hover:text-foreground"
              }`}
          >
            <span>Portfolio</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-muted text-text-secondary border border-border-theme font-medium">
              {portfolioItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("services")}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "services"
              ? "border-secondary text-secondary"
              : "border-transparent text-text-secondary hover:text-foreground"
              }`}
          >
            <span>Services</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-muted text-text-secondary border border-border-theme font-medium">
              {servicesItems.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Loading Skeleton */}
          {detailsLoading && !creator && (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="h-18 bg-surface-muted rounded-xl" />
                <div className="h-18 bg-surface-muted rounded-xl" />
                <div className="h-18 bg-surface-muted rounded-xl" />
                <div className="h-18 bg-surface-muted rounded-xl" />
              </div>
              <div className="h-28 bg-surface-muted rounded-2xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-32 bg-surface-muted rounded-xl" />
                <div className="h-32 bg-surface-muted rounded-xl" />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3">
              <span>{typeof error === "string" ? error : "Failed to load creator profile details."}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowPathIcon />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Content When Loaded */}
          {!detailsLoading && creator && (
            <div>
              {/* TAB 1: PROFILE & OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Metrics Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-surface-muted/50 border border-border-theme p-3.5 rounded-xl text-center">
                      <span className="block text-[11px] text-text-secondary uppercase font-medium tracking-wider">
                        Followers
                      </span>
                      <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block">
                        {followersStr}
                      </span>
                    </div>

                    <div className="bg-surface-muted/50 border border-border-theme p-3.5 rounded-xl text-center">
                      <span className="block text-[11px] text-text-secondary uppercase font-medium tracking-wider">
                        Engagement
                      </span>
                      <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block">
                        {engagement}
                      </span>
                    </div>

                    <div className="bg-surface-muted/50 border border-border-theme p-3.5 rounded-xl text-center">
                      <span className="block text-[11px] text-text-secondary uppercase font-medium tracking-wider">
                        Rating
                      </span>
                      <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 flex items-center justify-center gap-1">
                        {hasRating ? (
                          <>
                            <span className="text-amber-500"><StarIcon /></span>
                            <span>{ratingStr}</span>
                            {reviewCount > 0 && (
                              <span className="text-xs text-text-secondary font-normal">({reviewCount})</span>
                            )}
                          </>
                        ) : (
                          <span className="text-secondary font-semibold text-sm">New</span>
                        )}
                      </span>
                    </div>

                    <div className="bg-surface-muted/50 border border-border-theme p-3.5 rounded-xl text-center">
                      <span className="block text-[11px] text-text-secondary uppercase font-medium tracking-wider">
                        Starting From
                      </span>
                      <span className="text-base sm:text-lg font-bold text-secondary mt-0.5 block">
                        {minPriceFormatted !== "N/A" ? minPriceFormatted : "Custom Quote"}
                      </span>
                    </div>
                  </div>

                  {/* Direct Contact Unlock Section */}
                  <BrandContactUnlockSection
                    creatorId={creator.user?._id || creator._id}
                    creatorName={creator.user?.name || "Creator"}
                  />

                  {/* Bio Card */}
                  <div className="bg-surface-muted/30 border border-border-theme rounded-2xl p-5 space-y-2">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      About Creator
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {bio}
                    </p>
                  </div>

                  {/* Specialization & Focus */}
                  <div className="bg-surface-muted/30 border border-border-theme rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Specialization & Focus
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-text-secondary font-medium">Primary Category:</span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                        {category}
                      </span>
                    </div>
                    {Array.isArray(creator?.keywords) && creator.keywords.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs text-text-secondary font-medium block">Keywords:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {creator.keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[11px] text-text-secondary bg-surface-muted border border-border-theme"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="bg-surface-muted/30 border border-border-theme rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Connected Channels & Socials
                    </h3>
                    {activeSocialLinks.length > 0 ? (
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {activeSocialLinks.map(({ platform, rawValue, href }) => {
                          const isClickable = Boolean(href);
                          const platformDisplay = platform.charAt(0).toUpperCase() + platform.slice(1);

                          if (isClickable) {
                            return (
                              <a
                                key={platform}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-theme hover:border-secondary/40 text-foreground hover:text-secondary text-xs font-medium transition-all shadow-2xs group"
                              >
                                <span className="font-semibold text-text-secondary group-hover:text-secondary">
                                  {platformDisplay}:
                                </span>
                                <span className="truncate max-w-[160px]">{rawValue}</span>
                                <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary group-hover:text-secondary" />
                              </a>
                            );
                          }

                          return (
                            <span
                              key={platform}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-theme text-foreground text-xs font-medium"
                            >
                              <span className="font-semibold text-text-secondary">{platformDisplay}:</span>
                              <span>{rawValue}</span>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary">
                        No external channels or social media handles linked.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PORTFOLIO */}
              {activeTab === "portfolio" && (
                <div className="space-y-4">
                  {portfolioItems.length === 0 ? (
                    <div className="bg-surface-muted/30 border border-border-theme rounded-2xl p-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-surface-muted text-text-secondary flex items-center justify-center mx-auto mb-3">
                        <FolderIcon />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        No Portfolio Items
                      </h4>
                      <p className="text-xs text-text-secondary max-w-sm mx-auto">
                        This creator has not published any public portfolio works yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {portfolioItems.map((item) => {
                        const contents = Array.isArray(item.contents) ? item.contents : [];
                        const directCover = typeof item.coverImage === "string" ? item.coverImage.trim() : "";
                        const itemImg = typeof item.image === "string" ? item.image.trim() : "";
                        const itemThumb = typeof item.thumbnail === "string" ? item.thumbnail.trim() : "";
                        const contentPreview = contents.find((c) => typeof c?.previewImage === "string" && c.previewImage.trim())?.previewImage?.trim();
                        const contentImgUrl = contents.find((c) => {
                          if (typeof c?.url !== "string" || !c.url.trim()) return false;
                          const u = c.url.trim().toLowerCase();
                          return u.includes("cloudinary.com") || /\.(jpeg|jpg|png|webp|gif)($|\?)/i.test(u);
                        })?.url?.trim();

                        const cover = directCover || itemImg || itemThumb || contentPreview || contentImgUrl || "";

                        return (
                          <div
                            key={item._id || item.id}
                            className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs hover:border-secondary/40 transition-all flex flex-col justify-between"
                          >
                            <div>
                              {/* Cover Image Preview */}
                              <ModalPortfolioCover
                                cover={cover}
                                title={item.title}
                                category={item.category}
                              />

                              {/* Portfolio Details */}
                              <div className="p-4 space-y-2">
                                <h4 className="font-semibold text-foreground text-sm font-sans" title={item.title}>
                                  {item.title}
                                </h4>
                                {item.description && (
                                  <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Contents & External Links */}
                            <div className="p-4 pt-2 border-t border-border-theme space-y-2 bg-surface-muted/20">
                              {contents.length > 0 ? (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                                    Published Content ({contents.length})
                                  </span>
                                  <div className="flex flex-col gap-1.5">
                                    {contents.map((content, cIdx) => {
                                      const hasValidUrl = isValidUrl(content.url);
                                      const plat = content.platform || "media";
                                      const cType = content.contentType || "work";
                                      const cTitle = content.title || `${plat} ${cType}`;
                                      const previewImg = typeof content.previewImage === "string" ? content.previewImage.trim() : "";

                                      return (
                                        <div
                                          key={content._id || cIdx}
                                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-surface border border-border-theme gap-2"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            {previewImg && (
                                              <div className="w-8 h-8 rounded-md overflow-hidden bg-surface-muted shrink-0 border border-border-theme relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                  src={previewImg}
                                                  alt={content.title || cTitle}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                  }}
                                                />
                                              </div>
                                            )}
                                            <div className="min-w-0">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-secondary/10 text-secondary capitalize shrink-0">
                                                  {plat}
                                                </span>
                                                <span className="text-[11px] text-text-secondary capitalize shrink-0">
                                                  {cType}
                                                </span>
                                              </div>
                                              {content.title && (
                                                <span className="text-xs text-foreground truncate font-medium block mt-0.5" title={cTitle}>
                                                  {content.title}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {hasValidUrl && (
                                            <a
                                              href={content.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline shrink-0"
                                            >
                                              <span>View</span>
                                              <ExternalLinkIcon className="w-3 h-3" />
                                            </a>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-text-secondary italic">
                                  No specific media attachments listed.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SERVICES */}
              {activeTab === "services" && (
                <div className="space-y-4">
                  {servicesItems.length === 0 ? (
                    <div className="bg-surface-muted/30 border border-border-theme rounded-2xl p-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-surface-muted text-text-secondary flex items-center justify-center mx-auto mb-3">
                        <BriefcaseIcon />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        No Active Services
                      </h4>
                      <p className="text-xs text-text-secondary max-w-sm mx-auto">
                        This creator has not listed any active packages or collaboration services yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {servicesItems.map((service) => {
                        const priceStr = formatCurrency(service.price, service.currency || "INR");
                        const deliverables = Array.isArray(service.deliverables) ? service.deliverables : [];
                        const pricingTypeBadge =
                          service.pricingType === "starting_from"
                            ? "Starting From"
                            : service.pricingType === "custom"
                              ? "Custom Quote"
                              : "Fixed Price";
                        const serviceCover =
                          (typeof service.coverImage === "string" && service.coverImage.trim()) ||
                          (typeof service.image === "string" && service.image.trim()) ||
                          (typeof service.thumbnail === "string" && service.thumbnail.trim()) ||
                          "";

                        return (
                          <div
                            key={service._id || service.id}
                            className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs hover:border-secondary/40 transition-all flex flex-col justify-between"
                          >
                            <div>
                              {/* Service Cover Image Preview */}
                              <ModalServiceCover
                                cover={serviceCover}
                                title={service.title}
                                platform={service.platform}
                                category={service.category}
                                contentType={service.contentType}
                              />

                              <div className="p-4 sm:p-5 space-y-3">
                                {/* Header: Title + Price */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                                        {service.platform || "Platform"}
                                      </span>
                                      {service.category && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border-theme">
                                          {service.category}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-semibold text-foreground text-sm font-sans" title={service.title}>
                                      {service.title}
                                    </h4>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-base font-bold text-foreground block">
                                      {priceStr}
                                    </span>
                                    <span className="text-[10px] text-text-secondary font-medium">
                                      {pricingTypeBadge}
                                    </span>
                                  </div>
                                </div>

                                {/* Description */}
                                {service.description && (
                                  <p className="text-xs text-text-secondary leading-relaxed">
                                    {service.description}
                                  </p>
                                )}

                                {/* Service Delivery Specs */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-theme text-xs">
                                  <div className="flex items-center gap-1.5 text-text-secondary">
                                    <ClockIcon className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                                    <span>
                                      {service.deliveryTime || 7}{" "}
                                      {service.deliveryTime === 1 ? "day delivery" : "days delivery"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-text-secondary">
                                    <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                                    <span>
                                      {typeof service.revisions === "number"
                                        ? `${service.revisions} ${service.revisions === 1 ? "revision" : "revisions"}`
                                        : "1 revision"}
                                    </span>
                                  </div>
                                </div>

                                {/* Deliverables List */}
                                {deliverables.length > 0 && (
                                  <div className="pt-2 border-t border-border-theme space-y-1.5">
                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                                      Included Deliverables
                                    </span>
                                    <ul className="space-y-1">
                                      {deliverables.map((deliv, dIdx) => (
                                        <li key={dIdx} className="flex items-start gap-1.5 text-xs text-foreground">
                                          <CheckCircleIcon className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                                          <span>{deliv}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Book Service Action Button */}
                            <div className="p-4 sm:p-5 pt-0">
                              <div className="pt-3 border-t border-border-theme">
                                <button
                                  type="button"
                                  onClick={() => handleOpenBooking(service)}
                                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <SparklesIcon className="w-3.5 h-3.5" />
                                  <span>Book Service</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Campaign-Backed Proposal Modal */}
      {isBookingModalOpen && (
        <BrandCreateBookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBooking}
          creator={creator}
          service={selectedServiceForBooking}
        />
      )}
    </div>
  );
}
