"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatINR } from "@/lib/format";
import type { DealAnalysis } from "@/types/investment";

interface FairValueChartProps {
  deal: DealAnalysis;
  askingPrice: number;
}

export function FairValueChart({ deal, askingPrice }: FairValueChartProps) {
  const { low, high } = deal.fair_price_range;
  const inRange = askingPrice >= low && askingPrice <= high;

  const data = [
    { name: "Fair Low", value: low, fill: "#10b981" },
    { name: "Fair High", value: high, fill: "#10b981" },
    { name: "Asking", value: askingPrice, fill: inRange ? "#0ea5e9" : "#f43f5e" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Fair Value Comparison
      </h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20 }}>
            <XAxis type="number" tickFormatter={(v) => formatINR(v)} stroke="#94a3b8" />
            <YAxis type="category" dataKey="name" width={55} stroke="#94a3b8" />
            <Tooltip
              formatter={(v: number) => [formatINR(v), ""]}
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Fair range: {formatINR(low)} – {formatINR(high)}
      </p>
    </div>
  );
}
