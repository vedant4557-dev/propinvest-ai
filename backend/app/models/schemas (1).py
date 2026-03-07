"""
Pydantic models for PropInvest AI — V3
"""
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# ─── Input ────────────────────────────────────────────────────────────────────

class InvestmentInput(BaseModel):
    property_purchase_price: float = Field(..., gt=0)
    down_payment: float = Field(..., ge=0)
    loan_interest_rate: float = Field(..., ge=0, le=50)
    loan_tenure_years: int = Field(..., ge=1, le=30)
    expected_monthly_rent: float = Field(..., ge=0)
    annual_maintenance_cost: float = Field(..., ge=0)
    expected_annual_appreciation: float = Field(..., ge=-20, le=50)
    holding_period_years: int = Field(..., ge=1, le=30)
    investor_tax_slab: float = Field(..., ge=0, le=42.74)

    # V3 additions
    vacancy_rate: float = Field(default=5.0, ge=0, le=100)          # % of year vacant
    stamp_duty_percent: float = Field(default=6.0, ge=0, le=15)     # India stamp duty
    registration_cost_percent: float = Field(default=1.0, ge=0, le=5)
    property_name: Optional[str] = Field(default=None)
    city: Optional[str] = Field(default=None)

    @field_validator("down_payment")
    @classmethod
    def down_payment_lte_price(cls, v, info):
        if "property_purchase_price" in info.data and v > info.data["property_purchase_price"]:
            raise ValueError("Down payment cannot exceed property price")
        return v


class PortfolioRequest(BaseModel):
    investments: list[InvestmentInput] = Field(..., min_length=1, max_length=10)


# ─── Output ───────────────────────────────────────────────────────────────────

class InvestmentMetrics(BaseModel):
    # Core
    emi: float
    loan_amount: float
    total_acquisition_cost: float          # price + stamp duty + registration
    effective_down_payment: float          # down + stamp + registration

    # Cash flow
    annual_rental_income: float
    effective_annual_rent: float           # after vacancy
    annual_cash_flow: float
    monthly_cash_flow: float
    total_interest_paid: float

    # Yield & Returns
    gross_rental_yield: float
    net_rental_yield: float                # after vacancy + maintenance
    cash_on_cash_return: float             # annual_cash_flow / equity_invested
    cap_rate: float                        # NOI / property_value

    # Capital
    total_equity_built: float
    future_property_value: float
    capital_gains: float
    capital_gains_tax: float

    # Advanced
    irr: float
    npv: float                             # NPV at 10% discount rate
    roi: float
    total_invested: float
    dscr: float                            # Debt Service Coverage Ratio
    break_even_occupancy: float            # % occupancy needed to cover EMI
    ltv_ratio: float                       # Loan-to-Value


class RiskBreakdown(BaseModel):
    cash_flow_score: float
    irr_score: float
    ltv_score: float
    appreciation_score: float
    yield_score: float
    dscr_score: float
    vacancy_score: float


class RiskAssessment(BaseModel):
    score: int                             # 1–10 (backward compat)
    total_score: float                     # 0–100
    label: str
    explanation: str
    breakdown: RiskBreakdown


class AIAnalysis(BaseModel):
    verdict: str
    summary: str
    pros: list[str]
    cons: list[str]
    key_risks: list[str]
    fd_comparison: str
    recommendation: str
    exit_strategy: str
    rent_optimization: str
    negotiation_tip: str


class IRRHistogramBin(BaseModel):
    bin_start: float
    bin_end: float
    count: int


class MonteCarloResult(BaseModel):
    expected_irr: float
    worst_case_irr: float
    best_case_irr: float
    var_5_percent: float
    probability_beating_fd: float
    probability_negative_cashflow: float
    irr_distribution: list[float]
    irr_histogram: list[IRRHistogramBin]
    scenario_count: int
    median_irr: float
    std_irr: float


class SensitivityImpact(BaseModel):
    minus: float
    base: float
    plus: float
    minus_label: str
    plus_label: str


class SensitivityResult(BaseModel):
    interest_rate_impact: SensitivityImpact
    appreciation_impact: SensitivityImpact
    rent_impact: SensitivityImpact
    vacancy_impact: SensitivityImpact
    base_irr: float


class StressTestResult(BaseModel):
    base_irr: float
    interest_shock_irr: float              # rate +2%
    appreciation_zero_irr: float           # appreciation = 0
    rent_drop_irr: float                   # rent -15%
    high_vacancy_irr: float               # vacancy 20%
    worst_case_irr: float                  # all combined


class TaxAnalysis(BaseModel):
    stamp_duty_paid: float
    registration_cost_paid: float
    total_acquisition_tax: float
    tax_savings_from_interest: float       # Section 24(b) — capped ₹2L
    rental_income_taxable: float           # after 30% standard deduction
    rental_tax_liability: float
    capital_gains: float
    indexed_cost: float
    indexed_capital_gains: float
    capital_gains_tax: float
    indexation_factor: float
    post_tax_irr: float
    net_tax_benefit: float                 # savings - liability


class DealAnalysis(BaseModel):
    deal_score: float                      # 0–100
    label: str                             # Excellent / Good / Average / Below Average / Poor
    rating: str                            # A+ / A / B / C / D
    is_overpriced: bool
    fair_price_range: dict[str, float]     # {low, high}
    negotiation_suggestion: str
    red_flags: list[str]
    green_flags: list[str]
    score_breakdown: dict[str, float]


class CashFlowYear(BaseModel):
    year: int
    rental_income: float
    emi_paid: float
    maintenance: float
    net_cash_flow: float
    cumulative_cash_flow: float
    property_value: float
    equity: float


class AnalyzeInvestmentResponse(BaseModel):
    metrics: InvestmentMetrics
    risk: RiskAssessment
    ai_analysis: AIAnalysis
    monte_carlo: Optional[MonteCarloResult] = None
    sensitivity: Optional[SensitivityResult] = None
    tax_analysis: Optional[TaxAnalysis] = None
    deal_analysis: Optional[DealAnalysis] = None
    stress_test: Optional[StressTestResult] = None
    cash_flow_timeline: list[CashFlowYear] = []
    input_warnings: list[dict] = []  # V3.1: Reality check warnings


# ─── Portfolio ────────────────────────────────────────────────────────────────

class PortfolioMonteCarloResult(BaseModel):
    portfolio_expected_irr: float
    portfolio_worst_case: float
    portfolio_best_case: float
    probability_portfolio_beats_fd: float
    portfolio_var_5_percent: float


class PortfolioMetrics(BaseModel):
    total_invested_capital: float
    total_property_value: float
    total_loan_amount: float
    total_equity: float
    weighted_irr: float
    weighted_roi: float
    weighted_yield: float
    portfolio_cash_flow: float
    portfolio_post_tax_irr: float
    portfolio_npv: float
    average_dscr: float
    rating: str


class AnalyzePortfolioResponse(BaseModel):
    portfolio_metrics: PortfolioMetrics
    diversification_score: float
    portfolio_risk_score: float
    portfolio_monte_carlo: Optional[PortfolioMonteCarloResult] = None
    individual_results: list[AnalyzeInvestmentResponse]
    best_property_index: int
    worst_property_index: int
    recommendations: list[str]
