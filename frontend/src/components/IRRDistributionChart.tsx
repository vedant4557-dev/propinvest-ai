"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonteCarloResult } from "@/types/investment";

interface IRRDistributionChartProps {
  data: MonteCarloResult;
}

export function IRRDistributionChart({ data }: IRRDistributionChartProps) {
  // BUG FIX: guard against empty histogram (backend may omit it)
  if (!data.irr_histogram || data.irr_histogram.length === 0) return null;

  const chartData = data.irr_histogram.map((h) => ({
    // BUG FIX: removed incorrect `as number` casts — types are already typed correctly
    range: `${h.bin_start.toFixed(0)}%–${h.bin_end.toFixed(0)}%`,
    count: h.count,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
        IRR Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              opacity={0.3}
            />
            <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
