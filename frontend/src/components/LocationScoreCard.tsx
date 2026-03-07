"use client";

import { useMemo } from "react";
import { calculateLocationScore } from "@/lib/locationScore";

interface Props {
  city: string;
  rentalYield: number;
  appreciation: number;
  dscr?: number;
  irr?: number;
}

export function LocationScoreCard({ city, rentalYield, appreciation, dscr, irr }: Props) {
  const result = useMemo(
    () => calculateLocationScore({ city, rentalYield, appreciation, dscr, irr }),
    [city, rentalYield, appreciation, dscr, irr]
  );

  const gradeColor = {
    A: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
    B: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-400",
    C: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
    D: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400",
  }[result.grade];

  const scoreBarWidth = `${(result.score / 10) * 100}%`;
  const scoreBarColor = result.score >= 8
    ? "bg-emerald-500"
    : result.score >= 6
    ? "bg-sky-500"
    : result.score >= 4
    ? "bg-amber-500"
    : "bg-rose-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
          🏙️ Location Score
        </h3>
        <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${gradeColor}`}>
          Grade {result.grade}
        </div>
      </div>

      {/* Score display */}
      <div className="flex items-end gap-3 mb-4">
        <span className="text-5xl font-black text-slate-800 dark:text-slate-100">
          {result.score}
        </span>
        <span className="text-slate-400 text-lg mb-1">/10</span>
        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{result.label}</span>
      </div>

      {/* Score bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all ${scoreBarColor}`}
          style={{ width: scoreBarWidth }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        {result.breakdown.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 w-32 shrink-0">
              {item.label}
              <span className="text-slate-300 dark:text-slate-600 ml-1">({item.weight}%)</span>
            </span>
            <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${scoreBarColor}`}
                style={{ width: `${(item.score / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">
              {item.score}/10
            </span>
          </div>
        ))}
      </div>

      {/* Insight */}
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
        {result.insight}
      </p>
    </div>
  );
}
