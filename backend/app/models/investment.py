"""
Pydantic models for investment analysis request and response.
"""

from typing import Literal

from pydantic import BaseModel, Field


class InvestmentInput(BaseModel):
    """Input parameters for property investment analysis."""

    property_purchase_price: float = Field(..., gt=0, description="Property purchase price in INR")
    down_payment: float = Field(..., ge=0, description="Down payment amount in INR")
    loan_interest_rate: float = Field(..., ge=0, le=30, description="Annual loan interest rate in %")
    loan_tenure_years: int = Field(..., ge=1, le=30, description="Loan tenure in years")
    expected_monthly_rent: float = Field(..., ge=0, description="Expected monthly rent in INR")
    annual_maintenance_cost: float = Field(..., ge=0, description="Annual maintenance cost in INR")
    expected_annual_appreciation: float = Field(..., ge=-10, le=30, description="Expected annual appreciation in %")
    holding_period_years: int = Field(..., ge=1, le=30, description="Investment holding period in years")
    investor_tax_slab: float = Field(..., ge=0, le=42.74, description="Investor income tax slab in %")

    model_config = {"json_schema_extra": {"example": {
        "property_purchase_price": 10000000,
        "down_payment": 2000000,
        "loan_interest_rate": 8.5,
        "loan_tenure_years": 20,
        "expected_monthly_rent": 35000,
        "annual_maintenance_cost": 36000,
        "expected_annual_appreciation": 6,
        "holding_period_years": 10,
        "investor_tax_slab": 30,
    }}}


class InvestmentMetrics(BaseModel):
    """Calculated investment metrics."""

    emi: float = Field(..., description="Monthly EMI in INR")
    annual_rental_yield: float = Field(..., description="Annual rental yield in %")
    annual_cash_flow: float = Field(..., description="Annual net cash flow in INR")
    monthly_cash_flow: float = Field(..., description="Monthly net cash flow in INR")
    total_interest_paid: float = Field(..., description="Total interest paid over holding period in INR")
    total_equity_built: float = Field(..., description="Total equity built over holding period in INR")
    future_property_value: float = Field(..., description="Projected property value at end of holding period in INR")
    capital_gains: float = Field(..., description="Capital gains in INR")
    capital_gains_tax: float = Field(..., description="Tax on capital gains in INR")
    irr: float = Field(..., description="Internal Rate of Return in %")
    roi: float = Field(..., description="Return on Investment in %")
    total_invested: float = Field(..., description="Total amount invested (down payment + EMI paid - rent received)")


class RiskBreakdown(BaseModel):
    """Weighted risk component scores (each 0-100)."""

    cash_flow_score: float = 0
    irr_score: float = 0
    ltv_score: float = 0
    appreciation_score: float = 0
    yield_score: float = 0


class RiskAssessment(BaseModel):
    """Risk assessment result."""

    score: int = Field(..., ge=1, le=10, description="Legacy 1-10 score for backward compat")
    label: Literal["Low Risk", "Moderate Risk", "High Risk"] = Field(
        ..., description="Risk classification"
    )
    explanation: str = Field(..., description="Explanation of risk factors")
    total_score: int | None = Field(None, ge=0, le=100, description="Weighted score 0-100")
    breakdown: RiskBreakdown | None = Field(None, description="Component breakdown")


class AIAnalysis(BaseModel):
    """AI-generated investment analysis."""

    verdict: str = Field(..., description="Investment verdict - good/bad/moderate")
    pros: list[str] = Field(default_factory=list, description="List of pros")
    cons: list[str] = Field(default_factory=list, description="List of cons")
    fd_comparison: str = Field(..., description="Comparison with 7% FD")
    recommendation: str = Field(..., description="Clear recommendation")
    summary: str = Field(..., description="Executive summary")


