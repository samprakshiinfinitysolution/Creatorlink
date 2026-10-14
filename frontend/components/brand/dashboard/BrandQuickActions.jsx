import React from "react";
import Link from "next/link";

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function BrandQuickActions() {
  const actions = [
    {
      title: "Create Campaign",
      description: "Launch a new brief for creators",
      href: "/brand/campaigns",
    },
    {
      title: "Edit Brand Profile",
      description: "Update company info & branding",
      href: "/brand/profile",
    },
    {
      title: "Discover Creators",
      description: "Explore talent by niche & reach",
      href: "/brand/creators",
    },
  ];

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
