// Scenario Builder Engine — PropInvest AI V3.1 (fixed)
// Simulates user-defined stress scenarios — IRR = 0 bug fixed

export interface ScenarioResult {
  scenarioName: string;
  description: string;
  irr: number;
  annualCashFlow: number;
  dscr: number;
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
  effectiveDown: number;
  propertyPrice: number;
  monthlyRent: number;
  vacancyRate: number;
  annualEMI: number;
  annualMaintenance: number;
  appreciation: number;
  holdingPeriodYears: number;
  loanInterestRate: number;
  loanTenureYears: number;
  loanAmount: number;
  baseIRR: number;
}

// Robust IRR: expanded search range + fallback scan
function bisectionIRR(flows: number[]): number {
  const npv = (r: number) =>
    flows.reduce((s, cf, t) => {
      const d = Math.pow(1 + r, t);
      return s + (isFinite(d) && d > 1e-10 ? cf / d : 0);
    }, 0);

  // Scan for sign change across a wide range
  const candidates: number[] = [];
  for (let lo = -0.90; lo < 5.0; lo += 0.25) {
    const hi = lo + 0.25;
    if (npv(lo) * npv(hi) <= 0) {
      candidates.push(lo);
    }
  }

  if (candidates.length === 0) {
    // No sign change — return NPV-minimising rate as best estimate
    let bestR = 0, bestNPV = Math.abs(npv(0));
    for (let r = -0.5; r <= 4.0; r += 0.05) {
      const n = Math.abs(npv(r));
      if (n < bestNPV) { bestNPV = n; bestR = r; }
    }
    return Math.round(bestR * 1000) / 10;
  }

  // Use first sign-change bracket
  let lo = candidates[0];
  let hi = lo + 0.25;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (Math.abs(hi - lo) < 1e-8) break;
    if (npv(lo) * npv(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return Math.round(((lo + hi) / 2) * 1000) / 10;
}

function computeIRR(
  inp: ScenarioBuilderInput,
  overrides: { rent?: number; vacancy?: number; loanRate?: number; appreciation?: number }
): { irr: number; annualCashFlow: number; dscr: number } {
  const rent       = overrides.rent        ?? inp.monthlyRent;
  const vacancy    = overrides.vacancy     ?? inp.vacancyRate;
  const loanRate   = overrides.loanRate    ?? inp.loanInterestRate;
  const apprec     = overrides.appreciation ?? inp.appreciation;

  // Always recompute EMI from loanRate — avoids mismatch with remaining loan calc
  const r = loanRate / 100 / 12;
  const n = inp.loanTenureYears * 12;
  const emi = (loanRate > 0 && n > 0)
    ? inp.loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : (n > 0 ? inp.loanAmount / n : 0);
  const annualEMI = emi * 12;

  const annualRent = rent * 12 * (1 - vacancy / 100);
  const annualCF   = annualRent - annualEMI - inp.annualMaintenance;
  const dscr       = annualEMI > 0 ? Math.round((annualRent / annualEMI) * 100) / 100 : 999;

  // Future value and exit
  const clampedApprec = Math.max(-0.20, Math.min(apprec, 0.50 * 100)) / 100;
  const futureValue = inp.propertyPrice * Math.pow(1 + clampedApprec, inp.holdingPeriodYears);
  const cgTax = Math.max(0, (futureValue - inp.propertyPrice) * 0.20);

  // Remaining loan at exit — use same EMI/rate we computed
  const paidMonths = Math.min(inp.holdingPeriodYears * 12, n);
  const remaining = (r > 0 && n > paidMonths)
    ? emi * (1 - Math.pow(1 + r, -(n - paidMonths))) / r
    : 0;
  const netSale = Math.max(0, futureValue - remaining - cgTax);

  const flows = [-inp.effectiveDown];
  for (let yr = 1; yr <= inp.holdingPeriodYears; yr++) {
    const cf = yr === inp.holdingPeriodYears ? annualCF + netSale : annualCF;
    if (!isFinite(cf)) { flows.push(0); } else { flows.push(cf); }
  }

  return { irr: bisectionIRR(flows), annualCashFlow: Math.round(annualCF), dscr };
}

function severity(delta: number): ScenarioResult["severity"] {
  if (delta > 0)  return "Positive";
  if (delta > -2) return "Mild";
  if (delta > -5) return "Moderate";
  return "Severe";
}

export function runScenarioBuilder(inp: ScenarioBuilderInput): ScenarioBuilderResult {
  const base = computeIRR(inp, {});

  const scenarioDefs: { name: string; description: string; overrides: Parameters<typeof computeIRR>[1] }[] = [
    { name: "Rate +2%",         description: "Interest rate rises by 200 basis points", overrides: { loanRate: inp.loanInterestRate + 2 } },
    { name: "Rate +4%",         description: "Severe rate hike of 400 basis points",     overrides: { loanRate: inp.loanInterestRate + 4 } },
    { name: "Rent −10%",        description: "Rental income drops 10% (softening market)", overrides: { rent: inp.monthlyRent * 0.90 } },
    { name: "Rent −20%",        description: "Significant rent correction of 20%",       overrides: { rent: inp.monthlyRent * 0.80 } },
    { name: "Vacancy +10%",     description: "Vacancy increases by 10 percentage points", overrides: { vacancy: Math.min(inp.vacancyRate + 10, 60) } },
    { name: "No Appreciation",  description: "Property price stays flat over holding period", overrides: { appreciation: 0 } },
    { name: "Recession",        description: "Rate +2%, rent −15%, vacancy +10%, appreciation 0%",
      overrides: { loanRate: inp.loanInterestRate + 2, rent: inp.monthlyRent * 0.85, vacancy: Math.min(inp.vacancyRate + 10, 60), appreciation: 0 } },
    { name: "Bull Case",        description: "Rent +15%, appreciation +3%, lower vacancy",
      overrides: { rent: inp.monthlyRent * 1.15, appreciation: inp.appreciation + 3, vacancy: Math.max(inp.vacancyRate - 3, 0) } },
  ];

  const scenarios: ScenarioResult[] = scenarioDefs.map((s) => {
    const res = computeIRR(inp, s.overrides);
    const irrDelta = Math.round((res.irr - base.irr) * 10) / 10;
    return {
      scenarioName: s.name,
      description: s.description,
      irr: res.irr,
      annualCashFlow: res.annualCashFlow,
      dscr: res.dscr,
      irrDelta,
      cashFlowDelta: res.annualCashFlow - base.annualCashFlow,
      severity: severity(irrDelta),
    };
  });

  return { baseIRR: base.irr, baseAnnualCashFlow: base.annualCashFlow, scenarios };
}
