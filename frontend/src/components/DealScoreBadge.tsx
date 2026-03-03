"use client";

import type { DealAnalysis } from "@/types/investment";
import { RatingBadge } from "./RatingBadge";

interface DealScoreBadgeProps {
  deal: DealAnalysis;
}

export function DealScoreBadge({ deal }: DealScoreBadgeProps) {
  const variant =
    deal.label === "Excellent"
      ? "emerald"
      : deal.label === "Good"
        ? "primary"
        : deal.label === "Average"
          ? "amber"
          : "rose";

  const styles = {
    emerald:
      "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30 dark:bg-accent-emerald/20",
    primary: "bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700",
    amber:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    rose: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        styles[variant as keyof typeof styles]
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">Deal Quality</span>
        <span className="rounded-full bg-white/80 px-3 py-0.5 text-sm font-bold dark:bg-black/20">
          {deal.deal_score}/100
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-sm font-medium">{deal.label}</p>
        {deal.rating && <RatingBadge rating={deal.rating} size="sm" />}
      </div>
      {deal.is_overpriced && (
        <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
          Asking price exceeds market value
        </p>
      )}
    </div>
  );
}
