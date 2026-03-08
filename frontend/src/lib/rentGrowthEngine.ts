// Rent Growth Simulation Engine — PropInvest AI V3.1
// Projects rental income with compound growth and recalculates IRR

export interface RentGrowthYearData {
  year: number;
  monthlyRent: number;
  annualRent: number;
  annualCashFlow: number;
  cumulativeCashFlow: number;
}

export interface RentGrowthResult {
  projectedYears: RentGrowthYearData[];
  totalRentalIncome: number;
  averageAnnualRent: number;
  growthIRR: number;
  baseIRR: number;
  irrUplift: number;
  rentAtExit: number;
}

export interface RentGrowthInput {
  baseMonthlyRent: number;
  rentGrowthRate: number;       // % per year, e.g. 5
  holdingPeriodYears: number;
  vacancyRate: number;          // %
  annualEMI: number;
  annualMaintenance: number;
  effectiveDown: number;
  propertyPrice: number;
  appreciation: number;         // %
  loanInterestRate: number;     // %
  loanTenureYears: number;
  loanAmount: number;
}

function calcRemainingLoan(
  emi: number, rate: number, totalMonths: number, paidMonths: number
): number {
  if (rate === 0 || totalMonths <= paidMonths) return 0;
  return emi * (1 - Math.pow(1 + rate, -(totalMonths - paidMonths))) / rate;
}

function bisectionIRR(flows: number[]): number {
  let lo = -0.95, hi = 3.0;
  const npv = (r: number) =>
    flows.reduce((s, cf, t) => {
      const d = Math.pow(1 + r, t);
      return s + (isFinite(d) && d > 1e-10 ? cf / d : 0);
    }, 0);
  if (npv(lo) * npv(hi) > 0) return 0;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return Math.round(((lo + hi) / 2) * 1000) / 10;
}

export function calculateRentGrowth(inp: RentGrowthInput): RentGrowthResult {
  const {
    baseMonthlyRent, rentGrowthRate, holdingPeriodYears,
    vacancyRate, annualEMI, annualMaintenance, effectiveDown,
    propertyPrice, appreciation, loanInterestRate, loanTenureYears, loanAmount,
  } = inp;

  const growthRate = Math.max(0, Math.min(rentGrowthRate, 15)) / 100;

  const projectedYears: RentGrowthYearData[] = [];
  let cumulativeCF = 0;
  const growthFlows: number[] = [-effectiveDown];
  const baseFlows: number[] = [-effectiveDown];

  const r = loanInterestRate / 100 / 12;
  const n = loanTenureYears * 12;
  const emi = loanInterestRate > 0
    ? loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : loanAmount / n;

  const futureValue = propertyPrice * Math.pow(1 + appreciation / 100, holdingPeriodYears);
  const cgTax = Math.max(0, (futureValue - propertyPrice) * 0.20);
  const paidMonths = Math.min(holdingPeriodYears * 12, loanTenureYears * 12);
  const remaining = calcRemainingLoan(emi, r, n, paidMonths);
  const netSale = futureValue - remaining - cgTax;

  const baseAnnualCF = baseMonthlyRent * 12 * (1 - vacancyRate / 100) - annualEMI - annualMaintenance;

  for (let yr = 1; yr <= holdingPeriodYears; yr++) {
    const monthlyRent = Math.round(baseMonthlyRent * Math.pow(1 + growthRate, yr - 1));
    const annualRent = monthlyRent * 12 * (1 - vacancyRate / 100);
    const annualCF = annualRent - annualEMI - annualMaintenance;
    cumulativeCF += annualCF;

    projectedYears.push({
      year: yr,
      monthlyRent,
      annualRent: Math.round(annualRent),
      annualCashFlow: Math.round(annualCF),
      cumulativeCashFlow: Math.round(cumulativeCF),
    });

    const growthYearCF = yr === holdingPeriodYears ? annualCF + netSale : annualCF;
    const baseYearCF = yr === holdingPeriodYears ? baseAnnualCF + netSale : baseAnnualCF;
    growthFlows.push(growthYearCF);
    baseFlows.push(baseYearCF);
  }

  const growthIRR = bisectionIRR(growthFlows);
  const baseIRR = bisectionIRR(baseFlows);

  return {
    projectedYears,
    totalRentalIncome: Math.round(projectedYears.reduce((s, y) => s + y.annualRent, 0)),
    averageAnnualRent: Math.round(projectedYears.reduce((s, y) => s + y.annualRent, 0) / holdingPeriodYears),
    growthIRR,
    baseIRR,
    irrUplift: Math.round((growthIRR - baseIRR) * 10) / 10,
    rentAtExit: projectedYears[projectedYears.length - 1]?.monthlyRent ?? baseMonthlyRent,
  };
}
