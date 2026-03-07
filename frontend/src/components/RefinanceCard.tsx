"use client";

import { useMemo } from "react";
import { calculateRefinance } from "@/lib/refinanceEngine";
import { formatINR } from "@/lib/format";
import type { InvestmentInput, InvestmentMetrics } from "@/types/investment";

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function RefinanceCard({ inputs, metrics }: Props) {
  const result = useMemo(() => {
    const effectiveDown =
      inputs.down_payment +
      inputs.property_purchase_price * (inputs.stamp_duty_percent / 100) +
      inputs.property_purchase_price * (inputs.registration_cost_percent / 100);

    return calculateRefinance({
      propertyPrice: inputs.property_purchase_price,
      loanAmount: metrics.loan_amount,
      loanInterestRate: inputs.loan_interest_rate,
      loanTenureYears: inputs.loan_tenure_years,
      monthlyRent: inputs.expected_monthly_rent,
      vacancyRate: inputs.vacancy_rate,
      annualMaintenance: inputs.annual_maintenance_cost,
      appreciation: inputs.expected_annual_appreciation,
      holdingPeriodYears: inputs.holding_period_years,
      effectiveDown,
      baseIRR: metrics.irr,
    });
  }, [inputs, metrics]);

  const irrColor = result.irrImpact > 0
    ? "text-emerald-700 dark:text-emerald-400"
    : "text-rose-700 dark:text-rose-400";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">🔄 Refinance Simulation</h3>
        {result.isViable ? (
          <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
            Viable at Yr {result.refinanceYear}
          </span>
        ) : (
          <span className="text-xs bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 px-2.5 py-1 rounded-full">
            Not Yet Viable
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Simulates cash-out refinance when property value increases 30%+ (70% LTV)
      </p>

      {!result.isViable ? (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">{result.insight}</p>
          <p className="text-xs text-slate-400 mt-1">
            Property needs to reach {formatINR(inputs.property_purchase_price * 1.30)} for 30% appreciation threshold.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
              <p className="text-xs text-slate-500 mb-1">Refinance Year</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">Year {result.refinanceYear}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatINR(result.currentPropertyValue)} value</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
              <p className="text-xs text-slate-500 mb-1">Cash-Out Amount</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-400">{formatINR(result.cashOut)}</p>
              <p className="text-xs text-slate-400 mt-0.5">New loan: {formatINR(result.maxNewLoan)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
              <p className="text-xs text-slate-500 mb-1">EMI Change</p>
              <p className={`font-bold ${result.emiDelta > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
                {result.emiDelta > 0 ? "+" : ""}{formatINR(result.emiDelta)}/mo
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Was: {formatINR(result.originalEMI)}/mo</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
              <p className="text-xs text-slate-500 mb-1">IRR Impact</p>
              <p className={`font-bold ${irrColor}`}>
                {result.irrImpact >= 0 ? "+" : ""}{result.irrImpact.toFixed(1)}pp
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{result.irrWithRefinance.toFixed(1)}% vs {result.irrWithoutRefinance.toFixed(1)}%</p>
            </div>
          </div>

          <div className="rounded-lg bg-sky-50 dark:bg-sky-900/20 px-3 py-2.5">
            <p className="text-xs text-sky-800 dark:text-sky-300">{result.insight}</p>
          </div>
        </>
      )}
    </div>
  );
}
