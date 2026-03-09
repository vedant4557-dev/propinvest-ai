"use client";

import type { InvestmentInput, InvestmentMetrics, TaxAnalysis } from "@/types/investment";

function fmt(v: number): string {
  const a = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (a >= 10_000_000) return `${s}₹${(a / 10_000_000).toFixed(1)}Cr`;
  if (a >= 100_000)    return `${s}₹${(a / 100_000).toFixed(1)}L`;
  return `${s}₹${a.toLocaleString("en-IN")}`;
}

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
  taxAnalysis?: TaxAnalysis | null;
  dealScore?: number | null;
}

export function SmartSummaryBanner({ inputs, metrics, taxAnalysis, dealScore }: Props) {
  const postTaxIRR = taxAnalysis?.post_tax_irr ?? metrics.irr;

  // Verdict logic
  const irrScore   = metrics.irr >= 15 ? 3 : metrics.irr >= 10 ? 2 : metrics.irr >= 7 ? 1 : 0;
  const dscrScore  = metrics.dscr >= 1.25 ? 1 : metrics.dscr >= 1.0 ? 0 : -1;
  const cfScore    = metrics.annual_cash_flow >= 0 ? 1 : -1;
  const totalScore = irrScore + dscrScore + cfScore;

  const verdict =
    totalScore >= 4 ? { label: "Strong Buy",  emoji: "🟢", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/40", text: "text-emerald-800 dark:text-emerald-300" } :
    totalScore >= 2 ? { label: "Buy",          emoji: "🟡", bg: "bg-sky-50 dark:bg-sky-900/20",         border: "border-sky-200 dark:border-sky-800/40",         text: "text-sky-800 dark:text-sky-300"       } :
    totalScore >= 0 ? { label: "Hold",          emoji: "🟠", bg: "bg-amber-50 dark:bg-amber-900/20",     border: "border-amber-200 dark:border-amber-800/40",     text: "text-amber-800 dark:text-amber-300"   } :
                      { label: "Avoid",         emoji: "🔴", bg: "bg-rose-50 dark:bg-rose-900/20",       border: "border-rose-200 dark:border-rose-800/40",       text: "text-rose-800 dark:text-rose-300"     };

  const kpis = [
    {
      label: "IRR",
      value: `${metrics.irr.toFixed(1)}%`,
      sub: postTaxIRR !== metrics.irr ? `${postTaxIRR.toFixed(1)}% post-tax` : "pre-tax",
      good: metrics.irr >= 10,
      bad: metrics.irr < 7,
    },
    {
      label: "Monthly CF",
      value: fmt(metrics.monthly_cash_flow),
      sub: metrics.monthly_cash_flow >= 0 ? "cash positive" : "cash negative",
      good: metrics.monthly_cash_flow >= 0,
      bad: metrics.monthly_cash_flow < -5_000,
    },
    {
      label: "DSCR",
      value: `${metrics.dscr.toFixed(2)}x`,
      sub: metrics.dscr >= 1 ? "rent covers EMI" : "rent < EMI",
      good: metrics.dscr >= 1.2,
      bad: metrics.dscr < 1.0,
    },
    {
      label: "Net Yield",
      value: `${metrics.net_rental_yield.toFixed(2)}%`,
      sub: `${metrics.gross_rental_yield.toFixed(2)}% gross`,
      good: metrics.net_rental_yield >= 3,
      bad: metrics.net_rental_yield < 2,
    },
    {
      label: "Future Value",
      value: fmt(metrics.future_property_value),
      sub: `gain: ${fmt(metrics.capital_gains)}`,
      good: metrics.capital_gains > 0,
      bad: false,
    },
  ];

  const propName = inputs.property_name || "Property";
  const city = inputs.city || "";

  return (
    <div className={`rounded-2xl border ${verdict.border} ${verdict.bg} px-4 py-3 mb-1`}>
      {/* Top row: name + verdict */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {city ? `${city} · ` : ""}{fmt(inputs.property_purchase_price)}
            {inputs.holding_period_years ? ` · ${inputs.holding_period_years}yr hold` : ""}
          </p>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{propName}</h3>
        </div>
        <div className="flex items-center gap-2">
          {dealScore != null && (
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Deal Score</p>
              <p className={`text-lg font-black leading-none ${
                dealScore >= 75 ? "text-emerald-600 dark:text-emerald-400" :
                dealScore >= 55 ? "text-amber-600 dark:text-amber-400" :
                                  "text-rose-600 dark:text-rose-400"
              }`}>{dealScore}</p>
            </div>
          )}
          <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${verdict.bg} ${verdict.text} border ${verdict.border}`}>
            {verdict.emoji} {verdict.label}
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-2">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="text-center">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">{kpi.label}</p>
            <p className={`text-sm font-bold leading-tight ${
              kpi.bad  ? "text-rose-600 dark:text-rose-400" :
              kpi.good ? "text-emerald-700 dark:text-emerald-400" :
                         "text-slate-700 dark:text-slate-200"
            }`}>
              {kpi.value}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 hidden sm:block">{kpi.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
