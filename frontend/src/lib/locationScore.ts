// Location Score Module — PropInvest AI
// Scores a city/market from 0–10 based on yield, appreciation, risk

export interface LocationScoreResult {
  score: number;          // 0–10
  grade: "A" | "B" | "C" | "D";
  label: string;
  yieldScore: number;
  growthScore: number;
  riskScore: number;
  breakdown: { label: string; score: number; weight: number }[];
  insight: string;
}

interface LocationScoreInput {
  city: string;
  rentalYield: number;      // actual yield %
  appreciation: number;     // actual appreciation %
  dscr?: number;
  irr?: number;
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

function getInsight(grade: string, city: string): string {
  const c = city || "this market";
  if (grade === "A") return `${c} shows strong fundamentals — high yield, solid appreciation, and manageable risk.`;
  if (grade === "B") return `${c} is a decent investment market with reasonable returns and moderate risk.`;
  if (grade === "C") return `${c} presents average returns. Consider if alternatives offer better risk-adjusted gains.`;
  return `${c} shows weak investment fundamentals. Carefully evaluate before committing.`;
}

export function calculateLocationScore(input: LocationScoreInput): LocationScoreResult {
  const { city, rentalYield, appreciation, dscr = 1.2, irr = 8 } = input;

  const yieldScore = scoreYield(rentalYield);
  const growthScore = scoreGrowth(appreciation);
  const riskScore = scoreRisk(dscr, irr);

  // Weighted: yield 35%, growth 40%, risk 25%
  const score = Math.round((yieldScore * 0.35 + growthScore * 0.40 + riskScore * 0.25) * 10) / 10;
  const grade = getGrade(score);

  return {
    score,
    grade,
    label: getLabel(score),
    yieldScore,
    growthScore,
    riskScore,
    breakdown: [
      { label: "Rental Yield", score: yieldScore, weight: 35 },
      { label: "Growth Potential", score: growthScore, weight: 40 },
      { label: "Risk Profile", score: riskScore, weight: 25 },
    ],
    insight: getInsight(grade, city),
  };
}
