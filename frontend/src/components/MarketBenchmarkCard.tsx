"use client";

import { useMemo } from "react";
import { getMarketInsights } from "@/lib/marketInsights";
import { formatINR, formatPercent } from "@/lib/format";

interface Props {
  city: string;
  propertyPrice: number;
  userRent: number;
  userAppreciation: number;
}

export function MarketBenchmarkCard({ city, propertyPrice, userRent, userAppreciation }: Props) {
  const insights = useMemo(
    () => getMarketInsights(city || "bangalore", propertyPrice),
    [city, propertyPrice]
  );

  const rentVsMarket = userRent < insights.estimatedRentRange.low
    ? "below"
    : userRent > insights.estimatedRentRange.high
    ? "above"
    : "within";

  const appVsMarket = userAppreciation < insights.appreciationRange.low
    ? "conservative"
    : userAppreciation > insights.appreciationRange.high
    ? "aggressive"
    : "realistic";

  const tempColor = {
    Hot: "text-rose-500 bg-rose-50 dark:bg-rose-900/20",
    Warm: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    Cool: "text-sky-500 bg-sky-50 dark:bg-sky-900/20",
  }[insights.marketTemperature];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
          📍 Market Intelligence — {insights.city}
        </h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tempColor}`}>
          {insights.marketTemperature} Market
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Rental Yield */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Market Rental Yield</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">
            {insights.rentalYieldRange.low}–{insights.rentalYieldRange.high}%
          </p>
          <p className="text-xs text-slate-400 mt-1">annual</p>
        </div>

        {/* Appreciation */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Typical Appreciation</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">
            {insights.appreciationRange.low}–{insights.appreciationRange.high}%
          </p>
          <p className="text-xs text-slate-400 mt-1">per year</p>
        </div>

        {/* Est. Rent Range */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Est. Rent Range</p>
          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {formatINR(insights.estimatedRentRange.low)}–{formatINR(insights.estimatedRentRange.high)}
          </p>
          <p className="text-xs text-slate-400 mt-1">per month</p>
        </div>

        {/* Cap Rate */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Benchmark Cap Rate</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">
            {formatPercent(insights.capRateBenchmark * 100)}
          </p>
          <p className="text-xs text-slate-400 mt-1">market avg</p>
        </div>
      </div>

      {/* Comparison row */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          rentVsMarket === "within"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
            : rentVsMarket === "above"
            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
            : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
        }`}>
          Rent: {rentVsMarket} market range
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          appVsMarket === "realistic"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
            : appVsMarket === "conservative"
            ? "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400"
            : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
        }`}>
          Appreciation: {appVsMarket}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {insights.dataSource} · Estimates only — verify locally before investing
      </p>
    </div>
  );
}
