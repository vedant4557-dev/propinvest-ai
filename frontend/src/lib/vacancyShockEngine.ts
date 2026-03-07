// Vacancy Shock Engine — PropInvest AI V3.1
// Simulates a 6-month vacancy event and its IRR / cash flow impact

export interface VacancyShockResult {
  shockYear: number;            // which year the vacancy hits
  irrWithShock: number;
  irrWithoutShock: number;
  irrImpact: number;            // delta (negative = worse)
  cashFlowImpactTotal: number;  // total INR lost
  monthsOfVacancy: number;
  recoveryYears: number;        // how many years to recover the cash loss
  severity: "Low" | "Moderate" | "High";
  insight: string;
}

export interface VacancyShockInput {
  effectiveDown: number;
  annualEMI: number;
  monthlyRent: number;
  vacancyRate: number;
  annualMaintenance: number;
  holdingPeriodYears: number;
  propertyPrice: number;
  appreciation: number;
  loanInterestRate: number;
  loanTenureYears: number;
  loanAmount: number;
  baseIRR: number;
  shockMonths?: number;   // default 6
  shockYear?: number;     // default year 3
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

export function calculateVacancyShock(inp: VacancyShockInput): VacancyShockResult {
  const shockMonths = inp.shockMonths ?? 6;
  const shockYear = inp.shockYear ?? 3;

  const r = inp.loanInterestRate / 100 / 12;
  const n = inp.loanTenureYears * 12;
  const emi = inp.loanInterestRate > 0
    ? inp.loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : inp.loanAmount / n;

  const futureValue = inp.propertyPrice * Math.pow(1 + inp.appreciation / 100, inp.holdingPeriodYears);
  const cgTax = Math.max(0, (futureValue - inp.propertyPrice) * 0.20);
  const paidMonths = Math.min(inp.holdingPeriodYears * 12, inp.loanTenureYears * 12);
  const remaining = r > 0 && n > paidMonths
    ? emi * (1 - Math.pow(1 + r, -(n - paidMonths))) / r
    : 0;
  const netSale = futureValue - remaining - cgTax;

  const normalAnnualCF =
    inp.monthlyRent * 12 * (1 - inp.vacancyRate / 100) - inp.annualEMI - inp.annualMaintenance;

  // Vacancy shock year: lose shockMonths of rent (still pay EMI & maintenance)
  const shockRentLost = inp.monthlyRent * shockMonths;
  const shockedAnnualCF = normalAnnualCF - shockRentLost;

  const flows: number[] = [-inp.effectiveDown];
  for (let yr = 1; yr <= inp.holdingPeriodYears; yr++) {
    const base = yr === shockYear ? shockedAnnualCF : normalAnnualCF;
    flows.push(yr === inp.holdingPeriodYears ? base + netSale : base);
  }

  const irrWithShock = bisectionIRR(flows);
  const irrWithoutShock = inp.baseIRR;
  const irrImpact = Math.round((irrWithShock - irrWithoutShock) * 10) / 10;

  const cashFlowImpactTotal = Math.round(shockRentLost);
  const normalMonthlyNCF = normalAnnualCF / 12;
  const recoveryYears =
    normalMonthlyNCF > 0
      ? Math.ceil(shockRentLost / (normalAnnualCF))
      : 999;

  const severity: VacancyShockResult["severity"] =
    Math.abs(irrImpact) >= 3 ? "High" :
    Math.abs(irrImpact) >= 1 ? "Moderate" : "Low";

  const insight =
    severity === "Low"
      ? `A ${shockMonths}-month vacancy in year ${shockYear} has minimal IRR impact (${irrImpact.toFixed(1)}pp). Property cash flows absorb the shock well.`
      : severity === "Moderate"
      ? `A ${shockMonths}-month vacancy reduces IRR by ${Math.abs(irrImpact).toFixed(1)}pp. Maintain a 3–6 month rent reserve fund.`
      : `A ${shockMonths}-month vacancy severely impacts returns (${irrImpact.toFixed(1)}pp). High vacancy risk — build a robust cash reserve before investing.`;

  return {
    shockYear,
    irrWithShock,
    irrWithoutShock,
    irrImpact,
    cashFlowImpactTotal,
    monthsOfVacancy: shockMonths,
    recoveryYears: Math.min(recoveryYears, 999),
    severity,
    insight,
  };
}
