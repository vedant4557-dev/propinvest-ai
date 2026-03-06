"""
Sensitivity Analysis & Stress Testing — PropInvest AI V3
"""
from app.models.schemas import (
    InvestmentInput, SensitivityResult, SensitivityImpact, StressTestResult
)
from app.services.financial_engine import run_engine


def _get_irr(inp: InvestmentInput) -> float:
    metrics, _ = run_engine(inp)
    return metrics.irr


def run_sensitivity(inp: InvestmentInput, base_irr: float) -> SensitivityResult:
    """IRR sensitivity to: interest rate, appreciation, rent, vacancy."""

    # Interest rate ±1%
    irr_rate_minus = _get_irr(inp.model_copy(update={"loan_interest_rate": max(0, inp.loan_interest_rate - 1)}))
    irr_rate_plus = _get_irr(inp.model_copy(update={"loan_interest_rate": inp.loan_interest_rate + 1}))

    # Appreciation ±2%
    irr_apprec_minus = _get_irr(inp.model_copy(update={"expected_annual_appreciation": inp.expected_annual_appreciation - 2}))
    irr_apprec_plus = _get_irr(inp.model_copy(update={"expected_annual_appreciation": inp.expected_annual_appreciation + 2}))

    # Rent ±10%
    irr_rent_minus = _get_irr(inp.model_copy(update={"expected_monthly_rent": inp.expected_monthly_rent * 0.90}))
    irr_rent_plus = _get_irr(inp.model_copy(update={"expected_monthly_rent": inp.expected_monthly_rent * 1.10}))

    # Vacancy ±5%
    irr_vac_minus = _get_irr(inp.model_copy(update={"vacancy_rate": max(0, inp.vacancy_rate - 5)}))
    irr_vac_plus = _get_irr(inp.model_copy(update={"vacancy_rate": min(50, inp.vacancy_rate + 5)}))

    return SensitivityResult(
        interest_rate_impact=SensitivityImpact(
            minus=round(irr_rate_minus, 2), base=round(base_irr, 2), plus=round(irr_rate_plus, 2),
            minus_label=f"{inp.loan_interest_rate - 1:.1f}%", plus_label=f"{inp.loan_interest_rate + 1:.1f}%"
        ),
        appreciation_impact=SensitivityImpact(
            minus=round(irr_apprec_minus, 2), base=round(base_irr, 2), plus=round(irr_apprec_plus, 2),
            minus_label=f"{inp.expected_annual_appreciation - 2:.1f}%", plus_label=f"{inp.expected_annual_appreciation + 2:.1f}%"
        ),
        rent_impact=SensitivityImpact(
            minus=round(irr_rent_minus, 2), base=round(base_irr, 2), plus=round(irr_rent_plus, 2),
            minus_label="-10%", plus_label="+10%"
        ),
        vacancy_impact=SensitivityImpact(
            minus=round(irr_vac_minus, 2), base=round(base_irr, 2), plus=round(irr_vac_plus, 2),
            minus_label=f"Vac {max(0, inp.vacancy_rate - 5):.0f}%", plus_label=f"Vac {min(50, inp.vacancy_rate + 5):.0f}%"
        ),
        base_irr=round(base_irr, 2),
    )


def run_stress_test(inp: InvestmentInput, base_irr: float) -> StressTestResult:
    """IRR under adverse scenarios."""
    interest_shock = _get_irr(inp.model_copy(update={"loan_interest_rate": inp.loan_interest_rate + 2}))
    apprec_zero = _get_irr(inp.model_copy(update={"expected_annual_appreciation": 0}))
    rent_drop = _get_irr(inp.model_copy(update={"expected_monthly_rent": inp.expected_monthly_rent * 0.85}))
    high_vacancy = _get_irr(inp.model_copy(update={"vacancy_rate": 20}))

    # Worst case: all combined
    worst_case = _get_irr(inp.model_copy(update={
        "loan_interest_rate": inp.loan_interest_rate + 2,
        "expected_annual_appreciation": 0,
        "expected_monthly_rent": inp.expected_monthly_rent * 0.85,
        "vacancy_rate": 20,
    }))

    return StressTestResult(
        base_irr=round(base_irr, 2),
        interest_shock_irr=round(interest_shock, 2),
        appreciation_zero_irr=round(apprec_zero, 2),
        rent_drop_irr=round(rent_drop, 2),
        high_vacancy_irr=round(high_vacancy, 2),
        worst_case_irr=round(worst_case, 2),
    )
