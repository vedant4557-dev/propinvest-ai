"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import type { InvestmentInput, InvestmentMetrics, TaxAnalysis } from "@/types/investment";
import { Tooltip } from "@/lib/glossary";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(v: number): string {
  const a = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (a >= 10_000_000) return `${s}₹${(a / 10_000_000).toFixed(1)}Cr`;
  if (a >= 100_000)    return `${s}₹${(a / 100_000).toFixed(1)}L`;
  return `${s}₹${a.toLocaleString("en-IN")}`;
}

function calcEMI(p: number, r: number, y: number): number {
  if (!p || !y) return 0;
  if (r === 0) return p / (y * 12);
  const mr = r / 100 / 12; const n = y * 12;
  return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

// ─── Alternative investment engine ─────────────────────────────────────────

interface AltPoint {
  year: number;
  realEstate: number;         // net equity + cumulative CF invested
  nifty50: number;            // lump sum + SIP of EMI-equivalent monthly
  mutualFund: number;         // balanced fund (equity + debt)
  fd: number;                 // bank FD
  gold: number;               // gold CAGR
  label: string;
}

interface AltConfig {
  niftyCAGR: number;
  mfCAGR: number;
  fdRate: number;
  goldCAGR: number;
  taxOnEquityGains: number;   // LTCG on equity: 12.5% after ₹1.25L
  reinvestCashflow: boolean;  // reinvest real estate CF into Nifty?
}

const DEFAULTS: AltConfig = {
  niftyCAGR: 12,
  mfCAGR: 10,
  fdRate: 7,
  goldCAGR: 8,
  taxOnEquityGains: 12.5,
  reinvestCashflow: true,
};

function projectAlternatives(
  inp: InvestmentInput,
  metrics: InvestmentMetrics,
  taxAnalysis: TaxAnalysis | null | undefined,
  cfg: AltConfig,
  years: number
): AltPoint[] {
  const equity = metrics.effective_down_payment;  // same money, different allocation
  const emi = calcEMI(metrics.loan_amount, inp.loan_interest_rate, inp.loan_tenure_years);
  const mr = inp.loan_interest_rate / 100 / 12;
  const tenureM = inp.loan_tenure_years * 12;

  // Monthly cash flow from property (can be negative)
  const monthlyRent = inp.expected_monthly_rent * (1 - inp.vacancy_rate / 100);
  const monthlyMaint = inp.annual_maintenance_cost / 12;
  const monthlyCF = monthlyRent - emi - monthlyMaint; // negative = you top up

  const points: AltPoint[] = [];

  // Alt: invest equity as lump sum, and monthly top-up (if CF negative) as SIP
  // If CF positive: reinvest that too (if cfg.reinvestCashflow)
  let niftyVal = equity;
  let mfVal = equity;
  let fdVal = equity;
  let goldVal = equity;

  // Monthly SIP amounts:
  // If RE is cash-flow negative, you'd invest that extra monthly in alts
  // If RE is cash-flow positive and reinvestCashflow, you'd invest it too
  const monthlySIP = cfg.reinvestCashflow
    ? Math.max(0, -monthlyCF)   // only the top-up amount for negCF scenarios
    : Math.max(0, -monthlyCF);  // always add cash you'd have needed to top up

  const extraMonthly = cfg.reinvestCashflow && monthlyCF > 0 ? monthlyCF : 0;

  for (let yr = 0; yr <= years; yr++) {
    if (yr > 0) {
      // Grow each asset class monthly
      const niftyMonthly = cfg.niftyCAGR / 100 / 12;
      const mfMonthly    = cfg.mfCAGR / 100 / 12;
      const fdMonthly    = cfg.fdRate / 100 / 12;
      const goldMonthly  = cfg.goldCAGR / 100 / 12;

      for (let m = 0; m < 12; m++) {
        niftyVal = niftyVal * (1 + niftyMonthly) + monthlySIP + extraMonthly;
        mfVal    = mfVal    * (1 + mfMonthly)    + monthlySIP + extraMonthly;
        fdVal    = fdVal    * (1 + fdMonthly)     + monthlySIP * 0.5; // FD less liquid, half SIP
        goldVal  = goldVal  * (1 + goldMonthly);   // gold = lump sum only
      }
    }

    // Real estate value at this year
    const propVal = inp.property_purchase_price * Math.pow(1 + inp.expected_annual_appreciation / 100, yr);
    const paidM = Math.min(yr * 12, tenureM);
    const loanBal = mr > 0 && tenureM > paidM
      ? emi * (1 - Math.pow(1 + mr, -(tenureM - paidM))) / mr
      : 0;

    // Cumulative net rent collected (reinvested at FD rate)
    let cumulativeCFValue = 0;
    for (let y2 = 1; y2 <= yr; y2++) {
      const rentY = inp.expected_monthly_rent * Math.pow(1 + (inp.rent_growth_rate ?? 4) / 100, y2) * 12 * (1 - inp.vacancy_rate / 100);
      const emiY = Math.min(y2 * 12, tenureM) < tenureM ? emi * 12 : 0;
      const cfY = rentY - emiY - inp.annual_maintenance_cost;
      if (cfY > 0 && cfg.reinvestCashflow) {
        cumulativeCFValue += cfY * Math.pow(1 + cfg.fdRate / 100, yr - y2);
      }
    }

    const reEquity = propVal - loanBal + cumulativeCFValue;

    points.push({
      year: yr,
      realEstate: Math.round(reEquity / 100_000) / 10,
      nifty50:    Math.round(niftyVal / 100_000) / 10,
      mutualFund: Math.round(mfVal / 100_000) / 10,
      fd:         Math.round(fdVal / 100_000) / 10,
      gold:       Math.round(goldVal / 100_000) / 10,
      label:      `Year ${yr}`,
    });
  }

  return points;
}

// ─── Winner calculator ──────────────────────────────────────────────────────

function getWinner(points: AltPoint[], years: number): string {
  const last = points[years];
  const vals: [string, number][] = [
    ["Real Estate",  last.realEstate],
    ["Nifty 50",     last.nifty50],
    ["Mutual Fund",  last.mutualFund],
    ["Fixed Deposit",last.fd],
    ["Gold",         last.gold],
  ];
  vals.sort((a, b) => b[1] - a[1]);
  return vals[0][0];
}

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
  taxAnalysis?: TaxAnalysis | null;
}

