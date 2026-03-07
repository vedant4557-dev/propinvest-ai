"use client";

import { useMemo } from "react";
import { calculateLiquidity } from "@/lib/liquidityEngine";
import { formatINR } from "@/lib/format";

interface Props {
  city: string;
  propertyPrice: number;
}

export function LiquidityScoreCard({ city, propertyPrice }: Props) {
  const result = useMemo(
    () => calculateLiquidity(city, propertyPrice),
    [city, propertyPrice]
  );

  const colorStyles = {
    green:  {
      badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      bar: "bg-emerald-500",
      dot: "bg-emerald-500",
    },
    yellow: {
      badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      bar: "bg-amber-500",
      dot: "bg-amber-500",
    },
    red:    {
      badge: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      bar: "bg-rose-500",
      dot: "bg-rose-500",
    },
  }[result.color];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
          💧 Liquidity Score
        </h3>
        <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${colorStyles.badge}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${colorStyles.dot}`} />
          {result.label}
        </div>
      </div>

      {/* Score display */}
      <div className="flex items-end gap-2 mb-3">
        <span className="text-5xl font-black text-slate-800 dark:text-slate-100">
          {result.score}
        </span>
        <span className="text-slate-400 text-lg mb-1">/10</span>
      </div>

      {/* Score bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-4">
        <div
          className={`h-2.5 rounded-full transition-all ${colorStyles.bar}`}
          style={{ width: `${result.score * 10}%` }}
        />
      </div>

      {/* Factor breakdown */}
      <div className="space-y-2 mb-3">
        {result.factors.map((f) => (
          <div key={f.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">{f.label}</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{f.score}/10</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${colorStyles.bar}`}
                style={{ width: `${f.score * 10}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{f.note}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
        {result.insight}
      </p>
    </div>
  );
}
