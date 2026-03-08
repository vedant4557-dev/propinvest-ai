// Loan Optimization Engine — PropInvest AI V3.1
// Compares EMI, total interest, and IRR across multiple loan tenures

export interface LoanTenureOption {
  tenureYears: number;
  emi: number;
  totalInterest: number;
  totalPaid: number;
  annualCashFlow: number;
  irrImpact: number;       // IRR delta vs base tenure
  monthlySavingsVsLongest: number;
}

export interface LoanOptimizationResult {
  options: LoanTenureOption[];
  recommendedTenure: number;
  recommendation: string;
  baseIRR: number;
}

export interface LoanOptimizationInput {
  loanAmount: number;
  loanInterestRate: number;  // %
  effectiveAnnualRent: number;
  annualMaintenance: number;
  effectiveDown: number;
  appreciation: number;      // %
  holdingPeriodYears: number;
  propertyPrice: number;
  cgTaxRate?: number;        // default 0.20
  tenures?: number[];        // default [10, 15, 20]
}

function calcEMI(principal: number, annualRatePct: number, tenureYears: number): number {
  if (annualRatePct === 0) return principal / (tenureYears * 12);
  const r = annualRatePct / 100 / 12;
  const n = tenureYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcIRR(flows: number[]): number {
  let lo = -0.95, hi = 3.0;
  const npv = (rate: number) =>
    flows.reduce((s, cf, t) => {
      const d = Math.pow(1 + rate, t);
      return s + (isFinite(d) && d > 1e-10 ? cf / d : 0);
    }, 0);
  if (npv(lo) * npv(hi) > 0) return 0;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return ((lo + hi) / 2) * 100;
}

function calcIRRForTenure(inp: LoanOptimizationInput, tenureYears: number): { irr: number; emi: number; annualCF: number } {
  const emi = calcEMI(inp.loanAmount, inp.loanInterestRate, tenureYears);
  const annualEMI = emi * 12;
  const annualCF = inp.effectiveAnnualRent - annualEMI - inp.annualMaintenance;

  const futureValue = inp.propertyPrice * Math.pow(1 + inp.appreciation / 100, inp.holdingPeriodYears);
  const cgRate = inp.cgTaxRate ?? 0.20;
  const cgTax = Math.max(0, (futureValue - inp.propertyPrice) * cgRate);

  // Remaining loan at exit
  let remainingLoan = 0;
  const periods = Math.min(inp.holdingPeriodYears * 12, tenureYears * 12);
  if (inp.loanInterestRate > 0 && tenureYears * 12 > periods) {
    const r = inp.loanInterestRate / 100 / 12;
    const n = tenureYears * 12;
    remainingLoan = emi * (1 - Math.pow(1 + r, -(n - periods))) / r;
  }

  const netSale = futureValue - remainingLoan - cgTax;
  const flows = [-inp.effectiveDown];
  for (let yr = 1; yr <= inp.holdingPeriodYears; yr++) {
    flows.push(yr === inp.holdingPeriodYears ? annualCF + netSale : annualCF);
  }

  return { irr: calcIRR(flows), emi, annualCF };
}

export function calculateLoanOptimization(inp: LoanOptimizationInput): LoanOptimizationResult {
  const tenures = inp.tenures ?? [10, 15, 20];

  // Use longest tenure as baseline for monthly savings comparison
  const longestTenure = Math.max(...tenures);
  const longestEMI = calcEMI(inp.loanAmount, inp.loanInterestRate, longestTenure);

  // Calculate base IRR at median tenure for delta comparison
  const medianTenure = tenures[Math.floor(tenures.length / 2)];
  const { irr: baseIRR } = calcIRRForTenure(inp, medianTenure);

  const options: LoanTenureOption[] = tenures.map((t) => {
    const { irr, emi, annualCF } = calcIRRForTenure(inp, t);
    const totalPaid = emi * t * 12;
    const totalInterest = totalPaid - inp.loanAmount;
    return {
      tenureYears: t,
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPaid: Math.round(totalPaid),
      annualCashFlow: Math.round(annualCF),
      irrImpact: Math.round((irr - baseIRR) * 10) / 10,
      monthlySavingsVsLongest: Math.round(longestEMI - emi),
    };
  });

  // Recommend tenure with best IRR that has positive annual cash flow
  const viable = options.filter((o) => o.annualCashFlow >= 0);
  const recommended =
    viable.length > 0
      ? viable.reduce((best, o) => (o.irrImpact > best.irrImpact ? o : best))
      : options[options.length - 1]; // fallback to longest (lowest EMI)

  const recommendation =
    viable.length === 0
      ? `All tenures produce negative cash flow. Consider a higher down payment or longer tenure (${longestTenure}yr) to reduce EMI burden.`
      : `${recommended.tenureYears}-year tenure offers the best IRR balance with positive cash flow of ₹${Math.abs(recommended.annualCashFlow).toLocaleString("en-IN")}/yr.`;

  return { options, recommendedTenure: recommended.tenureYears, recommendation, baseIRR };
}
