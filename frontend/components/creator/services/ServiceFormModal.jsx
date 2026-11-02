"use client";

import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  createCreatorService,
  updateCreatorService,
} from "@/redux/creator/services/services_slice";
import { uploadSingleImageApi } from "@/lib/upload";

// =========================================================
// ENUM OPTIONS & CONSTANTS (SHARED)
// =========================================================
export const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Website" },
  { value: "multiple", label: "Multiple Platforms" },
  { value: "other", label: "Other" },
];

export const PRICING_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed Price" },
  { value: "starting_from", label: "Starting From" },
  { value: "custom", label: "Custom Quote" },
];

export const PLATFORM_CONTENT_TYPES = {
  instagram: [
    { value: "reel", label: "Instagram Reel" },
    { value: "post", label: "Feed Post" },
    { value: "story", label: "Story" },
    { value: "carousel", label: "Carousel Post" },
    { value: "other", label: "Other" },
  ],
  youtube: [
    { value: "video", label: "Dedicated Video" },
    { value: "short", label: "YouTube Short" },
    { value: "integration", label: "Video Integration / Sponsor" },
    { value: "other", label: "Community Post / Other" },
  ],
  tiktok: [
    { value: "video", label: "TikTok Video" },
    { value: "story", label: "TikTok Story" },
    { value: "series", label: "TikTok Series" },
    { value: "other", label: "Other" },
  ],
  facebook: [
    { value: "post", label: "Feed Post" },
    { value: "reel", label: "Facebook Reel" },
    { value: "video", label: "Facebook Video" },
    { value: "story", label: "Story" },
    { value: "other", label: "Other" },
  ],
  website: [
    { value: "article", label: "Article / Blog Review" },
    { value: "review", label: "Product Review" },
    { value: "banner", label: "Banner / Post" },
    { value: "other", label: "Other" },
  ],
  multiple: [
    { value: "cross_platform_bundle", label: "Cross-Platform Bundle" },
    { value: "campaign_package", label: "Full Campaign Package" },
    { value: "other", label: "Other" },
  ],
  other: [
    { value: "custom", label: "Custom Deliverable" },
    { value: "consultation", label: "Consultation / Strategy" },
    { value: "shoutout", label: "Shoutout" },
    { value: "other", label: "Other" },
  ],
};

export const getContentTypeLabel = (platform, contentType) => {
  if (!contentType) return "";
  const types = PLATFORM_CONTENT_TYPES[platform] || PLATFORM_CONTENT_TYPES.other;
  const match = types.find((t) => t.value === contentType);
  return match ? match.label : contentType;
};

export const initialFormState = {
  title: "",
  description: "",
  category: "Social Media Campaign",
  coverImage: "",
  platform: "instagram",
  contentType: "reel",
  quantity: 1,
  pricingType: "fixed",
  price: 0,
  currency: "INR",
  deliveryTime: 7,
  revisions: 1,
  deliverables: [],
  isActive: true,
};

export const formatDeliverableItem = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  if (typeof item === "object") {
    const fields = [
      item.title,
      item.name,
      item.type,
      item.deliverable,
      item.text,
      item.label,
    ];
    let text = "";
    for (const field of fields) {
      if (field != null) {
        const str = String(field).trim();
        if (str && str !== "[object Object]") {
          text = str;
          break;
        }
      }
    }
    const rawCount = item.count ?? item.quantity ?? item.amount;
    const count =
      rawCount != null && rawCount !== ""
        ? String(rawCount).trim()
        : "";

    if (text && count) return `${count} ${text}`;
    if (text) return text;
    return "";
  }
  return String(item).trim();
};

