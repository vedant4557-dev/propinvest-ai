"use client";

import type { InvestmentMetrics, TaxAnalysis } from "@/types/investment";
import { formatINR, formatPercent, formatMultiple } from "@/lib/format";
import { Tooltip } from "@/lib/glossary";

interface KPICardsProps {
  metrics: InvestmentMetrics;
  taxAnalysis?: TaxAnalysis | null;
}

interface KPICard {
  label: string;
  value: string;
  sub?: string;
  hint?: string;
  tip: string;
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
      tip: "Internal Rate of Return — the annualised growth rate of your investment including rental income and property appreciation. Higher is better. Indian real estate typically delivers 8–18% IRR.",
      positive: metrics.irr >= 7,
      featured: true,
    },
    {
      label: "Post-Tax IRR",
      value: formatPercent(postTaxIrr, 1),
      sub: "after India tax",
      hint: `diff vs FD: ${(postTaxIrr - 7).toFixed(1)}pp`,
      tip: "IRR after deducting income tax on rental income and LTCG tax on sale. This is your real take-home return. Always compare with FD rates (currently ~7%).",
      positive: postTaxIrr >= 7,
      featured: true,
    },
    {
      label: "Monthly EMI",
      value: formatINR(metrics.emi),
      sub: "/ month",
      hint: `Loan: ${formatINR(metrics.loan_amount)}`,
      tip: "Equated Monthly Instalment — your fixed monthly loan payment (principal + interest). Indian home loans are floating-rate, so this can change when RBI adjusts rates.",
      positive: null,
    },
    {
      label: "Net Yield",
      value: formatPercent(metrics.net_rental_yield, 2),
      sub: "rental yield",
      hint: `Gross: ${formatPercent(metrics.gross_rental_yield, 2)}`,
      tip: "Annual rent minus vacancy and maintenance costs, divided by property price. Your actual income return after operational costs.",
      positive: metrics.net_rental_yield >= 3,
    },
    {
      label: "Cash-on-Cash",
      value: formatPercent(metrics.cash_on_cash_return, 1),
      sub: "on equity invested",
      hint: `On ${formatINR(metrics.effective_down_payment)}`,
      tip: "Annual rental cash flow ÷ equity you invested. Tells you how much cash income you earn per rupee of down payment — before appreciation. 4% CoC = ₹4 income per ₹100 invested.",
      positive: metrics.cash_on_cash_return >= 0,
    },
    {
      label: "DSCR",
      value: formatMultiple(metrics.dscr),
      sub: "coverage ratio",
      hint: metrics.dscr >= 1 ? "✓ Rent covers EMI" : "⚠ Rent < EMI",
      tip: "Debt Service Coverage Ratio = Annual Rent ÷ Annual EMI. 1.2x means rent is 20% more than your loan payment. Below 1.0x means you must top up from savings each month.",
      positive: metrics.dscr >= 1,
    },
    {
      label: "Cap Rate",
      value: formatPercent(metrics.cap_rate, 2),
      sub: "NOI / price",
      hint: "Market benchmark: 3–5%",
      tip: "Capitalisation Rate = Net Operating Income ÷ Property Price. The income return if you owned the property debt-free. Indian residential benchmark: 3–5%.",
      positive: metrics.cap_rate >= 3,
    },
    {
      label: "Annual Cash Flow",
      value: formatINR(metrics.annual_cash_flow),
      sub: "/ year",
      hint: `${formatINR(metrics.monthly_cash_flow)}/mo`,
      tip: "Rental income minus EMI and maintenance for the full year. Positive = property pays you. Negative = you top up from savings. Common at high LTV — offset by appreciation.",
      positive: metrics.annual_cash_flow >= 0,
    },
    {
      label: "NPV",
      value: formatINR(metrics.npv),
      sub: "at 10% discount",
      hint: metrics.npv >= 0 ? "Value created" : "Value destroyed",
      tip: "Net Present Value — today's worth of all future cash flows, discounted at 10%. NPV > 0 means this investment beats a 10% benchmark. NPV < 0 means a 10% investment would perform better.",
      positive: metrics.npv >= 0,
    },
    {
      label: "Break-Even Occ.",
      value: formatPercent(metrics.break_even_occupancy, 1),
      sub: "occupancy needed",
      hint: metrics.break_even_occupancy <= 80 ? "Good buffer" : "Thin buffer",
      tip: `Minimum occupancy to cover EMI (${formatINR(metrics.emi)}/mo) + maintenance. Formula: (EMI + Maintenance) ÷ Gross Rent. If 85%, the property must be rented 85% of the year (~10 months).`,
      positive: metrics.break_even_occupancy <= 80,
    },
    {
      label: "Future Value",
      value: formatINR(metrics.future_property_value),
      sub: "at exit",
      hint: `Gain: ${formatINR(metrics.capital_gains)}`,
      tip: "Estimated property value at your planned exit date, based on the appreciation rate you entered. The actual value depends on market conditions at time of sale.",
      positive: true,
    },
    {
      label: "Total ROI",
      value: formatPercent(metrics.roi, 1),
      sub: "total return",
      hint: `On ${formatINR(metrics.total_invested)} invested`,
      tip: "Return on Investment — total profit as a percentage of total money invested (down payment + acquisition costs). Measures overall profitability across the full holding period.",
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
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center">
            {card.label}
            <Tooltip content={card.tip} position="top" />
          </p>
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
          {card.featured && (
            <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary-400" />
          )}
        </div>
      ))}
    </div>
  );
}
