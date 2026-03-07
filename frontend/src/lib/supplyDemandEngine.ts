// Supply & Demand Engine — PropInvest AI
// City-level supply pressure indicator using curated placeholder benchmarks

export type SupplyLevel = "Low Supply" | "Moderate Supply" | "High Supply";
export type DemandLevel = "Weak Demand" | "Moderate Demand" | "Strong Demand";

export interface SupplyDemandResult {
  supplyLevel: SupplyLevel;
  demandLevel: DemandLevel;
  supplyPressure: "Favorable" | "Neutral" | "Unfavorable";
  pressureColor: "green" | "yellow" | "red";
  supplyScore: number;     // 1–10 (10 = very low supply / good for buyers)
  demandScore: number;     // 1–10 (10 = very high demand)
  netScore: number;        // demand - supply pressure
  insight: string;
  dataNote: string;
}

interface CitySupplyDemand {
  supplyScore: number;   // 1–10: 10 = very low supply inventory
  demandScore: number;   // 1–10: 10 = very strong buyer/renter demand
  note: string;
}

const CITY_DATA: Record<string, CitySupplyDemand> = {
  bangalore: {
    supplyScore: 4,   // High new supply from builders
    demandScore: 9,   // Very strong demand (IT sector)
    note: "Strong demand from IT workforce, but high new project launches",
  },
  mumbai: {
    supplyScore: 7,   // Limited new land, low supply
    demandScore: 8,   // Consistently high demand
    note: "Constrained supply due to geography, high absorption rate",
  },
  delhi: {
    supplyScore: 5,   // Moderate new supply
    demandScore: 7,   // Good demand, government demand
    note: "Moderate new launches, steady demand from NCR expansion",
  },
  hyderabad: {
    supplyScore: 3,   // Very high new supply
    demandScore: 8,   // Strong demand (pharma/IT)
    note: "Significant new project launches, but strong absorption",
  },
  pune: {
    supplyScore: 4,   // High supply in suburbs
    demandScore: 7,   // Solid demand
    note: "New township projects adding supply, demand from IT/manufacturing",
  },
  chennai: {
    supplyScore: 6,   // Moderate supply
    demandScore: 6,   // Stable demand
    note: "Balanced market, moderate new launches",
  },
  kolkata: {
    supplyScore: 7,   // Lower supply growth
    demandScore: 5,   // Subdued demand growth
    note: "Lower investor activity, stable end-user demand",
  },
  ahmedabad: {
    supplyScore: 5,   // Moderate supply
    demandScore: 6,   // Growing demand
    note: "Industrial growth driving housing demand",
  },
};

const DEFAULT_DATA: CitySupplyDemand = {
  supplyScore: 5,
  demandScore: 6,
  note: "City-level data not available — using national average",
};

function normalizeCity(city: string): string {
  const c = city.toLowerCase().trim();
  if (/bengaluru/.test(c)) return "bangalore";
  if (/new delhi|ncr|gurgaon|gurugram|noida/.test(c)) return "delhi";
  if (/navi mumbai|thane/.test(c)) return "mumbai";
  return c;
}

export function getSupplyDemand(city: string): SupplyDemandResult {
  const key = normalizeCity(city);
  const data = CITY_DATA[key] ?? DEFAULT_DATA;

  const supplyLevel: SupplyLevel =
    data.supplyScore >= 7 ? "Low Supply" :
    data.supplyScore >= 4 ? "Moderate Supply" :
    "High Supply";

  const demandLevel: DemandLevel =
    data.demandScore >= 7 ? "Strong Demand" :
    data.demandScore >= 5 ? "Moderate Demand" :
    "Weak Demand";

  // Net score: positive means demand > supply pressure (favorable for appreciation)
  const netScore = data.demandScore - (10 - data.supplyScore);

  let supplyPressure: SupplyDemandResult["supplyPressure"];
  let pressureColor: SupplyDemandResult["pressureColor"];

  if (netScore >= 2) {
    supplyPressure = "Favorable"; pressureColor = "green";
  } else if (netScore >= -1) {
    supplyPressure = "Neutral"; pressureColor = "yellow";
  } else {
    supplyPressure = "Unfavorable"; pressureColor = "red";
  }

  const cityName = city || "This market";
  const insight =
    supplyPressure === "Favorable"
      ? `${cityName} shows strong demand relative to supply — supports price appreciation.`
      : supplyPressure === "Neutral"
      ? `${cityName} has balanced supply and demand — expect stable price growth.`
      : `${cityName} has excess supply — may pressure prices downward in short term.`;

  return {
    supplyLevel,
    demandLevel,
    supplyPressure,
    pressureColor,
    supplyScore: data.supplyScore,
    demandScore: data.demandScore,
    netScore,
    insight,
    dataNote: data.note,
  };
}
