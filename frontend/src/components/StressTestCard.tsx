"use client";

import { formatPercent } from "@/lib/format";
import type { StressTestResult } from "@/types/investment";

export function StressTestCard({ data }: { data: StressTestResult }) {
  const scenarios = [
    { label: "Rate +2%",       value: data.interest_shock_irr,    desc: "Interest shock" },
    { label: "Apprec = 0%",    value: data.appreciation_zero_irr, desc: "No appreciation" },
    { label: "Rent -15%",      value: data.rent_drop_irr,         desc: "Rent drop" },
    { label: "Vacancy 20%",    value: data.high_vacancy_irr,      desc: "High vacancy" },
    { label: "Worst Case",     value: data.worst_case_irr,        desc: "All combined" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">Stress Test</h3>
      <p className="mb-4 text-xs text-slate-500">IRR under adverse scenarios</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
          <p className="text-xs text-slate-500">Base Case</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatPercent(data.base_irr)}</p>
        </div>
        {scenarios.map((s) => (
          <div
            key={s.label}
            className={`rounded-lg p-3 ${
              s.value < 0 ? "bg-rose-100 dark:bg-rose-900/30" :
              s.value < 7 ? "bg-amber-50 dark:bg-amber-900/20" :
              "bg-emerald-50 dark:bg-emerald-900/20"
            }`}
          >
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{s.label}</p>
            <p className="text-xs text-slate-400 mb-1">{s.desc}</p>
            <p className={`text-lg font-bold ${
              s.value < 0 ? "text-rose-700 dark:text-rose-400" :
              s.value < 7 ? "text-amber-700 dark:text-amber-400" :
              "text-emerald-700 dark:text-emerald-400"
            }`}>
              {formatPercent(s.value)}
            </p>
            <p className="text-xs text-slate-400">
              Δ {s.value - data.base_irr >= 0 ? "+" : ""}{(s.value - data.base_irr).toFixed(1)}pp
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
