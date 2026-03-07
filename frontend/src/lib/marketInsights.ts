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
