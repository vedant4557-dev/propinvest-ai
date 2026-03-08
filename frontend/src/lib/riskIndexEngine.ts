// Real Estate Risk Index Engine — PropInvest AI V3.1
// Combines DSCR, vacancy, liquidity, market cycle, and supply pressure into a 1–10 risk score

export interface RiskIndexResult {
  riskIndex: number;           // 1–10, higher = riskier
  investmentScore: number;     // 10 - riskIndex, higher = better
  label: "Low Risk" | "Moderate Risk" | "High Risk" | "Very High Risk";
  color: "green" | "yellow" | "orange" | "red";
  components: RiskComponent[];
  insight: string;
  recommendation: string;
  improvements: string[];      // Task 15: actionable suggestions to reduce risk
}

export interface RiskComponent {
  name: string;
  score: number;       // contribution to risk (1–10)
  weight: number;      // weight %
  status: "good" | "warning" | "danger";
  note: string;
}

export interface RiskIndexInput {
  dscr: number;
  vacancyRate: number;         // %
  liquidityScore: number;      // 1–10, higher = more liquid (from liquidityEngine)
  marketCycleStage: string;    // "Recovery" | "Expansion" | "Peak" | "Correction"
  supplyPressure: string;      // "Favorable" | "Neutral" | "Unfavorable" (from supplyDemandEngine)
  ltv: number;                 // %
  irr: number;                 // %
}

function scoreDSCR(dscr: number): { score: number; status: RiskComponent["status"]; note: string } {
  if (dscr >= 1.5) return { score: 2, status: "good", note: "Strong debt coverage" };
  if (dscr >= 1.25) return { score: 4, status: "good", note: "Adequate debt coverage" };
  if (dscr >= 1.0) return { score: 6, status: "warning", note: "Thin debt coverage margin" };
  if (dscr >= 0.8) return { score: 8, status: "danger", note: "Cash flow insufficient for debt" };
  return { score: 10, status: "danger", note: "Severely negative cash flow" };
}

function scoreVacancy(vacancy: number): { score: number; status: RiskComponent["status"]; note: string } {
  if (vacancy <= 5) return { score: 2, status: "good", note: "Low vacancy risk" };
  if (vacancy <= 10) return { score: 4, status: "good", note: "Normal vacancy range" };
  if (vacancy <= 20) return { score: 6, status: "warning", note: "Above-average vacancy" };
  if (vacancy <= 30) return { score: 8, status: "danger", note: "High vacancy risk" };
  return { score: 10, status: "danger", note: "Extreme vacancy risk" };
}

function scoreLiquidity(liquidityScore: number): { score: number; status: RiskComponent["status"]; note: string } {
  // Invert: high liquidity = low risk
  const riskScore = Math.round(11 - liquidityScore);
  if (liquidityScore >= 7) return { score: riskScore, status: "good", note: "High market liquidity" };
  if (liquidityScore >= 5) return { score: riskScore, status: "warning", note: "Moderate market liquidity" };
  return { score: riskScore, status: "danger", note: "Low market liquidity — exit may be slow" };
}

function scoreMarketCycle(stage: string): { score: number; status: RiskComponent["status"]; note: string } {
  const s = stage.toLowerCase();
  if (s === "recovery") return { score: 4, status: "good", note: "Buying at market bottom" };
  if (s === "expansion") return { score: 3, status: "good", note: "Growth phase — strong entry" };
  if (s === "peak") return { score: 7, status: "warning", note: "Near market peak — downside risk" };
  if (s === "correction") return { score: 9, status: "danger", note: "Market correction — capital at risk" };
  return { score: 5, status: "warning", note: "Market stage uncertain" };
}

function scoreSupplyPressure(pressure: string): { score: number; status: RiskComponent["status"]; note: string } {
  const p = pressure.toLowerCase();
  if (p === "favorable") return { score: 3, status: "good", note: "Demand exceeds supply — rental upside" };
  if (p === "neutral") return { score: 5, status: "warning", note: "Balanced supply and demand" };
  return { score: 8, status: "danger", note: "Oversupply — rent and value under pressure" };
}

