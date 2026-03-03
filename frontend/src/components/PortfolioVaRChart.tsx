"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatPercent } from "@/lib/format";
import { CorrelationTooltip } from "./CorrelationTooltip";
import type { PortfolioMonteCarloResult } from "@/types/investment";

interface PortfolioVaRChartProps {
  data: PortfolioMonteCarloResult;
}

export function PortfolioVaRChart({ data }: PortfolioVaRChartProps) {
  const chartData = [
    { name: "Expected", value: data.portfolio_expected_irr, fill: "#0ea5e9" },
    { name: "5% VaR", value: data.portfolio_var_5_percent, fill: "#f59e0b" },
    { name: "Best Case", value: data.portfolio_best_case, fill: "#10b981" },
  ];

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
      title="Portfolio Monte Carlo uses correlated appreciation (ρ=0.6) between properties"
    >
      <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Portfolio IRR Distribution
        <CorrelationTooltip />
      </h3>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Correlated appreciation (ρ=0.6) — properties move together
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis
              tickFormatter={(v) => formatPercent(v)}
              stroke="#94a3b8"
            />
            <Tooltip
              formatter={(v: number) => [formatPercent(v), "IRR"]}
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
