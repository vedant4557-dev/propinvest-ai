"""
Monte Carlo Simulation Engine for property investment scenarios.

Simulates future appreciation and rental growth. Supports single property
and portfolio with correlated returns.
Uses vectorized numpy operations for performance.
"""

import logging
from typing import Any, List

import numpy as np

from app.models.investment import InvestmentInput
from app.services.financial_engine import calculate_emi, calculate_total_equity_built
from app.utils.irr import calculate_irr

logger = logging.getLogger(__name__)

NUM_SCENARIOS = 1000
FD_RATE = 0.07  # 7% FD benchmark
APPRECIATION_STD = 0.02
RENT_GROWTH_MEAN = 0.05
RENT_GROWTH_STD = 0.015
VAR_PERCENTILE = 5  # 5% VaR
CORRELATION = 0.6


def _run_single_scenario_irr(
    down_payment: float,
    purchase_price: float,
    loan_amount: float,
    emi: float,
    annual_rate: float,
    tenure_months: int,
    maintenance: float,
    final_value: float,
    rent_path: np.ndarray,
    holding_years: int,
    cap_gains_tax_rate: float = 0.20,
) -> tuple[float, bool]:
    """Run one scenario, return (IRR %, has_negative_cashflow)."""
    holding_months = holding_years * 12
    months_paid = min(holding_months, tenure_months)

    annual_emi = emi * 12
    annual_net_cf = rent_path - annual_emi - maintenance
    has_negative = bool(np.any(annual_net_cf < 0))

    total_equity = calculate_total_equity_built(
        loan_amount, emi, annual_rate, months_paid
    )
    remaining_loan = max(0, loan_amount - total_equity)

    capital_gains = max(0, final_value - purchase_price)
    cap_gains_tax = capital_gains * cap_gains_tax_rate
    sale_proceeds = final_value - cap_gains_tax - remaining_loan

    cash_flows: List[float] = [-down_payment]
    for y in range(holding_years - 1):
        cash_flows.append(float(annual_net_cf[y]))
    cash_flows.append(float(annual_net_cf[holding_years - 1]) + sale_proceeds)

    irr_decimal = calculate_irr(cash_flows)
    irr_pct = irr_decimal * 100

    return irr_pct, has_negative


def run_monte_carlo(input_data: InvestmentInput) -> dict[str, Any]:
    """
    Run Monte Carlo for single property.

    Returns expected_irr, worst_case_irr, best_case_irr, var_5_percent,
    probability_beating_fd, probability_negative_cashflow.
    """
    try:
        return _run_monte_carlo_impl(input_data)
    except Exception as e:
        logger.warning("Monte Carlo simulation failed: %s. Returning fallback.", e)
        return _monte_carlo_fallback(input_data)


def _monte_carlo_fallback(input_data: InvestmentInput) -> dict[str, Any]:
    """Graceful fallback when Monte Carlo fails."""
    from app.services.financial_engine import run_financial_engine

    metrics = run_financial_engine(input_data)
    base_irr = metrics.irr
    cf = metrics.annual_cash_flow
    prob_neg = 100.0 if cf < 0 else 0.0
    prob_fd = 100.0 if base_irr > FD_RATE * 100 else 0.0

    return {
        "expected_irr": round(base_irr, 2),
        "worst_case_irr": round(base_irr * 0.7, 2),
        "best_case_irr": round(base_irr * 1.3, 2),
        "var_5_percent": round(base_irr * 0.6, 2),
        "probability_beating_fd": round(prob_fd, 2),
        "probability_negative_cashflow": round(prob_neg, 2),
        "irr_distribution": [],
        "irr_histogram": [],
        "scenario_count": 0,
    }


