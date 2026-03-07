"use client";

import { useMemo } from "react";
import { calculateVacancyShock } from "@/lib/vacancyShockEngine";
import { formatINR } from "@/lib/format";
import type { InvestmentInput } from "@/types/investment";
import type { InvestmentMetrics } from "@/types/investment";

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function VacancyShockCard({ inputs, metrics }: Props) {
  const result = useMemo(() => {
    const effectiveDown =
      inputs.down_payment +
      inputs.property_purchase_price * (inputs.stamp_duty_percent / 100) +
      inputs.property_purchase_price * (inputs.registration_cost_percent / 100);

    return calculateVacancyShock({
      effectiveDown,
      annualEMI: metrics.emi * 12,
      monthlyRent: inputs.expected_monthly_rent,
      vacancyRate: inputs.vacancy_rate,
      annualMaintenance: inputs.annual_maintenance_cost,
      holdingPeriodYears: inputs.holding_period_years,
      propertyPrice: inputs.property_purchase_price,
      appreciation: inputs.expected_annual_appreciation,
      loanInterestRate: inputs.loan_interest_rate,
      loanTenureYears: inputs.loan_tenure_years,
      loanAmount: metrics.loan_amount,
      baseIRR: metrics.irr,
      shockMonths: 6,
      shockYear: 3,
    });
  }, [inputs, metrics]);

  const severityColors = {
    Low:      { card: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    Moderate: { card: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    High:     { card: "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  }[result.severity];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${severityColors.card}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">⚡ Vacancy Shock: 6-Month Stress</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${severityColors.badge}`}>
          {result.severity} Impact
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/50 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Base IRR</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">{result.irrWithoutShock.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/50 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">IRR with Shock</p>
          <p className={`font-bold ${result.irrWithShock < result.irrWithoutShock ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
            {result.irrWithShock.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/50 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">IRR Impact</p>
          <p className={`font-bold ${result.irrImpact < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
            {result.irrImpact >= 0 ? "+" : ""}{result.irrImpact.toFixed(1)}pp
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3">
        <span>Rent lost in shock year:</span>
        <span className="font-semibold text-slate-800 dark:text-slate-100">{formatINR(result.cashFlowImpactTotal)}</span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 italic">{result.insight}</p>
    </div>
  );
}
