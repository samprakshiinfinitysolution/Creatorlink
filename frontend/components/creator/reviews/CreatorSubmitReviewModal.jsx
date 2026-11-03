"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitCreatorReview } from "@/redux/creator/reviews/reviews_slice";

// =========================================================
// SVG ICONS
// =========================================================
function StarIcon({ className = "w-5 h-5", filled = true }) {
  return (
    <svg
      className={className}
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function CreatorSubmitReviewModal({
  isOpen,
  onClose,
  workspaceId,
  brandName = "Brand Partner",
  campaignTitle = "Campaign",
  onSuccess
}) {
  const dispatch = useDispatch();
  const { submittingReview } = useSelector((state) => state.creatorReviews || {});

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setRating(5);
      setHoverRating(0);
      setComment("");
      setErrorMessage("");
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage("Please select a rating between 1 and 5 stars.");
      return;
    }

    if (!workspaceId) {
      setErrorMessage("Workspace reference is missing.");
      return;
    }

    const payload = {
      workspaceId,
      rating: Number(rating),
      comment: comment.trim()
    };

    const res = await dispatch(submitCreatorReview(payload));

    if (res.meta.requestStatus === "fulfilled") {
      if (onSuccess) onSuccess(res.payload?.data || res.payload);
      onClose();
    } else {
      setErrorMessage(res.payload || "Failed to submit review. Please try again.");
    }
  };

  const currentDisplayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#131318] border border-border-theme dark:border-[#22222e] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-foreground">
              Review Brand Partner
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Share your collaboration experience with {brandName}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          {/* Campaign Context Card */}
          <div className="p-3.5 rounded-xl bg-surface-muted border border-border-theme text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
              Completed Collaboration
            </span>
            <p className="font-semibold text-slate-900 dark:text-foreground">
              {campaignTitle}
            </p>
            <p className="text-text-secondary">
              Brand: <strong className="text-foreground">{brandName}</strong>
            </p>
          </div>

          {/* Star Rating */}
          <div className="space-y-2 text-center sm:text-left">
            <label className="text-xs font-semibold text-slate-900 dark:text-foreground block">
              Overall Experience <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= currentDisplayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 rounded-lg text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <StarIcon
                      filled={isFilled}
                      className={`w-7 h-7 ${isFilled ? "text-amber-400" : "text-gray-300 dark:text-zinc-600"}`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-slate-900 dark:text-foreground ml-2">
                {currentDisplayRating} of 5 Stars
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900 dark:text-foreground">
                Your Feedback & Comments
              </label>
              <span className="text-[11px] text-text-secondary">
                {comment.length}/1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the brand's communication, briefing clarity, and promptness? (e.g. 'Clear instructions and timely milestone signoffs!')"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-theme text-xs font-medium text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-theme">
            <button
              type="button"
              onClick={onClose}
              disabled={submittingReview}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview || !rating}
              className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingReview ? "Submitting Review..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

