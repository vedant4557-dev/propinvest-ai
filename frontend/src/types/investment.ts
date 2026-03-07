// PropInvest AI — TypeScript Types V3

export interface InvestmentInput {
  property_purchase_price: number;
  down_payment: number;
  loan_interest_rate: number;
  loan_tenure_years: number;
  expected_monthly_rent: number;
  annual_maintenance_cost: number;
  expected_annual_appreciation: number;
  holding_period_years: number;
  investor_tax_slab: number;
  // V3
  vacancy_rate: number;
  stamp_duty_percent: number;
  registration_cost_percent: number;
  property_name?: string;
  city?: string;
  // V3.1 — optional, used for comparable valuation
  property_area_sqft?: number;
  // V3.1 — optional rent growth rate for projection
  rent_growth_rate?: number;
}

export interface InvestmentMetrics {
  emi: number;
  loan_amount: number;
  total_acquisition_cost: number;
  effective_down_payment: number;
  annual_rental_income: number;
  effective_annual_rent: number;
  annual_cash_flow: number;
  monthly_cash_flow: number;
  total_interest_paid: number;
  gross_rental_yield: number;
  net_rental_yield: number;
  cash_on_cash_return: number;
  cap_rate: number;
  total_equity_built: number;
  future_property_value: number;
  capital_gains: number;
  capital_gains_tax: number;
  irr: number;
  npv: number;
  roi: number;
  total_invested: number;
  dscr: number;
  break_even_occupancy: number;
  ltv_ratio: number;
}

export type RiskLabel = "Low Risk" | "Moderate Risk" | "High Risk";

export interface RiskBreakdown {
  cash_flow_score: number;
  irr_score: number;
  ltv_score: number;
  appreciation_score: number;
  yield_score: number;
  dscr_score: number;
  vacancy_score: number;
}

export interface RiskAssessment {
  score: number;
  total_score: number;
  label: RiskLabel;
  explanation: string;
  breakdown: RiskBreakdown;
}

export interface AIAnalysis {
  verdict: string;
  summary: string;
  pros: string[];
  cons: string[];
  key_risks: string[];
  fd_comparison: string;
  recommendation: string;
  exit_strategy: string;
  rent_optimization: string;
  negotiation_tip: string;
}

export interface IRRHistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
}

export interface MonteCarloResult {
  expected_irr: number;
  worst_case_irr: number;
  best_case_irr: number;
  var_5_percent: number;
  probability_beating_fd: number;
  probability_negative_cashflow: number;
  irr_distribution: number[];
  irr_histogram: IRRHistogramBin[];
  scenario_count: number;
  median_irr: number;
  std_irr: number;
}

export interface SensitivityImpact {
  minus: number;
  base: number;
  plus: number;
  minus_label: string;
  plus_label: string;
}

export interface SensitivityResult {
  interest_rate_impact: SensitivityImpact;
  appreciation_impact: SensitivityImpact;
  rent_impact: SensitivityImpact;
  vacancy_impact: SensitivityImpact;
  base_irr: number;
}

export interface StressTestResult {
  base_irr: number;
  interest_shock_irr: number;
  appreciation_zero_irr: number;
  rent_drop_irr: number;
  high_vacancy_irr: number;
  worst_case_irr: number;
}

export interface TaxAnalysis {
  stamp_duty_paid: number;
  registration_cost_paid: number;
  total_acquisition_tax: number;
  tax_savings_from_interest: number;
  rental_income_taxable: number;
  rental_tax_liability: number;
  capital_gains: number;
  indexed_cost: number;
  indexed_capital_gains: number;
  capital_gains_tax: number;
  indexation_factor: number;
  post_tax_irr: number;
  net_tax_benefit: number;
}

export interface DealAnalysis {
  deal_score: number;
  label: string;
  rating: string;
  is_overpriced: boolean;
  fair_price_range: { low: number; high: number };
  negotiation_suggestion: string;
  red_flags: string[];
  green_flags: string[];
  score_breakdown: Record<string, number>;
}

export interface CashFlowYear {
  year: number;
  rental_income: number;
  emi_paid: number;
  maintenance: number;
  net_cash_flow: number;
  cumulative_cash_flow: number;
  property_value: number;
  equity: number;
}

export interface AnalyzeInvestmentResponse {
  metrics: InvestmentMetrics;
  risk: RiskAssessment;
  ai_analysis: AIAnalysis;
  monte_carlo?: MonteCarloResult | null;
  sensitivity?: SensitivityResult | null;
  tax_analysis?: TaxAnalysis | null;
  deal_analysis?: DealAnalysis | null;
  stress_test?: StressTestResult | null;
  cash_flow_timeline: CashFlowYear[];
  input_warnings?: { field: string; message: string; severity: string; suggestion?: string }[];
}

export interface PortfolioMetrics {
  total_invested_capital: number;
  total_property_value: number;
  total_loan_amount: number;
  total_equity: number;
  weighted_irr: number;
  weighted_roi: number;
  weighted_yield: number;
  portfolio_cash_flow: number;
  portfolio_post_tax_irr: number;
  portfolio_npv: number;
  average_dscr: number;
  rating: string;
}

export interface PortfolioMonteCarloResult {
  portfolio_expected_irr: number;
  portfolio_worst_case: number;
  portfolio_best_case: number;
  probability_portfolio_beats_fd: number;
  portfolio_var_5_percent: number;
}

export interface AnalyzePortfolioResponse {
  portfolio_metrics: PortfolioMetrics;
  diversification_score: number;
  portfolio_risk_score: number;
  portfolio_monte_carlo?: PortfolioMonteCarloResult | null;
  individual_results: AnalyzeInvestmentResponse[];
  best_property_index: number;
  worst_property_index: number;
  recommendations: string[];
}

export interface AnalyzePortfolioRequest {
  investments: InvestmentInput[];
}

// Saved deal (local storage)
export interface SavedDeal {
  id: string;
  name: string;
  savedAt: string;
  input: InvestmentInput;
  result: AnalyzeInvestmentResponse;
}
