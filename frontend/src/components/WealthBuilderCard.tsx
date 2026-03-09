"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import type { InvestmentInput, InvestmentMetrics } from "@/types/investment";
import { Tooltip } from "@/lib/glossary";

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmt(v: number): string {
  const a = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (a >= 10_000_000) return `${s}₹${(a / 10_000_000).toFixed(1)}Cr`;
  if (a >= 100_000)    return `${s}₹${(a / 100_000).toFixed(1)}L`;
  if (a >= 1_000)      return `${s}₹${(a / 1_000).toFixed(0)}K`;
  return `${s}₹${a.toLocaleString("en-IN")}`;
}

function fmtCr(v: number): string {
  if (Math.abs(v) >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)} Cr`;
  return fmt(v);
}

function calcEMI(p: number, r: number, y: number): number {
  if (!p || !y) return 0;
  if (r === 0) return p / (y * 12);
  const mr = r / 100 / 12; const n = y * 12;
  return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

// ─── Wealth projection engine ──────────────────────────────────────────────

interface WealthPoint {
  year: number;
  propertyValue: number;
  loanBalance: number;
  equity: number;           // property equity
  cashSavings: number;      // cumulative cash flow invested at assumed rate
  totalNetWorth: number;
  passiveIncome: number;    // annual net rent
  cumulativeRent: number;
  label: string;
}

interface WealthConfig {
  numProperties: number;    // number of identical properties (simplification)
  savingsRate: number;      // % return on cash savings/reinvestment
  fireTarget: number;       // annual passive income target for FIRE (₹)
  rentGrowthRate: number;
}

function projectWealth(
  inp: InvestmentInput,
  metrics: InvestmentMetrics,
  cfg: WealthConfig,
  years: number,
): WealthPoint[] {
  const props = cfg.numProperties;
  const emi = calcEMI(metrics.loan_amount, inp.loan_interest_rate, inp.loan_tenure_years);
  const mr = inp.loan_interest_rate / 100 / 12;
  const tenureM = inp.loan_tenure_years * 12;

  let cashSavings = 0;
  let cumulativeRent = 0;

  const points: WealthPoint[] = [];

  for (let yr = 0; yr <= years; yr++) {
    // Property value per property
    const propVal = inp.property_purchase_price * Math.pow(1 + inp.expected_annual_appreciation / 100, yr);

    // Loan balance per property
    const paidM = Math.min(yr * 12, tenureM);
    const loanBal = mr > 0 && tenureM > paidM
      ? emi * (1 - Math.pow(1 + mr, -(tenureM - paidM))) / mr
      : 0;

    // Annual rent with growth
    const monthlyRent = inp.expected_monthly_rent * Math.pow(1 + (cfg.rentGrowthRate || 4) / 100, yr);
    const annualRent = monthlyRent * 12 * (1 - inp.vacancy_rate / 100) - inp.annual_maintenance_cost;
    const annualEMI = Math.min(yr * 12, tenureM) < tenureM ? emi * 12 : 0;
    const annualCF = annualRent - annualEMI;

    if (yr > 0) {
      cumulativeRent += annualRent * props;
      cashSavings = cashSavings * (1 + cfg.savingsRate / 100) + annualCF * props;
    }

    const equity = (propVal - loanBal) * props;
    const totalNW = equity + Math.max(0, cashSavings);
    const passiveIncome = annualRent * props;

    points.push({
      year: yr,
      propertyValue: Math.round(propVal * props),
      loanBalance: Math.round(loanBal * props),
      equity: Math.round(equity),
      cashSavings: Math.round(Math.max(0, cashSavings)),
      totalNetWorth: Math.round(totalNW),
      passiveIncome: Math.round(passiveIncome),
      cumulativeRent: Math.round(cumulativeRent),
      label: `Year ${yr}`,
    });
  }

  return points;
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatBox({ label, value, sub, good, tip }: { label: string; value: string; sub?: string; good?: boolean; tip?: string }) {
  return (
    <div className={`rounded-xl p-3.5 text-center ${
      good === true  ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/15 dark:border-emerald-800/40" :
      good === false ? "bg-amber-50 border border-amber-200 dark:bg-amber-900/15 dark:border-amber-800/40" :
                       "bg-slate-50 border border-slate-200 dark:bg-slate-700/40 dark:border-slate-600"
    }`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-0.5">
        {label}{tip && <Tooltip content={tip} />}
      </p>
      <p className={`text-xl font-black mt-1 leading-none ${
        good === true  ? "text-emerald-700 dark:text-emerald-400" :
        good === false ? "text-amber-700 dark:text-amber-400" :
                         "text-slate-800 dark:text-slate-100"
      }`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
}

export function WealthBuilderCard({ inputs, metrics }: Props) {
  const [cfg, setCfg] = useState<WealthConfig>({
    numProperties: 1,
    savingsRate: 8,
    fireTarget: 1_200_000,  // ₹1.2L/month = ₹14.4L/year
    rentGrowthRate: 4,
  });
  const [projYears] = useState(20);

  const points = useMemo(
    () => projectWealth(inputs, metrics, cfg, projYears),
    [inputs, metrics, cfg, projYears]
  );

  const now = points[0];
  const yr10 = points[10];
  const yr20 = points[20];

  const fireYear = points.find(p => p.passiveIncome >= cfg.fireTarget);
  const fireAchieved = !!fireYear;

  const currentYear = new Date().getFullYear();

  // Chart data — downsample to every year, show in Cr for readability
  const chartData = points.map(p => ({
    year: `${currentYear + p.year}`,
    "Property Equity": Math.round(p.equity / 100_000) / 10,
    "Cash Savings": Math.round(p.cashSavings / 100_000) / 10,
    "Passive Income (₹L/yr)": Math.round(p.passiveIncome / 100_000) / 10,
  }));

  const passiveNow = points[1]?.passiveIncome ?? 0;
  const passiveYr10 = yr10.passiveIncome;
  const passiveYr20 = yr20.passiveIncome;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            🏦 Real Estate Wealth Builder
            <Tooltip content="Projects how this property grows your net worth over 20 years — including property equity buildup, loan paydown, rental income compounding, and your FIRE (Financial Independence) timeline." maxWidth={320} />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            20-year net worth projection · passive income timeline · FIRE date
          </p>
        </div>
        {fireAchieved && (
          <div className="text-center ml-2 flex-shrink-0">
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">FIRE</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{currentYear + fireYear!.year}</p>
            <p className="text-[10px] text-slate-400">financial independence</p>
          </div>
        )}
      </div>

      {/* Config sliders */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block flex items-center gap-0.5">
            No. of Properties
            <Tooltip content="Simulate owning multiple identical properties. Each adds to portfolio equity, rental income, and net worth." />
          </label>
          <div className="flex items-center gap-2">
            <input type="range" min={1} max={10} value={cfg.numProperties}
              onChange={e => setCfg(p => ({ ...p, numProperties: +e.target.value }))}
              className="flex-1 accent-primary-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 w-4">{cfg.numProperties}</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block flex items-center gap-0.5">
            Savings Reinvestment
            <Tooltip content="Annual return earned on positive cash flow reinvested (e.g. in mutual funds or FD). This compounds your savings alongside property equity." />
          </label>
          <div className="flex items-center gap-2">
            <input type="range" min={4} max={15} value={cfg.savingsRate}
              onChange={e => setCfg(p => ({ ...p, savingsRate: +e.target.value }))}
              className="flex-1 accent-primary-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 w-6">{cfg.savingsRate}%</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block flex items-center gap-0.5">
            Rent Growth (%/yr)
            <Tooltip content="Annual rent increase rate. Indian residential rents historically grow 4–7% per year." />
          </label>
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={10} step={0.5} value={cfg.rentGrowthRate}
              onChange={e => setCfg(p => ({ ...p, rentGrowthRate: +e.target.value }))}
              className="flex-1 accent-primary-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 w-6">{cfg.rentGrowthRate}%</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block flex items-center gap-0.5">
            FIRE Target (₹/yr)
            <Tooltip content="Financial Independence Retire Early — the annual passive income you need to cover all expenses without working. The chart shows when your rental income hits this level." />
          </label>
          <select
            value={cfg.fireTarget}
            onChange={e => setCfg(p => ({ ...p, fireTarget: +e.target.value }))}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200"
          >
            {[600_000, 1_200_000, 1_800_000, 2_400_000, 3_600_000, 6_000_000].map(v => (
              <option key={v} value={v}>{fmt(v)}/yr ({fmt(Math.round(v / 12))}/mo)</option>
            ))}
          </select>
        </div>
      </div>

      {/* FIRE banner */}
      <div className={`rounded-xl px-4 py-3 mb-4 flex items-center justify-between ${
        fireAchieved
          ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/40"
          : "bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40"
      }`}>
        <div>
          <p className={`text-sm font-bold ${fireAchieved ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"}`}>
            {fireAchieved
              ? `🎯 FIRE achieved in ${fireYear!.year} years (${currentYear + fireYear!.year})`
              : `⏳ FIRE target of ${fmt(cfg.fireTarget)}/yr not reached in 20 years with this setup`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {fireAchieved
              ? `Passive rental income exceeds your ${fmt(cfg.fireTarget)}/yr target. You can retire from active income.`
              : `Add more properties or increase rent growth to hit your target sooner.`}
          </p>
        </div>
        {fireAchieved && (
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-[10px] text-slate-400">at FIRE year</p>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{fmt(fireYear!.passiveIncome)}/yr</p>
          </div>
        )}
      </div>

      {/* Net worth chart */}
      <div className="h-64 mb-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Net Worth Growth ({cfg.numProperties} propert{cfg.numProperties > 1 ? "ies" : "y"})</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 5 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={3} />
            <YAxis tickFormatter={v => `₹${v}Cr`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            {fireAchieved && (
              <ReferenceLine
                x={`${currentYear + fireYear!.year}`}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: "FIRE", position: "top", fontSize: 10, fill: "#10b981" }}
              />
            )}
            <RechartTooltip
              formatter={(v: number, name: string) => [`₹${v.toFixed(1)}Cr`, name]}
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="Property Equity" stroke="#0ea5e9" strokeWidth={2} fill="url(#equityGrad)" />
            <Area type="monotone" dataKey="Cash Savings" stroke="#10b981" strokeWidth={2} fill="url(#savingsGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Passive income chart */}
      <div className="h-44 mb-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Passive Income Timeline (₹L/yr)</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 5 }}>
            <defs>
              <linearGradient id="rentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={3} />
            <YAxis tickFormatter={v => `₹${v}L`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <ReferenceLine
              y={Math.round(cfg.fireTarget / 100_000) / 10}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: "FIRE target", position: "right", fontSize: 10, fill: "#10b981" }}
            />
            <RechartTooltip
              formatter={(v: number) => [`₹${v.toFixed(1)}L/yr`, "Passive Income"]}
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
            />
            <Area type="monotone" dataKey="Passive Income (₹L/yr)" stroke="#f59e0b" strokeWidth={2} fill="url(#rentGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Milestone grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatBox
          label="Net Worth Today"
          value={fmtCr(now.equity)}
          sub="property equity"
          tip="Your current net worth from real estate = property market value minus outstanding loan."
        />
        <StatBox
          label="Net Worth Year 10"
          value={fmtCr(yr10.totalNetWorth)}
          sub={`${currentYear + 10}`}
          good={true}
          tip="Projected total net worth in 10 years — property equity plus reinvested cash flow savings."
        />
        <StatBox
          label="Net Worth Year 20"
          value={fmtCr(yr20.totalNetWorth)}
          sub={`${currentYear + 20}`}
          good={true}
          tip="20-year projection. Compound appreciation, loan paydown, and reinvested cash flow all contribute."
        />
        <StatBox
          label="Passive Income Now"
          value={`${fmt(passiveNow)}/yr`}
          sub={`${fmt(Math.round(passiveNow / 12))}/mo`}
          tip="Current annual net rental income (rent minus vacancy and maintenance) across all properties."
        />
        <StatBox
          label="Passive Income Y10"
          value={`${fmt(passiveYr10)}/yr`}
          sub={`${fmt(Math.round(passiveYr10 / 12))}/mo`}
          good={passiveYr10 > passiveNow}
          tip="Projected rental income in year 10 after rent growth compounding."
        />
        <StatBox
          label="Passive Income Y20"
          value={`${fmt(passiveYr20)}/yr`}
          sub={`${fmt(Math.round(passiveYr20 / 12))}/mo`}
          good={true}
          tip="Projected rental income in year 20. This is your approximate annual passive income at that horizon."
        />
      </div>

      {/* Wealth multiplier */}
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 border border-primary-100 dark:border-primary-800/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">20-Year Wealth Multiplier</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Starting from {fmtCr(metrics.effective_down_payment)} equity invested</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-primary-700 dark:text-primary-400">
              {metrics.effective_down_payment > 0
                ? `${(yr20.totalNetWorth / metrics.effective_down_payment).toFixed(1)}x`
                : "—"}
            </p>
            <p className="text-[10px] text-slate-400">net worth multiple</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Total rent collected over 20 years: {fmtCr(yr20.cumulativeRent)} &nbsp;·&nbsp;
          Loan fully paid: {inputs.loan_tenure_years <= 20 ? `Year ${inputs.loan_tenure_years}` : "After Year 20"}
        </p>
      </div>
    </div>
  );
}
