"""
Enhanced Risk Model - Weighted scoring system.

Weights:
- Cash flow: 30%
- IRR vs FD: 25%
- LTV: 20%
- Appreciation: 15%
- Rental yield: 10%

Score 1-100. Labels:
- Low Risk: 0-35
- Moderate Risk: 36-65
- High Risk: 66-100
"""

from typing import Literal

from app.models.investment import (
    InvestmentInput,
    InvestmentMetrics,
    RiskAssessment,
    RiskBreakdown,
)

FD_RATE = 7.0  # 7% FD benchmark

WEIGHTS = {
    "cash_flow": 0.30,
    "irr": 0.25,
    "ltv": 0.20,
    "appreciation": 0.15,
    "yield": 0.10,
}


def _score_cash_flow(annual_cash_flow: float) -> float:
    """
    Score 0-100. Higher = lower risk.
    Negative CF = high risk (0-20). Positive CF = lower risk.
    """
    if annual_cash_flow >= 100_000:
        return 100
    if annual_cash_flow >= 50_000:
        return 80
    if annual_cash_flow >= 0:
        return 60
    if annual_cash_flow >= -50_000:
        return 35
    if annual_cash_flow >= -100_000:
        return 15
    return 0


def _score_irr(irr: float) -> float:
    """
    Score 0-100. Higher IRR = lower risk.
    IRR >= 10% = 100. IRR < 5% = 0-30.
    """
    if irr >= 12:
        return 100
    if irr >= 10:
        return 90
    if irr >= 8:
        return 75
    if irr >= FD_RATE:
        return 60
    if irr >= 5:
        return 40
    if irr >= 0:
        return 20
    return 0


def _score_ltv(ltv: float) -> float:
    """
    Score 0-100. Lower LTV = lower risk.
    LTV <= 60% = 100. LTV >= 90% = 0.
    """
    if ltv <= 60:
        return 100
    if ltv <= 70:
        return 80
    if ltv <= 80:
        return 60
    if ltv <= 85:
        return 35
    return max(0, 50 - ltv)


def _score_appreciation(appreciation: float) -> float:
    """
    Score 0-100. Higher appreciation = lower risk.
    """
    if appreciation >= 8:
        return 100
    if appreciation >= 6:
        return 80
    if appreciation >= 5:
        return 65
    if appreciation >= 3:
        return 45
    if appreciation >= 0:
        return 25
    return 0


def _score_yield(yield_pct: float) -> float:
    """
    Score 0-100. Higher yield = lower risk.
    """
    if yield_pct >= 5:
        return 100
    if yield_pct >= 4:
        return 85
    if yield_pct >= 3:
        return 65
    if yield_pct >= 2:
        return 40
    return max(0, yield_pct * 20)


def calculate_risk_score(
    input_data: InvestmentInput, metrics: InvestmentMetrics
) -> RiskAssessment:
    """
    Calculate weighted risk score (1-100) with component breakdown.

    Returns:
        RiskAssessment with total_score, label, breakdown, explanation.
        Also includes score (1-10) for backward compatibility.
    """
    ltv = ((input_data.property_purchase_price - input_data.down_payment)
           / input_data.property_purchase_price * 100)

    cash_flow_score = _score_cash_flow(metrics.annual_cash_flow)
    irr_score = _score_irr(metrics.irr)
    ltv_score = _score_ltv(ltv)
    appreciation_score = _score_appreciation(
        input_data.expected_annual_appreciation
    )
    yield_score = _score_yield(metrics.annual_rental_yield)

    total = (
        cash_flow_score * WEIGHTS["cash_flow"]
        + irr_score * WEIGHTS["irr"]
        + ltv_score * WEIGHTS["ltv"]
        + appreciation_score * WEIGHTS["appreciation"]
        + yield_score * WEIGHTS["yield"]
    )
    total_score = min(100, max(0, round(total)))
    total_score = int(total_score)

    if total_score <= 35:
        label: Literal["Low Risk", "Moderate Risk", "High Risk"] = "Low Risk"
    elif total_score <= 65:
        label = "Moderate Risk"
    else:
        label = "High Risk"

    # Backward compat: score 1-10 from total 1-100
    legacy_score = min(10, max(1, (total_score // 10) + (1 if total_score > 0 else 0)))
    if total_score == 0:
        legacy_score = 1

    breakdown = RiskBreakdown(
        cash_flow_score=round(cash_flow_score, 1),
        irr_score=round(irr_score, 1),
        ltv_score=round(ltv_score, 1),
        appreciation_score=round(appreciation_score, 1),
        yield_score=round(yield_score, 1),
    )

    parts = []
    if cash_flow_score < 50:
        parts.append("weak cash flow")
    if irr_score < 50:
        parts.append("IRR below FD")
    if ltv_score < 50:
        parts.append("high LTV")
    if appreciation_score < 50:
        parts.append("low appreciation assumption")
    if yield_score < 50:
        parts.append("low rental yield")

    explanation = (
        "Risk factors: " + "; ".join(parts)
        if parts
        else "Favorable metrics across cash flow, IRR, LTV, appreciation, and yield."
    )

    return RiskAssessment(
        score=legacy_score,
        label=label,
        explanation=explanation,
        total_score=total_score,
        breakdown=breakdown,
    )
