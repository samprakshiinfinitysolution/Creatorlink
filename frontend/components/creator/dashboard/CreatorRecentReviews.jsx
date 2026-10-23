import React from "react";
import Link from "next/link";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function StarIcon({ className = "w-4 h-4", filled = false }) {
  return (
    <svg
      className={`${className} ${filled ? "text-amber-400 fill-amber-400" : "text-border-theme fill-surface-muted"}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

function StarRating({ rating = 0, max = 5 }) {
  const rawRating = Number(rating);
  const rounded = Number.isFinite(rawRating)
    ? Math.min(max, Math.max(0, Math.round(rawRating)))
    : 0;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} filled={i < rounded} className="w-3.5 h-3.5" />
      ))}
    </div>
  );
}

export default function CreatorRecentReviews({ reviews }) {
  const safeReviews = Array.isArray(reviews?.recent)
    ? reviews.recent
    : Array.isArray(reviews)
    ? reviews
    : [];

  const rawAverageRating = Number(reviews?.averageRating);
  const averageRating = Number.isFinite(rawAverageRating)
    ? Math.min(5, Math.max(0, rawAverageRating))
    : 0;
  const totalReviews =
    typeof reviews?.totalReviews === "number"
      ? reviews.totalReviews
      : safeReviews.length;

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-medium text-lg sm:text-xl text-foreground">
              Recent Reviews & Feedback
            </h2>
            {averageRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <span>★ {averageRating.toFixed(1)}</span>
                <span className="text-text-secondary text-[10px]">
                  ({totalReviews} review{totalReviews === 1 ? "" : "s"})
                </span>
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Ratings and feedback from verified brand partners
          </p>
        </div>

        <Link
          href="/creator/reviews"
          className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline self-start sm:self-auto"
        >
          <span>View All</span>
          <ArrowRightIcon />
        </Link>
      </div>

      {safeReviews.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-border-theme rounded-xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <StarIcon filled className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-medium text-base text-foreground">
            No reviews yet
          </h3>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            Reviews and testimonials from brand partners will appear here once workspaces are completed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeReviews.map((rev, idx) => {
            const reviewer = rev.reviewerName || "Brand Partner";
            const rawRating = Number(rev.rating);
            const ratingVal = Number.isFinite(rawRating)
              ? Math.min(5, Math.max(0, rawRating))
              : 0;
            const reviewId = rev.id || rev._id;

            return (
              <div
                key={reviewId || idx}
                className="p-4 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted/40 transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StarRating rating={ratingVal} />
                      <span className="text-xs font-bold text-foreground">
                        {ratingVal > 0 ? ratingVal.toFixed(1) : "—"}
                      </span>
                    </div>
                    {rev.createdAt && (
                      <span className="text-[10px] text-text-secondary">
                        {formatDate(rev.createdAt)}
                      </span>
                    )}
                  </div>

                  {rev.comment ? (
                    <p className="text-xs text-foreground italic leading-relaxed line-clamp-3">
                      "{rev.comment}"
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary italic">
                      No written feedback provided.
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-border-theme/60 flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-foreground truncate">
                    {reviewer}
                  </span>
                  {rev.campaignTitle && (
                    <span className="text-text-secondary truncate max-w-[180px]">
                      {rev.campaignTitle}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
