"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandWorkspaceById,
  clearSuccessMessage,
} from "@/redux/brand/workspace/workspace_slice";
import {
  createPaymentOrder,
  verifyPayment,
  reportFailedPayment,
  fetchBrandPayments,
  clearPaymentError,
  clearPaymentSuccessMessage,
} from "@/redux/brand/payments/payments_slice";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandReviewModal from "./BrandReviewModal";
import {
  fetchBrandWorkspaceReview,
  clearWorkspaceReview,
} from "@/redux/brand/reviews/reviews_slice";
import BrandSubmitReviewModal from "@/components/brand/reviews/BrandSubmitReviewModal";

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

function CreditCardIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function DocumentIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ExclamationIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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

function ChatBubbleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008H8.625V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zM21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function UploadIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function LayersIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  );
}

function PlayIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
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

function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function FolderIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function HistoryIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// =========================================================
// HELPER UTILITIES & STATUS BADGES
// =========================================================
const formatPrice = (amount, currency = "INR") => {
  if (typeof amount !== "number" || isNaN(amount)) return "N/A";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(amount)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const isValidExternalUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const detectMediaType = (url) => {
  if (!url || typeof url !== "string") return "unknown";
  const trimmed = url.trim();
  if (!trimmed) return "unknown";
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
  return "file";
};

// Action Links with strict HTTP/HTTPS URL validation
function SubmissionActionLinks({ link, fileUrl, className = "" }) {
  const cleanLink = isValidExternalUrl(link) ? link.trim() : null;
  const cleanFileUrl = isValidExternalUrl(fileUrl) ? fileUrl.trim() : null;

  if (!cleanLink && !cleanFileUrl) return null;

  const mediaType = cleanFileUrl ? detectMediaType(cleanFileUrl) : null;
  const secondaryLabel =
    mediaType === "video" ? "Video" : mediaType === "image" ? "Image" : "File";

  return (
    <div className={`flex flex-col gap-2 pt-2 ${className}`}>
      {cleanFileUrl && (
        <a
          href={cleanFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E11D48] dark:text-[#FB7185] hover:opacity-85 transition-opacity group"
          title={`Open ${secondaryLabel.toLowerCase()} asset in a new tab`}
        >
          <ExternalLinkIcon className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span>View Asset</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F1F3F5] dark:bg-zinc-800 text-[#495057] dark:text-zinc-300 border border-gray-200/50 dark:border-zinc-700/60 ml-0.5">
            {secondaryLabel}
          </span>
        </a>
      )}
      {cleanLink && (
        <a
          href={cleanLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E11D48] dark:text-[#FB7185] hover:opacity-85 transition-opacity group"
          title="Open live content in a new tab"
        >
          <ExternalLinkIcon className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span>View Content</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F1F3F5] dark:bg-zinc-800 text-[#495057] dark:text-zinc-300 border border-gray-200/50 dark:border-zinc-700/60 ml-0.5">
            Open Link
          </span>
        </a>
      )}
    </div>
  );
}

const isSubmissionInHistory = (delivSub, history) => {
  if (!delivSub || !Array.isArray(history) || history.length === 0) return false;

  return history.some((hist) => {
    if (!hist) return false;

    // 1. Direct ID match
    if (hist._id && delivSub._id && String(hist._id) === String(delivSub._id)) {
      return true;
    }

    // 2. Exact timestamp match within 2000ms
    if (hist.submittedAt && delivSub.submittedAt) {
      const histTime = new Date(hist.submittedAt).getTime();
      const delivTime = new Date(delivSub.submittedAt).getTime();
      if (!Number.isNaN(histTime) && !Number.isNaN(delivTime) && Math.abs(histTime - delivTime) < 2000) {
        return true;
      }
    }

    // 3. Exact content match (fileUrl, link, and notes)
    const histFile = typeof hist.fileUrl === "string" ? hist.fileUrl.trim() : "";
    const delivFile = typeof delivSub.fileUrl === "string" ? delivSub.fileUrl.trim() : "";
    const histLink = typeof hist.link === "string" ? hist.link.trim() : "";
    const delivLink = typeof delivSub.link === "string" ? delivSub.link.trim() : "";
    const histNotes = typeof hist.notes === "string" ? hist.notes.trim() : "";
    const delivNotes = typeof delivSub.notes === "string" ? delivSub.notes.trim() : "";

    if (
      (histFile || histLink) &&
      histFile === delivFile &&
      histLink === delivLink &&
      histNotes === delivNotes
    ) {
      return true;
    }

    return false;
  });
};

const findDeliverableForSubmission = (sub, deliverablesList) => {
  if (!sub || typeof sub !== "object" || !Array.isArray(deliverablesList) || deliverablesList.length === 0) {
    return null;
  }

  // 1. Explicit deliverableId matched against the deliverable _id
  if (sub.deliverableId) {
    const found = deliverablesList.find(
      (d) => d && typeof d === "object" && String(d._id) === String(sub.deliverableId)
    );
    if (found) return found;
  }

  // 2. Direct ID match on d.submission._id
  if (sub._id) {
    const found = deliverablesList.find(
      (d) =>
        d &&
        typeof d === "object" &&
        d.submission?._id &&
        String(d.submission._id) === String(sub._id)
    );
    if (found) return found;
  }

  // 3. Submission timestamp within a reasonable tolerance (2s), only when unambiguous
  if (sub.submittedAt) {
    const subTime = new Date(sub.submittedAt).getTime();
    if (!Number.isNaN(subTime) && subTime > 0) {
      const matches = deliverablesList.filter((d) => {
        if (!d || typeof d !== "object" || !d.submission?.submittedAt) return false;
        const dTime = new Date(d.submission.submittedAt).getTime();
        return !Number.isNaN(dTime) && Math.abs(dTime - subTime) < 2000;
      });
      if (matches.length === 1) {
        return matches[0];
      }
    }
  }

  // 4. Matching asset URL and other submission fields, only when unambiguous
  const subFile = typeof sub.fileUrl === "string" ? sub.fileUrl.trim() : "";
  const subLink = typeof sub.link === "string" ? sub.link.trim() : "";
  if (subFile || subLink) {
    const matches = deliverablesList.filter((d) => {
      if (!d || typeof d !== "object" || !d.submission) return false;
      const dFile = typeof d.submission.fileUrl === "string" ? d.submission.fileUrl.trim() : "";
      const dLink = typeof d.submission.link === "string" ? d.submission.link.trim() : "";

      const fileMatch = subFile && dFile === subFile;
      const linkMatch = subLink && dLink === subLink;

      if (subFile && subLink) {
        return fileMatch && linkMatch;
      }
      return Boolean(fileMatch || linkMatch);
    });
    if (matches.length === 1) {
      return matches[0];
    }
  }

  // 5. Title as a fallback only when exactly one deliverable matches
  const searchTitle = (
    typeof sub.deliverableTitle === "string" && sub.deliverableTitle.trim()
      ? sub.deliverableTitle.trim()
      : typeof sub.title === "string"
      ? sub.title.trim()
      : ""
  ).toLowerCase();

  if (searchTitle) {
    const matches = deliverablesList.filter(
      (d) =>
        d &&
        typeof d === "object" &&
        typeof d.title === "string" &&
        d.title.trim().toLowerCase() === searchTitle
    );
    if (matches.length === 1) {
      return matches[0];
    }
  }

  return null;
};


const getStatusBadge = (status) => {
  switch (status) {
    case "submitted":
      return {
        label: "SUBMITTED",
        color: "bg-[#F3E8FF] text-[#9333EA] border-[#E9D5FF] dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
      };
    case "in_progress":
      return {
        label: "IN PROGRESS",
        color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      };
    case "revision_requested":
      return {
        label: "REVISION REQUESTED",
        color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      };
    case "completed":
      return {
        label: "COMPLETED",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      };
    case "cancelled":
      return {
        label: "CANCELLED",
        color: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").toUpperCase() : "ACTIVE",
        color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
      };
  }
};

const getDeliverableStatusBadge = (status) => {
  switch (status) {
    case "submitted":
      return {
        label: "SUBMITTED",
        color: "bg-[#F3E8FF] text-[#9333EA] border-[#E9D5FF] dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
      };
    case "approved":
      return {
        label: "APPROVED",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      };
    case "completed":
      return {
        label: "COMPLETED",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      };
    case "revision_requested":
      return {
        label: "REVISION REQUESTED",
        color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      };
    case "in_progress":
      return {
        label: "IN PROGRESS",
        color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
      };
    case "pending":
    default:
      return {
        label: "PENDING",
        color: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
      };
  }
};

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function BrandWorkspaceDetail({ workspaceId }) {
  const dispatch = useDispatch();
  const { selectedWorkspace, loading, error, successMessage } = useSelector(
    (state) => state.brandWorkspace
  );
  const {
    payments: brandPaymentsList,
    creatingOrder: isCreatingOrder,
    verifyingPayment: isVerifyingPayment,
    error: reduxPaymentError,
    successMessage: reduxPaymentSuccess,
  } = useSelector((state) => state.brandPayments);
  const {
    workspaceReview,
    workspaceReviewWorkspaceId,
    workspaceReviewLoading,
    workspaceReviewError,
  } = useSelector((state) => state.brandReviews || {});

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCreatorReviewModalOpen, setIsCreatorReviewModalOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState("approve"); // 'approve' | 'revision'
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [paymentActionError, setPaymentActionError] = useState("");
  const [paymentActionSuccess, setPaymentActionSuccess] = useState("");
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [deliverableFilter, setDeliverableFilter] = useState("all"); // 'all' | 'submitted' | 'pending'
  const [isOlderSubmissionsOpen, setIsOlderSubmissionsOpen] = useState(false);
  const [failedAvatarImages, setFailedAvatarImages] = useState({});

  useEffect(() => {
    setFailedAvatarImages({});
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchBrandWorkspaceById(workspaceId));
      dispatch(fetchBrandPayments({ workspace: workspaceId, limit: 10 }));
      dispatch(fetchBrandWorkspaceReview(workspaceId));
    }
    return () => {
      dispatch(clearWorkspaceReview());
    };
  }, [dispatch, workspaceId]);

  const isCurrentWorkspaceReview = useMemo(() => {
    if (!workspaceReview || !workspaceId) return false;

    const revWs = workspaceReview.workspace;
    if (revWs !== undefined && revWs !== null) {
      const revWsId =
        typeof revWs === "object"
          ? (revWs._id ? String(revWs._id) : String(revWs))
          : String(revWs);
      return revWsId === String(workspaceId);
    }

    if (workspaceReviewWorkspaceId && String(workspaceReviewWorkspaceId) === String(workspaceId)) {
      return true;
    }

    return false;
  }, [workspaceReview, workspaceId, workspaceReviewWorkspaceId]);

  const handleRetry = () => {
    if (workspaceId) {
      dispatch(fetchBrandWorkspaceById(workspaceId));
      dispatch(fetchBrandPayments({ workspace: workspaceId, limit: 10 }));
      dispatch(fetchBrandWorkspaceReview(workspaceId));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      try {
        if (typeof window !== "undefined" && window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      } catch {
        resolve(false);
      }
    });
  };

  const handleInitiatePayment = async () => {
    if (!selectedWorkspace || selectedWorkspace.status !== "completed") return;
    if (isInitiatingPayment || isCreatingOrder || isVerifyingPayment) return;

    setIsInitiatingPayment(true);
    setPaymentActionError("");
    setPaymentActionSuccess("");
    dispatch(clearPaymentError());
    dispatch(clearPaymentSuccessMessage());

    let scriptLoaded = false;
    try {
      scriptLoaded = await loadRazorpayScript();
    } catch {
      scriptLoaded = false;
    }

    if (!scriptLoaded) {
      setPaymentActionError("Failed to load Razorpay Checkout SDK. Please check your internet connection.");
      setIsInitiatingPayment(false);
      return;
    }

    try {
      const orderResult = await dispatch(createPaymentOrder(selectedWorkspace._id)).unwrap();
      const orderData = orderResult?.data || orderResult;
      const { razorpayOrder, keyId } = orderData || {};

      if (!razorpayOrder?.id || !keyId) {
        setPaymentActionError("Invalid payment order payload returned from server.");
        setIsInitiatingPayment(false);
        return;
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "CreatorLink",
        description: `Payment for workspace: ${selectedWorkspace.campaign?.title || "Campaign Collaboration"}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            const verifyResult = await dispatch(
              verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            ).unwrap();

            setPaymentActionSuccess(verifyResult?.message || "Payment verified and completed successfully!");
            dispatch(fetchBrandWorkspaceById(selectedWorkspace._id));
            dispatch(fetchBrandPayments({ workspace: selectedWorkspace._id, limit: 10 }));
          } catch (verifyErr) {
            setPaymentActionError(typeof verifyErr === "string" ? verifyErr : "Payment verification failed.");
          } finally {
            setIsInitiatingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsInitiatingPayment(false);
            setPaymentActionError("Payment checkout was closed. You can resume payment at any time.");
          },
        },
        prefill: {
          name: selectedWorkspace.brand?.name || "",
          email: selectedWorkspace.brand?.email || "",
        },
        theme: {
          color: "#FF4F87",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async function (response) {
        try {
          const failureMetadata = response?.error?.metadata || {};
          const razorpay_payment_id = response?.error?.payment_id || failureMetadata.payment_id;
          const razorpay_order_id = failureMetadata.order_id || razorpayOrder.id;

          if (razorpay_payment_id && razorpay_order_id) {
            await dispatch(
              reportFailedPayment({
                razorpay_payment_id,
                razorpay_order_id,
              })
            ).unwrap();
          }
          setPaymentActionError(
            response?.error?.description || "Payment attempt failed. You can retry payment at any time."
          );
          dispatch(fetchBrandWorkspaceById(selectedWorkspace._id));
          dispatch(fetchBrandPayments({ workspace: selectedWorkspace._id, limit: 10 }));
        } catch (reportErr) {
          setPaymentActionError(
            typeof reportErr === "string" ? reportErr : "Payment failed and could not be reported."
          );
        } finally {
          setIsInitiatingPayment(false);
        }
      });

      rzp.open();
    } catch (err) {
      setPaymentActionError(typeof err === "string" ? err : "Failed to initiate payment order.");
      setIsInitiatingPayment(false);
    }
  };

  const handleOpenReviewModal = (mode, deliverable = null) => {
    setSelectedDeliverable(deliverable);
    setReviewMode(mode);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedDeliverable(null);
  };

  const workspace = selectedWorkspace;
  const badge = getStatusBadge(workspace?.status);
  const campaign = workspace?.campaign;
  const creator = workspace?.creator;
  const brand = workspace?.brand;
  const service = workspace?.service;
  const campaignCover = campaign?.coverImage || campaign?.image || (Array.isArray(campaign?.images) && campaign?.images[0] ? (typeof campaign.images[0] === "string" ? campaign.images[0] : campaign.images[0]?.url) : null);
  const creatorPhoto = creator?.profileImage || creator?.avatar || creator?.image;

  // Determine active avatar image with safe error fallback:
  // If creatorPhoto fails, fallback to campaignCover. If both fail or are invalid, fallback to initials.
  const activeAvatarImage =
    creatorPhoto && !failedAvatarImages[creatorPhoto]
      ? creatorPhoto
      : campaignCover && !failedAvatarImages[campaignCover]
      ? campaignCover
      : null;
  const avatarInitial = ((creator?.name || brand?.name || campaign?.title || "C")[0] || "C").toUpperCase();

  // Identify whether an active/completed paid payment already exists for this workspace
  const existingPaidPayment = (brandPaymentsList || []).find(
    (p) =>
      (p.workspace === workspace?._id || p.workspace?._id === workspace?._id) &&
      p.status === "paid"
  );
  const isPaid = Boolean(existingPaidPayment);
  const isPaymentProcessing = isInitiatingPayment || isCreatingOrder || isVerifyingPayment;
  const bookingId =
    typeof workspace?.booking === "object" && workspace?.booking !== null
      ? workspace.booking._id
      : workspace?.booking;
  const deliverables = useMemo(
    () => (Array.isArray(workspace?.deliverables) ? workspace.deliverables : []),
    [workspace]
  );
  const rawSubmissions = useMemo(
    () => (Array.isArray(workspace?.submissions) ? workspace.submissions : []),
    [workspace]
  );
  const revisions = useMemo(
    () => (Array.isArray(workspace?.revisions) ? workspace.revisions : []),
    [workspace]
  );

  // Deduplicate and aggregate submissions reliably:
  const allSubmissions = useMemo(() => {
    if (rawSubmissions.length > 0) {
      return [
        ...rawSubmissions,
        ...deliverables
          .filter(
            (d) =>
              d &&
              typeof d === "object" &&
              d.submission &&
              !isSubmissionInHistory(d.submission, rawSubmissions)
          )
          .map((d) => ({
            ...d.submission,
            deliverableId: d._id,
            deliverableTitle: d.title,
          })),
      ];
    }
    return deliverables
      .filter((d) => d && typeof d === "object" && d.submission)
      .map((d) => ({
        ...d.submission,
        deliverableId: d._id,
        deliverableTitle: d.title,
      }));
  }, [rawSubmissions, deliverables]);

  // Sort submissions chronologically descending (newest first)
  const submissions = useMemo(() => {
    return [...allSubmissions].sort((a, b) => {
      const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [allSubmissions]);

  const submittedDeliverables = useMemo(() => {
    return deliverables.filter(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        (item.status === "submitted" ||
          item.status === "approved" ||
          item.status === "completed" ||
          Boolean(item.submission))
    );
  }, [deliverables]);

  const pendingDeliverables = useMemo(() => {
    return deliverables.filter(
      (item) =>
        typeof item === "string" ||
        item === null ||
        !item.status ||
        item.status === "pending" ||
        (item.status === "in_progress" && !item.submission)
    );
  }, [deliverables]);

  // Deliverables to display according to the filter tabs
  const displayedDeliverables = useMemo(() => {
    if (deliverableFilter === "submitted") {
      return submittedDeliverables;
    }
    if (deliverableFilter === "pending") {
      return pendingDeliverables;
    }
    return deliverables;
  }, [deliverableFilter, submittedDeliverables, pendingDeliverables, deliverables]);

  // Render Deliverable Card matching the reference design
  const renderDeliverableCard = (item, idx) => {
    const isObject = typeof item === "object" && item !== null;
    const deliverableId = isObject ? item._id : idx;
    const title = isObject ? item.title || `Deliverable #${idx + 1}` : item;
    const description = isObject ? item.description : null;
    const dueDate = isObject ? item.dueDate : null;
    const status = isObject ? item.status || "pending" : "pending";
    const delBadge = getDeliverableStatusBadge(status);
    const submission = isObject ? item.submission : null;
    const isReviewable = status === "submitted" || status === "revision_requested";
    const validFileUrl = submission?.fileUrl && isValidExternalUrl(submission.fileUrl) ? submission.fileUrl.trim() : null;
    const validLink = submission?.link && isValidExternalUrl(submission.link) ? submission.link.trim() : null;
    const mediaType = validFileUrl ? detectMediaType(validFileUrl) : null;
    const secondaryLabel = mediaType === "video" ? "Video" : mediaType === "image" ? "Image" : "File";

    return (
      <div
        key={deliverableId || idx}
        className="bg-white dark:bg-zinc-900 border border-gray-100/90 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 transition-all"
      >
        {/* Deliverable Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                {title}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${delBadge.color}`}
              >
                {delBadge.label}
              </span>
            </div>
            {dueDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 shrink-0 font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                Due: {formatDate(dueDate)}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Media Preview & Submission Details (Two Column Layout) */}
        {submission ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch pt-1">
            {/* Left: Media Preview */}
            <div className="md:col-span-7">
              {validFileUrl ? (
                mediaType === "video" ? (
                  <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-black/95 relative border border-gray-100 dark:border-zinc-800 shadow-xs flex items-center justify-center">
                    <video
                      src={validFileUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                ) : mediaType === "image" ? (
                  <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-800 relative border border-gray-100 dark:border-zinc-800 shadow-xs flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={validFileUrl}
                      alt={submission.title || title || "Deliverable asset"}
                      className="w-full h-full object-cover rounded-2xl transition-transform duration-300 ease-out hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  /* Neutral File Asset Preview for non-image/non-video file types */
                  <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center p-4 text-center">
                    <DocumentIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {secondaryLabel} Asset Attached
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">Click View Asset below to open file</span>
                  </div>
                )
              ) : validLink ? (
                <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-[#FFF0F3]/40 dark:bg-rose-950/20 border border-pink-100 dark:border-rose-900/30 flex flex-col items-center justify-center p-4 text-center">
                  <ExternalLinkIcon className="w-8 h-8 text-[#FF4F87] mb-2" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Live Content Link Attached</span>
                  <span className="text-[11px] text-gray-500 mt-0.5">Click View Content below to view submission</span>
                </div>
              ) : (
                <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 flex items-center justify-center">
                  <span className="text-xs text-gray-400 font-medium">No valid media uploaded</span>
                </div>
              )}
            </div>

            {/* Right: Submission Details */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-3.5 py-0.5">
              <div className="space-y-3.5">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  Submission Details
                </h4>

                {/* Submitted Timestamp */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400 mt-0.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-400 tracking-wider block">
                      Submitted
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                      {formatDateTime(submission.submittedAt)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400 mt-0.5">
                    <DocumentIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-400 tracking-wider block">
                      Notes
                    </span>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      {submission.notes || "No notes provided"}
                    </p>
                  </div>
                </div>

                {/* Action Links (View Asset & View Content) */}
                <SubmissionActionLinks
                  link={submission.link}
                  fileUrl={submission.fileUrl}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Awaiting Submission State */
          <div className="bg-[#FAF7F7]/60 dark:bg-zinc-800/40 border border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl p-6 text-center space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 text-gray-400 flex items-center justify-center mx-auto border border-gray-100 dark:border-zinc-700 shadow-2xs">
              <UploadIcon className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Awaiting Deliverable Submission
            </p>
            <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
              The creator has not yet submitted work for this deliverable. Once uploaded, assets and links will appear here for review.
            </p>
          </div>
        )}

        {/* Deliverable Review Actions (Only on Current Reviewable Submission) */}
        {isReviewable && (
          <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-end gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenReviewModal("revision", isObject ? item : null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>Request Revision</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenReviewModal("approve", isObject ? item : null)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          </div>
        )}

        {/* Deliverable Approved Banner */}
        {status === "approved" && (
          <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Deliverable Approved</span>
            </span>
            {item.approvedAt && (
              <span className="text-[11px] text-gray-400 font-medium">
                {formatDate(item.approvedAt)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF7F8] dark:bg-[#111111] text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Page Content */}
        <main className="px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 flex-1 max-w-[1440px] w-full mx-auto min-w-0">
          {/* Top Navigation */}
          <div>
            <Link
              href="/brand/workspace"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Back to Workspaces</span>
            </Link>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => dispatch(clearSuccessMessage())}
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 shadow-xs">
              <span>{typeof error === "string" ? error : "Failed to load workspace details."}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && !workspace ? (
            <div className="space-y-6 animate-pulse">
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-5">
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-100 dark:bg-zinc-800 rounded-full w-20" />
                  <div className="h-5 bg-gray-100 dark:bg-zinc-800 rounded-full w-20" />
                </div>
                <div className="h-8 bg-gray-100 dark:bg-zinc-800 rounded-md w-1/3" />
                <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded-md w-1/4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-2xl" />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 h-96 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6" />
                <div className="lg:col-span-5 h-96 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6" />
              </div>
            </div>
          ) : !loading && !workspace ? (
            /* Not Found State */
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-950/30 text-[#FF4F87] flex items-center justify-center mx-auto border border-pink-100 dark:border-pink-900/40">
                <ExclamationIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-xl text-gray-900 dark:text-white">
                  Workspace Not Found
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  The requested workspace does not exist or you do not have permission to view it.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/brand/workspace"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <span>Back to Workspaces</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Workspace Detail Content */
            <div className="space-y-5">
              {/* Top Campaign Summary Card */}
              <div className="bg-white dark:bg-zinc-900 border border-pink-100/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Creator/Campaign Logo + Info */}
                  <div className="flex items-start gap-4">
                    {/* Creator / Campaign Logo Card (Matching Creator Workspace Detail Styling) */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-zinc-850 border border-gray-100 dark:border-zinc-700 shadow-xs flex items-center justify-center p-2 shrink-0 overflow-hidden">
                      {activeAvatarImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={activeAvatarImage}
                          alt={creator?.name || campaign?.title || "Workspace avatar"}
                          className="w-full h-full object-cover rounded-xl transition-transform duration-300 ease-out hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                          onError={() => {
                            if (activeAvatarImage) {
                              setFailedAvatarImages((prev) => ({
                                ...prev,
                                [activeAvatarImage]: true,
                              }));
                            }
                          }}
                        />
                      ) : (
                        <span className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-base shadow-2xs">
                          {avatarInitial}
                        </span>
                      )}
                    </div>

                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        {campaign?.category && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FFE4E6] text-[#E11D48] border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60">
                            {campaign.category}
                          </span>
                        )}
                      </div>

                      {/* Campaign Title in Serif Font */}
                      <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-gray-900 dark:text-white mt-1.5">
                        {campaign?.title || "Campaign Workspace"}
                      </h1>

                      {/* Creator Partner Subtitle with Real Data */}
                      <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          Creator Partner:{" "}
                          <strong className="text-gray-900 dark:text-white font-semibold">
                            {creator?.name || "Creator Partner"}
                          </strong>
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#E11D48] text-white text-[9px] font-bold ml-1.5">
                            ✓
                          </span>
                          {creator?.email && (
                            <span className="text-gray-500 dark:text-gray-400 font-normal">
                              {" "}({creator.email})
                            </span>
                          )}
                          {brand?.name && (
                            <span className="text-gray-400 dark:text-zinc-500 font-normal">
                              {" • Brand: "}
                              <strong className="text-gray-800 dark:text-gray-200 font-semibold">{brand.name}</strong>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 sm:self-start">
                    {bookingId && (
                      <Link
                        href={`/brand/messages?bookingId=${bookingId}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        <ChatBubbleIcon className="w-4 h-4 text-white dark:text-black" />
                        <span>Message Creator</span>
                      </Link>
                    )}

                    {/* Payment Action / Paid Badge */}
                    {isPaid ? (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Payment Completed ({formatPrice(existingPaidPayment.amount, existingPaidPayment.currency)})</span>
                      </div>
                    ) : workspace.status === "completed" ? (
                      <button
                        type="button"
                        onClick={handleInitiatePayment}
                        disabled={isPaymentProcessing}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPaymentProcessing ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing Payment...</span>
                          </>
                        ) : (
                          <>
                            <CreditCardIcon className="w-4 h-4" />
                            <span>Pay Now (Razorpay Test)</span>
                          </>
                        )}
                      </button>
                    ) : null}

                    {/* Review Creator Action / Reviewed Status - When workspace is completed */}
                    {workspace.status === "completed" && (
                      workspaceReviewLoading || (workspaceReviewWorkspaceId && workspaceReviewWorkspaceId !== workspaceId?.toString()) ? (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 text-xs font-medium dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                          <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking Review...</span>
                        </div>
                      ) : workspaceReviewError && !isCurrentWorkspaceReview ? (
                        <div
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                          title={typeof workspaceReviewError === "string" ? workspaceReviewError : "Review status unavailable"}
                        >
                          <ExclamationIcon className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>Review Unavailable</span>
                        </div>
                      ) : isCurrentWorkspaceReview ? (
                        <div
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          title={workspaceReview.comment ? `Feedback: "${workspaceReview.comment}"` : "Rated by you"}
                        >
                          <StarIcon className="w-4 h-4 text-amber-500" filled={true} />
                          <span>Reviewed ({workspaceReview.rating}★)</span>
                        </div>
                      ) : workspaceReviewWorkspaceId === workspaceId?.toString() ? (
                        <button
                          type="button"
                          onClick={() => setIsCreatorReviewModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <StarIcon className="w-4 h-4 text-white" filled={true} />
                          <span>Review Creator</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 text-xs font-medium dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                          <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking Review...</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Review Specific Error Banner */}
                {workspaceReviewError && workspace.status === "completed" && !isCurrentWorkspaceReview && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300 p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-4">
                    <span>
                      {typeof workspaceReviewError === "string"
                        ? workspaceReviewError
                        : "Failed to verify review status for this workspace."}
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch(fetchBrandWorkspaceReview(workspaceId))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
                    >
                      <RefreshIcon className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                {/* Payment Error / Success Banners */}
                {(paymentActionError || reduxPaymentError) && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300 p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-4">
                    <span>{paymentActionError || (typeof reduxPaymentError === "string" ? reduxPaymentError : "Payment failed.")}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentActionError("");
                        dispatch(clearPaymentError());
                      }}
                      className="text-xs font-semibold underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {(paymentActionSuccess || reduxPaymentSuccess) && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300 p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 shrink-0" />
                      <span>{paymentActionSuccess || reduxPaymentSuccess}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentActionSuccess("");
                        dispatch(clearPaymentSuccessMessage());
                      }}
                      className="text-xs font-semibold underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* 4 Stat Cards in 4-Column Responsive Grid with Neutral Fallbacks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  {/* Stat 1: AGREED PRICE */}
                  <div className="bg-white dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider block">
                      AGREED PRICE
                    </span>
                    <span className="font-sans font-bold text-lg sm:text-xl text-gray-900 dark:text-white mt-1 block">
                      {formatPrice(workspace.agreedPrice, workspace.currency)}
                    </span>
                  </div>

                  {/* Stat 2: Deadline */}
                  <div className="bg-white dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider block">
                        Deadline
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mt-0.5 block truncate">
                        {formatDate(workspace.deadline)}
                      </span>
                    </div>
                  </div>

                  {/* Stat 3: Platform */}
                  <div className="bg-white dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                      <ShieldCheckIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider block">
                        Platform
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mt-0.5 capitalize block truncate">
                        {campaign?.platform || service?.platform || "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Stat 4: Selected Service */}
                  <div className="bg-white dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                      <LayersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider block">
                        Selected Service
                      </span>
                      <span
                        className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mt-0.5 block truncate"
                        title={service?.title || "Custom Package"}
                      >
                        {service?.title || "Custom Package"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Two-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Campaign Deliverables (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Campaign Deliverables Header */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-serif text-xl sm:text-2xl font-medium text-gray-900 dark:text-white tracking-tight">
                        Required Campaign Deliverables
                      </h2>
                      <span className="bg-[#FFF0F3] text-[#FF4F87] border border-[#FFD0DC]/80 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {submittedDeliverables.length} Submitted
                      </span>
                      <span className="bg-gray-100 text-gray-600 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {pendingDeliverables.length} Pending
                      </span>
                    </div>

                    {/* Filter Tabs matching Reference */}
                    <div className="flex items-center gap-1.5 bg-white/70 dark:bg-zinc-900/70 p-1 rounded-full border border-gray-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setDeliverableFilter("all")}
                        className={`text-xs px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                          deliverableFilter === "all"
                            ? "bg-[#FFF0F3] text-[#E11D48] border border-[#FECDD3] dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 shadow-2xs"
                            : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white font-medium"
                        }`}
                      >
                        All ({deliverables.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliverableFilter("submitted")}
                        className={`text-xs px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                          deliverableFilter === "submitted"
                            ? "bg-[#FFF0F3] text-[#E11D48] border border-[#FECDD3] dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 shadow-2xs"
                            : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white font-medium"
                        }`}
                      >
                        Submitted ({submittedDeliverables.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliverableFilter("pending")}
                        className={`text-xs px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                          deliverableFilter === "pending"
                            ? "bg-[#FFF0F3] text-[#E11D48] border border-[#FECDD3] dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 shadow-2xs"
                            : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white font-medium"
                        }`}
                      >
                        Pending ({pendingDeliverables.length})
                      </button>
                    </div>
                  </div>

                  {/* Deliverables List */}
                  {displayedDeliverables.length > 0 ? (
                    <div className="space-y-4">
                      {displayedDeliverables.map((item, idx) => renderDeliverableCard(item, idx))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-2">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        No deliverables found in this view.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDeliverableFilter("all")}
                        className="text-xs text-[#FF4F87] font-semibold underline cursor-pointer"
                      >
                        View all deliverables ({deliverables.length})
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Submitted Work & Campaign Brief (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Card 1: Submitted Work (Version History) */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100/90 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-lg sm:text-xl font-medium text-gray-900 dark:text-white tracking-tight">
                          Submitted Work
                        </h2>
                        <span className="bg-[#FFF0F3] text-[#FF4F87] border border-[#FFD0DC]/80 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {submissions.length} Total
                        </span>
                      </div>
                    </div>

                    {submissions.length === 0 ? (
                      <div className="bg-[#FAF7F7]/60 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 text-gray-400 flex items-center justify-center mx-auto border border-gray-100 dark:border-zinc-700 shadow-2xs">
                          <UploadIcon className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                          No work submitted yet
                        </p>
                        <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                          When the creator uploads deliverables or content links, they will appear here in chronological order.
                        </p>
                      </div>
                    ) : (
                      /* Chronological Version History Timeline */
                      <div className="relative pl-3 space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[17px] before:w-0.5 before:bg-gray-100 dark:before:bg-zinc-800">
                        {/* 1. Latest Submission */}
                        {submissions.slice(0, 1).map((sub, idx) => {
                          const matchedDeliv = findDeliverableForSubmission(sub, deliverables);
                          const subTitle =
                            sub.title ||
                            sub.deliverableTitle ||
                            matchedDeliv?.title ||
                            (sub.submittedAt ? `Submission (${formatDate(sub.submittedAt)})` : "Deliverable Submission");
                          const delivBadge = matchedDeliv
                            ? getDeliverableStatusBadge(matchedDeliv.status)
                            : getDeliverableStatusBadge("submitted");
                          const validFileUrl = isValidExternalUrl(sub.fileUrl) ? sub.fileUrl.trim() : null;
                          const validLink = isValidExternalUrl(sub.link) ? sub.link.trim() : null;
                          const mediaType = validFileUrl ? detectMediaType(validFileUrl) : null;
                          const secondaryLabel =
                            mediaType === "video" ? "Video" : mediaType === "image" ? "Image" : "File";

                          return (
                            <div key={sub._id || idx} className="relative group">
                              {/* Timeline Marker */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-3 h-3 rounded-full bg-[#E11D48] ring-4 ring-pink-100 dark:ring-pink-950/60 shrink-0 z-10" />
                                  <div className="flex items-center gap-1.5 text-[#E11D48] dark:text-[#FB7185] text-xs font-bold">
                                    <FolderIcon className="w-3.5 h-3.5" />
                                    <span>Latest Submission</span>
                                  </div>
                                </div>
                                <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">
                                  {formatDateTime(sub.submittedAt)}
                                </span>
                              </div>

                              {/* Submission Card */}
                              <div className="ml-5 mt-2 bg-gray-50/70 dark:bg-zinc-800/40 hover:bg-gray-50 dark:hover:bg-zinc-800/70 border border-gray-100 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-3.5 transition-all shadow-2xs">
                                {/* Thumbnail */}
                                {validFileUrl ? (
                                  mediaType === "video" ? (
                                    <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden relative shrink-0 bg-black/90 border border-gray-100 dark:border-zinc-800">
                                      <video
                                        src={validFileUrl}
                                        preload="metadata"
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                        <div className="w-6 h-6 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-xs">
                                          <PlayIcon className="w-3 h-3 translate-x-0.5 fill-current" />
                                        </div>
                                      </div>
                                    </div>
                                  ) : mediaType === "image" ? (
                                    <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden relative shrink-0 bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={validFileUrl}
                                        alt={subTitle}
                                        className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                                        loading="lazy"
                                      />
                                    </div>
                                  ) : (
                                    /* Neutral File Preview for non-image/non-video file types */
                                    <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex flex-col items-center justify-center text-gray-400 shrink-0">
                                      <DocumentIcon className="w-5 h-5 text-gray-400 mb-0.5" />
                                      <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                                        {secondaryLabel}
                                      </span>
                                    </div>
                                  )
                                ) : validLink ? (
                                  <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 flex flex-col items-center justify-center text-[#FF4F87] shrink-0">
                                    <ExternalLinkIcon className="w-5 h-5 mb-0.5" />
                                    <span className="text-[9px] font-medium uppercase tracking-wider">Link</span>
                                  </div>
                                ) : (
                                  <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-400 shrink-0">
                                    <DocumentIcon className="w-5 h-5" />
                                  </div>
                                )}

                                {/* Details */}
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                                      {subTitle}
                                    </span>
                                    <span
                                      className={`px-2 py-0.2 rounded-full text-[9px] font-bold border uppercase tracking-wider ${delivBadge.color}`}
                                    >
                                      {delivBadge.label}
                                    </span>
                                  </div>

                                  {sub.notes && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                                      {sub.notes}
                                    </p>
                                  )}

                                  {/* View Asset & View Content Links with HTTP/HTTPS URL Validation */}
                                  <div className="pt-0.5 flex flex-wrap items-center gap-2">
                                    {validFileUrl && (
                                      <a
                                        href={validFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#E11D48] dark:text-[#FB7185] hover:opacity-85 transition-opacity"
                                      >
                                        <ExternalLinkIcon className="w-3 h-3" />
                                        <span>View Asset</span>
                                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-gray-200/70 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 ml-1">
                                          {secondaryLabel}
                                        </span>
                                      </a>
                                    )}
                                    {validLink && (
                                      <a
                                        href={validLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#E11D48] dark:text-[#FB7185] hover:opacity-85 transition-opacity"
                                      >
                                        <ExternalLinkIcon className="w-3 h-3" />
                                        <span>View Content</span>
                                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-gray-200/70 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 ml-1">
                                          Open Link
                                        </span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* 2. Previous Version (Revised) */}
                        {submissions.slice(1, 2).map((sub, idx) => {
                          const matchedDeliv = findDeliverableForSubmission(sub, deliverables);
                          const subTitle =
                            sub.title ||
                            sub.deliverableTitle ||
                            matchedDeliv?.title ||
                            (sub.submittedAt ? `Submission (${formatDate(sub.submittedAt)})` : "Deliverable Submission");
                          const delivBadge = matchedDeliv
                            ? getDeliverableStatusBadge(matchedDeliv.status)
                            : getDeliverableStatusBadge("submitted");
                          const validFileUrl = isValidExternalUrl(sub.fileUrl) ? sub.fileUrl.trim() : null;
                          const validLink = isValidExternalUrl(sub.link) ? sub.link.trim() : null;
                          const mediaType = validFileUrl ? detectMediaType(validFileUrl) : null;
                          const secondaryLabel =
                            mediaType === "video" ? "Video" : mediaType === "image" ? "Image" : "File";

                          return (
                            <div key={sub._id || idx} className="relative group">
                              {/* Timeline Marker */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-zinc-600 ring-4 ring-gray-100 dark:ring-zinc-800 shrink-0 z-10" />
                                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs font-semibold">
                                    <HistoryIcon className="w-3.5 h-3.5" />
                                    <span>Previous Version (Revised)</span>
                                  </div>
                                </div>
                                <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">
                                  {formatDateTime(sub.submittedAt)}
                                </span>
                              </div>

                              {/* Submission Card */}
                              <div className="ml-5 mt-2 bg-gray-50/70 dark:bg-zinc-800/40 hover:bg-gray-50 dark:hover:bg-zinc-800/70 border border-gray-100 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-3.5 transition-all shadow-2xs">
                                {/* Thumbnail */}
                                {validFileUrl ? (
                                  mediaType === "video" ? (
                                    <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden relative shrink-0 bg-black/90 border border-gray-100 dark:border-zinc-800">
                                      <video
                                        src={validFileUrl}
                                        preload="metadata"
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                        <div className="w-6 h-6 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-xs">
                                          <PlayIcon className="w-3 h-3 translate-x-0.5 fill-current" />
                                        </div>
                                      </div>
                                    </div>
                                  ) : mediaType === "image" ? (
                                    <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden relative shrink-0 bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={validFileUrl}
                                        alt={subTitle}
                                        className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                                        loading="lazy"
                                      />
                                    </div>
                                  ) : (
                                    /* Neutral File Preview for non-image/non-video file types */
                                    <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex flex-col items-center justify-center text-gray-400 shrink-0">
                                      <DocumentIcon className="w-5 h-5 text-gray-400 mb-0.5" />
                                      <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                                        {secondaryLabel}
                                      </span>
                                    </div>
                                  )
                                ) : validLink ? (
                                  <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 flex flex-col items-center justify-center text-[#FF4F87] shrink-0">
                                    <ExternalLinkIcon className="w-5 h-5 mb-0.5" />
                                    <span className="text-[9px] font-medium uppercase tracking-wider">Link</span>
                                  </div>
                                ) : (
                                  <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-400 shrink-0">
                                    <DocumentIcon className="w-5 h-5" />
                                  </div>
                                )}

                                {/* Details */}
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                                      {subTitle}
                                    </span>
                                    <span
                                      className={`px-2 py-0.2 rounded-full text-[9px] font-bold border uppercase tracking-wider ${delivBadge.color}`}
                                    >
                                      {delivBadge.label}
                                    </span>
                                  </div>

                                  {sub.notes && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                                      {sub.notes}
                                    </p>
                                  )}

                                  {/* View Asset & View Content Links with HTTP/HTTPS URL Validation */}
                                  <div className="pt-0.5 flex flex-wrap items-center gap-2">
                                    {validFileUrl && (
                                      <a
                                        href={validFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#E11D48] dark:text-[#FB7185] hover:opacity-85 transition-opacity"
                                      >
                                        <ExternalLinkIcon className="w-3 h-3" />
                                        <span>View Asset</span>
                                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-gray-200/70 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 ml-1">
                                          {secondaryLabel}
                                        </span>
                                      </a>
                                    )}
                                    {validLink && (
                                      <a
                                        href={validLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#E11D48] dark:text-[#FB7185] hover:opacity-85 transition-opacity"
                                      >
                                        <ExternalLinkIcon className="w-3 h-3" />
                                        <span>View Content</span>
                                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-gray-200/70 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 ml-1">
                                          Open Link
                                        </span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* 3. Older Submissions (Accordion) */}
                        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() => setIsOlderSubmissionsOpen((prev) => !prev)}
                            disabled={submissions.length <= 2}
                            className={`w-full flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 py-1 transition-colors ${
                              submissions.length > 2 ? "cursor-pointer hover:text-gray-900 dark:hover:text-white" : "cursor-default opacity-80"
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              • Older Submissions ({Math.max(0, submissions.length - 2)})
                            </span>
                            <ChevronDownIcon
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isOlderSubmissionsOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* Expanded Older Submissions */}
                          {isOlderSubmissionsOpen && submissions.length > 2 && (
                            <div className="space-y-4 pt-3">
                              {submissions.slice(2).map((sub, idx) => {
                                const matchedDeliv = findDeliverableForSubmission(sub, deliverables);
                                const subTitle =
                                  sub.title ||
                                  sub.deliverableTitle ||
                                  matchedDeliv?.title ||
                                  "Untitled Submission";
                                const delivBadge = matchedDeliv
                                  ? getDeliverableStatusBadge(matchedDeliv.status)
                                  : getDeliverableStatusBadge("submitted");
                                const validFileUrl = isValidExternalUrl(sub.fileUrl) ? sub.fileUrl.trim() : null;
                                const validLink = isValidExternalUrl(sub.link) ? sub.link.trim() : null;
                                const mediaType = validFileUrl ? detectMediaType(validFileUrl) : null;
                                const secondaryLabel =
                                  mediaType === "video" ? "Video" : mediaType === "image" ? "Image" : "File";

                                return (
                                  <div key={sub._id || idx} className="relative group">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-zinc-600 shrink-0 z-10 ml-0.5" />
                                        <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                                          Historical Version
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-gray-400">
                                        {formatDateTime(sub.submittedAt)}
                                      </span>
                                    </div>

                                    <div className="ml-5 mt-2 bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 rounded-2xl p-2.5 flex items-center gap-3">
                                      <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-xs text-gray-800 dark:text-gray-200 truncate">
                                            {subTitle}
                                          </span>
                                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border uppercase tracking-wider ${delivBadge.color}`}>
                                            {delivBadge.label}
                                          </span>
                                        </div>
                                        {sub.notes && (
                                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                            {sub.notes}
                                          </p>
                                        )}
                                        <div className="pt-0.5 flex flex-wrap items-center gap-2">
                                          {validFileUrl && (
                                            <a
                                              href={validFileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E11D48] dark:text-[#FB7185] hover:opacity-85"
                                            >
                                              <ExternalLinkIcon className="w-3 h-3" />
                                              <span>View Asset</span>
                                              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-gray-200/70 dark:bg-zinc-700 text-gray-600 ml-1">
                                                {secondaryLabel}
                                              </span>
                                            </a>
                                          )}
                                          {validLink && (
                                            <a
                                              href={validLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E11D48] dark:text-[#FB7185] hover:opacity-85"
                                            >
                                              <ExternalLinkIcon className="w-3 h-3" />
                                              <span>View Content</span>
                                              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-gray-200/70 dark:bg-zinc-700 text-gray-600 ml-1">
                                                Open Link
                                              </span>
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Campaign & Service Brief with Neutral Fallbacks */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100/90 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-gray-100 dark:border-zinc-800">
                      <h2 className="font-serif text-lg sm:text-xl font-medium text-gray-900 dark:text-white tracking-tight">
                        Campaign &amp; Service Brief
                      </h2>
                    </div>

                    {/* Campaign Overview */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-[#FF4F87] flex items-center justify-center shrink-0 mt-0.5">
                        <DocumentIcon className="w-4 h-4 text-[#FF4F87]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                          Campaign Overview
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                          {campaign?.description || workspace?.brief || "No campaign overview provided."}
                        </p>
                      </div>
                    </div>

                    {/* Service Package Details */}
                    <div className="flex items-start gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                      <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-[#FF4F87] flex items-center justify-center shrink-0 mt-0.5">
                        <SparklesIcon className="w-4 h-4 text-[#FF4F87]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                          Service Package Details
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                          {service?.description || "No service package details provided."}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Time Footer */}
                    <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span>Delivery Time</span>
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {service?.deliveryTime ? `${service.deliveryTime} Days` : "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Revision History (if revisions exist) */}
                  {revisions.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-100/90 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                        <h2 className="font-serif text-lg font-medium text-gray-900 dark:text-white">
                          Revision History
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40">
                          {revisions.length} Total
                        </span>
                      </div>
                      <div className="space-y-3">
                        {revisions.map((rev, idx) => (
                          <div
                            key={rev._id || idx}
                            className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-3.5 rounded-2xl space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                              <span>Revision Request #{idx + 1}</span>
                              <span className="font-normal text-gray-400">{formatDateTime(rev.requestedAt)}</span>
                            </div>
                            <p className="text-gray-800 dark:text-gray-200 italic leading-relaxed">
                              &ldquo;{rev.feedback}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Deliverable Review Modal */}
      <BrandReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        workspaceId={workspaceId}
        targetDeliverable={selectedDeliverable}
        initialMode={reviewMode}
      />

      {/* Creator Rating & Review Modal */}
      <BrandSubmitReviewModal
        isOpen={isCreatorReviewModalOpen}
        onClose={() => setIsCreatorReviewModalOpen(false)}
        workspaceId={workspace?._id}
        creatorName={creator?.name}
        campaignTitle={campaign?.title}
        onSuccess={() => {
          if (workspace?._id) {
            dispatch(fetchBrandWorkspaceReview(workspace._id));
          }
        }}
      />
    </div>
  );
}
