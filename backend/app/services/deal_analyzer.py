"""
Deal Analyzer — PropInvest AI V3.1
Scores deal quality 0-100 across 6 weighted dimensions including Market Alignment.
Weights: IRR 20%, Cash Flow 20%, Yield 15%, DSCR 15%, LTV 15%, Market Alignment 15%.
LTV > 80% applies a risk penalty.
"""
from app.models.schemas import InvestmentInput, InvestmentMetrics, TaxAnalysis, DealAnalysis

# Benchmark values for market alignment scoring
FD_BENCHMARK    = 7.0   # Fixed deposit return %
NIFTY_BENCHMARK = 12.0  # Nifty 50 long-term return %
MARKET_CAP_RATE = 0.038  # Typical Indian residential cap rate


def _s_irr(v: float) -> float:
    """0-100: IRR attractiveness vs benchmarks."""
    if v >= 15: return 100
    if v >= 12: return 85
    if v >= 10: return 70
    if v >= 7:  return 55   # beats FD
    if v >= 5:  return 35
    if v >= 0:  return max(0, v / 5 * 35)
    return 0


def _s_yield(v: float) -> float:
    """0-100: Net rental yield."""
    if v >= 5: return 100
    if v >= 4: return 80
    if v >= 3: return 55
    if v >= 2: return 35
    return max(0, v / 2 * 35)


def _s_cash_flow(v: float) -> float:
    """0-100: Annual cash flow (positive = good)."""
    if v >= 10_000:  return 100
    if v >= 0:       return 60 + v / 10_000 * 40
    if v >= -30_000: return max(0, 60 + v / 30_000 * 60)
    return 0


def _s_ltv(v: float) -> float:
    """0-100: Loan-to-value ratio (lower = safer)."""
    if v <= 50:  return 100
    if v <= 60:  return 85
    if v <= 70:  return 70
    if v <= 80:  return 50
    if v <= 85:  return 25   # risk zone
    return max(0, 100 - v)


def _s_dscr(v: float) -> float:
    """0-100: Debt Service Coverage Ratio."""
    if v >= 1.5:  return 100
    if v >= 1.2:  return 80
    if v >= 1.0:  return 60
    if v >= 0.8:  return 35
    return 10


def _s_market_alignment(metrics: InvestmentMetrics) -> float:
    """
    0-100: How well does this deal align with market benchmarks?
    Based on: IRR vs FD, cap rate vs market, yield vs benchmark.
    """
    score = 0.0
    # IRR vs FD (max 40 points)
    if metrics.irr >= NIFTY_BENCHMARK:
        score += 40
    elif metrics.irr >= FD_BENCHMARK:
        score += 40 * (metrics.irr - FD_BENCHMARK) / (NIFTY_BENCHMARK - FD_BENCHMARK)
    # Cap rate vs market (max 30 points)
    property_cap_rate = metrics.cap_rate / 100
    if property_cap_rate >= MARKET_CAP_RATE:
        score += 30
    elif property_cap_rate > 0:
        score += 30 * (property_cap_rate / MARKET_CAP_RATE)
    # DSCR vs minimum (max 30 points)
    if metrics.dscr >= 1.25:
        score += 30
    elif metrics.dscr >= 1.0:
        score += 30 * (metrics.dscr - 1.0) / 0.25
    return min(100, score)


def _ltv_penalty(ltv: float) -> float:
    """Risk penalty for high LTV. Returns a multiplier 0.7-1.0."""
    if ltv > 85:   return 0.70
    if ltv > 80:   return 0.85
    if ltv > 75:   return 0.92
    return 1.0


def analyze_deal(
    inp: InvestmentInput,
    metrics: InvestmentMetrics,
    tax: TaxAnalysis,
) -> DealAnalysis:
    """Score deal quality 0-100 across 6 weighted dimensions."""

    scores = {
        "irr":              (_s_irr(metrics.irr),                       0.20),
        "cash_flow":        (_s_cash_flow(metrics.annual_cash_flow),    0.20),
        "yield":            (_s_yield(metrics.net_rental_yield),         0.15),
        "dscr":             (_s_dscr(metrics.dscr),                     0.15),
        "ltv":              (_s_ltv(metrics.ltv_ratio),                 0.15),
        "market_alignment": (_s_market_alignment(metrics),              0.15),
    }

    raw_score = sum(v * w for v, w in scores.values())

    # Apply LTV risk penalty to total score
    penalty = _ltv_penalty(metrics.ltv_ratio)
    deal_score = raw_score * penalty

    score_breakdown = {k: round(v, 1) for k, (v, _) in scores.items()}

    # Grade
    if deal_score >= 80:   label, rating = "Excellent",     "A+"
    elif deal_score >= 65: label, rating = "Good",          "A"
    elif deal_score >= 50: label, rating = "Average",       "B"
    elif deal_score >= 35: label, rating = "Below Average", "C"
    else:                  label, rating = "Poor",          "D"

    # Fair price range (3–5% net cap rate)
    noi = metrics.effective_annual_rent - inp.annual_maintenance_cost
    fair_low  = noi / 0.05  # 5% cap → lower fair price
    fair_high = noi / 0.03  # 3% cap → higher fair price
    is_overpriced = inp.property_purchase_price > fair_high * 1.1

    # Negotiation suggestion
    if is_overpriced:
        overpriced_by = inp.property_purchase_price - fair_high
        neg_tip = (
            f"Property appears overpriced by ~₹{overpriced_by:,.0f}. "
            f"Negotiate to ₹{fair_high:,.0f} (3% cap rate floor) "
            "or request seller concessions."
        )
    elif deal_score >= 65:
        neg_tip = (
            "Strong deal. Negotiate on registration fees, furniture, "
            "or delayed possession bonus. Don't over-concede."
        )
    else:
        fd_gap = max(0, round((FD_BENCHMARK - metrics.irr) * 10, 1))
        neg_tip = (
            f"Request a ~{fd_gap}% price reduction or 1-year rent guarantee "
            "to bring IRR above 7% FD threshold. Walk away if seller won't negotiate."
        )

    # Red flags
    red_flags: list[str] = []
    if metrics.dscr < 1.0:
        red_flags.append(f"DSCR {metrics.dscr:.2f}x — rent insufficient to cover EMI")
    if metrics.annual_cash_flow < -50_000:
        red_flags.append(f"Deep negative cash flow ₹{metrics.annual_cash_flow:,.0f}/year")
    if metrics.ltv_ratio > 80:
        red_flags.append(f"High LTV {metrics.ltv_ratio:.0f}% — increased default risk")
    if metrics.irr < FD_BENCHMARK:
        red_flags.append(f"IRR {metrics.irr:.1f}% below 7% FD benchmark")
    if metrics.break_even_occupancy > 90:
        red_flags.append(f"Break-even occupancy {metrics.break_even_occupancy:.0f}% — very low safety margin")
    if is_overpriced:
        red_flags.append("Asking price exceeds fair value range")
    if tax.capital_gains_tax > 500_000:
        red_flags.append(f"High LTCG tax ₹{tax.capital_gains_tax:,.0f} on exit")
    if metrics.ltv_ratio > 85:
        red_flags.append(f"LTV {metrics.ltv_ratio:.0f}% — risk penalty applied to deal score")

    # Green flags
    green_flags: list[str] = []
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
    if metrics.irr >= NIFTY_BENCHMARK:
        green_flags.append(f"IRR beats Nifty 50 benchmark ({NIFTY_BENCHMARK}%)")

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
