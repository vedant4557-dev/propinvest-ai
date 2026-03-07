// Negotiation Engine — PropInvest AI V3.1
// Calculates the target purchase price needed to achieve a given IRR

export interface NegotiationResult {
  targetPrice: number;
  currentPrice: number;
  priceReductionPercent: number;
  priceReductionAmount: number;
  targetIRR: number;
  isAlreadyAchievable: boolean;
  negotiationStrength: "Strong" | "Moderate" | "Weak" | "Already Achievable";
  insight: string;
}

export interface NegotiationInput {
  propertyPrice: number;
  downPaymentRatio: number;   // e.g. 0.20 for 20%
  loanInterestRate: number;   // %
  loanTenureYears: number;
  monthlyRent: number;
  annualMaintenance: number;
  vacancyRate: number;        // %
  appreciation: number;       // %
  holdingPeriodYears: number;
  stampDutyPercent: number;
  registrationCostPercent: number;
  currentIRR: number;
  targetIRR?: number;         // default 12
}

function estimateIRRAtPrice(price: number, inp: NegotiationInput): number {
  const down = price * inp.downPaymentRatio;
  const loan = price - down;
  const stamp = price * inp.stampDutyPercent / 100;
  const reg = price * inp.registrationCostPercent / 100;
  const effectiveDown = down + stamp + reg;

  let emi = 0;
  if (inp.loanInterestRate > 0) {
    const r = inp.loanInterestRate / 100 / 12;
    const n = inp.loanTenureYears * 12;
    emi = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  } else {
    emi = loan / (inp.loanTenureYears * 12);
  }

  const annualEMI = emi * 12;
  const effRent = inp.monthlyRent * 12 * (1 - inp.vacancyRate / 100);
  const annualCF = effRent - annualEMI - inp.annualMaintenance;

  const futureValue = price * Math.pow(1 + inp.appreciation / 100, inp.holdingPeriodYears);
  const cgTax = Math.max(0, (futureValue - price) * 0.20);

  // Remaining loan at exit
  let remainingLoan = 0;
  const periods = Math.min(inp.holdingPeriodYears * 12, inp.loanTenureYears * 12);
  if (inp.loanInterestRate > 0) {
    const r = inp.loanInterestRate / 100 / 12;
    const n = inp.loanTenureYears * 12;
    remainingLoan = n > periods ? emi * (1 - Math.pow(1 + r, -(n - periods))) / r : 0;
  }

  const netSale = futureValue - remainingLoan - cgTax;
  const flows = [-effectiveDown];
  for (let yr = 1; yr <= inp.holdingPeriodYears; yr++) {
    flows.push(yr === inp.holdingPeriodYears ? annualCF + netSale : annualCF);
  }

  // Simple bisection IRR solver
  let lo = -0.95, hi = 3.0;
  const npv = (rate: number) =>
    flows.reduce((s, cf, t) => {
      const denom = Math.pow(1 + rate, t);
      return s + (isFinite(denom) && denom > 1e-10 ? cf / denom : 0);
    }, 0);

  const fLo = npv(lo);
  const fHi = npv(hi);
  if (fLo * fHi > 0) return fLo < 0 ? -99 : 99;

  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return ((lo + hi) / 2) * 100;
}

export function calculateNegotiationPrice(inp: NegotiationInput): NegotiationResult {
  const targetIRR = inp.targetIRR ?? 12;
  const currentPrice = inp.propertyPrice;
  const currentIRR = inp.currentIRR;

  if (currentIRR >= targetIRR) {
    return {
      targetPrice: currentPrice,
      currentPrice,
      priceReductionPercent: 0,
      priceReductionAmount: 0,
      targetIRR,
      isAlreadyAchievable: true,
      negotiationStrength: "Already Achievable",
      insight: `Current price already achieves ${targetIRR}% IRR. No price negotiation needed.`,
    };
  }

  // Binary search for target price
  let lo = currentPrice * 0.40;
  let hi = currentPrice;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (estimateIRRAtPrice(mid, inp) >= targetIRR) hi = mid;
    else lo = mid;
  }

  const targetPrice = Math.round((lo + hi) / 2 / 10_000) * 10_000;
  const priceReductionAmount = currentPrice - targetPrice;
  const priceReductionPercent = Math.round((priceReductionAmount / currentPrice) * 1000) / 10;

  let negotiationStrength: NegotiationResult["negotiationStrength"];
  if (priceReductionPercent <= 5) negotiationStrength = "Weak";
  else if (priceReductionPercent <= 15) negotiationStrength = "Moderate";
  else negotiationStrength = "Strong";

  const insight =
    priceReductionPercent <= 5
      ? `Only a ${priceReductionPercent}% discount needed — reasonable in a negotiation.`
      : priceReductionPercent <= 15
      ? `Negotiate ${priceReductionPercent}% off asking price to hit ${targetIRR}% IRR. This is achievable in a buyer's market.`
      : `Requires ${priceReductionPercent}% price reduction — a tough negotiation. Consider if the deal is viable at current price.`;

  return {
    targetPrice,
    currentPrice,
    priceReductionPercent,
    priceReductionAmount,
    targetIRR,
    isAlreadyAchievable: false,
    negotiationStrength,
    insight,
  };
}
