import React from "react";

function formatCurrency(amount, currency = "INR") {
  const numericAmount =
    amount === undefined || amount === null || isNaN(Number(amount))
      ? 0
      : Number(amount);
  const currCode =
    (currency && typeof currency === "string" ? currency.trim().toUpperCase() : "INR") || "INR";

  try {
    if (currCode === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(numericAmount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currCode,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `${currCode} ${numericAmount.toLocaleString()}`;
  }
}

function CurrencyIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LayersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l9.75 5.25 9.75-5.25-4.179-2.25m-11.142 4.5l-4.179 2.25 9.75 5.25 9.75-5.25-4.179-2.25M12 2.25L2.25 7.5l9.75 5.25 9.75-5.25L12 2.25z" />
    </svg>
  );
}

function ClockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

export default function CreatorMetricsGrid({ metrics }) {
  // Earnings
  const totalEarnings = metrics?.totalEarnings?.amount ?? 0;
  const earningsCurrency = metrics?.totalEarnings?.currency || "INR";
  const paidCount = metrics?.totalEarnings?.paidTransactionsCount ?? 0;
  const pendingEst =
    metrics?.pendingPayments?.totalOutstandingEstimated ??
    metrics?.pendingPayments?.amount ??
    0;
  const pendingCurrency = metrics?.pendingPayments?.currency || "INR";

  // Active Collaborations
  const activeWorkspaces = metrics?.activeCollaborations?.total ?? 0;
  const inProgress = metrics?.activeCollaborations?.breakdown?.inProgress ?? 0;
  const submitted = metrics?.activeCollaborations?.breakdown?.submitted ?? 0;
  const revisionRequested = metrics?.activeCollaborations?.breakdown?.revisionRequested ?? 0;
  const completedWorkspaces = metrics?.completedCollaborations?.total ?? 0;

  // Pending Requests
  const pendingRequests = metrics?.pendingRequests?.total ?? 0;
  const proposalsReceived = metrics?.pendingRequests?.proposalsReceived ?? 0;
  const applicationsSubmitted = metrics?.pendingRequests?.applicationsSubmitted ?? 0;

  // Reviews & Rating
  const avgRating = metrics?.reviews?.averageRating ?? 0;
  const totalReviews = metrics?.reviews?.totalReviews ?? 0;

  const cards = [
    {
      title: "Total Earnings",
      value: formatCurrency(totalEarnings, earningsCurrency),
      subtitle: `${paidCount} paid${pendingEst > 0 ? ` · Est. ${formatCurrency(pendingEst, pendingCurrency)} pending` : ""}`,
      icon: CurrencyIcon,
      accent: "text-emerald-500 bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/40",
    },
    {
      title: "Active Collaborations",
      value: activeWorkspaces.toString(),
      subtitle: `${inProgress} in progress · ${submitted} submitted${
        revisionRequested > 0
          ? ` · ${revisionRequested} revision${revisionRequested > 1 ? "s" : ""}`
          : completedWorkspaces > 0
          ? ` · ${completedWorkspaces} done`
          : ""
      }`,
      icon: LayersIcon,
      accent: "text-blue-500 bg-blue-500/10",
      borderHover: "hover:border-blue-500/40",
    },
    {
      title: "Pending Requests",
      value: pendingRequests.toString(),
      subtitle: `${proposalsReceived} brand proposal${proposalsReceived === 1 ? "" : "s"} · ${applicationsSubmitted} applied`,
      icon: ClockIcon,
      accent: "text-amber-500 bg-amber-500/10",
      borderHover: "hover:border-amber-500/40",
    },
    {
      title: "Reviews & Rating",
      value: avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "No reviews",
      subtitle: `${totalReviews} brand review${totalReviews === 1 ? "" : "s"}${
        completedWorkspaces > 0 ? ` · ${completedWorkspaces} completed` : ""
      }`,
      icon: StarIcon,
      accent: "text-purple-500 bg-purple-500/10",
      borderHover: "hover:border-purple-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`bg-surface border border-border-theme rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 ${c.borderHover}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2.5 rounded-xl ${c.accent}`}>
                <Icon />
              </div>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-medium text-foreground block tracking-tight">
                {c.value}
              </span>
              <span className="text-[11px] text-text-secondary mt-1 block truncate font-medium">
                {c.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
