"use client";

import { useMemo } from "react";
import type { InvestmentInput, InvestmentMetrics } from "@/types/investment";

// ─── Inlined engine ───────────────────────────────────────────────────────

const CITY_APPREC: Record<string, { avg: number; low: number; high: number; tier: 1|2|3 }> = {
  bangalore: { avg: 7.5, low: 6, high: 9,  tier: 1 },
  mumbai:    { avg: 6.5, low: 5, high: 8,  tier: 1 },
  delhi:     { avg: 6.0, low: 5, high: 7,  tier: 1 },
  hyderabad: { avg: 8.5, low: 7, high: 10, tier: 1 },
  pune:      { avg: 7.5, low: 6, high: 9,  tier: 1 },
  chennai:   { avg: 6.5, low: 5, high: 8,  tier: 1 },
  kolkata:   { avg: 5.5, low: 4, high: 7,  tier: 1 },
  ahmedabad: { avg: 6.5, low: 5, high: 8,  tier: 2 },
  kochi:     { avg: 7.0, low: 6, high: 8,  tier: 2 },
  jaipur:    { avg: 6.0, low: 5, high: 7,  tier: 2 },
  lucknow:   { avg: 5.5, low: 4, high: 7,  tier: 2 },
  surat:     { avg: 6.5, low: 5, high: 8,  tier: 2 },
  indore:    { avg: 6.5, low: 5, high: 8,  tier: 3 },
};
const TIER_APPREC: Record<1|2|3, { avg: number; low: number; high: number }> = {
  1: { avg: 6.5, low: 5, high: 8 },
  2: { avg: 6.0, low: 5, high: 7 },
  3: { avg: 6.5, low: 5, high: 8 },
};

function normCity(city: string): string {
  const c = city.toLowerCase().trim();
  if (/bengaluru/.test(c)) return "bangalore";
  if (/gurgaon|gurugram|noida|new delhi|ncr/.test(c)) return "delhi";
  if (/navi mumbai|thane/.test(c)) return "mumbai";
  return c;
}

