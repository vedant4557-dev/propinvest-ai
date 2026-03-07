"use client";

import { useMemo } from "react";
import { calculateComparableValuation } from "@/lib/comparableValuationEngine";
import { formatINR } from "@/lib/format";

interface Props {
  propertyPrice: number;
  propertyAreaSqft: number;
  city: string;
  nearbyPricesPerSqft?: number[];
}

export function ComparableValuationCard({
  propertyPrice,
  propertyAreaSqft,
  city,
  nearbyPricesPerSqft,
}: Props) {
  const result = useMemo(
    () =>
      calculateComparableValuation({
        propertyPrice,
        propertyAreaSqft,
        nearbyPricesPerSqft,
        city,
      }),
    [propertyPrice, propertyAreaSqft, city, nearbyPricesPerSqft]
  );

  const verdictStyles = {
    green:  { badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", bar: "bg-emerald-500" },
    blue:   { badge: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400", bar: "bg-sky-500" },
    yellow: { badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400", bar: "bg-amber-500" },
    red:    { badge: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400", bar: "bg-rose-500" },
  }[result.verdictColor];

  // Bar position: how far along the fair value range the asking price is
  const rangeMid = result.fairValueMid;
  const deviation = result.priceDeviationPercent;
  // Clamp bar fill to 0–100%
  const barFill = Math.max(0, Math.min(100, 50 + deviation * 1.5));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
          🏘️ Comparable Valuation
        </h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${verdictStyles.badge}`}>
          {result.verdict}
        </span>
      </div>

      {/* Price per sqft comparison */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Your Price/sqft</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">
            ₹{result.propertyPricePerSqft.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">asking price</p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Market Avg/sqft</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">
            ₹{result.avgPricePerSqft.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{result.comparablesUsed} comparables</p>
        </div>
      </div>

      {/* Fair value range bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Fair Range: {formatINR(result.fairValueLow)}</span>
          <span>{formatINR(result.fairValueHigh)}</span>
        </div>
        <div className="relative w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
          {/* Fair value zone */}
          <div className="absolute inset-0 mx-[5%] rounded-full bg-emerald-100 dark:bg-emerald-900/30" />
          {/* Asking price marker */}
          <div
            className={`absolute top-0 h-3 w-1.5 rounded-full ${verdictStyles.bar} -translate-x-1/2`}
            style={{ left: `${barFill}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Underpriced</span>
          <span className="font-medium">
            {result.priceDeviationPercent > 0 ? "+" : ""}{result.priceDeviationPercent}% vs market
          </span>
          <span>Overpriced</span>
        </div>
      </div>

      {/* Mid fair value */}
      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <span>Fair value mid:</span>
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {formatINR(result.fairValueMid)}
        </span>
        {result.isOverpriced && (
          <span className="text-xs text-rose-500">
            (overpaid by {formatINR(Math.abs(propertyPrice - result.fairValueMid))})
          </span>
        )}
        {result.isUnderpriced && (
          <span className="text-xs text-emerald-500">
            (discount of {formatINR(Math.abs(result.fairValueMid - propertyPrice))})
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Based on comparable transactions in {city || "this city"} · Estimates only
      </p>
    </div>
  );
}
