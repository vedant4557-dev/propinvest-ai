// Validation Engine — PropInvest AI
// Returns structured warnings without blocking the user

export type WarningSeverity = "info" | "warning" | "danger";

export interface ValidationWarning {
  field: string;
  message: string;
  severity: WarningSeverity;
  suggestion?: string;
}

export interface ValidationResult {
  warnings: ValidationWarning[];
  hasWarnings: boolean;
  hasDangerWarnings: boolean;
}

interface ValidatableInput {
  property_purchase_price: number;
  down_payment: number;
  loan_interest_rate: number;
  loan_tenure_years: number;
  expected_monthly_rent: number;
  annual_maintenance_cost: number;
  expected_annual_appreciation: number;
  holding_period_years: number;
  investor_tax_slab: number;
  vacancy_rate?: number;
  stamp_duty_percent?: number;
}

export function validateInvestmentInput(input: ValidatableInput): ValidationResult {
  const warnings: ValidationWarning[] = [];

  const {
    property_purchase_price: price,
    down_payment,
    loan_interest_rate: rate,
    expected_monthly_rent: rent,
    annual_maintenance_cost: maintenance,
    expected_annual_appreciation: appreciation,
    holding_period_years: holdingYears,
    vacancy_rate = 5,
    investor_tax_slab: taxSlab,
  } = input;

  // Down payment checks
  const ltvRatio = ((price - down_payment) / price) * 100;
  if (ltvRatio > 90) {
    warnings.push({
      field: "down_payment",
      message: "LTV ratio exceeds 90% — most banks cap at 80-85%.",
      severity: "warning",
      suggestion: "Consider increasing your down payment.",
    });
  }
  if (down_payment > price) {
    warnings.push({
      field: "down_payment",
      message: "Down payment exceeds property price.",
      severity: "danger",
    });
  }

  // Appreciation check
  if (appreciation > 15) {
    warnings.push({
      field: "expected_annual_appreciation",
      message: `${appreciation}% annual appreciation is very optimistic. Indian average is 5–8%.`,
      severity: "warning",
      suggestion: "Use 6–8% for conservative estimates.",
    });
  }
  if (appreciation > 20) {
    warnings.push({
      field: "expected_annual_appreciation",
      message: `${appreciation}% appreciation is unrealistic for most Indian markets.`,
      severity: "danger",
      suggestion: "Reduce to below 12% for realistic projections.",
    });
  }

  // Vacancy check
  if (vacancy_rate > 40) {
    warnings.push({
      field: "vacancy_rate",
      message: `${vacancy_rate}% vacancy is extremely high — typical is 5–15%.`,
      severity: "warning",
      suggestion: "Use 5–10% for standard residential properties.",
    });
  }

  // Rent vs price check — improved yield guardrail (Task 2)
  const annualYield = (rent * 12 / price) * 100;
  if (annualYield > 8) {
    warnings.push({
      field: "expected_monthly_rent",
      message: `Rental yield of ${annualYield.toFixed(1)}% is outside normal residential range (2–6%). Verify estimate.`,
      severity: "warning",
      suggestion: "Typical gross yields for Indian residential are 2–5%. Premium locations up to 6%.",
    });
  } else if (annualYield < 1 && rent > 0) {
    warnings.push({
      field: "expected_monthly_rent",
      message: `Rental yield of ${annualYield.toFixed(1)}% is very low. Verify monthly rent figure.`,
      severity: "warning",
      suggestion: "Expected yield below 1% may indicate rent is entered in incorrect units.",
    });
  }
  if (rent <= 0) {
    warnings.push({
      field: "expected_monthly_rent",
      message: "Monthly rent must be greater than zero.",
      severity: "danger",
    });
  }

  // Interest rate check
  if (rate > 15) {
    warnings.push({
      field: "loan_interest_rate",
      message: `${rate}% interest rate is very high. Current home loan rates are 8.5–10%.`,
      severity: "warning",
    });
  }
  if (rate < 5) {
    warnings.push({
      field: "loan_interest_rate",
      message: `${rate}% interest rate seems too low for Indian home loans.`,
      severity: "info",
    });
  }

  // Maintenance check
  const maintenancePercent = (maintenance / price) * 100;
  if (maintenancePercent > 3) {
    warnings.push({
      field: "annual_maintenance_cost",
      message: `Annual maintenance of ${maintenancePercent.toFixed(1)}% of property value is high.`,
      severity: "info",
      suggestion: "Typical maintenance is 1–2% of property value annually.",
    });
  }

  // Holding period check
  if (holdingYears < 3) {
    warnings.push({
      field: "holding_period_years",
      message: "Short holding period may result in capital gains tax and lower returns.",
      severity: "info",
      suggestion: "Consider holding for at least 5 years for better returns.",
    });
  }

  // Tax slab check
  if (taxSlab > 30) {
    warnings.push({
      field: "investor_tax_slab",
      message: "Tax slab above 30% — ensure surcharge is included in calculations.",
      severity: "info",
    });
  }

  return {
    warnings,
    hasWarnings: warnings.length > 0,
    hasDangerWarnings: warnings.some(w => w.severity === "danger"),
  };
}
