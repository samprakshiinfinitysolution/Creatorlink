"use client";

import React from "react";
import Link from "next/link";

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function CompassIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 7.071-7.071 3.536 3.536-7.071 7.071-3.536z" />
    </svg>
  );
}

function TagIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function VideoCameraIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function getStageStyle(stageId, count) {
  // Neutral styling for inactive stages (count === 0)
  if (count === 0) {
    return {
      border: "border-border-theme",
      bg: "bg-surface",
      pill: "text-text-secondary/70 bg-surface-muted border-border-theme/60",
      pillText: "0 active",
      countColor: "text-foreground/75",
    };
  }

  // Completed work: subtle green accent
  if (stageId === "completed") {
    return {
      border: "border-emerald-500/30 dark:border-emerald-500/40",
      bg: "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]",
      pill: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
      pillText: `${count} done`,
      countColor: "text-emerald-600 dark:text-emerald-400",
    };
  }

  // Active in-flight stages
  switch (stageId) {
    case "proposals":
      return {
        border: "border-amber-500/30 dark:border-amber-500/40",
        bg: "bg-amber-500/[0.04] dark:bg-amber-500/[0.08]",
        pill: "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20",
        pillText: `${count} active`,
        countColor: "text-amber-600 dark:text-amber-400",
      };
    case "in_progress":
      return {
        border: "border-blue-500/30 dark:border-blue-500/40",
        bg: "bg-blue-500/[0.04] dark:bg-blue-500/[0.08]",
        pill: "text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/20",
        pillText: `${count} active`,
        countColor: "text-blue-600 dark:text-blue-400",
      };
    case "under_review":
      return {
        border: "border-purple-500/30 dark:border-purple-500/40",
        bg: "bg-purple-500/[0.04] dark:bg-purple-500/[0.08]",
        pill: "text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-500/20",
        pillText: `${count} active`,
        countColor: "text-purple-600 dark:text-purple-400",
      };
    case "revisions":
      return {
        border: "border-rose-500/30 dark:border-rose-500/40",
        bg: "bg-rose-500/[0.04] dark:bg-rose-500/[0.08]",
        pill: "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20",
        pillText: `${count} active`,
        countColor: "text-rose-600 dark:text-rose-400",
      };
    default:
      return {
        border: "border-border-theme",
        bg: "bg-surface",
        pill: "text-text-secondary bg-surface-muted border-border-theme",
        pillText: `${count} active`,
        countColor: "text-foreground",
      };
  }
}

export default function CreatorQuickActions({ metrics, actions: customActions }) {
  // Workflow stage counts from verified backend metrics
  const proposalsReceived = metrics?.pendingRequests?.proposalsReceived || 0;
  const inProgress = metrics?.activeCollaborations?.breakdown?.inProgress || 0;
  const submitted = metrics?.activeCollaborations?.breakdown?.submitted || 0;
  const revisionRequested = metrics?.activeCollaborations?.breakdown?.revisionRequested || 0;
  const completedWorkspaces = metrics?.completedCollaborations?.total || 0;

  const pipelineStages = [
    {
      id: "proposals",
      label: "Brand Proposals",
      count: proposalsReceived,
      href: "/creator/campaigns",
    },
    {
      id: "in_progress",
      label: "In Production",
      count: inProgress,
      href: "/creator/workspace",
    },
    {
      id: "under_review",
      label: "Under Review",
      count: submitted,
      href: "/creator/workspace",
    },
    {
      id: "revisions",
      label: "Revisions",
      count: revisionRequested,
      href: "/creator/workspace",
    },
    {
      id: "completed",
      label: "Completed",
      count: completedWorkspaces,
      href: "/creator/workspace",
    },
  ];

  const defaultActions = [
    {
      title: "Discover Campaigns",
      description: "Browse open casting briefs & brand opportunities",
      href: "/creator/campaigns/discover",
      icon: CompassIcon,
      badge: "Open Briefs",
      iconBg: "bg-[#ff2d6c]/10 text-black dark:text-white",
    },
    {
      title: "Service Packages & Pricing",
      description: "Manage standard rates, deliverables & add-on tiers",
      href: "/creator/services",
      icon: TagIcon,
      badge: "Services",
      iconBg: "bg-purple-500/10 text-black dark:text-white",
    },
    {
      title: "Creator Portfolio & Showcase",
      description: "Update UGC reels, photography & case studies",
      href: "/creator/portfolio",
      icon: VideoCameraIcon,
      badge: "Media Kit",
      iconBg: "bg-sky-500/10 text-black dark:text-white",
    },
  ];

  const actions =
    Array.isArray(customActions) && customActions.length > 0
      ? customActions
      : defaultActions;

  return (
    <div className="space-y-6">
      {/* 1. Production Pipeline Strip */}
      <div className="bg-surface border border-border-theme rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading font-medium text-lg sm:text-xl text-foreground">
              Production Workflow Pipeline
            </h3>
            <p className="text-xs text-text-secondary font-sans mt-0.5">
              Live progression of your active brand partnerships across production stages
            </p>
          </div>
          <Link
            href="/creator/workspace"
            className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-black dark:text-white hover:underline self-start sm:self-auto"
          >
            <span>Open Workspace</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pipeline Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-1 items-stretch">
          {pipelineStages.map((stage, idx) => {
            const style = getStageStyle(stage.id, stage.count);
            const isLastOdd = idx === 4; // 5th card on 2-col mobile layout
            return (
              <Link
                key={stage.id}
                href={stage.href}
                className={`p-3.5 sm:p-4 rounded-2xl border ${style.border} ${style.bg} hover:border-pink-200/90 dark:hover:border-pink-500/30 hover:shadow-xs transition-all duration-200 flex flex-col justify-between h-full min-h-[116px] sm:min-h-[124px] group ${
                  isLastOdd ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                {/* Top: Stage Index & Status Pill */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-text-secondary/70 tracking-wider uppercase">
                    Stage 0{idx + 1}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${style.pill}`}
                  >
                    {style.pillText}
                  </span>
                </div>

                {/* Middle: Prominent Count */}
                <div className="my-auto py-1">
                  <span
                    className={`font-heading font-medium text-2xl sm:text-3xl ${style.countColor} block tracking-tight group-hover:text-secondary transition-colors`}
                  >
                    {stage.count}
                  </span>
                </div>

                {/* Bottom: Stage Label */}
                <div className="pt-2 border-t border-border-theme/40">
                  <span
                    className="text-xs sm:text-sm font-sans font-medium text-foreground block truncate group-hover:text-secondary transition-colors"
                    title={stage.label}
                  >
                    {stage.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
        {actions.map((act) => {
          const Icon = act.icon || CompassIcon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className="bg-surface border border-border-theme hover:border-pink-200/90 dark:hover:border-pink-500/30 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between h-full group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`p-2.5 sm:p-3 rounded-2xl shrink-0 ${act.iconBg || "bg-secondary/10 text-secondary"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {act.badge && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-surface-muted text-text-secondary border border-border-theme">
                      {act.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-heading font-medium text-base sm:text-lg text-foreground block tracking-tight group-hover:text-secondary transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-text-secondary font-sans mt-1.5 leading-relaxed line-clamp-2">
                  {act.description}
                </p>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-between text-xs font-sans font-semibold text-black dark:text-white border-t border-border-theme/40 group-hover:translate-x-0.5 transition-transform">
                <span>Access Tool</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
