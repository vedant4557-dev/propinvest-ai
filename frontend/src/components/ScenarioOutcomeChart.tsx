"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { MonteCarloResult } from "@/types/investment";

interface ScenarioOutcomeChartProps {
  data: MonteCarloResult;
}

export function ScenarioOutcomeChart({ data }: ScenarioOutcomeChartProps) {
  const belowFd = 100 - data.probability_beating_fd;
  const chartData = [
    { name: "IRR > 7% FD", value: data.probability_beating_fd, fill: "#10b981" },
    { name: "IRR ≤ 7% FD", value: belowFd, fill: "#f43f5e" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Scenario Outcomes
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#94a3b8" />
            <YAxis type="category" dataKey="name" width={90} stroke="#94a3b8" />
            <Tooltip
              formatter={(v: number) => [`${v.toFixed(1)}%`, "Share"]}
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
