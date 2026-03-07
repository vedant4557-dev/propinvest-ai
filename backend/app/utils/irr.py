"""
IRR calculation using Newton-Raphson method with bisection fallback.
V3.1: Added guardrails to cap extreme values and prevent IRR explosion.
"""
from typing import Optional
import math

# Real estate IRR guardrail: above this, flag as extreme
# Bisection search is capped at 5.0 (500%) to prevent explosion
IRR_MAX_REALISTIC = 50.0   # 50% — anything above shows "Extreme return" warning
IRR_ABSOLUTE_CAP = 300.0  # Hard cap: bisection won't search above 300%


def calculate_irr(cash_flows: list[float], guess: float = 0.1, max_iter: int = 1000) -> Optional[float]:
    """
    Calculate Internal Rate of Return via Newton-Raphson with bisection fallback.
    cash_flows: list where index 0 is t=0 (negative = outflow), rest are inflows.
    Returns IRR as a decimal (e.g., 0.10 = 10%) or None if no convergence.

    V3.1 overflow fix: npv_func and npv_deriv now guard every term with isfinite checks.
    Root cause of OverflowError(34): when Newton-Raphson clamps rate → -0.9999,
    the term cf/(1+rate)^t = cf/((0.0001)^t) explodes to ~1e120 for t≥30,
    exceeding Python float max (1.8e308) and raising C errno=34 ERANGE.
    """
    if not cash_flows or len(cash_flows) < 2:
        return None

    # Sanitise inputs: replace any non-finite cash flows with 0
    flows = [cf if math.isfinite(cf) else 0.0 for cf in cash_flows]

    def _safe_pow(base: float, exp: int) -> Optional[float]:
        """Return base**exp or None if the result would overflow."""
        # base near 0 with large negative exponent → overflow
        if abs(base) < 1e-10 and exp > 0:
            return None  # denominator collapses → skip term
        try:
            result = base ** exp
            return result if math.isfinite(result) else None
        except (OverflowError, ZeroDivisionError):
            return None

    def npv_func(rate: float) -> float:
        """NPV with per-term overflow guard."""
        total = 0.0
        base = 1.0 + rate
        for t, cf in enumerate(flows):
            if t == 0:
                total += cf
                continue
            denom = _safe_pow(base, t)
            if denom is None or abs(denom) < 1e-300:
                # Term is astronomically large — clamp contribution
                total += math.copysign(1e200, cf)
            else:
                term = cf / denom
                total += term if math.isfinite(term) else math.copysign(1e200, cf)
        return total

    def npv_deriv(rate: float) -> float:
        """NPV derivative with per-term overflow guard."""
        total = 0.0
        base = 1.0 + rate
        for t, cf in enumerate(flows):
            if t == 0:
                continue
            denom = _safe_pow(base, t + 1)
            if denom is None or abs(denom) < 1e-300:
                continue  # skip exploding term in derivative
            term = -t * cf / denom
            if math.isfinite(term):
                total += term
        return total

    # Newton-Raphson — rate is clamped BEFORE each npv call
    rate = max(-0.95, min(guess, 5.0))  # start in safe range
    for _ in range(max_iter):
        # Clamp rate to safe range before ANY npv evaluation
        rate = max(-0.95, min(rate, 5.0))
        try:
            f = npv_func(rate)
            if not math.isfinite(f):
                break
            if abs(f) < 1e-7:
                return round(rate * 100, 4)
            df = npv_deriv(rate)
            if not math.isfinite(df) or abs(df) < 1e-15:
                break
            rate_new = rate - f / df
            if not math.isfinite(rate_new):
                break
            if abs(rate_new - rate) < 1e-9:
                return round(max(-0.95, min(rate_new, 5.0)) * 100, 4)
            rate = rate_new
        except (OverflowError, ZeroDivisionError, ValueError):
            break

    # Bisection fallback — search range capped at [-0.95, 3.0] (300%)
    # lo=-0.95 instead of -0.999 prevents the (0.05)^30 denominator collapse
    lo, hi = -0.95, 3.0
    try:
        f_lo = npv_func(lo)
        f_hi = npv_func(hi)
        if not (math.isfinite(f_lo) and math.isfinite(f_hi)):
            return None
        if f_lo * f_hi > 0:
            return None
        for _ in range(200):
            mid = (lo + hi) / 2
            f_mid = npv_func(mid)
            if not math.isfinite(f_mid):
                return None
            if abs(f_mid) < 1e-7:
                return round(mid * 100, 4)
            if f_lo * f_mid < 0:
                hi = mid
            else:
                lo = mid
                f_lo = f_mid
        result = (lo + hi) / 2 * 100
        return round(min(result, IRR_ABSOLUTE_CAP), 4)
    except (OverflowError, ZeroDivisionError, ValueError):
        return None


def calculate_npv(cash_flows: list[float], discount_rate: float = 0.10) -> float:
    """
    Calculate Net Present Value.
    discount_rate: as decimal (0.10 = 10%)
    V3.1: guards against overflow and non-finite values.
    """
    total = 0.0
    base = 1.0 + discount_rate
    for t, cf in enumerate(cash_flows):
        if not math.isfinite(cf):
            continue
        try:
            denom = base ** t
            if math.isfinite(denom) and abs(denom) > 1e-300:
                term = cf / denom
                if math.isfinite(term):
                    total += term
        except (OverflowError, ZeroDivisionError):
            continue
    return total
