"use client";

import { useMemo } from "react";
import {
  calculateEquityMultiple,
  calculatePaybackPeriod,
  calculateLeveredUnleveredIRR,
} from "@/lib/advancedMetricsEngine";
import { formatINR, formatPercent } from "@/lib/format";
import { Tooltip } from "@/lib/glossary";
import type { InvestmentInput, InvestmentMetrics, CashFlowYear, TaxAnalysis } from "@/types/investment";

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
  cashFlowTimeline: CashFlowYear[];
  taxAnalysis?: TaxAnalysis | null;
}

export function AdvancedMetricsCard({ inputs, metrics, cashFlowTimeline, taxAnalysis }: Props) {
  const effectiveDown = useMemo(() =>
    inputs.down_payment +
    inputs.property_purchase_price * (inputs.stamp_duty_percent / 100) +
    inputs.property_purchase_price * (inputs.registration_cost_percent / 100),
    [inputs]);

  // Equity Multiple
  const emResult = useMemo(() => {
    const annualEMI = metrics.emi * 12;
    const totalEMIPaid = annualEMI * Math.min(inputs.holding_period_years, inputs.loan_tenure_years);
    const totalMaintenance = inputs.annual_maintenance_cost * inputs.holding_period_years;
    const totalRentalIncome = metrics.effective_annual_rent * inputs.holding_period_years;
    const netSale = metrics.future_property_value - (metrics.loan_amount - totalEMIPaid * 0.25) - (metrics.capital_gains * 0.20);
    return calculateEquityMultiple(effectiveDown, totalRentalIncome, netSale, totalEMIPaid, totalMaintenance);
  }, [inputs, metrics, effectiveDown]);

  // Payback Period
  const pbResult = useMemo(() => {
    const timeline = cashFlowTimeline.map(yr => ({
      year: yr.year,
      net_cash_flow: yr.net_cash_flow,
      cumulative_cash_flow: yr.cumulative_cash_flow,
    }));
    return calculatePaybackPeriod(effectiveDown, metrics.annual_cash_flow, timeline);
  }, [effectiveDown, metrics, cashFlowTimeline]);

  // Levered vs Unlevered IRR
  const irrResult = useMemo(() => calculateLeveredUnleveredIRR({
    propertyPrice: inputs.property_purchase_price,
    effectiveDown,
    loanAmount: metrics.loan_amount,
    monthlyRent: inputs.expected_monthly_rent,
    vacancyRate: inputs.vacancy_rate,
    annualMaintenance: inputs.annual_maintenance_cost,
    annualEMI: metrics.emi * 12,
    holdingPeriodYears: inputs.holding_period_years,
    appreciation: inputs.expected_annual_appreciation,
    loanInterestRate: inputs.loan_interest_rate,
    loanTenureYears: inputs.loan_tenure_years,
    leveredIRR: metrics.irr,
  }), [inputs, metrics, effectiveDown]);

  const emColors = {
    green:  "text-emerald-700 dark:text-emerald-400",
    blue:   "text-sky-700 dark:text-sky-400",
    yellow: "text-amber-700 dark:text-amber-400",
    red:    "text-rose-700 dark:text-rose-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">📊 Advanced Metrics</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Equity Multiple */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-0.5">
            Equity Multiple
            <Tooltip content="Total cash returned to you ÷ equity invested. A 2.5x multiple means you got ₹2.50 back for every ₹1.00 you put in — including rent collected and sale proceeds." />
          </p>
          <p className={`text-2xl font-black ${emColors[emResult.verdictColor]}`}>
            {emResult.equityMultiple.toFixed(2)}x
          </p>
          <span className={`text-xs font-semibold ${emColors[emResult.verdictColor]}`}>{emResult.verdict}</span>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{emResult.insight}</p>
        </div>

        {/* Payback Period */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-0.5">
            Payback Period
            <Tooltip content="Years until cumulative rental cash flows recover your initial equity (down payment + costs). Does not count appreciation — purely income-based recovery. 12 years = rent alone takes 12 years to return your investment." />
          </p>
          {pbResult.recovered && pbResult.paybackYears > 0 ? (
            <>
              <p className="text-2xl font-black text-sky-700 dark:text-sky-400">
                {pbResult.paybackYears}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">yr{pbResult.paybackYears !== 1 ? "s" : ""}</span>
              </p>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">Recovered</span>
            </>
          ) : (
            <>
              <p className="text-xl font-black text-amber-700 dark:text-amber-400">At Exit</p>
              <span className="text-xs font-semibold text-amber-600">Via Capital Gains</span>
            </>
          )}
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{pbResult.insight}</p>
        </div>

        {/* Levered vs Unlevered IRR */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2 flex items-center gap-0.5">
            Levered vs Unlevered IRR
            <Tooltip content="Levered IRR uses your actual equity with the loan. Unlevered IRR is what you'd earn buying entirely in cash. A positive leverage effect means taking a loan amplified your return." maxWidth={300} />
          </p>
          <div className="space-y-1.5 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-0.5">
                Levered
                <Tooltip content="IRR calculated on your equity invested (with loan). The loan amplifies returns by letting you control a larger asset with less capital." />
              </span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatPercent(irrResult.leveredIRR)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-0.5">
                Unlevered
                <Tooltip content="IRR if you bought the property entirely in cash. Shows the property's underlying return, independent of financing." />
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatPercent(irrResult.unleveredIRR)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-600 pt-1.5">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-0.5">
                Leverage Effect
                <Tooltip content="Levered IRR minus Unlevered IRR. Positive = loan improved your return. Negative = loan interest cost exceeds the property income return." />
              </span>
              <span className={`text-sm font-bold ${irrResult.leverageBenefit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {irrResult.leverageEffect >= 0 ? "+" : ""}{irrResult.leverageEffect.toFixed(1)}pp
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{irrResult.insight}</p>
        </div>
      </div>
    </div>
  );
}
