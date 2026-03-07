"""
Financial Engine — PropInvest AI V3
Calculates all investment metrics: EMI, IRR, NPV, Cap Rate, DSCR, Cash-on-Cash, etc.
V3.1 overflow fix: safe_float() guards all values before round(); future_value clamped;
DSCR inf replaced with sentinel; appreciation rate validated before exponentiation.
"""
import math
from app.models.schemas import (
    InvestmentInput, InvestmentMetrics, CashFlowYear
)
from app.utils.irr import calculate_irr, calculate_npv

# Maximum safe appreciation rate for exponentiation (per year, decimal form)
# 25%/yr over 30 years = (1.25)^30 = 807 — safe. 50% = 191,751 — safe.
# This clamp is a last-resort safety net; Pydantic already caps at 50%.
_MAX_APPREC_RATE = 0.50   # 50% annual — matches Pydantic schema le=50

# Sentinel for DSCR when EMI=0 (no loan): use 999 instead of inf
# JSON serializers cannot encode float('inf') → OverflowError(34)
_DSCR_NO_LOAN = 999.0


def _safe_float(value: float, fallback: float = 0.0, max_abs: float = 1e15) -> float:
    """
    Return value if finite and within max_abs, else fallback.
    Prevents OverflowError(34) when Pydantic serializes non-finite floats to JSON.
    """
    if not math.isfinite(value):
        return fallback
    if abs(value) > max_abs:
        return math.copysign(max_abs, value)
    return value


def _safe_pow_appreciation(price: float, annual_rate_pct: float, years: int) -> float:
    """
    Compute price * (1 + rate)^years safely.
    annual_rate_pct is in percent (e.g. 7.0 for 7%).
    Clamps rate to _MAX_APPREC_RATE before exponentiation.
    Returns price if result is non-finite.
    """
    rate = max(-0.20, min(annual_rate_pct / 100, _MAX_APPREC_RATE))
    try:
        result = price * (1.0 + rate) ** years
        return result if math.isfinite(result) else price
    except OverflowError:
        return price


def calculate_emi(principal: float, annual_rate: float, tenure_years: int) -> float:
    """Standard reducing-balance EMI formula."""
    if annual_rate == 0:
        return principal / (tenure_years * 12)
    r = annual_rate / 100 / 12
    n = tenure_years * 12
    return principal * r * (1 + r) ** n / ((1 + r) ** n - 1)


def build_cash_flow_timeline(inp: InvestmentInput, emi: float) -> list[CashFlowYear]:
    """Year-by-year cash flow timeline."""
    timeline = []
    cumulative = 0.0
    loan_balance = inp.property_purchase_price - inp.down_payment

    for year in range(1, inp.holding_period_years + 1):
        rent = inp.expected_monthly_rent * 12 * (1 - inp.vacancy_rate / 100)
        emi_annual = emi * 12
        maintenance = inp.annual_maintenance_cost
        net_cf = rent - emi_annual - maintenance
        cumulative += net_cf
        pv = _safe_pow_appreciation(
            inp.property_purchase_price,
            inp.expected_annual_appreciation,
            year,
        )
        # Simple equity approximation
        remaining_tenure = max(0, inp.loan_tenure_years - year)
        if remaining_tenure > 0 and inp.loan_interest_rate > 0:
            r = inp.loan_interest_rate / 100 / 12
            n_remaining = remaining_tenure * 12
            remaining_balance = emi * (1 - (1 + r) ** -n_remaining) / r
        else:
            remaining_balance = 0
        equity = pv - remaining_balance

        timeline.append(CashFlowYear(
            year=year,
            rental_income=round(rent, 2),
            emi_paid=round(emi_annual, 2),
            maintenance=round(maintenance, 2),
            net_cash_flow=round(net_cf, 2),
            cumulative_cash_flow=round(cumulative, 2),
            property_value=round(pv, 2),
            equity=round(equity, 2),
        ))
    return timeline


