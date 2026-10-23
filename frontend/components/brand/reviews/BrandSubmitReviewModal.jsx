"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitBrandReviewThunk } from "@/redux/brand/reviews/reviews_slice";

// =========================================================
// SVG ICONS
// =========================================================
function StarIcon({ className = "w-4 h-4", filled = true }) {
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

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const formatPrice = (amount, currency = "INR") => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) return "N/A";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(numericAmount)}`;
};

const EMPTY_WORKSPACES = [];

// =========================================================
// REUSABLE SUBMIT REVIEW MODAL
// =========================================================
export default function BrandSubmitReviewModal({
  isOpen,
  onClose,
  workspaceId = null,
  workspaces = EMPTY_WORKSPACES,
  workspacesLoading = false,
  creatorName = "",
  campaignTitle = "",
  onSuccess = null,
}) {
  const dispatch = useDispatch();
  const { submitting } = useSelector((state) => state.brandReviews || {});

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [formValidationError, setFormValidationError] = useState("");

  const prevIsOpenRef = useRef(false);

  // Reset form inputs only when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      queueMicrotask(() => {
        setFormValidationError("");
        setSelectedRating(5);
        setHoverRating(0);
        setCommentText("");

        if (workspaceId) {
          setSelectedWorkspaceId(workspaceId.toString());
        } else if (workspaces && workspaces.length > 0) {
          setSelectedWorkspaceId(workspaces[0]._id.toString());
        } else {
          setSelectedWorkspaceId("");
        }
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, workspaceId, workspaces]);

  // Sync selectedWorkspaceId if workspaces load while modal is open without preset workspaceId
  useEffect(() => {
    if (isOpen && !workspaceId && !selectedWorkspaceId && workspaces && workspaces.length > 0) {
      queueMicrotask(() => {
        setSelectedWorkspaceId(workspaces[0]._id.toString());
      });
    }
  }, [isOpen, workspaceId, selectedWorkspaceId, workspaces]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    setFormValidationError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormValidationError("");

    const targetWsId = workspaceId ? workspaceId.toString() : selectedWorkspaceId;
    if (!targetWsId) {
      setFormValidationError("Please select a completed workspace collaboration.");
      return;
    }

    const ratingNum = Number(selectedRating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      setFormValidationError("Please select a rating between 1 and 5 stars.");
      return;
    }

    if (commentText.trim().length > 1000) {
      setFormValidationError("Comment cannot exceed 1000 characters.");
      return;
    }

    const payload = {
      workspaceId: targetWsId,
      rating: ratingNum,
      comment: commentText.trim(),
    };

    const resultAction = await dispatch(submitBrandReviewThunk(payload));

    if (submitBrandReviewThunk.fulfilled.match(resultAction)) {
      setCommentText("");
      setSelectedRating(5);
      if (typeof onSuccess === "function") {
        onSuccess(resultAction);
      }
      onClose();
    } else if (submitBrandReviewThunk.rejected.match(resultAction)) {
      const errorMsg =
        resultAction.payload ||
        resultAction.error?.message ||
        "Failed to submit review. Please try again.";
      setFormValidationError(errorMsg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-review-modal-title"
    >
      <div className="bg-surface border border-border-theme rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border-theme pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-wider">
              Feedback
            </span>
            <h2
              id="submit-review-modal-title"
              className="font-serif font-bold text-lg sm:text-xl text-foreground mt-1"
            >
              Submit Creator Review
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Evaluate the creator&apos;s deliverable quality and collaboration reliability.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="p-1 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Validation / Error Banner */}
        {formValidationError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs font-medium">
            {formValidationError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workspace Selection or Static Summary */}
          {workspaceId ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Collaboration Target
              </label>
              <div className="p-3 rounded-xl bg-surface-muted/50 border border-border-theme space-y-0.5">
                <p className="text-xs font-semibold text-foreground">
                  {campaignTitle || "Campaign Workspace"}
                </p>
                <p className="text-[11px] text-text-secondary">
                  Creator:{" "}
                  <span className="text-foreground font-medium">
                    {creatorName || "Creator Partner"}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label
                htmlFor="workspace-select"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Completed Workspace *</span>
                <span className="text-[10px] text-text-secondary font-normal">
                  {workspaces.length} eligible
                </span>
              </label>

              {workspacesLoading ? (
                <div className="h-10 bg-surface-muted rounded-xl animate-pulse" />
              ) : workspaces.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3.5 rounded-xl text-xs space-y-1">
                  <p className="font-semibold">No unreviewed completed workspaces available.</p>
                  <p className="text-[11px] leading-relaxed">
                    Reviews can only be submitted once all deliverables in a workspace have been approved and marked complete.
                  </p>
                </div>
              ) : (
                <select
                  id="workspace-select"
                  value={selectedWorkspaceId}
                  onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border-theme text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer disabled:opacity-50"
                >
                  {workspaces.map((ws) => {
                    const cName = ws.creator?.name || "Creator Partner";
                    const cTitle = ws.campaign?.title || "Campaign Workspace";
                    const price = formatPrice(ws.agreedPrice, ws.currency);
                    return (
                      <option key={ws._id} value={ws._id}>
                        {cTitle} — {cName} ({price})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          )}

          {/* Star Rating Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled =
                    hoverRating > 0 ? star <= hoverRating : star <= selectedRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={submitting}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <StarIcon
                        className="w-6 h-6 text-amber-400 transition-colors"
                        filled={isFilled}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-foreground ml-2">
                {selectedRating === 5
                  ? "5 — Exceptional"
                  : selectedRating === 4
                  ? "4 — Very Good"
                  : selectedRating === 3
                  ? "3 — Satisfactory"
                  : selectedRating === 2
                  ? "2 — Needs Improvement"
                  : "1 — Poor"}
              </span>
            </div>
          </div>

          {/* Comment / Qualitative Feedback */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="comment-text" className="text-xs font-semibold text-foreground">
                Written Feedback (Optional)
              </label>
              <span className="text-[10px] text-text-secondary">
                {commentText.length} / 1000 characters
              </span>
            </div>
            <textarea
              id="comment-text"
              rows={4}
              maxLength={1000}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
              placeholder="Share details about the creator's communication, content delivery quality, turnaround time, and professionalism..."
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border-theme text-foreground text-xs placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none disabled:opacity-50"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-theme">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-text-secondary text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                (!workspaceId && workspaces.length === 0)
              }
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#252525] hover:bg-[#111111] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <RefreshIcon className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
