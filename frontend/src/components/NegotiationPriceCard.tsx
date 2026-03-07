"use client";

import { useMemo } from "react";
import { calculateNegotiationPrice } from "@/lib/negotiationEngine";
import { formatINR } from "@/lib/format";
import type { InvestmentInput } from "@/types/investment";
import type { InvestmentMetrics } from "@/types/investment";

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function NegotiationPriceCard({ inputs, metrics }: Props) {
  const result = useMemo(() => {
    const downRatio = inputs.property_purchase_price > 0
      ? inputs.down_payment / inputs.property_purchase_price
      : 0.20;

    return calculateNegotiationPrice({
      propertyPrice: inputs.property_purchase_price,
      downPaymentRatio: downRatio,
      loanInterestRate: inputs.loan_interest_rate,
      loanTenureYears: inputs.loan_tenure_years,
      monthlyRent: inputs.expected_monthly_rent,
      annualMaintenance: inputs.annual_maintenance_cost,
      vacancyRate: inputs.vacancy_rate,
      appreciation: inputs.expected_annual_appreciation,
      holdingPeriodYears: inputs.holding_period_years,
      stampDutyPercent: inputs.stamp_duty_percent,
      registrationCostPercent: inputs.registration_cost_percent,
      currentIRR: metrics.irr,
      targetIRR: 12,
    });
  }, [inputs, metrics]);

  const strengthColors = {
    "Already Achievable": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    "Weak":   "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400",
    "Moderate": "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    "Strong": "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">🤝 Negotiation Price</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${strengthColors[result.negotiationStrength]}`}>
          {result.negotiationStrength}
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Target price to achieve <strong>12% IRR</strong> (institutional-grade real estate threshold)
      </p>

      {result.isAlreadyAchievable ? (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">✓ 12% IRR already achieved</p>
          <p className="text-xs text-slate-500 mt-1">No price negotiation required at current inputs.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Asking Price</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">{formatINR(result.currentPrice)}</p>
              <p className="text-xs text-rose-500 mt-0.5">IRR: {metrics.irr.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Target Price</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-400">{formatINR(result.targetPrice)}</p>
              <p className="text-xs text-emerald-600 mt-0.5">IRR: 12%</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 px-4 py-3 mb-3">
            <span className="text-sm text-slate-600 dark:text-slate-400">Required discount</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              −{result.priceReductionPercent}% ({formatINR(result.priceReductionAmount)})
            </span>
          </div>
        </>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">{result.insight}</p>
    </div>
  );
}
