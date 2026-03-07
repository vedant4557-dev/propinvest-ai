"use client";

import { useMemo } from "react";
import { calculateLoanOptimization } from "@/lib/loanOptimizationEngine";
import { formatINR } from "@/lib/format";
import type { InvestmentInput } from "@/types/investment";
import type { InvestmentMetrics } from "@/types/investment";

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function LoanOptimizationCard({ inputs, metrics }: Props) {
  const result = useMemo(() => {
    const effectiveDown =
      inputs.down_payment +
      inputs.property_purchase_price * (inputs.stamp_duty_percent / 100) +
      inputs.property_purchase_price * (inputs.registration_cost_percent / 100);

    return calculateLoanOptimization({
      loanAmount: metrics.loan_amount,
      loanInterestRate: inputs.loan_interest_rate,
      effectiveAnnualRent: metrics.effective_annual_rent,
      annualMaintenance: inputs.annual_maintenance_cost,
      effectiveDown,
      appreciation: inputs.expected_annual_appreciation,
      holdingPeriodYears: inputs.holding_period_years,
      propertyPrice: inputs.property_purchase_price,
      tenures: [10, 15, 20],
    });
  }, [inputs, metrics]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">🏦 Loan Tenure Optimizer</h3>
        <span className="text-xs bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium">
          Recommended: {result.recommendedTenure}yr
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Compare EMI, interest cost, and IRR impact across loan tenures
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="pb-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Tenure</th>
              <th className="pb-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">EMI/mo</th>
              <th className="pb-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Total Interest</th>
              <th className="pb-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">IRR Δ</th>
              <th className="pb-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Annual CF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {result.options.map((opt) => {
              const isRecommended = opt.tenureYears === result.recommendedTenure;
              return (
                <tr
                  key={opt.tenureYears}
                  className={`${isRecommended ? "bg-primary-50/60 dark:bg-primary-900/20" : ""}`}
                >
                  <td className="py-2.5">
                    <span className={`font-medium ${isRecommended ? "text-primary-700 dark:text-primary-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {opt.tenureYears}yr {isRecommended && <span className="text-xs ml-1">★</span>}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-slate-700 dark:text-slate-300 font-medium">
                    {formatINR(opt.emi)}
                  </td>
                  <td className="py-2.5 text-right text-slate-500 dark:text-slate-400">
                    {formatINR(opt.totalInterest)}
                  </td>
                  <td className={`py-2.5 text-right font-medium ${
                    opt.irrImpact > 0 ? "text-emerald-600 dark:text-emerald-400" :
                    opt.irrImpact < 0 ? "text-rose-600 dark:text-rose-400" :
                    "text-slate-500"
                  }`}>
                    {opt.irrImpact > 0 ? "+" : ""}{opt.irrImpact.toFixed(1)}pp
                  </td>
                  <td className={`py-2.5 text-right font-medium ${
                    opt.annualCashFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    {formatINR(opt.annualCashFlow)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-2">
        <p className="text-xs text-slate-600 dark:text-slate-400">{result.recommendation}</p>
      </div>
    </div>
  );
}
