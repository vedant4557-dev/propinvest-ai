"""
Risk Scorer — PropInvest AI V3
Weighted 0-100 score across 7 dimensions.
"""
from app.models.schemas import InvestmentMetrics, RiskAssessment, RiskBreakdown


def _score_cash_flow(cf: float) -> float:
    """0-100: positive cash flow = good."""
    if cf >= 10_000: return 100
    if cf >= 0:      return 60 + cf / 10_000 * 40
    if cf >= -20_000: return 60 + cf / 20_000 * 60   # 0-60
    return 0


def _score_irr(irr: float) -> float:
    """0-100: IRR vs benchmarks."""
    if irr >= 15:    return 100
    if irr >= 12:    return 85
    if irr >= 10:    return 75
    if irr >= 7:     return 60   # beats FD
    if irr >= 5:     return 40
    if irr >= 0:     return 20
    return 0


def _score_ltv(ltv: float) -> float:
    """0-100: lower LTV = lower risk."""
    if ltv <= 50:    return 100
    if ltv <= 60:    return 85
    if ltv <= 70:    return 70
    if ltv <= 80:    return 50
    if ltv <= 90:    return 25
    return 10


def _score_appreciation(rate: float) -> float:
    """0-100: appreciation expectation."""
    if rate >= 10:   return 100
    if rate >= 7:    return 80
    if rate >= 5:    return 65
    if rate >= 3:    return 45
    if rate >= 0:    return 25
    return 0


def _score_yield(yield_pct: float) -> float:
    """0-100: net rental yield."""
    if yield_pct >= 5:   return 100
    if yield_pct >= 4:   return 80
    if yield_pct >= 3:   return 60
    if yield_pct >= 2:   return 40
    if yield_pct >= 1:   return 20
    return 0


def _score_dscr(dscr: float) -> float:
    """0-100: Debt Service Coverage Ratio."""
    if dscr >= 1.5:  return 100
    if dscr >= 1.2:  return 80
    if dscr >= 1.0:  return 60
    if dscr >= 0.8:  return 35
    return 10


def _score_vacancy(break_even: float) -> float:
    """0-100: lower break-even occupancy = safer."""
    if break_even <= 60:  return 100
    if break_even <= 70:  return 80
    if break_even <= 80:  return 60
    if break_even <= 90:  return 40
    if break_even <= 95:  return 20
    return 5


# Weights must sum to 1.0
WEIGHTS = {
    "cash_flow": 0.25,
    "irr":       0.20,
    "ltv":       0.15,
    "appreciation": 0.10,
    "yield":     0.10,
    "dscr":      0.12,
    "vacancy":   0.08,
}


def score_risk(metrics: InvestmentMetrics, appreciation_rate: float) -> RiskAssessment:
    breakdown_raw = {
        "cash_flow": _score_cash_flow(metrics.annual_cash_flow),
        "irr":       _score_irr(metrics.irr),
        "ltv":       _score_ltv(metrics.ltv_ratio),
        "appreciation": _score_appreciation(appreciation_rate),
        "yield":     _score_yield(metrics.net_rental_yield),
        "dscr":      _score_dscr(metrics.dscr),
        "vacancy":   _score_vacancy(metrics.break_even_occupancy),
    }

    total = sum(breakdown_raw[k] * WEIGHTS[k] for k in WEIGHTS)

    if total <= 35:
        label, score_1_10 = "High Risk", max(1, round(total / 35 * 4))
    elif total <= 65:
        label, score_1_10 = "Moderate Risk", round(4 + (total - 35) / 30 * 4)
    else:
        label, score_1_10 = "Low Risk", round(8 + (total - 65) / 35 * 2)

    explanation_parts = []
    if metrics.annual_cash_flow < 0:
        explanation_parts.append("negative annual cash flow")
    if metrics.dscr < 1.0:
        explanation_parts.append("rental income insufficient to cover EMI (DSCR < 1)")
    if metrics.ltv_ratio > 80:
        explanation_parts.append("high leverage (LTV > 80%)")
    if metrics.irr < 7:
        explanation_parts.append("IRR below FD benchmark")
    if metrics.break_even_occupancy > 90:
        explanation_parts.append("high break-even occupancy risk")

    if explanation_parts:
        explanation = f"{label}: Key concerns — {', '.join(explanation_parts)}."
    else:
        explanation = f"{label}: Strong fundamentals with {metrics.irr:.1f}% IRR and {metrics.dscr:.2f}x DSCR."

    return RiskAssessment(
        score=score_1_10,
        total_score=round(total, 1),
        label=label,
        explanation=explanation,
        breakdown=RiskBreakdown(
            cash_flow_score=round(breakdown_raw["cash_flow"], 1),
            irr_score=round(breakdown_raw["irr"], 1),
            ltv_score=round(breakdown_raw["ltv"], 1),
            appreciation_score=round(breakdown_raw["appreciation"], 1),
            yield_score=round(breakdown_raw["yield"], 1),
            dscr_score=round(breakdown_raw["dscr"], 1),
            vacancy_score=round(breakdown_raw["vacancy"], 1),
        ),
    )
