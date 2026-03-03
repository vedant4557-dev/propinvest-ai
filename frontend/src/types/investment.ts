/**
 * TypeScript types matching backend Pydantic models.
 */

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
}

export interface InvestmentMetrics {
  emi: number;
  annual_rental_yield: number;
  annual_cash_flow: number;
  monthly_cash_flow: number;
  total_interest_paid: number;
  total_equity_built: number;
  future_property_value: number;
  capital_gains: number;
  capital_gains_tax: number;
  irr: number;
  roi: number;
  total_invested: number;
}

export type RiskLabel = "Low Risk" | "Moderate Risk" | "High Risk";

export interface RiskBreakdown {
  cash_flow_score: number;
  irr_score: number;
  ltv_score: number;
  appreciation_score: number;
  yield_score: number;
}

export interface RiskAssessment {
  score: number;
  label: RiskLabel;
  explanation: string;
  total_score?: number;
  breakdown?: RiskBreakdown;
}

export interface AIAnalysis {
  verdict: string;
  pros: string[];
  cons: string[];
  fd_comparison: string;
  recommendation: string;
  summary: string;
}

export interface MonteCarloResult {
  expected_irr: number;
  worst_case_irr: number;
  best_case_irr: number;
  var_5_percent?: number;
  probability_beating_fd: number;
  probability_negative_cashflow: number;
  irr_distribution: number[];
  irr_histogram: { bin_start: number; bin_end: number; count: number }[];
  scenario_count: number;
}

export interface StressTestResult {
  base_irr: number;
  interest_shock_irr: number;
  appreciation_zero_irr: number;
  rent_drop_irr: number;
  worst_case_irr: number;
}

export interface PortfolioMonteCarloResult {
  portfolio_expected_irr: number;
  portfolio_worst_case: number;
  portfolio_best_case: number;
  probability_portfolio_beats_fd: number;
  portfolio_var_5_percent: number;
}

export interface SensitivityResult {
  interest_rate_impact: Record<string, number>;
  appreciation_impact: Record<string, number>;
  rent_impact: Record<string, number>;
  base_irr: number;
}

export interface TaxAnalysis {
  tax_savings_from_interest: number;
  rental_tax_liability: number;
  capital_gains_tax: number;
  post_tax_irr: number;
  indexed_capital_gains: number;
  indexation_factor: number;
}

export interface DealAnalysis {
  deal_score: number;
  label: string;
  rating?: string;
  is_overpriced: boolean;
  fair_price_range: { low: number; high: number };
  negotiation_suggestion: string;
  red_flags: string[];
  score_breakdown?: Record<string, number>;
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
}

export interface PortfolioMetrics {
  total_invested_capital: number;
  total_property_value: number;
  total_loan_amount: number;
  weighted_irr: number;
  weighted_roi: number;
  portfolio_cash_flow: number;
  portfolio_post_tax_irr: number;
  rating?: string;
}

export interface AnalyzePortfolioResponse {
  portfolio_metrics: PortfolioMetrics;
  diversification_score: number;
  portfolio_risk_score: number;
  portfolio_monte_carlo?: PortfolioMonteCarloResult | null;
  individual_results: AnalyzeInvestmentResponse[];
}
