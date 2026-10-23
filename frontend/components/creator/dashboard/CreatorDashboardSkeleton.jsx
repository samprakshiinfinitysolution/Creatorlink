import React from "react";

export default function CreatorDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* 1. Hero Welcome Banner Skeleton (Dual-Pane) */}
      <div className="relative overflow-hidden bg-surface border border-border-theme rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4 w-full md:w-3/5">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 bg-surface-muted rounded-md" />
            <div className="h-4 w-4 bg-surface-muted rounded-full" />
            <div className="h-4 w-20 bg-surface-muted rounded-md" />
          </div>
          {/* Heading skeleton */}
          <div className="h-10 w-72 sm:w-96 bg-surface-muted rounded-2xl" />
          {/* Subtitle skeleton */}
          <div className="h-4 w-full max-w-lg bg-surface-muted rounded-lg" />
          {/* Action buttons & alert chips */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="h-12 w-44 bg-surface-muted rounded-2xl" />
            <div className="h-12 w-36 bg-surface-muted rounded-2xl" />
            <div className="h-8 w-28 bg-surface-muted rounded-xl" />
          </div>
        </div>

        {/* Right decorative visual skeleton */}
        <div className="hidden md:flex items-center justify-end w-[350px] lg:w-[420px] h-[190px] shrink-0 relative">
          <div className="absolute top-2 left-4 w-28 h-10 bg-surface-muted rounded-2xl" />
          <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-surface-muted border-4 border-surface" />
          <div className="absolute -bottom-2 right-0 w-36 h-12 bg-surface-muted rounded-2xl" />
        </div>
      </div>

      {/* 2. 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border-theme rounded-3xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-surface-muted rounded-md" />
              <div className="h-10 w-10 bg-surface-muted rounded-2xl" />
            </div>
            <div className="space-y-2">
              <div className="h-9 w-32 bg-surface-muted rounded-xl" />
              <div className="h-3.5 w-44 bg-surface-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Production Pipeline Strip Skeleton */}
      <div className="bg-surface border border-border-theme rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-52 bg-surface-muted rounded-md" />
          <div className="h-4 w-28 bg-surface-muted rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-surface-muted rounded-2xl" />
          ))}
        </div>
      </div>

      {/* 4. 2-Column Grid for Deadlines & Collaborations Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border-theme rounded-3xl p-6 sm:p-7 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-5 w-44 bg-surface-muted rounded-md" />
                <div className="h-3.5 w-60 bg-surface-muted rounded-md" />
              </div>
              <div className="h-4 w-16 bg-surface-muted rounded-md" />
            </div>
            <div className="space-y-3 pt-1">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-20 bg-surface-muted rounded-2xl w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 5. Recent Reviews Skeleton */}
      <div className="bg-surface border border-border-theme rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 w-48 bg-surface-muted rounded-md" />
            <div className="h-3.5 w-56 bg-surface-muted rounded-md" />
          </div>
          <div className="h-4 w-20 bg-surface-muted rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-surface-muted rounded-2xl w-full" />
          ))}
        </div>
      </div>

      {/* 6. Quick Action Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border-theme rounded-3xl p-6 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 bg-surface-muted rounded-2xl" />
              <div className="h-5 w-16 bg-surface-muted rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-surface-muted rounded-md" />
              <div className="h-3.5 w-48 bg-surface-muted rounded-md" />
            </div>
            <div className="h-4 w-24 bg-surface-muted rounded-md pt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
