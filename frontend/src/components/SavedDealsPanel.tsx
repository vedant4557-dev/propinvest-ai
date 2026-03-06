"use client";

import type { SavedDeal, InvestmentInput, AnalyzeInvestmentResponse } from "@/types/investment";
import { formatINR, formatPercent } from "@/lib/format";

interface SavedDealsPanelProps {
  deals: SavedDeal[];
  onLoad: (input: InvestmentInput, result: AnalyzeInvestmentResponse) => void;
  onRemove: (id: string) => void;
}

export function SavedDealsPanel({ deals, onLoad, onRemove }: SavedDealsPanelProps) {
  if (deals.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-24 dark:border-slate-700 dark:bg-slate-800">
        <div className="text-center">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">No saved deals yet</h3>
          <p className="mt-1 text-sm text-slate-500">Analyze a property and click &quot;Save Deal&quot; to store it here</p>
        </div>
      </div>
    );
  }

  // Sort by IRR for comparison
  const sorted = [...deals].sort((a, b) => b.result.metrics.irr - a.result.metrics.irr);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Saved Deals <span className="ml-2 text-sm font-normal text-slate-500">({deals.length})</span>
        </h2>
        {deals.length > 1 && (
          <p className="text-xs text-slate-500">Sorted by IRR — best deal highlighted</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((deal, idx) => {
          const m = deal.result.metrics;
          const isBest = idx === 0 && deals.length > 1;
          return (
            <div
              key={deal.id}
              className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 ${
                isBest ? "border-emerald-300 ring-1 ring-emerald-300 dark:border-emerald-600" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {isBest && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ⭐ Best IRR
                </div>
              )}
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{deal.name}</h3>
              {deal.input.city && (
                <p className="text-xs text-slate-500 mt-0.5">{deal.input.city}</p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">
                Saved {new Date(deal.savedAt).toLocaleDateString("en-IN")}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Metric label="Price" value={formatINR(deal.input.property_purchase_price)} />
                <Metric label="IRR" value={formatPercent(m.irr)} positive={m.irr >= 7} />
                <Metric label="Yield" value={formatPercent(m.net_rental_yield)} positive={m.net_rental_yield >= 3} />
                <Metric label="DSCR" value={`${m.dscr.toFixed(2)}x`} positive={m.dscr >= 1} />
                <Metric label="Cash Flow" value={formatINR(m.annual_cash_flow)} positive={m.annual_cash_flow >= 0} />
                {deal.result.deal_analysis && (
                  <Metric label="Deal Score" value={`${deal.result.deal_analysis.deal_score.toFixed(0)}/100`} />
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onLoad(deal.input, deal.result)}
                  className="flex-1 rounded-lg bg-primary-600 py-1.5 text-xs font-medium text-white hover:bg-primary-700 dark:bg-primary-500"
                >
                  Load
                </button>
                <button
                  onClick={() => onRemove(deal.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`font-medium ${
        positive === true ? "text-emerald-600 dark:text-emerald-400" :
        positive === false ? "text-rose-600 dark:text-rose-400" :
        "text-slate-700 dark:text-slate-300"
      }`}>{value}</p>
    </div>
  );
}