class MonteCarloResult(BaseModel):
    """Monte Carlo simulation output."""

    expected_irr: float = 0
    worst_case_irr: float = 0
    best_case_irr: float = 0
    var_5_percent: float = Field(0, description="5% VaR (downside IRR)")
    probability_beating_fd: float = 0
    probability_negative_cashflow: float = 0
    irr_distribution: list[float] = Field(default_factory=list)
    irr_histogram: list[dict[str, float | int]] = Field(default_factory=list)
    scenario_count: int = 0


class StressTestResult(BaseModel):
    """Stress test output."""

    base_irr: float = 0
    interest_shock_irr: float = 0
    appreciation_zero_irr: float = 0
    rent_drop_irr: float = 0
    worst_case_irr: float = 0


class PortfolioMonteCarloResult(BaseModel):
    """Portfolio Monte Carlo output."""

    portfolio_expected_irr: float = 0
    portfolio_worst_case: float = 0
    portfolio_best_case: float = 0
    probability_portfolio_beats_fd: float = 0
    portfolio_var_5_percent: float = 0


class SensitivityResult(BaseModel):
    """Sensitivity analysis output."""

    interest_rate_impact: dict[str, float] = Field(default_factory=dict)
    appreciation_impact: dict[str, float] = Field(default_factory=dict)
    rent_impact: dict[str, float] = Field(default_factory=dict)
    base_irr: float = 0


class TaxAnalysis(BaseModel):
    """Detailed India tax analysis."""

    tax_savings_from_interest: float = 0
    rental_tax_liability: float = 0
    capital_gains_tax: float = 0
    post_tax_irr: float = 0
    indexed_capital_gains: float = 0
    indexation_factor: float = 0


class DealAnalysis(BaseModel):
    """Deal quality evaluation (V3)."""

    deal_score: float = Field(..., ge=0, le=100)
    label: str = Field(..., description="Excellent / Good / Average / Weak")
    rating: str = Field("", description="Investment grade A+ to D")
    is_overpriced: bool = False
    fair_price_range: dict[str, float] = Field(default_factory=dict)
    negotiation_suggestion: str = ""
    red_flags: list[str] = Field(default_factory=list)
    score_breakdown: dict[str, float] = Field(default_factory=dict)


class AnalyzeInvestmentResponse(BaseModel):
    """Complete response for investment analysis API."""

    metrics: InvestmentMetrics = Field(..., description="Calculated financial metrics")
    risk: RiskAssessment = Field(..., description="Risk assessment")
    ai_analysis: AIAnalysis = Field(..., description="AI-generated analysis")
    monte_carlo: MonteCarloResult | None = Field(None, description="Monte Carlo results")
    sensitivity: SensitivityResult | None = Field(None, description="Sensitivity analysis")
    tax_analysis: TaxAnalysis | None = Field(None, description="India tax details")
    deal_analysis: DealAnalysis | None = Field(None, description="Deal quality (V3)")
    stress_test: StressTestResult | None = Field(None, description="Stress test results")


# --- Portfolio models ---

class PortfolioInput(BaseModel):
    """Multi-property portfolio input."""

    investments: list[InvestmentInput] = Field(..., min_length=1)


class PortfolioMetrics(BaseModel):
    """Aggregated portfolio metrics."""

    total_invested_capital: float = 0
    total_property_value: float = 0
    total_loan_amount: float = 0
    weighted_irr: float = 0
    weighted_roi: float = 0
    portfolio_cash_flow: float = 0
    portfolio_post_tax_irr: float = 0
    rating: str = Field("", description="Portfolio investment grade A+ to D")


class AnalyzePortfolioResponse(BaseModel):
    """Portfolio analysis response."""

    portfolio_metrics: PortfolioMetrics = Field(...)
    diversification_score: float = Field(..., ge=0, le=100)
    portfolio_risk_score: float = Field(..., ge=0, le=100)
    portfolio_monte_carlo: PortfolioMonteCarloResult | None = Field(None)
    individual_results: list[AnalyzeInvestmentResponse] = Field(default_factory=list)
