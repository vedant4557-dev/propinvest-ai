"""
Stress Test - Extreme scenario analysis.

Tests IRR under adverse conditions.
"""

from typing import Any

from app.models.investment import InvestmentInput
from app.services.financial_engine import run_financial_engine


def run_stress_test(input_data: InvestmentInput) -> dict[str, Any]:
    """
    Run stress scenarios:
    - Interest rate +2%
    - Appreciation = 0%
    - Rent drop -15%
    - Combined worst-case
    """
    base_irr = _get_irr(input_data)

    def with_overrides(**kwargs: Any) -> InvestmentInput:
        d = input_data.model_dump()
        d.update(kwargs)
        return InvestmentInput(**d)

    interest_shock_irr = _get_irr(
        with_overrides(loan_interest_rate=input_data.loan_interest_rate + 2)
    )
    appreciation_zero_irr = _get_irr(
        with_overrides(expected_annual_appreciation=0)
    )
    rent_drop_irr = _get_irr(
        with_overrides(expected_monthly_rent=input_data.expected_monthly_rent * 0.85)
    )

    worst_case = with_overrides(
        loan_interest_rate=input_data.loan_interest_rate + 2,
        expected_annual_appreciation=0,
        expected_monthly_rent=input_data.expected_monthly_rent * 0.85,
    )
    worst_case_irr = _get_irr(worst_case)

    return {
        "base_irr": round(base_irr, 2),
        "interest_shock_irr": round(interest_shock_irr, 2),
        "appreciation_zero_irr": round(appreciation_zero_irr, 2),
        "rent_drop_irr": round(rent_drop_irr, 2),
        "worst_case_irr": round(worst_case_irr, 2),
    }


def _get_irr(inv: InvestmentInput) -> float:
    """Safe IRR extraction from financial engine."""
    try:
        m = run_financial_engine(inv)
        return float(m.irr)
    except Exception:
        return 0.0