def _run_monte_carlo_impl(input_data: InvestmentInput) -> dict[str, Any]:
    """Internal Monte Carlo implementation."""
    import time

    t0 = time.perf_counter()
    np.random.seed(42)

    purchase_price = max(1, input_data.property_purchase_price)
    down_payment = max(0, input_data.down_payment)
    loan_amount = max(0, purchase_price - down_payment)
    annual_rate = max(0, input_data.loan_interest_rate)
    tenure_years = max(1, input_data.loan_tenure_years)
    tenure_months = tenure_years * 12
    monthly_rent = max(0, input_data.expected_monthly_rent)
    maintenance = max(0, input_data.annual_maintenance_cost)
    appreciation_mean = input_data.expected_annual_appreciation / 100
    holding_years = max(1, input_data.holding_period_years)

    emi = calculate_emi(loan_amount, annual_rate, tenure_months)
    appreciation_rates = np.random.normal(
        appreciation_mean, APPRECIATION_STD, (NUM_SCENARIOS, holding_years)
    )
    appreciation_rates = np.clip(appreciation_rates, -0.20, 0.30)

    growth_factors = 1 + appreciation_rates
    cumprod = np.cumprod(growth_factors, axis=1)
    final_property_values = purchase_price * cumprod[:, -1]

    rent_growth_rates = np.random.normal(
        RENT_GROWTH_MEAN, RENT_GROWTH_STD, (NUM_SCENARIOS, holding_years)
    )
    rent_growth_rates = np.clip(rent_growth_rates, -0.10, 0.25)

    rent_cumprod = np.cumprod(1 + rent_growth_rates, axis=1)
    base_annual_rent = monthly_rent * 12
    if holding_years == 1:
        rent_years = np.full((NUM_SCENARIOS, 1), base_annual_rent)
    else:
        first_col = np.full(NUM_SCENARIOS, base_annual_rent)
        rest = base_annual_rent * rent_cumprod[:, :-1]
        rent_years = np.column_stack([first_col, rest])

    irr_results = np.zeros(NUM_SCENARIOS)
    neg_cf_count = 0

    for i in range(NUM_SCENARIOS):
        final_val = float(final_property_values[i])
        rpath = rent_years[i, :]
        irr_pct, has_neg = _run_single_scenario_irr(
            down_payment=down_payment,
            purchase_price=purchase_price,
            loan_amount=loan_amount,
            emi=emi,
            annual_rate=annual_rate,
            tenure_months=tenure_months,
            maintenance=maintenance,
            final_value=final_val,
            rent_path=rpath,
            holding_years=holding_years,
        )
        irr_results[i] = irr_pct
        if has_neg:
            neg_cf_count += 1

    irr_results = np.clip(irr_results, -50, 100)
    prob_beating_fd = float(np.mean(irr_results > (FD_RATE * 100)))
    prob_negative_cf = neg_cf_count / NUM_SCENARIOS

    hist_bins = np.linspace(irr_results.min(), irr_results.max(), 11)
    hist_counts, _ = np.histogram(irr_results, bins=hist_bins)
    irr_histogram = [
        {
            "bin_start": float(hist_bins[i]),
            "bin_end": float(hist_bins[i + 1]),
            "count": int(hist_counts[i]),
        }
        for i in range(len(hist_counts))
    ]

    var_5 = float(np.percentile(irr_results, VAR_PERCENTILE))

    elapsed = (time.perf_counter() - t0) * 1000
    logger.info("Monte Carlo single: %d scenarios in %.0fms", NUM_SCENARIOS, elapsed)

    return {
        "expected_irr": round(float(np.mean(irr_results)), 2),
        "worst_case_irr": round(var_5, 2),
        "best_case_irr": round(float(np.percentile(irr_results, 95)), 2),
        "var_5_percent": round(var_5, 2),
        "probability_beating_fd": round(prob_beating_fd * 100, 2),
        "probability_negative_cashflow": round(prob_negative_cf * 100, 2),
        "irr_distribution": [float(x) for x in irr_results],
        "irr_histogram": irr_histogram,
        "scenario_count": NUM_SCENARIOS,
    }


def simulate_portfolio(investments: List[InvestmentInput]) -> dict[str, Any]:
    """
    Monte Carlo for portfolio with correlated appreciation (0.6).

    Uses covariance matrix for multivariate normal draws.
    """
    try:
        return _simulate_portfolio_impl(investments)
    except Exception as e:
        logger.warning("Portfolio Monte Carlo failed: %s. Returning fallback.", e)
        return _portfolio_monte_carlo_fallback(investments)


def _portfolio_monte_carlo_fallback(
    investments: List[InvestmentInput],
) -> dict[str, Any]:
    """Fallback when portfolio Monte Carlo fails."""
    from app.services.portfolio_engine import run_portfolio_analysis

    r = run_portfolio_analysis(investments)
    pm = r["portfolio_metrics"]
    irr = pm["weighted_irr"]
    return {
        "portfolio_expected_irr": round(irr, 2),
        "portfolio_worst_case": round(irr * 0.7, 2),
        "portfolio_best_case": round(irr * 1.3, 2),
        "probability_portfolio_beats_fd": round(100 if irr > FD_RATE * 100 else 0, 2),
        "portfolio_var_5_percent": round(irr * 0.6, 2),
    }


