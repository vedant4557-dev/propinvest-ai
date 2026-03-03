"""
Deal Analyzer - Evaluates quality of a single property deal.

Deterministic scoring. Independent of AI layer.
"""

from typing import Any, Literal

from app.services.rating import get_investment_rating

FD_RATE = 7.0
LTV_RISK_THRESHOLD = 80.0
YIELD_BONUS_THRESHOLD = 4.0
APPRECIATION_BONUS_THRESHOLD = 6.0
OVERPriced_THRESHOLD = 0.05  # 5%


def analyze_deal_from_response(
    input_data: Any,
    metrics: Any,
    tax_analysis: Any | None,
) -> dict[str, Any]:
    """
    Convenience: run deal analysis from analysis response.
    Uses property_price as both asking and estimated market value.
    """
    prop = input_data.property_purchase_price
    down = input_data.down_payment
    ltv = ((prop - down) / prop * 100) if prop > 0 else 0
    post_tax = (
        tax_analysis.get("post_tax_irr", metrics.irr)
        if isinstance(tax_analysis, dict)
        else (tax_analysis.post_tax_irr if tax_analysis else metrics.irr)
    )
    return analyze_deal(
        asking_price=prop,
        estimated_market_value=prop,
        irr=metrics.irr,
        post_tax_irr=post_tax,
        rental_yield=metrics.annual_rental_yield,
        ltv=ltv,
        annual_cash_flow=metrics.annual_cash_flow,
        appreciation_rate=input_data.expected_annual_appreciation,
    )


def analyze_deal(
    asking_price: float,
    estimated_market_value: float,
    irr: float,
    post_tax_irr: float,
    rental_yield: float,
    ltv: float,
    annual_cash_flow: float,
    appreciation_rate: float,
) -> dict[str, Any]:
    """
    Evaluate deal quality. Returns deal_score, label, is_overpriced, etc.

    Weights:
    - IRR vs 7% FD: 25%
    - Post-tax IRR: 15%
    - Rental yield: 15%
    - Cash flow: 15%
    - LTV risk: 15%
    - Appreciation: 15%
    """
    red_flags: list[str] = []
    scores: dict[str, float] = {}

    # IRR vs FD (0-100)
    if irr >= 10:
        scores["irr"] = 100
    elif irr >= FD_RATE:
        scores["irr"] = 60 + (irr - FD_RATE) * 13  # 7->60, 10->99
    elif irr >= 5:
        scores["irr"] = 30 + (irr - 5) * 15
    else:
        scores["irr"] = max(0, irr * 6)
        red_flags.append("IRR below risk-free benchmark")
    scores["irr"] = min(100, scores["irr"])

    # Post-tax IRR (0-100)
    if post_tax_irr >= 8:
        scores["post_tax_irr"] = 100
    elif post_tax_irr >= FD_RATE:
        scores["post_tax_irr"] = 70
    else:
        scores["post_tax_irr"] = max(0, post_tax_irr * 10)

    # Rental yield (0-100)
    if rental_yield >= 5:
        scores["yield"] = 100
    elif rental_yield >= YIELD_BONUS_THRESHOLD:
        scores["yield"] = 85
    elif rental_yield >= 3:
        scores["yield"] = 60
    elif rental_yield >= 2:
        scores["yield"] = 40
    else:
        scores["yield"] = max(0, rental_yield * 20)

    # Cash flow (0-100)
    if annual_cash_flow >= 100_000:
        scores["cash_flow"] = 100
    elif annual_cash_flow >= 50_000:
        scores["cash_flow"] = 85
    elif annual_cash_flow >= 0:
        scores["cash_flow"] = 60
    else:
        scores["cash_flow"] = max(0, 40 + annual_cash_flow / 2_500)
        red_flags.append("Persistent negative cash flow")

    # LTV risk (0-100, lower LTV = higher score)
    if ltv <= 60:
        scores["ltv"] = 100
    elif ltv <= 70:
        scores["ltv"] = 85
    elif ltv <= 80:
        scores["ltv"] = 60
    else:
        scores["ltv"] = max(0, 40 - (ltv - 80))
        red_flags.append("High leverage increases risk")

    # Appreciation (0-100)
    if appreciation_rate >= 8:
        scores["appreciation"] = 100
    elif appreciation_rate >= APPRECIATION_BONUS_THRESHOLD:
        scores["appreciation"] = 85
    elif appreciation_rate >= 5:
        scores["appreciation"] = 65
    elif appreciation_rate >= 3:
        scores["appreciation"] = 45
    else:
        scores["appreciation"] = max(0, appreciation_rate * 15)

    # Weighted deal score
    weights = {
        "irr": 0.25,
        "post_tax_irr": 0.15,
        "yield": 0.15,
        "cash_flow": 0.15,
        "ltv": 0.15,
        "appreciation": 0.15,
    }
    deal_score = sum(scores[k] * weights[k] for k in weights)
    deal_score = min(100, max(0, round(deal_score, 1)))

    # Overpriced check
    is_overpriced = False
    if estimated_market_value > 0 and asking_price > estimated_market_value:
        premium = (asking_price - estimated_market_value) / estimated_market_value
        if premium > OVERPriced_THRESHOLD:
            is_overpriced = True
            red_flags.append("Asking price exceeds market value by >5%")

    # Fair price range (simplified: ±10% of market or asking)
    base = estimated_market_value if estimated_market_value > 0 else asking_price
    fair_price_range = {
        "low": round(base * 0.90, 0),
        "high": round(base * 1.05, 0),
    }

    # Label
    if deal_score >= 75:
        label: Literal["Excellent", "Good", "Average", "Weak"] = "Excellent"
    elif deal_score >= 60:
        label = "Good"
    elif deal_score >= 40:
        label = "Average"
    else:
        label = "Weak"

    # Negotiation suggestion
    if is_overpriced:
        negotiation_suggestion = (
            f"Consider negotiating down to ₹{fair_price_range['low']:,.0f}–₹{fair_price_range['high']:,.0f} "
            "based on estimated market value."
        )
    elif annual_cash_flow < 0:
        negotiation_suggestion = (
            "Negative cash flow. Negotiate purchase price or seek higher rent to improve returns."
        )
    elif ltv > 80:
        negotiation_suggestion = (
            "High LTV. Consider larger down payment or negotiating a lower price to reduce leverage."
        )
    elif deal_score >= 75:
        negotiation_suggestion = (
            "Strong deal metrics. You may have limited negotiation room; focus on terms and closing costs."
        )
    else:
        negotiation_suggestion = (
            f"Aim for price within fair range (₹{fair_price_range['low']:,.0f}–₹{fair_price_range['high']:,.0f}) "
            "and verify rent assumptions."
        )

    rating = get_investment_rating(irr, annual_cash_flow)

    return {
        "deal_score": deal_score,
        "label": label,
        "rating": rating,
        "is_overpriced": is_overpriced,
        "fair_price_range": fair_price_range,
        "negotiation_suggestion": negotiation_suggestion,
        "red_flags": red_flags,
        "score_breakdown": scores,
    }
