"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCreatorProfile,
  updateCreatorProfile,
  createCreatorProfile,
} from "@/redux/creator/profile/profile_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

// =========================================================
// SVG ICONS (Lean & Clean)
// =========================================================
function MapPinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function MailIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
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

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function UsersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ChartBarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
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

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
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

function TiktokIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525 9.072v3.655c.677.305 1.428.483 2.222.483 2.879 0 5.214-2.335 5.214-5.214 0-.17-.01-.339-.028-.505A7.473 7.473 0 0023 6.002a7.483 7.483 0 01-4.23 1.205 5.225 5.225 0 00-3.771-1.608 5.214 5.214 0 00-5.214 5.214c0 .35.035.692.102 1.022-4.328-.217-8.167-2.29-10.736-5.441a5.187 5.187 0 00-.706 2.623c0 1.808.92 3.404 2.319 4.339a5.176 5.176 0 01-2.361-.652v.066c0 2.525 1.797 4.632 4.182 5.111a5.244 5.244 0 01-2.355.089c.663 2.07 2.587 3.577 4.869 3.619A10.46 10.46 0 010 20.354 14.75 14.75 0 007.981 22.69c9.577 0 14.815-7.933 14.815-14.815 0-.226-.005-.451-.015-.675A10.584 10.584 0 0024 4.557a10.373 10.373 0 01-3.003.823 5.24 5.24 0 002.3-2.893 10.457 10.457 0 01-3.32 1.269A5.204 5.204 0 0016.155 2c-2.879 0-5.214 2.335-5.214 5.214 0 .409.046.807.133 1.189A14.78 14.78 0 011.644 3.737a5.215 5.215 0 001.613 6.953 5.174 5.174 0 01-2.36-.652v.065c0 2.526 1.797 4.633 4.182 5.112a5.228 5.228 0 01-2.355.089c.663 2.07 2.587 3.577 4.869 3.619A10.46 10.46 0 010 20.354z" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m-17.432-6.75A8.959 8.959 0 003 12c0 .778.099 1.533.284 2.253" />
    </svg>
  );
}

const defaultFormValues = {
  bio: "",
  category: "Fashion & Luxury",
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
};

