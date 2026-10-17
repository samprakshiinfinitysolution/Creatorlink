"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reviewBrandDeliverableWork, clearSuccessMessage } from "@/redux/brand/workspace/workspace_slice";

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

function CheckCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExclamationTriangleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

// =========================================================
// MAIN COMPONENT: BRAND REVIEW MODAL
// =========================================================
export default function BrandReviewModal({
  isOpen,
  onClose,
  workspaceId,
  targetDeliverable = null,
  initialMode = "approve", // 'approve' | 'revision'
}) {
  const dispatch = useDispatch();
  const { submitting, error, successMessage } = useSelector(
    (state) => state.brandWorkspace
  );

  const [mode, setMode] = useState(initialMode); // 'approve' | 'revision'
  const [feedback, setFeedback] = useState("");
  const [localError, setLocalError] = useState("");

  // Sync mode when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setMode(initialMode || "approve");
        setFeedback("");
        setLocalError("");
      });
    }
  }, [isOpen, initialMode]);

  const handleClose = () => {
    if (submitting) return;
    setFeedback("");
    setLocalError("");
    dispatch(clearSuccessMessage());
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workspaceId || submitting) return;

    setLocalError("");

    const deliverableId = targetDeliverable?._id;
    if (!deliverableId) {
      setLocalError("Deliverable target is missing or invalid.");
      return;
    }

    let reviewData = {};

    if (mode === "revision") {
      const trimmedFeedback = feedback.trim();
      if (!trimmedFeedback) {
        setLocalError("Feedback is required when requesting a revision.");
        return;
      }
      reviewData = {
        status: "revision_requested",
        feedback: trimmedFeedback,
      };
    } else {
      reviewData = {
        status: "approve",
      };
    }

    const result = await dispatch(
      reviewBrandDeliverableWork({
        workspaceId,
        deliverableId,
        reviewData,
      })
    );

    if (reviewBrandDeliverableWork.fulfilled.match(result)) {
      setFeedback("");
      setLocalError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-theme flex items-center justify-between bg-surface">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20 uppercase tracking-wide">
              {targetDeliverable?.title ? `Deliverable: ${targetDeliverable.title}` : "Workspace Review"}
            </span>
            <h2 className="font-serif font-semibold text-xl text-foreground mt-1">
              {mode === "approve" ? "Approve Deliverable Work" : "Request Revision"}
            </h2>
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

        {/* Mode Selector Tabs */}
        <div className="p-4 border-b border-border-theme bg-surface-muted/40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("approve");
              setLocalError("");
            }}
            disabled={submitting}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === "approve"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-surface text-text-secondary hover:text-foreground border border-border-theme"
            }`}
          >
            Approve Deliverable
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("revision");
              setLocalError("");
            }}
            disabled={submitting}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === "revision"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-surface text-text-secondary hover:text-foreground border border-border-theme"
            }`}
          >
            Request Revision
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <div className="space-y-4">
            {/* Global or Local Error Display */}
            {(localError || error) && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                <span>{localError || (typeof error === "string" ? error : "An error occurred during review.")}</span>
              </div>
            )}

            {/* Success Message Banner */}
            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {mode === "approve" ? (
              /* Approve Confirmation Content */
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Ready to approve this deliverable?</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Approving this deliverable will mark <strong className="text-foreground">{targetDeliverable?.title || "this work"}</strong> as Approved. Once all deliverables are approved, the collaboration will automatically complete.
                </p>
              </div>
            ) : (
              /* Request Revision Content */
              <div className="space-y-3">
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>Provide Specific Revision Feedback</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Explain clearly what changes, updates, or adjustments the creator needs to make for <strong className="text-foreground">{targetDeliverable?.title || "this deliverable"}</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="revision-feedback" className="block text-xs font-semibold text-foreground">
                    Feedback Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="revision-feedback"
                    value={feedback}
                    onChange={(e) => {
                      setFeedback(e.target.value);
                      if (localError) setLocalError("");
                    }}
                    rows={4}
                    placeholder="e.g. Please update the audio track to match the requested campaign soundtrack and trim the intro by 2 seconds."
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-theme bg-surface text-foreground placeholder:text-text-muted text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-border-theme flex items-center justify-end gap-3">
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
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </span>
              ) : mode === "approve" ? (
                <span>Approve Deliverable</span>
              ) : (
                <span>Send Revision Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

