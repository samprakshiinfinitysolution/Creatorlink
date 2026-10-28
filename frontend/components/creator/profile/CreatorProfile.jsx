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
  });

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
            bio: formData.bio || profile.bio || "",
            category: formData.category || profile.category || "Fashion & Luxury",
            location: formData.location || profile.location || "",
            profileImage: uploadedUrl,
            isPublic: formData.isPublic ?? profile.isPublic ?? true,
            socialLinks: {
              instagram: formData.socialLinks?.instagram || profile.socialLinks?.instagram || "",
              facebook: formData.socialLinks?.facebook || profile.socialLinks?.facebook || "",
              youtube: formData.socialLinks?.youtube || profile.socialLinks?.youtube || "",
              tiktok: formData.socialLinks?.tiktok || profile.socialLinks?.tiktok || "",
              website: formData.socialLinks?.website || profile.socialLinks?.website || "",
            },
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
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSuccessMessage("");
    setSaveError("");
    setUploadError("");

    const hasExistingProfile = Boolean(profile && (profile._id || profile.id));

    const payload = {
      bio: formData.bio || "",
      category: formData.category || "Fashion & Luxury",
      location: formData.location || "",
      profileImage: formData.profileImage || "",
      isPublic: Boolean(formData.isPublic),
      socialLinks: {
        instagram: formData.socialLinks?.instagram || "",
        facebook: formData.socialLinks?.facebook || "",
        youtube: formData.socialLinks?.youtube || "",
        tiktok: formData.socialLinks?.tiktok || "",
        website: formData.socialLinks?.website || "",
      },
    };

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
  const category = profile?.category || formData.category || "Fashion & Luxury";
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

          {/* Section Heading & Edit Toggle Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#fff0f4] dark:bg-[#2a171f] text-[#ff2d6c] border border-[#ff2d6c]/20 mb-2 font-sans">
                ACCOUNT MANAGEMENT
              </span>
              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-slate-900 dark:text-foreground tracking-wide">
                Creator Profile
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 font-sans">
                Manage your public creator identity, social channels, and marketplace visibility.
              </p>
            </div>

            {/* Edit / View Profile Button (Brand Syntax Pure Black Button) */}
            <button
              type="button"
              onClick={() => {
                setSuccessMessage("");
                setSaveError("");
                setUploadError("");
                setIsEditing(!isEditing);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#252525] hover:bg-[#111111] text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
            >
              <PencilIcon className="w-4 h-4" />
              <span>{isEditing ? "View Profile" : "Edit Profile"}</span>
            </button>
          </div>

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
          {/* VIEW MODE: EXACT BRAND PROFILE SYNTAX FOR CREATOR */}
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
                  {/* Left: Avatar + Title + Category + Location + Email + Website */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                    {/* Creator Avatar */}
                    <div className="relative shrink-0">
                      <CreatorAvatarPreview
                        url={profile?.profileImage}
                        alt={creatorName}
                        initials={displayInitial}
                        isUploading={isUploadingImage}
                        className="w-20 h-20 sm:w-22 sm:h-22"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        aria-label="Change profile picture"
                        title="Change profile picture"
                        className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-surface border border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted shadow-xs transition-colors cursor-pointer ${
                          isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <CameraIcon className="w-3.5 h-3.5 text-secondary" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h2 className="font-serif font-semibold text-2xl sm:text-[26px] text-slate-900 dark:text-foreground tracking-wide truncate">
                        {creatorName}
                      </h2>
                      <div>
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-medium bg-[#fff0f4] dark:bg-[#ff2d6c]/10 text-[#ff2d6c] border border-[#ff2d6c]/20 font-sans">
                          {category}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-sans text-text-secondary pt-1">
                        <span className="inline-flex items-center gap-1.5 text-text-secondary">
                          <MapPinIcon className="w-3.5 h-3.5 text-[#ff2d6c] shrink-0" />
                          <span>{location}</span>
                        </span>
                        <span className="text-border-theme hidden sm:inline">|</span>
                        <span className="inline-flex items-center gap-1.5 text-text-secondary">
                          <MailIcon className="w-3.5 h-3.5 text-[#ff2d6c] shrink-0" />
                          <span className="truncate max-w-[200px]">{displayEmail}</span>
                        </span>
                        {websiteUrl && (
                          <>
                            <span className="text-border-theme hidden sm:inline">|</span>
                            <a
                              href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#ff2d6c] hover:underline font-medium truncate max-w-[220px]"
                            >
                              <GlobeIcon className="w-3.5 h-3.5 text-[#ff2d6c] shrink-0" />
                              <span className="truncate">{websiteUrl}</span>
                              <ExternalLinkIcon className="w-3 h-3 text-[#ff2d6c] shrink-0" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: 3 Stats Columns Matching Brand Layout */}
                  <div className="flex items-center justify-around sm:justify-end gap-6 sm:gap-8 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border-theme/60">
                    <div className="text-center sm:text-left">
                      <span className="block text-[22px] sm:text-[24px] font-semibold font-sans text-slate-900 dark:text-foreground leading-none">
                        {formatNumber(followerCount)}
                      </span>
                      <span className="block text-[10px] sm:text-[11px] text-text-secondary mt-1.5 font-sans leading-tight">
                        Total<br className="hidden sm:inline" /> Followers
                      </span>
                    </div>
                    <div className="h-10 w-px bg-border-theme" />
                    <div className="text-center sm:text-left">
                      <span className="block text-[22px] sm:text-[24px] font-semibold font-sans text-slate-900 dark:text-foreground leading-none">
                        {engagementRate}
                      </span>
                      <span className="block text-[10px] sm:text-[11px] text-text-secondary mt-1.5 font-sans leading-tight">
                        Engagement<br className="hidden sm:inline" /> Rate
                      </span>
                    </div>
                    <div className="h-10 w-px bg-border-theme" />
                    <div className="text-center sm:text-left">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-foreground leading-none">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isPublic ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          }`}
                        />
                        <span>{isPublic ? "Public" : "Private"}</span>
                      </span>
                      <span className="block text-[10px] sm:text-[11px] text-text-secondary mt-1.5 font-sans leading-tight">
                        Profile<br className="hidden sm:inline" /> Visibility
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. TWO-COLUMN MAIN CONTENT GRID (8 / 4 LAYOUT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

                {/* LEFT COLUMN: 8 COLS */}
                <div className="lg:col-span-8 space-y-5 sm:space-y-6">

                  {/* Card 1: Creator Overview / Bio */}
                  <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
                    <h3 className="font-serif font-semibold text-lg text-slate-900 dark:text-foreground tracking-wide">
                      About Creator
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans whitespace-pre-line">
                      {bio}
                    </p>
                  </div>

                  {/* Card 2: Social Presence (Identical 2x2 Brand Grid) */}
                  <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <h3 className="font-serif font-semibold text-lg text-slate-900 dark:text-foreground tracking-wide">
                      Social Presence
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      {/* Instagram */}
                      <a
                        href={
                          instagramUrl.startsWith("http")
                            ? instagramUrl
                            : `https://instagram.com/${instagramUrl.replace(/^@/, "")}`
                        }
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
                              {instagramUrl}
                            </span>
                          </div>
                        </div>
                        <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary/60 group-hover:text-secondary shrink-0 transition-colors" />
                      </a>

                      {/* YouTube */}
                      <a
                        href={
                          youtubeUrl.startsWith("http")
                            ? youtubeUrl
                            : `https://youtube.com/@${youtubeUrl.replace(/^@/, "")}`
                        }
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
                              {youtubeUrl}
                            </span>
                          </div>
                        </div>
                        <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary/60 group-hover:text-secondary shrink-0 transition-colors" />
                      </a>

                      {/* TikTok */}
                      <a
                        href={
                          tiktokUrl.startsWith("http")
                            ? tiktokUrl
                            : `https://tiktok.com/@${tiktokUrl.replace(/^@/, "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 sm:p-3.5 rounded-xl border border-border-theme bg-white dark:bg-surface-muted/30 hover:border-secondary/40 hover:bg-surface-muted/50 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-xs">
                            <TiktokIcon className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold text-slate-900 dark:text-foreground group-hover:text-secondary transition-colors font-sans">
                              TikTok
                            </span>
                            <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-sans">
                              {tiktokUrl}
                            </span>
                          </div>
                        </div>
                        <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary/60 group-hover:text-secondary shrink-0 transition-colors" />
                      </a>

                      {/* Facebook */}
                      <a
                        href={
                          facebookUrl.startsWith("http")
                            ? facebookUrl
                            : `https://facebook.com/${facebookUrl.replace(/^@/, "")}`
                        }
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
                              {facebookUrl}
                            </span>
                          </div>
                        </div>
                        <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary/60 group-hover:text-secondary shrink-0 transition-colors" />
                      </a>
                    </div>
                  </div>

                  {/* Card 3: Account & Representation Information */}
                  <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <h3 className="font-serif font-semibold text-lg text-slate-900 dark:text-foreground tracking-wide">
                      Account & Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                      <div>
                        <span className="block text-text-secondary uppercase tracking-wider text-[10px] font-semibold mb-1">
                          Full Name
                        </span>
                        <span className="font-medium text-slate-900 dark:text-foreground text-xs">
                          {creatorName}
                        </span>
                      </div>
                      <div>
                        <span className="block text-text-secondary uppercase tracking-wider text-[10px] font-semibold mb-1">
                          Registered Email
                        </span>
                        <span className="font-medium text-slate-900 dark:text-foreground text-xs truncate block">
                          {displayEmail}
                        </span>
                      </div>
                      <div>
                        <span className="block text-text-secondary uppercase tracking-wider text-[10px] font-semibold mb-1">
                          Primary Location
                        </span>
                        <span className="font-medium text-slate-900 dark:text-foreground text-xs">
                          {location}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: 4 COLS */}
                <div className="lg:col-span-4 space-y-5 sm:space-y-6">

                  {/* Card 1: Creator Details (Matching Brand Details) */}
                  <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
                    <h3 className="font-serif font-semibold text-lg text-slate-900 dark:text-foreground pb-2 border-b border-border-theme tracking-wide">
                      Creator Details
                    </h3>
                    <div className="space-y-3 text-xs font-sans">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-secondary font-medium">Category</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fff0f4] dark:bg-[#ff2d6c]/10 text-[#ff2d6c] border border-[#ff2d6c]/20">
                          {category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-secondary font-medium">Website</span>
                        <a
                          href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff2d6c] hover:underline font-medium inline-flex items-center gap-1 truncate max-w-[170px]"
                        >
                          <span className="truncate">{websiteUrl}</span>
                          <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-secondary font-medium">Visibility</span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            isPublic
                              ? "bg-transparent text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-transparent text-amber-600 dark:text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublic ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {isPublic ? "Public Profile" : "Private Profile"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-secondary font-medium">Location</span>
                        <span className="font-medium text-slate-900 dark:text-foreground">
                          {location}
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

                  {/* Card 2: Creator Highlights (Matching Brand Highlights) */}
                  <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <h3 className="font-serif font-semibold text-lg text-slate-900 dark:text-foreground tracking-wide">
                      Creator Highlights
                    </h3>
                    <div className="grid grid-cols-2 gap-4 font-sans">
                      <div>
                        <span className="block text-[17px] font-semibold text-slate-900 dark:text-foreground leading-tight">
                          {formatNumber(followerCount)}
                        </span>
                        <span className="block text-[10px] text-text-secondary mt-0.5 leading-snug">
                          Total Followers
                        </span>
                      </div>
                      <div>
                        <span className="block text-[17px] font-semibold text-slate-900 dark:text-foreground leading-tight">
                          {engagementRate}
                        </span>
                        <span className="block text-[10px] text-text-secondary mt-0.5 leading-snug">
                          Engagement Rate
                        </span>
                      </div>
                      <div>
                        <span className="block text-[17px] font-semibold text-slate-900 dark:text-foreground leading-tight">
                          100%
                        </span>
                        <span className="block text-[10px] text-text-secondary mt-0.5 leading-snug">
                          Collaboration Rate
                        </span>
                      </div>
                      <div>
                        <span className="block text-[17px] font-semibold text-slate-900 dark:text-foreground leading-tight">
                          5.0 ★
                        </span>
                        <span className="block text-[10px] text-text-secondary mt-0.5 leading-snug">
                          Quality Rating
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* EDIT MODE: FULL CREATOR PROFILE FORM (EXACT BRAND SYNTAX) */}
          {/* ========================================================= */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* 1. Creator Details Card */}
              <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-border-theme pb-4">
                  <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
                    <UserIcon />
                  </div>
                  <div>
                    <h2 className="font-serif font-semibold text-lg text-slate-900 dark:text-foreground tracking-wide">
                      Creator Identity & Bio
                    </h2>
                    <p className="text-xs text-text-secondary font-sans">
                      Basic information about your creator identity, niche, and profile photo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-sans">
                  {/* Category / Niche */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Primary Niche / Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                    >
                      <option value="Fashion & Luxury">Fashion & Luxury</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Travel & Lifestyle">Travel & Lifestyle</option>
                      <option value="Tech & Gaming">Tech & Gaming</option>
                      <option value="Fitness & Wellness">Fitness & Wellness</option>
                      <option value="Food & Culinary">Food & Culinary</option>
                      <option value="Apparel & Lifestyle">Apparel & Lifestyle</option>
                      <option value="Photography">Photography</option>
                      <option value="Video & Reels">Video & Reels</option>
                      <option value="Art & Design">Art & Design</option>
                      <option value="Other">Other</option>
                    </select>
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
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* Profile Picture Upload & Preview */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Profile Picture
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-surface-muted/30 border border-border-theme">
                      {/* Avatar Preview with Camera Button */}
                      <div className="relative shrink-0">
                        <CreatorAvatarPreview
                          url={formData.profileImage}
                          alt={creatorName}
                          initials={displayInitial}
                          isUploading={isUploadingImage}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          aria-label="Upload profile image"
                          title="Upload profile image"
                          className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-surface border border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted shadow-xs transition-colors cursor-pointer ${
                            isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <CameraIcon className="w-3.5 h-3.5 text-secondary" />
                        </button>
                      </div>

                      <div className="flex-1 w-full space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border-theme hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CameraIcon className="w-3.5 h-3.5 text-secondary" />
                            <span>{isUploadingImage ? "Uploading..." : "Upload Profile Photo"}</span>
                          </button>

                          {formData.profileImage ? (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, profileImage: "" }))
                              }
                              disabled={isUploadingImage}
                              className="px-2.5 py-1.5 rounded-lg border border-border-theme hover:bg-red-500/10 text-red-500 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Remove Photo
                            </button>
                          ) : null}

                          <span className="text-[11px] text-text-secondary">
                            JPEG, PNG or WebP (max 5 MB)
                          </span>
                        </div>

                        <div>
                          <label
                            htmlFor="profile-avatar-url"
                            className="block text-[11px] font-medium text-text-secondary mb-1"
                          >
                            Or enter Profile Image URL:
                          </label>
                          <input
                            id="profile-avatar-url"
                            type="url"
                            name="profileImage"
                            value={formData.profileImage}
                            onChange={handleInputChange}
                            placeholder="https://example.com/photo.jpg"
                            disabled={isUploadingImage}
                            className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio / Description */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Creator Bio / Story
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Brief description of your content aesthetic, audience niche, and collaboration style..."
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Social Links Card */}
              <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-border-theme pb-4">
                  <div className="p-2.5 rounded-xl bg-tertiary/10 text-tertiary">
                    <GlobeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif font-semibold text-lg text-slate-900 dark:text-foreground tracking-wide">
                      Social Channels & Links
                    </h2>
                    <p className="text-xs text-text-secondary font-sans">
                      Connect your social media handles and online portfolio
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
                      placeholder="https://instagram.com/yourhandle"
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
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
                      placeholder="https://youtube.com/@yourchannel"
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      TikTok
                    </label>
                    <input
                      type="text"
                      name="tiktok"
                      value={formData.socialLinks.tiktok}
                      onChange={handleSocialChange}
                      placeholder="https://tiktok.com/@yourhandle"
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
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
                      placeholder="https://facebook.com/yourprofile"
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* Website / Portfolio */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Website / Media Kit URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.socialLinks.website}
                      onChange={handleSocialChange}
                      placeholder="https://yourportfolio.com or linktr.ee/..."
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Marketplace Visibility Settings Card */}
              <div className="bg-white dark:bg-surface border border-border-theme rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif font-semibold text-lg text-slate-900 dark:text-foreground tracking-wide">
                      Public Profile Visibility
                    </h3>
                    <p className="text-xs text-text-secondary font-sans mt-0.5">
                      {formData.isPublic
                        ? "Your profile is discoverable by brands searching for creators on CreatorLink."
                        : "Your profile is hidden from public brand discovery and search results."}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={handleToggleVisibility}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.isPublic ? "bg-[#ff2d6c]" : "bg-surface-muted border-border-theme"
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

              {/* 4. Action Buttons (Cancel & Submit - Brand Syntax) */}
              <div className="flex items-center justify-end gap-3 pt-2 font-sans">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting || isUploadingImage}
                  className="px-6 py-3 rounded-xl border border-border-theme text-foreground hover:bg-surface-muted text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-[#252525] hover:bg-[#111111] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <span>{profile ? "Save Changes" : "Save Profile"}</span>
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
