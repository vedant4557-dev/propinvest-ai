"""
Investment analysis API routes.
"""

from fastapi import APIRouter, HTTPException

from app.models.investment import (
    InvestmentInput,
    PortfolioInput,
    AnalyzeInvestmentResponse,
    AnalyzePortfolioResponse,
    PortfolioMetrics,
)
from app.services.analysis_service import analyze_single_investment
from app.services.portfolio_engine import run_portfolio_analysis

router = APIRouter(tags=["analysis"])


def _validate_investment(input_data: InvestmentInput) -> None:
    """Validate single investment. Raises HTTPException on invalid."""
    if input_data.down_payment >= input_data.property_purchase_price:
        raise HTTPException(
            status_code=400,
            detail="Down payment must be less than property purchase price",
        )
    loan_amount = input_data.property_purchase_price - input_data.down_payment
    if loan_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Loan amount must be positive. Reduce down payment.",
        )


@router.post("/analyze-investment", response_model=AnalyzeInvestmentResponse)
def analyze_investment(input_data: InvestmentInput) -> AnalyzeInvestmentResponse:
    """
    Analyze single property investment.
    Returns metrics, risk, AI, Monte Carlo, sensitivity, tax, deal_analysis.
    Backward compatible.
    """
    _validate_investment(input_data)
    return analyze_single_investment(input_data)


@router.post("/analyze-portfolio", response_model=AnalyzePortfolioResponse)
def analyze_portfolio(portfolio_input: PortfolioInput) -> AnalyzePortfolioResponse:
    """
    Analyze multi-property portfolio.
    Returns aggregated metrics, diversification score, portfolio risk,
    and individual analysis for each property.
    """
    for i, inv in enumerate(portfolio_input.investments):
        try:
            _validate_investment(inv)
        except HTTPException as e:
            raise HTTPException(
                status_code=400,
                detail=f"Investment {i + 1}: {e.detail}",
            )

    result = run_portfolio_analysis(portfolio_input.investments)

    return AnalyzePortfolioResponse(
        portfolio_metrics=PortfolioMetrics(**result["portfolio_metrics"]),
        diversification_score=result["diversification_score"],
        portfolio_risk_score=result["portfolio_risk_score"],
        portfolio_monte_carlo=result.get("portfolio_monte_carlo"),
        individual_results=result["individual_results"],
    )
