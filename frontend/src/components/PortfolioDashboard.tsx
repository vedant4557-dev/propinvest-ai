"use client";

import { formatINR, formatPercent } from "@/lib/format";
import { DiversificationGauge } from "./DiversificationGauge";
import { RatingBadge } from "./RatingBadge";
import { PortfolioVaRChart } from "./PortfolioVaRChart";
import type { PortfolioMetrics, AnalyzePortfolioResponse } from "@/types/investment";

interface PortfolioDashboardProps {
  data: AnalyzePortfolioResponse;
}

export function PortfolioDashboard({ data }: PortfolioDashboardProps) {
  const pm = data.portfolio_metrics;
  const riskLabel =
    data.portfolio_risk_score <= 35
      ? "Low"
      : data.portfolio_risk_score <= 65
        ? "Moderate"
        : "High";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Portfolio Overview
      </h2>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <DiversificationGauge value={data.diversification_score} />
            {pm.rating && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Rating</p>
                <RatingBadge rating={pm.rating} size="lg" />
              </div>
            )}
          </div>
          {data.portfolio_monte_carlo && (
            <div
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-600 dark:bg-slate-700/50"
              title="Correlated appreciation (ρ=0.6): property values move together in simulations"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Portfolio VaR (5%)
              </p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {formatPercent(data.portfolio_monte_carlo.portfolio_var_5_percent)}
              </p>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Portfolio Risk</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.portfolio_risk_score}/100
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{riskLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MetricCard label="Total Invested" value={formatINR(pm.total_invested_capital)} />
          <MetricCard label="Property Value" value={formatINR(pm.total_property_value)} />
          <MetricCard label="Total Loan" value={formatINR(pm.total_loan_amount)} />
          <MetricCard label="Weighted IRR" value={formatPercent(pm.weighted_irr)} highlight />
          <MetricCard label="Weighted ROI" value={formatPercent(pm.weighted_roi)} />
          <MetricCard
            label="Portfolio Cash Flow"
            value={formatINR(pm.portfolio_cash_flow)}
            highlight={pm.portfolio_cash_flow >= 0}
          />
        </div>
        {data.portfolio_monte_carlo && (
          <div className="mt-6">
            <PortfolioVaRChart data={data.portfolio_monte_carlo} />
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`text-lg font-bold ${
          highlight ? "text-accent-emerald dark:text-accent-emerald" : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
