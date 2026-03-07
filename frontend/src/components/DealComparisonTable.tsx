"use client";

import { formatINR, formatPercent, formatMultiple } from "@/lib/format";
import type { SavedDeal } from "@/types/investment";

interface Props {
  deals: SavedDeal[];
  onLoad?: (deal: SavedDeal) => void;
}

export function DealComparisonTable({ deals, onLoad }: Props) {
  if (deals.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Save at least 2 deals to compare them side-by-side.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Use the &ldquo;Save Deal&rdquo; button after analyzing each property.
        </p>
      </div>
    );
  }

  const METRICS: { key: string; label: string; format: (d: SavedDeal) => string; better: "higher" | "lower" | null }[] = [
    { key: "irr",           label: "IRR",              format: (d) => formatPercent(d.result.metrics.irr),                   better: "higher" },
    { key: "post_tax_irr",  label: "Post-Tax IRR",     format: (d) => formatPercent(d.result.tax_analysis?.post_tax_irr ?? d.result.metrics.irr), better: "higher" },
    { key: "yield",         label: "Net Yield",        format: (d) => formatPercent(d.result.metrics.net_rental_yield),      better: "higher" },
    { key: "coc",           label: "Cash-on-Cash",     format: (d) => formatPercent(d.result.metrics.cash_on_cash_return),   better: "higher" },
    { key: "cashflow",      label: "Annual Cash Flow", format: (d) => formatINR(d.result.metrics.annual_cash_flow),          better: "higher" },
    { key: "dscr",          label: "DSCR",             format: (d) => formatMultiple(d.result.metrics.dscr),                 better: "higher" },
    { key: "emi",           label: "EMI/month",        format: (d) => formatINR(d.result.metrics.emi),                       better: "lower"  },
    { key: "deal_score",    label: "Deal Score",       format: (d) => d.result.deal_analysis ? `${d.result.deal_analysis.deal_score}/100` : "—", better: "higher" },
    { key: "risk",          label: "Risk Score",       format: (d) => `${d.result.risk.score}/${d.result.risk.total_score}`, better: "lower"  },
    { key: "price",         label: "Property Price",   format: (d) => formatINR(d.input.property_purchase_price),            better: null },
    { key: "fv",            label: "Future Value",     format: (d) => formatINR(d.result.metrics.future_property_value),     better: "higher" },
  ];

  function getRawValue(deal: SavedDeal, key: string): number {
    switch (key) {
      case "irr":          return deal.result.metrics.irr;
      case "post_tax_irr": return deal.result.tax_analysis?.post_tax_irr ?? deal.result.metrics.irr;
      case "yield":        return deal.result.metrics.net_rental_yield;
      case "coc":          return deal.result.metrics.cash_on_cash_return;
      case "cashflow":     return deal.result.metrics.annual_cash_flow;
      case "dscr":         return deal.result.metrics.dscr;
      case "emi":          return deal.result.metrics.emi;
      case "deal_score":   return deal.result.deal_analysis?.deal_score ?? 0;
      case "risk":         return deal.result.risk.score;
      case "price":        return deal.input.property_purchase_price;
      case "fv":           return deal.result.metrics.future_property_value;
      default:             return 0;
    }
  }

  function getBestDealIdx(key: string, better: "higher" | "lower" | null): number {
    if (better === null) return -1;
    const values = deals.map((d) => getRawValue(d, key));
    const best = better === "higher" ? Math.max(...values) : Math.min(...values);
    return values.indexOf(best);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">⚖️ Deal Comparison</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comparing {deals.length} saved deals — <span className="text-emerald-600 font-medium">green</span> = best value for each metric
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 w-32">Metric</th>
              {deals.slice(0, 4).map((deal) => (
                <th key={deal.id} className="py-3 px-3 text-center text-xs font-medium text-slate-700 dark:text-slate-200">
                  <button
                    onClick={() => onLoad?.(deal)}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Load this deal"
                  >
                    {deal.name.length > 16 ? deal.name.slice(0, 16) + "…" : deal.name}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
            {METRICS.map((m) => {
              const bestIdx = getBestDealIdx(m.key, m.better);
              return (
                <tr key={m.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="py-2.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">{m.label}</td>
                  {deals.slice(0, 4).map((deal, idx) => (
                    <td key={deal.id} className={`py-2.5 px-3 text-center text-sm font-medium ${
                      idx === bestIdx
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "text-slate-700 dark:text-slate-300"
                    }`}>
                      {m.format(deal)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deals.length > 4 && (
        <p className="text-xs text-center text-slate-400 py-2 border-t border-slate-100 dark:border-slate-700">
          Showing first 4 of {deals.length} saved deals
        </p>
      )}
    </div>
  );
}
