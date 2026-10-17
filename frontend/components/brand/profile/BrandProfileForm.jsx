"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import {
  getBrandProfile,
  createBrandProfile,
  updateBrandProfile,
} from "@/redux/brand/profile/profile_slice";
import { uploadSingleImageApi } from "@/lib/upload";

// =========================================================
// HELPER FOR INITIALS
// =========================================================
function getCompanyInitials(name, email) {
  if (name && typeof name === "string" && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (email && typeof email === "string" && email.trim()) {
    return email.trim()[0].toUpperCase();
  }
  return "BR";
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

function GlobeIcon({ className = "w-5 h-5" }) {
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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
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

function MailIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PhoneIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.828-1.309-5.117-3.598-6.426-6.426l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
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

// =========================================================
// SHARED LOGO PREVIEW COMPONENT
// =========================================================
function BrandLogoPreview({
  url,
  alt = "Company Logo",
  initials = "BR",
  isUploading = false,
  className = "w-20 h-20",
}) {
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [failedUrl, setFailedUrl] = useState(null);

  const cleanUrl = typeof url === "string" ? url.trim() : "";
  const isLoaded = Boolean(cleanUrl) && loadedUrl === cleanUrl;
  const isFailed = Boolean(cleanUrl) && failedUrl === cleanUrl;
  const isLoading = Boolean(cleanUrl) && !isLoaded && !isFailed;

  return (
    <div
      className={`relative ${className} rounded-2xl overflow-hidden border border-border-theme shrink-0 bg-surface-muted flex items-center justify-center`}
    >
      {cleanUrl && !isFailed ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-surface-muted animate-pulse flex items-center justify-center text-text-secondary/40 font-serif font-bold text-2xl uppercase select-none">
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
        <div className="w-full h-full bg-secondary/15 text-secondary font-serif font-bold text-2xl flex items-center justify-center border border-secondary/30 uppercase select-none">
          {initials}
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-foreground">
          <svg
            className="animate-spin h-6 w-6 text-secondary mb-1"
            xmlns="http://www.w3.org/2000/svg"
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
// BRAND PROFILE FORM COMPONENT
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

  // If initial profile fetch is finished and no profile exists, open directly in edit/create mode
  useEffect(() => {
    if (initialFetchDone && !profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditing(true);
    }
  }, [initialFetchDone, profile]);

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

  // Handle local file selection and upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting the same file triggers onChange
    e.target.value = "";

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    if (!allowedMimeTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > maxSizeBytes) {
      setUploadError("Image size exceeds the 5 MB limit. Please select a smaller file.");
      return;
    }

    if (isUploadingLogo) return;

    try {
      setIsUploadingLogo(true);
      setUploadError("");
      setSaveError("");
      setSuccessMessage("");

      const response = await uploadSingleImageApi(file, "creatorlink/brands");
      const imageUrl = response?.data?.url || response?.url;

      if (!imageUrl) {
        throw new Error("Upload succeeded, but no image URL was returned.");
      }

      setFormData((prev) => ({
        ...prev,
        logo: imageUrl,
      }));

      // If an existing profile is already loaded, follow the established pattern to persist immediately
      const hasExistingProfile = Boolean(profile && (profile._id || profile.id));
      if (hasExistingProfile) {
        const prevSavedLogo = profile.logo || "";
        const persistAction = await dispatch(
          updateBrandProfile({ logo: imageUrl })
        );

        if (updateBrandProfile.rejected.match(persistAction)) {
          // Restore previous saved logo in the form on update failure
          setFormData((prev) => ({
            ...prev,
            logo: prevSavedLogo,
          }));
          const errMsg = formatErrorMessage(
            persistAction.payload,
            "Image uploaded, but failed to save to brand profile."
          );
          setUploadError(errMsg);
        } else {
          setSuccessMessage("Brand logo updated successfully!");
        }
      }
    } catch (err) {
      const message = formatErrorMessage(
        err?.response?.data?.message || err?.message || err,
        "Failed to upload logo image. Please try again."
      );
      setUploadError(message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Cancel functionality to discard unsaved edits and return to View Mode
  const handleCancel = () => {
    setSuccessMessage("");
    setSaveError("");
    setUploadError("");
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
      setIsEditing(false);
    } else {
      setFormData({
        companyName: "",
        description: "",
        industry: "",
        website: "",
        logo: "",
        location: "",
        socialLinks: { instagram: "", facebook: "", linkedin: "", youtube: "" },
        contactInformation: { name: "", email: "", phone: "" },
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl w-full mx-auto">

          {/* Section Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20 mb-3">
                Account Management
              </span>
              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
                {profile ? "Brand Profile" : "Create Brand Profile"}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Manage your company information, social presence, and primary point of contact.
              </p>
            </div>

            {/* Edit Profile Button in View Mode */}
            {!isEditing && profile && (
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage("");
                  setSaveError("");
                  setUploadError("");
                  setIsEditing(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
              >
                <PencilIcon />
                <span>Edit Profile</span>
              </button>
            )}
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
                className="text-emerald-500/70 hover:text-emerald-500 text-xs font-bold cursor-pointer ml-2"
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
                className="text-red-500/70 hover:text-red-500 text-xs font-bold cursor-pointer ml-2"
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
                className="text-red-500/70 hover:text-red-500 text-xs font-bold cursor-pointer ml-2"
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
              {/* Profile Banner Skeleton */}
              <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-surface-muted shrink-0" />
                <div className="space-y-2 flex-1 w-full">
                  <div className="h-7 w-48 bg-surface-muted rounded-lg" />
                  <div className="h-4 w-72 bg-surface-muted rounded-md" />
                </div>
              </div>

              {/* Company Details Skeleton */}
              <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="h-6 w-40 bg-surface-muted rounded-md" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-10 bg-surface-muted rounded-xl" />
                  <div className="h-10 bg-surface-muted rounded-xl" />
                  <div className="h-10 bg-surface-muted rounded-xl" />
                  <div className="h-10 bg-surface-muted rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW MODE */}
          {/* ========================================================= */}
          {profile && !isEditing && (
            <div className="space-y-8">

              {/* 1. Profile Banner Header Card */}
              <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Logo Image with Quick Upload Button */}
                <div className="relative shrink-0">
                  <BrandLogoPreview
                    url={profile.logo}
                    alt={profile.companyName || "Brand Logo"}
                    initials={getCompanyInitials(
                      profile.companyName,
                      profile.contactInformation?.email
                    )}
                    isUploading={isUploadingLogo}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    aria-label="Change brand logo"
                    title="Change brand logo"
                    className={`absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg bg-surface border border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted shadow-xs transition-colors cursor-pointer ${
                      isUploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <CameraIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-serif font-semibold text-2xl text-foreground truncate">
                      {profile.companyName || "Brand Company"}
                    </h2>
                    {profile.industry ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-muted border border-border-theme text-text-secondary">
                        {profile.industry}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                    {profile.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPinIcon className="text-secondary" />
                        <span>{profile.location}</span>
                      </span>
                    ) : null}

                    {profile.website ? (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-secondary hover:underline"
                      >
                        <GlobeIcon className="w-4 h-4" />
                        <span>{profile.website}</span>
                        <ExternalLinkIcon />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 2. Company Overview Card */}
              <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-3 border-b border-border-theme pb-4">
                  <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                    <BuildingIcon />
                  </div>
                  <h3 className="font-serif font-medium text-lg text-foreground">
                    Company Overview
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {profile.description || "No company overview provided."}
                </p>
              </div>

              {/* 3. Social Links Card */}
              <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-3 border-b border-border-theme pb-4">
                  <div className="p-2 rounded-xl bg-tertiary/10 text-tertiary">
                    <GlobeIcon />
                  </div>
                  <h3 className="font-serif font-medium text-lg text-foreground">
                    Social Presence
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {profile.socialLinks?.instagram ? (
                    <a
                      href={profile.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-theme text-xs font-medium text-foreground hover:border-secondary transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block text-xs font-semibold text-foreground group-hover:text-secondary transition-colors">
                          Instagram
                        </span>
                        <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-sans">
                          {profile.socialLinks.instagram}
                        </span>
                      </div>
                      <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary group-hover:text-secondary shrink-0" />
                    </a>
                  ) : null}

                  {profile.socialLinks?.facebook ? (
                    <a
                      href={profile.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-theme text-xs font-medium text-foreground hover:border-secondary transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block text-xs font-semibold text-foreground group-hover:text-secondary transition-colors">
                          Facebook
                        </span>
                        <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-sans">
                          {profile.socialLinks.facebook}
                        </span>
                      </div>
                      <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary group-hover:text-secondary shrink-0" />
                    </a>
                  ) : null}

                  {profile.socialLinks?.linkedin ? (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-theme text-xs font-medium text-foreground hover:border-secondary transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block text-xs font-semibold text-foreground group-hover:text-secondary transition-colors">
                          LinkedIn
                        </span>
                        <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-sans">
                          {profile.socialLinks.linkedin}
                        </span>
                      </div>
                      <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary group-hover:text-secondary shrink-0" />
                    </a>
                  ) : null}

                  {profile.socialLinks?.youtube ? (
                    <a
                      href={profile.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-theme text-xs font-medium text-foreground hover:border-secondary transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block text-xs font-semibold text-foreground group-hover:text-secondary transition-colors">
                          YouTube
                        </span>
                        <span className="block text-[11px] text-text-secondary truncate mt-0.5 font-sans">
                          {profile.socialLinks.youtube}
                        </span>
                      </div>
                      <ExternalLinkIcon className="w-3.5 h-3.5 text-text-secondary group-hover:text-secondary shrink-0" />
                    </a>
                  ) : null}

                  {!profile.socialLinks?.instagram &&
                    !profile.socialLinks?.facebook &&
                    !profile.socialLinks?.linkedin &&
                    !profile.socialLinks?.youtube && (
                      <p className="text-xs text-text-secondary col-span-1 sm:col-span-2 py-1">
                        No social media links connected.
                      </p>
                    )}
                </div>
              </div>

              {/* 4. Contact Information Card */}
              <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-3 border-b border-border-theme pb-4">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <UserGroupIcon />
                  </div>
                  <h3 className="font-serif font-medium text-lg text-foreground">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="block text-text-secondary uppercase tracking-wider text-[10px] font-semibold mb-1">
                      Contact Name
                    </span>
                    <span className="font-semibold text-foreground">
                      {profile.contactInformation?.name || "Not specified"}
                    </span>
                  </div>

                  <div>
                    <span className="block text-text-secondary uppercase tracking-wider text-[10px] font-semibold mb-1">
                      Contact Email
                    </span>
                    {profile.contactInformation?.email ? (
                      <a
                        href={`mailto:${profile.contactInformation.email}`}
                        className="inline-flex items-center gap-1 text-secondary hover:underline font-semibold"
                      >
                        <MailIcon />
                        <span>{profile.contactInformation.email}</span>
                      </a>
                    ) : (
                      <span className="text-text-secondary">Not specified</span>
                    )}
                  </div>

                  <div>
                    <span className="block text-text-secondary uppercase tracking-wider text-[10px] font-semibold mb-1">
                      Contact Phone
                    </span>
                    {profile.contactInformation?.phone ? (
                      <a
                        href={`tel:${profile.contactInformation.phone}`}
                        className="inline-flex items-center gap-1 text-secondary hover:underline font-semibold"
                      >
                        <PhoneIcon />
                        <span>{profile.contactInformation.phone}</span>
                      </a>
                    ) : (
                      <span className="text-text-secondary">Not specified</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* EDIT MODE FORM */}
          {/* ========================================================= */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* 1. Company Details Card */}
              <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-border-theme pb-4">
                  <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
                    <BuildingIcon />
                  </div>
                  <div>
                    <h2 className="font-serif font-medium text-lg text-foreground">
                      Company Details
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Basic information about your organization or agency
                    </p>
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
                      placeholder="e.g. Acme Corporation"
                      required
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g. Fashion & Apparel"
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
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
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* Company Logo and File Upload */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                      Company Logo
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-surface-muted/30 border border-border-theme">
                      {/* Logo Preview with Upload Button */}
                      <div className="relative shrink-0">
                        <BrandLogoPreview
                          url={formData.logo}
                          alt={formData.companyName || "Brand Logo Preview"}
                          initials={getCompanyInitials(
                            formData.companyName,
                            formData.contactInformation?.email
                          )}
                          isUploading={isUploadingLogo}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingLogo}
                          aria-label="Upload company logo image"
                          title="Upload company logo image"
                          className={`absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg bg-surface border border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted shadow-xs transition-colors cursor-pointer ${
                            isUploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <CameraIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex-1 w-full space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border-theme hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CameraIcon className="w-3.5 h-3.5 text-secondary" />
                            <span>{isUploadingLogo ? "Uploading..." : "Upload Logo Image"}</span>
                          </button>

                          {formData.logo ? (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, logo: "" }))
                              }
                              disabled={isUploadingLogo}
                              className="px-2.5 py-1.5 rounded-lg border border-border-theme hover:bg-red-500/10 text-red-500 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Remove Logo
                            </button>
                          ) : null}

                          <span className="text-[11px] text-text-secondary">
                            JPEG, PNG or WebP (max 5 MB)
                          </span>
                        </div>

                        <div>
                          <label
                            htmlFor="logo-url-input"
                            className="block text-[11px] font-medium text-text-secondary mb-1"
                          >
                            Or enter Logo Image URL:
                          </label>
                          <input
                            id="logo-url-input"
                            type="url"
                            name="logo"
                            value={formData.logo}
                            onChange={handleInputChange}
                            placeholder="https://example.com/logo.png"
                            disabled={isUploadingLogo}
                            className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors disabled:opacity-60"
                          />
                        </div>
                      </div>
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
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Social Links Card */}
              <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-border-theme pb-4">
                  <div className="p-2.5 rounded-xl bg-tertiary/10 text-tertiary">
                    <GlobeIcon />
                  </div>
                  <div>
                    <h2 className="font-serif font-medium text-lg text-foreground">
                      Social Links
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Connect your brand social media profiles
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      placeholder="https://facebook.com/yourbrand"
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
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
                      placeholder="https://youtube.com/@yourbrand"
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Contact Information Card */}
              <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-border-theme pb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <UserGroupIcon />
                  </div>
                  <div>
                    <h2 className="font-serif font-medium text-lg text-foreground">
                      Contact Information
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Primary point of contact for creator communications
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
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
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
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
                      className="w-full bg-surface border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Action Buttons (Cancel & Submit) */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {profile && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting || isUploadingLogo}
                    className="px-6 py-3.5 rounded-xl border border-border-theme text-foreground hover:bg-surface-muted text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingLogo}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <span>{profile ? "Save Changes" : "Create Profile"}</span>
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
