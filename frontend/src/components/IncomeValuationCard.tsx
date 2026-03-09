"use client";

import { useMemo } from "react";
import { Tooltip } from "@/lib/glossary";
import type { InvestmentInput, InvestmentMetrics } from "@/types/investment";

// ─── Inlined engine (subset) ──────────────────────────────────────────────

const CITY_BENCH: Record<string, { capRate: number; yieldLow: number; yieldHigh: number }> = {
  bangalore: { capRate: 3.8, yieldLow: 3.0, yieldHigh: 4.5 },
  mumbai:    { capRate: 3.0, yieldLow: 2.5, yieldHigh: 3.5 },
  delhi:     { capRate: 3.2, yieldLow: 2.5, yieldHigh: 3.8 },
  hyderabad: { capRate: 4.2, yieldLow: 3.5, yieldHigh: 5.0 },
  pune:      { capRate: 4.0, yieldLow: 3.2, yieldHigh: 4.8 },
  chennai:   { capRate: 3.6, yieldLow: 3.0, yieldHigh: 4.2 },
  kolkata:   { capRate: 4.0, yieldLow: 3.5, yieldHigh: 5.0 },
  ahmedabad: { capRate: 4.4, yieldLow: 3.8, yieldHigh: 5.5 },
  kochi:     { capRate: 4.2, yieldLow: 3.5, yieldHigh: 5.0 },
  jaipur:    { capRate: 4.6, yieldLow: 4.0, yieldHigh: 5.5 },
  lucknow:   { capRate: 4.8, yieldLow: 4.0, yieldHigh: 5.8 },
  indore:    { capRate: 5.0, yieldLow: 4.2, yieldHigh: 6.0 },
};
const DEFAULT_BENCH = { capRate: 4.0, yieldLow: 3.2, yieldHigh: 5.0 };

function normCity(city: string): string {
  const c = city.toLowerCase().trim();
  if (/bengaluru/.test(c)) return "bangalore";
  if (/gurgaon|gurugram|noida|new delhi|ncr/.test(c)) return "delhi";
  if (/navi mumbai|thane/.test(c)) return "mumbai";
  return c;
}

