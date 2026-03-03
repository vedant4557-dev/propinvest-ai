"use client";

import type { InvestmentMetrics, TaxAnalysis } from "@/types/investment";
import { formatINR, formatPercent } from "@/lib/format";

interface KPICardsProps {
  metrics: InvestmentMetrics;
  taxAnalysis?: TaxAnalysis | null;
}

export function KPICards({ metrics, taxAnalysis }: KPICardsProps) {
  const postTaxIrr = taxAnalysis?.post_tax_irr ?? metrics.irr;

  const cards = [
    { label: "EMI", value: formatINR(metrics.emi), sub: "/ month" },
    {
      label: "Rental Yield",
      value: formatPercent(metrics.annual_rental_yield),
      sub: "annual",
    },
    {
      label: "Annual Cash Flow",
      value: formatINR(metrics.annual_cash_flow),
      sub: metrics.annual_cash_flow >= 0 ? "positive" : "negative",
      highlight: metrics.annual_cash_flow >= 0,
    },
    {
      label: "IRR",
      value: formatPercent(metrics.irr),
      sub: "vs 7% FD",
      highlight: metrics.irr >= 7,
    },
    {
      label: "Post-tax IRR",
      value: formatPercent(postTaxIrr),
      sub: "after India tax",
      highlight: postTaxIrr >= 7,
    },
    {
      label: "ROI",
      value: formatPercent(metrics.roi),
      sub: "over holding period",
    },
    {
      label: "Future Value",
      value: formatINR(metrics.future_property_value),
      sub: "at exit",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700 ${
            card.highlight
              ? "border-accent-emerald/50 dark:border-accent-emerald/30"
              : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <p
            className={`mt-1 text-xl font-bold ${
              card.highlight
                ? "text-accent-emerald dark:text-accent-emerald"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {card.value}
            {card.sub && (
              <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">
                {card.sub}
              </span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