export const getDeliverablesList = (deliverables) => {
  if (!deliverables) return [];

  let list = [];
  if (Array.isArray(deliverables)) {
    list = deliverables.flat();
  } else if (typeof deliverables === "string") {
    const trimmed = deliverables.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          list = parsed.flat();
        } else if (parsed && typeof parsed === "object") {
          list = [parsed];
        } else {
          list = [trimmed];
        }
      } catch {
        list = trimmed.includes(",") ? trimmed.split(",") : [trimmed];
      }
    } else if (trimmed.includes(",")) {
      list = trimmed.split(",");
    } else if (trimmed) {
      list = [trimmed];
    }
  } else if (typeof deliverables === "object") {
    list = [deliverables];
  } else {
    list = [deliverables];
  }

  return list.map(formatDeliverableItem).filter(Boolean);
};

export const formatPrice = (service) => {
  if (!service) return "—";
  const { pricingType, price, currency = "INR" } = service;
  if (pricingType === "custom") {
    return "Custom Quote";
  }
  const formattedNum = new Intl.NumberFormat("en-IN").format(price || 0);
  const symbol = currency === "INR" || !currency ? "₹" : `${currency} `;
  return `${symbol}${formattedNum}`;
};

export const getPlatformLabel = (val) => {
  const match = PLATFORM_OPTIONS.find(
    (p) => p.value === (val || "").toLowerCase()
  );
  return match ? match.label : val || "Other";
};

// =========================================================
// SVG ICONS
// =========================================================
function PhotoIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

function LinkIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function TrashIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

