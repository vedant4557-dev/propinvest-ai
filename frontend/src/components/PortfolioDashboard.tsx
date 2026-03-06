"use client";

import { formatINR, formatPercent, formatMultiple } from "@/lib/format";
import type { AnalyzePortfolioResponse } from "@/types/investment";
import { DiversificationGauge } from "./DiversificationGauge";
import { RatingBadge } from "./RatingBadge";
import { PortfolioVaRChart } from "./PortfolioVaRChart";

export function PortfolioDashboard({ data }: { data: AnalyzePortfolioResponse }) {
  const pm = data.portfolio_metrics;
  const riskLabel = data.portfolio_risk_score <= 35 ? "Low" : data.portfolio_risk_score <= 65 ? "Moderate" : "High";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Portfolio Overview</h2>
        <RatingBadge rating={pm.rating} size="lg" />
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Invested",   value: formatINR(pm.total_invested_capital) },
          { label: "Weighted IRR",     value: formatPercent(pm.weighted_irr), highlight: pm.weighted_irr >= 7 },
          { label: "Portfolio CF",     value: formatINR(pm.portfolio_cash_flow), highlight: pm.portfolio_cash_flow >= 0 },
          { label: "Avg DSCR",         value: formatMultiple(pm.average_dscr), highlight: pm.average_dscr >= 1 },
          { label: "Total Equity",     value: formatINR(pm.total_equity) },
          { label: "Weighted Yield",   value: formatPercent(pm.weighted_yield) },
          { label: "Portfolio NPV",    value: formatINR(pm.portfolio_npv), highlight: pm.portfolio_npv >= 0 },
          { label: "Post-Tax IRR",     value: formatPercent(pm.portfolio_post_tax_irr), highlight: pm.portfolio_post_tax_irr >= 7 },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-base font-bold mt-0.5 ${highlight === true ? "text-emerald-600 dark:text-emerald-400" : highlight === false ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Gauges + Risk */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <DiversificationGauge value={data.diversification_score} />
        <div className="text-center">
          <p className="text-xs text-slate-500">Portfolio Risk</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{data.portfolio_risk_score}/100</p>
          <p className="text-xs text-slate-500">{riskLabel}</p>
        </div>
        {data.portfolio_monte_carlo && (
          <div className="text-center">
            <p className="text-xs text-slate-500">VaR (5%)</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatPercent(data.portfolio_monte_carlo.portfolio_var_5_percent)}</p>
            <p className="text-xs text-slate-500">Portfolio IRR</p>
          </div>
        )}
      </div>

      {/* Monte Carlo chart */}
      {data.portfolio_monte_carlo && (
        <PortfolioVaRChart data={data.portfolio_monte_carlo} />
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
          <h3 className="mb-2 text-sm font-semibold text-primary-800 dark:text-primary-200">Portfolio Recommendations</h3>
          <ul className="space-y-1">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-1 text-primary-500 shrink-0">→</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Individual property summary */}
      <div>
        <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">
          Individual Properties
          <span className="ml-2 text-xs font-normal text-slate-500">
            Best: #{data.best_property_index + 1} · Worst: #{data.worst_property_index + 1}
          </span>
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.individual_results.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 dark:bg-slate-800 ${
                i === data.best_property_index ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/10" :
                i === data.worst_property_index ? "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/10" :
                "border-slate-200 bg-white dark:border-slate-700"
              }`}
            >
              <p className="font-medium text-sm text-slate-800 dark:text-slate-200">
                Property {i + 1}
                {i === data.best_property_index && <span className="ml-2 text-xs text-emerald-600">★ Best</span>}
                {i === data.worst_property_index && <span className="ml-2 text-xs text-rose-600">↓ Worst</span>}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">IRR</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{formatPercent(r.metrics.irr)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Yield</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{formatPercent(r.metrics.net_rental_yield)}</p>
                </div>
                <div>
                  <p className="text-slate-400">DSCR</p>
                  <p className={`font-semibold ${r.metrics.dscr >= 1 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatMultiple(r.metrics.dscr)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
