"""
Sensitivity Analysis & Stress Testing — PropInvest AI V3.1
Fixed: uses ±2% interest rate, ±10% rent, ±10% vacancy, ±2% appreciation.
Direction verified: higher interest rate → lower IRR (correct).
"""
from app.models.schemas import (
    InvestmentInput, SensitivityResult, SensitivityImpact, StressTestResult
)
from app.services.financial_engine import run_engine


def _get_irr(inp: InvestmentInput) -> float:
    """Run engine and return IRR. Returns 0 on any error."""
    try:
        metrics, _ = run_engine(inp)
        return metrics.irr
    except Exception:
        return 0.0


def run_sensitivity(inp: InvestmentInput, base_irr: float) -> SensitivityResult:
    """
    IRR sensitivity to key parameters.
    Each parameter is tested independently (delta method).
    Higher interest rate → higher EMI → lower cash flow → lower IRR (correct).
    Higher appreciation → higher exit price → higher IRR (correct).
    Higher rent → higher income → higher IRR (correct).
    Higher vacancy → lower income → lower IRR (correct).
    """

    # ── Interest rate ±2% ────────────────────────────────────────────────────
    rate_minus = max(0.1, inp.loan_interest_rate - 2)
    rate_plus  = inp.loan_interest_rate + 2
    irr_rate_minus = _get_irr(inp.model_copy(update={"loan_interest_rate": rate_minus}))
    irr_rate_plus  = _get_irr(inp.model_copy(update={"loan_interest_rate": rate_plus}))

    # ── Appreciation ±2% ─────────────────────────────────────────────────────
    apprec_minus = max(0, inp.expected_annual_appreciation - 2)
    apprec_plus  = inp.expected_annual_appreciation + 2
    irr_apprec_minus = _get_irr(inp.model_copy(update={"expected_annual_appreciation": apprec_minus}))
    irr_apprec_plus  = _get_irr(inp.model_copy(update={"expected_annual_appreciation": apprec_plus}))

    # ── Rent ±10% ────────────────────────────────────────────────────────────
    irr_rent_minus = _get_irr(inp.model_copy(update={"expected_monthly_rent": inp.expected_monthly_rent * 0.90}))
    irr_rent_plus  = _get_irr(inp.model_copy(update={"expected_monthly_rent": inp.expected_monthly_rent * 1.10}))

    # ── Vacancy ±10% ─────────────────────────────────────────────────────────
    # Minus vacancy = lower vacancy = better (more occupancy)
    # Plus vacancy = higher vacancy = worse
    vac_minus = max(0, inp.vacancy_rate - 10)
    vac_plus  = min(60, inp.vacancy_rate + 10)
    irr_vac_minus = _get_irr(inp.model_copy(update={"vacancy_rate": vac_minus}))
    irr_vac_plus  = _get_irr(inp.model_copy(update={"vacancy_rate": vac_plus}))

    return SensitivityResult(
        interest_rate_impact=SensitivityImpact(
            minus=round(irr_rate_minus, 2),
            base=round(base_irr, 2),
            plus=round(irr_rate_plus, 2),
            minus_label=f"{rate_minus:.1f}% rate",
            plus_label=f"{rate_plus:.1f}% rate",
        ),
        appreciation_impact=SensitivityImpact(
            minus=round(irr_apprec_minus, 2),
            base=round(base_irr, 2),
            plus=round(irr_apprec_plus, 2),
            minus_label=f"{apprec_minus:.1f}% growth",
            plus_label=f"{apprec_plus:.1f}% growth",
        ),
        rent_impact=SensitivityImpact(
            minus=round(irr_rent_minus, 2),
            base=round(base_irr, 2),
            plus=round(irr_rent_plus, 2),
            minus_label="-10% rent",
            plus_label="+10% rent",
        ),
        vacancy_impact=SensitivityImpact(
            minus=round(irr_vac_minus, 2),
            base=round(base_irr, 2),
            plus=round(irr_vac_plus, 2),
            minus_label=f"Vac {vac_minus:.0f}%",
            plus_label=f"Vac {vac_plus:.0f}%",
        ),
        base_irr=round(base_irr, 2),
    )


def run_stress_test(inp: InvestmentInput, base_irr: float) -> StressTestResult:
    """IRR under adverse scenarios. Each scenario stresses a single variable."""
    interest_shock = _get_irr(inp.model_copy(update={"loan_interest_rate": inp.loan_interest_rate + 2}))
    apprec_zero    = _get_irr(inp.model_copy(update={"expected_annual_appreciation": 0}))
    rent_drop      = _get_irr(inp.model_copy(update={"expected_monthly_rent": inp.expected_monthly_rent * 0.85}))
    high_vacancy   = _get_irr(inp.model_copy(update={"vacancy_rate": min(60, inp.vacancy_rate + 15)}))

    # Worst case: all stress factors combined
    worst_case = _get_irr(inp.model_copy(update={
        "loan_interest_rate": inp.loan_interest_rate + 2,
        "expected_annual_appreciation": 0,
        "expected_monthly_rent": inp.expected_monthly_rent * 0.85,
        "vacancy_rate": min(60, inp.vacancy_rate + 15),
    }))

    return StressTestResult(
        base_irr=round(base_irr, 2),
        interest_shock_irr=round(interest_shock, 2),
        appreciation_zero_irr=round(apprec_zero, 2),
        rent_drop_irr=round(rent_drop, 2),
        high_vacancy_irr=round(high_vacancy, 2),
        worst_case_irr=round(worst_case, 2),
    )
