"use client";

import { useMemo } from "react";
import type { InvestmentInput, InvestmentMetrics } from "@/types/investment";

// ─── Inlined city yield benchmarks ────────────────────────────────────────

const CITY_YIELD: Record<string, { low: number; high: number }> = {
  bangalore: { low: 3.0, high: 4.5 },
  mumbai:    { low: 2.5, high: 3.5 },
  delhi:     { low: 2.5, high: 3.8 },
  hyderabad: { low: 3.5, high: 5.0 },
  pune:      { low: 3.2, high: 4.8 },
  chennai:   { low: 3.0, high: 4.2 },
  kolkata:   { low: 3.5, high: 5.0 },
  ahmedabad: { low: 3.8, high: 5.5 },
  kochi:     { low: 3.5, high: 5.0 },
  jaipur:    { low: 4.0, high: 5.5 },
  lucknow:   { low: 4.0, high: 5.8 },
  surat:     { low: 3.8, high: 5.5 },
  indore:    { low: 4.2, high: 6.0 },
  nagpur:    { low: 4.0, high: 5.8 },
};
const DEFAULT_YIELD = { low: 3.2, high: 5.0 };

const G_SEC = 7.1;
const FD_RATE = 7.0;

function normCity(city: string): string {
  const c = city.toLowerCase().trim();
  if (/bengaluru/.test(c)) return "bangalore";
  if (/gurgaon|gurugram|noida|new delhi|ncr/.test(c)) return "delhi";
  if (/navi mumbai|thane/.test(c)) return "mumbai";
  return c;
}

// Horizontal bar component
function SpreadBar({ value, min, max }: { value: number; min: number; max: number }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-all bg-primary-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface Props { inputs: InvestmentInput; metrics: InvestmentMetrics; }

export function YieldSpreadCard({ inputs, metrics }: Props) {
  const result = useMemo(() => {
    const bench = CITY_YIELD[normCity(inputs.city || "")] ?? DEFAULT_YIELD;
    const price = inputs.property_purchase_price;
    const grossRent = inputs.expected_monthly_rent * 12;
    const effRent = grossRent * (1 - inputs.vacancy_rate / 100);
    const noi = Math.max(0, effRent - inputs.annual_maintenance_cost);

    const grossYield = price > 0 ? Math.round((grossRent / price) * 10000) / 100 : 0;
    const netYield   = price > 0 ? Math.round((noi / price) * 10000) / 100 : 0;
    const mktMid     = Math.round(((bench.low + bench.high) / 2) * 100) / 100;

    const vsMarket   = Math.round((grossYield - mktMid) * 100) / 100;
    const vsGSec     = Math.round((grossYield - G_SEC) * 100) / 100;
    const vsFD       = Math.round((grossYield - FD_RATE) * 100) / 100;

    const verdict =
      vsMarket >=  0.5 ? { label: "Beats Market",       color: "emerald" } :
      vsMarket >= -0.5 ? { label: "Near Market",         color: "sky"     } :
      vsMarket >= -1.5 ? { label: "Below Market",        color: "amber"   } :
                         { label: "Far Below Market",    color: "rose"    };

    const belowGSec = grossYield < G_SEC;
    const totalIRR = metrics.irr;
    const appreciationDep = totalIRR > 0
      ? Math.max(0, Math.min(100, Math.round(((totalIRR - netYield) / totalIRR) * 100)))
      : 100;

    return { bench, grossYield, netYield, mktMid, vsMarket, vsGSec, vsFD, verdict, belowGSec, appreciationDep };
  }, [inputs, metrics]);

  const { bench, grossYield, netYield, mktMid, vsMarket, vsGSec, vsFD, verdict, belowGSec, appreciationDep } = result;

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

  const spreadRows = [
    {
      label: "vs Market Yield",
      value: vsMarket,
      unit: "pp",
      tooltip: `Market yield range for this city: ${bench.low}–${bench.high}%`,
    },
    {
      label: "vs 10Y G-Sec (7.1%)",
      value: vsGSec,
      unit: "pp",
      tooltip: "Compared to current 10-year government bond yield of 7.1%",
    },
    {
      label: "vs Bank FD (7.0%)",
      value: vsFD,
      unit: "pp",
      tooltip: "Compared to typical bank fixed deposit rate of 7.0%",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">📐 Yield Spread Analysis</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            How does this property's income yield compare to market alternatives?
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ml-2 ${verdictBg[verdict.color]} ${verdictText[verdict.color]}`}>
          {verdict.label}
        </span>
      </div>

      {/* Yield trio */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Property Gross Yield", value: grossYield, note: "before expenses", color: verdict.color },
          { label: "Property Net Yield",   value: netYield,   note: "after expenses",  color: "slate" },
          { label: "Market Yield (city)",  value: mktMid,     note: `range: ${bench.low}–${bench.high}%`, color: "slate" },
        ].map(item => (
          <div key={item.label} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">{item.label}</p>
            <p className={`text-2xl font-black ${
              item.color === "emerald" ? "text-emerald-600 dark:text-emerald-400" :
              item.color === "sky"     ? "text-sky-600 dark:text-sky-400" :
              item.color === "amber"   ? "text-amber-600 dark:text-amber-400" :
              item.color === "rose"    ? "text-rose-600 dark:text-rose-400" :
                                         "text-slate-800 dark:text-slate-100"
            }`}>
              {item.value.toFixed(2)}%
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Spread comparison */}
      <div className="mt-3 space-y-2.5">
        {spreadRows.map(row => (
          <div key={row.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                {row.label}
                <span className="text-slate-300 dark:text-slate-500 cursor-help text-[10px]" title={row.tooltip}>ⓘ</span>
              </span>
              <span className={`text-xs font-bold ${
                row.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {row.value >= 0 ? "+" : ""}{row.value.toFixed(2)}{row.unit}
              </span>
            </div>
            <SpreadBar value={row.value} min={-4} max={4} />
          </div>
        ))}
      </div>

      {/* Appreciation dependency gauge */}
      <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Appreciation Dependency
            <span className="ml-1 text-slate-400 cursor-help text-[10px]" title="% of total return that must come from price appreciation rather than rental income">ⓘ</span>
          </p>
          <p className={`text-sm font-bold ${
            appreciationDep >= 80 ? "text-rose-600 dark:text-rose-400" :
            appreciationDep >= 50 ? "text-amber-600 dark:text-amber-400" :
                                    "text-emerald-600 dark:text-emerald-400"
          }`}>
            {appreciationDep}%
          </p>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              appreciationDep >= 80 ? "bg-rose-500" :
              appreciationDep >= 50 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${appreciationDep}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">
          {appreciationDep >= 80
            ? "Returns are almost entirely appreciation-driven — income provides minimal cushion."
            : appreciationDep >= 50
            ? "Roughly half the return depends on appreciation materializing."
            : "Good income coverage — appreciation is a bonus, not a requirement."
          }
        </p>
      </div>

      {/* G-Sec warning */}
      {belowGSec && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2">
          <span className="text-rose-500 flex-shrink-0">⚠</span>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            This property's gross yield of <strong>{grossYield.toFixed(2)}%</strong> is below the risk-free 10Y G-Sec rate of 7.1%. A government bond pays more income with zero risk. Returns depend on appreciation.
          </p>
        </div>
      )}
    </div>
  );
}
