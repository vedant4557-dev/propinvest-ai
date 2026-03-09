"use client";

import { useMemo } from "react";
import type { InvestmentInput, InvestmentMetrics, CashFlowYear } from "@/types/investment";

// ─── Inlined engine ────────────────────────────────────────────────────────

function calcEMI(p: number, r: number, y: number): number {
  if (!p || !y) return 0;
  if (r === 0) return p / (y * 12);
  const mr = r / 100 / 12; const n = y * 12;
  return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

function remainingLoan(emi: number, r: number, totalM: number, paidM: number): number {
  if (r === 0 || totalM <= paidM) return 0;
  const mr = r / 100 / 12;
  return (emi * (1 - Math.pow(1 + mr, -(totalM - paidM)))) / mr;
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

function irrAt(apprec: number, inp: InvestmentInput, loanAmount: number, effectiveDown: number): number {
  const emi = calcEMI(loanAmount, inp.loan_interest_rate, inp.loan_tenure_years);
  const rent = inp.expected_monthly_rent * 12 * (1 - inp.vacancy_rate / 100);
  const cf = rent - emi * 12 - inp.annual_maintenance_cost;
  const price = inp.property_purchase_price;
  const fv = price * Math.pow(1 + apprec / 100, inp.holding_period_years);
  const cgTax = Math.max(0, (fv - price) * 0.2);
  const paidM = Math.min(inp.holding_period_years * 12, inp.loan_tenure_years * 12);
  const rem = remainingLoan(emi, inp.loan_interest_rate, inp.loan_tenure_years * 12, paidM);
  const netSale = Math.max(0, fv - rem - cgTax - fv * 0.03);
  const flows = [-effectiveDown];
  for (let yr = 1; yr <= inp.holding_period_years; yr++)
    flows.push(yr === inp.holding_period_years ? cf + netSale : cf);
  return bisIRR(flows);
}

// ─── Component ────────────────────────────────────────────────────────────

interface ConditionRowProps {
  icon: string;
  label: string;
  failValue: string;
  assumption: string;
  isSafe: boolean;
  margin: string;
  explanation: string;
}

function ConditionRow({ icon, label, failValue, assumption, isSafe, margin, explanation }: ConditionRowProps) {
  return (
    <div className={`rounded-xl border p-3.5 ${
      isSafe
        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/15"
        : "border-rose-200 bg-rose-50 dark:border-rose-800/40 dark:bg-rose-900/20"
    }`}>
      <div className="flex items-start gap-3">
        <span className={`text-lg flex-shrink-0 mt-0.5 ${isSafe ? "text-emerald-600" : "text-rose-500"}`}>
          {isSafe ? "✓" : "✗"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{icon} {label}</span>
            <span className={`text-sm font-black ${isSafe ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
              {failValue}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{explanation}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              isSafe
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
            }`}>
              Your assumption: {assumption}
            </span>
            <span className="text-[10px] text-slate-400">{margin}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
  cashFlowTimeline?: CashFlowYear[];
  targetIRR?: number;
}

export function DealFailureCard({ inputs, metrics, cashFlowTimeline, targetIRR = 8 }: Props) {
  const effectiveDown = metrics.effective_down_payment;
  const loanAmount = metrics.loan_amount;

  const result = useMemo(() => {
    // 1. Min appreciation for target IRR
    let minApprec = 20;
    for (let a = 0; a <= 20; a += 0.25) {
      if (irrAt(a, inputs, loanAmount, effectiveDown) >= targetIRR) {
        minApprec = Math.round(a * 10) / 10;
        break;
      }
    }

    // 2. Max rate before DSCR < 1.0 (rent < EMI)
    let maxRate = inputs.loan_interest_rate + 20;
    for (let r = inputs.loan_interest_rate; r <= inputs.loan_interest_rate + 20; r += 0.1) {
      const emi = calcEMI(loanAmount, r, inputs.loan_tenure_years) * 12;
      const rent = inputs.expected_monthly_rent * 12 * (1 - inputs.vacancy_rate / 100);
      if (rent < emi) { maxRate = Math.round(r * 10) / 10; break; }
    }

    // 3. Max vacancy before CF < 0
    let maxVacancy = 100;
    const emiAnnual = calcEMI(loanAmount, inputs.loan_interest_rate, inputs.loan_tenure_years) * 12;
    for (let v = 0; v <= 100; v++) {
      const rent = inputs.expected_monthly_rent * 12 * (1 - v / 100);
      if (rent - emiAnnual - inputs.annual_maintenance_cost <= 0) { maxVacancy = v; break; }
    }

    // 4. Min holding period for equity recovery
    let minHold = inputs.holding_period_years;
    if (cashFlowTimeline && cashFlowTimeline.length > 0) {
      for (const yr of cashFlowTimeline) {
        if (yr.cumulative_cash_flow >= 0) { minHold = yr.year; break; }
      }
    } else {
      for (let yr = 1; yr <= 30; yr++) {
        if (irrAt(inputs.expected_annual_appreciation, { ...inputs, holding_period_years: yr }, loanAmount, effectiveDown) > 0) {
          minHold = yr; break;
        }
      }
    }

    const apprecMargin = Math.round((inputs.expected_annual_appreciation - minApprec) * 10) / 10;
    const rateMargin   = Math.round((maxRate - inputs.loan_interest_rate) * 10) / 10;
    const vacancyMargin = Math.max(0, maxVacancy - inputs.vacancy_rate);
    const holdMargin   = inputs.holding_period_years - minHold;

    const conditions = [
      {
        icon: "📈",
        label: "Min. Appreciation for " + targetIRR + "% IRR",
        failValue: minApprec >= 20 ? `>${targetIRR}% needed` : `${minApprec.toFixed(1)}% / yr`,
        assumption: `${inputs.expected_annual_appreciation}% / yr`,
        isSafe: inputs.expected_annual_appreciation >= minApprec,
        margin: apprecMargin >= 0
          ? `+${apprecMargin.toFixed(1)}pp buffer above threshold`
          : `⚠ Below required level — IRR target not met at current assumption`,
        explanation: `Property must appreciate ≥ ${minApprec.toFixed(1)}%/yr to achieve ${targetIRR}% IRR.`,
      },
      {
        icon: "🏦",
        label: "Max Interest Rate (DSCR ≥ 1.0)",
        failValue: maxRate >= inputs.loan_interest_rate + 20 ? "Stress-proof" : `${maxRate.toFixed(1)}%`,
        assumption: `${inputs.loan_interest_rate}%`,
        isSafe: inputs.loan_interest_rate < maxRate,
        margin: rateMargin > 0
          ? `+${rateMargin.toFixed(1)}pp absorbable before rent < EMI`
          : `⚠ Current rate already above DSCR breakeven`,
        explanation: "Rental income stops covering loan EMI above this rate.",
      },
      {
        icon: "🏚",
        label: "Max Vacancy (before CF < 0)",
        failValue: `${maxVacancy}%`,
        assumption: `${inputs.vacancy_rate}%`,
        isSafe: inputs.vacancy_rate < maxVacancy,
        margin: vacancyMargin > 0
          ? `${vacancyMargin}pp vacancy buffer before negative cash flow`
          : `⚠ Already cash-flow negative at current vacancy`,
        explanation: "Annual cash flow turns negative when vacancy exceeds this level.",
      },
      {
        icon: "📅",
        label: "Min Holding Period",
        failValue: `${minHold} years`,
        assumption: `${inputs.holding_period_years} yr planned`,
        isSafe: inputs.holding_period_years >= minHold,
        margin: holdMargin >= 0
          ? `${holdMargin} extra year${holdMargin !== 1 ? "s" : ""} of compounding beyond breakeven`
          : `⚠ Exit is planned before equity recovery point`,
        explanation: `Selling before year ${minHold} may result in a loss after acquisition costs and taxes.`,
      },
    ];

    const failCount    = conditions.filter(c => !c.isSafe).length;
    const thinMargins  = conditions.filter((c, i) => {
      if (!c.isSafe) return false;
      if (i === 0 && apprecMargin < 1.5) return true;
      if (i === 1 && rateMargin   < 1.5) return true;
      if (i === 2 && vacancyMargin < 5)  return true;
      return false;
    }).length;

    const fragScore = Math.min(100, failCount * 30 + thinMargins * 15);
    const fragility: "Robust" | "Moderate" | "Fragile" | "Critical" =
      fragScore >= 60 ? "Critical" :
      fragScore >= 35 ? "Fragile"  :
      fragScore >= 15 ? "Moderate" : "Robust";

    const fragColor = { Robust: "emerald", Moderate: "sky", Fragile: "amber", Critical: "rose" }[fragility];

    const summary =
      failCount === 0 && thinMargins === 0
        ? "All failure conditions are comfortably met. This deal has solid resilience across key risk factors."
        : failCount === 0
        ? `No active failures, but ${thinMargins} assumption${thinMargins > 1 ? "s have" : " has"} thin margins. Review carefully before committing.`
        : `${failCount} condition${failCount > 1 ? "s" : ""} already at or beyond failure threshold. High-fragility deal.`;

    // Weakest assumption for key callout
    const margins = [
      { name: "appreciation", val: apprecMargin },
      { name: "interest rate", val: rateMargin },
      { name: "vacancy",       val: vacancyMargin },
    ].filter(m => m.val >= 0);
    const weakest = margins.length > 0
      ? margins.reduce((a, b) => a.val < b.val ? a : b)
      : null;

    return { conditions, failCount, fragility, fragColor, fragScore, summary, weakest };
  }, [inputs, metrics, cashFlowTimeline, targetIRR, loanAmount, effectiveDown]);

  const { conditions, failCount, fragility, fragColor, fragScore, summary, weakest } = result;

  const fragBg:  Record<string, string> = { emerald: "bg-emerald-50 dark:bg-emerald-900/20", sky: "bg-sky-50 dark:bg-sky-900/20",     amber: "bg-amber-50 dark:bg-amber-900/20",    rose: "bg-rose-50 dark:bg-rose-900/20"    };
  const fragText:Record<string, string> = { emerald: "text-emerald-700 dark:text-emerald-400", sky: "text-sky-700 dark:text-sky-400", amber: "text-amber-700 dark:text-amber-400",  rose: "text-rose-700 dark:text-rose-400"  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">🔎 Deal Failure Conditions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key assumptions you must believe in for this investment to work.
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ml-2 ${fragBg[fragColor]} ${fragText[fragColor]}`}>
          {fragility}
        </span>
      </div>

      {/* Fragility score bar */}
      <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Deal Fragility Score</p>
          <p className={`text-sm font-bold ${fragText[fragColor]}`}>{fragScore}/100</p>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              fragScore >= 60 ? "bg-rose-500" :
              fragScore >= 35 ? "bg-amber-500" :
              fragScore >= 15 ? "bg-sky-500"  : "bg-emerald-500"
            }`}
            style={{ width: `${fragScore}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">{summary}</p>
      </div>

      {/* Condition cards */}
      <div className="mt-3 space-y-2.5">
        {conditions.map(c => (
          <ConditionRow key={c.label} {...c} />
        ))}
      </div>

      {/* Weakest assumption callout */}
      {weakest && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
          <span className="text-amber-500 flex-shrink-0">⚡</span>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Thinnest margin:</strong> {weakest.name} — only {weakest.val.toFixed(1)}{weakest.name === "vacancy" ? "pp" : "pp"} of buffer before failure. This is the assumption most worth stress-testing.
          </p>
        </div>
      )}

      {/* Footer framing */}
      <p className="mt-3 text-[11px] text-slate-400 text-center leading-relaxed">
        {failCount > 0
          ? `⚠ ${failCount} active failure condition${failCount > 1 ? "s" : ""}. Review before investing.`
          : "This section shows the exact conditions under which this deal fails — know your risk before committing capital."
        }
      </p>
    </div>
  );
}
