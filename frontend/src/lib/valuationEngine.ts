// Valuation Engine — PropInvest AI
// Estimates fair property value based on NOI and cap rate benchmarks

export interface FairValueResult {
  fairValueLow: number;
  fairValueHigh: number;
  fairValueMid: number;
  overpricedAmount: number;
  overpricedPercent: number;
  isOverpriced: boolean;
  isUnderpriced: boolean;
  verdict: "Underpriced" | "Fair Value" | "Slightly Overpriced" | "Overpriced";
  verdictColor: "green" | "blue" | "yellow" | "red";
}

interface FairValueInput {
  propertyPrice: number;
  monthlyRent: number;
  vacancyRate?: number;       // 0-100
  annualMaintenance?: number;
  capRateBenchmarkLow?: number;  // e.g. 0.035
  capRateBenchmarkHigh?: number; // e.g. 0.045
}

export function calculateFairValue(input: FairValueInput): FairValueResult {
  const {
    propertyPrice,
    monthlyRent,
    vacancyRate = 5,
    annualMaintenance = 0,
    capRateBenchmarkLow = 0.035,
    capRateBenchmarkHigh = 0.045,
  } = input;

  const grossAnnualRent = monthlyRent * 12;
  const effectiveRent = grossAnnualRent * (1 - vacancyRate / 100);
  const noi = effectiveRent - annualMaintenance;

  // Fair value = NOI / cap rate
  const fairValueHigh = noi / capRateBenchmarkLow;   // lower cap → higher value
  const fairValueLow = noi / capRateBenchmarkHigh;    // higher cap → lower value
  const fairValueMid = (fairValueHigh + fairValueLow) / 2;

  const overpricedAmount = propertyPrice - fairValueMid;
  const overpricedPercent = (overpricedAmount / fairValueMid) * 100;

  const isOverpriced = propertyPrice > fairValueHigh * 1.05;
  const isUnderpriced = propertyPrice < fairValueLow * 0.95;

  let verdict: FairValueResult["verdict"];
  let verdictColor: FairValueResult["verdictColor"];

  if (overpricedPercent < -10) {
    verdict = "Underpriced";
    verdictColor = "green";
  } else if (overpricedPercent <= 10) {
    verdict = "Fair Value";
    verdictColor = "blue";
  } else if (overpricedPercent <= 25) {
    verdict = "Slightly Overpriced";
    verdictColor = "yellow";
  } else {
    verdict = "Overpriced";
    verdictColor = "red";
  }

  return {
    fairValueLow: Math.round(fairValueLow),
    fairValueHigh: Math.round(fairValueHigh),
    fairValueMid: Math.round(fairValueMid),
    overpricedAmount: Math.round(overpricedAmount),
    overpricedPercent: Math.round(overpricedPercent * 10) / 10,
    isOverpriced,
    isUnderpriced,
    verdict,
    verdictColor,
  };
}
