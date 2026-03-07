// Refinance Engine — PropInvest AI V3.1
// Simulates a refinance event when property appreciates and models cash-out + IRR impact

export interface RefinanceResult {
  refinanceYear: number;
  currentPropertyValue: number;
  maxNewLoan: number;          // 70% LTV of new value
  cashOut: number;             // new loan - remaining original loan
  newEMI: number;
  originalEMI: number;
  emiDelta: number;            // new - original (positive = higher payments)
  irrWithRefinance: number;
  irrWithoutRefinance: number;
  irrImpact: number;
  isViable: boolean;
  insight: string;
}

export interface RefinanceInput {
  propertyPrice: number;
  loanAmount: number;
  loanInterestRate: number;    // %
  loanTenureYears: number;
  monthlyRent: number;
  vacancyRate: number;         // %
  annualMaintenance: number;
  appreciation: number;        // %
  holdingPeriodYears: number;
  effectiveDown: number;
  refinanceYear?: number;      // default: when value is 30% higher
  newLtvRatio?: number;        // default 0.70
  refinanceRateAdj?: number;   // % adjustment to loan rate for new loan (default 0)
  baseIRR: number;
}

function calcEMI(principal: number, annualRate: number, tenureYears: number): number {
  if (annualRate === 0) return principal / (tenureYears * 12);
  const r = annualRate / 100 / 12;
  const n = tenureYears * 12;
  return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
}

function remainingLoan(emi: number, rate: number, totalMonths: number, paidMonths: number): number {
  if (rate === 0 || totalMonths <= paidMonths) return 0;
  const r = rate / 100 / 12;
  return emi * (1 - Math.pow(1 + r, -(totalMonths - paidMonths))) / r;
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

export function calculateRefinance(inp: RefinanceInput): RefinanceResult {
  const newLTV      = inp.newLtvRatio ?? 0.70;
  const rateAdj     = inp.refinanceRateAdj ?? 0;
  const newRate     = inp.loanInterestRate + rateAdj;

  // Find refinance year — first year where value is >= 30% higher than purchase
  let refinanceYear = inp.refinanceYear ?? 0;
  if (!refinanceYear) {
    for (let yr = 1; yr <= inp.holdingPeriodYears; yr++) {
      const val = inp.propertyPrice * Math.pow(1 + inp.appreciation / 100, yr);
      if (val >= inp.propertyPrice * 1.30) { refinanceYear = yr; break; }
    }
    if (!refinanceYear) refinanceYear = inp.holdingPeriodYears; // fallback
  }

  const propertyValueAtRefi = inp.propertyPrice * Math.pow(1 + inp.appreciation / 100, refinanceYear);
  const maxNewLoan   = propertyValueAtRefi * newLTV;
  const origEMI      = calcEMI(inp.loanAmount, inp.loanInterestRate, inp.loanTenureYears);
  const paidMonths   = refinanceYear * 12;
  const origRemaining = remainingLoan(origEMI, inp.loanInterestRate, inp.loanTenureYears * 12, Math.min(paidMonths, inp.loanTenureYears * 12));
  const cashOut      = Math.max(0, maxNewLoan - origRemaining);

  // Remaining holding years after refinance
  const yearsLeft    = inp.holdingPeriodYears - refinanceYear;
  const newLoanTenure = Math.max(yearsLeft, inp.loanTenureYears - refinanceYear);
  const newEMI       = calcEMI(maxNewLoan, newRate, newLoanTenure);
  const emiDelta     = Math.round(newEMI - origEMI);

  // IRR with refinance: cashOut at refinance year is a positive inflow
  const annualRent = inp.monthlyRent * 12 * (1 - inp.vacancyRate / 100);
  const origAnnualCF = annualRent - origEMI * 12 - inp.annualMaintenance;
  const newAnnualCF  = annualRent - newEMI * 12 - inp.annualMaintenance;

  const futureValue  = inp.propertyPrice * Math.pow(1 + inp.appreciation / 100, inp.holdingPeriodYears);
  const cgTax        = Math.max(0, (futureValue - inp.propertyPrice) * 0.20);
  const exitCosts    = futureValue * 0.03;

  // At exit: remaining on new loan
  const newPaidMonths  = yearsLeft * 12;
  const newLoanMonths  = newLoanTenure * 12;
  const remainNew      = remainingLoan(newEMI, newRate, newLoanMonths, Math.min(newPaidMonths, newLoanMonths));
  const netSaleRefi    = futureValue - remainNew - cgTax - exitCosts;

  const refiFlows = [-inp.effectiveDown];
  for (let yr = 1; yr <= inp.holdingPeriodYears; yr++) {
    let cf = yr < refinanceYear ? origAnnualCF : newAnnualCF;
    if (yr === refinanceYear) cf += cashOut;       // cash-out inflow
    if (yr === inp.holdingPeriodYears) cf += netSaleRefi;
    refiFlows.push(isFinite(cf) ? cf : 0);
  }

  const irrWithRefinance    = bisectionIRR(refiFlows);
  const irrWithoutRefinance = inp.baseIRR;
  const irrImpact           = Math.round((irrWithRefinance - irrWithoutRefinance) * 10) / 10;

  const isViable = cashOut > 0 && newAnnualCF > -inp.annualMaintenance * 2;

  const insight = !isViable
    ? "Property value hasn't appreciated enough for a viable cash-out refinance yet."
    : irrImpact > 0
    ? `Refinancing in year ${refinanceYear} unlocks ${formatINRShort(cashOut)} cash-out and boosts IRR by +${irrImpact.toFixed(1)}pp.`
    : `Cash-out of ${formatINRShort(cashOut)} available, but higher EMI reduces IRR by ${Math.abs(irrImpact).toFixed(1)}pp. Redeploy proceeds wisely.`;

  return {
    refinanceYear,
    currentPropertyValue: Math.round(propertyValueAtRefi),
    maxNewLoan: Math.round(maxNewLoan),
    cashOut: Math.round(cashOut),
    newEMI: Math.round(newEMI),
    originalEMI: Math.round(origEMI),
    emiDelta,
    irrWithRefinance,
    irrWithoutRefinance,
    irrImpact,
    isViable,
    insight,
  };
}

function formatINRShort(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  if (value >= 100_000)    return `₹${(value / 100_000).toFixed(1)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}
