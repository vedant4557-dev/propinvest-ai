"use client";

import type { TaxAnalysis } from "@/types/investment";
import { formatINR, formatPercent } from "@/lib/format";

interface TaxAnalysisCardProps {
  data: TaxAnalysis;
}

export function TaxAnalysisCard({ data }: TaxAnalysisCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        India Tax Analysis
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Section 24(b) Tax Savings (interest deduction)
          </p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
            {formatINR(data.tax_savings_from_interest)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Rental Income Tax Liability
          </p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-300">
            {formatINR(data.rental_tax_liability)}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            LTCG Tax (20% with indexation)
          </p>
          <p className="text-lg font-bold text-amber-800 dark:text-amber-300">
            {formatINR(data.capital_gains_tax)}
          </p>
        </div>
        <div className="rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
          <p className="text-xs text-slate-600 dark:text-slate-400">Post-tax IRR</p>
          <p className="text-lg font-bold text-primary-800 dark:text-primary-300">
            {formatPercent(data.post_tax_irr)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Indexation factor: {data.indexation_factor.toFixed(2)} (6% inflation)
      </p>
    </div>
  );
}
