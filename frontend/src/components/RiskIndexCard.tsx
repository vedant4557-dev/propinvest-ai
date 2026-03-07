"use client";

import { useMemo } from "react";
import { calculateRiskIndex } from "@/lib/riskIndexEngine";
import type { InvestmentInput } from "@/types/investment";
import type { InvestmentMetrics } from "@/types/investment";

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
  marketCycleStage?: string;
  supplyPressure?: string;
  liquidityScore?: number;
}

export function RiskIndexCard({ inputs, metrics, marketCycleStage = "Expansion", supplyPressure = "Neutral", liquidityScore = 6 }: Props) {
  const result = useMemo(() => calculateRiskIndex({
    dscr: metrics.dscr > 900 ? 999 : metrics.dscr,
    vacancyRate: inputs.vacancy_rate,
    liquidityScore,
    marketCycleStage,
    supplyPressure,
    ltv: metrics.ltv_ratio,
    irr: metrics.irr,
  }), [inputs, metrics, marketCycleStage, supplyPressure, liquidityScore]);

  const outerColors = {
    green:  "stroke-emerald-500",
    yellow: "stroke-amber-400",
    orange: "stroke-orange-500",
    red:    "stroke-rose-600",
  };
  const bgColors = {
    green:  "bg-emerald-50 dark:bg-emerald-900/20",
    yellow: "bg-amber-50 dark:bg-amber-900/20",
    orange: "bg-orange-50 dark:bg-orange-900/20",
    red:    "bg-rose-50 dark:bg-rose-900/20",
  };
  const textColors = {
    green:  "text-emerald-700 dark:text-emerald-400",
    yellow: "text-amber-700 dark:text-amber-400",
    orange: "text-orange-700 dark:text-orange-400",
    red:    "text-rose-700 dark:text-rose-400",
  };
  const statusDot = {
    good:    "bg-emerald-400",
    warning: "bg-amber-400",
    danger:  "bg-rose-500",
  };

  // Circular gauge values
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  // Risk index 1–10, fill the arc proportionally
  const fillFraction = result.riskIndex / 10;
  const strokeDash = circ * fillFraction;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">🛡️ Real Estate Risk Index</h3>

      <div className="flex items-center gap-6 mb-5">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
            <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="8"
              className="text-slate-100 dark:text-slate-700" />
            <circle cx="48" cy="48" r={radius} fill="none" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circ}`}
              className={outerColors[result.color]} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${textColors[result.color]}`}>{result.riskIndex.toFixed(1)}</span>
            <span className="text-[9px] text-slate-400 font-medium">/10</span>
          </div>
        </div>

        <div className="flex-1">
          <p className={`font-bold text-base ${textColors[result.color]}`}>{result.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.insight}</p>
          <div className={`mt-2 text-xs rounded-lg px-2.5 py-1.5 ${bgColors[result.color]} ${textColors[result.color]} font-medium`}>
            {result.recommendation}
          </div>
        </div>
      </div>

      {/* Component breakdown */}
      <div className="space-y-2">
        {result.components.map((c) => (
          <div key={c.name} className="flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusDot[c.status]}`} />
            <span className="text-xs text-slate-600 dark:text-slate-300 w-40 flex-shrink-0">
              {c.name}
              <span className="text-slate-400 ml-1">({c.weight}%)</span>
            </span>
            <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${c.score <= 3 ? "bg-emerald-400" : c.score <= 6 ? "bg-amber-400" : "bg-rose-500"}`}
                style={{ width: `${(c.score / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-20 text-right">{c.note}</span>
          </div>
        ))}
      </div>

      {/* Task 15: Improvement suggestions */}
      {result.improvements.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">💡 How to reduce risk:</p>
          {result.improvements.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-2">
              <span className="text-slate-400 flex-shrink-0 mt-0.5">→</span>
              <p className="text-xs text-slate-600 dark:text-slate-300">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
