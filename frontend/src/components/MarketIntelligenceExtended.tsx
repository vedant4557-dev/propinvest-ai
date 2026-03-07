"use client";

import { useMemo } from "react";
import { getSupplyDemand } from "@/lib/supplyDemandEngine";
import { getMarketCycle } from "@/lib/marketCycleEngine";
import { getRentalBenchmark } from "@/lib/marketInsights";

interface Props {
  city: string;
  propertyAreaSqft: number;
  monthlyRent: number;
}

export function MarketIntelligenceExtended({ city, propertyAreaSqft, monthlyRent }: Props) {
  const supplyDemand = useMemo(() => getSupplyDemand(city), [city]);
  const marketCycle = useMemo(() => getMarketCycle(city), [city]);
  const rentalBench = useMemo(
    () => getRentalBenchmark(city, propertyAreaSqft, monthlyRent),
    [city, propertyAreaSqft, monthlyRent]
  );

  const supplyColors = {
    green:  "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    yellow: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    red:    "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
  };

  const rentalColors = {
    green: "text-emerald-600 dark:text-emerald-400",
    blue:  "text-sky-600 dark:text-sky-400",
    red:   "text-rose-600 dark:text-rose-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-5">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">
        🔍 Market Intelligence — Extended
      </h3>

      {/* Market Cycle */}
      <div className={`rounded-xl p-4 ${marketCycle.bgColor}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Market Cycle
          </span>
          <span className={`text-sm font-bold ${marketCycle.color}`}>
            {marketCycle.stageEmoji} {marketCycle.stage}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">{marketCycle.description}</p>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
          📊 {marketCycle.priceOutlook}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
          {marketCycle.investorImplication}
        </p>
      </div>

      {/* Supply & Demand */}
      <div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
          Supply & Demand Pressure
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2.5 text-center">
            <p className="text-xs text-slate-400 mb-1">Supply</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{supplyDemand.supplyLevel}</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2.5 text-center">
            <p className="text-xs text-slate-400 mb-1">Demand</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{supplyDemand.demandLevel}</p>
          </div>
          <div className={`rounded-lg p-2.5 text-center ${supplyColors[supplyDemand.pressureColor]}`}>
            <p className="text-xs opacity-75 mb-1">Outlook</p>
            <p className="text-xs font-bold">{supplyDemand.supplyPressure}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">{supplyDemand.insight}</p>
        <p className="text-xs text-slate-300 dark:text-slate-600 mt-0.5 italic">{supplyDemand.dataNote}</p>
      </div>

      {/* Rental Benchmark */}
      {propertyAreaSqft > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
            Rental Competitiveness
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-bold ${rentalColors[rentalBench.color]}`}>
              {rentalBench.label}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Your: ₹{rentalBench.propertyRentPerSqft}/sqft
              </span>
              <span>
                Market: ₹{rentalBench.marketRentPerSqft}/sqft
              </span>
            </div>
          </div>
          {/* Competitiveness bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-1">
            <div
              className={`h-2 rounded-full transition-all ${
                rentalBench.color === "green" ? "bg-emerald-500" :
                rentalBench.color === "blue" ? "bg-sky-500" : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, rentalBench.competitivenessScore)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{rentalBench.insight}</p>
        </div>
      )}
    </div>
  );
}
