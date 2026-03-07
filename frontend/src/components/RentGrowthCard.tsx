"use client";

import { useMemo } from "react";
import { calculateRentGrowth } from "@/lib/rentGrowthEngine";
import { formatINR, formatPercent } from "@/lib/format";
import type { InvestmentInput } from "@/types/investment";
import type { InvestmentMetrics } from "@/types/investment";

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function RentGrowthCard({ inputs, metrics }: Props) {
  const rentGrowthRate = (inputs as any).rent_growth_rate ?? 0;

  const result = useMemo(() => {
    const effectiveDown =
      inputs.down_payment +
      inputs.property_purchase_price * (inputs.stamp_duty_percent / 100) +
      inputs.property_purchase_price * (inputs.registration_cost_percent / 100);

    return calculateRentGrowth({
      baseMonthlyRent: inputs.expected_monthly_rent,
      rentGrowthRate,
      holdingPeriodYears: inputs.holding_period_years,
      vacancyRate: inputs.vacancy_rate,
      annualEMI: metrics.emi * 12,
      annualMaintenance: inputs.annual_maintenance_cost,
      effectiveDown,
      propertyPrice: inputs.property_purchase_price,
      appreciation: inputs.expected_annual_appreciation,
      loanInterestRate: inputs.loan_interest_rate,
      loanTenureYears: inputs.loan_tenure_years,
      loanAmount: metrics.loan_amount,
    });
  }, [inputs, metrics, rentGrowthRate]);

  if (rentGrowthRate === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">📈 Rent Growth Simulation</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set a <strong>Rent Growth (%/yr)</strong> in the Rental section to see projected rent escalation and IRR uplift.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">📈 Rent Growth Simulation</h3>
        <span className="text-xs bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400 px-2.5 py-1 rounded-full font-medium">
          +{rentGrowthRate}%/yr growth
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Rent compounds at {rentGrowthRate}%/yr. Exit rent: <strong>{formatINR(result.rentAtExit)}/mo</strong>
      </p>

      {/* IRR uplift banner */}
      <div className={`rounded-xl p-3 mb-4 flex items-center justify-between ${
        result.irrUplift > 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-50 dark:bg-slate-700/30"
      }`}>
        <div>
          <p className="text-xs text-slate-500">Base IRR (flat rent)</p>
          <p className="font-bold text-slate-700 dark:text-slate-200">{formatPercent(result.baseIRR)}</p>
        </div>
        <div className="text-xl text-slate-300 dark:text-slate-600">→</div>
        <div>
          <p className="text-xs text-slate-500">Growth IRR</p>
          <p className={`font-bold ${result.irrUplift > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700"}`}>
            {formatPercent(result.growthIRR)}
          </p>
        </div>
        <div className={`text-sm font-bold px-2.5 py-1 rounded-full ${
          result.irrUplift > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500"
        }`}>
          {result.irrUplift > 0 ? "+" : ""}{result.irrUplift.toFixed(1)}pp
        </div>
      </div>

      {/* Year-by-year rent table (first 5 years) */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="pb-1.5 text-left text-slate-500">Year</th>
              <th className="pb-1.5 text-right text-slate-500">Monthly Rent</th>
              <th className="pb-1.5 text-right text-slate-500">Annual CF</th>
            </tr>
          </thead>
          <tbody>
            {result.projectedYears.slice(0, 5).map((yr) => (
              <tr key={yr.year} className="border-b border-slate-50 dark:border-slate-700/40">
                <td className="py-1.5 text-slate-600 dark:text-slate-300 font-medium">Yr {yr.year}</td>
                <td className="py-1.5 text-right text-slate-700 dark:text-slate-200">{formatINR(yr.monthlyRent)}</td>
                <td className={`py-1.5 text-right font-medium ${yr.annualCashFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatINR(yr.annualCashFlow)}
                </td>
              </tr>
            ))}
            {result.projectedYears.length > 5 && (
              <tr>
                <td colSpan={3} className="pt-1 text-center text-xs text-slate-400">
                  …{result.projectedYears.length - 5} more years
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Total rental income over {inputs.holding_period_years} yrs: <strong>{formatINR(result.totalRentalIncome)}</strong>
      </div>
    </div>
  );
}
