"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import type { InvestmentInput, InvestmentMetrics } from "@/types/investment";
import { Tooltip } from "@/lib/glossary";

// ─── Engine ────────────────────────────────────────────────────────────────

function fmt(v: number): string {
  const a = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (a >= 10_000_000) return `${s}₹${(a / 10_000_000).toFixed(2)}Cr`;
  if (a >= 100_000)    return `${s}₹${(a / 100_000).toFixed(1)}L`;
  if (a >= 1_000)      return `${s}₹${(a / 1_000).toFixed(0)}K`;
  return `${s}₹${a.toLocaleString("en-IN")}`;
}

function calcEMI(p: number, r: number, y: number): number {
  if (!p || !y) return 0;
  if (r === 0) return p / (y * 12);
  const mr = r / 100 / 12; const n = y * 12;
  return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
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

interface RenovScenario {
  label: string;
  cost: number;
  rentBoost: number;       // % increase in monthly rent
  apprecBoost: number;     // pp boost to annual appreciation
  holdExtension: number;   // extra years
}

const PRESETS: RenovScenario[] = [
  { label: "Light Refresh",     cost: 200_000,   rentBoost: 5,  apprecBoost: 0.3, holdExtension: 0 },
  { label: "Full Renovation",   cost: 600_000,   rentBoost: 15, apprecBoost: 0.8, holdExtension: 1 },
  { label: "Premium Upgrade",   cost: 1_200_000, rentBoost: 25, apprecBoost: 1.5, holdExtension: 2 },
  { label: "Custom",            cost: 0,         rentBoost: 0,  apprecBoost: 0,   holdExtension: 0 },
];

function calcMetrics(inp: InvestmentInput, metrics: InvestmentMetrics, reno: RenovScenario) {
  const effectiveDown = metrics.effective_down_payment;
  const loanAmt = metrics.loan_amount;
  const emi = calcEMI(loanAmt, inp.loan_interest_rate, inp.loan_tenure_years);
  const annualEMI = emi * 12;
  const holdYrs = inp.holding_period_years + reno.holdExtension;

  // Renovation: add cost to effective equity invested
  const totalInvested = effectiveDown + reno.cost;

  // Boosted rent
  const newMonthlyRent = inp.expected_monthly_rent * (1 + reno.rentBoost / 100);
  const annualRent = newMonthlyRent * 12 * (1 - inp.vacancy_rate / 100);
  const annualCF = annualRent - annualEMI - inp.annual_maintenance_cost;

  // Boosted appreciation
  const newApprec = inp.expected_annual_appreciation + reno.apprecBoost;
  const price = inp.property_purchase_price;
  const fv = price * Math.pow(1 + newApprec / 100, holdYrs);
  const cgTax = Math.max(0, (fv - price) * 0.125); // 12.5% LTCG

  const mr = inp.loan_interest_rate / 100 / 12;
  const n = inp.loan_tenure_years * 12;
  const paidM = Math.min(holdYrs * 12, n);
  const remaining = mr > 0 && n > paidM
    ? emi * (1 - Math.pow(1 + mr, -(n - paidM))) / mr
    : 0;
  const netSale = Math.max(0, fv - remaining - cgTax - fv * 0.03);

  const flows = [-totalInvested];
  for (let yr = 1; yr <= holdYrs; yr++)
    flows.push(yr === holdYrs ? annualCF + netSale : annualCF);

  const irr = bisIRR(flows);

  // Renovation-specific metrics
  const rentalGainPerYear = (newMonthlyRent - inp.expected_monthly_rent) * 12 * (1 - inp.vacancy_rate / 100);
  const apprecGain = fv - price * Math.pow(1 + inp.expected_annual_appreciation / 100, holdYrs);
  const totalValueCreated = rentalGainPerYear * holdYrs + apprecGain;
  const renoROI = reno.cost > 0 ? Math.round((totalValueCreated / reno.cost) * 100) : 0;
  const renoPayback = rentalGainPerYear > 0 ? Math.ceil(reno.cost / rentalGainPerYear) : 999;

  return { irr, annualCF, newMonthlyRent, fv, totalValueCreated, renoROI, renoPayback, newApprec, holdYrs };
}

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function RenovationValueAddCard({ inputs, metrics }: Props) {
  const [presetIdx, setPresetIdx] = useState(1);
  const [custom, setCustom] = useState<RenovScenario>({ label: "Custom", cost: 500_000, rentBoost: 10, apprecBoost: 0.5, holdExtension: 0 });

  const isCustom = presetIdx === 3;
  const scenario = isCustom ? custom : PRESETS[presetIdx];

  // Base (no renovation)
  const base = useMemo(() => calcMetrics(inputs, metrics, { label: "No Reno", cost: 0, rentBoost: 0, apprecBoost: 0, holdExtension: 0 }), [inputs, metrics]);

  const reno = useMemo(() => calcMetrics(inputs, metrics, scenario), [inputs, metrics, scenario]);

  const irrDelta = Math.round((reno.irr - base.irr) * 10) / 10;
  const cfDelta = Math.round(reno.annualCF - base.annualCF);
  const isPositive = irrDelta >= 0;

  const chartData = [
    { name: "No Renovation", IRR: base.irr, CF: Math.round(base.annualCF / 12 / 1000) },
    { name: "With Renovation", IRR: reno.irr, CF: Math.round(reno.annualCF / 12 / 1000) },
  ];

  const verdictColor = irrDelta >= 1.5 ? "emerald" : irrDelta >= 0 ? "sky" : "rose";
  const verdictBg: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    sky: "bg-sky-50 dark:bg-sky-900/20",
    rose: "bg-rose-50 dark:bg-rose-900/20",
  };
  const verdictText: Record<string, string> = {
    emerald: "text-emerald-700 dark:text-emerald-400",
    sky: "text-sky-700 dark:text-sky-400",
    rose: "text-rose-700 dark:text-rose-400",
  };

  const verdict =
    irrDelta >= 2.0  ? "Excellent ROI"  :
    irrDelta >= 1.0  ? "Good ROI"       :
    irrDelta >= 0    ? "Marginal ROI"   :
    irrDelta >= -1.0 ? "Negative ROI"   : "Value Destructive";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            🔨 Renovation / Value-Add Model
            <Tooltip content="Tests whether spending money on renovation adds more value than it costs. Calculates the impact on IRR, monthly rent, and total value created from both higher rents and boosted appreciation." maxWidth={300} />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Should you renovate before renting? Model the financial impact.
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ml-2 ${verdictBg[verdictColor]} ${verdictText[verdictColor]}`}>
          {verdict}
        </span>
      </div>

      {/* Preset selector */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setPresetIdx(i)}
            className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
              presetIdx === i
                ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-600"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-400"
            }`}
          >
            <div className="font-semibold">{p.label}</div>
            {i < 3 && <div className="text-[10px] mt-0.5 opacity-70">{fmt(p.cost)}</div>}
          </button>
        ))}
      </div>

      {/* Custom inputs */}
      {isCustom && (
        <div className="grid grid-cols-2 gap-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 p-4">
          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-1 block">Renovation Cost (₹)</label>
            <input type="number" value={custom.cost} step={50_000}
              onChange={e => setCustom(p => ({ ...p, cost: +e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100" />
            <p className="text-[10px] text-slate-400 mt-0.5">{fmt(custom.cost)}</p>
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-1 block flex items-center gap-1">
              Rent Increase (%)
              <Tooltip content="How much will monthly rent increase after renovation? E.g. 15% on ₹35,000 rent = ₹5,250/mo more." />
            </label>
            <input type="number" value={custom.rentBoost} step={1} min={0} max={100}
              onChange={e => setCustom(p => ({ ...p, rentBoost: +e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-1 block flex items-center gap-1">
              Appreciation Boost (pp/yr)
              <Tooltip content="How many extra percentage points of annual appreciation does renovation add? E.g. 0.5 means if base appreciation is 6%, it becomes 6.5%." />
            </label>
            <input type="number" value={custom.apprecBoost} step={0.1} min={0} max={5}
              onChange={e => setCustom(p => ({ ...p, apprecBoost: +e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-1 block flex items-center gap-1">
              Extended Hold (yrs)
              <Tooltip content="If renovation requires delaying rental income or you plan to hold longer for the value to compound, add extra years here." />
            </label>
            <input type="number" value={custom.holdExtension} step={1} min={0} max={5}
              onChange={e => setCustom(p => ({ ...p, holdExtension: +e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100" />
          </div>
        </div>
      )}

      {/* Scenario summary row */}
      {!isCustom && (
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          {[
            { label: "Renovation Cost", value: fmt(scenario.cost), tip: "Upfront cost added to your equity investment." },
            { label: "Rent Boost", value: `+${scenario.rentBoost}%`, tip: `Monthly rent rises from ${fmt(inputs.expected_monthly_rent)} to ${fmt(Math.round(inputs.expected_monthly_rent * (1 + scenario.rentBoost / 100)))}` },
            { label: "Appreciation Boost", value: `+${scenario.apprecBoost}pp`, tip: `Annual appreciation rises from ${inputs.expected_annual_appreciation}% to ${inputs.expected_annual_appreciation + scenario.apprecBoost}%` },
          ].map(item => (
            <div key={item.label} className="rounded-lg bg-slate-50 dark:bg-slate-700/40 py-2 px-2">
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">{item.label}<Tooltip content={item.tip} position="bottom" /></p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Key deltas */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
        {[
          {
            label: "IRR Impact",
            value: `${irrDelta >= 0 ? "+" : ""}${irrDelta.toFixed(1)}pp`,
            sub: `${base.irr.toFixed(1)}% → ${reno.irr.toFixed(1)}%`,
            good: irrDelta > 0,
            tip: "Change in annualised return (IRR) from doing the renovation vs not doing it.",
          },
          {
            label: "Monthly CF Impact",
            value: `${cfDelta >= 0 ? "+" : ""}${fmt(Math.round(cfDelta / 12))}`,
            sub: `${fmt(Math.round(base.annualCF / 12))}/mo → ${fmt(Math.round(reno.annualCF / 12))}/mo`,
            good: cfDelta > 0,
            tip: "Change in monthly cash flow after renovation (higher rent minus same EMI).",
          },
          {
            label: "Reno ROI",
            value: reno.renoROI > 0 ? `${reno.renoROI}%` : "N/A",
            sub: "on renovation spend",
            good: (reno.renoROI ?? 0) > 100,
            tip: "Total value created (extra rent + appreciation uplift) divided by renovation cost. >100% means you got your renovation money back.",
          },
          {
            label: "Rent Payback",
            value: reno.renoPayback < 30 ? `${reno.renoPayback} yrs` : "30+ yrs",
            sub: "via rent income only",
            good: reno.renoPayback <= inputs.holding_period_years,
            tip: "How many years of increased rental income needed to recover the renovation cost — income only, excludes appreciation gains.",
          },
        ].map(m => (
          <div key={m.label} className={`rounded-xl border p-3 ${
            m.good ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/15"
                   : "border-rose-200 bg-rose-50 dark:border-rose-800/40 dark:bg-rose-900/15"
          }`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-0.5">
              {m.label}<Tooltip content={m.tip} />
            </p>
            <p className={`text-lg font-black ${m.good ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
              {m.value}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart: IRR comparison */}
      <div className="h-44 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="35%" margin={{ left: 5, right: 5, top: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis yAxisId="irr" orientation="left" tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis yAxisId="cf" orientation="right" tickFormatter={v => `₹${v}K`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <RechartTooltip
              formatter={(v: number, name: string) => [name === "IRR" ? `${v}%` : `₹${v}K/mo`, name]}
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }}
            />
            <ReferenceLine yAxisId="cf" y={0} stroke="#64748b" strokeDasharray="3 3" />
            <Bar yAxisId="irr" dataKey="IRR" name="IRR" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? "#64748b" : isPositive ? "#10b981" : "#f43f5e"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Value creation breakdown */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 px-4 py-3">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Total Value Created by Renovation</p>
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <div>Extra rental income over {reno.holdYrs}yrs: <span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(Math.round((reno.newMonthlyRent - inputs.expected_monthly_rent) * 12 * (1 - inputs.vacancy_rate / 100) * reno.holdYrs))}</span></div>
            <div>Appreciation uplift at exit: <span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(Math.max(0, Math.round(reno.fv - inputs.property_purchase_price * Math.pow(1 + inputs.expected_annual_appreciation / 100, reno.holdYrs))))}</span></div>
            <div>Renovation cost: <span className="font-semibold text-rose-600 dark:text-rose-400">-{fmt(scenario.cost)}</span></div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Net value created</p>
            <p className={`text-2xl font-black ${reno.totalValueCreated > scenario.cost ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {fmt(Math.round(reno.totalValueCreated - scenario.cost))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
