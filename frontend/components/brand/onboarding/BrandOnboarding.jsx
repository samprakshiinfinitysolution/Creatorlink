/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  getBrandProfile,
  createBrandProfile,
  updateBrandProfile,
  completeBrandOnboarding,
} from "@/redux/brand/profile/profile_slice";
import { uploadSingleImageApi } from "@/lib/upload";

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

function MapPinIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
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

function CameraIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
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

function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function MegaphoneIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function UserIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function PhoneIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function EnvelopeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
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

function YoutubeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// =========================================================
// TAXONOMY & CONSTANTS
// =========================================================
const hasAtLeastOneSocialProfile = (socialLinks) => {
  if (!socialLinks || typeof socialLinks !== "object") return false;
  const platforms = [
    socialLinks.instagram,
    socialLinks.linkedin,
    socialLinks.youtube,
    socialLinks.facebook,
    socialLinks.twitter,
  ];
  return platforms.some(
    (link) => typeof link === "string" && link.trim().length > 0
  );
};

const INDUSTRY_OPTIONS = [
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Technology & Electronics",
  "Health & Wellness",
  "Food & Beverage",
  "Travel & Lifestyle",
  "Entertainment & Media",
  "E-Commerce & Retail",
  "SaaS & Software",
  "Fitness & Sports",
  "Automotive",
  "Finance & Fintech",
  "Home & Living",
  "Education",
  "Other",
];

const POPULAR_LOCATIONS = [
  "Mumbai, India",
  "Delhi NCR, India",
  "Bengaluru, India",
  "Hyderabad, India",
  "Pune, India",
  "Chennai, India",
  "Kolkata, India",
  "Remote / Global",
];

const STEPS_META = [
  { number: 1, title: "Company Essentials", subtitle: "Identity & Logo" },
  { number: 2, title: "Story & Socials", subtitle: "Vision & Links" },
  { number: 3, title: "Review & Complete", subtitle: "Preview & Launch" },
];

