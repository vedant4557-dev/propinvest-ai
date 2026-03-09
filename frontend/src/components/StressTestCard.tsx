"use client";

import { formatPercent } from "@/lib/format";
import { Tooltip } from "@/lib/glossary";
import type { StressTestResult } from "@/types/investment";

export function StressTestCard({ data }: { data: StressTestResult }) {
  const scenarios = [
    { label: "Rate +2%",    value: data.interest_shock_irr,    desc: "Interest rate shock",   tip: "What happens to your IRR if your floating home loan rate rises by 2 percentage points — a realistic RBI tightening cycle." },
    { label: "Apprec = 0%", value: data.appreciation_zero_irr, desc: "No appreciation",       tip: "Your IRR if the property price stays flat (zero appreciation) for the entire holding period. Tests income-only return." },
    { label: "Rent −15%",   value: data.rent_drop_irr,         desc: "Rent falls 15%",        tip: "Your IRR if market rents fall 15% — a realistic scenario in an oversupplied micromarket or during economic stress." },
    { label: "Vacancy 20%", value: data.high_vacancy_irr,      desc: "High vacancy",          tip: "Your IRR if the property is vacant 20% of the time — significantly above the Indian residential average of 5–10%." },
    { label: "Worst Case",  value: data.worst_case_irr,        desc: "All shocks combined",   tip: "The combined scenario: interest rate up, zero appreciation, rent down, and high vacancy simultaneously. The true floor." },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Stress Test</h3>
        <Tooltip content="Shows how your IRR changes when one (or all) things go wrong. A resilient deal maintains positive IRR even under stress. If worst-case IRR is deeply negative, the deal depends heavily on everything going right." maxWidth={300} />
      </div>
      <p className="mb-4 text-xs text-slate-500">IRR under adverse scenarios — vs base case of {formatPercent(data.base_irr)}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
          <p className="text-xs text-slate-500 flex items-center gap-0.5">
            Base Case
            <Tooltip content="Your IRR under the assumptions you entered — no stress applied." />
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatPercent(data.base_irr)}</p>
        </div>
        {scenarios.map((s) => (
          <div key={s.label} className={`rounded-lg p-3 ${
            s.value < 0 ? "bg-rose-100 dark:bg-rose-900/30" :
            s.value < 7 ? "bg-amber-50 dark:bg-amber-900/20" :
                          "bg-emerald-50 dark:bg-emerald-900/20"
          }`}>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-0.5">
              {s.label}
              <Tooltip content={s.tip} />
            </p>
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
              <Tooltip content="pp = percentage points. A change of −3pp means IRR fell by 3 percentage points, e.g. from 12% to 9%." />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
