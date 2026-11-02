"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  createPortfolioItem,
  updatePortfolioItem,
} from "@/redux/creator/portfolio/portfolio_slice";
import { uploadSingleImageApi } from "@/lib/upload";

// =========================================================
// SVG ICONS (Inline Component Library)
// =========================================================
function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

function PhotoIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ArrowPathIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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

// =========================================================
// REUSABLE PORTFOLIO CARD COVER COMPONENT
// =========================================================
export function PortfolioCardCover({ coverImage, title, category, isPublic, children }) {
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [failedUrl, setFailedUrl] = useState(null);

  const isImgLoaded = loadedUrl === coverImage;
  const isImgError = failedUrl === coverImage;
  const isImgLoading = Boolean(coverImage) && !isImgLoaded && !isImgError;

  return (
    <div className="relative h-48 sm:h-52 bg-surface-muted overflow-hidden">
      {coverImage && !isImgError ? (
        <>
          {isImgLoading && (
            <div className="absolute inset-0 bg-surface-muted animate-pulse flex items-center justify-center text-text-secondary/30">
              <PhotoIcon className="w-10 h-10 opacity-30" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={coverImage}
            src={coverImage}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoadedUrl(coverImage)}
            onError={() => setFailedUrl(coverImage)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out ${
              isImgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Subtle Dark Gradient Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neutral-100/80 dark:bg-surface-muted relative overflow-hidden transition-colors duration-300 group-hover:bg-neutral-200/60 dark:group-hover:bg-neutral-800/60">
          <div className="transform transition-all duration-300 ease-out group-hover:scale-115 group-hover:-translate-y-0.5 flex flex-col items-center gap-1.5 text-text-secondary group-hover:text-neutral-950 dark:group-hover:text-white">
            <PhotoIcon className="w-9 h-9 opacity-40 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="text-[11px] font-medium tracking-wide uppercase transition-colors duration-300">
              {category || "Project"}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

// =========================================================
// INITIAL FORM STATE & DEFAULT OPTIONS
// =========================================================
export const initialFormState = {
  title: "",
  description: "",
  category: "Fashion & Luxury",
  coverImage: "",
  isPublic: true,
  contents: [],
};

export const DEFAULT_PORTFOLIO_CATEGORIES = [
  "Fashion & Luxury",
  "Beauty & Skincare",
  "Apparel & Lifestyle",
  "Photography",
  "Video & Reels",
  "Tech & Gaming",
  "Fitness & Wellness",
  "Food & Culinary",
  "Art & Design",
  "Other",
];

// =========================================================
// REUSABLE PORTFOLIO FORM MODAL COMPONENT
// =========================================================
export default function PortfolioFormModal({
  isOpen,
  onClose,
  portfolio = null,
  defaultCategory = "Fashion & Luxury",
  onSuccess,
}) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Cover Image Upload State
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const editingPortfolioId = portfolio?._id || portfolio?.id || null;

  // Sync state whenever modal is opened or the portfolio target changes
  useEffect(() => {
    if (isOpen) {
      if (portfolio) {
        setFormData({
          title: portfolio.title || "",
          description: portfolio.description || "",
          category: portfolio.category || defaultCategory || "Fashion & Luxury",
          coverImage: portfolio.coverImage || "",
          isPublic: typeof portfolio.isPublic === "boolean" ? portfolio.isPublic : true,
          contents: Array.isArray(portfolio.contents)
            ? portfolio.contents.map((c) => ({
                platform: c.platform || "instagram",
                contentType: c.contentType || "post",
                url: c.url || "",
                previewImage: c.previewImage || "",
                title: c.title || "",
              }))
            : [],
        });
      } else {
        setFormData({
          ...initialFormState,
          category: defaultCategory || "Fashion & Luxury",
        });
      }
      setFormError(null);
      setUploadError(null);
      setIsUploadingCover(false);
      setIsDraggingCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, portfolio, defaultCategory]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!submitting && !isUploadingCover) {
      setFormError(null);
      setUploadError(null);
      setIsUploadingCover(false);
      setIsDraggingCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
    setIsUploadingCover(true);

    try {
      const uploadRes = await uploadSingleImageApi(file, "creatorlink/portfolios");
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Content entries helper functions
  const addContentEntry = () => {
    setFormData((prev) => ({
      ...prev,
      contents: [
        ...prev.contents,
        {
          platform: "instagram",
          contentType: "post",
          url: "",
          previewImage: "",
          title: "",
        },
      ],
    }));
  };

  const updateContentEntry = (index, field, value) => {
    setFormData((prev) => {
      const updatedContents = [...prev.contents];
      updatedContents[index] = {
        ...updatedContents[index],
        [field]: value,
      };
      return { ...prev, contents: updatedContents };
    });
  };

  const removeContentEntry = (index) => {
    setFormData((prev) => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler for Creating / Updating Portfolio
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.title || !formData.title.trim()) {
      setFormError("Portfolio title is required.");
      return;
    }
    if (formData.title.trim().length > 150) {
      setFormError("Title must be 150 characters or less.");
      return;
    }
    if (formData.description && formData.description.length > 2000) {
      setFormError("Description must be 2000 characters or less.");
      return;
    }
    if (formData.category && formData.category.length > 100) {
      setFormError("Category must be 100 characters or less.");
      return;
    }

    // Validate contents entries if added
    for (let i = 0; i < formData.contents.length; i++) {
      const item = formData.contents[i];
      if (!item.url || !item.url.trim()) {
        setFormError(`Content entry #${i + 1} requires a valid URL.`);
        return;
      }
      if (item.title && item.title.trim().length > 150) {
        setFormError(`Content entry #${i + 1} title must be 150 characters or less.`);
        return;
      }
    }

    // Construct Backend Payload matching exact validation schema
    const payload = {
      title: formData.title.trim(),
      description: formData.description ? formData.description.trim() : "",
      category: formData.category ? formData.category.trim() : "",
      coverImage: formData.coverImage ? formData.coverImage.trim() : "",
      isPublic: Boolean(formData.isPublic),
      contents: formData.contents.map((c) => ({
        platform: c.platform,
        contentType: c.contentType,
        url: c.url.trim(),
        ...(c.previewImage?.trim() ? { previewImage: c.previewImage.trim() } : {}),
        ...(c.title?.trim() ? { title: c.title.trim() } : {}),
      })),
    };

    setSubmitting(true);
    let resultAction;

    try {
      if (editingPortfolioId) {
        resultAction = await dispatch(
          updatePortfolioItem({
            portfolioId: editingPortfolioId,
            portfolioData: payload,
          })
        );
      } else {
        resultAction = await dispatch(createPortfolioItem(payload));
      }

      setSubmitting(false);

      const isSuccess = editingPortfolioId
        ? updatePortfolioItem.fulfilled.match(resultAction)
        : createPortfolioItem.fulfilled.match(resultAction);

      if (isSuccess) {
        await onSuccess?.(resultAction.payload);
        onClose();
      } else {
        setFormError(
          resultAction?.payload ||
            (editingPortfolioId
              ? "Failed to update portfolio project."
              : "Failed to create portfolio project.")
        );
      }
    } catch (err) {
      setSubmitting(false);
      setFormError(
        err?.response?.data?.message || err?.message || "Failed to save portfolio project."
      );
    }
  };

  // Compile categories to display in select
  const categoryOptions = Array.from(
    new Set([formData.category, defaultCategory, ...DEFAULT_PORTFOLIO_CATEGORIES].filter(Boolean))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={handleClose} />
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-border-theme flex items-center justify-between">
          <div>
            <h2 className="font-serif font-medium text-xl text-foreground">
              {editingPortfolioId ? "Edit Portfolio Project" : "Add Portfolio Project"}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {editingPortfolioId
                ? "Update your existing project details and contents."
                : "Showcase a new project, brand collaboration, or media item."}
            </p>
          </div>
          <button
            type="button"
            disabled={submitting || isUploadingCover}
            onClick={handleClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1 custom-scrollbar">
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl font-medium">
                <span>{formError}</span>
              </div>
            )}

            {/* Cover Image Section */}
            <div className="space-y-2.5">
              <div>
                <label className="block font-semibold text-foreground text-xs sm:text-sm">
                  Cover Image <span className="text-[#FF4F87]">*</span>
                </label>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Upload a high-quality image for your project (JPG, PNG, WebP, max 5MB)
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
                  {/* Left: Responsive Image Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-border-theme bg-surface-muted h-44 sm:h-48 md:h-52 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={formData.coverImage}
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
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
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
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
                          ? "border-[#FF4F87] bg-pink-50/60 dark:bg-pink-950/30 scale-[0.99]"
                          : "border-pink-200 dark:border-pink-900/50 hover:border-[#FF4F87]/60 bg-pink-50/20 hover:bg-pink-50/40 dark:bg-pink-950/10 dark:hover:bg-pink-950/20"
                      } ${isUploadingCover ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center text-[#FF4F87] mb-2">
                        <ArrowUpTrayIcon className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-xs text-foreground">Click to upload</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">or drag and drop</p>
                      <p className="text-[10px] text-text-secondary/80 mt-1">
                        JPG, PNG, WebP (Max 5MB)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
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
                        className="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/50 border border-pink-200/80 dark:border-pink-900/60 text-[#FF4F87] dark:text-pink-400 font-semibold text-xs flex items-center justify-center gap-1.5 flex-1 transition-colors cursor-pointer disabled:opacity-50"
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
                  className={`border-2 border-dashed rounded-2xl p-7 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDraggingCover
                      ? "border-[#FF4F87] bg-pink-50/60 dark:bg-pink-950/30 scale-[0.99]"
                      : "border-pink-200 dark:border-pink-900/50 hover:border-[#FF4F87]/60 bg-pink-50/20 hover:bg-pink-50/40 dark:bg-pink-950/10 dark:hover:bg-pink-950/20"
                  } ${isUploadingCover ? "pointer-events-none opacity-60" : ""}`}
                >
                  {isUploadingCover ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-foreground">
                      <ArrowPathIcon className="w-7 h-7 text-[#FF4F87] animate-spin mb-1" />
                      <span className="text-xs font-semibold">Uploading cover image...</span>
                      <span className="text-[11px] text-text-secondary">Please wait</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-2xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center text-[#FF4F87] mb-2.5">
                        <ArrowUpTrayIcon className="w-6 h-6" />
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
                <label className="block font-semibold text-foreground mb-1.5 text-xs">
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
                    }}
                    placeholder="https://images.unsplash.com/photo-1539109126782-8b01035bbbb0"
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

            {/* Project Title & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  maxLength={150}
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Instagram Fashion Content..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted/60 border border-border-theme text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:border-secondary transition-colors text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5 text-xs">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted/60 border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors text-xs"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-foreground mb-1.5 text-xs">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                maxLength={2000}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Created fashion-focused social media content for showcasing products and creative styling.."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted/60 border border-border-theme text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:border-secondary transition-colors resize-none text-xs"
              />
            </div>

            {/* Public Visibility Toggle */}
            <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30 flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground block">Public Visibility</span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  {formData.isPublic
                    ? "This project will be discoverable on your public portfolio."
                    : "Only you can view this project."}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.isPublic ? "bg-secondary" : "bg-surface-muted border-border-theme"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formData.isPublic ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Contents Entries Section */}
            <div className="space-y-3 pt-2 border-t border-border-theme">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">
                    Portfolio Contents (Optional)
                  </span>
                  <span className="text-[11px] text-text-secondary block mt-0.5">
                    Link social media posts, reels, stories, or external articles.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addContentEntry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-semibold transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Add Entry</span>
                </button>
              </div>

              {formData.contents.map((entry, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/40 space-y-3 relative"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border-theme/60">
                    <span className="font-semibold text-foreground text-[11px]">
                      Content Entry #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeContentEntry(index)}
                      className="text-text-secondary hover:text-red-500 transition-colors p-1 cursor-pointer"
                      title="Remove Entry"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                        Platform <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={entry.platform}
                        onChange={(e) => updateContentEntry(index, "platform", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="website">Website</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                        Content Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={entry.contentType}
                        onChange={(e) => updateContentEntry(index, "contentType", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                      >
                        <option value="post">Post</option>
                        <option value="reel">Reel</option>
                        <option value="story">Story</option>
                        <option value="video">Video</option>
                        <option value="short">Short</option>
                        <option value="article">Article</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={entry.url}
                      onChange={(e) => updateContentEntry(index, "url", e.target.value)}
                      placeholder="https://..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                        Title (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength={150}
                        value={entry.title}
                        onChange={(e) => updateContentEntry(index, "title", e.target.value)}
                        placeholder="e.g. Campaign Reel Part 1"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                        Preview Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={entry.previewImage}
                        onChange={(e) => updateContentEntry(index, "previewImage", e.target.value)}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-border-theme bg-surface-muted/20 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting || isUploadingCover}
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-muted border border-border-theme text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isUploadingCover}
              className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-semibold text-xs tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting
                ? editingPortfolioId
                  ? "Updating..."
                  : "Creating..."
                : editingPortfolioId
                ? "Update Portfolio"
                : "Create Portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

