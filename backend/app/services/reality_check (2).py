"""
Reality Check Engine — PropInvest AI V3.1
Validates investment inputs for realism BEFORE calculations.
Does NOT block — returns structured warnings.
"""
from dataclasses import dataclass, field
from app.models.schemas import InvestmentInput


@dataclass
class RealityWarning:
    field: str
    message: str
    severity: str  # "low" | "medium" | "high"
    suggestion: str = ""


@dataclass
class RealityCheckResult:
    warnings: list[RealityWarning] = field(default_factory=list)
    overall_severity: str = "low"  # "low" | "medium" | "high"
    is_realistic: bool = True


def validate_investment_inputs(inp: InvestmentInput) -> RealityCheckResult:
    """
    Validate inputs for realism. Returns warnings but does NOT block calculations.
    """
    warnings: list[RealityWarning] = []

    price = inp.property_purchase_price
    rent = inp.expected_monthly_rent
    appreciation = inp.expected_annual_appreciation
    vacancy = inp.vacancy_rate
    rate = inp.loan_interest_rate
    down = inp.down_payment

    # ── Rule 1: Rental yield check ────────────────────────────────────────────
    gross_yield = (rent * 12 / price) * 100 if price > 0 else 0
    if gross_yield > 15:
        warnings.append(RealityWarning(
            field="expected_monthly_rent",
            message=f"Gross rental yield of {gross_yield:.1f}% is unrealistic. Indian market max is ~6–8%.",
            severity="high",
            suggestion=f"For a ₹{price/100000:.0f}L property, expected rent is ₹{price*0.035/12/100:.0f}K–₹{price*0.05/12/100:.0f}K/month.",
        ))
    elif gross_yield > 8:
        warnings.append(RealityWarning(
            field="expected_monthly_rent",
            message=f"Gross rental yield of {gross_yield:.1f}% is very high. Verify rent estimate.",
            severity="medium",
            suggestion="Typical Indian residential yields are 3–5% annually.",
        ))

    # ── Rule 2: Rent > 6% of price annually ──────────────────────────────────
    if gross_yield > 6:
        warnings.append(RealityWarning(
            field="expected_monthly_rent",
            message=f"Monthly rent ₹{rent:,.0f} exceeds 6% annual yield on this property.",
            severity="medium",
            suggestion="This will produce an inflated IRR. Verify rent with local market data.",
        ))

    # ── Rule 3: Appreciation check ────────────────────────────────────────────
    if appreciation > 20:
        warnings.append(RealityWarning(
            field="expected_annual_appreciation",
            message=f"{appreciation}% annual appreciation is unrealistic. Indian historical average is 5–8%.",
            severity="high",
            suggestion="Use 5–8% for conservative projections. Above 12% is speculative.",
        ))
    elif appreciation > 12:
        warnings.append(RealityWarning(
            field="expected_annual_appreciation",
            message=f"{appreciation}% appreciation is aggressive. Few Indian markets sustain this.",
            severity="medium",
            suggestion="Consider 6–10% for realistic long-term projections.",
        ))

    # ── Rule 4: Vacancy check ─────────────────────────────────────────────────
    if vacancy > 40:
        warnings.append(RealityWarning(
            field="vacancy_rate",
            message=f"{vacancy}% vacancy is extremely high. Typical residential vacancy is 5–15%.",
            severity="high",
            suggestion="Use 5–10% for standard residential. 15–20% for commercial/new areas.",
        ))
    elif vacancy > 25:
        warnings.append(RealityWarning(
            field="vacancy_rate",
            message=f"{vacancy}% vacancy is very high. This will significantly reduce returns.",
            severity="medium",
        ))

    # ── Rule 5: LTV check ────────────────────────────────────────────────────
    ltv = ((price - down) / price * 100) if price > 0 else 0
    if ltv > 90:
        warnings.append(RealityWarning(
            field="down_payment",
            message=f"LTV of {ltv:.0f}% exceeds bank limits. Most banks cap at 80–85%.",
            severity="high",
            suggestion="Increase down payment. Minimum 15–20% is required by most lenders.",
        ))

    # ── Rule 6: Interest rate check ───────────────────────────────────────────
    if rate > 15:
        warnings.append(RealityWarning(
            field="loan_interest_rate",
            message=f"{rate}% interest rate is very high. Current Indian home loan rates are 8.5–10.5%.",
            severity="medium",
        ))
    elif rate < 6 and rate > 0:
        warnings.append(RealityWarning(
            field="loan_interest_rate",
            message=f"{rate}% seems too low for an Indian home loan. Typical range is 8.5–10.5%.",
            severity="low",
        ))

    # ── Rule 7: Price sanity ──────────────────────────────────────────────────
    if price <= 0:
        warnings.append(RealityWarning(
            field="property_purchase_price",
            message="Property price must be greater than zero.",
            severity="high",
        ))
    if down >= price:
        warnings.append(RealityWarning(
            field="down_payment",
            message="Down payment cannot exceed property price.",
            severity="high",
        ))

    # ── Overall severity ──────────────────────────────────────────────────────
    severities = [w.severity for w in warnings]
    if "high" in severities:
        overall = "high"
    elif "medium" in severities:
        overall = "medium"
    elif warnings:
        overall = "low"
    else:
        overall = "low"

    is_realistic = overall != "high"

    return RealityCheckResult(
        warnings=warnings,
        overall_severity=overall,
        is_realistic=is_realistic,
    )
