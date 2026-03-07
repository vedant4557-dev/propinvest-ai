"""
IRR calculation using Newton-Raphson method with bisection fallback.
V3.1: Added guardrails to cap extreme values and prevent IRR explosion.
"""
from typing import Optional

# Real estate IRR guardrail: above this, flag as extreme
# Bisection search is capped at 5.0 (500%) to prevent explosion
IRR_MAX_REALISTIC = 50.0   # 50% — anything above shows "Extreme return" warning
IRR_ABSOLUTE_CAP = 300.0  # Hard cap: bisection won't search above 300%


def calculate_irr(cash_flows: list[float], guess: float = 0.1, max_iter: int = 1000) -> Optional[float]:
    """
    Calculate Internal Rate of Return via Newton-Raphson with bisection fallback.
    cash_flows: list where index 0 is t=0 (negative = outflow), rest are inflows.
    Returns IRR as a decimal (e.g., 0.10 = 10%) or None if no convergence.
    """
    if not cash_flows or len(cash_flows) < 2:
        return None

    def npv_func(rate: float) -> float:
        return sum(cf / (1 + rate) ** t for t, cf in enumerate(cash_flows))

    def npv_deriv(rate: float) -> float:
        return sum(-t * cf / (1 + rate) ** (t + 1) for t, cf in enumerate(cash_flows))

    # Newton-Raphson
    rate = guess
    for _ in range(max_iter):
        f = npv_func(rate)
        if abs(f) < 1e-7:
            return round(rate * 100, 4)
        df = npv_deriv(rate)
        if df == 0:
            break
        rate_new = rate - f / df
        if abs(rate_new - rate) < 1e-9:
            return round(rate_new * 100, 4)
        rate = rate_new
        if rate <= -1:
            rate = -0.9999

    # Bisection fallback — capped at 3.0 (300%) to prevent explosion
    lo, hi = -0.999, 3.0
    try:
        if npv_func(lo) * npv_func(hi) > 0:
            # Try extending range but cap at 3.0 (300%)
            hi = 3.0
            if npv_func(lo) * npv_func(hi) > 0:
                return None
        for _ in range(200):
            mid = (lo + hi) / 2
            f_mid = npv_func(mid)
            if abs(f_mid) < 1e-7:
                return round(mid * 100, 4)
            if npv_func(lo) * f_mid < 0:
                hi = mid
            else:
                lo = mid
        result = (lo + hi) / 2 * 100
        # Cap at absolute maximum to prevent display explosion
        return round(min(result, IRR_ABSOLUTE_CAP), 4)
    except Exception:
        return None


def calculate_npv(cash_flows: list[float], discount_rate: float = 0.10) -> float:
    """
    Calculate Net Present Value.
    discount_rate: as decimal (0.10 = 10%)
    """
    return sum(cf / (1 + discount_rate) ** t for t, cf in enumerate(cash_flows))
