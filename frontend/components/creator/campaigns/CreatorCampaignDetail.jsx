"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDiscoverCampaignById,
  fetchAppliedCampaigns,
  clearSelectedDiscoverCampaign,
  applyToCampaign,
} from "@/redux/creator/campaigns/campaigns_slice";
import { getCreatorProfile } from "@/redux/creator/profile/profile_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import ApplyToCampaignModal from "@/components/creator/campaigns/ApplyToCampaignModal";
import { normalizeCampaignPlatforms, formatCampaignPlatforms } from "@/lib/campaignPlatforms";

// =========================================================
// MONOCHROME SVG ICONS (STRICT BLACK / NEUTRAL PALETTE)
// =========================================================
function ArrowLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
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

function WalletIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5m0 0h-5a2 2 0 000 4h5v-4z" />
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

function UsersIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function GridIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function DocumentTextIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function LayersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l9.75 5.25 9.75-5.25-4.179-2.25m-11.321 4.5L2.25 16.5l9.75 5.25 9.75-5.25-4.179-2.25m-11.321-9L12 2.25l9.75 5.25-9.75 5.25L2.25 7.5z" />
    </svg>
  );
}

function TargetIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16a4 4 0 100-8 4 4 0 000 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function UserCheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.999-3.199a5.96 5.96 0 01-.037-.666l.001-.031M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function UserSingleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function TrendingUpIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function InfoIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
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

function MegaphoneIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

// Monochrome Platform SVGs
function InstagramIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TiktokIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.47V8.84a8.27 8.27 0 0 0 4.89 1.57V6.96a4.83 4.83 0 0 1-1-.27z" />
    </svg>
  );
}

function GlobeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  );
}

function PlatformIcon({ platform, className = "w-3.5 h-3.5" }) {
  const p = (platform || "").toLowerCase();
  if (p === "instagram") return <InstagramIcon className={className} />;
  if (p === "youtube") return <YoutubeIcon className={className} />;
  if (p === "facebook") return <FacebookIcon className={className} />;
  if (p === "tiktok") return <TiktokIcon className={className} />;
  return <GlobeIcon className={className} />;
}

// =========================================================
// HELPER UTILITIES
// =========================================================
const formatPlatform = (val) => formatCampaignPlatforms(val, "General");