// =========================================================
// REUSABLE SERVICE CARD COVER COMPONENT
// =========================================================
export function ServiceCardCover({ coverImage, title, children }) {
  const [prevCoverImage, setPrevCoverImage] = useState(coverImage);
  const [failedUrl, setFailedUrl] = useState(null);

  if (coverImage !== prevCoverImage) {
    setPrevCoverImage(coverImage);
    setFailedUrl(null);
  }

  const isImgError = Boolean(coverImage) && failedUrl === coverImage;

  return (
    <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-surface-muted">
      {coverImage && !isImgError ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={coverImage}
          src={coverImage}
          alt={title || "Service cover preview"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => setFailedUrl(coverImage)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100/90 dark:bg-surface-muted text-text-secondary p-4 text-center">
          <PhotoIcon className="w-8 h-8 opacity-30 mb-1" />
          <span className="text-[11px] font-medium opacity-70">
            {coverImage ? "Image unavailable" : "No cover image"}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

function getInitialFormData(service, defaultCategory) {
  if (service) {
    const platform = service.platform || "instagram";
    const availableTypes =
      PLATFORM_CONTENT_TYPES[platform] || PLATFORM_CONTENT_TYPES.other;
    const defaultContentType = availableTypes[0]?.value || "other";

    return {
      title: service.title || "",
      description: service.description || "",
      category: service.category || defaultCategory || "Social Media Campaign",
      coverImage: service.coverImage || "",
      platform,
      contentType: service.contentType || defaultContentType,
      quantity:
        typeof service.quantity === "number" && service.quantity >= 1
          ? Math.floor(service.quantity)
          : 1,
      pricingType: service.pricingType || "fixed",
      price: typeof service.price === "number" ? service.price : 0,
      currency: service.currency || "INR",
      deliveryTime:
        typeof service.deliveryTime === "number" ? service.deliveryTime : 7,
      revisions:
        typeof service.revisions === "number" ? service.revisions : 1,
      deliverables: getDeliverablesList(service.deliverables),
      isActive:
        typeof service.isActive === "boolean" ? service.isActive : true,
    };
  }
  return {
    ...initialFormState,
    category: defaultCategory || "Social Media Campaign",
  };
}

// Inner modal content keyed by service to avoid effect-based state synchronization
function ServiceFormModalContent({
  onClose,
  service = null,
  defaultCategory = "Social Media Campaign",
  onSuccess,
}) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(() =>
    getInitialFormData(service, defaultCategory)
  );
  const [deliverableInput, setDeliverableInput] = useState("");
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Cover Image upload & preview states
  const fileInputRef = useRef(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewErrorUrl, setPreviewErrorUrl] = useState(null);

  const handleClose = () => {
    if (!submitting && !isUploadingCover) {
      onClose();
    }
  };

  // Helper to process and upload cover image file
  const processCoverFile = async (file) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Please upload a valid image file (JPEG, PNG, or WebP).");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5 MB.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploadError(null);
    setPreviewErrorUrl(null);
    setIsUploadingCover(true);

    try {
      const uploadRes = await uploadSingleImageApi(file, "creatorlink/services");
      const uploadedUrl =
        uploadRes?.url ||
        uploadRes?.secure_url ||
        uploadRes?.data?.url ||
        uploadRes?.data?.secure_url;

      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          coverImage: uploadedUrl,
        }));
      } else {
        setUploadError("Could not retrieve uploaded image URL.");
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to upload cover image.";
      setUploadError(errMsg);
    } finally {
      setIsUploadingCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCoverFileSelect = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      processCoverFile(file);
    }
  };

  const handleCoverDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploadingCover) {
      setIsDraggingCover(true);
    }
  };

  const handleCoverDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
  };

  const handleCoverDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
    if (isUploadingCover) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processCoverFile(file);
    }
  };

  const handleRemoveCover = () => {
    if (isUploadingCover) return;
    setFormData((prev) => ({ ...prev, coverImage: "" }));
    setUploadError(null);
    setPreviewErrorUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;
    if (type === "checkbox") {
      val = checked;
    } else if (name === "platform") {
      const availableTypes =
        PLATFORM_CONTENT_TYPES[value] || PLATFORM_CONTENT_TYPES.other;
      const isCurrentTypeValid = availableTypes.some(
        (t) => t.value === formData.contentType
      );
      const nextContentType = isCurrentTypeValid
        ? formData.contentType
        : availableTypes[0]?.value || "other";
      setFormData((prev) => ({
        ...prev,
        platform: value,
        contentType: nextContentType,
      }));
      setFormError(null);
      return;
    } else if (name === "quantity") {
      val = value === "" ? "" : Math.max(1, Math.floor(Number(value) || 1));
    } else if (
      name === "price" ||
      name === "deliveryTime" ||
      name === "revisions"
    ) {
      val = value === "" ? "" : Number(value);
    } else if (name === "currency") {
      val = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
    setFormError(null);
  };

  const handleAddDeliverable = () => {
    if (!deliverableInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, deliverableInput.trim()],
    }));
    setDeliverableInput("");
  };

  const handleRemoveDeliverable = (index) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || isUploadingCover) return;
    setFormError(null);

    // Validation matching backend rules
    if (!formData.title || !formData.title.trim()) {
      setFormError("Service title is required.");
      return;
    }
    if (formData.title.trim().length > 150) {
      setFormError("Service title must not exceed 150 characters.");
      return;
    }
    if (formData.description && formData.description.length > 2000) {
      setFormError("Description must not exceed 2000 characters.");
      return;
    }
    if (!formData.category || !formData.category.trim()) {
      setFormError("Service category is required.");
      return;
    }
    if (formData.category.trim().length > 100) {
      setFormError("Category must not exceed 100 characters.");
      return;
    }
    if (
      !formData.platform ||
      !PLATFORM_OPTIONS.some((p) => p.value === formData.platform)
    ) {
      setFormError("Valid service platform is required.");
      return;
    }
    if (
      formData.pricingType &&
      !PRICING_TYPE_OPTIONS.some((p) => p.value === formData.pricingType)
    ) {
      setFormError("Valid pricing type is required.");
      return;
    }
    if (
      formData.pricingType !== "custom" &&
      (typeof formData.price !== "number" || formData.price < 0)
    ) {
      setFormError("Price must be a valid non-negative number.");
      return;
    }
    if (
      formData.currency &&
      (typeof formData.currency !== "string" || formData.currency.length !== 3)
    ) {
      setFormError(
        "Currency must be a valid 3-letter uppercase code (e.g. INR, USD)."
      );
      return;
    }
    if (
      typeof formData.deliveryTime !== "number" ||
      formData.deliveryTime < 1
    ) {
      setFormError("Delivery time must be at least 1 day.");
      return;
    }
    if (typeof formData.revisions !== "number" || formData.revisions < 0) {
      setFormError("Revisions must be a valid non-negative number.");
      return;
    }
    if (
      formData.quantity !== undefined &&
      (typeof formData.quantity !== "number" ||
        !Number.isInteger(formData.quantity) ||
        formData.quantity < 1)
    ) {
      setFormError("Quantity must be a positive integer of at least 1.");
      return;
    }

    const parsedQuantity = Math.max(1, Math.floor(Number(formData.quantity) || 1));

    const payload = {
      title: formData.title.trim(),
      description: formData.description ? formData.description.trim() : "",
      category: formData.category.trim(),
      coverImage: formData.coverImage ? formData.coverImage.trim() : "",
      platform: formData.platform,
      contentType: (formData.contentType || "").trim(),
      quantity: parsedQuantity,
      pricingType: formData.pricingType,
      price:
        formData.pricingType === "custom" ? 0 : Number(formData.price) || 0,
      currency: (formData.currency || "INR").toUpperCase(),
      deliveryTime: Number(formData.deliveryTime) || 7,
      revisions: Number(formData.revisions) || 0,
      deliverables: formData.deliverables.map((d) => d.trim()).filter(Boolean),
      isActive: Boolean(formData.isActive),
    };

    setSubmitting(true);
    const serviceId = service?._id || service?.id;

    try {
      let resultAction;
      if (serviceId) {
        resultAction = await dispatch(
          updateCreatorService({
            serviceId,
            serviceData: payload,
          })
        );
      } else {
        resultAction = await dispatch(createCreatorService(payload));
      }

      setSubmitting(false);

      const isSuccess = serviceId
        ? updateCreatorService.fulfilled.match(resultAction)
        : createCreatorService.fulfilled.match(resultAction);

      if (isSuccess) {
        onSuccess?.(resultAction.payload);
        onClose();
      } else {
        setFormError(
          resultAction.payload ||
            (serviceId
              ? "Failed to update service."
              : "Failed to create service.")
        );
      }
    } catch (err) {
      setSubmitting(false);
      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save service."
      );
    }
  };

  const serviceId = service?._id || service?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={handleClose} />
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-border-theme flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="font-serif font-semibold text-lg sm:text-xl text-foreground tracking-tight truncate">
              {serviceId ? "Edit Service" : "Add Service"}
            </h2>
            <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 line-clamp-1 sm:line-clamp-none">
              {serviceId
                ? "Update your service package details and pricing."
                : "Create a new service package for brands."}
            </p>
          </div>
          <button
            type="button"
            disabled={submitting || isUploadingCover}
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1 custom-scrollbar min-h-0">
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-medium text-xs">
                <span>{formError}</span>
              </div>
            )}

            {/* Cover Image Section */}
            <div className="space-y-2">
              <div>
                <label className="block font-semibold text-foreground text-xs sm:text-sm">
                  Cover Image
                </label>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Upload a high-quality image for your service package (JPG, PNG, WebP, max 5MB)
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverFileSelect}
                className="hidden"
              />

              {formData.coverImage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
                  {/* Image Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-border-theme bg-surface-muted h-40 sm:h-48 md:h-52 group">
                    {previewErrorUrl === formData.coverImage ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-surface-muted text-text-secondary">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                          <PhotoIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          Failed to load preview
                        </span>
                        <span className="text-[11px] text-text-secondary mt-0.5 max-w-[200px] leading-tight">
                          Please check the image URL or upload a new file.
                        </span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={formData.coverImage}
                        src={formData.coverImage}
                        alt="Service cover preview"
                        className="w-full h-full object-cover"
                        onError={() => setPreviewErrorUrl(formData.coverImage)}
                      />
                    )}

                    {/* Floating Top-Right Remove Button */}
                    <button
                      type="button"
                      title="Remove image"
                      disabled={isUploadingCover}
                      onClick={handleRemoveCover}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/60 hover:bg-black/85 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>

                    {isUploadingCover && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 text-white p-3 text-center">
                        <RefreshIcon className="w-5 h-5 animate-spin" />
                        <span className="text-xs font-medium">Uploading cover image...</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Upload Box & Action Buttons */}
                  <div className="flex flex-col justify-between gap-2.5">
                    <div
                      onDragOver={handleCoverDragOver}
                      onDragLeave={handleCoverDragLeave}
                      onDrop={handleCoverDrop}
                      onClick={() => {
                        if (!isUploadingCover) fileInputRef.current?.click();
                      }}
                      className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all flex-1 min-h-[110px] ${
                        isDraggingCover
                          ? "border-secondary bg-pink-50/60 dark:bg-pink-950/30 scale-[0.99]"
                          : "border-pink-200 dark:border-pink-900/50 hover:border-secondary/60 bg-pink-50/20 hover:bg-pink-50/40 dark:bg-pink-950/10 dark:hover:bg-pink-950/20"
                      } ${isUploadingCover ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center text-secondary mb-2">
                        <ArrowUpTrayIcon className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-xs text-foreground">Click to upload</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">or drag and drop</p>
                      <p className="text-[10px] text-text-secondary/80 mt-1">
                        JPG, PNG, WebP (Max 5MB)
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        type="button"
                        disabled={isUploadingCover}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-muted border border-border-theme text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 flex-1 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <PhotoIcon className="w-3.5 h-3.5 text-text-secondary" />
                        <span>Change Image</span>
                      </button>
                      <button
                        type="button"
                        disabled={isUploadingCover}
                        onClick={handleRemoveCover}
                        className="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/50 border border-pink-200/80 dark:border-pink-900/60 text-secondary dark:text-pink-400 font-semibold text-xs flex items-center justify-center gap-1.5 flex-1 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        <span>Remove Image</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty State: Full-Width Upload Dropzone */
                <div
                  onDragOver={handleCoverDragOver}
                  onDragLeave={handleCoverDragLeave}
                  onDrop={handleCoverDrop}
                  onClick={() => {
                    if (!isUploadingCover) fileInputRef.current?.click();
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDraggingCover
                      ? "border-secondary bg-pink-50/60 dark:bg-pink-950/30 scale-[0.99]"
                      : "border-pink-200 dark:border-pink-900/50 hover:border-secondary/60 bg-pink-50/20 hover:bg-pink-50/40 dark:bg-pink-950/10 dark:hover:bg-pink-950/20"
                  } ${isUploadingCover ? "pointer-events-none opacity-60" : ""}`}
                >
                  {isUploadingCover ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-foreground">
                      <RefreshIcon className="w-7 h-7 text-secondary animate-spin mb-1" />
                      <span className="text-xs font-semibold">Uploading cover image...</span>
                      <span className="text-[11px] text-text-secondary">Please wait</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center text-secondary mb-2 sm:mb-2.5">
                        <ArrowUpTrayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="font-bold text-xs sm:text-sm text-foreground">
                        Click to upload <span className="font-normal text-text-secondary text-xs">or drag and drop</span>
                      </p>
                      <p className="text-[11px] text-text-secondary mt-1">
                        JPG, PNG, WebP (Max 5MB)
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* OR Divider */}
              <div className="relative my-2 sm:my-2.5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-theme/70" />
                </div>
                <div className="relative bg-surface px-3">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary tracking-wider uppercase">
                    OR
                  </span>
                </div>
              </div>

              {/* Manual Image URL Input */}
              <div>
                <label className="block font-semibold text-foreground mb-1 text-xs">
                  Image URL
                </label>
                <div className="relative flex items-center">
                  <LinkIcon className="w-3.5 h-3.5 text-text-secondary absolute left-3.5 pointer-events-none" />
                  <input
                    type="url"
                    name="coverImage"
                    disabled={isUploadingCover}
                    value={formData.coverImage}
                    onChange={(e) => {
                      handleInputChange(e);
                      setUploadError(null);
                      setPreviewErrorUrl(null);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-surface-muted/60 border border-border-theme text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:border-secondary transition-colors disabled:opacity-50"
                  />
                </div>
                <p className="text-[11px] text-text-secondary mt-1">
                  Paste a valid image URL instead of uploading
                </p>
              </div>

              {uploadError && (
                <p className="text-xs text-red-500 font-medium">
                  {uploadError}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                Service Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                maxLength={150}
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Dedicated Instagram Reel & Story Package"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors text-xs sm:text-sm"
              />
            </div>

            {/* Category & Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  maxLength={100}
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Social Media Campaign"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                  Platform <span className="text-red-500">*</span>
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Type & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  {(PLATFORM_CONTENT_TYPES[formData.platform] || PLATFORM_CONTENT_TYPES.other).map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  step="1"
                  required
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Pricing Type, Price, Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                  Pricing Type
                </label>
                <select
                  name="pricingType"
                  value={formData.pricingType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  {PRICING_TYPE_OPTIONS.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                  Price ({formData.currency})
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  disabled={formData.pricingType === "custom"}
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors disabled:opacity-50 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                  Currency
                </label>
                <input
                  type="text"
                  name="currency"
                  maxLength={3}
                  value={formData.currency}
                  onChange={handleInputChange}
                  placeholder="INR"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground uppercase focus:outline-none focus:border-secondary transition-colors text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Delivery Time & Revisions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                  Delivery Time (Days)
                </label>
                <input
                  type="number"
                  name="deliveryTime"
                  min="1"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  placeholder="7"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                  Revisions Included
                </label>
                <input
                  type="number"
                  name="revisions"
                  min="0"
                  value={formData.revisions}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-foreground mb-1.5 text-xs sm:text-sm">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                maxLength={2000}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what is included in this service package..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors resize-none text-xs sm:text-sm"
              />
            </div>

            {/* Dynamic Deliverables List */}
            <div className="space-y-2.5 pt-2 border-t border-border-theme">
              <label className="block font-semibold text-foreground text-xs sm:text-sm">
                Deliverables (Optional)
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={deliverableInput}
                  onChange={(e) => setDeliverableInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                  placeholder="e.g. 1x High Quality Reel (60s)"
                  className="flex-1 w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary font-semibold transition-colors cursor-pointer shrink-0 text-center"
                >
                  + Add
                </button>
              </div>

              {formData.deliverables.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.deliverables.map((item, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-muted text-foreground border border-border-theme text-xs"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(index)}
                        className="text-text-secondary hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                        aria-label="Remove deliverable"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Toggle Switch */}
            <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30 flex items-center justify-between pt-3">
              <div>
                <span className="font-semibold text-foreground block text-xs sm:text-sm">
                  Active Status
                </span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  {formData.isActive
                    ? "Active services are visible and selectable by brands."
                    : "Inactive services are hidden from brands."}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                aria-label="Toggle active status"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.isActive
                    ? "bg-secondary"
                    : "bg-surface-muted border-border-theme"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formData.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Footer (Black primary styling in light mode) */}
          <div className="p-3.5 sm:p-5 border-t border-border-theme bg-surface-muted/30 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              disabled={submitting || isUploadingCover}
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-text-secondary hover:text-foreground font-medium text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isUploadingCover}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-neutral-950 text-white font-semibold text-xs sm:text-sm shadow-xs hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 flex items-center justify-center gap-2 text-center"
            >
              {submitting && (
                <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>
                {submitting
                  ? "Saving..."
                  : serviceId
                  ? "Update Service"
                  : "Create Service"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// =========================================================
// EXPORT DEFAULT SERVICE FORM MODAL WRAPPER
// =========================================================
export default function ServiceFormModal({
  isOpen,
  onClose,
  service = null,
  defaultCategory = "Social Media Campaign",
  onSuccess,
}) {
  if (!isOpen) return null;

  return (
    <ServiceFormModalContent
      key={service?._id || service?.id || "new-service"}
      onClose={onClose}
      service={service}
      defaultCategory={defaultCategory}
      onSuccess={onSuccess}
    />
  );
}
