"use client";

import type { SensitivityResult } from "@/types/investment";
import { formatPercent } from "@/lib/format";

interface SensitivityTableProps {
  data: SensitivityResult;
}

export function SensitivityTable({ data }: SensitivityTableProps) {
  const rows = [
    {
      param: "Interest Rate",
      minus: data.interest_rate_impact.minus_1_pct,
      base: data.interest_rate_impact.base,
      plus: data.interest_rate_impact.plus_1_pct,
      minusLabel: "-1%",
      plusLabel: "+1%",
    },
    {
      param: "Appreciation",
      minus: data.appreciation_impact.minus_2_pct,
      base: data.appreciation_impact.base,
      plus: data.appreciation_impact.plus_2_pct,
      minusLabel: "-2%",
      plusLabel: "+2%",
    },
    {
      param: "Rent",
      minus: data.rent_impact.minus_10_pct,
      base: data.rent_impact.base,
      plus: data.rent_impact.plus_10_pct,
      minusLabel: "-10%",
      plusLabel: "+10%",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Sensitivity Analysis
      </h3>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        IRR impact when key parameters change
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-600">
              <th className="py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                Parameter
              </th>
              <th className="py-2 text-right font-medium text-slate-700 dark:text-slate-300">
                Down
              </th>
              <th className="py-2 text-right font-medium text-slate-700 dark:text-slate-300">
                Base
              </th>
              <th className="py-2 text-right font-medium text-slate-700 dark:text-slate-300">
                Up
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.param}
                className="border-b border-slate-100 dark:border-slate-700"
              >
                <td className="py-2 text-slate-700 dark:text-slate-300">
                  {row.param}
                </td>
                <td
                  className={`py-2 text-right ${
                    row.minus < row.base
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatPercent(row.minus)} ({row.minusLabel})
                </td>
                <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-100">
                  {formatPercent(row.base)}
                </td>
                <td
                  className={`py-2 text-right ${
                    row.plus > row.base
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatPercent(row.plus)} ({row.plusLabel})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