function scoreLTV(ltv: number): { score: number; status: RiskComponent["status"]; note: string } {
  if (ltv <= 60) return { score: 2, status: "good", note: "Conservative LTV — low leverage risk" };
  if (ltv <= 75) return { score: 4, status: "good", note: "Standard LTV range" };
  if (ltv <= 85) return { score: 6, status: "warning", note: "High leverage — limited equity buffer" };
  return { score: 9, status: "danger", note: "Very high LTV — significant leverage risk" };
}

export function calculateRiskIndex(inp: RiskIndexInput): RiskIndexResult {
  const dscrResult     = scoreDSCR(inp.dscr);
  const vacancyResult  = scoreVacancy(inp.vacancyRate);
  const liquidResult   = scoreLiquidity(inp.liquidityScore);
  const cycleResult    = scoreMarketCycle(inp.marketCycleStage);
  const supplyResult   = scoreSupplyPressure(inp.supplyPressure);
  const ltvResult      = scoreLTV(inp.ltv);

  const components: RiskComponent[] = [
    { name: "Debt Coverage (DSCR)", score: dscrResult.score, weight: 25, status: dscrResult.status, note: dscrResult.note },
    { name: "Vacancy Risk",         score: vacancyResult.score, weight: 20, status: vacancyResult.status, note: vacancyResult.note },
    { name: "Market Liquidity",     score: liquidResult.score, weight: 15, status: liquidResult.status, note: liquidResult.note },
    { name: "Market Cycle",         score: cycleResult.score, weight: 20, status: cycleResult.status, note: cycleResult.note },
    { name: "Supply Pressure",      score: supplyResult.score, weight: 10, status: supplyResult.status, note: supplyResult.note },
    { name: "Leverage (LTV)",       score: ltvResult.score, weight: 10, status: ltvResult.status, note: ltvResult.note },
  ];

  const riskIndex = Math.round(
    components.reduce((s, c) => s + c.score * c.weight / 100, 0) * 10
  ) / 10;

  const investmentScore = Math.round((10 - riskIndex) * 10) / 10;

  const label: RiskIndexResult["label"] =
    riskIndex <= 3 ? "Low Risk" :
    riskIndex <= 5 ? "Moderate Risk" :
    riskIndex <= 7 ? "High Risk" : "Very High Risk";

  const color: RiskIndexResult["color"] =
    riskIndex <= 3 ? "green" :
    riskIndex <= 5 ? "yellow" :
    riskIndex <= 7 ? "orange" : "red";

  const dangerCount = components.filter((c) => c.status === "danger").length;

  const insight =
    label === "Low Risk"
      ? "This investment shows low overall risk. Strong fundamentals across most dimensions."
      : label === "Moderate Risk"
      ? `Moderate risk profile with ${dangerCount} concerning factor${dangerCount !== 1 ? "s" : ""}. Review highlighted areas.`
      : label === "High Risk"
      ? `High risk investment — ${dangerCount} critical risk factor${dangerCount !== 1 ? "s" : ""}. Proceed with caution.`
      : `Very high risk. Multiple critical factors present. This investment requires significant mitigation.`;

  const recommendation =
    riskIndex <= 3 ? "Proceed with confidence — risk-adjusted returns look favorable." :
    riskIndex <= 5 ? "Proceed with awareness of moderate risks. Ensure adequate cash reserves." :
    riskIndex <= 7 ? "Consider risk mitigations before proceeding. Review DSCR, vacancy, and leverage." :
    "High risk — reconsider or renegotiate terms significantly before investing.";

  // Task 15: actionable improvement suggestions based on danger/warning components
  const improvements: string[] = [];
  for (const c of components) {
    if (c.status === "danger" || c.status === "warning") {
      if (c.name.includes("DSCR"))       improvements.push("Increase down payment or reduce loan amount to improve debt coverage ratio.");
      if (c.name.includes("Vacancy"))    improvements.push("Choose high-demand locations and price rent competitively to reduce vacancy risk.");
      if (c.name.includes("Liquidity"))  improvements.push("Prefer metro/tier-1 cities and mid-range price segments for easier exit.");
      if (c.name.includes("Cycle"))      improvements.push("Wait for market correction or Recovery phase for a better entry price.");
      if (c.name.includes("Supply"))     improvements.push("Avoid oversupplied micro-markets; research new project launches in the area.");
      if (c.name.includes("Leverage"))   improvements.push("Increase down payment to 30–40% to reduce LTV and leverage risk.");
    }
  }

  return { riskIndex, investmentScore, label, color, components, insight, recommendation, improvements };
}
