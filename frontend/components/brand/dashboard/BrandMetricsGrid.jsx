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

// =========================================================
// SVG ICONS MATCHING THE REFERENCE SCREENSHOT
// =========================================================
function MegaphoneIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function PlayCircleIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="10,8.5 16,12 10,15.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RupeeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 4.5H6.5v2h3.2c1.7 0 3 .8 3.5 2.1H6.5v2h6.7c-.5 1.5-1.9 2.5-3.7 2.5H6.5v2.2L13.8 21h2.8l-7.5-6.2c2.4-.2 4.4-1.6 5.1-3.9h3.3v-2h-3c-.2-.7-.6-1.4-1.2-2h4.2v-2.4z" />
    </svg>
  );
}

function UserIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

export default function BrandMetricsGrid({ metrics }) {
  const totalCampaigns = metrics?.campaigns?.total ?? 0;
  const draftCampaigns = metrics?.campaigns?.statusBreakdown?.draft ?? 0;
  const completedCampaigns = metrics?.campaigns?.statusBreakdown?.completed ?? 0;

  const activeCampaigns = metrics?.campaigns?.active ?? 0;
  const inProgressCampaigns = metrics?.campaigns?.statusBreakdown?.in_progress ?? 0;
  const publishedCampaigns = metrics?.campaigns?.statusBreakdown?.published ?? 0;

  const totalSpending = metrics?.totalSpending?.amount ?? 0;
  const spendingCurrency = metrics?.totalSpending?.currency || "INR";
  const paidCount = metrics?.totalSpending?.paidTransactionsCount ?? 0;
  const outstandingEst = metrics?.pendingPayments?.totalOutstandingEstimated ?? 0;
  const pendingCurrency = metrics?.pendingPayments?.currency || "INR";

  const activeWorkspaces = metrics?.collaborations?.active ?? 0;
  const completedWorkspaces = metrics?.collaborations?.completed ?? 0;
  const hiredCreatorsCount = activeWorkspaces + completedWorkspaces;

  const cards = [
    {
      title: "TOTAL CAMPAIGNS",
      value: totalCampaigns.toString(),
      subtitle: `${draftCampaigns} draft · ${completedCampaigns} completed`,
      icon: MegaphoneIcon,
    },
    {
      title: "ACTIVE CAMPAIGNS",
      value: activeCampaigns.toString(),
      subtitle: `${inProgressCampaigns} in progress · ${publishedCampaigns} published`,
      icon: PlayCircleIcon,
    },
    {
      title: "TOTAL BUDGET",
      value: formatCurrency(totalSpending, spendingCurrency),
      subtitle: `${paidCount} paid${outstandingEst > 0 ? ` · Est. ${formatCurrency(outstandingEst, pendingCurrency)} pending` : ""}`,
      icon: RupeeIcon,
    },
    {
      title: "CREATORS HIRED",
      value: hiredCreatorsCount.toString(),
      subtitle: `${activeWorkspaces} active · ${completedWorkspaces} completed`,
      icon: UserIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="bg-white dark:bg-surface border border-border-theme rounded-xl p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-secondary/40 transition-all duration-200 flex items-center gap-3 sm:gap-3.5 h-full"
          >
            {/* Left Pink Icon Container */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px] rounded-xl bg-[#fff0f4]/50 dark:bg-[#2a171f]/50 text-[#ff2d6c] dark:text-[#ff4f87] flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105">
              <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>

            {/* Right Metric Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-[10px] sm:text-[10.5px] font-semibold text-slate-400 dark:text-neutral-400 tracking-wider uppercase font-sans truncate">
                {c.title}
              </span>
              <span className="text-[19px] sm:text-[23px] lg:text-[24px] font-semibold text-slate-900 dark:text-foreground font-sans tracking-tight block mt-0.5 leading-none truncate">
                {c.value}
              </span>
              {c.subtitle && (
                <span className="text-[10.5px] sm:text-[11px] text-text-secondary mt-1 block truncate font-medium">
                  {c.subtitle}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
