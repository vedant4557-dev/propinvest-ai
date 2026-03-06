"""
Deal Analyzer — PropInvest AI V3
Scores deal quality 0-100 and provides negotiation insights.
"""
from app.models.schemas import InvestmentInput, InvestmentMetrics, TaxAnalysis, DealAnalysis


def analyze_deal(
    inp: InvestmentInput,
    metrics: InvestmentMetrics,
    tax: TaxAnalysis,
) -> DealAnalysis:
    """Score deal quality 0-100 across 6 dimensions."""

    # Dimension scores (each 0-100)
    def s_irr(v):
        if v >= 15: return 100
        if v >= 12: return 85
        if v >= 10: return 70
        if v >= 7:  return 55
        if v >= 5:  return 35
        return max(0, v / 5 * 35)

    def s_post_tax_irr(v):
        return s_irr(v) * 0.9  # slightly lower weight

    def s_yield(v):
        if v >= 5: return 100
        if v >= 4: return 80
        if v >= 3: return 55
        if v >= 2: return 35
        return max(0, v / 2 * 35)

    def s_cash_flow(v):
        if v >= 10_000: return 100
        if v >= 0:      return 60 + v / 10_000 * 40
        if v >= -30_000: return max(0, 60 + v / 30_000 * 60)
        return 0

    def s_ltv(v):
        if v <= 50: return 100
        if v <= 60: return 85
        if v <= 70: return 70
        if v <= 80: return 50
        return max(0, 100 - v)

    def s_dscr(v):
        if v >= 1.5: return 100
        if v >= 1.2: return 80
        if v >= 1.0: return 60
        if v >= 0.8: return 35
        return 10

    # Weights
    scores = {
        "irr":          (s_irr(metrics.irr), 0.20),
        "post_tax_irr": (s_post_tax_irr(tax.post_tax_irr), 0.15),
        "yield":        (s_yield(metrics.net_rental_yield), 0.15),
        "cash_flow":    (s_cash_flow(metrics.annual_cash_flow), 0.20),
        "ltv":          (s_ltv(metrics.ltv_ratio), 0.15),
        "dscr":         (s_dscr(metrics.dscr), 0.15),
    }

    deal_score = sum(v * w for v, w in scores.values())
    score_breakdown = {k: round(v, 1) for k, (v, _) in scores.items()}

    # Label
    if deal_score >= 80:   label, rating = "Excellent",      "A+"
    elif deal_score >= 65: label, rating = "Good",           "A"
    elif deal_score >= 50: label, rating = "Average",        "B"
    elif deal_score >= 35: label, rating = "Below Average",  "C"
    else:                  label, rating = "Poor",           "D"

    # Fair price range based on yield expectations (3-5% net yield)
    noi = metrics.effective_annual_rent - inp.annual_maintenance_cost
    fair_low  = noi / 0.05  # 5% cap rate → lower price
    fair_high = noi / 0.03  # 3% cap rate → higher price
    is_overpriced = inp.property_purchase_price > fair_high * 1.1

    # Negotiation suggestion
    if is_overpriced:
        overpriced_by = inp.property_purchase_price - fair_high
        neg_tip = (
            f"Property appears overpriced by ~₹{overpriced_by:,.0f}. "
            f"Negotiate price down to ₹{fair_high:,.0f} (3% cap rate floor) "
            f"or request seller concessions like furniture/parking."
        )
    elif deal_score >= 65:
        neg_tip = (
            "Strong deal. Negotiate on registration fees, furniture inclusion, "
            "or delayed possession bonus. Limit concessions to preserve value."
        )
    else:
        shortfall = round((7 - metrics.irr) * 10, 1) if metrics.irr < 7 else 0
        neg_tip = (
            f"Request a {shortfall}% price reduction or rent guarantee for year 1 "
            "to bring IRR to 7%+ threshold. Consider walking away if seller won't negotiate."
        )

    # Flags
    red_flags: list[str] = []
    green_flags: list[str] = []

    if metrics.dscr < 1.0:
        red_flags.append(f"DSCR {metrics.dscr:.2f}x — rent insufficient to cover EMI")
    if metrics.annual_cash_flow < -50_000:
        red_flags.append(f"Deep negative cash flow ₹{metrics.annual_cash_flow:,.0f}/year")
    if metrics.ltv_ratio > 80:
        red_flags.append(f"High LTV {metrics.ltv_ratio:.0f}% — increased default risk")
    if metrics.irr < 7:
        red_flags.append(f"IRR {metrics.irr:.1f}% below 7% FD benchmark")
    if metrics.break_even_occupancy > 90:
        red_flags.append(f"Break-even occupancy {metrics.break_even_occupancy:.0f}% — very low margin of safety")
    if is_overpriced:
        red_flags.append("Asking price exceeds fair value range")
    if tax.capital_gains_tax > 500_000:
        red_flags.append(f"High LTCG tax ₹{tax.capital_gains_tax:,.0f} on exit")

    if metrics.irr >= 12:
        green_flags.append(f"Excellent IRR {metrics.irr:.1f}%")
    if metrics.dscr >= 1.3:
        green_flags.append(f"Strong DSCR {metrics.dscr:.2f}x — good rental coverage")
    if metrics.annual_cash_flow > 0:
        green_flags.append(f"Positive cash flow ₹{metrics.annual_cash_flow:,.0f}/year")
    if metrics.net_rental_yield >= 4:
        green_flags.append(f"Good net yield {metrics.net_rental_yield:.1f}%")
    if tax.net_tax_benefit > 0:
        green_flags.append(f"Net tax benefit ₹{tax.net_tax_benefit:,.0f}/year from Section 24(b)")

    return DealAnalysis(
        deal_score=round(deal_score, 1),
        label=label,
        rating=rating,
        is_overpriced=is_overpriced,
        fair_price_range={"low": round(fair_low, 0), "high": round(fair_high, 0)},
        negotiation_suggestion=neg_tip,
        red_flags=red_flags,
        green_flags=green_flags,
        score_breakdown=score_breakdown,
    )
