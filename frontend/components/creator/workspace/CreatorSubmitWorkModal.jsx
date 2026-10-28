"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitCreatorDeliverableWork,
  clearSuccessMessage,
} from "@/redux/creator/workspace/workspace_slice";
import {
  uploadSingleImageApi,
  uploadSingleVideoApi,
} from "@/lib/upload";

// =========================================================
// SVG ICONS
// =========================================================
function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function UploadIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
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

function VideoIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
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

function CheckCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// Allowed MIME types and size thresholds
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/mov",
  "video/x-m4v",
];

const isValidHttpUrl = (str) => {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const detectMediaType = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const cleanUrl = trimmed.split("?")[0].split("#")[0].toLowerCase();
  if (
    cleanUrl.includes("/video/upload/") ||
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v")
  ) {
    return "video";
  }
  if (
    cleanUrl.includes("/image/upload/") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".gif") ||
    cleanUrl.endsWith(".avif")
  ) {
    return "image";
  }
  return null;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const DELIVERABLES_FOLDER = "creatorlink/deliverables";

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CreatorSubmitWorkModal({
  isOpen,
  onClose,
  workspaceId,
  isResubmission = false,
  targetDeliverable = null,
}) {
  const dispatch = useDispatch();
  const { submitting, error } = useSelector(
    (state) => state.creatorWorkspace
  );

  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState(null);

  // File upload and preview state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "image" | "video" | null
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState(null);

  const prevIsOpenRef = useRef(false);

  // Clean up object URLs on modal close or unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const initialTitle = targetDeliverable?.title || "";
      queueMicrotask(() => {
        setTitle(initialTitle);
      });
    } else if (!isOpen && prevIsOpenRef.current) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      queueMicrotask(() => {
        setTitle("");
        setLink("");
        setFileUrl("");
        setNotes("");
        setValidationError(null);
        setUploadError(null);
        setIsUploading(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setMediaType(null);
        setUploadedMediaUrl(null);
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, targetDeliverable, previewUrl]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting || isUploading) return;
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setTitle("");
    setLink("");
    setFileUrl("");
    setNotes("");
    setValidationError(null);
    setUploadError(null);
    setIsUploading(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    setUploadedMediaUrl(null);
    onClose();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setValidationError(null);

    const fileType = file.type?.toLowerCase();
    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);

    if (!isImage && !isVideo) {
      setUploadError("Only JPEG, PNG, WebP photos and MP4, WebM, MOV videos are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      setUploadError("Photo size must not exceed 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      setUploadError("Video size must not exceed 50 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Preserve previous media states in case the replacement upload fails
    const previousPreviewUrl = previewUrl;
    const previousMediaType = mediaType;
    const previousSelectedFile = selectedFile;
    const previousUploadedMediaUrl = uploadedMediaUrl;
    const previousFileUrl = fileUrl;

    // Create temporary local preview (previous blob is kept until upload succeeds)
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setMediaType(isImage ? "image" : "video");
    setSelectedFile(file);
    setIsUploading(true);

    try {
      let uploadRes;
      if (isImage) {
        uploadRes = await uploadSingleImageApi(file, DELIVERABLES_FOLDER);
      } else {
        uploadRes = await uploadSingleVideoApi(file, DELIVERABLES_FOLDER);
      }

      const uploadedUrl =
        uploadRes?.data?.url ||
        uploadRes?.url ||
        uploadRes?.secure_url ||
        uploadRes?.data?.secure_url;

      if (!uploadedUrl) {
        throw new Error("Uploaded media URL was not returned by server.");
      }

      // Clean up previous blob if any, and the local preview blob
      if (previousPreviewUrl && previousPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previousPreviewUrl);
      }
      if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }

      setPreviewUrl(uploadedUrl);
      setUploadedMediaUrl(uploadedUrl);
      setFileUrl(uploadedUrl);
      setUploadError(null);
    } catch (err) {
      if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }

      // Check if previous fileUrl was linked to the previous uploaded media
      const wasLinkedToUpload = Boolean(
        previousUploadedMediaUrl && previousFileUrl === previousUploadedMediaUrl
      );

      if (wasLinkedToUpload) {
        setPreviewUrl(previousPreviewUrl);
        setMediaType(previousMediaType);
        setSelectedFile(previousSelectedFile);
        setUploadedMediaUrl(previousUploadedMediaUrl);
        setFileUrl(previousFileUrl);
      } else {
        // If fileUrl was changed to a different external URL or not linked to the upload,
        // preserve the valid external fileUrl without restoring a preview that no longer matches the active asset.
        const activeMediaType =
          isValidHttpUrl(previousFileUrl) ? detectMediaType(previousFileUrl) : null;
        setPreviewUrl(activeMediaType ? previousFileUrl.trim() : null);
        setMediaType(activeMediaType);
        setSelectedFile(null);
        setUploadedMediaUrl(null);
        setFileUrl(previousFileUrl);
      }

      setUploadError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload media. Please try again."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveMedia = () => {
    if (isUploading) return;
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    // Only clear fileUrl if it corresponds to the currently uploaded media or active direct media preview
    if (
      (uploadedMediaUrl && fileUrl === uploadedMediaUrl) ||
      (previewUrl && fileUrl === previewUrl)
    ) {
      setFileUrl("");
    }
    setPreviewUrl(null);
    setMediaType(null);
    setSelectedFile(null);
    setUploadedMediaUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTriggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) {
      setValidationError("Please wait for your media file to finish uploading before submitting.");
      return;
    }
    setValidationError(null);

    const trimmedTitle = title.trim();
    const trimmedLink = link.trim();
    const trimmedFileUrl = fileUrl.trim();
    const trimmedNotes = notes.trim();

    // Ensure a submission cannot be accepted with notes or title alone if an actual content link or asset is required
    if (!trimmedLink && !trimmedFileUrl) {
      setValidationError("Please provide deliverable content by uploading media, entering an asset URL, or providing a live content link.");
      return;
    }

    // Explicitly validate content link as a valid HTTP or HTTPS URL
    if (trimmedLink && !isValidHttpUrl(trimmedLink)) {
      setValidationError("Please enter a valid HTTP or HTTPS content link (e.g. https://instagram.com/p/...).");
      return;
    }

    // Explicitly validate asset/file URL as a valid HTTP or HTTPS URL
    if (trimmedFileUrl && !isValidHttpUrl(trimmedFileUrl)) {
      setValidationError("Please enter a valid HTTP or HTTPS file URL (e.g. https://...).");
      return;
    }

    const deliverableId = targetDeliverable?._id;

    const action = await dispatch(
      submitCreatorDeliverableWork({
        workspaceId,
        deliverableId,
        submissionData: {
          title: trimmedTitle,
          link: trimmedLink,
          fileUrl: trimmedFileUrl,
          notes: trimmedNotes,
        },
      })
    );

    if (submitCreatorDeliverableWork.fulfilled.match(action)) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setTitle("");
      setLink("");
      setFileUrl("");
      setNotes("");
      setValidationError(null);
      setUploadError(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMediaType(null);
      setUploadedMediaUrl(null);
      dispatch(clearSuccessMessage());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border-theme flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-2xs">
              <UploadIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif font-semibold text-lg text-foreground tracking-tight">
                {isResubmission ? "Resubmit Deliverable Work" : "Submit Deliverable Work"}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {targetDeliverable?.title
                  ? `Deliverable: ${targetDeliverable.title}`
                  : "Provide your completed content links or file references for brand review."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting || isUploading}
            className="p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Global Submission Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs font-medium">
              {typeof error === "string" ? error : "Submission failed. Please try again."}
            </div>
          )}

          {/* Local Validation Error */}
          {validationError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs font-medium">
              {validationError}
            </div>
          )}

          {/* Submission Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Submission Title / Deliverable Name
            </label>
            <input
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setValidationError(null);
              }}
              placeholder="e.g. Final Reel Link & Post Assets - Version 1"
              disabled={submitting || isUploading}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Content Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Live Content / Post Link (URL)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                setValidationError(null);
              }}
              placeholder="https://instagram.com/p/... or https://youtube.com/watch?v=..."
              disabled={submitting || isUploading}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Deliverable Media Upload (Photo or Video) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground block">
                Deliverable Media (Photo or Video)
              </label>
              <span className="text-[10px] text-text-secondary">
                Photo ≤ 5 MB • Video ≤ 50 MB
              </span>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
              disabled={submitting || isUploading}
            />

            {/* Upload Area or Preview Card */}
            {previewUrl ? (
              <div className="rounded-xl border border-border-theme bg-surface-muted/40 p-3 space-y-2.5">
                {/* Media Preview Player/Viewer */}
                <div className="relative rounded-lg overflow-hidden bg-black/80 flex items-center justify-center max-h-52">
                  {mediaType === "video" ? (
                    <video
                      src={previewUrl}
                      controls
                      playsInline
                      className="w-full max-h-52 object-contain"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewUrl}
                      alt="Deliverable asset preview"
                      className="w-full max-h-52 object-contain"
                    />
                  )}
                </div>

                {/* Status Bar & Actions */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {isUploading ? (
                      <div className="inline-flex items-center gap-1.5 text-amber-500 text-[11px] font-medium">
                        <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="truncate">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium truncate">
                        <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {selectedFile?.name || "Deliverable Media Ready"}
                        </span>
                        {selectedFile?.size && (
                          <span className="text-[10px] text-text-secondary shrink-0">
                            ({formatFileSize(selectedFile.size)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleTriggerFileInput}
                      disabled={isUploading || submitting}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-border-theme bg-surface hover:bg-surface-muted text-foreground font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      disabled={isUploading || submitting}
                      className="text-[11px] p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove media"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={handleTriggerFileInput}
                className="group border border-dashed border-border-theme hover:border-secondary/60 bg-surface-muted/30 hover:bg-surface-muted/70 rounded-xl p-4 text-center cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-center gap-2 text-text-secondary group-hover:text-secondary transition-colors">
                  <PhotoIcon className="w-5 h-5" />
                  <VideoIcon className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-foreground group-hover:text-secondary transition-colors">
                  Click to choose Deliverable Photo or Video
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  JPEG, PNG, WebP (up to 5 MB) or MP4, WebM, MOV (up to 50 MB)
                </p>
              </div>
            )}

            {/* Media Upload Error */}
            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-2.5 rounded-xl text-xs font-medium">
                {uploadError}
              </div>
            )}
          </div>

          {/* Asset File URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground block">
                Cloud Storage / Asset File URL (Optional)
              </label>
              {uploadedMediaUrl && fileUrl === uploadedMediaUrl && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Linked to uploaded file
                </span>
              )}
            </div>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => {
                const newUrl = e.target.value;
                setFileUrl(newUrl);
                setValidationError(null);
                // When manually changing the URL away from the uploaded media,
                // keep the preview consistent with the active asset
                if (uploadedMediaUrl && newUrl.trim() !== uploadedMediaUrl) {
                  if (previewUrl && previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  const activeType = isValidHttpUrl(newUrl) ? detectMediaType(newUrl) : null;
                  setPreviewUrl(activeType ? newUrl.trim() : null);
                  setMediaType(activeType);
                  setSelectedFile(null);
                  setUploadedMediaUrl(null);
                } else if (!uploadedMediaUrl) {
                  const activeType = isValidHttpUrl(newUrl) ? detectMediaType(newUrl) : null;
                  setPreviewUrl(activeType ? newUrl.trim() : null);
                  setMediaType(activeType);
                }
              }}
              placeholder="https://drive.google.com/file/d/... or Dropbox link"
              disabled={submitting || isUploading}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors disabled:opacity-60"
            />
            <p className="text-[10px] text-text-secondary">
              Directly uploads populate this URL, or you can paste an external Google Drive / Dropbox link.
            </p>
          </div>

          {/* Notes / Comments */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground block">
                Submission Notes / Comments
              </label>
              <span className="text-[10px] text-text-secondary">
                {notes.length}/2000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={2000}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setValidationError(null);
              }}
              placeholder="Add details about your submission, posting schedule, or response to brand feedback..."
              disabled={submitting || isUploading}
              className="w-full text-xs p-3.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors resize-none disabled:opacity-60"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-theme flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting || isUploading}
              className="px-4 py-2.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isUploading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                  <span>Uploading media...</span>
                </>
              ) : (
                <span>{isResubmission ? "Submit Revision" : "Submit Work"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


