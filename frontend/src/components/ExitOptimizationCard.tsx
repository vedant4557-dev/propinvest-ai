"use client";

// ExitOptimizationCard — PropInvest AI V3.1
// Engine inlined: no @/lib/exitOptimizationEngine import required

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { InvestmentInput, InvestmentMetrics } from "@/types/investment";

// ─── Inlined engine ─────────────────────────────────────────────────────────

interface ExitYearResult {
  year: number;
  irr: number;
  futureValue: number;
  capitalGains: number;
  netSaleProceeds: number;
  totalCashFlow: number;
  isOptimal: boolean;
}

interface ExitOptimizationResult {
  years: ExitYearResult[];
  bestExitYear: number;
  optimalIRR: number;
  worstExitYear: number;
  insight: string;
  holdLongerBenefit: number;
}

interface ExitOptimizationInput {
  effectiveDown: number;
  propertyPrice: number;
  monthlyRent: number;
  vacancyRate: number;
  annualMaintenance: number;
  appreciation: number;
  loanInterestRate: number;
  loanTenureYears: number;
  loanAmount: number;
  maxYears?: number;
}

function calcIRRAtYear(inp: ExitOptimizationInput, exitYear: number) {
  const r = inp.loanInterestRate / 100 / 12;
  const n = inp.loanTenureYears * 12;
  const emi =
    inp.loanInterestRate > 0 && n > 0
      ? (inp.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : n > 0 ? inp.loanAmount / n : 0;

  const annualEMI = emi * 12;
  const annualRent = inp.monthlyRent * 12 * (1 - inp.vacancyRate / 100);
  const annualCF = annualRent - annualEMI - inp.annualMaintenance;

  const futureValue = inp.propertyPrice * Math.pow(1 + inp.appreciation / 100, exitYear);
  const capitalGains = Math.max(0, futureValue - inp.propertyPrice);
  const cgTax = capitalGains * (exitYear >= 2 ? 0.2 : 0.3);
  const exitCosts = futureValue * 0.03; // 2% brokerage + 1% legal

  const paidMonths = Math.min(exitYear * 12, n);
  const remaining =
    r > 0 && n > paidMonths ? (emi * (1 - Math.pow(1 + r, -(n - paidMonths)))) / r : 0;
  const netSale = futureValue - remaining - cgTax - exitCosts;

  const flows = [-inp.effectiveDown];
  let totalCF = -inp.effectiveDown;
  for (let yr = 1; yr <= exitYear; yr++) {
    const cf = yr === exitYear ? annualCF + netSale : annualCF;
    flows.push(cf);
    totalCF += cf;
  }

  const npv = (rate: number) =>
    flows.reduce((s, cf, t) => {
      const d = Math.pow(1 + rate, t);
      return s + (isFinite(d) && d > 1e-10 ? cf / d : 0);
    }, 0);

  let irr = 0;
  for (let lo = -0.9; lo < 5.0; lo += 0.25) {
    const hi = lo + 0.25;
    if (npv(lo) * npv(hi) <= 0) {
      let l = lo, h = hi;
      for (let i = 0; i < 80; i++) {
        const mid = (l + h) / 2;
        if (Math.abs(h - l) < 1e-8) break;
        if (npv(l) * npv(mid) <= 0) h = mid;
        else l = mid;
      }
      irr = ((l + h) / 2) * 100;
      break;
    }
  }

  return {
    irr: Math.round(irr * 10) / 10,
    futureValue: Math.round(futureValue),
    capitalGains: Math.round(capitalGains),
    netSale: Math.round(netSale),
    totalCF: Math.round(totalCF),
  };
}

function calculateExitOptimization(inp: ExitOptimizationInput): ExitOptimizationResult {
  const maxYears = Math.min(inp.maxYears ?? 20, 30);
  const years: ExitYearResult[] = [];

  for (let yr = 1; yr <= maxYears; yr++) {
    if (yr < 2) {
      years.push({
        year: yr, irr: 0, futureValue: inp.propertyPrice,
        capitalGains: 0, netSaleProceeds: inp.propertyPrice,
        totalCashFlow: 0, isOptimal: false,
      });
      continue;
    }
    const res = calcIRRAtYear(inp, yr);
    years.push({
      year: yr, irr: res.irr, futureValue: res.futureValue,
      capitalGains: res.capitalGains, netSaleProceeds: res.netSale,
      totalCashFlow: res.totalCF, isOptimal: false,
    });
  }

  const validYears = years.filter((y) => y.year >= 2 && isFinite(y.irr));
  const bestEntry = validYears.reduce(
    (best, y) => (y.irr > best.irr ? y : best),
    validYears[0]
  );
  const worstEntry = validYears.reduce(
    (worst, y) => (y.irr < worst.irr ? y : worst),
    validYears[0]
  );

  if (bestEntry) bestEntry.isOptimal = true;

  const currentHoldingIRR = years[Math.min(9, years.length - 1)]?.irr ?? 0;
  const holdLongerBenefit = bestEntry
    ? Math.round((bestEntry.irr - currentHoldingIRR) * 10) / 10
    : 0;

  const insight = bestEntry
    ? bestEntry.year <= 5
      ? `Optimal exit is year ${bestEntry.year} (IRR: ${bestEntry.irr.toFixed(1)}%). Short-term hold — appreciation front-loads gains.`
      : bestEntry.year <= 10
      ? `Best exit at year ${bestEntry.year} (IRR: ${bestEntry.irr.toFixed(1)}%). Hold through the growth phase before selling.`
      : `Long-term hold to year ${bestEntry.year} maximizes IRR at ${bestEntry.irr.toFixed(1)}%. Compounding appreciation dominates returns.`
    : "Insufficient data to determine optimal exit.";

  return {
    years,
    bestExitYear: bestEntry?.year ?? 10,
    optimalIRR: bestEntry?.irr ?? 0,
    worstExitYear: worstEntry?.year ?? 1,
    insight,
    holdLongerBenefit,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

function formatINR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(1)}L`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

export function ExitOptimizationCard({ inputs, metrics }: Props) {
  const effectiveDown = useMemo(() => {
    const p = inputs.property_purchase_price;
    return (
      inputs.down_payment +
      p * (inputs.stamp_duty_percent / 100) +
      p * (inputs.registration_cost_percent / 100)
    );
  }, [inputs]);

  const result = useMemo(
    () =>
      calculateExitOptimization({
        effectiveDown,
        propertyPrice: inputs.property_purchase_price,
        monthlyRent: inputs.expected_monthly_rent,
        vacancyRate: inputs.vacancy_rate,
        annualMaintenance: inputs.annual_maintenance_cost,
        appreciation: inputs.expected_annual_appreciation,
        loanInterestRate: inputs.loan_interest_rate,
        loanTenureYears: inputs.loan_tenure_years,
        loanAmount: metrics.loan_amount,
        maxYears: inputs.holding_period_years,
      }),
    [inputs, metrics, effectiveDown]
  );

  const chartData = result.years
    .filter((y) => y.year >= 2)
    .map((y) => ({ year: `Yr ${y.year}`, irr: y.irr, optimal: y.isOptimal }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">📅 Exit Timing Optimizer</h3>
        <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
          Best: Year {result.bestExitYear} · {result.optimalIRR.toFixed(1)}% IRR
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Includes 3% exit transaction costs (brokerage + legal)
      </p>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, "IRR"]} />
            <Bar dataKey="irr" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.optimal ? "#10b981" : "#94a3b8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-2.5 space-y-1">
        <p className="text-xs text-slate-700 dark:text-slate-300">{result.insight}</p>
        {result.holdLongerBenefit !== 0 && (
          <p className="text-xs text-slate-400">
            Holding to optimal exit vs current plan:{" "}
            <span className={result.holdLongerBenefit > 0 ? "text-emerald-600 font-medium" : "text-rose-500 font-medium"}>
              {result.holdLongerBenefit > 0 ? "+" : ""}{result.holdLongerBenefit.toFixed(1)}pp IRR
            </span>
          </p>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-700">
              <th className="py-1.5 text-left">Year</th>
              <th className="py-1.5 text-right">IRR</th>
              <th className="py-1.5 text-right">Sale Value</th>
              <th className="py-1.5 text-right">Net Proceeds</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
            {result.years
              .filter((y) => y.year >= 2)
              .map((y) => (
                <tr
                  key={y.year}
                  className={y.isOptimal ? "bg-emerald-50 dark:bg-emerald-900/10 font-semibold" : ""}
                >
                  <td className="py-1.5 text-slate-600 dark:text-slate-300">
                    {y.isOptimal ? "★ " : ""}Yr {y.year}
                  </td>
                  <td className={`py-1.5 text-right ${y.isOptimal ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}>
                    {y.irr.toFixed(1)}%
                  </td>
                  <td className="py-1.5 text-right text-slate-500">{formatINR(y.futureValue)}</td>
                  <td className="py-1.5 text-right text-slate-500">{formatINR(y.netSaleProceeds)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
