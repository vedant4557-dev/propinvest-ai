// Market Intelligence Module — PropInvest AI
// Smart placeholder datasets based on Indian city benchmarks

export interface MarketInsights {
  city: string;
  rentalYieldRange: { low: number; high: number };
  appreciationRange: { low: number; high: number };
  capRateBenchmark: number;
  estimatedRentRange: { low: number; high: number };
  marketTemperature: "Hot" | "Warm" | "Cool";
  dataSource: string;
}

const CITY_BENCHMARKS: Record<string, Omit<MarketInsights, "city" | "estimatedRentRange">> = {
  bangalore: {
    rentalYieldRange: { low: 3.0, high: 4.5 },
    appreciationRange: { low: 6, high: 9 },
    capRateBenchmark: 0.038,
    marketTemperature: "Hot",
    dataSource: "City benchmark data",
  },
  mumbai: {
    rentalYieldRange: { low: 2.5, high: 3.5 },
    appreciationRange: { low: 5, high: 8 },
    capRateBenchmark: 0.030,
    marketTemperature: "Hot",
    dataSource: "City benchmark data",
  },
  delhi: {
    rentalYieldRange: { low: 2.5, high: 3.8 },
    appreciationRange: { low: 5, high: 7 },
    capRateBenchmark: 0.032,
    marketTemperature: "Warm",
    dataSource: "City benchmark data",
  },
  hyderabad: {
    rentalYieldRange: { low: 3.5, high: 5.0 },
    appreciationRange: { low: 7, high: 10 },
    capRateBenchmark: 0.042,
    marketTemperature: "Hot",
    dataSource: "City benchmark data",
  },
  pune: {
    rentalYieldRange: { low: 3.2, high: 4.8 },
    appreciationRange: { low: 6, high: 9 },
    capRateBenchmark: 0.040,
    marketTemperature: "Warm",
    dataSource: "City benchmark data",
  },
  chennai: {
    rentalYieldRange: { low: 3.0, high: 4.2 },
    appreciationRange: { low: 5, high: 8 },
    capRateBenchmark: 0.036,
    marketTemperature: "Warm",
    dataSource: "City benchmark data",
  },
  kolkata: {
    rentalYieldRange: { low: 3.5, high: 5.0 },
    appreciationRange: { low: 4, high: 7 },
    capRateBenchmark: 0.040,
    marketTemperature: "Cool",
    dataSource: "City benchmark data",
  },
  ahmedabad: {
    rentalYieldRange: { low: 3.8, high: 5.5 },
    appreciationRange: { low: 5, high: 8 },
    capRateBenchmark: 0.044,
    marketTemperature: "Warm",
    dataSource: "City benchmark data",
  },
};

const DEFAULT_BENCHMARK = {
  rentalYieldRange: { low: 3.0, high: 4.5 },
  appreciationRange: { low: 5, high: 8 },
  capRateBenchmark: 0.038,
  marketTemperature: "Warm" as const,
  dataSource: "National average benchmark",
};

function normalizeCity(city: string): string {
  return city.toLowerCase().trim()
    .replace(/bengaluru/i, "bangalore")
    .replace(/new delhi|ncr|gurgaon|gurugram|noida/i, "delhi")
    .replace(/navi mumbai|thane/i, "mumbai");
}

export function getMarketInsights(city: string, propertyPrice: number): MarketInsights {
  const key = normalizeCity(city);
  const benchmark = CITY_BENCHMARKS[key] || DEFAULT_BENCHMARK;

  // Estimate rent based on yield and price
  const rentLow = (propertyPrice * benchmark.rentalYieldRange.low) / 100 / 12;
  const rentHigh = (propertyPrice * benchmark.rentalYieldRange.high) / 100 / 12;

  return {
    city: city || "India",
    ...benchmark,
    estimatedRentRange: { low: Math.round(rentLow), high: Math.round(rentHigh) },
  };
}

export function estimateMarketRent(city: string, propertyPrice: number): { low: number; high: number } {
  const insights = getMarketInsights(city, propertyPrice);
  return insights.estimatedRentRange;
}

