"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { compareToBenchmarks } from "@/lib/benchmarkEngine";

interface Props {
  propertyIRR: number;
}

export function BenchmarkComparisonCard({ propertyIRR }: Props) {
  const comparison = useMemo(() => compareToBenchmarks(propertyIRR), [propertyIRR]);

  const beaten = comparison.beatenCount;
  const total = comparison.totalBenchmarks;

  const verdictColor =
    beaten === total ? "text-emerald-600 dark:text-emerald-400" :
    beaten >= 4 ? "text-sky-600 dark:text-sky-400" :
    beaten >= 2 ? "text-amber-600 dark:text-amber-400" :
    "text-rose-600 dark:text-rose-400";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
          📊 Investment Comparison
        </h3>
        <span className="text-xs text-slate-500">vs. market alternatives</span>
      </div>

      <p className={`text-sm font-medium mb-4 ${verdictColor}`}>
        Beats {beaten}/{total} benchmarks — {comparison.verdict}
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={comparison.chartData} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, Math.max(propertyIRR + 3, 15)]}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Expected Return"]}
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            y={propertyIRR}
            stroke="#10b981"
            strokeDasharray="4 4"
            label={{ value: "Your IRR", position: "insideTopRight", fill: "#10b981", fontSize: 10 }}
          />
          <Bar dataKey="return" radius={[4, 4, 0, 0]}>
            {comparison.chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3">
        {comparison.benchmarks.map((b) => (
          <div key={b.name} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: b.color }} />
            <span>{b.name}: {b.expectedReturn}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