export default function CreatorProfile() {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.profile);
  const authUser = useSelector((state) => state.auth?.user);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(defaultFormValues);
  const [successToast, setSuccessToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch profile on initial component mount
  useEffect(() => {
    dispatch(getCreatorProfile());
  }, [dispatch]);

  // Sync local form state whenever profile loaded from Redux
  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || "",
        category: profile.category || "Fashion & Luxury",
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
      });
    }
  }, [profile]);

  // Compute Display Name & Initials
  const displayName = profile?.user?.name || authUser?.name || "Creator";
  const displayEmail = profile?.user?.email || authUser?.email || "No email available";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "CR";

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  const handleToggleVisibility = () => {
    setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }));
  };

  // Save changes via Redux (Update if profile exists, Create if not)
  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      bio: formData.bio,
      category: formData.category,
      location: formData.location,
      profileImage: formData.profileImage,
      isPublic: formData.isPublic,
      socialLinks: {
        instagram: formData.socialLinks?.instagram || "",
        facebook: formData.socialLinks?.facebook || "",
        youtube: formData.socialLinks?.youtube || "",
        tiktok: formData.socialLinks?.tiktok || "",
        website: formData.socialLinks?.website || "",
      },
    };

    let resultAction;
    if (profile) {
      resultAction = await dispatch(updateCreatorProfile(payload));
    } else {
      resultAction = await dispatch(createCreatorProfile(payload));
    }

    setSubmitting(false);

    if (!resultAction.error) {
      setIsEditing(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3500);
    }
  };

  // Cancel edit mode and restore latest Redux profile values
  const handleCancel = () => {
    if (profile) {
      setFormData({
        bio: profile.bio || "",
        category: profile.category || "Fashion & Luxury",
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
      });
    } else {
      setFormData(defaultFormValues);
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar Component */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Profile Main Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Initial Loading Skeleton */}
          {loading && !profile && (
            <div className="bg-surface border border-border-theme rounded-2xl p-8 space-y-6 animate-pulse">
              <div className="h-6 bg-surface-muted rounded-lg w-1/4" />
              <div className="h-24 bg-surface-muted rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-surface-muted rounded-xl" />
                <div className="h-20 bg-surface-muted rounded-xl" />
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {successToast && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-emerald-500/20 rounded-full">
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                </span>
                <span>Profile saved successfully!</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessToast(false)}
                className="text-emerald-500/70 hover:text-emerald-500 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Redux Error Banner (ignoring soft 404 missing profile error) */}
          {error && !error.toLowerCase().includes("not found") && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl text-xs font-medium">
              <span>{error}</span>
            </div>
          )}

          {/* 1. PAGE HEADER */}
          <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
                My Profile
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Manage your public creator identity, social channels, and visibility preferences.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    handleCancel();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
                  isEditing
                    ? "bg-surface-muted border border-border-theme text-foreground hover:bg-surface"
                    : "bg-secondary hover:bg-secondary-dark text-white"
                }`}
              >
                {isEditing ? (
                  <span>Cancel Editing</span>
                ) : (
                  <>
                    <PencilIcon />
                    <span>{profile ? "Edit Profile" : "Create Profile"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. PROFILE OVERVIEW HERO CARD */}
          <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs">
            {/* Decorative Soft Top Bar */}
            <div className="h-20 sm:h-24 bg-gradient-to-r from-secondary/15 via-tertiary/10 to-secondary/10 border-b border-border-theme" />

            {/* Profile Content Container */}
            <div className="p-5 sm:p-6 pt-0 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5 -mt-10 sm:-mt-12">
              {/* Left & Center Information Area */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full md:w-auto">
                {/* LEFT: Profile Avatar Image */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface border-4 border-surface shadow-sm flex items-center justify-center overflow-hidden">
                    {profile?.profileImage || formData.profileImage ? (
                      <img
                        src={formData.profileImage || profile.profileImage}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : null}
                    {(!profile?.profileImage && !formData.profileImage) && (
                      <div className="w-full h-full bg-secondary/15 text-secondary font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center border border-secondary/30">
                        {initials}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    title="Change Profile Picture"
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-0 right-0 p-1.5 rounded-lg bg-surface border border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted shadow-xs transition-colors cursor-pointer"
                  >
                    <CameraIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* CENTER: Creator Details */}
                <div className="space-y-1.5 pt-1 sm:pt-2">
                  {/* Creator Name & Category Tag */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
                      {displayName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                      {formData.category || profile?.category || "Fashion & Luxury"}
                    </span>
                  </div>

                  {/* Email (Below Name) */}
                  <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                    <MailIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="truncate">{displayEmail}</span>
                  </div>

                  {/* Location (Below Email) */}
                  <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                    <MapPinIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="truncate">
                      {formData.location || profile?.location || "Location not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Public / Private Status Badge */}
              <div className="flex items-center shrink-0 pt-2 sm:pt-0">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    formData.isPublic
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      formData.isPublic ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span>{formData.isPublic ? "Public Profile" : "Private Profile"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 3. CREATOR METRICS (followerCount & engagementRate from Redux) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Followers */}
            <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                  Total Followers
                </span>
                <span className="font-serif text-2xl font-medium text-foreground block mt-1">
                  {profile?.followerCount !== undefined && profile?.followerCount !== null
                    ? profile.followerCount
                    : 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                <UsersIcon />
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                  Engagement Rate
                </span>
                <span className="font-serif text-2xl font-medium text-foreground block mt-1">
                  {profile?.engagementRate !== undefined && profile?.engagementRate !== null
                    ? typeof profile.engagementRate === "number"
                      ? `${profile.engagementRate}%`
                      : profile.engagementRate
                    : "0%"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <ChartBarIcon />
              </div>
            </div>
          </div>

          {/* MAIN FORM / DISPLAY SECTION */}
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2 COLUMNS: ABOUT & SOCIAL LINKS */}
            <div className="lg:col-span-2 space-y-6">
              {/* 4. ABOUT SECTION */}
              <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border-theme pb-3">
                  <div>
                    <h3 className="font-serif font-medium text-lg text-foreground">
                      About Creator
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Bio, primary creative category, and location
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-secondary font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <PencilIcon className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 text-xs">
                    {/* Category Select */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                        >
                          <option value="Fashion & Luxury">Fashion & Luxury</option>
                          <option value="Beauty & Skincare">Beauty & Skincare</option>
                          <option value="Travel & Lifestyle">Travel & Lifestyle</option>
                          <option value="Tech & Gaming">Tech & Gaming</option>
                          <option value="Fitness & Wellness">Fitness & Wellness</option>
                          <option value="Food & Culinary">Food & Culinary</option>
                        </select>
                      </div>

                      {/* Location Input */}
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g. Mumbai, India"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                        />
                      </div>
                    </div>

                    {/* Profile Image URL */}
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">
                        Profile Image URL
                      </label>
                      <input
                        type="url"
                        name="profileImage"
                        value={formData.profileImage}
                        onChange={handleInputChange}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                      />
                    </div>

                    {/* Bio Textarea */}
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">
                        Bio / Overview
                      </label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell brands about your content focus, experience, and style..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-text-secondary uppercase tracking-wider text-[10px] font-semibold block mb-1">
                        Biography
                      </span>
                      <p className="text-foreground leading-relaxed text-sm font-sans bg-surface-muted/40 p-3.5 rounded-xl border border-border-theme/60">
                        {profile?.bio || "No biography added yet. Click edit to add your bio."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-surface-muted/40 border border-border-theme/60">
                        <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                          Category
                        </span>
                        <span className="text-sm font-medium text-foreground mt-0.5 block">
                          {profile?.category || "Not specified"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-muted/40 border border-border-theme/60">
                        <span className="text-[10px] uppercase font-semibold text-text-secondary block">
                          Location
                        </span>
                        <span className="text-sm font-medium text-foreground mt-0.5 block">
                          {profile?.location || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. SOCIAL LINKS SECTION */}
              <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-border-theme pb-3">
                  <h3 className="font-serif font-medium text-lg text-foreground">
                    Social Links
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Connected handles & website
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Instagram */}
                  <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
                        <InstagramIcon />
                      </div>
                      <span>Instagram</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="instagram"
                        value={formData.socialLinks.instagram}
                        onChange={handleSocialChange}
                        placeholder="@username"
                        className="w-full text-xs px-3 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                      />
                    ) : (
                      <span className="text-xs font-medium text-text-secondary block truncate">
                        {profile?.socialLinks?.instagram || "Not added"}
                      </span>
                    )}
                  </div>

                  {/* Facebook */}
                  <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600">
                        <FacebookIcon />
                      </div>
                      <span>Facebook</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="facebook"
                        value={formData.socialLinks.facebook}
                        onChange={handleSocialChange}
                        placeholder="facebook.com/username"
                        className="w-full text-xs px-3 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                      />
                    ) : (
                      <span className="text-xs font-medium text-text-secondary block truncate">
                        {profile?.socialLinks?.facebook || "Not added"}
                      </span>
                    )}
                  </div>

                  {/* YouTube */}
                  <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                        <YoutubeIcon />
                      </div>
                      <span>YouTube</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="youtube"
                        value={formData.socialLinks.youtube}
                        onChange={handleSocialChange}
                        placeholder="youtube.com/@channel"
                        className="w-full text-xs px-3 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                      />
                    ) : (
                      <span className="text-xs font-medium text-text-secondary block truncate">
                        {profile?.socialLinks?.youtube || "Not added"}
                      </span>
                    )}
                  </div>

                  {/* TikTok */}
                  <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <div className="p-1.5 rounded-lg bg-foreground/10 text-foreground">
                        <TiktokIcon />
                      </div>
                      <span>TikTok</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="tiktok"
                        value={formData.socialLinks.tiktok}
                        onChange={handleSocialChange}
                        placeholder="@username"
                        className="w-full text-xs px-3 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                      />
                    ) : (
                      <span className="text-xs font-medium text-text-secondary block truncate">
                        {profile?.socialLinks?.tiktok || "Not added"}
                      </span>
                    )}
                  </div>

                  {/* Website */}
                  <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30 space-y-1.5 sm:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
                        <GlobeIcon />
                      </div>
                      <span>Website</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="website"
                        value={formData.socialLinks.website}
                        onChange={handleSocialChange}
                        placeholder="https://yourwebsite.com"
                        className="w-full text-xs px-3 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                      />
                    ) : (
                      <span className="text-xs font-medium text-text-secondary block truncate">
                        {profile?.socialLinks?.website || "Not added"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: VISIBILITY & SAVE ACTIONS */}
            <div className="space-y-6">
              {/* 6. PROFILE VISIBILITY SECTION */}
              <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-border-theme pb-3">
                  <h3 className="font-serif font-medium text-lg text-foreground">
                    Profile Visibility
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Control public availability of your profile
                  </p>
                </div>

                {/* Main Toggle Switch for isPublic */}
                <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      {formData.isPublic ? "Public Profile" : "Private Profile"}
                    </span>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={handleToggleVisibility}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.isPublic ? "bg-secondary" : "bg-surface-muted border-border-theme"
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
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {formData.isPublic
                      ? "Your profile is public and discoverable by brands on CreatorLink."
                      : "Your profile is private and hidden from brand discovery."}
                  </p>
                </div>
              </div>

              {/* 7. SAVE / UPDATE ACTION AREA */}
              <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
                <h3 className="font-serif font-medium text-base text-foreground">
                  {profile ? "Save Changes" : "Create Profile"}
                </h3>
                <p className="text-xs text-text-secondary">
                  Update profile details and save to your CreatorLink account.
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>{submitting ? "Saving..." : profile ? "Save Changes" : "Create Profile"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface-muted hover:bg-surface border border-border-theme text-foreground text-xs font-semibold tracking-wide transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
