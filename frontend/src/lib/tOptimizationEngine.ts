// Exit Optimization Engine — PropInvest AI V3.1
// Calculates IRR for selling at each year and finds the optimal exit point

export interface ExitYearResult {
  year: number;
  irr: number;
  futureValue: number;
  capitalGains: number;
  netSaleProceeds: number;
  totalCashFlow: number;
  isOptimal: boolean;
}

export interface ExitOptimizationResult {
  years: ExitYearResult[];
  bestExitYear: number;
  optimalIRR: number;
  worstExitYear: number;
  insight: string;
  holdLongerBenefit: number;  // IRR gain from holding to optimal vs current holding period
}

export interface ExitOptimizationInput {
  effectiveDown: number;
  propertyPrice: number;
  monthlyRent: number;
  vacancyRate: number;
  annualEMI: number;
  annualMaintenance: number;
  appreciation: number;
  loanInterestRate: number;
  loanTenureYears: number;
  loanAmount: number;
  maxYears?: number;    // default 20
}

function calcIRRAtYear(
  inp: ExitOptimizationInput,
  exitYear: number
): { irr: number; futureValue: number; capitalGains: number; netSale: number; totalCF: number } {
  const r = inp.loanInterestRate / 100 / 12;
  const n = inp.loanTenureYears * 12;
  const emi = inp.loanInterestRate > 0
    ? inp.loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : inp.loanAmount / n;

  const annualEMI = emi * 12;
  const annualRent = inp.monthlyRent * 12 * (1 - inp.vacancyRate / 100);
  const annualCF = annualRent - annualEMI - inp.annualMaintenance;

  const futureValue = inp.propertyPrice * Math.pow(1 + inp.appreciation / 100, exitYear);
  const capitalGains = Math.max(0, futureValue - inp.propertyPrice);
  const cgTax = capitalGains * (exitYear >= 2 ? 0.20 : 0.30);

  const paidMonths = Math.min(exitYear * 12, inp.loanTenureYears * 12);
  const remaining = r > 0 && n > paidMonths
    ? emi * (1 - Math.pow(1 + r, -(n - paidMonths))) / r
    : 0;
  const netSale = futureValue - remaining - cgTax;

  const flows = [-inp.effectiveDown];
  let totalCF = -inp.effectiveDown;
  for (let yr = 1; yr <= exitYear; yr++) {
    const cf = yr === exitYear ? annualCF + netSale : annualCF;
    flows.push(cf);
    totalCF += cf;
  }

  // Bisection IRR
  let lo = -0.95, hi = 3.0;
  const npv = (rate: number) =>
    flows.reduce((s, cf, t) => {
      const d = Math.pow(1 + rate, t);
      return s + (isFinite(d) && d > 1e-10 ? cf / d : 0);
    }, 0);

  let irr = 0;
  if (npv(lo) * npv(hi) <= 0) {
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (npv(lo) * npv(mid) <= 0) hi = mid;
      else lo = mid;
    }
    irr = ((lo + hi) / 2) * 100;
  }

  return {
    irr: Math.round(irr * 10) / 10,
    futureValue: Math.round(futureValue),
    capitalGains: Math.round(capitalGains),
    netSale: Math.round(netSale),
    totalCF: Math.round(totalCF),
  };
}

export function calculateExitOptimization(inp: ExitOptimizationInput): ExitOptimizationResult {
  const maxYears = Math.min(inp.maxYears ?? 20, 30);
  const years: ExitYearResult[] = [];

  for (let yr = 1; yr <= maxYears; yr++) {
    if (yr < 2) {
      // Skip year 1 — too short, no meaningful exit
      years.push({
        year: yr, irr: 0, futureValue: inp.propertyPrice,
        capitalGains: 0, netSaleProceeds: inp.propertyPrice,
        totalCashFlow: 0, isOptimal: false,
      });
      continue;
    }
    const res = calcIRRAtYear(inp, yr);
    years.push({
      year: yr, irr: res.irr, futureValue: res.futureValue,
      capitalGains: res.capitalGains, netSaleProceeds: res.netSale,
      totalCashFlow: res.totalCF, isOptimal: false,
    });
  }

  const validYears = years.filter((y) => y.year >= 2 && isFinite(y.irr));
  const bestEntry = validYears.reduce((best, y) => (y.irr > best.irr ? y : best), validYears[0]);
  const worstEntry = validYears.reduce((worst, y) => (y.irr < worst.irr ? y : worst), validYears[0]);

  if (bestEntry) bestEntry.isOptimal = true;

  const currentHoldingIRR = years[Math.min(9, years.length - 1)]?.irr ?? 0;
  const holdLongerBenefit = bestEntry
    ? Math.round((bestEntry.irr - currentHoldingIRR) * 10) / 10
    : 0;

  const insight = bestEntry
    ? bestEntry.year <= 5
      ? `Optimal exit is year ${bestEntry.year} (IRR: ${bestEntry.irr.toFixed(1)}%). Short-term hold — appreciation front-loads gains.`
      : bestEntry.year <= 10
      ? `Best exit at year ${bestEntry.year} (IRR: ${bestEntry.irr.toFixed(1)}%). Hold through the growth phase before selling.`
      : `Long-term hold to year ${bestEntry.year} maximizes IRR at ${bestEntry.irr.toFixed(1)}%. Compounding appreciation dominates returns.`
    : "Insufficient data to determine optimal exit.";

  return {
    years,
    bestExitYear: bestEntry?.year ?? 10,
    optimalIRR: bestEntry?.irr ?? 0,
    worstExitYear: worstEntry?.year ?? 1,
    insight,
    holdLongerBenefit,
  };
}
