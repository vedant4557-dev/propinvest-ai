"use client";

import type { TaxAnalysis } from "@/types/investment";
import { formatINR, formatPercent } from "@/lib/format";

export function TaxAnalysisCard({ data }: { data: TaxAnalysis }) {
  const items = [
    { label: "Stamp Duty Paid",           value: formatINR(data.stamp_duty_paid),           color: "amber" },
    { label: "Registration Cost",          value: formatINR(data.registration_cost_paid),    color: "amber" },
    { label: "Total Acquisition Tax",      value: formatINR(data.total_acquisition_tax),     color: "rose" },
    { label: "Sec 24(b) Tax Savings",      value: formatINR(data.tax_savings_from_interest), color: "emerald" },
    { label: "Rental Tax Liability",       value: formatINR(data.rental_tax_liability),      color: "rose" },
    { label: "Net Tax Benefit/Year",       value: formatINR(data.net_tax_benefit),           color: data.net_tax_benefit >= 0 ? "emerald" : "rose" },
    { label: "LTCG (20% + indexation)",    value: formatINR(data.capital_gains_tax),         color: "amber" },
    { label: "Post-Tax IRR",               value: formatPercent(data.post_tax_irr),          color: "primary" },
  ];

  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
    rose:    "bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300",
    amber:   "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
    primary: "bg-primary-50 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">India Tax Analysis</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg p-3 ${colors[color]}`}>
            <p className="text-xs opacity-80">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span>Indexation factor: {data.indexation_factor.toFixed(2)}x (6% inflation)</span>
        <span>Indexed cost: {formatINR(data.indexed_cost)}</span>
      </div>
    </div>
  );
}
