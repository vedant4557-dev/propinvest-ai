"use client";

import type { InvestmentMetrics, TaxAnalysis } from "@/types/investment";
import { formatINR, formatPercent, formatMultiple } from "@/lib/format";

interface KPICardsProps {
  metrics: InvestmentMetrics;
  taxAnalysis?: TaxAnalysis | null;
}

interface KPICard {
  label: string;
  value: string;
  sub?: string;
  hint?: string;
  tooltip?: string;
  positive: boolean | null;
  featured?: boolean;
}

export function KPICards({ metrics, taxAnalysis }: KPICardsProps) {
  const postTaxIrr = taxAnalysis?.post_tax_irr ?? metrics.irr;

  const cards: KPICard[] = [
    {
      label: "IRR",
      value: formatPercent(metrics.irr, 1),
      sub: "pre-tax",
      hint: metrics.irr >= 7 ? "✓ Beats 7% FD" : "⚠ Below 7% FD",
      positive: metrics.irr >= 7,
      featured: true,
    },
    {
      label: "Post-Tax IRR",
      value: formatPercent(postTaxIrr, 1),
      sub: "after India tax",
      hint: `vs 7% FD · diff: ${(postTaxIrr - 7).toFixed(1)}pp`,
      positive: postTaxIrr >= 7,
      featured: true,
    },
    {
      label: "Monthly EMI",
      value: formatINR(metrics.emi),
      sub: "/ month",
      hint: `Loan: ${formatINR(metrics.loan_amount)}`,
      positive: null,
    },
    {
      label: "Net Yield",
      value: formatPercent(metrics.net_rental_yield, 2),
      sub: "rental yield",
      hint: `Gross: ${formatPercent(metrics.gross_rental_yield, 2)}`,
      positive: metrics.net_rental_yield >= 3,
    },
    {
      label: "Cash-on-Cash",
      value: formatPercent(metrics.cash_on_cash_return, 1),
      sub: "on equity invested",
      hint: `On ${formatINR(metrics.effective_down_payment)}`,
      positive: metrics.cash_on_cash_return >= 0,
    },
    {
      label: "DSCR",
      value: formatMultiple(metrics.dscr),
      sub: "coverage ratio",
      hint: metrics.dscr >= 1 ? "✓ Rent covers EMI" : "⚠ Rent < EMI",
      tooltip: "Debt Service Coverage Ratio = Annual Rent ÷ Annual EMI. >1.0 means rent covers loan payments.",
      positive: metrics.dscr >= 1,
    },
    {
      label: "Cap Rate",
      value: formatPercent(metrics.cap_rate, 2),
      sub: "NOI / price",
      hint: "Market benchmark: 3–5%",
      positive: metrics.cap_rate >= 3,
    },
    {
      label: "Annual Cash Flow",
      value: formatINR(metrics.annual_cash_flow),
      sub: "/ year",
      hint: `${formatINR(metrics.monthly_cash_flow)}/mo`,
      positive: metrics.annual_cash_flow >= 0,
    },
    {
      label: "NPV",
      value: formatINR(metrics.npv),
      sub: "at 10% discount rate",
      hint: metrics.npv >= 0 ? "Value created" : "Value destroyed",
      positive: metrics.npv >= 0,
    },
    {
      label: "Break-even Occ.",
      value: formatPercent(metrics.break_even_occupancy, 1),
      sub: "occupancy needed",
      hint: metrics.break_even_occupancy <= 80 ? "Good buffer" : "Thin buffer",
      tooltip: `Min occupancy to cover EMI (${formatINR(metrics.emi)}/mo) + maintenance. Formula: (EMI + Maintenance) / Gross Rent.`,
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
      label: "Total ROI",
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
          className={`relative rounded-xl border bg-white p-3.5 shadow-sm dark:bg-slate-800 transition-shadow hover:shadow-md ${
            card.positive === true
              ? "border-emerald-200 dark:border-emerald-800/50"
              : card.positive === false
              ? "border-rose-200 dark:border-rose-800/50"
              : "border-slate-200 dark:border-slate-700"
          } ${card.featured ? "ring-1 ring-inset ring-primary-100 dark:ring-primary-900/30" : ""}`}
          title={card.tooltip}
        >
          {/* Label */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            {card.label}
            {card.tooltip && <span className="ml-1 text-slate-300 dark:text-slate-600 cursor-help">ⓘ</span>}
          </p>

          {/* Value + sub */}
          <p className={`text-xl font-black leading-none tracking-tight ${
            card.positive === true
              ? "text-emerald-700 dark:text-emerald-400"
              : card.positive === false
              ? "text-rose-700 dark:text-rose-400"
              : "text-slate-900 dark:text-slate-100"
          }`}>
            {card.value}
          </p>
          {card.sub && (
            <p className="text-[10px] text-slate-400 mt-0.5">{card.sub}</p>
          )}

          {/* Hint */}
          {card.hint && (
            <p className={`text-xs mt-1.5 font-medium ${
              card.positive === true
                ? "text-emerald-600 dark:text-emerald-500"
                : card.positive === false
                ? "text-rose-600 dark:text-rose-500"
                : "text-slate-400"
            }`}>
              {card.hint}
            </p>
          )}

          {/* Featured indicator */}
          {card.featured && (
            <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary-400" />
          )}
        </div>
      ))}
    </div>
  );
}
