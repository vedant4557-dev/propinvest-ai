"use client";

import { useMemo } from "react";
import { calculateExitOptimization } from "@/lib/exitOptimizationEngine";
import { formatINR } from "@/lib/format";
import type { InvestmentInput } from "@/types/investment";
import type { InvestmentMetrics } from "@/types/investment";

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function ExitOptimizationCard({ inputs, metrics }: Props) {
  const result = useMemo(() => {
    const effectiveDown =
      inputs.down_payment +
      inputs.property_purchase_price * (inputs.stamp_duty_percent / 100) +
      inputs.property_purchase_price * (inputs.registration_cost_percent / 100);

    return calculateExitOptimization({
      effectiveDown,
      propertyPrice: inputs.property_purchase_price,
      monthlyRent: inputs.expected_monthly_rent,
      vacancyRate: inputs.vacancy_rate,
      annualEMI: metrics.emi * 12,
      annualMaintenance: inputs.annual_maintenance_cost,
      appreciation: inputs.expected_annual_appreciation,
      loanInterestRate: inputs.loan_interest_rate,
      loanTenureYears: inputs.loan_tenure_years,
      loanAmount: metrics.loan_amount,
      maxYears: 20,
    });
  }, [inputs, metrics]);

  // Determine color for each year
  const getBarColor = (irr: number) =>
    irr >= 12 ? "bg-emerald-500" : irr >= 8 ? "bg-sky-500" : irr >= 4 ? "bg-amber-500" : "bg-rose-400";

  const maxIRR = Math.max(...result.years.filter((y) => y.year >= 2).map((y) => y.irr), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">🎯 Exit Timing Optimizer</h3>
        <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold">
          Best: Year {result.bestExitYear} ({result.optimalIRR.toFixed(1)}% IRR)
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        IRR by exit year — find the optimal holding period for maximum returns
      </p>

      {/* IRR by year bar chart */}
      <div className="space-y-1.5 mb-4">
        {result.years.filter((y) => y.year >= 2 && y.year % 2 === 0 || y.isOptimal).map((yr) => (
          <div key={yr.year} className="flex items-center gap-3">
            <span className={`text-xs w-12 text-right font-medium ${yr.isOptimal ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
              Yr {yr.year}{yr.isOptimal ? " ★" : ""}
            </span>
            <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-5 relative">
              <div
                className={`h-5 rounded-full ${getBarColor(yr.irr)} transition-all`}
                style={{ width: `${Math.max(3, (yr.irr / maxIRR) * 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center pl-2 text-xs font-bold text-white">
                {yr.irr.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs w-24 text-right text-slate-500 dark:text-slate-400">
              {formatINR(yr.futureValue)}
            </span>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2.5">
        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">{result.insight}</p>
        {result.holdLongerBenefit > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            Holding to optimal exit adds <strong>+{result.holdLongerBenefit.toFixed(1)}pp IRR</strong> vs current {inputs.holding_period_years}-yr plan.
          </p>
        )}
      </div>
    </div>
  );
}
