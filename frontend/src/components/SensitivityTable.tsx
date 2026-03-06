"use client";

import type { SensitivityResult } from "@/types/investment";
import { formatPercent } from "@/lib/format";

export function SensitivityTable({ data }: { data: SensitivityResult }) {
  const rows = [
    { param: "Interest Rate", impact: data.interest_rate_impact },
    { param: "Appreciation",  impact: data.appreciation_impact },
    { param: "Rent",          impact: data.rent_impact },
    { param: "Vacancy",       impact: data.vacancy_impact },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">Sensitivity Analysis</h3>
      <p className="mb-4 text-xs text-slate-500">IRR impact when key parameters change</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-600 text-xs text-slate-500 uppercase tracking-wide">
              <th className="py-2 text-left">Parameter</th>
              <th className="py-2 text-right">Downside</th>
              <th className="py-2 text-right">Base</th>
              <th className="py-2 text-right">Upside</th>
              <th className="py-2 text-right">Range</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ param, impact }) => {
              const range = impact.plus - impact.minus;
              return (
                <tr key={param} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2.5 font-medium text-slate-700 dark:text-slate-300">{param}</td>
                  <td className={`py-2.5 text-right ${impact.minus < impact.base ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {formatPercent(impact.minus)}
                    <span className="ml-1 text-xs text-slate-400">({impact.minus_label})</span>
                  </td>
                  <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatPercent(impact.base)}
                  </td>
                  <td className={`py-2.5 text-right ${impact.plus > impact.base ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatPercent(impact.plus)}
                    <span className="ml-1 text-xs text-slate-400">({impact.plus_label})</span>
                  </td>
                  <td className="py-2.5 text-right text-slate-500">
                    {formatPercent(range, 1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
