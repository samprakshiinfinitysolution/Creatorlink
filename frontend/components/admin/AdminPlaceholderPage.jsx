"use client";

import React from "react";
import Link from "next/link";

export default function AdminPlaceholderPage({
  title = "Module In Progress",
  badge = "Upcoming Milestone",
  description = "This administrative module is part of the implementation roadmap and will be activated in the next step.",
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in duration-300">
      <div className="max-w-md w-full p-8 rounded-3xl bg-surface border border-border-theme shadow-xs space-y-5">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center text-xl font-bold">
          ✦
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold uppercase tracking-wider">
            {badge}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all shadow-xs cursor-pointer"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

