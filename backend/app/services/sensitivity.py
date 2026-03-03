"""
Sensitivity Analysis - Tests IRR impact of parameter changes.

Varies interest rate, appreciation, and rent to show IRR sensitivity.
"""

from typing import Any

from app.models.investment import InvestmentInput
from app.services.financial_engine import run_financial_engine


def _compute_irr_for_input(inp: InvestmentInput) -> float:
    """Run financial engine and return IRR."""
    metrics = run_financial_engine(inp)
    return metrics.irr


def run_sensitivity_analysis(input_data: InvestmentInput) -> dict[str, Any]:
    """
    Test IRR impact when varying key parameters.

    - Interest rate: +1% / -1%
    - Appreciation: +2% / -2%
    - Rent: +10% / -10%

    Returns:
        Dict with interest_rate_impact, appreciation_impact, rent_impact
    """
    base_irr = _compute_irr_for_input(input_data)

    def make_input(**overrides: Any) -> InvestmentInput:
        d = input_data.model_dump()
        d.update(overrides)
        return InvestmentInput(**d)

    # Interest rate: -1%, base, +1%
    ir_base = input_data.loan_interest_rate
    interest_rate_impact = {
        "minus_1_pct": round(_compute_irr_for_input(make_input(loan_interest_rate=ir_base - 1)), 2),
        "base": round(base_irr, 2),
        "plus_1_pct": round(_compute_irr_for_input(make_input(loan_interest_rate=ir_base + 1)), 2),
    }

    # Appreciation: -2%, base, +2%
    appr_base = input_data.expected_annual_appreciation
    appreciation_impact = {
        "minus_2_pct": round(_compute_irr_for_input(make_input(expected_annual_appreciation=appr_base - 2)), 2),
        "base": round(base_irr, 2),
        "plus_2_pct": round(_compute_irr_for_input(make_input(expected_annual_appreciation=appr_base + 2)), 2),
    }

    # Rent: -10%, base, +10%
    rent_base = input_data.expected_monthly_rent
    rent_impact = {
        "minus_10_pct": round(_compute_irr_for_input(make_input(expected_monthly_rent=rent_base * 0.9)), 2),
        "base": round(base_irr, 2),
        "plus_10_pct": round(_compute_irr_for_input(make_input(expected_monthly_rent=rent_base * 1.1)), 2),
    }

    return {
        "interest_rate_impact": interest_rate_impact,
        "appreciation_impact": appreciation_impact,
        "rent_impact": rent_impact,
        "base_irr": round(base_irr, 2),
    }
