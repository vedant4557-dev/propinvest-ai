// Location Score Module — PropInvest AI V3.1 (Upgraded)
// Scores a city/market from 0–10 based on yield, appreciation, risk,
// infrastructure growth, employment growth, population trends, rental demand

export interface LocationScoreResult {
  score: number;          // 0–10
  grade: "A" | "B" | "C" | "D";
  label: string;
  yieldScore: number;
  growthScore: number;
  riskScore: number;
  // V3.1 additions
  infrastructureScore: number;
  employmentScore: number;
  populationScore: number;
  rentalDemandScore: number;
  breakdown: { label: string; score: number; weight: number }[];
  insight: string;
}

interface LocationScoreInput {
  city: string;
  rentalYield: number;
  appreciation: number;
  dscr?: number;
  irr?: number;
}

// City intelligence database — V3.1
const CITY_INTELLIGENCE: Record<string, {
  infrastructure: number;
  employment: number;
  population: number;
  rentalDemand: number;
}> = {
  bangalore: { infrastructure: 7, employment: 9, population: 8, rentalDemand: 9 },
  mumbai:    { infrastructure: 8, employment: 8, population: 7, rentalDemand: 8 },
  delhi:     { infrastructure: 8, employment: 7, population: 8, rentalDemand: 7 },
  hyderabad: { infrastructure: 8, employment: 9, population: 9, rentalDemand: 9 },
  pune:      { infrastructure: 7, employment: 8, population: 8, rentalDemand: 8 },
  chennai:   { infrastructure: 7, employment: 7, population: 7, rentalDemand: 7 },
  kolkata:   { infrastructure: 5, employment: 6, population: 6, rentalDemand: 6 },
  ahmedabad: { infrastructure: 7, employment: 7, population: 7, rentalDemand: 6 },
};

const DEFAULT_INTELLIGENCE = { infrastructure: 6, employment: 6, population: 6, rentalDemand: 6 };

function normalizeCity(city: string): string {
  const c = city.toLowerCase().trim();
  if (/bengaluru/.test(c)) return "bangalore";
  if (/new delhi|ncr|gurgaon|gurugram|noida/.test(c)) return "delhi";
  if (/navi mumbai|thane/.test(c)) return "mumbai";
  return c;
}

function scoreYield(yield_: number): number {
  if (yield_ >= 5) return 10;
  if (yield_ >= 4) return 8;
  if (yield_ >= 3.5) return 6;
  if (yield_ >= 3) return 4;
  if (yield_ >= 2.5) return 2;
  return 1;
}

function scoreGrowth(appreciation: number): number {
  if (appreciation >= 10) return 10;
  if (appreciation >= 8) return 8;
  if (appreciation >= 6) return 7;
  if (appreciation >= 5) return 5;
  if (appreciation >= 3) return 3;
  return 1;
}

function scoreRisk(dscr: number, irr: number): number {
  let s = 5;
  if (dscr >= 1.5) s += 2;
  else if (dscr >= 1.2) s += 1;
  else if (dscr < 1) s -= 2;
  if (irr >= 12) s += 2;
  else if (irr >= 8) s += 1;
  else if (irr < 5) s -= 2;
  return Math.max(0, Math.min(10, s));
}

function getGrade(score: number): "A" | "B" | "C" | "D" {
  if (score >= 8) return "A";
  if (score >= 6) return "B";
  if (score >= 4) return "C";
  return "D";
}

function getLabel(score: number): string {
  if (score >= 8) return "Excellent Market";
  if (score >= 6) return "Good Market";
  if (score >= 4) return "Average Market";
  return "Below Average Market";
}

export function calculateLocationScore(input: LocationScoreInput): LocationScoreResult {
  const { city, rentalYield, appreciation, dscr = 1.2, irr = 8 } = input;
  const intel = CITY_INTELLIGENCE[normalizeCity(city)] ?? DEFAULT_INTELLIGENCE;

  const yieldScore        = scoreYield(rentalYield);
  const growthScore       = scoreGrowth(appreciation);
  const riskScore         = scoreRisk(dscr, irr);
  const infrastructureScore = intel.infrastructure;
  const employmentScore   = intel.employment;
  const populationScore   = intel.population;
  const rentalDemandScore = intel.rentalDemand;

  const score = Math.round((
    yieldScore        * 0.25 +
    growthScore       * 0.25 +
    riskScore         * 0.20 +
    employmentScore   * 0.10 +
    rentalDemandScore * 0.10 +
    infrastructureScore * 0.05 +
    populationScore   * 0.05
  ) * 10) / 10;

  const grade = getGrade(score);

  const highlights: string[] = [];
  if (intel.employment >= 8) highlights.push("strong employment growth");
  if (intel.infrastructure >= 8) highlights.push("infrastructure investment");
  if (intel.rentalDemand >= 8) highlights.push("high rental demand");
  if (intel.population >= 8) highlights.push("population inflow");
  const suffix = highlights.length > 0 ? ` Key drivers: ${highlights.slice(0, 2).join(", ")}.` : "";

  const c = city || "this market";
  const insight =
    grade === "A" ? `${c} shows strong fundamentals — high yield, solid appreciation, and manageable risk.${suffix}` :
    grade === "B" ? `${c} is a decent investment market with reasonable returns and moderate risk.${suffix}` :
    grade === "C" ? `${c} presents average returns. Consider if alternatives offer better risk-adjusted gains.` :
    `${c} shows weak investment fundamentals. Carefully evaluate before committing.`;

  return {
    score, grade, label: getLabel(score),
    yieldScore, growthScore, riskScore,
    infrastructureScore, employmentScore, populationScore, rentalDemandScore,
    breakdown: [
      { label: "Rental Yield",         score: yieldScore,          weight: 25 },
      { label: "Growth Potential",      score: growthScore,         weight: 25 },
      { label: "Risk Profile",          score: riskScore,           weight: 20 },
      { label: "Employment Growth",     score: employmentScore,     weight: 10 },
      { label: "Rental Demand",         score: rentalDemandScore,   weight: 10 },
      { label: "Infrastructure Growth", score: infrastructureScore, weight: 5  },
      { label: "Population Trends",     score: populationScore,     weight: 5  },
    ],
    insight,
  };
}
