// Comparable Property Valuation Engine — PropInvest AI
// Estimates fair value based on nearby comparable prices per sqft

export interface ComparableValuationResult {
  avgPricePerSqft: number;
  fairValueLow: number;
  fairValueHigh: number;
  fairValueMid: number;
  priceDeviationPercent: number;       // positive = overpriced vs comps
  isOverpriced: boolean;
  isUnderpriced: boolean;
  verdict: "Underpriced" | "Fair Value" | "Slightly Overpriced" | "Overpriced";
  verdictColor: "green" | "blue" | "yellow" | "red";
  propertyPricePerSqft: number;
  comparablesUsed: number;
}

export interface ComparableValuationInput {
  propertyPrice: number;
  propertyAreaSqft: number;
  nearbyPricesPerSqft?: number[];       // user-supplied or benchmark-derived
  city?: string;
}

// City-level price per sqft benchmarks (INR) by segment
const CITY_PRICE_PER_SQFT: Record<string, { low: number; mid: number; high: number }> = {
  bangalore: { low: 5_500,  mid: 7_500,  high: 12_000 },
  mumbai:    { low: 15_000, mid: 22_000, high: 40_000 },
  delhi:     { low: 8_000,  mid: 12_000, high: 20_000 },
  hyderabad: { low: 5_000,  mid: 7_000,  high: 11_000 },
  pune:      { low: 5_500,  mid: 7_800,  high: 13_000 },
  chennai:   { low: 5_000,  mid: 7_200,  high: 12_000 },
  kolkata:   { low: 4_500,  mid: 6_500,  high: 10_000 },
  ahmedabad: { low: 4_000,  mid: 5_500,  high: 9_000  },
};

const DEFAULT_CITY_PRICES = { low: 5_000, mid: 7_000, high: 12_000 };

function normalizeCity(city: string): string {
  const c = city.toLowerCase().trim();
  if (/bengaluru/.test(c)) return "bangalore";
  if (/new delhi|ncr|gurgaon|gurugram|noida/.test(c)) return "delhi";
  if (/navi mumbai|thane/.test(c)) return "mumbai";
  return c;
}

function getCityBenchmarkPrices(city: string): number[] {
  const key = normalizeCity(city);
  const b = CITY_PRICE_PER_SQFT[key] || DEFAULT_CITY_PRICES;
  // Return a synthetic set of comparable prices around the mid benchmark
  return [
    Math.round(b.mid * 0.88),
    Math.round(b.mid * 0.94),
    Math.round(b.mid),
    Math.round(b.mid * 1.06),
    Math.round(b.mid * 1.12),
  ];
}

export function calculateComparableValuation(
  input: ComparableValuationInput
): ComparableValuationResult {
  const { propertyPrice, propertyAreaSqft, nearbyPricesPerSqft, city = "" } = input;

  // Guard: area must be > 0
  const area = propertyAreaSqft > 0 ? propertyAreaSqft : 1;

  // Use provided comparables or fall back to city benchmarks
  const comps =
    nearbyPricesPerSqft && nearbyPricesPerSqft.length > 0
      ? nearbyPricesPerSqft.filter((p) => p > 0)
      : getCityBenchmarkPrices(city);

  const avgPricePerSqft =
    comps.reduce((s, p) => s + p, 0) / comps.length;

  // Fair value range: ±10% around the average
  const fairValueMid = Math.round(avgPricePerSqft * area);
  const fairValueLow = Math.round(avgPricePerSqft * area * 0.90);
  const fairValueHigh = Math.round(avgPricePerSqft * area * 1.10);

  const propertyPricePerSqft = Math.round(propertyPrice / area);
  const priceDeviationPercent =
    fairValueMid > 0
      ? Math.round(((propertyPrice - fairValueMid) / fairValueMid) * 1000) / 10
      : 0;

  const isOverpriced = propertyPrice > fairValueHigh;
  const isUnderpriced = propertyPrice < fairValueLow;

  let verdict: ComparableValuationResult["verdict"];
  let verdictColor: ComparableValuationResult["verdictColor"];

  if (priceDeviationPercent < -10) {
    verdict = "Underpriced"; verdictColor = "green";
  } else if (priceDeviationPercent <= 10) {
    verdict = "Fair Value"; verdictColor = "blue";
  } else if (priceDeviationPercent <= 25) {
    verdict = "Slightly Overpriced"; verdictColor = "yellow";
  } else {
    verdict = "Overpriced"; verdictColor = "red";
  }

  return {
    avgPricePerSqft: Math.round(avgPricePerSqft),
    fairValueLow,
    fairValueHigh,
    fairValueMid,
    priceDeviationPercent,
    isOverpriced,
    isUnderpriced,
    verdict,
    verdictColor,
    propertyPricePerSqft,
    comparablesUsed: comps.length,
  };
}
