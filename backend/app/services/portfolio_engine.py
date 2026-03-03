"""
Portfolio Engine - Multi-property portfolio analysis.

Aggregates metrics, computes diversification score, portfolio risk.
Reuses existing analyze_single_investment - no duplication.
"""

from typing import Any

from app.models.investment import (
    InvestmentInput,
    AnalyzeInvestmentResponse,
    PortfolioMonteCarloResult,
)
from app.services.analysis_service import analyze_single_investment
from app.services.monte_carlo import simulate_portfolio
from app.services.rating import get_investment_rating


def _compute_diversification_score(
    investments: list[InvestmentInput],
    individual_results: list[AnalyzeInvestmentResponse],
) -> float:
    """
    Diversification score 0-100.

    - >50% capital in one property → heavy penalty
    - All appreciation identical → penalty
    - Rental yields vary → bonus
    """
    if len(investments) <= 1:
        return 50.0  # Single property: neutral

    total_invested = sum(
        r.metrics.total_invested for r in individual_results
    )
    if total_invested <= 0:
        return 50.0

    score = 50.0  # Base

    # Concentration penalty: >50% in one property
    for i, r in enumerate(individual_results):
        share = r.metrics.total_invested / total_invested
        if share > 0.5:
            penalty = (share - 0.5) * 80  # Up to 40 pts penalty
            score -= penalty
            break

    # Appreciation uniformity penalty
    apprs = [inv.expected_annual_appreciation for inv in investments]
    if len(set(round(a, 1) for a in apprs)) == 1 and len(apprs) > 1:
        score -= 15  # All same assumption

    # Rental yield variance bonus
    yields = [r.metrics.annual_rental_yield for r in individual_results]
    if len(yields) > 1:
        variance = sum((y - sum(yields) / len(yields)) ** 2 for y in yields) / len(yields)
        if variance > 1:  # Good spread
            score += min(15, variance * 5)

    return min(100, max(0, round(score, 1)))


def _compute_portfolio_risk_score(
    individual_results: list[AnalyzeInvestmentResponse],
    diversification_score: float,
    total_invested: float,
) -> float:
    """
    Weighted average of individual risk scores + diversification adjustment.

    Individual risk: use total_score (0-100) or fallback to score*10.
    Diversification: higher div score reduces portfolio risk.
    """
    if not individual_results or total_invested <= 0:
        return 50.0

    weighted_sum = 0.0
    for r in individual_results:
        weight = r.metrics.total_invested / total_invested
        risk = r.risk.total_score if r.risk.total_score is not None else r.risk.score * 10
        weighted_sum += risk * weight

    # Diversification adjustment: higher div = lower risk
    # div 100 → -10, div 0 → +10
    adj = (50 - diversification_score) / 5  # -10 to +10
    return min(100, max(0, round(weighted_sum + adj, 1)))


def run_portfolio_analysis(investments: list[InvestmentInput]) -> dict[str, Any]:
    """
    Analyze multi-property portfolio.

    Reuses analyze_single_investment for each property.
    Aggregates metrics, computes diversification and portfolio risk.
    """
    if not investments:
        return {
            "portfolio_metrics": {
                "total_invested_capital": 0,
                "total_property_value": 0,
                "total_loan_amount": 0,
                "weighted_irr": 0,
                "weighted_roi": 0,
                "portfolio_cash_flow": 0,
                "portfolio_post_tax_irr": 0,
            },
            "diversification_score": 0,
            "portfolio_risk_score": 50,
            "individual_results": [],
        }

    individual_results: list[AnalyzeInvestmentResponse] = []
    for inv in investments:
        result = analyze_single_investment(inv)
        individual_results.append(result)

    total_invested = sum(r.metrics.total_invested for r in individual_results)
    total_property_value = sum(r.metrics.future_property_value for r in individual_results)
    total_loan = sum(
        inv.property_purchase_price - inv.down_payment
        for inv in investments
    )
    portfolio_cash_flow = sum(r.metrics.annual_cash_flow for r in individual_results)

    # Weighted IRR by capital invested
    if total_invested > 0:
        weighted_irr = sum(
            r.metrics.irr * (r.metrics.total_invested / total_invested)
            for r in individual_results
        )
        weighted_roi = sum(
            r.metrics.roi * (r.metrics.total_invested / total_invested)
            for r in individual_results
        )
        portfolio_post_tax_irr = sum(
            (r.tax_analysis.post_tax_irr if r.tax_analysis else r.metrics.irr)
            * (r.metrics.total_invested / total_invested)
            for r in individual_results
        )
    else:
        weighted_irr = weighted_roi = portfolio_post_tax_irr = 0.0

    diversification_score = _compute_diversification_score(
        investments, individual_results
    )
    portfolio_risk_score = _compute_portfolio_risk_score(
        individual_results, diversification_score, total_invested
    )

    portfolio_rating = get_investment_rating(weighted_irr, portfolio_cash_flow)

    portfolio_monte = simulate_portfolio(investments)
    portfolio_monte_carlo = PortfolioMonteCarloResult(**portfolio_monte)

    return {
        "portfolio_metrics": {
            "total_invested_capital": round(total_invested, 2),
            "total_property_value": round(total_property_value, 2),
            "total_loan_amount": round(total_loan, 2),
            "weighted_irr": round(weighted_irr, 2),
            "weighted_roi": round(weighted_roi, 2),
            "portfolio_cash_flow": round(portfolio_cash_flow, 2),
            "portfolio_post_tax_irr": round(portfolio_post_tax_irr, 2),
            "rating": portfolio_rating,
        },
        "diversification_score": round(diversification_score, 1),
        "portfolio_risk_score": round(portfolio_risk_score, 1),
        "portfolio_monte_carlo": portfolio_monte_carlo,
        "individual_results": individual_results,
    }
