"use client";

import type { RiskAssessment } from "@/types/investment";

interface RiskBadgeProps {
  risk: RiskAssessment;
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  const variant =
    risk.label === "Low Risk"
      ? "emerald"
      : risk.label === "Moderate Risk"
        ? "amber"
        : "rose";

  const styles = {
    emerald:
      "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30 dark:bg-accent-emerald/20",
    amber:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    rose:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        styles[variant as keyof typeof styles]
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{risk.label}</span>
        <span className="rounded-full bg-white/80 px-3 py-0.5 text-sm font-bold dark:bg-black/20">
          {risk.total_score != null ? `${risk.total_score}/100` : `${risk.score}/10`}
        </span>
      </div>
      {risk.breakdown && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
          {Object.entries(risk.breakdown).map(([k, v]) => (
            <div key={k} className="rounded bg-black/5 px-2 py-1 dark:bg-white/5">
              <span className="capitalize">{k.replace(/_score$/, "").replace(/_/g, " ")}</span>: {v}
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-sm opacity-90">{risk.explanation}</p>
    </div>
  );
}
