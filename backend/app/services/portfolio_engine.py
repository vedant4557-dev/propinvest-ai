"""
Portfolio Engine — PropInvest AI V3
Multi-property analysis with diversification scoring and correlated Monte Carlo.
"""
import math
import random
from app.models.schemas import (
    InvestmentInput, AnalyzeInvestmentResponse,
    PortfolioMetrics, AnalyzePortfolioResponse, PortfolioMonteCarloResult
)
from app.utils.irr import calculate_irr


def _portfolio_monte_carlo(
    results: list[AnalyzeInvestmentResponse],
    inputs: list[InvestmentInput],
) -> PortfolioMonteCarloResult:
    """Correlated (ρ=0.6) Monte Carlo across portfolio."""
    random.seed(99)
    N = 500
    CORR = 0.6

    portfolio_irrs = []

    for _ in range(N):
        # Common market factor (correlation)
        u1, u2 = max(1e-10, random.random()), random.random()
        market_z = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)

        total_invested = sum(
            r.metrics.effective_down_payment for r in results
        )
        if total_invested == 0:
            continue

        portfolio_final_value = 0.0
        portfolio_cf = [0.0] * (max(inp.holding_period_years for inp in inputs) + 1)
        portfolio_cf[0] = -total_invested

        for i, (inp, res) in enumerate(zip(inputs, results)):
            u3, u4 = max(1e-10, random.random()), random.random()
            idio_z = math.sqrt(-2 * math.log(u3)) * math.cos(2 * math.pi * u4)
            prop_z = CORR * market_z + math.sqrt(1 - CORR ** 2) * idio_z

            apprec_std = max(2.0, inp.expected_annual_appreciation * 0.35)
            apprec = inp.expected_annual_appreciation + apprec_std * prop_z
            rent = inp.expected_monthly_rent * (1 + 0.12 * idio_z)

            loan = inp.property_purchase_price - inp.down_payment
            if inp.loan_interest_rate > 0:
                r = inp.loan_interest_rate / 100 / 12
                n = inp.loan_tenure_years * 12
                emi = loan * r * (1 + r) ** n / ((1 + r) ** n - 1)
            else:
                emi = loan / (inp.loan_tenure_years * 12)

            eff_rent = rent * 12 * (1 - inp.vacancy_rate / 100)
            annual_cf = eff_rent - emi * 12 - inp.annual_maintenance_cost
            fv = inp.property_purchase_price * (1 + apprec / 100) ** inp.holding_period_years

            for yr in range(1, inp.holding_period_years + 1):
                if yr <= len(portfolio_cf) - 1:
                    portfolio_cf[yr] += annual_cf

            portfolio_final_value += fv

        # Add terminal value in last year
        if len(portfolio_cf) > 1:
            portfolio_cf[-1] += portfolio_final_value * 0.8  # rough net of tax/costs

        irr = calculate_irr(portfolio_cf)
        if irr is not None and -50 < irr < 200:
            portfolio_irrs.append(irr)

    if not portfolio_irrs:
        base_irrs = [r.metrics.irr for r in results]
        portfolio_irrs = base_irrs

    portfolio_irrs.sort()
    n = len(portfolio_irrs)
    exp_irr = sum(portfolio_irrs) / n
    var_5 = portfolio_irrs[max(0, int(n * 0.05))]
    best = portfolio_irrs[min(n - 1, int(n * 0.95))]
    worst = portfolio_irrs[max(0, int(n * 0.05))]
    prob_beat = sum(1 for x in portfolio_irrs if x > 7) / n * 100

    return PortfolioMonteCarloResult(
        portfolio_expected_irr=round(exp_irr, 2),
        portfolio_worst_case=round(worst, 2),
        portfolio_best_case=round(best, 2),
        probability_portfolio_beats_fd=round(prob_beat, 1),
        portfolio_var_5_percent=round(var_5, 2),
    )


def _diversification_score(inputs: list[InvestmentInput], results: list[AnalyzeInvestmentResponse]) -> float:
    """0-100 diversification score."""
    n = len(inputs)
    if n == 1: return 10

    score = 0.0
    # City diversity (up to 30 pts)
    cities = {inp.city or f"unknown_{i}" for i, inp in enumerate(inputs)}
    city_pts = min(30, (len(cities) / n) * 40)
    score += city_pts

    # IRR spread (up to 20 pts) — some spread is good
    irrs = [r.metrics.irr for r in results]
    irr_std = math.sqrt(sum((x - sum(irrs) / n) ** 2 for x in irrs) / n) if n > 1 else 0
    score += min(20, irr_std * 4)

    # Count bonus (up to 20 pts)
    score += min(20, (n - 1) * 6)

    # Mix of cash-flow positive and appreciating (up to 30 pts)
    pos_cf = sum(1 for r in results if r.metrics.annual_cash_flow > 0)
    mix_score = 30 if 0 < pos_cf < n else 15
    score += mix_score

    return round(min(100, score), 1)


