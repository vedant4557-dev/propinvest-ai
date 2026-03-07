// Advanced Metrics Engine — PropInvest AI V3.1
// Tasks 6, 7, 8: Equity Multiple, Payback Period, Levered vs Unlevered IRR

// ─── TASK 6: Equity Multiple ───────────────────────────────────────────────
export interface EquityMultipleResult {
  equityMultiple: number;       // total cash returned / equity invested
  totalCashReturned: number;
  equityInvested: number;
  verdict: "Excellent" | "Good" | "Moderate" | "Poor";
  verdictColor: "green" | "blue" | "yellow" | "red";
  insight: string;
}

export function calculateEquityMultiple(
  effectiveDown: number,
  totalRentalIncome: number,    // net over holding period
  netSaleProceeds: number,
  totalEMIPaid: number,
  totalMaintenance: number
): EquityMultipleResult {
  const equityInvested = effectiveDown;
  // Total cash returned = sale proceeds + all rent received - all EMI paid - maintenance
  const totalCashReturned = netSaleProceeds + totalRentalIncome - totalEMIPaid - totalMaintenance + effectiveDown;
  const equityMultiple = equityInvested > 0
    ? Math.round((totalCashReturned / equityInvested) * 100) / 100
    : 0;

  const verdict: EquityMultipleResult["verdict"] =
    equityMultiple >= 2.5 ? "Excellent" :
    equityMultiple >= 1.8 ? "Good" :
    equityMultiple >= 1.2 ? "Moderate" : "Poor";

  const verdictColor: EquityMultipleResult["verdictColor"] =
    equityMultiple >= 2.5 ? "green" :
    equityMultiple >= 1.8 ? "blue" :
    equityMultiple >= 1.2 ? "yellow" : "red";

  const insight =
    verdict === "Excellent" ? `Every ₹1 invested returns ₹${equityMultiple.toFixed(2)} — excellent wealth creation.` :
    verdict === "Good"      ? `Equity grows ${equityMultiple.toFixed(2)}x — solid institutional-grade return.` :
    verdict === "Moderate"  ? `Equity grows ${equityMultiple.toFixed(2)}x — moderate return. Evaluate vs alternatives.` :
    `Equity multiple below 1.2x — limited wealth creation over the holding period.`;

  return { equityMultiple, totalCashReturned: Math.round(totalCashReturned), equityInvested, verdict, verdictColor, insight };
}

// ─── TASK 7: Payback Period ─────────────────────────────────────────────────
export interface PaybackPeriodResult {
  paybackYears: number;        // -1 if never recovered within holding period
  recovered: boolean;
  insight: string;
}

export function calculatePaybackPeriod(
  effectiveDown: number,
  annualCashFlow: number,       // annual net cash flow (can be negative)
  cashFlowTimeline?: { year: number; net_cash_flow: number; cumulative_cash_flow: number }[]
): PaybackPeriodResult {
  // Use timeline if available for accuracy
  if (cashFlowTimeline && cashFlowTimeline.length > 0) {
    for (const yr of cashFlowTimeline) {
      if (yr.cumulative_cash_flow >= effectiveDown) {
        return {
          paybackYears: yr.year,
          recovered: true,
          insight: `Initial equity recovered in year ${yr.year} through cumulative cash flows.`,
        };
      }
    }
    return {
      paybackYears: -1,
      recovered: false,
      insight: "Initial equity not fully recovered from cash flows alone — relies on capital gains at exit.",
    };
  }

  // Fallback: simple calculation
  if (annualCashFlow <= 0) {
    return {
      paybackYears: -1,
      recovered: false,
      insight: "Negative annual cash flow — payback through cash flow alone is not possible.",
    };
  }

  const years = Math.ceil(effectiveDown / annualCashFlow);
  return {
    paybackYears: years,
    recovered: true,
    insight: `At current cash flows, initial equity recovers in approximately ${years} year${years !== 1 ? "s" : ""}.`,
  };
}

// ─── TASK 8: Levered vs Unlevered IRR ──────────────────────────────────────
export interface LeveredUnleveredIRRResult {
  leveredIRR: number;
  unleveredIRR: number;
  leverageEffect: number;       // delta (levered - unlevered)
  leverageBenefit: boolean;     // is leverage actually helping?
  insight: string;
}

function bisectionIRR(flows: number[]): number {
  const npv = (r: number) =>
    flows.reduce((s, cf, t) => {
      const d = Math.pow(1 + r, t);
      return s + (isFinite(d) && d > 1e-10 ? cf / d : 0);
    }, 0);

  for (let lo = -0.90; lo < 5.0; lo += 0.25) {
    const hi = lo + 0.25;
    if (npv(lo) * npv(hi) <= 0) {
      let l = lo, h = hi;
      for (let i = 0; i < 100; i++) {
        const mid = (l + h) / 2;
        if (Math.abs(h - l) < 1e-8) break;
        if (npv(l) * npv(mid) <= 0) h = mid; else l = mid;
      }
      return Math.round(((l + h) / 2) * 1000) / 10;
    }
  }
  return 0;
}

export interface LeveredUnleveredInput {
  propertyPrice: number;
  effectiveDown: number;
  loanAmount: number;
  monthlyRent: number;
  vacancyRate: number;
  annualMaintenance: number;
  annualEMI: number;
  holdingPeriodYears: number;
  appreciation: number;
  loanInterestRate: number;
  loanTenureYears: number;
  leveredIRR: number;
}

export function calculateLeveredUnleveredIRR(inp: LeveredUnleveredInput): LeveredUnleveredIRRResult {
  const annualRent = inp.monthlyRent * 12 * (1 - inp.vacancyRate / 100);
  const unlevAnnualCF = annualRent - inp.annualMaintenance; // no EMI

  const futureValue = inp.propertyPrice * Math.pow(1 + inp.appreciation / 100, inp.holdingPeriodYears);
  const cgTax = Math.max(0, (futureValue - inp.propertyPrice) * 0.20);
  const exitCosts = futureValue * 0.03;
  const netSale = futureValue - cgTax - exitCosts; // no remaining loan for unlevered

  // Unlevered: invest full price, no loan, no EMI
  const unlevFlows = [-inp.propertyPrice];
  for (let yr = 1; yr <= inp.holdingPeriodYears; yr++) {
    unlevFlows.push(yr === inp.holdingPeriodYears ? unlevAnnualCF + netSale : unlevAnnualCF);
  }

  const unleveredIRR = bisectionIRR(unlevFlows);
  const leveredIRR   = inp.leveredIRR;
  const leverageEffect = Math.round((leveredIRR - unleveredIRR) * 10) / 10;
  const leverageBenefit = leverageEffect > 0;

  const insight = leverageBenefit
    ? `Leverage adds ${leverageEffect.toFixed(1)}pp IRR (${leveredIRR.toFixed(1)}% vs ${unleveredIRR.toFixed(1)}% unlevered). Debt is working for you.`
    : `Leverage costs ${Math.abs(leverageEffect).toFixed(1)}pp IRR (${leveredIRR.toFixed(1)}% vs ${unleveredIRR.toFixed(1)}% unlevered). Loan cost exceeds equity return.`;

  return { leveredIRR, unleveredIRR, leverageEffect, leverageBenefit, insight };
}