function fmt(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)}Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function IncomeValuationCard({ inputs, metrics }: Props) {
  const result = useMemo(() => {
    const bench = CITY_BENCH[normCity(inputs.city || "")] ?? DEFAULT_BENCH;
    const price = inputs.property_purchase_price;
    const grossRent = inputs.expected_monthly_rent * 12;
    const effRent = grossRent * (1 - inputs.vacancy_rate / 100);
    const noi = Math.max(0, effRent - inputs.annual_maintenance_cost);

    const grossYield = price > 0 ? (grossRent / price) * 100 : 0;
    const entryCap  = price > 0 ? (noi / price) * 100 : 0;
    const mktCap    = bench.capRate;
    const mktYieldMid = (bench.yieldLow + bench.yieldHigh) / 2;

    const incomeValue = bench.capRate > 0 ? Math.round(noi / (bench.capRate / 100)) : price;
    const premium = incomeValue > 0 ? Math.round(((price - incomeValue) / incomeValue) * 1000) / 10 : 0;
    const capGap  = Math.round((mktCap - entryCap) * 100) / 100;
    const gSecSpread = Math.round((grossYield - 7.1) * 100) / 100;

    const verdict =
      premium < -10 ? { label: "Attractive", color: "emerald" } :
      premium <=  15 ? { label: "Fair",        color: "sky"     } :
      premium <=  40 ? { label: "Stretched",   color: "amber"   } :
                       { label: "Expensive",   color: "rose"    };

    const incomeClass =
      grossYield >= mktYieldMid - 0.5 ? "Income-led" :
      grossYield >= mktYieldMid - 1.5 ? "Balanced"   : "Appreciation-dependent";

    return { noi, grossYield, entryCap, mktCap, mktYieldMid, incomeValue, premium, capGap, gSecSpread, verdict, incomeClass, bench, price };
  }, [inputs]);

  const { noi, grossYield, entryCap, mktCap, mktYieldMid, incomeValue, premium, capGap, gSecSpread, verdict, incomeClass, bench } = result;

  const verdictBg: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    sky:     "bg-sky-50 dark:bg-sky-900/20",
    amber:   "bg-amber-50 dark:bg-amber-900/20",
    rose:    "bg-rose-50 dark:bg-rose-900/20",
  };
  const verdictText: Record<string, string> = {
    emerald: "text-emerald-700 dark:text-emerald-400",
    sky:     "text-sky-700 dark:text-sky-400",
    amber:   "text-amber-700 dark:text-amber-400",
    rose:    "text-rose-700 dark:text-rose-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">🏦 Income Approach Valuation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional method: what price is justified by the income this property generates?
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${verdictBg[verdict.color]} ${verdictText[verdict.color]}`}>
          {verdict.label}
        </span>
      </div>

      {/* Three-metric comparison */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {/* Entry cap rate */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1 flex items-center">
            Your Entry Cap Rate
            <Tooltip content="NOI ÷ Purchase Price. The income return implied by the price you're paying. A lower entry cap rate than the market means you're paying a premium — relying more on appreciation." />
          </p>
          <p className={`text-xl font-black ${capGap > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {entryCap.toFixed(2)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">NOI: {fmt(noi)}/yr</p>
        </div>

        {/* Market cap rate */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1 flex items-center">
            Market Cap Rate
            <Tooltip content="The typical cap rate for similar properties in this city — derived from reported transactions. Buying at the market cap rate means you're paying a fair income-based price." />
          </p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">{mktCap.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Yield range: {bench.yieldLow}–{bench.yieldHigh}%</p>
        </div>

        {/* Income-based value */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1 flex items-center">
            Income Fair Value
            <Tooltip content="NOI ÷ Market Cap Rate. What this property would be worth if priced at the city's typical yield. If the asking price is above this, you're paying for expected future appreciation." />
          </p>
          <p className={`text-xl font-black ${premium > 15 ? "text-rose-600 dark:text-rose-400" : premium > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {fmt(incomeValue)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {premium > 0 ? `+${premium.toFixed(1)}% above` : `${Math.abs(premium).toFixed(1)}% below`} income value
          </p>
        </div>
      </div>

      {/* Yield spread row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: "Gross Yield", value: `${grossYield.toFixed(2)}%`, sub: "property", highlight: false, tip: "Annual rent ÷ property price. Raw rental income return before vacancy, maintenance, or tax deductions." },
          { label: "Market Yield", value: `${mktYieldMid.toFixed(1)}%`, sub: "city avg", highlight: false, tip: "The midpoint of the typical rental yield range for similar properties in this city." },
          { label: "vs G-Sec (7.1%)", value: `${gSecSpread >= 0 ? "+" : ""}${gSecSpread.toFixed(2)}pp`, sub: "spread", highlight: true, positive: gSecSpread >= 0, tip: "Your gross yield minus the 10-year Government Securities rate (7.1%). Positive = property out-yields a risk-free bond. Negative = you must rely on appreciation to beat the risk-free rate." },
        ].map((item) => (
          <div key={item.label} className="text-center rounded-lg bg-slate-50 dark:bg-slate-700/40 py-2 px-2">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
              {item.label}
              <Tooltip content={item.tip} position="bottom" />
            </p>
            <p className={`text-sm font-bold ${item.highlight ? (item.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400") : "text-slate-800 dark:text-slate-100"}`}>
              {item.value}
            </p>
            <p className="text-[10px] text-slate-400">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Income class badge + interpretation */}
      <div className="mt-3 flex items-start gap-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
          incomeClass === "Income-led" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
          incomeClass === "Balanced"   ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" :
                                         "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
        }`}>
          {incomeClass}
        </span>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {premium > 40
            ? `Buying at ${entryCap.toFixed(1)}% vs ${mktCap.toFixed(1)}% market cap rate — income fair value is ${fmt(incomeValue)}. At ${fmt(inputs.property_purchase_price)}, this investment relies heavily on capital appreciation to generate returns.`
            : premium > 15
            ? `Entry cap rate of ${entryCap.toFixed(1)}% is below the ${mktCap.toFixed(1)}% market average. Income fair value is ${fmt(incomeValue)}. Returns are partially appreciation-driven.`
            : premium > -10
            ? `Entry cap rate of ${entryCap.toFixed(1)}% is close to the ${mktCap.toFixed(1)}% market benchmark — price is broadly supported by income.`
            : `Strong income value — cap rate of ${entryCap.toFixed(1)}% exceeds the ${mktCap.toFixed(1)}% market average. Property is attractively priced relative to its income.`
          }
        </p>
      </div>

      {/* G-Sec warning */}
      {grossYield < 7.1 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2">
          <span className="text-rose-500 text-sm flex-shrink-0">⚠</span>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            Gross yield of {grossYield.toFixed(2)}% is below the 10-year G-Sec rate of 7.1%. This investment must rely on appreciation to outperform a risk-free government bond.
          </p>
        </div>
      )}
    </div>
  );
}
