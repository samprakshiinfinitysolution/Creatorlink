import React from "react";
import Link from "next/link";

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function CreatorQuickActions({ actions: customActions }) {
  const defaultActions = [
    {
      title: "Discover Campaigns",
      description: "Browse open briefs & brand opportunities",
      href: "/creator/campaigns/discover",
    },
    {
      title: "Offer New Service",
      description: "Create custom package or pricing tier",
      href: "/creator/services",
    },
    {
      title: "Manage Portfolio",
      description: "Upload recent reels, posts & lookbooks",
      href: "/creator/portfolio",
    },
  ];

  const actions = Array.isArray(customActions) && customActions.length > 0
    ? customActions
    : defaultActions;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((act) => (
        <Link
          key={act.title}
          href={act.href}
          className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs hover:border-secondary transition-all flex items-center justify-between group"
        >
          <div>
            <span className="font-semibold text-foreground text-sm block font-sans">
              {act.title}
            </span>
            <span className="text-xs text-text-secondary mt-0.5 block">
              {act.description}
            </span>
          </div>
          <span className="text-secondary group-hover:translate-x-1 transition-transform">
            <ArrowRightIcon />
          </span>
        </Link>
      ))}
    </div>
  );
}