def _simulate_portfolio_impl(investments: List[InvestmentInput]) -> dict[str, Any]:
    """Portfolio Monte Carlo with correlated appreciation."""
    import time

    t0 = time.perf_counter()
    np.random.seed(42)

    n_props = len(investments)
    if n_props == 0:
        return {
            "portfolio_expected_irr": 0.0,
            "portfolio_worst_case": 0.0,
            "portfolio_best_case": 0.0,
            "probability_portfolio_beats_fd": 0.0,
            "portfolio_var_5_percent": 0.0,
        }

    # Determine holding period (use max across properties)
    holding_years = max(
        max(1, inv.holding_period_years) for inv in investments
    )

    # Covariance matrix: diagonal = std^2, off-diagonal = rho * std * std
    std = APPRECIATION_STD
    cov = np.eye(n_props) * (std**2) + (1 - np.eye(n_props)) * (
        CORRELATION * std * std
    )

    # Generate correlated appreciation per year
    # Shape: (NUM_SCENARIOS, holding_years, n_props)
    means = np.array([inv.expected_annual_appreciation / 100 for inv in investments])
    correlated_returns = np.zeros((NUM_SCENARIOS, holding_years, n_props))

    for s in range(NUM_SCENARIOS):
        for y in range(holding_years):
            r = np.random.multivariate_normal(means, cov)
            correlated_returns[s, y, :] = np.clip(r, -0.20, 0.30)

    total_down = sum(max(0, inv.down_payment) for inv in investments)

    portfolio_irrs = np.zeros(NUM_SCENARIOS)

    for s in range(NUM_SCENARIOS):
        combined_cf = [0.0] * (holding_years + 1)
        combined_cf[0] = -total_down

        for p, inv in enumerate(investments):
            purchase = max(1, inv.property_purchase_price)
            down = max(0, inv.down_payment)
            loan = max(0, purchase - down)
            rate = max(0, inv.loan_interest_rate)
            tenure_m = max(12, inv.loan_tenure_years * 12)
            maint = max(0, inv.annual_maintenance_cost)
            monthly_rent = max(0, inv.expected_monthly_rent)
            hp = max(1, inv.holding_period_years)

            emi = calculate_emi(loan, rate, tenure_m)
            appr_path = correlated_returns[s, :hp, p]
            growth = np.cumprod(1 + appr_path)
            final_val = purchase * growth[-1]

            rent_rates = np.random.normal(
                RENT_GROWTH_MEAN, RENT_GROWTH_STD, hp
            )
            rent_rates = np.clip(rent_rates, -0.10, 0.25)
            rent_factors = np.cumprod(1 + rent_rates)
            base_rent = monthly_rent * 12
            if hp == 1:
                rent_years = np.array([base_rent])
            else:
                rent_years = base_rent * np.concatenate([[1], rent_factors[:-1]])

            months_paid = min(hp * 12, tenure_m)
            equity = calculate_total_equity_built(loan, emi, rate, months_paid)
            remaining = max(0, loan - equity)
            cap_gain = max(0, final_val - purchase)
            cap_tax = cap_gain * 0.20
            sale = final_val - cap_tax - remaining

            annual_emi = emi * 12
            for y in range(hp - 1):
                combined_cf[y + 1] += float(rent_years[y] - annual_emi - maint)
            combined_cf[hp] += float(rent_years[hp - 1] - annual_emi - maint + sale)

        irr_dec = calculate_irr(combined_cf)
        portfolio_irrs[s] = irr_dec * 100

    portfolio_irrs = np.clip(portfolio_irrs, -50, 100)
    var_5 = float(np.percentile(portfolio_irrs, VAR_PERCENTILE))

    elapsed = (time.perf_counter() - t0) * 1000
    logger.info(
        "Portfolio Monte Carlo: %d props, %d scenarios in %.0fms",
        n_props,
        NUM_SCENARIOS,
        elapsed,
    )

    return {
        "portfolio_expected_irr": round(float(np.mean(portfolio_irrs)), 2),
        "portfolio_worst_case": round(var_5, 2),
        "portfolio_best_case": round(float(np.percentile(portfolio_irrs, 95)), 2),
        "probability_portfolio_beats_fd": round(
            float(np.mean(portfolio_irrs > FD_RATE * 100)) * 100, 2
        ),
        "portfolio_var_5_percent": round(var_5, 2),
    }
