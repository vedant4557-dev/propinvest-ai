"use client";

import { useMemo } from "react";
import type { InvestmentInput, InvestmentMetrics } from "@/types/investment";

// ─── Inlined engine ────────────────────────────────────────────────────────

function calcEMI(principal: number, annualRate: number, tenureYears: number): number {
  if (!principal || !tenureYears) return 0;
  if (annualRate === 0) return principal / (tenureYears * 12);
  const r = annualRate / 100 / 12;
  const n = tenureYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function remainingLoan(emi: number, annualRate: number, totalM: number, paidM: number): number {
  if (annualRate === 0 || totalM <= paidM) return 0;
  const r = annualRate / 100 / 12;
  return (emi * (1 - Math.pow(1 + r, -(totalM - paidM)))) / r;
}

function bisIRR(flows: number[]): number {
  const npv = (r: number) =>
    flows.reduce((s, cf, t) => {
      const d = Math.pow(1 + r, t);
      return s + (isFinite(d) && d > 1e-10 ? cf / d : 0);
    }, 0);
  for (let lo = -0.9; lo < 5.0; lo += 0.25) {
    const hi = lo + 0.25;
    if (npv(lo) * npv(hi) <= 0) {
      let l = lo, h = hi;
      for (let i = 0; i < 100; i++) {
        const m = (l + h) / 2;
        if (Math.abs(h - l) < 1e-8) break;
        if (npv(l) * npv(m) <= 0) h = m; else l = m;
      }
      return Math.round(((l + h) / 2) * 1000) / 10;
    }
  }
  return 0;
}

function calcScenario(rate: number, inp: InvestmentInput, loanAmount: number, effectiveDown: number) {
  const emi = calcEMI(loanAmount, rate, inp.loan_tenure_years);
  const annualEMI = emi * 12;
  const annualRent = inp.expected_monthly_rent * 12 * (1 - inp.vacancy_rate / 100);
  const annualCF = annualRent - annualEMI - inp.annual_maintenance_cost;
  const dscr = annualEMI > 0 ? Math.round((annualRent / annualEMI) * 100) / 100 : 99;

  const price = inp.property_purchase_price;
  const fv = price * Math.pow(1 + inp.expected_annual_appreciation / 100, inp.holding_period_years);
  const cgTax = Math.max(0, (fv - price) * 0.2);
  const exitCost = fv * 0.03;
  const paidM = Math.min(inp.holding_period_years * 12, inp.loan_tenure_years * 12);
  const remaining = remainingLoan(emi, rate, inp.loan_tenure_years * 12, paidM);
  const netSale = Math.max(0, fv - remaining - cgTax - exitCost);

  const flows = [-effectiveDown];
  for (let yr = 1; yr <= inp.holding_period_years; yr++)
    flows.push(yr === inp.holding_period_years ? annualCF + netSale : annualCF);

  return {
    emi: Math.round(emi),
    irr: bisIRR(flows),
    dscr,
    annualCF: Math.round(annualCF),
    dscrFails: dscr < 1.0,
  };
}

function findDSCRBreakevenRate(inp: InvestmentInput, loanAmount: number): number {
  for (let r = inp.loan_interest_rate; r <= inp.loan_interest_rate + 20; r += 0.1) {
    const emi = calcEMI(loanAmount, r, inp.loan_tenure_years) * 12;
    const rent = inp.expected_monthly_rent * 12 * (1 - inp.vacancy_rate / 100);
    if (rent < emi) return Math.round(r * 10) / 10;
  }
  return inp.loan_interest_rate + 20;
}

function fmtINR(v: number): string {
  const abs = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (abs >= 100_000) return `${s}₹${(abs / 100_000).toFixed(1)}L`;
  return `${s}₹${abs.toLocaleString("en-IN")}`;
}

// ─── Component ────────────────────────────────────────────────────────────

interface Props { inputs: InvestmentInput; metrics: InvestmentMetrics; }

export function RateStressCard({ inputs, metrics }: Props) {
  const effectiveDown = metrics.effective_down_payment;
  const loanAmount = metrics.loan_amount;

  const result = useMemo(() => {
    const deltas = [0, 1, 2, 3];
    const base = calcScenario(inputs.loan_interest_rate, inputs, loanAmount, effectiveDown);
    const scenarios = deltas.map(d => ({
      delta: d,
      rate: inputs.loan_interest_rate + d,
      label: d === 0 ? "Base" : `+${d}%`,
      ...calcScenario(inputs.loan_interest_rate + d, inputs, loanAmount, effectiveDown),
      irrDelta: 0,
    }));
    scenarios.forEach(s => { s.irrDelta = Math.round((s.irr - base.irr) * 10) / 10; });

    const dscrBreakeven = findDSCRBreakevenRate(inputs, loanAmount);
    const maxAbsorbable = Math.round((dscrBreakeven - inputs.loan_interest_rate) * 10) / 10;

    const interpretation =
      maxAbsorbable <= 1
        ? `⚠ Highly rate-sensitive. DSCR fails at just +${maxAbsorbable.toFixed(1)}pp. Build a strong cash buffer.`
        : maxAbsorbable <= 2
        ? `Moderate rate risk. Debt coverage breaks at ${dscrBreakeven.toFixed(1)}%. Watch RBI rate cycles.`
        : `Good resilience. Debt coverage holds up to ${dscrBreakeven.toFixed(1)}% — can absorb typical rate cycles.`;

    return { scenarios, dscrBreakeven, maxAbsorbable, interpretation, base };
  }, [inputs, loanAmount, effectiveDown]);

  const { scenarios, dscrBreakeven, maxAbsorbable, interpretation } = result;
  const anyFails = scenarios.some(s => s.dscrFails);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">📊 Floating Rate Stress Test</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Indian mortgages are floating rate — how does this deal hold up if rates rise?
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ml-2 ${
          maxAbsorbable > 2
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
            : maxAbsorbable > 1
            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
            : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
        }`}>
          {maxAbsorbable > 2 ? "Rate Resilient" : maxAbsorbable > 1 ? "Moderate Risk" : "Rate Sensitive"}
        </span>
      </div>

      {/* DSCR breakeven highlight */}
      <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">DSCR Breakeven Rate</p>
          <p className={`text-2xl font-black mt-0.5 ${maxAbsorbable <= 1 ? "text-rose-600 dark:text-rose-400" : maxAbsorbable <= 2 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {dscrBreakeven >= inputs.loan_interest_rate + 20 ? "Stress-proof" : `${dscrBreakeven.toFixed(1)}%`}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">rent stops covering EMI above this rate</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Max Absorbable Hike</p>
          <p className={`text-xl font-bold mt-0.5 ${maxAbsorbable > 2 ? "text-emerald-600 dark:text-emerald-400" : maxAbsorbable > 1 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
            +{maxAbsorbable.toFixed(1)}pp
          </p>
        </div>
      </div>

      {/* Scenario table */}
      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              {["Scenario", "Rate", "Monthly EMI", "Annual CF", "DSCR", "IRR Impact"].map(h => (
                <th key={h} className="py-2.5 px-3 text-xs font-medium text-slate-500 text-center first:text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
            {scenarios.map(s => (
              <tr key={s.delta} className={s.delta === 0 ? "bg-slate-50/30 dark:bg-slate-700/20" : s.dscrFails ? "bg-rose-50/50 dark:bg-rose-900/10" : ""}>
                <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-200">
                  {s.label}
                  {s.delta === 0 && <span className="ml-1.5 text-[9px] bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">current</span>}
                </td>
                <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-200">{s.rate.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-200">
                  {fmtINR(s.emi)}/mo
                  {s.delta > 0 && (
                    <span className="block text-[10px] text-rose-500">
                      +{fmtINR(s.emi - scenarios[0].emi)}/mo
                    </span>
                  )}
                </td>
                <td className={`py-2.5 px-3 text-center font-medium ${s.annualCF >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {fmtINR(s.annualCF)}/yr
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    s.dscr >= 1.25 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    s.dscr >= 1.0  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                     "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  }`}>
                    {s.dscr.toFixed(2)}x
                    {s.dscrFails && " ✗"}
                  </span>
                </td>
                <td className={`py-2.5 px-3 text-center font-medium ${
                  s.delta === 0 ? "text-slate-500" :
                  s.irrDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {s.delta === 0 ? `${s.irr.toFixed(1)}%` : `${s.irrDelta > 0 ? "+" : ""}${s.irrDelta.toFixed(1)}pp`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interpretation */}
      <div className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2.5 ${
        maxAbsorbable <= 1 ? "bg-rose-50 dark:bg-rose-900/20" :
        maxAbsorbable <= 2 ? "bg-amber-50 dark:bg-amber-900/20" :
                             "bg-emerald-50 dark:bg-emerald-900/20"
      }`}>
        <span className="flex-shrink-0 text-sm">
          {maxAbsorbable <= 1 ? "⚠" : maxAbsorbable <= 2 ? "ℹ" : "✓"}
        </span>
        <p className={`text-xs leading-relaxed ${
          maxAbsorbable <= 1 ? "text-rose-700 dark:text-rose-300" :
          maxAbsorbable <= 2 ? "text-amber-700 dark:text-amber-300" :
                               "text-emerald-700 dark:text-emerald-300"
        }`}>
          {interpretation}
        </p>
      </div>

      {anyFails && (
        <p className="mt-2 text-[11px] text-slate-400 text-center">
          DSCR &lt; 1.0 means rental income no longer covers loan EMI — you must fund the shortfall from savings.
        </p>
      )}
    </div>
  );
}
