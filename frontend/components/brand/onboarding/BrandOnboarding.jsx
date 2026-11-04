"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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

// =========================================================
// CONSTANTS & TAXONOMY
// =========================================================
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

const ONBOARDING_STEPS = [
  { id: 1, title: "Company Essentials", subtitle: "Name, Industry & Logo" },
  { id: 2, title: "Story & Socials", subtitle: "Description & Links" },
  { id: 3, title: "Review & Launch", subtitle: "Verify & Complete" },
];

export default function BrandOnboarding() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { profile } = useSelector((state) => state.brandProfile || {});
  const { user: authUser } = useSelector((state) => state.auth || {});

  // Current Step (1, 2, 3)
  const [currentStep, setCurrentStep] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  // UI States
  const [stepError, setStepError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Fetch brand profile on mount to resume existing draft or redirect if already onboarded
  useEffect(() => {
    let isMounted = true;
    dispatch(getBrandProfile())
      .unwrap()
      .then((data) => {
        if (!isMounted) return;
        const p = data?.data || data;
        if (p?.isOnboarded) {
          router.replace("/brand/dashboard");
          return;
        }
        if (p) {
          setFormData((prev) => ({
            companyName: p.companyName || prev.companyName || "",
            industry: p.industry || prev.industry || "",
            location: p.location || prev.location || "",
            logo: p.logo || prev.logo || "",
            website: p.website || prev.website || "",
            description: p.description || prev.description || "",
            socialLinks: {
              instagram: p.socialLinks?.instagram || prev.socialLinks.instagram || "",
              facebook: p.socialLinks?.facebook || prev.socialLinks.facebook || "",
              linkedin: p.socialLinks?.linkedin || prev.socialLinks.linkedin || "",
              youtube: p.socialLinks?.youtube || prev.socialLinks.youtube || "",
            },
            contactInformation: {
              name: p.contactInformation?.name || prev.contactInformation.name || "",
              email: p.contactInformation?.email || prev.contactInformation.email || "",
              phone: p.contactInformation?.phone || prev.contactInformation.phone || "",
            },
          }));

          // Determine starting step based on saved draft completeness
          if (p.companyName && p.industry && p.location) {
            setCurrentStep(2);
          }
        }
      })
      .catch(() => {
        // 404 is normal for a brand who just registered and hasn't created a profile document yet
      })
      .finally(() => {
        if (isMounted) setIsInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch, router]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
      } else {
        setUploadError("Could not retrieve uploaded image URL.");
      }
    } catch (err) {
      setUploadError(err?.response?.data?.message || err?.message || "Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Draft persistence helper (Does NOT mark profile as onboarded)
  const saveDraft = async (stepPayload) => {
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

    if (hasProfile) {
      await dispatch(updateBrandProfile(mergedPayload)).unwrap();
    } else {
      await dispatch(createBrandProfile(mergedPayload)).unwrap();
    }
  };

  // Step 1 Validation & Proceed
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setStepError("");

    if (!formData.companyName.trim()) {
      setStepError("Company Name is required.");
      return;
    }
    if (!formData.industry.trim()) {
      setStepError("Please select an Industry.");
      return;
    }
    if (!formData.location.trim()) {
      setStepError("Location is required.");
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStepError(err?.message || "Failed to save company essentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 Validation & Proceed
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setStepError("");

    try {
      setIsSubmitting(true);
      await saveDraft({
        description: formData.description.trim(),
        website: formData.website.trim(),
        socialLinks: formData.socialLinks,
        contactInformation: formData.contactInformation,
      });
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStepError(err?.message || "Failed to save brand story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3 Completion
  const handleCompleteOnboarding = async () => {
    setStepError("");

    // Verify required fields
    if (!formData.companyName.trim() || !formData.industry.trim() || !formData.location.trim()) {
      setStepError("Please complete all required company essentials before completing onboarding.");
      return;
    }

    try {
      setIsSubmitting(true);
      const actionResult = await dispatch(
        completeBrandOnboarding({
          companyName: formData.companyName.trim(),
          industry: formData.industry.trim(),
          location: formData.location.trim(),
          logo: formData.logo.trim(),
          description: formData.description.trim(),
          website: formData.website.trim(),
          socialLinks: formData.socialLinks,
          contactInformation: formData.contactInformation,
        })
      ).unwrap();

      if (actionResult) {
        router.push("/brand/dashboard");
      }
    } catch (err) {
      setStepError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to finalize onboarding. Please check your inputs and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Missing Fields calculation for Step 3 review
  const missingRequiredFields = useMemo(() => {
    const missing = [];
    if (!formData.companyName.trim()) missing.push("Company Name");
    if (!formData.industry.trim()) missing.push("Industry");
    if (!formData.location.trim()) missing.push("Location");
    return missing;
  }, [formData]);

  // Initial avatar initial fallback
  const displayInitial = useMemo(() => {
    if (formData.companyName.trim()) {
      return formData.companyName.trim()[0].toUpperCase();
    }
    return authUser?.name ? authUser.name[0].toUpperCase() : "B";
  }, [formData.companyName, authUser]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-text-secondary font-medium">Loading your onboarding setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* TOP BRAND NAVIGATION BAR */}
      <header className="border-b border-border-theme bg-surface sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-serif text-lg font-bold tracking-wide text-foreground"
          >
            <span>CREATORLINK</span>
            <span className="text-secondary text-lg leading-none">✦</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary border border-secondary/20">
              Brand Setup Wizard
            </span>
            <Link
              href="/brand/dashboard"
              className="text-xs text-text-secondary hover:text-foreground font-medium transition-colors"
            >
              Skip to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* STEP PROGRESS TRACKER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="font-semibold text-foreground">
              Step {currentStep} of 3: {ONBOARDING_STEPS[currentStep - 1].title}
            </span>
            <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border-theme">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>

          {/* Step Pills */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {ONBOARDING_STEPS.map((s) => {
              const isPast = currentStep > s.id;
              const isCurrent = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (isPast) setCurrentStep(s.id);
                  }}
                  disabled={!isPast && !isCurrent}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                    isCurrent
                      ? "border-secondary bg-secondary/5 font-semibold text-foreground shadow-xs"
                      : isPast
                      ? "border-border-theme bg-surface hover:bg-surface-muted text-text-secondary cursor-pointer"
                      : "border-border-theme/40 bg-surface/40 text-text-secondary/50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? "bg-secondary text-white"
                          : isPast
                          ? "bg-emerald-500 text-white"
                          : "bg-surface-muted text-text-secondary"
                      }`}
                    >
                      {isPast ? "✓" : s.id}
                    </span>
                    <span className="truncate font-medium">{s.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FEEDBACK ERROR BANNER */}
        {stepError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
            <span className="font-bold">Error:</span>
            <span>{stepError}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: COMPANY ESSENTIALS                                */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-xl font-serif font-bold text-foreground">Company Essentials</h2>
              <p className="text-xs text-text-secondary">
                Set up your brand identity so creators know who you are and what you stand for.
              </p>
            </div>

            <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-6">
              {/* Brand Logo Upload Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Brand Logo
                </label>
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border-theme bg-surface-muted flex items-center justify-center shadow-xs shrink-0">
                    {formData.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.logo}
                        alt="Brand Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-serif font-bold text-secondary">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-theme text-foreground text-xs font-medium hover:bg-surface-muted transition-colors cursor-pointer shadow-xs"
                      >
                        <CameraIcon className="w-3.5 h-3.5" />
                        <span>{formData.logo ? "Change Logo" : "Upload Logo"}</span>
                      </label>
                      {formData.logo && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                          className="px-2.5 py-1.5 text-xs text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Recommended: Square PNG or WebP, minimum 300x300px.
                    </p>
                    {uploadError && <p className="text-[11px] text-rose-500 font-medium">{uploadError}</p>}
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Company / Brand Name <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              {/* Industry Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Primary Industry <span className="text-secondary">*</span>
                </label>
                <select
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs focus:outline-hidden focus:border-secondary transition-colors"
                >
                  <option value="">Select your industry...</option>
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location with Quick Suggestions */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Headquarters / Operating Location <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                  />
                </div>

                {/* Popular Quick Location Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-text-secondary">Suggestions:</span>
                  {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, location: loc }))}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-surface-muted hover:bg-secondary/10 hover:text-secondary border border-border-theme transition-colors cursor-pointer"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/brand/dashboard"
                className="text-xs text-text-secondary hover:text-foreground transition-colors"
              >
                Skip for now
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-semibold transition-all shadow-md shadow-secondary/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? "Saving..." : "Save & Continue"}</span>
                <ArrowRightIcon />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 2: BRAND STORY & SOCIALS                             */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-xl font-serif font-bold text-foreground">Brand Story & Socials</h2>
              <p className="text-xs text-text-secondary">
                Tell creators about your vision, provide official links, and add collaboration contact info.
              </p>
            </div>

            <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-6">
              {/* Company Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Company Description / Bio
                  </label>
                  <span className="text-[11px] text-text-secondary">
                    {formData.description.length} / 2000
                  </span>
                </div>
                <textarea
                  name="description"
                  rows={4}
                  maxLength={2000}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your brand mission, signature product lines, aesthetic, and what you look for in creator collaborations..."
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                />
              </div>

              {/* Website URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Official Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                    <GlobeIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourbrand.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-3 pt-2 border-t border-border-theme">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Social Channels
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Instagram */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-500">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      name="instagram"
                      value={formData.socialLinks?.instagram || ""}
                      onChange={handleSocialChange}
                      placeholder="Instagram URL"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
                      <LinkedinIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.socialLinks?.linkedin || ""}
                      onChange={handleSocialChange}
                      placeholder="LinkedIn Company URL"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                      <YoutubeIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      name="youtube"
                      value={formData.socialLinks?.youtube || ""}
                      onChange={handleSocialChange}
                      placeholder="YouTube Channel URL"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* Facebook */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500">
                      <FacebookIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      name="facebook"
                      value={formData.socialLinks?.facebook || ""}
                      onChange={handleSocialChange}
                      placeholder="Facebook Page URL"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Collaboration Contact Information */}
              <div className="space-y-3 pt-2 border-t border-border-theme">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Brand Collaboration Contact
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Contact Name */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.contactInformation?.name || ""}
                      onChange={handleContactChange}
                      placeholder="Contact Name"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* Contact Email */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                      <EnvelopeIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.contactInformation?.email || ""}
                      onChange={handleContactChange}
                      placeholder="business@brand.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                      <PhoneIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.contactInformation?.phone || ""}
                      onChange={handleContactChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-theme text-xs font-semibold hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <ArrowLeftIcon />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-semibold transition-all shadow-md shadow-secondary/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? "Saving..." : "Review & Continue"}</span>
                <ArrowRightIcon />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 3: REVIEW & COMPLETE                                 */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-xl font-serif font-bold text-foreground">Review & Complete</h2>
              <p className="text-xs text-text-secondary">
                Review your profile details below before finalizing onboarding.
              </p>
            </div>

            {/* MISSING FIELDS WARNING (IF ANY) */}
            {missingRequiredFields.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Required fields missing before completion:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                  >
                    Edit Step 1 &rarr;
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missingRequiredFields.map((f) => (
                    <span
                      key={f}
                      className="px-2.5 py-0.5 rounded-md text-[11px] bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEW CARD 1: COMPANY OVERVIEW */}
            <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border-theme">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border-theme bg-surface-muted flex items-center justify-center shrink-0">
                    {formData.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-serif font-bold text-secondary">
                        {displayInitial}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground">
                      {formData.companyName || "Untitled Brand"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                      <span>{formData.industry || "Industry not set"}</span>
                      <span>•</span>
                      <span>{formData.location || "Location not set"}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-secondary hover:underline font-medium cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Bio & Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-text-secondary block text-[11px] font-medium">About the Brand</span>
                  <p className="text-foreground mt-0.5 whitespace-pre-line leading-relaxed">
                    {formData.description || "No company description provided yet."}
                  </p>
                </div>

                {formData.website && (
                  <div>
                    <span className="text-text-secondary block text-[11px] font-medium">Website</span>
                    <a
                      href={formData.website.startsWith("http") ? formData.website : `https://${formData.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-secondary hover:underline flex items-center gap-1 font-medium mt-0.5"
                    >
                      {formData.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Social Channels Preview */}
              <div className="pt-3 border-t border-border-theme">
                <span className="text-text-secondary block text-[11px] font-medium mb-2">
                  Connected Channels & Contact
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {formData.socialLinks?.instagram && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-muted border border-border-theme">
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                      <span>Instagram</span>
                    </span>
                  )}
                  {formData.socialLinks?.linkedin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-muted border border-border-theme">
                      <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>LinkedIn</span>
                    </span>
                  )}
                  {formData.socialLinks?.youtube && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-muted border border-border-theme">
                      <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                      <span>YouTube</span>
                    </span>
                  )}
                  {formData.socialLinks?.facebook && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-muted border border-border-theme">
                      <FacebookIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>Facebook</span>
                    </span>
                  )}
                  {formData.contactInformation?.email && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-muted border border-border-theme">
                      <EnvelopeIcon className="w-3.5 h-3.5 text-secondary" />
                      <span>{formData.contactInformation.email}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FIRST CAMPAIGN GUIDANCE CARD */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/5 via-surface to-surface border border-secondary/20 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <MegaphoneIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground font-serif">
                    Next Step: Launch Your First Campaign
                  </h4>
                  <p className="text-xs text-text-secondary">
                    How campaign collaboration works on CreatorLink
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface border border-border-theme space-y-1">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="font-semibold text-foreground block">Define Deliverables</span>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Specify Reel, Dedicated Video, or Story requirements with exact deadlines.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border-theme space-y-1">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="font-semibold text-foreground block">Set Budget Range</span>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Set a Min & Max budget to attract competitive creator bids and proposals.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border-theme space-y-1">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="font-semibold text-foreground block">Target & Protect</span>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Choose age/location demographics and content usage rights (organic vs paid ads).
                  </p>
                </div>
              </div>
            </div>

            {/* COMPLETION ACTIONS */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-theme text-xs font-semibold hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <ArrowLeftIcon />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || missingRequiredFields.length > 0}
                onClick={handleCompleteOnboarding}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-bold transition-all shadow-md shadow-secondary/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>{isSubmitting ? "Finalizing Setup..." : "Complete Setup & Launch"}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
