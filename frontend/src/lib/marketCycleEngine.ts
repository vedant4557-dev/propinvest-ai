// Market Cycle Engine — PropInvest AI
// Returns the current real estate market cycle stage per city

export type MarketCycleStage = "Recovery" | "Expansion" | "Peak" | "Correction";

export interface MarketCycleResult {
  stage: MarketCycleStage;
  stageEmoji: string;
  color: string;
  bgColor: string;
  description: string;
  investorImplication: string;
  priceOutlook: string;
  city: string;
}

interface CycleData {
  stage: MarketCycleStage;
  description: string;
  priceOutlook: string;
}

// Based on current market conditions (2025 benchmark data)
const CITY_CYCLE: Record<string, CycleData> = {
  bangalore: {
    stage: "Expansion",
    description: "Strong absorption, rising prices, growing rental demand",
    priceOutlook: "7–10% appreciation expected over next 2 years",
  },
  mumbai: {
    stage: "Peak",
    description: "High prices, slowing volume, premium segment caution warranted",
    priceOutlook: "3–5% appreciation; risk of consolidation in premium segment",
  },
  delhi: {
    stage: "Expansion",
    description: "NCR micro-markets expanding, infra-driven growth visible",
    priceOutlook: "5–8% appreciation, driven by metro and expressway corridors",
  },
  hyderabad: {
    stage: "Expansion",
    description: "Strong IT-driven demand, new corridors opening",
    priceOutlook: "8–12% appreciation in emerging corridors",
  },
  pune: {
    stage: "Expansion",
    description: "Steady growth, affordable alternatives to Mumbai",
    priceOutlook: "6–9% appreciation, particularly in IT corridors",
  },
  chennai: {
    stage: "Recovery",
    description: "Market stabilizing after soft period, early recovery signals",
    priceOutlook: "4–6% appreciation as demand rebuilds",
  },
  kolkata: {
    stage: "Recovery",
    description: "Slow recovery, value opportunities in established areas",
    priceOutlook: "3–5% appreciation, selective micro-market growth",
  },
  ahmedabad: {
    stage: "Expansion",
    description: "Industrial and GIFT City driving real estate growth",
    priceOutlook: "6–9% appreciation, industrial corridors outperforming",
  },
};

const DEFAULT_CYCLE: CycleData = {
  stage: "Expansion",
  description: "Indian real estate broadly in expansion phase",
  priceOutlook: "5–8% appreciation expected nationally",
};

const STAGE_META: Record<MarketCycleStage, {
  emoji: string; color: string; bgColor: string; implication: string;
}> = {
  Recovery: {
    emoji: "🌱",
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    implication: "Good entry point — prices near bottom, buying before upswing.",
  },
  Expansion: {
    emoji: "📈",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    implication: "Strong phase for investment — rising rents, improving yields.",
  },
  Peak: {
    emoji: "⚠️",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    implication: "Exercise caution — high valuations, correction risk ahead.",
  },
  Correction: {
    emoji: "📉",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-900/20",
    implication: "Hold strategy — wait for stabilisation before committing capital.",
  },
};

function normalizeCity(city: string): string {
  const c = city.toLowerCase().trim();
  if (/bengaluru/.test(c)) return "bangalore";
  if (/new delhi|ncr|gurgaon|gurugram|noida/.test(c)) return "delhi";
  if (/navi mumbai|thane/.test(c)) return "mumbai";
  return c;
}

export function getMarketCycle(city: string): MarketCycleResult {
  const key = normalizeCity(city);
  const data = CITY_CYCLE[key] ?? DEFAULT_CYCLE;
  const meta = STAGE_META[data.stage];

  return {
    stage: data.stage,
    stageEmoji: meta.emoji,
    color: meta.color,
    bgColor: meta.bgColor,
    description: data.description,
    investorImplication: meta.implication,
    priceOutlook: data.priceOutlook,
    city: city || "India",
  };
}