function calcEMI(p: number, r: number, y: number): number {
  if (!p || !y) return 0;
  if (r === 0) return p / (y * 12);
  const mr = r / 100 / 12; const n = y * 12;
  return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

function bisIRR(flows: number[]): number {
  const npv = (r: number) => flows.reduce((s, cf, t) => { const d = Math.pow(1 + r, t); return s + (isFinite(d) && d > 1e-10 ? cf / d : 0); }, 0);
  for (let lo = -0.90; lo < 5.0; lo += 0.25) {
    const hi = lo + 0.25;
    if (npv(lo) * npv(hi) <= 0) {
      let l = lo, h = hi;
      for (let i = 0; i < 100; i++) { const mid = (l + h) / 2; if (Math.abs(h - l) < 1e-8) break; if (npv(l) * npv(mid) <= 0) h = mid; else l = mid; }
      return Math.round(((l + h) / 2) * 1000) / 10;
    }
  }
  return 0;
}

function calcIRRAtApprec(apprec: number, inp: InvestmentInput, loanAmount: number, effectiveDown: number): number {
  const emi = calcEMI(loanAmount, inp.loan_interest_rate, inp.loan_tenure_years);
  const annualEMI = emi * 12;
  const annualRent = inp.expected_monthly_rent * 12 * (1 - inp.vacancy_rate / 100);
  const annualCF = annualRent - annualEMI - inp.annual_maintenance_cost;
  const price = inp.property_purchase_price;
  const fv = price * Math.pow(1 + apprec / 100, inp.holding_period_years);
  const cgTax = Math.max(0, (fv - price) * 0.2);
  const r = inp.loan_interest_rate / 100 / 12; const n = inp.loan_tenure_years * 12;
  const paid = Math.min(inp.holding_period_years * 12, n);
  const remaining = r > 0 && n > paid ? emi * (1 - Math.pow(1 + r, -(n - paid))) / r : 0;
  const netSale = Math.max(0, fv - remaining - cgTax - fv * 0.03);
  const flows = [-effectiveDown];
  for (let yr = 1; yr <= inp.holding_period_years; yr++) flows.push(yr === inp.holding_period_years ? annualCF + netSale : annualCF);
  return bisIRR(flows);
}

interface Props { inputs: InvestmentInput; metrics: InvestmentMetrics; }

export function AppreciationValidationCard({ inputs, metrics }: Props) {
  const effectiveDown = metrics.effective_down_payment;

  const result = useMemo(() => {
    const key = normCity(inputs.city || "");
    const bench = CITY_APPREC[key];
    const tier = bench?.tier ?? 2;
    const tierDef = TIER_APPREC[tier];
    const avg = bench?.avg ?? tierDef.avg;
    const low = bench?.low ?? tierDef.low;
    const high = bench?.high ?? tierDef.high;
    const user = inputs.expected_annual_appreciation;
    const excess = Math.round((user - avg) * 10) / 10;

    const warnLevel: "ok" | "caution" | "aggressive" =
      excess > 4 ? "aggressive" : excess > 2 ? "caution" : "ok";

    const irrPoints = [0, 3, 5, 7, 10].map(rate => ({
      rate,
      irr: calcIRRAtApprec(rate, inputs, metrics.loan_amount, effectiveDown),
    }));

    return { avg, low, high, tier, excess, warnLevel, irrPoints, user };
  }, [inputs, metrics, effectiveDown]);

  const { avg, low, high, tier, excess, warnLevel, irrPoints, user } = result;

  const warnCfgMap: Record<"ok" | "caution" | "aggressive", { bg: string; text: string; icon: string; label: string }> = {
    ok:         { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300", icon: "✓", label: "Within Historical Range" },
    caution:    { bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-300",     icon: "⚠", label: "Above Historical Average" },
    aggressive: { bg: "bg-rose-50 dark:bg-rose-900/20",       text: "text-rose-700 dark:text-rose-300",       icon: "⚠", label: "Aggressive Assumption" },
  };
  const warnCfg = warnCfgMap[warnLevel];

  const userIRR = irrPoints.find(p => p.rate === 5)?.irr ?? metrics.irr;
  const stripedIRR = irrPoints[0].irr;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">📈 Appreciation Assumption Validator</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        How does your assumption compare to historical data — and what happens to IRR if appreciation disappoints?
      </p>

      {/* Comparison row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Your Assumption</p>
          <p className={`text-2xl font-black ${warnLevel === "ok" ? "text-emerald-600 dark:text-emerald-400" : warnLevel === "caution" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>{user}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">per year</p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Historical Avg</p>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{avg}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tier {tier} city avg</p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Historical Range</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{low}–{high}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">typical band</p>
        </div>
      </div>

      {/* Warning banner */}
      <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 mb-4 ${warnCfg.bg}`}>
        <span className={`text-sm flex-shrink-0 mt-0.5 ${warnCfg.text}`}>{warnCfg.icon}</span>
        <div>
          <p className={`text-xs font-semibold ${warnCfg.text}`}>{warnCfg.label}</p>
          <p className={`text-xs mt-0.5 ${warnCfg.text}`}>
            {warnLevel === "ok"
              ? `${user}% is within the historical range of ${low}–${high}% for Tier ${tier} cities. Assumption is reasonable.`
              : `${user}% is ${Math.abs(excess).toFixed(1)}pp above the historical average of ${avg}% for Tier ${tier} cities. ${warnLevel === "aggressive" ? "This is very optimistic — stress-test your returns below." : "Review the IRR sensitivity table carefully."}`
            }
          </p>
        </div>
      </div>

      {/* IRR Sensitivity Table */}
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">IRR at Different Appreciation Rates</p>
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="py-2.5 px-4 text-left text-xs font-medium text-slate-500">Appreciation</th>
              <th className="py-2.5 px-4 text-center text-xs font-medium text-slate-500">IRR</th>
              <th className="py-2.5 px-4 text-left text-xs font-medium text-slate-500">Assessment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
            {irrPoints.map(pt => {
              const isUser = Math.abs(pt.rate - user) < 0.5 || pt.rate === Math.round(user);
              const beats = pt.irr >= 8;
              const label =
                pt.rate === 0 ? "Appreciation-stripped" :
                pt.rate <= 3  ? "Conservative" :
                pt.rate <= 5  ? "Moderate" :
                pt.rate <= 7  ? "Optimistic" : "Very Optimistic";
              return (
                <tr key={pt.rate} className={isUser ? "bg-primary-50/50 dark:bg-primary-900/10 font-semibold" : ""}>
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-200">
                    {pt.rate === 0 ? "0% (no apprec.)" : `${pt.rate}% / year`}
                    {isUser && <span className="ml-1.5 text-[9px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-1.5 py-0.5 rounded-full font-medium">YOUR ASSUMPTION</span>}
                  </td>
                  <td className={`py-2.5 px-4 text-center font-bold ${beats ? "text-emerald-700 dark:text-emerald-400" : pt.irr > 0 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {pt.irr.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">{label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stripped IRR callout */}
      {stripedIRR <= 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2">
          <span className="text-rose-500 flex-shrink-0">⚠</span>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            <strong>Appreciation-Stripped IRR: {stripedIRR.toFixed(1)}%.</strong> If the property does not appreciate at all, this investment generates a negative return. The deal is 100% appreciation-dependent.
          </p>
        </div>
      )}
      {stripedIRR > 0 && stripedIRR < 5 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
          <span className="text-amber-500 flex-shrink-0">ℹ</span>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Appreciation-Stripped IRR: {stripedIRR.toFixed(1)}%.</strong> Income alone yields modest returns. A significant portion of the total return depends on appreciation materializing.
          </p>
        </div>
      )}
    </div>
  );
}
