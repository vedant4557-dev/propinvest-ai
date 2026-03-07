"use client";

import type { InvestmentMetrics, TaxAnalysis } from "@/types/investment";
import { formatINR, formatPercent, formatMultiple } from "@/lib/format";

interface KPICardsProps {
  metrics: InvestmentMetrics;
  taxAnalysis?: TaxAnalysis | null;
}

export function KPICards({ metrics, taxAnalysis }: KPICardsProps) {
  const postTaxIrr = taxAnalysis?.post_tax_irr ?? metrics.irr;

  const cards = [
    {
      label: "EMI",
      value: formatINR(metrics.emi),
      sub: "/ month",
      hint: `Loan: ${formatINR(metrics.loan_amount)}`,
      positive: null,
    },
    {
      label: "IRR",
      value: formatPercent(metrics.irr),
      sub: "pre-tax",
      hint: metrics.irr >= 7 ? "✓ Beats FD" : "Below 7% FD",
      positive: metrics.irr >= 7,
    },
    {
      label: "Post-Tax IRR",
      value: formatPercent(postTaxIrr),
      sub: "after India tax",
      hint: `vs 7% FD`,
      positive: postTaxIrr >= 7,
    },
    {
      label: "Net Yield",
      value: formatPercent(metrics.net_rental_yield),
      sub: "rental yield",
      hint: `Gross: ${formatPercent(metrics.gross_rental_yield)}`,
      positive: metrics.net_rental_yield >= 3,
    },
    {
      label: "Cash-on-Cash",
      value: formatPercent(metrics.cash_on_cash_return),
      sub: "annual return",
      hint: `On ₹${(metrics.effective_down_payment / 100_000).toFixed(0)}L invested`,
      positive: metrics.cash_on_cash_return >= 0,
    },
    {
      label: "Cap Rate",
      value: formatPercent(metrics.cap_rate),
      sub: "NOI / value",
      hint: "Market benchmark: 3-5%",
      positive: metrics.cap_rate >= 3,
    },
    {
      label: "DSCR",
      value: formatMultiple(metrics.dscr),
      sub: "coverage ratio",
      hint: metrics.dscr >= 1 ? "✓ Rent covers EMI" : "⚠ Rent < EMI",
      positive: metrics.dscr >= 1,
    },
    {
      label: "NPV",
      value: formatINR(metrics.npv),
      sub: "at 10% discount",
      hint: metrics.npv >= 0 ? "Value created" : "Value destroyed",
      positive: metrics.npv >= 0,
    },
    {
      label: "Cash Flow",
      value: formatINR(metrics.annual_cash_flow),
      sub: "/ year",
      hint: `₹${Math.abs(metrics.monthly_cash_flow).toLocaleString("en-IN")}/mo`,
      positive: metrics.annual_cash_flow >= 0,
    },
    {
      label: "Break-even",
      value: formatPercent(metrics.break_even_occupancy, 1),
      sub: "occupancy needed",
      hint: metrics.break_even_occupancy <= 80 ? "Low risk — good buffer" : "High risk — thin buffer",
      tooltip: `Min occupancy to cover EMI (₹${Math.round(metrics.emi).toLocaleString("en-IN")}/mo) + maintenance. Formula: (EMI + Maintenance) / Gross Rent.`,
      positive: metrics.break_even_occupancy <= 80,
    },
    {
      label: "Future Value",
      value: formatINR(metrics.future_property_value),
      sub: "at exit",
      hint: `Gain: ${formatINR(metrics.capital_gains)}`,
      positive: true,
    },
    {
      label: "ROI",
      value: formatPercent(metrics.roi, 1),
      sub: "total return",
      hint: `On ${formatINR(metrics.total_invested)} invested`,
      positive: metrics.roi >= 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border bg-white p-3 shadow-sm dark:bg-slate-800 ${
            card.positive === true
              ? "border-emerald-200 dark:border-emerald-800/50"
              : card.positive === false
              ? "border-rose-200 dark:border-rose-800/50"
              : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <p
            className={`mt-0.5 text-lg font-bold leading-tight ${
              card.positive === true
                ? "text-emerald-700 dark:text-emerald-400"
                : card.positive === false
                ? "text-rose-700 dark:text-rose-400"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {card.value}
            {card.sub && (
              <span className="ml-1 text-xs font-normal text-slate-400">{card.sub}</span>
            )}
          </p>
          {card.hint && (
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{card.hint}</p>
          )}
          {"tooltip" in card && card.tooltip && (
            <p className="mt-1 text-[10px] text-slate-300 dark:text-slate-600 leading-tight" title={(card as any).tooltip}>
              ℹ {(card as any).tooltip}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
