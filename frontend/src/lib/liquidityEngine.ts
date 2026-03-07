// Liquidity Engine — PropInvest AI
// Estimates how easily a property can be sold based on city tier, price segment, type

export type LiquidityLevel = "High" | "Moderate" | "Low";

export interface LiquidityResult {
  score: number;            // 1–10
  level: LiquidityLevel;
  label: string;
  color: "green" | "yellow" | "red";
  cityScore: number;        // 1–10
  priceScore: number;       // 1–10
  insight: string;
  factors: { label: string; score: number; note: string }[];
}

// City tier liquidity baseline (1–10)
const CITY_LIQUIDITY: Record<string, number> = {
  mumbai:    9,
  bangalore: 8,
  delhi:     8,
  hyderabad: 7,
  pune:      7,
  chennai:   6,
  kolkata:   6,
  ahmedabad: 5,
};

const DEFAULT_CITY_LIQUIDITY = 5;

function normalizeCity(city: string): string {
  const c = city.toLowerCase().trim();
  if (/bengaluru/.test(c)) return "bangalore";
  if (/new delhi|ncr|gurgaon|gurugram|noida/.test(c)) return "delhi";
  if (/navi mumbai|thane/.test(c)) return "mumbai";
  return c;
}

function scorePriceSegment(price: number): { score: number; note: string } {
  // Sweet spot for liquidity is affordable–mid segment
  if (price < 3_000_000)  return { score: 9, note: "Affordable — wide buyer pool" };
  if (price < 7_000_000)  return { score: 8, note: "Mid-segment — strong demand" };
  if (price < 15_000_000) return { score: 6, note: "Premium — moderate buyer pool" };
  if (price < 30_000_000) return { score: 4, note: "Luxury — limited buyers" };
  return { score: 2, note: "Ultra-luxury — niche market, slow to sell" };
}

export function calculateLiquidity(
  city: string,
  propertyPrice: number
): LiquidityResult {
  const cityKey = normalizeCity(city);
  const cityScore = CITY_LIQUIDITY[cityKey] ?? DEFAULT_CITY_LIQUIDITY;
  const { score: priceScore, note: priceNote } = scorePriceSegment(propertyPrice);

  // Weighted score: city 50%, price segment 50%
  const rawScore = cityScore * 0.50 + priceScore * 0.50;
  const score = Math.round(Math.max(1, Math.min(10, rawScore)));

  let level: LiquidityLevel;
  let color: LiquidityResult["color"];
  let label: string;

  if (score >= 7) {
    level = "High"; color = "green"; label = "High Liquidity";
  } else if (score >= 5) {
    level = "Moderate"; color = "yellow"; label = "Moderate Liquidity";
  } else {
    level = "Low"; color = "red"; label = "Low Liquidity";
  }

  const cityName = city || "this market";
  const insight =
    level === "High"
      ? `${cityName} properties in this price range sell quickly — typically 30–60 days.`
      : level === "Moderate"
      ? `${cityName} properties at this price point have moderate buyer interest — expect 60–120 days to sell.`
      : `This property may take 6–12+ months to sell due to limited buyer pool in ${cityName}.`;

  return {
    score,
    level,
    label,
    color,
    cityScore,
    priceScore,
    insight,
    factors: [
      {
        label: "City Market Depth",
        score: cityScore,
        note: `${city || "Unknown city"} — tier ${cityScore >= 7 ? "1" : cityScore >= 5 ? "2" : "3"} market`,
      },
      {
        label: "Price Segment",
        score: priceScore,
        note: priceNote,
      },
    ],
  };
}