def run_engine(inp: InvestmentInput) -> tuple[InvestmentMetrics, list[CashFlowYear]]:
    """Main calculation entry point. Returns (metrics, timeline)."""

    # ── Acquisition costs ─────────────────────────────────────────────────────
    stamp_duty = inp.property_purchase_price * inp.stamp_duty_percent / 100
    reg_cost = inp.property_purchase_price * inp.registration_cost_percent / 100
    total_acquisition_cost = inp.property_purchase_price + stamp_duty + reg_cost
    effective_down = inp.down_payment + stamp_duty + reg_cost
    loan_amount = inp.property_purchase_price - inp.down_payment

    # ── EMI ───────────────────────────────────────────────────────────────────
    emi = calculate_emi(loan_amount, inp.loan_interest_rate, inp.loan_tenure_years)
    annual_emi = emi * 12

    # ── Total interest paid ───────────────────────────────────────────────────
    total_paid = emi * inp.loan_tenure_years * 12
    total_interest = total_paid - loan_amount

    # ── Rental income ─────────────────────────────────────────────────────────
    gross_annual_rent = inp.expected_monthly_rent * 12
    effective_annual_rent = gross_annual_rent * (1 - inp.vacancy_rate / 100)
    annual_cash_flow = effective_annual_rent - annual_emi - inp.annual_maintenance_cost
    monthly_cash_flow = annual_cash_flow / 12

    # ── Yields ────────────────────────────────────────────────────────────────
    gross_rental_yield = (gross_annual_rent / inp.property_purchase_price) * 100
    net_rental_yield = (
        (effective_annual_rent - inp.annual_maintenance_cost) / inp.property_purchase_price
    ) * 100

    # ── Cap Rate (NOI / value) ────────────────────────────────────────────────
    noi = effective_annual_rent - inp.annual_maintenance_cost
    cap_rate = (noi / inp.property_purchase_price) * 100

    # ── Cash-on-Cash ─────────────────────────────────────────────────────────
    # Annual cash flow / total equity invested (down + acquisition costs)
    cash_on_cash = (annual_cash_flow / effective_down) * 100 if effective_down > 0 else 0

    # ── DSCR ─────────────────────────────────────────────────────────────────
    # float('inf') when annual_emi=0 causes OverflowError(34) in JSON serialization
    dscr = noi / annual_emi if annual_emi > 0 else _DSCR_NO_LOAN

    # ── Break-even occupancy ──────────────────────────────────────────────────
    # What occupancy % is needed to cover EMI + maintenance?
    annual_costs = annual_emi + inp.annual_maintenance_cost
    break_even_occupancy = (annual_costs / gross_annual_rent * 100) if gross_annual_rent > 0 else 100

    # ── LTV ───────────────────────────────────────────────────────────────────
    ltv_ratio = (loan_amount / inp.property_purchase_price) * 100

    # ── Future value & capital gains ─────────────────────────────────────────
    # V3.1: use _safe_pow_appreciation to prevent OverflowError(34) from
    # exponentiation when appreciation or holding period produces extreme values
    future_value = _safe_pow_appreciation(
        inp.property_purchase_price,
        inp.expected_annual_appreciation,
        inp.holding_period_years,
    )
    capital_gains = future_value - inp.property_purchase_price
    # Flat 20% LTCG for metrics (detailed indexation in tax engine)
    cg_tax = max(0, capital_gains * 0.20) if inp.holding_period_years >= 2 else capital_gains * inp.investor_tax_slab / 100

    # ── Equity built ─────────────────────────────────────────────────────────
    periods_paid = min(inp.holding_period_years * 12, inp.loan_tenure_years * 12)
    if inp.loan_interest_rate > 0:
        r = inp.loan_interest_rate / 100 / 12
        n = inp.loan_tenure_years * 12
        remaining = emi * (1 - (1 + r) ** -(n - periods_paid)) / r if n > periods_paid else 0
    else:
        remaining = max(0, loan_amount - (loan_amount / (inp.loan_tenure_years * 12)) * periods_paid)
    equity_built = loan_amount - remaining

    # ── IRR cash flows ────────────────────────────────────────────────────────
    # t=0: outflow (effective down payment)
    # t=1..n: annual net cash flows
    # t=n: add net sale proceeds
    net_sale_proceeds = future_value - remaining - cg_tax
    irr_flows = [-effective_down]
    for yr in range(1, inp.holding_period_years + 1):
        annual_cf = effective_annual_rent - annual_emi - inp.annual_maintenance_cost
        if yr == inp.holding_period_years:
            annual_cf += net_sale_proceeds
        irr_flows.append(annual_cf)

    irr = calculate_irr(irr_flows) or 0.0
    # Guardrail: cap IRR at 300% to prevent display explosion from unrealistic inputs
    irr = min(irr, 300.0)
    npv = calculate_npv(irr_flows, discount_rate=0.10)

    # ── ROI ───────────────────────────────────────────────────────────────────
    total_invested = effective_down
    total_return = net_sale_proceeds + sum(
        effective_annual_rent - annual_emi - inp.annual_maintenance_cost
        for _ in range(inp.holding_period_years)
    ) - total_invested
    roi = (total_return / total_invested * 100) if total_invested > 0 else 0

    # ── Timeline ──────────────────────────────────────────────────────────────
    timeline = build_cash_flow_timeline(inp, emi)

    metrics = InvestmentMetrics(
        emi=round(_safe_float(emi), 2),
        loan_amount=round(_safe_float(loan_amount), 2),
        total_acquisition_cost=round(_safe_float(total_acquisition_cost), 2),
        effective_down_payment=round(_safe_float(effective_down), 2),
        annual_rental_income=round(_safe_float(gross_annual_rent), 2),
        effective_annual_rent=round(_safe_float(effective_annual_rent), 2),
        annual_cash_flow=round(_safe_float(annual_cash_flow), 2),
        monthly_cash_flow=round(_safe_float(monthly_cash_flow), 2),
        total_interest_paid=round(_safe_float(total_interest), 2),
        gross_rental_yield=round(_safe_float(gross_rental_yield, max_abs=100), 2),
        net_rental_yield=round(_safe_float(net_rental_yield, max_abs=100), 2),
        cash_on_cash_return=round(_safe_float(cash_on_cash, max_abs=1000), 2),
        cap_rate=round(_safe_float(cap_rate, max_abs=100), 2),
        total_equity_built=round(_safe_float(equity_built), 2),
        future_property_value=round(_safe_float(future_value), 2),
        capital_gains=round(_safe_float(capital_gains), 2),
        capital_gains_tax=round(_safe_float(cg_tax), 2),
        irr=round(_safe_float(irr, max_abs=300), 2),
        npv=round(_safe_float(npv), 2),
        roi=round(_safe_float(roi, max_abs=10000), 2),
        total_invested=round(_safe_float(total_invested), 2),
        dscr=round(_safe_float(dscr, fallback=0.0, max_abs=999), 3),
        break_even_occupancy=round(min(_safe_float(break_even_occupancy, max_abs=100), 100), 2),
        ltv_ratio=round(_safe_float(ltv_ratio, max_abs=100), 2),
    )

    return metrics, timeline
