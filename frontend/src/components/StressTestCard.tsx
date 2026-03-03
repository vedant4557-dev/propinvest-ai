"use client";

import { formatPercent } from "@/lib/format";
import type { StressTestResult } from "@/types/investment";

interface StressTestCardProps {
  data: StressTestResult;
}

export function StressTestCard({ data }: StressTestCardProps) {
  const scenarios = [
    {
      label: "Interest +2%",
      value: data.interest_shock_irr,
      desc: "Rate spike",
    },
    {
      label: "Appreciation 0%",
      value: data.appreciation_zero_irr,
      desc: "No growth",
    },
    {
      label: "Rent -15%",
      value: data.rent_drop_irr,
      desc: "Vacancy / cut",
    },
    {
      label: "Worst Case",
      value: data.worst_case_irr,
      desc: "All combined",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Stress Test
      </h3>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        IRR under adverse scenarios
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">Base</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatPercent(data.base_irr)}
          </p>
        </div>
        {scenarios.map((s) => (
          <div
            key={s.label}
            className={`rounded-lg p-3 ${
              s.value < 7
                ? "bg-rose-50 dark:bg-rose-900/20"
                : "bg-amber-50 dark:bg-amber-900/20"
            }`}
          >
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {s.label}
            </p>
            <p
              className={`text-lg font-bold ${
                s.value < 0
                  ? "text-rose-700 dark:text-rose-400"
                  : s.value < 7
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {formatPercent(s.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