def build_portfolio(
    inputs: list[InvestmentInput],
    results: list[AnalyzeInvestmentResponse],
) -> AnalyzePortfolioResponse:
    """Aggregate individual results into portfolio metrics."""
    total_invested = sum(r.metrics.effective_down_payment for r in results)
    total_value = sum(r.metrics.future_property_value for r in results)
    total_loan = sum(r.metrics.loan_amount for r in results)
    total_equity = sum(r.metrics.total_equity_built for r in results)
    total_cf = sum(r.metrics.annual_cash_flow for r in results)
    total_npv = sum(r.metrics.npv for r in results)

    # Weighted IRR by invested capital
    w_irr = sum(r.metrics.irr * r.metrics.effective_down_payment for r in results) / total_invested if total_invested else 0
    w_roi = sum(r.metrics.roi * r.metrics.effective_down_payment for r in results) / total_invested if total_invested else 0
    w_yield = sum(r.metrics.net_rental_yield * r.metrics.effective_down_payment for r in results) / total_invested if total_invested else 0
    avg_dscr = sum(r.metrics.dscr for r in results) / len(results)

    post_tax_irrs = [r.tax_analysis.post_tax_irr for r in results if r.tax_analysis]
    w_post_tax = (
        sum(pt * r.metrics.effective_down_payment for pt, r in zip(post_tax_irrs, results)) / total_invested
        if total_invested and post_tax_irrs else w_irr
    )

    # Rating
    if w_irr >= 14 and total_cf >= 0: rating = "A+"
    elif w_irr >= 11:                 rating = "A"
    elif w_irr >= 8:                  rating = "B"
    elif w_irr >= 5:                  rating = "C"
    else:                             rating = "D"

    # Portfolio risk (average of individual risk scores, weighted)
    p_risk = sum(r.risk.total_score * r.metrics.effective_down_payment for r in results) / total_invested if total_invested else 50
    # Invert: risk_scorer returns score where higher = better, but portfolio_risk_score should reflect risk level
    portfolio_risk = round(100 - p_risk, 1)

    best_idx = max(range(len(results)), key=lambda i: results[i].metrics.irr)
    worst_idx = min(range(len(results)), key=lambda i: results[i].metrics.irr)

    recommendations = []
    if total_cf < 0:
        recommendations.append("Portfolio has negative overall cash flow — consider adding higher-yielding properties")
    if len(set(inp.city or "" for inp in inputs)) == 1:
        recommendations.append("All properties in same city — consider geographic diversification to reduce concentration risk")
    if w_irr < 7:
        recommendations.append("Portfolio IRR below 7% FD benchmark — review underperforming assets")
    if avg_dscr < 1.0:
        recommendations.append("Average DSCR below 1.0 — rental income insufficient to cover debt service across portfolio")
    if w_irr >= 12:
        recommendations.append(f"Strong portfolio IRR {w_irr:.1f}% — consider increasing exposure through one more property")

    mc = _portfolio_monte_carlo(results, inputs)
    div_score = _diversification_score(inputs, results)

    return AnalyzePortfolioResponse(
        portfolio_metrics=PortfolioMetrics(
            total_invested_capital=round(total_invested, 2),
            total_property_value=round(total_value, 2),
            total_loan_amount=round(total_loan, 2),
            total_equity=round(total_equity, 2),
            weighted_irr=round(w_irr, 2),
            weighted_roi=round(w_roi, 2),
            weighted_yield=round(w_yield, 2),
            portfolio_cash_flow=round(total_cf, 2),
            portfolio_post_tax_irr=round(w_post_tax, 2),
            portfolio_npv=round(total_npv, 2),
            average_dscr=round(avg_dscr, 3),
            rating=rating,
        ),
        diversification_score=div_score,
        portfolio_risk_score=portfolio_risk,
        portfolio_monte_carlo=mc,
        individual_results=results,
        best_property_index=best_idx,
        worst_property_index=worst_idx,
        recommendations=recommendations,
    )
