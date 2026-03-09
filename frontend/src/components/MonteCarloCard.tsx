"use client";

import type { MonteCarloResult } from "@/types/investment";
import { formatPercent } from "@/lib/format";
import { Tooltip } from "@/lib/glossary";

export function MonteCarloCard({ data }: { data: MonteCarloResult }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Monte Carlo Simulation</h3>
        <Tooltip content="Runs thousands of random scenarios (different appreciation rates, rent growth, vacancy) to show the full range of possible outcomes — not just one projection. Helps you understand best-case, worst-case, and most likely returns." position="right" maxWidth={300} />
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        {data.scenario_count.toLocaleString("en-IN")} scenarios simulated with random appreciation and rental growth
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
            Expected IRR
            <Tooltip content="The probability-weighted average IRR across all simulated scenarios. More reliable than a single-point projection." />
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatPercent(data.expected_irr)}</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
            Worst Case
            <Tooltip content="The 5th percentile IRR — in 95% of scenarios you'd do better than this. Think of it as your downside protection floor." />
          </p>
          <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{formatPercent(data.worst_case_irr)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">5th percentile</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
            Best Case
            <Tooltip content="The 95th percentile IRR — only 5% of scenarios produce better returns than this. Don't plan around this number." />
          </p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{formatPercent(data.best_case_irr)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">95th percentile</p>
        </div>
        <div className="rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
            Beats 7% FD
            <Tooltip content="The percentage of simulated scenarios where this investment outperforms a 7% fixed deposit. Higher = more confidence." />
          </p>
          <p className="text-lg font-bold text-primary-800 dark:text-primary-300">{data.probability_beating_fd}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">probability</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-1">
          <span className="text-sm text-slate-600 dark:text-slate-400">5% VaR:</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {formatPercent(data.var_5_percent ?? data.worst_case_irr)}
          </span>
          <Tooltip content="Value at Risk — the IRR you'd expect in the worst 5% of scenarios. If VaR is −2%, there is a 5% chance your IRR ends up worse than −2%." />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-slate-600 dark:text-slate-400">Negative cash flow:</span>
          <span className="font-medium text-rose-600 dark:text-rose-400">{data.probability_negative_cashflow}%</span>
          <Tooltip content="The percentage of simulated scenarios where your annual rent does not cover annual EMI + maintenance — meaning you'd need to fund a shortfall from savings." />
        </div>
      </div>
    </div>
  );
}
