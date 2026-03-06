"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatINR } from "@/lib/format";
import type { CashFlowYear } from "@/types/investment";

interface CashFlowTimelineProps {
  data: CashFlowYear[];
}

export function CashFlowTimeline({ data }: CashFlowTimelineProps) {
  const [view, setView] = useState<"chart" | "table">("chart");

  const chartData = data.map((d) => ({
    year: `Y${d.year}`,
    "Net CF": Math.round(d.net_cash_flow),
    "Cumulative CF": Math.round(d.cumulative_cash_flow),
    "Property Value": Math.round(d.property_value),
    "Equity": Math.round(d.equity),
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Year-by-Year Analysis</h3>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setView("chart")}
            className={`px-3 py-1 text-xs font-medium ${view === "chart" ? "bg-primary-600 text-white" : "text-slate-600 dark:text-slate-400"}`}
          >Chart</button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1 text-xs font-medium ${view === "table" ? "bg-primary-600 text-white" : "text-slate-600 dark:text-slate-400"}`}
          >Table</button>
        </div>
      </div>

      {view === "chart" ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 5, right: 5, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `₹${(v / 100_000).toFixed(0)}L`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(v: number, name: string) => [formatINR(v), name]}
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Net CF" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Cumulative CF" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Equity" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-primary-500" /> Annual Net CF</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-emerald-500" /> Cumulative CF</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-amber-500" /> Equity Built</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                {["Year", "Rent", "EMI", "Net CF", "Cumulative", "Property Value", "Equity"].map((h) => (
                  <th key={h} className="py-2 pr-3 text-right first:text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.year} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-1.5 font-medium text-slate-700 dark:text-slate-300">Y{row.year}</td>
                  <td className="py-1.5 pr-3 text-right text-slate-600 dark:text-slate-400">{formatINR(row.rental_income)}</td>
                  <td className="py-1.5 pr-3 text-right text-rose-600 dark:text-rose-400">{formatINR(row.emi_paid)}</td>
                  <td className={`py-1.5 pr-3 text-right font-medium ${row.net_cash_flow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatINR(row.net_cash_flow)}
                  </td>
                  <td className={`py-1.5 pr-3 text-right ${row.cumulative_cash_flow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatINR(row.cumulative_cash_flow)}
                  </td>
                  <td className="py-1.5 pr-3 text-right text-slate-600 dark:text-slate-400">{formatINR(row.property_value)}</td>
                  <td className="py-1.5 text-right text-amber-600 dark:text-amber-400">{formatINR(row.equity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
