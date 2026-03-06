"use client";

import type { MonteCarloResult } from "@/types/investment";
import { formatPercent } from "@/lib/format";

interface MonteCarloCardProps {
  data: MonteCarloResult;
}

export function MonteCarloCard({ data }: MonteCarloCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Monte Carlo Simulation
      </h3>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        {data.scenario_count} scenarios of appreciation and rental growth
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">Expected IRR</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatPercent(data.expected_irr)}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
          <p className="text-xs text-slate-500 dark:text-slate-400">Worst Case (5th %ile)</p>
          <p className="text-lg font-bold text-amber-800 dark:text-amber-300">
            {formatPercent(data.worst_case_irr)}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
          <p className="text-xs text-slate-500 dark:text-slate-400">Best Case (95th %ile)</p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
            {formatPercent(data.best_case_irr)}
          </p>
        </div>
        <div className="rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
          <p className="text-xs text-slate-500 dark:text-slate-400">Prob. Beat 7% FD</p>
          <p className="text-lg font-bold text-primary-800 dark:text-primary-300">
            {data.probability_beating_fd}%
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <div>
          <span className="text-sm text-slate-600 dark:text-slate-400">5% VaR: </span>
          <span
            className="font-medium"
            title="Value at Risk: 5th percentile IRR (downside)"
          >
            {formatPercent(data.var_5_percent ?? data.worst_case_irr)}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Negative cash flow:{" "}
          <span className="font-medium text-rose-600 dark:text-rose-400">
            {data.probability_negative_cashflow}%
          </span>
        </p>
      </div>
    </div>
  );
}
