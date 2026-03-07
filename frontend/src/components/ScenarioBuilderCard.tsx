"use client";

import { useMemo } from "react";
import { runScenarioBuilder } from "@/lib/scenarioBuilderEngine";
import { formatINR } from "@/lib/format";
import type { InvestmentInput } from "@/types/investment";
import type { InvestmentMetrics } from "@/types/investment";

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function ScenarioBuilderCard({ inputs, metrics }: Props) {
  const result = useMemo(() => {
    const effectiveDown =
      inputs.down_payment +
      inputs.property_purchase_price * (inputs.stamp_duty_percent / 100) +
      inputs.property_purchase_price * (inputs.registration_cost_percent / 100);

    return runScenarioBuilder({
      effectiveDown,
      propertyPrice: inputs.property_purchase_price,
      monthlyRent: inputs.expected_monthly_rent,
      vacancyRate: inputs.vacancy_rate,
      annualEMI: metrics.emi * 12,
      annualMaintenance: inputs.annual_maintenance_cost,
      appreciation: inputs.expected_annual_appreciation,
      holdingPeriodYears: inputs.holding_period_years,
      loanInterestRate: inputs.loan_interest_rate,
      loanTenureYears: inputs.loan_tenure_years,
      loanAmount: metrics.loan_amount,
      baseIRR: metrics.irr,
    });
  }, [inputs, metrics]);

  const severityStyles: Record<string, string> = {
    Positive: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
    Mild:     "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800",
    Moderate: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    Severe:   "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800",
  };
  const severityText: Record<string, string> = {
    Positive: "text-emerald-700 dark:text-emerald-400",
    Mild:     "text-sky-700 dark:text-sky-400",
    Moderate: "text-amber-700 dark:text-amber-400",
    Severe:   "text-rose-700 dark:text-rose-400",
  };
  const severityIcon: Record<string, string> = {
    Positive: "▲", Mild: "▼", Moderate: "▼▼", Severe: "▼▼▼",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">🔬 Scenario Builder</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Base IRR: <strong className="text-slate-700 dark:text-slate-200">{result.baseIRR.toFixed(1)}%</strong>
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        How each scenario affects your IRR and annual cash flow
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {result.scenarios.map((s) => (
          <div key={s.scenarioName} className={`rounded-xl border p-3 ${severityStyles[s.severity]}`}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className={`text-sm font-semibold ${severityText[s.severity]}`}>
                  {severityIcon[s.severity]} {s.scenarioName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-[10px] text-slate-400">IRR</p>
                <p className={`text-sm font-bold ${severityText[s.severity]}`}>{s.irr.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Δ IRR</p>
                <p className={`text-sm font-bold ${s.irrDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {s.irrDelta >= 0 ? "+" : ""}{s.irrDelta.toFixed(1)}pp
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Ann. CF</p>
                <p className={`text-xs font-medium ${s.annualCashFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatINR(s.annualCashFlow)}
                </p>
              </div>
              {"dscr" in s && (
                <div>
                  <p className="text-[10px] text-slate-400">DSCR</p>
                  <p className={`text-xs font-medium ${(s as any).dscr >= 1 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {(s as any).dscr === 999 ? "N/A" : (s as any).dscr.toFixed(2)}x
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
