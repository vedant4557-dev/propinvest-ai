"use client";

import { useMemo } from "react";
import type { InvestmentMetrics, DealAnalysis } from "@/types/investment";

interface Props {
  metrics: InvestmentMetrics;
  dealAnalysis?: DealAnalysis | null;
}

interface ScoreItem {
  label: string;
  score: number;
  weight: number;
  color: string;
  detail: string;
}

function computeEnhancedScore(metrics: InvestmentMetrics): {
  total: number;
  grade: "A" | "B" | "C" | "D";
  items: ScoreItem[];
} {
  const scoreIRR = (): number => {
    if (metrics.irr >= 15) return 20;
    if (metrics.irr >= 12) return 16;
    if (metrics.irr >= 10) return 12;
    if (metrics.irr >= 8)  return 8;
    if (metrics.irr >= 5)  return 4;
    return 0;
  };

  const scoreCashFlow = (): number => {
    const cf = metrics.monthly_cash_flow;
    if (cf >= 10000) return 20;
    if (cf >= 5000)  return 16;
    if (cf >= 0)     return 10;
    if (cf >= -5000) return 4;
    return 0;
  };

  const scoreYield = (): number => {
    const y = metrics.net_rental_yield;
    if (y >= 5)   return 20;
    if (y >= 4)   return 16;
    if (y >= 3)   return 12;
    if (y >= 2.5) return 8;
    if (y >= 2)   return 4;
    return 0;
  };

  const scoreDSCR = (): number => {
    const d = metrics.dscr;
    if (d >= 1.5)  return 20;
    if (d >= 1.25) return 16;
    if (d >= 1.1)  return 12;
    if (d >= 1.0)  return 6;
    return 0;
  };

  const scoreLTV = (): number => {
    const ltv = metrics.ltv_ratio;
    if (ltv <= 50)  return 20;
    if (ltv <= 60)  return 16;
    if (ltv <= 70)  return 12;
    if (ltv <= 80)  return 8;
    if (ltv <= 85)  return 4;
    return 0;
  };

  const irrScore = scoreIRR();
  const cfScore = scoreCashFlow();
  const yldScore = scoreYield();
  const dscrScore = scoreDSCR();
  const ltvScore = scoreLTV();

  const total = irrScore + cfScore + yldScore + dscrScore + ltvScore;
  const grade: "A" | "B" | "C" | "D" = total >= 80 ? "A" : total >= 60 ? "B" : total >= 40 ? "C" : "D";

  const items: ScoreItem[] = [
    {
      label: "IRR",
      score: irrScore,
      weight: 20,
      color: irrScore >= 16 ? "#10b981" : irrScore >= 8 ? "#f59e0b" : "#ef4444",
      detail: `${metrics.irr.toFixed(1)}% IRR`,
    },
    {
      label: "Cash Flow",
      score: cfScore,
      weight: 20,
      color: cfScore >= 16 ? "#10b981" : cfScore >= 8 ? "#f59e0b" : "#ef4444",
      detail: `₹${(metrics.monthly_cash_flow / 1000).toFixed(0)}K/mo`,
    },
    {
      label: "Rental Yield",
      score: yldScore,
      weight: 20,
      color: yldScore >= 16 ? "#10b981" : yldScore >= 8 ? "#f59e0b" : "#ef4444",
      detail: `${metrics.net_rental_yield.toFixed(1)}% net yield`,
    },
    {
      label: "DSCR",
      score: dscrScore,
      weight: 20,
      color: dscrScore >= 16 ? "#10b981" : dscrScore >= 8 ? "#f59e0b" : "#ef4444",
      detail: `${metrics.dscr.toFixed(2)}x coverage`,
    },
    {
      label: "LTV Ratio",
      score: ltvScore,
      weight: 20,
      color: ltvScore >= 16 ? "#10b981" : ltvScore >= 8 ? "#f59e0b" : "#ef4444",
      detail: `${metrics.ltv_ratio.toFixed(0)}% LTV`,
    },
  ];

  return { total, grade, items };
}

export function EnhancedDealScore({ metrics, dealAnalysis }: Props) {
  const enhanced = useMemo(() => computeEnhancedScore(metrics), [metrics]);

  const gradeConfig = {
    A: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", label: "Excellent Deal" },
    B: { color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-900/20", label: "Good Deal" },
    C: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Average Deal" },
    D: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", label: "Poor Deal" },
  }[enhanced.grade];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
          🏆 Deal Quality Score
        </h3>
        <div className={`rounded-full px-3 py-1 text-sm font-bold ${gradeConfig.color} ${gradeConfig.bg}`}>
          Grade {enhanced.grade} — {gradeConfig.label}
        </div>
      </div>

      {/* Big score */}
      <div className="flex items-end gap-2 mb-4">
        <span className="text-6xl font-black text-slate-800 dark:text-slate-100">{enhanced.total}</span>
        <span className="text-slate-400 text-xl mb-1">/100</span>
      </div>

      {/* Score bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-5">
        <div
          className="h-3 rounded-full transition-all"
          style={{
            width: `${enhanced.total}%`,
            background: enhanced.grade === "A" ? "#10b981"
              : enhanced.grade === "B" ? "#0ea5e9"
              : enhanced.grade === "C" ? "#f59e0b"
              : "#ef4444",
          }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        {enhanced.items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{item.detail}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {item.score}/{item.weight}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${(item.score / item.weight) * 100}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Backend score if available */}
      {dealAnalysis && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AI Deal Score (backend): <span className="font-semibold text-slate-700 dark:text-slate-300">{dealAnalysis.deal_score}/100 — {dealAnalysis.rating}</span>
          </p>
        </div>
      )}
    </div>
  );
}
