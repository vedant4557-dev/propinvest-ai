"use client";

import type { TaxAnalysis } from "@/types/investment";
import { formatINR, formatPercent } from "@/lib/format";
import { Tooltip } from "@/lib/glossary";

export function TaxAnalysisCard({ data }: { data: TaxAnalysis }) {
  const items = [
    {
      label: "Stamp Duty Paid",
      value: formatINR(data.stamp_duty_paid),
      color: "amber",
      tip: "State tax paid when buying property — typically 5–8% of property value in India. Sunk cost, not recoverable on sale.",
    },
    {
      label: "Registration Cost",
      value: formatINR(data.registration_cost_paid),
      color: "amber",
      tip: "Fee paid to legally register the property in your name at the Sub-Registrar's office. Typically 1% of property value.",
    },
    {
      label: "Total Acquisition Tax",
      value: formatINR(data.total_acquisition_tax),
      color: "rose",
      tip: "Total upfront government taxes: Stamp Duty + Registration. This adds to your effective cost of purchase.",
    },
    {
      label: "Sec 24(b) Interest Deduction",
      value: formatINR(data.tax_savings_from_interest),
      color: "emerald",
      tip: "Tax saved under Section 24(b) of the Income Tax Act — home loan interest is deductible from taxable income. Fully deductible for let-out property; capped at ₹2L/year for self-occupied.",
    },
    {
      label: "Rental Tax Liability",
      value: formatINR(data.rental_tax_liability),
      color: "rose",
      tip: "Income tax on your annual rental income at your tax slab rate. Rental income is added to your total income and taxed accordingly.",
    },
    {
      label: "Net Annual Tax Benefit",
      value: formatINR(data.net_tax_benefit),
      color: data.net_tax_benefit >= 0 ? "emerald" : "rose",
      tip: "Interest deduction benefit minus rental income tax. If positive, the loan interest deduction more than offsets the rental tax — a net tax saving.",
    },
    {
      label: "LTCG Tax (on exit)",
      value: formatINR(data.capital_gains_tax),
      color: "amber",
      tip: "Long-Term Capital Gains tax on property profit at sale. Taxed at 12.5% without indexation, or 20% with indexation. Applies to properties held 2+ years.",
    },
    {
      label: "Post-Tax IRR",
      value: formatPercent(data.post_tax_irr),
      color: "primary",
      tip: "Your IRR after all taxes: income tax on rent, LTCG on sale profit. This is the real return — always compare this (not pre-tax IRR) with FD rates.",
    },
  ];

  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
    rose:    "bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300",
    amber:   "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
    primary: "bg-primary-50 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">India Tax Analysis</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ label, value, color, tip }) => (
          <div key={label} className={`rounded-lg p-3 ${colors[color]}`}>
            <p className="text-xs opacity-80 flex items-center gap-0.5">
              {label}
              <Tooltip content={tip} position="top" maxWidth={280} />
            </p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-0.5">
          Indexation factor: {data.indexation_factor.toFixed(2)}x (6% inflation assumed)
          <Tooltip content="The Cost Inflation Index factor applied to your purchase price to compute indexed capital gains. A factor of 1.8x means inflation has effectively reduced taxable gains by 80% of original cost." />
        </span>
        <span>Indexed cost: {formatINR(data.indexed_cost)}</span>
      </div>
    </div>
  );
}