const formatBudget = (amount, currency = "INR") => {
  if (typeof amount !== "number" || isNaN(amount)) return "N/A";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${new Intl.NumberFormat("en-IN").format(amount)}`;
};

const formatCampaignBudgetDisplay = (campaign) => {
  if (!campaign) return "N/A";
  const curr = campaign.currency || "INR";
  const min = campaign.minBudget;
  const max = campaign.maxBudget;
  if (
    min !== undefined &&
    min !== null &&
    max !== undefined &&
    max !== null &&
    !isNaN(Number(min)) &&
    !isNaN(Number(max)) &&
    Number(min) > 0 &&
    Number(max) > 0
  ) {
    if (Number(min) === Number(max)) return formatBudget(Number(min), curr);
    return `${formatBudget(Number(min), curr)} – ${formatBudget(Number(max), curr)}`;
  }
  return formatBudget(campaign.budget || max || min, curr);
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

const getDaysRemainingText = (dateString) => {
  if (!dateString) return null;
  const deadlineDate = new Date(dateString);
  if (isNaN(deadlineDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return `(${diffDays} days left)`;
  if (diffDays === 1) return "(1 day left)";
  if (diffDays === 0) return "(Due today)";
  return "(Deadline passed)";
};

const formatDeliverableItem = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    const text = item.title || item.name || item.type || item.deliverable || item.text || item.label || "";
    const count = item.count || item.quantity || item.amount;
    if (text && count) return `${count} ${text}`;
    if (text) return text;
  }
  return String(item);
};

export default function CreatorCampaignDetail({ campaignId }) {
  const dispatch = useDispatch();
  const { selectedDiscoverCampaign, appliedCampaigns, loading, error, submitting } = useSelector(
    (state) => state.creatorCampaigns
  );
  const { profile } = useSelector((state) => state.profile || {});

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [failedCoverUrl, setFailedCoverUrl] = useState(null);

  useEffect(() => {
    if (campaignId) {
      dispatch(fetchDiscoverCampaignById(campaignId));
    }
    dispatch(fetchAppliedCampaigns({ limit: 100 }));

    return () => {
      dispatch(clearSelectedDiscoverCampaign());
    };
  }, [dispatch, campaignId]);

  useEffect(() => {
    if (!profile) {
      dispatch(getCreatorProfile());
    }
  }, [dispatch, profile]);

  const handleRetry = () => {
    if (campaignId) {
      dispatch(fetchDiscoverCampaignById(campaignId));
    }
  };

  const handleApplySubmit = async (payload) => {
    const resultAction = await dispatch(applyToCampaign(payload));
    if (applyToCampaign.fulfilled.match(resultAction)) {
      setIsApplyModalOpen(false);
      if (campaignId) {
        dispatch(fetchDiscoverCampaignById(campaignId));
      }
      dispatch(fetchAppliedCampaigns({ limit: 100 }));
    }
  };

  // Check if current creator has already applied to this campaign
  const isApplied = Boolean(
    campaignId &&
      Array.isArray(appliedCampaigns) &&
      appliedCampaigns.some((item) => {
        if (!item) return false;
        const targetId =
          typeof item.campaign === "string"
            ? item.campaign
            : item.campaign?._id || item.campaignId;
        return Boolean(targetId) && String(targetId) === String(campaignId);
      })
  );

  // Resolve campaign whether selectedDiscoverCampaign is a direct Campaign document or an applied Booking object
  const campaign =
    selectedDiscoverCampaign && typeof selectedDiscoverCampaign === "object"
      ? (selectedDiscoverCampaign.campaign !== undefined
          ? selectedDiscoverCampaign.campaign
          : selectedDiscoverCampaign)
      : selectedDiscoverCampaign;

  // Profile metrics for eligibility comparison
  const creatorFollowers =
    typeof profile?.followerCount === "number"
      ? profile.followerCount
      : profile?.followerCount !== undefined && profile?.followerCount !== null && profile?.followerCount !== "" && !isNaN(Number(profile.followerCount))
      ? Number(profile.followerCount)
      : typeof profile?.followersCount === "number"
      ? profile.followersCount
      : null;

  const creatorEngagementRate =
    typeof profile?.engagementRate === "number"
      ? profile.engagementRate
      : profile?.engagementRate !== undefined && profile?.engagementRate !== null && profile?.engagementRate !== "" && !isNaN(Number(profile.engagementRate))
      ? Number(profile.engagementRate)
      : null;

  const minFollowersReq =
    typeof campaign?.creatorRequirements?.minFollowers === "number"
      ? campaign.creatorRequirements.minFollowers
      : 0;

  const minEngagementReq =
    typeof campaign?.creatorRequirements?.minEngagementRate === "number"
      ? campaign.creatorRequirements.minEngagementRate
      : 0;

  const getFollowersStatus = () => {
    if (minFollowersReq <= 0) {
      return { label: "Meets Requirements", type: "meets", note: "Open to all" };
    }
    if (creatorFollowers === null || isNaN(creatorFollowers)) {
      return { label: "Not Available", type: "na", note: "Metric not added" };
    }
    if (creatorFollowers >= minFollowersReq) {
      return { label: "Meets Requirements", type: "meets", note: `${creatorFollowers.toLocaleString()} followers` };
    }
    return { label: "Below Requirements", type: "below", note: `${creatorFollowers.toLocaleString()} followers` };
  };

  const getEngagementStatus = () => {
    if (minEngagementReq <= 0) {
      return { label: "Meets Requirements", type: "meets", note: "No minimum" };
    }
    if (creatorEngagementRate === null || isNaN(creatorEngagementRate)) {
      return { label: "Not Available", type: "na", note: "Metric not added" };
    }
    if (creatorEngagementRate >= minEngagementReq) {
      return { label: "Meets Requirements", type: "meets", note: `${creatorEngagementRate}% engagement` };
    }
    return { label: "Below Requirements", type: "below", note: `${creatorEngagementRate}% engagement` };
  };

  const followersStatus = getFollowersStatus();
  const engagementStatus = getEngagementStatus();

  const renderEligibilityBadge = (statusObj) => {
    if (statusObj.type === "meets") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700">
          ✓ {statusObj.label}
        </span>
      );
    }
    if (statusObj.type === "below") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">
          ! {statusObj.label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
        ✦ {statusObj.label}
      </span>
    );
  };

  const deliverablesList = Array.isArray(campaign?.deliverables)
    ? campaign.deliverables.map(formatDeliverableItem).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-5xl w-full mx-auto">
          {/* Back Navigation Button */}
          <div>
            <Link
              href="/creator/campaigns/discover"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Back to Discover Campaigns</span>
            </Link>
          </div>

          {/* ERROR STATE */}
          {!campaign && error ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-8 sm:p-12 text-center shadow-2xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center mx-auto border border-neutral-200 dark:border-neutral-700">
                <RefreshIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif font-medium text-xl text-neutral-900 dark:text-neutral-100">
                  Unable to load campaign details
                </h2>
                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                  {typeof error === "string" ? error : "An error occurred while fetching the campaign details."}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold border border-black hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer dark:bg-white dark:text-black dark:border-white dark:hover:bg-neutral-200"
                >
                  <RefreshIcon className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <Link
                  href="/creator/campaigns/discover"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer"
                >
                  <span>Discover Campaigns</span>
                </Link>
              </div>
            </div>
          ) : loading || (!campaign && loading) ? (
            /* LOADING SKELETON STATE */
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xs animate-pulse space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full w-28" />
                <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full w-20" />
              </div>
              <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-2/3" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-1/3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                ))}
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-full" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-full" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-3/4" />
              </div>
            </div>
          ) : !campaign ? (
            /* NOT FOUND STATE */
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-8 sm:p-12 text-center shadow-2xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center mx-auto border border-neutral-200 dark:border-neutral-700">
                <MegaphoneIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif font-medium text-xl text-neutral-900 dark:text-neutral-100">
                  Campaign Not Found
                </h2>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                  The campaign you are looking for may have been removed or is no longer active.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/creator/campaigns/discover"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-semibold tracking-wide border border-black hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer dark:bg-white dark:text-black dark:border-white dark:hover:bg-neutral-200"
                >
                  <span>Back to Discover Campaigns</span>
                </Link>
              </div>
            </div>
          ) : (
            /* MAIN CAMPAIGN DETAIL DISPLAY */
            <div className="space-y-5 sm:space-y-6">
              {/* Top Campaign Header Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
                {/* Title Row + Category Badge + Status & Apply */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 dark:text-neutral-100 tracking-tight">
                      {campaign?.title || "Campaign"}
                    </h1>
                    {campaign?.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700">
                        {campaign.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    {/* Status Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100"></span>
                      <span>
                        {campaign?.status
                          ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)
                          : "Published"}
                      </span>
                    </span>

                    {/* Apply Action */}
                    {isApplied ? (
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700">
                        Already Applied
                      </span>
                    ) : campaign?.status !== "published" ? (
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-neutral-100 text-neutral-500 text-xs font-semibold border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                        Applications Closed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsApplyModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-black text-white text-xs font-semibold tracking-wide border border-black hover:bg-neutral-800 active:scale-[0.99] transition-all duration-200 cursor-pointer dark:bg-white dark:text-black dark:border-white dark:hover:bg-neutral-200 shadow-2xs"
                      >
                        <span>Apply to Campaign</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Brand Information and Verification Indicator */}
                {(campaign?.brand?.name || campaign?.brand?.companyName) && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {campaign.brand?.logo || campaign.brand?.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={campaign.brand.logo || campaign.brand.avatar}
                        alt={campaign.brand.companyName || campaign.brand.name}
                        className="w-5 h-5 rounded-md object-contain object-center shrink-0 border border-neutral-200 dark:border-neutral-700"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-[10px] font-sans font-semibold shrink-0">
                        {((campaign.brand.companyName || campaign.brand.name || "B").trim()[0] || "B").toUpperCase()}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 flex-wrap">
                      <span>Posted by</span>
                      <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                        {campaign.brand.companyName || campaign.brand.name}
                      </span>
                      <span
                        title="Verified Brand"
                        className="w-4 h-4 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-[9px] font-bold shrink-0"
                      >
                        ✓
                      </span>
                      {campaign.brand.email && (
                        <span className="text-neutral-500 dark:text-neutral-400">
                          ({campaign.brand.email})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Cover Banner (Optional, preserved for campaigns with images) */}
              {(campaign?.coverImage || campaign?.image) &&
                failedCoverUrl !== (campaign?.coverImage || campaign?.image) && (
                  <div className="relative h-48 sm:h-64 lg:h-72 w-full rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shrink-0 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={campaign?.coverImage || campaign?.image}
                      alt={campaign?.title || "Campaign banner"}
                      className="w-full h-full object-cover"
                      onError={() => setFailedCoverUrl(campaign?.coverImage || campaign?.image)}
                    />
                  </div>
                )}

              {/* Campaign Overview Cards (4 Cards Grid) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {/* 1. Budget (Per Creator) */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                    <WalletIcon className="w-4 h-4 text-black dark:text-white shrink-0" />
                    <span>Budget (Per Creator)</span>
                  </div>
                  <div className="mt-2.5">
                    <span className="font-sans font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-100 block tracking-tight">
                      {formatCampaignBudgetDisplay(campaign)}
                    </span>
                  </div>
                </div>

                {/* 2. Deadline */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                    <CalendarIcon className="w-4 h-4 text-black dark:text-white shrink-0" />
                    <span>Deadline</span>
                  </div>
                  <div className="mt-2.5">
                    <span className="font-sans font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 block">
                      {formatDate(campaign?.deadline)}
                    </span>
                    {getDaysRemainingText(campaign?.deadline) && (
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                        {getDaysRemainingText(campaign?.deadline)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Creators Needed */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                    <UsersIcon className="w-4 h-4 text-black dark:text-white shrink-0" />
                    <span>Creators Needed</span>
                  </div>
                  <div className="mt-2.5">
                    <span className="font-sans font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 block">
                      {campaign?.requiredCreators || 1} Creator
                      {(campaign?.requiredCreators || 1) > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* 4. Platforms */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                    <GridIcon className="w-4 h-4 text-black dark:text-white shrink-0" />
                    <span>Platforms</span>
                  </div>
                  <div className="mt-2.5">
                    {normalizeCampaignPlatforms(campaign?.platform).length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {normalizeCampaignPlatforms(campaign.platform).map((plat) => (
                          <div
                            key={plat}
                            title={formatPlatform(plat)}
                            className="w-7 h-7 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white shadow-2xs"
                          >
                            <PlatformIcon platform={plat} className="w-3.5 h-3.5" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="font-sans font-bold text-sm text-neutral-900 dark:text-neutral-100">
                        General
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Campaign Description Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <DocumentTextIcon className="w-5 h-5 text-black dark:text-white shrink-0" />
                  <h2 className="font-serif font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                    Campaign Description
                  </h2>
                </div>
                <div className="p-4 sm:p-4.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800/80 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {campaign?.description || "No detailed description provided."}
                </div>
              </div>

              {/* Required Deliverables and Target Audience Profile (Side by side on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Left Card: Required Deliverables */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <LayersIcon className="w-5 h-5 text-black dark:text-white shrink-0" />
                      <h2 className="font-serif font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                        Required Deliverables{" "}
                        {deliverablesList.length > 0 ? `(${deliverablesList.length})` : ""}
                      </h2>
                    </div>
                    {deliverablesList.length > 0 ? (
                      <div className="space-y-2.5">
                        {deliverablesList.map((itemText, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800/80 text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
                          >
                            <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center shrink-0 text-xs font-bold">
                              ✓
                            </div>
                            <span className="truncate">{itemText}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500">
                        No specific deliverables listed.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Card: Target Audience Profile */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <TargetIcon className="w-5 h-5 text-black dark:text-white shrink-0" />
                      <h2 className="font-serif font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                        Target Audience Profile
                      </h2>
                    </div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-xs sm:text-sm">
                      <div className="flex items-center justify-between py-2.5 first:pt-1">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                          Age Bracket
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {campaign?.audienceTargeting?.age || "All"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                          Gender
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                          {campaign?.audienceTargeting?.gender === "all" || !campaign?.audienceTargeting?.gender
                            ? "All Genders"
                            : campaign.audienceTargeting.gender}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 last:pb-1">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                          Geography / Regions
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right truncate max-w-[60%]">
                          {Array.isArray(campaign?.audienceTargeting?.geography) &&
                          campaign.audienceTargeting.geography.length > 0
                            ? campaign.audienceTargeting.geography.join(", ")
                            : campaign?.audienceTargeting?.geography || "All Regions"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Rights & Licensing Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheckIcon className="w-5 h-5 text-black dark:text-white shrink-0" />
                  <h2 className="font-serif font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                    Usage Rights & Licensing
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Duration */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                      Duration
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 block">
                      {campaign?.usageRights?.duration || "30 days"}
                    </span>
                  </div>

                  {/* Organic Usage */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                      Organic Usage
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 block">
                      {campaign?.usageRights?.organicUsage !== false ? "✓ Included" : "Not Included"}
                    </span>
                  </div>

                  {/* Paid Ads Amplification */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                      Paid Ads Amplification
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 block">
                      {campaign?.usageRights?.paidAds ? "✓ Included" : "Not Included"}
                    </span>
                  </div>

                  {/* Exclusivity */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                      Exclusivity
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 block">
                      {campaign?.usageRights?.exclusivity ? "Exclusive" : "Non-exclusive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator Eligibility Requirements Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <UserCheckIcon className="w-5 h-5 text-black dark:text-white shrink-0" />
                  <h2 className="font-serif font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                    Creator Eligibility Requirements
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Minimum Followers */}
                  <div className="p-4 sm:p-4.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        <UserSingleIcon className="w-4 h-4 text-black dark:text-white shrink-0" />
                        <span>Minimum Followers</span>
                      </div>
                      {renderEligibilityBadge(followersStatus)}
                    </div>
                    <div>
                      <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 block">
                        {minFollowersReq > 0
                          ? `${minFollowersReq.toLocaleString()} Followers`
                          : "Open to all creators"}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">
                        {creatorFollowers !== null && !isNaN(creatorFollowers)
                          ? `Your profile: ${creatorFollowers.toLocaleString()} followers`
                          : "Your profile: Metric not added"}
                      </span>
                    </div>
                  </div>

                  {/* Minimum Engagement Rate */}
                  <div className="p-4 sm:p-4.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        <TrendingUpIcon className="w-4 h-4 text-black dark:text-white shrink-0" />
                        <span>Minimum Engagement Rate</span>
                      </div>
                      {renderEligibilityBadge(engagementStatus)}
                    </div>
                    <div>
                      <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 block">
                        {minEngagementReq > 0
                          ? `${minEngagementReq}% Engagement`
                          : "No minimum engagement"}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">
                        {creatorEngagementRate !== null && !isNaN(creatorEngagementRate)
                          ? `Your profile: ${creatorEngagementRate}% engagement`
                          : "Your profile: Metric not added"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Soft Guideline Notice */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2.5">
                  <InfoIcon className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">Note:</span>{" "}
                    Eligibility requirements are soft guidelines provided by the brand. You can still apply to this
                    campaign even if your metrics differ or are not connected to your profile.
                  </p>
                </div>
              </div>

              {/* Footer Specs & Dates */}
              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-500">
                <div>
                  Created:{" "}
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatDate(campaign?.createdAt)}
                  </span>
                </div>
                <div className="font-mono text-[10px]">
                  Campaign ID: {campaign?._id || campaign?.id}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Apply to Campaign Modal */}
      <ApplyToCampaignModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        campaignId={campaignId}
        campaignTitle={campaign?.title}
        campaignBudget={campaign?.budget}
        minBudget={campaign?.minBudget}
        maxBudget={campaign?.maxBudget}
        campaignCategory={campaign?.category}
        campaignPlatform={normalizeCampaignPlatforms(campaign?.platform)[0] || "instagram"}
        brand={campaign?.brand}
        onContinue={handleApplySubmit}
        submitting={submitting}
        submitError={error}
      />
    </div>
  );
}
