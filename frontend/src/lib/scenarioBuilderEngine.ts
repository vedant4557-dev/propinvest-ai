// Scenario Builder Engine — PropInvest AI V3.1
// Simulates user-defined stress scenarios and calculates IRR + cash flow impact

export interface ScenarioResult {
  scenarioName: string;
  description: string;
  irr: number;
  annualCashFlow: number;
  irrDelta: number;
  cashFlowDelta: number;
  severity: "Positive" | "Mild" | "Moderate" | "Severe";
}

export interface ScenarioBuilderResult {
  baseIRR: number;
  baseAnnualCashFlow: number;
  scenarios: ScenarioResult[];
}

export interface ScenarioBuilderInput {
  // Base inputs
  effectiveDown: number;
  propertyPrice: number;
  monthlyRent: number;
  vacancyRate: number;         // %
  annualEMI: number;
  annualMaintenance: number;
  appreciation: number;        // %
  holdingPeriodYears: number;
  loanInterestRate: number;    // %
  loanTenureYears: number;
  loanAmount: number;
  baseIRR: number;
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

function computeIRR(
  inp: ScenarioBuilderInput,
  overrides: { rent?: number; vacancy?: number; loanRate?: number; appreciation?: number }
): { irr: number; annualCashFlow: number } {
  const rent = overrides.rent ?? inp.monthlyRent;
  const vacancy = overrides.vacancy ?? inp.vacancyRate;
  const loanRate = overrides.loanRate ?? inp.loanInterestRate;
  const apprec = overrides.appreciation ?? inp.appreciation;

  // Recompute EMI if rate changed
  let emi = inp.annualEMI / 12;
  if (overrides.loanRate !== undefined) {
    const r = loanRate / 100 / 12;
    const n = inp.loanTenureYears * 12;
    emi = loanRate > 0
      ? inp.loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      : inp.loanAmount / n;
  }
  const annualEMI = emi * 12;

  const annualRent = rent * 12 * (1 - vacancy / 100);
  const annualCF = annualRent - annualEMI - inp.annualMaintenance;

  const futureValue = inp.propertyPrice * Math.pow(1 + apprec / 100, inp.holdingPeriodYears);
  const cgTax = Math.max(0, (futureValue - inp.propertyPrice) * 0.20);

  const r = loanRate / 100 / 12;
  const n = inp.loanTenureYears * 12;
  const paidMonths = Math.min(inp.holdingPeriodYears * 12, inp.loanTenureYears * 12);
  const remaining = r > 0 && n > paidMonths
    ? emi * (1 - Math.pow(1 + r, -(n - paidMonths))) / r
    : 0;
  const netSale = futureValue - remaining - cgTax;

  const flows = [-inp.effectiveDown];
  for (let yr = 1; yr <= inp.holdingPeriodYears; yr++) {
    flows.push(yr === inp.holdingPeriodYears ? annualCF + netSale : annualCF);
  }

  return { irr: bisectionIRR(flows), annualCashFlow: Math.round(annualCF) };
}

function severity(delta: number): ScenarioResult["severity"] {
  if (delta > 0) return "Positive";
  if (delta > -2) return "Mild";
  if (delta > -5) return "Moderate";
  return "Severe";
}

export function runScenarioBuilder(inp: ScenarioBuilderInput): ScenarioBuilderResult {
  const base = computeIRR(inp, {});

  const scenarioDefs: {
    name: string;
    description: string;
    overrides: Parameters<typeof computeIRR>[1];
  }[] = [
    {
      name: "Rate +2%",
      description: "Interest rate rises by 200 basis points",
      overrides: { loanRate: inp.loanInterestRate + 2 },
    },
    {
      name: "Rate +4%",
      description: "Severe rate hike of 400 basis points",
      overrides: { loanRate: inp.loanInterestRate + 4 },
    },
    {
      name: "Rent −10%",
      description: "Rental income drops 10% (softening market)",
      overrides: { rent: inp.monthlyRent * 0.90 },
    },
    {
      name: "Rent −20%",
      description: "Significant rent correction of 20%",
      overrides: { rent: inp.monthlyRent * 0.80 },
    },
    {
      name: "Vacancy +10%",
      description: "Vacancy increases by 10 percentage points",
      overrides: { vacancy: Math.min(inp.vacancyRate + 10, 60) },
    },
    {
      name: "No Appreciation",
      description: "Property price stays flat over holding period",
      overrides: { appreciation: 0 },
    },
    {
      name: "Recession",
      description: "Rate +2%, rent −15%, vacancy +10%, appreciation 0%",
      overrides: {
        loanRate: inp.loanInterestRate + 2,
        rent: inp.monthlyRent * 0.85,
        vacancy: Math.min(inp.vacancyRate + 10, 60),
        appreciation: 0,
      },
    },
    {
      name: "Bull Case",
      description: "Rent +15%, appreciation +3%, lower vacancy",
      overrides: {
        rent: inp.monthlyRent * 1.15,
        appreciation: inp.appreciation + 3,
        vacancy: Math.max(inp.vacancyRate - 3, 0),
      },
    },
  ];

  const scenarios: ScenarioResult[] = scenarioDefs.map((s) => {
    const res = computeIRR(inp, s.overrides);
    const irrDelta = Math.round((res.irr - base.irr) * 10) / 10;
    const cashFlowDelta = res.annualCashFlow - base.annualCashFlow;
    return {
      scenarioName: s.name,
      description: s.description,
      irr: res.irr,
      annualCashFlow: res.annualCashFlow,
      irrDelta,
      cashFlowDelta,
      severity: severity(irrDelta),
    };
  });

  return {
    baseIRR: base.irr,
    baseAnnualCashFlow: base.annualCashFlow,
    scenarios,
  };
}