export function estimateRentalYield(city: string): { low: number; high: number } {
  const key = normalizeCity(city);
  const b = CITY_BENCHMARKS[key] || DEFAULT_BENCHMARK;
  return b.rentalYieldRange;
}

export function estimateAppreciationRange(city: string): { low: number; high: number } {
  const key = normalizeCity(city);
  const b = CITY_BENCHMARKS[key] || DEFAULT_BENCHMARK;
  return b.appreciationRange;
}

export function estimateCapRate(city: string): number {
  const key = normalizeCity(city);
  const b = CITY_BENCHMARKS[key] || DEFAULT_BENCHMARK;
  return b.capRateBenchmark;
}

export function getSupportedCities(): string[] {
  return Object.keys(CITY_BENCHMARKS).map(c => c.charAt(0).toUpperCase() + c.slice(1));
}

// ─── Rental Benchmark Analysis (V3.1 extension) ──────────────────────────────

export type RentalCompetitiveness =
  | "Above Market"
  | "Market Aligned"
  | "Below Market";

export interface RentalBenchmarkResult {
  propertyRentPerSqft: number;
  marketRentPerSqft: number;
  competitiveness: RentalCompetitiveness;
  competitivenessScore: number;   // 0–100
  deviationPercent: number;       // positive = above market
  label: string;
  color: "green" | "blue" | "red";
  insight: string;
}

// City benchmark rent per sqft (INR/month)
const CITY_RENT_PER_SQFT: Record<string, number> = {
  bangalore: 28,
  mumbai:    55,
  delhi:     35,
  hyderabad: 22,
  pune:      25,
  chennai:   22,
  kolkata:   18,
  ahmedabad: 16,
};

const DEFAULT_RENT_PER_SQFT = 22;

function _normalizeCity(city: string): string {
  const c = city.toLowerCase().trim();
  if (/bengaluru/.test(c)) return "bangalore";
  if (/new delhi|ncr|gurgaon|gurugram|noida/.test(c)) return "delhi";
  if (/navi mumbai|thane/.test(c)) return "mumbai";
  return c;
}

export function getRentalBenchmark(
  city: string,
  propertyAreaSqft: number,
  monthlyRent: number
): RentalBenchmarkResult {
  const key = _normalizeCity(city);
  const marketRentPerSqft = CITY_RENT_PER_SQFT[key] ?? DEFAULT_RENT_PER_SQFT;

  // Guard division by zero
  const area = propertyAreaSqft > 0 ? propertyAreaSqft : 1;
  const propertyRentPerSqft = Math.round((monthlyRent / area) * 10) / 10;

  const deviationPercent =
    marketRentPerSqft > 0
      ? Math.round(((propertyRentPerSqft - marketRentPerSqft) / marketRentPerSqft) * 1000) / 10
      : 0;

  let competitiveness: RentalCompetitiveness;
  let color: RentalBenchmarkResult["color"];
  let competitivenessScore: number;

  if (deviationPercent > 10) {
    competitiveness = "Above Market";
    color = "green";
    competitivenessScore = Math.min(100, 60 + deviationPercent * 2);
  } else if (deviationPercent >= -10) {
    competitiveness = "Market Aligned";
    color = "blue";
    competitivenessScore = 80;
  } else {
    competitiveness = "Below Market";
    color = "red";
    competitivenessScore = Math.max(0, 60 + deviationPercent * 2);
  }

  const cityName = city || "this market";
  const insight =
    competitiveness === "Above Market"
      ? `Rent is ${Math.abs(deviationPercent).toFixed(0)}% above ${cityName} benchmark — strong rental income potential.`
      : competitiveness === "Market Aligned"
      ? `Rent aligns with ${cityName} market rates — realistic and sustainable.`
      : `Rent is ${Math.abs(deviationPercent).toFixed(0)}% below ${cityName} benchmark — potential upside if rent is increased.`;

  return {
    propertyRentPerSqft,
    marketRentPerSqft,
    competitiveness,
    competitivenessScore: Math.round(competitivenessScore),
    deviationPercent,
    label: competitiveness,
    color,
    insight,
  };
}