const SCENARIO_PRESETS = [
  { label: "Bull Market (Nifty 15%)", nifty: 15, mf: 12 },
  { label: "Base Case (Nifty 12%)",   nifty: 12, mf: 10 },
  { label: "Bear Market (Nifty 8%)",  nifty: 8,  mf: 7  },
];

export function NiftyComparatorCard({ inputs, metrics, taxAnalysis }: Props) {
  const [cfg, setCfg] = useState<AltConfig>({ ...DEFAULTS });
  const [years] = useState(20);
  const [activeScenario, setActiveScenario] = useState(1);

  const points = useMemo(
    () => projectAlternatives(inputs, metrics, taxAnalysis, cfg, years),
    [inputs, metrics, taxAnalysis, cfg, years]
  );

  const lastPoint = points[years];
  const winner = getWinner(points, years);
  const currentYear = new Date().getFullYear();

  const chartData = points.map(p => ({
    year: `${currentYear + p.year}`,
    "Real Estate": p.realEstate,
    "Nifty 50": p.nifty50,
    "Mutual Fund": p.mutualFund,
    "FD": p.fd,
    "Gold": p.gold,
  }));

  const equity = metrics.effective_down_payment;
  const monthlySIP = Math.max(0, -(inputs.expected_monthly_rent * (1 - inputs.vacancy_rate / 100) - calcEMI(metrics.loan_amount, inputs.loan_interest_rate, inputs.loan_tenure_years) - inputs.annual_maintenance_cost / 12));

  const applyPreset = (idx: number) => {
    setActiveScenario(idx);
    setCfg(p => ({ ...p, niftyCAGR: SCENARIO_PRESETS[idx].nifty, mfCAGR: SCENARIO_PRESETS[idx].mf }));
  };

  const LINES = [
    { key: "Real Estate", color: "#0ea5e9", width: 3 },
    { key: "Nifty 50",    color: "#10b981", width: 2 },
    { key: "Mutual Fund", color: "#f59e0b", width: 2 },
    { key: "FD",          color: "#64748b", width: 1.5 },
    { key: "Gold",        color: "#f97316", width: 1.5 },
  ];

  const reWins = winner === "Real Estate";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            📊 Real Estate vs. Alternatives
            <Tooltip content="Compares your real estate investment to putting the same money in Nifty50, Mutual Funds, FD, or Gold. Uses identical starting capital (your down payment) and adds any monthly top-up as SIP to alternatives." maxWidth={320} />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            If you invested {fmt(equity)} in these instead — which wins over 20 years?
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ml-2 ${
          reWins
            ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        }`}>
          {winner} wins
        </span>
      </div>

      {/* Methodology note */}
      <div className="mt-2 mb-4 text-[10px] text-slate-400 flex items-start gap-1">
        <span className="flex-shrink-0">ℹ</span>
        <span>
          Starting capital: {fmt(equity)} (your down payment + acquisition costs).
          {monthlySIP > 500 && ` Monthly top-up of ${fmt(Math.round(monthlySIP))}/mo (your cash-flow shortfall) added as SIP to all alternatives.`}
          {monthlySIP <= 500 && " Your property has positive/neutral cash flow — no additional SIP needed."}
        </span>
      </div>

      {/* Scenario presets */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {SCENARIO_PRESETS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => applyPreset(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeScenario === i
                ? "bg-primary-600 text-white"
                : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 0, right: 10, top: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={3} />
            <YAxis tickFormatter={v => `₹${v}Cr`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <RechartTooltip
              formatter={(v: number, name: string) => [`₹${v.toFixed(1)}Cr`, name]}
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {LINES.map(l => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                strokeWidth={l.width}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 20-year outcomes grid */}
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {[
          { label: "Real Estate", val: lastPoint.realEstate, color: "#0ea5e9", isRE: true },
          { label: "Nifty 50",    val: lastPoint.nifty50,    color: "#10b981", isRE: false },
          { label: "Mut. Fund",   val: lastPoint.mutualFund, color: "#f59e0b", isRE: false },
          { label: "FD",          val: lastPoint.fd,         color: "#64748b", isRE: false },
          { label: "Gold",        val: lastPoint.gold,       color: "#f97316", isRE: false },
        ].map((item) => {
          const isWinner = (item.label === "Real Estate" && winner === "Real Estate") ||
                           (item.label === "Nifty 50" && winner === "Nifty 50") ||
                           (item.label === "Mut. Fund" && winner === "Mutual Fund") ||
                           (item.label === "FD" && winner === "Fixed Deposit") ||
                           (item.label === "Gold" && winner === "Gold");
          return (
            <div key={item.label} className={`rounded-xl p-2.5 text-center border ${
              isWinner
                ? "border-2 border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40"
            }`}>
              <p className="text-[9px] font-medium text-slate-400 truncate">{item.label}</p>
              <p className="text-sm font-black mt-0.5" style={{ color: item.color }}>
                ₹{item.val.toFixed(1)}Cr
              </p>
              <p className="text-[9px] text-slate-400">
                {((item.val * 10_00_000) / equity).toFixed(1)}x
              </p>
              {isWinner && <p className="text-[9px] font-bold text-primary-600 dark:text-primary-400 mt-0.5">Winner</p>}
            </div>
          );
        })}
      </div>

      {/* Real estate advantages */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            Real Estate Advantages
            <Tooltip content="What real estate offers that alternatives cannot match." />
          </p>
          <ul className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
            <li className="flex gap-1"><span className="text-emerald-500">✓</span> Leverage (4x+ assets on your capital)</li>
            <li className="flex gap-1"><span className="text-emerald-500">✓</span> Monthly passive income</li>
            <li className="flex gap-1"><span className="text-emerald-500">✓</span> Tangible asset, inflation hedge</li>
            <li className="flex gap-1"><span className="text-emerald-500">✓</span> Sec 24(b) tax deduction on interest</li>
            <li className="flex gap-1"><span className="text-emerald-500">✓</span> Can renovate to add value</li>
          </ul>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            Real Estate Disadvantages
            <Tooltip content="What real estate cannot offer compared to liquid alternatives." />
          </p>
          <ul className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
            <li className="flex gap-1"><span className="text-rose-500">✗</span> Illiquid &mdash; can&apos;t sell in a day</li>
            <li className="flex gap-1"><span className="text-rose-500">✗</span> High transaction costs (8–9%)</li>
            <li className="flex gap-1"><span className="text-rose-500">✗</span> Tenant/maintenance headaches</li>
            <li className="flex gap-1"><span className="text-rose-500">✗</span> LTCG on sale (12.5%+)</li>
            <li className="flex gap-1"><span className="text-rose-500">✗</span> City-concentrated risk</li>
          </ul>
        </div>
      </div>

      {/* Assumption sliders */}
      <details className="group">
        <summary className="cursor-pointer text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors select-none">
          ▸ Adjust return assumptions
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Nifty50 CAGR", key: "niftyCAGR", min: 5, max: 20, step: 0.5 },
            { label: "Mutual Fund",  key: "mfCAGR",    min: 4, max: 18, step: 0.5 },
            { label: "FD Rate",      key: "fdRate",     min: 4, max: 10, step: 0.25 },
            { label: "Gold CAGR",    key: "goldCAGR",   min: 3, max: 14, step: 0.5 },
          ].map(s => (
            <div key={s.key}>
              <label className="text-[10px] font-medium text-slate-500 mb-1 flex justify-between">
                <span>{s.label}</span>
                <span className="text-primary-500">{(cfg as unknown as Record<string, number>)[s.key]}%</span>
              </label>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={(cfg as Record<string, number>)[s.key]}
                onChange={e => {
                  setActiveScenario(-1);
                  setCfg(p => ({ ...p, [s.key]: +e.target.value }));
                }}
                className="w-full accent-primary-500"
              />
            </div>
          ))}
        </div>
      </details>

      {/* Verdict */}
      <div className={`mt-4 rounded-xl px-4 py-3 flex items-start gap-3 ${
        reWins
          ? "bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/40"
          : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40"
      }`}>
        <span className="flex-shrink-0 text-lg">{reWins ? "🏆" : "📈"}</span>
        <div>
          <p className={`text-xs font-semibold ${reWins ? "text-sky-800 dark:text-sky-300" : "text-amber-800 dark:text-amber-300"}`}>
            {reWins
              ? `Real estate wins over ${years} years in this scenario`
              : `${winner} outperforms real estate over ${years} years in this scenario`}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {reWins
              ? `Your property equity of ₹${lastPoint.realEstate.toFixed(1)}Cr beats ${winner === "Nifty 50" ? "Nifty" : winner} due to leverage amplifying ${inputs.expected_annual_appreciation}% appreciation on a ${fmt(inputs.property_purchase_price)} asset.`
              : `At Nifty ${cfg.niftyCAGR}% CAGR, stocks beat real estate here. Real estate advantage is leverage + income, not pure returns. Try Bear Market scenario or lower appreciation assumptions.`}
          </p>
        </div>
      </div>
    </div>
  );
}
