"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitCreatorDeliverableWork,
  clearSuccessMessage,
} from "@/redux/creator/workspace/workspace_slice";

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

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (isOpen && targetDeliverable) {
      setTitle(targetDeliverable.title || "");
    } else if (!isOpen) {
      setTitle("");
      setLink("");
      setFileUrl("");
      setNotes("");
      setValidationError(null);
    }
  }, [isOpen, targetDeliverable]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    setTitle("");
    setLink("");
    setFileUrl("");
    setNotes("");
    setValidationError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedTitle = title.trim();
    const trimmedLink = link.trim();
    const trimmedFileUrl = fileUrl.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedTitle && !trimmedLink && !trimmedFileUrl && !trimmedNotes) {
      setValidationError("Please fill in at least one field (Title, Link, File URL, or Notes) to submit your work.");
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
      setTitle("");
      setLink("");
      setFileUrl("");
      setNotes("");
      setValidationError(null);
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
            <span className="p-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/20">
              <UploadIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif font-semibold text-lg text-foreground">
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
            disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Asset File URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Cloud Storage / Asset File URL (Optional)
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => {
                setFileUrl(e.target.value);
                setValidationError(null);
              }}
              placeholder="https://drive.google.com/file/d/... or Dropbox link"
              disabled={submitting}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors disabled:opacity-60"
            />
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
              disabled={submitting}
              className="w-full text-xs p-3.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors resize-none disabled:opacity-60"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-theme flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
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