export default function BrandOnboarding() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { profile } = useSelector((state) => state.brandProfile || {});
  const { user: authUser } = useSelector((state) => state.auth || {});

  // Current onboarding step (1 = Essentials, 2 = Story & Socials, 3 = Review & Complete)
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    location: "",
    logo: "",
    website: "",
    description: "",
    socialLinks: {
      instagram: "",
      linkedin: "",
      youtube: "",
      facebook: "",
      twitter: "",
    },
    contactInformation: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // UI States
  const [validationError, setValidationError] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  // Initialize company name / contact name from auth user if empty
  useEffect(() => {
    if (authUser?.name && !formData.companyName) {
      setFormData((prev) => ({
        ...prev,
        companyName: prev.companyName || authUser.name,
        contactInformation: {
          ...prev.contactInformation,
          name: prev.contactInformation.name || authUser.name,
          email: prev.contactInformation.email || authUser.email || "",
        },
      }));
    }
  }, [authUser, formData.companyName]);

  // Step 1 required validation (Company Name, Industry, Location)
  const isStep1Done = Boolean(
    typeof formData.companyName === "string" &&
    formData.companyName.trim().length > 0 &&
    typeof formData.industry === "string" &&
    formData.industry.trim().length > 0 &&
    typeof formData.location === "string" &&
    formData.location.trim().length > 0
  );

  // Step 2 required validation:
  // - Company Description / Bio: required, non-empty
  // - Social Media: at least ONE non-empty field
  // - Brand Collaboration Contact: Contact Name, Email, and Phone all three required
  const hasAtLeastOneSocial = Boolean(hasAtLeastOneSocialProfile(formData.socialLinks));
  const hasDescription = Boolean(
    typeof formData.description === "string" && formData.description.trim().length > 0
  );
  const hasContactName = Boolean(
    typeof formData.contactInformation?.name === "string" &&
      formData.contactInformation.name.trim().length > 0
  );
  const hasContactEmail = Boolean(
    typeof formData.contactInformation?.email === "string" &&
      formData.contactInformation.email.trim().length > 0
  );
  const hasContactPhone = Boolean(
    typeof formData.contactInformation?.phone === "string" &&
      formData.contactInformation.phone.trim().length > 0
  );

  const isStep2Done = Boolean(
    isStep1Done &&
      hasDescription &&
      hasAtLeastOneSocial &&
      hasContactName &&
      hasContactEmail &&
      hasContactPhone
  );

  // Step 3 is completed when the backend marks isOnboarded true
  const isStep3Done = Boolean(profile?.isOnboarded);

  const isStepCompleted = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return isStep1Done;
      case 2:
        return isStep2Done;
      case 3:
        return isStep3Done;
      default:
        return false;
    }
  };

  // Populate data when loaded from backend
  const applyProfileData = useCallback(
    (profileData) => {
      if (!isMountedRef.current) return;

      const p = profileData?.data || profileData;
      if (!p) return;

      // 1. If already onboarded, redirect directly to dashboard
      if (p.isOnboarded) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("brand_onboarding_step");
        }
        router.replace("/brand/dashboard");
        return;
      }

      // 2. Pre-fill existing draft values without overwriting with blanks
      setFormData((prev) => ({
        companyName: p.companyName || prev.companyName || "",
        industry: p.industry || prev.industry || "",
        location: p.location || prev.location || "",
        logo: p.logo || prev.logo || "",
        website: p.website || prev.website || "",
        description: p.description || prev.description || "",
        socialLinks: {
          instagram: p.socialLinks?.instagram || prev.socialLinks?.instagram || "",
          linkedin: p.socialLinks?.linkedin || prev.socialLinks?.linkedin || "",
          youtube: p.socialLinks?.youtube || prev.socialLinks?.youtube || "",
          facebook: p.socialLinks?.facebook || prev.socialLinks?.facebook || "",
          twitter: p.socialLinks?.twitter || prev.socialLinks?.twitter || "",
        },
        contactInformation: {
          name: p.contactInformation?.name || prev.contactInformation?.name || "",
          email: p.contactInformation?.email || prev.contactInformation?.email || "",
          phone: p.contactInformation?.phone || prev.contactInformation?.phone || "",
        },
      }));

      // 3. Step 1 required details validation check
      const pStep1Done = Boolean(
        typeof p.companyName === "string" &&
        p.companyName.trim().length > 0 &&
        typeof p.industry === "string" &&
        p.industry.trim().length > 0 &&
        typeof p.location === "string" &&
        p.location.trim().length > 0
      );

      // Step 2 required details validation check
      const pStep2Done = Boolean(
        pStep1Done &&
        typeof p.description === "string" &&
        p.description.trim().length > 0 &&
        hasAtLeastOneSocialProfile(p.socialLinks) &&
        typeof p.contactInformation?.name === "string" &&
        p.contactInformation.name.trim().length > 0 &&
        typeof p.contactInformation?.email === "string" &&
        p.contactInformation.email.trim().length > 0 &&
        typeof p.contactInformation?.phone === "string" &&
        p.contactInformation.phone.trim().length > 0
      );

      // 4. Auto-resume step determination:
      // - Missing Step 1 required details -> resume Step 1
      // - Step 1 complete but Step 2 incomplete -> resume Step 2
      // - Required onboarding details complete -> resume Step 3 Review & Complete
      if (!pStep1Done) {
        setCurrentStep(1);
        setMaxVisitedStep(1);
        if (typeof window !== "undefined") {
          localStorage.setItem("brand_onboarding_step", "1");
        }
      } else if (!pStep2Done) {
        setCurrentStep(2);
        setMaxVisitedStep(2);
        if (typeof window !== "undefined") {
          localStorage.setItem("brand_onboarding_step", "2");
        }
      } else {
        let savedStep = 3;
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("brand_onboarding_step");
          if (stored) {
            const parsed = parseInt(stored, 10);
            if (parsed >= 1 && parsed <= 3) {
              savedStep = parsed;
            }
          }
        }

        setCurrentStep(savedStep);
        setMaxVisitedStep(savedStep);
      }
    },
    [router]
  );

  // Sync form data whenever profile in Redux updates
  useEffect(() => {
    if (profile) {
      applyProfileData(profile);
      setIsInitialLoading(false);
      setInitialLoadError(null);
    }
  }, [profile, applyProfileData]);

  // Fetch initial profile on mount
  const loadProfile = useCallback(async (force = false) => {
    setIsInitialLoading(true);
    setInitialLoadError(null);

    try {
      const response = await dispatch(getBrandProfile({ force })).unwrap();
      if (isMountedRef.current) {
        applyProfileData(response);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      // If aborted due to condition callback returning false, an identical fetch is already
      // in progress. Redux will receive the data and the profile effect above will apply it.
      const isConditionAbort =
        err?.name === "ConditionError" ||
        (typeof err?.message === "string" &&
          err.message.includes("condition callback returning false"));

      if (isConditionAbort) {
        return;
      }

      const errMsg =
        typeof err === "string"
          ? err
          : err?.message || err?.response?.data?.message || "";
      const isNotFound =
        errMsg.toLowerCase().includes("not found") || errMsg.includes("404");

      // 404 is normal for newly registered brands without an existing profile doc
      if (!isNotFound) {
        setInitialLoadError(errMsg || "Failed to load brand profile.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsInitialLoading(false);
      }
    }
  }, [dispatch, applyProfileData]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadProfile();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [loadProfile]);

  // Input Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (validationError) setValidationError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    if (validationError) setValidationError(null);
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [name]: value,
      },
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    if (validationError) setValidationError(null);
    setFormData((prev) => ({
      ...prev,
      contactInformation: {
        ...(prev.contactInformation || {}),
        [name]: value,
      },
    }));
  };

  // Logo file upload handler
  const handleLogoUpload = async (e) => {
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

    setUploadError(null);
    setIsUploadingLogo(true);

    try {
      const uploadRes = await uploadSingleImageApi(file, "creatorlink/brands");
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
        // If profile already exists, update logo immediately
        if (profile && (profile._id || profile.id)) {
          dispatch(updateBrandProfile({ logo: uploadedUrl }));
        }
      } else {
        setUploadError("Could not retrieve uploaded logo URL.");
      }
    } catch (err) {
      setUploadError(
        err?.response?.data?.message || err?.message || "Failed to upload logo."
      );
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Draft persistence helper (Does NOT mark profile as onboarded)
  const saveDraft = async (stepPayload = {}, showFeedback = false) => {
    const hasProfile = Boolean(profile && (profile._id || profile.id));
    const mergedPayload = {
      companyName: formData.companyName.trim(),
      industry: formData.industry.trim(),
      location: formData.location.trim(),
      logo: formData.logo.trim(),
      description: formData.description.trim(),
      website: formData.website.trim(),
      socialLinks: formData.socialLinks,
      contactInformation: formData.contactInformation,
      ...stepPayload,
    };

    let result;
    if (hasProfile) {
      result = await dispatch(updateBrandProfile(mergedPayload)).unwrap();
    } else {
      result = await dispatch(createBrandProfile(mergedPayload)).unwrap();
    }

    if (showFeedback) {
      setSaveSuccessMessage("Draft progress saved successfully.");
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 3500);
    }

    return result;
  };

  // Explicit Save Draft action
  const handleExplicitSaveDraft = async () => {
    setValidationError(null);
    setSaveSuccessMessage(null);

    try {
      setIsSavingDraft(true);
      await saveDraft({}, true);
    } catch (err) {
      setValidationError(
        typeof err === "string" ? err : err?.message || "Failed to save draft."
      );
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Step 1 Validation & Proceed
  const handleStep1Continue = async (e) => {
    if (e) e.preventDefault();
    setValidationError(null);

    if (!formData.companyName.trim()) {
      setValidationError("Company Name is required.");
      return;
    }
    if (!formData.industry.trim()) {
      setValidationError("Please select an Industry.");
      return;
    }
    if (!formData.location.trim()) {
      setValidationError("Headquarters / Operating Location is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await saveDraft({
        companyName: formData.companyName.trim(),
        industry: formData.industry.trim(),
        location: formData.location.trim(),
        logo: formData.logo.trim(),
      });
      setCurrentStep(2);
      setMaxVisitedStep((prev) => Math.max(prev, 2));
      if (typeof window !== "undefined") {
        localStorage.setItem("brand_onboarding_step", "2");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setValidationError(
        err?.message || "Failed to save company essentials. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 Validation & Proceed
  const handleStep2Continue = async (e) => {
    if (e) e.preventDefault();
    setValidationError(null);

    // 1. Mandatory Description / Bio
    if (!formData.description?.trim()) {
      setValidationError("Company Description / Bio is required.");
      return;
    }

    // 2. Mandatory at least one social media profile (any non-empty string accepted, no URL validation)
    if (!hasAtLeastOneSocialProfile(formData.socialLinks)) {
      setValidationError("Please add at least one social media profile URL.");
      return;
    }

    // 3. Mandatory Brand Collaboration Contact fields (Name, Email, Phone all required)
    if (!formData.contactInformation?.name?.trim()) {
      setValidationError("Contact Name is required.");
      return;
    }

    if (!formData.contactInformation?.email?.trim()) {
      setValidationError("Contact Email is required.");
      return;
    }

    if (!formData.contactInformation?.phone?.trim()) {
      setValidationError("Contact Phone Number is required.");
      return;
    }

    const socialPayload = {
      instagram: formData.socialLinks?.instagram?.trim() || "",
      linkedin: formData.socialLinks?.linkedin?.trim() || "",
      youtube: formData.socialLinks?.youtube?.trim() || "",
      facebook: formData.socialLinks?.facebook?.trim() || "",
      twitter: formData.socialLinks?.twitter?.trim() || "",
    };

    try {
      setIsSubmitting(true);
      await saveDraft({
        description: formData.description.trim(),
        website: formData.website?.trim() || "",
        socialLinks: socialPayload,
        contactInformation: {
          name: formData.contactInformation?.name?.trim() || "",
          email: formData.contactInformation?.email?.trim() || "",
          phone: formData.contactInformation?.phone?.trim() || "",
        },
      });

      setCurrentStep(3);
      setMaxVisitedStep(3);
      if (typeof window !== "undefined") {
        localStorage.setItem("brand_onboarding_step", "3");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setValidationError(
        err?.message || "Failed to save brand story. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3 Completion
  const handleCompleteOnboarding = async () => {
    setValidationError(null);

    // Verify required fields from Step 1
    if (
      !formData.companyName?.trim() ||
      !formData.industry?.trim() ||
      !formData.location?.trim()
    ) {
      setValidationError(
        "Please complete all required company essentials (Company Name, Industry, Location) before completing onboarding."
      );
      return;
    }

    // Verify required fields from Step 2
    if (!formData.description?.trim()) {
      setValidationError("Company Description / Bio is required.");
      return;
    }

    if (!hasAtLeastOneSocialProfile(formData.socialLinks)) {
      setValidationError("Please add at least one social media profile URL.");
      return;
    }

    if (!formData.contactInformation?.name?.trim()) {
      setValidationError("Contact Name is required.");
      return;
    }

    if (!formData.contactInformation?.email?.trim()) {
      setValidationError("Contact Email is required.");
      return;
    }

    if (!formData.contactInformation?.phone?.trim()) {
      setValidationError("Contact Phone Number is required.");
      return;
    }

    const socialPayload = {
      instagram: formData.socialLinks?.instagram?.trim() || "",
      linkedin: formData.socialLinks?.linkedin?.trim() || "",
      youtube: formData.socialLinks?.youtube?.trim() || "",
      facebook: formData.socialLinks?.facebook?.trim() || "",
      twitter: formData.socialLinks?.twitter?.trim() || "",
    };

    try {
      setIsSubmitting(true);
      const actionResult = await dispatch(
        completeBrandOnboarding({
          companyName: formData.companyName.trim(),
          industry: formData.industry.trim(),
          location: formData.location.trim(),
          logo: formData.logo?.trim() || "",
          description: formData.description.trim(),
          website: formData.website?.trim() || "",
          socialLinks: socialPayload,
          contactInformation: {
            name: formData.contactInformation?.name?.trim() || "",
            email: formData.contactInformation?.email?.trim() || "",
            phone: formData.contactInformation?.phone?.trim() || "",
          },
        })
      ).unwrap();

      if (actionResult) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("brand_onboarding_step");
        }
        router.push("/brand/dashboard");
      }
    } catch (err) {
      setValidationError(
        typeof err === "string"
          ? err
          : err?.message ||
          "Failed to finalize onboarding. Please check your inputs and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Missing Fields calculation for Step 3 review (Only mandatory fields)
  const missingRequiredFields = useMemo(() => {
    const missing = [];
    if (!formData.companyName?.trim()) missing.push("Company Name");
    if (!formData.industry?.trim()) missing.push("Industry");
    if (!formData.location?.trim()) missing.push("Headquarters Location");
    if (!formData.description?.trim()) missing.push("Company Description / Bio");
    if (!hasAtLeastOneSocial) missing.push("Social Media Channel");
    if (!formData.contactInformation?.name?.trim()) missing.push("Contact Name");
    if (!formData.contactInformation?.email?.trim()) missing.push("Contact Email");
    if (!formData.contactInformation?.phone?.trim()) missing.push("Contact Phone");
    return missing;
  }, [
    formData.companyName,
    formData.industry,
    formData.location,
    formData.description,
    hasAtLeastOneSocial,
    formData.contactInformation?.name,
    formData.contactInformation?.email,
    formData.contactInformation?.phone,
  ]);

  // Initial avatar initial fallback
  const displayInitial = useMemo(() => {
    if (formData.companyName.trim()) {
      return formData.companyName.trim()[0].toUpperCase();
    }
    return authUser?.name ? authUser.name[0].toUpperCase() : "B";
  }, [formData.companyName, authUser]);

  return (
    <div className="w-full min-h-screen bg-[#fff0f3] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between p-4 sm:p-8 lg:p-12 transition-colors duration-300 font-sans">
      {/* =========================================================
          TOP BAR: BRANDING & STEP BADGE (NO SKIP OPTION)
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
          Step {currentStep} of 3
        </span>
      </header>

      {/* =========================================================
          MAIN CONTAINER
      ========================================================= */}
      <main className="my-auto max-w-5xl w-full mx-auto">
        {/* Onboarding Heading */}
        <div className="text-center sm:text-left mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white font-sans">
            Brand Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Set up your brand profile to start launching campaigns, receiving creator proposals, and building partnerships.
          </p>
        </div>

        {/* 3-Step Stepper Progress Bar */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-8 px-2 sm:px-4">
          {STEPS_META.map((s, idx) => {
            const isDone = isStepCompleted(s.number);
            const isCurrent = s.number === currentStep;
            // Can click if step is accessible according to required completion flow:
            // - Step 1: always accessible
            // - Step 2: accessible once Step 1 is done
            // - Step 3: accessible once Step 1 AND Step 2 (at least 1 valid social URL) are done
            const canClick =
              s.number === 1 ||
              (s.number === 2 && isStep1Done) ||
              (s.number === 3 && isStep1Done && isStep2Done);

            return (
              <div key={s.number} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => {
                    if (canClick) {
                      setValidationError(null);
                      setCurrentStep(s.number);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("brand_onboarding_step", String(s.number));
                      }
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  disabled={!canClick && !isCurrent}
                  className="flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCurrent
                      ? "bg-pink-500 text-white shadow-md ring-4 ring-pink-100 dark:ring-pink-950/40"
                      : isDone
                        ? "bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950"
                        : "bg-white dark:bg-neutral-800 text-neutral-400 border border-neutral-300 dark:border-neutral-700"
                      }`}
                  >
                    {isDone && !isCurrent ? (
                      <CheckIcon className="w-3.5 h-3.5" />
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium whitespace-nowrap ${isCurrent
                      ? "text-pink-600 dark:text-pink-400 font-bold"
                      : "text-neutral-500 dark:text-neutral-400"
                      }`}
                  >
                    {s.title}
                  </span>
                </button>
                {idx < STEPS_META.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 -mt-5 transition-all ${isDone
                      ? "bg-pink-500"
                      : "bg-neutral-200 dark:bg-neutral-800"
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
                onClick={() => loadProfile(true)}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold cursor-pointer shrink-0"
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
                className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {validationError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-sans font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-bold">⚠</span>
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
              <svg
                className="animate-spin h-8 w-8 text-pink-500 mb-4"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Loading your brand workspace...
              </p>
            </div>
          ) : (
            <>
              {/* =========================================================
                  STEP 1: COMPANY ESSENTIALS (REQUIRED)
              ========================================================= */}
              {currentStep === 1 && (
                <form onSubmit={handleStep1Continue} className="space-y-6">
                  {/* Card Section Header */}
                  <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-neutral-950 dark:text-white">
                      Company Essentials
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Set up your company identity and logo so creators instantly recognize your brand.
                    </p>
                  </div>

                  <div className="bg-neutral-50/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-6">
                    {/* Brand Logo Upload Section (Optional) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                          Brand Logo
                        </label>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          Optional
                        </span>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shadow-xs shrink-0">
                          {formData.logo ? (
                            <img
                              src={formData.logo}
                              alt="Brand Logo Preview"
                              className="w-full h-full object-contain object-center"
                            />
                          ) : (
                            <span className="text-2xl font-serif font-bold text-pink-500">
                              {displayInitial}
                            </span>
                          )}

                          {isUploadingLogo && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="brand-logo-file"
                          />
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="brand-logo-file"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-xs"
                            >
                              <CameraIcon className="w-3.5 h-3.5" />
                              <span>{formData.logo ? "Change Logo" : "Upload Logo"}</span>
                            </label>
                            {formData.logo && (
                              <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                                className="px-2.5 py-1.5 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Square PNG, JPEG, or WebP up to 5 MB. Minimum 300x300px recommended.
                          </p>
                          {uploadError && (
                            <p className="text-[11px] text-red-500 font-medium">{uploadError}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Company Name (Required) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                        Company / Brand Name <span className="text-pink-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <BuildingIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="companyName"
                          required
                          maxLength={150}
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="e.g. Acme Studios, Zenith Wear, Aura Botanics"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Industry Dropdown (Required) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                        Primary Industry <span className="text-pink-500">*</span>
                      </label>
                      <select
                        name="industry"
                        required
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                      >
                        <option value="">Select your industry...</option>
                        {INDUSTRY_OPTIONS.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location with Quick Suggestions (Required) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                        Headquarters / Operating Location <span className="text-pink-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <MapPinIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="location"
                          required
                          maxLength={100}
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g. Mumbai, India or Bengaluru, Karnataka"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                        />
                      </div>

                      {/* Quick Location Suggestion Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                          Quick Picks:
                        </span>
                        {POPULAR_LOCATIONS.slice(0, 5).map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, location: loc }))}
                            className="px-2.5 py-1 rounded-lg text-[11px] bg-white dark:bg-neutral-800 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-neutral-700 dark:hover:text-pink-400 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Bottom Bar - No Skip or Dashboard Bypass) */}
                  <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleExplicitSaveDraft}
                      disabled={isSubmitting || isSavingDraft}
                      className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSavingDraft ? "Saving..." : "Save Draft"}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || isSavingDraft}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4 text-white dark:text-neutral-950"
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Story & Socials</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* =========================================================
                  STEP 2: BRAND STORY & SOCIALS
              ========================================================= */}
              {currentStep === 2 && (
                <form onSubmit={handleStep2Continue} className="space-y-6">
                  {/* Card Section Header */}
                  <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg sm:text-xl font-serif font-bold text-neutral-950 dark:text-white">
                          Brand Story & Socials
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          Share your brand mission, web presence, social channels, and partnership contact info.
                        </p>
                      </div>
                      <span className="text-[11px] text-pink-600 dark:text-pink-400 font-medium bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-full border border-pink-200/50 shrink-0 hidden sm:inline-block">
                        Step 2 of 3
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-50/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl p-5 sm:p-7 space-y-6">
                    {/* Company Description (Required) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="brand-description" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                          Company Description / Bio <span className="text-pink-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {formData.description.length} / 2000
                          </span>
                        </div>
                      </div>
                      <textarea
                        id="brand-description"
                        name="description"
                        rows={4}
                        required
                        maxLength={2000}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your brand mission, signature product lines, aesthetic, and what you look for in creator collaborations..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all leading-relaxed"
                      />
                    </div>

                    {/* Official Website (Optional) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="brand-website" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                          Official Website
                        </label>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          Optional
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-400">
                          <GlobeIcon className="w-4 h-4" />
                        </div>
                        <input
                          id="brand-website"
                          type="text"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://yourbrand.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Social Channels (Required - At least 1 non-empty handle/URL) */}
                    <div className="space-y-3 pt-5 border-t border-neutral-200/80 dark:border-neutral-800">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                              Social Media Channels <span className="text-pink-500">*</span>
                            </label>
                            <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold bg-pink-50 dark:bg-pink-950/40 px-2.5 py-0.5 rounded-full border border-pink-200/50">
                              At least 1 required
                            </span>
                          </div>
                          {hasAtLeastOneSocial && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckIcon className="w-3.5 h-3.5" />
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          Add at least one active profile URL or handle so creators can verify and learn about your brand.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {/* Instagram */}
                        <div className="space-y-1.5">
                          <label htmlFor="social-instagram" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Instagram
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-pink-500">
                              <InstagramIcon className="w-4 h-4" />
                            </div>
                            <input
                              id="social-instagram"
                              type="text"
                              name="instagram"
                              value={formData.socialLinks?.instagram || ""}
                              onChange={handleSocialChange}
                              placeholder="https://instagram.com/yourbrand"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-1.5">
                          <label htmlFor="social-linkedin" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            LinkedIn
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-blue-600">
                              <LinkedinIcon className="w-4 h-4" />
                            </div>
                            <input
                              id="social-linkedin"
                              type="text"
                              name="linkedin"
                              value={formData.socialLinks?.linkedin || ""}
                              onChange={handleSocialChange}
                              placeholder="https://linkedin.com/company/yourbrand"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* YouTube */}
                        <div className="space-y-1.5">
                          <label htmlFor="social-youtube" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            YouTube
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-red-500">
                              <YoutubeIcon className="w-4 h-4" />
                            </div>
                            <input
                              id="social-youtube"
                              type="text"
                              name="youtube"
                              value={formData.socialLinks?.youtube || ""}
                              onChange={handleSocialChange}
                              placeholder="https://youtube.com/@yourbrand"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* Facebook */}
                        <div className="space-y-1.5">
                          <label htmlFor="social-facebook" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Facebook
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-blue-500">
                              <FacebookIcon className="w-4 h-4" />
                            </div>
                            <input
                              id="social-facebook"
                              type="text"
                              name="facebook"
                              value={formData.socialLinks?.facebook || ""}
                              onChange={handleSocialChange}
                              placeholder="https://facebook.com/yourbrand"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* Twitter / X */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="social-twitter" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Twitter / X
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-900 dark:text-neutral-100">
                              <TwitterIcon className="w-4 h-4" />
                            </div>
                            <input
                              id="social-twitter"
                              type="text"
                              name="twitter"
                              value={formData.socialLinks?.twitter || ""}
                              onChange={handleSocialChange}
                              placeholder="https://x.com/yourbrand"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collaboration Contact Information (Required) */}
                    <div className="space-y-3 pt-5 border-t border-neutral-200/80 dark:border-neutral-800">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                            Brand Collaboration Contact <span className="text-pink-500">*</span>
                          </label>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          Direct partnership details for creator proposals and communications.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                        {/* Contact Name */}
                        <div className="space-y-1.5">
                          <label htmlFor="contact-name" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Contact Name <span className="text-pink-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-400">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <input
                              id="contact-name"
                              type="text"
                              name="name"
                              required
                              value={formData.contactInformation?.name || ""}
                              onChange={handleContactChange}
                              placeholder="e.g. Sarah Jenkins"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* Contact Email */}
                        <div className="space-y-1.5">
                          <label htmlFor="contact-email" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Partnership Email <span className="text-pink-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-400">
                              <EnvelopeIcon className="w-4 h-4" />
                            </div>
                            <input
                              id="contact-email"
                              type="email"
                              name="email"
                              required
                              value={formData.contactInformation?.email || ""}
                              onChange={handleContactChange}
                              placeholder="partnerships@yourbrand.com"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-1.5">
                          <label htmlFor="contact-phone" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Phone Number <span className="text-pink-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-400">
                              <PhoneIcon className="w-4 h-4" />
                            </div>
                            <input
                              id="contact-phone"
                              type="tel"
                              name="phone"
                              required
                              value={formData.contactInformation?.phone || ""}
                              onChange={handleContactChange}
                              placeholder="+1 (555) 000-0000"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Bottom Bar) */}
                  <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError(null);
                        setCurrentStep(1);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("brand_onboarding_step", "1");
                        }
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={isSubmitting || isSavingDraft}
                      className="px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-1 inline-block" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleExplicitSaveDraft}
                        disabled={isSubmitting || isSavingDraft}
                        className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSavingDraft ? "Saving..." : "Save Draft"}
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || isSavingDraft}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin w-4 h-4 text-white dark:text-neutral-950"
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
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span>Review & Continue</span>
                            <ArrowRightIcon className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* =========================================================
                  STEP 3: REVIEW & COMPLETE
              ========================================================= */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Card Section Header */}
                  <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-neutral-950 dark:text-white">
                      Review & Launch
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Check your brand information below before finalizing setup and accessing your dashboard.
                    </p>
                  </div>

                  {/* Missing Mandatory Fields Warning Alert */}
                  {missingRequiredFields.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                          Mandatory details missing before completion:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setValidationError(null);
                            const needStep1 =
                              !formData.companyName?.trim() ||
                              !formData.industry?.trim() ||
                              !formData.location?.trim();
                            const targetStep = needStep1 ? 1 : 2;
                            setCurrentStep(targetStep);
                            if (typeof window !== "undefined") {
                              localStorage.setItem("brand_onboarding_step", String(targetStep));
                            }
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
                        >
                          {!formData.companyName?.trim() ||
                          !formData.industry?.trim() ||
                          !formData.location?.trim()
                            ? "Edit Step 1 →"
                            : "Edit Step 2 →"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {missingRequiredFields.map((f) => (
                          <span
                            key={f}
                            className="px-2.5 py-0.5 rounded-md text-[11px] bg-amber-500/20 text-amber-900 dark:text-amber-200 font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Card: Company Overview */}
                  <div className="bg-neutral-50/60 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0">
                          {formData.logo ? (
                            <img
                              src={formData.logo}
                              alt="Brand Logo"
                              className="w-full h-full object-contain object-center"
                            />
                          ) : (
                            <span className="text-xl font-serif font-bold text-pink-500">
                              {displayInitial}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-lg text-neutral-950 dark:text-white">
                            {formData.companyName || "Untitled Brand"}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            <span>{formData.industry || "Industry not set"}</span>
                            <span>•</span>
                            <span>{formData.location || "Location not set"}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setValidationError(null);
                          setCurrentStep(1);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("brand_onboarding_step", "1");
                          }
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Bio & Details */}
                    <div className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400 block text-xs font-semibold uppercase tracking-wider mb-1">
                          About the Brand
                        </span>
                        <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed">
                          {formData.description || "No company description provided yet."}
                        </p>
                      </div>

                      {formData.website && (
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400 block text-xs font-semibold uppercase tracking-wider mb-1">
                            Official Website
                          </span>
                          <a
                            href={
                              formData.website.startsWith("http")
                                ? formData.website
                                : `https://${formData.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-pink-600 dark:text-pink-400 hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            <span>{formData.website}</span>
                            <GlobeIcon className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Connected Socials & Contact Preview */}
                    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-neutral-500 dark:text-neutral-400 block text-xs font-semibold uppercase tracking-wider">
                          Connected Channels & Contact
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setValidationError(null);
                            setCurrentStep(2);
                            if (typeof window !== "undefined") {
                              localStorage.setItem("brand_onboarding_step", "2");
                            }
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {formData.socialLinks?.instagram && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                            <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                            <span>Instagram</span>
                          </span>
                        )}
                        {formData.socialLinks?.linkedin && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                            <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
                            <span>LinkedIn</span>
                          </span>
                        )}
                        {formData.socialLinks?.youtube && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                            <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                            <span>YouTube</span>
                          </span>
                        )}
                        {formData.socialLinks?.facebook && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                            <FacebookIcon className="w-3.5 h-3.5 text-blue-500" />
                            <span>Facebook</span>
                          </span>
                        )}
                        {formData.socialLinks?.twitter && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                            <TwitterIcon className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />
                            <span>Twitter / X</span>
                          </span>
                        )}
                        {formData.contactInformation?.email && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                            <EnvelopeIcon className="w-3.5 h-3.5 text-pink-500" />
                            <span>{formData.contactInformation.email}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* First Campaign Guidance Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/5 via-neutral-50 to-neutral-50 dark:from-pink-950/20 dark:via-neutral-900/40 dark:to-neutral-900/40 border border-pink-500/20 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                        <MegaphoneIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-950 dark:text-white font-serif">
                          Next Step: Launch Your First Campaign
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          How collaboration works on CreatorLink
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                        <span className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[11px] font-bold flex items-center justify-center">
                          1
                        </span>
                        <span className="font-semibold text-neutral-950 dark:text-white block">
                          Define Deliverables
                        </span>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          Specify Reel, Dedicated Video, or Story requirements with exact submission deadlines.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                        <span className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[11px] font-bold flex items-center justify-center">
                          2
                        </span>
                        <span className="font-semibold text-neutral-950 dark:text-white block">
                          Set Budget Range
                        </span>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          Set Min & Max budget to attract competitive creator applications and bids.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                        <span className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[11px] font-bold flex items-center justify-center">
                          3
                        </span>
                        <span className="font-semibold text-neutral-950 dark:text-white block">
                          Target & Protect
                        </span>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          Specify target audience demographics and content usage rights for your brand.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Bottom Bar - No Skip Option) */}
                  <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError(null);
                        setCurrentStep(2);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("brand_onboarding_step", "2");
                        }
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-1 inline-block" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting || missingRequiredFields.length > 0}
                      onClick={handleCompleteOnboarding}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4 text-white dark:text-neutral-950"
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Finalizing Setup...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4 text-pink-500" />
                          <span>Complete Setup & Launch</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Clean Subtle Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center pt-8 text-xs text-neutral-400 dark:text-neutral-600">
        CreatorLink Platform • Brand Partner Onboarding
      </footer>
    </div>
  );
}
